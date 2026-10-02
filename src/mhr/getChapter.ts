import { Chapter, DetailedManga } from "../utils/models.ts";
import { BASE_URL, get } from "./utils.ts";

async function getChapter(
  manga: DetailedManga,
  chapter: Chapter
): Promise<string[]> {
  const params: Record<string, string> = {
    mangaSectionId: chapter.id!,
    mangaId: manga.id,
    netType: "1",
    loadreal: "1",
    imageQuality: "2",
  };

  const resp = await get(`${BASE_URL}/v1/manga/getRead`, params);
  if (!resp.ok)
    throw new Error(`Failed to fetch manga chapter: ${resp.statusText}`);

  const json = await resp.json();

  const host = json.response.hostList[0];
  const query = json.response.query;

  return json.response.mangaSectionImages.map(
    (item: string) => `${host}${item}${query}`
  );
}

export default getChapter;
