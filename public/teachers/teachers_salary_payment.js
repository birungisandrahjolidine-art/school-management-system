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
// TEACHER DATA (from API)
// ============================

const teachers = [];

const teacherSelect = document.getElementById("teacherSelect");

function populateTeachers(teacherList) {
  teacherList.forEach(function (t) {
    teachers.push(t);

    const option = document.createElement("option");
    option.value = t._id;
    option.textContent = t.name;
    teacherSelect.appendChild(option);
  });
}

function findTeacherById(id) {
  return teachers.find(function (t) {
    return t._id === id || t.teacherId === id || t.staffId === id;
  });
}


// ============================
// AUTO-FILL TEACHER INFO
// ============================

const teacherName = document.getElementById("teacherName");
const teacherSubject = document.getElementById("teacherSubject");
const payrollType = document.getElementById("payrollType");
const netSalary = document.getElementById("netSalary");

function clearTeacherInfo() {
  teacherName.value = "";
  teacherSubject.value = "";
  payrollType.value = "";
  netSalary.value = "";
  netPaidOut.value = "";
}

teacherSelect.addEventListener("change", function () {
  const id = this.value;

  if (!id) {
    clearTeacherInfo();
    return;
  }

  const data = findTeacherById(id);

  if (!data) return;

  teacherName.value = data.name;
  teacherSubject.value = data.subject;
  payrollType.value = data.payrollType;
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
// PAYMENT TABLE RENDERING
// ============================

const paymentTable = document.getElementById("paymentTable");
let paymentRecords = [];

function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function payrollClass(type) {
  return String(type || "").toLowerCase().indexOf("government") !== -1 ? "govt" : "school";
}

function renderPaymentTable() {
  paymentTable.innerHTML = paymentRecords.map(function (r) {
    const t = r.teacher || {};

    return `<tr>
      <td>${escapeHtml(t.name)}</td>
      <td><span class="payroll ${escapeHtml(payrollClass(r.payrollType))}">${escapeHtml(r.payrollType)}</span></td>
      <td>${escapeHtml(r.netSalary != null ? fmtUGX(r.netSalary) : "")}</td>
      <td>${escapeHtml(r.modeOfPayment)}</td>
      <td>${escapeHtml(r.paymentReference)}</td>
      <td>${escapeHtml(r.paymentDate ? fmtDate(r.paymentDate) : "")}</td>
      <td><span class="status ${escapeHtml(String(r.status).toLowerCase())}">${escapeHtml(r.status)}</span></td>
    </tr>`;
  }).join("");
}

function loadPayments() {
  return API.get("/api/salary-payments")
    .then(function (records) {
      paymentRecords = records;
      renderPaymentTable();
    });
}


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
  const status = document.getElementById("paymentStatus").value;

  if (!id || !mode) {
    alert("Please select a teacher and a mode of payment.");
    return;
  }

  const data = findTeacherById(id);
  const gross = parseInt(netSalary.value, 10);
  const tax = parseInt(taxAmount.value, 10) || 0;

  if (!gross || gross <= 0) {
    alert("Please enter a valid net salary amount.");
    return;
  }

  const payload = {
    teacher: id,
    payrollType: payrollType.value,
    netSalary: gross,
    salaryMonth: salaryMonth.value,
    modeOfPayment: mode,
    paymentDate: paymentDate.value,
    paymentAccount: document.getElementById("paymentAccount").value,
    paidBy: document.getElementById("paidBy").value,
    taxAmount: tax,
    netPaidOut: gross - tax,
    status: status,
    remarks: document.getElementById("paymentRemarks").value
  };

  API.post("/api/salary-payments", payload)
    .then(function () {
      toast("Salary payment recorded successfully for " + (data ? data.name : "") + "!", "success");

      salaryPaymentForm.reset();
      generateReference();
      paymentDate.value = `${year}-${month}-${day}`;
      salaryMonth.value = `${today.getFullYear()}-${month}`;

      clearTeacherInfo();

      return loadPayments();
    })
    .then(function () {
      loadSummary();
    })
    .catch(function (err) {
      toast(err.message || "Failed to record salary payment", "error");
    });
});


// ============================
// SUMMARY CARDS
// ============================

function loadSummary() {
  return API.get("/api/salary-payments/summary")
    .then(function (summary) {
      summary = summary || {};
      document.getElementById("govtCount").textContent = summary.govtCount || 0;
      document.getElementById("schoolCount").textContent = summary.schoolCount || 0;
      document.getElementById("paymentsCount").textContent = summary.totalPayments || 0;
      document.getElementById("totalPaid").textContent = fmtUGX(summary.totalPaid || 0);
    })
    .catch(function (err) {
      toast(err.message || "Failed to load summary", "error");
    });
}


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
});


// ============================
// INITIALIZE
// ============================

API.get("/api/teachers")
  .then(function (teacherList) {
    populateTeachers(teacherList);
    return loadPayments();
  })
  .then(function () {
    return loadSummary();
  })
  .catch(function (err) {
    toast(err.message || "Failed to load data", "error");
  });
