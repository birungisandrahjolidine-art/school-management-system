const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    leaveType: {
      type: String,
      enum: [
        "Annual",
        "Sick",
        "Maternity",
        "Paternity",
        "Study",
        "Compassionate",
        "Unpaid",
      ],
      required: true,
    },
    days: { type: Number, required: true, min: 1, max: 90 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    contactNumber: { type: String, trim: true, default: "" },
    class: {
      type: String,
      enum: ["S1", "S2", "S3", "S4", "S5", "S6"],
      required: true,
    },
    subject: {
      type: String,
      enum: [
        "Mathematics",
        "English",
        "Biology",
        "Physics",
        "Chemistry",
        "History",
        "Geography",
      ],
      required: true,
    },
    substituteTeacher: { type: String, trim: true, default: "" },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
