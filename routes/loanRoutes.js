const express = require("express");
const {
  createLoan,
  getLoans,
  returnLoan,
  getOverdueLoans,
} = require("../controllers/loanController");

const router = express.Router();

router.route("/").post(createLoan).get(getLoans);
router.get("/overdue", getOverdueLoans);
router.put("/:id/return", returnLoan);

module.exports = router;
