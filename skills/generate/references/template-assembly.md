# テンプレート合成ルール

`.team-config.yml` の値をテンプレートファイルに埋め込み、プラグインファイルを生成する手順。

## テンプレート変数記法

### 単純置換
```
{{variable_name}}
```
`.team-config.yml` のフィールド値で置換する。

### 配列ループ展開
```
{{#array_name}}
繰り返しブロック内で {{name}}, {{description}} 等を使用
{{/array_name}}
```

### 条件付きブロック
```
{{#condition}}
条件がtruthyの場合のみ出力されるブロック
{{/condition}}

{{^condition}}
条件がfalsyの場合のみ出力されるブロック（否定条件）
{{/condition}}
```

### ストレージ操作差し込み
```
{{storage_operations}}
```
選択されたストレージアダプタファイル（`storage-adapters/{type}.md`）の全内容で置換される。

---

## 変数マッピング（完全版）

### カテゴリ1: config直接マッピング

| テンプレート変数 | 設定値の参照パス | 例 |
|-----------------|----------------|-----|
| `{{product_name}}` | `product_name` | `Zendesk` |
| `{{product_prefix}}` | `product_prefix` | `zd` |
| `{{plugin_name}}` | `plugin_name` | `zendesk-context-stocker` |
| `{{team_name}}` | `team_name` | `SaaS営業部` |
| `{{storage_type}}` | `storage.type` | `backlog-wiki` |
| `{{storage_project_key}}` | `storage.backlog_wiki.project_key` | `TEAM_ZENDESK_PRJ` |
| `{{storage_base_path}}` | `storage.obsidian_vault.base_path` | `zendesk` |
| `{{sales_framework}}` | `sales_framework` | `BANTCH` |
| `{{pricing_structure}}` | `pricing_structure` | （料金体系の説明文） |
| `{{drive_folder_id}}` | `data_sources.google_drive.folder_id`（存在する場合のみ） | `1abc...` |

### カテゴリ2: 派生値（configから計算して生成）

以下の変数は `.team-config.yml` から計算・導出する。テンプレート合成のStep 2で全て事前に計算すること。

| テンプレート変数 | 計算ルール | 例 |
|-----------------|-----------|-----|
| `{{plugin_name}}` | `"{product_name.lower()}-context-stocker"` ※configにもあるが上書き | `zendesk-context-stocker` |
| `{{skill_deal_name}}` | `"{product_prefix}-deal"` | `zd-deal` |
| `{{skill_knowledge_name}}` | `"{product_prefix}-knowledge"` | `zd-knowledge` |
| `{{skill_reference}}` | `"{plugin_name}:{product_prefix}-deal"` | `zendesk-context-stocker:zd-deal` |
| `{{knowledge_skill_reference}}` | `"{plugin_name}:{product_prefix}-knowledge"` | `zendesk-context-stocker:zd-knowledge` |
| `{{skill_knowledge_reference}}` | `"{plugin_name}:{product_prefix}-knowledge"` ※エイリアス | 同上 |
| `{{product_name_lower}}` | `product_name` の小文字変換 | `zendesk` |
| `{{organization_name}}` | `team_name` と同値 | `SaaS営業部` |
| `{{team_scope}}` | `"{product_name}事業"` | `Zendesk事業` |
| `{{project_key}}` | `storage.backlog_wiki.project_key`（backlog-wiki時）<br/>`storage.obsidian_vault.base_path`（obsidian-vault時） | `TEAM_ZENDESK_PRJ` |
| `{{index_count}}` | INDEX構成のページ数（`Home` + 個別INDEXの合計）。標準構成では6 | `6` |
| `{{index_page_count}}` | `index_count` と同値 | `6` |
| `{{default_channels_list}}` | `data_sources.slack.default_channels[].name` をカンマ区切りで連結。未設定なら `（未設定）` | `biz-zendesk, team-zendesk` |
| `{{default_projects_list}}` | `data_sources.backlog_issues.projects[].name` をカンマ区切りで連結。未設定なら `（未設定）` | `ZENDESK_DEV` |
| `{{backlog_base_url}}` | Backlog MCPの `get_space` で取得したスペースURL。取得不可時は `https://{space}.backlog.com` 形式で推測 | `https://classmethod.backlog.com` |
| `{{slack_workspace_domain}}` | Slack MCPまたはconfigから。不明時は空文字 | `classmethod` |
| `{{sales_framework_name}}` | `sales_framework` の表示名。組み込み名はそのまま、カスタム時は `sales_framework` 値 | `BANTCH` |
| `{{sales_framework_sections}}` | `sales_framework_fields` からMarkdownセクションを生成 | （後述） |

