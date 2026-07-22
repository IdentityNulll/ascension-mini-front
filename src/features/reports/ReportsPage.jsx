import { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { selectMonth } from '../../app/monthSlice';
import { http } from '../../lib/axios';
import {
  useGetXpAnalyticsQuery, useGetSpendingAnalyticsQuery, useGetProductivityAnalyticsQuery,
} from '../../app/api';
import { PageHeader, StatCard, Spinner } from '../../components/misc';
import Button from '../../components/Button';
import { xp, monthLabel } from '../../lib/format';

const SECTIONS = [
  'Cover page with month summary',
  'Quest statistics — tables, XP totals, completion %',
  'Shop summary — purchases, spending breakdown, remaining XP',
  'Analytics — line, bar, pie charts + XP heatmap',
  'Daily metrics — averages, highs, lows, trends',
  'Final summary — best/worst days, categories, streaks',
];

export default function ReportsPage() {
  const month = useSelector(selectMonth);
  const [downloading, setDownloading] = useState(false);
  const { data: xpData, isLoading } = useGetXpAnalyticsQuery(month);
  const { data: spend } = useGetSpendingAnalyticsQuery(month);
  const { data: prod } = useGetProductivityAnalyticsQuery(month);

  const download = async () => {
    setDownloading(true);
    try {
      const res = await http.get(`/reports/${month}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ascension-${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <Spinner />;

  const highDay = xpData ? [...xpData.daily].sort((a, b) => b.xp - a.xp)[0] : null;

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Export a professional PDF report of the selected month."
        actions={
          <Button variant="primary" icon={FiDownload} onClick={download} disabled={downloading}>
            {downloading ? 'Generating…' : 'Export PDF'}
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Month" value={monthLabel(month)} />
        <StatCard label="XP earned" value={xp(xpData?.monthlyTotal ?? 0)} accent />
        <StatCard label="XP spent" value={xp(spend?.monthSpent ?? 0)} />
        <StatCard label="Highest XP day" value={highDay?.xp ? xp(highDay.xp) : '—'} sub={highDay?.xp ? highDay.date : ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <FiFileText className="text-accent text-[18px]" />
            <h2 className="text-sm font-semibold text-ink">{monthLabel(month)} report</h2>
          </div>
          <p className="text-sm text-ink-muted mb-4">
            A print-ready PDF you can archive. It includes every section below, generated from your live data.
          </p>
          <ul className="space-y-2">
            {SECTIONS.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-ink">
                <FiCheckCircle className="text-success text-[15px] mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <Button variant="primary" icon={FiDownload} onClick={download} disabled={downloading}>
              {downloading ? 'Generating…' : `Download ${month}.pdf`}
            </Button>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-sm font-semibold text-ink mb-3">At a glance</h2>
          <dl className="divide-y divide-line text-sm">
            <Row label="Strongest category" value={prod?.strongestCategory ? `${prod.strongestCategory.name} (${xp(prod.strongestCategory.xp)} XP)` : '—'} />
            <Row label="Weakest category" value={prod?.weakestCategory ? `${prod.weakestCategory.name} (${xp(prod.weakestCategory.xp)} XP)` : '—'} />
            <Row label="Most completed quest" value={prod?.mostCompleted ? `${prod.mostCompleted.name} (${prod.mostCompleted.completion}%)` : '—'} />
            <Row label="Least completed quest" value={prod?.leastCompleted ? `${prod.leastCompleted.name} (${prod.leastCompleted.completion}%)` : '—'} />
            <Row label="Most purchased reward" value={spend?.mostPurchased ? `${spend.mostPurchased.name} (${spend.mostPurchased.count}×)` : '—'} />
            <Row label="Active days" value={`${xpData?.activeDays ?? 0} / ${xpData?.daily.length ?? 0}`} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-ink font-medium text-right">{value}</dd>
    </div>
  );
}
