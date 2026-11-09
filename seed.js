require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
const Book = require("./models/Book");
const Loan = require("./models/Loan");
const Restock = require("./models/Restock");
const LostBook = require("./models/LostBook");
const FeePayment = require("./models/FeePayment");
const Expense = require("./models/Expense");
const TeacherAttendance = require("./models/TeacherAttendance");
const StudentAttendance = require("./models/StudentAttendance");
const LeaveRequest = require("./models/LeaveRequest");
const SalaryPayment = require("./models/SalaryPayment");
const Announcement = require("./models/Announcement");

const students = [
  { name: "Amanya Brian", cls: "S5", email: "amanya.brian@school.ug", phone: "0700000001" },
  { name: "Nakato Esther", cls: "S2", email: "nakato.esther@school.ug", phone: "0700000002" },
  { name: "Okello Samuel", cls: "S4", email: "okello.samuel@school.ug", phone: "0700000003" },
  { name: "Mukasa Dan", cls: "S6", email: "mukasa.dan@school.ug", phone: "0700000004" },
  { name: "Achieng Mercy", cls: "S1", email: "achieng.mercy@school.ug", phone: "0700000005" },
  { name: "Kato Joseph", cls: "S3", email: "kato.joseph@school.ug", phone: "0700000006" },
  { name: "Nambooze Faith", cls: "S4", email: "nambooze.faith@school.ug", phone: "0700000007" },
  { name: "Ssemanda Ivan", cls: "S2", email: "ssemanda.ivan@school.ug", phone: "0700000008" },
  { name: "Nabirye Ruth", cls: "S6", email: "nabirye.ruth@school.ug", phone: "0700000009" },
];

const teachers = [
  { name: "John Bosco", subject: "Mathematics", teacherId: "T001", class: "S5", department: "mathematics", email: "john@gmail.com", phone: "0700123456", status: "active", position: "teacher", basicSalary: 1200000, netSalary: 1200000, payrollType: "School Payroll" },
  { name: "Mary Namukasa", subject: "English", teacherId: "T002", class: "S4", department: "languages", email: "mary@school.ug", phone: "0700234567", status: "active", position: "senior-teacher", basicSalary: 1400000, netSalary: 1400000, payrollType: "School Payroll" },
  { name: "Peter Okello", subject: "Biology", teacherId: "T003", class: "S6", department: "sciences", email: "peter@school.ug", phone: "0700345678", status: "active", position: "teacher", basicSalary: 1250000, netSalary: 1200000, payrollType: "Government Payroll" },
  { name: "Sarah Achieng", subject: "Physics", teacherId: "T004", class: "S5", department: "sciences", email: "sarah@school.ug", phone: "0700456789", status: "active", position: "head-of-department", basicSalary: 1600000, netSalary: 1500000, payrollType: "Government Payroll" },
  { name: "David Okot", subject: "Chemistry", teacherId: "T005", class: "S6", department: "sciences", email: "david@school.ug", phone: "0700567890", status: "on_leave", position: "teacher", basicSalary: 1250000, netSalary: 1200000, payrollType: "School Payroll" },
  { name: "Grace Auma", subject: "History", teacherId: "T006", class: "S3", department: "humanities", email: "grace@school.ug", phone: "0700678901", status: "active", position: "teacher", basicSalary: 1150000, netSalary: 1150000, payrollType: "Government Payroll" },
  { name: "Jane Doe", subject: "Geography", teacherId: "T007", class: "S1", department: "humanities", email: "jane@school.ug", phone: "0700789012", status: "active", position: "teacher", basicSalary: 1100000, netSalary: 1100000, payrollType: "School Payroll" },
  { name: "John Smith", subject: "Mathematics", teacherId: "T008", class: "S2", department: "mathematics", email: "johnsmith@school.ug", phone: "0700890123", status: "active", position: "teacher", basicSalary: 1100000, netSalary: 1100000, payrollType: "School Payroll" },
];

