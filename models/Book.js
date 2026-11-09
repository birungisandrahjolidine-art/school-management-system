const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, unique: true, required: true },
    category: {
      type: String,
      enum: ["Fiction", "Science", "History", "Textbook", "Biography"],
      required: true,
    },
    totalCopies: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
