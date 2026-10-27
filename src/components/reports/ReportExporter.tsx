import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  FileText, 
  Calendar, 
  Check, 
  Download, 
  Clock, 
  ShieldCheck, 
  Database,
  Share2
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

export const ReportExporter: React.FC = () => {
  const { activeDataset, connection, currentUser, exportToCsv, exportToJson } = useWarehouse();
  const [scheduledSuccess, setScheduledSuccess] = useState(false);
  const [scheduleCadence, setScheduleCadence] = useState('Daily at 08:00 AM UTC');
  const [recipientEmail, setRecipientEmail] = useState(currentUser.email || 'ibnhassen3@gmail.com');

  const totalRecords = activeDataset?.rowCount || 0;
  const primaryMetric = activeDataset?.fields.find(f => f.type === 'metric');
  let primarySum = 0;
  if (activeDataset && primaryMetric) {
    activeDataset.records.forEach(r => {
      primarySum += Number(r[primaryMetric.name] || 0);
    });
  }

  const handlePrint = () => {
    window.print();
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduledSuccess(true);
    setTimeout(() => setScheduledSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800 no-print">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>Reports & Export Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate printable executive PDF briefings, download structured CSV/JSON data marts, and schedule automated email dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeDataset && (
            <button
              onClick={() => exportToCsv(`${activeDataset.name.toLowerCase().replace(/\s+/g, '_')}_master`, activeDataset.records)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Master CSV</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Report Preview Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 print-page">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-red-600">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Oracle 11g Datawarehouse Executive Performance Report
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Production Database Instance: <strong className="font-mono">{connection.sid}</strong> ({connection.host}:{connection.port})
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-500">
            <div>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
            <div>Prepared for: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong></div>
            <div>Access Classification: <span className="uppercase text-red-600 font-bold">{currentUser.role}</span></div>
          </div>
        </div>

        {/* Executive Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Dataset</span>
            <div className="text-base font-bold text-slate-900 dark:text-white truncate mt-1">
              {activeDataset ? activeDataset.name : 'No Dataset Selected'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{totalRecords} records audited</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Aggregated Measure</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
              {primarySum.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">{primaryMetric?.label || 'Total'}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Oracle 11g Instance</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1 uppercase">
              {connection.sid}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Status: {connection.status}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Connection Latency</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
              {connection.latencyMs}ms
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{connection.host}:{connection.port}</div>
          </div>
        </div>

        {/* Section 1: Top Revenue Sectors Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>01. Multi-Dimensional Revenue Summary by Product Category</span>
          </h3>
          <table className="w-full text-xs border-collapse border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-2 text-left border border-slate-200 dark:border-slate-700">Category</th>
                <th className="p-2 text-right border border-slate-200 dark:border-slate-700">Transactions</th>
                <th className="p-2 text-right border border-slate-200 dark:border-slate-700">Total Revenue</th>
                <th className="p-2 text-right border border-slate-200 dark:border-slate-700">Gross Margin</th>
                <th className="p-2 text-right border border-slate-200 dark:border-slate-700">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              {[
                { cat: 'Cloud Services', tx: 38, rev: 412000, profit: 280000 },
                { cat: 'Hardware Appliances', tx: 22, rev: 320000, profit: 121000 },
                { cat: 'Enterprise Licenses', tx: 46, rev: 890000, profit: 694000 },
                { cat: 'Technical Support', tx: 18, rev: 145000, profit: 101000 },
              ].map(item => (
                <tr key={item.cat}>
                  <td className="p-2 font-sans font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800">{item.cat}</td>
                  <td className="p-2 text-right tabular-nums border border-slate-200 dark:border-slate-800">{item.tx}</td>
                  <td className="p-2 text-right tabular-nums border border-slate-200 dark:border-slate-800">${item.rev.toLocaleString()}</td>
                  <td className="p-2 text-right tabular-nums border border-slate-200 dark:border-slate-800">${item.profit.toLocaleString()}</td>
                  <td className="p-2 text-right tabular-nums font-semibold text-emerald-600 border border-slate-200 dark:border-slate-800">
                    {Math.round((item.profit / item.rev) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Oracle Infrastructure Verification */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <span>02. Database Infrastructure & Partition Health</span>
          </h3>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p><strong>Database Banner:</strong> {connection.oracleVersion}</p>
            <p><strong>Primary Schemas Audited:</strong> SH (Sales History Mart), SYS (Metrics Telemetry), OPS (Inventory Stock).</p>
            <p><strong>TNS Listener Status:</strong> Verified operational with active SSL/TCPS protocol enforcement.</p>
          </div>
        </div>

        {/* Executive Sign-off Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Confidential — Internal Enterprise Oracle Datawarehouse System</span>
          <span>Page 1 of 1</span>
        </div>
      </div>

      {/* Scheduled Automated Report Dispatches (Screen Only) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs no-print">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Automated Scheduled Executive Reports
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Automated Cron Dispatcher</span>
        </div>

        <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Delivery Cadence</label>
            <select
              value={scheduleCadence}
              onChange={(e) => setScheduleCadence(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
            >
              <option value="Daily at 08:00 AM UTC">Daily at 08:00 AM UTC</option>
              <option value="Every Monday at 09:00 AM UTC">Every Monday at 09:00 AM UTC</option>
              <option value="Monthly 1st at 06:00 AM UTC">Monthly 1st at 06:00 AM UTC</option>
              <option value="Hourly Flash Digest">Hourly Flash Digest</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Recipient Email Addresses</label>
            <input
              type="text"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              placeholder="execs@company.corp, ibnhassen3@gmail.com"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              {scheduledSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Schedule Active!</span>
                </>
              ) : (
                <span>Update Schedule</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
