# context-stocker-forge 受け入れ基準（逆生成）

## 分析日時
2026-03-08（更新: 2026-03-08、v0.8.0対応）

---

## 受け入れ基準一覧

各機能の受け入れ基準と実装状況（テスト手順書の有無）を示す。

---

## AC-001: プラグイン新規生成（US-001）

### 基準

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | `/forge-generate`（引数なし）でウィザードが起動する | TC-001-wizard-flow.md | 手順書あり |
| 2 | チーム名・事業名・プレフィクスをStep 1で入力できる | TC-001-wizard-flow.md | 手順書あり |
| 3 | ストレージ種別と接続情報をStep 2で選択できる | TC-001-wizard-flow.md | 手順書あり |
| 4 | 営業フレームワークをStep 3で選択できる（デフォルト: BANTCH） | TC-056-wizard-step3-5.md | 手順書あり |
| 5 | データソースをStep 4で選択できる（デフォルト: Slack/GCal/Gmail/GDrive有効） | TC-056-wizard-step3-5.md | 手順書あり |
| 6 | ナレッジカテゴリをStep 5で設定できる（デフォルト: 2カテゴリ） | TC-056-wizard-step3-5.md | 手順書あり |
| 7 | 確認ステップで全設定サマリーを表示し承認できる | TC-001-wizard-flow.md | 手順書あり |
| 5 | 承認後に `{plugin_name}-context-stocker/` ディレクトリが生成される | TC-001-wizard-flow.md | 手順書あり |
| 6 | 生成されたファイルに `{{...}}` が残存しない | TC-010-template-variable-resolution.md | 手順書あり |
| 7 | `{plugin_name}.plugin` ZIPアーカイブが生成される | TC-036-packaging-structure.md | 手順書あり |

### プレフィクスバリデーション基準

| # | 受け入れ基準 | 入力値 | 期待動作 |
|---|------------|--------|---------|
| 1 | 1文字プレフィクスはエラー | `a` | エラーメッセージ + 再入力 |
| 2 | 5文字以上プレフィクスはエラー | `abcde` | エラーメッセージ + 再入力 |
| 3 | 大文字含むプレフィクスはエラー | `TP` | エラーメッセージ + 再入力 |
| 4 | 2-4文字英小文字は受け入れ | `tp` | 次のステップへ |
| 5 | 事業名からの自動提案が表示される | - | デフォルト値として提案 |

---

## AC-002: 再生成モード（US-002）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | `/forge-generate {config_path}` で既存設定を読み込んで起動 | TC-001-wizard-flow.md | 手順書あり |
| 2 | 現在の設定一覧が表示される | TC-001-wizard-flow.md | 手順書あり |
| 3 | 変更なしで再生成すると初回と同一の出力になる | TC-001-wizard-flow.md | 手順書あり |
| 4 | プレフィクス変更時、全コマンド/スキルファイルが新プレフィクスで更新される | TC-001-wizard-flow.md | 手順書あり |
| 5 | 更新後の設定が `.team-config.yml` に保存される | TC-001-wizard-flow.md | 手順書あり |

---

## AC-003: Backlog Wiki ストレージ生成（US-003）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | Step 2 で「Backlog Wiki」を選択できる | TC-001-wizard-flow.md | 手順書あり |
| 2 | プロジェクトキーのバリデーション（小文字→エラー） | TC-001-wizard-flow.md | 手順書あり |
| 3 | 生成スキルに `add_wiki`, `get_wiki` が含まれる | TC-010-template-variable-resolution.md | 手順書あり |
| 4 | セッション初期化が 3-Phase 構造（Phase1: get_project, Phase2-3: 並列） | TC-042-storage-adapter-init.md | 手順書あり |
| 5 | wikiId 列が INDEX に含まれる | TC-042-storage-adapter-init.md | 手順書あり |
| 6 | Obsidian固有変数（`write_note`）が残存しない | TC-010-template-variable-resolution.md | 手順書あり |
| 7 | backlog-wiki の 27変数が全て定義されている | TC-044-storage-adapter-variables.md | 手順書あり |

---

