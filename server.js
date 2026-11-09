require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const bookRoutes = require("./routes/bookRoutes");
const loanRoutes = require("./routes/loanRoutes");
const restockRoutes = require("./routes/restockRoutes");
const lostBookRoutes = require("./routes/lostBookRoutes");
const feePaymentRoutes = require("./routes/feePaymentRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const teacherAttendanceRoutes = require("./routes/teacherAttendanceRoutes");
const studentAttendanceRoutes = require("./routes/studentAttendanceRoutes");
const leaveRequestRoutes = require("./routes/leaveRequestRoutes");
const salaryPaymentRoutes = require("./routes/salaryPaymentRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const authRoutes = require("./routes/authRoutes");

const auth = require("./middleware/auth");

const app = express();

connectDB();


// =========================
// VIEW ENGINE
// =========================

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());

// The project root is served statically so /styles.css keeps working, but it
// must never expose source code or configuration files.
const blockedPaths = [
  /^\/(?:server|seed|seedAdmin|verifyInline)\.js$/i,
  /^\/package(?:-lock)?\.json$/i,
  /^\/\.env/i,
  /^\/(?:routes|models|controllers|middleware|config|views)\//i,
];

app.use((req, res, next) => {
  if (blockedPaths.some((pattern) => pattern.test(req.path))) {
    return res.status(404).send("Page not found");
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));


// =========================
// API ROUTES
// =========================

app.use("/api/auth", authRoutes);


// =========================
// API ROUTES
// =========================

// Signed-in users see their own session; nothing else works without one.
app.use("/api", auth.requireAuth);

app.use("/api/students", auth.requireRole("admin", "teacher", "bursar"), studentRoutes);
app.use("/api/teachers", auth.requireRole("admin", "teacher"), teacherRoutes);
app.use("/api/books", auth.requireRole("admin", "librarian"), bookRoutes);
app.use("/api/loans", auth.requireRole("admin", "librarian"), loanRoutes);
app.use("/api/restocks", auth.requireRole("admin", "librarian"), restockRoutes);
app.use("/api/lost-books", auth.requireRole("admin", "librarian"), lostBookRoutes);
app.use("/api/fee-payments", auth.requireRole("admin", "bursar"), feePaymentRoutes);
app.use("/api/expenses", auth.requireRole("admin", "bursar"), expenseRoutes);
app.use("/api/teacher-attendance", auth.requireRole("admin", "teacher"), teacherAttendanceRoutes);
app.use("/api/student-attendance", auth.requireRole("admin", "teacher"), studentAttendanceRoutes);
app.use("/api/leave-requests", auth.requireRole("admin", "teacher"), leaveRequestRoutes);
app.use("/api/salary-payments", auth.requireRole("admin", "teacher", "bursar"), salaryPaymentRoutes);
app.use("/api/announcements", announcementRoutes);


// =========================
// PAGE ROUTES
// =========================

const { loadCurrentUser, redirectForRole, requireAuth, requireRole } = auth;

// Sign-in. Already-authenticated visitors go straight to their own dashboard.
app.get("/", loadCurrentUser, (req, res) => {
  res.redirect(req.user ? redirectForRole(req.user.role) : "/teachers/login");
});

app.get(["/login", "/login.pug"], loadCurrentUser, (req, res) => {
  res.redirect(req.user ? redirectForRole(req.user.role) : "/teachers/login");
});

app.get(["/teachers/login", "/teachers/login.pug"], loadCurrentUser, (req, res) => {
  if (req.user) {
    return res.redirect(redirectForRole(req.user.role));
  }
  res.render("teachers/login");
});

// Public landing page
app.get("/home", loadCurrentUser, (req, res) => {
  res.render("index", { currentUser: req.user });
});

// Admin-only user management
app.get("/admin/users", requireRole("admin"), (req, res) => {
  res.render("admin/users", { currentUser: req.user });
});

// Student portal pages (admin and teachers manage them)
app.get("/students", requireRole("admin", "teacher"), (req, res) => {
  res.render("students");
});

app.get("/dashboard.pug", requireRole("admin", "teacher"), (req, res) => {
  res.render("students/dashboard");
});

app.get("/attendance.pug", requireRole("admin", "teacher"), (req, res) => {
  res.render("students/attendance");
});


// Role portals. Accepts extensions so existing relative links keep working,
// e.g. both /teachers/dashboard and /teachers/teachers_dashboard.pug.
const portalFolders = ["teachers", "bursar", "students"];

const portalRoles = {
  teachers: ["teacher", "admin"],
  bursar: ["bursar", "admin"],
  students: ["admin", "teacher"],
};

const publicPortalPages = new Set(["logout"]);

portalFolders.forEach((folder) => {
  const guard = requireRole(...portalRoles[folder]);

  app.get(`/${folder}/:page`, (req, res, next) => {
    const page = req.params.page.replace(/\.pug$/i, "");

    if (!/^[a-zA-Z0-9_-]+$/.test(page)) {
      return next();
    }

    if (publicPortalPages.has(page.toLowerCase())) {
      return next();
    }

    guard(req, res, next);
  }, (req, res, next) => {
    const page = req.params.page.replace(/\.pug$/i, "");

    if (!/^[a-zA-Z0-9_-]+$/.test(page)) {
      return next();
    }

    const candidates = [`${page}.pug`];

    if (page === "dashboard") {
      candidates.push(`${folder}_dashboard.pug`);
    }

    const view = candidates.find((file) =>
      fs.existsSync(path.join(__dirname, "views", folder, file))
    );

    if (!view) {
      return next();
    }

    res.render(`${folder}/${view.replace(/\.pug$/i, "")}`);
  });
});


// Signing out clears the session cookie
app.get("/signout", (req, res) => {
  auth.clearSessionCookie(res);
  res.render("signout");
});


// Top-level pages
const rootPages = {
  library: ["admin", "librarian"],
  report: ["admin", "teacher"],
  students: ["admin", "teacher"],
};

app.get("/settings", requireAuth, (req, res) => {
  res.render("settings");
});

app.get("/:page", (req, res, next) => {
  const page = req.params.page.replace(/\.pug$/i, "");
  const allowed = rootPages[page];

  if (!allowed) {
    return next();
  }

  requireRole(...allowed)(req, res, () => res.render(page));
});


// =========================
// 404 HANDLER
// =========================

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "Route not found"
    });
  }

  res.status(404).send("Page not found");
});


// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});