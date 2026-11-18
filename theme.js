(() => {
  const STORAGE_KEY = "decsi.theme";
  const root = document.documentElement;
  const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  const header = document.querySelector(".topbar");
  if (!header) return;

  function savedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }

  const host = header.querySelector(".header-actions") || header;
  const menu = document.createElement("div");
  menu.className = "header-menu";
  menu.innerHTML = `
    <button class="header-menu-trigger" type="button" aria-label="Abrir opções da conta e aparência" aria-expanded="false" aria-haspopup="true">
      <span class="header-menu-chevron" data-lucide="chevron-down" aria-hidden="true"></span>
    </button>
    <div class="header-menu-panel" role="menu" hidden>
      <button class="header-menu-item header-menu-theme" type="button" role="menuitem"></button>
    </div>`;
  host.append(menu);

  const trigger = menu.querySelector(".header-menu-trigger");
  const panel = menu.querySelector(".header-menu-panel");
  const appearance = menu.querySelector(".header-menu-theme");

  function updateAppearance() {
    const dark = root.dataset.theme === "dark";
    appearance.innerHTML = `<span class="menu-option-icon" data-lucide="${dark ? "sun" : "moon"}" aria-hidden="true"></span><span>Modo ${dark ? "claro" : "escuro"}</span>`;
    appearance.setAttribute("aria-label", `Ativar modo ${dark ? "claro" : "escuro"}`);
    appearance.setAttribute("aria-pressed", String(dark));
  }

  function setOpen(open) {
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", open ? "Fechar opções da conta e aparência" : "Abrir opções da conta e aparência");
  }

  trigger.addEventListener("click", () => setOpen(panel.hidden));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      panel.querySelector('[role="menuitem"]')?.focus();
    }
  });
  appearance.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    try { localStorage.setItem(STORAGE_KEY, nextTheme); } catch { /* O tema vale para esta página. */ }
    updateAppearance();
    setOpen(false);
    trigger.focus();
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !panel.hidden) setOpen(false);
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
      trigger.focus();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const items = [...panel.querySelectorAll('[role="menuitem"]')];
      if (!items.length) return;
      event.preventDefault();
      const index = items.indexOf(document.activeElement);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      items[(index + direction + items.length) % items.length].focus();
    }
  });

  const existingAccountAction = header.querySelector(".user .auth-action");
  if (existingAccountAction) {
    existingAccountAction.setAttribute("role", "menuitem");
    panel.prepend(existingAccountAction);
  }
  updateAppearance();

  if (!savedTheme() && systemTheme?.addEventListener) {
    systemTheme.addEventListener("change", (event) => {
      root.dataset.theme = event.matches ? "dark" : "light";
      updateAppearance();
    });
  }
})();
