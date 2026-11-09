const SalaryPayment = require("../models/SalaryPayment");

exports.createPayment = async (req, res) => {
  try {
    const payment = await SalaryPayment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { search, status, payrollType, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (payrollType) filter.payrollType = payrollType;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }
    let query = SalaryPayment.find(filter).populate("teacher").sort({ paymentDate: -1 });
    if (search) {
      const Teacher = require("../models/Teacher");
      const teachers = await Teacher.find({ name: { $regex: search, $options: "i" } });
      filter.teacher = { $in: teachers.map((t) => t._id) };
      query = SalaryPayment.find(filter).populate("teacher").sort({ paymentDate: -1 });
    }
    const payments = await query;
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const payment = await SalaryPayment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPaymentSummary = async (req, res) => {
  try {
    const payments = await SalaryPayment.find();
    const govtCount = payments.filter((p) => p.payrollType === "Government Payroll").length;
    const schoolCount = payments.filter((p) => p.payrollType === "School Payroll").length;
    const paidCount = payments.filter((p) => p.status === "Paid").length;
    const totalPaid = payments
      .filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + p.netPaidOut, 0);
    const totalPending = payments
      .filter((p) => p.status === "Pending")
      .reduce((sum, p) => sum + p.netSalary, 0);

    res.json({
      totalPayments: payments.length,
      govtCount,
      schoolCount,
      paidCount,
      totalPaid,
      totalPending,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
