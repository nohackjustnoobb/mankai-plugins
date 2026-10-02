import { Genre, Manga, Status } from "../utils/models.ts";
import { GENRE_SLUGS, parseListResults, requestHtml } from "./utils.ts";

async function getList(
  page: number = 1,
  genre: Genre = Genre.All,
  status: Status = Status.Any,
): Promise<Manga[]> {
  const genreSlug = genre === Genre.All ? "" : GENRE_SLUGS[genre];
  if (genre !== Genre.All && !genreSlug) return [];

  const statusSlug =
    status === Status.OnGoing
      ? "lianzai"
      : status === Status.Completed
        ? "wanjie"
        : "";
  const filter = [genreSlug, statusSlug].filter(Boolean).join("_");
  const path = `/list/${filter ? `${filter}/` : ""}index_p${String(page)}.html`;

  return parseListResults(await requestHtml(path));
}

export default getList;
