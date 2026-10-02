import { Genre, Manga, Status } from "../utils/models.ts";
import { parseSearchResults, requestHtml } from "./utils.ts";

async function search(
  query: string,
  page: number = 1,
  _genre: Genre = Genre.All,
  _status: Status = Status.Any,
  _isAuthor: boolean = false,
): Promise<Manga[]> {
  const encodedQuery = encodeURIComponent(query.trim());
  if (!encodedQuery) return [];

  const pageSuffix = page > 1 ? `_p${String(page)}` : "";
  const html = await requestHtml(`/s/${encodedQuery}${pageSuffix}.html`);
  return parseSearchResults(html);
}

export default search;
