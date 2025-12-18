// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminMiddleware = require("../middleware/adminMiddleware");

// IMPORTANT: setup-first-admin should NOT use adminMiddleware
router.post("/setup-first-admin", adminController.createFirstAdmin);

// All other routes require admin privileges
router.use(adminMiddleware);

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);

// User management
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id/role", adminController.updateUserRole);
router.put("/users/:id/toggle-status", adminController.toggleUserStatus);
router.delete("/users/:id", adminController.deleteUser);

// Test admin route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin route working!",
    user: req.user
  });
});

module.exports = router;