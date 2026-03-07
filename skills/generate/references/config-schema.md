# .team-config.yml スキーマ定義

ウィザードで生成される設定ファイルの完全スキーマ。

## トップレベル

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `format_version` | integer | Yes | 設定ファイルのバージョン（現在: 1） |
| `product_name` | string | Yes | 事業名（商材・サービス名） |
| `product_prefix` | string | Yes | コマンドプレフィクス（2-4文字英小文字） |
| `team_name` | string | Yes | チーム名 |
| `plugin_name` | string | Yes | 生成プラグイン名（自動: `{product}-context-stocker`） |
| `storage` | object | Yes | ストレージ設定 |
| `knowledge_categories` | array | Yes | ナレッジカテゴリ定義 |
| `sales_framework` | string | Yes | 営業フレームワーク名 |
| `sales_framework_fields` | array | No | カスタムフレームワーク時のフィールド定義 |
| `competitors` | array | No | 主な競合サービス（設定ページのデフォルト値として使用） |
| `pricing_structure` | string | No | 料金体系の説明（設定ページのデフォルト値として使用） |
| `kpi` | object | No | KPI設定 |
| `data_sources` | object | Yes | 外部データソース設定 |
| `excluded_commands` | array | No | 除外するコマンド名リスト |

## storage

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `type` | string | Yes | `backlog-wiki` or `obsidian-vault` |
| `backlog_wiki` | object | type=backlog-wiki時 | Backlog Wiki設定 |
| `obsidian_vault` | object | type=obsidian-vault時 | Obsidian Vault設定 |

### storage.backlog_wiki

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `project_key` | string | Yes | Backlogプロジェクトキー（例: ZENDESK_PRJ）。入力値をそのまま使用 |

### storage.obsidian_vault

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `base_path` | string | Yes | Vault内のベースパス（例: zendesk） |

## knowledge_categories[]

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `name` | string | Yes | カテゴリ名（例: 製品・技術仕様） |
| `description` | string | Yes | カテゴリ説明 |
| `required` | boolean | No | 必須カテゴリフラグ（true=削除不可、デフォルト: false） |
| `sub_categories` | array[string] | No | サブカテゴリ（主に製品カテゴリで使用） |

### デフォルトカテゴリ

```yaml
knowledge_categories:
  - name: 製品・技術仕様
    description: "{product_name}各製品の機能・仕様・技術的なTips"
    required: true
    sub_categories: []  # ウィザードで入力
  - name: 業務フロー・ガイドライン
    description: "構築・移行・運用等の手順やベストプラクティス"
    required: true
```

※ 必要に応じて追加カテゴリ（パートナーナレッジ、施策等）はストレージのディレクトリ追加で対応可能。

## sales_framework_fields[]（カスタム時のみ）

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `key` | string | Yes | フィールドキー（英字） |
| `name` | string | Yes | 表示名 |
| `description` | string | Yes | 説明・記入ガイド |

### 組み込みフレームワーク定義

**BANTCH:**
```yaml
sales_framework_fields:
  - key: budget
    name: Budget（予算）
    description: 予算規模・予算確保状況
  - key: authority
    name: Authority（決裁者）
    description: 意思決定者・決裁ルート
  - key: need
    name: Need（ニーズ）
    description: 導入理由・課題・期待効果
  - key: timeline
    name: Timeline（導入時期）
    description: 希望導入時期・マイルストーン
  - key: competitor
    name: Competitor（競合）
    description: 比較検討中の競合サービス
  - key: human_resources
    name: Human Resources（体制）
    description: 顧客側の推進体制・キーマン
```

**BANT:**
BANTCH から competitor, human_resources を除いた4項目。

**MEDDIC:**
```yaml
sales_framework_fields:
  - key: metrics
    name: Metrics（指標）
    description: 導入効果を測る定量的指標
  - key: economic_buyer
    name: Economic Buyer（予算決裁者）
    description: 最終的な予算承認者
  - key: decision_criteria
    name: Decision Criteria（決定基準）
    description: 選定時の評価基準
  - key: decision_process
    name: Decision Process（決定プロセス）
    description: 意思決定の流れ・関係者
  - key: identify_pain
    name: Identify Pain（課題特定）
    description: 顧客の具体的な課題
  - key: champion
    name: Champion（推進者）
    description: 社内で推進してくれるキーパーソン
```

