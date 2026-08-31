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



// TEACHER STAFF IDs//


const teacherStaffIds = {
  "Jane Doe": "ST001",
  "John Smith": "ST002",
  "Mary Johnson": "ST003",
  "Peter Okello": "ST004"
};



// AUTO STAFF ID//


const teacherName =
  document.getElementById("teacherName");

const staffId =
  document.getElementById("staffId");

teacherName.addEventListener("change", function () {

  staffId.value = teacherStaffIds[this.value] || "";

});



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

  alert(
    `${selectedTeacher}'s attendance has been marked as ${status}.`
  );

  attendanceForm.reset();

  attendanceDate.value =
    `${year}-${month}-${day}`;

  staffId.value = "";

});



// SEARCH TEACHERS//


const searchTeacher =
  document.getElementById("searchTeacher");

const attendanceTable =
  document.getElementById("attendanceTable");

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