# TC-001〜009: ウィザード動作・バリデーションテスト

## テスト概要

`/forge-generate` コマンド実行時のウィザードフロー、再生成モード、および入力バリデーションが正しく動作することを検証する。

---

## TC-001: 新規ウィザード正常フロー（backlog-wiki）

### 目的

引数なしで `/forge-generate` を実行し、Backlog Wiki ストレージを選択した context-stocker プラグインが正常に生成されること。

### テスト手順

1. `/forge-generate` を実行（引数なし）
2. Step 1: チーム名 = `SaaS営業部`、事業名 = `TestProduct`、プレフィクス = `tp` を入力
3. Step 2: ストレージ = `Backlog Wiki`、プロジェクトキー = `TEST_PRJ` を入力
4. Step 3: 営業フレームワーク = `BANTCH`（デフォルト）を選択
5. Step 4: データソース = デフォルト（Slack/GCal/Gmail/GDrive有効）を選択
6. Step 5: ナレッジカテゴリ = デフォルト（2カテゴリ）を選択
7. 確認ステップ: 全設定サマリーを確認し `Yes` で承認

### 期待される生成物

```
testproduct-context-stocker/
├── .claude-plugin/plugin.json   ← "name": "testproduct-context-stocker"
├── .team-config.yml             ← 入力値が正しく保存されている
├── README.md
├── skills/
│   ├── tp-deal/SKILL.md
│   ├── tp-admin/SKILL.md
│   ├── tp-log/SKILL.md
│   ├── tp-doc/SKILL.md
│   └── tp-knowledge/SKILL.md
└── commands/
    ├── tp-deal-load.md
    ├── tp-deal-save.md
    ├── tp-knowledge-save.md
    ├── tp-knowledge-search.md
    ├── tp-admin.md
    ├── tp-doc.md
    ├── tp-engdoc.md
    └── tp-log.md
testproduct-context-stocker.plugin  ← 生成済み（ZIPアーカイブ）
```

### 検証手順

```bash
# ディレクトリ構造の確認
ls testproduct-context-stocker/
ls testproduct-context-stocker/skills/
ls testproduct-context-stocker/commands/

# .team-config.yml の設定値確認
grep "product_prefix: tp" testproduct-context-stocker/.team-config.yml
grep "product_name: TestProduct" testproduct-context-stocker/.team-config.yml

# コマンドファイルの命名確認（全て tp- で始まる）
ls testproduct-context-stocker/commands/ | grep "^tp-"
# → 8ファイル全てが tp- で始まること

# 未解決変数なしの確認
grep -r "{{" testproduct-context-stocker/ \
  --include="*.md" \
  --include="*.json" \
  --exclude=".team-config.yml"
# → 0件

# plugin.json の name フィールド確認
grep '"name": "testproduct-context-stocker"' testproduct-context-stocker/.claude-plugin/plugin.json
```

### PASS条件

| 検証項目 | 期待結果 |
|---------|---------|
| ディレクトリ生成 | `testproduct-context-stocker/` が作成されている |
| `.team-config.yml` 内容 | `product_prefix: tp` が設定されている |
| コマンドファイル数 | 8ファイル全て `tp-` で始まる |
| スキルファイル数 | 5スキルが生成されている |
| 未解決変数 | 0件 |
| `.plugin` ファイル | `testproduct-context-stocker.plugin` が生成されている |

---

## TC-002: 新規ウィザード正常フロー（obsidian-vault）

### 目的

Obsidian Vault ストレージを選択した場合のプラグイン生成が正常に動作すること。

### テスト手順

1. `/forge-generate` を実行（引数なし）
2. Step 1: チーム名 = `開発チーム`、事業名 = `TestProduct`、プレフィクス = `tp`
3. Step 2: ストレージ = `Obsidian Vault`、ベースパス = `teams/testproduct`
4. Step 3: 営業フレームワーク = `BANTCH`（デフォルト）を選択
5. Step 4: データソース = デフォルトを選択
6. Step 5: ナレッジカテゴリ = デフォルトを選択
7. 確認ステップ: `Yes` で承認

### 検証手順

```bash
# Obsidian固有変数の展開確認
grep "write_note" testproduct-context-stocker/skills/tp-deal/SKILL.md
grep "teams/testproduct" testproduct-context-stocker/skills/tp-deal/SKILL.md

# backlog固有変数が残存していないこと
grep -c "{{storage_project_key}}" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 0

grep -c "add_wiki" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 0（Obsidianではadd_wikiは使わない）

# セッション初期化が2-Phase形式であること
grep "Phase 1" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → list_directory の手順が含まれている（get_project ではない）

# storage_base_path が正しく解決されていること
grep "teams/testproduct" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → マッチすること

# admin.md の backlog セクションが除外されていること（obsidian-vault 選択時）
grep -c "backlog" testproduct-context-stocker/commands/tp-admin.md
# → 0 または最小限（ストレージ種別に依存）
```

