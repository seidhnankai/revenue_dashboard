import React, { useState } from 'react';

interface BarDataPoint {
  category: string;
  value: number;
  secondaryValue?: number;
  label?: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  formatValue?: (v: number) => string;
  stacked?: boolean;
}

export const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  height = 240,
  primaryColor = '#ef4444',
  secondaryColor = '#6366f1',
  formatValue = (v) => v.toLocaleString(),
  stacked = false
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-xs text-slate-400">No data available</div>;
  }

  const hasSecondary = data.some(d => d.secondaryValue !== undefined);
  
  const maxVal = stacked 
    ? Math.max(...data.map(d => (d.value || 0) + (d.secondaryValue || 0))) * 1.15
    : Math.max(...data.map(d => Math.max(d.value || 0, d.secondaryValue || 0))) * 1.15;

  const chartWidth = 600;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const groupWidth = innerWidth / data.length;
  const barWidth = hasSecondary && !stacked ? (groupWidth * 0.35) : (groupWidth * 0.55);

  const getY = (val: number) => paddingTop + innerHeight - (val / (maxVal || 1)) * innerHeight;
  const getH = (val: number) => (val / (maxVal || 1)) * innerHeight;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-auto">
        {/* Horizontal grid lines */}
        {[0, maxVal * 0.33, maxVal * 0.66, maxVal].map((tick, idx) => {
          const y = getY(tick);
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={chartWidth - paddingRight} 
                y2={y} 
                stroke="currentColor" 
                className="text-slate-200 dark:text-slate-800" 
                strokeDasharray="3 3"
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 3} 
                textAnchor="end" 
                className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
              >
                {formatValue(Math.round(tick))}
              </text>
            </g>
          );
        })}

        {/* Render Bars */}
        {data.map((d, i) => {
          const groupX = paddingLeft + i * groupWidth;
          const isHovered = hoveredIndex === i;

          if (stacked && hasSecondary) {
            const h1 = getH(d.value);
            const h2 = getH(d.secondaryValue || 0);
            const x = groupX + (groupWidth - barWidth) / 2;
            const y1 = paddingTop + innerHeight - h1;
            const y2 = y1 - h2;

            return (
              <g 
                key={i} 
                onMouseEnter={() => setHoveredIndex(i)} 
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-opacity"
                opacity={hoveredIndex !== null && !isHovered ? 0.6 : 1}
              >
                {/* Secondary on top */}
                <rect 
                  x={x} 
                  y={y2} 
                  width={barWidth} 
                  height={h2} 
                  fill={secondaryColor} 
                  rx="2"
                />
                {/* Primary on bottom */}
                <rect 
                  x={x} 
                  y={y1} 
                  width={barWidth} 
                  height={h1} 
                  fill={primaryColor} 
                  rx="2"
                />
                {/* Category label */}
                <text 
                  x={groupX + groupWidth / 2} 
                  y={height - 10} 
                  textAnchor="middle" 
                  className="text-[10px] fill-slate-500 dark:fill-slate-400 font-medium"
                >
                  {d.category.length > 12 ? d.category.substring(0, 10) + '..' : d.category}
                </text>
              </g>
            );
          }

          // Grouped or Single
          const x1 = hasSecondary 
            ? groupX + (groupWidth - barWidth * 2 - 4) / 2 
            : groupX + (groupWidth - barWidth) / 2;
          const x2 = x1 + barWidth + 4;

          const h1 = getH(d.value);
          const y1 = paddingTop + innerHeight - h1;

          return (
            <g 
              key={i} 
              onMouseEnter={() => setHoveredIndex(i)} 
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer transition-opacity"
              opacity={hoveredIndex !== null && !isHovered ? 0.6 : 1}
            >
              <rect 
                x={x1} 
                y={y1} 
                width={barWidth} 
                height={h1} 
                fill={primaryColor} 
                rx="3"
                className="transition-all duration-150"
              />
              {hasSecondary && (
                <rect 
                  x={x2} 
                  y={paddingTop + innerHeight - getH(d.secondaryValue || 0)} 
                  width={barWidth} 
                  height={getH(d.secondaryValue || 0)} 
                  fill={secondaryColor} 
                  rx="3"
                  className="transition-all duration-150"
                />
              )}
              {/* Category label */}
              <text 
                x={groupX + groupWidth / 2} 
                y={height - 10} 
                textAnchor="middle" 
                className="text-[10px] fill-slate-500 dark:fill-slate-400 font-medium"
              >
                {d.category.length > 12 ? d.category.substring(0, 10) + '..' : d.category}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div 
          className="absolute z-10 pointer-events-none p-2 rounded-lg bg-slate-900/95 text-white text-xs shadow-lg border border-slate-700 backdrop-blur-sm -translate-x-1/2 -translate-y-full"
          style={{
            left: `${((paddingLeft + (hoveredIndex + 0.5) * groupWidth) / chartWidth) * 100}%`,
            top: '40%'
          }}
        >
          <div className="font-semibold text-white mb-1">
            {data[hoveredIndex].category}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span>Primary:</span>
            <span className="font-mono tabular-nums font-semibold">{formatValue(data[hoveredIndex].value)}</span>
          </div>
          {hasSecondary && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
              <span>Secondary:</span>
              <span className="font-mono tabular-nums font-semibold">{formatValue(data[hoveredIndex].secondaryValue!)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