#### 営業フレームワークの自動展開

`sales_framework` が組み込み名（`BANTCH`, `BANT`, `MEDDIC`）の場合、`config-schema.md` に定義された `sales_framework_fields` を自動設定する。

`{{sales_framework_sections}}` は以下形式で展開:
```
### Budget（予算）
予算規模・予算確保状況

（記入欄）

### Authority（決裁者）
意思決定者・決裁ルート

（記入欄）
...
```

### カテゴリ3: ストレージ個別変数

これらの変数はストレージ種別（`backlog-wiki` / `obsidian-vault`）に応じて異なる値を取る。テンプレート合成のStep 3で全て定義すること。

**`{{storage_operations}}` による差し込みとは別物**であることに注意。`{{storage_operations}}` はアダプタファイルを丸ごと差し込む仕組みで、以下の個別変数はテンプレート内の各所で直接使用される。

#### backlog-wiki選択時の値

| テンプレート変数 | 値 |
|-----------------|-----|
| `{{storage_name}}` | `Backlog Wiki` |
| `{{storage_description}}` | `Backlog Wikiでチーム共有の` |
| `{{storage_create_cmd}}` | `add_wiki` |
| `{{storage_read_cmd}}` | `get_wiki` |
| `{{storage_update_cmd}}` | `update_wiki` |
| `{{storage_search_cmd}}` | `get_wiki_pages(keyword: ...)` |
| `{{storage_write_cmd}}` | `add_wiki` |
| `{{storage_rename_cmd}}` | `update_wiki(name: ...)` |
| `{{storage_list_all_pages_cmd}}` | `get_wiki_pages(projectId: ...)` |
| `{{storage_get_updated_date_cmd}}` | `get_wiki` のレスポンスの `updated` フィールド |
| `{{storage_session_init}}` | **Phase 1**（直列・必須）: `get_project(projectKey: "{{project_key}}")` でprojectId取得。**Phase 2**（すべて並列）: `get_wiki_pages` でHome・各設定ページ（Slackチャンネル設定、Backlogプロジェクト設定、競合情報、料金体系）のwikiIdを一括取得。**Phase 3**（並列）: Phase 2のwikiIdで `get_wiki` し本文取得・パース・キャッシュ。効果: 旧方式（全直列6〜8ターン）→ 3フェーズに短縮 |
| `{{storage_setup_procedure}}` | `get_project` と `get_wiki_pages` で接続・存在確認する手順 |
| `{{storage_save_context_procedure}}` | `get_wiki_pages` で既存チェック → `add_wiki` or `update_wiki` の手順 |
| `{{storage_save_knowledge_procedure}}` | 同上（パスがナレッジ配下） |
| `{{storage_index_rebuild_procedure}}` | 全ページ取得→集計→INDEX更新の手順 |
| `{{storage_index_update_procedure}}` | 差分のみINDEX更新の手順 |
| `{{storage_hierarchy_description}}` | `Wiki名でパス表現（例: 案件/顧客名/案件名）` |
| `{{storage_mcp_tool_table}}` | Backlog MCPツール一覧テーブル（`get_project`, `add_wiki`, `get_wiki_pages`, `get_wiki`, `update_wiki`） |
| `{{storage_mcp_tool_table_knowledge}}` | ナレッジ用MCP操作テーブル |
| `{{storage_link_format_rules}}` | `[[ページ名]]` 形式のリンクルール |
| `{{storage_link_format_rules_context}}` | `[[案件/顧客名/案件名]]` |
| `{{storage_link_format_rules_index}}` | `[[INDEX/カテゴリ名]]` |
| `{{storage_link_format_rules_knowledge}}` | `[[ナレッジ/カテゴリ/トピック]]` |
| `{{storage_page_url_prefix}}` | `https://{space}.backlog.com/wiki/{project_key}/` |
| `{{storage_page_url_template}}` | `{storage_page_url_prefix}{ページ名}` |
| `{{storage_settings_location_description}}` | `プロジェクト {{project_key}} のWiki「設定/xxx」ページ` |
| `{{storage_daily_log_wiki_check}}` | `get_wiki_pages(keyword: "活動ログ/YYYY-MM/YYYY-MM-DD")` |

