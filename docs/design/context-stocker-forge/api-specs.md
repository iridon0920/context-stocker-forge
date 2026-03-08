# コマンド・スキルインターフェース仕様（逆生成）

## 分析日時
2026-03-07（更新: 2026-03-08、v0.8.0対応）

## 概要

context-stocker-forge は Claude Code プラグインシステムで動作するため、従来の REST API ではなく「コマンド（/forge-*）」と「スキル（context-stocker-forge:*）」がインターフェースとなる。

---

## forge コマンド仕様

### /forge-generate

**ファイル**: `commands/generate.md`
**説明**: コンテキスト管理プラグイン（context-stocker）を生成する

```
/forge-generate [config-path]
```

| 引数 | 必須 | 説明 |
|------|------|------|
| config-path | No | 再生成時: 既存プラグインのディレクトリパス |

**動作**:
- 引数なし → 新規ウィザードモード（対話型ヒアリング → 生成）
- 引数あり → プラグイン内の `.team-config.yml` を読み込み再生成

**呼び出し先スキル**: `context-stocker-forge:generate`

---

### /forge-migrate

**ファイル**: `commands/migrate.md`
**説明**: 生成済み context-stocker のデータフォーマットをマイグレーションする

```
/forge-migrate [plugin-path]
```

| 引数 | 必須 | 説明 |
|------|------|------|
| plugin-path | Yes | 対象プラグインのディレクトリパス |

**動作**:
1. プラグイン内 `.team-config.yml` 読み込み
2. ストレージ内ページを10件サンプリングして `format_version` 確認
3. 差分分析・影響範囲を提示
4. ユーザー確認後にマイグレーション実行

**呼び出し先スキル**: `context-stocker-forge:generate`（マイグレーションモードセクション）

---

## generate スキル仕様

**ファイル**: `skills/generate/SKILL.md`
**スキル参照**: `context-stocker-forge:generate`
**バージョン**: 1.1.0

### 実行モード

| モード | トリガー | 実行内容 |
|--------|---------|---------|
| 新規ウィザード | 引数なし | Step1→Step2→Step3→Step4→Step5→確認→合成→バリデーション→パッケージング |
| 再生成 | 引数あり（プラグインパス） | config読み込み→変更確認→合成→バリデーション→パッケージング |
| マイグレーション | `/forge-migrate` から呼び出し | サンプリング→差分分析→バッチ変換 |

### 入力（ウィザード収集情報）

```yaml
# .team-config.yml として保存される
format_version: 1
product_name: string        # 事業名・商材名
product_prefix: string      # 2-4文字英小文字（コマンドプレフィクス）
team_name: string           # チーム名
plugin_name: string         # 自動生成: "{product_name_lower}-context-stocker"
storage:
  type: "backlog-wiki" | "obsidian-vault"
  backlog_wiki:
    project_key: string     # 例: ZENDESK_PRJ
  obsidian_vault:
    base_path: string       # 例: zendesk
knowledge_categories:
  - name: string
    description: string
    required: boolean
    sub_categories: string[]
sales_framework: "BANTCH" | "BANT" | "MEDDIC" | string
sales_framework_fields:     # カスタム時のみ
  - key: string
    name: string
    description: string
competitors: string[]
pricing_structure: string
kpi:
  revenue_categories: string[]
data_sources:
  slack:
    enabled: boolean
    default_channels:
      - name: string
        id: string
        usage: string
  google_calendar:
    enabled: boolean
  gmail:
    enabled: boolean
  google_drive:
    enabled: boolean
    folder_id: string       # 任意
  backlog_issues:
    enabled: boolean
    projects:
      - key: string
        name: string
excluded_commands: string[] # 除外するコマンド名リスト
```

### 出力

```
{plugin_name}/
├── .claude-plugin/plugin.json
├── .team-config.yml
├── README.md
├── skills/
│   ├── {pre}-deal/SKILL.md + references/
│   ├── {pre}-admin/SKILL.md + references/
│   ├── {pre}-log/SKILL.md + references/
│   ├── {pre}-doc/SKILL.md
│   └── {pre}-knowledge/SKILL.md + references/
└── commands/
    ├── {pre}-deal-load.md
    ├── {pre}-deal-save.md
    ├── {pre}-knowledge-save.md
    ├── {pre}-knowledge-search.md
    ├── {pre}-admin.md
    ├── {pre}-doc.md
    ├── {pre}-engdoc.md
    └── {pre}-log.md

{plugin_name}.plugin  ← ZIPアーカイブ
```

---

## 生成されるプラグインのコマンド仕様

生成されるプラグインが持つ8コマンドのインターフェース定義。`{pre}` は `product_prefix` で置換。

### /{pre}-deal-load

```
/{pre}-deal-load [顧客名]
```

| 引数 | 必須 | 説明 |
|------|------|------|
| 顧客名 | No | 顧客名（省略時はINDEXを表示） |

**動作**: 指定顧客の案件コンテキストをストレージから読み込みセッションに展開
**呼び出しスキル**: `{plugin_name}:{pre}-deal`（コンテキスト復元セクション）

---

### /{pre}-deal-save

```
/{pre}-deal-save
```

