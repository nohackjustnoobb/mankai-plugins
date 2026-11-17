import type {
  GenreFilter,
  Manga,
  SortBy,
  StatusFilter,
} from "../utils/models.ts";
import { parseSearchResults, requestHtml } from "./utils.ts";

async function search(
  query: string,
  page: number = 1,
  _genre: GenreFilter | null = null,
  _status: StatusFilter | null = null,
  _isAuthor: boolean = false,
  _customGenre: string | null = null,
  _sortBy: SortBy | null = null,
  _customSort: string | null = null,
): Promise<Manga[]> {
  const encodedQuery = encodeURIComponent(query.trim());
  if (!encodedQuery) return [];

  const pageSuffix = page > 1 ? `_p${String(page)}` : "";
  const html = await requestHtml(`/s/${encodedQuery}${pageSuffix}.html`);
  return parseSearchResults(html);
}

export default search;
