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

// DEFAULT EXPENSE DATE

var expenseDate = document.getElementById("expenseDate");
var year = today.getFullYear();
var month = String(today.getMonth() + 1).padStart(2, "0");
var day = String(today.getDate()).padStart(2, "0");
expenseDate.value = year + "-" + month + "-" + day;

// ELEMENTS

var expenseTable = document.getElementById("expenseTable");
var expenseForm = document.getElementById("expenseForm");
var searchExpense = document.getElementById("searchExpense");
var filterCategory = document.getElementById("filterCategory");
var allExpenses = [];

// PARSE AMOUNT FROM TEXT

function parseAmount(text) {
  return parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
}

// RENDER EXPENSES TABLE

function renderExpenses(data) {
  expenseTable.innerHTML = "";

  if (data.length === 0) {
    expenseTable.innerHTML = '<tr><td colspan="8" style="text-align:center;">No expense records found</td></tr>';
    return;
  }

  data.forEach(function (item) {
    var statusClass = item.status ? item.status.toLowerCase() : "pending";
    var formattedDate = fmtDate(item.date);

    var row = expenseTable.insertRow(-1);
    row.innerHTML =
      "<td>" + escapeHtml(item.reference || "—") + "</td>" +
      "<td>" + escapeHtml(item.category || "—") + "</td>" +
      "<td>" + escapeHtml(item.description || "—") + "</td>" +
      "<td>" + escapeHtml(item.vendor || "—") + "</td>" +
      "<td>" + fmtUGX(item.amount) + "</td>" +
      "<td>" + escapeHtml(item.paymentMethod || "—") + "</td>" +
      "<td>" + formattedDate + "</td>" +
      '<td><span class="status ' + statusClass + '">' + escapeHtml(item.status) + "</span></td>";
  });
}

// UPDATE SUMMARY CARDS (from visible rows)

function updateSummaryCards() {
  var rows = expenseTable.querySelectorAll("tr");
  var totalExpenses = 0;
  var monthExpenses = 0;
  var categories = {};

  var currentMonth = today.getMonth();
  var currentYear = today.getFullYear();

  rows.forEach(function (row) {
    var cells = row.cells;
    if (!cells[4]) return;

    var amount = parseAmount(cells[4].textContent);
    var category = cells[1].textContent;
    var dateText = cells[6].textContent;

    totalExpenses += amount;

    var d = new Date(dateText);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      monthExpenses += amount;
    }

    categories[category] = (categories[category] || 0) + 1;
  });

  document.getElementById("totalExpenses").textContent = fmtUGX(totalExpenses);
  document.getElementById("monthExpenses").textContent = fmtUGX(monthExpenses);
  document.getElementById("categoryCount").textContent = Object.keys(categories).length;
  document.getElementById("recordCount").textContent = rows.length;
}

// LOAD EXPENSES FROM API

async function loadExpenses() {
  try {
    allExpenses = await API.get("/api/expenses");
    renderExpenses(allExpenses);
    updateSummaryCards();
  } catch (err) {
    console.error("Failed to load expenses:", err);
  }
}

loadExpenses();

// FORM SUBMISSION

expenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  var category = document.getElementById("expenseCategory").value;
  var amount = parseInt(document.getElementById("expenseAmount").value, 10);
  var method = document.getElementById("paymentMethod").value;
  var vendor = document.getElementById("vendorName").value.trim();
  var description = document.getElementById("expenseDescription").value.trim();
  var status = document.getElementById("expenseStatus").value;
  var approvedBy = document.getElementById("approvedBy").value.trim();

  if (!category || !amount || amount <= 0 || !method || !vendor || !description) {
    toast("Please fill in all required expense details.", "error");
    return;
  }

  var body = {
    category: category,
    description: description,
    vendor: vendor,
    amount: amount,
    paymentMethod: method,
    date: expenseDate.value,
    approvedBy: approvedBy,
    status: status
  };

  try {
    var result = await API.post("/api/expenses", body);
    toast("Expense recorded successfully! Reference: " + (result.reference || "—"), "success");

    expenseForm.reset();
    expenseDate.value = year + "-" + month + "-" + day;

    await loadExpenses();
  } catch (err) {
    toast("Failed to record expense: " + err.message, "error");
  }
});

// SEARCH AND FILTER

function filterAndRenderExpenses() {
  var searchValue = searchExpense.value.toLowerCase();
  var selectedCategory = filterCategory.value;

  var filtered = allExpenses.filter(function (item) {
    var rowText = ((item.reference || "") + " " + (item.category || "") + " " + (item.description || "") + " " + (item.vendor || "")).toLowerCase();
    var matchSearch = !searchValue || rowText.indexOf(searchValue) !== -1;
    var matchCategory = !selectedCategory || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  renderExpenses(filtered);
  updateSummaryCards();
}

searchExpense.addEventListener("input", function () {
  filterAndRenderExpenses();
});

filterCategory.addEventListener("change", function () {
  filterAndRenderExpenses();
});
