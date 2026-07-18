import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptsDir, "..");
const source = resolve(siteRoot, "..", "VideoAnalyzer", "frontend", "out");
const target = resolve(siteRoot, "assets", "embeds", "video-analyzer");
const fixtureSource = resolve(scriptsDir, "video-analyzer-portfolio-fixture.js");

if (!existsSync(join(source, "index.html"))) {
  throw new Error(`Video Analyzer static export not found at ${source}`);
}

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
}
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
cpSync(fixtureSource, join(target, "portfolio-fixture.js"));

function rewrite(file, replacements) {
  let content = readFileSync(file, "utf8");
  for (const [before, after] of replacements) {
    content = content.split(before).join(after);
  }
  writeFileSync(file, content);
}

for (const fileName of ["index.html", "404.html"]) {
  const file = join(target, fileName);
  rewrite(file, [
    ["/_next/", "./_next/"],
    ["/studio-poster.png", "./studio-poster.png"]
  ]);

  let html = readFileSync(file, "utf8");
  const fixtureScript = '<script src="./portfolio-fixture.js"></script>';
  const favicon = '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 rx=%228%22 fill=%22%23040b0e%22/%3E%3Cpath d=%22M5 11c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 4 3M5 17c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 4 3M5 23c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 4 3%22 fill=%22none%22 stroke=%22%238bd6e6%22 stroke-width=%222%22/%3E%3C/svg%3E">';
  if (!html.includes(fixtureScript)) {
    html = html.replace("</title>", `</title>${fixtureScript}${favicon}`);
    writeFileSync(file, html);
  }
}

const chunksRoot = join(target, "_next", "static", "chunks");
const webpackChunk = readdirSync(chunksRoot).find((name) => name.startsWith("webpack-") && name.endsWith(".js"));
if (!webpackChunk) {
  throw new Error("Could not find the Video Analyzer webpack runtime chunk.");
}
rewrite(join(chunksRoot, webpackChunk), [["/_next/", "./_next/"]]);

const appChunks = join(chunksRoot, "app");
for (const name of readdirSync(appChunks)) {
  if (name.startsWith("page-") && name.endsWith(".js")) {
    rewrite(join(appChunks, name), [["/studio-poster.png", "./studio-poster.png"]]);
  }
}

const cssRoot = join(target, "_next", "static", "css");
for (const name of readdirSync(cssRoot)) {
  if (name.endsWith(".css")) {
    rewrite(join(cssRoot, name), [["/_next/static/media/", "../media/"]]);
  }
}

console.log("Prepared the real Video Analyzer static export at assets/embeds/video-analyzer/.");
