const Restock = require("../models/Restock");
const Book = require("../models/Book");

exports.createRestock = async (req, res) => {
  try {
    const book = await Book.findById(req.body.book);
    if (!book) return res.status(404).json({ error: "Book not found" });

    const previousQty = book.totalCopies;
    book.totalCopies += req.body.addedQty;
    book.stock += req.body.addedQty;
    await book.save();

    const restock = await Restock.create({
      ...req.body,
      previousQty,
    });

    res.status(201).json(restock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getRestocks = async (req, res) => {
  try {
    const { search } = req.query;
    let query = Restock.find().populate("book").sort({ date: -1 });
    const restocks = await query;
    res.json(restocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
