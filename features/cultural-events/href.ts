import type { View } from "./period";

export function eventsHref(view: View, anchor: string, limit?: number): string {
  const params = new URLSearchParams({ view, date: anchor });
  if (limit) params.set("limit", String(limit));
  return `/?${params.toString()}`;
}
