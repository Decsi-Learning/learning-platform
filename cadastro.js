(() => {
  const endpoint = "https://gemini-proxy.scrrhdvp7v.workers.dev/api/register";
  const form = document.getElementById("signup-form");
  const firstNameField = document.getElementById("signup-first-name");
  const lastNameField = document.getElementById("signup-last-name");
  const emailField = document.getElementById("signup-email");
  const passwordField = document.getElementById("signup-password");
  const confirmField = document.getElementById("signup-confirm-password");
  const status = document.getElementById("signup-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "status";
    const firstName = firstNameField.value.trim();
    const lastName = lastNameField.value.trim();
    const email = emailField.value.trim().toLowerCase();
    const password = passwordField.value;
    if (!firstName || firstName.length > 80) {
      status.textContent = "Informe seu nome (até 80 caracteres).";
      status.classList.add("error");
      firstNameField.focus();
      return;
    }
    if (!lastName || lastName.length > 80) {
      status.textContent = "Informe seu sobrenome (até 80 caracteres).";
      status.classList.add("error");
      lastNameField.focus();
      return;
    }
    if (!emailField.checkValidity()) {
      status.textContent = "Informe um endereço de e-mail válido.";
      status.classList.add("error");
      emailField.focus();
      return;
    }
    if (password.length < 12 || password.length > 128) {
      status.textContent = "A senha deve ter entre 12 e 128 caracteres.";
      status.classList.add("error");
      passwordField.focus();
      return;
    }
    if (password !== confirmField.value) {
      status.textContent = "As senhas não coincidem.";
      status.classList.add("error");
      confirmField.focus();
      return;
    }

    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    status.textContent = "Criando sua conta…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível criar sua conta.");
      form.reset();
      status.textContent = "Conta criada com sucesso.";
      status.classList.add("success");
    } catch (error) {
      status.textContent = error.message || "Não foi possível conectar ao serviço de cadastro.";
      status.classList.add("error");
    } finally {
      button.disabled = false;
    }
  });
})();
