const mongoose = require("mongoose");

const salaryPaymentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    payrollType: {
      type: String,
      enum: ["Government Payroll", "School Payroll"],
      required: true,
    },
    netSalary: { type: Number, required: true, min: 0 },
    salaryMonth: { type: String, required: true },
    modeOfPayment: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Mobile Money", "Cheque"],
      required: true,
    },
    paymentReference: { type: String, unique: true },
    paymentDate: { type: Date, required: true },
    paymentAccount: { type: String, trim: true, default: "" },
    paidBy: { type: String, trim: true, default: "" },
    taxAmount: { type: Number, default: 0 },
    netPaidOut: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    remarks: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

salaryPaymentSchema.pre("save", async function () {
  if (!this.paymentReference) {
    const count = await mongoose.model("SalaryPayment").countDocuments();
    const rand = Math.floor(100 + Math.random() * 900);
    this.paymentReference = "SP-" + (count + 1007) + rand;
  }
});

module.exports = mongoose.model("SalaryPayment", salaryPaymentSchema);
