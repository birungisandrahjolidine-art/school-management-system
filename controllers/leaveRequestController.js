const LeaveRequest = require("../models/LeaveRequest");

exports.createLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.create(req.body);
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getLeaveRequests = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    let query = LeaveRequest.find(filter).populate("teacher").sort({ createdAt: -1 });
    if (search) {
      const Teacher = require("../models/Teacher");
      const teachers = await Teacher.find({ name: { $regex: search, $options: "i" } });
      filter.teacher = { $in: teachers.map((t) => t._id) };
      query = LeaveRequest.find(filter).populate("teacher").sort({ createdAt: -1 });
    }
    const leaves = await query;
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true, runValidators: true }
    );
    if (!leave) return res.status(404).json({ error: "Leave request not found" });
    res.json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true, runValidators: true }
    );
    if (!leave) return res.status(404).json({ error: "Leave request not found" });
    res.json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
