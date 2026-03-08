# context-stocker-forge テスト仕様書（逆生成）

## 分析概要

**分析日時**: 2026-03-08（更新: 2026-03-08）
**対象コードベース**: /home/iridon0920/dev/context-stocker-forge
**対象バージョン**: v0.8.0（5ステップウィザード対応済み）
**テストカバレッジ**: 0%（実行可能テストなし、手順書は実装済み）
**生成テストケース数**: 63個（+8: v0.8.0 ウィザードStep 3-5追加分）
**テスト手順書実装数**: 12ファイル（63ケース全てをカバー）

## 現在のテスト実装状況

### テストフレームワーク

本プロジェクトはTypeScript/JavaScriptアプリケーションではなく **Claude Codeプラグイン（Markdownベースのプロンプト定義）** であるため、従来のテストフレームワークは適用されない。

| テスト種別 | 適用方法 | 実装状況 |
|-----------|---------|---------|
| 動作検証テスト | 実際にコマンドを実行して期待動作を確認 | 未実装 |
| テンプレート整合性チェック | `forge-consistency-check-prompt.md` 10項目チェック | 定義済み（手動実行） |
| 生成物バリデーション | `post-generation-check.md` 6項目チェック | 定義済み（生成時自動実行） |
| マイグレーション検証 | マイグレーション実行後の結果確認 | 未実装 |

### テストカバレッジ詳細

| ファイル/ディレクトリ | 動作テスト | 整合性テスト | バリデーション |
|---------------------|-----------|------------|-------------|
| `commands/` | 0% | 定義済み（未実行） | — |
| `skills/generate/SKILL.md` | 0% | 0% | — |
| `skills/generate/references/` | 0% | 定義済み（未実行） | — |
| `storage-adapters/` | 0% | 定義済み（未実行） | — |
| `templates/commands/` | 0% | 定義済み（未実行） | — |
| `templates/skills/` | 0% | 定義済み（未実行） | — |
| **全体** | **0%** | **部分定義** | **生成時のみ** |

### テストカテゴリ別実装状況

#### ウィザード動作テスト
- [x] 新規ウィザードモード（引数なし）→ `tests/TC-001-wizard-flow.md`
- [x] 再生成モード（引数あり）→ `tests/TC-001-wizard-flow.md`
- [ ] マイグレーションモード（未実装）
- [x] バリデーション（プレフィクス2-4文字制約）→ `tests/TC-001-wizard-flow.md`
- [x] バリデーション（プロジェクトキー形式）→ `tests/TC-001-wizard-flow.md`
- [x] Step 3: 営業フレームワーク選択（BANTCH/BANT/MEDDIC/カスタム）→ `tests/TC-056-wizard-step3-5.md`
- [x] Step 4: データソース選択（マルチセレクト・全無効可）→ `tests/TC-056-wizard-step3-5.md`
- [x] Step 5: ナレッジカテゴリ設定（カスタマイズ・必須カテゴリ削除防止）→ `tests/TC-056-wizard-step3-5.md`

#### テンプレート合成テスト
- [x] backlog-wiki ストレージでの変数展開 → `tests/TC-010-template-variable-resolution.md`
- [x] obsidian-vault ストレージでの変数展開 → `tests/TC-010-template-variable-resolution.md`
- [x] excluded_commands による条件ブロック除外 → `tests/TC-019-excluded-commands.md`
- [x] 組み込み営業フレームワーク（BANTCH/BANT/MEDDIC）展開 → `tests/TC-014-recursive-resolution.md`
- [x] ストレージアダプタ差し込み後の再帰的変数解決 → `tests/TC-014-recursive-resolution.md`
- [x] 条件ブロック（data_sources設定フラグ）→ `tests/TC-025-conditional-blocks.md`

#### ログ・レポートテスト（v0.5.0機能）
- [x] 週次レポートテンプレート: 重要度ティア分類（★★★/★★/★）→ `tests/TC-053-log-report-features.md`
- [x] 活動レポートテンプレート: 階層型集約フォールバック → `tests/TC-053-log-report-features.md`
- [x] log report サブコマンド: monthly/qbr/annual + 日付引数 + --format フラグ → `tests/TC-053-log-report-features.md`

