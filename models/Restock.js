const mongoose = require("mongoose");

const restockSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    previousQty: { type: Number, required: true },
    addedQty: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true },
    supplier: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restock", restockSchema);
