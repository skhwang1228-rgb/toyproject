import Link from "next/link";

import { cn } from "@/lib/utils";

import { eventsHref } from "./href";
import type { Filters } from "./filters";
import { calendarCells, type Period } from "./period";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 날짜별 시작 행사 수를 보여주고, 날짜를 누르면 그 주 보기로 이동한다. */
export function MonthCalendar({
  period,
  counts,
  today,
  filters,
}: {
  period: Period;
  counts: Map<string, number>;
  today: string;
  filters: Filters;
}) {
  return (
    <div className="grid grid-cols-7 gap-1" role="grid" aria-label="월간 달력">
      {WEEKDAYS.map((day) => (
        <div key={day} className="py-1 text-center text-xs font-medium text-muted-foreground">
          {day}
        </div>
      ))}
      {calendarCells(period).map((date, index) => {
        if (!date) return <div key={`blank-${index}`} />;
        const count = counts.get(date) ?? 0;
        return (
          <Link
            key={date}
            href={eventsHref("week", date, filters)}
            className={cn(
              "flex min-h-14 flex-col items-center gap-1 rounded-lg border p-1.5 text-sm transition-colors hover:bg-muted",
              date === today && "border-primary",
            )}
          >
            <span className={cn(date === today && "font-semibold text-primary")}>{Number(date.slice(8))}</span>
            {count > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{count}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
