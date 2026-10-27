import React from 'react';

interface RadialGaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  thresholds?: { warning: number; critical: number };
  invertThresholds?: boolean; // e.g. lower is worse for cache hit ratio
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  min = 0,
  max = 100,
  label = 'Performance Metric',
  unit = '%',
  thresholds = { warning: 90, critical: 80 },
  invertThresholds = true // for cache hit ratio: <80 is critical, <90 is warning
}) => {
  const clamped = Math.min(max, Math.max(min, value));
  const fraction = (clamped - min) / (max - min);

  // Gauge angles from -210 to +30 degrees (240 degree total sweep)
  const startAngle = -210;
  const sweepAngle = 240;
  const currentAngle = startAngle + fraction * sweepAngle;

  const radius = 68;
  const cx = 100;
  const cy = 105;
  const strokeWidth = 14;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
    const startPoint = polarToCartesian(x, y, r, end);
    const endPoint = polarToCartesian(x, y, r, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return [
      'M', startPoint.x, startPoint.y,
      'A', r, r, 0, largeArcFlag, 0, endPoint.x, endPoint.y
    ].join(' ');
  };

  // Status determination
  let statusColor = '#10b981'; // nominal emerald
  let statusText = 'NOMINAL';

  if (invertThresholds) {
    if (value <= thresholds.critical) {
      statusColor = '#ef4444';
      statusText = 'CRITICAL';
    } else if (value <= thresholds.warning) {
      statusColor = '#f59e0b';
      statusText = 'WARNING';
    }
  } else {
    if (value >= thresholds.critical) {
      statusColor = '#ef4444';
      statusText = 'CRITICAL';
    } else if (value >= thresholds.warning) {
      statusColor = '#f59e0b';
      statusText = 'WARNING';
    }
  }

  const bgPath = describeArc(cx, cy, radius, startAngle, startAngle + sweepAngle);
  const activePath = fraction > 0 ? describeArc(cx, cy, radius, startAngle, currentAngle) : '';

  return (
    <div className="flex flex-col items-center justify-center p-3 select-none">
      <div className="relative w-48 h-40">
        <svg viewBox="0 0 200 150" className="w-full h-full overflow-visible">
          {/* Background Track */}
          <path
            d={bgPath}
            fill="none"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          {activePath && (
            <path
              d={activePath}
              fill="none"
              stroke={statusColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          )}

          {/* Needle / Value Pointer Pin */}
          <circle
            cx={polarToCartesian(cx, cy, radius, currentAngle).x}
            cy={polarToCartesian(cx, cy, radius, currentAngle).y}
            r="6"
            fill={statusColor}
            stroke="#ffffff"
            strokeWidth="2.5"
            className="transition-all duration-300"
          />

          {/* Value Display */}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            className="text-2xl font-bold font-mono fill-slate-900 dark:fill-white tabular-nums"
          >
            {value.toFixed(1)}{unit}
          </text>

          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            className="text-[10px] font-semibold tracking-wider fill-slate-400 dark:fill-slate-500 uppercase"
          >
            {label}
          </text>
        </svg>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: statusColor }} 
        />
        <span className="text-[11px] font-semibold tracking-wider" style={{ color: statusColor }}>
          {statusText}
        </span>
        <span className="text-slate-400 text-xs">·</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Target: &gt; {thresholds.warning}{unit}
        </span>
      </div>
    </div>
  );
};
