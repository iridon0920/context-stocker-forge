# TC-046〜049: 整合性チェック10項目テスト

## テスト概要

`templates/forge-consistency-check-prompt.md` に定義された10項目の整合性チェックを実施する手順。テンプレートファイル変更後のコミット前に必須実行するチェックリスト。

## 整合性チェック実行手順

以下10項目を順番に実施し、全てPASSであることを確認する。

---

### チェック1: コマンド→スキル呼び出しチェーン（TC-046）

**目的**: 各コマンドテンプレートが参照するセクション名がスキルテンプレートに存在するか

**検証手順**:

各コマンドテンプレートが呼び出すスキルセクションを確認:

| コマンドテンプレート | 呼び出すスキル + セクション |
|-------------------|------------------------|
| `commands/deal/load.md.template` | `templates/skills/deal/SKILL.md.template` の「コンテキスト復元」セクション |
| `commands/deal/save.md.template` | `templates/skills/deal/SKILL.md.template` の「コンテキスト保存」セクション |
| `commands/knowledge/save.md.template` | `templates/skills/knowledge/SKILL.md.template` の「ナレッジ保存」セクション |
| `commands/knowledge/search.md.template` | `templates/skills/knowledge/SKILL.md.template` の「ナレッジ検索」セクション |
| `commands/admin.md.template` | `templates/skills/admin/SKILL.md.template` の各サブコマンドセクション |
| `commands/log.md.template` | `templates/skills/log/SKILL.md.template` の daily/weekly/report セクション |

**PASS条件**: 各コマンドが参照するセクション名が対応するスキルテンプレートに実際に存在する

---

### チェック2: 命名規則の一貫性

**目的**: `{{product_prefix}}-deal` 命名が統一されている（`context` ではなく `deal`）

**検証手順**:

```bash
# "context" が命名に使われていないことを確認
grep -r "product_prefix}}-context" templates/
grep -r "product_prefix}}-context" skills/
# → 0件であること

# "deal" が正しく使われていること
grep -c "product_prefix}}-deal" templates/commands/deal/load.md.template
# → 0より大きい
```

---

### チェック3: テンプレート変数の定義↔使用（TC-047）

**目的**: テンプレートで使用される `{{xxx}}` が config-schema / template-assembly / storage-adapters で定義されているか

**検証手順**:

1. テンプレートファイルで使用される変数を全て抽出:
```bash
grep -rho "{{[a-z_]*}}" templates/ | sort | uniq
```

2. 抽出された各変数が以下のいずれかで定義されていることを確認:
   - `skills/generate/references/config-schema.md`（config直接値）
   - `skills/generate/references/template-assembly.md`（派生値またはストレージ個別変数）
   - `storage-adapters/backlog-wiki.md` または `obsidian-vault.md`

**PASS条件**: 全変数が定義元を持つ

---

### チェック4: 出力パスマッピング（TC-048）

**目的**: `template-assembly.md` のマッピング表と実ファイルが一致するか

**マッピング確認**（`template-assembly.md` の「ファイル名のマッピング」セクション参照）:

| テンプレートパス | 実ファイルの存在確認 |
|---------------|-----------------|
| `templates/plugin-json.template` | ✅ 存在する |
| `templates/readme.template` | ✅ 存在する |
| `templates/skills/deal/SKILL.md.template` | ✅ 存在する |
| `templates/skills/deal/references/context-format.md.template` | ✅ 存在する |
| `templates/skills/deal/references/index-format.md.template` | ✅ 存在する |
| `templates/skills/deal/references/similarity-check.md.template` | ✅ 存在する |
| `templates/skills/admin/SKILL.md.template` | ✅ 存在する |
| `templates/skills/admin/references/` 各ファイル | ✅ 全8ファイル存在する |
| `templates/skills/log/SKILL.md.template` | ✅ 存在する |
| `templates/skills/log/references/` 各ファイル | ✅ 全2ファイル存在する |
| `templates/skills/doc/SKILL.md.template` | ✅ 存在する |
| `templates/skills/knowledge/SKILL.md.template` | ✅ 存在する |
| `templates/skills/knowledge/references/knowledge-format.md.template` | ✅ 存在する |
| `templates/commands/deal/load.md.template` | ✅ 存在する |
| `templates/commands/deal/save.md.template` | ✅ 存在する |
| `templates/commands/knowledge/save.md.template` | ✅ 存在する |
| `templates/commands/knowledge/search.md.template` | ✅ 存在する |
| `templates/commands/admin.md.template` | ✅ 存在する |
| `templates/commands/doc.md.template` | ✅ 存在する |
| `templates/commands/engdoc.md.template` | ✅ 存在する |
| `templates/commands/log.md.template` | ✅ 存在する |

**PASS条件**: マッピング表の全エントリが実際のファイルとして存在する

---

### チェック5: config-schema ↔ wizard-steps

**目的**: ウィザードで収集する情報がconfig-schemaの必須フィールドを全てカバーしているか

**確認内容**:

| config-schema 必須フィールド | wizard-steps での収集 |
|--------------------------|---------------------|
| `product_name` | Step 1: 事業名 |
| `product_prefix` | Step 1: コマンドプレフィクス |
| `team_name` | Step 1: チーム名 |
| `storage.type` | Step 2: ストレージ選択 |
| `storage.backlog_wiki.project_key` | Step 2: Backlog接続情報（Backlog選択時） |
| `storage.obsidian_vault.base_path` | Step 2: Obsidian接続情報（Obsidian選択時） |
| `knowledge_categories` | デフォルト値で自動設定 |
| `sales_framework` | デフォルト値で自動設定（BANTCH） |
| `data_sources` | デフォルト値で自動設定 |

---

### チェック10: ストレージアダプタ変数（TC-049）

**目的**: `{{storage_*}}` 変数が両アダプタで全て定義されているか

**検証手順**:

```bash
# template-assembly.md のカテゴリ3を参照し、
# backlog-wiki と obsidian-vault の両方に27変数が定義されていることを確認
```

**PASS条件**: backlog-wiki.md と obsidian-vault.md の両方で27変数が定義されている（TC-044/045と同様）

---

## 整合性チェック実行トリガー

CLAUDE.md に定義された実行条件:

| 変更ファイル | 必須チェック番号 |
|------------|--------------|
| `templates/` 配下の `.template` ファイル | 全10項目 |
| `storage-adapters/` | 3, 10 |
| `skills/generate/references/` | 3, 4, 5 |
| `skills/generate/SKILL.md` | 7 |
| `README.md`, `CLAUDE.md`, `LICENSE` | 不要 |

## チェック結果報告フォーマット

```
=== 整合性チェック結果 ===
チェック1: コマンド→スキル呼び出しチェーン  [PASS/NG]
チェック2: 命名規則の一貫性                [PASS/NG]
チェック3: テンプレート変数定義↔使用       [PASS/NG]
チェック4: 出力パスマッピング              [PASS/NG]
チェック5: config-schema↔wizard-steps    [PASS/NG]
チェック6: plugin-json.template          [PASS/NG]
チェック7: forge commands↔skills         [PASS/NG]
チェック8: deal判断フロー                 [PASS/NG]
チェック9: 詳細リファレンス               [PASS/NG]
チェック10: ストレージアダプタ変数          [PASS/NG]
==========================
総合結果: PASS / NG（N件の問題）
```
