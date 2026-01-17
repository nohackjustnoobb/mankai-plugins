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
  Ended = 2,
}

interface Chapter {
  id?: string;
  title?: string;
}

interface Manga {
  id: string;
  title?: string;
  cover?: string;
  status?: Status;
  latestChapter?: Chapter;

  meta?: string;
}

interface DetailedManga extends Manga {
  description?: string;
  updatedAt?: number;
  authors: string[];
  genres: Genre[];
  chapters: Record<string, Chapter[]>;
}

export { Genre, Status };
export type { Chapter, Manga, DetailedManga };
