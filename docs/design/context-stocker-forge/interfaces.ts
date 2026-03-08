/**
 * context-stocker-forge 型定義集約（逆生成）
 * 分析日時: 2026-03-07（更新: 2026-03-08、v0.8.0対応）
 *
 * 注意: context-stocker-forgeはTypeScriptアプリケーションではなく
 * Claude Codeプラグイン（Markdownベース）である。本ファイルは
 * システムのデータ構造をTypeScriptインターフェースとして文書化したもの。
 */

// ======================
// .team-config.yml 型定義
// ======================

/** ストレージ種別 */
export type StorageType = "backlog-wiki" | "obsidian-vault";

/** Backlog Wiki ストレージ設定 */
export interface BacklogWikiStorage {
  project_key: string; // 例: "ZENDESK_PRJ"
}

/** Obsidian Vault ストレージ設定 */
export interface ObsidianVaultStorage {
  base_path: string; // 例: "zendesk"
}

/** ストレージ設定 */
export interface StorageConfig {
  type: StorageType;
  backlog_wiki?: BacklogWikiStorage;
  obsidian_vault?: ObsidianVaultStorage;
}

/** ナレッジカテゴリ定義 */
export interface KnowledgeCategory {
  name: string;            // 例: "製品・技術仕様"
  description: string;     // 例: "{product_name}各製品の機能・仕様・技術的なTips"
  required?: boolean;      // true=削除不可
  sub_categories?: string[];
}

/** 営業フレームワーク組み込み名 */
export type BuiltinSalesFramework = "BANTCH" | "BANT" | "MEDDIC";

/** 営業フレームワークフィールド定義 */
export interface SalesFrameworkField {
  key: string;          // 例: "budget"
  name: string;         // 例: "Budget（予算）"
  description: string;  // 例: "予算規模・予算確保状況"
}

/** KPI設定 */
export interface KpiConfig {
  revenue_categories: string[]; // 例: ["ライセンス", "プロサービス"]
}

/** Slackチャンネル設定 */
export interface SlackChannel {
  name: string;  // チャンネル名
  id: string;    // チャンネルID
  usage: string; // 用途説明
}

/** Slack データソース設定 */
export interface SlackDataSource {
  enabled: boolean;
  default_channels?: SlackChannel[];
}

/** Google Calendar データソース設定 */
export interface GoogleCalendarDataSource {
  enabled: boolean;
}

/** Gmail データソース設定 */
export interface GmailDataSource {
  enabled: boolean;
}

/** Google Drive データソース設定 */
export interface GoogleDriveDataSource {
  enabled: boolean;
  folder_id?: string;
}

/** Backlog Issue プロジェクト設定 */
export interface BacklogIssueProject {
  key: string;   // プロジェクトキー
  name: string;  // プロジェクト名
}

/** Backlog Issues データソース設定 */
export interface BacklogIssuesDataSource {
  enabled: boolean;
  projects?: BacklogIssueProject[];
}

/** データソース設定 */
export interface DataSourcesConfig {
  slack?: SlackDataSource;
  google_calendar?: GoogleCalendarDataSource;
  gmail?: GmailDataSource;
  google_drive?: GoogleDriveDataSource;
  backlog_issues?: BacklogIssuesDataSource;
}

/** 除外可能なコマンド名 */
export type ExcludableCommand =
  | "deal-load" | "deal-save"
  | "knowledge-save" | "knowledge-search"
  | "log-daily" | "log-weekly" | "log-report"
  | "admin-index" | "admin-setup" | "admin-slack" | "admin-backlog"
  | "admin-stale" | "admin-migrate" | "admin-kpi-set" | "admin-okr-set"
  | "admin-competitors" | "admin-pricing" | "admin-members"
  | "doc-prep" | "doc-proposal" | "doc-estimate"
  | "engdoc-hearing" | "engdoc-config" | "engdoc-testcases";

