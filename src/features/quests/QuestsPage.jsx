import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import dayjs from '../../lib/dayjs';
import { selectMonth } from '../../app/monthSlice';
import {
  useGetQuestsQuery, useGetCategoriesQuery, useGetQuestEntriesQuery,
  useUpsertQuestEntryMutation, useDeleteQuestMutation,
} from '../../app/api';
import { PageHeader, StatCard, SearchInput, EmptyState, Spinner } from '../../components/misc';
import Button from '../../components/Button';
import EditableCell from '../../components/EditableCell';
import ConfirmDialog from '../../components/ConfirmDialog';
import Select from '../../components/Select';
import QuestModal from './QuestModal';
import {
  monthDates, entryMap, cellXp, xpToSets, questMonthlyXp, questActiveDays, dailyTotals,
} from './questMath';
import { xp, pct } from '../../lib/format';

export default function QuestsPage() {
  const month = useSelector(selectMonth);
  const { data: quests = [], isLoading: qLoading } = useGetQuestsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: entries = [], isLoading: eLoading } = useGetQuestEntriesQuery(month);
  const [upsertEntry] = useUpsertQuestEntryMutation();
  const [deleteQuest, { isLoading: deleting }] = useDeleteQuestMutation();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalQuest, setModalQuest] = useState(undefined); // undefined = closed, null = new
  const [confirm, setConfirm] = useState(null);

  const dates = useMemo(() => monthDates(month), [month]);
  const map = useMemo(() => entryMap(entries), [entries]);
  const catName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c._id, c])),
    [categories]
  );

  const visibleQuests = useMemo(
    () =>
      quests.filter(
        (q) =>
          q.name.toLowerCase().includes(search.toLowerCase()) &&
          (!categoryFilter || q.categoryId === categoryFilter)
      ),
    [quests, search, categoryFilter]
  );

  const totals = useMemo(() => dailyTotals(quests, dates, map), [quests, dates, map]);
  const today = dayjs().format('YYYY-MM-DD');

  const stats = useMemo(() => {
    const monthlyXp = Object.values(totals).reduce((s, v) => s + v, 0);
    const activeDays = dates.filter((d) => (totals[d] || 0) > 0).length;
    const refDay = month === dayjs().format('YYYY-MM') ? today : dates[dates.length - 1];
    const refWeek = dayjs(refDay).isoWeek();
    const weeklyXp = dates
      .filter((d) => dayjs(d).isoWeek() === refWeek)
      .reduce((s, d) => s + (totals[d] || 0), 0);
    const avgCompletion =
      quests.length === 0
        ? 0
        : quests.reduce((s, q) => s + questActiveDays(q, dates, map) / dates.length, 0) /
          quests.length * 100;
    return {
      monthlyXp,
      weeklyXp,
      avgDaily: Math.round(monthlyXp / dates.length),
      activeDays,
      avgCompletion,
    };
  }, [totals, dates, quests, map, month, today]);

  const onEditCell = async (quest, date, newXp) => {
    const sets = newXp == null ? 0 : xpToSets(newXp, quest.xpPerSet);
    try {
      await upsertEntry({ questId: quest._id, date, sets }).unwrap();
    } catch (e) {
      toast.error(e.message || 'Failed to save');
    }
  };

  const onDelete = async () => {
    try {
      await deleteQuest(confirm._id).unwrap();
      toast.success('Quest deleted');
      setConfirm(null);
    } catch (e) {
      toast.error(e.message || 'Failed to delete');
    }
  };

  if (qLoading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Quest Tracker"
        description="Log daily progress. Each cell shows XP earned that day."
        actions={<Button variant="primary" icon={FiPlus} onClick={() => setModalQuest(null)}>New quest</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
        <StatCard label="Monthly XP" value={xp(stats.monthlyXp)} accent />
        <StatCard label="Weekly XP" value={xp(stats.weeklyXp)} sub="current week" />
        <StatCard label="Avg daily XP" value={xp(stats.avgDaily)} />
        <StatCard label="Active days" value={`${stats.activeDays} / ${dates.length}`} />
        <StatCard label="Avg completion" value={pct(stats.avgCompletion)} />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search quests…" />
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          className="w-44"
          options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c._id, label: c.name }))]}
        />
        <span className="ml-auto text-2xs text-ink-faint">{visibleQuests.length} quest(s)</span>
      </div>

      {quests.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No quests yet"
            message="Create your first quest to start tracking daily XP."
            action={<Button variant="primary" icon={FiPlus} onClick={() => setModalQuest(null)}>New quest</Button>}
          />
        </div>
      ) : (
        <div className="panel overflow-x-auto scroll-thin">
          <table className="data-table sheet border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-surface-raised min-w-[200px]">Quest</th>
                <th className="text-right">XP/Set</th>
                {dates.map((d) => (
                  <th
                    key={d}
                    className={`text-center px-0 w-11 ${d === today ? 'bg-accent-soft text-accent' : ''}`}
                    title={dayjs(d).format('ddd, MMM D')}
                  >
                    {Number(d.slice(-2))}
                  </th>
                ))}
                <th className="text-right min-w-[70px]">Month</th>
                <th className="text-right min-w-[64px]">%</th>
                <th className="text-right w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleQuests.map((q) => {
                const cat = catName[q.categoryId];
                const monthlyXp = questMonthlyXp(q, dates, map);
                const active = questActiveDays(q, dates, map);
                return (
                  <tr key={q._id} className="group">
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-surface-subtle min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink truncate">{q.name}</span>
                        {cat && (
                          <span className="chip shrink-0">
                            <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
                            {cat.name}
                          </span>
                        )}
                        {!q.active && <span className="badge bg-surface-raised text-ink-faint">inactive</span>}
                      </div>
                    </td>
                    <td className="text-right tabular text-ink-muted">{q.xpPerSet}</td>
                    {dates.map((d) => {
                      const sets = map.get(`${q._id}|${d}`);
                      return (
                        <EditableCell
                          key={d}
                          align="center"
                          value={cellXp(sets, q.xpPerSet) || null}
                          render={(v) => xp(v)}
                          highlight
                          onCommit={(newXp) => onEditCell(q, d, newXp)}
                          step={q.xpPerSet || 1}
                        />
                      );
                    })}
                    <td className="text-right tabular font-semibold text-accent">{xp(monthlyXp)}</td>
                    <td className="text-right tabular text-ink-muted">{pct((active / dates.length) * 100)}</td>
                    <td className="text-right whitespace-nowrap">
                      <button className="btn btn-ghost btn-icon" onClick={() => setModalQuest(q)} aria-label="Edit">
                        <FiEdit2 className="text-[14px]" />
                      </button>
                      <button className="btn btn-ghost btn-icon text-danger" onClick={() => setConfirm(q)} aria-label="Delete">
                        <FiTrash2 className="text-[14px]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-surface-raised font-medium">
                <td className="sticky left-0 z-10 bg-surface-raised text-ink">Daily XP</td>
                <td />
                {dates.map((d) => (
                  <td key={d} className={`text-center tabular ${d === today ? 'text-accent font-semibold' : 'text-ink-muted'}`}>
                    {totals[d] ? xp(totals[d]) : ''}
                  </td>
                ))}
                <td className="text-right tabular text-accent font-semibold">{xp(stats.monthlyXp)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {eLoading && <p className="mt-2 text-2xs text-ink-faint">Syncing…</p>}

      <QuestModal open={modalQuest !== undefined} quest={modalQuest || undefined} onClose={() => setModalQuest(undefined)} />
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete quest"
        message={`Delete "${confirm?.name}" and all its logged progress? This cannot be undone.`}
      />
    </div>
  );
}
