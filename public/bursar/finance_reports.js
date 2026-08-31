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
// SAMPLE TRANSACTIONS
// ============================

const transactions = [
  // Income (fee payments)
  { date: "2026-08-28", type: "income", ref: "RCP-1024", description: "Amanya Brian - School Fees", amount: 850000, category: "School Fees" },
  { date: "2026-08-28", type: "income", ref: "RCP-1023", description: "Nakato Esther - Tuition", amount: 700000, category: "Tuition" },
  { date: "2026-08-27", type: "income", ref: "RCP-1021", description: "Mukasa Dan - Boarding", amount: 950000, category: "Boarding" },
  { date: "2026-08-27", type: "income", ref: "RCP-1020", description: "Achieng Mercy - Tuition", amount: 650000, category: "Tuition" },
  { date: "2026-08-26", type: "income", ref: "RCP-1019", description: "Kato Joseph - School Fees", amount: 720000, category: "School Fees" },
  { date: "2026-08-25", type: "income", ref: "RCP-1018", description: "Okello Samuel - School Fees", amount: 320000, category: "School Fees" },
  { date: "2026-08-24", type: "income", ref: "RCP-1017", description: "Nambooze Faith - School Fees", amount: 600000, category: "School Fees" },
  { date: "2026-08-20", type: "income", ref: "RCP-1016", description: "Amanya Brian - School Fees", amount: 150000, category: "School Fees" },
  { date: "2026-08-18", type: "income", ref: "RCP-1015", description: "Nabirye Ruth - Tuition", amount: 400000, category: "Tuition" },
  { date: "2026-08-12", type: "income", ref: "RCP-1014", description: "Amanya Brian - School Fees", amount: 200000, category: "School Fees" },
  { date: "2026-08-10", type: "income", ref: "RCP-1013", description: "Mukasa Dan - Boarding", amount: 450000, category: "Boarding" },
  { date: "2026-08-05", type: "income", ref: "RCP-1012", description: "Nambooze Faith - School Fees", amount: 500000, category: "School Fees" },

  // Expenses
  { date: "2026-08-28", type: "expense", ref: "EXP-1001", description: "Electricity bill (UMEME)", amount: 850000, category: "Utilities" },
  { date: "2026-08-27", type: "expense", ref: "EXP-1002", description: "Repair of windows - S3 block", amount: 420000, category: "Maintenance & Repairs" },
  { date: "2026-08-27", type: "expense", ref: "EXP-1003", description: "Fuel for school bus", amount: 600000, category: "Transport" },
  { date: "2026-08-26", type: "expense", ref: "EXP-1004", description: "Books and chalk for term 3", amount: 780000, category: "School Supplies" },
  { date: "2026-08-25", type: "expense", ref: "EXP-1005", description: "Catering for inter-school competition", amount: 550000, category: "Meals & Catering" },
  { date: "2026-08-24", type: "expense", ref: "EXP-1006", description: "Purchase of water cooler", amount: 250000, category: "Miscellaneous" },
  { date: "2026-08-21", type: "expense", ref: "EXP-1007", description: "Clinic medical supplies", amount: 300000, category: "Medical" },
  { date: "2026-08-15", type: "expense", ref: "EXP-1008", description: "Roof repair - dormitory", amount: 900000, category: "Maintenance & Repairs" }
];


// ============================
// DATE HELPERS
// ============================

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatUGX(amount) {
  return "UGX " + amount.toLocaleString("en-UG");
}


// ============================
// PERIOD PRESETS
// ============================

const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

function setPreset(period) {
  if (period === "daily") {
    startDate.value = toISO(today);
    endDate.value = toISO(today);
  } else if (period === "weekly") {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    startDate.value = toISO(weekStart);
    endDate.value = toISO(today);
  } else if (period === "monthly") {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate.value = toISO(monthStart);
    endDate.value = toISO(today);
  } else if (period === "termly") {
    // Term 3 runs Aug - Nov
    const termStart = new Date(2026, 7, 1); // Aug 1, 2026
    startDate.value = toISO(termStart);
    endDate.value = toISO(today);
  }
}

setPreset("daily");


// ============================
// PERIOD BUTTONS
// ============================

const periodBtns = document.querySelectorAll(".period-btn");

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


// ============================
// GENERATE REPORT
// ============================

const generateBtn = document.getElementById("generateBtn");

