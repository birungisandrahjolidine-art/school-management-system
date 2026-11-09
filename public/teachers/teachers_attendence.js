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
// DEFAULT ATTENDANCE DATE
// ============================

const attendanceDate =
  document.getElementById("attendanceDate");

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

attendanceDate.value = `${year}-${month}-${day}`;


// TEACHER DATA (from API)//


const teachers = [];


const teacherNameSelect =
  document.getElementById("teacherName");

function populateTeachers(teacherList) {
  teacherList.forEach(function (t) {
    teachers.push(t);

    const option = document.createElement("option");
    option.value = t.name;
    option.textContent = t.name;
    teacherNameSelect.appendChild(option);
  });
}


// AUTO STAFF ID//


const teacherName =
  document.getElementById("teacherName");

const staffId =
  document.getElementById("staffId");

function findTeacherByName(name) {
  return teachers.find(function (t) { return t.name === name; });
}

teacherName.addEventListener("change", function () {
  const t = findTeacherByName(this.value);
  staffId.value = t ? (t.teacherId || t.staffId || "") : "";
});


// RENDER ATTENDANCE TABLE//


const attendanceTable =
  document.getElementById("attendanceTable");

function renderAttendanceTable(records) {
  attendanceTable.innerHTML = records.map(function (r) {
    const t = r.teacher || {};
    const formattedDate = fmtDate(r.date);

    return `<tr>
      <td>${escapeHtml(t.name)}</td>
      <td>${escapeHtml(t.teacherId || r.staffId || t.staffId || "")}</td>
      <td>${escapeHtml(formattedDate)}</td>
      <td>${escapeHtml(r.checkIn || "—")}</td>
      <td>${escapeHtml(r.checkOut || "—")}</td>
      <td><span class="status ${escapeHtml(String(r.status).toLowerCase())}">${escapeHtml(r.status)}</span></td>
      <td>${escapeHtml(r.remarks || "")}</td>
      <td><button class="view-btn">View</button></td>
    </tr>`;
  }).join("");
}

function loadAttendance() {
  return API.get("/api/teacher-attendance")
    .then(function (records) {
      renderAttendanceTable(records);
      return records;
    });
}


// POPULATE STAT CARDS FROM SUMMARY//


function loadSummary() {
  return API.get("/api/teacher-attendance/summary?date=" + attendanceDate.value)
    .then(function (summary) {
      document.getElementById("totalTeachers").textContent = teachers.length;
      document.getElementById("presentTeachers").textContent = summary.present || 0;
      document.getElementById("lateTeachers").textContent = summary.late || 0;
      document.getElementById("absentTeachers").textContent = summary.absent || 0;
    });
}


// FORM SUBMISSION


const attendanceForm =
  document.getElementById("attendanceForm");

attendanceForm.addEventListener("submit", function (event) {

  event.preventDefault();

  const selectedTeacher = teacherName.value;
  const status = document.getElementById("status").value;

  if (!selectedTeacher || !status) {
    alert("Please complete the required fields.");
    return;
  }

  const t = findTeacherByName(selectedTeacher);

  const payload = {
    teacher: t ? t._id : selectedTeacher,
    date: attendanceDate.value,
    checkIn: document.getElementById("checkIn").value,
    checkOut: document.getElementById("checkOut").value,
    status: status,
    remarks: document.getElementById("remarks").value
  };

  API.post("/api/teacher-attendance", payload)
    .then(function () {
      toast("Attendance marked for " + selectedTeacher, "success");
      attendanceForm.reset();
      attendanceDate.value = `${year}-${month}-${day}`;
      staffId.value = "";
      loadAttendance();
      loadSummary();
    })
    .catch(function (err) {
      toast(err.message || "Failed to mark attendance", "error");
    });
});


function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}


// INITIALIZE


API.get("/api/teachers")
  .then(function (teacherList) {
    populateTeachers(teacherList);
    return loadSummary();
  })
  .then(function () {
    return loadAttendance();
  })
  .catch(function (err) {
    toast(err.message || "Failed to load data", "error");
  });


// SEARCH TEACHERS//


const searchTeacher =
  document.getElementById("searchTeacher");

searchTeacher.addEventListener("input", function () {

  const searchValue =
    this.value.toLowerCase();

  const rows =
    attendanceTable.querySelectorAll("tr");

  rows.forEach(function (row) {

    const teacher =
      row.cells[0]?.textContent.toLowerCase();

    if (teacher && teacher.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }

  });

});



// FILTER BY STATUS//


const filterStatus =
  document.getElementById("filterStatus");

filterStatus.addEventListener("change", function () {

  const selectedStatus =
    this.value.toLowerCase();

  const rows =
    attendanceTable.querySelectorAll("tr");

  rows.forEach(function (row) {

    const statusElement =
      row.querySelector(".status");

    if (!statusElement) return;

    const status =
      statusElement.textContent.toLowerCase();

    if (!selectedStatus || status === selectedStatus) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }

  });

});
