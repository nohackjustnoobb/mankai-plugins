import { Manga } from "../utils/models.ts";

async function search(query: string, page: number): Promise<Manga[]> {
  // TODO: Implement the logic to search for manga
  console.log(`Searching for manga with query: ${query} on page: ${page}`);
}

export default search;
