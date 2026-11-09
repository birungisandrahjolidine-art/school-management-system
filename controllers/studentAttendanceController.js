const StudentAttendance = require("../models/StudentAttendance");

exports.markAttendance = async (req, res) => {
  try {
    const existing = await StudentAttendance.findOne({
      student: req.body.student,
      date: req.body.date,
      dayIndex: req.body.dayIndex,
    });
    if (existing) {
      existing.status = req.body.status;
      existing.note = req.body.note || "";
      await existing.save();
      return res.json(existing);
    }
    const attendance = await StudentAttendance.create(req.body);
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getWeekAttendance = async (req, res) => {
  try {
    const { weekStart, search } = req.query;
    const filter = {};
    if (weekStart) filter.weekStart = new Date(weekStart);
    const attendance = await StudentAttendance.find(filter)
      .populate("student")
      .sort({ date: 1, dayIndex: 1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { weekStart } = req.query;
    const filter = {};
    if (weekStart) filter.weekStart = new Date(weekStart);

    const records = await StudentAttendance.find(filter);
    const total = records.length;
    const ontime = records.filter((r) => r.status === "ontime").length;
    const late = records.filter((r) => r.status === "late").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const holiday = records.filter((r) => r.status === "holiday").length;

    res.json({
      total,
      ontime,
      late,
      absent,
      holiday,
      ontimePercent: total ? Math.round((ontime / total) * 100) : 0,
      latePercent: total ? Math.round((late / total) * 100) : 0,
      absentPercent: total ? Math.round((absent / total) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
