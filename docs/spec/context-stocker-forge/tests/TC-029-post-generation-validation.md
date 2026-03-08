# TC-029〜035: 生成物バリデーションテスト

## テスト概要

`skills/generate/references/post-generation-check.md` に定義された6項目のチェックが、各NGパターンを正しく検出できることを検証する。また、全チェックPASS時にパッケージングが実行されることを確認する。

---

## バリデーション実行の概要

生成物バリデーションは SKILL.md の Step 5 で自動実行される。結果は以下のフォーマットで出力される:

```
=== 生成物チェック結果 ===
チェック1: 未解決変数    [PASS/NG] (検出数: N件)
チェック2: 商材名一貫性  [PASS/NG]
チェック3: プレフィクス   [PASS/NG]
チェック4: スキル参照     [PASS/NG]
チェック5: ストレージ設定 [PASS/NG]
チェック6: ファイル構成   [PASS/NG]
========================
総合結果: PASS / NG（N件の問題）
```

---

## TC-029: チェック1 — 未解決変数検出でNG判定

### 目的

生成ファイル内に `{{...}}` パターンが残存する場合、チェック1がNGを報告すること。

### 検証シナリオ

テンプレートに存在しない変数（例: `{{undefined_variable}}`）が `.template` ファイルに含まれていた場合を想定。

### 検証手順

```bash
# 生成物内の未解決変数を検出
grep -rn "{{[a-z_]*}}" testproduct-context-stocker/ \
  --include="*.md" \
  --include="*.json" \
  --exclude=".team-config.yml"
```

**期待動作**: 1件以上検出された場合、チェック1が NG と報告され、パッケージング（ZIP作成）が実行されないこと。

### PASS条件

- 未解決変数が1件以上の場合: チェック1 = NG、総合結果 = NG
- 未解決変数が0件の場合: チェック1 = PASS

---

## TC-030: チェック2 — 別商材名混入でNG判定

### 目的

生成物内に `.team-config.yml` で定義した `product_name` 以外の商材名が混入していた場合、チェック2がNGを報告すること。

### 検証シナリオ

`product_name: TestProduct` でプラグインを生成したにもかかわらず、生成物内に `SampleProduct` 等の異なる商材名が含まれているケース。

### 検証手順

```bash
# 意図しない商材名（テンプレートに残っているサンプル値等）を確認
grep -rn "SampleProduct\|サンプル会社\|example_company" testproduct-context-stocker/ \
  --include="*.md" \
  --include="*.json"
# → 0件であること
```

**期待動作**: 別商材名が検出された場合、チェック2がNG、パッケージング不実行。

---

## TC-031: チェック3 — プレフィクス不一致でNG判定

### 目的

生成ファイル名やスキル/コマンド内部の参照に誤ったプレフィクス（設定値と異なる）が含まれる場合、チェック3がNGを報告すること。

### 検証シナリオ

- `product_prefix: tp` で生成したが、コマンドファイル名に `zd-` が混入している
- スキル内部でのコマンド参照が `zd-deal` のまま残っている

### 検証手順

```bash
# コマンドファイル名が全て tp- で始まることを確認
ls testproduct-context-stocker/commands/ | grep -v "^tp-"
# → 0件（tp-以外のファイルがないこと）

# スキル内部の参照が tp- であることを確認
grep -rn "zd-\|sample-\|test-" testproduct-context-stocker/skills/ \
  --include="*.md"
# → 0件
```

---

## TC-032: チェック4 — スキル参照不整合でNG判定

### 目的

`commands/*.md` が参照するスキル名（`plugin_name:skill_name` 形式）が、`plugin.json` や実際のスキルディレクトリと一致しない場合、チェック4がNGを報告すること。

### 検証シナリオ

`commands/tp-deal-load.md` が `testproduct-context-stocker:old-deal` を参照しているが、実際のスキルは `testproduct-context-stocker:tp-deal` である。

### 検証手順

```bash
# コマンドファイル内のスキル参照確認
grep "plugin_name\|product_prefix.*deal\|tp-deal" testproduct-context-stocker/commands/tp-deal-load.md

# plugin.json の内容確認（skills フィールドが含まれていないこと）
cat testproduct-context-stocker/.claude-plugin/plugin.json

# 実際のスキルディレクトリ名確認
ls testproduct-context-stocker/skills/
```

---

## TC-033: チェック5 — ストレージ設定不整合でNG判定

### 目的

ストレージ固有の設定値（`project_key` / `base_path`）が未解決、または設定値と異なる値が生成物に含まれる場合、チェック5がNGを報告すること。

### 検証シナリオ

- backlog-wiki 選択時: `{{storage_project_key}}` が未展開のまま残っている
- obsidian-vault 選択時: backlog 固有変数（`add_wiki` 等）が残存している

### 検証手順

```bash
# backlog-wiki の場合
grep -rn "{{storage_project_key}}" testproduct-context-stocker/ --include="*.md"
# → 0件

# obsidian-vault の場合
grep -rn "add_wiki\|get_wiki\|update_wiki" testproduct-context-stocker/ --include="*.md"
# → 0件（obsidian-vault 選択時）
```

---

## TC-034: チェック6 — ファイル構成不足でNG判定

### 目的

必須ファイルが生成されていない場合、チェック6がNGを報告すること。

### 必須ファイルリスト

```
.claude-plugin/plugin.json
.team-config.yml
README.md
skills/tp-deal/SKILL.md
skills/tp-admin/SKILL.md
skills/tp-log/SKILL.md
skills/tp-doc/SKILL.md
skills/tp-knowledge/SKILL.md
commands/tp-deal-load.md
commands/tp-deal-save.md
commands/tp-knowledge-save.md
commands/tp-knowledge-search.md
commands/tp-admin.md
commands/tp-doc.md
commands/tp-engdoc.md
commands/tp-log.md
```

### 検証手順

```bash
# 必須ファイルの存在確認
for file in \
  ".claude-plugin/plugin.json" \
  ".team-config.yml" \
  "README.md" \
  "skills/tp-deal/SKILL.md" \
  "skills/tp-admin/SKILL.md" \
  "skills/tp-log/SKILL.md" \
  "skills/tp-doc/SKILL.md" \
  "skills/tp-knowledge/SKILL.md" \
  "commands/tp-deal-load.md" \
  "commands/tp-deal-save.md" \
  "commands/tp-knowledge-save.md" \
  "commands/tp-knowledge-search.md" \
  "commands/tp-admin.md" \
  "commands/tp-doc.md" \
  "commands/tp-engdoc.md" \
  "commands/tp-log.md"; do
  ls "testproduct-context-stocker/$file" 2>/dev/null || echo "MISSING: $file"
done
```

---

## TC-035: 全チェックPASS → パッケージング実行

### 目的

生成物バリデーションの全6チェックがPASSした場合にのみ、`.plugin` ファイルの作成（パッケージング）が実行されること。

### 検証手順

```bash
# 全チェックPASS後にパッケージングが実行されていること
ls testproduct-context-stocker.plugin
# → ファイルが存在すること

# ZIPアーカイブの内容確認
unzip -l testproduct-context-stocker.plugin | head -10
# → .claude-plugin/plugin.json が含まれていること
```

### NGケースでの検証

チェック1（未解決変数）がNGの場合:
- `testproduct-context-stocker.plugin` が生成されないこと
- エラーメッセージが表示され、修正を促すこと

### PASS条件

| ケース | 期待動作 |
|-------|---------|
| 全チェックPASS | `.plugin` ファイルが生成される |
| いずれかのチェックNG | `.plugin` ファイルが生成されない |
| NG時 | 修正すべき問題の詳細が表示される |
