# TC-056〜063: ウィザードStep 3-5 テスト

## テスト概要

v0.8.0で追加されたウィザードStep 3（営業フレームワーク選択）、Step 4（データソース選択）、Step 5（ナレッジカテゴリ設定）の動作とバリデーションを検証する。

**対象ファイル**:
- `skills/generate/references/wizard-steps.md` — ステップ定義
- `commands/generate.md` — ウィザードUI定義
- `skills/generate/references/config-schema.md` — スキーマ定義（フレームワーク・データソース・カテゴリ）

---

## TC-056: Step 3 BANTCHデフォルト選択

### 目的

Step 3で「BANTCH」（デフォルト）を選択した場合、`.team-config.yml` に正しいフレームワーク定義が設定され、生成物に6フィールドが展開されること。

### テスト手順

1. `/forge-generate` を実行（引数なし）
2. Step 1-2 を入力（任意の値）
3. Step 3: `BANTCH`（デフォルト）を選択
4. Step 4-5: デフォルトを選択
5. 確認ステップ: 承認

### 検証手順

```bash
# .team-config.yml にBANTCHが設定されていること
grep "sales_framework: BANTCH" {output}/.team-config.yml

# BANTCHの6フィールドが定義されていること
grep -c "budget\|authority\|need\|timeline\|competitor\|human_resources" {output}/.team-config.yml
# → 6

# 生成されたdealスキルにBANTCHフィールドが展開されていること
grep -c "Budget\|Authority\|Need\|Timeline\|Competitor\|Human" {output}/skills/{pre}-deal/SKILL.md
# → 6以上
```

### PASS条件

- `.team-config.yml` に `sales_framework: BANTCH` が設定されている
- BANTCHの6フィールド（budget, authority, need, timeline, competitor, human_resources）が全て定義されている
- 生成されたdealスキルテンプレートにBANTCHフィールドが展開されている

---

## TC-057: Step 3 BANT選択時のフレームワークフィールド展開

### 目的

BANTCHではなくBANTを選択した場合、4フィールドのみが展開されること。

### テスト手順

1. `/forge-generate` を実行
2. Step 1-2 を入力
3. Step 3: `BANT` を選択
4. Step 4-5: デフォルト
5. 確認ステップ: 承認

### 検証手順

```bash
# BANTの4フィールドが定義されていること
grep "sales_framework: BANT" {output}/.team-config.yml

# BANTCHの追加フィールド（competitor, human_resources）が含まれないこと
grep -c "competitor\|human_resources" {output}/.team-config.yml
# → 0（sales_framework_fields内に限定して検索）

# dealスキルにBANTの4フィールドが展開されていること
grep "Budget\|Authority\|Need\|Timeline" {output}/skills/{pre}-deal/SKILL.md
```

### PASS条件

- `sales_framework: BANT` が設定されている
- BANTの4フィールドのみ定義（competitor, human_resourcesは含まれない）

---

## TC-058: Step 3 カスタムフレームワーク定義

### 目的

「カスタム」を選択した場合、対話形式でフィールドを定義でき、バリデーションが正しく動作すること。

### テスト手順

1. `/forge-generate` を実行
2. Step 1-2 を入力
3. Step 3: `カスタム` を選択
4. フィールド定義:
   - フィールド1: キー = `roi`, 表示名 = `ROI`, 説明 = `投資対効果`
   - フィールド2: キー = `urgency`, 表示名 = `緊急度`, 説明 = `導入の緊急性`
   - 完了を選択
5. Step 4-5: デフォルト
6. 確認ステップ: 承認

### 検証手順

```bash
# カスタムフレームワークが設定されていること
grep "sales_framework: custom" {output}/.team-config.yml

# 定義したフィールドが含まれていること
grep "roi" {output}/.team-config.yml
grep "urgency" {output}/.team-config.yml

# dealスキルにカスタムフィールドが展開されていること
grep "ROI\|緊急度" {output}/skills/{pre}-deal/SKILL.md
```

### バリデーションテスト

| 入力 | 期待動作 |
|------|---------|
| フィールド0件で完了 | エラー: 最低1フィールド必要 |
| キー = `123`（数字のみ） | エラー: 英字のみを要求 |
| キー = `budget`（英字） | 正常: 受け入れ |

### PASS条件

- カスタムフィールドが `.team-config.yml` に保存される
- 0件完了でバリデーションエラーが出る
- 生成物にカスタムフィールドが展開される

---

## TC-059: Step 4 デフォルトデータソース選択

### 目的

デフォルト選択（Slack/GCal/Gmail/GDrive有効、Backlog Issues無効）が正しく `.team-config.yml` に反映されること。

### テスト手順

1. `/forge-generate` を実行
2. Step 1-3 を入力
3. Step 4: デフォルト（Slack, Google Calendar, Gmail, Google Drive有効）を選択
4. Step 5: デフォルト
5. 確認ステップ: 承認

### 検証手順

