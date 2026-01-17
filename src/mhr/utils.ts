import { md5 } from "js-md5";
import {
  Chapter,
  DetailedManga,
  Genre,
  Manga,
  Status,
} from "../utils/models.ts";

const BASE_HEADERS = {
  Authorization: `YINGQISTS2 eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc19mcm9tX3JndCI6ZmFsc2UsInVzZXJfbGVnYWN5X2lkIjo0NjIwOTk4NDEsImRldmljZV9pZCI6Ii0zNCw2OSw2MSw4MSw2LDExNCw2MSwtMzUsLTEsNDgsNiwzNSwtMTA3LC0xMjIsLTExLC04NywxMjcsNjQsLTM4LC03LDUwLDEzLC05NCwtMTcsLTI3LDkyLC0xNSwtMTIwLC0zNyw3NCwtNzksNzgiLCJ1dWlkIjoiOTlmYTYzYjQtNjFmNy00ODUyLThiNDMtMjJlNGY3YzY2MzhkIiwiY3JlYXRldGltZV91dGMiOiIyMDIzLTA3LTAzIDAyOjA1OjMwIiwibmJmIjoxNjg4MzkzMTMwLCJleHAiOjE2ODgzOTY3MzAsImlhdCI6MTY4ODM5MzEzMH0.IJAkDs7l3rEvURHiy06Y2STyuiIu-CYUk5E8en4LU0_mrJ83hKZR1nVqKiAY9ry_6ZmFzVfg-ap_TXTF6GTqihyM-nmEpD2NVWeWZ5VHWVgJif4ezB4YTs0YEpnVzYCk_x4p0wU2GYbqf1BFrNO7PQPMMPDGfaCTUqI_Pe2B0ikXMaN6CDkMho26KVT3DK-xytc6lO92RHvg65Hp3xC1qaonQXdws13wM6WckUmrswItroy9z38hK3w0rQgXOK2mu3o_4zOKLGfq5JpqOCNQCLJgQ0_jFXhMtaz6E_fMZx54fZHfF1YrA-tfs7KFgiYxMb8PnNILoniFrQhvET3y-Q`,
  "X-Yq-Yqci": `{"av":"1.3.8","cy":"HK","lut":"1662458886867","nettype":1,"os":2,"di":"733A83F2FD3B554C3C4E4D46A307D560A52861C7","fcl":"appstore","fult":"1662458886867","cl":"appstore","pi":"","token":"","fut":"1662458886867","le":"en-HK","ps":"1","ov":"16.4","at":2,"rn":"1668x2388","ln":"","pt":"com.CaricatureManGroup.CaricatureManGroup","dm":"iPad8,6"}`,
  "User-Agent": `Mozilla/5.0 (Linux; Android 12; sdk_gphone64_arm64 Build/SE1A.220630.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36`,
};

const BASE_PARAMS = {
  gak: "android_manhuaren2",
  gaui: "462099841",
  gft: "json",
  gui: "462099841",
};

const HASH_KEY = "4e0a48e1c0b54041bce9c8f0e036124d";

function urlEncode(text: string): string {
  let encoded = "";

  const uint8Array = new TextEncoder().encode(text);
  for (const uint8 of uint8Array) {
    const char = String.fromCharCode(uint8);
    if (/[a-zA-Z0-9\-_.~]/.test(char)) {
      encoded += char;
    } else if (char === " ") {
      encoded += "+";
    } else {
      const charCode = char.charCodeAt(0);
      encoded += "%" + charCode.toString(16).toUpperCase().padStart(2, "0");
    }
  }

  encoded = encoded.replace("+", "%20");
  encoded = encoded.replace("%7E", "~");
  encoded = encoded.replace("*", "%2A");

  return encoded;
}

function hashParamsAndBody(
  params: Record<string, string>,
  body?: string,
): string {
  const hashItems: string[] = [HASH_KEY];

  // Prefix and body
  if (body) {
    hashItems.push("POST");
    hashItems.push("body");
    hashItems.push(body);
  } else {
    hashItems.push("GET");
  }

  // Parameters
  const keys = Object.keys(params).sort();
  for (const key of keys) {
    hashItems.push(key);
    hashItems.push(params[key]);
  }

  hashItems.push(HASH_KEY);

  const hashString = urlEncode(hashItems.join(""));

  return md5.create().update(hashString).hex();
}

function get(
  url: string,
  params: Record<string, string> = {},
  headers: Record<string, string> = {},
): Promise<Response> {
  const paramsWithBase = {
    ...params,
    ...BASE_PARAMS,
  };

  const hash = hashParamsAndBody(paramsWithBase);
  const queryString = new URLSearchParams({
    ...paramsWithBase,
    gsn: hash,
  }).toString();

  const headersWithBase = {
    ...BASE_HEADERS,
    ...headers,
  };

  return fetch(`${url}?${queryString}`, {
    method: "GET",
    headers: headersWithBase,
  });
}

