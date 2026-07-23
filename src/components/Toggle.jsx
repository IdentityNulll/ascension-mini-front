/** Custom on/off switch replacing the native checkbox. Controlled. */
export default function Toggle({ checked, onChange, label, hint, disabled = false }) {
  return (
    <label className={`flex items-center gap-2.5 select-none ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors outline-none
                    focus-visible:ring-2 focus-visible:ring-accent/40 ${checked ? 'bg-accent' : 'bg-ink-faint/50'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform
                      ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
      {label && (
        <span className="text-sm text-ink">
          {label}
          {hint && <span className="block text-2xs text-ink-faint">{hint}</span>}
        </span>
      )}
    </label>
  );
}
