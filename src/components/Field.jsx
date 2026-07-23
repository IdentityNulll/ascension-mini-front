import { forwardRef } from 'react';

export function Field({ label, error, children, hint }) {
  return (
    <div className="mb-3.5">
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-2xs text-ink-faint">{hint}</p>}
      {error && <p className="mt-1 text-2xs text-danger">{error}</p>}
    </div>
  );
}

export const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} className="input" {...props} />;
});
