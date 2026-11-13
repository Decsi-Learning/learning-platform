(() => {
  const STORAGE_KEY = "decsi.theme";
  const root = document.documentElement;
  const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");

  function savedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function updateToggle(button) {
    const dark = root.dataset.theme === "dark";
    button.innerHTML = `<span class="theme-toggle-icon" aria-hidden="true">${dark ? "☀" : "☾"}</span><span class="theme-toggle-label">${dark ? "Modo claro" : "Modo escuro"}</span>`;
    button.setAttribute("aria-label", dark ? "Ativar modo claro" : "Ativar modo escuro");
    button.title = dark ? "Ativar modo claro" : "Ativar modo escuro";
    button.setAttribute("aria-pressed", String(dark));
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The selected theme still applies to this page if storage is unavailable.
    }
    updateToggle(button);
  });
  updateToggle(button);

  const header = document.querySelector(".topbar");
  const user = header?.querySelector(".user");
  (user || header)?.append(button);

  if (!savedTheme() && systemTheme?.addEventListener) {
    systemTheme.addEventListener("change", (event) => {
      root.dataset.theme = event.matches ? "dark" : "light";
      updateToggle(button);
    });
  }
})();
