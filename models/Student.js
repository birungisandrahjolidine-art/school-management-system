const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    studentId: { type: String, unique: true },
    class: {
      type: String,
      required: true,
      enum: [
        "Grade 8 - A",
        "Grade 8 - B",
        "Grade 8 - C",
        "Grade 9 - A",
        "Grade 9 - B",
        "S1",
        "S2",
        "S3",
        "S4",
        "S5",
        "S6",
      ],
    },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    photo: { type: String, default: "" },
  },
  { timestamps: true }
);

studentSchema.pre("save", async function () {
  if (!this.studentId) {
    const count = await mongoose.model("Student").countDocuments();
    this.studentId = "ST" + String(count + 1).padStart(3, "0");
  }
});

module.exports = mongoose.model("Student", studentSchema);
