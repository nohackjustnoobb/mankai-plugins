import "../utils/bridge.ts";
import { Genre, Status } from "../utils/models.ts";
import type { Chapter, Manga } from "../utils/models.ts";
import type {
  ChapterData,
  Collection,
  LocalizedString,
  MangaData,
} from "./types.ts";

const BASE_URL = "https://api.mangadex.org";
const LIMIT = 50;
const MAX_RESULTS = 10000;
const CONTENT_RATINGS = ["safe", "suggestive", "erotica", "pornographic"];

// MangaDex's public /manga/tag identifiers.
const GENRE_TAGS: Partial<Record<Genre, string>> = {
  [Genre.Action]: "391b0423-d847-456f-aff0-8b0cfc03066b",
  [Genre.Romance]: "423e2eae-a7a2-4a8b-ac03-a8351462d71d",
  [Genre.Yuri]: "a3c67850-4684-404e-9b7f-c69850ee5da6",
  [Genre.BoysLove]: "5920b825-4181-4a17-beeb-9918b0ff7a30",
  [Genre.SchoolLife]: "caaa44eb-cd40-4177-b930-79d3ef2afe87",
  [Genre.Adventure]: "87cc87cd-a395-47af-b27a-93258283bbc6",
  [Genre.Harem]: "aafb99c1-7f60-43fa-b75f-fc9502ce29c7",
  [Genre.SpeculativeFiction]: "256c8bd9-4904-4360-bf4f-508a76d67183",
  [Genre.War]: "ac72833b-c4e9-4878-b9db-6c8a4a99444a",
  [Genre.Suspense]: "ee968100-4191-4968-93d3-f82d72be7e46",
  [Genre.FanFiction]: "b13b2a48-c720-44a9-9c77-39c9979373fb",
  [Genre.Comedy]: "4d32cc48-9f00-4cca-9b5a-a839f0764984",
  [Genre.Magic]: "a1f53773-c69a-4ce5-8cab-fffcd90b1565",
  [Genre.Horror]: "cdad7e68-1419-41dd-bdce-27753074a640",
  [Genre.Historical]: "33771934-028e-4cb3-8744-691e866a923e",
  [Genre.Sports]: "69964a64-2f90-4d33-beeb-f3ed2875eb4c",
  [Genre.Mecha]: "50880a9d-5440-4732-9afb-8f457127e836",
  [Genre.Otokonoko]: "9ab53f92-3eed-4e9b-903a-917c86035ee3",
};

function configValue(key: string): unknown {
  return typeof getConfigs === "function"
    ? getConfigs().find((config) => config.key === key)?.value
    : undefined;
}

