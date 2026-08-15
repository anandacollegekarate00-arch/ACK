import { ROYAL, SUCCESS, DANGER, WARNING } from '../lib/theme';

// Stacked composition chart for the Dashboard trend card: present → late →
// absent stack up to 100% of the marks each period, with the headline
// weighted rate (late = half credit) overlaid as a white line with dots.
// Periods with no records collapse to the baseline and read as gaps.
// Pure SVG, no charting library.
export function TrendCompositionChart({ data, height = 185 }) {
  const withData = data.filter((p) => p.total > 0);
  if (withData.length === 0) {
    return (
      <p className="text-xs text-[var(--ack-muted)] text-center py-8">
        No attendance records in this range yet — marks appear here as you log them.
      </p>
    );
  }
  const w = Math.max(300, data.length * 64);
  const h = height;
  const padTop = 14,
    padBottom = 30,
    padX = 10;
  const gridVals = [0, 25, 50, 75, 100];
  const toY = (v) => h - padBottom - (Math.max(0, Math.min(100, v)) / 100) * (h - padTop - padBottom);
  const bw = (w - padX * 2) / data.length;
  const xFor = (i) => padX + i * bw + bw / 2;
  const baseY = toY(0);

  function layerPath(lo, hi) {
    let d = '';
    data.forEach((p, i) => {
      const yLo = p.total > 0 ? toY(lo(p)) : baseY;
      d += `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yLo} `;
    });
    for (let i = data.length - 1; i >= 0; i--) {
      const p = data[i];
      d += `L ${xFor(i)} ${p.total > 0 ? toY(hi(p)) : baseY} `;
    }
    return d + 'Z';
  }

  // The rate line is drawn per contiguous run so gaps stay truly empty.
  const runs = [];
  let curRun = null;
  data.forEach((p, i) => {
    if (p.total > 0) {
      if (!curRun) {
        curRun = [];
        runs.push(curRun);
      }
      curRun.push({ x: xFor(i), y: toY(p.rate), label: p.rate });
    } else {
      curRun = null;
    }
  });

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {gridVals.map((v) => (
          <g key={v}>
            <line x1={padX} x2={w - padX} y1={toY(v)} y2={toY(v)} style={{ stroke: 'var(--ack-border)' }} strokeWidth="1" />
            <text x={padX - 3} y={toY(v) + 3} fontSize="8" fill="#9CA3AF" textAnchor="end">
              {v}%
            </text>
          </g>
        ))}
        <path
          d={layerPath(
            (_p) => 0,
            (p) => p.present
          )}
          fill={SUCCESS}
          opacity="0.8"
        />
        <path
          d={layerPath(
            (p) => p.present,
            (p) => p.present + p.late
          )}
          fill={WARNING}
          opacity="0.88"
        />
        <path
          d={layerPath(
            (p) => p.present + p.late,
            (p) => p.present + p.late + p.absent
          )}
          fill={DANGER}
          opacity="0.8"
        />
        {runs.map((run, ri) => (
          <g key={ri}>
            <polyline
              points={run.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#fff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <polyline
              points={run.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={ROYAL}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
        {runs
          .flatMap((run) => run)
          .map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke={ROYAL} strokeWidth="1.5" />
          ))}
        {data.map((p, i) => (
          <text key={i} x={xFor(i)} y={h - 10} fontSize="9" fill="#9CA3AF" textAnchor="middle">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function MiniBarChart({ data, labelKey, valueKey, color }) {
  const w = 300,
    h = 140,
    pad = 24;
  if (!data || data.length === 0) return <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} />;
  const bw = (w - pad * 2) / data.length;
  const toY = (v) => h - pad - (Math.max(0, Math.min(100, v)) / 100) * (h - pad * 2);
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {[0, 25, 50, 75, 100].map((v) => (
        <line key={v} x1={pad} x2={w - pad} y1={toY(v)} y2={toY(v)} style={{ stroke: 'var(--ack-border)' }} strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const barH = h - pad * 2 - (toY(d[valueKey]) - pad);
        return (
          <rect key={i} x={pad + i * bw + bw * 0.2} y={toY(d[valueKey])} width={bw * 0.6} height={Math.max(0, barH)} rx="3" fill={color} />
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={pad + i * bw + bw / 2} y={h - 4} fontSize="8" fill="#9CA3AF" textAnchor="middle">
          {d[labelKey]}
        </text>
      ))}
    </svg>
  );
}

// Donut chart for the Analytics screen's present/late/absent breakdown.
// Self-contained SVG (no charting library) to match MiniAreaChart/MiniBarChart.
export function DonutChart({ segments, size = 168, thickness = 22, centerLabel, centerSub }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2,
    cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: 'var(--ack-border)' }} strokeWidth={thickness} />
      {total > 0 &&
        segments
          .filter((s) => s.value > 0)
          .map((s, i) => {
            const dash = (s.value / total) * circumference;
            const el = (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-acc}
                transform={`rotate(-90 ${cx} ${cy})`}
                strokeLinecap="butt"
              />
            );
            acc += dash;
            return el;
          })}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fontSize="22"
        fontWeight="800"
        style={{ fill: 'var(--ack-heading)', fontFamily: 'Poppins, sans-serif' }}
      >
        {centerLabel}
      </text>
      {centerSub && (
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="9" style={{ fill: '#9CA3AF' }}>
          {centerSub}
        </text>
      )}
    </svg>
  );
}

// Wide trend bar chart shared by the daily / monthly / yearly attendance
// views on the Analytics screen. Scrolls horizontally once bars no longer
// comfortably fit — keeps 30 daily bars or a decade of yearly bars readable
// on a phone screen instead of squashing them unreadably thin. Once there
// are more than a handful of categories the x-axis labels tilt 40° (the
// standard fix for date-heavy bar charts) instead of colliding into each
// other; below that count they stay flat and centered, which reads cleaner
// for a small number of bars.
export function TrendBarChart({
  data,
  valueKey = 'rate',
  labelKey = 'label',
  color = ROYAL,
  height = 190,
  barMinWidth = 30,
  suffix = '%',
  maxValue = 100,
}) {
  if (!data || data.length === 0) return <p className="text-xs text-[var(--ack-muted)] text-center py-10">No data for this range yet.</p>;
  const rotate = data.length > 8;
  const w = Math.max(300, data.length * barMinWidth);
  const h = height;
  const padTop = 22,
    padBottom = rotate ? 52 : 26,
    padX = 16;
  const max = Math.max(1, maxValue);
  const toY = (v) => h - padBottom - (Math.max(0, Math.min(max, v)) / max) * (h - padTop - padBottom);
  const bw = (w - padX * 2) / data.length;
  const axisY = h - padBottom;
  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={w - padX}
            y1={toY(f * max)}
            y2={toY(f * max)}
            style={{ stroke: 'var(--ack-border)' }}
            strokeWidth="1"
          />
        ))}
        <line x1={padX} x2={w - padX} y1={axisY} y2={axisY} stroke="#E5E9F2" strokeWidth="1" />
        {data.map((d, i) => {
          const noData = !d.total;
          const x = padX + i * bw + bw * 0.22;
          const bw2 = bw * 0.56;
          const labelX = x + bw2 / 2;
          const barH = axisY - padTop - (toY(d[valueKey]) - padTop);
          return (
            <g key={i}>
              <rect
                x={x}
                y={noData ? axisY - 1 : toY(d[valueKey])}
                width={bw2}
                height={noData ? 1 : Math.max(1, barH)}
                rx="4"
                fill={color}
                opacity={noData ? 0.15 : 1}
              />
              {!noData && (
                <text x={labelX} y={toY(d[valueKey]) - 5} fontSize="9" fill="#9CA3AF" textAnchor="middle">
                  {d[valueKey]}
                  {suffix}
                </text>
              )}
              {rotate ? (
                <text
                  x={labelX}
                  y={axisY + 14}
                  fontSize="9"
                  fill="#9CA3AF"
                  textAnchor="end"
                  transform={`rotate(-40 ${labelX} ${axisY + 14})`}
                >
                  {d[labelKey]}
                </text>
              ) : (
                <text x={labelX} y={axisY + 16} fontSize="9" fill="#9CA3AF" textAnchor="middle">
                  {d[labelKey]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
