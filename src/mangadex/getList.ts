import { Genre, Status } from "../utils/models.ts";
import type { Manga } from "../utils/models.ts";
import type { Collection, MangaData } from "./types.ts";
import {
  apiGet,
  LIMIT,
  mangaParams,
  MAX_RESULTS,
  pageOffset,
  toManga,
} from "./utils.ts";

async function getList(
  page: number = 1,
  genre: Genre = Genre.All,
  status: Status = Status.Any,
): Promise<Manga[]> {
  if (pageOffset(page) + LIMIT > MAX_RESULTS) return [];

  const params = mangaParams(page, genre, status);
  params.set("order[latestUploadedChapter]", "desc");

  const result = await apiGet<Collection<MangaData>>("/manga", params);

  return result.data.map(toManga);
}

export default getList;
