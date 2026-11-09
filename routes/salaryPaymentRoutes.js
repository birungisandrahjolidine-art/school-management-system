const express = require("express");
const {
  createPayment,
  getPayments,
  getPaymentSummary,
  updatePaymentStatus,
} = require("../controllers/salaryPaymentController");

const router = express.Router();

router.route("/").post(createPayment).get(getPayments);
router.get("/summary", getPaymentSummary);
router.put("/:id", updatePaymentStatus);

module.exports = router;
