const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    audience: {
      type: String,
      enum: ["all", "students", "teachers", "staff"],
      default: "all",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
