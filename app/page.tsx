import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  EventList,
  MonthCalendar,
  PeriodNav,
  eventsInPeriod,
  fetchCulturalEvents,
  getPeriod,
  groupByStartDay,
  isIsoDate,
  startCountByDay,
  todayInSeoul,
  type View,
} from "@/features/cultural-events";

const PAGE_SIZE = 60;

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const today = todayInSeoul();
  const view: View = first(params.view) === "week" ? "week" : "month";
  const date = first(params.date);
  const period = getPeriod(view, isIsoDate(date) ? date : today);
  const limit = Math.max(PAGE_SIZE, Number(first(params.limit)) || PAGE_SIZE);

  const result = await fetchCulturalEvents();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">서울 문화행사</h1>
        <p className="text-sm text-muted-foreground">서울문화포털의 공연, 전시, 행사를 월간과 주간으로 모아 봅니다.</p>
      </header>

      <PeriodNav period={period} today={today} />

      {result.status === "error" ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>문화행사를 불러오지 못했습니다</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      ) : (
        <Events events={eventsInPeriod(result.events, period)} period={period} today={today} limit={limit} />
      )}
    </main>
  );
}

function Events({
  events,
  period,
  today,
  limit,
}: {
  events: ReturnType<typeof eventsInPeriod>;
  period: ReturnType<typeof getPeriod>;
  today: string;
  limit: number;
}) {
  const visible = events.slice(0, limit);
  return (
    <>
      {period.view === "month" && <MonthCalendar period={period} counts={startCountByDay(events)} today={today} />}
      <p className="text-sm text-muted-foreground">
        이 기간의 행사 <span className="font-semibold text-foreground">{events.length.toLocaleString()}</span>건
      </p>
      <EventList groups={groupByStartDay(visible, period)} total={events.length} shown={visible.length} period={period} />
    </>
  );
}