#### obsidian-vault選択時の値

| テンプレート変数 | 値 |
|-----------------|-----|
| `{{storage_name}}` | `Obsidian Vault` |
| `{{storage_description}}` | `Obsidian Vaultで個人管理の` |
| `{{storage_create_cmd}}` | `write_note` |
| `{{storage_read_cmd}}` | `read_note` |
| `{{storage_update_cmd}}` | `patch_note` or `write_note(mode: overwrite)` |
| `{{storage_search_cmd}}` | `search_notes(query: ...)` |
| `{{storage_write_cmd}}` | `write_note` |
| `{{storage_rename_cmd}}` | `move_note` |
| `{{storage_list_all_pages_cmd}}` | `list_directory(path: "{{storage_base_path}}")` |
| `{{storage_get_updated_date_cmd}}` | `get_frontmatter` のレスポンスの `updated` フィールド |
| `{{storage_session_init}}` | **Phase 1**（直列・必須）: `list_directory(path: "{{storage_base_path}}")` でVault構成を確認。**Phase 2**（並列）: `read_note` でHome・各設定ノート（Slackチャンネル設定、Backlogプロジェクト設定、競合情報、料金体系）・INDEXを一括読み込み・パース・キャッシュ。効果: 旧方式（直列N回）→ 2フェーズに短縮 |
| `{{storage_setup_procedure}}` | `list_directory` でbase_path存在確認する手順 |
| `{{storage_save_context_procedure}}` | `read_note` で既存チェック → `write_note` の手順 |
| `{{storage_save_knowledge_procedure}}` | 同上（パスがナレッジ配下） |
| `{{storage_index_rebuild_procedure}}` | `list_directory` で全件取得→集計→`write_note` でINDEX更新の手順 |
| `{{storage_index_update_procedure}}` | 差分のみINDEX更新の手順 |
| `{{storage_hierarchy_description}}` | `ファイルパスで階層表現（例: {base_path}/deals/顧客名/案件名.md）` |
| `{{storage_mcp_tool_table}}` | Obsidian MCPツール一覧テーブル（`read_note`, `write_note`, `patch_note`, `search_notes`, `list_directory`, `update_frontmatter`） |
| `{{storage_mcp_tool_table_knowledge}}` | ナレッジ用MCP操作テーブル |
| `{{storage_link_format_rules}}` | `[[ファイル名]]` 形式のリンクルール |
| `{{storage_link_format_rules_context}}` | `[[deals/顧客名/案件名]]` |
| `{{storage_link_format_rules_index}}` | `[[HOME]]` or `[[deals/INDEX]]` |
| `{{storage_link_format_rules_knowledge}}` | `[[knowledge/カテゴリ/トピック]]` |
| `{{storage_page_url_prefix}}` | `obsidian://open?vault=...&file=` |
| `{{storage_page_url_template}}` | `{storage_page_url_prefix}{ファイルパス}` |
| `{{storage_settings_location_description}}` | `Vault内 {base_path}/settings/ 配下のノート` |
| `{{storage_daily_log_wiki_check}}` | `read_note(path: "{base_path}/logs/YYYY-MM/YYYY-MM-DD.md")` |

### カテゴリ4: 配列ループブロック

