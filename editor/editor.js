// 編集画面。content/*.json をフォームにして、右のプレビューにすぐ反映する。
const SITE_URL = "https://bokuno-tuyatuya.com/";

const FILES = [
  { name: "home", label: "トップ", path: "/" },
  { name: "kaizen", label: "髪質改善", path: "/kaizen/" },
  { name: "service", label: "サービス", path: "/service/" },
  { name: "shops", label: "店舗", path: "/shoplist/" },
  { name: "recruit", label: "求人採用", path: "/recruit/" },
  { name: "company", label: "会社概要", path: "/company/" },
  { name: "contact", label: "お問い合わせ", path: "/inquiry/" },
  { name: "site", label: "サイト共通", path: "/" },
];

const SECTIONS = {
  "home.title": "ページのタイトル（ブラウザのタブに出る文字）",
  "home.hero": "いちばん上（動画と見出し）",
  "home.intro": "コンセプト",
  "home.commitments": "こだわり",
  "home.services": "サービス紹介",
  "home.shops": "店舗紹介",
  "home.recruit": "求人紹介",
  "home.faq": "よくあるご質問",
  "kaizen.lead": "冒頭",
  "kaizen.commitments": "こだわり",
  "kaizen.results": "ビフォー＆アフター",
  "kaizen.flow": "施術の流れ",
  "service.lead": "冒頭の文章",
  "service.categories": "施術メニュー",
  "service.courses": "コース",
  "service.payment": "お支払い",
  "recruit.lead": "冒頭のメッセージ",
  "recruit.conditions": "募集内容（求人採用ページと、標準の要項を使わない店舗）",
  "recruit.conditionsStandard": "標準の募集要項（店舗別の求人ページ）",
  "recruit.story": "読み物（Vision / Work Style）",
  "recruit.shops": "募集中の店舗（説明文）",
  "recruit.apply": "応募ボタン",
  "recruit.shopPage": "店舗別の求人ページ",
  "company.rows": "会社情報",
  "company.areas": "店舗エリア",
  "contact.fields": "入力項目",
  "site.nav": "メニュー",
  "site.shoplist": "店舗一覧ページ（タイトルと説明文）",
  "site.ogImage": "SNSで共有されたときの画像（既定）",
  "site.url": "サイトのURL",
  "recruit.postedDate": "求人の掲載日（Googleの求人検索向け）",
  "recruit.seoTitle": "検索結果に出るタイトル",
  "site.reserveCta": "予約の案内（各ページ下部）",
  "site.prefectureOrder": "都道府県の並び順",
};

const LABELS = {
  title: "タイトル", en: "英字ラベル", description: "検索結果に出る説明文", heading: "見出し", text: "本文", lead: "リード文",
  image: "写真", images: "写真", video: "動画", logo: "ロゴ", eyebrow: "見出しの上の小さな文字", link: "ボタン", label: "ラベル", href: "リンク先",
  items: "項目", note: "注記", notes: "注記", steps: "ステップ", voice: "お客様の声", gallery: "事例集", beforeAfter: "ビフォー／アフター",
  before: "ビフォー", after: "アフター", contents: "内容", price: "料金", priceNote: "料金の注記", rows: "項目", value: "内容",
  paragraphs: "段落", intro: "導入文", closing: "結びの一文", voices: "声", statement: "強調する言葉", sub: "補足", button: "ボタンの文字",
  url: "リンク先URL", q: "質問", a: "答え", name: "名前", fullName: "正式名称", tagline: "ロゴ下の文字", noindex: "検索エンジンに載せない",
  instagram: "Instagram のURL", slug: "URL用の英字", listName: "一覧での短い名前", prefecture: "都道府県", opened: "オープン時期",
  reserveUrl: "予約ページのURL", tel: "電話", address: "住所", access: "アクセス", seats: "席数", hours: "営業時間", closed: "定休日",
  mapEmbed: "Googleマップの埋め込みURL", recruiting: "求人を募集中", points: "この店舗のこだわり", notice: "注意書き", fields: "入力項目",
  submitLabel: "送信ボタンの文字", disabledNote: "送信できない旨の案内", placeholder: "入力例", required: "必須", leadTemplate: "紹介文",
  groups: "区分", recruitStandard: "標準の募集要項を使う",
  enabled: "フォームから送信できるようにする", sendingLabel: "送信中のボタンの文字", successMessage: "送信できたときの案内", errorMessage: "送信できなかったときの案内",
  seoTitle: "検索結果に出るタイトル", seoDescription: "検索結果に出る説明文", ogImage: "SNSで共有されたときの画像", postedDate: "求人の掲載日",
  shoplist: "店舗一覧ページ",
  applyButton: "応募ボタンを付ける",
  qr: "QRコードの画像", qrNote: "QRコードの説明",
  workplaceHeading: "勤務店舗の見出し", conditionsHeading: "募集内容の見出し", conditionsNote: "募集内容の注記",
};