## AC-004: Obsidian Vault ストレージ生成（US-004）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | Step 2 で「Obsidian Vault」を選択できる | TC-001-wizard-flow.md | 手順書あり |
| 2 | ベースパスを入力できる | TC-001-wizard-flow.md | 手順書あり |
| 3 | 生成スキルに `write_note`, `read_note` が含まれる | TC-010-template-variable-resolution.md | 手順書あり |
| 4 | セッション初期化が 2-Phase 構造（Phase1: list_directory, Phase2: 並列） | TC-042-storage-adapter-init.md | 手順書あり |
| 5 | Backlog固有変数（`add_wiki`）が残存しない | TC-010-template-variable-resolution.md | 手順書あり |
| 6 | obsidian-vault の 27変数が全て定義されている | TC-044-storage-adapter-variables.md | 手順書あり |

---

## AC-005: コマンド除外（US-005）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | `deal-load` → `{pre}-deal-load.md` が生成されない | TC-019-excluded-commands.md | 手順書あり |
| 2 | `deal-save` → `{pre}-deal-save.md` が生成されない | TC-019-excluded-commands.md | 手順書あり |
| 3 | `knowledge-save` → `{pre}-knowledge-save.md` が生成されない | TC-019-excluded-commands.md | 手順書あり |
| 4 | `knowledge-search` → `{pre}-knowledge-search.md` が生成されない | TC-019-excluded-commands.md | 手順書あり |
| 5 | `admin-backlog` → `{pre}-admin.md` の backlog セクションが非表示 | TC-019-excluded-commands.md | 手順書あり |
| 6 | `admin-members` → admin + admin/SKILL.md + daily-log-format.md の 3ファイル連動 | TC-019-excluded-commands.md | 手順書あり |
| 7 | セクション除外時もファイル自体は生成される（統合コマンドファイル） | TC-019-excluded-commands.md | 手順書あり |

### 全24コマンド除外マッピング

| コマンド | 除外方式 |
|---------|---------|
| `deal-load`, `deal-save` | ファイル単位 |
| `knowledge-save`, `knowledge-search` | ファイル単位 |
| `log-daily`, `log-weekly`, `log-report` | セクション単位（tp-log.md） |
| `admin-setup` 〜 `admin-migrate`（11種） | セクション単位（tp-admin.md） |
| `doc-prep`, `doc-proposal`, `doc-estimate` | セクション単位（tp-doc.md） |
| `engdoc-hearing`, `engdoc-config`, `engdoc-testcases` | セクション単位（tp-engdoc.md） |

---

## AC-006: 生成物バリデーション（US-006）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | 生成後に6項目チェックが自動実行される | TC-029-post-generation-validation.md | 手順書あり |
| 2 | チェック1: 未解決変数1件以上→NG、0件→PASS | TC-029-post-generation-validation.md | 手順書あり |
| 3 | チェック2: 別商材名混入→NG | TC-029-post-generation-validation.md | 手順書あり |
| 4 | チェック3: プレフィクス不一致→NG | TC-029-post-generation-validation.md | 手順書あり |
| 5 | チェック4: スキル参照不整合→NG | TC-029-post-generation-validation.md | 手順書あり |
| 6 | チェック5: ストレージ設定不整合→NG | TC-029-post-generation-validation.md | 手順書あり |
| 7 | チェック6: 必須ファイル欠損→NG | TC-029-post-generation-validation.md | 手順書あり |
| 8 | いずれかがNGの場合、`.plugin` ファイルが生成されない | TC-029-post-generation-validation.md | 手順書あり |
| 9 | 全PASS時のみ `.plugin` ファイルが生成される | TC-029-post-generation-validation.md | 手順書あり |
| 10 | 結果は統一フォーマットで表示される | TC-029-post-generation-validation.md | 手順書あり |

---

## AC-007: パッケージング構造（関連: US-001、US-006）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | `.plugin` ファイルがZIPアーカイブ形式 | TC-036-packaging-structure.md | 手順書あり |
| 2 | ZIPルート直下に `.claude-plugin/plugin.json` が存在する（ラッパーなし） | TC-036-packaging-structure.md | 手順書あり |
| 3 | `testproduct-context-stocker/` 等のラッパーディレクトリが含まれない | TC-036-packaging-structure.md | 手順書あり |
| 4 | `plugin.json` に `name`/`version`/`description`/`author`/`keywords` のみ含まれる | TC-036-packaging-structure.md | 手順書あり |
| 5 | `plugin.json` に `skills`/`commands`/`storage_type` 等が含まれない | TC-036-packaging-structure.md | 手順書あり |