function post(
  url: string,
  body: unknown,
  params: Record<string, string> = {},
  headers: Record<string, string> = {},
): Promise<Response> {
  const paramsWithBase = {
    ...params,
    ...BASE_PARAMS,
  };

  const bodyString = JSON.stringify(body);
  const hash = hashParamsAndBody(paramsWithBase, bodyString);
  const queryString = new URLSearchParams({
    ...paramsWithBase,
    gsn: hash,
  }).toString();

  const headersWithBase = {
    ...BASE_HEADERS,
    ...headers,
  };

  return fetch(`${url}?${queryString}`, {
    method: "POST",
    headers: headersWithBase,
    body: bodyString,
  });
}

// deno-lint-ignore no-explicit-any
async function toManga(data: any): Promise<Manga> {
  return {
    id: data.mangaId.toString(),
    title: await s2t(data.mangaName),
    cover: data.mangaCoverimageUrl,
    status: data.mangaIsOver ? Status.Ended : Status.OnGoing,
    latestChapter: {
      id: data.mangaNewsectionId?.toString(), // <- not sure if this is correct
      title: data.mangaNewestContent ?? data.mangaNewsectionName,
    },
  };
}

// deno-lint-ignore no-explicit-any
function toChapters(data: any): Promise<Chapter[]> {
  return Promise.all(
    data
      // deno-lint-ignore no-explicit-any
      .map(async (chapter: any) => ({
        id: chapter.sectionId.toString(),
        title: await s2t(chapter.sectionName),
      }))
      .reverse(),
  );
}

const GENRES_MAP: Record<string, Genre> = {
  热血: Genre.Action,
  恋爱: Genre.Romance,
  爱情: Genre.Romance,
  校园: Genre.SchoolLife,
  百合: Genre.Yuri,
  彩虹: Genre.BoysLove,
  冒险: Genre.Adventure,
  后宫: Genre.Harem,
  科幻: Genre.SpeculativeFiction,
  战争: Genre.War,
  悬疑: Genre.Suspense,
  推理: Genre.SpeculativeFiction,
  搞笑: Genre.Comedy,
  奇幻: Genre.Magic,
  魔法: Genre.Magic,
  恐怖: Genre.Horror,
  神鬼: Genre.Horror,
  历史: Genre.Historical,
  同人: Genre.FanFiction,
  运动: Genre.Sports,
  机甲: Genre.Mecha,
  限制级: Genre.Mature,
  绅士: Genre.Mature,
  伪娘: Genre.Otokonoko,
};

// deno-lint-ignore no-explicit-any
async function toDetailedManga(data: any): Promise<DetailedManga> {
  const updatedAt =
    new Date(data.mangaNewestTime).getTime() - 8 * 60 * 60 * 1000; // Convert from UTC+8 to UTC

  const chaptersEntries = [
    ["volume", await toChapters(data.mangaRolls)],
    ["extra", await toChapters(data.mangaEpisode)],
    ["serial", await toChapters(data.mangaWords)],
  ];

  const chapters = Object.fromEntries(
    chaptersEntries.filter(([, chapters]) => chapters.length > 0),
  );

  return {
    id: data.mangaId.toString(),
    title: await s2t(data.mangaName),
    cover: data.mangaCoverimageUrl,
    status: data.mangaIsOver ? Status.Ended : Status.OnGoing,
    latestChapter: {
      id: data.mangaNewsectionId?.toString(), // <- not sure if this is correct
      title: await s2t(data.mangaNewestContent ?? data.mangaNewsectionName),
    },
    description: await s2t(data.mangaIntro),
    updatedAt,
    authors: data.mangaAuthors,
    genres: Object.entries(GENRES_MAP)
      .filter(([key]) => data.mangaTheme.includes(key))
      .map(([, genre]) => genre),
    chapters,
  };
}

const genreId: Record<Genre, number> = {
  [Genre.All]: 0,
  [Genre.Action]: 31,
  [Genre.Romance]: 26,
  [Genre.SchoolLife]: 1,
  [Genre.Yuri]: 3,
  [Genre.BoysLove]: 27,
  [Genre.Adventure]: 2,
  [Genre.Harem]: 8,
  [Genre.War]: 12,
  [Genre.Suspense]: 17,
  [Genre.SpeculativeFiction]: 33,
  [Genre.Comedy]: 37,
  [Genre.Magic]: 15,
  [Genre.Horror]: 29,
  [Genre.Historical]: 4,
  [Genre.FanFiction]: 30,
  [Genre.Sports]: 34,
  [Genre.Mature]: 36,
  [Genre.Mecha]: 40,
  [Genre.Otokonoko]: 5,
};

const LIMIT = 50;

const BASE_URL = "https://hkmangaapi.manhuaren.com";

export { get, post, toManga, toDetailedManga };

export { genreId, LIMIT, BASE_URL };
