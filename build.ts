import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { build } from "esbuild";

const srcDir = "./src";
const distDir = "./dist";

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

const repo = Bun.env.GITHUB_REPOSITORY;
const branch = "static";
const builtPlugins: {
  id: string;
  name: string;
  version: string;
  description: string;
  path: string;
}[] = [];

for (const dirEntry of readdirSync(srcDir, { withFileTypes: true })) {
  if (!dirEntry.isDirectory() || dirEntry.name === "utils") continue;
  const folder = `${srcDir}/${dirEntry.name}`;
  const entryPoints = [
    "isOnline.ts",
    "getSuggestion.ts",
    "search.ts",
    "getList.ts",
    "getMangas.ts",
    "getMangaUpdates.ts",
    "getDetailedManga.ts",
    "getChapter.ts",
    "getImage.ts",
  ]
    .map((f) => `${folder}/${f}`)
    .filter(existsSync);
  for (const entryPoint of entryPoints) {
    // Create output folder for this group if it doesn't exist
    const outFolder = `${distDir}/${dirEntry.name}`;
    mkdirSync(outFolder, { recursive: true });

    await build({
      entryPoints: [entryPoint],
      outdir: outFolder,
      platform: "browser",
      format: "esm",
      bundle: true,
      minify: true,
      entryNames: "[name]",
    });
  }
  console.log(`✅ Bundle created for ${dirEntry.name}`);

  const metaPath = `${folder}/meta.json`;
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  const id = meta.id;

  const outFolder = `${distDir}/${dirEntry.name}`;
  const scripts: Record<string, string> = {};
  for (const entryPoint of entryPoints) {
    const key = basename(entryPoint, ".ts");
    scripts[key] = readFileSync(join(outFolder, `${key}.js`), "utf8");
    console.log(`✅ ${key} added to ${id}.json`);
  }
  meta.scripts = scripts;

  if (repo) {
    const repoUrl = `https://github.com/${repo}`;
    const updatesUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${dirEntry.name}/${id}.json`;

    if (!meta.repository) {
      meta.repository = repoUrl;
      console.log(`✅ Added repository to ${id}.json`);
    }
    if (!meta.updatesUrl) {
      meta.updatesUrl = updatesUrl;
      console.log(`✅ Added updatesUrl to ${id}.json`);
    }
  }

  writeFileSync(`${outFolder}/${id}.json`, JSON.stringify(meta, null, 2));
  console.log(`✅ ${id}.json created in ${outFolder}\n`);
  builtPlugins.push({
    id,
    name: meta.name ?? id,
    version: meta.version ?? "0.0.0",
    description: meta.description ?? "",
    path: `${dirEntry.name}/${id}.json`,
  });
}

if (repo && branch) {
  console.log(`Create README.md for ${repo} on branch ${branch}`);
  let readmeContent =
    "# Built Plugins\n\n> This branch is auto-generated. Do not edit.\n\n";
  for (const plugin of builtPlugins) {
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${plugin.path}`;
    readmeContent += `### ${plugin.name} v${plugin.version}\n`;
    if (plugin.description) {
      readmeContent += `${plugin.description}\n\n`;
    }
    readmeContent += `\`\`\`\n${url}\n\`\`\`\n\n`;
  }
  writeFileSync(`${distDir}/README.md`, readmeContent);
  console.log(`✅ README.md created in ${distDir}`);
} else {
  console.log("Skipping README generation (missing env vars)");
}
