import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiSunrise, FiEdit3 } from 'react-icons/fi';
import dayjs from '../../lib/dayjs';
import {
  useGetMorningDayQuery, useGetMorningMonthQuery, useGetMorningStatsQuery, useUpsertMorningMutation,
} from '../../app/api';
import { PageHeader, StatCard, Spinner } from '../../components/misc';
import Button from '../../components/Button';
import { Input } from '../../components/Field';
import Checkbox from '../../components/Checkbox';
import ChartCard from '../analytics/ChartCard';
import Heatmap from '../analytics/Heatmap';
import { monthDates } from '../quests/questMath';

const SLOTS = 6;
const TODAY = () => dayjs().format('YYYY-MM-DD');

const padItems = (items) => {
  const arr = (items || []).slice(0, SLOTS).map((i) => ({ text: i.text || '', done: !!i.done }));
  while (arr.length < SLOTS) arr.push({ text: '', done: false });
  return arr;
};
const completion = (items) => {
  const written = items.filter((i) => i.text.trim());
  const done = written.filter((i) => i.done).length;
  return { written: written.length, done, pct: written.length ? Math.round((done / written.length) * 100) : 0 };
};

export default function MorningPage() {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const month = selectedDate.slice(0, 7);

  const { data: dayData } = useGetMorningDayQuery(selectedDate);
  const { data: monthEntries = [] } = useGetMorningMonthQuery(month);
  const { data: stats } = useGetMorningStatsQuery();
  const [upsert] = useUpsertMorningMutation();

  const [items, setItems] = useState(padItems([]));
  const savedRef = useRef('');
  const loadedRef = useRef(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (dayData && dayData.date === selectedDate && loadedRef.current !== selectedDate) {
      const padded = padItems(dayData.items);
      setItems(padded);
      savedRef.current = JSON.stringify(padded);
      loadedRef.current = selectedDate;
      setStatus('idle');
    }
  }, [dayData, selectedDate]);

  const dirty = loadedRef.current === selectedDate && JSON.stringify(items) !== savedRef.current;

  const save = useCallback(
    async (date, its) => {
      setStatus('saving');
      try {
        await upsert({ date, items: its }).unwrap();
        savedRef.current = JSON.stringify(its);
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    },
    [upsert]
  );

  useEffect(() => {
    if (!dirty) return undefined;
    const t = setTimeout(() => save(selectedDate, items), 800);
    return () => clearTimeout(t);
  }, [items, dirty, selectedDate, save]);

  useEffect(() => {
    const h = (e) => { if (dirty || status === 'saving') { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty, status]);

  const goTo = async (date) => {
    if (date === selectedDate) return;
    if (dirty) await save(selectedDate, items);
    loadedRef.current = null;
    setSelectedDate(date);
  };
  const shift = (n) => goTo(dayjs(selectedDate).add(n, 'day').format('YYYY-MM-DD'));

  const setItem = (idx, patch) => setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const isToday = selectedDate === TODAY();
  const canGoNext = selectedDate < TODAY();
  const today = completion(items);

  const monthCells = useMemo(() => {
    const byDate = Object.fromEntries(monthEntries.map((e) => [e.date, completion(e.items).pct]));
    return monthDates(month).map((d) => ({ date: d, value: byDate[d] || 0 }));
  }, [monthEntries, month]);

  const relative = (() => {
    const diff = dayjs(selectedDate).diff(dayjs(TODAY()), 'day');
    if (diff === 0) return 'Today';
    if (diff === -1) return 'Yesterday';
    if (diff === 1) return 'Tomorrow';
    return diff < 0 ? `${-diff} days ago` : `in ${diff} days`;
  })();

  if (!items) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Morning Routine"
        description="Write your 6 things to do each morning, then check off what you actually did."
        actions={<SaveStatus status={status} dirty={dirty} />}
      />

      {/* Editor */}
      <div className="panel mb-5">
        <div className="flex items-center justify-between gap-2 px-3 h-12 border-b border-line">
          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-icon" onClick={() => shift(-1)} aria-label="Previous day">
              <FiChevronLeft className="text-[16px]" />
            </button>
            <button className="btn btn-ghost btn-icon" onClick={() => shift(1)} disabled={!canGoNext} aria-label="Next day">
              <FiChevronRight className="text-[16px]" />
            </button>
            <div className="ml-1.5">
              <div className="text-sm font-semibold text-ink leading-tight">{dayjs(selectedDate).format('dddd, MMMM D, YYYY')}</div>
              <div className="text-2xs text-ink-faint">{relative}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xs font-medium text-ink-muted tabular">{today.done}/{today.written || 0} done</span>
            {!isToday && <Button variant="secondary" size="sm" onClick={() => goTo(TODAY())}>Jump to today</Button>}
          </div>
        </div>

        <div className="p-3 space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="w-5 text-center text-2xs text-ink-faint tabular shrink-0">{i + 1}</span>
              <Checkbox checked={it.done} onChange={(done) => setItem(i, { done })} disabled={!it.text.trim()} />
              <Input
                value={it.text}
                onChange={(e) => setItem(i, { text: e.target.value })}
                placeholder={`Morning task ${i + 1}`}
                className={it.done && it.text.trim() ? 'line-through text-ink-muted' : ''}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Analytics */}
      <h2 className="text-sm font-semibold text-ink mb-3">Morning analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <StatCard label="Today" value={`${today.done}/${today.written || 0}`} accent />
        <StatCard label="Current streak" value={`${stats?.currentStreak ?? 0} d`} sub="all done" />
        <StatCard label="Best streak" value={`${stats?.longestStreak ?? 0} d`} />
        <StatCard label="Days logged" value={stats?.daysLogged ?? 0} />
        <StatCard label="Avg completion" value={`${stats?.avgCompletion ?? 0}%`} />
      </div>

      <ChartCard title="Completion" subtitle={`${dayjs(`${month}-01`).format('MMMM YYYY')} — shade by % completed`}>
        <Heatmap cells={monthCells} label="% done" onPick={goTo} />
      </ChartCard>
    </div>
  );
}

function SaveStatus({ status, dirty }) {
  let text = ''; let cls = 'text-ink-faint';
  if (status === 'saving') { text = 'Saving…'; cls = 'text-ink-muted'; }
  else if (dirty) { text = 'Unsaved changes'; cls = 'text-amber-600'; }
  else if (status === 'saved') { text = 'Saved'; cls = 'text-success'; }
  else if (status === 'error') { text = 'Save failed'; cls = 'text-danger'; }
  if (!text) return null;
  return <span className={`inline-flex items-center gap-1.5 text-2xs font-medium ${cls}`}><FiEdit3 className="text-[12px]" />{text}</span>;
}
