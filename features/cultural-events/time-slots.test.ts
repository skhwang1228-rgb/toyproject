import { expect, test } from "vitest";

import { isAvailableAt, parseClock, parseTimeSlots } from "./time-slots";

test("범위와 단일 시각을 함께 뽑는다", () => {
  expect(parseTimeSlots("12:00, 14:00 / 월 19:00~21:00")).toEqual([
    { start: 19 * 60, end: 21 * 60 },
    { start: 12 * 60, end: null },
    { start: 14 * 60, end: null },
  ]);
});

test("오후 표기와 24시 종료, 시각 없는 문장을 처리한다", () => {
  expect(parseTimeSlots("오후 7:00 ~ 오후 9:00")).toEqual([{ start: 19 * 60, end: 21 * 60 }]);
  expect(parseTimeSlots("매일 06:00~24:00")).toEqual([{ start: 6 * 60, end: 24 * 60 }]);
  expect(parseTimeSlots("상세 시간내용 참조")).toEqual([]);
  expect(parseTimeSlots("오전 10:00~12:00, 오후 14:00~16:00")).toEqual([
    { start: 10 * 60, end: 12 * 60 },
    { start: 14 * 60, end: 16 * 60 },
  ]);
});

test("범위는 포함 여부로, 단일 시각은 1시간 안에 시작하는지로 판단한다", () => {
  const at = parseClock("19:00")!;
  expect(isAvailableAt([{ start: 19 * 60, end: 20 * 60 }], at)).toBe(true);
  expect(isAvailableAt([{ start: 19 * 60 + 30, end: null }], at)).toBe(true);
  expect(isAvailableAt([{ start: 20 * 60 + 30, end: null }], at)).toBe(false);
  expect(isAvailableAt([{ start: 18 * 60, end: null }], at)).toBe(false);
  expect(isAvailableAt([{ start: 22 * 60, end: 26 * 60 }], 1 * 60)).toBe(true);
});
