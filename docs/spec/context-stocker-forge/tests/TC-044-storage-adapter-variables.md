# TC-044〜045: ストレージアダプタ27変数定義テスト

## テスト概要

両ストレージアダプタ（`backlog-wiki.md`, `obsidian-vault.md`）が、インターフェース契約として要求する全27変数を定義していることを検証する。

## 必須変数リスト

```
1.  storage_name
2.  storage_description
3.  storage_create_cmd
4.  storage_read_cmd
5.  storage_update_cmd
6.  storage_search_cmd
7.  storage_write_cmd
8.  storage_rename_cmd
9.  storage_list_all_pages_cmd
10. storage_get_updated_date_cmd
11. storage_session_init
12. storage_setup_procedure
13. storage_save_context_procedure
14. storage_save_knowledge_procedure
15. storage_index_rebuild_procedure
16. storage_index_update_procedure
17. storage_hierarchy_description
18. storage_mcp_tool_table
19. storage_mcp_tool_table_knowledge
20. storage_link_format_rules
21. storage_link_format_rules_context
22. storage_link_format_rules_index
23. storage_link_format_rules_knowledge
24. storage_page_url_prefix
25. storage_page_url_template
26. storage_settings_location_description
27. storage_daily_log_wiki_check
```

## TC-044: backlog-wiki アダプタ27変数確認

### 検証手順

`storage-adapters/backlog-wiki.md` のテキストを参照し、以下を確認:

```
参照先: skills/generate/references/template-assembly.md
「カテゴリ3: ストレージ個別変数 > backlog-wiki選択時の値」

上記の27変数全てに値が定義されていること。
```

### 期待値サンプル

| 変数 | 期待値 |
|------|--------|
| `storage_name` | `Backlog Wiki` |
| `storage_create_cmd` | `add_wiki` |
| `storage_read_cmd` | `get_wiki` |
| `storage_update_cmd` | `update_wiki` |
| `storage_search_cmd` | `get_wiki_pages(keyword: ...)` |
| `storage_session_init` | 3-Phase手順（Phase 1: get_project 直列、Phase 2-3: 並列） |
| `storage_link_format_rules` | `[[ページ名]]` |

### 整合性チェックとの関係

本テストは整合性チェック10（`forge-consistency-check-prompt.md` チェック10）に相当する。
チェック10: "`{{storage_*_cmd}}` 変数が両アダプタで定義されているか"

---

## TC-045: obsidian-vault アダプタ27変数確認

### 検証手順

`storage-adapters/obsidian-vault.md` のテキストを参照し、以下を確認:

```
参照先: skills/generate/references/template-assembly.md
「カテゴリ3: ストレージ個別変数 > obsidian-vault選択時の値」

上記の27変数全てに値が定義されていること。
```

### 期待値サンプル

| 変数 | 期待値 |
|------|--------|
| `storage_name` | `Obsidian Vault` |
| `storage_create_cmd` | `write_note` |
| `storage_read_cmd` | `read_note` |
| `storage_update_cmd` | `patch_note` or `write_note(mode: overwrite)` |
| `storage_search_cmd` | `search_notes(query: ...)` |
| `storage_session_init` | 2-Phase手順（Phase 1: list_directory 直列、Phase 2: 並列） |
| `storage_link_format_rules` | `[[ファイル名]]` |

---

## アダプタ間の差異検証

両アダプタで同じ変数名に対して、アダプタ固有の値が設定されていること:

| 変数 | backlog-wiki | obsidian-vault |
|------|-------------|----------------|
| `storage_name` | `Backlog Wiki` | `Obsidian Vault` |
| `storage_create_cmd` | `add_wiki` | `write_note` |
| `storage_rename_cmd` | `update_wiki(name: ...)` | `move_note` |
| `storage_list_all_pages_cmd` | `get_wiki_pages(projectId: ...)` | `list_directory(path: ...)` |
| `storage_page_url_prefix` | `https://{space}.backlog.com/wiki/{key}/` | `obsidian://open?vault=...&file=` |

---

## 新アダプタ追加時の検証ポイント

将来新しいストレージアダプタを追加する場合のテストチェックリスト:

- [ ] 27変数が全て定義されている
- [ ] `template-assembly.md` のカテゴリ3に新アダプタの値が追加されている
- [ ] `config-schema.md` の `storage.type` の選択肢に追加されている
- [ ] `wizard-steps.md` のストレージ選択肢に追加されている
- [ ] 整合性チェック10が新アダプタに対してもPASSする
