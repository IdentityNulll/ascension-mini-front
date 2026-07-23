import { useRef, useState, useCallback } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useClickOutside } from '../lib/useClickOutside';

export const SWATCHES = [
  '#2563eb', '#0ea5e9', '#14b8a6', '#22c55e', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#0d9488',
];

/**
 * Compact color picker: a round swatch that opens a palette popover.
 * Controlled: `value` (hex) + `onChange(hex)`.
 */
export default function ColorPicker({ value, onChange, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []), open);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-6 w-6 rounded-full ring-1 ring-inset ring-black/10 outline-none transition
                   hover:scale-110 focus-visible:ring-2 focus-visible:ring-accent"
        style={{ background: value }}
        aria-label="Choose color"
      />
      {open && (
        <div className={`menu ${align === 'right' ? 'right-0' : 'left-0'} p-2`}>
          <div className="grid grid-cols-5 gap-1.5">
            {SWATCHES.map((s) => {
              const active = s.toLowerCase() === String(value).toLowerCase();
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => { onChange(s); setOpen(false); }}
                  className="h-7 w-7 rounded-full flex items-center justify-center ring-1 ring-inset ring-black/10 transition hover:scale-110"
                  style={{ background: s }}
                  aria-label={s}
                >
                  {active && <FiCheck className="text-[13px] text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