const NOTES = {
  slug: "店舗ページのURLになります。半角英数字とハイフンのみ。公開後は変えないでください。",
  mapEmbed: "Googleマップの「共有 → 地図を埋め込む」に出てくる src のURLです。",
  recruiting: "オフにすると、この店舗の求人ページがなくなります。",
  recruitStandard: "オンの店舗は「求人採用 → 標準の募集要項」を表示します。オフの店舗は「求人採用 → 募集内容」を表示します。",
  noindex: "オンにすると、検索エンジンに載らなくなります。通常はオフです。",
  leadTemplate: "{name} の部分は店舗名に置き換わります。",
  postedDate: "2026-10-12 の形で入力します。募集内容を大きく変えたときに更新します。",
  seoDescription: "Googleの検索結果で、タイトルの下に出る文章です（120字前後が目安）。",
  prefecture: "新しい都道府県は「サイト共通 → 都道府県の並び順」にも追加してください。",
};

const HIDDEN = [/^contact\.fields\.\d+\.(name|type)$/, /^site\.nav\.\d+\.href$/, /\.link\.href$/];
const URL_KEYS = new Set(["reserveUrl", "mapEmbed", "url", "instagram", "href"]);
const SINGLE_LINE = new Set(["slug", "tel", "prefecture", "opened", "seats", "en", "label", "listName", "button", "submitLabel", "name"]);
const NEW_ITEM = { points: { title: "", text: "" }, notes: "", paragraphs: "", voices: "", images: "", prefectureOrder: "" };

const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children.filter((c) => c != null));
  return node;
};
const norm = (s) => String(s).replace(/\*\*/g, "").replace(/\s+/g, "");
const isMedia = (key, value) => ["image", "logo", "video", "qr", "ogImage"].includes(key) || /^\/(images|videos)\//.test(value);

const state = { files: {}, current: "home", device: "mobile", timers: {}, pending: new Set() };
const preview = $("preview");

// ---- サーバーとのやりとり ----

async function api(method, path, body, headers = {}) {
  const res = await fetch(`api/${path}`, { method, body, headers: { "x-bokuno-editor": "1", ...headers } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `エラー (${res.status})`);
  return data;
}

function toast(message, { error = false, html = false, keep = false } = {}) {
  const t = $("toast");
  t[html ? "innerHTML" : "textContent"] = message;
  t.classList.toggle("is-error", error);
  t.hidden = false;
  clearTimeout(toast.timer);
  if (!keep) toast.timer = setTimeout(() => (t.hidden = true), error ? 8000 : 4000);
}

function setSaveState(text, error = false) {
  $("save-state").textContent = text;
  $("save-state").classList.toggle("is-error", error);
}

function scheduleSave(name = state.current) {
  state.pending.add(name);
  setSaveState("保存中…");
  clearTimeout(state.timers[name]);
  state.timers[name] = setTimeout(() => save(name), 500);
}

async function save(name) {
  clearTimeout(state.timers[name]);
  if (!state.pending.has(name)) return;
  state.pending.delete(name);
  try {
    await api("PUT", `content/${name}`, JSON.stringify(state.files[name]), { "content-type": "application/json" });
    setSaveState("保存しました");
    reloadPreview();
    refreshStatus();
  } catch (e) {
    state.pending.add(name);
    setSaveState("保存できませんでした", true);
    toast(e.message, { error: true });
  }
}

const flush = () => Promise.all([...state.pending].map(save));

async function refreshStatus() {
  try {
    const s = await api("GET", "status");
    const count = s.changes.length;
    $("publish").disabled = !(count || s.unpushed);
    $("publish").textContent = count ? `公開する（変更 ${count}件）` : s.unpushed ? "公開する（未公開あり）" : "公開する";
    $("discard").hidden = !count;
  } catch {}
}

// ---- データの読み書き ----

const getAt = (path, root = state.files[state.current]) => path.reduce((o, k) => (o == null ? o : o[k]), root);
function setAt(path, value) {
  const parent = getAt(path.slice(0, -1));
  parent[path.at(-1)] = value;
  scheduleSave();
}

const blankLike = (v) =>
  Array.isArray(v) ? [] : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)])) : typeof v === "boolean" ? v : "";

