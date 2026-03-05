---
description: コンテキスト管理プラグイン（context-stocker）を生成する
argument-hint: "[再生成時: .team-config.ymlのパス]"
---

Skillツールで `context-stocker-forge:generate` スキルを呼び出し、コンテキスト管理プラグインの生成を実行する。

- 引数なし → 新規ウィザードを開始し、対話的に商材情報をヒアリング
- 引数あり → `$ARGUMENTS` を .team-config.yml のパスとして読み込み、再生成を実行（再入力不要）
