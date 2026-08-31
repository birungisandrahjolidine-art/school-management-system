
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



// FORM SUBMISSION


const leaveForm = document.getElementById("leaveForm");

leaveForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const teacher = document.getElementById("teacherName").value;
  const type = document.getElementById("leaveType").value;
  const days = leaveDays.value;
  const status = document.getElementById("leaveStatus").value;
  const leaveClass = document.getElementById("leaveClass").value;
  const leaveSubject = document.getElementById("leaveSubject").value;

  if (
    !teacher || !type || !days || !startDate.value || !endDate.value ||
    !leaveClass || !leaveSubject
  ) {
    alert("Please fill in all required fields.");
    return;
  }

  const reason = document.getElementById("reason").value;

  // Add new leave record to the table
  const newRow = leaveTable.insertRow(0);

  const formattedStart = new Date(startDate.value).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const formattedEnd = new Date(endDate.value).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  newRow.innerHTML = `
    <td>${teacher}</td>
    <td>${type}</td>
    <td>${leaveClass}</td>
    <td>${leaveSubject}</td>
    <td>${formattedStart}</td>
    <td>${formattedEnd}</td>
    <td>${days}</td>
    <td>${reason || "No reason provided"}</td>
    <td><span class="status ${status.toLowerCase()}">${status}</span></td>
    <td>
      <button class="view-btn">View</button>
      <button class="approve-btn">Approve</button>
      <button class="reject-btn">Reject</button>
    </td>
  `;

  alert(`Leave request submitted for ${teacher}!`);

  leaveForm.reset();

  // Reset dates to defaults
  startDate.value = `${year}-${month}-${day}`;
  endDate.value = `${endYear}-${endMonth}-${endDay}`;
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

  if (target.classList.contains("approve-btn")) {
    const row = target.closest("tr");
    const statusCell = row.querySelector(".status");
    const teacher = row.cells[0].textContent;

    statusCell.textContent = "Approved";
    statusCell.className = "status approved";

    alert(`Leave request for ${teacher} has been approved.`);
  }

  if (target.classList.contains("reject-btn")) {
    const row = target.closest("tr");
    const statusCell = row.querySelector(".status");
    const teacher = row.cells[0].textContent;

    statusCell.textContent = "Rejected";
    statusCell.className = "status rejected";

    alert(`Leave request for ${teacher} has been rejected.`);
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