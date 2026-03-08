---
name: generate
description: >
  This skill should be used when the user asks to "generate a context-stocker plugin",
  "create a team context management plugin", "forge a new context-stocker",
  or needs to set up context management for a new B2B product team.
  Also triggers on "re-generate plugin", "update plugin from config",
  or "migrate plugin format".
version: 1.1.0
---

# context-stocker-forge: プラグイン生成ウィザード

事業チーム向けコンテキスト管理プラグイン（`{product}-context-stocker`）を対話型ウィザードで生成する。

## プラグインルート

```
${CLAUDE_PLUGIN_ROOT}
```

テンプレートやアダプタの参照はすべてこのパスからの相対パスで行う。

## 生成フロー概要

```
新規生成:  コマンドで回答収集済み → .team-config.json → テンプレート合成 → .pluginファイル出力（config同梱）
再生成:    プラグイン内 .team-config.json読込 → 変更確認 → テンプレート合成 → .pluginファイル出力（config同梱）
```

## モード判定

- **事前収集済み回答あり** → 新規生成モード（回答のバリデーション→合成）
- **引数あり（対象プラグインパス）** → 再生成モード（プラグイン内の `.team-config.json` を読込→変更確認→合成）
- **migrateコマンドから呼出** → マイグレーションモード（後述）

---

## 新規ウィザード回答の処理

コマンド（`/forge-generate`）から以下の事前収集済み回答が引数として渡される:
- チーム名
- 事業名（商材・サービス名）
- コマンドプレフィクス
- ストレージ種別（backlog-wiki / obsidian-vault）
- 接続情報（プロジェクトキーまたはVaultベースパス）
- 営業フレームワーク（BANTCH / BANT / MEDDIC / カスタム）
- 営業フレームワークフィールド（カスタム時のみ: key, name, description の配列）
- データソース（有効にするデータソースのリスト）
- ナレッジカテゴリ（カテゴリ名・説明・サブカテゴリの配列）

### バリデーション

各値を `references/wizard-steps.md` のバリデーションルールに従って検証する。
不正な値がある場合はエラーメッセージを返す。

### デフォルト値の適用

事前収集済み回答に含まれない項目（競合情報、料金体系、チームメンバー等）に `references/wizard-steps.md` の「デフォルト値一覧」のデフォルト値を設定する。営業フレームワーク・データソース・ナレッジカテゴリは事前収集済み回答の値を使用する。

---

## .team-config.json 生成

事前収集済み回答とデフォルト値を `.team-config.json` として保存する。

スキーマ定義は `references/config-schema.md` を参照。

保存先: **生成プラグインのルートディレクトリ**（`.claude-plugin/` と同階層）に同梱する。再生成時はプラグイン内のこのファイルを読み込む。

---

## テンプレート合成

`.team-config.json` の値をテンプレートファイルに埋め込み、プラグインを生成する。

- **変数マッピング・派生値計算・ストレージ変数定義の詳細**: `references/template-assembly.md`
- **生成物チェック手順**: `references/post-generation-check.md`

### テンプレートエンジンによる合成

テンプレート合成は `tools/forge-engine.js`（Node.js）で実行する。AIによるテンプレート処理は不要。

```
node ${CLAUDE_PLUGIN_ROOT}/tools/forge-engine.js <config-path> --output-dir <dir> --zip
```

エンジンが内部で実行する7ステップ:

1. `.team-config.json` をパース
2. 派生値の計算（plugin_name, skill_reference, index_count 等）
3. ストレージ変数の定義（storage_name, storage_session_init 等）
4. テンプレートファイルの処理（変数展開・ループ・条件ブロック）
5. コマンド除外の適用（excluded_commands → excluded_* フラグ）
6. 生成物チェック（6項目バリデーション、NG時はエラー終了）
7. .pluginファイルのZIPパッケージング

詳細は `references/template-assembly.md` を参照。

---

## 再生成モード

1. 対象プラグインのルートから `.team-config.json` を読み込む
2. 現在の設定内容をサマリー表示
3. 変更したい項目があるか確認
4. 変更があればその項目だけ再入力
5. `.team-config.json` をプラグイン内に更新保存
6. テンプレート合成を実行

---

## フォーマットマイグレーション

`/forge-migrate` コマンドから呼び出された場合のフロー。

1. 対象プラグインのルートから `.team-config.json` を読み込み
2. ストレージ接続（Backlog Wiki or Obsidian Vault）
3. ストレージ内ページを10件サンプリングし、`format_version` を確認
4. 現在バージョン → 最新バージョンの変更点を分析・表示
5. 対象一覧と影響範囲を提示（件数・推定処理量）
6. ユーザー確認:
   - 全件一括
   - カテゴリ別
   - N件バッチ
7. 各ページ: 読み込み → `templates/migrations/` のルールで変換 → `format_version` 更新 → 保存
8. 結果レポート: 成功/失敗/スキップの件数

---

## 出力

### .pluginファイルのパッケージング

生成されたプラグインディレクトリの**中身**を `.plugin` ファイル（ZIP形式）にパッケージする。

**重要: ZIPのルート直下に `.claude-plugin/plugin.json` が存在する構造にすること。`{plugin_name}/` のようなラッパーディレクトリで囲んではいけない。**

```bash
# 正しいパッケージング方法（ディレクトリの中に入ってからzip）
cd {output_dir}/{plugin_name}
zip -r ../{plugin_name}.plugin .claude-plugin/ skills/ commands/ .team-config.json README.md
```

誤った方法（コマンドが認識されない原因になる）:
```bash
# NG: ラッパーディレクトリが含まれてしまう
cd {output_dir}
zip -r {plugin_name}.plugin {plugin_name}/
```

出力先: ユーザーに確認（デフォルト: カレントディレクトリ）

### 生成後のガイダンス

プラグイン生成完了時に以下を案内:
1. `.plugin` ファイルのインストール方法
2. 初回セットアップコマンド（`/{pre}-admin setup`）の実行を推奨
3. 設定ファイル（`.team-config.json`）はプラグイン内に同梱済みであること（再生成時に自動で読み込まれる）
