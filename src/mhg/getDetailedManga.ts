import { DetailedManga } from "../utils/models.ts";
import { parseManga, requestHtml } from "./utils.ts";

async function getDetailedManga(mangaId: string): Promise<DetailedManga> {
  return parseManga(mangaId, await requestHtml(`/comic/${mangaId}/`));
}

export default getDetailedManga;
