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
