# ストレージスキーマ設計（逆生成）

## 分析日時
2026-03-07（更新: 2026-03-08、v0.8.0対応）

## 概要

context-stocker-forge が生成するプラグインは、Backlog Wiki または Obsidian Vault をストレージとして使用する。RDBMSではなくドキュメントストアのため、ページ/ノートの命名規則とMarkdownフォーマットがスキーマに相当する。

---

## Backlog Wiki スキーマ

### ページ階層構造

```
{PROJECT_KEY}/
├── INDEX/
│   ├── Home                          ← ホームINDEX（全体サマリー）
│   ├── 顧客・案件                    ← 案件INDEXページ
│   ├── ナレッジ                      ← ナレッジINDEX
│   ├── 活動ログ                      ← 活動ログINDEX
│   └── ...（合計6ページ）
│
├── 案件/
│   └── {顧客名}/
│       └── {案件名}                  ← 案件コンテキストページ
│
├── ナレッジ/
│   └── {カテゴリ名}/
│       └── {トピック名}              ← ナレッジページ
│
├── 活動ログ/
│   └── {YYYY-MM}/
│       └── {YYYY-MM-DD}              ← デイリーログページ
│
├── 設定/
│   ├── Slackチャンネル               ← Slack設定ページ
│   ├── Backlogプロジェクト           ← Backlog設定ページ
│   ├── 競合情報                      ← 競合情報設定ページ
│   ├── 料金体系                      ← 料金体系設定ページ
│   ├── チームメンバー                ← チームメンバー設定ページ
│   └── KPI                           ← KPI設定ページ
│
└── ガイドライン/
    └── {ドキュメント名}              ← プリセールス・導入支援文書
```

### ページ命名規則

| ページ種別 | 命名パターン | 例 |
|-----------|------------|-----|
| 案件コンテキスト | `案件/{顧客名}/{案件名}` | `案件/株式会社ACME/CRMシステム導入` |
| ナレッジ | `ナレッジ/{カテゴリ名}/{トピック名}` | `ナレッジ/製品・技術仕様/SSO連携方法` |
| デイリーログ | `活動ログ/{YYYY-MM}/{YYYY-MM-DD}` | `活動ログ/2026-03/2026-03-07` |
| 案件INDEX | `INDEX/顧客・案件` | — |
| 設定 | `設定/{設定名}` | `設定/Slackチャンネル` |

---

## Obsidian Vault スキーマ

### ディレクトリ構造

```
{base_path}/
├── HOME.md                            ← ホームINDEX
│
├── deals/
│   ├── INDEX.md                       ← 案件INDEX（wikiId列含む）
│   └── {顧客名}/
│       └── {案件名}.md               ← 案件コンテキストノート
│
├── knowledge/
│   ├── INDEX.md                       ← ナレッジINDEX
│   └── {カテゴリ名}/
│       └── {トピック名}.md           ← ナレッジノート
│
├── logs/
│   ├── INDEX.md                       ← 活動ログINDEX
│   └── {YYYY-MM}/
│       └── {YYYY-MM-DD}.md           ← デイリーログノート
│
├── settings/
│   ├── slack-channels.md             ← Slack設定
│   ├── backlog-projects.md           ← Backlog設定
│   ├── competitors.md                ← 競合情報設定
│   ├── pricing.md                    ← 料金体系設定
│   └── members.md                    ← チームメンバー設定
│
└── guidelines/
    └── {ドキュメント名}.md           ← プリセールス・導入支援文書
```

### Frontmatter スキーマ

各ノートのYAMLヘッダー定義。

```yaml
# 案件コンテキストノート
---
format_version: 1
created: "YYYY-MM-DDTHH:MM:SS"
updated: "YYYY-MM-DDTHH:MM:SS"
tags:
  - context
  - {product_prefix}
customer: "{顧客名}"
deal: "{案件名}"
status: "商談中" | "提案済" | "成約" | "失注" | "保留"
---

# ナレッジノート
---
format_version: 1
created: "YYYY-MM-DDTHH:MM:SS"
updated: "YYYY-MM-DDTHH:MM:SS"
tags:
  - knowledge
  - {product_prefix}
category: "{カテゴリ名}"
---

# デイリーログノート
---
format_version: 1
date: "YYYY-MM-DD"
created: "YYYY-MM-DDTHH:MM:SS"
updated: "YYYY-MM-DDTHH:MM:SS"
tags:
  - log
  - {product_prefix}
---
```

