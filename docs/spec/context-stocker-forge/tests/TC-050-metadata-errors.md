# TC-050〜052: メタデータ・エラーハンドリング・マイグレーションテスト

## テスト概要

forge自身のメタデータ整合性（TC-050）、エラーハンドリング（TC-051）、およびマイグレーション不要判定（TC-052）を検証する。

---

## TC-050: plugin.json と marketplace.json のバージョン一致

### 目的

CLAUDE.md のバージョニング規約「`plugin.json` と `marketplace.json` の `version` は常に同じ値にすること」が守られていることを確認する。

### 検証手順

```bash
# plugin.json のバージョン取得
grep '"version"' .claude-plugin/plugin.json

# marketplace.json のバージョン取得
grep '"version"' .claude-plugin/marketplace.json
```

### 手動確認

以下のコマンドで両者の一致を確認する:

```bash
V1=$(grep '"version"' .claude-plugin/plugin.json | sed 's/.*: *"\([^"]*\)".*/\1/')
V2=$(grep '"version"' .claude-plugin/marketplace.json | sed 's/.*: *"\([^"]*\)".*/\1/')
echo "plugin.json: $V1"
echo "marketplace.json: $V2"
[ "$V1" = "$V2" ] && echo "PASS: バージョン一致" || echo "NG: バージョン不一致"
```

### PASS条件

- `plugin.json` と `marketplace.json` の `version` フィールドの値が完全に一致すること
- どちらかのファイルが `version` フィールドを持たない場合も NG

---

## TC-051: Slack チャンネル未設定時のエラーメッセージ出力

### 目的

`slack.enabled: true` かつ `default_channels` が空の場合、生成されたプラグインのコマンド実行時に適切なエラーメッセージが表示されること。

### テスト設定

```yaml
data_sources:
  slack:
    enabled: true
    default_channels: []
```

### 検証手順

```bash
# 生成されたスキル内に Slack 未設定時の案内メッセージが含まれていること
grep -c "未設定\|設定してください\|admin slack" testproduct-context-stocker/skills/tp-deal/SKILL.md
# → 1以上

# 具体的なメッセージ内容を確認
grep -A3 "Slack.*未設定\|default_channels.*空" testproduct-context-stocker/skills/tp-deal/SKILL.md
```

### 期待されるメッセージ

```
⚠️ Slackの重点チャンネルが未設定です。
`/tp-admin slack` コマンドで設定してください。
```

（`tp` の部分は実際の `product_prefix` に置き換わること）

### テンプレートレベルでの確認

```bash
# テンプレート内に未設定時の案内メッセージが定義されていること
grep -c "未設定\|admin.*slack\|default_channels" templates/skills/deal/SKILL.md.template
# → 1以上
```

### PASS条件

| 検証項目 | 期待結果 |
|---------|---------|
| エラーメッセージの存在 | 生成スキル内に Slack 未設定時の案内が含まれる |
| プレフィクス展開 | メッセージ内のコマンド名が `tp-admin slack` になっている |
| 継続動作 | エラー後もコマンド自体は続行可能（Slack以外のデータソースは正常） |

---

## TC-052: format_version:1 でのマイグレーション不要判定

### 目的

`.team-config.yml` の `format_version: 1`（最新バージョン）でマイグレーションを実行した場合、「マイグレーション不要」と判定されること。

### 事前条件

- 生成済みプラグインの `.team-config.yml` に `format_version: 1` が含まれている

### テスト手順

1. `/forge-migrate testproduct-context-stocker/.team-config.yml` を実行
2. マイグレーションコマンドの応答を確認

### 検証内容

```bash
# .team-config.yml の format_version を確認
grep "format_version:" testproduct-context-stocker/.team-config.yml
# → "format_version: 1"
```

### 期待動作

コマンド実行後、以下のいずれかのメッセージが表示されること:

- `このプラグインはすでに最新フォーマット（format_version: 1）です。マイグレーションは不要です。`
- または同等の内容

### PASS条件

| 検証項目 | 期待結果 |
|---------|---------|
| マイグレーション不要判定 | `format_version: 1` に対してマイグレーションを試みない |
| メッセージ出力 | 「最新フォーマット」または「マイグレーション不要」旨が表示される |
| 副作用なし | `.team-config.yml` の内容が変更されていない |

---

## 関連テスト

- TC-039〜041: マイグレーション詳細テスト（`TC-036-packaging-structure.md` に記載）
- TC-003〜004: 再生成モード（`TC-001-wizard-flow.md` に記載）
