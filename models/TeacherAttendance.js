const mongoose = require("mongoose");

const teacherAttendanceSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    date: { type: Date, required: true },
    checkIn: { type: String, default: "" },
    checkOut: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Present", "Late", "Absent", "Leave"],
      required: true,
    },
    remarks: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

teacherAttendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("TeacherAttendance", teacherAttendanceSchema);