---

## ページフォーマット仕様（全ストレージ共通）

### 案件コンテキストページ（context-format）

```markdown
# {案件名}

## 基本情報
- **顧客名**: {顧客名}
- **案件名**: {案件名}
- **ステータス**: {ステータス}
- **担当者**: {担当者名}
- **最終更新**: {YYYY-MM-DD}

## 営業フレームワーク（BANTCH）

### Budget（予算）
予算規模・予算確保状況

（記入欄）

### Authority（決裁者）
意思決定者・決裁ルート

（記入欄）

### Need（ニーズ）
...（各フレームワークフィールド）

## 活動履歴

| 日付 | 内容 | 次のアクション |
|------|------|--------------|
| YYYY-MM-DD | {内容} | {次のアクション} |
```

### 案件INDEXページ（index-format、最適化D）

```markdown
# 案件INDEX

## 商談中

| 顧客名 | 案件名 | ステータス | 担当者 | 最終更新 | wikiId |
|-------|-------|-----------|--------|---------|--------|
| {顧客名} | {案件名} | 商談中 | {担当者} | YYYY-MM-DD | {wikiId} |

## 提案済

...

## 成約
...
```

### デイリーログページ（daily-log-format）

```markdown
# 活動ログ YYYY-MM-DD

## サマリー
{本日の活動サマリー}

## Slack
{重点チャンネルの本日の重要メッセージ}

## 商談活動
{本日の商談・打ち合わせ}

## Backlog課題
{本日対応した課題}

## 翌日のアクション
{明日のTODO}
```

### 週次レポートページ（weekly-report-format）

```markdown
# 週次レポート YYYY-MM-DD〜YYYY-MM-DD

## エグゼクティブサマリー
{重要度:高の項目のみ}

## 商談進捗
{週間の商談活動サマリー}

## KPI進捗
{週間のKPI実績}

## 来週の重点アクション
{優先度順のTODO}
```

---

## INDEXページの集計定義

INDEXは以下6ページで構成（`{{index_count}}` = 6）:

| INDEXページ | 集計対象 | 更新タイミング |
|------------|---------|--------------|
| Home | 全体サマリー（案件数・ナレッジ数・直近ログ） | deal-save / knowledge-save / log-daily 後 |
| 顧客・案件 | 全案件リスト（ステータス別） | deal-save 後 |
| ナレッジ | 全ナレッジリスト（カテゴリ別） | knowledge-save 後 |
| 活動ログ | 全ログリスト（月別） | log-daily 後 |
| KPI | KPI実績（月次/週次） | log-report 後 |
| OKR | OKR進捗 | okr-set 後 |

---

## 設定ページのフォーマット

### Slackチャンネル設定（slack-channels-format）

```markdown
# Slackチャンネル設定

| チャンネル名 | チャンネルID | 用途 |
|------------|------------|------|
| #{channel_name} | {channel_id} | {usage} |
```

### チームメンバー設定（team-members-format）

```markdown
# チームメンバー設定

| 氏名 | 役割 | Slack ID | 備考 |
|------|------|---------|------|
| {name} | {role} | @{slack_id} | {note} |
```

### KPI設定（kpi-format）

```markdown
# KPI設定

## 売上内訳カテゴリ

| カテゴリ名 | 説明 |
|-----------|------|
| {category} | {description} |

## KPI実績

| 指標 | 今月目標 | 今月実績 | 達成率 |
|------|---------|---------|--------|
| 売上合計 | {target} | {actual} | {rate}% |
| └ {カテゴリ別} | ... | ... | ... |
| 新規商談数 | ... | ... | ... |
| 成約数 | ... | ... | ... |
```

---

## format_version 管理

各ページ・ノートは `format_version` フィールドを持ち、マイグレーション時の変換対象判定に使用する。

| version | 状態 | 備考 |
|---------|------|------|
| 1 | 現在の最新バージョン | 初期リリース時のフォーマット |
| 2以降 | 未定義 | `templates/migrations/v1_to_v2.md` が作成された時点で有効 |
