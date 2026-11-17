import type {
  GenreFilter,
  Manga,
  SortBy,
  StatusFilter,
} from "../utils/models.ts";
import type { Collection, MangaData, Relationship } from "./types.ts";
import {
  addArray,
  apiGet,
  LIMIT,
  mangaParams,
  MAX_RESULTS,
  pageOffset,
  toManga,
} from "./utils.ts";

async function search(
  query: string,
  page: number = 1,
  genre: GenreFilter | null = null,
  status: StatusFilter | null = null,
  isAuthor: boolean = false,
  _customGenre: string | null = null,
  _sortBy: SortBy | null = null,
  _customSort: string | null = null,
): Promise<Manga[]> {
  if (pageOffset(page) + LIMIT > MAX_RESULTS || !query.trim()) return [];

  const params = mangaParams(page, genre, status);

  if (isAuthor) {
    const authors = await apiGet<Collection<Relationship>>(
      "/author",
      new URLSearchParams({
        name: query.trim(),
        limit: "100",
      }),
    );

    if (authors.data.length === 0) return [];

    addArray(
      params,
      "authors",
      authors.data.map((author) => author.id),
    );
    params.set("order[followedCount]", "desc");
  } else {
    params.set("title", query.trim());
    params.set("order[relevance]", "desc");
  }

  const result = await apiGet<Collection<MangaData>>("/manga", params);

  return result.data.map(toManga);
}

export default search;
