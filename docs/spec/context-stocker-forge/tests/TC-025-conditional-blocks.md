# TC-025〜028: 条件ブロックテスト

## テスト概要

`.team-config.yml` の設定フラグや値に応じて、テンプレートの条件ブロック（`{{#condition}}...{{/condition}}` / `{{^negation}}...{{/negation}}`）が正しく展開または除外されることを検証する。

---

## TC-025: backlog_issues.enabled:false → admin の backlog セクション除外

### 目的

`data_sources.backlog_issues.enabled: false` 設定時、adminコマンドの `backlog` サブコマンドセクションが除外されること。

### テスト設定

```yaml
data_sources:
  backlog_issues:
    enabled: false
```

### 検証手順

```bash
# tp-admin.md が生成されること（ファイル自体は残る）
ls testproduct-context-stocker/commands/tp-admin.md
# → 存在する

# backlog サブコマンドセクションが含まれていないこと
grep -c "### \`.*-admin backlog\`\|## backlog\|backlog issue" testproduct-context-stocker/commands/tp-admin.md
# → 0

# setup, slack等の他のセクションは残っていること
grep -c "setup" testproduct-context-stocker/commands/tp-admin.md
# → 0より大きい
```

### PASS条件

| 検証項目 | 期待結果 |
|---------|---------|
| `tp-admin.md` の存在 | ファイルは生成される |
| backlog セクション | 含まれない |
| 他サブコマンド（setup/slack/index等） | 正常に含まれている |

---

## TC-026: google_drive.folder_id 設定あり → Drive セクション表示

### 目的

`data_sources.google_drive.folder_id` が設定されている場合、関連セクションが正しく表示されること。

### テスト設定

```yaml
data_sources:
  google_drive:
    enabled: true
    folder_id: "1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
```

### 検証手順

```bash
# Google Drive の参照セクションが含まれていること
grep -c "google_drive\|Google Drive\|ドライブ" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 0より大きい

# folder_id が正しく展開されていること（または参照コマンドに含まれていること）
grep "1aBcDeFgHiJkLmNoPqRsTuVwXyZ" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → マッチすること（folder_idが直接参照される場合）
```

---

## TC-027: google_drive.folder_id 未設定 → 代替テキスト表示

### 目的

`data_sources.google_drive.folder_id` が未設定（または `google_drive.enabled: false`）の場合、Driveセクションが適切な代替テキストに置き換わること、またはセクション自体が非表示になること。

### テスト設定（パターンA: enabled:false）

```yaml
data_sources:
  google_drive:
    enabled: false
```

### テスト設定（パターンB: folder_id 未設定）

```yaml
data_sources:
  google_drive:
    enabled: true
    # folder_id: 未設定
```

### 検証手順

```bash
# パターンA: Google Drive セクションが非表示または代替テキストになること
grep -c "google_drive\|Google Drive" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 0（またはエラーメッセージ/代替テキスト）

# パターンB: 「未設定」旨のメッセージが含まれること
grep "未設定\|設定してください\|folder_id" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → マッチすること（代替テキストが表示される）
```

---

## TC-028: knowledge_categories.sub_categories あり → サブカテゴリ表示

### 目的

`knowledge_categories` にサブカテゴリが定義されている場合、knowledge スキル内にサブカテゴリ一覧が展開されること。

### テスト設定

```yaml
knowledge_categories:
  - name: 製品・技術仕様
    description: 製品の技術仕様
    required: true
    sub_categories:
      - name: API仕様
        description: REST API・SDK仕様
      - name: 設定オプション
        description: 設定項目一覧
  - name: 業務フロー
    description: 運用手順
    required: true
```

### 検証手順

```bash
# サブカテゴリが tp-knowledge スキルに展開されていること
grep "API仕様" testproduct-context-stocker/skills/tp-knowledge/SKILL.md
grep "設定オプション" testproduct-context-stocker/skills/tp-knowledge/SKILL.md
# → マッチすること

# サブカテゴリのないカテゴリは正常に表示されていること
grep "業務フロー" testproduct-context-stocker/skills/tp-knowledge/SKILL.md
# → マッチすること

# 未解決変数なしの確認
grep -c "{{#sub_categories}}\|{{/sub_categories}}" testproduct-context-stocker/skills/tp-knowledge/SKILL.md
# → 0（テンプレートタグが残存していない）
```

### PASS条件

| 検証項目 | 期待結果 |
|---------|---------|
| サブカテゴリの展開 | `API仕様`, `設定オプション` が knowledge スキルに含まれる |
| サブカテゴリなしカテゴリ | `業務フロー` が通常通り表示される |
| テンプレートタグ残存 | `{{#sub_categories}}` 等が 0件 |
