import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  FiChevronLeft, FiChevronRight, FiBookOpen, FiEdit3,
} from 'react-icons/fi';
import dayjs from '../../lib/dayjs';
import {
  useGetJournalDayQuery, useGetJournalMonthQuery, useGetJournalStatsQuery, useUpsertJournalMutation,
} from '../../app/api';
import { PageHeader, StatCard, Spinner, EmptyState } from '../../components/misc';
import Button from '../../components/Button';
import { Textarea } from '../../components/Field';
import ChartCard from '../analytics/ChartCard';
import Heatmap from '../analytics/Heatmap';
import { monthDates } from '../quests/questMath';

const TODAY = () => dayjs().format('YYYY-MM-DD');
const wc = (s) => {
  const t = (s || '').trim();
  return t ? t.split(/\s+/).length : 0;
};

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const month = selectedDate.slice(0, 7);

  const { data: dayData } = useGetJournalDayQuery(selectedDate);
  const { data: monthEntries = [] } = useGetJournalMonthQuery(month);
  const { data: stats } = useGetJournalStatsQuery();
  const [upsert] = useUpsertJournalMutation();

  const [content, setContent] = useState('');
  const savedRef = useRef('');
  const loadedRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error

  // Load the day's content the first time we receive it for a given date.
  useEffect(() => {
    if (dayData && dayData.date === selectedDate && loadedRef.current !== selectedDate) {
      setContent(dayData.content || '');
      savedRef.current = dayData.content || '';
      loadedRef.current = selectedDate;
      setStatus('idle');
    }
  }, [dayData, selectedDate]);

  const dirty = loadedRef.current === selectedDate && content !== savedRef.current;

  const save = useCallback(
    async (date, text) => {
      setStatus('saving');
      try {
        await upsert({ date, content: text }).unwrap();
        savedRef.current = text;
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    },
    [upsert]
  );

  // Debounced autosave.
  useEffect(() => {
    if (!dirty) return undefined;
    const t = setTimeout(() => save(selectedDate, content), 900);
    return () => clearTimeout(t);
  }, [content, dirty, selectedDate, save]);

  // Warn on leaving with unsaved changes.
  useEffect(() => {
    const h = (e) => {
      if (dirty || status === 'saving') { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty, status]);

  const goTo = async (date) => {
    if (date === selectedDate) return;
    if (dirty) await save(selectedDate, content); // flush before switching
    loadedRef.current = null;
    setSelectedDate(date);
  };

  const shift = (n) => goTo(dayjs(selectedDate).add(n, 'day').format('YYYY-MM-DD'));

  const isToday = selectedDate === TODAY();
  const canGoNext = selectedDate < TODAY();
  const words = wc(content);

  // Heatmap for the selected month (intensity by word count).
  const monthCells = useMemo(() => {
    const byDate = Object.fromEntries(monthEntries.map((e) => [e.date, wc(e.content)]));
    return monthDates(month).map((d) => ({ date: d, value: byDate[d] || 0 }));
  }, [monthEntries, month]);

  const relative = (() => {
    const diff = dayjs(selectedDate).diff(dayjs(TODAY()), 'day');
    if (diff === 0) return 'Today';
    if (diff === -1) return 'Yesterday';
    if (diff === 1) return 'Tomorrow';
    return diff < 0 ? `${-diff} days ago` : `in ${diff} days`;
  })();

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Journal"
        description="Write whatever you're feeling, one entry per day. It's yours — no AI reads it."
        actions={<SaveStatus status={status} dirty={dirty} />}
      />

      {/* Writing panel */}
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
              <div className="text-sm font-semibold text-ink leading-tight">
                {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
              </div>
              <div className="text-2xs text-ink-faint">{relative}</div>
            </div>
          </div>
          {!isToday && (
            <Button variant="secondary" size="sm" onClick={() => goTo(TODAY())}>Jump to today</Button>
          )}
        </div>
        <div className="p-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What happened today? How are you feeling? What's on your mind?`}
            className="min-h-[280px] resize-y text-[13.5px] leading-7"
          />
          <div className="mt-2 flex items-center justify-between text-2xs text-ink-faint tabular">
            <span>{words} {words === 1 ? 'word' : 'words'} · {content.length} chars</span>
            <span>{dirty ? 'Editing…' : status === 'saved' ? 'Saved' : ''}</span>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <h2 className="text-sm font-semibold text-ink mb-3">Journaling analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <StatCard label="Current streak" value={`${stats?.currentStreak ?? 0} d`} accent />
        <StatCard label="Longest streak" value={`${stats?.longestStreak ?? 0} d`} />
        <StatCard label="Entries this month" value={monthEntries.length} />
        <StatCard label="Total entries" value={stats?.totalEntries ?? 0} />
        <StatCard label="Total words" value={(stats?.totalWords ?? 0).toLocaleString()} />
        <StatCard label="Avg words / entry" value={stats?.avgWords ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Coverage" subtitle={`${dayjs(`${month}-01`).format('MMMM YYYY')} — shade by words written`}>
          <Heatmap cells={monthCells} label="words" onPick={goTo} />
        </ChartCard>

        <ChartCard title="Recent entries" subtitle="Click to open a day">
          {stats?.recent?.length ? (
            <div className="divide-y divide-line max-h-[320px] overflow-auto scroll-thin -mx-1">
              {stats.recent.map((r) => (
                <button
                  key={r.date}
                  onClick={() => goTo(r.date)}
                  className="w-full text-left px-1 py-2 hover:bg-surface-subtle rounded transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink">{dayjs(r.date).format('ddd, MMM D')}</span>
                    <span className="text-2xs text-ink-faint tabular">{r.words} words</span>
                  </div>
                  <p className="text-2xs text-ink-muted truncate mt-0.5">{r.snippet || '—'}</p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="No entries yet" message="Write your first entry above — it'll show up here." />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function SaveStatus({ status, dirty }) {
  let text = '';
  let cls = 'text-ink-faint';
  if (status === 'saving') { text = 'Saving…'; cls = 'text-ink-muted'; }
  else if (dirty) { text = 'Unsaved changes'; cls = 'text-amber-600'; }
  else if (status === 'saved') { text = 'Saved'; cls = 'text-success'; }
  else if (status === 'error') { text = 'Save failed'; cls = 'text-danger'; }
  if (!text) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-2xs font-medium ${cls}`}>
      <FiEdit3 className="text-[12px]" />
      {text}
    </span>
  );
}
