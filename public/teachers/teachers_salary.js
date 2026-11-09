// ============================
// CURRENT DATE
// ============================

const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});


// ============================
// SALARY PAYMENTS DATA
// ============================

const salaryTable = document.getElementById("salaryTable");
let salaryRecords = [];

function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function renderSalaryTable() {
  salaryTable.innerHTML = salaryRecords.map(function (r) {
    const t = r.teacher || {};
    const statusClass = String(r.status).toLowerCase();

    return `<tr>
      <td>${escapeHtml(t.teacherId || "")}</td>
      <td>${escapeHtml(t.name)}</td>
      <td>${escapeHtml(t.subject)}</td>
      <td>${escapeHtml(t["class"])}</td>
      <td>${escapeHtml(r.netSalary != null ? fmtUGX(r.netSalary) : "")}</td>
      <td>--</td>
      <td>${escapeHtml(r.taxAmount != null ? fmtUGX(r.taxAmount) : "")}</td>
      <td>${escapeHtml(r.netPaidOut != null ? fmtUGX(r.netPaidOut) : "")}</td>
      <td><span class="status ${escapeHtml(statusClass)}">${escapeHtml(r.status)}</span></td>
      <td>
        <button class="view-btn">View</button>
        <button class="print-btn">Payslip</button>
      </td>
    </tr>`;
  }).join("");
}

function loadSalaryRecords() {
  return API.get("/api/salary-payments")
    .then(function (records) {
      salaryRecords = records;
      renderSalaryTable();
    });
}


// ============================
// SUMMARY CARDS
// ============================

function loadSummary() {
  Promise.all([
    API.get("/api/salary-payments/summary"),
    API.get("/api/teachers")
  ]).then(function (results) {
    const summary = results[0] || {};
    const teachers = results[1] || [];

    document.getElementById("monthlyBudget").textContent = fmtUGX(summary.totalPaid || 0);
    document.getElementById("paidThisMonth").textContent = fmtUGX(summary.totalPaid || 0);
    document.getElementById("pendingPayment").textContent = fmtUGX(summary.totalPending || 0);
    document.getElementById("totalTeachersSalary").textContent = teachers.length;
  }).catch(function (err) {
    toast(err.message || "Failed to load summary", "error");
  });
}


// ============================
// SEARCH SALARY RECORDS
// ============================

const searchSalary = document.getElementById("searchSalary");

searchSalary.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();

  const rows = salaryTable.querySelectorAll("tr");

  rows.forEach(function (row) {
    const rowText = row.textContent.toLowerCase();

    if (rowText.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});


// ============================
// FILTER BY PAYMENT STATUS
// ============================

const filterStatus = document.getElementById("filterStatus");

filterStatus.addEventListener("change", function () {
  const selectedStatus = this.value.toLowerCase();

  const rows = salaryTable.querySelectorAll("tr");

  rows.forEach(function (row) {
    const statusElement = row.querySelector(".status");

    if (!statusElement) return;

    const status = statusElement.textContent.toLowerCase();

    if (!selectedStatus || status === selectedStatus) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});


// ============================
// VIEW / PAYSLIP BUTTONS
// ============================

salaryTable.addEventListener("click", function (event) {
  const target = event.target;
  const row = target.closest("tr");

  if (!row) return;

  const cells = row.cells;

  if (target.classList.contains("view-btn")) {
    alert(
      `Teacher ID: ${cells[0].textContent}\n` +
      `Name: ${cells[1].textContent}\n` +
      `Subject: ${cells[2].textContent}\n` +
      `Class: ${cells[3].textContent}\n` +
      `Basic Salary: ${cells[4].textContent}\n` +
      `Allowances: ${cells[5].textContent}\n` +
      `Deductions: ${cells[6].textContent}\n` +
      `Net Salary: ${cells[7].textContent}\n` +
      `Payment Status: ${cells[8].textContent}`
    );
  }

  if (target.classList.contains("print-btn")) {
    window.print();
  }
});


// ============================
// INITIALIZE
// ============================

loadSalaryRecords()
  .then(function () {
    loadSummary();
  })
  .catch(function (err) {
    toast(err.message || "Failed to load salaries", "error");
  });
