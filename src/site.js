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

// お問い合わせフォームは見た目のみ。送信機能を実装するまで何も送らない。
document.querySelector("[data-contact-form]")?.addEventListener("submit", (e) => e.preventDefault());
