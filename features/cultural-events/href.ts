import type { Filters } from "./filters";
import type { View } from "./period";

export function eventsHref(view: View, anchor: string, filters: Filters = {}, limit?: number): string {
  const params = new URLSearchParams({ view, date: anchor });
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  if (limit) params.set("limit", String(limit));
  return `/?${params.toString()}`;
}
