import type {
  Manga,
  MangaUpdate,
  MangaUpdateRequest,
} from "../utils/models.ts";
import type { Collection, MangaData } from "./types.ts";
import { addArray, apiGet, CONTENT_RATINGS, toManga } from "./utils.ts";

async function getMangaUpdates(
  mangas: MangaUpdateRequest[],
): Promise<MangaUpdate[]> {
  const ids = [...new Set(mangas.map((manga) => manga.id))];
  const metadata = new Map<string, Manga>();

  for (let offset = 0; offset < ids.length; offset += 100) {
    const params = new URLSearchParams({ limit: "100" });
    addArray(params, "ids", ids.slice(offset, offset + 100));
    addArray(params, "includes", ["cover_art"]);
    addArray(params, "contentRating", CONTENT_RATINGS);

    const result = await apiGet<Collection<MangaData>>("/manga", params);

    for (const data of result.data) metadata.set(data.id, toManga(data));
  }

  return mangas.flatMap((manga) => {
    const data = metadata.get(manga.id);

    return data
      ? [
          {
            ...data,
            updates:
              data.latestChapter !== undefined &&
              data.latestChapter.id !== manga.latestChapter.id,
          },
        ]
      : [];
  });
}

export default getMangaUpdates;
