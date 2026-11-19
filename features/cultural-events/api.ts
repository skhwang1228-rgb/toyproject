import type { CulturalEvent, EventsResult } from "./types";

const BASE_URL = "http://openapi.seoul.go.kr:8088";
const PAGE_SIZE = 1000;
const REVALIDATE_SECONDS = 60 * 60;

type RawRow = Record<string, string | null | undefined>;

type RawResponse = {
  culturalEventInfo?: {
    list_total_count?: number;
    RESULT?: { CODE?: string; MESSAGE?: string };
    row?: RawRow[];
  };
  RESULT?: { CODE?: string; MESSAGE?: string };
};

function datePart(value: string | null | undefined): string {
  return (value ?? "").slice(0, 10);
}

function toEvent(row: RawRow, index: number): CulturalEvent | null {
  const startDate = datePart(row.STRTDATE);
  if (!startDate) return null;
  const rawEnd = datePart(row.END_DATE);
  // 원본에 종료일이 시작일보다 앞서는 데이터가 있어 시작일로 맞춘다.
  const endDate = rawEnd && rawEnd >= startDate ? rawEnd : startDate;
  const link = row.HMPG_ADDR || row.ORG_LINK || "";
  return {
    id: `${link || row.TITLE}-${index}`,
    title: (row.TITLE ?? "").trim(),
    category: row.CODENAME ?? "",
    district: row.GUNAME ?? "",
    place: row.PLACE ?? "",
    startDate,
    endDate,
    isFree: row.IS_FREE === "무료",
    fee: row.USE_FEE ?? "",
    target: row.USE_TRGT ?? "",
    time: row.PRO_TIME ?? "",
    imageUrl: row.MAIN_IMG ?? "",
    link,
  };
}

async function fetchPage(key: string, start: number, end: number): Promise<RawResponse> {
  const response = await fetch(`${BASE_URL}/${key}/json/culturalEventInfo/${start}/${end}/`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`서울시 API 응답 오류 (${response.status})`);
  return (await response.json()) as RawResponse;
}

/** 서울시 문화행사 전체를 가져온다. 서버에서만 호출한다. */
export async function fetchCulturalEvents(): Promise<EventsResult> {
  const key = process.env.SEOUL_OPEN_API_KEY;
  if (!key) {
    return { status: "error", message: "SEOUL_OPEN_API_KEY 환경변수가 설정되지 않았습니다." };
  }

  try {
    const first = await fetchPage(key, 1, PAGE_SIZE);
    const info = first.culturalEventInfo;
    if (!info) {
      return { status: "error", message: first.RESULT?.MESSAGE ?? "서울시 API가 데이터를 돌려주지 않았습니다." };
    }

    const total = info.list_total_count ?? 0;
    const rest: Promise<RawResponse>[] = [];
    for (let start = PAGE_SIZE + 1; start <= total; start += PAGE_SIZE) {
      rest.push(fetchPage(key, start, Math.min(start + PAGE_SIZE - 1, total)));
    }
    const pages = [first, ...(await Promise.all(rest))];

    const events = pages
      .flatMap((page) => page.culturalEventInfo?.row ?? [])
      .map(toEvent)
      .filter((event): event is CulturalEvent => event !== null);
    return { status: "ok", events };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "문화행사를 불러오지 못했습니다.",
    };
  }
}
