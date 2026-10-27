import React, { useState } from 'react';

interface TimeSeriesChartProps {
  data: { timestamp: string; value1: number; value2?: number; label1?: string; label2?: string }[];
  height?: number;
  color1?: string;
  color2?: string;
  formatValue?: (val: number) => string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  height = 240,
  color1 = '#ef4444',
  color2 = '#3b82f6',
  formatValue = (v) => v.toLocaleString()
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-xs text-slate-400">No time-series data available</div>;
  }

  const values1 = data.map(d => d.value1);
  const values2 = data.map(d => d.value2 ?? 0);
  const hasSeries2 = data.some(d => d.value2 !== undefined);

  const maxVal = Math.max(...values1, ...(hasSeries2 ? values2 : [0])) * 1.15 || 100;
  const minVal = Math.min(0, Math.min(...values1));

  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = 600;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * innerWidth;
  const getY = (val: number) => paddingTop + innerHeight - ((val - minVal) / (maxVal - minVal || 1)) * innerHeight;

  // Build points path
  const points1 = data.map((d, i) => `${getX(i)},${getY(d.value1)}`).join(' ');
  const area1 = `${getX(0)},${getY(0)} ${points1} ${getX(data.length - 1)},${getY(0)}`;

  let points2 = '';
  let area2 = '';
  if (hasSeries2) {
    points2 = data.map((d, i) => `${getX(i)},${getY(d.value2!)}`).join(' ');
    area2 = `${getX(0)},${getY(0)} ${points2} ${getX(data.length - 1)},${getY(0)}`;
  }

  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color1} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color1} stopOpacity="0.0" />
          </linearGradient>
          {hasSeries2 && (
            <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color2} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color2} stopOpacity="0.0" />
            </linearGradient>
          )}
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((tick, idx) => {
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

        {/* Area and Line for Series 2 (if present) */}
        {hasSeries2 && (
          <>
            <polygon points={area2} fill="url(#grad2)" />
            <polyline 
              points={points2} 
              fill="none" 
              stroke={color2} 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Area and Line for Series 1 */}
        <polygon points={area1} fill="url(#grad1)" />
        <polyline 
          points={points1} 
          fill="none" 
          stroke={color1} 
          strokeWidth="2.5" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Hover Area */}
        {data.map((d, i) => {
          const x = getX(i);
          return (
            <rect
              key={i}
              x={x - innerWidth / data.length / 2}
              y={paddingTop}
              width={innerWidth / data.length}
              height={innerHeight}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          );
        })}

        {/* Active hover crosshair and point */}
        {hoverIndex !== null && data[hoverIndex] && (
          <g>
            <line 
              x1={getX(hoverIndex)} 
              y1={paddingTop} 
              x2={getX(hoverIndex)} 
              y2={paddingTop + innerHeight} 
              stroke="#94a3b8" 
              strokeWidth="1.5" 
              strokeDasharray="2 2"
            />
            <circle 
              cx={getX(hoverIndex)} 
              cy={getY(data[hoverIndex].value1)} 
              r="5" 
              fill={color1} 
              stroke="#ffffff" 
              strokeWidth="2"
            />
            {hasSeries2 && (
              <circle 
                cx={getX(hoverIndex)} 
                cy={getY(data[hoverIndex].value2!)} 
                r="4" 
                fill={color2} 
                stroke="#ffffff" 
                strokeWidth="2"
              />
            )}
          </g>
        )}

        {/* X-axis labels */}
        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 5)) === 0).map((d, i, arr) => {
          const idx = data.indexOf(d);
          return (
            <text
              key={idx}
              x={getX(idx)}
              y={chartHeight - 8}
              textAnchor="middle"
              className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
            >
              {d.timestamp.includes(' ') ? d.timestamp.split(' ')[1] : d.timestamp}
            </text>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoverIndex !== null && data[hoverIndex] && (
        <div 
          className="absolute z-10 pointer-events-none p-2 rounded-lg bg-slate-900/95 text-white text-xs shadow-lg border border-slate-700/80 backdrop-blur-sm -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(getX(hoverIndex) / chartWidth) * 100}%`,
            top: `${(getY(data[hoverIndex].value1) / chartHeight) * 100}%`
          }}
        >
          <div className="font-mono text-[10px] text-slate-400 mb-1">
            {data[hoverIndex].timestamp}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color1 }} />
            <span className="font-medium">{data[hoverIndex].label1 || 'Metric'}:</span>
            <span className="font-mono tabular-nums font-semibold">{formatValue(data[hoverIndex].value1)}</span>
          </div>
          {hasSeries2 && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color2 }} />
              <span className="font-medium">{data[hoverIndex].label2 || 'Secondary'}:</span>
              <span className="font-mono tabular-nums font-semibold">{formatValue(data[hoverIndex].value2!)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
