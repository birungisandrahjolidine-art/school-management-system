const express = require("express");
const {
  createLeaveRequest,
  getLeaveRequests,
  approveLeave,
  rejectLeave,
} = require("../controllers/leaveRequestController");

const router = express.Router();

router.route("/").post(createLeaveRequest).get(getLeaveRequests);
router.put("/:id/approve", approveLeave);
router.put("/:id/reject", rejectLeave);

module.exports = router;
