import React, { useState } from 'react';

interface PivotTableGridProps {
  rows: string[];
  columns: string[];
  values: Record<string, Record<string, number>>;
  formatValue?: (v: number) => string;
  metricLabel?: string;
}

export const PivotTableGrid: React.FC<PivotTableGridProps> = ({
  rows,
  columns,
  values,
  formatValue = (v) => '$' + v.toLocaleString(),
  metricLabel = 'Sum of Revenue'
}) => {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Calculate Column Totals
  const colTotals: Record<string, number> = {};
  columns.forEach(col => {
    colTotals[col] = rows.reduce((sum, row) => sum + (values[row]?.[col] || 0), 0);
  });

  // Calculate Row Totals
  const rowTotals: Record<string, number> = {};
  rows.forEach(row => {
    rowTotals[row] = columns.reduce((sum, col) => sum + (values[row]?.[col] || 0), 0);
  });

  const grandTotal = Object.values(colTotals).reduce((sum, v) => sum + v, 0);

  // Sort rows based on total or specific column
  const sortedRows = [...rows].sort((a, b) => {
    if (!sortCol) return 0;
    const valA = sortCol === '__total__' ? rowTotals[a] : (values[a]?.[sortCol] || 0);
    const valB = sortCol === '__total__' ? rowTotals[b] : (values[b]?.[sortCol] || 0);
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(false);
    }
  };

  return (
    <div className="w-full overflow-x-auto select-none">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">
        Matrix Cross-Tab: <span className="text-slate-800 dark:text-slate-200">{metricLabel}</span>
      </div>
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <th className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Region / Dimension
            </th>
            {columns.map(col => (
              <th 
                key={col}
                onClick={() => handleSort(col)}
                className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 text-right cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{col}</span>
                  {sortCol === col && (
                    <span className="text-[10px] text-red-500 font-bold">{sortAsc ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
            ))}
            <th 
              onClick={() => handleSort('__total__')}
              className="py-2.5 px-3 font-bold text-slate-900 dark:text-white text-right cursor-pointer bg-slate-100/70 dark:bg-slate-800"
            >
              <div className="flex items-center justify-end gap-1">
                <span>Row Total</span>
                {sortCol === '__total__' && (
                  <span className="text-[10px] text-red-500 font-bold">{sortAsc ? '▲' : '▼'}</span>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
          {sortedRows.map(row => (
            <tr key={row} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-slate-200">
                {row}
              </td>
              {columns.map(col => {
                const val = values[row]?.[col] || 0;
                const pctOfTotal = grandTotal > 0 ? (val / grandTotal) * 100 : 0;
                return (
                  <td key={col} className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                    <div className="flex flex-col items-end">
                      <span>{formatValue(val)}</span>
                      {pctOfTotal > 5 && (
                        <span className="text-[9px] text-slate-400 font-sans">
                          {pctOfTotal.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
              <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
                {formatValue(rowTotals[row])}
              </td>
            </tr>
          ))}
          {/* Column Totals Summary Row */}
          <tr className="border-t-2 border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/60 font-semibold">
            <td className="py-2.5 px-3 font-sans text-slate-900 dark:text-white">
              Column Total
            </td>
            {columns.map(col => (
              <td key={col} className="py-2.5 px-3 text-right tabular-nums text-slate-900 dark:text-white">
                {formatValue(colTotals[col])}
              </td>
            ))}
            <td className="py-2.5 px-3 text-right tabular-nums font-bold text-red-600 dark:text-red-400 bg-slate-200/50 dark:bg-slate-800">
              {formatValue(grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
