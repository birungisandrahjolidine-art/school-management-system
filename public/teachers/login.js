
// LOGIN FORM VALIDATION //

const loginForm = document.getElementById("loginForm");
const redirectNotice = document.getElementById("redirectNotice");
const submitBtn = document.querySelector(".btn-login");

const roleField = document.getElementById("role");
const usernameField = document.getElementById("username");
const passwordField = document.getElementById("password");
const rememberMe = document.getElementById("rememberMe");

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

const PASSWORD_MIN = 6;
const PASSWORD_MAX = 64;

// Role destination mapping
const roleDestinations = {
  teacher: "/teachers/dashboard",
  admin: "/students/dashboard.pug",
  student: "/students/dashboard.pug",
  librarian: "/library.pug",
  bursar: "/bursar/dashboard"
};

// Roles whose dashboards are not built yet
const underConstruction = [
  "/students/dashboard.pug",
  "/library.pug"
];

// =========================
// FIELD RULES
// =========================

const rules = {
  role: {
    field: roleField,
    error: document.getElementById("roleError"),
    validate: function (value) {
      if (!value) {
        return "Please select your role.";
      }
      if (!roleDestinations[value]) {
        return "That role is not available.";
      }
      return "";
    }
  },

  username: {
    field: usernameField,
    error: document.getElementById("usernameError"),
    validate: function (value, raw) {
      if (!value) {
        return "Username or staff ID is required.";
      }
      if (raw !== value) {
        return "Username cannot start or end with a space.";
      }
      if (value.length < USERNAME_MIN) {
        return `Username must be at least ${USERNAME_MIN} characters.`;
      }
      if (value.length > USERNAME_MAX) {
        return `Username must be at most ${USERNAME_MAX} characters.`;
      }
      if (!USERNAME_PATTERN.test(value)) {
        return "Use only letters, numbers, dots, hyphens and underscores.";
      }
      return "";
    }
  },

  password: {
    field: passwordField,
    error: document.getElementById("passwordError"),
    validate: function (value) {
      if (!value) {
        return "Password is required.";
      }
      if (value.length < PASSWORD_MIN) {
        return `Password must be at least ${PASSWORD_MIN} characters.`;
      }
      if (value.length > PASSWORD_MAX) {
        return `Password must be at most ${PASSWORD_MAX} characters.`;
      }
      return "";
    }
  }
};

// =========================
// ERROR HELPERS
// =========================

function showError(name, message) {
  const rule = rules[name];
  rule.error.textContent = message;
  rule.error.classList.add("show");
  rule.field.setAttribute("aria-invalid", "true");
  rule.field.closest(".form-group").classList.add("has-error");
}

function clearError(name) {
  const rule = rules[name];
  rule.error.textContent = "";
  rule.error.classList.remove("show");
  rule.field.removeAttribute("aria-invalid");
  rule.field.closest(".form-group").classList.remove("has-error");
}

function validateField(name) {
  const rule = rules[name];
  const raw = rule.field.value;
  const value = name === "password" ? raw : raw.trim();
  const message = rule.validate(value, raw);

  if (message) {
    showError(name, message);
  } else {
    clearError(name);
  }

  return !message;
}

function validateForm() {
  // Validate every field so all problems surface at once
  const results = Object.keys(rules).map(validateField);
  return results.every(Boolean);
}

// =========================
// LIVE FEEDBACK
// =========================

Object.keys(rules).forEach(function (name) {
  const field = rules[name].field;
  const eventName = name === "role" ? "change" : "input";

  field.addEventListener(eventName, function () {
    // After a field is marked invalid, re-check it as the user types
    if (!field.closest(".form-group").classList.contains("has-error")) {
      return;
    }
    validateField(name);
  });

  field.addEventListener("blur", function () {
    validateField(name);
  });
});

// =========================
// SUBMIT
// =========================

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  redirectNotice.textContent = "";
  redirectNotice.classList.remove("error");

  if (!validateForm()) {
    const firstInvalid = loginForm.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return;
  }

  const role = roleField.value;
  const username = usernameField.value.trim();
  const destination = roleDestinations[role];
  const roleName = roleField.selectedOptions[0].textContent.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in...";

  if (underConstruction.includes(destination)) {
    redirectNotice.textContent =
      `${roleName} dashboard is under construction. ` +
      `Please check back soon.`;

    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";
    return;
  }

  redirectNotice.textContent =
    `Signing in as ${roleName}... ` +
    `Welcome back, ${username}!`;

  // Remember me
  if (rememberMe.checked) {
    localStorage.setItem("edusphere_username", username);
    localStorage.setItem("edusphere_role", role);
  } else {
    localStorage.removeItem("edusphere_username");
    localStorage.removeItem("edusphere_role");
  }

  setTimeout(function () {
    window.location.href = destination;
  }, 1500);
});



// =========================
// RESTORE SAVED LOGIN
// =========================

const savedUsername = localStorage.getItem("edusphere_username");
const savedRole = localStorage.getItem("edusphere_role");

if (savedUsername) {
  usernameField.value = savedUsername;
  rememberMe.checked = true;
}

if (savedRole && roleDestinations[savedRole]) {
  roleField.value = savedRole;
}