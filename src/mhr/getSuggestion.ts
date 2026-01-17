import { BASE_URL, get } from "./utils.ts";

async function getSuggestion(query: string): Promise<string[]> {
  const sQuery = await t2s(query);

  const params: Record<string, string> = {
    keywords: sQuery,
    mh_is_anonymous: "0",
  };

  const resp = await get(`${BASE_URL}/v1/search/getKeywordMatch`, params);
  if (!resp.ok)
    throw new Error(`Failed to fetch manga suggestions: ${resp.statusText}`);

  const json = await resp.json();

  return Promise.all(
    json.response.items.map(
      async (item: { mangaName: string }) => await s2t(item.mangaName),
    ),
  );
}

export default getSuggestion;
