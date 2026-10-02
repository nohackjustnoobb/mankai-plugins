import { Chapter, DetailedManga } from "../utils/models.ts";
import { parseChapterUrls, requestHtml } from "./utils.ts";

async function getChapter(
  manga: DetailedManga,
  chapter: Chapter,
): Promise<string[]> {
  const html = await requestHtml(`/comic/${manga.id}/${chapter.id}.html`);
  return parseChapterUrls(html);
}

export default getChapter;
