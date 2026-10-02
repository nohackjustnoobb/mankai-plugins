import { BASE_URL } from "./utils.ts";

async function isOnline(): Promise<boolean> {
  try {
    const resp = await fetch(BASE_URL);
    return resp.ok;
  } catch (_) {
    return false;
  }
}

export default isOnline;
