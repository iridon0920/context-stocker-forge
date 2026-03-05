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

## 新規ウィザード（8ステップ）

各ステップでユーザーに質問し、回答を収集する。AskUserQuestion ツールを活用して選択式で進める。

詳細な質問文・バリデーション・デフォルト値は `references/wizard-steps.md` を参照。

**スキップルール**: デフォルト値があるステップ（Step 3〜7）では「スキップ」選択肢を提示する。スキップ時はデフォルト値を適用して次のステップに進む。

### Step 1: 基本情報（必須）
- **チーム名**: 所属チーム名（例: SaaS営業部）
- **事業名**: 対象の事業（商材・サービス名）（例: Zendesk, Twilio/SendGrid, AWS GameLift）
- **コマンドプレフィクス**: コマンド名の先頭に付ける略称（例: zd）
  - 2-4文字の英小文字を推奨
  - 自動提案: 商材名の先頭2-3文字

### Step 2: ストレージ選択（必須）
- **ストレージ種別**: `backlog-wiki` or `obsidian-vault`
- **接続情報**:
  - Backlog Wiki → プロジェクトキー（例: ZENDESK_PRJ）※入力値をそのまま使用
  - Obsidian Vault → ベースパス（例: zendesk）

### Step 3: ナレッジカテゴリ（スキップ可→デフォルト4カテゴリ）
- 必須カテゴリ（削除不可、名前・説明のカスタマイズは可能）:
  1. 製品・技術仕様（required: true）— {product}各製品の機能・仕様・技術的なTips
  2. 業務フロー・ガイドライン（required: true）— 構築・移行・運用等の手順やベストプラクティス
- 任意カテゴリ（デフォルト提案、追加・削除・変更可能）:
  3. パートナーナレッジ — パートナー規約・契約条件・協業ノウハウ
  4. 施策 — 過去の施策と実績・KPI・振り返り
- 補足: 顧客・案件情報はdealスキルで別途管理するため、ナレッジカテゴリには含めない
- 製品カテゴリのサブカテゴリも定義（任意個数）

### Step 4: 営業フレームワーク（スキップ可→BANTCH）
- デフォルト: BANTCH（Budget, Authority, Need, Timeline, Competitor, Human resources）
- カスタム定義も可

### Step 5: 競合・料金情報（スキップ可→後で設定ページから入力）
- **主な競合**: リスト形式で入力
- **料金体系の構造**: 自由記述（プラン構成、課金単位等）

### Step 5.5: KPI売上内訳カテゴリ（スキップ可→ライセンス, プロサービス）
- **売上内訳カテゴリ**: 定義（デフォルト: ライセンス, プロサービス）
- 各カテゴリごとに粗利率を個別管理できる
- デフォルトKPI指標: 売上合計（内訳別）、新規商談数、成約数、失注数、成約率、粗利率

### Step 6: データソース設定（スキップ可→Slack, GCal, Gmail, GDrive有効）
- AskUserQuestion の multiSelect: true で以下を各用途説明付きで提示:
  - **Slack** — 重点チャンネルの会話履歴を参照（デフォルト: ON）
  - **Google Calendar** — 顧客との打合せ予定・実績を自動参照（デフォルト: ON）
  - **Gmail** — 顧客・パートナーとのメールやり取りを検索・参照（デフォルト: ON）
  - **Google Drive** — 提案書・見積書・議事録などのドキュメントを検索・参照（デフォルト: ON）
  - **Backlog Issues** — 開発課題・タスクの進捗状況を参照（デフォルト: OFF）
- Slack/Backlog Issues選択時は追加で重点チャンネル/監視プロジェクトの設定を質問（後から設定も可）

### Step 7: コマンド除外（スキップ可→全コマンド生成）
- 不要なコマンドを除外できる
- 22コマンドの一覧を提示し、除外対象を選択

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
   g. `templates/commands/**/*.template` → `commands/{pre}-{group}-{action}.md`

展開順序: `{{storage_operations}}` 差込 → ループ展開 → 条件評価 → 単純置換
**重要**: ストレージアダプタ差込後、アダプタ内の `{{storage_project_key}}` 等も置換すること。

**Step 5: コマンド除外の適用**
`excluded_commands` に含まれるコマンドをスキップする。

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
2. 初回セットアップコマンド（`/{pre}-admin-setup`）の実行を推奨
3. 設定ファイル（`.team-config.yml`）はプラグイン内に同梱済みであること（再生成時に自動で読み込まれる）
