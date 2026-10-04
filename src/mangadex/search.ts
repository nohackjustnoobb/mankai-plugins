import { Genre, Status } from "../utils/models.ts";
import type { Manga } from "../utils/models.ts";
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
  genre: Genre = Genre.All,
  status: Status = Status.Any,
  isAuthor: boolean = false,
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
