import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  RotateCcw, 
  Download, 
  Layers, 
  Clock, 
  Database,
  CheckCircle2,
  FileCode,
  Sparkles
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { SQLQueryResult } from '../../types';

const SAMPLE_QUERIES = [
  {
    title: 'Category Revenue & Margin Breakdown',
    sql: `SELECT productCategory, SUM(amount) AS total_revenue, SUM(profit) AS total_profit, COUNT(*) AS txn_count
FROM fact_sales
GROUP BY productCategory
ORDER BY total_revenue DESC;`
  },
  {
    title: 'Regional Revenue & Deal Size',
    sql: `SELECT region, COUNT(*) AS deals, SUM(amount) AS total_revenue
FROM fact_sales
GROUP BY region;`
  },
  {
    title: 'Oracle 11g SGA & Host Telemetry (V$SYSMETRIC)',
    sql: `SELECT timestamp, cpu_percent, active_sessions, buffer_cache_hit, redo_latency_ms
FROM sys_warehouse_metrics
ORDER BY timestamp DESC;`
  },
  {
    title: 'Data Mart Catalog (ALL_TABLES)',
    sql: `SELECT owner, table_name, num_rows, bytes_mb, status, partitioned
FROM all_tables;`
  },
  {
    title: 'High-Value Enterprise Transactions',
    sql: `SELECT sale_id, timestamp, customer_segment, amount, profit
FROM fact_sales
WHERE customer_segment = 'Enterprise'
ORDER BY amount DESC;`
  }
];

export const SqlWorkbench: React.FC = () => {
  const { runQuery, exportToCsv, currentUser } = useWarehouse();
  const [currentSql, setCurrentSql] = useState(SAMPLE_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<SQLQueryResult | null>(() => runQuery(SAMPLE_QUERIES[0].sql));
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      const res = runQuery(currentSql);
      setQueryResult(res);
      setRunning(false);
    }, 280);
  };

  const handleExportCsv = () => {
    if (queryResult && queryResult.rows.length > 0) {
      exportToCsv('oracle_sql_query_result', queryResult.rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>Oracle 11g SQL Workbench</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Execute SQL queries directly against Oracle 11g data marts, examine CBO execution plans, and export datasets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {queryResult && queryResult.rows.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Result CSV</span>
            </button>
          )}

          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
          >
            <Play className={`w-3.5 h-3.5 ${running ? 'animate-pulse' : ''}`} />
            <span>{running ? 'Executing...' : 'Run Query (F5)'}</span>
          </button>
        </div>
      </div>

      {/* Query Template Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap uppercase tracking-wider">
          Sample Queries:
        </span>
        {SAMPLE_QUERIES.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentSql(sample.sql);
            }}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap text-xs border border-slate-200/60 dark:border-slate-700/60"
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* SQL Editor Area */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <FileCode className="w-3.5 h-3.5 text-red-400" />
            <span>SQL Worksheet (SH_MART@DW11G)</span>
          </div>
          <button
            onClick={() => setCurrentSql('')}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        <textarea
          value={currentSql}
          onChange={(e) => setCurrentSql(e.target.value)}
          rows={6}
          className="w-full bg-slate-950 text-emerald-400 font-mono text-xs p-4 focus:outline-none resize-y selection:bg-red-500 selection:text-white leading-relaxed"
          placeholder="Enter Oracle 11g SQL query..."
          spellCheck={false}
        />
      </div>

      {/* Execution Results Section */}
      {queryResult && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-0">
          {/* Result Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Query Executed Successfully</span>
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-mono tabular-nums text-slate-500">
                {queryResult.rowCount} rows fetched in {queryResult.executionTimeMs}ms
              </span>
            </div>

            {queryResult.planNotes && (
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-md">
                Plan: {queryResult.planNotes}
              </div>
            )}
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto max-h-96">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-mono text-[10px] text-slate-400 w-12 text-center">#</th>
                  {queryResult.columns.map(col => (
                    <th key={col} className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                {queryResult.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-3 text-slate-400 text-center text-[10px]">
                      {idx + 1}
                    </td>
                    {queryResult.columns.map(col => (
                      <td key={col} className="py-2 px-3 text-slate-800 dark:text-slate-200 tabular-nums whitespace-nowrap">
                        {String(row[col] ?? 'NULL')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
