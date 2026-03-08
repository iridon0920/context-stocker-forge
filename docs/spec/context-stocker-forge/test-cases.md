# context-stocker-forge テストケース一覧（逆生成）

## 分析日時
2026-03-08（更新: 2026-03-08、v0.8.0ベース）

## テストケース概要

| ID | テスト名 | カテゴリ | 優先度 | 実装状況 | 手順書ファイル |
|----|----------|----------|--------|----------|--------------|
| TC-001 | 新規ウィザード正常フロー（backlog-wiki） | ウィザード | 高 | 手順書作成済 | TC-001-wizard-flow.md |
| TC-002 | 新規ウィザード正常フロー（obsidian-vault） | ウィザード | 高 | 手順書作成済 | TC-001-wizard-flow.md |
| TC-003 | 再生成モード（設定変更なし） | ウィザード | 高 | 手順書作成済 | TC-001-wizard-flow.md |
| TC-004 | 再生成モード（プレフィクス変更あり） | ウィザード | 中 | 手順書作成済 | TC-001-wizard-flow.md |
| TC-005 | プレフィクスバリデーション（1文字）→エラー | バリデーション | 高 | 手順書作成済 | TC-001-wizard-flow.md |
| TC-006 | プレフィクスバリデーション（5文字）→エラー | バリデーション | 高 | 手順書作成済 | TC-001-wizard-flow.md |
| TC-007 | プレフィクスバリデーション（大文字含む）→エラー | バリデーション | 高 | 手順書作成済 | TC-001-wizard-flow.md |
| TC-008 | プレフィクス自動提案ロジック（Zendesk→zd） | バリデーション | 中 | 手順書作成済 | TC-001-wizard-flow.md |
| TC-009 | プロジェクトキーバリデーション（小文字含む）→エラー | バリデーション | 高 | 手順書作成済 | TC-001-wizard-flow.md |
| TC-010 | backlog-wiki: 全変数展開確認 | テンプレート合成 | 高 | 手順書作成済 | TC-010-template-variable-resolution.md |
| TC-011 | obsidian-vault: 全変数展開確認 | テンプレート合成 | 高 | 手順書作成済 | TC-010-template-variable-resolution.md |
| TC-012 | `{{...}}` 未解決変数残存なし確認（backlog-wiki） | テンプレート合成 | 高 | 手順書作成済 | TC-010-template-variable-resolution.md |
| TC-013 | `{{...}}` 未解決変数残存なし確認（obsidian-vault） | テンプレート合成 | 高 | 手順書作成済 | TC-010-template-variable-resolution.md |
| TC-014 | ストレージアダプタ差し込み後の再帰置換 | テンプレート合成 | 高 | 手順書作成済 | TC-014-recursive-resolution.md |
| TC-015 | BANTCH フレームワーク展開 | テンプレート合成 | 中 | 手順書作成済 | TC-014-recursive-resolution.md |
| TC-016 | BANT フレームワーク展開 | テンプレート合成 | 中 | 手順書作成済 | TC-014-recursive-resolution.md |
| TC-017 | MEDDIC フレームワーク展開 | テンプレート合成 | 中 | 手順書作成済 | TC-014-recursive-resolution.md |
| TC-018 | カスタムフレームワーク展開 | テンプレート合成 | 低 | 手順書作成済 | TC-014-recursive-resolution.md |
| TC-019 | excluded_commands: deal-load ファイル除外 | コマンド除外 | 高 | 手順書作成済 | TC-019-excluded-commands.md |
| TC-020 | excluded_commands: deal-save ファイル除外 | コマンド除外 | 高 | 手順書作成済 | TC-019-excluded-commands.md |
| TC-021 | excluded_commands: admin-backlog セクション除外 | コマンド除外 | 高 | 手順書作成済 | TC-019-excluded-commands.md |
| TC-022 | excluded_commands: admin-members セクション除外 + logスキル連動 | コマンド除外 | 高 | 手順書作成済 | TC-019-excluded-commands.md |
| TC-023 | excluded_commands: doc-estimate セクション除外 | コマンド除外 | 中 | 手順書作成済 | TC-019-excluded-commands.md |
| TC-024 | excluded_commands: 全24コマンド除外パターン | コマンド除外 | 中 | 手順書作成済 | TC-019-excluded-commands.md |
| TC-025 | backlog_issues.enabled:false → adminのbacklogセクション除外 | 条件ブロック | 高 | 手順書作成済 | TC-025-conditional-blocks.md |
| TC-026 | google_drive.folder_id 設定あり → Driveセクション表示 | 条件ブロック | 中 | 手順書作成済 | TC-025-conditional-blocks.md |
| TC-027 | google_drive.folder_id 未設定 → 代替テキスト表示 | 条件ブロック | 中 | 手順書作成済 | TC-025-conditional-blocks.md |
| TC-028 | knowledge_categories.sub_categories あり → サブカテゴリ表示 | 条件ブロック | 低 | 手順書作成済 | TC-025-conditional-blocks.md |
| TC-029 | チェック1: 未解決変数検出 → NG判定 | 生成物バリデーション | 高 | 手順書作成済 | TC-029-post-generation-validation.md |
| TC-030 | チェック2: 別商材名混入 → NG判定 | 生成物バリデーション | 高 | 手順書作成済 | TC-029-post-generation-validation.md |
| TC-031 | チェック3: プレフィクス不一致 → NG判定 | 生成物バリデーション | 高 | 手順書作成済 | TC-029-post-generation-validation.md |
| TC-032 | チェック4: スキル参照不整合 → NG判定 | 生成物バリデーション | 高 | 手順書作成済 | TC-029-post-generation-validation.md |
| TC-033 | チェック5: ストレージ設定不整合 → NG判定 | 生成物バリデーション | 高 | 手順書作成済 | TC-029-post-generation-validation.md |
| TC-034 | チェック6: ファイル構成不足 → NG判定 | 生成物バリデーション | 高 | 手順書作成済 | TC-029-post-generation-validation.md |
| TC-035 | 全チェックPASS → パッケージング実行 | 生成物バリデーション | 高 | 手順書作成済 | TC-029-post-generation-validation.md |
| TC-036 | ZIPアーカイブのルート直下に `.claude-plugin/plugin.json` | パッケージング | 高 | 手順書作成済 | TC-036-packaging-structure.md |
| TC-037 | ZIPアーカイブにラッパーディレクトリが含まれない | パッケージング | 高 | 手順書作成済 | TC-036-packaging-structure.md |
| TC-038 | plugin.json に余分なフィールドが含まれない | パッケージング | 高 | 手順書作成済 | TC-036-packaging-structure.md |
| TC-039 | マイグレーション: 全件一括モード | マイグレーション | 中 | 手順書作成済 | TC-036-packaging-structure.md |
| TC-040 | マイグレーション: N件バッチモード | マイグレーション | 中 | 手順書作成済 | TC-036-packaging-structure.md |
| TC-041 | マイグレーション: 結果レポート（成功/失敗/スキップ） | マイグレーション | 中 | 手順書作成済 | TC-036-packaging-structure.md |
| TC-042 | backlog-wiki: storage_session_init 3-Phase定義検証 | ストレージアダプタ | 高 | 手順書作成済 | TC-042-storage-adapter-init.md |
| TC-043 | obsidian-vault: storage_session_init 2-Phase定義検証 | ストレージアダプタ | 高 | 手順書作成済 | TC-042-storage-adapter-init.md |
| TC-044 | backlog-wiki: 27変数全定義確認 | ストレージアダプタ | 高 | 手順書作成済 | TC-044-storage-adapter-variables.md |
| TC-045 | obsidian-vault: 27変数全定義確認 | ストレージアダプタ | 高 | 手順書作成済 | TC-044-storage-adapter-variables.md |
| TC-046 | 整合性チェック1: コマンド→スキル呼び出しチェーン | 整合性チェック | 高 | 手順書作成済 | TC-046-consistency-check.md |
| TC-047 | 整合性チェック3: テンプレート変数定義↔使用 | 整合性チェック | 高 | 手順書作成済 | TC-046-consistency-check.md |
| TC-048 | 整合性チェック4: 出力パスマッピング | 整合性チェック | 高 | 手順書作成済 | TC-046-consistency-check.md |
| TC-049 | 整合性チェック10: 両アダプタでの変数定義 | 整合性チェック | 高 | 手順書作成済 | TC-046-consistency-check.md |
| TC-050 | plugin.json と marketplace.json のバージョン一致 | メタデータ | 中 | 手順書作成済 | TC-050-metadata-errors.md |
| TC-051 | default_channels未設定時のエラーメッセージ出力 | エラーハンドリング | 中 | 手順書作成済 | TC-050-metadata-errors.md |
| TC-052 | format_version:1 でのマイグレーション不要判定 | マイグレーション | 低 | 手順書作成済 | TC-050-metadata-errors.md |
| TC-053 | 週次レポートテンプレート: 重要度ティア分類3段階の記述検証 | ログ・レポート | 中 | 手順書作成済 | TC-053-log-report-features.md |
| TC-054 | 活動レポートテンプレート: 階層型集約フォールバック記述検証 | ログ・レポート | 中 | 手順書作成済 | TC-053-log-report-features.md |
| TC-055 | log report サブコマンド: 引数パース記述の完全性検証 | ログ・レポート | 中 | 手順書作成済 | TC-053-log-report-features.md |
| TC-056 | Step 3: BANTCHデフォルト選択 | ウィザード | 高 | 手順書作成済 | TC-056-wizard-step3-5.md |
| TC-057 | Step 3: BANT選択時のフレームワークフィールド展開 | ウィザード | 中 | 手順書作成済 | TC-056-wizard-step3-5.md |
| TC-058 | Step 3: カスタムフレームワーク定義（フィールド追加） | ウィザード | 中 | 手順書作成済 | TC-056-wizard-step3-5.md |
| TC-059 | Step 4: デフォルトデータソース選択（Slack/GCal/Gmail/GDrive有効） | ウィザード | 高 | 手順書作成済 | TC-056-wizard-step3-5.md |
| TC-060 | Step 4: 全データソース無効（ストレージのみ運用） | ウィザード | 中 | 手順書作成済 | TC-056-wizard-step3-5.md |
| TC-061 | Step 5: デフォルトナレッジカテゴリ（2カテゴリ） | ウィザード | 高 | 手順書作成済 | TC-056-wizard-step3-5.md |
| TC-062 | Step 5: カスタムカテゴリ追加（サブカテゴリ含む） | ウィザード | 中 | 手順書作成済 | TC-056-wizard-step3-5.md |
| TC-063 | Step 5: 必須カテゴリ削除防止バリデーション | ウィザード | 高 | 手順書作成済 | TC-056-wizard-step3-5.md |

