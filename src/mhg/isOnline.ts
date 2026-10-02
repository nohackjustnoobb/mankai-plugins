import { requestHtml } from "./utils.ts";

async function isOnline(): Promise<boolean> {
  try {
    await requestHtml("/");
    return true;
  } catch (_) {
    return false;
  }
}

export default isOnline;