const books = [
  { title: "Advanced Mathematics", author: "J. Ouma", isbn: "978-1-2345-6789-1", category: "Textbook", totalCopies: 30, stock: 22 },
  { title: "English Grammar", author: "P. Kato", isbn: "978-1-2345-6789-2", category: "Textbook", totalCopies: 25, stock: 18 },
  { title: "Biology Essentials", author: "A. Nantume", isbn: "978-1-2345-6789-3", category: "Science", totalCopies: 20, stock: 14 },
  { title: "Physics Fundamentals", author: "S. Okello", isbn: "978-1-2345-6789-4", category: "Science", totalCopies: 18, stock: 12 },
  { title: "Chemistry in Action", author: "R. Mukasa", isbn: "978-1-2345-6789-5", category: "Science", totalCopies: 22, stock: 16 },
  { title: "African History", author: "M. Nalwoga", isbn: "978-1-2345-6789-6", category: "History", totalCopies: 15, stock: 10 },
  { title: "World Geography", author: "T. Odongo", isbn: "978-1-2345-6789-7", category: "History", totalCopies: 16, stock: 9 },
  { title: "Great Expectations", author: "Charles Dickens", isbn: "978-1-2345-6789-8", category: "Fiction", totalCopies: 12, stock: 5 },
  { title: "Things Fall Apart", author: "Chinua Achebe", isbn: "978-1-2345-6789-9", category: "Fiction", totalCopies: 20, stock: 11 },
  { title: "Nelson Mandela Biography", author: "Various", isbn: "978-1-2345-6789-0", category: "Biography", totalCopies: 10, stock: 4 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected, clearing collections...");

    const mongo = mongoose.connection;
    const models = [
      Student, Teacher, Book, Loan, Restock, LostBook, FeePayment,
      Expense, TeacherAttendance, StudentAttendance, LeaveRequest,
      SalaryPayment, Announcement,
    ];
    await Promise.all(models.map((m) => m.deleteMany({})));

    console.log("Creating students...");
    const studentDocs = [];
    for (const s of students) {
      studentDocs.push(
        await Student.create({ name: s.name, class: s.cls, email: s.email, phone: s.phone })
      );
    }

    console.log("Creating teachers...");
    const teacherDocs = [];
    for (const t of teachers) {
      teacherDocs.push(
        await Teacher.create({
          name: t.name, teacherId: t.teacherId, subject: t.subject, class: t.class,
          department: t.department, email: t.email, phone: t.phone, status: t.status,
          position: t.position, basicSalary: t.basicSalary, netSalary: t.netSalary,
          payrollType: t.payrollType,
        })
      );
    }

    console.log("Creating books...");
    const bookDocs = await Book.insertMany(
      books.map((b) => ({
        title: b.title, author: b.author, isbn: b.isbn, category: b.category,
        totalCopies: b.totalCopies, stock: b.stock,
      }))
    );

    console.log("Creating loans...");
    const loanDefs = [
      { bookIdx: 0, name: "Mukasa Dan", type: "Student", borrow: "2026-08-10", duration: 14 },
      { bookIdx: 1, name: "Achieng Mercy", type: "Student", borrow: "2026-08-12", duration: 14 },
      { bookIdx: 2, name: "Grace Auma", type: "Teacher", borrow: "2026-08-15", duration: 21 },
      { bookIdx: 3, name: "Nabirye Ruth", type: "Student", borrow: "2026-08-18", duration: 14 },
    ];
    const loans = await Promise.all(
      loanDefs.map((l, i) =>
        Loan.create({
          book: bookDocs[l.bookIdx]._id, borrowerName: l.name, borrowerType: l.type,
          borrowDate: new Date(l.borrow), duration: l.duration,
        })
      )
    );

    console.log("Creating restocks...");
    await Restock.create([
      { book: bookDocs[0]._id, previousQty: 20, addedQty: 10, date: new Date("2026-08-05"), supplier: "Longhorn Publishers", notes: "" },
      { book: bookDocs[4]._id, previousQty: 12, addedQty: 10, date: new Date("2026-08-20"), supplier: "MK Publishers", notes: "New semester order" },
    ]);

    console.log("Creating lost books...");
    await LostBook.create([
      { book: bookDocs[3]._id, borrowerName: "Kato Joseph", borrowerType: "Student", dateLost: new Date("2026-08-08"), amount: 45000, paymentStatus: "Unpaid" },
      { book: bookDocs[7]._id, borrowerName: "Jane Doe", borrowerType: "Teacher", dateLost: new Date("2026-08-02"), amount: 30000, paymentStatus: "Paid" },
    ]);

    console.log("Creating fee payments...");
    const feeDefs = [
      { sIdx: 0, feeType: "School Fees", amount: 850000, total: 1000000, method: "Cash" },
      { sIdx: 1, feeType: "Tuition", amount: 700000, total: 1000000, method: "Mobile Money" },
      { sIdx: 2, feeType: "School Fees", amount: 500000, total: 1000000, method: "Bank Transfer" },
      { sIdx: 3, feeType: "Boarding", amount: 950000, total: 1200000, method: "Cash" },
      { sIdx: 4, feeType: "Tuition", amount: 650000, total: 800000, method: "Mobile Money" },
      { sIdx: 5, feeType: "School Fees", amount: 720000, total: 1000000, method: "Bank Transfer" },
    ];
    await Promise.all(
      feeDefs.map((f, i) =>
        FeePayment.create({
          student: studentDocs[f.sIdx]._id, feeType: f.feeType, amountPaid: f.amount,
          totalFees: f.total, balanceDue: f.total - f.amount, paymentMethod: f.method,
          paymentDate: new Date(`2026-08-${25 - i}`), status: f.amount >= f.total ? "Paid" : "Partial",
          phoneNumber: studentDocs[f.sIdx].phone,
        })
      )
    );

    console.log("Creating expenses...");
    await Expense.create([
      { category: "Utilities", description: "Electricity bill", vendor: "UMEME", amount: 850000, paymentMethod: "Bank Transfer", date: new Date("2026-08-28"), status: "Approved" },
      { category: "Maintenance", description: "Classroom repairs", vendor: "BuildRight", amount: 650000, paymentMethod: "Cash", date: new Date("2026-08-25"), status: "Approved" },
      { category: "Transport", description: "School bus fuel", vendor: "Total", amount: 400000, paymentMethod: "Mobile Money", date: new Date("2026-08-22"), status: "Pending" },
      { category: "Supplies", description: "Exercise books", vendor: "Stationery House", amount: 350000, paymentMethod: "Cash", date: new Date("2026-08-20"), status: "Approved" },
      { category: "Meals", description: "Kitchen supplies", vendor: "City Foods", amount: 500000, paymentMethod: "Mobile Money", date: new Date("2026-08-18"), status: "Approved" },
    ]);

    console.log("Creating attendance...");
    await TeacherAttendance.create([
      { teacher: teacherDocs[0]._id, date: new Date("2026-08-28"), checkIn: "07:45", checkOut: "17:00", status: "Present" },
      { teacher: teacherDocs[1]._id, date: new Date("2026-08-28"), checkIn: "08:10", checkOut: "17:00", status: "Late" },
      { teacher: teacherDocs[2]._id, date: new Date("2026-08-28"), checkIn: "07:50", checkOut: "17:00", status: "Present" },
      { teacher: teacherDocs[3]._id, date: new Date("2026-08-28"), checkIn: "07:40", checkOut: "16:30", status: "Present" },
    ]);

    console.log("Creating leave requests...");
    await LeaveRequest.create([
      { teacher: teacherDocs[2]._id, leaveType: "Annual", days: 10, startDate: new Date("2026-09-01"), endDate: new Date("2026-09-10"), class: "S6", subject: "Biology", reason: "Family vacation", status: "Pending" },
      { teacher: teacherDocs[4]._id, leaveType: "Sick", days: 5, startDate: new Date("2026-08-20"), endDate: new Date("2026-08-24"), class: "S6", subject: "Chemistry", reason: "Medical treatment", status: "Approved" },
    ]);

    console.log("Creating salary payments...");
    await SalaryPayment.create([
      { teacher: teacherDocs[0]._id, payrollType: "School Payroll", netSalary: 1200000, salaryMonth: "2026-08", modeOfPayment: "Bank Transfer", paymentDate: new Date("2026-08-28"), netPaidOut: 1200000, status: "Paid" },
      { teacher: teacherDocs[1]._id, payrollType: "Government Payroll", netSalary: 1400000, salaryMonth: "2026-08", modeOfPayment: "Bank Transfer", paymentDate: new Date("2026-08-28"), netPaidOut: 1400000, status: "Paid" },
      { teacher: teacherDocs[2]._id, payrollType: "Government Payroll", netSalary: 1200000, salaryMonth: "2026-08", modeOfPayment: "Bank Transfer", paymentDate: new Date("2026-08-29"), netPaidOut: 1200000, status: "Pending" },
    ]);

    console.log("Creating announcements...");
    await Announcement.create([
      { title: "Parent-teacher conference scheduled", body: "Parent-teacher conferences will be held next Thursday in each homeroom.", date: new Date("2026-09-24") },
      { title: "Mid-term report cards released", body: "Mid-term report cards are now available for download from the Report tab.", date: new Date("2026-09-22") },
      { title: "Annual Book Fair this week", body: "The annual book fair runs all this week in the main hall.", date: new Date("2026-09-20") },
    ]);

    console.log("Seed complete!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Seed error:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
