
// CURRENT DATE//


const currentDate = document.getElementById("currentDate");
const attendanceDate = document.getElementById("attendanceDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

// Set default date to today
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

attendanceDate.value = `${year}-${month}-${day}`;



// TEACHER STAFF IDs//


const teacherStaffIds = {
  "John Bosco": "T001",
  "Mary Namukasa": "T002",
  "Peter Okello": "T003",
  "Sarah Achieng": "T004",
  "David Okot": "T005"
};



// AUTO STAFF ID//


const teacherSelect = document.getElementById("teacherSelect");
const staffId = document.getElementById("staffId");

teacherSelect.addEventListener("change", function () {
  staffId.value = teacherStaffIds[this.value] || "";
});



// SET DEFAULT CHECK-IN TIME


const checkInTime = document.getElementById("checkInTime");

const hours = String(today.getHours()).padStart(2, "0");
const minutes = String(today.getMinutes()).padStart(2, "0");

checkInTime.value = `${hours}:${minutes}`;



// MARK ATTENDANCE


function markAttendance() {
  const teacher = teacherSelect.value;
  const date = attendanceDate.value;
  const checkIn = checkInTime.value;
  const status = document.getElementById("attendanceStatus").value;
  const subject = document.getElementById("subject").value;
  const remarks = document.getElementById("remarks").value;

  if (!teacher || !date || !checkIn || !status || !subject) {
    alert("Please fill in all required fields.");
    return;
  }

  // Update status display
  const todayStatus = document.getElementById("todayStatus");
  const checkInDisplay = document.getElementById("checkInDisplay");
  const workingHours = document.getElementById("workingHours");

  todayStatus.textContent = status;
  todayStatus.className = "status-display " + status.toLowerCase();

  // Format check-in time for display
  const [hrs, mins] = checkIn.split(":");
  const ampm = hrs >= 12 ? "PM" : "AM";
  const displayHours = hrs % 12 || 12;
  checkInDisplay.textContent = `${displayHours}:${mins} ${ampm}`;

  // Calculate working hours (simplified - 8 hour work day)
  workingHours.textContent = "8h 0m";

  // Add to history table
  const historyTable = document.getElementById("attendanceHistory");
  const newRow = historyTable.insertRow(0);

  const formattedDate = new Date(date).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  newRow.innerHTML = `
    <td>${formattedDate}</td>
    <td>${checkInDisplay.textContent}</td>
    <td>--:-- --</td>
    <td><span class="status ${status.toLowerCase()}">${status}</span></td>
    <td>--</td>
    <td>${remarks || "No remarks"}</td>
  `;

  // Show success message
  alert(`Attendance marked successfully for ${teacher}!`);

  // Reset form
  resetForm();
}



// RESET FORM//


function resetForm() {
  document.getElementById("attendanceForm").reset();

  // Reset date to today
  attendanceDate.value = `${year}-${month}-${day}`;

  // Reset check-in time to current time
  const now = new Date();
  const hrs = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  checkInTime.value = `${hrs}:${mins}`;

  // Reset staff ID
  staffId.value = "";
}