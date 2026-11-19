/** 하루 중 시각(분 단위, 0~1439). end가 null이면 시작 시각만 알려진 회차다. */
export type TimeSlot = { start: number; end: number | null };

/** 시작 시각만 있는 회차는 선택 시각 이후 이 시간(분) 안에 시작하면 참여 가능으로 본다. */
const ARRIVAL_WINDOW_MINUTES = 60;

const TIME = String.raw`(오전|오후)?\s*(\d{1,2})\s*:\s*(\d{2})`;
const RANGE = new RegExp(`${TIME}\\s*[~\\-–]\\s*${TIME}`, "g");
const SINGLE = new RegExp(TIME, "g");

function toMinutes(meridiem: string | undefined, hour: string, minute: string): number | null {
  let h = Number(hour);
  const m = Number(minute);
  if (m > 59 || h > 24) return null;
  if (meridiem === "오후" && h < 12) h += 12;
  if (meridiem === "오전" && h === 12) h = 0;
  return (h % 24) * 60 + m;
}

/**
 * 행사 시간 문장에서 시각을 뽑는다. 요일 조건은 해석하지 않고 문장에 나온 시각을 모두 모은다.
 * 시각을 찾지 못하면 빈 배열을 돌려준다.
 */
export function parseTimeSlots(text: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const rest = text.replace(RANGE, (_, m1, h1, min1, m2, h2, min2) => {
    const start = toMinutes(m1, h1, min1);
    // 끝 시각에 오전/오후가 없으면 시작 쪽을 따르되, "오전 10:00~12:00"의 12시는 정오로 본다.
    const endMeridiem = m2 ?? (m1 === "오전" && Number(h2) === 12 ? undefined : m1);
    let end = toMinutes(endMeridiem, h2, min2);
    if (start !== null && end !== null) {
      if (end < start) end += 24 * 60;
      slots.push({ start, end });
    }
    return " ";
  });
  for (const match of rest.matchAll(SINGLE)) {
    const start = toMinutes(match[1], match[2], match[3]);
    if (start !== null) slots.push({ start, end: null });
  }
  return slots;
}

/** at(분)에 참여할 수 있는 회차가 하나라도 있는가. */
export function isAvailableAt(slots: TimeSlot[], at: number): boolean {
  return slots.some((slot) => {
    if (slot.end === null) return slot.start >= at && slot.start - at <= ARRIVAL_WINDOW_MINUTES;
    // 자정을 넘기는 운영 시간은 다음 날 새벽 쪽 시각도 함께 본다.
    return (slot.start <= at && at <= slot.end) || (slot.start <= at + 24 * 60 && at + 24 * 60 <= slot.end);
  });
}

export function parseClock(value: string | undefined): number | null {
  const match = value?.match(/^(\d{1,2}):(\d{2})$/);
  return match ? toMinutes(undefined, match[1], match[2]) : null;
}
