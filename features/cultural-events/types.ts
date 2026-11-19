export type CulturalEvent = {
  id: string;
  title: string;
  category: string;
  district: string;
  place: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD, 항상 startDate 이상 */
  endDate: string;
  isFree: boolean;
  fee: string;
  target: string;
  time: string;
  imageUrl: string;
  link: string;
};

export type EventsResult =
  | { status: "ok"; events: CulturalEvent[] }
  | { status: "error"; message: string };
