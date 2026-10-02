import { MangaUpdate, MangaUpdateRequest } from "../utils/models.ts";
import { normalizeLatestTitle, parseUpdateFeed, requestHtml } from "./utils.ts";

async function getMangaUpdates(
  mangas: MangaUpdateRequest[],
): Promise<MangaUpdate[]> {
  if (mangas.length === 0) return [];

  const revisions = parseUpdateFeed(await requestHtml("/update/d30.html"));
  return mangas.map((manga) => {
    const revision = revisions.get(manga.id);
    const current = normalizeLatestTitle(
      manga.latestChapter.title ?? manga.latestChapter.id,
    );
    return {
      id: manga.id,
      updates: revision === undefined ? false : revision !== current,
    };
  });
}

export default getMangaUpdates;