### PASS条件

| 検証項目 | 期待結果 |
|---------|---------|
| Obsidian固有コマンド | `write_note`, `read_note` が使われている |
| ベースパス解決 | `teams/testproduct` が設定値として展開されている |
| Backlog変数残存なし | `{{storage_project_key}}` = 0件 |
| セッション初期化 | 2-Phase（`list_directory`ベース） |

---

## TC-003: 再生成モード（設定変更なし）

### 目的

既存の `.team-config.yml` を指定して `/forge-generate` を実行した場合、設定を再読み込みして同じ出力が得られること。

### 事前条件

- `testproduct-context-stocker/.team-config.yml` が存在する（TC-001実行後）

### テスト手順

1. `/forge-generate testproduct-context-stocker/.team-config.yml` を実行
2. 設定内容確認ステップ: 変更なしで `Yes` を選択
3. 再生成の承認

### 検証手順

```bash
# 再生成後も同じファイル構造が維持されていること
ls testproduct-context-stocker/commands/ | sort
# → 初回生成と同じ8ファイルがあること

# .team-config.yml の内容が変わっていないこと
grep "product_prefix: tp" testproduct-context-stocker/.team-config.yml
```

### PASS条件

- 設定変更なしで再生成した場合、初回生成と同一の出力になること

---

## TC-004: 再生成モード（プレフィクス変更あり）

### 目的

再生成時にプレフィクスを変更した場合、全ての生成物が新しいプレフィクスで更新されること。

### テスト手順

1. `/forge-generate testproduct-context-stocker/.team-config.yml` を実行
2. プレフィクスを `tp` から `tprd` に変更して承認

### 検証手順

```bash
# 旧プレフィクス tp- のファイルが存在しないこと
ls testproduct-context-stocker/commands/ | grep "^tp-" | grep -v "tprd-"
# → 0件

# 新プレフィクス tprd- のファイルが存在すること
ls testproduct-context-stocker/commands/ | grep "^tprd-"
# → 8ファイル

# スキルディレクトリが新プレフィクスで更新されていること
ls testproduct-context-stocker/skills/ | grep "^tprd-"
# → 5ディレクトリ

# .team-config.yml のプレフィクスが更新されていること
grep "product_prefix: tprd" testproduct-context-stocker/.team-config.yml
```

---

## TC-005〜007: プレフィクスバリデーション

### 目的

コマンドプレフィクスの入力バリデーションが正しく動作すること。

### テストケース

| TC | 入力値 | 期待動作 |
|----|--------|---------|
| TC-005 | `a`（1文字） | エラー: 2文字以上を要求するメッセージを表示 |
| TC-006 | `abcde`（5文字） | エラー: 4文字以下を要求するメッセージを表示 |
| TC-007 | `ZD`（大文字） | エラー: 英小文字のみを要求するメッセージを表示 |

### 検証内容

各ケースでウィザードが：
1. エラーメッセージを表示すること
2. 再入力を求めること（Step 1 をやり直す）
3. プラグイン生成には進まないこと

### PASS条件

- 無効なプレフィクスを入力した場合、具体的なエラーメッセージと共に再入力を促す
- 有効な値（例: `zd`）に変更すれば次のステップに進める

---

## TC-008: プレフィクス自動提案ロジック

### 目的

事業名から自動提案されるプレフィクスが正しい変換ルールに従うこと。

### テストケース

| 事業名 | 期待される提案値 |
|-------|--------------|
| `Zendesk` | `zd`（先頭2文字小文字） |
| `SalesForce` | `sf` または `sal` |
| `TestProduct` | `tp`（先頭2文字） |
| `ACME` | `ac`（先頭2文字小文字） |

### 検証内容

- ウィザード Step 1 で事業名入力後、プレフィクスのデフォルト値として自動提案が表示されること
- 提案値は2〜4文字の英小文字であること

---

## TC-009: プロジェクトキーバリデーション（Backlog Wiki 選択時）

### 目的

Backlog Wiki を選択した場合のプロジェクトキー入力バリデーションが正しく動作すること。

### テストケース

| 入力値 | 期待動作 |
|--------|---------|
| `test_prj`（小文字含む） | エラー: 大文字英数字とアンダースコアのみを要求 |
| `TEST PRJ`（スペース含む） | エラー: スペースは使用不可 |
| `TEST_PRJ`（正しい形式） | 次のステップへ進む |

### 検証内容

- 無効なプロジェクトキーでエラーメッセージが表示されること
- 有効な形式（例: `TEST_PRJ`）で次のステップに進めること
