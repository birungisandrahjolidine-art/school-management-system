const Student = require("../models/Student");

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const { search, class: cls, status } = req.query;

    const filter = {};

    // Search by student name
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Filter by class
    if (cls) {
      filter.class = cls;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Get students
    const students = await Student.find(filter).sort({ createdAt: -1 });

    // Total number of students
    const totalStudents = await Student.countDocuments();

    // Number of students in each class
    const classSummary = await Student.aggregate([
      {
        $group: {
          _id: "$class",
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);

    res.json({
      totalStudents,
      classSummary,
      students
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
