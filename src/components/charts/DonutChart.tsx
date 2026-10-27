import React, { useState } from 'react';

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  height?: number;
  formatValue?: (v: number) => string;
  centerTitle?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 240,
  formatValue = (v) => v.toLocaleString(),
  centerTitle = 'Total'
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-xs text-slate-400">No distribution data</div>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = 70;
  const strokeWidth = 26;
  const center = 100;

  // Compute circumferences and offsets
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  const arcs = data.map((d, i) => {
    const fraction = d.value / total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += fraction;

    return {
      ...d,
      strokeDasharray,
      strokeDashoffset,
      fraction,
      percentage: Math.round(fraction * 1000) / 10
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2 select-none">
      {/* SVG Donut */}
      <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800/80"
            strokeWidth={strokeWidth}
          />
          {arcs.map((arc, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={arc.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
            {hoveredIdx !== null ? data[hoveredIdx].label : centerTitle}
          </span>
          <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {hoveredIdx !== null 
              ? `${arcs[hoveredIdx].percentage}%` 
              : formatValue(total)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-[150px]">
        {arcs.map((arc, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`flex items-center justify-between text-xs p-1.5 rounded-md cursor-pointer transition-colors ${
              hoveredIdx === i 
                ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: arc.color }} />
              <span className="truncate max-w-[110px]">{arc.label}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              <span>{arc.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
