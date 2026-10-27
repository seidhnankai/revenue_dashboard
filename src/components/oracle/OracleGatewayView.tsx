import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  HardDrive, 
  Table, 
  Columns, 
  ExternalLink,
  Lock,
  Zap,
  Info,
  Terminal,
  ArrowRight,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { OracleTable } from '../../types';

export const OracleGatewayView: React.FC = () => {
  const { 
    connection, 
    updateConnection, 
    testConnection, 
    currentUser, 
    setActiveView, 
    warehouseTables,
    disconnect
  } = useWarehouse();

  const [host, setHost] = useState(connection.host);
  const [port, setPort] = useState(connection.port);
  const [sid, setSid] = useState(connection.sid);
  const [serviceName, setServiceName] = useState(connection.serviceName);
  const [username, setUsername] = useState(connection.username);
  const [password, setPassword] = useState(connection.password || '');
  const [schema, setSchema] = useState(connection.schema);
  const [useSsl, setUseSsl] = useState(connection.useSsl);
  const [connectionType, setConnectionType] = useState<'EZCONNECT' | 'TNS'>('EZCONNECT');
  const [tnsString, setTnsString] = useState(`(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${connection.host})(PORT=${connection.port}))(CONNECT_DATA=(SERVICE_NAME=${connection.serviceName})))`);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ 
    success: boolean; 
    latencyMs?: number; 
    message: string;
    errorCode?: string;
    isPrivateNetwork?: boolean;
    recommendation?: any;
  } | null>(null);
  
  const [selectedTable, setSelectedTable] = useState<OracleTable>(warehouseTables[0]);
  const [copiedTunnel, setCopiedTunnel] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    const override = {
      host: host.trim(),
      port: Number(port) || 1521,
      sid: sid.trim(),
      serviceName: serviceName.trim(),
      username: username.trim(),
      password: password.trim(),
      schema: schema.trim(),
      useSsl
    };

    updateConnection(override);
    const res = await testConnection(override);
    setTestResult(res);
    setTesting(false);
  };

  const tunnelCommand = `ssh -N -R 1521:${host || '10.1.0.122'}:${port || 1521} root@gateway.yourcompany.com`;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>Oracle 11g Datawarehouse Gateway</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Validate direct TNS/EZConnect database listener connectivity and credentials with real TCP socket probes and ORA authentication checks.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className={`w-2 h-2 rounded-full ${
            connection.status === 'connected' ? 'bg-emerald-500' : connection.status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
            {connection.status === 'connected' ? 'AUTHENTICATED (ONLINE)' : connection.status === 'connecting' ? 'TESTING SOCKET...' : 'DISCONNECTED / UNVERIFIED'}
          </span>
          {connection.status === 'connected' && (
            <>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {connection.latencyMs}ms
              </span>
            </>
          )}
        </div>
      </div>

      {/* Grid: Connection Form & Schema Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Connection Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-red-500" />
              <span>Listener & Instance Profile</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConnectionType('EZCONNECT')}
                className={`text-[11px] px-2 py-0.5 rounded font-medium ${connectionType === 'EZCONNECT' ? 'bg-red-500 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                EZConnect
              </button>
              <button
                type="button"
                onClick={() => setConnectionType('TNS')}
                className={`text-[11px] px-2 py-0.5 rounded font-medium ${connectionType === 'TNS' ? 'bg-red-500 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                TNS Entry
              </button>
            </div>
          </div>

          {/* Form Fields */}
          {connectionType === 'EZCONNECT' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  Oracle Hostname / IP Address
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
                  placeholder="e.g. 10.1.0.122 or db-dw01.corp.internal"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  Listener Port (Default: 1521)
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  Database SID / Instance Name
                </label>
                <input
                  type="text"
                  value={sid}
                  onChange={(e) => setSid(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono uppercase"
                  placeholder="rdwprod"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  Oracle Service Name
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
                  placeholder="RDWPROD.CORP"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  Warehouse Schema Owner
                </label>
                <input
                  type="text"
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono uppercase"
                  placeholder="SYSTEM"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  Database Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Oracle user"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Oracle password"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
                  TNS Names Descriptor Entry
                </label>
                <textarea
                  value={tnsString}
                  onChange={(e) => setTnsString(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-950 text-emerald-400 px-3 py-2 font-mono text-[11px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Probing Oracle Listener...' : 'Test & Authenticate Connection'}</span>
            </button>

            {connection.status === 'connected' && (
              <button
                onClick={disconnect}
                className="text-xs text-slate-500 hover:text-red-500 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Test Result Message Box */}
          {testResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200' 
                : 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800 text-red-950 dark:text-red-200'
            }`}>
              <div className="flex items-start gap-2.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase">
                      {testResult.success ? 'Authentication Succeeded' : `${testResult.errorCode || 'ORA Error'}: Connection Failed`}
                    </span>
                    {testResult.latencyMs !== undefined && (
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                        {testResult.latencyMs}ms
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">
                    {testResult.message}
                  </p>
                </div>
              </div>

              {/* Private Network Diagnostic Advice */}
              {testResult.isPrivateNetwork && (
                <div className="mt-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-red-300 dark:border-red-900 text-xs space-y-2 text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>How to connect your on-premise private warehouse ({host}):</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Because <strong>{host}</strong> is inside an internal company intranet subnet, cloud servers cannot open raw TCP sockets directly across the internet to port 1521 without an outbound tunnel or reverse proxy.
                  </p>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Option 1: Reverse SSH Tunnel (from your network)</span>
                    <div className="p-2 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded flex items-center justify-between">
                      <span className="truncate">{tunnelCommand}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(tunnelCommand);
                          setCopiedTunnel(true);
                          setTimeout(() => setCopiedTunnel(false), 2000);
                        }}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy command"
                      >
                        {copiedTunnel ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Option 2: Dataset Studio Ingestion</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      You can also use the <strong>Dataset Studio</strong> to paste or upload table dumps, execute queries via local agents, or prepare custom business marts.
                    </p>
                  </div>
                </div>
              )}

              {testResult.success && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveView('dataset_studio')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>Proceed to Dataset Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Database Catalog & Table Dictionary (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-500" />
              <span>Available Table Catalogs</span>
            </span>
            <button
              onClick={() => setActiveView('dataset_studio')}
              className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Prepare Dataset</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {warehouseTables.map(tbl => (
              <div
                key={tbl.tableName}
                onClick={() => setSelectedTable(tbl)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                  selectedTable?.tableName === tbl.tableName 
                    ? 'bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-800 text-red-950 dark:text-red-200 font-semibold' 
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-red-400'
                }`}
              >
                <div>
                  <div className="font-mono text-xs">{tbl.owner}.{tbl.tableName}</div>
                  <div className="text-[10px] text-slate-500 font-normal line-clamp-1">{tbl.description}</div>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-500 shrink-0">
                  <div>{tbl.rowCount.toLocaleString()} rows</div>
                  <div>{tbl.bytesSizeMb} MB</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Schema Inspector */}
          {selectedTable && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Columns className="w-3.5 h-3.5 text-slate-500" />
                  <span>Columns in {selectedTable.tableName}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {selectedTable.columns.length} columns
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg">
                {selectedTable.columns.map(col => (
                  <div key={col.name} className="p-2 text-xs flex items-center justify-between font-mono bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-1.5">
                      {col.isPrimaryKey && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Primary Key" />}
                      <span className="text-slate-900 dark:text-slate-200 font-medium">{col.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {col.dataType}
                      </span>
                      <span>{col.nullable ? 'NULL' : 'NOT NULL'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
