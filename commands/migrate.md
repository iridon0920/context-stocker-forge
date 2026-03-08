---
description: 生成済みcontext-stockerのデータフォーマットをマイグレーションする
argument-hint: "[対象プラグインのパス]"
---

Skillツールで `context-stocker-forge:generate` スキルを呼び出し、「フォーマットマイグレーション」セクションの手順に従って実行する。

対象: `$ARGUMENTS` で指定されたプラグインのストレージ内データを最新フォーマットに移行する。

手順:
1. 対象プラグインの .team-config.json を読み込み
2. ストレージ内ページのformat_versionをサンプリング確認
3. 差分分析と影響範囲を提示
4. ユーザー確認後にマイグレーション実行
