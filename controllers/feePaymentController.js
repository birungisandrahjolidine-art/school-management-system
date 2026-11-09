const FeePayment = require("../models/FeePayment");
const Student = require("../models/Student");

exports.createFeePayment = async (req, res) => {
  try {
    const student = await Student.findById(req.body.student);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const payment = await FeePayment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getFeePayments = async (req, res) => {
  try {
    const { search, status, student } = req.query;
    const filter = {};
    if (student) filter.student = student;
    if (status) filter.status = status;
    const payments = await FeePayment.find(filter)
      .populate("student")
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentFees = async (req, res) => {
  try {
    const { search, status } = req.query;
    const students = await Student.find(
      search ? { name: { $regex: search, $options: "i" } } : {}
    );

    const result = await Promise.all(
      students.map(async (student) => {
        const payments = await FeePayment.find({ student: student._id });
        const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const totalFees = payments.length > 0 ? payments[0].totalFees : 0;
        const balanceDue = totalFees - totalPaid;
        let feeStatus = "Unpaid";
        if (balanceDue <= 0) feeStatus = "Paid";
        else if (totalPaid > 0) feeStatus = "Partial";

        if (status && feeStatus !== status) return null;

        return {
          student,
          totalFees,
          totalPaid,
          balanceDue,
          payments,
          status: feeStatus,
        };
      })
    );

    res.json(result.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeeSummary = async (req, res) => {
  try {
    const payments = await FeePayment.find();
    const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalExpected = payments.reduce((sum, p) => sum + p.totalFees, 0);
    const totalOutstanding = totalExpected - totalCollected;
    const studentsCount = await Student.countDocuments();

    res.json({
      totalStudents: studentsCount,
      totalExpected,
      totalCollected,
      totalOutstanding,
      totalPayments: payments.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
