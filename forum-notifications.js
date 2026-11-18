(() => {
  const API = "https://gemini-proxy.scrrhdvp7v.workers.dev/api";
  const host = document.querySelector("[data-notification-host]");
  const header = document.querySelector(".topbar");
  const user = header?.querySelector(".user");
  if (!header || !user) return;
  if (!host) {
    const slot = document.createElement("div"); slot.className = "notification-host"; slot.dataset.notificationHost = ""; user.after(slot);
  }
  const mount = document.querySelector("[data-notification-host]");
  user.after(mount);
  if (!header.querySelector(".header-actions")) {
    const actions = document.createElement("div"); actions.className = "header-actions"; mount.before(actions); actions.append(user, mount);
  }
  const actions = header.querySelector(".header-actions");
  const accountMenu = header.querySelector(".header-menu");
  if (actions && accountMenu && accountMenu.parentElement !== actions) actions.append(accountMenu);
  const token = sessionStorage.getItem("decsi.sessionToken");
  if (!token) return;

  const button = document.createElement("button");
  button.type = "button"; button.className = "notification-button"; button.setAttribute("aria-label", "Notificações"); button.setAttribute("aria-expanded", "false"); button.innerHTML = '<span data-lucide="bell"></span><span class="notification-count" hidden></span>';
  const panel = document.createElement("section"); panel.className = "notification-panel"; panel.hidden = true; panel.setAttribute("aria-label", "Notificações");
  const panelHead = document.createElement("div"); panelHead.className = "notification-panel-head";
  const title = document.createElement("strong"); title.textContent = "Notificações";
  const clear = document.createElement("button"); clear.type = "button"; clear.className = "notification-clear"; clear.textContent = "Marcar todas como lidas";
  panelHead.append(title, clear);
  const list = document.createElement("div"); list.className = "notification-list"; list.setAttribute("aria-live", "polite"); panel.append(panelHead, list); mount.append(button, panel);

  async function load() {
    try {
      const response = await fetch(`${API}/forum/notifications`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json(); const notifications = result.notifications || [];
      const unread = notifications.filter((item) => !item.read_at).length;
      const count = button.querySelector(".notification-count"); count.hidden = !unread; count.textContent = unread > 9 ? "9+" : String(unread); button.setAttribute("aria-label", unread ? `${unread} notificações não lidas` : "Notificações");
      list.replaceChildren();
      if (!notifications.length) { const empty = document.createElement("p"); empty.className = "notification-empty"; empty.textContent = "Você está em dia. Nenhuma notificação por enquanto."; list.append(empty); }
      for (const item of notifications) {
        const link = document.createElement("a"); link.className = `notification-item${item.read_at ? " is-read" : " is-unread"}`; link.href = item.post_id ? `forum.html?post=${encodeURIComponent(item.post_id)}` : "forum.html"; link.dataset.notificationId = item.id;
        const message = document.createElement("span"); message.textContent = item.message;
        const time = document.createElement("time"); time.textContent = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(`${item.created_at}Z`));
        link.append(message, time); list.append(link);
      }
    } catch { /* O indicador não deve atrapalhar a navegação se a rede oscilar. */ }
  }

  button.addEventListener("click", () => { const open = panel.hidden; panel.hidden = !open; button.setAttribute("aria-expanded", String(open)); if (open) load(); });
  clear.addEventListener("click", async () => { await fetch(`${API}/forum/notifications`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: "{}" }); await load(); });
  list.addEventListener("click", async (event) => { const item = event.target.closest("[data-notification-id]"); if (!item) return; event.preventDefault(); await fetch(`${API}/forum/notifications`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ id: Number(item.dataset.notificationId) }) }); location.href = item.href; });
  document.addEventListener("click", (event) => { if (!mount.contains(event.target) && !panel.hidden) { panel.hidden = true; button.setAttribute("aria-expanded", "false"); } });
  load(); window.setInterval(load, 45000);
})();
