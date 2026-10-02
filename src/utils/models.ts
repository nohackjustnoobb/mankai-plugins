enum Genre {
  All = "all",
  Action = "action",
  Romance = "romance",
  Yuri = "yuri",
  BoysLove = "boysLove",
  SchoolLife = "schoolLife",
  Adventure = "adventure",
  Harem = "harem",
  SpeculativeFiction = "speculativeFiction",
  War = "war",
  Suspense = "suspense",
  FanFiction = "fanFiction",
  Comedy = "comedy",
  Magic = "magic",
  Horror = "horror",
  Historical = "historical",
  Sports = "sports",
  Mature = "mature",
  Mecha = "mecha",
  Otokonoko = "otokonoko",
}

enum Status {
  Any = 0,
  OnGoing = 1,
  Completed = 2,
}

enum ReadingDirection {
  LeftToRight = 1,
  RightToLeft = 2,
  Vertical = 3,
}

interface Chapter {
  id: string;
  title?: string;
  locked?: boolean;
}

interface ChapterGroup {
  title: string;
  chapters: Chapter[];
}

interface Manga {
  id: string;
  title?: string;
  cover?: string;
  status?: Status;
  latestChapter?: Chapter;

  meta?: string;
}

interface MangaUpdateRequest {
  id: string;
  latestChapter: Chapter;
}

interface MangaUpdate extends Manga {
  updates: boolean;
}

interface DetailedManga extends Manga {
  externalLink?: string;
  readingDirection?: ReadingDirection;
  description?: string;
  updatedAt?: number; // millisecond since epoch
  authors?: string[];
  genres?: Genre[];
  chapters?: ChapterGroup[];
  remarks?: string;
}

export { Genre, ReadingDirection, Status };
export type {
  Chapter,
  ChapterGroup,
  DetailedManga,
  Manga,
  MangaUpdate,
  MangaUpdateRequest,
};
