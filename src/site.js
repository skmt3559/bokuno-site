// スマホ用メニューの開閉
const btn = document.querySelector("[data-menu-btn]");
const menu = document.querySelector("[data-menu]");
if (btn && menu) {
  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  btn.addEventListener("click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => e.target.closest("a") && setOpen(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
  window.matchMedia("(min-width: 960px)").addEventListener("change", () => setOpen(false));
}

// トップの動画は、ページの表示が終わってから読み込む（最初の表示を速くするため）。通信量節約の設定の人には流さない
const heroVideo = document.querySelector("video[data-src]");
if (heroVideo) {
  const connection = navigator.connection || {};
  const start = () => {
    if (connection.saveData || /2g/.test(connection.effectiveType || "")) return;
    heroVideo.src = heroVideo.dataset.src;
    heroVideo.play().catch(() => {});
  };
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}

// ヘッダー：少しスクロールしたら影をつける
const header = document.querySelector("[data-header]");
if (header) {
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// スクロールに合わせて要素をふわっと出す（動きを減らす設定の人には何もしない）
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const targets = document.querySelectorAll(
    "main .heading, main .lead, main .statement, main .feature, main .menu-item, main .course, main .shop-card, main .split__photo, main .point-list > li, main .flow > li, main .spec, main .area, main .faq__item, main .gallery > li, main .service-list > li, main .message__body, main .voices > li, main .cta__inner"
  );
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((el) => {
    // 画面内に最初から見えているものは隠さない
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    const siblings = [...el.parentElement.children];
    el.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(el), 4) * 0.08}s`);
    el.classList.add("reveal");
    io.observe(el);
  });
}

// お問い合わせフォーム。action があるときだけ send.php に送る（無いときは見た目だけ）
const form = document.querySelector("[data-contact-form]");
if (form) {
  const opened = Date.now();
  const status = form.querySelector("[data-form-status]");
  const button = form.querySelector("button[type=submit]");
  const show = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = false;
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.getAttribute("action") || !form.reportValidity()) return;
    const label = button.firstChild.textContent;
    button.disabled = true;
    button.firstChild.textContent = form.dataset.sending;
    try {
      const body = new FormData(form);
      body.append("elapsed", String(Date.now() - opened));
      const res = await fetch(form.action, { method: "POST", body, headers: { Accept: "application/json" } });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      form.reset();
      show(form.dataset.success, "ok");
    } catch (err) {
      show(err.message && !/JSON|fetch|token/i.test(err.message) ? err.message : form.dataset.error, "error");
    }
    button.disabled = false;
    button.firstChild.textContent = label;
  });
}
