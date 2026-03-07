# context-stocker-forge 整合性チェックプロンプト

## 目的

context-stocker-forge（コンテキスト管理プラグインを生成するメタプラグイン）の全体的な整合性を検証する。命名規則、ロジックの流れ、コマンドからスキルへの呼び出しチェーン、テンプレート変数の定義・使用の一貫性を網羅的にチェックする。

## 背景

複数セッションにわたる改善作業で以下の変更が行われた：
- `{{product_prefix}}-context` → `{{product_prefix}}-deal` への命名規則変更（テンプレート全体）
- フォーマットマイグレーションセクションの追加（dealスキルテンプレート）
- 外部データソース取得時のフィルタリング方針の追加
- KPIフォーマットのテンプレート変数化（ハードコード → `{{#kpi_revenue_categories}}`ループ展開）
- その他13項目の改善

過去に「全項目OK」と報告した後にスクリーンショット検査で問題が発覚した経緯がある。今回は**実ファイルを直接読んで**検証すること。

## プラグイン構成

```
context-stocker-forge/
├── .claude-plugin/plugin.json          # forgeプラグイン自体のメタデータ
├── README.md
├── commands/
│   ├── generate.md                     # /forge-generate コマンド
│   └── migrate.md                      # /forge-migrate コマンド
├── skills/
│   └── generate/
│       ├── SKILL.md                    # 生成スキル本体
│       └── references/
│           ├── config-schema.md        # .team-config.yml のスキーマ定義
│           ├── template-assembly.md    # テンプレート合成手順
│           └── wizard-steps.md         # ウィザードのステップ定義
├── storage-adapters/
│   ├── backlog-wiki.md                 # Backlog Wiki用ストレージ操作
│   └── obsidian-vault.md              # Obsidian Vault用ストレージ操作
├── product-configs/
│   └── zendesk-example.yml            # サンプル設定ファイル
└── templates/                          # ★生成プラグインのテンプレート群
    ├── plugin-json.template
    ├── readme.template
    ├── skills/
    │   ├── deal/                       # → 生成時 skills/{pre}-deal/ になる
    │   │   ├── SKILL.md.template       # dealスキル（コンテキスト保存・復元・INDEX管理）
    │   │   └── references/
    │   │       ├── context-format.md.template
    │   │       ├── index-format.md.template
    │   │       └── similarity-check.md.template
    │   ├── admin/                      # → 生成時 skills/{pre}-admin/ になる
    │   │   ├── SKILL.md.template       # adminスキル（設定管理・セットアップ・鮮度・マイグレーション）
    │   │   └── references/
    │   │       ├── slack-channels-format.md.template
    │   │       ├── backlog-projects-format.md.template
    │   │       ├── competitors-format.md.template
    │   │       ├── pricing-format.md.template
    │   │       ├── team-members-format.md.template
    │   │       ├── kpi-format.md.template
    │   │       ├── okr-format.md.template
    │   │       └── index-format.md.template
    │   ├── log/                        # → 生成時 skills/{pre}-log/ になる
    │   │   ├── SKILL.md.template       # logスキル（日次・週次・活動レポート）
    │   │   └── references/
    │   │       ├── daily-log-format.md.template
    │   │       └── weekly-report-format.md.template
    │   ├── doc/                        # → 生成時 skills/{pre}-doc/ になる
    │   │   └── SKILL.md.template       # docスキル（ガイドライン参照によるドキュメント生成）
    │   └── knowledge/                  # → 生成時 skills/{pre}-knowledge/ になる
    │       ├── SKILL.md.template
    │       └── references/
    │           └── knowledge-format.md.template
    └── commands/                       # → 生成時 commands/{pre}-{group}.md or commands/{pre}-{group}-{action}.md になる
        ├── admin.md.template          # 統合コマンド（11サブコマンド: setup/index/slack/backlog/competitors/pricing/members/kpi-set/okr-set/stale/migrate）
        ├── doc.md.template            # 統合コマンド（3サブコマンド: prep/proposal/estimate）
        ├── engdoc.md.template         # 統合コマンド（3サブコマンド: hearing/config/testcases）
        ├── log.md.template            # 統合コマンド（3サブコマンド: daily/weekly/report）
        ├── deal/   (2コマンド: load, save)
        └── knowledge/ (2コマンド: save, search)
```

