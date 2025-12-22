const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/user");

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

// ============================================
// ADMIN PROFILE MANAGEMENT (Separate from user management)
// ============================================

// Get admin's own profile (for admin dashboard)
router.get("/my-profile", async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    res.json({
      success: true,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error("Admin profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// Update admin's own profile
router.put("/my-profile", async (req, res) => {
  try {
    const { username, email } = req.body;
    const admin = await User.findById(req.user._id);

    // Update username if provided and different
    if (username && username !== admin.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username: username,
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Username already taken" 
        });
      }
      admin.username = username;
    }

    // Update email if provided and different
    if (email && email !== admin.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ 
        email: email,
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Email already in use" 
        });
      }
      admin.email = email;
    }

    await admin.save();
    
    res.json({
      success: true,
      message: "Admin profile updated successfully",
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// Change admin password
router.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Both current and new password are required" 
      });
    }

    const admin = await User.findById(req.user._id);
    
    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change admin password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// ============================================
// TEST ROUTES
// ============================================

// Test admin route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin route working!",
    user: req.user
  });
});

module.exports = router;