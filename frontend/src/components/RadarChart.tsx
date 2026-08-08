import React from 'react';

interface RadarChartProps {
  labels: string[];
  values: number[];  // 0-5 scale
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  labels,
  values,
  size = 280
}) => {
  const center = size / 2;
  const maxRadius = size * 0.38;
  const levels = 5;
  const n = labels.length;

  const getPoint = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };

  // Generate grid circles
  const gridLines = Array.from({ length: levels }, (_, i) => {
    const radius = (maxRadius * (i + 1)) / levels;
    const points = Array.from({ length: n }, (_, j) => {
      const p = getPoint(j, radius);
      return `${p.x},${p.y}`;
    }).join(' ');
    return points;
  });

  // Generate data polygon
  const dataPoints = values.map((v: number, i: number) => {
    const radius = (maxRadius * Math.min(v, 5)) / 5;
    const p = getPoint(i, radius);
    return `${p.x},${p.y}`;
  }).join(' ');

  // Axis lines
  const axisLines = Array.from({ length: n }, (_, i) => getPoint(i, maxRadius));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid polygons */}
        {gridLines.map((points, i) => (
          <polygon
            key={`grid-${i}`}
            points={points}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((p, i) => (
          <line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={1}
          />
        ))}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill="rgba(177, 193, 239, 0.15)"
          stroke="var(--accent-1)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {values.map((v: number, i: number) => {
          const radius = (maxRadius * Math.min(v, 5)) / 5;
          const p = getPoint(i, radius);
          return (
            <circle
              key={`point-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="var(--accent-1)"
              stroke="var(--base-100)"
              strokeWidth={2}
            />
          );
        })}

        {/* Labels */}
        {labels.map((label: string, i: number) => {
          const p = getPoint(i, maxRadius + 24);
          const words = label.split(' ');
          return (
            <text
              key={`label-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--base-muted)"
              fontFamily="DM Mono, monospace"
              fontSize="9"
              style={{ textTransform: 'uppercase' }}
            >
              {words.length <= 2 ? (
                <tspan>{label}</tspan>
              ) : (
                <>
                  <tspan x={p.x} dy="-0.5em">{words.slice(0, 2).join(' ')}</tspan>
                  <tspan x={p.x} dy="1.1em">{words.slice(2).join(' ')}</tspan>
                </>
              )}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
