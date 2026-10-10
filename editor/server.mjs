// 編集画面（/__editor/）のサーバー側。`node build.mjs --serve` のときだけ動き、公開されるサイトには含まれない。
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { extname, join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const PREFIX = "/__editor";
const STATIC = { "/": "index.html", "/editor.js": "editor.js", "/editor.css": "editor.css" };
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const UPLOAD_TYPES = { ".jpg": 15, ".jpeg": 15, ".png": 15, ".webp": 15, ".gif": 15, ".mp4": 60 }; // 上限 MB

export function createEditor({ root, build }) {
  const here = join(root, "editor");
  const contentDir = join(root, "content");
  const git = (...args) => run("git", args, { cwd: root, maxBuffer: 10 * 1024 * 1024 });

  const send = (res, status, body) => {
    res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    res.end(JSON.stringify(body));
  };

  const readBody = (req, limit) =>
    new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on("data", (c) => {
        size += c.length;
        if (size > limit) {
          reject(new Error("ファイルが大きすぎます"));
          req.destroy();
        } else chunks.push(c);
      });
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });

  // ほかのサイトを開いているブラウザから勝手に書き換えられないよう、この編集画面からの操作だけを受け付ける
  const trusted = (req) => {
    const host = req.headers.host || "";
    if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return false;
    if (req.headers.origin && req.headers.origin !== `http://${host}`) return false;
    return req.method === "GET" || req.headers["x-bokuno-editor"] === "1";
  };

  const contentNames = async () => (await readdir(contentDir)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));

  const status = async () => {
    const { stdout } = await git("status", "--porcelain", "--", "content", "public");
    const changes = stdout.split("\n").filter(Boolean).map((l) => l.slice(3));
    let unpushed = 0;
    try {
      unpushed = Number((await git("rev-list", "--count", "@{u}..HEAD")).stdout.trim()) || 0;
    } catch {}
    return { changes, unpushed };
  };

  const api = {
    "GET /api/content": async () => {
      const files = {};
      for (const name of await contentNames()) files[name] = JSON.parse(await readFile(join(contentDir, `${name}.json`), "utf8"));
      return { files };
    },
    "GET /api/status": status,
    "POST /api/upload": async (req, url) => {
      const original = url.searchParams.get("name") || "file";
      const ext = extname(original).toLowerCase();
      if (!UPLOAD_TYPES[ext]) throw new Error("この種類のファイルは使えません（jpg / png / webp / gif / mp4）");
      const data = await readBody(req, UPLOAD_TYPES[ext] * 1024 * 1024);
      const base = original.slice(0, -ext.length).normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "file";
      const folder = ext === ".mp4" ? "videos" : "images";
      const dir = join(root, "public", folder, "uploads");
      await mkdir(dir, { recursive: true });
      const name = `${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "")}-${base}${ext}`;
      await writeFile(join(dir, name), data);
      return { path: `/${folder}/uploads/${name}` };
    },
    "POST /api/discard": async () => {
      await git("checkout", "--", "content");
      return status();
    },
    "POST /api/publish": async () => {
      await build(); // 内容に誤りがあればここで止まり、公開しない
      await git("add", "-A", "--", "content", "public");
      const staged = (await git("diff", "--cached", "--name-only")).stdout.trim();
      if (staged) {
        const id = [];
        for (const [key, fallback] of [["user.name", "bokuno"], ["user.email", "bokuno@users.noreply.github.com"]]) {
          const set = await git("config", key).then((r) => r.stdout.trim(), () => "");
          if (!set) id.push("-c", `${key}=${fallback}`);
        }
        await git(...id, "commit", "-m", "サイト内容を更新（編集画面から）");
      }
      const before = await status();
      if (!staged && !before.unpushed) return { published: false, ...before };
      await git("push", "origin", "HEAD");
      return { published: true, ...(await status()) };
    },
  };

  return async function handle(req, res) {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === PREFIX) {
      res.writeHead(302, { location: `${PREFIX}/` });
      return res.end(), true;
    }
    if (!url.pathname.startsWith(`${PREFIX}/`)) return false;
    const path = url.pathname.slice(PREFIX.length);
    if (!trusted(req)) return send(res, 403, { error: "この操作は編集画面からのみ行えます" }), true;

    if (req.method === "GET" && STATIC[path]) {
      const file = join(here, STATIC[path]);
      res.writeHead(200, { "content-type": TYPES[extname(file)], "cache-control": "no-store" });
      return res.end(await readFile(file)), true;
    }
    try {
      const save = path.match(/^\/api\/content\/([a-z]+)$/);
      if (req.method === "PUT" && save) {
        const file = join(contentDir, `${save[1]}.json`);
        if (!existsSync(file)) throw new Error("そのデータはありません");
        const data = JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString("utf8"));
        await writeFile(file, JSON.stringify(data, null, 2) + "\n");
        return send(res, 200, { ok: true }), true;
      }
      const route = api[`${req.method} ${path}`];
      if (!route) return send(res, 404, { error: "not found" }), true;
      send(res, 200, await route(req, url));
    } catch (e) {
      send(res, 400, { error: String(e.stderr || e.message || e).trim() });
    }
    return true;
  };
}
