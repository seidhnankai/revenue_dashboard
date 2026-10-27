import { 
  OracleTable, 
  FactSalesRow, 
  SysWarehouseMetric, 
  InventoryItem, 
  AlertRule, 
  SupersetSlice, 
  SQLQueryResult, 
  UserProfile,
  RolePermissionMatrix 
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-1',
    name: 'Sarah Chen (DBA Lead)',
    email: 'sarah.chen@enterprise.oracle.corp',
    role: 'admin',
    title: 'Lead Database Administrator & Data Architect',
    department: 'Enterprise Data Architecture',
    phone: '+1 (555) 234-8901',
    status: 'active',
    lastLoginAt: '2026-10-26T22:30:00Z',
    twoFactorEnabled: true,
    notificationPreferences: {
      emailAlerts: true,
      criticalOnly: false,
      dailyDigest: true
    },
    createdAt: '2026-01-15T08:00:00Z',
    passwordHash: 'Admin2026!'
  },
  {
    id: 'usr-analyst-1',
    name: 'Marcus Vance (BI Analyst)',
    email: 'm.vance@analytics.corp',
    role: 'analyst',
    title: 'Senior Business Intelligence Specialist',
    department: 'Commercial Analytics & Operations',
    phone: '+1 (555) 872-3109',
    status: 'active',
    lastLoginAt: '2026-10-26T18:15:00Z',
    twoFactorEnabled: false,
    notificationPreferences: {
      emailAlerts: true,
      criticalOnly: true,
      dailyDigest: true
    },
    createdAt: '2026-03-01T09:30:00Z',
    passwordHash: 'Analyst2026!'
  },
  {
    id: 'usr-guest-1',
    name: 'Auditor User (Executive Viewer)',
    email: 'ibnhassen3@gmail.com',
    role: 'guest',
    title: 'External Systems Auditor & Board Reviewer',
    department: 'Corporate Governance & Audit',
    phone: '+1 (555) 412-9022',
    status: 'active',
    lastLoginAt: '2026-10-26T21:40:00Z',
    twoFactorEnabled: false,
    notificationPreferences: {
      emailAlerts: false,
      criticalOnly: true,
      dailyDigest: false
    },
    createdAt: '2026-05-12T14:20:00Z',
    passwordHash: 'Guest2026!'
  }
];

export const ROLE_PERMISSIONS: RolePermissionMatrix[] = [
  {
    role: 'admin',
    label: 'Administrator (DBA)',
    description: 'Full administrative control over Oracle 11g database connection, Dataset Studio, User Directory, Threshold Alert rules, and Third-Party API Keys.',
    permissions: {
      canManageConnections: true,
      canPrepareDatasets: true,
      canDeleteDatasets: true,
      canComposeSlices: true,
      canExecuteCustomSql: true,
      canConfigureAlerts: true,
      canManageUsers: true,
      canManageApiKeys: true,
      canExportReports: true,
      canViewExecutiveBriefs: true,
    }
  },
  {
    role: 'analyst',
    label: 'Data Analyst',
    description: 'Analytical authoring permissions: can inspect datasets, compose visual slices with the Drag-and-Drop Builder, run SQL queries in the Workbench, and export reports.',
    permissions: {
      canManageConnections: false,
      canPrepareDatasets: true,
      canDeleteDatasets: false,
      canComposeSlices: true,
      canExecuteCustomSql: true,
      canConfigureAlerts: false,
      canManageUsers: false,
      canManageApiKeys: false,
      canExportReports: true,
      canViewExecutiveBriefs: true,
    }
  },
  {
    role: 'guest',
    label: 'Guest / Executive Viewer',
    description: 'Restricted read-only access: can view interactive dashboards, slice and drill down into datasets, apply temporal filters, and export executive PDF/CSV summaries.',
    permissions: {
      canManageConnections: false,
      canPrepareDatasets: false,
      canDeleteDatasets: false,
      canComposeSlices: false,
      canExecuteCustomSql: false,
      canConfigureAlerts: false,
      canManageUsers: false,
      canManageApiKeys: false,
      canExportReports: true,
      canViewExecutiveBriefs: true,
    }
  }
];

