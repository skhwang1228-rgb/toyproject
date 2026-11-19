import type { CulturalEvent } from "./types";

export type View = "month" | "week";

export type Period = {
  view: View;
  /** 기간의 첫날 (월간은 1일, 주간은 일요일) */
  start: string;
  /** 기간의 마지막 날 */
  end: string;
  /** 기준일 */
  anchor: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isIsoDate(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toDate(value).getTime());
}

export function todayInSeoul(now: Date = new Date()): string {
  return now.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

export function addDays(iso: string, days: number): string {
  return toIso(new Date(toDate(iso).getTime() + days * DAY_MS));
}

export function getPeriod(view: View, anchor: string): Period {
  const date = toDate(anchor);
  if (view === "week") {
    const start = addDays(anchor, -date.getUTCDay());
    return { view, start, end: addDays(start, 6), anchor };
  }
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
  return { view, start: toIso(first), end: toIso(last), anchor };
}

/** 이전/다음 기간으로 이동할 때 쓸 기준일 */
export function shiftAnchor(period: Period, direction: -1 | 1): string {
  if (period.view === "week") return addDays(period.anchor, direction * 7);
  const date = toDate(period.anchor);
  return toIso(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + direction, 1)));
}

export function overlaps(event: CulturalEvent, period: Period): boolean {
  return event.startDate <= period.end && event.endDate >= period.start;
}

export function eventsInPeriod(events: CulturalEvent[], period: Period): CulturalEvent[] {
  return events
    .filter((event) => overlaps(event, period))
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title, "ko"));
}

export type DayGroup = { key: string; label: "ongoing" | string; events: CulturalEvent[] };

/** 기간 시작 전에 시작한 행사는 "ongoing" 그룹으로, 나머지는 시작일별로 묶는다. */
export function groupByStartDay(events: CulturalEvent[], period: Period): DayGroup[] {
  const groups = new Map<string, CulturalEvent[]>();
  for (const event of events) {
    const key = event.startDate < period.start ? "ongoing" : event.startDate;
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === "ongoing" ? -1 : b === "ongoing" ? 1 : a.localeCompare(b)))
    .map(([key, items]) => ({ key, label: key, events: items }));
}

/** 월간 달력 칸. 일요일 시작, 기간 밖 날짜는 null. */
export function calendarCells(period: Period): (string | null)[] {
  const firstWeekday = toDate(period.start).getUTCDay();
  const days = Math.round((toDate(period.end).getTime() - toDate(period.start).getTime()) / DAY_MS) + 1;
  const cells: (string | null)[] = Array(firstWeekday).fill(null);
  for (let i = 0; i < days; i++) cells.push(addDays(period.start, i));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function startCountByDay(events: CulturalEvent[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const event of events) counts.set(event.startDate, (counts.get(event.startDate) ?? 0) + 1);
  return counts;
}
