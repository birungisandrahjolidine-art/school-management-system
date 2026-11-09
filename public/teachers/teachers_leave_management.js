
// ELEMENTS


const leaveTable = document.getElementById("leaveTable");



// CURRENT DATE


const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});


// ============================
// DEFAULT LEAVE DATES
// ============================

const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

startDate.value = `${year}-${month}-${day}`;

const endDateValue = new Date(today);
endDateValue.setDate(today.getDate() + 7);

const endYear = endDateValue.getFullYear();
const endMonth = String(endDateValue.getMonth() + 1).padStart(2, "0");
const endDay = String(endDateValue.getDate()).padStart(2, "0");

endDate.value = `${endYear}-${endMonth}-${endDay}`;


// ============================
// CALCULATE LEAVE DAYS
// ============================

const leaveDays = document.getElementById("leaveDays");

function calculateDays() {
  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);

    if (end < start) {
      alert("End date cannot be before start date.");
      endDate.value = startDate.value;
      leaveDays.value = 1;
      return;
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    leaveDays.value = diffDays;
  }
}

startDate.addEventListener("change", calculateDays);
endDate.addEventListener("change", calculateDays);


// ============================
// TEACHERS DATA (from API)
// ============================

const teachers = [];
const leaveRequests = [];

function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function findTeacherByName(name) {
  return teachers.find(function (t) { return t.name === name; });
}

const teacherNameSelect = document.getElementById("teacherName");
const substituteSelect = document.getElementById("substituteTeacher");

function populateSelect(select, list) {
  list.forEach(function (t) {
    const option = document.createElement("option");
    option.value = t.name;
    option.textContent = t.name;
    select.appendChild(option);
  });
}


// ============================
// RENDER LEAVE TABLE
// ============================

function renderLeaveTable() {
  leaveTable.innerHTML = leaveRequests.map(function (l) {
    const t = l.teacher || {};
    const statusClass = String(l.status).toLowerCase();

    return `<tr>
      <td>${escapeHtml(t.name || l.teacher)}</td>
      <td>${escapeHtml(l.leaveType)}</td>
      <td>${escapeHtml(l.class)}</td>
      <td>${escapeHtml(l.subject)}</td>
      <td>${escapeHtml(fmtDate(l.startDate))}</td>
      <td>${escapeHtml(fmtDate(l.endDate))}</td>
      <td>${escapeHtml(l.days)}</td>
      <td>${escapeHtml(l.reason)}</td>
      <td><span class="status ${escapeHtml(statusClass)}">${escapeHtml(l.status)}</span></td>
      <td>
        <button class="view-btn">View</button>
        <button class="approve-btn" data-id="${escapeHtml(l._id)}">Approve</button>
        <button class="reject-btn" data-id="${escapeHtml(l._id)}">Reject</button>
      </td>
    </tr>`;
  }).join("");
}

function loadLeaveRequests() {
  return API.get("/api/leave-requests")
    .then(function (requests) {
      leaveRequests.length = 0;
      requests.forEach(function (r) { leaveRequests.push(r); });
      renderLeaveTable();
      updateBalanceCards();
    });
}


// ============================
// UPDATE BALANCE CARDS
// ============================

function updateBalanceCards() {
  let pending = 0;
  let approvedDays = 0;
  let used = 0;

  leaveRequests.forEach(function (l) {
    const d = parseInt(l.days, 10) || 0;
    if (l.status === "Pending") pending++;
    if (l.status === "Approved") approvedDays += d;
    used += d;
  });

  document.getElementById("pendingRequests").textContent = pending;
  document.getElementById("approvedDays").textContent = approvedDays;
  document.getElementById("totalUsed").textContent = used;
  document.getElementById("annualBalance").textContent = Math.max(30 - used, 0);
}


// FORM SUBMISSION


const leaveForm = document.getElementById("leaveForm");

leaveForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const teacherName = document.getElementById("teacherName").value;
  const type = document.getElementById("leaveType").value;
  const days = leaveDays.value;
  const status = document.getElementById("leaveStatus").value;
  const leaveClass = document.getElementById("leaveClass").value;
  const leaveSubject = document.getElementById("leaveSubject").value;

  if (
    !teacherName || !type || !days || !startDate.value || !endDate.value ||
    !leaveClass || !leaveSubject
  ) {
    alert("Please fill in all required fields.");
    return;
  }

  const t = findTeacherByName(teacherName);

  const payload = {
    teacher: t ? t._id : teacherName,
    leaveType: type,
    days: parseInt(days, 10),
    startDate: startDate.value,
    endDate: endDate.value,
    contactNumber: document.getElementById("contactNumber").value,
    class: leaveClass,
    subject: leaveSubject,
    substituteTeacher: document.getElementById("substituteTeacher").value,
    reason: document.getElementById("reason").value,
    status: status
  };

  API.post("/api/leave-requests", payload)
    .then(function () {
      toast("Leave request submitted for " + teacherName + "!", "success");
      leaveForm.reset();

      // Reset dates to defaults
      startDate.value = `${year}-${month}-${day}`;
      endDate.value = `${endYear}-${endMonth}-${endDay}`;

      loadLeaveRequests();
    })
    .catch(function (err) {
      toast(err.message || "Failed to submit leave request", "error");
    });
});



// SEARCH LEAVE RECORDS//


const searchLeave = document.getElementById("searchLeave");

searchLeave.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();

  const rows = leaveTable.querySelectorAll("tr");

  rows.forEach(function (row) {
    const teacher = row.cells[0]?.textContent.toLowerCase();

    if (teacher && teacher.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});



// FILTER BY STATUS//


const filterStatus = document.getElementById("filterStatus");

filterStatus.addEventListener("change", function () {
  const selectedStatus = this.value.toLowerCase();

  const rows = leaveTable.querySelectorAll("tr");

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
});



// APPROVE / REJECT BUTTONS//


leaveTable.addEventListener("click", function (event) {
  const target = event.target;

  if (target.classList.contains("approve-btn") || target.classList.contains("reject-btn")) {
    const id = target.getAttribute("data-id");
    if (!id) return;

    const isApprove = target.classList.contains("approve-btn");
    const path = "/api/leave-requests/" + id + (isApprove ? "/approve" : "/reject");

    API.put(path, {})
      .then(function () {
        toast("Leave request updated", "success");
        loadLeaveRequests();
      })
      .catch(function (err) {
        toast(err.message || "Failed to update leave request", "error");
      });
    return;
  }

  if (target.classList.contains("view-btn")) {
    const row = target.closest("tr");
    const cells = row.cells;

    alert(
      `Teacher: ${cells[0].textContent}\n` +
      `Leave Type: ${cells[1].textContent}\n` +
      `Class: ${cells[2].textContent}\n` +
      `Subject: ${cells[3].textContent}\n` +
      `Start Date: ${cells[4].textContent}\n` +
      `End Date: ${cells[5].textContent}\n` +
      `Days: ${cells[6].textContent}\n` +
      `Reason: ${cells[7].textContent}\n` +
      `Status: ${cells[8].textContent}`
    );
  }
});


// INITIALIZE


API.get("/api/teachers")
  .then(function (teacherList) {
    teacherList.forEach(function (t) { teachers.push(t); });
    populateSelect(teacherNameSelect, teacherList);
    populateSelect(substituteSelect, teacherList);
  })
  .then(function () {
    return loadLeaveRequests();
  })
  .catch(function (err) {
    toast(err.message || "Failed to load data", "error");
  });
