const fs = require("fs");
const path = require("path");

const files = [
  "students.html", "library.html", "settings.html", "login.html", "report.html",
  "public/bursar/bursar_dashboard.html",
  "public/bursar/students_fees.html",
  "public/bursar/fee_payment.html",
  "public/bursar/expenses.html",
  "public/bursar/finance_reports.html",
  "public/teachers/teachers_list.html",
  "public/teachers/teachers_profile.html",
  "public/teachers/teachers_dashboard.html",
  "public/teachers/teachers_attendence.html",
  "public/teachers/teachers_mark_attendance.html",
  "public/teachers/teachers_leave_management.html",
  "public/teachers/teachers_salary.html",
  "public/teachers/teachers_salary_approval.html",
  "public/teachers/teachers_salary_payment.html",
  "public/teachers/teachers_refform.html",
  "public/teachers/edit_teachers.html",
  "public/students/dashboard.html",
  "public/students/attendance.html",
  "public/students/announcements.html",
  "public/students/help-center.html",
];

let failures = 0;
for (const f of files) {
  const full = path.join(__dirname, f);
  if (!fs.existsSync(full)) { console.log("MISSING:", f); failures++; continue; }
  const html = fs.readFileSync(full, "utf8");
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m, count = 0;
  while ((m = re.exec(html)) !== null) {
    const code = m[1];
    if (!code.trim()) continue;
    count++;
    try {
      new Function(code);
    } catch (e) {
      failures++;
      console.log("SYNTAX ERROR in", f, "inline script #", count, ":", e.message);
    }
  }
  console.log((count ? "OK" : "no-inline") + ` ${f} (${count} inline scripts)`);
}
console.log(failures ? `\n${failures} ERRORS` : "\nALL INLINE SCRIPTS VALID");
process.exit(failures ? 1 : 0);
