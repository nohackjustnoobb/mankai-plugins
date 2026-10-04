import { BASE_URL, request } from "./utils.ts";

async function isOnline(): Promise<boolean> {
  try {
    return (await (await request(`${BASE_URL}/ping`)).text()).trim() === "pong";
  } catch (_) {
    return false;
  }
}

export default isOnline;
