import { DetailedManga } from "../utils/models.ts";
import { BASE_URL, get, toDetailedManga } from "./utils.ts";

async function getDetailedManga(mangaId: string): Promise<DetailedManga> {
  const params: Record<string, string> = {
    mangaId: mangaId,
    mangaDetailVersion: "",
  };

  const resp = await get(`${BASE_URL}/v1/manga/getDetail`, params);
  if (!resp.ok)
    throw new Error(`Failed to fetch manga details: ${resp.statusText}`);

  const json = await resp.json();

  return toDetailedManga(json.response);
}

export default getDetailedManga;
