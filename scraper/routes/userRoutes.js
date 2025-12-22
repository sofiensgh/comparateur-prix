const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");

// Public routes
router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);
router.post("/signout", userController.signOut);

// ✅ DEBUG ROUTE - Check user data in database
router.get("/debug/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      rawDatabaseValue: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ============================================
// PROFILE ROUTES (Authenticated Users)
// ============================================

// Get current user profile (via authMiddleware)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// Get specific user profile by ID (requires authentication)
router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    // Check if user is accessing their own profile
    if (req.params.id !== req.user._id) {
      return res.status(403).json({ 
        success: false,
        message: "You can only access your own profile" 
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// Update current user profile (basic info only)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    // Update username if provided and different
    if (username && username !== user.username) {
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
      user.username = username;
    }

    // Update email if provided and different
    if (email && email !== user.email) {
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
      user.email = email;
    }

    await user.save();
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// ============================================
// ADVANCED PROFILE UPDATE (with password change)
// ============================================

// Update user profile with full functionality (username, email, password)
router.put("/profile/:id", authMiddleware, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.params.id !== req.user._id) {
      return res.status(403).json({ 
        success: false,
        message: "You can only update your own profile" 
      });
    }

    // Call the controller function for full profile update
    await userController.updateProfile(req, res);
  } catch (error) {
    console.error("Advanced profile update error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// ============================================
// PASSWORD MANAGEMENT ROUTES
// ============================================

// Change password (standalone route)
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Current password and new password are required" 
      });
    }

    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Check if new password is different
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be different from current password" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// ============================================
// ADMIN MANAGEMENT ROUTES
// ============================================

// ✅ CREATE ADMIN ROUTE (Run once to ensure admin exists)
router.post("/create-admin", async (req, res) => {
  try {
    const { username = "admin", email = "admin@example.com", password = "admin123" } = req.body;
    
    // Check if admin already exists
    let admin = await User.findOne({ email });
    
    if (admin) {
      // Update existing admin's role if needed
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
      }
      
      return res.json({
        success: true,
        message: "Admin user already exists",
        user: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      });
    }
    
    // Create new admin
    admin = new User({
      username,
      email,
      password,
      role: 'admin'
    });
    
    await admin.save();
    
    res.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// ============================================
// UTILITY ROUTES
// ============================================

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ 
    success: true,
    message: "User routes are working!",
    timestamp: new Date().toISOString()
  });
});

// Health check
router.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;