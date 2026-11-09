const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true },
    category: {
      type: String,
      enum: [
        "Utilities",
        "Maintenance",
        "Transport",
        "Supplies",
        "Meals",
        "Medical",
        "Activities",
        "Miscellaneous",
      ],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    vendor: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Mobile Money", "Cheque"],
      required: true,
    },
    date: { type: Date, required: true },
    approvedBy: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

expenseSchema.pre("save", async function () {
  if (!this.reference) {
    const count = await mongoose.model("Expense").countDocuments();
    const rand = Math.floor(100 + Math.random() * 900);
    this.reference = "EXP-" + (count + 1007) + rand;
  }
});

module.exports = mongoose.model("Expense", expenseSchema);
