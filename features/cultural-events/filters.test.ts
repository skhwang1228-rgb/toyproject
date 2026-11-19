import { expect, test } from "vitest";

import { applyFilters, filterOptions, parseFilters } from "./filters";
import type { CulturalEvent } from "./types";

function event(overrides: Partial<CulturalEvent>): CulturalEvent {
  return {
    id: "x",
    title: "제목",
    category: "콘서트",
    district: "강남구",
    place: "",
    startDate: "2026-11-01",
    endDate: "2026-11-01",
    isFree: false,
    fee: "",
    target: "",
    time: "",
    imageUrl: "",
    link: "",
    ...overrides,
  };
}

const events = [
  event({ id: "a", title: "재즈 콘서트", category: "콘서트", district: "강남구", isFree: false }),
  event({ id: "b", title: "무료 전시", category: "전시/미술", district: "종로구", isFree: true }),
  event({ id: "c", title: "클래식 무료 공연", category: "클래식", district: "강남구", isFree: true }),
];

test("쿼리 파라미터에서 유효한 필터만 읽는다", () => {
  expect(parseFilters({ category: "콘서트", fee: "free", q: " 재즈 " })).toEqual({
    category: "콘서트",
    district: undefined,
    fee: "free",
    q: "재즈",
  });
  expect(parseFilters({ fee: "weird" }).fee).toBeUndefined();
});

test("필터는 모두 만족하는 행사만 남긴다", () => {
  expect(applyFilters(events, { fee: "free" }).map((e) => e.id)).toEqual(["b", "c"]);
  expect(applyFilters(events, { fee: "free", district: "강남구" }).map((e) => e.id)).toEqual(["c"]);
  expect(applyFilters(events, { q: "재즈" }).map((e) => e.id)).toEqual(["a"]);
  expect(applyFilters(events, {}).length).toBe(3);
});

test("선택지는 행사 수가 많은 분류 순, 자치구는 가나다 순이다", () => {
  const options = filterOptions([...events, event({ id: "d", category: "콘서트", district: "마포구" })]);
  expect(options.categories[0]).toBe("콘서트");
  expect(options.districts).toEqual(["강남구", "마포구", "종로구"]);
});

test("참여 시각 필터는 운영 시간 범위와 곧 시작하는 회차를 고른다", () => {
  const timed = [
    event({ id: "range", time: "10:00~21:00" }),
    event({ id: "start-soon", time: "19:30" }),
    event({ id: "start-late", time: "21:00" }),
    event({ id: "closed", time: "10:00~18:00" }),
    event({ id: "unknown", time: "프로그램별 상이" }),
  ];
  expect(applyFilters(timed, { time: "19:00" }).map((e) => e.id)).toEqual(["range", "start-soon"]);
});
