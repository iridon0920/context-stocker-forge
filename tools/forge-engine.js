#!/usr/bin/env node
/**
 * context-stocker-forge テンプレートエンジン
 *
 * .team-config.json + テンプレート群 → プラグインファイル一式を生成する。
 * 外部依存パッケージ: なし（Node.js 組み込みモジュールのみ）
 *
 * Usage:
 *   node tools/forge-engine.js <config-path> [--output-dir <dir>] [--zip]
 *
 * Options:
 *   <config-path>          .team-config.json のパス
 *   --output-dir <dir>     出力先ディレクトリ（デフォルト: ./{plugin_name}）
 *   --zip                  .plugin (ZIP) ファイルも生成する
 *   --templates-dir <dir>  テンプレートディレクトリ（デフォルト: forge root の templates/）
 *   --validate-only        生成せずバリデーションのみ実行
 */

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ============================================================
// ユーティリティ
// ============================================================

/** ファイルを再帰的に列挙する */
function walkDir(dir, prefix = '') {
  const entries = [];
  for (const name of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, name);
    const relPath = prefix ? `${prefix}/${name}` : name;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      entries.push(...walkDir(fullPath, relPath));
    } else {
      entries.push({ fullPath, relPath, size: stat.size });
    }
  }
  return entries;
}

// ============================================================
// テンプレートレンダラー
// ============================================================

/**
 * Mustache 風テンプレートをレンダリングする。
 *
 * 対応構文:
 *   {{variable}}                    — 単純置換
 *   {{#block}}...{{/block}}         — truthy / 配列ループ
 *   {{^block}}...{{/block}}         — falsy 条件
 *   {{.}}                           — 配列ループ内の現在値（文字列配列用）
 *
 * ネストされたドットパスにも対応: {{data_sources.slack.enabled}}
 */
function render(template, context) {
  // ブロック展開と変数置換を統合的に処理する。
  // ループ内の変数はアイテムコンテキストで解決する必要があるため、
  // expandBlocks 内で substituteVars も呼ぶ。
  let result = expandBlocks(template, context);
  // 最終パス: トップレベルの変数置換
  result = substituteVars(result, context);
  return result;
}

