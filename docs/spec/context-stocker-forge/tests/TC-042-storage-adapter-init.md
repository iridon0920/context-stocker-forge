# TC-042〜043: ストレージアダプタ初期化フェーズテスト

## テスト概要

各ストレージアダプタの `storage_session_init` 変数に、アダプタ固有の初期化フェーズ構造（Backlog: 3-Phase、Obsidian: 2-Phase）が正しく定義されていることを検証する。

---

## TC-042: backlog-wiki — storage_session_init 3-Phase定義検証

### 目的

`storage-adapters/backlog-wiki.md` の `storage_session_init` に、MCP最適化A（セッション初期化Phase並列化）に基づいた3-Phase構造が記述されていること。

### 期待される3-Phase構造

```
Phase 1（直列）: get_project でプロジェクト情報を取得
Phase 2（並列）: get_wiki_pages で全WikiページIDリストを取得
Phase 3（並列）: 主要WikiページをwikiIdで直接取得（wikiId最適化D）
```

### 検証手順

```bash
# Phase 1 の定義（直列: get_project）が存在すること
grep -A30 "storage_session_init" storage-adapters/backlog-wiki.md | grep -c "Phase 1\|get_project"
# → 1以上

# Phase 2 の定義（並列: get_wiki_pages）が存在すること
grep -A30 "storage_session_init" storage-adapters/backlog-wiki.md | grep -c "Phase 2\|get_wiki_pages"
# → 1以上

# Phase 3 の定義が存在すること（並列: wikiId直接取得）
grep -A30 "storage_session_init" storage-adapters/backlog-wiki.md | grep -c "Phase 3\|wikiId"
# → 1以上

# 直列/並列の指定が存在すること
grep -A30 "storage_session_init" storage-adapters/backlog-wiki.md | grep -c "直列\|並列\|parallel"
# → 1以上
```

### wikiId最適化（最適化D）の確認

```bash
# INDEX ページに wikiId 列が含まれる記述があること
grep -c "wikiId" storage-adapters/backlog-wiki.md
# → 1以上

# wikiId を使った直接取得の記述があること
grep "wikiId" storage-adapters/backlog-wiki.md
# → get_wiki(wikiId: ...) または同等の記述
```

### PASS条件

| チェック項目 | 期待結果 |
|-----------|---------|
| Phase 1 定義（get_project 直列） | 記述あり |
| Phase 2 定義（get_wiki_pages 並列） | 記述あり |
| Phase 3 定義（wikiId 直接取得） | 記述あり |
| 直列/並列の区別 | 明記されている |
| wikiId 最適化の言及 | 記述あり |

---

## TC-043: obsidian-vault — storage_session_init 2-Phase定義検証

### 目的

`storage-adapters/obsidian-vault.md` の `storage_session_init` に、MCP最適化A（セッション初期化Phase並列化）に基づいた2-Phase構造が記述されていること。

### 期待される2-Phase構造

```
Phase 1（直列）: list_directory でファイル階層を取得
Phase 2（並列）: 主要ノートを read_note で並列取得
```

### 検証手順

```bash
# Phase 1 の定義（直列: list_directory）が存在すること
grep -A20 "storage_session_init" storage-adapters/obsidian-vault.md | grep -c "Phase 1\|list_directory"
# → 1以上

# Phase 2 の定義（並列: read_note）が存在すること
grep -A20 "storage_session_init" storage-adapters/obsidian-vault.md | grep -c "Phase 2\|read_note"
# → 1以上

# 直列/並列の指定が存在すること
grep -A20 "storage_session_init" storage-adapters/obsidian-vault.md | grep -c "直列\|並列"
# → 1以上
```

### PASS条件

| チェック項目 | 期待結果 |
|-----------|---------|
| Phase 1 定義（list_directory 直列） | 記述あり |
| Phase 2 定義（read_note 並列） | 記述あり |
| 直列/並列の区別 | 明記されている |

---

## アダプタ間の Phase 数比較

| アダプタ | Phase 数 | Phase 1 操作 | Phase 2 操作 | Phase 3 操作 |
|---------|---------|-------------|-------------|-------------|
| backlog-wiki | 3 | `get_project`（直列） | `get_wiki_pages`（並列） | `get_wiki`（並列、wikiId使用） |
| obsidian-vault | 2 | `list_directory`（直列） | `read_note`（並列） | — |

### 差異の検証

```bash
# backlog-wiki が3フェーズであること
grep -c "Phase" storage-adapters/backlog-wiki.md
# → 3以上

# obsidian-vault が2フェーズであること
grep -c "Phase" storage-adapters/obsidian-vault.md
# → 2以上（3以下）
```
