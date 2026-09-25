import { decompressFromBase64 } from "lz-string";
import {
  Chapter,
  ChapterGroup,
  DetailedManga,
  Genre,
  Manga,
  Status,
} from "../utils/models.ts";

const BASE_URL = "https://tw.manhuagui.com/";
const IMAGE_ORIGIN = "https://i.hamreus.com";
const REFERER = "https://tw.manhuagui.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";

const REQUEST_HEADERS = { "User-Agent": USER_AGENT };
const IMAGE_HEADERS = {
  Referer: REFERER,
  "User-Agent": USER_AGENT,
};

const GENRES: Record<string, Genre> = {
  rexue: Genre.Action,
  aiqing: Genre.Romance,
  xiaoyuan: Genre.SchoolLife,
  baihe: Genre.Yuri,
  danmei: Genre.BoysLove,
  maoxian: Genre.Adventure,
  hougong: Genre.Harem,
  kehuan: Genre.SpeculativeFiction,
  zhanzheng: Genre.War,
  xuanyi: Genre.Suspense,
  tuili: Genre.Suspense,
  gaoxiao: Genre.Comedy,
  mohuan: Genre.Magic,
  mofa: Genre.Magic,
  kongbu: Genre.Horror,
  shengui: Genre.Horror,
  lishi: Genre.Historical,
  jingji: Genre.Sports,
  jizhan: Genre.Mecha,
  weiniang: Genre.Otokonoko,
};

const GENRE_SLUGS: Partial<Record<Genre, string>> = {
  [Genre.Action]: "rexue",
  [Genre.Romance]: "aiqing",
  [Genre.SchoolLife]: "xiaoyuan",
  [Genre.Yuri]: "baihe",
  [Genre.BoysLove]: "danmei",
  [Genre.Adventure]: "maoxian",
  [Genre.Harem]: "hougong",
  [Genre.SpeculativeFiction]: "kehuan",
  [Genre.War]: "zhanzheng",
  [Genre.Suspense]: "xuanyi",
  [Genre.Comedy]: "gaoxiao",
  [Genre.Magic]: "mofa",
  [Genre.Horror]: "kongbu",
  [Genre.Historical]: "lishi",
  [Genre.Sports]: "jingji",
  [Genre.Mecha]: "jizhan",
  [Genre.Otokonoko]: "weiniang",
};

function parseHtml(html: string, source: string): Document {
  if (!html.trim()) throw new Error(`Invalid ${source}: empty document`);

  const document = new DOMParser().parseFromString(html, "text/html");
  if (!document.documentElement) {
    throw new Error(`Invalid ${source}: HTML parsing failed`);
  }
  return document;
}

function text(element: Element | null | undefined): string {
  return element?.textContent?.trim() ?? "";
}

function absoluteUrl(value: string): string {
  if (value.startsWith("//")) return `https:${value}`;
  return new URL(value, BASE_URL).href;
}

function normalizeLatestTitle(value: string): string {
  return (
    value
      .replace(/更新至|共/gu, "")
      .trim()
      .split(/\s+/u)[0]
      ?.replace(/第/gu, "") ?? ""
  );
}

function parseUpdateFeed(html: string): Map<string, string> {
  const document = parseHtml(html, "MHG update feed");
  const list = document.querySelector("div.latest-cont > div.latest-list");
  if (!list) throw new Error("Invalid MHG update feed: missing update list");

  const updates = new Map<string, string>();
  for (const item of list.querySelectorAll(":scope > ul > li")) {
    const href = item.querySelector("a")?.getAttribute("href") ?? "";
    const id = href.match(/\d+/u)?.[0];
    const revision = normalizeLatestTitle(
      text(item.querySelector("a span.tt")),
    );
    if (id && revision) updates.set(id, revision);
  }

  if (updates.size === 0) {
    throw new Error("Invalid MHG update feed: no updates found");
  }
  return updates;
}

