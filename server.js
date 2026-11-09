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

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));


// =========================
// API ROUTES
// =========================

app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/restocks", restockRoutes);
app.use("/api/lost-books", lostBookRoutes);
app.use("/api/fee-payments", feePaymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/teacher-attendance", teacherAttendanceRoutes);
app.use("/api/student-attendance", studentAttendanceRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);
app.use("/api/salary-payments", salaryPaymentRoutes);
app.use("/api/announcements", announcementRoutes);


// =========================
// PAGE ROUTES
// =========================

// Login
app.get("/", (req, res) => {
  res.render("login");
});


app.get("/students", (req, res) => {
  res.render("students");
});
// app.get("/test", (req, res) => {
//   res.send("TEST ROUTE IS WORKING");
// });
// Dashboard
app.get("/dashboard.pug", (req, res) => {
  res.render("students/dashboard");
});


// Attendance
app.get("/attendance.pug", (req, res) => {
  res.render("students/attendance");
});


// Landing / home page
app.get("/home", (req, res) => {
  res.render("index");
});


// Role portals. Accepts extensions so existing relative links keep working,
// e.g. both /teachers/dashboard and /teachers/teachers_dashboard.pug.
const portalFolders = ["teachers", "bursar", "students"];

portalFolders.forEach((folder) => {
  app.get(`/${folder}/:page`, (req, res, next) => {
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


// Top-level pages
const rootPages = ["library", "login", "report", "settings", "signout", "students"];

app.get("/:page", (req, res, next) => {
  const page = req.params.page.replace(/\.pug$/i, "");

  if (!rootPages.includes(page)) {
    return next();
  }

  res.render(page);
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