/** .team-config.yml ルートスキーマ */
export interface TeamConfig {
  format_version: 1;        // 現在は1のみ
  product_name: string;      // 事業名・商材名
  product_prefix: string;    // 2-4文字英小文字
  team_name: string;         // チーム名
  plugin_name: string;       // 自動生成: "{product_name_lower}-context-stocker"
  storage: StorageConfig;
  knowledge_categories: KnowledgeCategory[];
  sales_framework: BuiltinSalesFramework | string;
  sales_framework_fields?: SalesFrameworkField[];
  competitors?: string[];
  pricing_structure?: string;
  kpi?: KpiConfig;
  data_sources: DataSourcesConfig;
  excluded_commands?: ExcludableCommand[];
}

// ======================
// テンプレートコンテキスト型定義
// ======================

/** テンプレート合成コンテキスト（派生値含む全変数） */
export interface TemplateContext extends TeamConfig {
  // カテゴリ2: 派生値
  plugin_name: string;             // "{product_name_lower}-context-stocker"
  skill_deal_name: string;         // "{product_prefix}-deal"
  skill_admin_name: string;        // "{product_prefix}-admin"
  skill_log_name: string;          // "{product_prefix}-log"
  skill_doc_name: string;          // "{product_prefix}-doc"
  skill_knowledge_name: string;    // "{product_prefix}-knowledge"
  skill_reference: string;         // "{plugin_name}:{product_prefix}-deal"
  knowledge_skill_reference: string; // "{plugin_name}:{product_prefix}-knowledge"
  skill_knowledge_reference: string; // same as knowledge_skill_reference
  product_name_lower: string;      // product_name の小文字変換
  organization_name: string;       // team_name と同値
  team_scope: string;              // "{product_name}事業"
  project_key: string;             // backlog_wiki.project_key or obsidian_vault.base_path
  index_count: 6;                  // Home + 5 INDEX
  index_page_count: 6;
  default_channels_list: string;   // チャンネル名カンマ区切り or "（未設定）"
  default_projects_list: string;   // プロジェクト名カンマ区切り or "（未設定）"
  backlog_base_url: string;        // "https://{space}.backlog.com"
  slack_workspace_domain: string;
  sales_framework_name: string;
  sales_framework_sections: string; // Markdownセクション展開済み

  // カテゴリ3: ストレージ個別変数
  storage_name: string;
  storage_description: string;
  storage_create_cmd: string;
  storage_read_cmd: string;
  storage_update_cmd: string;
  storage_search_cmd: string;
  storage_write_cmd: string;
  storage_rename_cmd: string;
  storage_list_all_pages_cmd: string;
  storage_get_updated_date_cmd: string;
  storage_session_init: string;
  storage_setup_procedure: string;
  storage_save_context_procedure: string;
  storage_save_knowledge_procedure: string;
  storage_index_rebuild_procedure: string;
  storage_index_update_procedure: string;
  storage_hierarchy_description: string;
  storage_mcp_tool_table: string;
  storage_mcp_tool_table_knowledge: string;
  storage_link_format_rules: string;
  storage_link_format_rules_context: string;
  storage_link_format_rules_index: string;
  storage_link_format_rules_knowledge: string;
  storage_page_url_prefix: string;
  storage_page_url_template: string;
  storage_settings_location_description: string;
  storage_daily_log_wiki_check: string;

  // カテゴリ5: excluded_commandsから生成されるフラグ変数
  excluded_deal_load?: true;
  excluded_deal_save?: true;
  excluded_knowledge_save?: true;
  excluded_knowledge_search?: true;
  excluded_log_daily?: true;
  excluded_log_weekly?: true;
  excluded_log_report?: true;
  excluded_admin_setup?: true;
  excluded_admin_index?: true;
  excluded_admin_slack?: true;
  excluded_admin_backlog?: true;
  excluded_admin_stale?: true;
  excluded_admin_migrate?: true;
  excluded_admin_kpi_set?: true;
  excluded_admin_okr_set?: true;
  excluded_admin_competitors?: true;
  excluded_admin_pricing?: true;
  excluded_admin_members?: true;
  excluded_doc_prep?: true;
  excluded_doc_proposal?: true;
  excluded_doc_estimate?: true;
  excluded_engdoc_hearing?: true;
  excluded_engdoc_config?: true;
  excluded_engdoc_testcases?: true;
}

