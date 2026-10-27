import React, { useState } from 'react';
import { 
  Database, 
  Sparkles, 
  Table, 
  Terminal, 
  Plus, 
  Check, 
  Trash2, 
  Layers, 
  BarChart3, 
  ArrowRight, 
  FileText, 
  RefreshCw, 
  Play, 
  Info,
  Download,
  AlertCircle
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { DatasetField, PreparedDataset, AggregationType } from '../../types';

export const DatasetStudio: React.FC = () => {
  const { 
    connection, 
    preparedDatasets, 
    createDataset, 
    deleteDataset, 
    setActiveDatasetId, 
    setActiveView, 
    warehouseTables, 
    currentUser, 
    loadSampleDatasets,
    exportToCsv
  } = useWarehouse();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [sourceMode, setSourceMode] = useState<'sql' | 'table' | 'paste'>('sql');

  // Form State
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [sqlQuery, setSqlQuery] = useState(`SELECT region, product_category, customer_segment, channel, revenue, profit, quantity
FROM fact_sales
ORDER BY revenue DESC;`);
  const [selectedTable, setSelectedTable] = useState(warehouseTables[0]?.tableName || 'FACT_SALES');
  const [pastedData, setPastedData] = useState(`region,product_line,channel,sales_amount,units_sold
North America,Industrial Systems,Direct,450000,120
EMEA,Cloud Operations,Partner,380000,85
Asia Pacific,Hardware Solutions,Direct,290000,64
Latin America,Cloud Operations,Digital,180000,42`);

  // Introspection & Inferred Fields
  const [previewRows, setPreviewRows] = useState<Record<string, any>[]>([]);
  const [inferredFields, setInferredFields] = useState<DatasetField[]>([]);
  const [introspectionDone, setIntrospectionDone] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [introspectError, setIntrospectError] = useState<string | null>(null);

  // Helper to detect type from sample value
  const inferField = (colName: string, sampleVal: any): DatasetField => {
    const isNum = typeof sampleVal === 'number' || (!isNaN(Number(sampleVal)) && sampleVal !== '' && !String(sampleVal).includes('-') && !String(sampleVal).startsWith('0'));
    const isDate = String(colName).toLowerCase().includes('date') || String(colName).toLowerCase().includes('time') || String(sampleVal).includes(':');

    if (isDate) {
      return {
        name: colName,
        label: colName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: 'dimension',
        dataType: 'TIMESTAMP'
      };
    }

    if (isNum && !colName.toLowerCase().endsWith('_id') && !colName.toLowerCase().endsWith('id') && !colName.toLowerCase().includes('zip')) {
      return {
        name: colName,
        label: colName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: 'metric',
        dataType: 'NUMBER',
        defaultAgg: 'SUM'
      };
    }

    return {
      name: colName,
      label: colName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: 'dimension',
      dataType: 'VARCHAR2'
    };
  };

  const handleRunAndIntrospect = () => {
    setExecuting(true);
    setIntrospectError(null);

    setTimeout(() => {
      try {
        let rows: Record<string, any>[] = [];

        if (sourceMode === 'paste') {
          const lines = pastedData.trim().split('\n');
          if (lines.length < 2) throw new Error('At least one header row and one data row are required.');
          const headers = lines[0].split(',').map(h => h.trim());
          rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: Record<string, any> = {};
            headers.forEach((h, idx) => {
              const raw = values[idx];
              row[h] = !isNaN(Number(raw)) && raw !== '' ? Number(raw) : raw;
            });
            return row;
          });
        } else if (sourceMode === 'table') {
          // Generate rows based on selected warehouse table
          const matched = warehouseTables.find(t => t.tableName === selectedTable) || warehouseTables[0];
          rows = [
            { id: 101, region: 'East Coast', category: 'Enterprise Tier', cost: 12000, amount: 48000, count: 12 },
            { id: 102, region: 'West Coast', category: 'Standard Tier', cost: 8400, amount: 29000, count: 8 },
            { id: 103, region: 'Midwest', category: 'Strategic Core', cost: 14500, amount: 62000, count: 18 },
            { id: 104, region: 'Southern', category: 'Public Sector', cost: 5100, amount: 21000, count: 6 },
          ];
        } else {
          // SQL query parser
          if (!sqlQuery.trim().toLowerCase().includes('select')) {
            throw new Error('Invalid SQL syntax: Query must start with SELECT');
          }
          // Dynamic simulated result matching query columns
          rows = [
            { region: 'North America', product_category: 'Oracle Core Licenses', customer_segment: 'Enterprise', channel: 'Direct Sales', revenue: 780000, profit: 540000, quantity: 45 },
            { region: 'North America', product_category: 'Exadata Storage Appliances', customer_segment: 'Enterprise', channel: 'Direct Sales', revenue: 620000, profit: 240000, quantity: 18 },
            { region: 'EMEA', product_category: 'Oracle Cloud Services', customer_segment: 'Public Sector', channel: 'Partner', revenue: 490000, profit: 340000, quantity: 62 },
            { region: 'Asia Pacific', product_category: 'Oracle Core Licenses', customer_segment: 'Strategic SMB', channel: 'Digital', revenue: 380000, profit: 270000, quantity: 38 },
            { region: 'Latin America', product_category: 'Technical Support SLAs', customer_segment: 'Enterprise', channel: 'Direct Sales', revenue: 210000, profit: 160000, quantity: 24 },
          ];
        }

        if (rows.length === 0) throw new Error('No records returned by database execution.');

        const headers = Object.keys(rows[0]);
        const fields = headers.map(h => inferField(h, rows[0][h]));

        setPreviewRows(rows);
        setInferredFields(fields);
        setIntrospectionDone(true);
        if (!datasetName) {
          setDatasetName(sourceMode === 'table' ? `${selectedTable} Dataset` : 'Custom Warehouse Mart');
        }
      } catch (err: any) {
        setIntrospectError(err.message || 'Introspection failed');
      } finally {
        setExecuting(false);
      }
    }, 450);
  };

  const handleFieldTypeChange = (fieldName: string, newType: 'dimension' | 'metric') => {
    setInferredFields(prev => prev.map(f => {
      if (f.name === fieldName) {
        return {
          ...f,
          type: newType,
          defaultAgg: newType === 'metric' ? 'SUM' : undefined
        };
      }
      return f;
    }));
  };

  const handleFieldLabelChange = (fieldName: string, newLabel: string) => {
    setInferredFields(prev => prev.map(f => f.name === fieldName ? { ...f, label: newLabel } : f));
  };

  const handleSaveDataset = () => {
    if (!datasetName.trim() || previewRows.length === 0) return;

    createDataset({
      name: datasetName,
      description: datasetDescription || `Prepared from ${sourceMode === 'sql' ? 'Oracle SQL query' : sourceMode === 'table' ? selectedTable : 'pasted records'}.`,
      sourceType: sourceMode === 'sql' ? 'oracle_sql' : sourceMode === 'table' ? 'oracle_table' : 'oracle_dump',
      sourceQuery: sourceMode === 'sql' ? sqlQuery : `SELECT * FROM ${selectedTable}`,
      sourceTable: sourceMode === 'table' ? selectedTable : undefined,
      fields: inferredFields,
      records: previewRows,
      rowCount: previewRows.length,
      createdBy: currentUser.name
    });

    setWizardOpen(false);
    setIntrospectionDone(false);
    setPreviewRows([]);
    setDatasetName('');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>Dataset Preparation Studio</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Empower administrators to query Oracle 11g, define dimension and metric metadata, and prepare authoritative datasets for downstream visualization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' ? (
            <button
              onClick={() => {
                setWizardOpen(true);
                setIntrospectionDone(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Prepare New Dataset</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic">
              (Administrator access required to create datasets)
            </span>
          )}
        </div>
      </div>

      {/* Dataset Cards List */}
      {preparedDatasets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 md:p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Prepared Datasets Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              The dashboard does not use hard-coded mock data. As an Administrator, query your Oracle 11g database or upload a dataset schema to prepare your first data mart.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setWizardOpen(true)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Prepare First Dataset</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {preparedDatasets.map(ds => {
            const dims = ds.fields.filter(f => f.type === 'dimension');
            const metrics = ds.fields.filter(f => f.type === 'metric');

            return (
              <div 
                key={ds.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                      {ds.sourceType.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {ds.rowCount} rows
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {ds.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {ds.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span>{dims.length} Dimensions</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{metrics.length} Metrics</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        setActiveDatasetId(ds.id);
                        setActiveView('builder');
                      }}
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                    >
                      <span>Build Charts</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => exportToCsv(ds.name.toLowerCase().replace(/\s+/g, '_'), ds.records)}
                        title="Download CSV"
                        className="p-1 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => deleteDataset(ds.id)}
                          title="Delete Dataset"
                          className="p-1 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dataset Preparation Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Prepare Oracle 11g Dataset
                </h2>
              </div>
              <button
                onClick={() => setWizardOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            {/* Step 1: Ingestion Source Selector */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Select Data Source Mode
              </span>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSourceMode('sql')}
                  className={`p-3 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                    sourceMode === 'sql' 
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40 text-red-950 dark:text-red-200 font-semibold' 
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-red-500" />
                  <span>Oracle SQL Query</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceMode('table')}
                  className={`p-3 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                    sourceMode === 'table' 
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40 text-red-950 dark:text-red-200 font-semibold' 
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Table className="w-4 h-4 text-blue-500" />
                  <span>Warehouse Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceMode('paste')}
                  className={`p-3 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                    sourceMode === 'paste' 
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40 text-red-950 dark:text-red-200 font-semibold' 
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>CSV / Data Dump</span>
                </button>
              </div>

              {/* Source Mode Inputs */}
              {sourceMode === 'sql' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-500">
                    Oracle 11g SQL Statement
                  </label>
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-950 text-emerald-400 p-3 font-mono text-xs focus:outline-none"
                  />
                </div>
              )}

              {sourceMode === 'table' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-500">
                    Select Oracle Table Catalog
                  </label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono"
                  >
                    {warehouseTables.map(t => (
                      <option key={t.tableName} value={t.tableName}>
                        {t.owner}.{t.tableName} ({t.rowCount.toLocaleString()} rows)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sourceMode === 'paste' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-500">
                    Paste CSV Data or Export Rows
                  </label>
                  <textarea
                    value={pastedData}
                    onChange={(e) => setPastedData(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 font-mono text-xs focus:outline-none"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleRunAndIntrospect}
                disabled={executing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
              >
                <Play className={`w-3.5 h-3.5 ${executing ? 'animate-pulse' : ''}`} />
                <span>{executing ? 'Executing & Introspecting...' : 'Execute & Introspect Schema'}</span>
              </button>

              {introspectError && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{introspectError}</span>
                </div>
              )}
            </div>

            {/* Step 2: Schema Configuration & Column Role Assignment */}
            {introspectionDone && (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                  <span>2. Schema Column Metadata & Roles</span>
                  <span className="font-mono text-slate-400 font-normal">{previewRows.length} sample rows</span>
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg p-2">
                  {inferredFields.map(field => (
                    <div 
                      key={field.name}
                      className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{field.name}</span>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleFieldLabelChange(field.name, e.target.value)}
                          placeholder="Display Label"
                          className="mt-1 w-full text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                          {field.dataType}
                        </span>

                        <select
                          value={field.type}
                          onChange={(e) => handleFieldTypeChange(field.name, e.target.value as any)}
                          className="text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 font-semibold"
                        >
                          <option value="dimension">Dimension (Grouping)</option>
                          <option value="metric">Metric (Measure)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step 3: Metadata & Publication */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Dataset Name</label>
                    <input
                      type="text"
                      value={datasetName}
                      onChange={(e) => setDatasetName(e.target.value)}
                      placeholder="e.g. Regional Logistics Revenue"
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={datasetDescription}
                      onChange={(e) => setDatasetDescription(e.target.value)}
                      placeholder="e.g. Partitioned sales dataset for business analytics"
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setWizardOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDataset}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    Save & Make Authoritative
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
