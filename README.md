# context-stocker-forge

B2B事業チーム向けコンテキスト管理プラグイン（context-stocker）を対話型ウィザードで生成するメタプラグイン。

## 概要

事業チームで共通に必要となる「案件管理・ナレッジ管理・活動ログ・レポート生成」の仕組みを、対話型ウィザードでカスタマイズして生成する。商材名・チーム名・ストレージ種別などをヒアリングし、チーム専用の context-stocker プラグインを自動生成する。

SaaS商材チーム、技術コンサルティング、プロフェッショナルサービスなど、B2Bの案件推進・プリセールスを行うチーム全般に対応。

## コンポーネント

### Skills
- `generate` — 対話型ウィザード。商材情報をヒアリングし、`.team-config.yml` + プラグインを生成

### Commands
- `/forge-generate [config-path]` — 新規生成 or 既存設定からの再生成
- `/forge-migrate [plugin-path]` — 生成済みプラグインのフォーマットマイグレーション

## 使い方

### 新規生成
```
/forge-generate
```
ウィザードが起動し、2ステップ + 確認で生成:
1. 基本情報（チーム名・事業名・コマンドプレフィクス）
2. ストレージ選択（Backlog Wiki / Obsidian Vault + 接続情報）
3. デフォルト設定の確認 → 生成実行

ナレッジカテゴリ、営業フレームワーク、データソース等はデフォルト値で生成され、生成後に `/{pre}-admin setup` で未設定項目の確認・各adminサブコマンドで個別設定が可能。

### 再生成（設定変更後）
```
/forge-generate path/to/.team-config.yml
```

### フォーマットマイグレーション
```
/forge-migrate path/to/plugin
```

## 生成されるプラグイン

`{product}-context-stocker` という名前のプラグインが生成される。

### 生成プラグインのコマンド（8種）

| コマンド | 説明 |
|---------|------|
| `{pre}-deal-load [顧客名]` | 案件コンテキストの復元 |
| `{pre}-deal-save` | 案件コンテキストの保存 |
| `{pre}-knowledge-save` | ナレッジの保存 |
| `{pre}-knowledge-search [キーワード]` | ナレッジの検索 |
| `{pre}-admin <サブコマンド>` | 管理（setup / slack / competitors / pricing / members / kpi-set / okr-set / index / backlog / stale / migrate） |
| `{pre}-doc <種別> [顧客名]` | プリセールス文書（prep / proposal / estimate） |
| `{pre}-engdoc <種別> [顧客名]` | 導入支援文書（hearing / config / testcases） |
| `{pre}-log <サブコマンド>` | 活動ログ（daily / report） |

### セットアップ後の初期設定

生成直後はデフォルト値で動作する。`/{pre}-admin setup` を実行すると未設定項目の一覧と設定コマンドが表示される。各コマンドを使用した際にも、関連する未設定項目があれば設定を案内する。

## ストレージ対応

- Backlog Wiki（MCP: backlog）
- Obsidian Vault（MCP: obsidian）
