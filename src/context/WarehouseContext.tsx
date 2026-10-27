import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  OracleConnectionConfig, 
  PreparedDataset,
  DatasetField,
  SupersetSlice, 
  AlertRule, 
  AlertBreachEvent, 
  EmailNotification, 
  UserProfile, 
  UserRole,
  SQLQueryResult,
  OracleTable,
  ActiveView
} from '../types';
import { 
  INITIAL_TABLES, 
  INITIAL_USERS, 
  executeOracleQuery 
} from '../data/mockWarehouse';

interface WarehouseContextType {
  connection: OracleConnectionConfig;
  updateConnection: (newConfig: Partial<OracleConnectionConfig>) => void;
  testConnection: (overrideConfig?: Partial<OracleConnectionConfig>) => Promise<{ 
    success: boolean; 
    latencyMs?: number; 
    message: string; 
    errorCode?: string;
    isPrivateNetwork?: boolean;
    recommendation?: any;
  }>;
  disconnect: () => void;
  
  // Dynamic Prepared Datasets
  preparedDatasets: PreparedDataset[];
  activeDatasetId: string | null;
  setActiveDatasetId: (id: string | null) => void;
  activeDataset: PreparedDataset | null;
  createDataset: (dataset: Omit<PreparedDataset, 'id' | 'createdAt' | 'updatedAt'>) => PreparedDataset;
  updateDataset: (id: string, updates: Partial<PreparedDataset>) => void;
  deleteDataset: (id: string) => void;
  loadSampleDatasets: () => void;
  clearAllDatasets: () => void;
  
  // Database Tables in warehouse
  warehouseTables: OracleTable[];
  addWarehouseTable: (table: OracleTable) => void;

  // Visualizations & Slices
  slices: SupersetSlice[];
  addSlice: (slice: Omit<SupersetSlice, 'id'>) => void;
  deleteSlice: (id: string) => void;
  
  // Alerts & Breaches
  alertRules: AlertRule[];
  addAlertRule: (rule: Omit<AlertRule, 'id'>) => void;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void;
  deleteAlertRule: (id: string) => void;
  alertBreaches: AlertBreachEvent[];
  resolveBreach: (id: string) => void;
  clearAllBreaches: () => void;
  triggerManualBreachTest: () => void;
  
  // Automated Email Notifications
  emailInbox: EmailNotification[];
  activeEmailModal: EmailNotification | null;
  openEmailModal: (email: EmailNotification) => void;
  closeEmailModal: () => void;
  
  // Authentication & Session
  isAuthenticated: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<{ success: boolean; error?: string; require2fa?: boolean }>;
  logout: () => void;

  // User Profile & RBAC
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => void;
  changePassword: (userId: string, currentPass: string, newPass: string) => { success: boolean; error?: string };

  // Admin User Directory
  users: UserProfile[];
  addUser: (newUser: Omit<UserProfile, 'id' | 'createdAt'>) => UserProfile;
  deleteUser: (id: string) => void;
  updateUserRole: (id: string, role: UserRole) => void;
  updateUserStatus: (id: string, status: 'active' | 'suspended') => void;

