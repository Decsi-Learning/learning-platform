(() => {
  const API_ROOT = "https://gemini-proxy.scrrhdvp7v.workers.dev/api";
  const TOKEN_KEY = "decsi.sessionToken";
  const EMAIL_KEY = "decsi.sessionEmail";
  const FIRST_NAME_KEY = "decsi.sessionFirstName";
  const LAST_NAME_KEY = "decsi.sessionLastName";
  const getToken = () => sessionStorage.getItem(TOKEN_KEY);
  const getProfile = () => ({
    email: sessionStorage.getItem(EMAIL_KEY) || "",
    firstName: sessionStorage.getItem(FIRST_NAME_KEY) || "",
    lastName: sessionStorage.getItem(LAST_NAME_KEY) || "",
  });

  function storeSession(token, profile) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(EMAIL_KEY, profile.email || "");
    sessionStorage.setItem(FIRST_NAME_KEY, profile.firstName || "");
    sessionStorage.setItem(LAST_NAME_KEY, profile.lastName || "");
  }

  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
    sessionStorage.removeItem(FIRST_NAME_KEY);
    sessionStorage.removeItem(LAST_NAME_KEY);
  }

  function clearProgressCache() {
    try {
      localStorage.removeItem("decsi.learningProgress");
      localStorage.removeItem("decsi.learningPageProgress");
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("decsi-learning:")) localStorage.removeItem(key);
      }
    } catch {
      // A sessão pode terminar mesmo quando o navegador bloqueia o armazenamento local.
    }
  }

  function updateHeader(profile) {
    const user = document.querySelector(".user");
    if (!user) return;
    const email = profile?.email || "";
    const firstName = profile?.firstName || "";
    const lastName = profile?.lastName || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const name = user.querySelector(".user-name");
    const role = user.querySelector(".user-role");
    const avatar = user.querySelector(".avatar");
    if (name) name.textContent = email ? `Olá, ${fullName || email.split("@")[0]}` : "Olá, visitante";
    if (role) role.textContent = email ? "Estudante" : "Visitante";
    if (avatar) avatar.textContent = email ? (firstName ? `${firstName[0]}${lastName[0] || ""}` : email[0]).toUpperCase() : "?";

    user.querySelector(".auth-action")?.remove();
    if (email) {
      const logout = document.createElement("button");
      logout.type = "button";
      logout.className = "auth-action";
      logout.textContent = "Sair";
      logout.addEventListener("click", () => {
        clearSession();
        clearProgressCache();
        window.location.reload();
      });
      user.append(logout);
    } else {
      const login = document.createElement("a");
      login.className = "auth-action";
      login.href = "login.html";
      login.textContent = "Entrar";
      user.append(login);
    }
  }

  async function restoreSession() {
    const token = getToken();
    if (!token) {
      updateHeader(null);
      return;
    }
    try {
      const response = await fetch(`${API_ROOT}/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (response.status === 401) {
        clearSession();
        updateHeader(null);
        return;
      }
      if (response.ok) {
        const result = await response.json();
        storeSession(token, result.user);
        updateHeader(result.user);
        return;
      }
    } catch {
      // Keep the tab session during a temporary network outage.
    }
    updateHeader(getProfile());
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const status = document.getElementById("login-status");
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.className = "status";
      if (!emailInput.checkValidity()) {
        status.textContent = "Informe um endereço de e-mail válido.";
        status.classList.add("error");
        emailInput.focus();
        return;
      }
      if (!passwordInput.value) {
        status.textContent = "Informe sua senha.";
        status.classList.add("error");
        passwordInput.focus();
        return;
      }
      const button = loginForm.querySelector("button[type=submit]");
      button.disabled = true;
      status.textContent = "Validando seu acesso…";
      try {
        const response = await fetch(`${API_ROOT}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput.value.trim().toLowerCase(), password: passwordInput.value }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Não foi possível entrar.");
        clearProgressCache();
        storeSession(result.token, result.user);
        window.location.replace("index.html");
      } catch (error) {
        status.textContent = error.message || "Não foi possível conectar ao serviço de login.";
        status.classList.add("error");
      } finally {
        button.disabled = false;
      }
    });
  }

  restoreSession();
})();
