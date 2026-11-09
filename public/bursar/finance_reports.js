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

// DATE HELPERS

function toISO(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, "0");
  var d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

// PERIOD PRESETS

var startDate = document.getElementById("startDate");
var endDate = document.getElementById("endDate");

function setPreset(period) {
  if (period === "daily") {
    startDate.value = toISO(today);
    endDate.value = toISO(today);
  } else if (period === "weekly") {
    var weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    startDate.value = toISO(weekStart);
    endDate.value = toISO(today);
  } else if (period === "monthly") {
    var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate.value = toISO(monthStart);
    endDate.value = toISO(today);
  } else if (period === "termly") {
    var termStart = new Date(2026, 7, 1);
    startDate.value = toISO(termStart);
    endDate.value = toISO(today);
  }
}

setPreset("daily");

// PERIOD BUTTONS

var periodBtns = document.querySelectorAll(".period-btn");

periodBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    periodBtns.forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    setPreset(btn.dataset.period);
    generateReport();
  });
});

// GENERATE REPORT

var generateBtn = document.getElementById("generateBtn");
generateBtn.addEventListener("click", generateReport);

async function generateReport() {
  var from = new Date(startDate.value + "T00:00:00");
  var to = new Date(endDate.value + "T23:59:59");

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    toast("Please select both a start and end date.", "error");
    return;
  }

  if (from > to) {
    toast("Start date cannot be after the end date.", "error");
    return;
  }

  var transactions = [];

  try {
    var results = await Promise.all([
      API.get("/api/fee-payments"),
      API.get("/api/expenses")
    ]);

    var feePayments = results[0];
    var expenses = results[1];

    feePayments.forEach(function (p) {
      transactions.push({
        date: p.paymentDate ? p.paymentDate.substring(0, 10) : "",
        type: "income",
        ref: p.receiptNo || "—",
        description: (p.student && p.student.name ? p.student.name : "Student") + " - " + (p.feeType || "Fees"),
        amount: p.amountPaid || 0,
        category: p.feeType || "Fees"
      });
    });

    expenses.forEach(function (e) {
      var dateStr = "";
      if (e.date) {
        dateStr = typeof e.date === "string" ? e.date.substring(0, 10) : new Date(e.date).toISOString().substring(0, 10);
      }
      transactions.push({
        date: dateStr,
        type: "expense",
        ref: e.reference || "—",
        description: e.description || e.category || "Expense",
        amount: e.amount || 0,
        category: e.category || "Miscellaneous"
      });
    });
  } catch (err) {
    console.error("Failed to fetch report data:", err);
    toast("Failed to load report data.", "error");
    return;
  }

  var filtered = transactions.filter(function (txn) {
    var d = new Date(txn.date + "T00:00:00");
    return d >= from && d <= to;
  });

  var totalIncome = 0;
  var totalExpense = 0;
  var incomeByCategory = {};
  var expenseByCategory = {};
  var maxIncome = 0;
  var maxExpense = 0;

  filtered.forEach(function (txn) {
    if (txn.type === "income") {
      totalIncome += txn.amount;
      incomeByCategory[txn.category] = (incomeByCategory[txn.category] || 0) + txn.amount;
    } else {
      totalExpense += txn.amount;
      expenseByCategory[txn.category] = (expenseByCategory[txn.category] || 0) + txn.amount;
    }
  });

  Object.values(incomeByCategory).forEach(function (v) {
    maxIncome = Math.max(maxIncome, v);
  });
  Object.values(expenseByCategory).forEach(function (v) {
    maxExpense = Math.max(maxExpense, v);
  });

  // Update summary cards
  document.getElementById("totalIncome").textContent = fmtUGX(totalIncome);
  document.getElementById("totalExpense").textContent = fmtUGX(totalExpense);

  var net = totalIncome - totalExpense;
  var netBalance = document.getElementById("netBalance");
  netBalance.textContent = fmtUGX(Math.abs(net));
  netBalance.style.color = net >= 0 ? "#059669" : "#dc2626";

  document.getElementById("transactionCount").textContent = filtered.length;

  // Update breakdowns
  renderBreakdown("incomeBreakdown", incomeByCategory, maxIncome, "bar-income");
  renderBreakdown("expenseBreakdown", expenseByCategory, maxExpense, "bar-expense");

  document.getElementById("breakdownIncomeTotal").textContent = fmtUGX(totalIncome);
  document.getElementById("breakdownExpenseTotal").textContent = fmtUGX(totalExpense);

  // Update transactions table
  var reportTable = document.getElementById("reportTable");
  reportTable.innerHTML = "";

  if (filtered.length === 0) {
    reportTable.innerHTML = '<tr><td colspan="5" class="empty-row">No transactions found in the selected period.</td></tr>';
  } else {
    filtered.sort(function (a, b) {
      return a.date < b.date ? 1 : -1;
    });

    filtered.forEach(function (txn) {
      var row = reportTable.insertRow(-1);

      var formattedDate = new Date(txn.date).toLocaleDateString("en-UG", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      var typeClass = txn.type === "income" ? "type-income" : "type-expense";
      var typeLabel = txn.type === "income" ? "Income" : "Expense";
      var amountStr = txn.type === "income" ? "+ " + fmtUGX(txn.amount) : "- " + fmtUGX(txn.amount);

      row.innerHTML =
        "<td>" + formattedDate + "</td>" +
        '<td class="' + typeClass + '">' + typeLabel + "</td>" +
        "<td>" + escapeHtml(txn.ref) + "</td>" +
        "<td>" + escapeHtml(txn.description) + "</td>" +
        "<td>" + amountStr + "</td>";
    });
  }

  // Update period label
  document.getElementById("periodLabel").textContent =
    "Showing transactions from " + startDate.value + " to " + endDate.value;
}

function renderBreakdown(elementId, data, maxValue, barClass) {
  var container = document.getElementById(elementId);
  container.innerHTML = "";

  var keys = Object.keys(data);

  if (keys.length === 0) {
    container.innerHTML = '<p class="no-data">No transactions in this period.</p>';
    return;
  }

  keys.forEach(function (key) {
    var amount = data[key];
    var percent = maxValue > 0 ? Math.round((amount / maxValue) * 100) : 0;

    var row = document.createElement("div");
    row.className = "breakdown-row";
    row.innerHTML =
      "<strong>" + escapeHtml(key) + "</strong>" +
      '<div class="bar-wrap"><div class="bar ' + barClass + '" style="width: ' + percent + '%"></div></div>' +
      '<span class="amount">' + fmtUGX(amount) + "</span>";

    container.appendChild(row);
  });
}

// PRINT REPORT

var printBtn = document.getElementById("printBtn");

printBtn.addEventListener("click", function () {
  window.print();
});
