import { FiInbox, FiSearch } from 'react-icons/fi';

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 mb-4">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        {description && <p className="text-sm text-ink-muted mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub, accent }) {
  return (
    <div className="panel px-4 py-3">
      <div className="text-2xs font-medium uppercase tracking-wide text-ink-faint">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular ${accent ? 'text-accent' : 'text-ink'}`}>{value}</div>
      {sub && <div className="text-2xs text-ink-muted mt-0.5">{sub}</div>}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-raised text-ink-faint">
        <FiInbox className="text-[18px]" />
      </div>
      <h3 className="mt-3 text-sm font-medium text-ink">{title}</h3>
      {message && <p className="mt-1 text-sm text-ink-muted max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-muted">
      <span className="h-4 w-4 rounded-full border-2 border-line border-t-accent animate-spin" />
      {label}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-ink-faint" />
      <input
        className="input pl-8 w-56"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