---

## 詳細テストケース

### TC-001: 新規ウィザード正常フロー（backlog-wiki）

**テスト目的**: 引数なしで `/forge-generate` を実行し、Backlog Wiki使用の context-stocker プラグインが正常に生成されること

**事前条件**:
- context-stocker-forge プラグインがインストール済み
- 出力先ディレクトリへの書き込み権限あり

**テスト手順**:
1. `/forge-generate` を実行（引数なし）
2. Step 1: チーム名 = `SaaS営業部`、事業名 = `TestProduct`、プレフィクス = `tp` を入力
3. Step 2: ストレージ = `Backlog Wiki`、プロジェクトキー = `TEST_PRJ` を入力
4. Step 3: 営業フレームワーク = `BANTCH`（デフォルト）
5. Step 4: データソース = デフォルト（Slack/GCal/Gmail/GDrive有効）
6. Step 5: ナレッジカテゴリ = デフォルト（2カテゴリ）
7. 確認ステップ: 承認（Yes）
8. 出力先ディレクトリを確認

**期待結果**:
```
testproduct-context-stocker/
├── .claude-plugin/plugin.json   ← "name": "testproduct-context-stocker"
├── .team-config.yml             ← 入力値が正しく保存されている
├── README.md
├── skills/
│   ├── tp-deal/SKILL.md
│   ├── tp-admin/SKILL.md
│   ├── tp-log/SKILL.md
│   ├── tp-doc/SKILL.md
│   └── tp-knowledge/SKILL.md
└── commands/
    ├── tp-deal-load.md
    ├── tp-deal-save.md
    ├── tp-knowledge-save.md
    ├── tp-knowledge-search.md
    ├── tp-admin.md
    ├── tp-doc.md
    ├── tp-engdoc.md
    └── tp-log.md
testproduct-context-stocker.plugin  ← 生成済み
```

