import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Filter, 
  RefreshCw,
  Info
} from 'lucide-react';
import { SupersetSlice } from '../../types';
import { useWarehouse } from '../../context/WarehouseContext';
import { TimeSeriesChart } from './TimeSeriesChart';
import { BarChartComponent } from './BarChartComponent';
import { DonutChart } from './DonutChart';
import { RadialGauge } from './RadialGauge';
import { FunnelChart } from './FunnelChart';
import { PivotTableGrid } from './PivotTableGrid';

interface SupersetSliceCardProps {
  slice: SupersetSlice;
  onDelete?: (id: string) => void;
}

export const SupersetSliceCard: React.FC<SupersetSliceCardProps> = ({ slice, onDelete }) => {
  const { preparedDatasets, activeDataset, currentUser, exportToCsv } = useWarehouse();
  const [selectedRange, setSelectedRange] = useState(slice.timeRange);
  const [isExpanded, setIsExpanded] = useState(false);

  // Retrieve the dataset bound to this slice or fallback to active dataset
  const targetDataset = useMemo(() => {
    return preparedDatasets.find(d => d.id === slice.datasetId) || activeDataset;
  }, [preparedDatasets, slice.datasetId, activeDataset]);

  // Compute slice data dynamically based on target dataset records
  const chartPayload = useMemo(() => {
    if (!targetDataset || !targetDataset.records || targetDataset.records.length === 0) {
      return null;
    }

    const records = targetDataset.records;
    const dim = slice.dimension;
    const metric = slice.metric;
    const secDim = slice.secondaryDimension;

    if (slice.sliceType === 'time_series') {
      const timeGroups: Record<string, { val1: number; val2: number; count: number }> = {};
      records.forEach(r => {
        const timeKey = String(r[dim] ?? 'T0');
        if (!timeGroups[timeKey]) timeGroups[timeKey] = { val1: 0, val2: 0, count: 0 };
        timeGroups[timeKey].val1 += Number(r[metric] || 0);
        if (secDim && r[secDim]) {
          timeGroups[timeKey].val2 += Number(r[secDim] || 0);
        }
        timeGroups[timeKey].count += 1;
      });

      return Object.entries(timeGroups).map(([t, g]) => ({
        timestamp: t,
        value1: slice.aggregation === 'AVG' ? Math.round(g.val1 / g.count) : g.val1,
        value2: secDim ? (slice.aggregation === 'AVG' ? Math.round(g.val2 / g.count) : g.val2) : undefined,
        label1: `${slice.aggregation} of ${metric}`,
        label2: secDim ? `${slice.aggregation} of ${secDim}` : undefined
      }));
    }

    if (slice.sliceType === 'bar_chart' || slice.sliceType === 'stacked_bar') {
      const categoryMap: Record<string, { val: number; secVal: number; count: number }> = {};
      records.forEach(r => {
        const catKey = String(r[dim] ?? 'Other');
        if (!categoryMap[catKey]) categoryMap[catKey] = { val: 0, secVal: 0, count: 0 };
        
        categoryMap[catKey].val += Number(r[metric] || 0);
        if (secDim && r[secDim]) {
          categoryMap[catKey].secVal += Number(r[secDim] || 0);
        }
        categoryMap[catKey].count += 1;
      });

      return Object.entries(categoryMap).map(([category, vals]) => ({
        category,
        value: slice.aggregation === 'AVG' ? Math.round(vals.val / vals.count) : vals.val,
        secondaryValue: secDim ? (slice.aggregation === 'AVG' ? Math.round(vals.secVal / vals.count) : vals.secVal) : undefined
      }));
    }

    if (slice.sliceType === 'donut') {
      const segmentMap: Record<string, number> = {};
      records.forEach(r => {
        const key = String(r[dim] ?? 'General');
        segmentMap[key] = (segmentMap[key] || 0) + Number(r[metric] || 0);
      });

      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
      return Object.entries(segmentMap).map(([label, value], idx) => ({
        label,
        value,
        color: colors[idx % colors.length]
      }));
    }

    if (slice.sliceType === 'gauge') {
      let total = 0;
      records.forEach(r => {
        total += Number(r[metric] || 0);
      });
      const avg = records.length > 0 ? total / records.length : 0;
      return Math.min(100, Math.max(0, Math.round(avg)));
    }

    if (slice.sliceType === 'funnel') {
      const groups: Record<string, number> = {};
      records.forEach(r => {
        const key = String(r[dim] ?? 'Stage');
        groups[key] = (groups[key] || 0) + Number(r[metric] || 1);
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

    if (slice.sliceType === 'pivot_table') {
      const rowDim = dim;
      const colDim = secDim || 'category';

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
          matrix[rKey][cKey] += Number(r[metric] || 0);
        }
      });

      return {
        rows: rowKeys,
        columns: colKeys,
        values: matrix
      };
    }

    return null;
  }, [slice, targetDataset]);

  const handleExportCsv = () => {
    let rows: Record<string, any>[] = [];
    if (Array.isArray(chartPayload)) {
      rows = chartPayload as Record<string, any>[];
    } else if (targetDataset && targetDataset.records) {
      rows = targetDataset.records;
    }
    exportToCsv(`${slice.title.toLowerCase().replace(/\s+/g, '_')}_export`, rows);
  };

  return (
    <div className={`
      bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800
      flex flex-col transition-all duration-200 print-card
      ${isExpanded ? 'fixed inset-4 z-50 shadow-2xl overflow-y-auto' : 'shadow-xs hover:border-slate-300 dark:hover:border-slate-700'}
    `}>
      {/* Slice Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px]">
            {slice.title}
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
            {slice.aggregation}({slice.metric})
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 text-slate-500">
          {/* Time range selector */}
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value as any)}
            className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded px-1.5 py-1 border-none focus:ring-1 focus:ring-red-500"
          >
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>

          <button
            onClick={handleExportCsv}
            title="Export Slice CSV"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            title={isExpanded ? 'Minimize' : 'Maximize'}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onDelete && currentUser.role !== 'guest' && (
            <button
              onClick={() => onDelete(slice.id)}
              title="Remove Slice"
              className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors text-slate-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Slice Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-center">
        {slice.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            {slice.description}
          </p>
        )}

        {/* Dynamic Slice Renderer */}
        {slice.sliceType === 'time_series' && Array.isArray(chartPayload) && (
          <TimeSeriesChart 
            data={chartPayload as any} 
            height={isExpanded ? 450 : 220}
            formatValue={(v) => '$' + v.toLocaleString()}
          />
        )}

        {(slice.sliceType === 'bar_chart' || slice.sliceType === 'stacked_bar') && Array.isArray(chartPayload) && (
          <BarChartComponent 
            data={chartPayload as any} 
            height={isExpanded ? 450 : 220}
            stacked={slice.sliceType === 'stacked_bar'}
            formatValue={(v) => '$' + v.toLocaleString()}
          />
        )}

        {slice.sliceType === 'donut' && Array.isArray(chartPayload) && (
          <DonutChart 
            data={chartPayload as any} 
            formatValue={(v) => '$' + Math.round(v / 1000) + 'k'}
          />
        )}

        {slice.sliceType === 'gauge' && typeof chartPayload === 'number' && (
          <RadialGauge 
            value={chartPayload} 
            label="Oracle 11g Buffer Hit"
            thresholds={{ warning: 92, critical: 88 }}
          />
        )}

        {slice.sliceType === 'funnel' && Array.isArray(chartPayload) && (
          <FunnelChart 
            stages={chartPayload as any}
          />
        )}

        {slice.sliceType === 'pivot_table' && chartPayload && typeof chartPayload === 'object' && !Array.isArray(chartPayload) && (
          <PivotTableGrid 
            rows={(chartPayload as any).rows}
            columns={(chartPayload as any).columns}
            values={(chartPayload as any).values}
            metricLabel="Oracle Warehouse Revenue ($)"
          />
        )}
      </div>
    </div>
  );
};
