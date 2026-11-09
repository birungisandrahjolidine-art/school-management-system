const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    borrowerName: { type: String, required: true, trim: true },
    borrowerType: {
      type: String,
      enum: ["Student", "Teacher"],
      required: true,
    },
    borrowDate: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1, max: 90, default: 14 },
    returnedDate: { type: Date, default: null },
    condition: {
      type: String,
      enum: ["Good", "Damaged", "Excellent", "Lost", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
