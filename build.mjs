// content/*.json と src/ から dist/ に静的サイトを書き出す。
//   node build.mjs           ビルドのみ
//   node build.mjs --serve   ローカル確認用サーバー（リクエストごとに再ビルド）
import { readFile, writeFile, mkdir, rm, cp, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");
const BASE = (process.env.BASE_PATH || "").replace(/\/$/, "");

async function loadContent() {
  const dir = join(ROOT, "content");
  const content = {};
  for (const file of await readdir(dir)) {
    if (!file.endsWith(".json")) continue;
    try {
      content[file.replace(/\.json$/, "")] = JSON.parse(await readFile(join(dir, file), "utf8"));
    } catch (e) {
      throw new Error(`content/${file} を読み込めません: ${e.message}`);
    }
  }
  return content;
}

function validate(content) {
  const slugs = new Set();
  for (const shop of content.shops) {
    if (!shop.slug || !shop.name || !shop.prefecture) {
      throw new Error(`shops.json: slug / name / prefecture は必須です (${shop.slug || shop.name || "?"})`);
    }
    if (slugs.has(shop.slug)) throw new Error(`shops.json: slug が重複しています (${shop.slug})`);
    slugs.add(shop.slug);
    if (!content.site.prefectureOrder.includes(shop.prefecture)) {
      throw new Error(`site.json: prefectureOrder に ${shop.prefecture} がありません (${shop.slug})`);
    }
  }
}

export async function build({ fresh = false } = {}) {
  const content = await loadContent();
  validate(content);
  const templates = join(ROOT, "src", "templates.mjs");
  const { renderSite } = await import(pathToFileURL(templates).href + (fresh ? `?t=${Date.now()}` : ""));
  const pages = renderSite(content, BASE);

  await rm(DIST, { recursive: true, force: true });
  await mkdir(join(DIST, "assets"), { recursive: true });
  if (existsSync(join(ROOT, "public"))) await cp(join(ROOT, "public"), DIST, { recursive: true });
  await cp(join(ROOT, "src", "styles.css"), join(DIST, "assets", "styles.css"));
  await cp(join(ROOT, "src", "site.js"), join(DIST, "assets", "site.js"));
  for (const [path, html] of Object.entries(pages)) {
    const out = join(DIST, path);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, html);
  }
  return Object.keys(pages).length;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function serve(port) {
  createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length) || "/";
      if (path.endsWith("/")) path += "index.html";
      if (path.endsWith(".html")) await build({ fresh: true });
      let file = join(DIST, normalize(path));
      if (!file.startsWith(DIST)) throw new Error("bad path");
      let status = 200;
      if (!existsSync(file)) {
        file = join(DIST, "404.html");
        status = 404;
      }
      res.writeHead(status, { "content-type": MIME[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
      res.end(await readFile(file));
    } catch (e) {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(`ビルドエラー\n\n${e.stack || e.message}`);
    }
  }).listen(port, () => console.log(`http://localhost:${port}${BASE}/`));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const count = await build();
  console.log(`${count} ページを dist/ に書き出しました`);
  if (process.argv.includes("--serve")) serve(Number(process.env.PORT) || 4321);
}