// ======================
// ストレージアダプタ型定義
// ======================

/** ストレージアダプタ共通インターフェース（27変数契約） */
export interface StorageAdapterVariables {
  storage_name: string;
  storage_description: string;
  storage_create_cmd: string;
  storage_read_cmd: string;
  storage_update_cmd: string;
  storage_search_cmd: string;
  storage_write_cmd: string;
  storage_rename_cmd: string;
  storage_list_all_pages_cmd: string;
  storage_get_updated_date_cmd: string;
  storage_session_init: string;
  storage_setup_procedure: string;
  storage_save_context_procedure: string;
  storage_save_knowledge_procedure: string;
  storage_index_rebuild_procedure: string;
  storage_index_update_procedure: string;
  storage_hierarchy_description: string;
  storage_mcp_tool_table: string;
  storage_mcp_tool_table_knowledge: string;
  storage_link_format_rules: string;
  storage_link_format_rules_context: string;
  storage_link_format_rules_index: string;
  storage_link_format_rules_knowledge: string;
  storage_page_url_prefix: string;
  storage_page_url_template: string;
  storage_settings_location_description: string;
  storage_daily_log_wiki_check: string;
}

// ======================
// ウィザード入力型定義
// ======================

/** ウィザードStep 1 入力 */
export interface WizardStep1Input {
  team_name: string;
  product_name: string;
  product_prefix: string; // 2-4文字英小文字、自動提案あり
}

/** ウィザードStep 2 入力（Backlog Wiki選択時） */
export interface WizardStep2BacklogInput {
  storage_type: "backlog-wiki";
  project_key: string; // 英大文字・数字・アンダースコア
}

/** ウィザードStep 2 入力（Obsidian Vault選択時） */
export interface WizardStep2ObsidianInput {
  storage_type: "obsidian-vault";
  base_path: string; // 有効なパス文字列
}

export type WizardStep2Input = WizardStep2BacklogInput | WizardStep2ObsidianInput;

/** ウィザードStep 3 入力（営業フレームワーク選択） */
export interface WizardStep3Input {
  sales_framework: BuiltinSalesFramework | "custom";
  custom_fields?: SalesFrameworkField[]; // "custom"選択時のみ、最低1フィールド
}

/** ウィザードStep 4 入力（データソース選択） */
export interface WizardStep4Input {
  slack_enabled: boolean;           // デフォルト: true
  google_calendar_enabled: boolean; // デフォルト: true
  gmail_enabled: boolean;           // デフォルト: true
  google_drive_enabled: boolean;    // デフォルト: true
  backlog_issues_enabled: boolean;  // デフォルト: false
}

/** ウィザードStep 5 入力（ナレッジカテゴリ設定） */
export interface WizardStep5Input {
  use_default: boolean; // true=デフォルト2カテゴリ、false=カスタマイズ
  categories?: KnowledgeCategory[]; // カスタマイズ時、最低1カテゴリ、required=trueは削除不可
}

/** ウィザード確認ステップ */
export interface WizardConfirmation {
  proceed: boolean;
}

// ======================
// 生成物バリデーション型定義
// ======================

/** バリデーションチェック結果 */
export type ValidationResult = "PASS" | "NG";

/** 6項目バリデーション結果 */
export interface PostGenerationCheckResult {
  check1_unresolved_variables: ValidationResult;
  check2_product_name_consistency: ValidationResult;
  check3_prefix_consistency: ValidationResult;
  check4_skill_reference_integrity: ValidationResult;
  check5_storage_config_integrity: ValidationResult;
  check6_file_structure: ValidationResult;
  overall: ValidationResult;
  issues?: string[]; // NG項目の詳細
}

// ======================
// マイグレーション型定義
// ======================

/** マイグレーションバッチ選択 */
export type MigrationBatchMode = "all" | "by-category" | "n-items";

/** マイグレーション結果 */
export interface MigrationResult {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors?: Array<{
    page_name: string;
    error: string;
  }>;
}

/** format_version定義 */
export type FormatVersion = 1; // 現在は1のみ（将来拡張用）
