import { FiMinus, FiPlus } from 'react-icons/fi';

/**
 * Custom number field with explicit − / + steppers (native spinners are hidden
 * globally). Controlled: `value` + `onChange(number|'')`.
 */
export default function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  className = '',
  placeholder = '',
}) {
  const num = value === '' || value === null || value === undefined ? '' : Number(value);

  const clamp = (n) => {
    let v = n;
    if (min !== undefined && min !== null && v < min) v = min;
    if (max !== undefined && max !== null && v > max) v = max;
    return v;
  };

  const bump = (dir) => {
    if (disabled) return;
    const base = num === '' ? 0 : num;
    onChange(clamp(base + dir * step));
  };

  return (
    <div
      className={`flex items-stretch h-9 rounded-md border border-line-strong bg-white overflow-hidden transition
                  focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25 ${className}`}
    >
      <button
        type="button"
        onClick={() => bump(-1)}
        disabled={disabled || (num !== '' && min !== undefined && num <= min)}
        className="w-9 shrink-0 flex items-center justify-center text-ink-muted border-r border-line-strong
                   hover:bg-surface-subtle hover:text-ink disabled:opacity-40 disabled:hover:bg-white transition-colors"
        aria-label="Decrease"
        tabIndex={-1}
      >
        <FiMinus className="text-[14px]" />
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={num}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="flex-1 min-w-0 text-center text-sm text-ink tabular outline-none bg-transparent"
      />
      <button
        type="button"
        onClick={() => bump(1)}
        disabled={disabled || (num !== '' && max !== undefined && num >= max)}
        className="w-9 shrink-0 flex items-center justify-center text-ink-muted border-l border-line-strong
                   hover:bg-surface-subtle hover:text-ink disabled:opacity-40 disabled:hover:bg-white transition-colors"
        aria-label="Increase"
        tabIndex={-1}
      >
        <FiPlus className="text-[14px]" />
      </button>
    </div>
  );
}
