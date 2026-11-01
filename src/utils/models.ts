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

interface ChapterLocalization {
  title?: string;
}

interface Chapter {
  id: string;
  title?: string;
  locked?: boolean;
  localizations?: Record<string, ChapterLocalization>;
}

interface ChapterGroup {
  id?: string;
  title: string;
  chapters: Chapter[];
  language?: string;
  localizations?: Record<string, ChapterLocalization>;
}

interface MangaLocalization {
  title?: string;
  cover?: string;
  status?: Status;
  latestChapter?: Chapter;
  meta?: string;
}

interface Manga extends MangaLocalization {
  id: string;
  localizations?: Record<string, MangaLocalization>;
}

interface MangaUpdateRequest {
  id: string;
  latestChapter: Chapter;
}

interface MangaUpdate extends Manga {
  updates: boolean;
}

interface DetailedMangaLocalization extends MangaLocalization {
  externalLink?: string;
  readingDirection?: ReadingDirection;
  description?: string;
  updatedAt?: number; // millisecond since epoch
  authors?: string[];
  genres?: Genre[];
  customGenres?: string[];
  remarks?: string;
  editable?: boolean;
}

interface DetailedManga extends Manga, DetailedMangaLocalization {
  chapters?: ChapterGroup[];
  localizations?: Record<string, DetailedMangaLocalization>;
}

export { Genre, ReadingDirection, Status };
export type {
  Chapter,
  ChapterGroup,
  ChapterLocalization,
  DetailedManga,
  DetailedMangaLocalization,
  Manga,
  MangaLocalization,
  MangaUpdate,
  MangaUpdateRequest,
};
