import dayjs from 'dayjs';

/** Compact integer with thousands separators. */
export const xp = (n) => Number(n ?? 0).toLocaleString('en-US');

export const signed = (n) => `${n >= 0 ? '+' : ''}${xp(n)}`;

export const pct = (n) => `${Math.round(n ?? 0)}%`;

export const dayNum = (dateStr) => Number(dateStr.slice(-2));

export const monthLabel = (month) => dayjs(`${month}-01`).format('MMMM YYYY');

export const weekdayShort = (dateStr) => dayjs(dateStr).format('dd');

/** Format a metric value for display based on its type. */
export function formatMetric(value, type, unit) {
  if (value === null || value === undefined || value === '') return '';
  if (type === 'boolean') return value === true || value === 'true' ? 'Yes' : 'No';
  if (type === 'rating') return `${value}${unit || ''}`;
  const suffix = unit ? ` ${unit}` : '';
  return `${value}${suffix}`;
}