**検証ポイント**:
- [ ] `.team-config.yml` に `product_prefix: tp` が設定されている
- [ ] 全コマンドファイルが `tp-` で始まっている
- [ ] スキルファイル内に `{{...}}` が残存していない
- [ ] `storage_project_key` が `TEST_PRJ` に解決されている
- [ ] plugin.json に余分なフィールドがない（skills/commands等）

---

### TC-002: 新規ウィザード正常フロー（obsidian-vault）

**テスト目的**: Obsidian Vault を選択した場合のプラグイン生成が正常に動作すること

**テスト手順**:
1. `/forge-generate` を実行（引数なし）
2. Step 1: チーム名 = `開発チーム`、事業名 = `TestProduct`、プレフィクス = `tp`
3. Step 2: ストレージ = `Obsidian Vault`、ベースパス = `teams/testproduct`
4. Step 3: 営業フレームワーク = `BANTCH`（デフォルト）
5. Step 4: データソース = デフォルト
6. Step 5: ナレッジカテゴリ = デフォルト
7. 確認ステップ: 承認

**期待結果**:
- backlog関連変数（`{{storage_project_key}}`）が残存しない
- `storage_base_path` = `teams/testproduct` に解決されている
- `storage_session_init` に `list_directory` の手順が含まれている（`get_project` ではない）
- `{pre}-admin.md` の backlogセクションが除外されている（`storage.type = obsidian-vault` 時）

