import { useRef, useState, useCallback } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { useClickOutside } from '../lib/useClickOutside';

/**
 * Fully custom dropdown (replaces native <select>).
 * Controlled: pass `value` + `onChange(value)` and `options: [{ value, label }]`.
 * Works with react-hook-form via <Controller>.
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  className = '',
  buttonClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const selected = options.find((o) => String(o.value) === String(value));

  const pick = (val) => {
    onChange(val);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Escape') setOpen(false);
    else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        className={`control w-full ${buttonClassName}`}
        data-open={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-ink truncate' : 'text-ink-faint truncate'}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown className={`text-[15px] text-ink-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="menu left-0 right-0 max-h-64 overflow-auto scroll-thin" role="listbox">
          {options.length === 0 && (
            <div className="px-2 py-1.5 text-xs text-ink-faint">No options</div>
          )}
          {options.map((o) => {
            const active = String(o.value) === String(value);
            return (
              <button
                key={String(o.value)}
                type="button"
                role="option"
                aria-selected={active}
                data-active={active}
                className="menu-item justify-between"
                onClick={() => pick(o.value)}
              >
                <span className="flex items-center gap-2 truncate">
                  {o.icon}
                  {o.label}
                </span>
                {active && <FiCheck className="text-[14px] text-accent shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
