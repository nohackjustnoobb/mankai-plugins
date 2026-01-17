import { Chapter, DetailedManga } from "../utils/models.ts";

async function getChapter(
  manga: DetailedManga,
  chapter: Chapter
): Promise<string[]> {
  // TODO: Implement the logic to retrieve a chapter
  console.log(`Retrieving chapter ${chapter.id} for manga ${manga.title}`);
}

export default getChapter;
