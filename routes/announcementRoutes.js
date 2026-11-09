const express = require("express");
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const router = express.Router();

router.route("/").post(createAnnouncement).get(getAnnouncements);
router.delete("/:id", deleteAnnouncement);

module.exports = router;