export const INITIAL_TABLES: OracleTable[] = [
  {
    tableName: 'FACT_SALES',
    owner: 'SH',
    rowCount: 248900,
    bytesSizeMb: 142.6,
    description: 'Core partitioned sales facts containing transaction amounts, channel, margin, and region.',
    columns: [
      { name: 'SALE_ID', dataType: 'NUMBER', nullable: false, isPrimaryKey: true, sampleValues: [10001, 10002, 10003] },
      { name: 'TIME_KEY', dataType: 'TIMESTAMP', nullable: false, sampleValues: ['2026-10-25 14:20:00', '2026-10-25 14:21:12'] },
      { name: 'REGION', dataType: 'VARCHAR2', nullable: false, sampleValues: ['North America', 'EMEA', 'Asia Pacific', 'Latin America'] },
      { name: 'PRODUCT_CATEGORY', dataType: 'VARCHAR2', nullable: false, sampleValues: ['Cloud Services', 'Hardware Appliances', 'Enterprise Licenses', 'Technical Support'] },
      { name: 'CUSTOMER_SEGMENT', dataType: 'VARCHAR2', nullable: false, sampleValues: ['Enterprise', 'Strategic SMB', 'Public Sector'] },
      { name: 'CHANNEL', dataType: 'VARCHAR2', nullable: false, sampleValues: ['Direct Field Sales', 'Channel Partner', 'Digital Mart'] },
      { name: 'AMOUNT', dataType: 'NUMBER', nullable: false, sampleValues: [12500, 4800, 92000, 3100] },
      { name: 'COST', dataType: 'NUMBER', nullable: false, sampleValues: [5200, 2100, 39000, 1100] },
      { name: 'PROFIT', dataType: 'NUMBER', nullable: false, sampleValues: [7300, 2700, 53000, 2000] },
      { name: 'QUANTITY', dataType: 'NUMBER', nullable: false, sampleValues: [1, 4, 12, 2] }
    ]
  },
  {
    tableName: 'SYS_WAREHOUSE_METRICS',
    owner: 'SYS',
    rowCount: 518400,
    bytesSizeMb: 89.2,
    description: 'Oracle 11g internal V$SYSMETRIC and SGA buffer performance monitoring time-series.',
    columns: [
      { name: 'METRIC_TIME', dataType: 'TIMESTAMP', nullable: false, isPrimaryKey: true, sampleValues: ['2026-10-26 06:40:00'] },
      { name: 'CPU_PERCENT', dataType: 'NUMBER', nullable: false, sampleValues: [42.5, 68.1, 79.4] },
      { name: 'MEMORY_MB', dataType: 'NUMBER', nullable: false, sampleValues: [32768, 32768] },
      { name: 'ACTIVE_SESSIONS', dataType: 'NUMBER', nullable: false, sampleValues: [48, 62, 71] },
      { name: 'BUFFER_CACHE_HIT_RATIO', dataType: 'NUMBER', nullable: false, sampleValues: [96.8, 98.4, 94.2] },
      { name: 'IOPS', dataType: 'NUMBER', nullable: false, sampleValues: [4120, 6890, 8240] },
      { name: 'REDO_LOG_LATENCY_MS', dataType: 'NUMBER', nullable: false, sampleValues: [4.2, 5.8, 12.1] }
    ]
  },
  {
    tableName: 'FACT_INVENTORY_METRICS',
    owner: 'OPS',
    rowCount: 18450,
    bytesSizeMb: 14.8,
    description: 'Supply-chain inventory levels, stock reorder triggers, and hardware spare parts.',
    columns: [
      { name: 'SKU', dataType: 'VARCHAR2', nullable: false, isPrimaryKey: true, sampleValues: ['HW-EXA-X8', 'HW-SPARC-M8', 'NET-100G-SW'] },
      { name: 'ITEM_NAME', dataType: 'VARCHAR2', nullable: false, sampleValues: ['Exadata Storage Server X8M', 'SPARC T8 Compute Blade', '100GbE Spine Switch'] },
      { name: 'LOCATION', dataType: 'VARCHAR2', nullable: false, sampleValues: ['Warehouse Ashburn-VA', 'Warehouse Frankfurt-DE', 'Warehouse Tokyo-JP'] },
      { name: 'STOCK_LEVEL', dataType: 'NUMBER', nullable: false, sampleValues: [240, 85, 310] },
      { name: 'REORDER_POINT', dataType: 'NUMBER', nullable: false, sampleValues: [100, 100, 150] },
      { name: 'UNIT_COST', dataType: 'NUMBER', nullable: false, sampleValues: [8500, 12400, 6200] }
    ]
  },
  {
    tableName: 'DIM_CUSTOMERS',
    owner: 'SH',
    rowCount: 85200,
    bytesSizeMb: 52.1,
    description: 'Customer master dimension with account classification, geographic region, and credit standing.',
    columns: [
      { name: 'CUST_ID', dataType: 'NUMBER', nullable: false, isPrimaryKey: true, sampleValues: [801, 802, 803] },
      { name: 'CUST_NAME', dataType: 'VARCHAR2', nullable: false, sampleValues: ['Acrobatics Financial Corp', 'Nordic Health Systems', 'Vanguard Telecom'] },
      { name: 'COUNTRY', dataType: 'VARCHAR2', nullable: false, sampleValues: ['United States', 'Germany', 'Japan', 'United Kingdom'] },
      { name: 'SEGMENT', dataType: 'VARCHAR2', nullable: false, sampleValues: ['Enterprise', 'Strategic SMB', 'Public Sector'] },
      { name: 'CREDIT_LIMIT', dataType: 'NUMBER', nullable: false, sampleValues: [500000, 120000, 2000000] }
    ]
  }
];

