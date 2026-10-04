import { Genre, Status } from "../utils/models.ts";
import type { Collection, MangaData } from "./types.ts";
import { apiGet, mangaParams, toManga } from "./utils.ts";

async function getSuggestion(query: string): Promise<string[]> {
  if (!query.trim()) return [];

  const params = mangaParams(1, Genre.All, Status.Any);
  params.set("title", query.trim());
  params.set("limit", "10");
  params.set("order[relevance]", "desc");

  const result = await apiGet<Collection<MangaData>>("/manga", params);

  return [
    ...new Set(
      result.data
        .map((data) => toManga(data).title)
        .filter((title): title is string => !!title),
    ),
  ];
}

export default getSuggestion;
