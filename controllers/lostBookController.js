const LostBook = require("../models/LostBook");
const Book = require("../models/Book");
const Loan = require("../models/Loan");

exports.createLostBook = async (req, res) => {
  try {
    const book = await Book.findById(req.body.book);
    if (!book) return res.status(404).json({ error: "Book not found" });

    if (book.stock > 0) {
      book.stock -= 1;
      await book.save();
    }

    const lostBook = await LostBook.create(req.body);
    res.status(201).json(lostBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getLostBooks = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.paymentStatus = status;
    let query = LostBook.find(filter).populate("book").sort({ dateLost: -1 });
    if (search) {
      query = query.where("borrowerName").regex(new RegExp(search, "i"));
    }
    const lostBooks = await query;
    res.json(lostBooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLostBookStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const lostBook = await LostBook.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );
    if (!lostBook) return res.status(404).json({ error: "Lost book record not found" });
    res.json(lostBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteLostBook = async (req, res) => {
  try {
    const lostBook = await LostBook.findByIdAndDelete(req.params.id);
    if (!lostBook) return res.status(404).json({ error: "Lost book record not found" });
    res.json({ message: "Lost book record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
