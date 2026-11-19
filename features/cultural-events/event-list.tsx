import Image from "next/image";
import Link from "next/link";
import { CalendarDaysIcon, MapPinIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

import { eventsHref } from "./href";
import type { Filters } from "./filters";
import type { DayGroup, Period } from "./period";
import type { CulturalEvent } from "./types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return `${date.getUTCMonth() + 1}월 ${date.getUTCDate()}일 (${WEEKDAYS[date.getUTCDay()]})`;
}

function formatRange(event: CulturalEvent): string {
  const full = (iso: string) => iso.replaceAll("-", ".");
  if (event.startDate === event.endDate) return full(event.startDate);
  const sameYear = event.startDate.slice(0, 4) === event.endDate.slice(0, 4);
  return `${full(event.startDate)} ~ ${sameYear ? full(event.endDate).slice(5) : full(event.endDate)}`;
}

function EventCard({ event }: { event: CulturalEvent }) {
  const content = (
    <Card size="sm" className="h-full min-w-0 transition-colors hover:bg-muted/50">
      <CardContent className="flex gap-3">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt=""
            width={80}
            height={107}
            unoptimized
            className="h-[107px] w-20 shrink-0 rounded-md object-cover"
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {event.category && <Badge variant="secondary">{event.category}</Badge>}
            <Badge variant={event.isFree ? "default" : "outline"}>{event.isFree ? "무료" : "유료"}</Badge>
          </div>
          <h3 className="line-clamp-2 font-medium text-balance">{event.title}</h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDaysIcon className="size-4 shrink-0" />
            <span className="truncate">
              {formatRange(event)}
              {event.time ? ` · ${event.time}` : ""}
            </span>
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" />
            <span className="truncate">{[event.district, event.place].filter(Boolean).join(" · ")}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (!event.link) return content;
  return (
    <Link href={event.link} target="_blank" rel="noopener noreferrer" className="block min-w-0">
      {content}
    </Link>
  );
}

export function EventList({
  groups,
  total,
  shown,
  period,
  filters,
}: {
  groups: DayGroup[];
  total: number;
  shown: number;
  period: Period;
  filters: Filters;
}) {
  if (total === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarDaysIcon />
          </EmptyMedia>
          <EmptyTitle>이 기간에 열리는 행사가 없습니다</EmptyTitle>
          <EmptyDescription>다른 기간을 선택해 보세요.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {group.label === "ongoing" ? "이전부터 진행 중" : formatDay(group.label)}
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {group.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}
      {shown < total && (
        <div className="flex justify-center">
          <Link
            href={eventsHref(period.view, period.anchor, filters, shown + 60)}
            className={buttonVariants({ variant: "outline" })}
            scroll={false}
          >
            더 보기 ({shown}/{total})
          </Link>
        </div>
      )}
    </div>
  );
}