export const INITIAL_ALERT_RULES: AlertRule[] = [
  {
    id: 'rule-cpu-breach',
    name: 'Oracle SGA High CPU Utilization',
    metricKey: 'cpuPercent',
    metricLabel: 'Warehouse Host CPU (%)',
    operator: '>',
    threshold: 82,
    severity: 'CRITICAL',
    enabled: true,
    emailRecipients: ['dba-oncall@enterprise.oracle.corp', 'ibnhassen3@gmail.com'],
    cooldownMinutes: 15,
    lastTriggeredAt: '2026-10-26T06:12:00Z'
  },
  {
    id: 'rule-cache-hit',
    name: 'Buffer Cache Hit Ratio Degradation',
    metricKey: 'bufferCacheHitRatio',
    metricLabel: 'Buffer Cache Hit Ratio (%)',
    operator: '<',
    threshold: 92,
    severity: 'WARNING',
    enabled: true,
    emailRecipients: ['performance-team@enterprise.oracle.corp'],
    cooldownMinutes: 30
  },
  {
    id: 'rule-redo-latency',
    name: 'Redo Log Flush Latency Spike',
    metricKey: 'redoLogLatencyMs',
    metricLabel: 'Redo Latency (ms)',
    operator: '>',
    threshold: 14,
    severity: 'WARNING',
    enabled: true,
    emailRecipients: ['storage-admins@enterprise.oracle.corp'],
    cooldownMinutes: 20
  },
  {
    id: 'rule-stock-shortage',
    name: 'Mission-Critical Hardware Stock Low',
    metricKey: 'stockLevel',
    metricLabel: 'Warehouse Stock Level',
    operator: '<',
    threshold: 90,
    severity: 'CRITICAL',
    enabled: true,
    emailRecipients: ['logistics-ops@enterprise.oracle.corp', 'ibnhassen3@gmail.com'],
    cooldownMinutes: 60,
    lastTriggeredAt: '2026-10-26T05:30:00Z'
  }
];