const itemTitle = (item, i) =>
  typeof item === "string" ? item.split("\n")[0] || `（${i + 1}つ目・未入力）` : item.listName || item.name || item.title || item.heading || item.label || item.q || `${i + 1}つ目`;

// ---- フォーム ----

function autosize(t) {
  if (t.tagName !== "TEXTAREA" || !t.offsetParent) return;
  t.style.height = "auto";
  t.style.height = `${t.scrollHeight + 2}px`;
}
const autosizeIn = (root) => root.querySelectorAll("textarea").forEach(autosize);

function renderForm() {
  const name = state.current;
  const root = state.files[name];
  const form = $("form");
  form.replaceChildren();
  if (Array.isArray(root)) {
    form.append(el("p", { className: "hint", textContent: `全${root.length}店舗。店舗を開くと右の画面もその店舗のページに切り替わります。` }), renderList(root, []));
  } else {
    for (const key of Object.keys(root)) {
      const value = root[key];
      const label = SECTIONS[`${name}.${key}`] || LABELS[key] || key;
      const card = el("details", { className: "card", open: true }, el("summary", { textContent: label }));
      const body = el("div", { className: "card__body" });
      body.append(typeof value === "object" && value !== null ? renderValue(value, [key], key, true) : renderValue(value, [key], key));
      card.append(body);
      form.append(card);
    }
  }
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("is-on", b.dataset.name === name));
  $("search").value = "";
  requestAnimationFrame(() => autosizeIn(form));
}

function renderValue(value, path, key, bare = false) {
  if (HIDDEN.some((re) => re.test(`${state.current}.${path.join(".")}`))) return null;
  if (Array.isArray(value)) return renderList(value, path, bare);
  if (value && typeof value === "object") return renderObject(value, path, bare ? null : LABELS[key] || key);
  if (typeof value === "boolean") return renderToggle(value, path, key);
  return isMedia(key, value) || (key === "images" || path.at(-2) === "images") ? renderMedia(value, path, key) : renderText(value, path, key);
}

function renderObject(obj, path, label, siblings = []) {
  const box = el("div", { className: label ? "group" : "" });
  if (label) box.append(el("p", { className: "group__label", textContent: label }));
  // 同じ並びのほかの項目にある欄（例：一部の店舗だけにある「こだわり」）も、空欄として出す
  const keys = [...new Set([...Object.keys(obj), ...siblings.flatMap((s) => (s && typeof s === "object" ? Object.keys(s) : []))])];
  for (const key of keys) {
    let value = obj[key];
    if (value === undefined) {
      const sample = siblings.find((s) => s && s[key] !== undefined)[key];
      value = blankLike(sample);
      if (typeof value === "object") obj[key] = value;
    }
    const child = renderValue(value, [...path, key], key);
    if (child) box.append(child);
  }
  return box;
}

function fieldWrap(path, key, ...children) {
  const wrap = el("div", { className: "field" }, ...children);
  wrap.dataset.path = path.join(".");
  if (NOTES[key]) wrap.append(el("p", { className: "field__note", textContent: NOTES[key] }));
  return wrap;
}

