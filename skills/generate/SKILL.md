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
新規生成:  ウィザード → .team-config.yml → テンプレート合成 → .pluginファイル出力（config同梱）
再生成:    プラグイン内 .team-config.yml読込 → 変更確認 → テンプレート合成 → .pluginファイル出力（config同梱）
```

## モード判定

- **引数なし** → 新規ウィザードモード（Step 1から開始）
- **引数あり（対象プラグインパス）** → 再生成モード（プラグイン内の `.team-config.yml` を読込→変更確認→合成）
- **migrateコマンドから呼出** → マイグレーションモード（後述）

---

## 新規ウィザード（2ステップ + 確認）

各ステップでユーザーに質問し、回答を収集する。AskUserQuestion ツールを活用して選択式で進める。

詳細な質問文・バリデーション・デフォルト値は `references/wizard-steps.md` を参照。

### Step 1: 基本情報（必須）
- チーム名 / 事業名 / コマンドプレフィクス

### Step 2: ストレージ選択（必須）
- ストレージ種別（backlog-wiki / obsidian-vault）
- 接続情報

### 確認: デフォルト設定の説明
- デフォルト値一覧を表示し、生成実行の確認を取る
- デフォルト値の詳細は `references/wizard-steps.md` 参照
- 生成後、`/{pre}-admin setup` で未設定項目の確認・設定が可能であることを案内

---

## .team-config.yml 生成

ウィザード完了後、回答を `.team-config.yml` として保存する。

スキーマ定義は `references/config-schema.md` を参照。

保存先: **生成プラグインのルートディレクトリ**（`.claude-plugin/` と同階層）に同梱する。再生成時はプラグイン内のこのファイルを読み込む。

---

## テンプレート合成

`.team-config.yml` の値をテンプレートファイルに埋め込み、プラグインを生成する。

- **変数マッピング・派生値計算・ストレージ変数定義の詳細**: `references/template-assembly.md`
- **生成物チェック手順**: `references/post-generation-check.md`

### 合成の7ステップ

**Step 1: 設定ファイル読み込み**
`.team-config.yml` をパースする。

**Step 2: 派生値の計算**
`template-assembly.md` の「カテゴリ2: 派生値」に記載された全変数を計算する。
`plugin_name`, `skill_reference`, `default_channels_list`, `index_count` 等。

**Step 3: ストレージ変数の定義**
`template-assembly.md` の「カテゴリ3: ストレージ個別変数」に記載された全変数を、ストレージ種別に応じて定義する。
`storage_name`, `storage_create_cmd`, `storage_session_init`, `storage_mcp_tool_table` 等。

**Step 4: テンプレートファイルの処理**
各テンプレートファイルを読み込み、変数を展開する:
   a. `templates/plugin-json.template` → `.claude-plugin/plugin.json`
   b. `templates/readme.template` → `README.md`
   c. `templates/skills/context/SKILL.md.template` + ストレージアダプタ → `skills/{pre}-deal/SKILL.md`
   d. `templates/skills/context/references/*.template` → `skills/{pre}-deal/references/*`
   e. `templates/skills/knowledge/SKILL.md.template` + ストレージアダプタ → `skills/{pre}-knowledge/SKILL.md`
   f. `templates/skills/knowledge/references/*.template` → `skills/{pre}-knowledge/references/*`
   g. `templates/commands/{group}/{action}.md.template` → `commands/{pre}-{group}-{action}.md`
   h. `templates/commands/{group}.md.template` → `commands/{pre}-{group}.md`

展開順序: `{{storage_operations}}` 差込 → ループ展開 → 条件評価 → 単純置換
**重要**: ストレージアダプタ差込後、アダプタ内の `{{storage_project_key}}` 等も置換すること。

**Step 5: コマンド除外の適用**
`excluded_commands` の各エントリから `excluded_{name}` フラグ変数を生成し（ハイフン→アンダースコア変換）、テンプレート内の `{{^excluded_*}}` 条件ブロックで評価する。統合コマンド（admin, doc, engdoc, log）はセクション単位で除外され、deal/knowledgeはファイル単位でスキップする。

**Step 6: 生成物チェック（必須）**
`references/post-generation-check.md` の6項目を全て検証する。
**1項目でもNGなら Step 4 に戻って修正し、再チェックする。パッケージングに進んではいけない。**

**Step 7: .pluginファイルのパッケージング**
全チェックPASS後、ZIPアーカイブとしてパッケージする。

---

## 再生成モード

1. 対象プラグインのルートから `.team-config.yml` を読み込む
2. 現在の設定内容をサマリー表示
3. 変更したい項目があるか確認
4. 変更があればその項目だけ再入力
5. `.team-config.yml` をプラグイン内に更新保存
6. テンプレート合成を実行

---

## フォーマットマイグレーション

`/forge-migrate` コマンドから呼び出された場合のフロー。

1. 対象プラグインのルートから `.team-config.yml` を読み込み
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
zip -r ../{plugin_name}.plugin .claude-plugin/ skills/ commands/ .team-config.yml README.md
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
3. 設定ファイル（`.team-config.yml`）はプラグイン内に同梱済みであること（再生成時に自動で読み込まれる）
