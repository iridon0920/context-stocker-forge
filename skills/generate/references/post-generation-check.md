# 生成物チェック（Post-Generation Validation）

テンプレート合成完了後、`.plugin` パッケージングの**前**に必ず実行する検証プロセス。

**全6項目がPASSしなければパッケージングに進んではいけない。** NGの場合はテンプレート合成（Step 4）に戻って該当箇所を修正し、再チェックする。

---

## チェック1: 未解決テンプレート変数の検出

**目的**: `{{...}}` パターンが出力ファイルに残っていないことを確認する。

**手順**:
1. 生成された全出力ファイルを対象に `{{` パターンを検索
2. `.team-config.yml` は検索対象から**除外**する（config内にテンプレート変数は残って良い）
3. `forge-consistency-check-prompt.md` も除外する（forge自体のドキュメント）

**判定**:
- 0件 → PASS
- 1件以上 → **NG** — 未解決の変数名と出現ファイルを特定し、template-assembly.md のマッピングを参照して正しい値で置換する

**よくある未解決変数**:
- `{{storage_project_key}}` — ストレージアダプタ差し込み後の再置換漏れ
- `{{storage_base_path}}` — 同上
- `{{drive_folder_id}}` — 条件ブロックの評価漏れ
- `{{default_channels_list}}` — 派生値の計算漏れ
- `{{warning_text}}` — ループ内変数の展開漏れ

---

## チェック2: 商材名の一貫性

**目的**: product_name が正しく展開され、別商材の名前が混入していないことを確認する。

**手順**:
1. 全出力ファイルで `config.product_name` の値が適切に使用されているか確認
2. **他の商材名が混入していないか**を検索:
   - 既知の商材名: `Twilio`, `SendGrid`, `Zendesk`, `AWS GameLift` 等
   - 生成対象でない商材名が出力ファイルに含まれていたらNG

**判定**:
- 対象商材名のみ → PASS
- 別商材名の混入あり → **NG** — テンプレートからのコピー時にハードコードが残っている可能性。該当箇所を `{{product_name}}` に戻すか、正しい値に修正

---

## チェック3: コマンドプレフィクスの一貫性

**目的**: コマンドファイル名とファイル内のコマンド参照が `{product_prefix}-` で統一されていることを確認する。

**手順**:
1. `commands/` ディレクトリ内の全ファイル名が `{product_prefix}-` で始まっているか
2. 各ファイル内のコマンド参照（`/{prefix}-xxx` 形式）が正しいプレフィクスか
3. スキルファイル内のコマンド参照も同様にチェック

**判定**:
- 全て一致 → PASS
- 不一致あり → **NG** — プレフィクス置換の漏れ

---

## チェック4: スキル参照の整合性

**目的**: コマンドがスキルを正しく参照していることを確認する。

**手順**:
1. 各コマンドファイル内の `Skillツールで {plugin_name}:{prefix}-deal を呼び出し` のような参照を抽出
2. `plugin_name` が正しい値（`{product_name_lower}-context-stocker`）か
3. スキル名（`{prefix}-deal`, `{prefix}-knowledge`）が正しいか
4. `plugin.json` の `name` フィールドとスキルディレクトリ名が一致するか

**判定**:
- 全参照が正しい → PASS
- 不一致あり → **NG** — plugin_name またはスキル名の置換漏れ

---

## チェック5: ストレージ設定の整合性

**目的**: ストレージ関連の設定値が正しいことを確認する。

**手順**:
1. `project_key` / `base_path` の値が `.team-config.yml` の値と一致するか
2. ストレージ操作セクション（`{{storage_operations}}` で差し込まれた部分）内の `{{storage_project_key}}` / `{{storage_base_path}}` が解決済みか
3. MCP ツール呼び出しのパラメータが正しいか（例: `get_project(projectKey: "{正しい値}")`)

**判定**:
- 全て正しい → PASS
- 未解決または不正値あり → **NG**

---

## チェック6: ファイル構成の検証

**目的**: 生成されたファイル構成が期待どおりであることを確認する。

**手順**:
1. `template-assembly.md` の「出力ディレクトリ構成」と実際の出力を比較
2. 必須ファイルが存在するか:
   - `.claude-plugin/plugin.json`
   - `.team-config.yml`
   - `README.md`
   - `skills/{pre}-deal/SKILL.md`
   - `skills/{pre}-knowledge/SKILL.md`
3. `excluded_commands` で除外したコマンドのセクションが統合コマンドファイル（`{pre}-admin.md`, `{pre}-doc.md`, `{pre}-engdoc.md`, `{pre}-log.md`）に**含まれていない**か。deal/knowledge系は対応ファイルが**生成されていない**か
4. `backlog_issues.enabled: false` 時に `{pre}-admin.md` 内のbacklogセクションが**含まれていない**か
5. referenceファイルが全て存在するか

**判定**:
- 全て正しい → PASS
- 過不足あり → **NG**

---

## チェック結果の報告

全チェック完了後、以下の形式で結果を報告する:

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

NGの場合は該当箇所の詳細（ファイル名、行番号、問題内容）を列挙し、修正後に再チェックする。