以下の `{{#...}}...{{/...}}` ブロックは配列要素を繰り返し展開する。

| ブロック名 | ソース | ループ内で使える変数 |
|-----------|--------|---------------------|
| `{{#knowledge_categories}}` | `knowledge_categories[]` | `{{name}}`, `{{description}}`, `{{#has_subcategories}}`, `{{#sub_categories}}...{{/sub_categories}}` |
| `{{#sub_categories}}` | `knowledge_categories[].sub_categories[]` | `{{.}}`（文字列値そのもの） |
| `{{#competitors}}` | `competitors[]` | `{{.}}`（文字列値そのもの） |
| `{{#kpi_revenue_categories}}` | `kpi.revenue_categories[]` | `{{.}}`（文字列値そのもの） |
| `{{#sales_framework_fields}}` | `sales_framework_fields[]` | `{{name}}`, `{{description}}`, `{{key}}` |
| `{{#default_slack_channels}}` | `data_sources.slack.default_channels[]` | `{{name}}`, `{{id}}`, `{{usage}}` → テンプレートでは `{{channel_name}}`, `{{channel_purpose}}` |
| `{{#default_backlog_projects}}` | `data_sources.backlog_issues.projects[]` | `{{key}}`, `{{name}}` → テンプレートでは `{{project_key_value}}`, `{{project_display_name}}`, `{{project_purpose}}` |
| `{{#data_sources}}` | 有効なデータソース一覧 | `{{name}}`, `{{description}}` |
| `{{#index_pages}}` | INDEX構成定義（派生値で生成） | `{{index_name}}`, `{{index_description}}` |
| `{{#migration_warnings}}` | ナレッジカテゴリ固有の注意事項 | `{{warning_text}}` |
| `{{#official_sources}}` | 公式情報源リスト（派生値で生成） | `{{source_name}}`, `{{source_description}}`, `{{source_url}}` |
| `{{#official_source_urls}}` | 公式URL一覧 | `{{source_name}}`, `{{source_url}}` |
| `{{#official_source_search_steps}}` | 公式情報検索手順 | `{{step_index}}`, `{{step_description}}` |
| `{{#stale_thresholds}}` | 鮮度しきい値定義 | `{{monitoring_type}}`, `{{warn_days}}`, `{{danger_days}}` |
| `{{#doc_commands}}` | ドキュメント生成コマンド一覧 | `{{command_group}}`, `{{command_action}}`, `{{guideline_name}}`, `{{command_description}}` |
| `{{#customer_classifications}}` | 顧客分類定義 | `{{classification_name}}`, `{{classification_label}}`, `{{classification_description}}`, `{{classification_description_short}}`, `{{classification_example}}`, `{{classification_target}}` |
| `{{#product_customer_fields}}` | 製品固有の顧客フィールド | `{{field_name}}`, `{{field_label}}`, `{{field_description}}`, `{{field_template}}` |
| `{{#product_customer_links}}` | 製品固有の顧客リンク | `{{link_label}}`, `{{link_template}}` |
| `{{#product_environment_section}}` | 製品環境セクション | `{{product_environment_description}}` |
| `{{#product_subcategories}}` | 製品サブカテゴリ | `{{subcategory_name}}`, `{{subcategory_scope}}`, `{{subcategory_scope_short}}`, `{{subcategory_parent}}`, `{{subcategory_parent_item}}` |
| `{{#knowledge_category_sections}}` | ナレッジカテゴリセクション | `{{section_name}}`, `{{section_content}}`, `{{section_category_name}}` |
| `{{#knowledge_index_mapping}}` | ナレッジINDEXマッピング | `{{category_name}}`, `{{category_path}}`, `{{category_save_hint}}`, `{{category_content_description}}`, `{{category_example_subcategory}}`, `{{category_example_topic}}`, `{{category_label}}` |
| `{{#index_format_rules}}` | INDEXフォーマットルール | `{{index_page_name}}`, `{{index_page_display_name}}`, `{{index_page_description}}`, `{{index_page_body_template}}`, `{{index_page_header_extra}}` |
| `{{#index_rebuild_classification_rules}}` | INDEX再構築分類ルール | 各分類ルール固有変数 |
| `{{#deal_grouping_rules}}` | 案件グルーピングルール | `{{classification_name}}`, `{{classification_label}}` |
| `{{#auto_search_rules}}` | 自動検索ルール | `{{search_trigger}}`, `{{search_example}}`, `{{search_category_path}}`, `{{auto_search_index}}`, `{{auto_action}}` |
| `{{#storage_auto_fields}}` | ストレージ自動フィールド | `{{field_name}}`, `{{field_description}}` |
| `{{#uncollected_info_flags}}` | 未収集情報フラグ | `{{flag_condition}}`, `{{result}}` |
| `{{#search_caution}}` | 検索注意事項 | テキスト |
| `{{#search_fallback_note}}` | 検索フォールバック注記 | テキスト |