/** ドットパスで context から値を取得する */
function resolveValue(context, keyPath) {
  if (keyPath === '.') return context;
  // リテラルキーを最優先でチェック（ドット入りキー対応）
  if (Object.prototype.hasOwnProperty.call(context, keyPath)) return context[keyPath];
  // ドットパス分割でナビゲーション
  const parts = keyPath.split('.');
  let current = context;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

/** 値が truthy かどうかを判定する（Mustache 規約: 空配列は falsy） */
function isTruthy(value) {
  if (value === undefined || value === null || value === false || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/**
 * ブロック構文を再帰的に展開する。
 * 最も外側のブロックから処理する（正規表現は non-greedy で最も近い閉じタグを取る）。
 */
function expandBlocks(template, context) {
  // {{#name}} と {{^name}} の両方を処理
  // 同名のネストに対応するため、手動でマッチングする
  let result = template;
  let changed = true;

  // 変化がなくなるまで繰り返す（ネスト対応）
  while (changed) {
    changed = false;
    result = result.replace(
      /\{\{([#^])([^}]+)\}\}([\s\S]*?)\{\{\/\2\}\}/,
      (match, type, name, body) => {
        changed = true;
        const value = resolveValue(context, name.trim());

        if (type === '^') {
          // 否定条件: falsy のときのみ展開
          if (!isTruthy(value)) {
            return expandBlocks(body, context);
          }
          return '';
        }

        // {{#name}}: 配列ならループ、truthy ならそのまま展開
        if (Array.isArray(value)) {
          return value.map(item => {
            // 配列要素がオブジェクトならコンテキストをマージ
            // プリミティブなら {{.}} で参照可能
            const itemContext = typeof item === 'object' && item !== null
              ? { ...context, ...item }
              : { ...context, '.': item };
            // ループ内のネストブロックを展開した後、アイテムコンテキストで変数を解決
            let expanded = expandBlocks(body, itemContext);
            expanded = substituteVars(expanded, itemContext);
            return expanded;
          }).join('');
        }

        if (isTruthy(value)) {
          return expandBlocks(body, context);
        }
        return '';
      }
    );
  }

  return result;
}

/** 単純変数 {{variable}} を置換する */
function substituteVars(template, context) {
  return template.replace(/\{\{([^#^/][^}]*)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const value = resolveValue(context, trimmedKey);
    if (value === undefined || value === null) return match; // 未解決はそのまま残す
    if (typeof value === 'object') return match; // オブジェクトは置換しない
    return String(value);
  });
}

// ============================================================
// コンテキスト構築
// ============================================================

/** 組み込み営業フレームワーク定義 */
const BUILTIN_FRAMEWORKS = {
  BANTCH: [
    { key: 'budget', name: 'Budget（予算）', description: '予算規模・予算確保状況' },
    { key: 'authority', name: 'Authority（決裁者）', description: '意思決定者・決裁ルート' },
    { key: 'need', name: 'Need（ニーズ）', description: '導入理由・課題・期待効果' },
    { key: 'timeline', name: 'Timeline（導入時期）', description: '希望導入時期・マイルストーン' },
    { key: 'competitor', name: 'Competitor（競合）', description: '比較検討中の競合サービス' },
    { key: 'human_resources', name: 'Human Resources（体制）', description: '顧客側の推進体制・キーマン' },
  ],
  BANT: [
    { key: 'budget', name: 'Budget（予算）', description: '予算規模・予算確保状況' },
    { key: 'authority', name: 'Authority（決裁者）', description: '意思決定者・決裁ルート' },
    { key: 'need', name: 'Need（ニーズ）', description: '導入理由・課題・期待効果' },
    { key: 'timeline', name: 'Timeline（導入時期）', description: '希望導入時期・マイルストーン' },
  ],
  MEDDIC: [
    { key: 'metrics', name: 'Metrics（指標）', description: '導入効果を測る定量的指標' },
    { key: 'economic_buyer', name: 'Economic Buyer（予算決裁者）', description: '最終的な予算承認者' },
    { key: 'decision_criteria', name: 'Decision Criteria（決定基準）', description: '選定時の評価基準' },
    { key: 'decision_process', name: 'Decision Process（決定プロセス）', description: '意思決定の流れ・関係者' },
    { key: 'identify_pain', name: 'Identify Pain（課題特定）', description: '顧客の具体的な課題' },
    { key: 'champion', name: 'Champion（推進者）', description: '社内で推進してくれるキーパーソン' },
  ],
};

/**
 * .team-config.json からテンプレートコンテキストを構築する。
 * template-assembly.md の Step 1-5 に対応。
 */
function buildContext(config, forgeRoot) {
  const ctx = {};

  // --- Step 1: config 直接マッピング ---
  Object.assign(ctx, flattenConfig(config));

  // --- Step 2: 派生値の計算 ---
  const prefix = config.product_prefix;
  const productNameLower = config.product_name.toLowerCase();
  const pluginName = `${productNameLower}-context-stocker`;

  ctx.plugin_name = pluginName;
  ctx.product_name_lower = productNameLower;
  ctx.skill_deal_name = `${prefix}-deal`;
  ctx.skill_admin_name = `${prefix}-admin`;
  ctx.skill_log_name = `${prefix}-log`;
  ctx.skill_doc_name = `${prefix}-doc`;
  ctx.skill_knowledge_name = `${prefix}-knowledge`;
  ctx.skill_reference = `${pluginName}:${prefix}-deal`;
  ctx.knowledge_skill_reference = `${pluginName}:${prefix}-knowledge`;
  ctx.skill_knowledge_reference = ctx.knowledge_skill_reference;
  ctx.organization_name = config.team_name;
  ctx.team_scope = `${config.product_name}事業`;
  ctx.index_count = 6;
  ctx.index_page_count = 6;

  // project_key: ストレージ種別に応じて
  if (config.storage.type === 'backlog-wiki') {
    ctx.project_key = config.storage.backlog_wiki.project_key;
    ctx.storage_project_key = config.storage.backlog_wiki.project_key;
  } else if (config.storage.type === 'obsidian-vault') {
    ctx.project_key = config.storage.obsidian_vault.base_path;
    ctx.storage_base_path = config.storage.obsidian_vault.base_path;
  }

  // default_channels_list
  const slackDs = config.data_sources && config.data_sources.slack;
  if (slackDs && slackDs.default_channels && slackDs.default_channels.length > 0) {
    ctx.default_channels_list = slackDs.default_channels.map(c => c.name).join(', ');
    // テンプレート内では {{channel_name}}, {{channel_purpose}} として参照される
    ctx.default_slack_channels = slackDs.default_channels.map(ch => ({
      ...ch,
      channel_name: ch.name,
      channel_purpose: ch.usage,
    }));
  } else {
    ctx.default_channels_list = '（未設定）';
    ctx.default_slack_channels = [];
  }

  // default_projects_list
  const backlogDs = config.data_sources && config.data_sources.backlog_issues;
  if (backlogDs && backlogDs.projects && backlogDs.projects.length > 0) {
    ctx.default_projects_list = backlogDs.projects.map(p => p.name).join(', ');
    ctx.default_backlog_projects = backlogDs.projects;
  } else {
    ctx.default_projects_list = '（未設定）';
    ctx.default_backlog_projects = [];
  }

  // 営業フレームワーク
  const fw = config.sales_framework;
  ctx.sales_framework_name = fw;
  if (BUILTIN_FRAMEWORKS[fw]) {
    ctx.sales_framework_fields = BUILTIN_FRAMEWORKS[fw];
  } else if (config.sales_framework_fields) {
    ctx.sales_framework_fields = config.sales_framework_fields;
  } else {
    ctx.sales_framework_fields = [];
  }

  // sales_framework_sections: Markdownセクションとして展開
  ctx.sales_framework_sections = ctx.sales_framework_fields.map(f =>
    `### ${f.name}\n${f.description}\n\n（記入欄）`
  ).join('\n\n');

  // deal_status_options / deal_type_options (固定値)
  ctx.deal_status_options = '進行中 / 完了 / 失注';
  ctx.deal_type_options = '新規 / アップセル / クロスセル';
  ctx.official_source_name = '公式ドキュメント';

  // deal_name_examples
  ctx.deal_name_examples = `Acme ${config.product_name}導入, XYZ 保守契約更新`;

  // backlog_base_url / slack_workspace_domain
  ctx.backlog_base_url = config.backlog_base_url || 'https://{space}.backlog.com';
  ctx.slack_workspace_domain = config.slack_workspace_domain || '';

  // customer_classifications（デフォルト定義）
  ctx.customer_classifications = config.customer_classifications || [
    { classification_name: '見込客', classification_label: '見込客', classification_description: '新規顧客候補', classification_description_short: '新規', classification_example: 'Acme Corp', classification_target: '新規案件' },
    { classification_name: '既存顧客', classification_label: '既存顧客', classification_description: '契約中の顧客', classification_description_short: '既存', classification_example: 'XYZ Inc', classification_target: '追加案件' },
  ];
  ctx.customer_classification_from = ctx.customer_classifications[0].classification_name;
  ctx.customer_classification_to = ctx.customer_classifications.length > 1
    ? ctx.customer_classifications[1].classification_name : ctx.customer_classifications[0].classification_name;
  ctx.customer_classification_example_path = `${ctx.customer_classifications[0].classification_name}/${ctx.customer_classifications[0].classification_example}/${config.product_name}導入`;
  ctx.context_hierarchy_pattern = config.storage.type === 'backlog-wiki'
    ? '案件/{分類}/{顧客名} 配下に案件ページを作成'
    : `${ctx.project_key}/deals/{分類}/{顧客名} 配下にノートを作成`;

  // data_sources 配列（ループ用）— 有効なソースのみ
  const dsArray = [];
  if (config.data_sources) {
    if (config.data_sources.slack && config.data_sources.slack.enabled)
      dsArray.push({ name: 'Slack', source_name: 'Slack', description: 'チャットメッセージ・スレッド', source_description: 'チャットメッセージ・スレッド', source_hint: 'slack_search_messages' });
    if (config.data_sources.google_calendar && config.data_sources.google_calendar.enabled)
      dsArray.push({ name: 'Google Calendar', source_name: 'Google Calendar', description: '会議・予定', source_description: '会議・予定', source_hint: 'gcal_list_events' });
    if (config.data_sources.gmail && config.data_sources.gmail.enabled)
      dsArray.push({ name: 'Gmail', source_name: 'Gmail', description: 'メール', source_description: 'メール', source_hint: 'gmail_search_messages' });
    if (config.data_sources.google_drive && config.data_sources.google_drive.enabled)
      dsArray.push({ name: 'Google Drive', source_name: 'Google Drive', description: 'ドキュメント・スプレッドシート', source_description: 'ドキュメント・スプレッドシート', source_hint: 'gdrive_search' });
    if (config.data_sources.backlog_issues && config.data_sources.backlog_issues.enabled)
      dsArray.push({ name: 'Backlog Issues', source_name: 'Backlog Issues', description: '課題・タスク', source_description: '課題・タスク', source_hint: 'get_issues' });
  }
  // data_sources: 配列（ループ用）と条件（ドットパスキー）を両立させる。
  // resolveValue はリテラルキーを優先するため、"data_sources.slack.enabled" をキーとして格納。
  if (config.data_sources) {
    const ds = config.data_sources;
    if (ds.slack) ctx['data_sources.slack.enabled'] = !!ds.slack.enabled;
    if (ds.google_calendar) ctx['data_sources.google_calendar.enabled'] = !!ds.google_calendar.enabled;
    if (ds.gmail) ctx['data_sources.gmail.enabled'] = !!ds.gmail.enabled;
    if (ds.google_drive) ctx['data_sources.google_drive.enabled'] = !!ds.google_drive.enabled;
    if (ds.backlog_issues) ctx['data_sources.backlog_issues.enabled'] = !!ds.backlog_issues.enabled;
  }
  ctx.data_sources = dsArray; // ループ用に配列を上書き

  // index_pages 配列（Home, 顧客・案件 を除く個別INDEX）
  // テンプレートでは {{index_page_name}}, {{index_page_description}} として参照される
  ctx.index_pages = [
    { index_name: 'ナレッジ', index_page_name: 'ナレッジ', index_page_display_name: 'ナレッジ', index_description: 'ナレッジINDEX（カテゴリ別）', index_page_description: 'ナレッジINDEX（カテゴリ別）', index_page_header_extra: '', index_page_body_template: 'カテゴリ別テーブル' },
    { index_name: '活動ログ', index_page_name: '活動ログ', index_page_display_name: '活動ログ', index_description: '活動ログINDEX（月別）', index_page_description: '活動ログINDEX（月別）', index_page_header_extra: '', index_page_body_template: '月別テーブル' },
    { index_name: 'KPI', index_page_name: 'KPI', index_page_display_name: 'KPI', index_description: 'KPI実績（月次/週次）', index_page_description: 'KPI実績（月次/週次）', index_page_header_extra: '', index_page_body_template: 'KPI実績テーブル' },
    { index_name: 'OKR', index_page_name: 'OKR', index_page_display_name: 'OKR', index_description: 'OKR進捗', index_page_description: 'OKR進捗', index_page_header_extra: '', index_page_body_template: 'OKR進捗テーブル' },
  ];

  // index_format_rules 配列（全INDEXの詳細フォーマットルール）
  ctx.index_format_rules = [
    { index_page_name: 'Home', index_page_display_name: 'Home', index_page_description: '各INDEXへのリンク集・エントリ数サマリー', index_page_header_extra: '', index_page_body_template: '各INDEXへのリンクとエントリ数', rule_description: 'Homeページは各INDEXへのリンク集' },
    { index_page_name: '顧客・案件', index_page_display_name: '顧客・案件', index_page_description: '全案件リスト（ステータス別）', index_page_header_extra: '| wikiId |', index_page_body_template: 'ステータス別テーブル', rule_description: '顧客・案件INDEXはステータス別に案件をテーブル表示' },
    { index_page_name: 'ナレッジ', index_page_display_name: 'ナレッジ', index_page_description: 'ナレッジINDEX（カテゴリ別）', index_page_header_extra: '', index_page_body_template: 'カテゴリ別テーブル', rule_description: 'ナレッジINDEXはカテゴリ別にナレッジをテーブル表示' },
    { index_page_name: '活動ログ', index_page_display_name: '活動ログ', index_page_description: '活動ログINDEX（月別）', index_page_header_extra: '', index_page_body_template: '月別テーブル', rule_description: '活動ログINDEXは月別にログをテーブル表示' },
  ];

  // knowledge_category_sections / knowledge_index_mapping
  if (config.knowledge_categories) {
    ctx.knowledge_category_sections = config.knowledge_categories.map(cat => ({
      section_name: cat.name,
      section_category_name: cat.name,
      section_content: cat.description,
      category_name: cat.name,
    }));
    ctx.knowledge_index_mapping = config.knowledge_categories.map(cat => ({
      index_name: 'ナレッジ',
      category_name: cat.name,
      category_label: cat.name,
      category_path: `ナレッジ/${cat.name}`,
      category_save_hint: `ナレッジ/${cat.name}/{トピック名}`,
      category_content_description: cat.description,
      category_example_subcategory: (cat.sub_categories && cat.sub_categories[0]) || '',
      category_example_topic: `${cat.name}のサンプルトピック`,
      mapped_categories: cat.name,
      mapped_categories_short: cat.name,
    }));
  }

  // product_subcategories
  const subcats = [];
  if (config.knowledge_categories) {
    for (const cat of config.knowledge_categories) {
      if (cat.sub_categories) {
        for (const sc of cat.sub_categories) {
          subcats.push({
            subcategory_name: sc,
            subcategory_scope: `${config.product_name} ${sc}`,
            subcategory_scope_short: sc,
            subcategory_parent: cat.name,
            subcategory_parent_item: cat.name,
          });
        }
      }
    }
  }
  ctx.product_subcategories = subcats;

  // stale_thresholds（デフォルト定義）
  ctx.stale_thresholds = [
    { monitoring_type: 'ナレッジ', category_label: 'ナレッジ', warn_days: '30', danger_days: '90' },
    { monitoring_type: '設定ページ', category_label: '設定ページ', warn_days: '30', danger_days: '90' },
  ];

  // --- Step 3: ストレージ変数 ---
  const adapterFile = config.storage.type === 'backlog-wiki'
    ? path.join(forgeRoot, 'storage-adapters', 'backlog-wiki.md')
    : path.join(forgeRoot, 'storage-adapters', 'obsidian-vault.md');

  if (fs.existsSync(adapterFile)) {
    ctx.storage_operations = fs.readFileSync(adapterFile, 'utf-8');
  } else {
    ctx.storage_operations = '';
  }

  // ストレージ個別変数はアダプタMDから抽出するのではなく、
  // template-assembly.md の定義に従い直接セットする。
  // これらの値はテンプレート内で使われ、storage_operations とは別物。
  assignStorageVariables(ctx, config);

  // --- Step 5: excluded_commands フラグ ---
  if (config.excluded_commands) {
    for (const cmd of config.excluded_commands) {
      const flag = `excluded_${cmd.replace(/-/g, '_')}`;
      ctx[flag] = true;
    }
  }

  return ctx;
}

/** config をフラットにコンテキストにマッピング */
function flattenConfig(config) {
  const flat = {};
  flat.format_version = config.format_version;
  flat.product_name = config.product_name;
  flat.product_prefix = config.product_prefix;
  flat.team_name = config.team_name;
  flat.storage_type = config.storage.type;

  // knowledge_categories
  if (config.knowledge_categories) {
    flat.knowledge_categories = config.knowledge_categories.map(cat => ({
      ...cat,
      category_name: cat.name,
      category_path: cat.name,
      category_content_description: cat.description,
      category_label: cat.name,
      category_save_hint: `${cat.name}関連`,
      category_example_topic: `${cat.name}のサンプルトピック`,
      category_example_subcategory: (cat.sub_categories && cat.sub_categories[0]) || '',
      has_subcategories: cat.sub_categories && cat.sub_categories.length > 0,
      subcategories: (cat.sub_categories || []).map(s => ({
        '.': s, name: s,
        subcategory_name: s,
        subcategory_scope: `${config.product_name} ${s}`,
        subcategory_scope_short: s,
      })),
    }));
  }

  // sales_framework
  flat.sales_framework = config.sales_framework;
  if (config.sales_framework_fields) {
    flat.sales_framework_fields = config.sales_framework_fields;
  }

  // competitors
  if (config.competitors) {
    flat.competitors = config.competitors.map(c =>
      typeof c === 'string' ? { name: c } : c
    );
  }

  // kpi
  if (config.kpi && config.kpi.revenue_categories) {
    flat.kpi_revenue_categories = config.kpi.revenue_categories;
  }

  // data_sources はbuildContext で配列+リテラルキー方式で設定するため、ここでは設定しない

  // drive_folder_id
  if (config.data_sources && config.data_sources.google_drive
      && config.data_sources.google_drive.folder_id) {
    flat.drive_folder_id = config.data_sources.google_drive.folder_id;
  }

  // pricing_structure（未設定でも空文字でなく説明テキストを入れて未解決変数にならないようにする）
  flat.pricing_structure = config.pricing_structure || '（料金体系は /{prefix}-admin pricing コマンドで設定してください）';

  return flat;
}

/** ストレージ種別に応じた27個の個別変数をセット */
function assignStorageVariables(ctx, config) {
  const pk = ctx.project_key;

  if (config.storage.type === 'backlog-wiki') {
    ctx.storage_name = 'Backlog Wiki';
    ctx.storage_description = 'Backlog Wikiでチーム共有の';
    ctx.storage_create_cmd = 'add_wiki';
    ctx.storage_read_cmd = 'get_wiki';
    ctx.storage_update_cmd = 'update_wiki';
    ctx.storage_search_cmd = 'get_wiki_pages(keyword: ...)';
    ctx.storage_write_cmd = 'add_wiki';
    ctx.storage_rename_cmd = 'update_wiki(name: ...)';
    ctx.storage_list_all_pages_cmd = 'get_wiki_pages(projectId: ...)';
    ctx.storage_get_updated_date_cmd = 'get_wiki のレスポンスの updated フィールド';
    ctx.storage_hierarchy_description = 'Wiki名でパス表現（例: 案件/顧客名/案件名）';
    ctx.storage_page_url_prefix = `https://{space}.backlog.com/wiki/${pk}/`;
    ctx.storage_page_url_template = '{storage_page_url_prefix}{ページ名}';
    ctx.storage_settings_location_description = `プロジェクト ${pk} のWiki「設定/xxx」ページ`;
    ctx.storage_daily_log_wiki_check = 'get_wiki_pages(keyword: "活動ログ/YYYY-MM/YYYY-MM-DD")';

    // 複雑な multi-line 変数
    ctx.storage_session_init = `**Phase 1**（直列・必須）: \`get_project(projectKey: "${pk}")\` でprojectId取得。\n**Phase 2**（すべて並列）: \`get_wiki_pages\` でHome・各設定ページ（Slackチャンネル設定、Backlogプロジェクト設定、競合情報、料金体系、チームメンバー）のwikiIdを一括取得。\n**Phase 3**（並列）: Phase 2のwikiIdで \`get_wiki\` し本文取得・パース・キャッシュ。`;
    ctx.storage_setup_procedure = `1. \`get_project(projectKey: "${pk}")\` でプロジェクトID取得\n2. \`get_wiki_pages(projectId: ...)\` でWiki一覧取得し接続確認`;
    ctx.storage_save_context_procedure = `1. \`get_wiki_pages(projectId: ..., keyword: "{ページ名}")\` で既存チェック\n2. 既存あり → \`get_wiki(wikiId: ...)\` で取得後 \`update_wiki\` で更新\n3. 新規 → \`add_wiki(projectId: ..., name: "案件/{顧客名}/{案件名}", content: ...)\``;
    ctx.storage_save_knowledge_procedure = `1. \`get_wiki_pages(projectId: ..., keyword: "{ページ名}")\` で既存チェック\n2. 既存あり → \`get_wiki(wikiId: ...)\` で取得後 \`update_wiki\` で更新\n3. 新規 → \`add_wiki(projectId: ..., name: "ナレッジ/{カテゴリ名}/{トピック名}", content: ...)\``;
    ctx.storage_index_rebuild_procedure = `1. \`get_wiki_pages(projectId: ...)\` で全ページ取得\n2. ページ名プレフィクスで分類・集計\n3. 各INDEXページを \`update_wiki\` で更新`;
    ctx.storage_index_update_procedure = `保存対象の関連INDEXのみ更新: \`get_wiki(wikiId: {indexWikiId})\` で取得後、行追加・更新して \`update_wiki\``;
    ctx.storage_mcp_tool_table = `| ツール名 | 用途 |\n|---------|------|\n| \`get_project\` | プロジェクトID取得 |\n| \`add_wiki\` | Wikiページ作成 |\n| \`get_wiki_pages\` | ページ一覧・検索 |\n| \`get_wiki\` | ページ本文取得 |\n| \`update_wiki\` | ページ更新 |`;
    ctx.storage_mcp_tool_table_knowledge = `| ツール名 | 用途 |\n|---------|------|\n| \`get_wiki_pages\` | ナレッジ検索 |\n| \`get_wiki\` | ナレッジ本文取得 |\n| \`add_wiki\` | ナレッジ作成 |\n| \`update_wiki\` | ナレッジ更新 |`;
    ctx.storage_link_format_rules = '`[[ページ名]]` 形式でリンクする';
    ctx.storage_link_format_rules_context = '`[[案件/{顧客名}/{案件名}]]`';
    ctx.storage_link_format_rules_index = '`[[INDEX/{カテゴリ名}]]`';
    ctx.storage_link_format_rules_knowledge = '`[[ナレッジ/{カテゴリ名}/{トピック名}]]`';
  } else if (config.storage.type === 'obsidian-vault') {
    const bp = config.storage.obsidian_vault.base_path;
    ctx.storage_name = 'Obsidian Vault';
    ctx.storage_description = 'Obsidian Vaultで個人管理の';
    ctx.storage_create_cmd = 'write_note';
    ctx.storage_read_cmd = 'read_note';
    ctx.storage_update_cmd = 'patch_note or write_note(mode: overwrite)';
    ctx.storage_search_cmd = 'search_notes(query: ...)';
    ctx.storage_write_cmd = 'write_note';
    ctx.storage_rename_cmd = 'move_note';
    ctx.storage_list_all_pages_cmd = `list_directory(path: "${bp}")`;
    ctx.storage_get_updated_date_cmd = 'get_frontmatter のレスポンスの updated フィールド';
    ctx.storage_hierarchy_description = `ファイルパスで階層表現（例: ${bp}/deals/顧客名/案件名.md）`;
    ctx.storage_page_url_prefix = 'obsidian://open?vault=...&file=';
    ctx.storage_page_url_template = '{storage_page_url_prefix}{ファイルパス}';
    ctx.storage_settings_location_description = `Vault内 ${bp}/settings/ 配下のノート`;
    ctx.storage_daily_log_wiki_check = `read_note(path: "${bp}/logs/YYYY-MM/YYYY-MM-DD.md")`;

    // 複雑な multi-line 変数
    ctx.storage_session_init = `**Phase 1**（直列・必須）: \`list_directory(path: "${bp}")\` でVault構成を確認。\n**Phase 2**（並列）: \`read_note\` でHome・各設定ノート（Slackチャンネル設定、Backlogプロジェクト設定、競合情報、料金体系、チームメンバー）・INDEXを一括読み込み・パース・キャッシュ。`;
    ctx.storage_setup_procedure = `1. \`list_directory(path: "${bp}")\` でbase_path存在確認`;
    ctx.storage_save_context_procedure = `1. \`read_note(path: "${bp}/deals/{顧客名}/{案件名}.md")\` で既存チェック\n2. 既存あり → \`write_note(mode: overwrite)\` で更新\n3. 新規 → \`write_note(path: "${bp}/deals/{顧客名}/{案件名}.md", ...)\``;
    ctx.storage_save_knowledge_procedure = `1. \`read_note(path: "${bp}/knowledge/{カテゴリ名}/{トピック名}.md")\` で既存チェック\n2. 既存あり → \`write_note(mode: overwrite)\` で更新\n3. 新規 → \`write_note(path: "${bp}/knowledge/{カテゴリ名}/{トピック名}.md", ...)\``;
    ctx.storage_index_rebuild_procedure = `1. \`list_directory(path: "${bp}")\` で全ノート一覧取得\n2. パスプレフィクスで分類・集計\n3. 各INDEXを \`write_note(mode: overwrite)\` で更新`;
    ctx.storage_index_update_procedure = `保存対象の関連INDEXのみ更新: \`read_note\` で取得後、行追加・更新して \`write_note(mode: overwrite)\``;
    ctx.storage_mcp_tool_table = `| ツール名 | 用途 |\n|---------|------|\n| \`read_note\` | ノート読み込み |\n| \`write_note\` | ノート作成・更新 |\n| \`patch_note\` | ノート部分更新 |\n| \`search_notes\` | ノート検索 |\n| \`list_directory\` | ディレクトリ一覧 |\n| \`update_frontmatter\` | メタデータ更新 |`;
    ctx.storage_mcp_tool_table_knowledge = `| ツール名 | 用途 |\n|---------|------|\n| \`search_notes\` | ナレッジ検索 |\n| \`read_note\` | ナレッジ読み込み |\n| \`write_note\` | ナレッジ作成・更新 |`;
    ctx.storage_link_format_rules = '`[[ファイル名]]` 形式でリンクする';
    ctx.storage_link_format_rules_context = '`[[deals/{顧客名}/{案件名}]]`';
    ctx.storage_link_format_rules_index = '`[[HOME]]` or `[[deals/INDEX]]`';
    ctx.storage_link_format_rules_knowledge = '`[[knowledge/{カテゴリ名}/{トピック名}]]`';
  }
}

// ============================================================
// ファイル生成
// ============================================================

/**
 * テンプレートディレクトリを走査し、コンテキストでレンダリングして出力する。
 */
function generateFiles(templatesDir, outputDir, context, config) {
  const prefix = config.product_prefix;
  const templateFiles = walkDir(templatesDir);
  const generatedFiles = [];

  for (const { fullPath, relPath } of templateFiles) {
    if (!relPath.endsWith('.template')) continue;

    const templateContent = fs.readFileSync(fullPath, 'utf-8');

    // 出力パスの決定
    let outputRelPath = mapOutputPath(relPath, prefix);
    if (!outputRelPath) continue; // スキップ

    // ファイル単位の除外チェック (deal/knowledge)
    if (shouldExcludeFile(outputRelPath, prefix, config)) continue;

    // レンダリング（storage_operations 差し込み後の再帰置換含む）
    let rendered = render(templateContent, context);
    // storage_operations 差し込み後にアダプタ内変数を再解決
    rendered = render(rendered, context);

    // 出力
    const outputPath = path.join(outputDir, outputRelPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, rendered, 'utf-8');
    generatedFiles.push(outputRelPath);
  }

  // .team-config.json を出力にコピー
  fs.writeFileSync(
    path.join(outputDir, '.team-config.json'),
    JSON.stringify(config, null, 2),
    'utf-8'
  );
  generatedFiles.push('.team-config.json');

  return generatedFiles;
}

/**
 * テンプレートの相対パス → 出力の相対パスに変換する。
 * .template 拡張子を除去し、{pre} を product_prefix に置換する。
 */
function mapOutputPath(templateRelPath, prefix) {
  // .template を除去
  let outPath = templateRelPath.replace(/\.template$/, '');

  // commands/ 以下: deal/load.md → {pre}-deal-load.md, admin.md → {pre}-admin.md
  if (outPath.startsWith('commands/')) {
    const rest = outPath.slice('commands/'.length);
    if (rest.includes('/')) {
      // commands/deal/load.md → {pre}-deal-load.md
      const parts = rest.split('/');
      outPath = `commands/${prefix}-${parts.join('-')}`;
    } else {
      // commands/admin.md → {pre}-admin.md
      outPath = `commands/${prefix}-${rest}`;
    }
  }

  // skills/ 以下: skills/{type}/ → skills/{pre}-{type}/
  if (outPath.startsWith('skills/')) {
    const rest = outPath.slice('skills/'.length);
    const slashIdx = rest.indexOf('/');
    if (slashIdx !== -1) {
      const skillType = rest.slice(0, slashIdx);
      const remainder = rest.slice(slashIdx);
      outPath = `skills/${prefix}-${skillType}${remainder}`;
    }
  }

  // plugin-json.template → .claude-plugin/plugin.json
  if (outPath === 'plugin-json') {
    outPath = '.claude-plugin/plugin.json';
  }

  // readme.template → README.md
  if (outPath === 'readme') {
    outPath = 'README.md';
  }

  return outPath;
}

/** ファイル単位での除外判定（deal/knowledge系） */
function shouldExcludeFile(outputPath, prefix, config) {
  if (!config.excluded_commands || config.excluded_commands.length === 0) return false;

  // commands/{pre}-deal-load.md → deal-load
  // commands/{pre}-knowledge-save.md → knowledge-save
  const cmdMatch = outputPath.match(new RegExp(`^commands/${prefix}-(.+)\\.md$`));
  if (cmdMatch) {
    const cmdName = cmdMatch[1];
    // deal-* と knowledge-* はファイル単位で除外
    if ((cmdName.startsWith('deal-') || cmdName.startsWith('knowledge-')) &&
        config.excluded_commands.includes(cmdName)) {
      return true;
    }
  }

  return false;
}

// ============================================================
// バリデーション（Post-Generation Check 6項目）
// ============================================================

function validate(outputDir, config, context) {
  const results = {
    check1: { name: '未解決変数', result: 'PASS', details: [] },
    check2: { name: '商材名一貫性', result: 'PASS', details: [] },
    check3: { name: 'プレフィクス', result: 'PASS', details: [] },
    check4: { name: 'スキル参照', result: 'PASS', details: [] },
    check5: { name: 'ストレージ設定', result: 'PASS', details: [] },
    check6: { name: 'ファイル構成', result: 'PASS', details: [] },
  };

  const prefix = config.product_prefix;
  const pluginName = context.plugin_name;
  const files = walkDir(outputDir);

  // チェック1: 未解決テンプレート変数
  for (const { fullPath, relPath } of files) {
    if (relPath === '.team-config.json') continue;
    const content = fs.readFileSync(fullPath, 'utf-8');
    const matches = content.match(/\{\{[^}]+\}\}/g);
    if (matches) {
      results.check1.result = 'NG';
      results.check1.details.push(`${relPath}: ${matches.join(', ')}`);
    }
  }

  // チェック2: 商材名一貫性（他商材名の混入チェック）
  const knownProducts = ['Twilio', 'SendGrid', 'Zendesk', 'AWS GameLift'];
  const productName = config.product_name;
  const checkProducts = knownProducts.filter(p => p !== productName);
  for (const { fullPath, relPath } of files) {
    if (relPath === '.team-config.json') continue;
    const content = fs.readFileSync(fullPath, 'utf-8');
    for (const other of checkProducts) {
      if (content.includes(other)) {
        results.check2.result = 'NG';
        results.check2.details.push(`${relPath}: "${other}" が混入`);
      }
    }
  }

  // チェック3: コマンドプレフィクス一貫性
  const cmdDir = path.join(outputDir, 'commands');
  if (fs.existsSync(cmdDir)) {
    for (const name of fs.readdirSync(cmdDir)) {
      if (!name.startsWith(`${prefix}-`)) {
        results.check3.result = 'NG';
        results.check3.details.push(`commands/${name}: プレフィクス不一致`);
      }
    }
  }

  // チェック4: スキル参照の整合性
  const pluginJsonPath = path.join(outputDir, '.claude-plugin', 'plugin.json');
  if (fs.existsSync(pluginJsonPath)) {
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
    if (pluginJson.name !== pluginName) {
      results.check4.result = 'NG';
      results.check4.details.push(`plugin.json の name "${pluginJson.name}" ≠ "${pluginName}"`);
    }
  }

  // チェック5: ストレージ設定の整合性
  for (const { fullPath, relPath } of files) {
    if (relPath === '.team-config.json') continue;
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.includes('{{storage_project_key}}') || content.includes('{{storage_base_path}}')) {
      results.check5.result = 'NG';
      results.check5.details.push(`${relPath}: ストレージ変数が未解決`);
    }
  }

  // チェック6: ファイル構成
  const requiredFiles = [
    '.claude-plugin/plugin.json',
    '.team-config.json',
    'README.md',
    `skills/${prefix}-deal/SKILL.md`,
    `skills/${prefix}-knowledge/SKILL.md`,
  ];
  for (const req of requiredFiles) {
    if (!fs.existsSync(path.join(outputDir, req))) {
      results.check6.result = 'NG';
      results.check6.details.push(`必須ファイル不足: ${req}`);
    }
  }

  return results;
}

function printValidationResults(results) {
  console.log('\n=== 生成物チェック結果 ===');
  let hasNG = false;
  for (const [, check] of Object.entries(results)) {
    const status = check.result === 'PASS' ? 'PASS' : 'NG';
    if (status === 'NG') hasNG = true;
    console.log(`${check.name}: [${status}]${check.details.length > 0 ? ` (${check.details.length}件)` : ''}`);
    for (const d of check.details) {
      console.log(`  - ${d}`);
    }
  }
  console.log('========================');
  console.log(`総合結果: ${hasNG ? 'NG' : 'PASS'}`);
  return !hasNG;
}

// ============================================================
// ZIP パッケージング（外部依存なし）
// ============================================================

/**
 * ディレクトリを .plugin (ZIP) ファイルにパッケージする。
 * Node.js 組み込みの zlib のみ使用。
 *
 * ZIP フォーマットの最小実装:
 *   - Local File Header + File Data (Deflate) + Data Descriptor
 *   - Central Directory
 *   - End of Central Directory
 */
function createZip(sourceDir, outputPath) {
  const files = walkDir(sourceDir);
  const entries = [];
  const buffers = [];
  let offset = 0;

  for (const { fullPath, relPath } of files) {
    const fileData = fs.readFileSync(fullPath);
    const compressed = zlib.deflateRawSync(fileData);
    const fileNameBuf = Buffer.from(relPath, 'utf-8');

    // CRC-32
    const crc = crc32(fileData);

    // Local File Header (30 + fileNameLen bytes)
    const lfh = Buffer.alloc(30 + fileNameBuf.length);
    lfh.writeUInt32LE(0x04034b50, 0);      // signature
    lfh.writeUInt16LE(20, 4);              // version needed
    lfh.writeUInt16LE(0, 6);               // flags
    lfh.writeUInt16LE(8, 8);               // compression: deflate
    lfh.writeUInt16LE(0, 10);              // mod time
    lfh.writeUInt16LE(0, 12);              // mod date
    lfh.writeUInt32LE(crc, 14);            // crc-32
    lfh.writeUInt32LE(compressed.length, 18); // compressed size
    lfh.writeUInt32LE(fileData.length, 22);   // uncompressed size
    lfh.writeUInt16LE(fileNameBuf.length, 26); // file name length
    lfh.writeUInt16LE(0, 28);              // extra field length
    fileNameBuf.copy(lfh, 30);

    const entryOffset = offset;
    buffers.push(lfh, compressed);
    offset += lfh.length + compressed.length;

    entries.push({
      fileNameBuf,
      crc,
      compressedSize: compressed.length,
      uncompressedSize: fileData.length,
      localHeaderOffset: entryOffset,
    });
  }

  // Central Directory
  const cdStart = offset;
  for (const entry of entries) {
    const cdh = Buffer.alloc(46 + entry.fileNameBuf.length);
    cdh.writeUInt32LE(0x02014b50, 0);      // signature
    cdh.writeUInt16LE(20, 4);              // version made by
    cdh.writeUInt16LE(20, 6);              // version needed
    cdh.writeUInt16LE(0, 8);               // flags
    cdh.writeUInt16LE(8, 10);              // compression: deflate
    cdh.writeUInt16LE(0, 12);              // mod time
    cdh.writeUInt16LE(0, 14);              // mod date
    cdh.writeUInt32LE(entry.crc, 16);      // crc-32
    cdh.writeUInt32LE(entry.compressedSize, 20);
    cdh.writeUInt32LE(entry.uncompressedSize, 24);
    cdh.writeUInt16LE(entry.fileNameBuf.length, 28);
    cdh.writeUInt16LE(0, 30);              // extra field length
    cdh.writeUInt16LE(0, 32);              // comment length
    cdh.writeUInt16LE(0, 34);              // disk number
    cdh.writeUInt16LE(0, 36);              // internal attrs
    cdh.writeUInt32LE(0, 38);              // external attrs
    cdh.writeUInt32LE(entry.localHeaderOffset, 42);
    entry.fileNameBuf.copy(cdh, 46);

    buffers.push(cdh);
    offset += cdh.length;
  }
  const cdEnd = offset;
  const cdSize = cdEnd - cdStart;

  // End of Central Directory Record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);       // signature
  eocd.writeUInt16LE(0, 4);               // disk number
  eocd.writeUInt16LE(0, 6);               // disk with cd
  eocd.writeUInt16LE(entries.length, 8);   // entries on disk
  eocd.writeUInt16LE(entries.length, 10);  // total entries
  eocd.writeUInt32LE(cdSize, 12);          // cd size
  eocd.writeUInt32LE(cdStart, 16);         // cd offset
  eocd.writeUInt16LE(0, 20);              // comment length
  buffers.push(eocd);

  fs.writeFileSync(outputPath, Buffer.concat(buffers));
}

/** CRC-32 計算（テーブルベース） */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ============================================================
// CLI エントリポイント
// ============================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`Usage: node forge-engine.js <config-path> [options]

Options:
  --output-dir <dir>     出力先ディレクトリ
  --zip                  .plugin (ZIP) ファイルを生成
  --templates-dir <dir>  テンプレートディレクトリ
  --validate-only        バリデーションのみ実行
  --help                 このヘルプを表示`);
    process.exit(0);
  }

  const configPath = path.resolve(args[0]);
  const forgeRoot = path.resolve(__dirname, '..');
  let outputDir = null;
  let doZip = false;
  let templatesDir = path.join(forgeRoot, 'templates');
  let validateOnly = false;

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--output-dir':
        outputDir = path.resolve(args[++i]);
        break;
      case '--zip':
        doZip = true;
        break;
      case '--templates-dir':
        templatesDir = path.resolve(args[++i]);
        break;
      case '--validate-only':
        validateOnly = true;
        break;
    }
  }

  // 設定ファイル読み込み
  if (!fs.existsSync(configPath)) {
    console.error(`Error: 設定ファイルが見つかりません: ${configPath}`);
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    console.error(`Error: JSON パースエラー: ${e.message}`);
    process.exit(1);
  }

  // コンテキスト構築
  const context = buildContext(config, forgeRoot);

  if (!outputDir) {
    outputDir = path.resolve(context.plugin_name);
  }

  if (validateOnly) {
    if (!fs.existsSync(outputDir)) {
      console.error(`Error: 出力ディレクトリが存在しません: ${outputDir}`);
      process.exit(1);
    }
    const results = validate(outputDir, config, context);
    const pass = printValidationResults(results);
    process.exit(pass ? 0 : 1);
  }

  // ファイル生成
  console.log(`設定ファイル: ${configPath}`);
  console.log(`テンプレート: ${templatesDir}`);
  console.log(`出力先: ${outputDir}`);
  console.log('');

  fs.mkdirSync(outputDir, { recursive: true });
  const generated = generateFiles(templatesDir, outputDir, context, config);
  console.log(`生成ファイル数: ${generated.length}`);

  // バリデーション
  const results = validate(outputDir, config, context);
  const pass = printValidationResults(results);

  // ZIP パッケージング
  if (doZip && pass) {
    const zipPath = `${outputDir}.plugin`;
    createZip(outputDir, zipPath);
    console.log(`\nパッケージ生成: ${zipPath}`);
  } else if (doZip && !pass) {
    console.log('\nNG項目があるためパッケージは生成されませんでした。');
  }

  process.exit(pass ? 0 : 1);
}

// モジュールとしてもCLIとしても使用可能
if (require.main === module) {
  main();
} else {
  module.exports = {
    render,
    buildContext,
    generateFiles,
    validate,
    createZip,
    BUILTIN_FRAMEWORKS,
  };
}