function parseChapterMarkup(
  html: string,
  headingSelector: string,
  source: string,
): ChapterGroup[] {
  const document = parseHtml(html, source);
  const headings = Array.from(document.querySelectorAll(headingSelector));
  const lists = Array.from(document.querySelectorAll("div.chapter-list"));
  if (lists.length === 0) {
    throw new Error(`Invalid ${source}: missing chapter lists`);
  }

  const groups: ChapterGroup[] = [];
  const groupsByTitle = new Map<string, Chapter[]>();

  for (const [index, list] of lists.entries()) {
    const heading = text(headings[index]);
    let groupTitle = heading || `Group ${String(index + 1)}`;
    if (heading.includes("單話") || heading.includes("单话")) {
      groupTitle = "series";
    } else if (heading.includes("單行本") || heading.includes("单行本")) {
      groupTitle = "volume";
    } else if (heading.includes("番外篇")) {
      groupTitle = "extra";
    }

    let chapters = groupsByTitle.get(groupTitle);
    if (!chapters) {
      chapters = [];
      groupsByTitle.set(groupTitle, chapters);
      groups.push({ title: groupTitle, chapters });
    }

    for (const chapterList of list.querySelectorAll(":scope > ul")) {
      const ordered = Array.from(
        chapterList.querySelectorAll(":scope > li > a"),
      )
        .flatMap((anchor): Chapter[] => {
          const href = (anchor.getAttribute("href") ?? "")
            .trim()
            .split(/[?#]/u, 1)[0];
          const id = (href.split("/").filter(Boolean).at(-1) ?? "").replace(
            /\.html$/u,
            "",
          );
          if (!id) return [];

          const title = (anchor.getAttribute("title") ?? "")
            .trim()
            .replace(/话/gu, "話");
          return [title ? { id, title } : { id }];
        })
        .reverse();
      chapters.push(...ordered);
    }
  }

  if (groups.every(({ chapters }) => chapters.length === 0)) {
    throw new Error(`Invalid ${source}: no chapters found`);
  }
  return groups;
}

function parseManga(id: string, html: string): DetailedManga {
  const document = parseHtml(html, "MHG manga page");
  const bookCover = document.querySelector("div.book-cover");
  const coverImage = bookCover?.querySelector("img");
  const title = coverImage?.getAttribute("alt")?.trim() ?? "";
  if (!bookCover || !coverImage || !title) {
    throw new Error("Invalid MHG manga page: missing book cover or title");
  }

  const viewstate = document
    .querySelector("#__VIEWSTATE")
    ?.getAttribute("value");
  let chapterHtml = html;
  let headingSelector = "div.chapter > h4";
  let chapterSource = "MHG manga page";
  if (viewstate) {
    const decompressed = decompressFromBase64(viewstate);
    if (!decompressed?.trim()) {
      throw new Error("Invalid MHG manga page: invalid compressed __VIEWSTATE");
    }
    chapterHtml = decompressed;
    headingSelector = "h4";
    chapterSource = "MHG compressed chapter markup";
  }
  const chapters = parseChapterMarkup(
    chapterHtml,
    headingSelector,
    chapterSource,
  );

  const latestTitle = text(bookCover.querySelector("span.text"))
    .replace(/更新至[：:]?/gu, "")
    .trim();
  const latestRevision = normalizeLatestTitle(latestTitle);
  const allChapters = chapters.flatMap((group) => group.chapters);
  const latestChapter = [...allChapters]
    .reverse()
    .find(
      (chapter) => normalizeLatestTitle(chapter.title ?? "") === latestRevision,
    );

  const authors = Array.from(
    document.querySelectorAll(
      "ul.detail-list > li:nth-child(2) > span:nth-child(2) > a",
    ),
  )
    .map(text)
    .filter(Boolean);
  const genres = Array.from(
    document.querySelectorAll(
      "ul.detail-list > li:nth-child(2) > span:nth-child(1) > a",
    ),
  ).flatMap((anchor): Genre[] => {
    const slug = (anchor.getAttribute("href") ?? "").match(
      /\/list\/([^/]+)\//u,
    )?.[1];
    const genre = slug ? GENRES[slug] : undefined;
    return genre === undefined ? [] : [genre];
  });

  const description = text(
    document.querySelector("div.book-intro > #intro-all"),
  );
  const updatedAtText = text(
    document.querySelector("li.status > span > span:nth-child(3)"),
  );
  let cover =
    coverImage.getAttribute("src") || coverImage.getAttribute("data-src") || "";
  if (!cover) throw new Error("Invalid MHG manga page: missing cover URL");
  cover = absoluteUrl(cover);

  const result: DetailedManga = {
    id,
    externalLink: new URL(`/comic/${id}/`, BASE_URL).href,
    title,
    cover,
    status: bookCover.querySelector("span.finish")
      ? Status.Completed
      : Status.OnGoing,
    authors,
    genres,
    chapters,
    meta: latestRevision,
  };
  if (latestChapter) result.latestChapter = latestChapter;
  if (description) result.description = description;
  if (updatedAtText) {
    const updatedAt = Date.parse(updatedAtText);
    if (Number.isNaN(updatedAt)) {
      throw new Error("Invalid MHG manga page: invalid update date");
    }
    result.updatedAt = updatedAt;
  }
  return result;
}

function parseSearchResults(html: string): Manga[] {
  const document = parseHtml(html, "MHG search results");
  return parseMangaItems(
    Array.from(document.querySelectorAll("div.book-result > ul > li.cf")),
  );
}

function parseListResults(html: string): Manga[] {
  const document = parseHtml(html, "MHG manga list");
  const items = Array.from(document.querySelectorAll("#contList > li"));
  return parseMangaItems(items);
}

function parseMangaItems(items: Element[]): Manga[] {
  const mangas: Manga[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const anchor = item.querySelector('a[href*="/comic/"]');
    if (!anchor) continue;

    const href = anchor.getAttribute("href") ?? "";
    const id = href.match(/\/comic\/([1-9]\d*)\/?(?:[?#].*)?$/u)?.[1];
    if (!id || seen.has(id)) continue;

    const image = anchor.querySelector("img") ?? item.querySelector("img");
    const title =
      anchor.getAttribute("title")?.trim() ||
      image?.getAttribute("alt")?.trim() ||
      text(anchor);
    if (!title) continue;

    const manga: Manga = { id, title };
    const cover =
      image?.getAttribute("data-src") || image?.getAttribute("src") || "";
    if (cover) manga.cover = absoluteUrl(cover);

    const itemText = text(item);
    if (
      anchor.querySelector("span.fd") ||
      itemText.includes("已完結") ||
      itemText.includes("已完结")
    ) {
      manga.status = Status.Completed;
    } else if (
      itemText.includes("連載") ||
      itemText.includes("连载") ||
      anchor.querySelector("span.tt")
    ) {
      manga.status = Status.OnGoing;
    }

    const latestTitle = text(item.querySelector("span.tt"))
      .replace(/^更新至[：:]?\s*/u, "")
      .replace(/\s*\[完\]\s*$/u, "")
      .trim();
    if (latestTitle) {
      manga.latestChapter = {
        id: "0",
        title: latestTitle,
      };
    }

    seen.add(id);
    mangas.push(manga);
  }
  return mangas;
}

function unpackChapterPayload(
  encoded: string,
  radix: number,
  count: number,
  valuesString: string,
): string {
  if (radix < 2 || radix > 62 || count < 0) {
    throw new Error("Invalid MHG chapter page: invalid packed payload header");
  }

  const values = valuesString.split("|");
  const digits =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const generateKey = (index: number): string => {
    const last = index % radix;
    const prefix = index < radix ? "" : generateKey(Math.floor(index / radix));
    return `${prefix}${last > 35 ? String.fromCharCode(last + 29) : digits[last]}`;
  };

  const pairs: Record<string, string> = {};
  for (let index = count - 1; index >= 0; index--) {
    const key = generateKey(index);
    pairs[key] = values[index] || key;
  }
  return encoded.replace(/\b\w+\b/gu, (value) => pairs[value] ?? value);
}

function parseChapterUrls(html: string): string[] {
  if (!html.trim()) throw new Error("Invalid MHG chapter page: empty document");

  const packed = html.match(
    /\}\(\s*'([\s\S]*?)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([A-Za-z\d+/|=]+)'/u,
  );
  if (!packed) {
    throw new Error("Invalid MHG chapter page: packed payload not found");
  }

  const radix = Number.parseInt(packed[2], 10);
  const count = Number.parseInt(packed[3], 10);
  const values = decompressFromBase64(packed[4]);
  if (!values) {
    throw new Error("Invalid MHG chapter page: packed values are invalid");
  }

  const decoded = unpackChapterPayload(packed[1], radix, count, values);
  const prefix = "SMH.imgData(";
  const suffix = ").preInit();";
  const start = decoded.indexOf(prefix);
  const end = decoded.indexOf(suffix, start + prefix.length);
  if (start < 0 || end < 0) {
    throw new Error("Invalid MHG chapter page: image data call not found");
  }

  let data: unknown;
  try {
    data = JSON.parse(decoded.slice(start + prefix.length, end));
  } catch (error) {
    throw new Error("Invalid MHG chapter page: image data is not JSON", {
      cause: error,
    });
  }
  if (
    typeof data !== "object" ||
    data === null ||
    !("path" in data) ||
    typeof data.path !== "string" ||
    !data.path.trim() ||
    !("files" in data) ||
    !Array.isArray(data.files)
  ) {
    throw new Error("Invalid MHG chapter page: malformed image data");
  }

  const files = data.files;
  if (
    files.length === 0 ||
    files.some((file) => typeof file !== "string" || !file.trim())
  ) {
    throw new Error("Invalid MHG chapter page: no image files found");
  }

  const path = `/${data.path.trim().replace(/^\/+|\/+$/gu, "")}/`;
  return files.map(
    (file) => `${IMAGE_ORIGIN}${path}${file.trim().replace(/^\/+/u, "")}`,
  );
}

async function requestHtml(path: string): Promise<string> {
  const response = await fetch(new URL(path, BASE_URL).href, {
    headers: REQUEST_HEADERS,
  });
  if (!response.ok) {
    throw new Error(`MHG request failed: ${String(response.status)}`);
  }
  return response.text();
}

export {
  BASE_URL,
  GENRE_SLUGS,
  IMAGE_HEADERS,
  REQUEST_HEADERS,
  normalizeLatestTitle,
  parseChapterUrls,
  parseListResults,
  parseManga,
  parseSearchResults,
  parseUpdateFeed,
  requestHtml,
};
