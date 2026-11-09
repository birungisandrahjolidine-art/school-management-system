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

// LOAD DASHBOARD DATA FROM API

async function loadDashboard() {
  try {
    var results = await Promise.all([
      API.get("/api/fee-payments/summary"),
      API.get("/api/fee-payments"),
      API.get("/api/fee-payments/students")
    ]);

    var summary = results[0];
    var feePayments = results[1];
    var studentLedger = results[2];

    // Summary cards
    document.getElementById("totalCollectedValue").textContent = fmtUGX(summary.totalCollected);
    document.getElementById("pendingFeesValue").textContent = fmtUGX(summary.totalOutstanding);

    // Payments today
    var todayStr = todayISO();
    var todayCount = feePayments.filter(function (p) {
      return p.paymentDate && p.paymentDate.substring(0, 10) === todayStr;
    }).length;
    document.getElementById("paymentsTodayValue").textContent = todayCount;

    // Outstanding students (Partial or Unpaid)
    var outstandingCount = studentLedger.filter(function (s) {
      return s.status === "Partial" || s.status === "Unpaid";
    }).length;
    document.getElementById("outstandingStudentsValue").textContent = outstandingCount;

    // Fees by class (aggregate totalPaid from student ledger)
    var classTotals = {};
    studentLedger.forEach(function (entry) {
      var cls = entry.student && entry.student.class ? entry.student.class : "";
      if (cls) {
        classTotals[cls] = (classTotals[cls] || 0) + (entry.totalPaid || 0);
      }
    });

    var classSelectors = ["S1", "S2", "S3", "S4", "S5", "S6"];
    classSelectors.forEach(function (cls) {
      var el = document.querySelector(".fill-" + cls.toLowerCase());
      if (el) {
        el.textContent = fmtUGX(classTotals[cls] || 0);
      }
    });

    // Recent transactions table (newest first, max 6)
    var sorted = feePayments.slice().sort(function (a, b) {
      return new Date(b.paymentDate) - new Date(a.paymentDate);
    });
    var recent = sorted.slice(0, 6);

    var tbody = document.getElementById("transactionsTable");
    tbody.innerHTML = "";

    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No transactions yet</td></tr>';
      return;
    }

    recent.forEach(function (p) {
      var statusClass = "pending";
      if (p.status === "Paid") statusClass = "paid";
      else if (p.status === "Partial") statusClass = "partial";

      var row = tbody.insertRow(-1);
      row.innerHTML =
        "<td>" + escapeHtml(p.receiptNo || "—") + "</td>" +
        "<td>" + escapeHtml(p.student && p.student.name ? p.student.name : "—") + "</td>" +
        "<td>" + escapeHtml(p.student && p.student.class ? p.student.class : "—") + "</td>" +
        "<td>" + escapeHtml(p.feeType || "—") + "</td>" +
        "<td>" + fmtUGX(p.amountPaid) + "</td>" +
        "<td>" + fmtDate(p.paymentDate) + "</td>" +
        '<td><span class="status ' + statusClass + '">' + escapeHtml(p.status) + "</span></td>";
    });
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }
}

loadDashboard();
