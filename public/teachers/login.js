
// LOGIN FORM//


const loginForm = document.getElementById("loginForm");
const redirectNotice = document.getElementById("redirectNotice");

// Role destination mapping
const roleDestinations = {
  teacher: "teachers_dashboard.html",
  admin: "admin_dashboard.html",
  student: "students_dashboard.html",
  librarian: "librarian_dashboard.html",
  bursar: "../bursar/bursar_dashboard.html"
};

// Roles whose dashboards are not built yet
const underConstruction = [
  "admin_dashboard.html",
  "students_dashboard.html",
  "librarian_dashboard.html"
];

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!role || !username || !password) {
    alert("Please fill in all fields: role, username and password.");
    return;
  }

  const submitBtn = document.querySelector(".btn-login");
  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in...";

  const destination = roleDestinations[role];
  const roleName = document.getElementById("role")
    .selectedOptions[0]
    .textContent;

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
  const rememberMe = document.getElementById("rememberMe");

  if (rememberMe.checked) {
    localStorage.setItem("schoolms_username", username);
  } else {
    localStorage.removeItem("schoolms_username");
  }

  setTimeout(function () {
    window.location.href = destination;
  }, 1500);
});



// RESTORE SAVED USERNAME//


const savedUsername = localStorage.getItem("schoolms_username");

if (savedUsername) {
  document.getElementById("username").value = savedUsername;
  document.getElementById("rememberMe").checked = true;
}