## チェック項目

### チェック1: コマンド→スキルセクション呼び出しチェーン

各コマンドテンプレートは `「{セクション名}」セクションの手順に従って実行` という形式で対応スキル内のセクションを参照する。
**参照先のセクションが対応スキルテンプレート内に実際に存在するか**を確認する。

| コマンド（ファイル） | 呼び出すスキル | 参照セクション名 |
|---------|-------------|---------------|
| admin.md（backlogサブコマンド） | admin | Backlogプロジェクト設定管理 |
| admin.md（competitorsサブコマンド） | admin | 競合情報設定管理 |
| admin.md（indexサブコマンド） | admin | INDEX再構築 |
| admin.md（kpi-setサブコマンド） | admin | 参照ファイル kpi-format.md |
| admin.md（membersサブコマンド） | admin | チームメンバー設定管理 |
| admin.md（migrateサブコマンド） | admin | フォーマットマイグレーション |
| admin.md（okr-setサブコマンド） | admin | 参照ファイル okr-format.md |
| admin.md（pricingサブコマンド） | admin | 料金体系設定管理 |
| admin.md（setupサブコマンド） | admin | セットアップ確認 |
| admin.md（slackサブコマンド） | admin | Slackチャンネル設定の読み取り |
| admin.md（staleサブコマンド） | admin | 鮮度管理 |
| deal/load.md | deal | コンテキスト復元 |
| deal/save.md | deal | コンテキスト保存 |
| doc.md（全種別共通） | doc | ガイドライン参照による業務ドキュメント生成 |
| engdoc.md（全種別共通） | doc | ガイドライン参照による業務ドキュメント生成 |
| knowledge/save.md | knowledge | ナレッジ保存 |
| knowledge/search.md | knowledge | ナレッジ検索 |
| log.md（dailyサブコマンド） | log | 日次活動ログ |
| log.md（reportサブコマンド） | log | 活動レポート生成 |
| log.md（weeklyサブコマンド） | log | 週次レポート生成 |

**検証方法**: 各コマンドの参照セクション名が、対応スキルテンプレート内の `## {セクション名}` として存在するか grep で確認。完全一致しなくても意味的に対応するセクションがあればOKだが、差分は報告すること。

doc系コマンド（config, estimate, hearing, prep, proposal）の参照先セクション名は、dealスキル内に個別セクションとして存在するか、あるいは「ガイドライン参照による業務ドキュメント生成」セクションで包括的にカバーされているか確認する。

### チェック2: 命名規則の一貫性

以下の命名パターンがテンプレート全体で統一されているか確認する：

1. **スキル名**: `{{product_prefix}}-deal`, `{{product_prefix}}-admin`, `{{product_prefix}}-log`, `{{product_prefix}}-doc`, `{{product_prefix}}-knowledge`（contextではない）
2. **コマンド参照**: 各コマンドが対応するスキルを参照していること（admin→admin, log→log, doc/engdoc→doc, deal→deal, knowledge→knowledge）
3. **knowledgeスキル参照**: `{{plugin_name}}:{{product_prefix}}-knowledge`
4. **コマンド名パターン**: `{{product_prefix}}-{group}-{action}`（deal/knowledge） or `{{product_prefix}}-{group} {subcommand}`（admin/doc/engdoc/log）

**検証方法**: 全テンプレートファイルを対象に以下を検索：
- `{{product_prefix}}-context` → 0件であること
- `コンテキスト` という文字列 → ストレージの「コンテキスト/」パス名やUIテキストとしての使用は正当。それ以外の文脈でスキル名として使われていないこと

