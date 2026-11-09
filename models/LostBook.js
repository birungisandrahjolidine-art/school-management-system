const mongoose = require("mongoose");

const lostBookSchema = new mongoose.Schema(
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
    dateLost: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Bought/Replaced"],
      default: "Unpaid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostBook", lostBookSchema);
