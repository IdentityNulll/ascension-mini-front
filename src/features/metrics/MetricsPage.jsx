import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import dayjs from '../../lib/dayjs';
import { selectMonth } from '../../app/monthSlice';
import {
  useGetMetricsQuery, useGetMetricEntriesQuery, useUpsertMetricEntryMutation, useDeleteMetricMutation,
} from '../../app/api';
import { PageHeader, EmptyState, Spinner } from '../../components/misc';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import MetricModal from './MetricModal';
import MetricCell from './MetricCell';
import { monthDates } from '../quests/questMath';

const TYPE_LABEL = { number: 'Number', time: 'Time', rating: 'Rating', boolean: 'Yes/No', text: 'Text' };

export default function MetricsPage() {
  const month = useSelector(selectMonth);
  const today = dayjs().format('YYYY-MM-DD');
  const { data: metrics = [], isLoading } = useGetMetricsQuery();
  const { data: entries = [] } = useGetMetricEntriesQuery(month);
  const [upsert] = useUpsertMetricEntryMutation();
  const [deleteMetric, { isLoading: deleting }] = useDeleteMetricMutation();

  const [modalMetric, setModalMetric] = useState(undefined);
  const [confirm, setConfirm] = useState(null);

  const dates = useMemo(() => monthDates(month), [month]);
  const map = useMemo(() => {
    const m = new Map();
    for (const e of entries) m.set(`${e.metricId}|${e.date}`, e.value);
    return m;
  }, [entries]);

  const summary = (metric) => {
    const vals = dates.map((d) => map.get(`${metric._id}|${d}`)).filter((v) => v !== undefined && v !== null && v !== '');
    if (metric.type === 'boolean') {
      const yes = vals.filter((v) => v === true || v === 'true').length;
      return `${yes}/${vals.length} yes`;
    }
    if (metric.type === 'text') return `${vals.length} logged`;
    const nums = vals.map(Number).filter((n) => !isNaN(n));
    if (!nums.length) return '—';
    const avg = nums.reduce((s, v) => s + v, 0) / nums.length;
    return `${avg.toFixed(1)}${metric.unit ? ` ${metric.unit}` : ''}`;
  };

  const onEdit = async (metric, date, value) => {
    try {
      await upsert({ metricId: metric._id, date, value }).unwrap();
    } catch (e) {
      toast.error(e.message || 'Failed to save');
    }
  };

  const onDelete = async () => {
    try {
      await deleteMetric(confirm._id).unwrap();
      toast.success('Metric deleted');
      setConfirm(null);
    } catch (e) {
      toast.error(e.message || 'Failed');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Daily Metrics"
        description="Track any custom metric — numbers, time, ratings, yes/no, or notes."
        actions={<Button variant="primary" icon={FiPlus} onClick={() => setModalMetric(null)}>New metric</Button>}
      />

      {metrics.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No metrics yet"
            message="Create custom metrics like Sleep, Screen Time, Mood, or Weight."
            action={<Button variant="primary" icon={FiPlus} onClick={() => setModalMetric(null)}>New metric</Button>}
          />
        </div>
      ) : (
        <div className="panel overflow-x-auto scroll-thin">
          <table className="data-table border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-surface-raised min-w-[180px]">Metric</th>
                <th className="min-w-[90px]">Type</th>
                {dates.map((d) => (
                  <th
                    key={d}
                    className={`text-center px-0 w-11 ${d === today ? 'bg-accent-soft text-accent' : ''}`}
                    title={dayjs(d).format('ddd, MMM D')}
                  >
                    {Number(d.slice(-2))}
                  </th>
                ))}
                <th className="text-right min-w-[110px]">Summary</th>
                <th className="text-right w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m._id} className="group">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-surface-subtle min-w-[180px]">
                    <span className="font-medium text-ink">{m.name}</span>
                    {m.unit && <span className="text-ink-faint ml-1 text-2xs">({m.unit})</span>}
                    {!m.active && <span className="badge bg-surface-raised text-ink-faint ml-2">inactive</span>}
                  </td>
                  <td className="text-ink-muted text-2xs">{TYPE_LABEL[m.type]}</td>
                  {dates.map((d) => (
                    <MetricCell
                      key={d}
                      metric={m}
                      value={map.get(`${m._id}|${d}`) ?? null}
                      isToday={d === today}
                      onCommit={(v) => onEdit(m, d, v)}
                    />
                  ))}
                  <td className="text-right tabular font-medium text-ink">{summary(m)}</td>
                  <td className="text-right whitespace-nowrap">
                    <button className="btn btn-ghost btn-icon" onClick={() => setModalMetric(m)} aria-label="Edit">
                      <FiEdit2 className="text-[14px]" />
                    </button>
                    <button className="btn btn-ghost btn-icon text-danger" onClick={() => setConfirm(m)} aria-label="Delete">
                      <FiTrash2 className="text-[14px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MetricModal open={modalMetric !== undefined} metric={modalMetric || undefined} onClose={() => setModalMetric(undefined)} />
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete metric"
        message={`Delete "${confirm?.name}" and all its logged values? This cannot be undone.`}
      />
    </div>
  );
}
