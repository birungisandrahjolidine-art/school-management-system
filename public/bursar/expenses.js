
// CURRENT DATE//


const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});



// DEFAULT EXPENSE DATE


const expenseDate = document.getElementById("expenseDate");

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

expenseDate.value = `${year}-${month}-${day}`;



// GENERATE EXPENSE REFERENCE//


const expenseReference = document.getElementById("expenseReference");
let referenceCounter = 1006;

function generateReference() {
  referenceCounter += 1;
  expenseReference.value = `EXP-${referenceCounter}`;
}

generateReference();


// ELEMENTS


const expenseTable = document.getElementById("expenseTable");
const expenseForm = document.getElementById("expenseForm");



// FORM SUBMISSION//


expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const category = document.getElementById("expenseCategory").value;
  const amount = parseInt(document.getElementById("expenseAmount").value, 10);
  const method = document.getElementById("paymentMethod").value;
  const vendor = document.getElementById("vendorName").value.trim();
  const description = document.getElementById("expenseDescription").value.trim();
  const status = document.getElementById("expenseStatus").value;

  if (!category || !amount || amount <= 0 || !method || !vendor || !description) {
    alert("Please fill in all required expense details.");
    return;
  }

  const formattedDate = new Date(expenseDate.value).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const newRow = expenseTable.insertRow(0);

  newRow.innerHTML = `
    <td>${expenseReference.value}</td>
    <td>${category}</td>
    <td>${description}</td>
    <td>${vendor}</td>
    <td>UGX ${amount.toLocaleString("en-UG")}</td>
    <td>${method}</td>
    <td>${formattedDate}</td>
    <td><span class="status ${status.toLowerCase()}">${status}</span></td>
  `;

  alert(
    `Expense recorded successfully!\n\n` +
    `Reference: ${expenseReference.value}\n` +
    `Category: ${category}\n` +
    `Amount: UGX ${amount.toLocaleString("en-UG")}\n` +
    `Payment Method: ${method}\n` +
    `Vendor: ${vendor}`
  );

  expenseForm.reset();
  generateReference();
  expenseDate.value = `${year}-${month}-${day}`;

  updateSummaryCards();
});



// UPDATE SUMMARY CARDS//


function parseAmount(text) {
  return parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
}

function updateSummaryCards() {
  const rows = expenseTable.querySelectorAll("tr");

  let totalExpenses = 0;
  let monthExpenses = 0;
  const categories = {};

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  rows.forEach(function (row) {
    const cells = row.cells;

    if (!cells[4]) return;

    const amount = parseAmount(cells[4].textContent);
    const category = cells[1].textContent;
    const dateText = cells[6].textContent;

    totalExpenses += amount;

    const d = new Date(dateText);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      monthExpenses += amount;
    }

    categories[category] = (categories[category] || 0) + 1;
  });

  document.getElementById("totalExpenses").textContent =
    "UGX " + totalExpenses.toLocaleString("en-UG");
  document.getElementById("monthExpenses").textContent =
    "UGX " + monthExpenses.toLocaleString("en-UG");
  document.getElementById("categoryCount").textContent =
    Object.keys(categories).length;
  document.getElementById("recordCount").textContent = rows.length;
}

updateSummaryCards();



// SEARCH EXPENSE RECORDS//


const searchExpense = document.getElementById("searchExpense");

searchExpense.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();

  const rows = expenseTable.querySelectorAll("tr");

  rows.forEach(function (row) {
    const rowText = row.textContent.toLowerCase();

    if (rowText.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });

  updateSummaryCards();
});



// FILTER BY CATEGORY//


const filterCategory = document.getElementById("filterCategory");

filterCategory.addEventListener("change", function () {
  const selectedCategory = this.value;

  const rows = expenseTable.querySelectorAll("tr");

  rows.forEach(function (row) {
    const category = row.cells[1].textContent;

    if (!selectedCategory || category === selectedCategory) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });

  updateSummaryCards();
});