
// CURRENT DATE//


const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});



// STUDENT DATA (TEMPORARY)


const studentData = {
  "ST001": { name: "Amanya Brian", class: "S5", totalFees: 1200000, paid: 350000 },
  "ST002": { name: "Nakato Esther", class: "S2", totalFees: 1000000, paid: 300000 },
  "ST003": { name: "Okello Samuel", class: "S4", totalFees: 1100000, paid: 320000 },
  "ST004": { name: "Mukasa Dan", class: "S6", totalFees: 1400000, paid: 950000 },
  "ST005": { name: "Achieng Mercy", class: "S1", totalFees: 900000, paid: 650000 },
  "ST006": { name: "Kato Joseph", class: "S3", totalFees: 1050000, paid: 330000 }
};



// DEFAULT DATE


const paymentDate = document.getElementById("paymentDate");

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

paymentDate.value = `${year}-${month}-${day}`;



// GENERATE RECEIPT NUMBER//


const receiptNo = document.getElementById("receiptNo");

function generateReceipt() {
  const seq = Math.floor(1000 + Math.random() * 9000);
  receiptNo.value = `RCP-${seq}`;
}

generateReceipt();



// STUDENT SELECTION//


const studentSelect = document.getElementById("studentSelect");
const studentName = document.getElementById("studentName");
const studentClass = document.getElementById("studentClass");
const studentId = document.getElementById("studentId");
const totalFees = document.getElementById("totalFees");
const feesPaid = document.getElementById("feesPaid");
const balanceDue = document.getElementById("balanceDue");

function formatUGX(amount) {
  return "UGX " + amount.toLocaleString("en-UG");
}

studentSelect.addEventListener("change", function () {
  const id = this.value;

  if (!id) {
    studentName.value = "";
    studentClass.value = "";
    studentId.value = "";
    totalFees.value = "";
    feesPaid.value = "";
    balanceDue.value = "";
    return;
  }

  const data = studentData[id];

  studentName.value = data.name;
  studentClass.value = data.class;
  studentId.value = id;
  totalFees.value = formatUGX(data.totalFees);
  feesPaid.value = formatUGX(data.paid);
  balanceDue.value = formatUGX(data.totalFees - data.paid);

  updateSummary();
});



// UPDATE PAYMENT SUMMARY


const amountPaid = document.getElementById("amountPaid");
const summaryBalance = document.getElementById("summaryBalance");
const summaryAmount = document.getElementById("summaryAmount");
const summaryNewBalance = document.getElementById("summaryNewBalance");

function updateSummary() {
  const currentStudent = studentData[studentSelect.value];
  const balance = currentStudent ? currentStudent.totalFees - currentStudent.paid : 0;
  const amount = parseInt(amountPaid.value, 10) || 0;

  summaryBalance.textContent = formatUGX(balance);
  summaryAmount.textContent = formatUGX(amount);

  const newBalance = Math.max(balance - amount, 0);
  summaryNewBalance.textContent = formatUGX(newBalance);

  return newBalance;
}

amountPaid.addEventListener("input", updateSummary);
studentSelect.addEventListener("change", updateSummary);


// FORM SUBMISSION//


const paymentForm = document.getElementById("paymentForm");

paymentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const currentStudent = studentData[studentSelect.value];

  if (!currentStudent) {
    alert("Please select a student.");
    return;
  }

  const amount = parseInt(amountPaid.value, 10);
  const feeType = document.getElementById("feeType").value;
  const method = document.getElementById("paymentMethod").value;

  if (!amount || amount <= 0) {
    alert("Please enter a valid payment amount.");
    return;
  }

  if (!feeType || !method) {
    alert("Please select the fee type and payment method.");
    return;
  }

  const balance = currentStudent.totalFees - currentStudent.paid;

  if (amount > balance) {
    alert(
      `The payment amount exceeds the balance due (${formatUGX(balance)}). ` +
      `Please enter an amount up to what is due.`
    );
    return;
  }

  const newBalance = balance - amount;
  const status = document.getElementById("paymentStatus").value;

  alert(
    `Payment recorded successfully!\n\n` +
    `Receipt: ${receiptNo.value}\n` +
    `Student: ${currentStudent.name} (${studentSelect.value})\n` +
    `Fee Type: ${feeType}\n` +
    `Amount: ${formatUGX(amount)}\n` +
    `Method: ${method}\n` +
    `Status: ${status}\n\n` +
    `New Balance: ${formatUGX(newBalance)}`
  );

  currentStudent.paid += amount;

  feesPaid.value = formatUGX(currentStudent.paid);
  balanceDue.value = formatUGX(newBalance);

  paymentForm.reset();
  generateReceipt();
  paymentDate.value = `${year}-${month}-${day}`;

  studentName.value = "";
  studentClass.value = "";
  studentId.value = "";
  totalFees.value = "";
  feesPaid.value = "";
  balanceDue.value = "";
  summaryBalance.textContent = "UGX 0";
  summaryAmount.textContent = "UGX 0";
  summaryNewBalance.textContent = "UGX 0";
});