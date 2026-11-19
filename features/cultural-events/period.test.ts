import { expect, test } from "vitest";

import { calendarCells, eventsInPeriod, getPeriod, groupByStartDay, shiftAnchor } from "./period";
import type { CulturalEvent } from "./types";

function event(id: string, startDate: string, endDate: string): CulturalEvent {
  return {
    id,
    title: id,
    category: "",
    district: "",
    place: "",
    startDate,
    endDate,
    isFree: true,
    fee: "",
    target: "",
    time: "",
    imageUrl: "",
    link: "",
  };
}

test("월간 기간은 그 달의 1일부터 말일까지다", () => {
  const period = getPeriod("month", "2026-02-15");
  expect(period.start).toBe("2026-02-01");
  expect(period.end).toBe("2026-02-28");
});

test("주간 기간은 일요일에 시작해 토요일에 끝난다", () => {
  const period = getPeriod("week", "2026-11-19");
  expect(period.start).toBe("2026-11-15");
  expect(period.end).toBe("2026-11-21");
});

test("이전/다음 달 이동은 월 경계를 넘는다", () => {
  const period = getPeriod("month", "2026-01-31");
  expect(shiftAnchor(period, -1)).toBe("2025-12-01");
  expect(shiftAnchor(period, 1)).toBe("2026-02-01");
});

test("기간과 겹치는 행사만 시작일 순으로 고른다", () => {
  const period = getPeriod("week", "2026-11-19");
  const result = eventsInPeriod(
    [
      event("past", "2026-11-01", "2026-11-14"),
      event("ongoing", "2026-10-01", "2026-12-31"),
      event("inside", "2026-11-17", "2026-11-17"),
      event("future", "2026-11-22", "2026-11-30"),
    ],
    period,
  );
  expect(result.map((e) => e.id)).toEqual(["ongoing", "inside"]);
});

test("기간 이전에 시작한 행사는 진행 중 그룹으로 묶인다", () => {
  const period = getPeriod("week", "2026-11-19");
  const groups = groupByStartDay([event("a", "2026-10-01", "2026-12-31"), event("b", "2026-11-17", "2026-11-17")], period);
  expect(groups.map((g) => g.key)).toEqual(["ongoing", "2026-11-17"]);
});

test("달력 칸은 7의 배수이고 1일 앞에 빈 칸이 붙는다", () => {
  const cells = calendarCells(getPeriod("month", "2026-11-19"));
  expect(cells.length % 7).toBe(0);
  expect(cells.indexOf("2026-11-01")).toBe(0);
  expect(cells.filter(Boolean)).toHaveLength(30);
});
