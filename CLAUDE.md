# context-stocker-forge 開発ガイド

## プロジェクト概要

B2B事業チーム向けコンテキスト管理プラグイン（context-stocker）を対話型ウィザードで自動生成するメタプラグイン。Mustache風テンプレートエンジンで `.team-config.yml` から各チーム専用のプラグインを生成する。

## ディレクトリ構成

```
context-stocker-forge/
├── .claude-plugin/          # プラグインメタデータ（plugin.json, marketplace.json）
├── commands/                # forge自体のコマンド（generate, migrate）
├── skills/generate/         # 生成スキル本体 + リファレンス
├── storage-adapters/        # ストレージアダプタ定義（backlog-wiki, obsidian-vault）
├── templates/               # 生成プラグインのテンプレート群
│   ├── commands/            # コマンドテンプレート（admin/deal/doc/engdoc/knowledge/log）
│   ├── skills/              # スキルテンプレート（deal/admin/log/doc/knowledge）
│   ├── plugin-json.template
│   └── readme.template
├── CLAUDE.md                # ← このファイル
├── LICENSE
└── README.md
```

## 必須ルール: 整合性チェック

### テンプレートファイル変更時の必須チェック

`templates/` 配下のファイル、`storage-adapters/` 配下のファイル、または `skills/generate/references/` 配下のファイルを変更した場合、**コミット前に必ず整合性チェックを実行すること**。

#### チェック手順

`templates/forge-consistency-check-prompt.md` に定義された10項目のチェックを実行する。

#### 10項目の概要

1. **コマンド→スキル呼び出しチェーン**: 各コマンドテンプレートが参照するセクション名がスキルテンプレートに存在するか
2. **命名規則の一貫性**: `{{product_prefix}}-deal`（contextではない）が統一されているか
3. **テンプレート変数の定義↔使用**: `{{xxx}}` が config-schema / template-assembly / storage-adapters で定義されているか
4. **出力パスマッピング**: template-assembly.md のマッピング表と実ファイルが一致するか
5. **config-schema ↔ wizard-steps**: ウィザードで収集する情報とスキーマの対応
6. **plugin-json.template**: 生成されるplugin.jsonのスキル名・コマンド名が実ファイルと一致するか
7. **forge自体のcommands/ ↔ skills/**: forgeのコマンドとスキルの参照整合性
8. **判断フロー**: dealスキルの判断フローに記載されたコマンド名の存在確認
9. **詳細リファレンス**: スキル末尾のreferences一覧と実ファイルの一致
10. **ストレージアダプタ**: `{{storage_*_cmd}}` 変数が両アダプタで定義されているか

#### チェック実行の判断基準

- `templates/` 配下の `.template` ファイルを1つでも変更 → **必須**
- `storage-adapters/` を変更 → **必須**（チェック3, 10は最低限）
- `skills/generate/references/` を変更 → **必須**（チェック3, 4, 5は最低限）
- `skills/generate/SKILL.md` を変更 → **必須**（チェック7は最低限）
- `README.md` や `CLAUDE.md` のみの変更 → チェック不要
- `LICENSE` のみの変更 → チェック不要

#### 連動更新が必要なファイル群

以下のファイル群は内容が連動しており、片方を変更したらもう片方の更新漏れがないか確認すること:

| 変更元 | 連動先 | 連動内容 |
|--------|--------|----------|
| `skills/generate/references/wizard-steps.md` | `skills/generate/SKILL.md` | ウィザードのステップ数・構成 |
| `skills/generate/references/wizard-steps.md` | `commands/generate.md` | ウィザードの質問文・バリデーション・選択肢 |
| `templates/commands/**/*.template` | `README.md` | コマンド一覧・コマンド数 |
| `templates/commands/**/*.template` の参照セクション名 | `templates/skills/*/SKILL.md.template` | 各コマンドが参照するスキルのセクション名の一致 |
| `templates/skills/deal/SKILL.md.template` の判断フロー | `templates/commands/**/*.template` | コマンド名の存在 |
| `templates/skills/*/references/` | `templates/skills/*/SKILL.md.template` の詳細リファレンス | リファレンス一覧と実ファイルの一致 |

#### 検証の原則

- **推測禁止**: 「問題なさそう」「おそらくOK」での報告は禁止。ファイルを読んで事実ベースで判断する
- **全件確認**: 部分的な抽出チェックではなく、対象範囲の全件を確認する
- **差分報告**: 問題がなくても「確認した内容」を簡潔に報告する

## バージョニング規約

セマンティックバージョニング（semver）に従う。現在 `0.x.x` 系（試験段階）。

- **0.x.0（マイナー）**: テンプレート構造の変更、新機能追加、ストレージアダプタの変更
- **0.x.y（パッチ）**: テンプレートの文言修正、バグ修正、ドキュメント更新
- `plugin.json` と `marketplace.json` の `version` は常に同じ値にすること

### バージョンバンプの運用

- **コミットごとにバンプする**。変更内容に応じてマイナー/パッチを判断する
- バンプ対象ファイル: `.claude-plugin/plugin.json` と `.claude-plugin/marketplace.json` の2箇所
- バージョンバンプのコミットメッセージは `v{version}: {変更概要}` の形式にする

## テンプレート変数の管理

テンプレート変数（`{{xxx}}`）は以下で一元管理されている：

| 定義場所 | 種類 |
|---------|------|
| `skills/generate/references/config-schema.md` | `.team-config.yml` の直接フィールド |
| `skills/generate/references/template-assembly.md` | configから計算される派生値 |
| `storage-adapters/*.md` | ストレージ固有の操作コマンド |

新しいテンプレート変数を追加する場合は、必ず上記のいずれかに定義を追加すること。

## ストレージアダプタ

現在2種類のストレージアダプタをサポート：

- **backlog-wiki**: Backlog MCP経由のWikiページ管理（3-Phase初期化）
- **obsidian-vault**: Obsidian MCP経由のVaultノート管理（2-Phase初期化）

新しいアダプタを追加する場合は、既存アダプタの `{{storage_*}}` 変数を全て定義すること。

## MCP通信最適化（v0.1.0で導入）

以下の5つの最適化がテンプレートに組み込まれている。変更時は最適化が維持されることを確認すること。

| ID | 最適化 | 概要 |
|----|--------|------|
| A | セッション初期化Phase並列化 | シリアルMCP呼び出しを2-3 Phaseに集約 |
| B | デイリーログPhase並列化 | データ収集を Phase 1-3 構造に再編 |
| C | セッションキャッシュルール | キャッシュ項目・取得タイミング・無効化条件の構造化テーブル |
| D | wikiIdメタデータ in INDEX | INDEXにwikiId列を追加し検索ステップをスキップ |
| E | Slackバッチ検索 | チャンネル別検索を `(in:#ch1 OR in:#ch2)` バッチクエリに変更 |
