import { IMAGE_HEADERS } from "./utils.ts";

async function getImage(
  imageUrl: string,
): Promise<{ url: string; headers: Record<string, string> }> {
  return { url: imageUrl, headers: IMAGE_HEADERS };
}

export default getImage;