```bash
# データソース設定の確認
grep -A1 "slack:" {output}/.team-config.yml | grep "enabled: true"
grep -A1 "google_calendar:" {output}/.team-config.yml | grep "enabled: true"
grep -A1 "gmail:" {output}/.team-config.yml | grep "enabled: true"
grep -A1 "google_drive:" {output}/.team-config.yml | grep "enabled: true"
grep -A1 "backlog_issues:" {output}/.team-config.yml | grep "enabled: false"

# 生成されたlogスキルにSlack/GCal/Gmail参照が含まれていること
grep "Slack\|Calendar\|Gmail" {output}/skills/{pre}-log/SKILL.md
# → マッチすること

# backlog_issues無効時、logスキルにBacklog課題参照が条件付きで除外されていること
```

### PASS条件

- 4つのデータソースが `enabled: true` で設定
- Backlog Issuesが `enabled: false` で設定
- 生成物にデータソース設定が正しく反映

---

## TC-060: Step 4 全データソース無効

### 目的

全データソースを無効にしても生成が成功し、ストレージのみで運用できるプラグインが生成されること。

### テスト手順

1. `/forge-generate` を実行
2. Step 1-3 を入力
3. Step 4: 全データソースを選択解除（0個選択）
4. Step 5: デフォルト
5. 確認ステップ: 承認

### 検証手順

```bash
# 全データソースがfalseであること
grep -A1 "slack:" {output}/.team-config.yml | grep "enabled: false"
grep -A1 "google_calendar:" {output}/.team-config.yml | grep "enabled: false"
grep -A1 "gmail:" {output}/.team-config.yml | grep "enabled: false"
grep -A1 "google_drive:" {output}/.team-config.yml | grep "enabled: false"
grep -A1 "backlog_issues:" {output}/.team-config.yml | grep "enabled: false"

# 未解決変数がないこと
grep -r "{{" {output}/ --include="*.md" --include="*.json" --exclude=".team-config.yml"
# → 0件

# logスキルのデータ収集セクションが適切に条件除外されていること
```

### PASS条件

- 全データソースが無効でもプラグイン生成が成功する
- 未解決テンプレート変数が0件
- ストレージ操作のみのプラグインとして機能する構造になっている

---

## TC-061: Step 5 デフォルトナレッジカテゴリ

### 目的

デフォルト選択（2カテゴリ: 製品・技術仕様 / 業務フロー・ガイドライン）が正しく展開されること。

### テスト手順

1. `/forge-generate` を実行
2. Step 1-4 を入力
3. Step 5: `デフォルト`（2カテゴリ）を選択
4. 確認ステップ: 承認

### 検証手順

```bash
# デフォルトの2カテゴリが設定されていること
grep "製品・技術仕様\|業務フロー・ガイドライン" {output}/.team-config.yml
# → 2件

# knowledgeスキルにカテゴリが展開されていること
grep "製品・技術仕様\|業務フロー・ガイドライン" {output}/skills/{pre}-knowledge/SKILL.md
# → 2件以上
```

### PASS条件

- `.team-config.yml` に2カテゴリが定義
- knowledgeスキルにカテゴリ情報が展開されている

---

## TC-062: Step 5 カスタムカテゴリ追加（サブカテゴリ含む）

### 目的

カスタマイズモードでカテゴリの追加・サブカテゴリ追加が正しく動作すること。

### テスト手順

1. `/forge-generate` を実行
2. Step 1-4 を入力
3. Step 5: `カスタマイズ` を選択
4. 操作:
   - カテゴリ追加: `競合分析` — 競合製品の分析結果
   - サブカテゴリ追加: `製品・技術仕様` に `API仕様` を追加
   - 完了
5. 確認ステップ: 承認

### 検証手順

```bash
# 追加カテゴリが含まれていること
grep "競合分析" {output}/.team-config.yml

# サブカテゴリが含まれていること
grep "API仕様" {output}/.team-config.yml

# 全カテゴリがknowledgeスキルに展開されていること
grep "製品・技術仕様\|業務フロー・ガイドライン\|競合分析" {output}/skills/{pre}-knowledge/SKILL.md
# → 3件以上
```

### PASS条件

- 追加カテゴリ（競合分析）が `.team-config.yml` と生成物に含まれる
- サブカテゴリ（API仕様）が `製品・技術仕様` 配下に定義される
- デフォルトの2カテゴリも維持されている

---

## TC-063: Step 5 必須カテゴリ削除防止バリデーション

### 目的

`required: true` のカテゴリ削除を試みた場合、バリデーションエラーが発生し削除が防止されること。

### テスト手順

1. `/forge-generate` を実行
2. Step 1-4 を入力
3. Step 5: `カスタマイズ` を選択
4. 操作: `製品・技術仕様`（required: true）の削除を試行

### 期待動作

- エラーメッセージ: 必須カテゴリは削除できない旨を表示
- カテゴリが削除されず、カスタマイズ操作の選択に戻る

### 追加テスト: 最低1カテゴリ制約

1. 非必須カテゴリのみで構成された状態を想定
2. 最後の1カテゴリを削除しようとした場合
3. エラー: 最低1カテゴリ必要

### PASS条件

- `required: true` カテゴリの削除がブロックされる
- カテゴリ数が0にならないバリデーションが機能する
- エラー後にカスタマイズ操作が継続できる