function renderText(value, path, key) {
  const id = `f-${path.join("-")}`;
  const inList = typeof path.at(-1) === "number";
  const single = SINGLE_LINE.has(key) || URL_KEYS.has(key);
  const input = single ? el("input", { type: URL_KEYS.has(key) ? "url" : "text", id, value }) : el("textarea", { id, value, rows: 1 });
  input.addEventListener("input", () => {
    autosize(input);
    setAt(path, input.value);
    input.closest(".item")?.dispatchEvent(new CustomEvent("retitle"));
  });
  input.addEventListener("focus", () => showInPreview(input.value));
  const label = el("label", { htmlFor: id, textContent: inList ? `${path.at(-1) + 1}` : LABELS[key] || key });
  return fieldWrap(path, key, label, input);
}

function renderToggle(value, path, key) {
  const input = el("input", { type: "checkbox", checked: value });
  input.addEventListener("change", () => setAt(path, input.checked));
  return fieldWrap(path, key, el("label", { className: "toggle" }, input, LABELS[key] || key));
}

function renderMedia(value, path, key) {
  const isVideo = key === "video" || /\.mp4$/.test(value);
  const thumb = el("div", { className: "image__thumb" });
  const pathText = el("p", { className: "image__path" });
  const file = el("input", { type: "file", accept: isVideo ? "video/mp4" : "image/jpeg,image/png,image/webp,image/gif", hidden: true });
  const pick = el("button", { type: "button", className: "btn btn--small", textContent: isVideo ? "動画を選ぶ" : "写真を選ぶ" });
  const clear = el("button", { type: "button", className: "btn btn--small btn--danger", textContent: "外す" });
  const box = el("div", { className: "image" }, thumb, el("div", { className: "image__side" }, pathText, el("div", { className: "image__buttons" }, pick, clear, file)));
  const show = (v) => {
    thumb.replaceChildren();
    thumb.style.backgroundImage = "";
    if (!v) thumb.textContent = "なし";
    else if (/\.mp4$/.test(v)) thumb.append(el("video", { src: v, muted: true, preload: "metadata" }));
    else thumb.style.backgroundImage = `url("${v}")`;
    pathText.textContent = v || (isVideo ? "動画は設定されていません" : "写真は設定されていません（仮の色面になります）");
    clear.hidden = !v;
  };
  const upload = async (f) => {
    if (!f) return;
    pathText.textContent = "アップロード中…";
    try {
      const saved = await uploadFile(f);
      show(saved);
      setAt(path, saved);
    } catch (e) {
      show(getAt(path));
      toast(e.message, { error: true });
    }
  };
  pick.addEventListener("click", () => file.click());
  file.addEventListener("change", () => upload(file.files[0]));
  clear.addEventListener("click", () => (show(""), setAt(path, "")));
  thumb.addEventListener("click", () => showInPreview(getAt(path), true));
  show(value);
  const label = typeof path.at(-1) === "number" ? `${path.at(-1) + 1}枚目` : LABELS[key] || key;
  const field = fieldWrap(path, key, el("span", { className: "field__label", textContent: label }), box);
  field.addEventListener("dragover", (e) => hasFiles(e) && (e.preventDefault(), e.stopPropagation(), box.classList.add("is-over")));
  field.addEventListener("dragleave", () => box.classList.remove("is-over"));
  field.addEventListener("drop", (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.stopPropagation();
    box.classList.remove("is-over");
    const f = droppedFiles(e)[0];
    f ? upload(f) : toast("この種類のファイルは使えません（jpg / png / webp / gif / mp4）", { error: true });
  });
  return field;
}

async function uploadFile(f) {
  const { blob, name } = await prepare(f);
  return (await api("POST", `upload?name=${encodeURIComponent(name)}`, blob)).path;
}
const droppedFiles = (e) => [...(e.dataTransfer?.files || [])].filter((f) => /^(image\/(jpeg|png|webp|gif)|video\/mp4)$/.test(f.type));
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes("Files");