### カテゴリ5: 条件ブロック

| ブロック | 条件ソース | 用途 |
|---------|-----------|------|
| `{{#drive_folder_id}}` | `data_sources.google_drive.folder_id` が存在 | Google Driveフォルダ参照セクション |
| `{{^drive_folder_id}}` | 上記の否定 | フォルダ未設定時の代替テキスト |
| `{{#has_subcategories}}` | ナレッジカテゴリに `sub_categories` が存在 | サブカテゴリ表示 |
| `{{^has_subcategories}}` | 上記の否定 | サブカテゴリなし時のテキスト |
| `{{#data_sources.slack.enabled}}` | Slackが有効 | Slack関連セクション |
| `{{#data_sources.google_calendar.enabled}}` | Google Calendar有効 | カレンダーセクション |
| `{{#data_sources.gmail.enabled}}` | Gmail有効 | メールセクション |
| `{{#data_sources.google_drive.enabled}}` | Google Drive有効 | ドライブセクション |
| `{{#data_sources.backlog_issues.enabled}}` | Backlog Issues有効 | 課題セクション |
| `{{^excluded_admin_setup}}` | `excluded_commands` に `admin-setup` が含まれない | admin.md内のsetupセクション |
| `{{^excluded_admin_index}}` | `excluded_commands` に `admin-index` が含まれない | admin.md内のindexセクション |
| `{{^excluded_admin_slack}}` | `excluded_commands` に `admin-slack` が含まれない | admin.md内のslackセクション |
| `{{^excluded_admin_backlog}}` | `excluded_commands` に `admin-backlog` が含まれない | admin.md内のbacklogセクション |
| `{{^excluded_admin_competitors}}` | `excluded_commands` に `admin-competitors` が含まれない | admin.md内のcompetitorsセクション |
| `{{^excluded_admin_pricing}}` | `excluded_commands` に `admin-pricing` が含まれない | admin.md内のpricingセクション |
| `{{^excluded_admin_kpi_set}}` | `excluded_commands` に `admin-kpi-set` が含まれない | admin.md内のkpi-setセクション |
| `{{^excluded_admin_okr_set}}` | `excluded_commands` に `admin-okr-set` が含まれない | admin.md内のokr-setセクション |
| `{{^excluded_admin_stale}}` | `excluded_commands` に `admin-stale` が含まれない | admin.md内のstaleセクション |
| `{{^excluded_admin_migrate}}` | `excluded_commands` に `admin-migrate` が含まれない | admin.md内のmigrateセクション |
| `{{^excluded_doc_prep}}` | `excluded_commands` に `doc-prep` が含まれない | doc.md内のprepセクション |
| `{{^excluded_doc_proposal}}` | `excluded_commands` に `doc-proposal` が含まれない | doc.md内のproposalセクション |
| `{{^excluded_doc_estimate}}` | `excluded_commands` に `doc-estimate` が含まれない | doc.md内のestimateセクション |
| `{{^excluded_engdoc_hearing}}` | `excluded_commands` に `engdoc-hearing` が含まれない | engdoc.md内のhearingセクション |
| `{{^excluded_engdoc_config}}` | `excluded_commands` に `engdoc-config` が含まれない | engdoc.md内のconfigセクション |
| `{{^excluded_engdoc_testcases}}` | `excluded_commands` に `engdoc-testcases` が含まれない | engdoc.md内のtestcasesセクション |
| `{{^excluded_log_daily}}` | `excluded_commands` に `log-daily` が含まれない | log.md内のdailyセクション |
| `{{^excluded_log_report}}` | `excluded_commands` に `log-report` が含まれない | log.md内のreportセクション |

