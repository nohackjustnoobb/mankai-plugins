type LocalizedString = Record<string, string>;

interface Relationship {
  id: string;
  type: string;
  attributes?: { name?: string; fileName?: string };
}

interface Tag {
  id: string;
  attributes: { name: LocalizedString };
}

interface MangaData {
  id: string;
  attributes: {
    title: LocalizedString;
    altTitles?: LocalizedString[];
    description?: LocalizedString;
    originalLanguage?: string;
    status: string;
    contentRating?: string;
    lastChapter?: string | null;
    latestUploadedChapter?: string | null;
    tags?: Tag[];
    updatedAt?: string;
  };
  relationships: Relationship[];
}

interface ChapterData {
  id: string;
  attributes: {
    title?: string | null;
    volume?: string | null;
    chapter?: string | null;
    pages: number;
    translatedLanguage: string;
    externalUrl?: string | null;
    isUnavailable?: boolean;
    publishAt?: string;
    readableAt?: string;
    createdAt?: string;
  };
  relationships: Relationship[];
}

interface Collection<T> {
  data: T[];
  limit: number;
  offset: number;
  total: number;
}

interface AtHomeResponse {
  baseUrl: string;
  chapter: { hash: string; data: string[]; dataSaver: string[] };
}

export type {
  AtHomeResponse,
  ChapterData,
  Collection,
  LocalizedString,
  MangaData,
  Relationship,
};