---

### TC-005〜007: プレフィクスバリデーション

**テスト目的**: コマンドプレフィクスの入力バリデーションが正しく動作すること

**テストケース**:

| TC | 入力値 | 期待動作 |
|----|--------|---------|
| TC-005 | `a`（1文字） | エラー: 2文字以上を要求 |
| TC-006 | `abcde`（5文字） | エラー: 4文字以下を要求 |
| TC-007 | `ZD`（大文字） | エラー: 英小文字のみを要求 |
| TC-008 | 事業名=`Zendesk` → `zd` 自動提案 | 自動提案値 `zd` が表示される |

---

### TC-010: backlog-wiki 全変数展開確認

**テスト目的**: backlog-wiki 選択時、テンプレートの全変数が正しく展開されること

**検証対象ファイル**: 生成された全ファイル（`skills/*/SKILL.md`, `commands/*.md`）

**検証内容**:

| 変数 | 期待展開値 |
|------|----------|
| `{{product_name}}` | `TestProduct` |
| `{{product_prefix}}` | `tp` |
| `{{plugin_name}}` | `testproduct-context-stocker` |
| `{{skill_reference}}` | `testproduct-context-stocker:tp-deal` |
| `{{storage_name}}` | `Backlog Wiki` |
| `{{storage_create_cmd}}` | `add_wiki` |
| `{{storage_project_key}}` | `TEST_PRJ` |
| `{{default_channels_list}}` | `（未設定）`（設定なしの場合） |
| `{{index_count}}` | `6` |
| `{{sales_framework_name}}` | `BANTCH` |

---

### TC-019〜024: excluded_commands 動作テスト

**テスト目的**: `excluded_commands` に指定したコマンドが正しく除外されること

**テストケース詳細**:

**TC-019: deal-load ファイル除外**
- 設定: `excluded_commands: ["deal-load"]`
- 期待: `commands/tp-deal-load.md` が**生成されない**
- 検証: ファイルが存在しないこと（ファイル単位除外）

**TC-021: admin-backlog セクション除外**
- 設定: `excluded_commands: ["admin-backlog"]`
- 期待: `commands/tp-admin.md` は**生成される**（ファイルは存在）
- 検証: ファイル内に `backlog` サブコマンドセクションが**含まれない**（セクション単位除外）

