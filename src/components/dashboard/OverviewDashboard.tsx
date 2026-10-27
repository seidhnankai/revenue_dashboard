import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Layers, 
  Plus, 
  Printer, 
  Download, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  AlertTriangle, 
  ArrowRight,
  Server,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { SupersetSliceCard } from '../charts/SupersetSliceCard';

export const OverviewDashboard: React.FC = () => {
  const { 
    preparedDatasets, 
    activeDatasetId, 
    setActiveDatasetId, 
    activeDataset, 
    slices, 
    deleteSlice, 
    alertBreaches, 
    connection, 
    currentUser, 
    setActiveView, 
    loadSampleDatasets, 
    exportToCsv 
  } = useWarehouse();

  // Filter slices for the active dataset (or show all slices if none filtered)
  const currentSlices = useMemo(() => {
    if (!activeDatasetId) return slices;
    return slices.filter(s => !s.datasetId || s.datasetId === activeDatasetId);
  }, [slices, activeDatasetId]);

  // Dynamically compute KPI metrics based purely on activeDataset records
  const dynamicKpis = useMemo(() => {
    if (!activeDataset || !activeDataset.records || activeDataset.records.length === 0) {
      return null;
    }

    const records = activeDataset.records;
    const metrics = activeDataset.fields.filter(f => f.type === 'metric');
    const dims = activeDataset.fields.filter(f => f.type === 'dimension');

    const primaryMetric = metrics[0];
    const secondaryMetric = metrics[1] || metrics[0];
    const primaryDim = dims[0];

    // Calculate sum and average of primary metric
    let primarySum = 0;
    let secondarySum = 0;

    records.forEach(r => {
      if (primaryMetric) {
        primarySum += Number(r[primaryMetric.name] || 0);
      }
      if (secondaryMetric) {
        secondarySum += Number(r[secondaryMetric.name] || 0);
      }
    });

    const primaryAvg = records.length > 0 ? Math.round(primarySum / records.length) : 0;
    const uniqueDims = primaryDim 
      ? new Set(records.map(r => String(r[primaryDim.name]))).size 
      : records.length;

    return {
      rowCount: records.length,
      primaryMetricLabel: primaryMetric ? primaryMetric.label : 'Total Metric',
      primarySum: primarySum.toLocaleString(),
      primaryAvg: primaryAvg.toLocaleString(),
      secondaryMetricLabel: secondaryMetric ? secondaryMetric.label : 'Secondary Metric',
      secondarySum: secondarySum.toLocaleString(),
      uniqueDimCount: uniqueDims,
      primaryDimLabel: primaryDim ? primaryDim.label : 'Categories'
    };
  }, [activeDataset]);

  const activeBreaches = alertBreaches.filter(b => !b.resolved);

  const handlePrint = () => {
    window.print();
  };

  const handleExportData = () => {
    if (activeDataset && activeDataset.records.length > 0) {
      exportToCsv(`${activeDataset.name.toLowerCase().replace(/\s+/g, '_')}_export`, activeDataset.records);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Dataset Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Oracle 11g Datawarehouse Dashboard
            </h1>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold border ${
              connection.status === 'connected' 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900' 
                : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}>
              {connection.sid}: {connection.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic real-time visualizations computed directly from administrator-prepared Oracle datasets.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2 flex-wrap no-print">
          {/* Active Dataset Dropdown */}
          {preparedDatasets.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 px-1.5 hidden sm:inline">Dataset:</span>
              <select
                value={activeDatasetId || ''}
                onChange={(e) => setActiveDatasetId(e.target.value)}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded px-2 py-1 font-medium border-none focus:ring-1 focus:ring-red-500 max-w-[200px] truncate"
              >
                {preparedDatasets.map(ds => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name} ({ds.rowCount} rows)
                  </option>
                ))}
              </select>
            </div>
          )}

          {preparedDatasets.length > 0 && (
            <>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>

              <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </>
          )}

          {currentUser.role !== 'guest' && (
            <button
              onClick={() => setActiveView('builder')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose Slice</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert Breach Ribbon (if active) */}
      {activeBreaches.length > 0 && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-red-700 dark:text-red-400">
                {activeBreaches.length} Critical Threshold Incident Active
              </span>
              <p className="text-xs text-red-900 dark:text-red-200 mt-0.5">
                {activeBreaches[0].ruleName}: observed <strong className="font-mono">{activeBreaches[0].actualValue}</strong> (threshold {activeBreaches[0].operator} {activeBreaches[0].threshold}).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('alerts')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shrink-0"
          >
            Review Diagnostic & Emails →
          </button>
        </div>
      )}

      {/* Zero Hard-Coded Data State */}
      {preparedDatasets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 md:p-14 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              No Prepared Datasets Available
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This dashboard is strictly powered by your live Oracle 11g database and administrator-prepared datasets. No static hard-coded mock analytics are shown.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left pt-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white mb-1">1. Connect Database</div>
              <p className="text-[11px] text-slate-500">Provide Oracle 11g listener details (host, port, SID, credentials) in the Gateway.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white mb-1">2. Prepare Dataset</div>
              <p className="text-[11px] text-slate-500">In Dataset Studio, write SQL or select tables to define measures & dimensions.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white mb-1">3. Build & Visualize</div>
              <p className="text-[11px] text-slate-500">Compose custom Superset-style slices and pin them to your live dashboard.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveView('oracle')}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Database className="w-4 h-4" />
              <span>Configure Oracle Connection</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveView('dataset_studio')}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Prepare Dataset in Studio</span>
              </button>
            )}

            <button
              onClick={loadSampleDatasets}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700"
            >
              Load Sample Oracle SH Schema (Demo)
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Dynamic KPI Strip computed directly from activeDataset */}
          {dynamicKpis && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs print-card">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Total Records
                </span>
                <div className="text-xl md:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1.5">
                  {dynamicKpis.rowCount.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Source: {activeDataset?.name}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs print-card">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Sum of {dynamicKpis.primaryMetricLabel}
                </span>
                <div className="text-xl md:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1.5">
                  {dynamicKpis.primarySum}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  Aggregated measure
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs print-card">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Avg of {dynamicKpis.primaryMetricLabel}
                </span>
                <div className="text-xl md:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1.5">
                  {dynamicKpis.primaryAvg}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Mean per record
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs print-card">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Distinct {dynamicKpis.primaryDimLabel}
                </span>
                <div className="text-xl md:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1.5">
                  {dynamicKpis.uniqueDimCount}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Unique categories
                </div>
              </div>
            </div>
          )}

          {/* Slices Grid */}
          {currentSlices.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
              <p className="text-xs text-slate-500">
                No visualization slices added for dataset &quot;{activeDataset?.name}&quot; yet.
              </p>
              {currentUser.role !== 'guest' && (
                <button
                  onClick={() => setActiveView('builder')}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Build First Chart with Drag-and-Drop Builder</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {currentSlices.map(slice => (
                <div key={slice.id} className={slice.sliceType === 'pivot_table' ? 'lg:col-span-2' : ''}>
                  <SupersetSliceCard 
                    slice={slice} 
                    onDelete={deleteSlice}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
