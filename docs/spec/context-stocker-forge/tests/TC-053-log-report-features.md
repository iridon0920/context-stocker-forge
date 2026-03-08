# TC-053〜055: ログ・レポート機能テンプレート内容テスト

## テスト概要

v0.5.0で追加された「週次レポート（重要度ティア分類）」「階層型集約フォールバック」「reportサブコマンド引数」の実装が、対応するテンプレートに正しく記述されていることを検証する。

対象テンプレートファイル:
- `templates/skills/log/references/weekly-report-format.md.template`
- `templates/commands/log.md.template`
- `templates/skills/log/SKILL.md.template`

---

## TC-053: 週次レポートテンプレート 重要度ティア分類の記述検証

### 目的

`weekly-report-format.md.template` に3段階の重要度ティア（★★★/★★/★）とそれぞれの判定条件・集約ルールが定義されていること。

### 検証手順

#### Step 1: ティア定義の存在確認

```bash
# ティア1（★★★）: 上位レポートに原文転記
grep -c "ティア1\|★★★" templates/skills/log/references/weekly-report-format.md.template
# → 1以上

# ティア2（★★）: 要約して主要事実を保持
grep -c "ティア2\|★★" templates/skills/log/references/weekly-report-format.md.template
# → 1以上

# ティア3（★）: 週次で数値集約のみ
grep -c "ティア3\|数値集約" templates/skills/log/references/weekly-report-format.md.template
# → 1以上
```

#### Step 2: ティア1判定キーワードの確認

ティア1（★★★）は以下のイベントが判定条件として記述されていること:
- 案件クローズ（受注）
- 案件クローズ（失注）
- 重大インシデント・障害
- 契約・価格合意

```bash
grep -c "受注\|失注\|インシデント\|契約締結" templates/skills/log/references/weekly-report-format.md.template
# → 1以上
```

#### Step 3: 階層レポート構造の記述確認

```bash
# 年次→QBR→月次→週次→日次の集約階層が記述されていること
grep -c "年次\|QBR\|月次\|週次\|日次" templates/skills/log/references/weekly-report-format.md.template
# → 5以上（各レイヤーが言及されていること）
```

#### Step 4: ISO週番号命名規約の記述確認

```bash
# ISO 8601週番号ベースのページ命名が記述されていること
grep -c "ISO\|週次レポート-W" templates/skills/log/references/weekly-report-format.md.template
# → 1以上

# 月またぎルールが記述されていること
grep -c "月をまたぐ\|月曜" templates/skills/log/references/weekly-report-format.md.template
# → 1以上
```

### PASS条件

| チェック項目 | 期待結果 |
|-----------|---------|
| ティア1（★★★）定義 | 記述あり |
| ティア2（★★）定義 | 記述あり |
| ティア3（★）定義 | 記述あり |
| ティア1判定キーワード | 受注/失注/インシデント/契約締結のいずれかを含む |
| 階層レポート構造 | 年次/QBR/月次/週次/日次が全て言及されている |
| ISO週番号命名 | `週次レポート-W{NN}` 形式が記述されている |

---

## TC-054: 活動レポートテンプレート 階層型集約フォールバック記述検証

### 目的

`log.md.template` の `report` サブコマンドセクションに、月次/QBR/年次それぞれのデータソースとフォールバック戦略が正しく記述されていること。

### 検証手順

#### Step 1: データソース階層の記述確認

```bash
# 月次レポートのデータソース（週次集約）が記述されていること
grep -A20 "### \`report\`" templates/commands/log.md.template | grep -c "週次"
# → 1以上

# QBRレポートのデータソース（月次集約）が記述されていること
grep -A20 "### \`report\`" templates/commands/log.md.template | grep -c "月次"
# → 1以上

# 年次レポートのデータソース（QBR集約）が記述されていること
grep -A20 "### \`report\`" templates/commands/log.md.template | grep -c "QBR"
# → 1以上
```

#### Step 2: フォールバック戦略の記述確認

```bash
# フォールバックの記述が存在すること
grep -c "フォールバック" templates/commands/log.md.template
# → 1以上
```

#### Step 3: KPI/OKR未設定時のエラー処理記述確認

```bash
# KPI未設定時のエラーメッセージ記述が存在すること
grep -c "KPI目標が未設定\|kpi-set target" templates/commands/log.md.template
# → 1以上（product_prefixプレースホルダ込みで）

# OKR未設定時のエラーメッセージ記述が存在すること
grep -c "OKRが未設定\|okr-set set" templates/commands/log.md.template
# → 1以上
```

