# データフロー図（逆生成）

## 分析日時
2026-03-07（更新: 2026-03-08、v0.8.0対応）

---

## 1. プラグイン生成フロー（新規）

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant C as /forge-generate
    participant S as generate SKILL
    participant W as ウィザード
    participant T as テンプレートエンジン
    participant V as バリデーター
    participant P as パッケージャー

    U->>C: /forge-generate（引数なし）
    C->>S: Skillツール呼び出し
    S->>W: 新規ウィザードモード開始
    W->>U: Step 1: チーム名・事業名・プレフィクス入力
    U-->>W: 入力値
    W->>U: Step 2: ストレージ選択 + 接続情報
    U-->>W: 入力値
    W->>U: Step 3: 営業フレームワーク選択（デフォルト: BANTCH）
    U-->>W: 選択値
    W->>U: Step 4: データソース選択（デフォルト: Slack/GCal/Gmail/GDrive有効）
    U-->>W: 選択値
    W->>U: Step 5: ナレッジカテゴリ設定（デフォルト: 2カテゴリ）
    U-->>W: 選択値
    W->>U: 全設定サマリー確認 → 生成承認
    U-->>W: 承認
    W->>S: .team-config.yml 生成
    S->>T: テンプレート合成開始（7ステップ）
    T->>T: Step1: config読み込み
    T->>T: Step2: 派生値計算（20+変数）
    T->>T: Step3: ストレージ変数定義（27変数）
    T->>T: Step4: テンプレートファイル処理
    T->>T: Step5: excluded_commandsフラグ適用
    T->>V: Step6: 生成物チェック（6項目）
    V-->>T: PASS（全6項目）
    T->>P: Step7: .pluginファイルパッケージング
    P-->>U: {plugin_name}.plugin 出力 + ガイダンス表示
```

---

## 2. プラグイン再生成フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant C as /forge-generate
    participant S as generate SKILL
    participant ST as ストレージ（プラグイン内）
    participant T as テンプレートエンジン

    U->>C: /forge-generate path/to/plugin
    C->>S: Skillツール呼び出し（引数あり）
    S->>ST: .team-config.yml 読み込み
    ST-->>S: 設定内容
    S->>U: 現在の設定サマリー表示
    U-->>S: 変更項目（なし or あり）
    opt 変更あり
        S->>U: 変更項目の再入力
        U-->>S: 新しい値
    end
    S->>ST: .team-config.yml 更新保存
    S->>T: テンプレート合成実行（7ステップ）
    T-->>U: 再生成完了
```

---

## 3. テンプレート合成内部フロー（7ステップ詳細）

```mermaid
flowchart TD
    A[.team-config.yml] --> B[Step1: YAMLパース]
    B --> C[Step2: 派生値計算]
    C -->|plugin_name, skill_*_name, default_channels_list等| D[context辞書]
    D --> E[Step3: ストレージ変数定義]
    E -->|storage.type = backlog-wiki| F1[backlog-wiki 27変数]
    E -->|storage.type = obsidian-vault| F2[obsidian-vault 27変数]
    F1 --> G[Step4: テンプレートファイル処理]
    F2 --> G
    G --> G1["{{storage_operations}} 差し込み"]
    G1 --> G2["{{#array}}...{{/array}} ループ展開"]
    G2 --> G3["{{#cond}}...{{/cond}} 条件評価"]
    G3 --> G4["{{^cond}}...{{/cond}} 否定条件評価"]
    G4 --> G5["{{variable}} 単純置換（再帰的）"]
    G5 --> H[Step5: excluded_commands適用]
    H -->|"excluded_admin_backlog = true"| I["{{^excluded_admin_backlog}} ブロック非表示"]
    I --> J[Step6: 生成物チェック 6項目]
    J -->|PASS| K[Step7: ZIPパッケージング]
    J -->|NG| G
    K --> L["{plugin_name}.plugin 出力"]
```

---

## 4. マイグレーションフロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant C as /forge-migrate
    participant S as generate SKILL
    participant ST as ストレージ（Backlog Wiki / Obsidian）
    participant MR as マイグレーションルール

    U->>C: /forge-migrate path/to/plugin
    C->>S: Skillツール呼び出し（マイグレーションモード）
    S->>ST: .team-config.yml 読み込み + ストレージ接続
    S->>ST: 10件サンプリング
    ST-->>S: format_version 確認
    S->>U: 変更点分析・影響範囲提示
    U-->>S: バッチ選択（全件 / カテゴリ別 / N件）
    loop 各ページ
        S->>ST: ページ読み込み
        S->>MR: templates/migrations/v{from}_to_v{to}.md 参照
        S->>ST: 変換済みページ保存（format_version更新）
    end
    S-->>U: 結果レポート（成功/失敗/スキップ件数）
