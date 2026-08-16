import { Genre, Manga, Status } from "../utils/models.ts";

async function getList(
  page: number,
  genre: Genre = Genre.All,
  status: Status = Status.Any,
): Promise<Manga[]> {
  // TODO: Implement the logic to retrieve a list of manga
  console.log(
    `Retrieving manga list for page ${page}, genre: ${genre}, status: ${status}`,
  );
}

export default getList;
