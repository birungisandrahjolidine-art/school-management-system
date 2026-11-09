// CURRENT DATE

var currentDate = document.getElementById("currentDate");
var today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

// DEFAULT DATE

var paymentDate = document.getElementById("paymentDate");
var year = today.getFullYear();
var month = String(today.getMonth() + 1).padStart(2, "0");
var day = String(today.getDate()).padStart(2, "0");
paymentDate.value = year + "-" + month + "-" + day;

// ELEMENTS

var studentSelect = document.getElementById("studentSelect");
var studentName = document.getElementById("studentName");
var studentClass = document.getElementById("studentClass");
var studentIdEl = document.getElementById("studentId");
var totalFeesEl = document.getElementById("totalFees");
var feesPaidEl = document.getElementById("feesPaid");
var balanceDueEl = document.getElementById("balanceDue");
var amountPaid = document.getElementById("amountPaid");
var summaryBalance = document.getElementById("summaryBalance");
var summaryAmount = document.getElementById("summaryAmount");
var summaryNewBalance = document.getElementById("summaryNewBalance");
var paymentForm = document.getElementById("paymentForm");

var currentStudentData = null;
var allStudents = [];
var allLedger = [];

// LOAD STUDENTS FROM API

async function loadStudents() {
  try {
    allStudents = await API.get("/api/students");
    allLedger = await API.get("/api/fee-payments/students");

    studentSelect.innerHTML = '<option value="">-- Select Student --</option>';
    allStudents.forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s._id;
      opt.textContent = s.name + " - " + s.class;
      studentSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to load students:", err);
  }
}

loadStudents();

// STUDENT SELECTION

studentSelect.addEventListener("change", function () {
  var id = this.value;

  if (!id) {
    studentName.value = "";
    studentClass.value = "";
    studentIdEl.value = "";
    totalFeesEl.value = "";
    feesPaidEl.value = "";
    balanceDueEl.value = "";
    currentStudentData = null;
    updateSummary();
    return;
  }

  var student = allStudents.find(function (s) { return s._id === id; });
  if (student) {
    studentName.value = student.name;
    studentClass.value = student.class;
    studentIdEl.value = student.studentId || student._id;
  }

  var ledgerEntry = allLedger.find(function (e) {
    return e.student && e.student._id === id;
  });

  if (ledgerEntry) {
    currentStudentData = {
      totalFees: ledgerEntry.totalFees,
      paid: ledgerEntry.totalPaid,
      balance: ledgerEntry.balanceDue
    };
  } else {
    currentStudentData = { totalFees: 0, paid: 0, balance: 0 };
  }

  totalFeesEl.value = fmtUGX(currentStudentData.totalFees);
  feesPaidEl.value = fmtUGX(currentStudentData.paid);
  balanceDueEl.value = fmtUGX(currentStudentData.balance);

  updateSummary();
});

// UPDATE PAYMENT SUMMARY

function updateSummary() {
  var balance = currentStudentData ? currentStudentData.balance : 0;
  var amount = parseInt(amountPaid.value, 10) || 0;

  summaryBalance.textContent = fmtUGX(balance);
  summaryAmount.textContent = fmtUGX(amount);

  var newBalance = Math.max(balance - amount, 0);
  summaryNewBalance.textContent = fmtUGX(newBalance);

  return newBalance;
}

amountPaid.addEventListener("input", updateSummary);

// FORM SUBMISSION

paymentForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!currentStudentData) {
    toast("Please select a student.", "error");
    return;
  }

  var amount = parseInt(amountPaid.value, 10);
  var feeType = document.getElementById("feeType").value;
  var method = document.getElementById("paymentMethod").value;

  if (!amount || amount <= 0) {
    toast("Please enter a valid payment amount.", "error");
    return;
  }

  if (!feeType || !method) {
    toast("Please select the fee type and payment method.", "error");
    return;
  }

  var balance = currentStudentData.balance;

  if (amount > balance) {
    toast(
      "Payment amount exceeds the balance due (" + fmtUGX(balance) + "). " +
      "Please enter an amount up to what is due.",
      "error"
    );
    return;
  }

  var newBalance = balance - amount;
  var status = document.getElementById("paymentStatus").value;

  var body = {
    student: studentSelect.value,
    feeType: feeType,
    amountPaid: amount,
    totalFees: currentStudentData.totalFees,
    balanceDue: newBalance,
    paymentMethod: method,
    paymentDate: paymentDate.value,
    transactionRef: document.getElementById("transactionRef").value.trim(),
    phoneNumber: document.getElementById("phoneNumber").value.trim(),
    status: status,
    remarks: document.getElementById("remarks").value.trim()
  };

  try {
    var result = await API.post("/api/fee-payments", body);

    toast("Payment recorded successfully! Receipt: " + (result.receiptNo || "—"), "success");

    paymentForm.reset();
    paymentDate.value = year + "-" + month + "-" + day;
    studentName.value = "";
    studentClass.value = "";
    studentIdEl.value = "";
    totalFeesEl.value = "";
    feesPaidEl.value = "";
    balanceDueEl.value = "";
    summaryBalance.textContent = fmtUGX(0);
    summaryAmount.textContent = fmtUGX(0);
    summaryNewBalance.textContent = fmtUGX(0);
    currentStudentData = null;

    // Reload ledger to get updated balances
    allLedger = await API.get("/api/fee-payments/students");
  } catch (err) {
    toast("Failed to record payment: " + err.message, "error");
  }
});
