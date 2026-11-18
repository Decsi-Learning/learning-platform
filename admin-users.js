(() => {
  const API = "https://gemini-proxy.scrrhdvp7v.workers.dev/api";
  const token = sessionStorage.getItem("decsi.sessionToken") || "";
  const status = document.getElementById("admin-message");
  const list = document.getElementById("users-list");
  const total = document.getElementById("user-total");
  const dialog = document.getElementById("user-dialog");
  const form = document.getElementById("user-form");
  const formError = document.getElementById("user-dialog-error");
  let users = [];

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}`, ...options.headers },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Não foi possível concluir a ação.");
    return result;
  }

  function formattedDate(value) {
    if (!value) return "—";
    const date = new Date(`${value}${value.endsWith("Z") ? "" : "Z"}`);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
  }

  function formattedDateTime(value) {
    if (!value) return "Sem registro";
    const date = new Date(`${value}${value.endsWith("Z") ? "" : "Z"}`);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  function cell(text) {
    const element = document.createElement("td");
    element.textContent = text || "—";
    return element;
  }

  function renderUsers() {
    list.replaceChildren();
    for (const user of users) {
      const row = document.createElement("tr");
      row.dataset.userId = user.id;
      row.append(cell([user.first_name, user.last_name].filter(Boolean).join(" ")), cell(user.email));
      const profile = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `profile-badge${user.role === "admin" ? " is-admin" : ""}`;
      badge.textContent = user.role === "admin" ? "Administrador" : "Estudante";
      profile.append(badge);
      row.append(profile, cell(formattedDate(user.created_at)), cell(formattedDateTime(user.last_login_at)));
      const actions = document.createElement("td");
      actions.className = "user-actions-cell";
      const edit = document.createElement("button");
      edit.type = "button"; edit.className = "user-edit-button"; edit.dataset.action = "edit-user"; edit.textContent = "Editar"; edit.setAttribute("aria-label", `Editar ${[user.first_name, user.last_name].filter(Boolean).join(" ") || user.email}`);
      actions.append(edit);
      row.append(actions);
      list.append(row);
    }
  }

  async function loadUsers() {
    if (!token) {
      status.textContent = "Entre em uma conta de administrador para consultar os usuários.";
      return;
    }
    status.classList.remove("is-error");
    status.textContent = "Carregando usuários…";
    try {
      const result = await request("/admin/users");
      users = result.users || [];
      total.textContent = `${users.length} usuário${users.length === 1 ? "" : "s"}`;
      renderUsers();
      status.textContent = users.length ? "" : "Ainda não há usuários cadastrados.";
    } catch (error) {
      status.textContent = error.message;
      status.classList.add("is-error");
    }
  }

  function openCreateDialog() {
    form.reset(); form.dataset.mode = "create"; form.dataset.userId = "";
    document.getElementById("user-dialog-title").textContent = "Cadastrar usuário";
    document.getElementById("save-user").textContent = "Cadastrar usuário";
    document.getElementById("password-hint").textContent = "Obrigatória; mínimo de 12 caracteres.";
    form.elements.password.required = true;
    form.elements.password.autocomplete = "new-password";
    formError.textContent = "";
    dialog.showModal();
  }

  function openEditDialog(user) {
    form.dataset.mode = "edit"; form.dataset.userId = user.id;
    document.getElementById("user-dialog-title").textContent = "Editar usuário";
    document.getElementById("save-user").textContent = "Salvar alterações";
    document.getElementById("password-hint").textContent = "Opcional; deixe em branco para manter a senha atual.";
    form.elements.firstName.value = user.first_name || "";
    form.elements.lastName.value = user.last_name || "";
    form.elements.email.value = user.email || "";
    form.elements.role.value = user.role === "admin" ? "admin" : "student";
    form.elements.password.value = "";
    form.elements.password.required = false;
    form.elements.password.autocomplete = "new-password";
    formError.textContent = "";
    dialog.showModal();
  }

  document.getElementById("add-user").addEventListener("click", openCreateDialog);
  document.querySelectorAll("[data-close-user-dialog]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  list.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="edit-user"]');
    if (!button) return;
    const user = users.find((item) => String(item.id) === button.closest("tr").dataset.userId);
    if (user) openEditDialog(user);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.textContent = "";
    const data = new FormData(form);
    const payload = {
      firstName: String(data.get("firstName") || "").trim(),
      lastName: String(data.get("lastName") || "").trim(),
      email: String(data.get("email") || "").trim(),
      role: String(data.get("role") || "student"),
      password: String(data.get("password") || ""),
    };
    const create = form.dataset.mode === "create";
    const save = document.getElementById("save-user");
    save.disabled = true;
    try {
      await request(create ? "/admin/users" : `/admin/users/${form.dataset.userId}`, {
        method: create ? "POST" : "PUT",
        body: JSON.stringify(payload),
      });
      dialog.close();
      status.classList.remove("is-error");
      status.textContent = create ? "Usuário cadastrado." : "Alterações salvas.";
      await loadUsers();
    } catch (error) {
      formError.textContent = error.message;
    } finally {
      save.disabled = false;
    }
  });

  loadUsers();
})();
