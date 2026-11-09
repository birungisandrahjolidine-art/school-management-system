const express = require("express");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();

router.route("/").post(createStudent).get(getStudents);
router.route("/:id").get(getStudentById).put(updateStudent).delete(deleteStudent);

module.exports = router;
