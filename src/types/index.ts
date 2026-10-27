export type UserRole = 'admin' | 'analyst' | 'guest';

export interface UserNotificationPreferences {
  emailAlerts: boolean;
  criticalOnly: boolean;
  dailyDigest: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  department: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
  lastLoginAt?: string;
  twoFactorEnabled?: boolean;
  notificationPreferences: UserNotificationPreferences;
  createdAt: string;
  passwordHash?: string;
}

export interface RolePermissionMatrix {
  role: UserRole;
  label: string;
  description: string;
  permissions: {
    canManageConnections: boolean;
    canPrepareDatasets: boolean;
    canDeleteDatasets: boolean;
    canComposeSlices: boolean;
    canExecuteCustomSql: boolean;
    canConfigureAlerts: boolean;
    canManageUsers: boolean;
    canManageApiKeys: boolean;
    canExportReports: boolean;
    canViewExecutiveBriefs: boolean;
  };
}

export type ConnectionMode = 'direct' | 'active_simulator' | 'tunnel_bridge' | 'ords_rest';

export interface OracleConnectionConfig {
  host: string;
  port: number;
  sid: string;
  serviceName: string;
  username: string;
  password?: string;
  schema: string;
  useSsl: boolean;
  tnsName?: string;
  connectionMode: ConnectionMode;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  latencyMs: number;
  lastTestedAt?: string;
  oracleVersion: string;
  lastError?: {
    code: string;
    message: string;
    isPrivateNetwork?: boolean;
    recommendation?: {
      tunnelCommand?: string;
      tunnelAlternative?: string;
    };
  };
}

export interface OracleColumn {
  name: string;
  dataType: 'VARCHAR2' | 'NUMBER' | 'DATE' | 'TIMESTAMP' | 'FLOAT';
  nullable: boolean;
  isPrimaryKey?: boolean;
  sampleValues: (string | number)[];
}

export interface OracleTable {
  tableName: string;
  owner: string;
  rowCount: number;
  bytesSizeMb: number;
  columns: OracleColumn[];
  description: string;
}

export interface FactSalesRow {
  saleId: number;
  timestamp: string;
  region: 'North America' | 'EMEA' | 'Asia Pacific' | 'Latin America';
  productCategory: 'Cloud Services' | 'Hardware Appliances' | 'Enterprise Licenses' | 'Technical Support';
  customerSegment: 'Enterprise' | 'Strategic SMB' | 'Public Sector';
  channel: 'Direct Field Sales' | 'Channel Partner' | 'Digital Mart';
  amount: number;
  cost: number;
  profit: number;
  quantity: number;
}

export interface SysWarehouseMetric {
  timestamp: string;
  cpuPercent: number;
  memoryMb: number;
  activeSessions: number;
  bufferCacheHitRatio: number;
  iops: number;
  redoLogLatencyMs: number;
  queryThroughputQps: number;
}

export interface InventoryItem {
  sku: string;
  name: string;
  warehouseLocation: string;
  stockLevel: number;
  reorderPoint: number;
  unitCost: number;
  status: 'OPTIMAL' | 'REORDER_NOW' | 'CRITICAL_LOW';
}

// Prepared Dataset Entity for Dynamic Analysis
export interface DatasetField {
  name: string;
  label: string;
  type: 'dimension' | 'metric';
  dataType: 'VARCHAR2' | 'NUMBER' | 'DATE' | 'TIMESTAMP' | 'FLOAT';
  defaultAgg?: AggregationType;
}

export interface PreparedDataset {
  id: string;
  name: string;
  description: string;
  sourceType: 'oracle_sql' | 'oracle_table' | 'oracle_dump';
  sourceQuery: string;
  sourceTable?: string;
  createdAt: string;
  updatedAt: string;
  fields: DatasetField[];
  records: Record<string, any>[];
  rowCount: number;
  createdBy: string;
}

export type SliceType = 
  | 'time_series' 
  | 'bar_chart' 
  | 'stacked_bar' 
  | 'donut' 
  | 'pivot_table' 
  | 'gauge' 
  | 'funnel' 
  | 'kpi_card';

export type AggregationType = 'SUM' | 'AVG' | 'COUNT' | 'MAX' | 'MIN';

export interface SupersetSlice {
  id: string;
  datasetId?: string;
  title: string;
  sliceType: SliceType;
  dimension: string;
  metric: string;
  secondaryDimension?: string;
  aggregation: AggregationType;
  timeRange: '15m' | '1h' | '24h' | '7d' | '30d';
  colorPalette?: string;
  description?: string;
  order?: number;
}

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AlertRule {
  id: string;
  name: string;
  datasetId?: string;
  metricKey: string;
  metricLabel: string;
  operator: '>' | '<' | '>=' | '<=' | '=';
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  emailRecipients: string[];
  cooldownMinutes: number;
  lastTriggeredAt?: string;
}

export interface AlertBreachEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  metricKey: string;
  metricLabel: string;
  threshold: number;
  actualValue: number;
  operator: string;
  triggeredAt: string;
  emailDispatchedTo: string[];
  resolved: boolean;
  diagnosticNotes: string;
}

export interface EmailNotification {
  id: string;
  to: string[];
  subject: string;
  breachId: string;
  sentAt: string;
  severity: AlertSeverity;
  htmlPreview: string;
  status: 'DELIVERED' | 'DISPATCHING';
}

export interface SQLQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  query: string;
  executedAt: string;
  planNotes?: string;
}

export interface ThirdPartyApiKey {
  id: string;
  keyName: string;
  apiKey: string;
  createdAt: string;
  permissions: ('read' | 'export' | 'query')[];
  lastUsedAt?: string;
}

export interface WebhookConfig {
  id: string;
  targetUrl: string;
  secret: string;
  events: ('alert.breach' | 'report.generated' | 'warehouse.sync')[];
  enabled: boolean;
  lastStatus?: number;
  lastDispatchedAt?: string;
}

export type ActiveView = 
  | 'dashboard' 
  | 'visualizer' 
  | 'builder' 
  | 'dataset_studio' 
  | 'oracle' 
  | 'sql' 
  | 'alerts' 
  | 'reports' 
  | 'api' 
  | 'profile';