### チェック3: テンプレート変数の定義と使用の対応

`templates/` 配下で使用されている全テンプレート変数 `{{xxx}}` が、以下のいずれかで定義されているか確認する：

- `config-schema.md` に `.team-config.yml` のフィールドとして定義
- `template-assembly.md` に派生値として定義（108-113行）
- `storage-adapters/*.md` でストレージアダプタから注入される変数
- ループ内変数（`{{#array}} ... {{variable}} ... {{/array}}`）

特に注意すべき変数：
- `{{storage_*}}` 系変数（storage_read_cmd, storage_write_cmd, storage_search_cmd, storage_create_cmd, storage_update_cmd, storage_rename_cmd, storage_name, storage_description, storage_mcp_tool_table, storage_session_init, storage_setup_procedure, storage_save_context_procedure, storage_index_rebuild_procedure, storage_index_update_procedure, storage_get_updated_date_cmd, storage_daily_log_wiki_check）
  → これらがストレージアダプタ内で定義（またはプレースホルダとして存在）しているか
- `{{drive_folder_id}}` → config-schema.mdで定義されているか

### チェック4: template-assembly.mdの出力パスマッピング

`template-assembly.md` のファイル名マッピング表（130-137行）に記載された全テンプレートパスが、実際のテンプレートファイルとして存在するか確認。逆に、存在するテンプレートファイルがマッピング表に含まれているかも確認。

### チェック5: config-schema.mdとwizard-steps.mdの対応

ウィザードで収集する全情報が、config-schemaのフィールドとして定義されているか。逆に、config-schemaのフィールドがウィザードで適切に収集されるか。

### チェック6: plugin-json.templateの整合性

生成されるplugin.jsonに含まれるスキル名・コマンド名が、実際に生成されるファイルと一致するか。

### チェック7: forge自体のcommands/とskills/の整合性

- `commands/generate.md` が呼ぶスキル `context-stocker-forge:generate` は `skills/generate/SKILL.md` に対応するか
- `commands/migrate.md` が呼ぶスキル `context-stocker-forge:generate` の「フォーマットマイグレーション」セクションは実際に存在するか
- `commands/migrate.md` が参照する `templates/migrations/` ディレクトリが存在するか（generate/SKILL.md内で言及）

### チェック8: セッション中の判断フロー

dealスキルテンプレートの「セッション中の判断フロー」セクションに記載されたコマンド名が、コマンドテンプレートとして実際に存在するか。

### チェック9: 詳細リファレンスの整合性

各スキルテンプレート（deal, admin, log, doc, knowledge）末尾の「詳細リファレンス」セクションに記載された `references/*.md` ファイルが、対応するテンプレートディレクトリに実際に存在するか。全5スキルについて確認する。

### チェック10: ストレージアダプタの操作コマンド対応

全スキルテンプレート（deal, admin, log, doc）で使われる `{{storage_*_cmd}}` 系変数が、両方のストレージアダプタ（backlog-wiki.md, obsidian-vault.md）で適切に定義されているか。

## 検証の進め方

1. 各チェック項目について、**実ファイルを Read ツールや grep で直接読んで**確認する
2. 問題なければ ✅、問題あれば ❌ と具体的な差分を報告
3. 全チェック完了後、問題の一覧と修正案をまとめる

## 注意

- 「問題なさそう」「おそらくOK」のような推測での報告は禁止。必ずファイルを読んで事実ベースで判断すること
- doc.md（プリセールス: prep, proposal, estimate）とengdoc.md（導入支援: hearing, config, testcases）は「ガイドライン参照による業務ドキュメント生成」で包括されている。コマンドテンプレートの記述と実際のスキルセクション名が一致するか確認
- テンプレート変数が使われる文脈も重要。例えば `{{storage_rename_cmd}}` がスキル内で使われているなら、ストレージアダプタがリネーム操作をサポートしているか確認
