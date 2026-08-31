
// ELEMENTS//
const approvalTable = document.getElementById("approvalTable");

// CURRENT DATE

const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

// UPDATE SUMMARY CARDS//

function updateSummaryCards() {
  const rows = approvalTable.querySelectorAll("tr");

  let pendingCount = 0;
  let clearedCount = 0;
  let rejectedCount = 0;
  let pendingAmount = 0;

  rows.forEach(function (row) {
    const statusElement = row.querySelector(".status");
    if (!statusElement) return;

    const status = statusElement.textContent.toLowerCase();
    const salaryElement = row.cells[4];
    const salary = parseInt(salaryElement.textContent.replace(/[^0-9]/g, ""), 10) || 0;

    if (status === "pending") {
      pendingCount++;
      pendingAmount += salary;
    } else if (status === "cleared") {
      clearedCount++;
    } else if (status === "rejected") {
      rejectedCount++;
    }
  });

  const cards = document.querySelectorAll(".summary-card p");

  cards[0].textContent = pendingCount;
  cards[1].textContent = clearedCount;
  cards[2].textContent = rejectedCount;
  cards[3].textContent = "UGX " + pendingAmount.toLocaleString("en-UG");
}

updateSummaryCards();

// SEARCH APPROVAL RECORDS//

const searchApproval = document.getElementById("searchApproval");

searchApproval.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();

  const rows = approvalTable.querySelectorAll("tr");

  rows.forEach(function (row) {
    const rowText = row.textContent.toLowerCase();

    if (rowText.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

// FILTER BY STATUS//

const filterStatus = document.getElementById("filterStatus");

filterStatus.addEventListener("change", function () {
  const selectedStatus = this.value.toLowerCase();

  const rows = approvalTable.querySelectorAll("tr");

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

// APPROVE / REJECT BUTTONS//
approvalTable.addEventListener("click", function (event) {
  const target = event.target;
  const row = target.closest("tr");

  if (!row) return;

  const cells = row.cells;
  const statusCell = row.querySelector(".status");
  const teacherName = cells[1].textContent;
  const netSalary = cells[4].textContent;

  if (target.classList.contains("approve-btn")) {
    statusCell.textContent = "Cleared";
    statusCell.className = "status cleared";

    alert(`Salary for ${teacherName} (${netSalary}) has been approved and cleared.`);
  }

  if (target.classList.contains("reject-btn")) {
    const confirmReject = confirm(
      `Are you sure you want to reject the salary payment for ${teacherName}?`
    );

    if (confirmReject) {
      statusCell.textContent = "Rejected";
      statusCell.className = "status rejected";

      alert(`Salary payment for ${teacherName} has been rejected.`);
    }
  }

  if (target.classList.contains("view-btn")) {
    alert(
      `Teacher ID: ${cells[0].textContent}\n` +
      `Name: ${cells[1].textContent}\n` +
      `Subject: ${cells[2].textContent}\n` +
      `Class: ${cells[3].textContent}\n` +
      `Net Salary: ${cells[4].textContent}\n` +
      `Payment Month: ${cells[5].textContent}\n` +
      `Submission Date: ${cells[6].textContent}\n` +
      `Status: ${cells[7].textContent}`
    );
  }

  updateSummaryCards();
});