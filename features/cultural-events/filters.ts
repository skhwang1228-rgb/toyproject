import { isAvailableAt, parseClock, parseTimeSlots } from "./time-slots";
import type { CulturalEvent } from "./types";

export type Fee = "free" | "paid";

export type Filters = {
  category?: string;
  district?: string;
  fee?: Fee;
  /** 참여하려는 시각 (HH:MM) */
  time?: string;
  q?: string;
};

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  const picked = Array.isArray(value) ? value[0] : value;
  return picked?.trim() || undefined;
}

export function parseFilters(params: Params): Filters {
  const fee = first(params.fee);
  return {
    category: first(params.category),
    district: first(params.district),
    fee: fee === "free" || fee === "paid" ? fee : undefined,
    time: parseClock(first(params.time)) === null ? undefined : first(params.time),
    q: first(params.q),
  };
}

export function applyFilters(events: CulturalEvent[], filters: Filters): CulturalEvent[] {
  const keyword = filters.q?.toLowerCase();
  const at = parseClock(filters.time);
  return events.filter(
    (event) =>
      (!filters.category || event.category === filters.category) &&
      (!filters.district || event.district === filters.district) &&
      (!filters.fee || event.isFree === (filters.fee === "free")) &&
      (at === null || isAvailableAt(parseTimeSlots(event.time), at)) &&
      (!keyword || event.title.toLowerCase().includes(keyword)),
  );
}

export function hasFilters(filters: Filters): boolean {
  return Object.values(filters).some(Boolean);
}

export type FilterOptions = { categories: string[]; districts: string[] };

/** 선택지는 기간 안의 행사에서 뽑는다. 행사 수가 많은 분류가 앞에 온다. */
export function filterOptions(events: CulturalEvent[]): FilterOptions {
  const categoryCounts = new Map<string, number>();
  const districts = new Set<string>();
  for (const event of events) {
    if (event.category) categoryCounts.set(event.category, (categoryCounts.get(event.category) ?? 0) + 1);
    if (event.district) districts.add(event.district);
  }
  return {
    categories: [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name),
    districts: [...districts].sort((a, b) => a.localeCompare(b, "ko")),
  };
}
