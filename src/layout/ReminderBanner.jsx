import { FiAlertCircle, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { useGetTodayReminderQuery } from '../app/api';

/** Evening nudge: shows what still hasn't been logged today. */
export default function ReminderBanner() {
  const { data } = useGetTodayReminderQuery(undefined, { pollingInterval: 120000 });
  const [dismissed, setDismissed] = useState(false);

  if (!data || data.complete || data.missing.length === 0 || dismissed) return null;

  return (
    <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
      <FiAlertCircle className="text-[15px] shrink-0" />
      <span>
        You haven&apos;t logged today&apos;s <strong>{data.missing.join(' and ')}</strong> yet.
      </span>
      <button className="ml-auto text-amber-700 hover:text-amber-900" onClick={() => setDismissed(true)} aria-label="Dismiss">
        <FiX className="text-[14px]" />
      </button>
    </div>
  );
}