---

## 合成手順（7ステップ）

### Step 1: 設定ファイル読み込み
```
config = parse_yaml(".team-config.yml")
```

### Step 2: 派生値の計算

**カテゴリ2の全変数**を計算してcontext辞書に格納する。

```
context = {}
context.update(config)  # config直接値を全て格納

# 基本派生値
context["plugin_name"] = f"{config.product_name.lower()}-context-stocker"
context["skill_deal_name"] = f"{config.product_prefix}-deal"
context["skill_knowledge_name"] = f"{config.product_prefix}-knowledge"
context["skill_reference"] = f"{context.plugin_name}:{config.product_prefix}-deal"
context["knowledge_skill_reference"] = f"{context.plugin_name}:{config.product_prefix}-knowledge"
context["skill_knowledge_reference"] = context["knowledge_skill_reference"]
context["product_name_lower"] = config.product_name.lower()
context["organization_name"] = config.team_name
context["team_scope"] = f"{config.product_name}事業"
context["project_key"] = config.storage.backlog_wiki.project_key  # or obsidian_vault.base_path
context["index_count"] = 6  # Home + 5 INDEX
context["index_page_count"] = context["index_count"]

# リスト連結
if config.data_sources.slack.default_channels:
    context["default_channels_list"] = ", ".join(ch.name for ch in config.data_sources.slack.default_channels)
else:
    context["default_channels_list"] = "（未設定）"

if config.data_sources.backlog_issues and config.data_sources.backlog_issues.projects:
    context["default_projects_list"] = ", ".join(p.name for p in config.data_sources.backlog_issues.projects)
else:
    context["default_projects_list"] = "（未設定）"

# 営業フレームワーク
if config.sales_framework in ["BANTCH", "BANT", "MEDDIC"]:
    context["sales_framework_fields"] = get_builtin_framework(config.sales_framework)
context["sales_framework_name"] = config.sales_framework
```

営業フレームワークが組み込み名（BANTCH, BANT, MEDDIC）の場合、`config-schema.md` に定義された `sales_framework_fields` を自動設定する。

### Step 3: ストレージ変数の定義

**カテゴリ3の全変数**をストレージ種別に応じて定義する。

```
if config.storage.type == "backlog-wiki":
    context.update(backlog_wiki_storage_variables(config))
elif config.storage.type == "obsidian-vault":
    context.update(obsidian_vault_storage_variables(config))
```

**重要**: この時点ではストレージ変数の値にも `{{project_key}}` 等のテンプレート変数が含まれている場合がある。Step 4のレンダリング時に再帰的に解決すること。

### Step 4: テンプレートファイルの処理

各テンプレートファイルを読み込み、contextの値で変数を展開して出力ファイルに書き出す。

**処理順序**:
1. `{{storage_operations}}` → アダプタファイル内容で置換
2. `{{#array}} ... {{/array}}` → 配列ループ展開
3. `{{#condition}} ... {{/condition}}` → 条件ブロック評価
4. `{{^condition}} ... {{/condition}}` → 否定条件ブロック評価
5. `{{variable}}` → 単純置換

**重要**: ストレージアダプタを差し込んだ後、アダプタ内の `{{storage_project_key}}` や `{{storage_base_path}}` もStep 2で計算済みの値で置換すること。つまり `{{storage_operations}}` 差し込み後に再度変数置換を実行する。

### Step 5: コマンド除外の適用
`config.excluded_commands` の各エントリから `excluded_*` フラグ変数を生成し、テンプレート内の条件ブロックで評価する。

