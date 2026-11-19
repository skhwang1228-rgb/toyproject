import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { eventsHref } from "./href";
import { shiftAnchor, type Period } from "./period";

function formatTitle(period: Period): string {
  const [year, month] = period.start.split("-");
  if (period.view === "month") return `${year}년 ${Number(month)}월`;
  const [, endMonth, endDay] = period.end.split("-");
  const [, , startDay] = period.start.split("-");
  const endLabel = endMonth === month ? `${Number(endDay)}일` : `${Number(endMonth)}월 ${Number(endDay)}일`;
  return `${year}년 ${Number(month)}월 ${Number(startDay)}일 ~ ${endLabel}`;
}

export function PeriodNav({ period, today }: { period: Period; today: string }) {
  const unit = period.view === "month" ? "달" : "주";
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Link
          href={eventsHref(period.view, shiftAnchor(period, -1))}
          aria-label={`이전 ${unit}`}
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ChevronLeftIcon />
        </Link>
        <h2 className="min-w-0 flex-1 text-center text-lg font-semibold sm:min-w-64 sm:flex-none">
          {formatTitle(period)}
        </h2>
        <Link
          href={eventsHref(period.view, shiftAnchor(period, 1))}
          aria-label={`다음 ${unit}`}
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ChevronRightIcon />
        </Link>
        <Link href={eventsHref(period.view, today)} className={buttonVariants({ variant: "ghost" })}>
          오늘
        </Link>
      </div>
      <div className="flex gap-2" role="group" aria-label="보기 방식">
        {(["month", "week"] as const).map((view) => (
          <Link
            key={view}
            href={eventsHref(view, period.anchor)}
            aria-current={period.view === view ? "page" : undefined}
            className={cn(buttonVariants({ variant: period.view === view ? "default" : "outline" }))}
          >
            {view === "month" ? "월간" : "주간"}
          </Link>
        ))}
      </div>
    </div>
  );
}
