# TC-019〜024: excluded_commands 動作テスト

## テスト概要

`excluded_commands` に指定したコマンドが、ファイル単位またはセクション単位で正しく除外されることを検証するテスト手順。

## 除外方式の分類

| 種別 | 対象コマンド | 除外方式 |
|------|------------|---------|
| **ファイル単位** | `deal-load`, `deal-save`, `knowledge-save`, `knowledge-search` | 対応ファイルが生成されない |
| **セクション単位** | `admin-*`, `doc-*`, `engdoc-*`, `log-*` | 統合ファイル内のセクションが非表示 |

---

## TC-019: deal-load ファイル除外

### 設定

```yaml
excluded_commands:
  - "deal-load"
```

### 検証手順

```bash
# tp-deal-load.md が存在しないこと（ファイル単位除外）
ls testproduct-context-stocker/commands/ | grep "tp-deal-load"
# → 出力なし（ファイルが存在しない）

# tp-deal-save.md は存在すること（除外対象外）
ls testproduct-context-stocker/commands/ | grep "tp-deal-save"
# → tp-deal-save.md
```

---

## TC-021: admin-backlog セクション除外

### 設定

```yaml
excluded_commands:
  - "admin-backlog"
```

### 検証手順

```bash
# tp-admin.md は存在すること（統合ファイルは削除されない）
ls testproduct-context-stocker/commands/tp-admin.md
# → 存在する

# tp-admin.md 内に backlog サブコマンドセクションが含まれないこと
grep -c "backlog" testproduct-context-stocker/commands/tp-admin.md
# → 0 または backlog という文字が含まれないこと

# setup, slack等の他セクションは残っていること
grep -c "setup" testproduct-context-stocker/commands/tp-admin.md
# → 0より大きい
```

---

## TC-022: admin-members セクション除外（3ファイル連動）

### 設定

```yaml
excluded_commands:
  - "admin-members"
```

### 検証手順

```bash
# [1] tp-admin.md から members セクションが除外されていること
grep -c "members" testproduct-context-stocker/commands/tp-admin.md
# → 0

# [2] skills/tp-admin/SKILL.md からチームメンバー関連セクションが除外されていること
grep -c "チームメンバー" testproduct-context-stocker/skills/tp-admin/SKILL.md
# → 0

# [3] skills/tp-log/references/daily-log-format.md からメンバー別サマリーが除外されていること
grep -c "メンバー別" testproduct-context-stocker/skills/tp-log/references/daily-log-format.md
# → 0
```

---

## TC-023: doc-estimate セクション除外

### 設定

```yaml
excluded_commands:
  - "doc-estimate"
```

### 検証手順

```bash
# tp-doc.md は存在すること
ls testproduct-context-stocker/commands/tp-doc.md

# estimate セクションが含まれないこと
grep -c "estimate" testproduct-context-stocker/commands/tp-doc.md
# → 0

# prep, proposal セクションは残っていること
grep -c "prep" testproduct-context-stocker/commands/tp-doc.md
# → 0より大きい
```

---

## TC-024: 全24コマンド除外パターン一覧

全ての `excluded_commands` 値に対して、期待される除外結果:

| コマンド | 除外方式 | 検証方法 |
|---------|---------|---------|
| `deal-load` | ファイル | `tp-deal-load.md` が存在しない |
| `deal-save` | ファイル | `tp-deal-save.md` が存在しない |
| `knowledge-save` | ファイル | `tp-knowledge-save.md` が存在しない |
| `knowledge-search` | ファイル | `tp-knowledge-search.md` が存在しない |
| `log-daily` | セクション | `tp-log.md` 内の `daily` セクションなし |
| `log-weekly` | セクション | `tp-log.md` 内の `weekly` セクションなし |
| `log-report` | セクション | `tp-log.md` 内の `report` セクションなし |
| `admin-setup` | セクション | `tp-admin.md` 内の `setup` セクションなし |
| `admin-index` | セクション | `tp-admin.md` 内の `index` セクションなし |
| `admin-slack` | セクション | `tp-admin.md` 内の `slack` セクションなし |
| `admin-backlog` | セクション | `tp-admin.md` 内の `backlog` セクションなし |
| `admin-competitors` | セクション | `tp-admin.md` 内の `competitors` セクションなし |
| `admin-pricing` | セクション | `tp-admin.md` 内の `pricing` セクションなし |
| `admin-members` | セクション | `tp-admin.md` + `tp-admin/SKILL.md` + `daily-log-format.md` からなし |
| `admin-kpi-set` | セクション | `tp-admin.md` 内の `kpi-set` セクションなし |
| `admin-okr-set` | セクション | `tp-admin.md` 内の `okr-set` セクションなし |
| `admin-stale` | セクション | `tp-admin.md` 内の `stale` セクションなし |
| `admin-migrate` | セクション | `tp-admin.md` 内の `migrate` セクションなし |
| `doc-prep` | セクション | `tp-doc.md` 内の `prep` セクションなし |
| `doc-proposal` | セクション | `tp-doc.md` 内の `proposal` セクションなし |
| `doc-estimate` | セクション | `tp-doc.md` 内の `estimate` セクションなし |
| `engdoc-hearing` | セクション | `tp-engdoc.md` 内の `hearing` セクションなし |
| `engdoc-config` | セクション | `tp-engdoc.md` 内の `config` セクションなし |
| `engdoc-testcases` | セクション | `tp-engdoc.md` 内の `testcases` セクションなし |
