const express = require("express");
const {
  createFeePayment,
  getFeePayments,
  getStudentFees,
  getFeeSummary,
} = require("../controllers/feePaymentController");

const router = express.Router();

router
  .route("/")
  .post(createFeePayment)
  .get(getFeePayments);

router.get("/summary", getFeeSummary);
router.get("/students", getStudentFees);

module.exports = router;
