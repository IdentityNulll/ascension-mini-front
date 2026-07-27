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

/**
 * Month calendar heatmap. cells: [{ date, value }] (also accepts legacy `xp`).
 * `label` names the unit in tooltips (e.g. "XP", "words").
 * `onPick(date)` makes cells clickable.
 */
export default function Heatmap({ cells, label = 'XP', onPick }) {
  if (!cells?.length) return null;
  const val = (c) => c.value ?? c.xp ?? 0;
  const max = Math.max(1, ...cells.map(val));
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
          const v = val(c);
          const strong = v / max > 0.55;
          return (
            <div
              key={c.date}
              onClick={onPick ? () => onPick(c.date) : undefined}
              className={`aspect-square rounded flex items-center justify-center text-2xs tabular ${onPick ? 'cursor-pointer hover:ring-2 hover:ring-accent/50' : ''} ${c.date === today ? 'ring-2 ring-accent' : ''}`}
              style={{ background: shade(v, max), color: strong ? '#fff' : '#6b7280' }}
              title={`${dayjs(c.date).format('MMM D')} — ${v} ${label}`}
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
