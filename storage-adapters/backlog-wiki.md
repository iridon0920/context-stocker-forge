## ストレージ操作（Backlog Wiki）

### このアダプタの変数契約

テンプレート合成時（template-assembly.md Step 3）に、以下の変数をこのアダプタの値で定義すること。
定義ルールの詳細は `template-assembly.md` の「カテゴリ3: ストレージ個別変数 > backlog-wiki選択時の値」を参照。

必須変数: `storage_name`, `storage_description`, `storage_create_cmd`, `storage_read_cmd`, `storage_update_cmd`, `storage_search_cmd`, `storage_write_cmd`, `storage_rename_cmd`, `storage_list_all_pages_cmd`, `storage_get_updated_date_cmd`, `storage_session_init`, `storage_setup_procedure`, `storage_save_context_procedure`, `storage_save_knowledge_procedure`, `storage_index_rebuild_procedure`, `storage_index_update_procedure`, `storage_hierarchy_description`, `storage_mcp_tool_table`, `storage_mcp_tool_table_knowledge`, `storage_link_format_rules`, `storage_link_format_rules_context`, `storage_link_format_rules_index`, `storage_link_format_rules_knowledge`, `storage_page_url_prefix`, `storage_page_url_template`, `storage_settings_location_description`, `storage_daily_log_wiki_check`

アダプタ内テンプレート変数: このファイル内の `{{storage_project_key}}` はテンプレート合成Step 4で `config.storage.backlog_wiki.project_key` の値に置換される。

---

本プラグインはBacklog WikiをMCPツール経由で操作する。すべてのデータはBacklogプロジェクト `{{storage_project_key}}` のWikiに保存される。

### 前提
- Backlog MCP (`mcp__backlog__`) が利用可能であること
- プロジェクト `{{storage_project_key}}` への読み書き権限があること

### プロジェクト情報の取得

セッション初期化時、`get_project` でプロジェクトIDを取得し、以後の操作で使用する。

```
get_project(projectKey: "{{storage_project_key}}")
→ projectId を記録
```

### ページ作成（STORAGE_CREATE）

`add_wiki` MCP ツールを使用:

```
add_wiki(
  projectId: {projectId},
  name: "{ページパス}",
  content: "{Markdown本文}"
)
```

ページパスの命名規則:
- コンテキスト: `案件/{顧客名}/{案件名}`
- ナレッジ: `ナレッジ/{カテゴリ名}/{ページ名}`
- 活動ログ: `活動ログ/{YYYY-MM}/{YYYY-MM-DD}`
- INDEX: `INDEX/Home`, `INDEX/顧客・案件`, etc.
- 設定: `設定/{設定名}`

### ページ読み込み（STORAGE_READ）

2段階で実行:

1. `get_wiki_pages` でページ一覧からWikiIdを検索:
```
get_wiki_pages(projectId: {projectId}, keyword: "{検索キーワード}")
→ 該当ページの id を取得
```

2. `get_wiki` で本文を取得:
```
get_wiki(wikiId: {wikiId})
→ content フィールドがMarkdown本文
```

#### wikiIdが既知の場合（⚡高速パス）

INDEXのwikiIdメタデータやセッションキャッシュを活用し、`get_wiki_pages` による検索をスキップ:

```
get_wiki(wikiId: {既知のwikiId})
→ content フィールドがMarkdown本文
```

wikiIdが既知になるケース：
- セッション初期化Phase 2で取得済み（Home・設定ページ）
- INDEXページのwikiId列に記載あり（コンテキスト・ナレッジページ）
- 同一セッション内で `add_wiki` / `get_wiki_pages` の応答から取得済み

### ページ更新（STORAGE_UPDATE）

`update_wiki` MCP ツールを使用:

```
update_wiki(
  wikiId: {wikiId},
  content: "{更新後のMarkdown本文}"
)
```

更新前に必ず既存内容を読み込み、差分を確認してから更新すること。

### キーワード検索（STORAGE_SEARCH）

`get_wiki_pages` で keyword パラメータを使用:

```
get_wiki_pages(projectId: {projectId}, keyword: "{検索語}")
→ マッチするページのリスト（id, name, tags等）
```

検索結果からページ名でフィルタリングし、必要なページを `get_wiki` で読み込む。

### ページ一覧（STORAGE_LIST）

`get_wiki_pages` で全ページ取得後、ページ名のプレフィクスでフィルタ:

```
get_wiki_pages(projectId: {projectId})
→ 全ページリスト

フィルタ例:
- コンテキスト配下: name が "案件/" で始まるもの
- ナレッジ配下: name が "ナレッジ/" で始まるもの
```

### Wikiリンクフォーマット

Backlog Wiki内でのリンク形式:
```
[[ページ名]]
```

INDEXページやコンテキストページ内でのリンクはこの形式を使用する。

### 書き込み確認プロトコル

すべての書き込み操作（作成・更新）の前に、ユーザーへ確認を行う:

1. 操作内容のサマリーを提示（新規作成 or 更新、ページ名、変更概要）
2. ユーザーの承認を得てから実行
3. 実行結果を報告

**例外**: INDEX再構築のように大量ページを一括更新する場合は、最初に全体の計画を提示し、一括承認を得る。
