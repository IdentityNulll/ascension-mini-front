import dayjs from 'dayjs';

export const daysInMonth = (month) => dayjs(`${month}-01`).daysInMonth();

export const monthDates = (month) => {
  const n = daysInMonth(month);
  const base = dayjs(`${month}-01`);
  return Array.from({ length: n }, (_, i) => base.add(i, 'day').format('YYYY-MM-DD'));
};

/** Map "questId|date" -> sets for O(1) lookup. */
export function entryMap(entries) {
  const m = new Map();
  for (const e of entries) m.set(`${e.questId}|${e.date}`, e.sets);
  return m;
}

/** XP earned = sets * xpPerSet. */
export const cellXp = (sets, xpPerSet) => (sets || 0) * xpPerSet;

/** Convert an edited XP value back to a stored "sets" count. */
export const xpToSets = (xpValue, xpPerSet) =>
  xpPerSet > 0 ? Number(xpValue) / xpPerSet : Number(xpValue);

const isSameIsoWeek = (a, b) => dayjs(a).isoWeek?.() === dayjs(b).isoWeek?.();

/** Sum XP for a quest across the given dates. */
export function questMonthlyXp(quest, dates, map) {
  return dates.reduce((sum, d) => sum + cellXp(map.get(`${quest._id}|${d}`), quest.xpPerSet), 0);
}

/** Days with any progress logged for a quest. */
export function questActiveDays(quest, dates, map) {
  return dates.reduce((n, d) => n + ((map.get(`${quest._id}|${d}`) || 0) > 0 ? 1 : 0), 0);
}

/** Daily XP totals across all quests: date -> xp. */
export function dailyTotals(quests, dates, map) {
  const totals = {};
  for (const d of dates) {
    totals[d] = quests.reduce((s, q) => s + cellXp(map.get(`${q._id}|${d}`), q.xpPerSet), 0);
  }
  return totals;
}
