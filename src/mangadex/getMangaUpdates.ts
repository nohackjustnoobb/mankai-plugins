import type {
  MangaUpdate,
  MangaUpdateRequest,
} from "../utils/models.ts";
import { getMangaMetadata, toManga } from "./utils.ts";

async function getMangaUpdates(
  mangas: MangaUpdateRequest[],
): Promise<MangaUpdate[]> {
  const metadata = new Map(
    (await getMangaMetadata(mangas.map((manga) => manga.id))).map((data) => [
      data.id,
      toManga(data),
    ]),
  );

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