export const INITIAL_SLICES: SupersetSlice[] = [
  {
    id: 'slice-revenue-velocity',
    title: 'Real-Time Revenue & Profit Stream',
    sliceType: 'time_series',
    dimension: 'timestamp',
    metric: 'amount',
    secondaryDimension: 'profit',
    aggregation: 'SUM',
    timeRange: '24h',
    description: 'Hourly revenue velocity across global Oracle 11g data warehouse partitions.'
  },
  {
    id: 'slice-category-region',
    title: 'Revenue by Product Category & Region',
    sliceType: 'bar_chart',
    dimension: 'productCategory',
    metric: 'amount',
    secondaryDimension: 'region',
    aggregation: 'SUM',
    timeRange: '30d',
    description: 'Multi-dimensional categorical breakdown with drill-down capability.'
  },
  {
    id: 'slice-customer-segment',
    title: 'Customer Segment Revenue Allocation',
    sliceType: 'donut',
    dimension: 'customerSegment',
    metric: 'amount',
    aggregation: 'SUM',
    timeRange: '30d',
    description: 'Proportion of revenue generated by Enterprise vs Strategic SMB clients.'
  },
  {
    id: 'slice-sga-gauge',
    title: 'Oracle Buffer Cache Hit Ratio',
    sliceType: 'gauge',
    dimension: 'metricTime',
    metric: 'bufferCacheHitRatio',
    aggregation: 'AVG',
    timeRange: '1h',
    description: 'SGA buffer efficiency: readings under 92% trigger automated tuning alerts.'
  },
  {
    id: 'slice-sales-funnel',
    title: 'Enterprise Pipeline Conversion Funnel',
    sliceType: 'funnel',
    dimension: 'channel',
    metric: 'quantity',
    aggregation: 'COUNT',
    timeRange: '30d',
    description: 'Pipeline velocity from initial contact through Oracle contract delivery.'
  },
  {
    id: 'slice-regional-pivot',
    title: 'Regional Margin & Performance Pivot',
    sliceType: 'pivot_table',
    dimension: 'region',
    metric: 'amount',
    secondaryDimension: 'productCategory',
    aggregation: 'SUM',
    timeRange: '7d',
    description: 'Cross-tabulation pivot matrix with automated margin and unit volume totals.'
  }
];

// Helper to generate simulated recent transactions
export function generateInitialSales(): FactSalesRow[] {
  const regions: FactSalesRow['region'][] = ['North America', 'EMEA', 'Asia Pacific', 'Latin America'];
  const categories: FactSalesRow['productCategory'][] = ['Cloud Services', 'Hardware Appliances', 'Enterprise Licenses', 'Technical Support'];
  const segments: FactSalesRow['customerSegment'][] = ['Enterprise', 'Strategic SMB', 'Public Sector'];
  const channels: FactSalesRow['channel'][] = ['Direct Field Sales', 'Channel Partner', 'Digital Mart'];

  const rows: FactSalesRow[] = [];
  const now = Date.now();

  for (let i = 24; i >= 0; i--) {
    const time = new Date(now - i * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);
    for (let j = 0; j < 3; j++) {
      const region = regions[(i + j) % regions.length];
      const category = categories[(i * 2 + j) % categories.length];
      const segment = segments[(i + j * 3) % segments.length];
      const channel = channels[(i * 3 + j) % channels.length];

      const baseAmount = category === 'Cloud Services' ? 24000 : category === 'Hardware Appliances' ? 45000 : category === 'Enterprise Licenses' ? 68000 : 12000;
      const variation = Math.sin(i * 0.4 + j) * 8000 + Math.random() * 5000;
      const amount = Math.max(3000, Math.round(baseAmount + variation));
      const costRatio = category === 'Cloud Services' ? 0.32 : category === 'Hardware Appliances' ? 0.62 : 0.22;
      const cost = Math.round(amount * costRatio);
      const profit = amount - cost;
      const quantity = Math.max(1, Math.round(amount / 5000));

      rows.push({
        saleId: 100000 + (24 - i) * 10 + j,
        timestamp: time,
        region,
        productCategory: category,
        customerSegment: segment,
        channel,
        amount,
        cost,
        profit,
        quantity
      });
    }
  }

  return rows;
}

