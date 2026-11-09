const express = require("express");
const {
  markAttendance,
  getWeekAttendance,
  getAttendanceSummary,
} = require("../controllers/studentAttendanceController");

const router = express.Router();

router.route("/").post(markAttendance).get(getWeekAttendance);
router.get("/summary", getAttendanceSummary);

module.exports = router;
