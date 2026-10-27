import React, { useState } from 'react';
import { 
  Webhook, 
  Key, 
  Send, 
  Copy, 
  Check, 
  Terminal, 
  Code, 
  ShieldCheck, 
  Plus, 
  ExternalLink,
  Cpu
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { ThirdPartyApiKey, WebhookConfig } from '../../types';

export const ThirdPartyApiHub: React.FC = () => {
  const { activeDataset, connection, currentUser } = useWarehouse();
  
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('metrics');
  const [requestMethod, setRequestMethod] = useState<'GET' | 'POST'>('GET');
  const [liveResponse, setLiveResponse] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ThirdPartyApiKey[]>([
    {
      id: 'key-1',
      keyName: 'Superset Integration Connector',
      apiKey: 'orcl_live_948a3f2110c98f828a192',
      createdAt: '2026-10-20',
      permissions: ['read', 'export', 'query'],
      lastUsedAt: 'Just now'
    },
    {
      id: 'key-2',
      keyName: 'PagerDuty / Slack Webhook Relay',
      apiKey: 'orcl_live_771b028471cba810028a3',
      createdAt: '2026-10-24',
      permissions: ['read'],
      lastUsedAt: '12 mins ago'
    }
  ]);

  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  const endpoints = [
    {
      id: 'metrics',
      path: '/api/v1/warehouse/metrics',
      method: 'GET',
      desc: 'Retrieve current Oracle 11g host metrics, SGA cache hit ratio, and active session count.'
    },
    {
      id: 'query',
      path: '/api/v1/warehouse/query',
      method: 'POST',
      desc: 'Execute parameter-safe Oracle 11g SQL queries against data marts.'
    },
    {
      id: 'sales',
      path: '/api/v1/reports/sales',
      method: 'GET',
      desc: 'Fetch aggregated partition sales metrics in JSON or CSV format.'
    },
    {
      id: 'webhook_test',
      path: '/api/v1/alerts/webhook',
      method: 'POST',
      desc: 'Trigger or simulate external threshold breach webhook notifications.'
    }
  ];

  const handleExecuteApi = () => {
    setIsExecuting(true);
    setTimeout(() => {
      let result = {};
      if (selectedEndpoint === 'metrics') {
        result = {
          status: 'SUCCESS',
          oracle_instance: connection.sid,
          host: connection.host,
          latency_ms: connection.latencyMs,
          telemetry: {
            host: connection.host,
            port: connection.port,
            sid: connection.sid,
            status: connection.status,
            latencyMs: connection.latencyMs
          },
          evaluated_at: new Date().toISOString()
        };
      } else if (selectedEndpoint === 'query') {
        result = {
          status: 'SUCCESS',
          executed_sql: activeDataset ? activeDataset.sourceQuery : 'SELECT * FROM ALL_TABLES',
          rows_affected: activeDataset?.rowCount || 0,
          execution_time_ms: 12.4,
          optimizer_plan: 'HASH GROUP BY (SGA Workarea: 128KB)'
        };
      } else if (selectedEndpoint === 'sales') {
        result = {
          status: 'SUCCESS',
          dataset_name: activeDataset?.name || 'No Dataset Active',
          total_records: activeDataset?.rowCount || 0,
          sample_records: (activeDataset?.records || []).slice(0, 3)
        };
      } else {
        result = {
          status: 'DELIVERED',
          event: 'alert.breach',
          target_url: webhookUrl,
          http_status: 200,
          delivered_at: new Date().toISOString()
        };
      }

      setLiveResponse(result);
      setIsExecuting(false);
    }, 350);
  };

  const handleTestWebhook = () => {
    setWebhookStatus('Dispatching HTTP POST with HMAC-SHA256 signature...');
    setTimeout(() => {
      setWebhookStatus('HTTP 200 OK — Payload acknowledged by webhook listener.');
    }, 500);
  };

  const handleCreateApiKey = () => {
    const newKey: ThirdPartyApiKey = {
      id: `key-${Date.now()}`,
      keyName: 'External BI Client Token',
      apiKey: `orcl_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString().substring(0, 10),
      permissions: ['read', 'export'],
      lastUsedAt: 'Never'
    };
    setApiKeys(prev => [newKey, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>Third-Party API & Webhook Integration Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect Apache Superset, Tableau, Grafana, Slack, and external REST consumers to your Oracle 11g warehouse.
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={handleCreateApiKey}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate API Token</span>
          </button>
        )}
      </div>

      {/* Grid: Interactive API Explorer & Webhook Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoints & Console (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span>Interactive REST API Explorer</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Bearer Token Auth</span>
          </div>

          {/* Endpoint Selector */}
          <div className="space-y-1.5">
            {endpoints.map(ep => (
              <div
                key={ep.id}
                onClick={() => {
                  setSelectedEndpoint(ep.id);
                  setRequestMethod(ep.method as any);
                  setLiveResponse(null);
                }}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                  selectedEndpoint === ep.id 
                    ? 'bg-red-50 border-red-300 dark:bg-red-950/40 dark:border-red-800 text-red-950 dark:text-red-200 font-semibold' 
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-red-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    ep.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs">{ep.path}</span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline">{ep.desc.substring(0, 35)}...</span>
              </div>
            ))}
          </div>

          {/* cURL Command Preview */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              cURL Request Example
            </div>
            <div className="p-3 bg-slate-950 text-slate-300 rounded-lg font-mono text-[11px] overflow-x-auto border border-slate-800 select-all">
              curl -X {requestMethod} &quot;https://orcl-dw.corp.internal{endpoints.find(e => e.id === selectedEndpoint)?.path}&quot; \<br />
              &nbsp;&nbsp;-H &quot;Authorization: Bearer {apiKeys[0]?.apiKey || 'orcl_live_key'}&quot; \<br />
              &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot;
            </div>
          </div>

          {/* Execute Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleExecuteApi}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <Send className={`w-3.5 h-3.5 ${isExecuting ? 'animate-pulse' : ''}`} />
              <span>{isExecuting ? 'Calling API...' : 'Send Test Request'}</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              Instance: {connection.sid} (11g EE)
            </span>
          </div>

          {/* Response Payload */}
          {liveResponse && (
            <div className="space-y-1.5 pt-2 animate-in fade-in">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                <span>Response (HTTP 200 OK)</span>
                <span className="font-mono text-[10px]">application/json</span>
              </div>
              <pre className="p-3 bg-slate-950 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto max-h-56 border border-slate-800">
                {JSON.stringify(liveResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right Column: API Keys & Webhooks (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* API Keys Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Active API Keys</span>
              </span>
              <span className="text-[10px] text-slate-400">{apiKeys.length} Tokens</span>
            </div>

            <div className="space-y-2.5">
              {apiKeys.map(k => (
                <div key={k.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{k.keyName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{k.lastUsedAt}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                    <span className="truncate max-w-[200px] text-slate-600 dark:text-slate-300">{k.apiKey}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(k.apiKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span>Permissions:</span>
                    {k.permissions.map(p => (
                      <span key={p} className="px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono uppercase">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Configuration Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Webhook className="w-4 h-4 text-purple-500" />
                <span>Outbound Webhook Dispatcher</span>
              </span>
              <span className="text-[10px] text-emerald-500 font-mono">HMAC SIGNED</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Webhook Target Endpoint</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <span className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Subscribed Event Topics:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-mono text-[10px]">
                    alert.threshold_breach
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[10px]">
                    report.generated
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono text-[10px]">
                    oracle.sync_completed
                  </span>
                </div>
              </div>

              <button
                onClick={handleTestWebhook}
                className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition-colors"
              >
                Send Test Webhook Ping
              </button>

              {webhookStatus && (
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                  {webhookStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
