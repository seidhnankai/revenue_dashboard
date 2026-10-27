import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Layers, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Gauge, 
  Table2, 
  Filter, 
  Plus, 
  Check, 
  ArrowRight, 
  Code, 
  Download, 
  RotateCcw,
  Move,
  Database
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { SliceType, AggregationType, SupersetSlice, DatasetField } from '../../types';
import { TimeSeriesChart } from '../charts/TimeSeriesChart';
import { BarChartComponent } from '../charts/BarChartComponent';
import { DonutChart } from '../charts/DonutChart';
import { RadialGauge } from '../charts/RadialGauge';
import { FunnelChart } from '../charts/FunnelChart';
import { PivotTableGrid } from '../charts/PivotTableGrid';

export const DragDropReportBuilder: React.FC = () => {
  const { 
    preparedDatasets, 
    activeDatasetId, 
    setActiveDatasetId, 
    activeDataset, 
    addSlice, 
    setActiveView, 
    exportToCsv 
  } = useWarehouse();

  // Builder configuration state
  const [sliceTitle, setSliceTitle] = useState('Custom Analysis Slice');
  const [sliceType, setSliceType] = useState<SliceType>('bar_chart');
  const [aggregation, setAggregation] = useState<AggregationType>('SUM');
  
  // Available fields in the current dataset
  const availableDimensions = useMemo(() => {
    if (!activeDataset) return [];
    return activeDataset.fields.filter(f => f.type === 'dimension');
  }, [activeDataset]);

  const availableMetrics = useMemo(() => {
    if (!activeDataset) return [];
    return activeDataset.fields.filter(f => f.type === 'metric');
  }, [activeDataset]);

  // Selected Drop Targets
  const [selectedDimension, setSelectedDimension] = useState<DatasetField | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<DatasetField | null>(null);
  const [secondaryDimension, setSecondaryDimension] = useState<DatasetField | null>(null);

  // Initialize defaults when dataset changes
  React.useEffect(() => {
    if (availableDimensions.length > 0 && !selectedDimension) {
      setSelectedDimension(availableDimensions[0]);
    }
    if (availableMetrics.length > 0 && !selectedMetric) {
      setSelectedMetric(availableMetrics[0]);
    }
  }, [availableDimensions, availableMetrics, selectedDimension, selectedMetric]);

  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '24h' | '7d' | '30d'>('30d');
  const [draggedField, setDraggedField] = useState<DatasetField | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Drag Handlers
  const handleDragStart = (field: DatasetField) => {
    setDraggedField(field);
  };

  const handleDropDimension = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedField && draggedField.type === 'dimension') {
      setSelectedDimension(draggedField);
      setDraggedField(null);
    }
  };

  const handleDropMetric = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedField && draggedField.type === 'metric') {
      setSelectedMetric(draggedField);
      setDraggedField(null);
    }
  };

  const handleDropSecondary = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedField && draggedField.type === 'dimension') {
      setSecondaryDimension(draggedField);
      setDraggedField(null);
    }
  };

  // Compile Dynamic Preview Data from the active dataset's records
  const previewData = useMemo(() => {
    if (!activeDataset || !activeDataset.records || activeDataset.records.length === 0) {
      return null;
    }

    const records = activeDataset.records;
    const dimKey = selectedDimension?.name || (availableDimensions[0]?.name ?? 'category');
    const metricKey = selectedMetric?.name || (availableMetrics[0]?.name ?? 'value');
    const secDimKey = secondaryDimension?.name;

    if (sliceType === 'time_series') {
      const groups: Record<string, { sum: number; count: number }> = {};
      records.forEach(r => {
        const timeKey = String(r[dimKey] ?? 'T0');
        if (!groups[timeKey]) groups[timeKey] = { sum: 0, count: 0 };
        groups[timeKey].sum += Number(r[metricKey] || 0);
        groups[timeKey].count += 1;
      });

      return Object.entries(groups).map(([t, g]) => ({
        timestamp: t,
        value1: aggregation === 'AVG' ? Math.round(g.sum / g.count) : g.sum,
        label1: `${aggregation} of ${selectedMetric?.label || metricKey}`
      }));
    }

    if (sliceType === 'bar_chart' || sliceType === 'stacked_bar') {
      const groups: Record<string, { sum: number; count: number; secSum: number }> = {};
      records.forEach(r => {
        const key = String(r[dimKey] ?? 'Unknown');
        if (!groups[key]) groups[key] = { sum: 0, count: 0, secSum: 0 };
        groups[key].sum += Number(r[metricKey] || 0);
        groups[key].count += 1;

        if (secDimKey && r[secDimKey]) {
          groups[key].secSum += Number(r[secDimKey] || 0);
        }
      });

      return Object.entries(groups).map(([cat, g]) => ({
        category: cat,
        value: aggregation === 'AVG' ? Math.round(g.sum / g.count) : g.sum,
        secondaryValue: secDimKey ? g.secSum : undefined
      }));
    }

    if (sliceType === 'donut') {
      const groups: Record<string, number> = {};
      records.forEach(r => {
        const key = String(r[dimKey] ?? 'Other');
        groups[key] = (groups[key] || 0) + Number(r[metricKey] || 0);
      });

      const palette = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
      return Object.entries(groups).map(([label, val], idx) => ({
        label,
        value: val,
        color: palette[idx % palette.length]
      }));
    }

    if (sliceType === 'gauge') {
      let total = 0;
      records.forEach(r => {
        total += Number(r[metricKey] || 0);
      });
      const avg = records.length > 0 ? total / records.length : 0;
      return Math.min(100, Math.max(0, Math.round(avg)));
    }

    if (sliceType === 'funnel') {
      const groups: Record<string, number> = {};
      records.forEach(r => {
        const key = String(r[dimKey] ?? 'Stage');
        groups[key] = (groups[key] || 0) + Number(r[metricKey] || 1);
      });

      const colors = ['#ef4444', '#f97316', '#3b82f6', '#10b981', '#8b5cf6'];
      return Object.entries(groups)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count], idx) => ({
          label,
          count,
          color: colors[idx % colors.length]
        }));
    }

    if (sliceType === 'pivot_table') {
      const rowDim = dimKey;
      const colDim = secDimKey || (availableDimensions[1]?.name ?? dimKey);

      const rowKeys = Array.from(new Set(records.map(r => String(r[rowDim] ?? 'N/A')))).slice(0, 8);
      const colKeys = Array.from(new Set(records.map(r => String(r[colDim] ?? 'General')))).slice(0, 6);

      const matrix: Record<string, Record<string, number>> = {};
      rowKeys.forEach(r => {
        matrix[r] = {};
        colKeys.forEach(c => {
          matrix[r][c] = 0;
        });
      });

      records.forEach(r => {
        const rKey = String(r[rowDim] ?? 'N/A');
        const cKey = String(r[colDim] ?? 'General');
        if (matrix[rKey] && matrix[rKey][cKey] !== undefined) {
          matrix[rKey][cKey] += Number(r[metricKey] || 0);
        }
      });

      return {
        rows: rowKeys,
        columns: colKeys,
        values: matrix
      };
    }

    return null;
  }, [activeDataset, sliceType, selectedDimension, selectedMetric, secondaryDimension, aggregation, availableDimensions, availableMetrics]);

  // Generate Oracle 11g SQL String
  const generatedSql = useMemo(() => {
    const dim = selectedDimension ? selectedDimension.name.toUpperCase() : 'DIM_FIELD';
    const met = selectedMetric ? selectedMetric.name.toUpperCase() : 'METRIC_VAL';
    const tbl = activeDataset?.sourceTable || activeDataset?.name.toUpperCase().replace(/\s+/g, '_') || 'MY_DATASET';

    if (sliceType === 'pivot_table') {
      return `-- Oracle 11g PIVOT Clause on Prepared Dataset (${activeDataset?.name || 'Dataset'})
SELECT * FROM (
  SELECT ${dim}, ${secondaryDimension ? secondaryDimension.name.toUpperCase() : 'CATEGORY'}, ${met}
  FROM ${tbl}
)
PIVOT (
  ${aggregation}(${met})
  FOR ${secondaryDimension ? secondaryDimension.name.toUpperCase() : 'CATEGORY'} IN ('Value1', 'Value2', 'Value3')
);`;
    }

    return `SELECT 
  ${dim},
  ${aggregation}(${met}) AS AGGREGATED_MEASURE,
  COUNT(*) AS RECORD_COUNT
FROM ${tbl}
GROUP BY ${dim}
ORDER BY AGGREGATED_MEASURE DESC;`;
  }, [selectedDimension, selectedMetric, secondaryDimension, aggregation, sliceType, activeDataset]);

  const handleSaveToDashboard = () => {
    if (!selectedMetric) return;

    addSlice({
      datasetId: activeDataset?.id,
      title: sliceTitle,
      sliceType,
      dimension: selectedDimension ? selectedDimension.name : (availableDimensions[0]?.name || 'category'),
      metric: selectedMetric.name,
      secondaryDimension: secondaryDimension ? secondaryDimension.name : undefined,
      aggregation,
      timeRange,
      description: `Composed from dataset "${activeDataset?.name}": ${aggregation}(${selectedMetric.label}) by ${selectedDimension?.label || 'Dimension'}.`
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveView('dashboard');
    }, 1200);
  };

  const handleExportPreview = () => {
    if (Array.isArray(previewData)) {
      exportToCsv(`preview_${sliceType}`, previewData);
    }
  };

  if (preparedDatasets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 md:p-14 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <Database className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No Prepared Datasets Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The Drag-and-Drop Report Builder requires at least one prepared dataset from your Oracle 11g database to compose charts dynamically.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => setActiveView('dataset_studio')}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Open Dataset Studio to Prepare Dataset</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Builder Top Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Drag-and-Drop Report Builder</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build Superset-style visualizations dynamically derived from your active Oracle prepared dataset.
          </p>
        </div>

        {/* Dataset Switcher in Builder */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 px-1.5">Active Dataset:</span>
            <select
              value={activeDatasetId || ''}
              onChange={(e) => setActiveDatasetId(e.target.value)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded px-2 py-1 font-medium border-none focus:ring-1 focus:ring-red-500 max-w-[200px] truncate"
            >
              {preparedDatasets.map(ds => (
                <option key={ds.id} value={ds.id}>
                  {ds.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowSqlModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-slate-500" />
            <span>View SQL</span>
          </button>

          <button
            onClick={handleSaveToDashboard}
            disabled={savedSuccess}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg text-white transition-all shadow-xs ${
              savedSuccess ? 'bg-emerald-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Published to Dashboard!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Publish to Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Field Palette (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Dataset Fields
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[160px] block">
                {activeDataset?.name}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Drag or Click</span>
          </div>

          {/* Dimensions Section */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Dimensions ({availableDimensions.length})</span>
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {availableDimensions.map(field => (
                <div
                  key={field.name}
                  draggable
                  onDragStart={() => handleDragStart(field)}
                  onClick={() => setSelectedDimension(field)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-grab active:cursor-grabbing border transition-colors ${
                    selectedDimension?.name === field.name 
                      ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-medium' 
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Move className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{field.label}</span>
                  </div>
                  <span className="font-mono text-[9px] px-1 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-500 shrink-0">
                    {field.dataType}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Metrics ({availableMetrics.length})</span>
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {availableMetrics.map(field => (
                <div
                  key={field.name}
                  draggable
                  onDragStart={() => handleDragStart(field)}
                  onClick={() => setSelectedMetric(field)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-grab active:cursor-grabbing border transition-colors ${
                    selectedMetric?.name === field.name 
                      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium' 
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Move className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{field.label}</span>
                  </div>
                  <span className="font-mono text-[9px] px-1 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-500 shrink-0">
                    NUM
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Drop Zones & Live Visual Preview (9 cols) */}
        <div className="lg:col-span-9 space-y-5">
          {/* Configuration Canvas & Drop Targets */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Slice Title
                </label>
                <input
                  type="text"
                  value={sliceTitle}
                  onChange={(e) => setSliceTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  placeholder="e.g. Sales Margin by Region"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Visualization Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { type: 'bar_chart', label: 'Bar', icon: BarChart3 },
                    { type: 'time_series', label: 'Time', icon: TrendingUp },
                    { type: 'donut', label: 'Donut', icon: PieChart },
                    { type: 'gauge', label: 'Gauge', icon: Gauge },
                    { type: 'funnel', label: 'Funnel', icon: Filter },
                    { type: 'pivot_table', label: 'Pivot', icon: Table2 },
                  ].map(item => {
                    const Icon = item.icon;
                    const active = sliceType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setSliceType(item.type as SliceType)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] transition-colors ${
                          active 
                            ? 'bg-red-500 text-white font-semibold shadow-xs' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-0.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drop Targets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Drop Target 1: Dimension */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropDimension}
                className="p-3 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    X-Axis / Dimension
                  </span>
                  {selectedDimension && (
                    <button 
                      onClick={() => setSelectedDimension(null)}
                      className="text-[10px] text-slate-400 hover:text-red-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {selectedDimension ? (
                  <div className="flex items-center justify-between p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-200 text-xs font-medium">
                    <span>{selectedDimension.label}</span>
                    <span className="font-mono text-[9px] text-blue-500">{selectedDimension.dataType}</span>
                  </div>
                ) : (
                  <div className="text-center py-3 text-xs text-slate-400">
                    Drop Dimension here
                  </div>
                )}
              </div>

              {/* Drop Target 2: Metric */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropMetric}
                className="p-3 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Measure / Metric
                  </span>
                  <select
                    value={aggregation}
                    onChange={(e) => setAggregation(e.target.value as AggregationType)}
                    className="text-[10px] bg-slate-200/70 dark:bg-slate-700 rounded px-1.5 py-0.5 font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <option value="SUM">SUM</option>
                    <option value="AVG">AVG</option>
                    <option value="COUNT">COUNT</option>
                    <option value="MAX">MAX</option>
                    <option value="MIN">MIN</option>
                  </select>
                </div>
                {selectedMetric ? (
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200 text-xs font-medium">
                    <span>{aggregation}({selectedMetric.label})</span>
                    <span className="font-mono text-[9px] text-emerald-500">NUMBER</span>
                  </div>
                ) : (
                  <div className="text-center py-3 text-xs text-slate-400">
                    Drop Metric here
                  </div>
                )}
              </div>

              {/* Drop Target 3: Secondary Breakdown */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropSecondary}
                className="p-3 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Secondary / Breakdown
                  </span>
                  {secondaryDimension && (
                    <button 
                      onClick={() => setSecondaryDimension(null)}
                      className="text-[10px] text-slate-400 hover:text-red-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {secondaryDimension ? (
                  <div className="flex items-center justify-between p-2 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-950 dark:text-purple-200 text-xs font-medium">
                    <span>{secondaryDimension.label}</span>
                    <span className="font-mono text-[9px] text-purple-500">Breakdown</span>
                  </div>
                ) : (
                  <div className="text-center py-3 text-xs text-slate-400">
                    Optional Breakdown
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Live Output Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Preview: {sliceTitle}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ({activeDataset?.records.length || 0} rows evaluated)
                </span>
              </div>
            </div>

            <div className="min-h-[260px] flex items-center justify-center">
              {sliceType === 'time_series' && Array.isArray(previewData) && (
                <TimeSeriesChart 
                  data={previewData as any} 
                  height={260} 
                  formatValue={(v) => v.toLocaleString()}
                />
              )}

              {sliceType === 'bar_chart' && Array.isArray(previewData) && (
                <BarChartComponent 
                  data={previewData as any} 
                  height={260} 
                  formatValue={(v) => v.toLocaleString()}
                />
              )}

              {sliceType === 'donut' && Array.isArray(previewData) && (
                <DonutChart 
                  data={previewData as any} 
                  formatValue={(v) => v.toLocaleString()}
                />
              )}

              {sliceType === 'gauge' && typeof previewData === 'number' && (
                <RadialGauge 
                  value={previewData} 
                  label={selectedMetric?.label || 'Oracle Metric'}
                  thresholds={{ warning: 75, critical: 50 }}
                />
              )}

              {sliceType === 'funnel' && Array.isArray(previewData) && (
                <FunnelChart stages={previewData as any} />
              )}

              {sliceType === 'pivot_table' && previewData && typeof previewData === 'object' && !Array.isArray(previewData) && (
                <PivotTableGrid 
                  rows={(previewData as any).rows}
                  columns={(previewData as any).columns}
                  values={(previewData as any).values}
                  metricLabel={`${aggregation} of ${selectedMetric?.label}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Oracle SQL Inspector Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-red-600" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Generated Oracle 11g SQL Statement
                </span>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-3 bg-slate-950 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre border border-slate-800">
              {generatedSql}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Optimized for Oracle 11g Release 2 Cost-Based Optimizer.</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedSql);
                  alert('Oracle SQL copied to clipboard');
                }}
                className="px-3 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Copy SQL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
