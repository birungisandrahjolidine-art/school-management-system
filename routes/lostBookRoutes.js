const express = require("express");
const {
  createLostBook,
  getLostBooks,
  updateLostBookStatus,
  deleteLostBook,
} = require("../controllers/lostBookController");

const router = express.Router();

router.route("/").post(createLostBook).get(getLostBooks);
router
  .route("/:id")
  .put(updateLostBookStatus)
  .delete(deleteLostBook);

module.exports = router;