export function generateInitialSysMetrics(): SysWarehouseMetric[] {
  const metrics: SysWarehouseMetric[] = [];
  const now = Date.now();

  for (let i = 20; i >= 0; i--) {
    const time = new Date(now - i * 60 * 1000).toISOString().substring(11, 19);
    const cpuBase = 48 + Math.sin(i * 0.5) * 22 + (Math.random() * 8);
    const cpuPercent = Math.min(96, Math.max(25, Math.round(cpuBase * 10) / 10));
    const activeSessions = Math.round(40 + (cpuPercent * 0.6) + (Math.random() * 5));
    const bufferCacheHitRatio = Math.round((98.5 - (cpuPercent > 80 ? 4.5 : 1.2) + Math.random() * 0.8) * 10) / 10;
    const redoLogLatencyMs = Math.round((4.0 + (cpuPercent > 75 ? 8.2 : 1.5) + Math.random() * 2) * 10) / 10;
    const iops = Math.round(3500 + cpuPercent * 65 + Math.random() * 300);
    const queryThroughputQps = Math.round(180 + (cpuPercent * 2.8) + (Math.random() * 20));

    metrics.push({
      timestamp: time,
      cpuPercent,
      memoryMb: 32768,
      activeSessions,
      bufferCacheHitRatio,
      iops,
      redoLogLatencyMs,
      queryThroughputQps
    });
  }

  return metrics;
}

export function generateInitialInventory(): InventoryItem[] {
  return [
    { sku: 'HW-EXA-X8M-01', name: 'Oracle Exadata Storage Server X8M-2', warehouseLocation: 'Ashburn Data Center, VA', stockLevel: 42, reorderPoint: 50, unitCost: 18500, status: 'REORDER_NOW' },
    { sku: 'HW-SPARC-M8-04', name: 'SPARC M8-8 High-End Compute Module', warehouseLocation: 'Frankfurt Facility DC-2', stockLevel: 88, reorderPoint: 100, unitCost: 34200, status: 'REORDER_NOW' },
    { sku: 'NET-100G-QSF', name: 'Dual-Port 100Gb QSFP28 InfiniBand HCA', warehouseLocation: 'Tokyo East Hub', stockLevel: 310, reorderPoint: 120, unitCost: 2800, status: 'OPTIMAL' },
    { sku: 'LIC-ORCL-EE-11', name: 'Oracle 11g Enterprise Edition Pack (Core)', warehouseLocation: 'Digital Repository UK', stockLevel: 1450, reorderPoint: 200, unitCost: 9500, status: 'OPTIMAL' },
    { sku: 'DRV-NVME-6TB', name: 'Oracle Enterprise NVMe Flash Card 6.4TB', warehouseLocation: 'Austin Logistics Hub, TX', stockLevel: 18, reorderPoint: 60, unitCost: 4800, status: 'CRITICAL_LOW' }
  ];
}

