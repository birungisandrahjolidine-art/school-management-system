const Loan = require("../models/Loan");
const Book = require("../models/Book");

exports.createLoan = async (req, res) => {
  try {
    const book = await Book.findById(req.body.book);
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.stock <= 0) return res.status(400).json({ error: "No stock available" });

    book.stock -= 1;
    await book.save();

    const loan = await Loan.create(req.body);
    res.status(201).json(loan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getLoans = async (req, res) => {
  try {
    const { search, status, borrowerType } = req.query;
    const filter = {};
    if (borrowerType) filter.borrowerType = borrowerType;
    if (status === "active") filter.returnedDate = null;
    if (status === "returned") filter.returnedDate = { $ne: null };

    let query = Loan.find(filter).populate("book").sort({ borrowDate: -1 });

    if (search) {
      query = query.where("borrowerName").regex(new RegExp(search, "i"));
    }

    const loans = await query;
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.returnLoan = async (req, res) => {
  try {
    const { returnedDate, condition } = req.body;
    const loan = await Loan.findById(req.params.id).populate("book");
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    if (loan.returnedDate) return res.status(400).json({ error: "Already returned" });

    loan.returnedDate = returnedDate || new Date();
    loan.condition = condition || "Good";
    await loan.save();

    const book = await Book.findById(loan.book._id);
    if (book && condition !== "Lost") {
      book.stock += 1;
      await book.save();
    }

    res.json(loan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOverdueLoans = async (req, res) => {
  try {
    const today = new Date();
    const loans = await Loan.find({ returnedDate: null })
      .populate("book")
      .sort({ borrowDate: -1 });

    const overdue = loans.filter((loan) => {
      const due = new Date(loan.borrowDate);
      due.setDate(due.getDate() + loan.duration);
      return due < today;
    });

    res.json(overdue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