// 大きな写真は、表示に十分な大きさ（長辺2000px）のJPEGに縮めてから送る
async function prepare(f) {
  if (!/^image\/(jpeg|png|webp)$/.test(f.type) || (f.type === "image/png" && f.size < 1.5e6)) return { blob: f, name: f.name };
  const bitmap = await createImageBitmap(f, { imageOrientation: "from-image" });
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && f.type === "image/jpeg" && f.size < 1.5e6) return { blob: f, name: f.name };
  const canvas = Object.assign(document.createElement("canvas"), { width: Math.round(bitmap.width * scale), height: Math.round(bitmap.height * scale) });
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.86));
  return { blob, name: f.name.replace(/\.[^.]+$/, "") + ".jpg" };
}

function renderList(list, path, bare = false) {
  const key = path.at(-1);
  const wrap = el("div", { className: "list" });
  if (!bare && path.length) wrap.append(el("p", { className: "group__label", textContent: LABELS[key] || key }));
  const simple = list.every((v) => typeof v === "string");
  const rerender = () => (wrap.replaceWith(renderList(list, path, bare)), requestAnimationFrame(() => autosizeIn($("form"))));
  const changed = () => (scheduleSave(), rerender());

  list.forEach((item, i) => {
    const tools = el("span", { className: "item__tools" });
    const tool = (text, title, disabled, fn) => {
      const b = el("button", { type: "button", textContent: text, title, disabled });
      b.setAttribute("aria-label", title);
      b.addEventListener("click", (e) => (e.preventDefault(), e.stopPropagation(), fn()));
      tools.append(b);
    };
    tool("↑", "上へ", i === 0, () => (list.splice(i - 1, 0, list.splice(i, 1)[0]), changed()));
    tool("↓", "下へ", i === list.length - 1, () => (list.splice(i + 1, 0, list.splice(i, 1)[0]), changed()));
    tool("✕", "削除", false, () => confirm(`「${itemTitle(item, i)}」を削除しますか？`) && (list.splice(i, 1), changed()));

    if (simple) {
      const field = renderValue(item, [...path, i], key);
      field.append(tools);
      field.style.cssText = "display:grid;grid-template-columns:1fr auto;gap:4px 8px;align-items:start";
      field.querySelector("label, .field__label").style.gridColumn = "1 / -1";
      wrap.append(field);
      return;
    }
    const title = el("span", { className: "item__title", textContent: itemTitle(item, i) });
    const summary = el("summary", {}, title);
    if (item.recruiting === true) summary.append(el("span", { className: "badge", textContent: "求人募集中" }));
    summary.append(tools);
    const body = el("div", { className: "item__body" }, renderObject(item, [...path, i], null, list));
    const details = el("details", { className: "item" }, summary, body);
    details.dataset.path = [...path, i].join(".");
    details.addEventListener("retitle", () => (title.textContent = itemTitle(item, i)));
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      autosizeIn(details);
      if (state.current === "shops" && path.length === 0 && item.slug && Date.now() > (state.quietUntil || 0)) navigate(`/shoplist/${item.slug}/`);
    });
    wrap.append(details);
  });

  if (key === "images") {
    const picker = el("input", { type: "file", accept: "image/jpeg,image/png,image/webp,image/gif", multiple: true, hidden: true });
    const zone = el("button", { type: "button", className: "dropzone", textContent: "＋ 写真を追加（ここにドラッグ＆ドロップ、またはクリックして選ぶ・複数可）" });
    const addFiles = async (files) => {
      if (!files.length) return;
      zone.textContent = `アップロード中…（${files.length}枚）`;
      try {
        for (const f of files) list.push(await uploadFile(f));
      } catch (e) {
        toast(e.message, { error: true });
      }
      changed();
    };
    zone.addEventListener("click", () => picker.click());
    picker.addEventListener("change", () => addFiles([...picker.files]));
    wrap.addEventListener("dragover", (e) => hasFiles(e) && (e.preventDefault(), zone.classList.add("is-over")));
    wrap.addEventListener("dragleave", () => zone.classList.remove("is-over"));
    wrap.addEventListener("drop", (e) => hasFiles(e) && (e.preventDefault(), zone.classList.remove("is-over"), addFiles(droppedFiles(e).filter((f) => f.type.startsWith("image/")))));
    wrap.append(zone, picker);
    return wrap;
  }

  const add = el("button", { type: "button", className: "btn btn--small list__add", textContent: state.current === "shops" && !path.length ? "＋ 店舗を追加" : "＋ 追加" });
  add.addEventListener("click", () => {
    list.push(list.length ? blankLike(list.at(-1)) : structuredClone(NEW_ITEM[key] ?? ""));
    scheduleSave();
    const fresh = renderList(list, path, bare);
    wrap.replaceWith(fresh);
    const last = fresh.querySelector(":scope > .item:last-of-type, :scope > .field:last-of-type");
    if (last?.tagName === "DETAILS") last.open = true;
    last?.scrollIntoView({ block: "center" });
    last?.querySelector("input, textarea")?.focus();
  });
  wrap.append(add);
  return wrap;
}

