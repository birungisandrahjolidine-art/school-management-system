
// CURRENT DATE


const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});


// ELEMENTS


const studentFeesTable = document.getElementById("studentFeesTable");
const searchStudent = document.getElementById("searchStudent");
const filterStatus = document.getElementById("filterStatus");



// UPDATE SUMMARY CARDS


function parseAmount(text) {
  return parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
}

function updateSummaryCards() {
  const rows = studentFeesTable.querySelectorAll("tr");

  let expected = 0;
  let collected = 0;
  let outstanding = 0;

  rows.forEach(function (row) {
    expected += parseAmount(row.cells[3].textContent);
    collected += parseAmount(row.cells[4].textContent);
    outstanding += parseAmount(row.cells[5].textContent);
  });

  const totalStudents = rows.length;

  document.getElementById("totalStudents").textContent = totalStudents;
  document.getElementById("totalExpected").textContent =
    "UGX " + expected.toLocaleString("en-UG");
  document.getElementById("totalCollected").textContent =
    "UGX " + collected.toLocaleString("en-UG");
  document.getElementById("totalOutstanding").textContent =
    "UGX " + outstanding.toLocaleString("en-UG");
}

updateSummaryCards();



// SEARCH STUDENTS


searchStudent.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();

  const rows = studentFeesTable.querySelectorAll("tr");

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



// FILTER BY STATUS


filterStatus.addEventListener("change", function () {
  const selectedStatus = this.value.toLowerCase();

  const rows = studentFeesTable.querySelectorAll("tr");

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

  updateSummaryCards();
});