// SQL query emulator for Oracle 11g syntax
export function executeOracleQuery(sql: string, sales: FactSalesRow[], metrics: SysWarehouseMetric[]): SQLQueryResult {
  const cleanSql = sql.trim();
  const lower = cleanSql.toLowerCase();
  const start = performance.now();

  let columns: string[] = [];
  let rows: Record<string, any>[] = [];
  let planNotes = 'OPTIMIZER: ALL_ROWS (Cost=48, Cardinality=120) | TABLE ACCESS FULL';

  if (lower.includes('all_tables') || lower.includes('tab') || lower.includes('dba_tables')) {
    columns = ['OWNER', 'TABLE_NAME', 'NUM_ROWS', 'BYTES_MB', 'STATUS', 'PARTITIONED'];
    rows = INITIAL_TABLES.map(t => ({
      OWNER: t.owner,
      TABLE_NAME: t.tableName,
      NUM_ROWS: t.rowCount,
      BYTES_MB: t.bytesSizeMb,
      STATUS: 'VALID',
      PARTITIONED: t.tableName.startsWith('FACT') ? 'YES' : 'NO'
    }));
    planNotes = 'DICTIONARY LOOKUP ON SYS.OBJ$ & SYS.TAB$ | INDEX UNIQUE SCAN (OBJ#)';
  } else if (lower.includes('sys_warehouse_metrics') || lower.includes('v$sysmetric')) {
    columns = ['TIMESTAMP', 'CPU_PERCENT', 'ACTIVE_SESSIONS', 'BUFFER_CACHE_HIT', 'REDO_LATENCY_MS', 'IOPS', 'QPS'];
    rows = metrics.slice(-15).reverse().map(m => ({
      TIMESTAMP: m.timestamp,
      CPU_PERCENT: m.cpuPercent + '%',
      ACTIVE_SESSIONS: m.activeSessions,
      BUFFER_CACHE_HIT: m.bufferCacheHitRatio + '%',
      REDO_LATENCY_MS: m.redoLogLatencyMs,
      IOPS: m.iops,
      QPS: m.queryThroughputQps
    }));
    planNotes = 'FIXED TABLE ACCESS (V$SYSMETRIC_HISTORY) | REAL-TIME MEMORY SCAN';
  } else if (lower.includes('group by') && lower.includes('productcategory')) {
    columns = ['PRODUCT_CATEGORY', 'TOTAL_REVENUE', 'TOTAL_PROFIT', 'TRANSACTION_COUNT', 'AVG_MARGIN_PCT'];
    const grouped: Record<string, { revenue: number; profit: number; count: number }> = {};
    sales.forEach(s => {
      if (!grouped[s.productCategory]) {
        grouped[s.productCategory] = { revenue: 0, profit: 0, count: 0 };
      }
      grouped[s.productCategory].revenue += s.amount;
      grouped[s.productCategory].profit += s.profit;
      grouped[s.productCategory].count += 1;
    });

    rows = Object.entries(grouped).map(([category, vals]) => ({
      PRODUCT_CATEGORY: category,
      TOTAL_REVENUE: '$' + vals.revenue.toLocaleString(),
      TOTAL_PROFIT: '$' + vals.profit.toLocaleString(),
      TRANSACTION_COUNT: vals.count,
      AVG_MARGIN_PCT: Math.round((vals.profit / vals.revenue) * 100) + '%'
    }));
    planNotes = 'HASH GROUP BY (TempSpace=0KB) | TABLE ACCESS BY LOCAL INDEX ROWID (IDX_FACT_SALES_CAT)';
  } else if (lower.includes('group by') && lower.includes('region')) {
    columns = ['REGION', 'TRANSACTIONS', 'REVENUE', 'AVG_DEAL_SIZE'];
    const grouped: Record<string, { revenue: number; count: number }> = {};
    sales.forEach(s => {
      if (!grouped[s.region]) grouped[s.region] = { revenue: 0, count: 0 };
      grouped[s.region].revenue += s.amount;
      grouped[s.region].count += 1;
    });

    rows = Object.entries(grouped).map(([reg, val]) => ({
      REGION: reg,
      TRANSACTIONS: val.count,
      REVENUE: '$' + val.revenue.toLocaleString(),
      AVG_DEAL_SIZE: '$' + Math.round(val.revenue / val.count).toLocaleString()
    }));
    planNotes = 'SORT GROUP BY (In-Memory Workarea) | PARTITION RANGE ALL';
  } else {
    // Default sales query
    columns = ['SALE_ID', 'TIMESTAMP', 'REGION', 'PRODUCT_CATEGORY', 'CUSTOMER_SEGMENT', 'AMOUNT', 'PROFIT'];
    let filtered = [...sales];
    if (lower.includes('where') && lower.includes('enterprise')) {
      filtered = filtered.filter(f => f.customerSegment === 'Enterprise');
    }
    rows = filtered.slice(0, 15).map(s => ({
      SALE_ID: s.saleId,
      TIMESTAMP: s.timestamp,
      REGION: s.region,
      PRODUCT_CATEGORY: s.productCategory,
      CUSTOMER_SEGMENT: s.customerSegment,
      AMOUNT: '$' + s.amount.toLocaleString(),
      PROFIT: '$' + s.profit.toLocaleString()
    }));
    planNotes = 'TABLE ACCESS FULL ON SH.FACT_SALES (Filter Predicates Evaluated)';
  }

  const end = performance.now();

  return {
    columns,
    rows,
    rowCount: rows.length,
    executionTimeMs: Math.round((end - start + Math.random() * 25) * 10) / 10,
    query: sql,
    executedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    planNotes
  };
}
