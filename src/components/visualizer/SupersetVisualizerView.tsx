import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  Filter, 
  TrendingUp, 
  PieChart, 
  Gauge, 
  Table2, 
  Sparkles,
  Download
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { SupersetSliceCard } from '../charts/SupersetSliceCard';
import { SliceType } from '../../types';

export const SupersetVisualizerView: React.FC = () => {
  const { slices, deleteSlice, setActiveView, currentUser, exportToJson } = useWarehouse();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredSlices = filterType === 'all' 
    ? slices 
    : slices.filter(s => s.sliceType === filterType);

  const filterOptions = [
    { id: 'all', label: 'All Slices', count: slices.length },
    { id: 'time_series', label: 'Time Series', count: slices.filter(s => s.sliceType === 'time_series').length },
    { id: 'bar_chart', label: 'Bar Charts', count: slices.filter(s => s.sliceType === 'bar_chart' || s.sliceType === 'stacked_bar').length },
    { id: 'donut', label: 'Distribution', count: slices.filter(s => s.sliceType === 'donut').length },
    { id: 'gauge', label: 'Gauges', count: slices.filter(s => s.sliceType === 'gauge').length },
    { id: 'funnel', label: 'Funnels', count: slices.filter(s => s.sliceType === 'funnel').length },
    { id: 'pivot_table', label: 'Pivot Matrices', count: slices.filter(s => s.sliceType === 'pivot_table').length },
  ];

  const handleExportDashboardJson = () => {
    exportToJson('oracle_superset_slices_config', slices);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>Apache Superset Visual Analytics Studio</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Modular multi-slice exploratory canvas supporting deep drill-downs, dynamic time buckets, and cross-tabulations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDashboardJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Slices JSON</span>
          </button>

          {currentUser.role !== 'guest' && (
            <button
              onClick={() => setActiveView('builder')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose New Slice</span>
            </button>
          )}
        </div>
      </div>

      {/* Slice Type Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {filterOptions.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 border ${
              filterType === tab.id 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs' 
                : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Slices Grid */}
      {slices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Superset Slices Configured
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create multi-dimensional visual slices from your prepared Oracle datasets using the Drag-and-Drop Builder.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveView('builder')}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose First Slice</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSlices.map(slice => (
            <div key={slice.id} className={slice.sliceType === 'pivot_table' ? 'md:col-span-2' : ''}>
              <SupersetSliceCard 
                slice={slice} 
                onDelete={deleteSlice}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