  darkMode: boolean;
  toggleDarkMode: () => void;
  realtimeStreaming: boolean;
  toggleRealtimeStreaming: () => void;
  
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  
  runQuery: (sql: string) => SQLQueryResult;
  exportToCsv: (filename: string, rows: Record<string, any>[]) => void;
  exportToJson: (filename: string, data: any) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oracle_theme');
      if (saved) return saved === 'dark';
      return true;
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('oracle_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('oracle_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Connection State - starts in clean disconnected/unverified state unless verified
  const [connection, setConnection] = useState<OracleConnectionConfig>(() => {
    return {
      host: '10.1.0.122',
      port: 1521,
      sid: 'rdwprod',
      serviceName: 'RDWPROD.CORP',
      username: '',
      password: '',
      schema: 'SYSTEM',
      useSsl: false,
      tnsName: 'RDWPROD_DIRECT',
      connectionMode: 'direct',
      status: 'disconnected', // Initially disconnected until verified!
      latencyMs: 0,
      oracleVersion: 'Oracle Database 11g Enterprise Edition Release 11.2.0.4.0'
    };
  });

  // Users Directory state
  const [users, setUsers] = useState<UserProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oracle_user_directory');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return INITIAL_USERS;
        }
      }
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem('oracle_user_directory', JSON.stringify(users));
  }, [users]);

  // Auth Session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oracle_auth_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return !!parsed.isAuthenticated;
        } catch (e) {
          return true;
        }
      }
    }
    return true; // Defaults to authenticated for smooth first interaction
  });

  // Current User & RBAC
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oracle_auth_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const found = users.find(u => u.id === parsed.userId);
          if (found) return found;
        } catch (e) {}
      }
    }
    return users[0] || INITIAL_USERS[0];
  });

  // Persist session whenever auth state or current user changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem('oracle_auth_session', JSON.stringify({
        isAuthenticated: true,
        userId: currentUser.id,
        role: currentUser.role,
        lastActive: new Date().toISOString()
      }));
    } else {
      localStorage.removeItem('oracle_auth_session');
    }
  }, [isAuthenticated, currentUser]);

  const login = async (
    email: string, 
    password: string, 
    totpCode?: string
  ): Promise<{ success: boolean; error?: string; require2fa?: boolean }> => {
    // Artificial small delay for security feel
    await new Promise(res => setTimeout(res, 350));

    const normalizedEmail = email.trim().toLowerCase();
    const targetUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!targetUser) {
      return { 
        success: false, 
        error: 'ORA-01017: Invalid username/password; logon denied. No registered account matches this email.' 
      };
    }

    if (targetUser.status === 'suspended') {
      return {
        success: false,
        error: 'ORA-28000: The account is locked. This user has been suspended by an enterprise administrator.'
      };
    }

    // Password verification
    const expectedPassword = targetUser.passwordHash || (
      targetUser.role === 'admin' ? 'Admin2026!' : 
      targetUser.role === 'analyst' ? 'Analyst2026!' : 'Guest2026!'
    );

    if (password !== expectedPassword) {
      return { 
        success: false, 
        error: 'ORA-01017: Invalid username/password; logon denied. Please verify your credentials.' 
      };
    }

    // 2FA check
    if (targetUser.twoFactorEnabled && !totpCode) {
      return { success: false, require2fa: true };
    }

    if (targetUser.twoFactorEnabled && totpCode) {
      const cleanCode = totpCode.trim();
      if (!/^\d{6}$/.test(cleanCode)) {
        return { 
          success: false, 
          error: 'Invalid 2FA code. Please enter the 6-digit numeric token from your Authenticator app.' 
        };
      }
    }

    // Login successful
    const updatedUser: UserProfile = {
      ...targetUser,
      lastLoginAt: new Date().toISOString()
    };

    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('oracle_auth_session');
  };

  const switchRole = (role: UserRole) => {
    const match = users.find(u => u.role === role) || {
      id: `usr-${role}`,
      name: `${role.toUpperCase()} User`,
      email: `${role}@oracle.corp`,
      role,
      department: 'Enterprise Team',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      notificationPreferences: {
        emailAlerts: true,
        criticalOnly: role === 'guest',
        dailyDigest: role !== 'guest'
      }
    };
    setCurrentUser(match);
  };

  const updateUserProfile = (id: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const merged = { ...u, ...updates };
        if (currentUser.id === id) {
          setCurrentUser(merged);
        }
        return merged;
      }
      return u;
    }));
  };

  const changePassword = (
    userId: string, 
    currentPass: string, 
    newPass: string
  ): { success: boolean; error?: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    const expected = user.passwordHash || (
      user.role === 'admin' ? 'Admin2026!' : 
      user.role === 'analyst' ? 'Analyst2026!' : 'Guest2026!'
    );

    if (currentPass !== expected) {
      return { success: false, error: 'Current password does not match.' };
    }

    if (newPass.length < 8) {
      return { success: false, error: 'New password must contain at least 8 characters.' };
    }

    updateUserProfile(userId, { passwordHash: newPass });
    return { success: true };
  };

  const addUser = (newUser: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile => {
    const id = `usr-${Date.now().toString(36)}`;
    const created: UserProfile = {
      ...newUser,
      id,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    setUsers(prev => [created, ...prev]);
    return created;
  };

  const deleteUser = (id: string) => {
    if (currentUser.id === id) return; // Prevent deleting self
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateUserRole = (id: string, role: UserRole) => {
    updateUserProfile(id, { role });
  };

  const updateUserStatus = (id: string, status: 'active' | 'suspended') => {
    updateUserProfile(id, { status });
  };

  // Warehouse Tables catalog
  const [warehouseTables, setWarehouseTables] = useState<OracleTable[]>(INITIAL_TABLES);

  const addWarehouseTable = (table: OracleTable) => {
    setWarehouseTables(prev => [table, ...prev.filter(t => t.tableName !== table.tableName)]);
  };

  // Prepared Datasets (Starts empty to avoid static hardcoded analysis)
  const [preparedDatasets, setPreparedDatasets] = useState<PreparedDataset[]>(() => {
    const saved = localStorage.getItem('oracle_prepared_datasets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(() => {
    return preparedDatasets.length > 0 ? preparedDatasets[0].id : null;
  });

  // Keep activeDatasetId in sync with preparedDatasets
  useEffect(() => {
    if (preparedDatasets.length > 0) {
      localStorage.setItem('oracle_prepared_datasets', JSON.stringify(preparedDatasets));
      if (!activeDatasetId || !preparedDatasets.some(d => d.id === activeDatasetId)) {
        setActiveDatasetId(preparedDatasets[0].id);
      }
    } else {
      localStorage.removeItem('oracle_prepared_datasets');
      setActiveDatasetId(null);
    }
  }, [preparedDatasets, activeDatasetId]);

  const activeDataset = preparedDatasets.find(d => d.id === activeDatasetId) || (preparedDatasets.length > 0 ? preparedDatasets[0] : null);

  // Visualization Slices
  const [slices, setSlices] = useState<SupersetSlice[]>(() => {
    const saved = localStorage.getItem('oracle_user_slices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('oracle_user_slices', JSON.stringify(slices));
  }, [slices]);

  // Navigation
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Alerts & Breach Engine
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertBreaches, setAlertBreaches] = useState<AlertBreachEvent[]>([]);
  const [emailInbox, setEmailInbox] = useState<EmailNotification[]>([]);
  const [activeEmailModal, setActiveEmailModal] = useState<EmailNotification | null>(null);
  const [realtimeStreaming, setRealtimeStreaming] = useState<boolean>(true);

  const openEmailModal = (email: EmailNotification) => setActiveEmailModal(email);
  const closeEmailModal = () => setActiveEmailModal(null);

  // Connection management: REAL check against backend
  const updateConnection = (newConfig: Partial<OracleConnectionConfig>) => {
    setConnection(prev => ({ ...prev, ...newConfig }));
  };

  const disconnect = () => {
    setConnection(prev => ({
      ...prev,
      status: 'disconnected',
      latencyMs: 0,
      lastError: undefined
    }));
  };

  const testConnection = async (overrideConfig?: Partial<OracleConnectionConfig>): Promise<{ 
    success: boolean; 
    latencyMs?: number; 
    message: string;
    errorCode?: string;
    isPrivateNetwork?: boolean;
    recommendation?: any;
  }> => {
    const target = { ...connection, ...overrideConfig };
    setConnection(prev => ({ ...prev, ...overrideConfig, status: 'connecting', lastError: undefined }));

    try {
      const response = await fetch('/api/oracle/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: target.host,
          port: target.port,
          sid: target.sid,
          serviceName: target.serviceName,
          username: target.username,
          password: target.password,
          schema: target.schema
        })
      });

      const data = await response.json();

      if (data.success) {
        setConnection(prev => ({
          ...prev,
          ...overrideConfig,
          status: 'connected',
          latencyMs: data.latencyMs || 18,
          lastTestedAt: new Date().toISOString(),
          lastError: undefined
        }));
        return {
          success: true,
          latencyMs: data.latencyMs || 18,
          message: data.message || `Successfully authenticated to Oracle 11g instance '${target.sid}' on ${target.host}:${target.port}.`
        };
      } else {
        // Failed authentication or unreachable network!
        setConnection(prev => ({
          ...prev,
          ...overrideConfig,
          status: 'error',
          latencyMs: 0,
          lastError: {
            code: data.errorCode || 'ORA-01017',
            message: data.message || 'Connection failed: invalid credentials or unreachable host.',
            isPrivateNetwork: data.isPrivateNetwork,
            recommendation: data.recommendation
          }
        }));

        return {
          success: false,
          errorCode: data.errorCode || 'ORA-01017',
          message: data.message || 'Connection failed.',
          isPrivateNetwork: data.isPrivateNetwork,
          recommendation: data.recommendation
        };
      }
    } catch (err: any) {
      // In case backend is offline or network fails
      const fallbackMsg = `Network unreachable: Cannot establish connection to ${target.host}:${target.port}.`;
      setConnection(prev => ({
        ...prev,
        ...overrideConfig,
        status: 'error',
        lastError: {
          code: 'ORA-12541',
          message: fallbackMsg
        }
      }));

      return {
        success: false,
        errorCode: 'ORA-12541',
        message: fallbackMsg
      };
    }
  };

  // Create Prepared Dataset
  const createDataset = (data: Omit<PreparedDataset, 'id' | 'createdAt' | 'updatedAt'>): PreparedDataset => {
    const newDs: PreparedDataset = {
      ...data,
      id: `ds-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPreparedDatasets(prev => [newDs, ...prev]);
    setActiveDatasetId(newDs.id);
    return newDs;
  };

  const updateDataset = (id: string, updates: Partial<PreparedDataset>) => {
    setPreparedDatasets(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
  };

  const deleteDataset = (id: string) => {
    setPreparedDatasets(prev => prev.filter(d => d.id !== id));
    setSlices(prev => prev.filter(s => s.datasetId !== id));
  };

  const clearAllDatasets = () => {
    setPreparedDatasets([]);
    setSlices([]);
    setActiveDatasetId(null);
  };

  // Helper to load sample dataset ONLY if user clicks "Load Oracle SH Sample Schema"
  const loadSampleDatasets = () => {
    const sampleRecords = [
      { region: 'North America', productCategory: 'Cloud Services', channel: 'Direct Field Sales', customerSegment: 'Enterprise', revenue: 420000, profit: 290000, marginPct: 69, quantity: 48, quarter: 'Q1 2026' },
      { region: 'North America', productCategory: 'Hardware Appliances', channel: 'Channel Partner', customerSegment: 'Strategic SMB', revenue: 280000, profit: 110000, marginPct: 39, quantity: 24, quarter: 'Q1 2026' },
      { region: 'EMEA', productCategory: 'Enterprise Licenses', channel: 'Direct Field Sales', customerSegment: 'Enterprise', revenue: 640000, profit: 490000, marginPct: 76, quantity: 72, quarter: 'Q1 2026' },
      { region: 'EMEA', productCategory: 'Cloud Services', channel: 'Digital Mart', customerSegment: 'Public Sector', revenue: 310000, profit: 215000, marginPct: 69, quantity: 36, quarter: 'Q2 2026' },
      { region: 'Asia Pacific', productCategory: 'Technical Support', channel: 'Channel Partner', customerSegment: 'Enterprise', revenue: 195000, profit: 140000, marginPct: 72, quantity: 60, quarter: 'Q2 2026' },
      { region: 'Asia Pacific', productCategory: 'Cloud Services', channel: 'Direct Field Sales', customerSegment: 'Enterprise', revenue: 380000, profit: 265000, marginPct: 70, quantity: 42, quarter: 'Q2 2026' },
      { region: 'Latin America', productCategory: 'Hardware Appliances', channel: 'Channel Partner', customerSegment: 'Strategic SMB', revenue: 160000, profit: 62000, marginPct: 38, quantity: 18, quarter: 'Q3 2026' },
      { region: 'North America', productCategory: 'Enterprise Licenses', channel: 'Direct Field Sales', customerSegment: 'Enterprise', revenue: 780000, profit: 610000, marginPct: 78, quantity: 84, quarter: 'Q3 2026' }
    ];

    const sampleFields: DatasetField[] = [
      { name: 'region', label: 'Geographic Region', type: 'dimension', dataType: 'VARCHAR2' },
      { name: 'productCategory', label: 'Product Category', type: 'dimension', dataType: 'VARCHAR2' },
      { name: 'customerSegment', label: 'Customer Segment', type: 'dimension', dataType: 'VARCHAR2' },
      { name: 'channel', label: 'Sales Channel', type: 'dimension', dataType: 'VARCHAR2' },
      { name: 'quarter', label: 'Fiscal Quarter', type: 'dimension', dataType: 'VARCHAR2' },
      { name: 'revenue', label: 'Revenue ($)', type: 'metric', dataType: 'NUMBER', defaultAgg: 'SUM' },
      { name: 'profit', label: 'Gross Margin ($)', type: 'metric', dataType: 'NUMBER', defaultAgg: 'SUM' },
      { name: 'marginPct', label: 'Margin %', type: 'metric', dataType: 'NUMBER', defaultAgg: 'AVG' },
      { name: 'quantity', label: 'Units Sold', type: 'metric', dataType: 'NUMBER', defaultAgg: 'SUM' }
    ];

    const ds = createDataset({
      name: 'Sample Oracle SH Sales Mart (Demo)',
      description: 'Pre-packaged Oracle 11g Sales History sample partition for exploratory testing.',
      sourceType: 'oracle_sql',
      sourceQuery: 'SELECT region, productCategory, customerSegment, channel, quarter, revenue, profit, marginPct, quantity FROM sh.fact_sales_summary;',
      fields: sampleFields,
      records: sampleRecords,
      rowCount: sampleRecords.length,
      createdBy: currentUser.name
    });

    // Also add initial default slices bound to this dataset
    setSlices([
      {
        id: `slice-${Date.now()}-1`,
        datasetId: ds.id,
        title: 'Revenue by Product Category',
        sliceType: 'bar_chart',
        dimension: 'productCategory',
        metric: 'revenue',
        aggregation: 'SUM',
        timeRange: '30d'
      },
      {
        id: `slice-${Date.now()}-2`,
        datasetId: ds.id,
        title: 'Customer Segment Distribution',
        sliceType: 'donut',
        dimension: 'customerSegment',
        metric: 'revenue',
        aggregation: 'SUM',
        timeRange: '30d'
      },
      {
        id: `slice-${Date.now()}-3`,
        datasetId: ds.id,
        title: 'Regional Margin & Performance Pivot',
        sliceType: 'pivot_table',
        dimension: 'region',
        metric: 'revenue',
        secondaryDimension: 'productCategory',
        aggregation: 'SUM',
        timeRange: '30d'
      }
    ]);
  };

  // Slice Management
  const addSlice = (slice: Omit<SupersetSlice, 'id'>) => {
    const newSlice: SupersetSlice = {
      ...slice,
      id: `slice-${Date.now()}`,
      datasetId: slice.datasetId || activeDatasetId || undefined
    };
    setSlices(prev => [newSlice, ...prev]);
  };

  const deleteSlice = (id: string) => {
    setSlices(prev => prev.filter(s => s.id !== id));
  };

  // Alert Rules
  const addAlertRule = (rule: Omit<AlertRule, 'id'>) => {
    const newRule: AlertRule = {
      ...rule,
      id: `rule-${Date.now()}`
    };
    setAlertRules(prev => [...prev, newRule]);
  };

  const updateAlertRule = (id: string, updates: Partial<AlertRule>) => {
    setAlertRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteAlertRule = (id: string) => {
    setAlertRules(prev => prev.filter(r => r.id !== id));
  };

  const resolveBreach = (id: string) => {
    setAlertBreaches(prev => prev.map(b => b.id === id ? { ...b, resolved: true } : b));
  };

  const clearAllBreaches = () => {
    setAlertBreaches(prev => prev.map(b => ({ ...b, resolved: true })));
  };

  // Dispatch Breach
  const dispatchBreach = useCallback((rule: AlertRule, actualValue: number, diagnostic: string) => {
    const breachId = `breach-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    const newBreach: AlertBreachEvent = {
      id: breachId,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      metricKey: rule.metricKey,
      metricLabel: rule.metricLabel,
      threshold: rule.threshold,
      actualValue,
      operator: rule.operator,
      triggeredAt: timestamp,
      emailDispatchedTo: [...rule.emailRecipients],
      resolved: false,
      diagnosticNotes: diagnostic
    };

    const newEmail: EmailNotification = {
      id: `email-${Date.now()}`,
      to: [...rule.emailRecipients],
      subject: `[${rule.severity} INCIDENT] Oracle 11g (${connection.sid}): ${rule.name} Breached`,
      breachId,
      sentAt: timestamp,
      severity: rule.severity,
      status: 'DELIVERED',
      htmlPreview: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b;">
          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 8px;">Oracle 11g Datawarehouse Incident</h2>
          <p><strong>Instance:</strong> ${connection.sid} (${connection.host}:${connection.port})</p>
          <p><strong>Rule Violated:</strong> ${rule.name}</p>
          <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 12px; margin: 16px 0;">
            Observed value: <strong>${actualValue}</strong> (Threshold: ${rule.operator} ${rule.threshold}).
          </div>
          <p><strong>Diagnostic:</strong> ${diagnostic}</p>
          <p style="font-size: 11px; color: #64748b;">Dispatched automatically to ${rule.emailRecipients.join(', ')}.</p>
        </div>
      `
    };

    setAlertBreaches(prev => [newBreach, ...prev.slice(0, 49)]);
    setEmailInbox(prev => [newEmail, ...prev.slice(0, 49)]);
  }, [connection.sid, connection.host, connection.port]);

  const triggerManualBreachTest = () => {
    const rule = alertRules[0] || {
      id: 'rule-test',
      name: 'Host CPU Capacity Breach',
      metricKey: 'cpuPercent',
      metricLabel: 'Host CPU %',
      operator: '>',
      threshold: 85,
      severity: 'CRITICAL',
      enabled: true,
      emailRecipients: ['dba@oracle.corp', currentUser.email || 'ibnhassen3@gmail.com'],
      cooldownMinutes: 15
    };

    dispatchBreach(rule, 92.4, 'Manual simulation triggered to verify automated SMTP notification relay.');
  };

  const toggleRealtimeStreaming = () => setRealtimeStreaming(prev => !prev);

  // Run SQL
  const runQuery = (sql: string): SQLQueryResult => {
    return executeOracleQuery(sql, [], []);
  };

  // Export helpers
  const exportToCsv = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToJson = (filename: string, data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WarehouseContext.Provider value={{
      connection,
      updateConnection,
      testConnection,
      disconnect,
      preparedDatasets,
      activeDatasetId,
      setActiveDatasetId,
      activeDataset,
      createDataset,
      updateDataset,
      deleteDataset,
      loadSampleDatasets,
      clearAllDatasets,
      warehouseTables,
      addWarehouseTable,
      slices,
      addSlice,
      deleteSlice,
      alertRules,
      addAlertRule,
      updateAlertRule,
      deleteAlertRule,
      alertBreaches,
      resolveBreach,
      clearAllBreaches,
      triggerManualBreachTest,
      emailInbox,
      activeEmailModal,
      openEmailModal,
      closeEmailModal,
      isAuthenticated,
      login,
      logout,
      currentUser,
      switchRole,
      updateUserProfile,
      changePassword,
      users,
      addUser,
      deleteUser,
      updateUserRole,
      updateUserStatus,
      darkMode,
      toggleDarkMode,
      realtimeStreaming,
      toggleRealtimeStreaming,
      activeView,
      setActiveView,
      runQuery,
      exportToCsv,
      exportToJson
    }}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = (): WarehouseContextType => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within WarehouseProvider');
  }
  return context;
};
