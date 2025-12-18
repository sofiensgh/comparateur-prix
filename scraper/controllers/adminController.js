const User = require("../models/user");
const ElectroTounesData = require("../models/ElectroTounesModel");
const MyTekData = require("../models/MyTekTtnModel");
const SpaceNetData = require("../models/SpaceNetModel");
const TunisiaNetData = require("../models/TunisiaNetModel");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'" 
      });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot change your own role" 
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Activate/Deactivate user (admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot deactivate your own account" 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot delete your own account" 
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      activeUsers,
      electroTounesCount,
      myTekCount,
      spaceNetCount,
      tunisiaNetCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: true }),
      ElectroTounesData.countDocuments(),
      MyTekData.countDocuments(),
      SpaceNetData.countDocuments(),
      TunisiaNetData.countDocuments()
    ]);

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        products: {
          total: electroTounesCount + myTekCount + spaceNetCount + tunisiaNetCount,
          electroTounes: electroTounesCount,
          myTek: myTekCount,
          spaceNet: spaceNetCount,
          tunisiaNet: tunisiaNetCount
        }
      },
      recentUsers
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Create first admin (for initial setup)
exports.createFirstAdmin = async (req, res) => {
  try {
    const { secretKey } = req.body;
    
    // Check if secret key matches
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid secret key" 
      });
    }

    const { username, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: "Admin already exists" 
      });
    }

    // Create admin user
    const adminUser = new User({
      username,
      email,
      password,
      role: 'admin'
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: "First admin created successfully",
      user: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error("Error creating first admin:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};