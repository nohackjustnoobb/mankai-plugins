import { Genre, Manga, Status } from "../utils/models.ts";
import { BASE_URL, genreId, get, LIMIT, toManga } from "./utils.ts";

async function getList(
  page: number = 1,
  genre: Genre = Genre.All,
  status: Status = Status.Any,
): Promise<Manga[]> {
  const params: Record<string, string> = {
    subCategoryType: "0",
    subCategoryId: genreId[genre].toString(),
    start: ((page - 1) * LIMIT).toString(),
    status: status.toString(),
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
