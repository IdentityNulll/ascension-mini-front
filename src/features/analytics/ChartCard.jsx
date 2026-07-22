export default function ChartCard({ title, subtitle, right, children, className = '' }) {
  return (
    <div className={`panel ${className}`}>
      <div className="flex items-center justify-between px-4 h-11 border-b border-line">
        <div>
          <h3 className="text-xs font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-2xs text-ink-faint">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