```

---

## 5. 生成されたプラグインのセッション初期化フロー（最適化A）

### Backlog Wiki（3-Phase）

```mermaid
sequenceDiagram
    participant SK as 生成済みスキル
    participant BL as Backlog MCP

    Note over SK,BL: Phase 1（直列・必須）
    SK->>BL: get_project(projectKey: "PROJECT_KEY")
    BL-->>SK: projectId

    Note over SK,BL: Phase 2（並列）
    par 並列実行
        SK->>BL: get_wiki_pages(keyword: "Home")
        SK->>BL: get_wiki_pages(keyword: "設定/Slackチャンネル")
        SK->>BL: get_wiki_pages(keyword: "設定/競合情報")
        SK->>BL: get_wiki_pages(keyword: "設定/料金体系")
        SK->>BL: get_wiki_pages(keyword: "設定/チームメンバー")
    end
    BL-->>SK: 各ページのwikiId（一括取得完了）

    Note over SK,BL: Phase 3（並列）
    par 並列実行
        SK->>BL: get_wiki(wikiId: homeId)
        SK->>BL: get_wiki(wikiId: slackId)
        SK->>BL: get_wiki(wikiId: competitorsId)
        SK->>BL: get_wiki(wikiId: pricingId)
        SK->>BL: get_wiki(wikiId: membersId)
    end
    BL-->>SK: 各ページ本文（一括取得完了）
    SK->>SK: セッションキャッシュに格納
```

### Obsidian Vault（2-Phase）

```mermaid
sequenceDiagram
    participant SK as 生成済みスキル
    participant OB as Obsidian MCP

    Note over SK,OB: Phase 1（直列・必須）
    SK->>OB: list_directory(path: "{base_path}")
    OB-->>SK: Vault構成確認

    Note over SK,OB: Phase 2（並列）
    par 並列実行
        SK->>OB: read_note(path: "{base_path}/HOME.md")
        SK->>OB: read_note(path: "{base_path}/settings/slack-channels.md")
        SK->>OB: read_note(path: "{base_path}/settings/competitors.md")
        SK->>OB: read_note(path: "{base_path}/settings/pricing.md")
        SK->>OB: read_note(path: "{base_path}/settings/members.md")
    end
    OB-->>SK: 各ノート本文+frontmatter（一括取得完了）
    SK->>SK: セッションキャッシュに格納
```

---

## 6. デイリーログデータ収集フロー（最適化B・E）

```mermaid
flowchart TD
    A["/{pre}-log daily"] --> B[Phase 1: セッション初期化]
    B --> C[Phase 2: 並列データ収集]
    C --> D["Slackバッチ検索\n(in:#ch1 OR in:#ch2 OR #ch3)"]
    C --> E["Google Calendar\n本日のスケジュール取得"]
    C --> F["Backlog Issues\n本日更新課題取得"]
    C --> G["Gmail\n本日の重要メール取得"]
    D --> H[Phase 3: データ統合]
    E --> H
    F --> H
    G --> H
    H --> I[デイリーログフォーマット整形]
    I --> J[ユーザー確認]
    J --> K[ストレージ保存]
```

---

## 7. ストレージ読み書きフロー（wikiIdキャッシュ高速パス、最適化D）

```mermaid
flowchart TD
    A[ページ読み込み要求] --> B{wikiId既知?}
    B -->|Yes: キャッシュ or INDEX| C["get_wiki(wikiId: 既知ID)\n1ターン"]
    B -->|No| D["get_wiki_pages(keyword: ...)\n→ wikiId取得"]
    D --> E["get_wiki(wikiId)\n2ターン"]
    C --> F[ページ本文取得完了]
    E --> F
```

---

## 8. バリデーションフロー（生成物チェック）

```mermaid
flowchart TD
    A[テンプレート合成完了] --> B[チェック1: 未解決変数検出]
    B -->|0件| C[チェック2: 商材名一貫性]
    B -->|1件以上| Z[Step4に戻って修正]
    C -->|PASS| D[チェック3: プレフィクス一貫性]
    C -->|NG| Z
    D -->|PASS| E[チェック4: スキル参照整合性]
    D -->|NG| Z
    E -->|PASS| F[チェック5: ストレージ設定整合性]
    E -->|NG| Z
    F -->|PASS| G[チェック6: ファイル構成検証]
    F -->|NG| Z
    G -->|全PASS| H[パッケージング]
    G -->|NG| Z
```
