import { useDispatch, useSelector } from 'react-redux';
import { FiChevronLeft, FiChevronRight, FiMenu } from 'react-icons/fi';
import { selectMonth, shiftMonth, setMonth } from '../app/monthSlice';
import { useGetBalanceQuery } from '../app/api';
import { xp, monthLabel } from '../lib/format';
import NotificationsMenu from './NotificationsMenu';

export default function Topbar({ onMenu }) {
  const dispatch = useDispatch();
  const month = useSelector(selectMonth);
  const { data: balance } = useGetBalanceQuery();

  return (
    <header className="h-14 shrink-0 border-b border-line bg-white flex items-center justify-between gap-2 px-2 sm:px-4">
      {/* Menu (mobile) + month navigator */}
      <div className="flex items-center gap-1 min-w-0">
        <button
          className="btn btn-ghost btn-icon lg:hidden"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <FiMenu className="text-[18px]" />
        </button>
        <button className="btn btn-ghost btn-icon" onClick={() => dispatch(shiftMonth(-1))} aria-label="Previous month">
          <FiChevronLeft className="text-[16px]" />
        </button>
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && dispatch(setMonth(e.target.value))}
          className="input w-[8.5rem] sm:w-40 h-8 tabular"
          aria-label="Select month"
        />
        <button className="btn btn-ghost btn-icon" onClick={() => dispatch(shiftMonth(1))} aria-label="Next month">
          <FiChevronRight className="text-[16px]" />
        </button>
        <span className="ml-2 text-sm font-medium text-ink hidden xl:inline">{monthLabel(month)}</span>
      </div>

      {/* Balance + notifications */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-4 text-sm">
          <BalanceStat label="Earned" value={balance?.earned} />
          <BalanceStat label="Spent" value={balance?.spent} />
          <div className="flex items-center gap-1.5 rounded-md border border-accent-border bg-accent-soft px-2 sm:px-2.5 h-8">
            <span className="text-2xs font-medium uppercase tracking-wide text-accent/70 hidden sm:inline">Balance</span>
            <span className="text-sm font-semibold text-accent tabular">{xp(balance?.remaining ?? 0)}</span>
          </div>
        </div>
        <NotificationsMenu />
      </div>
    </header>
  );
}

function BalanceStat({ label, value }) {
  return (
    <div className="hidden md:flex items-center gap-1.5">
      <span className="text-2xs font-medium uppercase tracking-wide text-ink-faint">{label}</span>
      <span className="text-ink tabular">{xp(value ?? 0)}</span>
    </div>
  );
}