function focusField(file, path) {
  if (file !== state.current) {
    state.current = file;
    renderForm();
  }
  const target = [...$("form").querySelectorAll("[data-path]")].find((n) => n.dataset.path === path.join("."));
  if (!target) return;
  for (let d = target.closest("details"); d; d = d.parentElement.closest("details")) d.open = true;
  autosizeIn($("form"));
  target.scrollIntoView({ block: "center" });
  target.querySelector("textarea, input:not([type=file]):not([hidden])")?.focus({ preventScroll: true });
  target.classList.remove("is-flash");
  void target.offsetWidth;
  target.classList.add("is-flash");
}

$("search").addEventListener("input", () => {
  const q = norm($("search").value);
  const form = $("form");
  form.querySelectorAll(".field").forEach((f) => {
    const v = f.querySelector("textarea, input[type=text], input[type=url]")?.value ?? "";
    f.classList.toggle("is-filtered-out", !!q && !norm(v).includes(q));
  });
  form.querySelectorAll(".item, .group, .card").forEach((c) => {
    c.classList.toggle("is-filtered-out", !!q && !c.querySelector(".field:not(.is-filtered-out)"));
    if (q && c.tagName === "DETAILS") c.open = true;
  });
  autosizeIn(form);
});

// ---- プレビュー ----

function navigate(path) {
  if (preview.contentWindow?.location.pathname !== path) preview.src = path;
}

let reloadTimer;
function reloadPreview() {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    const win = preview.contentWindow;
    state.scroll = { path: win.location.pathname, y: win.scrollY };
    win.location.reload();
  }, 150);
}

function fitPreview() {
  const stage = $("stage");
  const desktop = state.device === "desktop";
  stage.classList.toggle("is-desktop", desktop);
  const w = desktop ? 1280 : 390;
  const availW = stage.clientWidth - 28;
  const availH = stage.clientHeight - 28;
  const scale = Math.min(1, availW / w);
  preview.style.width = `${w}px`;
  preview.style.height = `${availH / scale}px`;
  preview.style.transform = scale < 1 ? `scale(${scale})` : "";
}
new ResizeObserver(fitPreview).observe($("stage"));
document.querySelectorAll("[data-device]").forEach((b) =>
  b.addEventListener("click", () => {
    state.device = b.dataset.device;
    document.querySelectorAll("[data-device]").forEach((x) => x.classList.toggle("is-on", x === b));
    fitPreview();
  })
);

const fileForPath = (p) =>
  p === "/" ? "home" : p.startsWith("/shoplist/") ? "shops" : (FILES.find((f) => f.path !== "/" && p.startsWith(f.path)) || {}).name;

