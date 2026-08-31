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
// DEFAULT SALARY MONTH
// ============================

const salaryMonth = document.getElementById("salaryMonth");

salaryMonth.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;


// ============================
// DEFAULT PAYMENT DATE
// ============================

const paymentDate = document.getElementById("paymentDate");

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

paymentDate.value = `${year}-${month}-${day}`;


// ============================
// TEACHER DATA (TEMPORARY)
// ============================

const teacherData = {
  "T001": { name: "John Bosco", subject: "Mathematics", payroll: "Government Payroll", netSalary: 950000 },
  "T002": { name: "Mary Namukasa", subject: "English", payroll: "Government Payroll", netSalary: 880000 },
  "T003": { name: "Peter Okello", subject: "Biology", payroll: "School Payroll", netSalary: 940000 },
  "T004": { name: "Sarah Achieng", subject: "Physics", payroll: "Government Payroll", netSalary: 875000 },
  "T005": { name: "David Okot", subject: "History", payroll: "School Payroll", netSalary: 815000 },
  "T006": { name: "Grace Auma", subject: "Chemistry", payroll: "Government Payroll", netSalary: 890000 },
  "T007": { name: "Samuel Mugisha", subject: "Geography", payroll: "School Payroll", netSalary: 800000 },
  "T008": { name: "Lydia Kemigisha", subject: "Mathematics", payroll: "School Payroll", netSalary: 835000 }
};


// ============================
// AUTO-FILL TEACHER INFO
// ============================

const teacherSelect = document.getElementById("teacherSelect");
const teacherName = document.getElementById("teacherName");
const teacherSubject = document.getElementById("teacherSubject");
const payrollType = document.getElementById("payrollType");
const netSalary = document.getElementById("netSalary");

teacherSelect.addEventListener("change", function () {
  const id = this.value;

  if (!id) {
    teacherName.value = "";
    teacherSubject.value = "";
    payrollType.value = "";
    netSalary.value = "";
    return;
  }

  const data = teacherData[id];

  teacherName.value = data.name;
  teacherSubject.value = data.subject;
  payrollType.value = data.payroll;
  netSalary.value = data.netSalary;

  calculateNetPaidOut();
});


// ============================
// CALCULATE NET PAID OUT
// ============================

const taxAmount = document.getElementById("taxAmount");
const netPaidOut = document.getElementById("netPaidOut");

function formatUGX(amount) {
  return "UGX " + amount.toLocaleString("en-UG");
}

function calculateNetPaidOut() {
  const gross = parseInt(netSalary.value, 10) || 0;
  const tax = parseInt(taxAmount.value, 10) || 0;

  netPaidOut.value = formatUGX(Math.max(gross - tax, 0));
}

netSalary.addEventListener("input", calculateNetPaidOut);
taxAmount.addEventListener("input", calculateNetPaidOut);


// ============================
// GENERATE PAYMENT REFERENCE
// ============================

const paymentReference = document.getElementById("paymentReference");
let referenceCounter = 1006;

function generateReference() {
  referenceCounter += 1;
  paymentReference.value = `SP-${referenceCounter}`;
}

generateReference();


// ============================
// FORM SUBMISSION
// ============================

const salaryPaymentForm = document.getElementById("salaryPaymentForm");

salaryPaymentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const id = teacherSelect.value;
  const mode = document.getElementById("modeOfPayment").value;

  if (!id || !mode) {
    alert("Please select a teacher and a mode of payment.");
    return;
  }

  const data = teacherData[id];
  const gross = parseInt(netSalary.value, 10);
  const tax = parseInt(taxAmount.value, 10) || 0;
  const status = document.getElementById("paymentStatus").value;

  if (!gross || gross <= 0) {
    alert("Please enter a valid net salary amount.");
    return;
  }

  const formattedDate = new Date(paymentDate.value).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const paymentTable = document.getElementById("paymentTable");
  const newRow = paymentTable.insertRow(0);

  const payrollClass = data.payroll === "Government Payroll" ? "govt" : "school";

  newRow.innerHTML = `
    <td>${data.name}</td>
    <td><span class="payroll ${payrollClass}">${data.payroll}</span></td>
    <td>${formatUGX(gross)}</td>
    <td>${mode}</td>
    <td>${paymentReference.value}</td>
    <td>${formattedDate}</td>
    <td><span class="status ${status.toLowerCase()}">${status}</span></td>
  `;

  alert(
    `Salary payment recorded successfully!\n\n` +
    `Teacher: ${data.name}\n` +
    `Payroll Type: ${data.payroll}\n` +
    `Net Salary: ${formatUGX(gross)}\n` +
    `Tax Deducted: ${formatUGX(tax)}\n` +
    `Amount Paid: ${formatUGX(gross - tax)}\n` +
    `Mode of Payment: ${mode}\n` +
    `Reference: ${paymentReference.value}`
  );

  salaryPaymentForm.reset();
  generateReference();
  paymentDate.value = `${year}-${month}-${day}`;
  salaryMonth.value = `${today.getFullYear()}-${month}`;

  teacherName.value = "";
  teacherSubject.value = "";
  payrollType.value = "";
  netSalary.value = "";
  netPaidOut.value = "";

  updateSummaryCards();
});


// ============================
// UPDATE SUMMARY CARDS
// ============================

const paymentTable = document.getElementById("paymentTable");

function updateSummaryCards() {
  const rows = paymentTable.querySelectorAll("tr");

  let govtCount = 0;
  let schoolCount = 0;
  let totalPaid = 0;

  rows.forEach(function (row) {
    const payrollElement = row.querySelector(".payroll");
    const netCell = row.cells[2];
    const statusElement = row.querySelector(".status");

    if (!payrollElement || !netCell) return;

    if (payrollElement.textContent === "Government Payroll") {
      govtCount++;
    } else {
      schoolCount++;
    }

    if (statusElement && statusElement.textContent === "Paid") {
      totalPaid += parseInt(netCell.textContent.replace(/[^0-9]/g, ""), 10) || 0;
    }
  });

  document.getElementById("paymentsCount").textContent = rows.length;
  document.getElementById("totalPaid").textContent =
    "UGX " + totalPaid.toLocaleString("en-UG");
}

updateSummaryCards();


// ============================
// SEARCH PAYMENT RECORDS
// ============================

const searchPayment = document.getElementById("searchPayment");

searchPayment.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();

  const rows = paymentTable.querySelectorAll("tr");

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


// ============================
// FILTER BY PAYROLL TYPE
// ============================

const filterPayroll = document.getElementById("filterPayroll");

filterPayroll.addEventListener("change", function () {
  const selectedPayroll = this.value;

  const rows = paymentTable.querySelectorAll("tr");

  rows.forEach(function (row) {
    const payrollElement = row.querySelector(".payroll");

    if (!payrollElement) return;

    if (!selectedPayroll || payrollElement.textContent === selectedPayroll) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });

  updateSummaryCards();
});