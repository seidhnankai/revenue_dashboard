import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  Mail, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  ShieldAlert, 
  Clock, 
  Zap, 
  ExternalLink,
  Sliders,
  Filter
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { AlertRule, AlertSeverity } from '../../types';

export const AlertsManager: React.FC = () => {
  const { 
    alertRules, 
    addAlertRule, 
    updateAlertRule, 
    deleteAlertRule, 
    alertBreaches, 
    resolveBreach, 
    clearAllBreaches,
    triggerManualBreachTest, 
    emailInbox, 
    openEmailModal, 
    currentUser 
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'rules' | 'breaches' | 'emails'>('breaches');
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);

  // New Rule Form State
  const [ruleName, setRuleName] = useState('');
  const [metricKey, setMetricKey] = useState<AlertRule['metricKey']>('cpuPercent');
  const [operator, setOperator] = useState<AlertRule['operator']>('>');
  const [threshold, setThreshold] = useState<number>(85);
  const [severity, setSeverity] = useState<AlertSeverity>('CRITICAL');
  const [recipients, setRecipients] = useState('dba-oncall@enterprise.oracle.corp, ibnhassen3@gmail.com');

  const activeBreaches = alertBreaches.filter(b => !b.resolved);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const metricLabels: Record<AlertRule['metricKey'], string> = {
      cpuPercent: 'Warehouse Host CPU (%)',
      bufferCacheHitRatio: 'Buffer Cache Hit Ratio (%)',
      redoLogLatencyMs: 'Redo Log Latency (ms)',
      hourlyRevenue: 'Hourly Revenue Floor ($)',
      activeSessions: 'Active Session Concurrency',
      stockLevel: 'Hardware Stock Level'
    };

    addAlertRule({
      name: ruleName,
      metricKey,
      metricLabel: metricLabels[metricKey],
      operator,
      threshold,
      severity,
      enabled: true,
      emailRecipients: recipients.split(',').map(s => s.trim()).filter(Boolean),
      cooldownMinutes: 15
    });

    setShowNewRuleModal(false);
    setRuleName('');
  };

  return (
    <div className="space-y-6">
      {/* View Header & Action Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Threshold Alerts & Email Dispatcher</span>
            </h1>
            {activeBreaches.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white tabular-nums">
                {activeBreaches.length} Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure automated critical threshold monitors, review diagnostic logs, and track real-time incident emails.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={triggerManualBreachTest}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors shadow-xs"
            title="Fire a test incident breach and email"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulate Critical Breach</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setShowNewRuleModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Alert Rule</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('breaches')}
          className={`pb-2.5 px-3 font-semibold transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
            activeTab === 'breaches' 
              ? 'border-red-600 text-red-600 dark:text-red-400' 
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Active Breaches & History ({alertBreaches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-2.5 px-3 font-semibold transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
            activeTab === 'rules' 
              ? 'border-red-600 text-red-600 dark:text-red-400' 
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Alert Rules ({alertRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`pb-2.5 px-3 font-semibold transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
            activeTab === 'emails' 
              ? 'border-red-600 text-red-600 dark:text-red-400' 
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Dispatched Emails ({emailInbox.length})</span>
        </button>
      </div>

      {/* Tab 1: Breaches History */}
      {activeTab === 'breaches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing real-time detected incidents evaluated against Oracle 11g metric streams.</span>
            {activeBreaches.length > 0 && (
              <button
                onClick={clearAllBreaches}
                className="text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                Mark All Resolved
              </button>
            )}
          </div>

          <div className="space-y-3">
            {alertBreaches.map(breach => {
              const matchedEmail = emailInbox.find(e => e.breachId === breach.id);
              return (
                <div
                  key={breach.id}
                  className={`p-4 rounded-xl border transition-all ${
                    breach.resolved 
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70' 
                      : 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-900 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        breach.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {breach.severity}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {breach.ruleName}
                      </h3>
                      {breach.resolved && (
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Resolved
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-[11px] text-slate-500">
                        {new Date(breach.triggeredAt).toLocaleString()}
                      </span>

                      {!breach.resolved && (
                        <button
                          onClick={() => resolveBreach(breach.id)}
                          className="px-2.5 py-1 rounded bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Breach Data Strip */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Monitored Metric</span>
                      <div className="font-medium text-slate-800 dark:text-slate-200">{breach.metricLabel}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Rule Threshold</span>
                      <div className="font-mono font-medium text-slate-800 dark:text-slate-200">{breach.operator} {breach.threshold}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Observed Value</span>
                      <div className="font-mono font-bold text-red-600 dark:text-red-400">{breach.actualValue}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Alert Email Dispatched</span>
                      <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        {breach.emailDispatchedTo[0]}
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic notes & Email link */}
                  <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                    <p className="italic text-[11px]">
                      {breach.diagnosticNotes}
                    </p>
                    {matchedEmail && (
                      <button
                        onClick={() => openEmailModal(matchedEmail)}
                        className="text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1 shrink-0"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>View Sent Alert Email</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Alert Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Rules continuously evaluated against streaming Oracle 11g performance views and sales partitions.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertRules.map(rule => (
              <div 
                key={rule.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${rule.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{rule.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateAlertRule(rule.id, { enabled: !rule.enabled })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        rule.enabled 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {rule.enabled ? 'ACTIVE' : 'MUTED'}
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => deleteAlertRule(rule.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs font-mono flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">{rule.metricLabel}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {rule.operator} {rule.threshold}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div><strong>Severity:</strong> <span className="font-semibold text-slate-700 dark:text-slate-300">{rule.severity}</span></div>
                  <div className="truncate"><strong>Email Notification:</strong> {rule.emailRecipients.join(', ')}</div>
                  <div><strong>Cooldown:</strong> {rule.cooldownMinutes} minutes</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dispatched Email Inbox */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Log of automated incident alert emails dispatched by the monitoring daemon.
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {emailInbox.map(email => (
              <div
                key={email.id}
                onClick={() => openEmailModal(email)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                    email.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-amber-500'
                  }`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {email.subject}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono">
                        {email.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Dispatched to: {email.to.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{new Date(email.sentAt).toLocaleTimeString()}</span>
                  <span className="text-red-600 dark:text-red-400 font-sans font-medium flex items-center gap-1">
                    Read HTML <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Alert Rule Modal */}
      {showNewRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form 
            onSubmit={handleCreateRule}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Create Oracle Automated Threshold Rule
              </span>
              <button 
                type="button" 
                onClick={() => setShowNewRuleModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Rule Name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Critical SGA Buffer Miss Spike"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Metric Target</label>
                  <select
                    value={metricKey}
                    onChange={(e) => setMetricKey(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="cpuPercent">Warehouse Host CPU (%)</option>
                    <option value="bufferCacheHitRatio">Buffer Cache Hit Ratio (%)</option>
                    <option value="redoLogLatencyMs">Redo Log Latency (ms)</option>
                    <option value="activeSessions">Active Session Concurrency</option>
                    <option value="stockLevel">Hardware Stock Inventory</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Operator</label>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
                    >
                      <option value=">">&gt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<">&lt;</option>
                      <option value="<=">&lt;=</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Threshold</label>
                    <input
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Incident Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate Email)</option>
                    <option value="WARNING">WARNING (Digest / Email)</option>
                    <option value="INFO">INFO (Log Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Target Email Recipients</label>
                  <input
                    type="text"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    placeholder="dba@oracle.corp, user@example.com"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewRuleModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Save & Activate Rule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
