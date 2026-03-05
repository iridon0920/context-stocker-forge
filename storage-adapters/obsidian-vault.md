## ストレージ操作（Obsidian Vault）

### このアダプタの変数契約

テンプレート合成時（template-assembly.md Step 3）に、以下の変数をこのアダプタの値で定義すること。
定義ルールの詳細は `template-assembly.md` の「カテゴリ3: ストレージ個別変数 > obsidian-vault選択時の値」を参照。

必須変数: `storage_name`, `storage_description`, `storage_create_cmd`, `storage_read_cmd`, `storage_update_cmd`, `storage_search_cmd`, `storage_write_cmd`, `storage_rename_cmd`, `storage_list_all_pages_cmd`, `storage_get_updated_date_cmd`, `storage_session_init`, `storage_setup_procedure`, `storage_save_context_procedure`, `storage_save_knowledge_procedure`, `storage_index_rebuild_procedure`, `storage_index_update_procedure`, `storage_hierarchy_description`, `storage_mcp_tool_table`, `storage_mcp_tool_table_knowledge`, `storage_link_format_rules`, `storage_link_format_rules_context`, `storage_link_format_rules_index`, `storage_link_format_rules_knowledge`, `storage_page_url_prefix`, `storage_page_url_template`, `storage_settings_location_description`, `storage_daily_log_wiki_check`

アダプタ内テンプレート変数: このファイル内の `{{storage_base_path}}` はテンプレート合成Step 4で `config.storage.obsidian_vault.base_path` の値に置換される。

---

本プラグインはObsidian VaultをMCPツール経由で操作する。すべてのデータはVault内の `{{storage_base_path}}/` 配下に保存される。

### 前提
- Obsidian MCP (`mcp__obsidian__`) が利用可能であること
- Vault内の `{{storage_base_path}}/` ディレクトリが存在すること

### ディレクトリ構成

```
{{storage_base_path}}/
├── deals/          ← 案件コンテキスト
│   ├── {顧客名}/
│   │   └── {案件名}.md
│   └── INDEX.md
├── knowledge/         ← ナレッジベース
│   ├── {カテゴリ名}/
│   │   └── {ページ名}.md
│   └── INDEX.md
├── logs/              ← 活動ログ
│   ├── {YYYY-MM}/
│   │   └── {YYYY-MM-DD}.md
│   └── INDEX.md
├── settings/          ← 設定
│   ├── slack-channels.md
│   └── backlog-projects.md
├── guidelines/        ← ガイドライン
│   └── {ドキュメント名}.md
└── HOME.md            ← ホームINDEX
```

### ノート作成（STORAGE_CREATE）

`write_note` MCP ツールを使用:

```
write_note(
  path: "{{storage_base_path}}/{パス}/{ファイル名}.md",
  content: "{Markdown本文}",
  frontmatter: {
    "format_version": 1,
    "created": "YYYY-MM-DDTHH:MM:SS",
    "updated": "YYYY-MM-DDTHH:MM:SS",
    "tags": ["{適切なタグ}"]
  }
)
```

ファイルパスの命名規則:
- コンテキスト: `{{storage_base_path}}/deals/{顧客名}/{案件名}.md`
- ナレッジ: `{{storage_base_path}}/knowledge/{カテゴリ名}/{ページ名}.md`
- 活動ログ: `{{storage_base_path}}/logs/{YYYY-MM}/{YYYY-MM-DD}.md`
- INDEX: `{{storage_base_path}}/HOME.md`, `{{storage_base_path}}/deals/INDEX.md`, etc.
- 設定: `{{storage_base_path}}/settings/{設定名}.md`

### ノート読み込み（STORAGE_READ）

`read_note` で直接パス指定:

```
read_note(path: "{{storage_base_path}}/{パス}/{ファイル名}.md")
→ content (Markdown本文) + frontmatter (メタデータ)
```

### ノート更新（STORAGE_UPDATE）

内容の部分置換には `patch_note` を使用:

```
patch_note(
  path: "{{storage_base_path}}/{パス}/{ファイル名}.md",
  oldString: "{置換前のテキスト}",
  newString: "{置換後のテキスト}"
)
```

全体書き換えには `write_note` を mode: overwrite で使用:

```
write_note(
  path: "{{storage_base_path}}/{パス}/{ファイル名}.md",
  content: "{更新後のMarkdown本文}",
  mode: "overwrite"
)
```

frontmatterの更新は `update_frontmatter` を使用:

```
update_frontmatter(
  path: "{{storage_base_path}}/{パス}/{ファイル名}.md",
  frontmatter: { "updated": "YYYY-MM-DDTHH:MM:SS" },
  merge: true
)
```

### キーワード検索（STORAGE_SEARCH）

`search_notes` でVault内を検索:

```
search_notes(
  query: "{検索語}",
  limit: 10
)
→ マッチするノートのリスト（path, content excerpt等）
```

検索範囲を絞る場合はクエリにパスプレフィクスを含める。

### ファイル一覧（STORAGE_LIST）

`list_directory` でディレクトリ内容を取得:

```
list_directory(path: "{{storage_base_path}}/{パス}")
→ ファイル・ディレクトリのリスト
```

### 内部リンクフォーマット

Obsidian内でのリンク形式:
```
[[ファイル名]]
[[パス/ファイル名|表示テキスト]]
```

INDEXページやコンテキストページ内でのリンクはこの形式を使用する。

### 書き込み確認プロトコル

すべての書き込み操作（作成・更新）の前に、ユーザーへ確認を行う:

1. 操作内容のサマリーを提示（新規作成 or 更新、ファイルパス、変更概要）
2. ユーザーの承認を得てから実行
3. 実行結果を報告

**例外**: INDEX再構築のように大量ファイルを一括更新する場合は、最初に全体の計画を提示し、一括承認を得る。

### Frontmatterの活用

Obsidian Vaultでは各ノートにfrontmatter（YAMLヘッダー）を付与し、メタデータを管理する:

```yaml
---
format_version: 1
created: "2026-03-01T09:00:00"
updated: "2026-03-03T15:30:00"
tags:
  - context
  - {product_prefix}
category: "{カテゴリ名}"
customer: "{顧客名}"
---
```

これにより `search_notes` での絞り込みや、frontmatterベースの検索が可能になる。