---

## AC-008: マイグレーション（US-007）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | `/forge-migrate {path}` でマイグレーションモードが起動する | TC-036-packaging-structure.md | 手順書あり |
| 2 | `format_version: 1`（最新）は「不要」と判定されて終了する | TC-050-metadata-errors.md | 手順書あり |
| 3 | 処理対象（全件/カテゴリ別/N件）を選択できる | TC-036-packaging-structure.md | 手順書あり |
| 4 | 結果レポートに成功/失敗/スキップ件数が含まれる | TC-036-packaging-structure.md | 手順書あり |
| 5 | 失敗件数が1以上の場合、該当ページ名とエラー内容が列挙される | TC-036-packaging-structure.md | 手順書あり |

---

## AC-009: 整合性チェック（US-008）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | チェック1: 各コマンドの参照セクション名がスキルテンプレートに存在する | TC-046-consistency-check.md | 手順書あり |
| 2 | チェック2: `{{product_prefix}}-context` ではなく `-deal` が使われている | TC-046-consistency-check.md | 手順書あり |
| 3 | チェック3: テンプレートの全変数に定義元がある | TC-046-consistency-check.md | 手順書あり |
| 4 | チェック4: `template-assembly.md` のマッピング表と実ファイルが一致する | TC-046-consistency-check.md | 手順書あり |
| 5 | チェック5: `wizard-steps.md` がconfigの必須フィールドを全てカバーする | TC-046-consistency-check.md | 手順書あり |
| 6 | チェック10: 両アダプタで27変数が全て定義されている | TC-046-consistency-check.md | 手順書あり |
| 7 | テンプレート変更時は全10項目を推測なしで実行する | TC-046-consistency-check.md | 手順書あり |

---

## AC-010: ストレージアダプタ変数契約（US-009）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | `backlog-wiki.md` に27変数が全て定義されている | TC-044-storage-adapter-variables.md | 手順書あり |
| 2 | `obsidian-vault.md` に27変数が全て定義されている | TC-044-storage-adapter-variables.md | 手順書あり |
| 3 | 両アダプタで同じ変数名に対してアダプタ固有の値が設定されている | TC-044-storage-adapter-variables.md | 手順書あり |
| 4 | 新アダプタは27変数を全実装することで統合できる | TC-044-storage-adapter-variables.md | 手順書あり |

---

## AC-011: バージョン管理（US-010）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | `plugin.json` と `marketplace.json` のバージョンが常に一致している | TC-050-metadata-errors.md | 手順書あり |
| 2 | コミットメッセージが `v{version}: {変更概要}` 形式 | — | 規約レビュー |
| 3 | テンプレート構造変更はマイナー（0.x.0）バンプ | — | 規約レビュー |
| 4 | 文言修正・バグ修正はパッチ（0.x.y）バンプ | — | 規約レビュー |

---

## AC-012: 営業フレームワーク展開（関連: REQ-016）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | BANTCH: 6フィールド（B/A/N/T/C/H）が全て展開される | TC-014-recursive-resolution.md | 手順書あり |
| 2 | BANT: 4フィールド（B/A/N/T）のみが展開される | TC-014-recursive-resolution.md | 手順書あり |
| 3 | MEDDIC: 6フィールドが全て展開される | TC-014-recursive-resolution.md | 手順書あり |
| 4 | custom: `sales_framework_fields` 定義のカスタムフィールドが展開される | TC-014-recursive-resolution.md | 手順書あり |

---

## AC-013: 条件ブロック展開（関連: REQ-015）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | `backlog_issues.enabled: false` → admin の backlog セクションが非表示 | TC-025-conditional-blocks.md | 手順書あり |
| 2 | `google_drive.folder_id` 設定あり → Drive セクションが表示される | TC-025-conditional-blocks.md | 手順書あり |
| 3 | `google_drive.folder_id` 未設定 → 代替テキストまたは非表示 | TC-025-conditional-blocks.md | 手順書あり |
| 4 | `knowledge_categories.sub_categories` あり → サブカテゴリが展開される | TC-025-conditional-blocks.md | 手順書あり |