generateBtn.addEventListener("click", generateReport);


function generateReport() {
  const from = new Date(startDate.value + "T00:00:00");
  const to = new Date(endDate.value + "T23:59:59");

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    alert("Please select both a start and end date.");
    return;
  }

  if (from > to) {
    alert("Start date cannot be after the end date.");
    return;
  }

  const filtered = transactions.filter(function (txn) {
    const d = new Date(txn.date + "T00:00:00");
    return d >= from && d <= to;
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const incomeByCategory = {};
  const expenseByCategory = {};
  let maxIncome = 0;
  let maxExpense = 0;

  filtered.forEach(function (txn) {
    if (txn.type === "income") {
      totalIncome += txn.amount;
      incomeByCategory[txn.category] = (incomeByCategory[txn.category] || 0) + txn.amount;
    } else {
      totalExpense += txn.amount;
      expenseByCategory[txn.category] = (expenseByCategory[txn.category] || 0) + txn.amount;
    }
  });

  // Max values for bar scaling
  Object.values(incomeByCategory).forEach(function (v) {
    maxIncome = Math.max(maxIncome, v);
  });
  Object.values(expenseByCategory).forEach(function (v) {
    maxExpense = Math.max(maxExpense, v);
  });

  // Update summary cards
  document.getElementById("totalIncome").textContent = formatUGX(totalIncome);
  document.getElementById("totalExpense").textContent = formatUGX(totalExpense);

  const net = totalIncome - totalExpense;
  const netBalance = document.getElementById("netBalance");
  netBalance.textContent = formatUGX(Math.abs(net));
  netBalance.style.color = net >= 0 ? "#059669" : "#dc2626";

  document.getElementById("transactionCount").textContent = filtered.length;

  // Update breakdowns
  renderBreakdown("incomeBreakdown", incomeByCategory, maxIncome, "bar-income");
  renderBreakdown("expenseBreakdown", expenseByCategory, maxExpense, "bar-expense");

  document.getElementById("breakdownIncomeTotal").textContent = formatUGX(totalIncome);
  document.getElementById("breakdownExpenseTotal").textContent = formatUGX(totalExpense);

  // Update transactions table
  const reportTable = document.getElementById("reportTable");
  reportTable.innerHTML = "";

  if (filtered.length === 0) {
    reportTable.innerHTML =
      `<tr><td colspan="5" class="empty-row">No transactions found in the selected period.</td></tr>`;
  } else {
    filtered.sort(function (a, b) {
      return a.date < b.date ? 1 : -1;
    });

    filtered.forEach(function (txn) {
      const row = reportTable.insertRow(-1);

      const formattedDate = new Date(txn.date).toLocaleDateString("en-UG", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      const typeClass = txn.type === "income" ? "type-income" : "type-expense";
      const typeLabel = txn.type === "income" ? "Income" : "Expense";
      const amount = txn.type === "income" ? `+ ${formatUGX(txn.amount)}` : `- ${formatUGX(txn.amount)}`;

      row.innerHTML = `
        <td>${formattedDate}</td>
        <td class="${typeClass}">${typeLabel}</td>
        <td>${txn.ref}</td>
        <td>${txn.description}</td>
        <td>${amount}</td>
      `;
    });
  }

  // Update period label
  const periodLabel = document.getElementById("periodLabel");
  const fromLabel = startDate.value;
  const toLabel = endDate.value;

  periodLabel.textContent =
    `Showing transactions from ${fromLabel} to ${toLabel}`;
}


function renderBreakdown(elementId, data, maxValue, barClass) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";

  const keys = Object.keys(data);

  if (keys.length === 0) {
    container.innerHTML = `<p class="no-data">No transactions in this period.</p>`;
    return;
  }

  keys.forEach(function (key) {
    const amount = data[key];
    const percent = maxValue > 0 ? Math.round((amount / maxValue) * 100) : 0;

    const row = document.createElement("div");
    row.className = "breakdown-row";

    row.innerHTML = `
      <strong>${key}</strong>
      <div class="bar-wrap">
        <div class="bar ${barClass}" style="width: ${percent}%"></div>
      </div>
      <span class="amount">${formatUGX(amount)}</span>
    `;

    container.appendChild(row);
  });
}


// ============================
// PRINT REPORT
// ============================

const printBtn = document.getElementById("printBtn");

printBtn.addEventListener("click", function () {
  window.print();
});