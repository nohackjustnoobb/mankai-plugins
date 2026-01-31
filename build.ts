import { build, stop } from "esbuild";
import { denoPlugin } from "@deno/esbuild-plugin";

const srcDir = "./src";
const distDir = "./dist";

const repo = Deno.env.get("GITHUB_REPOSITORY");
const branch = "static";
const builtPlugins: {
  id: string;
  name: string;
  version: string;
  description: string;
  path: string;
}[] = [];

for await (const dirEntry of Deno.readDir(srcDir)) {
  if (!dirEntry.isDirectory || dirEntry.name === "utils") continue;
  const folder = `${srcDir}/${dirEntry.name}`;
  const entryPoints = [
    "isOnline.ts",
    "getSuggestion.ts",
    "search.ts",
    "getList.ts",
    "getMangas.ts",
    "getDetailedManga.ts",
    "getChapter.ts",
    "getImage.ts",
  ]
    .map((f) => `${folder}/${f}`)
    .filter((f) => {
      try {
        Deno.statSync(f);
        return true;
      } catch {
        return false;
      }
    });
  for (const entryPoint of entryPoints) {
    // Create output folder for this group if it doesn't exist
    const outFolder = `${distDir}/${dirEntry.name}`;
    try {
      Deno.mkdirSync(outFolder, { recursive: true });
    } catch (_e) {
      /* ignore if exists */
    }

    await build({
      entryPoints: [entryPoint],
      bundle: true,
      outfile: `${outFolder}/${entryPoint
        .split("/")
        .pop()
        ?.replace(".ts", ".js")}`,
      plugins: [denoPlugin()],
      format: "esm",
      minify: true,
    });
  }
  console.log(`✅ Bundle created for ${dirEntry.name}`);

  const decoder = new TextDecoder("utf-8");
  const metaPath = `${folder}/meta.json`;
  const meta = JSON.parse(decoder.decode(Deno.readFileSync(metaPath)));
  const id = meta.id;

  const outFolder = `${distDir}/${dirEntry.name}`;
  const distFiles = Deno.readDirSync(outFolder);
  const scripts: Record<string, string> = {};
  for (const file of distFiles) {
    if (!file.isFile || !file.name.endsWith(".js")) continue;
    const key = file.name.replace(/\.js$/, "");
    scripts[key] = decoder.decode(
      Deno.readFileSync(`${outFolder}/${file.name}`),
    );
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

  const encoder = new TextEncoder();
  Deno.writeFileSync(
    `${outFolder}/${id}.json`,
    encoder.encode(JSON.stringify(meta, null, 2)),
  );
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
  Deno.writeTextFileSync(`${distDir}/README.md`, readmeContent);
  console.log(`✅ README.md created in ${distDir}`);
} else {
  console.log("Skipping README generation (missing env vars)");
}

await stop();