---

## AC-014: ログ・レポート機能（v0.5.0）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | 週次レポートテンプレートに重要度ティア3段階（★★★/★★/★）が定義されている | TC-053-log-report-features.md | 手順書あり |
| 2 | ティア1（★★★）の判定キーワード（受注/失注/インシデント等）が記述されている | TC-053-log-report-features.md | 手順書あり |
| 3 | 月次/QBR/年次レポートにフォールバック戦略が記述されている | TC-053-log-report-features.md | 手順書あり |
| 4 | `log report` の引数（monthly/qbr/annual + 日付 + `--format`）が全て記述されている | TC-053-log-report-features.md | 手順書あり |
| 5 | `weekly` サブコマンドの引数（ISO週番号形式）が記述されている | TC-053-log-report-features.md | 手順書あり |

---

## AC-015: 営業フレームワーク選択 — Step 3（US-011、v0.8.0）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | BANTCH（デフォルト）選択時に6フィールドが `.team-config.yml` に設定される | TC-056-wizard-step3-5.md | 手順書あり |
| 2 | BANT 選択時に4フィールドのみ設定される | TC-056-wizard-step3-5.md | 手順書あり |
| 3 | MEDDIC 選択時に6フィールドが設定される | TC-056-wizard-step3-5.md | 手順書あり |
| 4 | カスタム選択時に対話形式でフィールドを定義できる | TC-056-wizard-step3-5.md | 手順書あり |
| 5 | カスタムフィールドのキーが英字のみであること | TC-056-wizard-step3-5.md | 手順書あり |
| 6 | カスタムフィールド0件で完了→バリデーションエラー | TC-056-wizard-step3-5.md | 手順書あり |

---

## AC-016: データソース選択 — Step 4（US-012、v0.8.0）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | デフォルト（Slack/GCal/Gmail/GDrive有効）が正しく設定される | TC-056-wizard-step3-5.md | 手順書あり |
| 2 | Backlog Issues はデフォルト無効 | TC-056-wizard-step3-5.md | 手順書あり |
| 3 | 全データソース無効（0個選択）でも生成成功する | TC-056-wizard-step3-5.md | 手順書あり |
| 4 | 無効データソースの条件ブロックが正しく除外される | TC-025-conditional-blocks.md | 手順書あり |

---

## AC-017: ナレッジカテゴリ設定 — Step 5（US-013、v0.8.0）

| # | 受け入れ基準 | テスト手順書 | 状態 |
|---|------------|------------|------|
| 1 | デフォルト（2カテゴリ）が正しく設定・展開される | TC-056-wizard-step3-5.md | 手順書あり |
| 2 | カスタマイズでカテゴリ追加ができる | TC-056-wizard-step3-5.md | 手順書あり |
| 3 | サブカテゴリが追加できる | TC-056-wizard-step3-5.md | 手順書あり |
| 4 | `required: true` のカテゴリ削除がブロックされる | TC-056-wizard-step3-5.md | 手順書あり |
| 5 | 最低1カテゴリが維持される（0件にならない） | TC-056-wizard-step3-5.md | 手順書あり |

---

## 未実装・推奨追加テスト

### 高優先度

- [ ] **整合性チェックの自動化** — Claude Hooks や pre-commit フックとしての組み込み
- [ ] **全24コマンドの除外組み合わせテスト** — TC-024の全パターン実行
- [ ] **Step 3-5 実動作検証** — TC-056〜063を実際に `/forge-generate` で実行して確認

### 中優先度

- [ ] **実動作テスト** — 実際に `/forge-generate` を実行して TC-001/002 の結果を確認
- [ ] **マイグレーション実動作テスト** — 旧フォーマットデータを用意してTC-039実行

### 低優先度

- [ ] **エッジケーステスト** — `knowledge_categories` 空、特殊文字含む product_name 等
- [ ] **ブラウザ互換テスト** — 異なる Claude Code バージョンでの動作確認
