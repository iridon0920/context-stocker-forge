---
description: コンテキスト管理プラグイン（context-stocker）を生成する
argument-hint: "[再生成時: .team-config.ymlのパス]"
allowed-tools: AskUserQuestion, Skill
---

## モード判定

- **引数あり** → `$ARGUMENTS` を .team-config.yml のパスとして、Skillツールで `context-stocker-forge:generate` スキルを呼び出し再生成を実行（ウィザードスキップ）
- **引数なし** → 以下の新規ウィザードを実行

---

## 新規ウィザード

引数なしの場合、AskUserQuestion ツールで対話的に情報を収集し、収集完了後にSkillを呼び出す。

詳細なバリデーションルール・デフォルト値は `skills/generate/references/wizard-steps.md` を参照。

### Step 1: 基本情報

以下の3項目を順に質問する:

**1. チーム名**
- AskUserQuestion で質問: 「プラグインを使うチーム名を教えてください」
- 例: 「SaaS営業部」「プロダクト推進部」
- バリデーション: 空でないこと

**2. 事業名（商材・サービス名）**
- AskUserQuestion で質問: 「対象の事業（商材・サービス名）を教えてください」
- 例: 「Zendesk」「Datadog」「Auth0」「Twilio/SendGrid」「AWS GameLift」
- バリデーション: 空でないこと

**3. コマンドプレフィクス**
- 事業名から自動提案を生成:
  - 商材名の先頭2文字を小文字化（Zendesk → zd, Datadog → dd, Auth0 → au）
  - 複合名の場合は各語の頭文字（Twilio/SendGrid → tw）
  - 3文字以上が望ましい場合は先頭3文字（例: dat）
- AskUserQuestion で選択肢を提示:
  - 自動提案値（デフォルト）
  - 「自分で入力する」
- バリデーション: 2-4文字、英小文字のみ

### Step 2: ストレージ選択

**1. ストレージ種別**
- AskUserQuestion で選択肢を提示:
  - **Backlog Wiki** — チーム共有向け。Backlog MCPツールで操作（推奨）
  - **Obsidian Vault** — 個人利用向け。Obsidian MCPツールで操作

**2. 接続情報**（選択結果に応じて質問）

Backlog Wiki 選択時:
- AskUserQuestion で質問: 「Backlogのプロジェクトキーを入力してください」
- 例: 「ZENDESK_PRJ」「TWILIO_SG_PRJ」
- バリデーション: 英大文字・数字・アンダースコアのみ

Obsidian Vault 選択時:
- AskUserQuestion で質問: 「Obsidian Vault内のベースパスを教えてください（ルートからの相対パス）」
- 例: 「zendesk」「teams/zendesk」
- バリデーション: 有効なパス文字列

### Step 3: 営業フレームワーク選択

**1. フレームワーク種別**
- AskUserQuestion で選択肢を提示:
  - **BANTCH** — Budget, Authority, Need, Timeline, Competitor, Human resources（推奨）
  - **BANT** — Budget, Authority, Need, Timeline
  - **MEDDIC** — Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion
  - **カスタム** — 独自のフレームワークを定義する

**2. カスタムフレームワーク定義**（「カスタム」選択時のみ）
- AskUserQuestion で対話的にフィールドを1つずつ追加:
  - 各フィールドのキー（英字）、表示名、説明を質問
  - 追加ごとに「さらに追加しますか？」と確認
  - 最低1フィールド必要
- バリデーション: キーは英字のみ

### Step 4: データソース選択

- AskUserQuestion で複数選択（multiSelect: true）:
  - **Slack** — チャンネルの会話を参照（デイリーログ・コンテキスト復元）
  - **Google Calendar** — カレンダー予定を参照（デイリーログ・商談準備）
  - **Gmail** — メールを参照（デイリーログ）
  - **Google Drive** — ドライブ内ドキュメントを参照（ナレッジ検索）
  - **Backlog Issues** — Backlog課題を参照（デイリーログ・進捗管理）
- デフォルト選択状態の説明: 「デフォルトでは Slack, Google Calendar, Gmail, Google Drive が有効です。変更が必要なら選び直してください」

### Step 5: ナレッジカテゴリ設定

**1. カテゴリ方針**
- AskUserQuestion で選択肢を提示:
  - **デフォルト（推奨）** — 製品・技術仕様 / 業務フロー・ガイドライン の2カテゴリ
  - **カスタマイズ** — カテゴリを追加・変更する

**2. カテゴリカスタマイズ**（「カスタマイズ」選択時のみ）
- デフォルトの2カテゴリを初期状態として提示
- AskUserQuestion で以下の操作を繰り返す:
  - カテゴリ追加（名前・説明）
  - カテゴリ編集（名前・説明の変更）
  - カテゴリ削除（`required: true` は削除不可）
  - サブカテゴリ追加（特定カテゴリに子分類を追加）
  - 完了
- バリデーション: 最低1カテゴリ

### 確認: 設定サマリー

収集した全情報のサマリーを表示し、AskUserQuestion で確認を取る:

```
入力情報:
- チーム名: {収集したチーム名}
- 事業名: {収集した事業名}
- コマンドプレフィクス: {収集したプレフィクス}
- ストレージ: {選択したストレージ種別}（{接続情報}）
- 営業フレームワーク: {選択したフレームワーク名}
- データソース: {有効にしたデータソースのカンマ区切り}
- ナレッジカテゴリ: {カテゴリ名のカンマ区切り}

以下は生成後にコマンドで設定可能です:
- KPI売上内訳 / 競合情報 / 料金体系 / チームメンバー / Slackチャンネル / Backlog監視プロジェクト

生成後、`/{prefix}-admin setup` を実行するとセットアップガイドが表示されます。
```

選択肢:
- **生成開始** — この設定でプラグインを生成する
- **修正したい** — 入力内容を修正する

「修正したい」が選択された場合は、修正箇所を確認してから該当ステップを再実行する。

### Skill呼び出し

確認後、収集した全回答を以下の形式でSkillツールに渡す:

```
context-stocker-forge:generate スキルを呼び出し、以下の事前収集済み回答で新規生成を実行してください:

- チーム名: {team_name}
- 事業名: {product_name}
- コマンドプレフィクス: {prefix}
- ストレージ種別: {storage_type}
- 接続情報: {connection_info}
- 営業フレームワーク: {sales_framework}
- 営業フレームワークフィールド: {sales_framework_fields}（カスタム時のみ）
- データソース: {enabled_data_sources}
- ナレッジカテゴリ: {knowledge_categories}
```
