import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { selectMonth } from '../../app/monthSlice';
import {
  useGetXpAnalyticsQuery, useGetSpendingAnalyticsQuery, useGetProductivityAnalyticsQuery,
} from '../../app/api';
import { PageHeader, StatCard, Spinner, EmptyState } from '../../components/misc';
import ChartCard from './ChartCard';
import Heatmap from './Heatmap';
import { xp, pct } from '../../lib/format';

const PALETTE = ['#2563eb', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#22c55e'];
const AXIS = { fontSize: 11, fill: '#9ca3af' };
const TOOLTIP = {
  contentStyle: { fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px -2px rgba(0,0,0,0.1)' },
  labelStyle: { color: '#6b7280', fontSize: 11 },
};
const dayTick = (d) => (typeof d === 'string' ? Number(d.slice(-2)) : d);

function longestStreak(daily) {
  let best = 0, cur = 0;
  for (const d of daily) {
    if (d.xp > 0) { cur += 1; best = Math.max(best, cur); }
    else cur = 0;
  }
  return best;
}

export default function AnalyticsPage() {
  const month = useSelector(selectMonth);
  const { data: xpData, isLoading: l1 } = useGetXpAnalyticsQuery(month);
  const { data: spend, isLoading: l2 } = useGetSpendingAnalyticsQuery(month);
  const { data: prod, isLoading: l3 } = useGetProductivityAnalyticsQuery(month);

  const streak = useMemo(() => (xpData ? longestStreak(xpData.daily) : 0), [xpData]);

  if (l1 || l2 || l3) return <Spinner />;
  if (!xpData) return <EmptyState title="No analytics" message="Log some data first." />;

  const hasSpend = spend?.byItem?.length > 0;

  return (
    <div>
      <PageHeader title="Analytics" description="Automatically generated from your logged data." />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <StatCard label="Total XP (all-time)" value={xp(xpData.totalXp)} accent />
        <StatCard label="Monthly XP" value={xp(xpData.monthlyTotal)} />
        <StatCard label="Avg daily XP" value={xp(xpData.averageDaily)} />
        <StatCard label="Longest streak" value={`${streak} d`} />
        <StatCard label="Active days" value={`${xpData.activeDays} / ${xpData.daily.length}`} />
      </div>

      {/* Daily XP */}
      <ChartCard title="Daily XP" subtitle="XP earned each day this month" className="mb-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={xpData.daily} margin={{ top: 6, right: 12, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="date" tickFormatter={dayTick} tick={AXIS} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} interval={2} />
            <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} />
            <Tooltip {...TOOLTIP} formatter={(v) => [xp(v), 'XP']} labelFormatter={(d) => `Day ${dayTick(d)}`} />
            <Line type="monotone" dataKey="xp" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Weekly XP */}
        <ChartCard title="Weekly XP" subtitle="XP per week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={xpData.weekly} margin={{ top: 6, right: 12, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="week" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} />
              <Tooltip {...TOOLTIP} formatter={(v) => [xp(v), 'XP']} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="xp" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Spending breakdown */}
        <ChartCard title="Spending breakdown" subtitle="XP spent by reward">
          {hasSpend ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={spend.byItem} dataKey="xpSpent" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={1}>
                    {spend.byItem.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP} formatter={(v, n) => [xp(v) + ' XP', n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {spend.byItem.map((b, i) => (
                  <div key={b.shopItemId} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
                    <span className="text-ink truncate flex-1">{b.name}</span>
                    <span className="tabular text-ink-muted">{xp(b.xpSpent)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No spending" message="No purchases recorded this month." />
          )}
        </ChartCard>
      </div>

      {/* Heatmap + category comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="XP heatmap" subtitle="Daily intensity across the month">
          <Heatmap cells={xpData.heatmap} />
        </ChartCard>

        <ChartCard title="Category comparison" subtitle="XP earned by category">
          {prod?.byCategory?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={prod.byCategory} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={AXIS} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis type="category" dataKey="name" tick={AXIS} tickLine={false} axisLine={false} width={80} />
                <Tooltip {...TOOLTIP} formatter={(v) => [xp(v), 'XP']} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="xp" radius={[0, 3, 3, 0]} maxBarSize={22}>
                  {prod.byCategory.map((c, i) => <Cell key={i} fill={c.color || PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No category data" message="Add quests to compare categories." />
          )}
        </ChartCard>
      </div>

      {/* Quest completion + remaining trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Quest completion" subtitle="Share of days each quest was logged">
          {prod?.perQuest?.length ? (
            <div className="space-y-2.5">
              {prod.perQuest.map((q) => (
                <div key={q.questId}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ink truncate">{q.name}</span>
                    <span className="tabular text-ink-muted">{pct(q.completion)} · {xp(q.xp)} XP</span>
                  </div>
                  <div className="h-2 rounded bg-surface-raised overflow-hidden">
                    <div className="h-full rounded bg-accent" style={{ width: `${q.completion}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No quests" message="Add quests to see completion." />
          )}
        </ChartCard>

        <ChartCard title="Remaining XP trend" subtitle="Running balance across the month">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={spend?.remainingTrend || []} margin={{ top: 6, right: 12, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tickFormatter={dayTick} tick={AXIS} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} interval={2} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} />
              <Tooltip {...TOOLTIP} formatter={(v) => [xp(v), 'Remaining']} labelFormatter={(d) => `Day ${dayTick(d)}`} />
              <Line type="monotone" dataKey="remaining" stroke="#14b8a6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