#### Step 4: Skillツール呼び出しの確認

```bash
# report サブコマンドが正しいスキルを呼び出すこと
grep "{{plugin_name}}:{{product_prefix}}-log" templates/commands/log.md.template
# → マッチすること（deal や admin ではなく log を参照）
```

### 期待されるデータソース階層（フォールバック含む）

| レポート種別 | 主データソース | フォールバック（主なし時） |
|------------|--------------|----------------------|
| 月次 | 週次レポート（`活動ログ/YYYY-MM/週次レポート-W*`） | 日次ログに直接フォールバック |
| QBR | 月次レポート（`活動ログ/YYYY-MM/月次レポート`）×3 | 週次→日次にフォールバック |
| 年次 | QBRレポート（`活動ログ/YYYY/QBR-Q*`）×4 | 月次→週次→日次にフォールバック |

### PASS条件

| チェック項目 | 期待結果 |
|-----------|---------|
| monthly データソース記述 | 週次レポートが主ソースとして言及 |
| QBR データソース記述 | 月次レポートが主ソースとして言及 |
| annual データソース記述 | QBRレポートが主ソースとして言及 |
| フォールバック記述 | いずれかのレポートでフォールバックが言及 |
| KPI未設定時エラー記述 | `kpi-set target` コマンドへの案内あり |
| OKR未設定時エラー記述 | `okr-set set` コマンドへの案内あり |

---

## TC-055: log report サブコマンド引数パース記述の完全性検証

### 目的

`log.md.template` の `report` サブコマンドに、全ての引数パターン（種別 + 日付 + --format）が記述されていること。

### 検証手順

#### Step 1: サブコマンド一覧表の確認

```bash
# サブコマンド一覧にweekly が含まれること（v0.5.0追加）
grep -c "weekly" templates/commands/log.md.template
# → 1以上

# サブコマンド一覧に report が含まれること
grep -c "report" templates/commands/log.md.template
# → 1以上
```

#### Step 2: report の引数種別確認

```bash
# monthly, qbr, annual の3種が全て記述されていること
grep -c "monthly\|qbr\|annual" templates/commands/log.md.template
# → 3以上（各1回以上）

# 日付引数フォーマット（YYYY-MM, YYYY-Q#, YYYY）が記述されていること
grep -c "YYYY-MM\|YYYY-Q" templates/commands/log.md.template
# → 1以上
```

#### Step 3: --format フラグの確認

```bash
# --format フラグが記述されていること
grep -c "\-\-format" templates/commands/log.md.template
# → 1以上

# md, pptx, both の3オプションが記述されていること
grep -c "pptx" templates/commands/log.md.template
# → 1以上
```

#### Step 4: weekly サブコマンドの引数確認

```bash
# weekly の引数（ISO週番号形式 or current）が記述されていること
grep -A5 "weekly" templates/commands/log.md.template | grep -c "W[0-9]\|current\|YYYY-W"
# → 1以上
```

### 期待される引数マッピング

| 引数 | 説明 | 検証ポイント |
|-----|------|------------|
| `monthly` | 月次レポート（先月） | 記述あり |
| `monthly YYYY-MM` | 指定月 | YYYY-MM 形式の記述あり |
| `qbr` | QBRレポート（前四半期） | 記述あり |
| `qbr YYYY-Q#` | 指定四半期 | YYYY-Q形式の記述あり |
| `annual` | 年次レポート（前年） | 記述あり |
| `annual YYYY` | 指定年度 | 記述あり |
| `--format md` | Markdown出力 | 記述あり |
| `--format pptx` | PowerPoint出力 | 記述あり |
| `--format both` | 両方出力 | 記述あり |

### PASS条件

| チェック項目 | 期待結果 |
|-----------|---------|
| monthly 記述 | あり |
| qbr 記述 | あり |
| annual 記述 | あり |
| 日付引数（YYYY-MM形式） | あり |
| --format フラグ | あり |
| pptx オプション | あり |
| weekly の引数記述 | ISO週番号または `current` の記述あり |

---

## 実行優先度

本テスト群（TC-053〜055）は **テンプレートファイルの静的検証** であり、Claude Code 上でGrep/Readツールを使って実行可能。Backlog MCP / Obsidian MCP は不要。

```
優先度: 中
実行コスト: 低（grep による静的確認）
前提条件: なし
関連テスト: TC-042/043（storage_session_init）、TC-046（コマンド→スキル呼び出しチェーン）
```
