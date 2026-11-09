const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    teacherId: { type: String, unique: true },
    staffId: { type: String, unique: true },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    gender: { type: String, enum: ["male", "female"], default: "male" },
    dateOfBirth: { type: Date },
    nationality: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
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
      default: "Mathematics",
    },
    department: {
      type: String,
      enum: ["sciences", "humanities", "languages", "mathematics", "ict"],
      default: "mathematics",
    },
    class: {
      type: String,
      enum: ["S1", "S2", "S3", "S4", "S5", "S6"],
      default: "S1",
    },
    position: {
      type: String,
      enum: ["teacher", "senior-teacher", "head-of-department", "deputy-head"],
      default: "teacher",
    },
    qualification: { type: String, trim: true, default: "" },
    specialization: { type: String, trim: true, default: "" },
    employmentDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "on_leave", "inactive"],
      default: "active",
    },
    payrollType: {
      type: String,
      enum: ["Government Payroll", "School Payroll"],
      default: "School Payroll",
    },
    basicSalary: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    username: { type: String, trim: true, default: "" },
    photo: { type: String, default: "" },
  },
  { timestamps: true }
);

teacherSchema.pre("save", async function () {
  if (!this.teacherId) {
    const count = await mongoose.model("Teacher").countDocuments();
    this.teacherId = "T" + String(count + 1).padStart(3, "0");
  }
  if (!this.staffId) {
    const count = await mongoose.model("Teacher").countDocuments();
    this.staffId = "ST" + String(count + 1).padStart(3, "0");
  }
});

module.exports = mongoose.model("Teacher", teacherSchema);
