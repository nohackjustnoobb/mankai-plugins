import { Status } from "../utils/models.ts";
import type {
  GenreFilter,
  Manga,
  SortBy,
  StatusFilter,
} from "../utils/models.ts";
import { BASE_URL, genreId, get, LIMIT, toManga } from "./utils.ts";

async function getList(
  page: number = 1,
  genre: GenreFilter | null = null,
  status: StatusFilter | null = null,
  _customGenre: string | null = null,
  _sortBy: SortBy | null = null,
  _customSort: string | null = null,
): Promise<Manga[]> {
  const categoryId = genre === null || genre === "custom" ? 0 : (genreId[genre] ?? 0);
  const params: Record<string, string> = {
    subCategoryType: "0",
    subCategoryId: categoryId.toString(),
    start: ((page - 1) * LIMIT).toString(),
    status: (status ?? Status.Unknown).toString(),
    limit: LIMIT.toString(),
    sort: "0",
  };

  const resp = await get(`${BASE_URL}/v2/manga/getCategoryMangas`, params);
  if (!resp.ok)
    throw new Error(`Failed to fetch manga list: ${resp.statusText}`);

  const json = await resp.json();

  return Promise.all(
    json.response.mangas.map((data: unknown) => toManga(data)),
  );
}

export default getList;
