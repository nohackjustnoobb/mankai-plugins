enum Genre {
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

type GenreFilter = Genre | "custom";

enum Status {
  Unknown = 0,
  OnGoing = 1,
  Completed = 2,
}

type StatusFilter = Status.OnGoing | Status.Completed;
type SortBy = "updateTime" | "popularity" | "custom";

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
  /** Language tags fall back to broader tags. Omitted fields use the base values. */
  localizations?: Record<string, ChapterLocalization>;
}

interface ChapterGroup {
  id?: string;
  title: string;
  chapters: Chapter[];
  /** Content language, omit for fallback groups when no language matches. */
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
  /** Language tags fall back to broader tags. Omitted fields use the base values. */
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
}

interface DetailedManga extends Manga, DetailedMangaLocalization {
  editable?: boolean;
  chapters?: ChapterGroup[];
  /** Language tags fall back to broader tags. Omitted fields use the base values. */
  localizations?: Record<string, DetailedMangaLocalization>;
}

export { Genre, ReadingDirection, Status };
export type {
  Chapter,
  ChapterGroup,
  ChapterLocalization,
  DetailedManga,
  DetailedMangaLocalization,
  GenreFilter,
  Manga,
  MangaLocalization,
  MangaUpdate,
  MangaUpdateRequest,
  SortBy,
  StatusFilter,
};
