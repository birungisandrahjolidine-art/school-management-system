const express = require("express");
const router = express.Router();

const {
  createUser,
  deleteUser,
  listUsers,
  login,
  logout,
  logoutPage,
  me,
  updateUser,
} = require("../controllers/authController");
const { requireAuth, requireRole } = require("../middleware/auth");

// Public
router.post("/login", login);
router.post("/logout", logout);
router.get("/logout", logoutPage);

// Current session
router.get("/me", requireAuth, me);

// Admin-only user management
router.get("/users", requireRole("admin"), listUsers);
router.post("/users", requireRole("admin"), createUser);
router.put("/users/:id", requireRole("admin"), updateUser);
router.delete("/users/:id", requireRole("admin"), deleteUser);

module.exports = router;
