# TC-010/011/012/013: テンプレート変数展開検証

## テスト概要

テンプレート合成後、全ての `{{...}}` 変数が正しく展開されていることを確認するテスト手順。

## 実行手順

### Step 1: テスト用設定でプラグイン生成

以下の `.team-config.yml` を使用して生成:

```yaml
format_version: 1
product_name: TestProduct
product_prefix: tp
team_name: SaaS営業部
plugin_name: testproduct-context-stocker
storage:
  type: backlog-wiki  # TC-010/012 の場合
  backlog_wiki:
    project_key: TEST_PRJ
knowledge_categories:
  - name: 製品・技術仕様
    description: TestProduct各製品の機能・仕様・技術的なTips
    required: true
  - name: 業務フロー・ガイドライン
    description: 構築・移行・運用等の手順やベストプラクティス
    required: true
sales_framework: BANTCH
data_sources:
  slack:
    enabled: true
    default_channels: []
  google_calendar:
    enabled: true
  gmail:
    enabled: true
  google_drive:
    enabled: false
  backlog_issues:
    enabled: false
excluded_commands: []
```

### Step 2: 未解決変数の検出（チェック1相当）

生成された全ファイルに対して `{{` パターンを検索:

```bash
# 生成プラグインディレクトリで実行
grep -r "{{" testproduct-context-stocker/ \
  --include="*.md" \
  --include="*.json" \
  --exclude=".team-config.yml"
```

**期待結果**: 0件（未解決変数なし）

### Step 3: 各変数の展開値を検証

#### 基本変数の確認

```bash
# product_name
grep "TestProduct" testproduct-context-stocker/skills/tp-deal/SKILL.md

# product_prefix（コマンドファイル名）
ls testproduct-context-stocker/commands/ | grep "^tp-"

# plugin_name
grep "testproduct-context-stocker" testproduct-context-stocker/.claude-plugin/plugin.json

# skill_reference
grep "testproduct-context-stocker:tp-deal" testproduct-context-stocker/commands/tp-deal-load.md
```

#### ストレージ変数の確認（backlog-wiki）

```bash
# storage_create_cmd
grep "add_wiki" testproduct-context-stocker/skills/tp-deal/SKILL.md

# storage_project_key の解決確認
grep "TEST_PRJ" testproduct-context-stocker/skills/tp-deal/SKILL.md
# "{{storage_project_key}}" が残存していないこと
grep -c "{{storage_project_key}}" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 0 であること
```

#### 営業フレームワーク展開の確認

```bash
# BANTCH フレームワークの展開
grep "Budget（予算）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Authority（決裁者）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Need（ニーズ）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Timeline（導入時期）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Competitor（競合）" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "Human Resources（体制）" testproduct-context-stocker/skills/tp-deal/SKILL.md
```

### Step 4: obsidian-vault での変数確認（TC-011/013）

```yaml
# .team-config.yml を obsidian-vault に変更
storage:
  type: obsidian-vault
  obsidian_vault:
    base_path: teams/testproduct
```

```bash
# obsidian固有変数の確認
grep "write_note" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "teams/testproduct" testproduct-context-stocker/skills/tp-deal/SKILL.md

# backlog固有変数が残存していないこと
grep -c "{{storage_project_key}}" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 0

grep -c "add_wiki" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 0（obsidian-vaultではadd_wikiは使わない）
```

## 期待テスト結果サマリー

| 検証項目 | TC-010 (backlog) | TC-011 (obsidian) |
|---------|-----------------|------------------|
| `{{...}}` 残存なし | PASS | PASS |
| `product_prefix` 正しく展開 | `tp` | `tp` |
| ストレージ作成コマンド | `add_wiki` | `write_note` |
| プロジェクト/パス | `TEST_PRJ` | `teams/testproduct` |
| セッション初期化フェーズ数 | 3-Phase | 2-Phase |
| BANTCH フレームワーク展開 | 6フィールド | 6フィールド |
