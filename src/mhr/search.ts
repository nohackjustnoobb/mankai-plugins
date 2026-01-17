import { Manga } from "../utils/models.ts";
import getMangas from "./getMangas.ts";
import { BASE_URL, get, LIMIT } from "./utils.ts";

async function search(query: string, page: number): Promise<Manga[]> {
  const params: Record<string, string> = {
    keywords: await t2s(query),
    start: ((page - 1) * LIMIT).toString(),
    limit: LIMIT.toString(),
  };

  const resp = await get(`${BASE_URL}/v1/search/getSearchManga`, params);
  if (!resp.ok) throw new Error(`Failed to search manga: ${resp.statusText}`);

  const json = await resp.json();

  return getMangas(
    // deno-lint-ignore no-explicit-any
    json.response.result.map((data: any) => data.mangaId.toString()),
  );
}

export default search;