**TC-022: admin-members セクション除外 + logスキル連動**
- 設定: `excluded_commands: ["admin-members"]`
- 期待1: `commands/tp-admin.md` から `members` セクションが除外
- 期待2: `skills/tp-admin/SKILL.md` のチームメンバー関連セクションが除外
- 期待3: `skills/tp-log/references/daily-log-format.md` のメンバー別サマリーが除外
- 検証: 3ファイルにわたる連動除外が正しく動作すること

---

### TC-036〜038: パッケージング構造テスト

**テスト目的**: 生成された `.plugin` ファイルの内部構造が正しいこと

**検証手順**:
```bash
# ZIPの内容を確認
unzip -l testproduct-context-stocker.plugin
```

**期待構造（NG例）**:
```
# NG: ラッパーディレクトリがある
testproduct-context-stocker/.claude-plugin/plugin.json
testproduct-context-stocker/skills/...
```

**期待構造（PASS例）**:
```
# OK: ルート直下に .claude-plugin/ がある
.claude-plugin/plugin.json
skills/tp-deal/SKILL.md
skills/tp-admin/SKILL.md
commands/tp-deal-load.md
...
```

**TC-038: plugin.json フィールド検証**

plugin.json に含まれるべきフィールドのみであること:
```json
{
  "name": "testproduct-context-stocker",
  "version": "x.x.x",
  "description": "...",
  "author": { "name": "..." },
  "keywords": [...]
}
```

以下のフィールドが**含まれていないこと**を検証:
- `skills`
- `commands`
- `data_sources`
- `format_version`
- `storage_type`
- `generated_by`

---

### TC-044〜045: ストレージアダプタ27変数定義テスト

**テスト目的**: 各ストレージアダプタが契約する全27変数を定義していること

**検証対象**:
- `storage-adapters/backlog-wiki.md`
- `storage-adapters/obsidian-vault.md`

**必須変数リスト**（全27変数が定義されていること）:
```
storage_name, storage_description, storage_create_cmd, storage_read_cmd,
storage_update_cmd, storage_search_cmd, storage_write_cmd, storage_rename_cmd,
storage_list_all_pages_cmd, storage_get_updated_date_cmd, storage_session_init,
storage_setup_procedure, storage_save_context_procedure,
storage_save_knowledge_procedure, storage_index_rebuild_procedure,
storage_index_update_procedure, storage_hierarchy_description,
storage_mcp_tool_table, storage_mcp_tool_table_knowledge,
storage_link_format_rules, storage_link_format_rules_context,
storage_link_format_rules_index, storage_link_format_rules_knowledge,
storage_page_url_prefix, storage_page_url_template,
storage_settings_location_description, storage_daily_log_wiki_check
```

---

### TC-050: plugin.json と marketplace.json のバージョン一致

**テスト目的**: 両ファイルの `version` フィールドが常に同一であること

**検証手順**:
```bash
grep '"version"' .claude-plugin/plugin.json
grep '"version"' .claude-plugin/marketplace.json
```

**期待結果**: 両ファイルで同じバージョン番号（例: `"0.8.0"`）

---

### TC-051: Slackチャンネル未設定時のエラーメッセージ

**テスト目的**: `slack.enabled: true` かつ `default_channels` が空の場合、適切なエラーメッセージが生成されること

**設定**:
```yaml
data_sources:
  slack:
    enabled: true
    default_channels: []
```

**期待動作**:
- Slack参照が必要なコマンド実行時に以下のメッセージが表示される:
  ```
  ⚠️ Slackの重点チャンネルが未設定です。
  `/{product_prefix}-admin slack` コマンドで設定してください。
  ```
- エラー後もコマンドは続行可能（Slack以外のデータソースは通常通り参照）

---

### TC-053: 週次レポートテンプレート 重要度ティア分類の記述検証

**テスト目的**: `templates/skills/log/references/weekly-report-format.md.template` に重要度ティア分類（★★★/★★/★）の3段階が全て定義されていること（v0.5.0追加機能）

**検証対象ファイル**: `templates/skills/log/references/weekly-report-format.md.template`

