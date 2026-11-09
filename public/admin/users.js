const ROLE_LABELS = {
  admin: "Administrator",
  teacher: "Teacher",
  librarian: "Librarian",
  bursar: "Bursar",
};

const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 64;

let accounts = [];

const form = document.getElementById("userForm");
const fullNameInput = document.getElementById("fullName");
const usernameInput = document.getElementById("username");
const roleInput = document.getElementById("role");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const searchInput = document.getElementById("searchUser");
const filterRole = document.getElementById("filterRole");
const table = document.getElementById("userTable");

const dateEl = document.getElementById("currentDate");
if (dateEl) {
  dateEl.textContent = new Date().toLocaleDateString("en-UG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function showError(field, message) {
  const input = document.getElementById(field);
  const error = document.getElementById(field + "Error");
  if (input) input.closest(".form-group").classList.add("has-error");
  if (error) {
    error.textContent = message;
    error.classList.add("show");
  }
}

function clearError(field) {
  const input = document.getElementById(field);
  const error = document.getElementById(field + "Error");
  if (input) input.closest(".form-group").classList.remove("has-error");
  if (error) {
    error.textContent = "";
    error.classList.remove("show");
  }
}

function clearAllErrors() {
  ["username", "role", "password", "confirmPassword"].forEach(clearError);
}

function validateForm() {
  clearAllErrors();

  let firstInvalid = "";

  const username = usernameInput.value.trim().toLowerCase();
  if (!username) {
    showError("username", "Enter a username.");
    firstInvalid = firstInvalid || "username";
  } else if (!USERNAME_PATTERN.test(username)) {
    showError(
      "username",
      "Use 3-30 characters: letters, numbers, dots, hyphens or underscores."
    );
    firstInvalid = firstInvalid || "username";
  }

  const role = roleInput.value;
  if (!role) {
    showError("role", "Select a role.");
    firstInvalid = firstInvalid || "role";
  }

  const password = passwordInput.value;
  if (!password) {
    showError("password", "Enter a password.");
    firstInvalid = firstInvalid || "password";
  } else if (password.length < PASSWORD_MIN) {
    showError("password", `Password must be at least ${PASSWORD_MIN} characters.`);
    firstInvalid = firstInvalid || "password";
  } else if (password.length > PASSWORD_MAX) {
    showError("password", `Password must be at most ${PASSWORD_MAX} characters.`);
    firstInvalid = firstInvalid || "password";
  }

  if (confirmInput.value !== password) {
    showError("confirmPassword", "Passwords do not match.");
    firstInvalid = firstInvalid || "confirmPassword";
  }

  if (firstInvalid) {
    document.getElementById(firstInvalid).focus();
    return null;
  }

  return {
    username,
    role,
    password,
    fullName: fullNameInput.value.trim(),
  };
}

function statusBadge(account) {
  return account.isActive
    ? '<span class="status approved">Active</span>'
    : '<span class="status pending">Inactive</span>';
}

function renderTable() {
  const term = searchInput.value.trim().toLowerCase();
  const role = filterRole.value;

  const visible = accounts.filter((account) => {
    if (role && account.role !== role) return false;
    if (!term) return true;
    const haystack = [
      account.fullName,
      account.username,
      account.role,
      ROLE_LABELS[account.role] || "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });

  if (!visible.length) {
    table.innerHTML = '<tr><td class="empty-row" colspan="7">No accounts match this search.</td></tr>';
    return;
  }

  table.innerHTML = visible
    .map(
      (account) => `
        <tr>
          <td>${account.fullName || "&mdash;"}</td>
          <td><strong>${account.username}</strong></td>
          <td>${ROLE_LABELS[account.role] || account.role}</td>
          <td>${statusBadge(account)}</td>
          <td>${account.lastLoginAt ? fmtDate(account.lastLoginAt) : "Never"}</td>
          <td>${account.createdAt ? fmtDate(account.createdAt) : "&mdash;"}</td>
          <td class="row-actions">
            <button type="button" class="btn-link" data-action="password" data-id="${account.id}">Reset password</button>
            <button type="button" class="btn-link" data-action="toggle" data-id="${account.id}">
              ${account.isActive ? "Deactivate" : "Activate"}
            </button>
            <button type="button" class="btn-link danger" data-action="delete" data-id="${account.id}">Delete</button>
          </td>
        </tr>`
    )
    .join("");
}

function renderSummary() {
  document.getElementById("totalAccounts").textContent = accounts.length;
  document.getElementById("adminCount").textContent = accounts.filter(
    (a) => a.role === "admin"
  ).length;
  document.getElementById("teacherCount").textContent = accounts.filter(
    (a) => a.role === "teacher"
  ).length;
  document.getElementById("activeCount").textContent = accounts.filter(
    (a) => a.isActive
  ).length;
}

async function loadAccounts() {
  try {
    const data = await API.get("/auth/users");
    accounts = data.users || [];
    renderTable();
    renderSummary();
  } catch (err) {
    table.innerHTML = `<tr><td class="empty-row" colspan="7">${err.message}</td></tr>`;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = validateForm();
  if (!payload) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    await API.post("/auth/users", payload);
    toast(`Account "${payload.username}" created.`, "success");
    form.reset();
    clearAllErrors();
    await loadAccounts();
  } catch (err) {
    toast(err.message, "error");
    if (/username/i.test(err.message)) showError("username", err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

[usernameInput, passwordInput, confirmInput].forEach((input) => {
  input.addEventListener("input", () => clearError(input.id));
});

roleInput.addEventListener("change", () => clearError("role"));

searchInput.addEventListener("input", renderTable);
filterRole.addEventListener("change", renderTable);

table.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const account = accounts.find((a) => a.id === button.dataset.id);
  if (!account) return;

  if (button.dataset.action === "password") {
    const next = window.prompt(
      `New password for "${account.username}" (at least ${PASSWORD_MIN} characters):`
    );
    if (next === null) return;

    try {
      await API.put(`/auth/users/${account.id}`, { password: next });
      toast("Password updated.", "success");
    } catch (err) {
      toast(err.message, "error");
    }
    return;
  }

  if (button.dataset.action === "toggle") {
    try {
      await API.put(`/auth/users/${account.id}`, { isActive: !account.isActive });
      toast(
        account.isActive ? "Account deactivated." : "Account activated.",
        "success"
      );
      await loadAccounts();
    } catch (err) {
      toast(err.message, "error");
    }
    return;
  }

  if (button.dataset.action === "delete") {
    if (!window.confirm(`Delete the account "${account.username}" permanently?`)) {
      return;
    }

    try {
      await API.del(`/auth/users/${account.id}`);
      toast("Account deleted.", "success");
      await loadAccounts();
    } catch (err) {
      toast(err.message, "error");
    }
  }
});

loadAccounts();