preview.addEventListener("load", () => {
  const win = preview.contentWindow;
  const doc = win.document;
  const path = win.location.pathname;
  $("preview-path").textContent = path;
  $("preview-open").href = path;
  if (doc.body.textContent.startsWith("ビルドエラー")) return toast("内容に誤りがあり、ページを作れません。\n" + doc.body.textContent.split("\n")[2], { error: true });
  if (state.scroll?.path === path) win.scrollTo(0, state.scroll.y);
  state.scroll = null;

  // プレビュー内でページを移動したら、左の編集対象も合わせる
  const file = fileForPath(path);
  const onSharedPage = state.current === "site" && path === "/";
  if (file && file !== state.current && !onSharedPage) {
    state.current = file;
    renderForm();
  }
  const slug = path.match(/^\/shoplist\/([^/]+)\/$/)?.[1];
  if (slug && state.current === "shops") {
    const i = state.files.shops.findIndex((s) => s.slug === slug);
    const item = $("form").querySelector(`.item[data-path="${i}"]`);
    if (item && !item.open) {
      state.quietUntil = Date.now() + 500; // 自分で開いた分でプレビューを動かし直さない
      item.open = true;
      item.scrollIntoView({ block: "start" });
    }
  }

  // 右の画面の写真に、ファイルを直接ドロップして差し替える
  let over;
  const mark = (node) => {
    if (over === node) return;
    if (over) over.style.outline = over.style.outlineOffset = "";
    over = node;
    if (over) (over.style.outline = "4px dashed rgba(151,128,95,.9)"), (over.style.outlineOffset = "-4px");
  };
  doc.addEventListener("dragover", (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    mark(e.target.closest?.(".photo") || (e.target.matches?.("img, video") ? e.target : null));
  });
  doc.addEventListener("dragleave", (e) => e.relatedTarget || mark(null));
  doc.addEventListener("drop", async (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    const target = over;
    mark(null);
    document.body.classList.remove("is-dragging");
    const f = droppedFiles(e)[0];
    const hit = target && locate(target, path);
    if (!f) return toast("この種類のファイルは使えません（jpg / png / webp / gif / mp4）", { error: true });
    if (!hit) return toast("ここには直接ドロップできません。左の欄の写真のところにドロップしてください。", { error: true });
    toast("アップロード中…", { keep: true });
    try {
      const saved = await uploadFile(f);
      hit.path.slice(0, -1).reduce((o, k) => o[k], state.files[hit.file])[hit.path.at(-1)] = saved;
      scheduleSave(hit.file);
      if (hit.file === state.current) renderForm();
      focusField(hit.file, hit.path);
      toast("写真を差し替えました。");
    } catch (err) {
      toast(err.message, { error: true });
    }
  });

  doc.addEventListener(
    "click",
    (e) => {
      const link = e.target.closest("a");
      if (link && (link.target === "_blank" || link.origin !== location.origin)) return e.preventDefault(), toast("外部へのリンクは編集画面では開きません。");
      if (link && link.getAttribute("href")?.startsWith("#")) return;
      // メニューやボタンは、押したらそのページへ移動する（文字の編集は左のフォームから）
      if (link && (link.classList.contains("btn") || !link.closest("main"))) return;
      const hit = locate(e.target, path);
      if (!hit) return;
      if (link) e.preventDefault();
      focusField(hit.file, hit.path);
    },
    true
  );
});

// プレビューでクリックされた場所に対応する編集欄を探す
function locate(target, pagePath) {
  const media = target.closest(".photo")?.querySelector("img, video") || (target.matches("img, video") ? target : null);
  const leaves = [];
  const walk = (file, v, path) => {
    if (typeof v === "string") v && leaves.push({ file, path, value: v });
    else if (v && typeof v === "object") for (const k of Object.keys(v)) walk(file, v[k], [...path, Array.isArray(v) ? Number(k) : k]);
  };
  // いま開いているページのデータを優先し、なければほかのデータも探す
  const slug = pagePath.match(/^\/(?:shoplist|recruit)\/([^/]+)\/$/)?.[1];
  const shopIndex = slug ? state.files.shops.findIndex((s) => s.slug === slug) : -1;
  if (shopIndex >= 0) walk("shops", state.files.shops[shopIndex], [shopIndex]);
  const pageFile = fileForPath(pagePath);
  for (const name of [pageFile, state.current, ...FILES.map((f) => f.name)]) if (name && state.files[name]) walk(name, state.files[name], []);

  if (media) {
    const src = new URL(media.currentSrc || media.src, location.origin).pathname;
    return leaves.find((l) => l.value === src);
  }
  for (let node = target, depth = 0; node && depth < 4 && node.tagName !== "BODY"; node = node.parentElement, depth++) {
    const text = norm(node.textContent);
    if (!text) continue;
    const exact = leaves.find((l) => norm(l.value) === text);
    if (exact) return exact;
    if (text.length >= 4) {
      const within = leaves.find((l) => norm(l.value).includes(text));
      if (within) return within;
    }
  }
  return null;
}