```python
for cmd in config.excluded_commands:
    flag = f"excluded_{cmd.replace('-', '_')}"
    context[flag] = True
```

例: `excluded_commands: ["admin-backlog"]` → `excluded_admin_backlog = True` → テンプレート内の `{{^excluded_admin_backlog}}...{{/excluded_admin_backlog}}` ブロックが非表示になる。

統合コマンド（admin, doc, engdoc, log）はファイル単位ではなくセクション単位で除外される。deal, knowledge は従来どおりファイル単位でスキップする。

### Step 6: 生成物チェック（Post-Generation Validation）

**必須ステップ**。パッケージングの前に以下の6項目を全て検証する。1項目でもNGの場合はStep 4に戻って修正する。

詳細は `references/post-generation-check.md` を参照。

### Step 7: .pluginファイルのパッケージング

生成結果をZIPアーカイブとしてパッケージする。

---

## ファイル名のマッピング

| テンプレートパス | 出力パス |
|---------------|---------|
| （ウィザード生成） | `.team-config.yml` |
| `templates/plugin-json.template` | `.claude-plugin/plugin.json` |
| `templates/readme.template` | `README.md` |
| `templates/skills/context/SKILL.md.template` | `skills/{pre}-deal/SKILL.md` |
| `templates/skills/context/references/*.template` | `skills/{pre}-deal/references/*` |
| `templates/skills/knowledge/SKILL.md.template` | `skills/{pre}-knowledge/SKILL.md` |
| `templates/skills/knowledge/references/*.template` | `skills/{pre}-knowledge/references/*` |
| `templates/commands/{group}/{action}.md.template` | `commands/{pre}-{group}-{action}.md` |
| `templates/commands/{group}.md.template` | `commands/{pre}-{group}.md` |

ファイル名中の `{pre}` は `config.product_prefix` で置換。
テンプレートファイルの `.template` 拡張子は出力時に除去。

---

## plugin.json の生成ルール

**重要**: `plugin.json` には `name`, `version`, `description`, `author`, `keywords` のみを含める。Coworkのプラグインシステムは `skills/` と `commands/` ディレクトリを自動検出するため、`skills`, `commands`, `data_sources`, `format_version`, `storage_type`, `generated_by` などの追加フィールドは**含めてはいけない**（含めるとコマンドが認識されない原因になる）。

## ZIPパッケージングルール

**重要**: `.plugin` ファイル（ZIPアーカイブ）は、ZIPのルート直下に `.claude-plugin/plugin.json` が存在する構造にする。`{plugin_name}/` のようなラッパーディレクトリで囲んではいけない。

正しい構造:
```
.claude-plugin/plugin.json   ← ZIPルート直下
skills/
commands/
```

## 出力ディレクトリ構成

```
{plugin_name}/
├── .claude-plugin/
│   └── plugin.json
├── .team-config.yml
├── README.md
├── skills/
│   ├── {pre}-deal/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── context-format.md
│   │       ├── daily-log-format.md
│   │       ├── index-format.md
│   │       ├── similarity-check.md
│   │       ├── slack-channels-format.md
│   │       ├── backlog-projects-format.md  (backlog-wiki時のみ)
│   │       ├── kpi-format.md
│   │       ├── okr-format.md
│   │       ├── competitors-format.md
│   │       └── pricing-format.md
│   └── {pre}-knowledge/
│       ├── SKILL.md
│       └── references/
│           └── knowledge-format.md
└── commands/
    ├── {pre}-deal-load.md
    ├── {pre}-deal-save.md
    ├── {pre}-knowledge-save.md
    ├── {pre}-knowledge-search.md
    ├── {pre}-admin.md              (10サブコマンド: setup/index/slack/backlog/competitors/pricing/kpi-set/okr-set/stale/migrate)
    ├── {pre}-doc.md                (3サブコマンド: prep/proposal/estimate)
    ├── {pre}-engdoc.md             (3サブコマンド: hearing/config/testcases)
    └── {pre}-log.md                (2サブコマンド: daily/report)
```
