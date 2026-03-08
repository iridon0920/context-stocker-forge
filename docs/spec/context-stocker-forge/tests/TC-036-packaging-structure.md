# TC-036〜038: パッケージング構造テスト

## テスト概要

生成された `.plugin` ファイル（ZIPアーカイブ）の内部構造が Claude Code プラグインシステムの要件を満たしていることを検証する。

## TC-036: ZIPルート直下に `.claude-plugin/plugin.json` が存在すること

### 検証手順

```bash
# 生成された .plugin ファイルの内容を確認
unzip -l testproduct-context-stocker.plugin | head -5

# 期待出力（ZIPルート直下にファイルが存在する）:
# .claude-plugin/plugin.json  ← ルート直下
# skills/tp-deal/SKILL.md
# commands/tp-deal-load.md
# ...

# NG出力（ラッパーディレクトリがある）:
# testproduct-context-stocker/.claude-plugin/plugin.json  ← ラッパーあり
# testproduct-context-stocker/skills/tp-deal/SKILL.md
```

### 自動検証コマンド

```bash
# ZIPの最初のエントリが ".claude-plugin/" で始まっているか確認
unzip -l testproduct-context-stocker.plugin | grep ".claude-plugin/plugin.json" | head -1

# 期待: "  .claude-plugin/plugin.json" （先頭に "testproduct-context-stocker/" がない）
```

**PASS条件**: `.claude-plugin/plugin.json` が `{plugin_name}/.claude-plugin/plugin.json` ではなく `.claude-plugin/plugin.json` として存在する

---

## TC-037: ZIPアーカイブにラッパーディレクトリが含まれないこと

### 検証手順

```bash
# ZIPのエントリ一覧を取得
unzip -l testproduct-context-stocker.plugin > /tmp/zip_contents.txt

# ラッパーディレクトリが含まれていないことを確認
grep "^testproduct-context-stocker/" /tmp/zip_contents.txt
# → 0件（ラッパーディレクトリなし）

# または任意のプラグイン名でも確認
# ルートエントリが直接 .claude-plugin/ または skills/ または commands/ であること
head -5 /tmp/zip_contents.txt
```

### 正しいパッケージング方法の確認

SKILL.md に記載された正しいコマンドが使われていること:

```bash
# 正しい方法
cd {output_dir}/{plugin_name}
zip -r ../{plugin_name}.plugin .claude-plugin/ skills/ commands/ .team-config.yml README.md

# 誤った方法（ラッパーが含まれてしまう）
cd {output_dir}
zip -r {plugin_name}.plugin {plugin_name}/
```

---

## TC-038: plugin.json に許可フィールドのみが含まれること

### 検証手順

```bash
# plugin.json の内容を確認
cat testproduct-context-stocker/.claude-plugin/plugin.json
```

**期待される plugin.json の構造**:

```json
{
  "name": "testproduct-context-stocker",
  "version": "1.0.0",
  "description": "TestProduct事業チーム向けコンテキスト管理プラグイン",
  "author": {
    "name": "チーム名"
  },
  "keywords": [
    "context",
    "stocker",
    "testproduct"
  ]
}
```

**禁止フィールドが含まれていないことを確認**:

```bash
# 以下のフィールドが存在しないこと
grep -c '"skills"' testproduct-context-stocker/.claude-plugin/plugin.json
# → 0

grep -c '"commands"' testproduct-context-stocker/.claude-plugin/plugin.json
# → 0

grep -c '"data_sources"' testproduct-context-stocker/.claude-plugin/plugin.json
# → 0

grep -c '"format_version"' testproduct-context-stocker/.claude-plugin/plugin.json
# → 0

grep -c '"storage_type"' testproduct-context-stocker/.claude-plugin/plugin.json
# → 0

grep -c '"generated_by"' testproduct-context-stocker/.claude-plugin/plugin.json
# → 0
```

**PASS条件**: plugin.json が `name`, `version`, `description`, `author`, `keywords` の5フィールドのみで構成されている

---

## TC-039〜041: マイグレーションテスト

### TC-039: 全件一括マイグレーション

**前提条件**:
- 既存プラグインのストレージに `format_version: 0`（または旧バージョン）のページが存在する
- `templates/migrations/v0_to_v1.md` が存在する（実際には未作成）

**検証手順**:
1. `/forge-migrate path/to/plugin` を実行
2. サンプリング（10件）の `format_version` を確認
3. 「全件一括」を選択
4. マイグレーション実行
5. 結果レポートを確認

**期待結果**:
```
=== マイグレーション結果 ===
総対象: 45件
成功: 43件
失敗: 1件
スキップ: 1件（既に最新バージョン）
```

### TC-041: 結果レポートの検証

**期待されるレポート形式**:
- 成功件数 / 失敗件数 / スキップ件数が明確に表示される
- 失敗件数が1件以上の場合、該当ページ名とエラー内容が列挙される
- 処理完了後に再実行の方法を案内する
