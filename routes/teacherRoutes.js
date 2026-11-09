const express = require("express");
const {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");

const router = express.Router();

router.route("/").post(createTeacher).get(getTeachers);
router.route("/:id").get(getTeacherById).put(updateTeacher).delete(deleteTeacher);

module.exports = router;