function getLanguages(): string[] {
  const value = configValue("languages");
  const languages =
    typeof value === "string"
      ? [
          ...new Set(
            value
              .toLowerCase()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        ]
      : [];

  if (
    languages.some((language) => !/^[a-z]{2}(?:-[a-z]{2})?$/.test(language))
  ) {
    throw new Error(
      "Invalid MangaDex language codes. Use codes such as en, zh-hk, or pt-br.",
    );
  }

  return languages.length > 0 ? languages : ["en"];
}

function localizedText(
  values: LocalizedString = {},
  alternatives: LocalizedString[] = [],
): string | undefined {
  const sources = [values, ...alternatives];

  for (const language of [...getLanguages(), "en"]) {
    for (const source of sources) {
      if (source[language]?.trim()) return source[language];
    }
  }

  return sources.flatMap(Object.values).find((value) => value.trim());
}

// A callback may perform several requests; the manifest cooldown only spaces callbacks.
let nextRequestAt = 0;

async function request(
  url: string,
  params = new URLSearchParams(),
): Promise<Response> {
  const requestAt = Math.max(Date.now(), nextRequestAt);
  nextRequestAt = requestAt + 250;
  const delay = requestAt - Date.now();
  if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

  const query = params.toString();
  const response = await fetch(`${url}${query ? `?${query}` : ""}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const requestId = response.headers.get("X-Request-ID");
    throw new Error(
      `MangaDex request failed: ${response.status} ${response.statusText}` +
        (response.status === 429 ? ". Rate limited; try again later." : "") +
        (requestId ? ` (request ${requestId})` : ""),
    );
  }

  return response;
}

async function apiGet<T>(
  path: string,
  params = new URLSearchParams(),
): Promise<T> {
  const json = await (await request(`${BASE_URL}${path}`, params)).json();

  if (json.result === "error") {
    throw new Error(`MangaDex API error: ${json.errors?.[0]?.detail ?? path}`);
  }

  return json as T;
}

function addArray(
  params: URLSearchParams,
  key: string,
  values: string[],
): void {
  for (const value of values) params.append(`${key}[]`, value);
}

function pageOffset(page: number): number {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Page must be a positive integer.");
  }

  return (page - 1) * LIMIT;
}

function mangaParams(
  page: number,
  genre: Genre,
  status: Status,
): URLSearchParams {
  const params = new URLSearchParams({
    limit: String(LIMIT),
    offset: String(pageOffset(page)),
  });
  addArray(params, "includes", ["cover_art"]);
  addArray(params, "availableTranslatedLanguage", getLanguages());
  addArray(
    params,
    "contentRating",
    genre === Genre.Mature
      ? ["erotica", "pornographic"]
      : configValue("includeMature") === true
        ? CONTENT_RATINGS
        : ["safe", "suggestive"],
  );

  const tag = GENRE_TAGS[genre];
  if (tag) addArray(params, "includedTags", [tag]);
  if (status === Status.OnGoing)
    addArray(params, "status", ["ongoing", "hiatus"]);
  if (status === Status.Completed)
    addArray(params, "status", ["completed", "cancelled"]);

  return params;
}

async function getMangaMetadata(mangaIds: string[]): Promise<MangaData[]> {
  const ids = [...new Set(mangaIds)];
  const metadata = new Map<string, MangaData>();

  for (let offset = 0; offset < ids.length; offset += 100) {
    const params = new URLSearchParams({ limit: "100" });
    addArray(params, "ids", ids.slice(offset, offset + 100));
    addArray(params, "includes", ["cover_art"]);
    addArray(params, "contentRating", CONTENT_RATINGS);

    const result = await apiGet<Collection<MangaData>>("/manga", params);

    for (const data of result.data) metadata.set(data.id, data);
  }

  return ids.flatMap((id) => {
    const data = metadata.get(id);
    return data ? [data] : [];
  });
}

function toManga(data: MangaData): Manga {
  const fileName = data.relationships.find((rel) => rel.type === "cover_art")
    ?.attributes?.fileName;

  return {
    id: data.id,
    title: localizedText(data.attributes.title, data.attributes.altTitles),
    cover: fileName
      ? `https://uploads.mangadex.org/covers/${data.id}/${fileName}.256.jpg`
      : undefined,
    status: ["completed", "cancelled"].includes(data.attributes.status)
      ? Status.Completed
      : Status.OnGoing,
    latestChapter: data.attributes.latestUploadedChapter
      ? {
          id: data.attributes.latestUploadedChapter,
          title: data.attributes.lastChapter
            ? `Ch. ${data.attributes.lastChapter}`
            : undefined,
        }
      : undefined,
  };
}

function toGenres(data: MangaData): Genre[] {
  const tags = new Set(data.attributes.tags?.map((tag) => tag.id));
  const genres = Object.entries(GENRE_TAGS)
    .filter(([, id]) => tags.has(id))
    .map(([genre]) => genre as Genre);

  if (tags.has("07251805-a27e-4d59-b488-f0bfbec15168"))
    genres.push(Genre.Suspense);
  if (tags.has("cdc58593-87dd-415e-bbc0-2ec27bf404cc"))
    genres.push(Genre.Magic);
  if (
    ["erotica", "pornographic"].includes(data.attributes.contentRating ?? "")
  ) {
    genres.push(Genre.Mature);
  }

  return [...new Set(genres)];
}

function chapterParams(limit: number): URLSearchParams {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: "0",
    includeEmptyPages: "0",
    includeFuturePublishAt: "0",
    includeExternalUrl: "0",
    includeUnavailable: "0",
  });
  addArray(params, "translatedLanguage", getLanguages());
  addArray(params, "contentRating", CONTENT_RATINGS);
  addArray(params, "includes", ["scanlation_group"]);

  return params;
}

function isReadable(chapter: ChapterData): boolean {
  return (
    chapter.attributes.pages > 0 &&
    !chapter.attributes.externalUrl &&
    !chapter.attributes.isUnavailable &&
    getLanguages().includes(chapter.attributes.translatedLanguage) &&
    (!chapter.attributes.publishAt ||
      Date.parse(chapter.attributes.publishAt) <= Date.now()) &&
    (!chapter.attributes.readableAt ||
      Date.parse(chapter.attributes.readableAt) <= Date.now())
  );
}

function chapterTime(chapter: ChapterData): number {
  return (
    Date.parse(
      chapter.attributes.readableAt ??
        chapter.attributes.publishAt ??
        chapter.attributes.createdAt ??
        "",
    ) || 0
  );
}

function toChapter(data: ChapterData): Chapter {
  const { chapter, title, translatedLanguage } = data.attributes;
  const parts = [
    chapter != null ? `Ch. ${chapter}` : undefined,
    title?.trim(),
  ].filter(Boolean);
  const groups = data.relationships
    .filter((rel) => rel.type === "scanlation_group")
    .map((rel) => rel.attributes?.name)
    .filter(Boolean);

  return {
    id: data.id,
    title: `${parts.join(" - ") || "Oneshot"} [${[translatedLanguage, ...groups].join(" · ")}]`,
  };
}

async function getChapterFeed(mangaId: string): Promise<ChapterData[]> {
  const params = chapterParams(500);
  params.set("order[volume]", "asc");
  params.set("order[chapter]", "asc");
  params.set("order[readableAt]", "asc");

  const chapters = new Map<string, ChapterData>();
  let offset = 0;

  while (offset < MAX_RESULTS) {
    params.set("offset", String(offset));

    const result = await apiGet<Collection<ChapterData>>(
      `/manga/${encodeURIComponent(mangaId)}/feed`,
      params,
    );

    for (const chapter of result.data) {
      if (isReadable(chapter)) chapters.set(chapter.id, chapter);
    }

    offset += result.data.length;
    if (offset >= result.total || result.data.length === 0)
      return [...chapters.values()];
  }

  throw new Error(
    "This MangaDex chapter feed exceeds the API's 10,000-result limit.",
  );
}

export {
  addArray,
  apiGet,
  BASE_URL,
  chapterTime,
  configValue,
  CONTENT_RATINGS,
  getChapterFeed,
  getMangaMetadata,
  LIMIT,
  localizedText,
  mangaParams,
  MAX_RESULTS,
  pageOffset,
  request,
  toChapter,
  toGenres,
  toManga,
};
