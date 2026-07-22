import dayjs from '../../lib/dayjs';

// Blend from soft blue to strong blue by intensity.
function shade(value, max) {
  if (!value) return '#f3f4f6';
  const t = Math.min(1, value / max);
  const from = [219, 234, 254]; // #dbeafe
  const to = [29, 78, 216]; // #1d4ed8
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/** Month calendar heatmap. cells: [{ date, xp }]. */
export default function Heatmap({ cells }) {
  if (!cells?.length) return null;
  const max = Math.max(1, ...cells.map((c) => c.xp));
  const firstDow = (dayjs(cells[0].date).day() + 6) % 7; // Monday = 0
  const blanks = Array.from({ length: firstDow });
  const dows = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = dayjs().format('YYYY-MM-DD');

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dows.map((d, i) => (
          <div key={i} className="text-center text-2xs text-ink-faint">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {cells.map((c) => {
          const strong = c.xp / max > 0.55;
          return (
            <div
              key={c.date}
              className={`aspect-square rounded flex items-center justify-center text-2xs tabular ${c.date === today ? 'ring-2 ring-accent' : ''}`}
              style={{ background: shade(c.xp, max), color: strong ? '#fff' : '#6b7280' }}
              title={`${dayjs(c.date).format('MMM D')} — ${c.xp} XP`}
            >
              {Number(c.date.slice(-2))}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3 text-2xs text-ink-faint">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <span key={t} className="h-3 w-3 rounded" style={{ background: shade(t * max || (t === 0 ? 0 : 1), max) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
