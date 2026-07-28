import { FiCheck } from 'react-icons/fi';

/** Custom square checkbox (no native input). Controlled. */
export default function Checkbox({ checked, onChange, disabled = false, size = 20 }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={!!checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{ height: size, width: size }}
      className={`shrink-0 rounded-[5px] border flex items-center justify-center transition-colors outline-none
                  focus-visible:ring-2 focus-visible:ring-accent/40
                  ${checked ? 'bg-accent border-accent text-white' : 'bg-white border-line-strong hover:border-ink-faint'}
                  ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
    >
      {checked && <FiCheck className="text-[13px]" strokeWidth={3} />}
    </button>
  );
}
