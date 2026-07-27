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

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`input ${className}`} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className = '', rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={`textarea ${className}`} {...props} />;
});