#### 生成物バリデーションテスト
- [x] チェック1-6 定義済み（`post-generation-check.md`）
- [x] 各チェックのNG判定シナリオ → `tests/TC-029-post-generation-validation.md`
- [x] 全PASS後のパッケージング実行 → `tests/TC-029-post-generation-validation.md`

#### パッケージングテスト
- [x] ZIPアーカイブのディレクトリ構造検証 → `tests/TC-036-packaging-structure.md`
- [x] ラッパーディレクトリなし検証 → `tests/TC-036-packaging-structure.md`

#### ストレージアダプタテスト
- [x] backlog-wiki: 27変数全定義確認 → `tests/TC-044-storage-adapter-variables.md`
- [x] obsidian-vault: 27変数全定義確認 → `tests/TC-044-storage-adapter-variables.md`
- [x] backlog-wiki: 3-Phase初期化定義 → `tests/TC-042-storage-adapter-init.md`
- [x] obsidian-vault: 2-Phase初期化定義 → `tests/TC-042-storage-adapter-init.md`

#### 整合性チェックテスト
- [x] 10項目整合性チェック手順 → `tests/TC-046-consistency-check.md`

#### メタデータ・エラーハンドリングテスト
- [x] plugin.json / marketplace.json バージョン一致 → `tests/TC-050-metadata-errors.md`
- [x] Slack未設定時エラーメッセージ → `tests/TC-050-metadata-errors.md`
- [x] format_version:1 マイグレーション不要判定 → `tests/TC-050-metadata-errors.md`

## テスト環境設定

本プロジェクトのテスト実行環境:

- **ランタイム**: Claude Code（claude-sonnet-4-6以上）
- **テスト実行**: コマンド `/forge-generate` を実際に実行して動作検証
- **アサーション**: 生成されたファイルの内容をGrep/Read で検証
- **前提**: Backlog MCPまたはObsidian MCPが利用可能な環境

## テスト手順書ファイル一覧

| ファイル | 対象TC | 内容 |
|--------|-------|------|
| `tests/TC-001-wizard-flow.md` | TC-001〜009 | ウィザードフロー・バリデーション |
| `tests/TC-010-template-variable-resolution.md` | TC-010〜013 | テンプレート変数展開（backlog/obsidian） |
| `tests/TC-014-recursive-resolution.md` | TC-014〜018 | 再帰解決・営業フレームワーク展開 |
| `tests/TC-019-excluded-commands.md` | TC-019〜024 | excluded_commands 動作 |
| `tests/TC-025-conditional-blocks.md` | TC-025〜028 | 条件ブロック展開 |
| `tests/TC-029-post-generation-validation.md` | TC-029〜035 | 生成物バリデーション6チェック |
| `tests/TC-036-packaging-structure.md` | TC-036〜041 | パッケージング構造・マイグレーション |
| `tests/TC-042-storage-adapter-init.md` | TC-042〜043 | ストレージアダプタ初期化Phase |
| `tests/TC-044-storage-adapter-variables.md` | TC-044〜045 | ストレージアダプタ27変数契約 |
| `tests/TC-046-consistency-check.md` | TC-046〜049 | 整合性チェック10項目 |
| `tests/TC-050-metadata-errors.md` | TC-050〜052 | メタデータ・エラーハンドリング |
| `tests/TC-053-log-report-features.md` | TC-053〜055 | ログ・レポート機能テスト |
| `tests/TC-056-wizard-step3-5.md` | TC-056〜063 | ウィザードStep 3-5（営業FW・データソース・ナレッジカテゴリ） |

## 不足テストの優先順位（残存タスク）

### 高優先度（次に対処すべき）
1. **整合性チェック自動実行** — コミット前フックまたはClaude Hooksとしての自動化
2. **excluded_commands 全24パターン完全検証** — TC-024の全ケース実行
3. **Step 3-5 実動作検証** — TC-056〜063を実際に `/forge-generate` で実行して確認

### 中優先度（品質向上）
4. **ウィザードモード実動作検証** — TC-001/002を実際に `/forge-generate` で実行して確認
5. **マイグレーション実動作テスト** — TC-039〜041の実環境での検証
6. **全データソース無効時の生成物検証** — TC-060の条件ブロック展開の正確性

### 低優先度
7. **エッジケースの追加** — `knowledge_categories` が0件、特殊文字を含む `product_name` 等
8. **カスタムフレームワーク大量フィールド** — 10フィールド以上のカスタムフレームワーク定義時の展開
