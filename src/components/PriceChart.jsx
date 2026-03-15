/**
 * PriceChart — SVG sparkline showing prediction-market probability over time.
 *
 * Renders a simple polyline chart with a 50% reference line.
 * Suitable for Polymarket and Kalshi historical price data.
 *
 * @param {{ t: number, p: number }[]} series  - price history, sorted ascending by t
 * @param {string}  color    - CSS color string for the line (default: var(--green))
 * @param {string}  label    - optional label rendered in the top-left corner
 * @param {number}  height   - chart height in px (default: 72)
 */
export const PriceChart = ({ series, color = 'var(--green)', label, height = 72 }) => {
  const W = 300;
  const H = height;
  const PAD = { top: 8, right: 8, bottom: 16, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  if (!series || series.length < 2) {
    return (
      <div className="price-chart-no-data">
        NO HISTORY DATA
      </div>
    );
  }

  const tMin = series[0].t;
  const tMax = series[series.length - 1].t;
  const tRange = tMax - tMin || 1;

  const toX = (t) => PAD.left + ((t - tMin) / tRange) * innerW;
  const toY = (p) => PAD.top + (1 - p) * innerH; // p=1 → top, p=0 → bottom

  const points = series.map((pt) => `${toX(pt.t).toFixed(1)},${toY(pt.p).toFixed(1)}`).join(' ');

  // 50% reference line y position
  const midY = toY(0.5).toFixed(1);

  // Y-axis labels: 0%, 50%, 100%
  const yLabels = [
    { p: 1,   label: '100%' },
    { p: 0.5, label:  '50%' },
    { p: 0,   label:   '0%' },
  ];

  // Current price (last point)
  const lastPt = series[series.length - 1];
  const currentPct = (lastPt.p * 100).toFixed(1);

  return (
    <div className="price-chart-wrapper">
      {label && (
        <div className="price-chart-label">
          {label} — CURRENT: <span style={{ color }}>{currentPct}%</span>
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height, display: 'block' }}
        aria-label={label ? `${label} price chart` : 'Price history chart'}
      >
        {/* Y-axis labels */}
        {yLabels.map(({ p, label: l }) => (
          <text
            key={l}
            x={PAD.left - 4}
            y={toY(p) + 3}
            textAnchor="end"
            fontSize={8}
            fill="var(--text-dim)"
            fontFamily="var(--mono)"
          >
            {l}
          </text>
        ))}

        {/* 50% reference line */}
        <line
          x1={PAD.left}
          y1={midY}
          x2={W - PAD.right}
          y2={midY}
          stroke="var(--border2)"
          strokeWidth={0.5}
          strokeDasharray="2 3"
        />

        {/* Area fill under the line */}
        <polyline
          points={[
            `${toX(tMin).toFixed(1)},${(PAD.top + innerH).toFixed(1)}`,
            points,
            `${toX(tMax).toFixed(1)},${(PAD.top + innerH).toFixed(1)}`,
          ].join(' ')}
          fill={color}
          fillOpacity={0.08}
          stroke="none"
        />

        {/* Price line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Terminal dot at current price */}
        <circle
          cx={toX(lastPt.t).toFixed(1)}
          cy={toY(lastPt.p).toFixed(1)}
          r={2.5}
          fill={color}
        />
      </svg>
    </div>
  );
};
