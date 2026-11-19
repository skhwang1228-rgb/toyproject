import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Filters } from "./filters";
import { eventsHref } from "./href";
import { calendarCells, shiftAnchor, type Period } from "./period";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 작은 월 달력. 날짜별 시작 행사 수를 보여주고, 날짜를 누르면 그 날짜의 주간 보기로 이동한다.
 * 주간 보기에서는 보고 있는 주를 강조한다.
 */
export function MonthCalendar({
  month,
  selected,
  counts,
  today,
  filters,
}: {
  month: Period;
  selected: Period;
  counts: Map<string, number>;
  today: string;
  filters: Filters;
}) {
  const highlightWeek = selected.view === "week";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Link
          href={eventsHref(selected.view, shiftAnchor(month, -1), filters)}
          aria-label="이전 달"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeftIcon />
        </Link>
        <span className="text-sm font-medium">{`${month.start.slice(0, 4)}년 ${Number(month.start.slice(5, 7))}월`}</span>
        <Link
          href={eventsHref(selected.view, shiftAnchor(month, 1), filters)}
          aria-label="다음 달"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronRightIcon />
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground">
            {day}
          </div>
        ))}
        {calendarCells(month).map((date, index) => {
          if (!date) return <div key={`blank-${index}`} />;
          const count = counts.get(date) ?? 0;
          const inWeek = highlightWeek && date >= selected.start && date <= selected.end;
          return (
            <Link
              key={date}
              href={eventsHref("week", date, filters)}
              aria-label={`${Number(date.slice(5, 7))}월 ${Number(date.slice(8))}일 행사 ${count}건`}
              className={cn(
                "flex h-10 flex-col items-center justify-center rounded-md text-xs transition-colors hover:bg-muted",
                inWeek && "bg-muted",
                date === today && "ring-1 ring-primary",
              )}
            >
              <span className={cn(date === today && "font-semibold text-primary")}>{Number(date.slice(8))}</span>
              {count > 0 && <span className="text-[10px] leading-none font-medium text-primary">{count}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
