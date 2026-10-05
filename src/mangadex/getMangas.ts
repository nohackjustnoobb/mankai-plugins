import type { Manga } from "../utils/models.ts";
import { getMangaMetadata, toManga } from "./utils.ts";

async function getMangas(mangaIds: string[]): Promise<Manga[]> {
  const metadata = await getMangaMetadata(mangaIds);

  return metadata.map(toManga);
}

export default getMangas;