## kpi

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `revenue_categories` | array[string] | Yes | 売上内訳カテゴリ名のリスト |

### デフォルト値

```yaml
kpi:
  revenue_categories: []  # 未設定。/{prefix}-admin kpi-set で設定
```

※ 売上内訳カテゴリは事業の収益構造に依存するため、デフォルトでは未設定。生成後に `/{prefix}-admin kpi-set` で設定する（例: 「プロダクト, サービス」「ライセンス, プロサービス」「コンサル, 運用保守」等）。未設定の場合、KPIテーブルは売上合計のみで内訳行なしで動作する。

### デフォルトKPI指標（固定、設定不要）

以下のKPI指標はテンプレートに組み込み済みで、設定ファイルでのカスタマイズは不要:

| 指標名 | 種別 | 備考 |
|--------|------|------|
| 売上合計 | 金額 | revenue_categoriesの合計 |
| └ {カテゴリ別} | 金額 | revenue_categoriesの各項目 |
| 新規商談数 | 件数 | |
| 成約数 | 件数 | |
| 失注数 | 件数 | |
| 成約率 | 計算値 | 成約数 / (成約数 + 失注数) |
| 粗利率（加重平均） | 比率 | Σ(カテゴリ売上 × カテゴリ粗利率) / 売上合計 |
| └ {カテゴリ別} 粗利率 | 比率 | revenue_categoriesの各項目ごと |

## data_sources

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `slack` | object | No | Slack設定 |
| `google_calendar` | object | No | Google Calendar設定 |
| `gmail` | object | No | Gmail設定 |
| `google_drive` | object | No | Google Drive設定 |
| `backlog_issues` | object | No | Backlog Issues設定 |

### data_sources.slack

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `enabled` | boolean | Yes | 有効/無効 |
| `default_channels` | array | No | 重点チャンネルリスト |

#### Slack未設定時の動作

`slack.enabled: true` かつ `default_channels` が空配列または未設定の場合:
- Slack参照が必要なコマンド実行時にエラーメッセージを表示:
  ```
  ⚠️ Slackの重点チャンネルが未設定です。
  `/{product_prefix}-admin slack` コマンドで設定してください。
  ```
- エラー後もコマンドは続行可能（Slack以外のデータソースは通常通り参照）

### data_sources.slack.default_channels[]

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `name` | string | Yes | チャンネル名 |
| `id` | string | Yes | チャンネルID |
| `usage` | string | Yes | 用途説明 |

### data_sources.backlog_issues

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `enabled` | boolean | Yes | 有効/無効 |
| `projects` | array | No | 監視プロジェクトリスト |

### data_sources.backlog_issues.projects[]

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `key` | string | Yes | プロジェクトキー |
| `name` | string | Yes | プロジェクト名 |

### その他のdata_sources（google_calendar, gmail, google_drive）

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `enabled` | boolean | Yes | 有効/無効 |

## excluded_commands

除外するコマンド名の配列。グループ-操作の形式で指定。

```yaml
excluded_commands:
  - "doc-estimate"
  - "doc-testcases"
  - "admin-backlog"
```

利用可能な値:
- deal-load, deal-save
- knowledge-save, knowledge-search
- log-daily, log-report
- admin-index, admin-setup, admin-slack, admin-backlog, admin-stale, admin-migrate, admin-kpi-set, admin-okr-set, admin-competitors, admin-pricing, admin-members
- doc-prep, doc-proposal, doc-estimate
- engdoc-hearing, engdoc-config, engdoc-testcases

統合コマンド（admin, doc, engdoc, log）ではファイル単位ではなくセクション単位で除外される。`excluded_commands` の値から `excluded_{name}` フラグ変数を生成し（ハイフンはアンダースコアに変換）、テンプレート内の `{{^excluded_*}}` 条件ブロックで評価する。
