import type { Chapter, DetailedManga } from "../utils/models.ts";
import type { AtHomeResponse } from "./types.ts";
import { apiGet, configValue } from "./utils.ts";

async function getChapter(
  _manga: DetailedManga,
  chapter: Chapter,
): Promise<string[]> {
  const result = await apiGet<AtHomeResponse>(
    `/at-home/server/${encodeURIComponent(chapter.id)}`,
    new URLSearchParams({ forcePort443: "true" }),
  );

  if (!result.baseUrl || !result.chapter?.hash) {
    throw new Error("Invalid MangaDex image server response.");
  }

  const useDataSaver =
    configValue("imageQuality") === "data-saver" &&
    result.chapter.dataSaver?.length > 0;
  const quality = useDataSaver ? "data-saver" : "data";
  const files = useDataSaver ? result.chapter.dataSaver : result.chapter.data;

  if (!files?.length)
    throw new Error("This MangaDex chapter has no readable pages.");

  const baseUrl = result.baseUrl.replace(/\/+$/, "");

  return files.map(
    (file) => `${baseUrl}/${quality}/${result.chapter.hash}/${file}`,
  );
}

export default getChapter;
