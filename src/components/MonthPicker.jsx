import { useRef, useState, useCallback, useEffect } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import dayjs from '../lib/dayjs';
import { useClickOutside } from '../lib/useClickOutside';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Fully custom month picker (replaces <input type="month">).
 * Controlled: `value` is "YYYY-MM", `onChange` receives the same format.
 */
export default function MonthPicker({ value, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => Number((value || dayjs().format('YYYY-MM')).slice(0, 4)));
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  // Keep the displayed year in sync when the value changes externally.
  useEffect(() => {
    if (value) setViewYear(Number(value.slice(0, 4)));
  }, [value]);

  const selYear = Number((value || '').slice(0, 4));
  const selMonth = Number((value || '').slice(5, 7)); // 1-12
  const nowYear = dayjs().year();
  const nowMonth = dayjs().month() + 1;

  const pick = (monthIndex) => {
    const mm = String(monthIndex + 1).padStart(2, '0');
    onChange(`${viewYear}-${mm}`);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        className="control w-full min-w-[9.5rem]"
        data-open={open}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 truncate">
          <FiCalendar className="text-[15px] text-ink-muted shrink-0" />
          {value ? dayjs(`${value}-01`).format('MMMM YYYY') : 'Pick a month'}
        </span>
      </button>

      {open && (
        <div className="menu left-0 w-64 p-2">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-2 px-1">
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewYear((y) => y - 1)} aria-label="Previous year">
              <FiChevronLeft className="text-[15px]" />
            </button>
            <span className="text-sm font-semibold text-ink tabular">{viewYear}</span>
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewYear((y) => y + 1)} aria-label="Next year">
              <FiChevronRight className="text-[15px]" />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((m, i) => {
              const isSelected = viewYear === selYear && i + 1 === selMonth;
              const isCurrent = viewYear === nowYear && i + 1 === nowMonth;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => pick(i)}
                  className={[
                    'h-9 rounded-md text-sm transition-colors border',
                    isSelected
                      ? 'bg-accent border-accent text-white font-medium'
                      : 'border-transparent text-ink hover:bg-surface-subtle',
                    !isSelected && isCurrent ? 'text-accent font-medium' : '',
                  ].join(' ')}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
