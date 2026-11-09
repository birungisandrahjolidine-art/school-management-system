const express = require("express");
const {
  markAttendance,
  getAttendance,
  getAttendanceSummary,
} = require("../controllers/teacherAttendanceController");

const router = express.Router();

router.route("/").post(markAttendance).get(getAttendance);
router.get("/summary", getAttendanceSummary);

module.exports = router;
