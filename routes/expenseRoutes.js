const express = require("express");
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const router = express.Router();

router.route("/").post(createExpense).get(getExpenses);
router.route("/:id").put(updateExpense).delete(deleteExpense);

module.exports = router;