// 編集欄にカーソルを置いたら、プレビューの該当箇所を見せる
function showInPreview(value, isMediaValue = false) {
  const doc = preview.contentDocument;
  if (!doc || !value) return;
  let found;
  if (isMediaValue || /^\/(images|videos)\//.test(value)) {
    found = [...doc.querySelectorAll("img, video")].find((m) => new URL(m.currentSrc || m.src, location.origin).pathname === value)?.closest(".photo, a, p");
  } else {
    const needle = norm(value).slice(0, 40);
    if (needle.length < 2) return;
    for (const node of doc.querySelectorAll("main *, .site-footer *, .site-header *")) {
      if (node.children.length > 3 || !norm(node.textContent).includes(needle)) continue;
      if (!found || node.textContent.length <= found.textContent.length) found = node;
    }
  }
  if (!found) return;
  found.scrollIntoView({ block: "center", behavior: "smooth" });
  const old = found.style.cssText;
  found.style.outline = "3px solid rgba(151,128,95,.8)";
  found.style.outlineOffset = "4px";
  setTimeout(() => (found.style.cssText = old), 1400);
}

// ---- 公開・取り消し ----

$("publish").addEventListener("click", async () => {
  if (!confirm("いまの内容をサイトに公開します。よろしいですか？")) return;
  $("publish").disabled = true;
  toast("公開しています…", { keep: true });
  try {
    await flush();
    const r = await api("POST", "publish");
    const link = r.url || SITE_URL;
    toast(r.published ? `公開しました。${r.deployed ? "サイトに反映されています。" : "1〜2分で反映されます。"}<br><a href="${link}" target="_blank" rel="noopener">${link}</a>` : "公開する変更はありませんでした。", { html: true });
  } catch (e) {
    toast("公開できませんでした。\n" + e.message, { error: true });
  }
  refreshStatus();
});

$("discard").addEventListener("click", async () => {
  if (!confirm("前回公開してからの文章・設定の変更をすべて取り消します。元に戻せません。よろしいですか？")) return;
  try {
    await flush();
    await api("POST", "discard");
    await load();
    toast("変更を取り消しました。");
  } catch (e) {
    toast(e.message, { error: true });
  }
});

let dragDepth = 0;
window.addEventListener("dragenter", (e) => hasFiles(e) && (dragDepth++, document.body.classList.add("is-dragging")));
window.addEventListener("dragleave", (e) => hasFiles(e) && --dragDepth <= 0 && ((dragDepth = 0), document.body.classList.remove("is-dragging")));
window.addEventListener("dragover", (e) => hasFiles(e) && e.preventDefault());
window.addEventListener("drop", (e) => {
  dragDepth = 0;
  document.body.classList.remove("is-dragging");
  if (hasFiles(e)) e.preventDefault();
});
document.addEventListener("toggle", (e) => e.target.open && autosizeIn(e.target), true);
window.addEventListener("beforeunload", (e) => state.pending.size && e.preventDefault());

// ---- 起動 ----

async function load() {
  state.files = (await api("GET", "content")).files;
  renderForm();
  setSaveState("変更は自動で保存されます");
  preview.getAttribute("src") ? reloadPreview() : navigate(FILES.find((f) => f.name === state.current).path);
  refreshStatus();
}

for (const f of FILES) {
  const b = el("button", { type: "button", textContent: f.label });
  b.dataset.name = f.name;
  b.addEventListener("click", () => {
    state.current = f.name;
    renderForm();
    $("form-pane").scrollTop = 0;
    navigate(f.path);
  });
  $("tabs").append(b);
}

load().catch((e) => (setSaveState("読み込めませんでした", true), toast(e.message, { error: true, keep: true })));
