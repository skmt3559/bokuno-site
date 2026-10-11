// サイトを組み立てて、本番サーバー（ロリポップ）へ送る。
//   node deploy.mjs                              deploy.config.json の場所へ
//   node deploy.mjs --dir=bokuno-new --base=/bokuno-new --noindex   確認用の置き場へ
import { execFile } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { build } from "./build.mjs";

const run = promisify(execFile);
const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, ".deploy");

export async function deploy(overrides = {}) {
  const config = { ...JSON.parse(readFileSync(join(ROOT, "deploy.config.json"), "utf8")), ...overrides };
  const { host, dir, base = "", noindex = false } = config;
  if (!/^[a-zA-Z0-9._-]+$/.test(dir)) throw new Error(`送り先のフォルダ名が正しくありません: ${dir}`);
  const target = `web/${dir}`;

  // 開発用の dist とは別の場所に組み立てる（プレビューの作り直しと重ならないように）
  const pages = await build({ outDir: OUT, base, noindex });
  if (pages < 20 || !existsSync(join(OUT, "index.html")) || !readdirSync(join(OUT, "shoplist")).length) {
    throw new Error("組み立てたサイトの中身が足りないため、送信を中止しました。");
  }

  // WordPress が入っているフォルダには絶対に上書きしない
  const check = await run("ssh", [host, `mkdir -p ${target} && if [ -e ${target}/wp-config.php ] || [ -d ${target}/wp-admin ]; then echo WORDPRESS; else echo OK; fi`]);
  if (!check.stdout.includes("OK")) throw new Error(`${target} には WordPress があるため、送信を中止しました。`);

  // ロリポップは接続が途中で切られることがあるので、続きから数回やり直す（rsync は送り済みの分を飛ばす）
  for (let attempt = 1; ; attempt++) {
    try {
      await run("rsync", ["-rt", "--delete", "--exclude=.well-known", "--exclude=wp-content", "-e", "ssh -o ServerAliveInterval=15", `${OUT}/`, `${host}:${target}/`], { maxBuffer: 20 * 1024 * 1024 });
      break;
    } catch (e) {
      if (attempt >= 4) throw new Error(`サーバーへの送信に失敗しました。\n${String(e.stderr || e.message).trim().split("\n").slice(-2).join("\n")}`);
      await new Promise((r) => setTimeout(r, 15000));
    }
  }
  // ロリポップで表示・実行できる権限に揃える（wp-content は旧サイトの画像置き場なので触らない）
  await run("ssh", [host, `cd ${target} && find . -path ./wp-content -prune -o -type d -exec chmod 755 {} + && find . -path ./wp-content -prune -o -type f -exec chmod 644 {} +`]);
  return { pages, target };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
  const overrides = {};
  if (arg("dir")) overrides.dir = arg("dir");
  if (arg("base")) overrides.base = arg("base");
  if (process.argv.includes("--noindex")) overrides.noindex = true;
  const { pages, target } = await deploy(overrides);
  console.log(`${pages} ページを ${target} に送りました`);
}
