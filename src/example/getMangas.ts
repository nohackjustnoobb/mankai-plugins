import { Manga } from "../utils/models.ts";

async function getMangas(mangaIds: string[]): Promise<Manga[]> {
  // TODO: Implement the logic to retrieve a list of mangas
  console.log(`Retrieving mangas for IDs: ${mangaIds.join(", ")}`);
}

export default getMangas;
