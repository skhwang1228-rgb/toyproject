import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CalendarPanel,
  EventFilters,
  EventList,
  MonthCalendar,
  PeriodNav,
  applyFilters,
  eventsInPeriod,
  fetchCulturalEvents,
  filterOptions,
  getPeriod,
  groupByStartDay,
  isIsoDate,
  parseFilters,
  startCountByDay,
  todayInSeoul,
  type CulturalEvent,
  type Filters,
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
  const filters = parseFilters(params);
  const limit = Math.max(PAGE_SIZE, Number(first(params.limit)) || PAGE_SIZE);

  const result = await fetchCulturalEvents();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">서울 문화행사</h1>
        <p className="text-sm text-muted-foreground">서울문화포털의 공연, 전시, 행사를 월간과 주간으로 모아 봅니다.</p>
      </header>

      <PeriodNav period={period} today={today} filters={filters} />

      {result.status === "error" ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>문화행사를 불러오지 못했습니다</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      ) : (
        <>
          {result.failedRanges.length > 0 && (
            <Alert>
              <CircleAlertIcon />
              <AlertTitle>일부 행사를 불러오지 못했습니다</AlertTitle>
              <AlertDescription>
                서울시 서버 응답이 불안정해 일부 구간({result.failedRanges.join(", ")}번째)이 빠졌습니다. 잠시 뒤 새로고침하면 다시 시도합니다.
              </AlertDescription>
            </Alert>
          )}
          <Events
            allEvents={result.events}
            period={period}
            today={today}
            filters={filters}
            limit={limit}
          />
        </>
      )}
    </main>
  );
}

function Events({
  allEvents,
  period,
  today,
  filters,
  limit,
}: {
  allEvents: CulturalEvent[];
  period: ReturnType<typeof getPeriod>;
  today: string;
  filters: Filters;
  limit: number;
}) {
  const periodEvents = eventsInPeriod(allEvents, period);
  const events = applyFilters(periodEvents, filters);
  const visible = events.slice(0, limit);

  // 달력은 항상 기준일이 속한 달을 보여준다. 주간 보기에서도 그 달의 날짜별 행사 수가 필요하다.
  const month = getPeriod("month", period.anchor);
  const monthEvents = period.view === "month" ? events : applyFilters(eventsInPeriod(allEvents, month), filters);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem] lg:items-start">
        <EventFilters view={period.view} anchor={period.anchor} filters={filters} options={filterOptions(periodEvents)} />
        <CalendarPanel key={period.view} defaultOpen={period.view === "month"}>
          <MonthCalendar
            month={month}
            selected={period}
            counts={startCountByDay(monthEvents)}
            today={today}
            filters={filters}
          />
        </CalendarPanel>
      </div>
      <p className="text-sm text-muted-foreground">
        이 기간의 행사 <span className="font-semibold text-foreground">{events.length.toLocaleString()}</span>건
      </p>
      <EventList
        groups={groupByStartDay(visible, period)}
        total={events.length}
        shown={visible.length}
        period={period}
        filters={filters}
      />
    </>
  );
}
