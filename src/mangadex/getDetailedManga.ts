import { ReadingDirection } from "../utils/models.ts";
import type { ChapterGroup, DetailedManga } from "../utils/models.ts";
import type { MangaData } from "./types.ts";
import {
  addArray,
  apiGet,
  chapterTime,
  getChapterFeed,
  localizedText,
  toChapter,
  toGenres,
  toManga,
} from "./utils.ts";

async function getDetailedManga(mangaId: string): Promise<DetailedManga> {
  const params = new URLSearchParams();
  addArray(params, "includes", ["cover_art", "author", "artist"]);

  const { data } = await apiGet<{ data: MangaData }>(
    `/manga/${encodeURIComponent(mangaId)}`,
    params,
  );
  const feed = await getChapterFeed(mangaId);

  const chapters = new Map<string, ChapterGroup>();

  for (const chapter of feed) {
    const volume = chapter.attributes.volume;
    const title =
      volume != null && volume !== "" ? `Vol. ${volume}` : "Chapters";

    if (!chapters.has(title)) chapters.set(title, { title, chapters: [] });
    chapters.get(title)!.chapters.push(toChapter(chapter));
  }

  const latest = feed.reduce<(typeof feed)[number] | undefined>(
    (current, chapter) =>
      !current || chapterTime(chapter) > chapterTime(current)
        ? chapter
        : current,
    undefined,
  );

  const isLongStrip = data.attributes.tags?.some(
    (tag) => tag.id === "3e2b8dae-350e-4ab8-a8ce-016e844b9f0d",
  );

  const updatedAt = Math.max(
    Date.parse(data.attributes.updatedAt ?? "") || 0,
    latest ? chapterTime(latest) : 0,
  );

  return {
    ...toManga(data),
    externalLink: `https://mangadex.org/title/${data.id}`,
    readingDirection: isLongStrip
      ? ReadingDirection.Vertical
      : ["ja", "zh", "zh-hk"].includes(data.attributes.originalLanguage ?? "")
        ? ReadingDirection.RightToLeft
        : ReadingDirection.LeftToRight,
    description: localizedText(data.attributes.description),
    updatedAt: updatedAt || undefined,
    authors: [
      ...new Set(
        data.relationships
          .filter((rel) => rel.type === "author" || rel.type === "artist")
          .flatMap((rel) =>
            rel.attributes?.name ? [rel.attributes.name] : [],
          ),
      ),
    ],
    genres: toGenres(data),
    latestChapter: latest ? toChapter(latest) : undefined,
    chapters: [...chapters.values()],
  };
}

export default getDetailedManga;