**検証手順**:
```bash
# ティア1（★★★）の定義が存在すること
grep -c "★★★" templates/skills/log/references/weekly-report-format.md.template
# → 0より大きい

# ティア2（★★）の定義が存在すること
grep -c "★★" templates/skills/log/references/weekly-report-format.md.template
# → 0より大きい

# ティア3（★）の定義が存在すること
grep -c "ティア3" templates/skills/log/references/weekly-report-format.md.template
# → 0より大きい

# 上位レポートへの集約ルール記述（原文転記・要約・数値集約の3種）が存在すること
grep -c "原文転記\|要約\|数値集約" templates/skills/log/references/weekly-report-format.md.template
# → 0より大きい
```

**期待される階層構造の記述**:
```
年次 ← QBR×4
QBR  ← 月次×3
月次 ← 週次×4-5
週次 ← 日次×5-7
```

**PASS条件**: 3段階のティア全て（★★★/★★/★）が定義され、各ティアの判定条件と集約ルールが記述されている

---

### TC-054: 活動レポートテンプレート 階層型集約フォールバック記述検証

**テスト目的**: `templates/commands/log.md.template` の `report` サブコマンドセクションに、階層型集約とフォールバック戦略が正しく記述されていること（v0.5.0追加機能）

**検証対象ファイル**: `templates/commands/log.md.template`

**検証手順**:
```bash
# 月次レポートのデータソース（週次→日次フォールバック）が記述されていること
grep -A5 "monthly" templates/commands/log.md.template | grep -c "フォールバック\|週次"
# → 0より大きい

# QBRレポートのデータソース（月次→週次→日次フォールバック）が記述されていること
grep -A5 "qbr" templates/commands/log.md.template | grep -c "フォールバック\|月次"
# → 0より大きい

# 年次レポートのデータソース（QBR→月次→週次→日次フォールバック）が記述されていること
grep -A5 "annual" templates/commands/log.md.template | grep -c "フォールバック\|QBR"
# → 0より大きい
```

**期待される記述内容**（フォールバック戦略）:
| レポート種別 | 主データソース | フォールバック |
|------------|--------------|-------------|
| 月次 | 週次レポート×4-5 | 週次未生成時は日次ログ |
| QBR | 月次レポート×3 | 月次未生成時は週次→日次 |
| 年次 | QBRレポート×4 | QBR未生成時は月次→週次→日次 |

**PASS条件**: 3種類のレポート（monthly/qbr/annual）それぞれにデータソースとフォールバック戦略が記述されている

---

### TC-055: log report サブコマンド引数パース記述の完全性検証

**テスト目的**: `templates/commands/log.md.template` の `report` サブコマンドセクションに、全引数パターンが正しく記述されていること

**検証対象ファイル**: `templates/commands/log.md.template`

**検証手順**:
```bash
# サブコマンド種別（monthly/qbr/annual）が全て記述されていること
grep -c "monthly\|qbr\|annual" templates/commands/log.md.template
# → 0より大きい

# 日付引数（YYYY-MM, YYYY-Q#, YYYY）の記述が存在すること
grep -c "YYYY-MM\|YYYY-Q\|YYYY" templates/commands/log.md.template
# → 0より大きい

# --format フラグ（md/pptx/both）の記述が存在すること
grep -c "\-\-format" templates/commands/log.md.template
# → 0より大きい

# Skillツール呼び出しとスキル参照が正しいこと
grep "{{plugin_name}}:{{product_prefix}}-log" templates/commands/log.md.template
# → マッチすること
```

**期待される引数一覧の記述**:
```
- monthly: 月次レポート（デフォルト: 先月分）
- monthly 2026-02: 指定月のレポート
- qbr: QBRレポート（デフォルト: 前四半期分）
- qbr 2026-Q1: 指定四半期のレポート
- annual: 年次レポート（デフォルト: 前年度分）
- annual 2025: 指定年度のレポート
- --format md: Markdown出力（ストレージ保存。デフォルト）
- --format pptx: PowerPoint出力
- --format both: Markdown + PowerPoint両方出力
```

**PASS条件**: 全9パターン（monthly/qbr/annual × デフォルト + 日付指定 + --format 3種）の記述が存在する
