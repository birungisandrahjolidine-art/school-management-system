const TeacherAttendance = require("../models/TeacherAttendance");
const Teacher = require("../models/Teacher");

exports.markAttendance = async (req, res) => {
  try {
    const existing = await TeacherAttendance.findOne({
      teacher: req.body.teacher,
      date: req.body.date,
    });
    if (existing) {
      return res.status(400).json({ error: "Attendance already marked for this teacher on this date" });
    }
    const attendance = await TeacherAttendance.create(req.body);
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { search, status, date, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = new Date(date);
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    let query = TeacherAttendance.find(filter)
      .populate("teacher")
      .sort({ date: -1 });
    if (search) {
      const teachers = await Teacher.find({ name: { $regex: search, $options: "i" } });
      filter.teacher = { $in: teachers.map((t) => t._id) };
      query = TeacherAttendance.find(filter).populate("teacher").sort({ date: -1 });
    }
    const attendance = await query;
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = {};
    if (date) filter.date = new Date(date);

    const records = await TeacherAttendance.find(filter);
    const totalTeachers = await Teacher.countDocuments({ status: "active" });

    const summary = {
      total: totalTeachers,
      present: records.filter((r) => r.status === "Present").length,
      late: records.filter((r) => r.status === "Late").length,
      absent: records.filter((r) => r.status === "Absent").length,
      leave: records.filter((r) => r.status === "Leave").length,
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
