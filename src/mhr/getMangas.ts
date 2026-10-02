import { Manga } from "../utils/models.ts";
import { BASE_URL, post, toManga } from "./utils.ts";

async function getMangas(mangaIds: string[]): Promise<Manga[]> {
  if (mangaIds.length === 0) return [];

  const body = {
    mangaCoverimageType: 1,
    bookIds: [],
    somanIds: [],
    mangaIds: mangaIds.map((id) => Number(id)),
  };

  const resp = await post(
    `${BASE_URL}/v2/manga/getBatchDetail`,
    body,
    {},
    {
      "Content-Type": "application/json",
    },
  );
  if (!resp.ok)
    throw new Error(`Failed to fetch manga list: ${resp.statusText}`);

  const json = await resp.json();

  return Promise.all(
    json.response.mangas.map((data: unknown) => toManga(data)),
  );
}

export default getMangas;
