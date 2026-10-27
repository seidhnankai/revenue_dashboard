import React from 'react';

interface FunnelStage {
  label: string;
  count: number;
  color?: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  height?: number;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ stages }) => {
  if (!stages || stages.length === 0) {
    return <div className="flex items-center justify-center h-48 text-xs text-slate-400">No funnel stages</div>;
  }

  const maxVal = Math.max(...stages.map(s => s.count)) || 1;

  const defaultColors = ['#ef4444', '#f97316', '#3b82f6', '#10b981'];

  return (
    <div className="flex flex-col gap-3 py-3 px-2 select-none">
      {stages.map((stage, idx) => {
        const percentage = Math.round((stage.count / maxVal) * 100);
        const prevCount = idx > 0 ? stages[idx - 1].count : stage.count;
        const conversionFromPrev = idx > 0 ? Math.round((stage.count / prevCount) * 100) : 100;
        const color = stage.color || defaultColors[idx % defaultColors.length];

        return (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {stage.label}
              </span>
              <div className="flex items-center gap-2 font-mono tabular-nums text-slate-500">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {stage.count.toLocaleString()} units
                </span>
                <span className="text-[11px] text-slate-400">
                  ({percentage}%)
                </span>
                {idx > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {conversionFromPrev}% conv
                  </span>
                )}
              </div>
            </div>

            {/* Visual Funnel Bar */}
            <div className="w-full h-5 rounded-md bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center p-0.5">
              <div 
                className="h-full rounded transition-all duration-300 flex items-center justify-end px-2"
                style={{ 
                  width: `${Math.max(6, percentage)}%`, 
                  backgroundColor: color 
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
