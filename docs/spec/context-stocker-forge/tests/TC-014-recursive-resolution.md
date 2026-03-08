# TC-014〜018: テンプレート合成詳細テスト

## テスト概要

ストレージアダプタ差し込み後の再帰的変数解決、および各営業フレームワーク（BANTCH/BANT/MEDDIC/カスタム）の展開が正しく動作することを検証する。

---

## TC-014: ストレージアダプタ差し込み後の再帰的変数解決

### 目的

`{{storage_operations}}` のようなストレージアダプタ注入後に、そのコンテンツ内に含まれる `{{product_prefix}}` 等の変数も正しく解決されること（二段階置換）。

### 背景

テンプレート処理は以下の順序で行われる:
1. ストレージアダプタ（`backlog-wiki.md` or `obsidian-vault.md`）の内容を `{{storage_*}}` 変数として注入
2. 注入されたコンテンツ内に含まれる他の変数（`{{product_prefix}}` 等）をさらに置換

この二段階置換が正しく行われないと、生成物に `{{product_prefix}}` 等が残存する可能性がある。

### 検証手順

```bash
# Step 1: テスト用設定でプラグイン生成（TC-001と同様の設定）
# product_prefix: tp, storage: backlog-wiki

# Step 2: ストレージアダプタ注入後の変数残存を確認
# 生成されたスキルファイル内に {{product_prefix}} 等が残っていないこと

grep -r "{{product_prefix}}" testproduct-context-stocker/skills/
# → 0件

grep -r "{{plugin_name}}" testproduct-context-stocker/skills/
# → 0件

grep -r "{{storage_project_key}}" testproduct-context-stocker/
# → 0件（.team-config.yml を除く）

# Step 3: ストレージアダプタ内の変数が正しく解決されていること確認
# storage_save_context_procedure 内に product_prefix が展開されているか
grep "tp-deal" testproduct-context-stocker/skills/tp-admin/SKILL.md
# → マッチすること（admin スキルがdealスキルを参照する箇所）
```

### 注意: `{{storage_project_key}}` の解決順序

`backlog-wiki.md` の `storage_save_context_procedure` 内に `{{storage_project_key}}` が含まれる場合:
1. アダプタ注入時: `storage_save_context_procedure` の値として文字列が設定される（`{{storage_project_key}}` を含む）
2. 次の置換パス: `{{storage_project_key}}` が `.team-config.yml` の `project_key` 値に置換される

### PASS条件

| 検証項目 | 期待結果 |
|---------|---------|
| `{{product_prefix}}` 残存 | 0件（生成ファイル全体） |
| `{{plugin_name}}` 残存 | 0件（生成ファイル全体） |
| `{{storage_project_key}}` 残存 | 0件（.team-config.yml 除く） |

---

## TC-015: BANTCH フレームワーク展開

### 目的

`sales_framework: BANTCH` 設定時、6つのフィールドが正しく展開されること。

### テスト設定

```yaml
sales_framework: BANTCH
```

### 検証手順

```bash
# BANTCH の6フィールドが全て展開されていること
grep "Budget（予算）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Authority（決裁者）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Need（ニーズ）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Timeline（導入時期）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Competitor（競合）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Human Resources（体制）" testproduct-context-stocker/skills/tp-deal/SKILL.md

# sales_framework_sections のセクション数確認
grep -c "###" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → BANTCH の場合6個のセクションが含まれること（他のセクションも含むため目安として確認）
```

### PASS条件

BANTCH の6フィールド（Budget/Authority/Need/Timeline/Competitor/Human Resources）が全て `tp-deal/SKILL.md` に展開されている。

---

## TC-016: BANT フレームワーク展開

### 目的

`sales_framework: BANT` 設定時、4つのフィールドが正しく展開されること。

### テスト設定

```yaml
sales_framework: BANT
```

### 検証手順

```bash
grep "Budget（予算）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Authority（決裁者）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Need（ニーズ）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Timeline（導入時期）" testproduct-context-stocker/skills/tp-deal/SKILL.md

# BANTCH固有フィールドが展開されていないこと
grep -c "Competitor（競合）" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 0

grep -c "Human Resources（体制）" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 0
```

### PASS条件

BANT の4フィールドのみが展開され、BANTCH固有の Competitor/Human Resources は含まれていない。

---

## TC-017: MEDDIC フレームワーク展開

### 目的

`sales_framework: MEDDIC` 設定時、6つのフィールドが正しく展開されること。

### テスト設定

```yaml
sales_framework: MEDDIC
```

### 検証手順

```bash
grep "Metrics（定量的成果）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Economic Buyer（最終決裁者）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Decision Criteria（意思決定基準）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Decision Process（意思決定プロセス）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Identify Pain（課題の特定）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Champion（社内推進者）" testproduct-context-stocker/skills/tp-deal/SKILL.md
```

### PASS条件

MEDDIC の6フィールド（Metrics/Economic Buyer/Decision Criteria/Decision Process/Identify Pain/Champion）が全て展開されている。

---

## TC-018: カスタムフレームワーク展開

### 目的

`sales_framework: custom` 設定時、`sales_framework_fields` で定義したカスタムフィールドが展開されること。

### テスト設定

```yaml
sales_framework: custom
sales_framework_fields:
  - name: 課題
    key: pain
    description: 顧客の主要な課題
  - name: 予算感
    key: budget_rough
    description: 大まかな予算感（数百万/数千万等）
  - name: タイムライン
    key: timeline
    description: 導入希望時期
```

### 検証手順

```bash
# カスタムフィールドが展開されていること
grep "課題" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "予算感" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "タイムライン" testproduct-context-stocker/skills/tp-deal/SKILL.md

# 組み込みフレームワーク（BANTCH等）のフィールドが展開されていないこと
grep -c "Budget（予算）" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 0
```

### PASS条件

`sales_framework_fields` で定義した全カスタムフィールドが展開され、組み込みフレームワークのフィールドは展開されていない。