**動作**: 現在セッションの案件コンテキストをストレージに保存（書き込み確認あり）
**呼び出しスキル**: `{plugin_name}:{pre}-deal`（コンテキスト保存セクション）

---

### /{pre}-knowledge-save

```
/{pre}-knowledge-save
```

**動作**: ナレッジをカテゴリ分類・重複チェック後にストレージ保存
**呼び出しスキル**: `{plugin_name}:{pre}-knowledge`（ナレッジ保存セクション）

---

### /{pre}-knowledge-search

```
/{pre}-knowledge-search [キーワード]
```

| 引数 | 必須 | 説明 |
|------|------|------|
| キーワード | Yes | 検索クエリ |

**動作**: ストレージのナレッジを検索し関連ナレッジを推薦
**呼び出しスキル**: `{plugin_name}:{pre}-knowledge`（ナレッジ検索セクション）

---

### /{pre}-admin

```
/{pre}-admin <サブコマンド>
```

| サブコマンド | 説明 | 除外フラグ |
|------------|------|----------|
| `setup` | 未設定項目の一覧とセットアップガイド | `excluded_admin_setup` |
| `index` | INDEXページ再構築 | `excluded_admin_index` |
| `slack` | Slackチャンネル設定 | `excluded_admin_slack` |
| `backlog` | Backlog監視プロジェクト設定 | `excluded_admin_backlog` |
| `competitors` | 競合情報設定 | `excluded_admin_competitors` |
| `pricing` | 料金体系設定 | `excluded_admin_pricing` |
| `members` | チームメンバー設定 | `excluded_admin_members` |
| `kpi-set` | KPI売上内訳カテゴリ設定 | `excluded_admin_kpi_set` |
| `okr-set` | OKR設定 | `excluded_admin_okr_set` |
| `stale` | 鮮度切れページ確認 | `excluded_admin_stale` |
| `migrate` | データフォーマットマイグレーション | `excluded_admin_migrate` |

**呼び出しスキル**: `{plugin_name}:{pre}-admin`

---

### /{pre}-doc

```
/{pre}-doc <サブコマンド> [顧客名]
```

| サブコマンド | 説明 | 除外フラグ |
|------------|------|----------|
| `prep` | 事前調査レポート生成 | `excluded_doc_prep` |
| `proposal` | 提案書生成 | `excluded_doc_proposal` |
| `estimate` | 見積書生成 | `excluded_doc_estimate` |

**呼び出しスキル**: `{plugin_name}:{pre}-doc`

---

### /{pre}-engdoc

```
/{pre}-engdoc <サブコマンド> [顧客名]
```

| サブコマンド | 説明 | 除外フラグ |
|------------|------|----------|
| `hearing` | ヒアリングシート生成 | `excluded_engdoc_hearing` |
| `config` | 設定確認書生成 | `excluded_engdoc_config` |
| `testcases` | テストケース生成 | `excluded_engdoc_testcases` |

**呼び出しスキル**: `{plugin_name}:{pre}-doc`

---

### /{pre}-log

```
/{pre}-log <サブコマンド>
```

| サブコマンド | 説明 | 除外フラグ |
|------------|------|----------|
| `daily` | デイリーログ記録（3-Phase並列収集） | `excluded_log_daily` |
| `weekly` | 週次レポート生成 | `excluded_log_weekly` |
| `report` | 階層型レポート集約 | `excluded_log_report` |

**呼び出しスキル**: `{plugin_name}:{pre}-log`

---

## ストレージアダプタ変数インターフェース

両アダプタが必ず定義する27変数の契約インターフェース。

| 変数名 | 説明 | backlog-wiki値例 | obsidian-vault値例 |
|-------|------|----------------|-----------------|
| `storage_name` | ストレージ名 | `Backlog Wiki` | `Obsidian Vault` |
| `storage_create_cmd` | 作成コマンド | `add_wiki` | `write_note` |
| `storage_read_cmd` | 読み込みコマンド | `get_wiki` | `read_note` |
| `storage_update_cmd` | 更新コマンド | `update_wiki` | `patch_note` |
| `storage_search_cmd` | 検索コマンド | `get_wiki_pages(keyword:...)` | `search_notes(query:...)` |
| `storage_write_cmd` | 書き込みコマンド | `add_wiki` | `write_note` |
| `storage_rename_cmd` | リネームコマンド | `update_wiki(name:...)` | `move_note` |
| `storage_list_all_pages_cmd` | 全件一覧 | `get_wiki_pages(projectId:...)` | `list_directory(path:...)` |
| `storage_session_init` | 初期化手順（Phase記述） | 3-Phase手順 | 2-Phase手順 |
| `storage_mcp_tool_table` | MCPツール一覧テーブル | backlog MCPツール表 | obsidian MCPツール表 |
| `storage_link_format_rules` | リンクフォーマット | `[[ページ名]]` | `[[ファイル名]]` |
| `storage_page_url_prefix` | ページURLプレフィクス | `https://{space}.backlog.com/wiki/{key}/` | `obsidian://open?vault=...&file=` |
| `storage_daily_log_wiki_check` | デイリーログ存在確認 | `get_wiki_pages(keyword:...)` | `read_note(path:...)` |
| ...（27変数） | | | |
