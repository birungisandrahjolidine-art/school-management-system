
// ELEMENTS//
const approvalTable = document.getElementById("approvalTable");
let approvalRecords = [];

// CURRENT DATE

const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});


// HELPERS

function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function statusDisplay(status) {
  return status === "Paid" ? "Cleared" : String(status || "Pending");
}

function statusClass(status) {
  return status === "Paid" ? "cleared" : String(status || "pending").toLowerCase();
}


// RENDER APPROVAL TABLE

function renderApprovalTable() {
  approvalTable.innerHTML = approvalRecords.map(function (r) {
    const t = r.teacher || {};

    return `<tr>
      <td>${escapeHtml(t.teacherId || "")}</td>
      <td>${escapeHtml(t.name)}</td>
      <td>${escapeHtml(t.subject)}</td>
      <td>${escapeHtml(t["class"])}</td>
      <td>${escapeHtml(r.netSalary != null ? fmtUGX(r.netSalary) : "")}</td>
      <td>${escapeHtml(r.salaryMonth || "")}</td>
      <td>${escapeHtml(r.paymentDate ? fmtDate(r.paymentDate) : "")}</td>
      <td><span class="status ${escapeHtml(statusClass(r.status))}">${escapeHtml(statusDisplay(r.status))}</span></td>
      <td>
        <button class="view-btn">View</button>
        <button class="approve-btn" data-id="${escapeHtml(r._id)}">Approve</button>
        <button class="reject-btn" data-id="${escapeHtml(r._id)}">Reject</button>
      </td>
    </tr>`;
  }).join("");
}

function loadApprovalRecords() {
  return API.get("/api/salary-payments")
    .then(function (records) {
      approvalRecords = records;
      renderApprovalTable();
      updateSummaryCards();
    });
}


// UPDATE SUMMARY CARDS//

function updateSummaryCards() {
  let pendingCount = 0;
  let clearedCount = 0;
  let rejectedCount = 0;
  let pendingAmount = 0;

  approvalRecords.forEach(function (r) {
    const status = r.status;
    const amount = parseInt(r.netSalary, 10) || parseInt(r.netPaidOut, 10) || 0;

    if (status === "Pending") {
      pendingCount++;
      pendingAmount += amount;
    } else if (status === "Paid") {
      clearedCount++;
    } else if (status === "Rejected") {
      rejectedCount++;
    }
  });

  document.getElementById("pendingApproval").textContent = pendingCount;
  document.getElementById("clearedPayments").textContent = clearedCount;
  document.getElementById("rejectedCount").textContent = rejectedCount;
  document.getElementById("totalAmountPending").textContent = fmtUGX(pendingAmount);
}


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

  if (target.classList.contains("approve-btn") || target.classList.contains("reject-btn")) {
    const id = target.getAttribute("data-id");
    if (!id) return;

    const newStatus = target.classList.contains("approve-btn") ? "Paid" : "Pending";

    const record = approvalRecords.find(function (r) { return r._id === id; });
    const name = record && record.teacher ? record.teacher.name : "";

    API.put("/api/salary-payments/" + id, { status: newStatus })
      .then(function () {
        toast("Salary payment updated", "success");
        return loadApprovalRecords();
      })
      .catch(function (err) {
        toast(err.message || "Failed to update salary payment", "error");
      });
    return;
  }

  const cells = row.cells;
  const teacherName = cells[1].textContent;
  const netSalary = cells[4].textContent;

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
});


// INITIALIZE

loadApprovalRecords().catch(function (err) {
  toast(err.message || "Failed to load salary records", "error");
});
