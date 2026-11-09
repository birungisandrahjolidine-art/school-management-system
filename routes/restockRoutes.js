const express = require("express");
const {
  createRestock,
  getRestocks,
} = require("../controllers/restockController");

const router = express.Router();

router.route("/").post(createRestock).get(getRestocks);

module.exports = router;
