// ページの型。文章や店舗情報は content/*.json にあり、ここには書かない。

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const br = (s) => esc(s).replace(/\n/g, "<br>");
// **強調** と書いた部分にマーカーを引く
const rich = (s) => br(s).replace(/\*\*(.+?)\*\*/g, '<em class="mark">$1</em>');
const telHref = (tel) => `tel:${String(tel).replace(/[^0-9+]/g, "")}`;

export function renderSite(content, base = "") {
  const { site, home, kaizen, service, recruit, company, contact, shops } = content;
  const url = (path) => (/^(https?:|tel:|mailto:|#)/.test(path) ? path : base + path);
  const recruitingShops = shops.filter((s) => s.recruiting);
  const byPrefecture = (list) =>
    site.prefectureOrder
      .map((prefecture) => ({ prefecture, shops: list.filter((s) => s.prefecture === prefecture) }))
      .filter((g) => g.shops.length);

  // ---- 部品 ----

  const photo = (image, alt, cls = "") =>
    image
      ? `<div class="photo ${cls}"><img src="${esc(url(image))}" alt="${esc(alt)}" loading="lazy"></div>`
      : `<div class="photo photo--empty ${cls}" role="img" aria-label="${esc(alt)}（写真準備中）"><span>Photo</span></div>`;

  const logoMark = () =>
    site.logo
      ? `<img class="logo__img" src="${esc(url(site.logo))}" alt="${esc(site.fullName)}" width="240" height="117">`
      : `<span class="logo__mark">${esc(site.name)}</span><span class="logo__sub">${esc(site.tagline)}</span>`;

  const heading = (en, ja, tag = "h2") =>
    `<div class="heading"><p class="heading__en">${esc(en)}</p><${tag} class="heading__ja">${br(ja)}</${tag}></div>`;

  const button = (label, href, { variant = "line", external = false } = {}) =>
    `<a class="btn btn--${variant}" href="${esc(url(href))}"${external ? ' target="_blank" rel="noopener"' : ""}>${esc(label)}<span class="btn__arrow" aria-hidden="true"></span></a>`;

  const table = (rows) =>
    `<dl class="spec">${rows
      .filter((r) => r.value)
      .map((r) => `<div class="spec__row"><dt>${esc(r.label)}</dt><dd>${r.html || br(r.value)}</dd></div>`)
      .join("")}</dl>`;

  const breadcrumb = (trail) =>
    `<nav class="breadcrumb" aria-label="パンくずリスト"><ol><li><a href="${url("/")}">ホーム</a></li>${trail
      .map((t) => (t.href ? `<li><a href="${url(t.href)}">${esc(t.label)}</a></li>` : `<li aria-current="page">${esc(t.label)}</li>`))
      .join("")}</ol></nav>`;

  const pageHeader = (en, title, trail) =>
    `<header class="page-header"><div class="wrap">${breadcrumb(trail)}<p class="page-header__en">${esc(en)}</p><h1 class="page-header__title">${br(title)}</h1></div></header>`;

  const shopCard = (shop, { recruitLink = false } = {}) => {
    const href = recruitLink ? `/recruit/${shop.slug}/` : `/shoplist/${shop.slug}/`;
    return `<li class="shop-card"><a href="${url(href)}">
      ${photo(shop.image, shop.name, "shop-card__photo")}
      <div class="shop-card__body">
        <p class="shop-card__pref">${esc(shop.prefecture)}</p>
        <h3 class="shop-card__name">${esc(shop.listName || shop.name)}</h3>
        ${shop.address ? `<p class="shop-card__address">${esc(shop.address)}</p>` : ""}
        <p class="shop-card__more">${recruitLink ? "求人を見る" : "店舗詳細"}<span class="btn__arrow" aria-hidden="true"></span></p>
      </div></a></li>`;
  };

  const shopGroups = (list, opts) =>
    byPrefecture(list)
      .map(
        (g) => `<section class="shop-group" id="pref-${esc(g.prefecture)}">
        <h2 class="shop-group__title">${esc(g.prefecture)}<span>${g.shops.length}店舗</span></h2>
        <ul class="shop-grid">${g.shops.map((s) => shopCard(s, opts)).join("")}</ul></section>`
      )
      .join("");

  const prefNav = (list) =>
    `<ul class="chips">${byPrefecture(list)
      .map((g) => `<li><a href="#pref-${esc(g.prefecture)}">${esc(g.prefecture)}</a></li>`)
      .join("")}</ul>`;

  const reserveCta = () =>
    `<section class="cta"><div class="wrap cta__inner">${heading("Reservation", site.reserveCta.title)}
      <p class="cta__text">${br(site.reserveCta.text)}</p>${button(site.reserveCta.button, "/shoplist/", { variant: "solid" })}</div></section>`;

  const layout = ({ title, description, path, body, isHome = false }) => `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(isHome ? title : `${title}｜${site.fullName}`)}</title>
<meta name="description" content="${esc(description || site.description)}">
${site.noindex ? '<meta name="robots" content="noindex, nofollow">' : ""}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description || site.description)}">
<meta property="og:type" content="website">
<meta name="format-detection" content="telephone=no">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Noto+Sans+JP:wght@400;500&family=Shippori+Mincho:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${url("/assets/styles.css")}">
</head>
<body>
<a class="skip" href="#main">本文へ移動</a>
<header class="site-header" data-header>
  <div class="site-header__inner">
    <a class="logo" href="${url("/")}" aria-label="${esc(site.fullName)} ホーム">${logoMark()}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="global-nav" data-menu-btn><span class="menu-btn__bars" aria-hidden="true"></span><span class="menu-btn__label">Menu</span></button>
    <nav class="global-nav" id="global-nav" aria-label="メインメニュー" data-menu>
      <ul>${site.nav
        .map(
          (n) =>
            `<li><a href="${url(n.href)}"${path.startsWith(n.href) ? ' aria-current="true"' : ""}><span class="global-nav__en">${esc(n.en)}</span><span class="global-nav__ja">${esc(n.label)}</span></a></li>`
        )
        .join("")}</ul>
      <a class="btn btn--solid global-nav__reserve" href="${url("/shoplist/")}">店舗を探して予約する<span class="btn__arrow" aria-hidden="true"></span></a>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__top">
      <div>
        <p class="logo logo--footer">${logoMark()}</p>
        ${site.instagram ? `<p class="site-footer__sns"><a href="${esc(site.instagram)}" target="_blank" rel="noopener">Instagram</a></p>` : ""}
      </div>
      <ul class="site-footer__nav">${site.nav.map((n) => `<li><a href="${url(n.href)}">${esc(n.label)}</a></li>`).join("")}</ul>
    </div>
    <div class="site-footer__shops">${byPrefecture(shops)
      .map(
        (g) =>
          `<div><p>${esc(g.prefecture)}</p><ul>${g.shops
            .map((s) => `<li><a href="${url(`/shoplist/${s.slug}/`)}">${esc(s.listName || s.name)}</a></li>`)
            .join("")}</ul></div>`
      )
      .join("")}</div>
    <p class="site-footer__copy">&copy; ${esc(company.rows[0]?.value?.split("（")[0] || site.name)}</p>
  </div>
</footer>
<script src="${url("/assets/site.js")}" defer></script>
</body>
</html>
`;

  // ---- ページ ----

  const pages = {};

  pages["index.html"] = layout({
    title: home.title,
    path: "/",
    isHome: true,
    body: `
<section class="hero">
  <div class="hero__text">
    <p class="hero__eyebrow">${esc(home.hero.eyebrow)}</p>
    <h1 class="hero__heading">${br(home.hero.heading)}</h1>
    <p class="hero__lead">${br(home.hero.text)}</p>
    <div class="hero__actions">${button("店舗を探して予約する", "/shoplist/", { variant: "solid" })}${button(home.intro.link.label, home.intro.link.href)}</div>
  </div>
  ${
    home.hero.video
      ? `<div class="photo hero__photo"><video src="${esc(url(home.hero.video))}"${home.hero.image ? ` poster="${esc(url(home.hero.image))}"` : ""} autoplay muted loop playsinline preload="metadata" aria-label="サロンのイメージ動画"></video></div>`
      : photo(home.hero.image, "サロンのイメージ", "hero__photo")
  }
</section>

<section class="section">
  <div class="wrap wrap--narrow center">
    ${heading("Concept", home.intro.heading)}
    <p class="lead">${br(home.intro.text)}</p>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    ${heading("Commitment", home.commitments.heading)}
    <ul class="feature-grid">${home.commitments.items
      .map(
        (item, i) => `<li class="feature">${photo(item.image, item.title, "feature__photo")}
        <p class="feature__no">${String(i + 1).padStart(2, "0")}</p><h3 class="feature__title">${esc(item.title)}</h3><p>${br(item.text)}</p></li>`
      )
      .join("")}</ul>
    <p class="center">${button(home.intro.link.label, home.intro.link.href)}</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${heading("Service", home.services.heading)}
    <p class="lead center">${br(home.services.text)}</p>
    <ul class="service-list">${service.categories.items
      .map((c) => `<li><a href="${url("/service/")}"><span class="service-list__en">${esc(c.en)}</span><span class="service-list__ja">${esc(c.title)}</span></a></li>`)
      .join("")}</ul>
    <p class="center">${button(home.services.link.label, home.services.link.href)}</p>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    ${heading("Salon", home.shops.heading)}
    <p class="lead center">${br(home.shops.text)}</p>
    <div class="area-list">${byPrefecture(shops)
      .map(
        (g) => `<div class="area"><h3 class="area__title">${esc(g.prefecture)}</h3><ul>${g.shops
          .map((s) => `<li><a href="${url(`/shoplist/${s.slug}/`)}">${esc(s.listName || s.name)}</a></li>`)
          .join("")}</ul></div>`
      )
      .join("")}</div>
    <p class="center">${button(home.shops.link.label, home.shops.link.href)}</p>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    ${photo(home.recruit.image, "働くスタッフのイメージ", "split__photo")}
    <div class="split__text">
      ${heading("Recruit", home.recruit.heading)}
      <p>${br(home.recruit.text)}</p>
      ${button(home.recruit.link.label, home.recruit.link.href)}
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap wrap--narrow">
    ${heading("FAQ", home.faq.heading)}
    <dl class="faq">${home.faq.items.map((f) => `<div class="faq__item"><dt>${esc(f.q)}</dt><dd>${br(f.a)}</dd></div>`).join("")}</dl>
  </div>
</section>
${reserveCta()}`,
  });

  pages["kaizen/index.html"] = layout({
    title: kaizen.title,
    description: kaizen.description,
    path: "/kaizen/",
    body: `${pageHeader(kaizen.en, kaizen.title, [{ label: kaizen.title }])}
<section class="section">
  <div class="wrap split">
    <div class="split__text"><h2 class="statement">${br(kaizen.lead.heading)}</h2><p>${br(kaizen.lead.text)}</p></div>
    ${photo(kaizen.lead.image, "髪質改善のイメージ", "split__photo")}
  </div>
</section>
<section class="section section--tint">
  <div class="wrap">
    ${heading("Commitment", kaizen.commitments.heading)}
    <ol class="point-list">${kaizen.commitments.items
      .map((item, i) => `<li><p class="feature__no">${String(i + 1).padStart(2, "0")}</p><h3 class="feature__title">${esc(item.title)}</h3><p>${br(item.text)}</p></li>`)
      .join("")}</ol>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${heading("Before / After", kaizen.results.heading)}
    <ul class="feature-grid">${kaizen.results.items
      .map((item) => `<li class="feature">${photo(item.image, item.title, "feature__photo")}<h3 class="feature__title">${esc(item.title)}</h3><p>${br(item.text)}</p></li>`)
      .join("")}</ul>
    ${kaizen.results.items.some((i) => !i.image) && kaizen.results.note ? `<p class="note center">${esc(kaizen.results.note)}</p>` : ""}
    ${
      kaizen.results.gallery?.images?.length
        ? `<h3 class="sub-heading">${esc(kaizen.results.gallery.heading)}</h3><ul class="gallery">${kaizen.results.gallery.images
            .map((src, i) => `<li>${photo(src, `${kaizen.results.gallery.heading} ${i + 1}`, "gallery__photo")}</li>`)
            .join("")}</ul>`
        : ""
    }
  </div>
</section>
<section class="section section--tint">
  <div class="wrap wrap--narrow">
    ${heading("Flow", kaizen.flow.heading)}
    <p class="lead center">${br(kaizen.flow.text)}</p>
    <ol class="flow">${kaizen.flow.steps
      .map(
        (s, i) =>
          `<li><p class="flow__no">Step ${i + 1}</p><div><h3 class="feature__title">${esc(s.title)}</h3><p>${br(s.text)}</p>${s.image ? photo(s.image, s.title, "flow__photo") : ""}</div></li>`
      )
      .join("")}</ol>
    ${
      kaizen.flow.beforeAfter
        ? `<ul class="before-after">${["before", "after"]
            .map((key) => kaizen.flow.beforeAfter[key])
            .map((b) => `<li>${photo(b.image, b.label, "before-after__photo")}<p class="feature__no">${esc(b.label)}</p><p>${br(b.text)}</p></li>`)
            .join("")}</ul>`
        : ""
    }
    ${kaizen.flow.voice ? `<p class="lead">${br(kaizen.flow.voice)}</p>` : ""}
  </div>
</section>
${reserveCta()}`,
  });

  pages["service/index.html"] = layout({
    title: service.title,
    description: service.description,
    path: "/service/",
    body: `${pageHeader(service.en, service.title, [{ label: service.title }])}
<section class="section">
  <div class="wrap wrap--narrow"><p class="lead">${br(service.lead)}</p></div>
</section>
<section class="section section--tint">
  <div class="wrap">
    ${heading("Menu", service.categories.heading)}
    <ul class="menu-grid">${service.categories.items
      .map(
        (c) => `<li class="menu-item">${photo(c.image, c.title, "menu-item__photo")}<div><p class="menu-item__en">${esc(c.en)}</p><h3 class="feature__title">${esc(c.title)}</h3>
        <p${c.text ? "" : ' class="note"'}>${c.text ? br(c.text) : esc(service.categories.note)}</p></div></li>`
      )
      .join("")}</ul>
  </div>
</section>
<section class="section">
  <div class="wrap wrap--narrow">
    ${heading("Course", service.courses.heading)}
    <ul class="course-list">${service.courses.items
      .map(
        (c) => `<li class="course"><p class="course__label">${esc(c.label)}</p><h3 class="course__title">${esc(c.title)}</h3>
        <p class="course__contents">${br(c.contents)}</p><p>${br(c.text)}</p>
        ${c.price ? `<p class="course__price">${br(c.price)}</p>` : ""}
        ${c.notes?.length ? `<ul class="notes">${c.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}</li>`
      )
      .join("")}</ul>
    <p class="note">${esc(service.courses.priceNote)}</p>
  </div>
</section>
<section class="section section--tint">
  <div class="wrap wrap--narrow">${heading("Payment", service.payment.heading)}<p class="lead center">${br(service.payment.text)}</p></div>
</section>
${reserveCta()}`,
  });

  pages["shoplist/index.html"] = layout({
    title: "店舗一覧",
    description: `髪質改善美容室bokunoの店舗一覧（全${shops.length}店舗）。`,
    path: "/shoplist/",
    body: `${pageHeader("Salon", "店舗一覧", [{ label: "店舗一覧" }])}
<section class="section">
  <div class="wrap">
    <p class="lead center">全${shops.length}店舗。ご予約は各店舗のページから承ります。</p>
    ${prefNav(shops)}
    ${shopGroups(shops)}
  </div>
</section>`,
  });

  for (const shop of shops) {
    const neighbors = shops.filter((s) => s.prefecture === shop.prefecture && s.slug !== shop.slug);
    const meta = [shop.lead, shop.opened].filter(Boolean);
    pages[`shoplist/${shop.slug}/index.html`] = layout({
      title: shop.name,
      description: [shop.name, shop.address].filter(Boolean).join("｜"),
      path: `/shoplist/${shop.slug}/`,
      body: `<header class="page-header page-header--shop"><div class="wrap">
  ${breadcrumb([{ label: "店舗一覧", href: "/shoplist/" }, { label: shop.listName || shop.name }])}
  <p class="page-header__en">${esc(shop.prefecture)}</p>
  <h1 class="page-header__title">${esc(shop.name)}</h1>
  ${meta.length ? `<p class="page-header__meta">${meta.map(esc).join("<span> ／ </span>")}</p>` : ""}
</div></header>
<section class="section section--flush">
  <div class="wrap shop-detail">
    ${photo(shop.image, shop.name, "shop-detail__photo")}
    <div class="shop-detail__info">
      ${heading("Information", "店舗情報")}
      ${table([
        { label: "住所", value: shop.address },
        { label: "アクセス", value: shop.access },
        { label: "電話", value: shop.tel, html: shop.tel ? `<a href="${telHref(shop.tel)}">${esc(shop.tel)}</a>` : "" },
        { label: "席数", value: shop.seats },
        { label: "営業時間", value: shop.hours },
        { label: "定休日", value: shop.closed },
      ])}
      ${shop.reserveUrl ? `<div class="shop-detail__reserve">${button("この店舗を予約する", shop.reserveUrl, { variant: "solid", external: true })}<p class="note">ホットペッパービューティーの予約ページへ移動します。</p></div>` : ""}
    </div>
  </div>
</section>
${
  shop.intro || shop.points?.length
    ? `<section class="section section--tint"><div class="wrap wrap--narrow">${heading("Commitment", "この店舗のこだわり")}
    ${shop.intro ? `<p class="lead">${br(shop.intro)}</p>` : ""}
    ${shop.points?.length ? `<ol class="point-list point-list--single">${shop.points.map((p, i) => `<li><p class="feature__no">${String(i + 1).padStart(2, "0")}</p><h3 class="feature__title">${esc(p.title)}</h3><p>${br(p.text)}</p></li>`).join("")}</ol>` : ""}
    </div></section>`
    : ""
}
${
  shop.mapEmbed
    ? `<section class="section"><div class="wrap">${heading("Access", "地図")}
    <div class="map"><iframe src="${esc(shop.mapEmbed)}" title="${esc(shop.name)}の地図" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></div></section>`
    : ""
}
${
  shop.recruiting
    ? `<section class="section section--tint"><div class="wrap wrap--narrow center">${heading("Recruit", "この店舗で働く")}
    <p class="lead">${esc(recruit.shopPage.leadTemplate.replace("{name}", shop.listName || shop.name))}</p>${button("この店舗の求人を見る", `/recruit/${shop.slug}/`)}</div></section>`
    : ""
}
${
  neighbors.length
    ? `<section class="section"><div class="wrap">${heading("Salon", `${shop.prefecture}のほかの店舗`)}<ul class="shop-grid">${neighbors.map((s) => shopCard(s)).join("")}</ul>
    <p class="center">${button("すべての店舗を見る", "/shoplist/")}</p></div></section>`
    : `<section class="section"><div class="wrap center">${button("すべての店舗を見る", "/shoplist/")}</div></section>`
}
${shop.reserveUrl ? `<a class="sticky-reserve" href="${esc(shop.reserveUrl)}" target="_blank" rel="noopener">この店舗を予約する</a>` : ""}`,
    });
  }

  const applyBlock = () =>
    `<section class="cta"><div class="wrap cta__inner">${heading("Entry", recruit.apply.heading)}<p class="cta__text">${br(recruit.apply.text)}</p>
    ${recruit.apply.url ? button(recruit.apply.button, recruit.apply.url, { variant: "solid", external: true }) : ""}
    ${recruit.apply.note ? `<p class="cta__note">${br(recruit.apply.note)}</p>` : ""}
    ${recruit.apply.qr ? `<div class="cta__qr"><img src="${esc(url(recruit.apply.qr))}" alt="${esc(recruit.apply.button)}のQRコード" width="160" height="160" loading="lazy">${recruit.apply.qrNote ? `<p>${br(recruit.apply.qrNote)}</p>` : ""}</div>` : ""}</div></section>`;

  pages["recruit/index.html"] = layout({
    title: recruit.title,
    description: recruit.description,
    path: "/recruit/",
    body: `${pageHeader(recruit.en, recruit.title, [{ label: recruit.title }])}
<section class="section">
  <div class="wrap split">
    <div class="split__text"><p class="heading__en">Message</p><h2 class="statement">${br(recruit.lead.heading)}</h2><p class="message__intro">${rich(recruit.lead.intro)}</p></div>
    ${photo(recruit.lead.image, "働くスタッフのイメージ", "split__photo")}
  </div>
  <div class="wrap wrap--narrow message">
    <div class="message__body">${recruit.lead.paragraphs.map((p) => `<p>${rich(p)}</p>`).join("")}</div>
    ${
      recruit.lead.closing
        ? `<div class="message__closing"><p class="message__statement">${br(recruit.lead.closing.statement)}</p><p>${rich(recruit.lead.closing.text)}</p></div>`
        : ""
    }
  </div>
</section>
${recruit.story
  .map(
    (block, i) => `<section class="section${i % 2 === 0 ? " section--tint" : ""}"><div class="wrap wrap--narrow">
    ${heading(block.en || "", block.heading)}${block.image ? photo(block.image, block.heading, "prose__photo") : ""}<div class="prose">${block.paragraphs.filter((p) => p.trim()).map((p) => `<p>${rich(p)}</p>`).join("")}</div>
    ${block.statement ? `<div class="message__closing"><p class="message__statement">${br(block.statement.text)}</p>${block.statement.sub ? `<p>${rich(block.statement.sub)}</p>` : ""}</div>` : ""}
    ${block.voices?.length ? `<ul class="voices">${block.voices.map((v) => `<li>${esc(v)}</li>`).join("")}</ul>` : ""}
    ${block.closing ? `<p class="voices__closing">${rich(block.closing)}</p>` : ""}</div></section>`
  )
  .join("")}
<section class="section${recruit.story.length % 2 === 0 ? " section--tint" : ""}">
  <div class="wrap wrap--narrow">${heading("Requirements", recruit.conditions.heading)}${table(recruit.conditions.rows)}</div>
</section>
<section class="section">
  <div class="wrap">
    ${heading("Salon", recruit.shops.heading)}
    <p class="lead center">${br(recruit.shops.text)}</p>
    ${recruitingShops.length ? prefNav(recruitingShops) + shopGroups(recruitingShops, { recruitLink: true }) : '<p class="note center">現在募集中の店舗はありません。</p>'}
  </div>
</section>
${applyBlock()}`,
  });

  for (const shop of recruitingShops) {
    const label = shop.listName || shop.name;
    pages[`recruit/${shop.slug}/index.html`] = layout({
      title: `${label}の求人`,
      description: `${shop.name}の美容師スタイリスト求人情報。`,
      path: `/recruit/${shop.slug}/`,
      body: `<header class="page-header page-header--shop"><div class="wrap">
  ${breadcrumb([{ label: recruit.title, href: "/recruit/" }, { label }])}
  <p class="page-header__en">Recruit ／ ${esc(shop.prefecture)}</p>
  <h1 class="page-header__title">${esc(label)}の求人</h1>
  <p class="page-header__meta">${esc(recruit.shopPage.leadTemplate.replace("{name}", shop.name))}</p>
</div></header>
<section class="section section--flush">
  <div class="wrap shop-detail">
    ${photo(shop.image, shop.name, "shop-detail__photo")}
    <div class="shop-detail__info">
      ${heading("Workplace", recruit.shopPage.workplaceHeading)}
      ${table([
        { label: "店舗名", value: shop.name },
        { label: "住所", value: shop.address },
        { label: "アクセス", value: shop.access },
        { label: "席数", value: shop.seats },
        { label: "営業時間", value: shop.hours },
        { label: "定休日", value: shop.closed },
      ])}
      <p>${button("店舗ページを見る", `/shoplist/${shop.slug}/`)}</p>
    </div>
  </div>
</section>
<section class="section section--tint">
  <div class="wrap wrap--narrow">${heading("Requirements", recruit.shopPage.conditionsHeading)}
    <p class="note center">${esc(recruit.shopPage.conditionsNote)}</p>${table(recruit.conditions.rows)}
    <p class="center">${button("bokunoの働き方を見る", "/recruit/")}</p></div>
</section>
${applyBlock()}`,
    });
  }

  pages["company/index.html"] = layout({
    title: company.title,
    description: company.description,
    path: "/company/",
    body: `${pageHeader(company.en, company.title, [{ label: company.title }])}
<section class="section">
  <div class="wrap wrap--narrow">${company.image ? photo(company.image, company.title, "company__photo") : ""}${table(company.rows)}</div>
</section>
<section class="section section--tint">
  <div class="wrap">
    ${heading("Area", company.areas.heading)}
    <div class="area-list">${byPrefecture(shops)
      .map(
        (g) => `<div class="area"><h3 class="area__title">${esc(g.prefecture)}</h3><ul>${g.shops
          .map((s) => `<li><a href="${url(`/shoplist/${s.slug}/`)}">${esc(s.listName || s.name)}</a></li>`)
          .join("")}</ul></div>`
      )
      .join("")}</div>
  </div>
</section>`,
  });

  pages["inquiry/index.html"] = layout({
    title: contact.title,
    description: contact.description,
    path: "/inquiry/",
    body: `${pageHeader(contact.en, contact.title, [{ label: contact.title }])}
<section class="section">
  <div class="wrap wrap--narrow">
    <p class="lead">${br(contact.lead)}</p>
    <p class="notice">${br(contact.notice)} <a href="${url("/shoplist/")}">店舗一覧はこちら</a></p>
    <!-- 送信機能は未実装。action を付けるまでこのフォームはどこにも送信しない。 -->
    <form class="form" data-contact-form novalidate>
      ${contact.fields
        .map((f) => {
          const id = `f-${f.name}`;
          const attrs = `id="${id}" name="${esc(f.name)}"${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ""}${f.required ? " required" : ""}`;
          return `<div class="form__row"><label for="${id}">${esc(f.label)}<span class="form__tag${f.required ? " form__tag--req" : ""}">${f.required ? "必須" : "任意"}</span></label>
          ${f.type === "textarea" ? `<textarea ${attrs} rows="7"></textarea>` : `<input type="${esc(f.type)}" ${attrs}>`}</div>`;
        })
        .join("")}
      <p class="form__disabled">${esc(contact.disabledNote)}</p>
      <button class="btn btn--solid" type="submit" disabled>${esc(contact.submitLabel)}</button>
    </form>
  </div>
</section>`,
  });

  pages["404.html"] = layout({
    title: "ページが見つかりません",
    path: "/404",
    body: `${pageHeader("Not Found", "ページが見つかりません", [{ label: "404" }])}
<section class="section"><div class="wrap center"><p class="lead">お探しのページは移動または削除された可能性があります。</p>${button("ホームへ戻る", "/")}</div></section>`,
  });

  return pages;
}
