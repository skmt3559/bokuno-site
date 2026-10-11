// content/*.json と src/ から dist/ に静的サイトを書き出す。
//   node build.mjs           ビルドのみ
//   node build.mjs --serve   ローカル確認用サーバー（リクエストごとに再ビルド）
import { readFile, writeFile, mkdir, rm, cp, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
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

function validate(content, lenient) {
  const slugs = new Set();
  const complete = (shop) => shop.slug && shop.name && shop.prefecture;
  // 編集画面で入力途中の店舗は、プレビューでは出さずに待つ（公開時は下でエラーにする）
  if (lenient) content.shops = content.shops.filter(complete);
  for (const shop of content.shops) {
    if (!complete(shop)) {
      throw new Error(`店舗の「URL用の英字」「名前」「都道府県」は必須です (${shop.slug || shop.name || "未入力の店舗"})`);
    }
    if (!/^[a-z0-9-]+$/.test(shop.slug)) throw new Error(`店舗の「URL用の英字」は半角の小文字・数字・ハイフンだけにしてください (${shop.slug})`);
    if (slugs.has(shop.slug)) throw new Error(`店舗の「URL用の英字」が重複しています (${shop.slug})`);
    slugs.add(shop.slug);
    if (!content.site.prefectureOrder.includes(shop.prefecture)) {
      throw new Error(`「サイト共通 → 都道府県の並び順」に ${shop.prefecture} がありません (${shop.slug})`);
    }
  }
}

// outDir / base / noindex は、本番サーバーへ送るとき（deploy.mjs）や確認用の置き場に出すときに指定する
export async function build({ fresh = false, outDir = DIST, base = BASE, noindex = !!process.env.NOINDEX } = {}) {
  const DIST = outDir;
  const content = await loadContent();
  validate(content, fresh);
  const hidden = noindex || content.site.noindex;
  const templates = join(ROOT, "src", "templates.mjs");
  const { renderSite } = await import(pathToFileURL(templates).href + (fresh ? `?t=${Date.now()}` : ""));
  // CSS・JS は中身が変わるたびにURLの ?v= が変わり、古いものが残らないようにする
  const assetVersion = createHash("sha1").update(await readFile(join(ROOT, "src", "styles.css"))).update(await readFile(join(ROOT, "src", "site.js"))).digest("hex").slice(0, 8);
  const pages = renderSite(content, base, { noindex: hidden, assetVersion });

  // 検索エンジン向け。公開前（noindex）の間は全ページを載せない指定にする
  const origin = (content.site.url || "").replace(/\/$/, "");
  const urls = Object.keys(pages).filter((p) => p.endsWith("index.html")).map((p) => `${origin}/${p.replace(/index\.html$/, "")}`);
  pages["robots.txt"] = hidden ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
  if (!hidden && origin) {
    pages["sitemap.xml"] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`;
  }

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
  return Object.keys(pages).filter((p) => p.endsWith(".html")).length;
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
  ".xml": "application/xml; charset=utf-8",
  ".php": "text/plain; charset=utf-8",
  ".mp4": "video/mp4",
  ".gif": "image/gif",
};

async function serve(port) {
  const { createEditor } = await import("./editor/server.mjs");
  // ビルドは dist を作り直すので、同時に走らせず順番に行う。配信はビルドが終わるのを待つ
  let queue = Promise.resolve();
  const enqueue = (options) => (queue = queue.catch(() => {}).then(() => build(options)));
  const editor = createEditor({ root: ROOT, build: () => enqueue() });
  createServer(async (req, res) => {
    try {
      if (await editor(req, res)) return;
      let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length) || "/";
      if (path.includes("..")) throw new Error("bad path");
      if (path.endsWith("/")) path += "index.html";
      if (path.endsWith(".html")) await enqueue({ fresh: true });
      else await queue.catch(() => {});
      let file = join(DIST, normalize(path));
      if (!file.startsWith(DIST)) throw new Error("bad path");
      let status = 200;
      // 編集画面から入れたばかりの写真は、まだ dist に無いので public から直接返す
      if (!existsSync(file) && existsSync(join(ROOT, "public", normalize(path)))) file = join(ROOT, "public", normalize(path));
      if (!existsSync(file)) {
        file = join(DIST, "404.html");
        status = 404;
      }
      const body = await readFile(file);
      res.writeHead(status, { "content-type": MIME[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
      res.end(body);
    } catch (e) {
      if (res.headersSent) return res.end();
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(`ビルドエラー\n\n${e.stack || e.message}`);
    }
  }).listen(port, "127.0.0.1", () => console.log(`サイト: http://localhost:${port}${BASE}/\n編集画面: http://localhost:${port}/__editor/`));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const count = await build();
  console.log(`${count} ページを dist/ に書き出しました`);
  if (process.argv.includes("--serve")) await serve(Number(process.env.PORT) || 4321);
}
