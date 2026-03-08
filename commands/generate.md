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

### 確認: デフォルト設定の説明

収集した情報のサマリーとデフォルト設定一覧を表示し、AskUserQuestion で確認を取る:

```
入力情報:
- チーム名: {収集したチーム名}
- 事業名: {収集した事業名}
- コマンドプレフィクス: {収集したプレフィクス}
- ストレージ: {選択したストレージ種別}
- 接続情報: {収集した接続情報}

以下のデフォルト設定でプラグインを生成します:
- ナレッジカテゴリ: 製品・技術仕様 / 業務フロー・ガイドライン（必要に応じて追加可能）
- 営業フレームワーク: BANTCH（Budget, Authority, Need, Timeline, Competitor, Human resources）
- データソース: Slack, Google Calendar, Gmail, Google Drive（有効）
- 競合情報・料金体系・チームメンバー・Slackチャンネル: 未設定（生成後にコマンドで設定可能）

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
```
