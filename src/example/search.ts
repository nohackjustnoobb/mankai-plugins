import { Genre, Manga, Status } from "../utils/models.ts";

async function search(
  query: string,
  page: number,
  genre: Genre = Genre.All,
  status: Status = Status.Any,
): Promise<Manga[]> {
  // TODO: Implement the logic to search for manga
  console.log(
    `Searching for manga with query: ${query} on page: ${page}, genre: ${genre}, status: ${status}`,
  );
}

export default search;
