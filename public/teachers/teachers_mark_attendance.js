
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



// TEACHER DATA (from API)//


const teachers = [];


const teacherSelect = document.getElementById("teacherSelect");

function populateTeachers(teacherList) {
  teacherList.forEach(function (t) {
    teachers.push(t);

    const option = document.createElement("option");
    option.value = t.name;
    option.textContent = t.name;
    teacherSelect.appendChild(option);
  });
}

function findTeacherByName(name) {
  return teachers.find(function (t) { return t.name === name; });
}



// AUTO STAFF ID//


const staffId = document.getElementById("staffId");

teacherSelect.addEventListener("change", function () {
  const t = findTeacherByName(this.value);
  staffId.value = t ? (t.teacherId || t.staffId || "") : "";
});



// SET DEFAULT CHECK-IN TIME


const checkInTime = document.getElementById("checkInTime");

const hours = String(today.getHours()).padStart(2, "0");
const minutes = String(today.getMinutes()).padStart(2, "0");

checkInTime.value = `${hours}:${minutes}`;



// RENDER ATTENDANCE HISTORY//


const historyTable = document.getElementById("attendanceHistory");
let attendanceRecords = [];

function renderHistory(records) {
  historyTable.innerHTML = records.map(function (r) {
    const formattedDate = fmtDate(r.date);
    return `<tr>
      <td>${escapeHtml(formattedDate)}</td>
      <td>${escapeHtml(r.checkIn || "—")}</td>
      <td>${escapeHtml(r.checkOut || "—")}</td>
      <td><span class="status ${escapeHtml(String(r.status).toLowerCase())}">${escapeHtml(r.status)}</span></td>
      <td>--</td>
      <td>${escapeHtml(r.remarks || "")}</td>
    </tr>`;
  }).join("");
}

function filterAndRender() {
  const t = findTeacherByName(teacherSelect.value);
  if (!t) {
    renderHistory([]);
    return;
  }
  const filtered = attendanceRecords.filter(function (r) {
    const rt = r.teacher || {};
    return rt._id === t._id || rt.name === t.name;
  });
  renderHistory(filtered);
}

function loadHistory() {
  return API.get("/api/teacher-attendance")
    .then(function (records) {
      attendanceRecords = records;
      filterAndRender();
    });
}

function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}



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

  const t = findTeacherByName(teacher);

  const payload = {
    teacher: t ? t._id : teacher,
    date: date,
    checkIn: checkIn,
    checkOut: "",
    status: status,
    remarks: remarks
  };

  API.post("/api/teacher-attendance", payload)
    .then(function () {
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

      workingHours.textContent = "8h 0m";

      toast("Attendance marked successfully for " + teacher + "!", "success");

      resetForm();
      loadHistory();
    })
    .catch(function (err) {
      toast(err.message || "Failed to mark attendance", "error");
    });
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


// WAIT FOR TEACHER SELECT CHANGE TO REFRESH HISTORY


teacherSelect.addEventListener("change", filterAndRender);


// INITIALIZE


API.get("/api/teachers")
  .then(function (teacherList) {
    populateTeachers(teacherList);
  })
  .then(function () {
    return loadHistory();
  })
  .catch(function (err) {
    toast(err.message || "Failed to load data", "error");
  });
