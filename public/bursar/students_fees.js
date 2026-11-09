// CURRENT DATE

var currentDate = document.getElementById("currentDate");
var today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

// ELEMENTS

var studentFeesTable = document.getElementById("studentFeesTable");
var searchStudent = document.getElementById("searchStudent");
var filterStatus = document.getElementById("filterStatus");
var allData = [];

// PARSE AMOUNT FROM TEXT

function parseAmount(text) {
  return parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
}

// UPDATE SUMMARY CARDS (from visible rows)

function updateSummaryCards() {
  var rows = studentFeesTable.querySelectorAll("tr");
  var expected = 0;
  var collected = 0;
  var outstanding = 0;
  var visibleCount = 0;

  rows.forEach(function (row) {
    if (row.style.display === "none") return;
    expected += parseAmount(row.cells[3].textContent);
    collected += parseAmount(row.cells[4].textContent);
    outstanding += parseAmount(row.cells[5].textContent);
    visibleCount++;
  });

  document.getElementById("totalStudents").textContent = visibleCount;
  document.getElementById("totalExpected").textContent = fmtUGX(expected);
  document.getElementById("totalCollected").textContent = fmtUGX(collected);
  document.getElementById("totalOutstanding").textContent = fmtUGX(outstanding);
}

// RENDER TABLE

function renderStudentFees(data) {
  studentFeesTable.innerHTML = "";

  if (data.length === 0) {
    studentFeesTable.innerHTML = '<tr><td colspan="8" style="text-align:center;">No student fee records found</td></tr>';
    return;
  }

  data.forEach(function (entry) {
    var s = entry.student || {};
    var statusClass = entry.status ? entry.status.toLowerCase() : "unpaid";

    var paymentsHtml = "";
    if (entry.payments && entry.payments.length > 0) {
      paymentsHtml = '<div class="payments-list">';
      entry.payments.forEach(function (pm) {
        paymentsHtml += '<span class="payment-item">' + fmtDate(pm.paymentDate) + " — " + fmtUGX(pm.amountPaid) + "</span>";
      });
      paymentsHtml += "</div>";
    } else {
      paymentsHtml = '<div class="payments-list"><span class="payment-item none">No payments yet</span></div>';
    }

    var row = studentFeesTable.insertRow(-1);
    row.innerHTML =
      "<td>" + escapeHtml(s.studentId || "—") + "</td>" +
      "<td>" + escapeHtml(s.name || "—") + "</td>" +
      "<td>" + escapeHtml(s.class || "—") + "</td>" +
      "<td>" + fmtUGX(entry.totalFees) + "</td>" +
      "<td>" + fmtUGX(entry.totalPaid) + "</td>" +
      "<td>" + fmtUGX(entry.balanceDue) + "</td>" +
      "<td>" + paymentsHtml + "</td>" +
      '<td><span class="status ' + statusClass + '">' + escapeHtml(entry.status) + "</span></td>";
  });
}

// LOAD DATA FROM API

async function loadStudentFees() {
  try {
    allData = await API.get("/api/fee-payments/students");
    renderStudentFees(allData);
    updateSummaryCards();
  } catch (err) {
    console.error("Failed to load student fees:", err);
  }
}

loadStudentFees();

// SEARCH AND FILTER

function filterAndRender() {
  var searchValue = searchStudent.value.toLowerCase();
  var selectedStatus = filterStatus.value.toLowerCase();

  var filtered = allData.filter(function (entry) {
    var s = entry.student || {};
    var rowText = ((s.studentId || "") + " " + (s.name || "") + " " + (s.class || "")).toLowerCase();
    var matchSearch = !searchValue || rowText.indexOf(searchValue) !== -1;
    var matchStatus = !selectedStatus || (entry.status && entry.status.toLowerCase() === selectedStatus);
    return matchSearch && matchStatus;
  });

  renderStudentFees(filtered);
  updateSummaryCards();
}

searchStudent.addEventListener("input", function () {
  filterAndRender();
});

filterStatus.addEventListener("change", function () {
  filterAndRender();
});
