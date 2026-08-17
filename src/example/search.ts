import { Genre, Manga, Status } from "../utils/models.ts";

async function search(
  query: string,
  page: number,
  genre: Genre = Genre.All,
  status: Status = Status.Any,
  isAuthor: boolean = false,
): Promise<Manga[]> {
  // TODO: Implement the logic to search for manga
  console.log(
    `Searching for manga by ${
      isAuthor ? "author" : "title"
    } with query: ${query} on page: ${page}, genre: ${genre}, status: ${status}`,
  );
}

export default search;
