import { Status } from "../utils/models.ts";
import type {
  GenreFilter,
  Manga,
  SortBy,
  StatusFilter,
} from "../utils/models.ts";
import { GENRE_SLUGS, parseListResults, requestHtml } from "./utils.ts";

async function getList(
  page: number = 1,
  genre: GenreFilter | "all" | null = null,
  status: StatusFilter | null = null,
  _customGenre: string | null = null,
  _sortBy: SortBy | null = null,
  _customSort: string | null = null,
): Promise<Manga[]> {
  if (genre === "custom") return [];
  const genreSlug = genre === null || genre === "all" ? "" : GENRE_SLUGS[genre];
  if (genreSlug === undefined) return [];

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
