const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    feeType: {
      type: String,
      enum: [
        "School Fees",
        "Tuition",
        "Boarding",
        "Examination",
        "Uniform",
        "Transport",
      ],
      required: true,
    },
    amountPaid: { type: Number, required: true, min: 0 },
    totalFees: { type: Number, required: true },
    balanceDue: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Mobile Money", "Bank Transfer", "Card"],
      required: true,
    },
    paymentDate: { type: Date, required: true },
    transactionRef: { type: String, trim: true, default: "" },
    phoneNumber: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Partial"],
      default: "Pending",
    },
    receiptNo: { type: String, unique: true },
    remarks: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

feePaymentSchema.pre("save", async function () {
  if (!this.receiptNo) {
    const num = Math.floor(1000 + Math.random() * 9000);
    this.receiptNo = "RCP-" + num;
  }
});

module.exports = mongoose.model("FeePayment", feePaymentSchema);
