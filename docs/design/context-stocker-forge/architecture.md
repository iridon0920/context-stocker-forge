# context-stocker-forge アーキテクチャ設計（逆生成）

## 分析日時
2026-03-07（更新: 2026-03-08、v0.8.0対応）

## システム概要

### 実装されたアーキテクチャ

- **パターン**: メタプラグイン（プラグインを生成するプラグイン）
- **フレームワーク**: Claude Code プラグインシステム（skills / commands / Skill tool）
- **構成**: テンプレートエンジン + 対話型ウィザード + ストレージアダプタ抽象化

context-stocker-forge は従来のアプリケーションアーキテクチャ（MVC/Clean Architecture等）とは異なる、**テキストテンプレートベースのコード生成システム**として実装されている。ランタイムコードは存在せず、Claude Code のスキル実行エンジンが処理を担う。

### 技術スタック

#### プラグインシステム
- **実行環境**: Claude Code（claude-sonnet-4-6等のモデル）
- **コマンド定義**: Markdown ファイル（`commands/*.md`）
- **スキル定義**: Markdown ファイル（`skills/*/SKILL.md`）
- **ツール**: Skill tool（スキル呼び出し）、AskUserQuestion tool（対話）、Write/Read/Bash tool（ファイル操作）

#### テンプレートエンジン
- **記法**: Mustache 風テンプレート変数（`{{variable}}`、`{{#array}}`、`{{^condition}}`）
- **差し込み機構**: `{{storage_operations}}` によるアダプタ全文差し込み後、再帰的変数置換
- **テンプレート管理**: `templates/` ディレクトリ配下の `.template` 拡張子ファイル群

#### ストレージ抽象化
- **対応ストレージ**: Backlog Wiki（MCP: `mcp__backlog__`）/ Obsidian Vault（MCP: `mcp__obsidian__`）
- **アダプタ定義**: `storage-adapters/*.md`（27変数の変数契約インターフェース）

#### パッケージング
- **出力形式**: `.plugin`（ZIPアーカイブ）
- **パッケージング手順**: `cd {plugin_dir} && zip -r ../{plugin_name}.plugin .`

## ディレクトリ構成とレイヤー責務

```
context-stocker-forge/
├── .claude-plugin/          # プラグイン登録メタデータ
│   ├── plugin.json          # Claude Code プラグイン定義
│   └── marketplace.json     # マーケットプレイス掲載情報
│
├── commands/                # forgeコマンド（エントリーポイント層）
│   ├── generate.md          # /forge-generate コマンド
│   └── migrate.md           # /forge-migrate コマンド
│
├── skills/                  # forgeスキル（ビジネスロジック層）
│   └── generate/
│       ├── SKILL.md         # 生成ウィザード・テンプレート合成・マイグレーションの全ロジック
│       └── references/      # スキルが参照する仕様ファイル群
│           ├── config-schema.md        # .team-config.ymlスキーマ定義
│           ├── template-assembly.md    # テンプレート変数マッピング・合成手順
│           ├── wizard-steps.md         # ウィザード質問文・バリデーション
│           └── post-generation-check.md # 生成物バリデーション6項目
│
├── storage-adapters/        # ストレージアダプタ定義（インフラ層）
│   ├── backlog-wiki.md      # Backlog Wiki アダプタ（27変数契約）
│   └── obsidian-vault.md    # Obsidian Vault アダプタ（27変数契約）
│
├── templates/               # 生成プラグインのテンプレート群（データ層）
│   ├── plugin-json.template
│   ├── readme.template
│   ├── commands/            # コマンドテンプレート（admin/deal/doc/engdoc/knowledge/log）
│   ├── skills/              # スキルテンプレート（deal/admin/log/doc/knowledge）
│   ├── migrations/          # マイグレーションルール定義
│   └── forge-consistency-check-prompt.md  # 整合性チェック定義（運用ドキュメント）
│
└── docs/                    # 設計・タスク文書（ドキュメント層）
    ├── tasks/
    └── design/
```

### レイヤー責務

| レイヤー | 実装場所 | 責務 |
|---------|---------|------|
| エントリーポイント層 | `commands/` | コマンドの引数解釈・Skillツール呼び出し |
| ビジネスロジック層 | `skills/generate/SKILL.md` | ウィザード・テンプレート合成・バリデーション・パッケージング |
| 仕様参照層 | `skills/generate/references/` | スキーマ・変数マッピング・バリデーション仕様 |
| インフラ層 | `storage-adapters/` | ストレージ操作の抽象化（27変数インターフェース） |
| データ層 | `templates/` | 生成プラグインの各ファイルテンプレート |

## デザインパターン

### Templateメソッドパターン（ストレージアダプタ）

ストレージアダプタは共通インターフェース（27変数契約）を実装するTemplateメソッドパターンに相当する。`{{storage_operations}}` 差し込み後に個別変数（`{{storage_create_cmd}}`等）が統一的に置換される。

### Strategyパターン（ストレージ選択）

`storage.type` の値（`backlog-wiki` / `obsidian-vault`）に応じて異なるアダプタを選択し、同一のテンプレート変数インターフェースで操作する。

### Wizardパターン（対話型ウィザード）

5ステップ + 確認の段階的情報収集フロー。Step 1-2は必須入力、Step 3-5はデフォルト値あり（スキップ可）。AskUserQuestion ツールを活用した選択式インタラクション。

| Step | 内容 | 必須/任意 |
|------|------|----------|
| Step 1 | 基本情報（チーム名・事業名・プレフィクス） | 必須 |
| Step 2 | ストレージ選択 + 接続情報 | 必須 |
| Step 3 | 営業フレームワーク選択（BANTCH/BANT/MEDDIC/カスタム） | デフォルトあり |
| Step 4 | データソース選択（Slack/GCal/Gmail/GDrive/Backlog Issues） | デフォルトあり |
| Step 5 | ナレッジカテゴリ設定（カスタマイズ可） | デフォルトあり |
| 確認 | 全設定サマリー表示 → 生成承認 | 必須 |

### 条件付きコード生成（Feature Flags）

`excluded_commands` 配列から `excluded_*` フラグ変数を生成し、`{{^excluded_*}}` 条件ブロックでセクション単位の除外を実現する。

## MCP最適化（v0.1.0以降）

| ID | 最適化 | 実装箇所 |
|----|--------|---------|
| A | セッション初期化Phase並列化 | storage-adapters: 3-Phase(backlog) / 2-Phase(obsidian) |
| B | デイリーログPhase並列化 | templates/skills/log/SKILL.md.template |
| C | セッションキャッシュルール | templates/skills/deal/SKILL.md.template |
| D | wikiIdメタデータ in INDEX | templates/skills/deal/references/index-format.md.template |
| E | Slackバッチ検索 | templates/skills/log/SKILL.md.template |

## 非機能要件の実装状況

### 整合性保証
- **整合性チェック**: `templates/forge-consistency-check-prompt.md`（10項目、コミット前必須）
- **生成物バリデーション**: `post-generation-check.md`（6項目、パッケージング前必須）

### バージョニング
- **規約**: セマンティックバージョニング（0.x.y）
- **管理**: `.claude-plugin/plugin.json` と `.claude-plugin/marketplace.json`（常に同一バージョン）

### 拡張性
- **新ストレージアダプタ**: `storage-adapters/` に追加し27変数を全定義
- **新コマンド除外**: `excluded_commands` に追加、テンプレートに `{{^excluded_*}}` ブロック追加
- **新マイグレーション**: `templates/migrations/v{from}_to_v{to}.md` を追加
