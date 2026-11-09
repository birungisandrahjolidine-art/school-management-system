const mongoose = require("mongoose");

const studentAttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: { type: Date, required: true },
    weekStart: { type: Date, required: true },
    dayIndex: { type: Number, required: true, min: 0, max: 6 },
    status: {
      type: String,
      enum: ["ontime", "late", "absent", "holiday"],
      required: true,
    },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

studentAttendanceSchema.index(
  { student: 1, date: 1, dayIndex: 1 },
  { unique: true }
);

module.exports = mongoose.model("StudentAttendance", studentAttendanceSchema);
