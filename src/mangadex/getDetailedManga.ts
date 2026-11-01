import { ReadingDirection } from "../utils/models.ts";
import type { ChapterGroup, DetailedManga } from "../utils/models.ts";
import type { ChapterData, MangaData } from "./types.ts";
import {
  addArray,
  apiGet,
  chapterTime,
  getChapterFeed,
  languageKey,
  localizedText,
  localizedValues,
  toChapter,
  toCustomGenres,
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
  const latestByLanguage = new Map<string, ChapterData>();

  for (const chapter of feed) {
    const language = languageKey(chapter.attributes.translatedLanguage);
    const latest = latestByLanguage.get(language);
    if (!latest || chapterTime(chapter) > chapterTime(latest)) {
      latestByLanguage.set(language, chapter);
    }
  }

  const manga = toManga(data);
  const titles = localizedValues(
    data.attributes.title,
    data.attributes.altTitles,
  );
  const descriptions = localizedValues(data.attributes.description);
  const languages = new Set([
    ...Object.keys(titles),
    ...Object.keys(descriptions),
    ...latestByLanguage.keys(),
  ]);

  // The app uses untagged groups for Source Default and unmatched languages.
  // English is always the source default, independent of browsing filters.
  const latestEnglish = latestByLanguage.get("en");
  const chapters = new Map<string, ChapterGroup>();

  for (const chapter of feed) {
    const language = languageKey(chapter.attributes.translatedLanguage);
    const volume = chapter.attributes.volume;
    const hasVolume = volume != null && volume !== "";
    const key = JSON.stringify([language, hasVolume ? volume : null]);

    if (!chapters.has(key)) {
      chapters.set(key, {
        id: key,
        title: hasVolume ? `vol. ${volume}` : "chapters",
        language: language === "en" ? undefined : language,
        chapters: [],
      });
    }
    chapters.get(key)!.chapters.push(toChapter(chapter));
  }

  const latest = feed.reduce<ChapterData | undefined>(
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
    ...manga,
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
    customGenres: toCustomGenres(data),
    latestChapter: latestEnglish ? toChapter(latestEnglish) : undefined,
    localizations: Object.fromEntries(
      [...languages].map((language) => {
        const latest = latestByLanguage.get(language);
        return [
          language,
          {
            title: titles[language],
            description: descriptions[language],
            customGenres: toCustomGenres(data, language),
            latestChapter: latest ? toChapter(latest) : undefined,
          },
        ];
      }),
    ),
    chapters: [...chapters.values()],
  };
}

export default getDetailedManga;
