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
// SEARCH SALARY RECORDS
// ============================

const searchSalary = document.getElementById("searchSalary");
const salaryTable = document.getElementById("salaryTable");

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