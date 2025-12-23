// backend/controllers/adminController.js
const User = require("../models/user");
const ElectroTounesData = require("../models/ElectroTounesModel");
const MyTekData = require("../models/MyTekTtnModel");
const SpaceNetData = require("../models/SpaceNetModel");
const TunisiaNetData = require("../models/TunisiaNetModel");

// ============================================
// USER MANAGEMENT METHODS
// ============================================

// Get all users with pagination and filters
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    // Search by username or email
    if (req.query.search) {
      query.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }

    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      query.isActive = req.query.status === 'active';
    }

    // Get total count
    const total = await User.countDocuments(query);

    // Get paginated users
    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
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

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required"
      });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? "User with this email already exists"
          : "Username already taken"
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role,
      isActive: true
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse
    });

  } catch (error) {
    console.error("Error creating user:", error);
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

// Activate user (admin only)
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Prevent activating already active user
    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User is already active"
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User activated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Error activating user:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Deactivate user (admin only)
exports.deactivateUser = async (req, res) => {
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

    // Prevent deactivating already inactive user
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User is already inactive"
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Error deactivating user:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Toggle user status (admin only) - for backward compatibility
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
    if (req.params.id === req.user.id && !user.isActive) {
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

// Bulk update users
exports.bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, action } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!['activate', 'deactivate', 'make-admin', 'remove-admin'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    // Remove current user from bulk operations
    const filteredUserIds = userIds.filter(id => id !== req.user.id.toString());
    
    if (filteredUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot perform bulk operation on yourself'
      });
    }

    let update = {};
    let message = '';

    switch (action) {
      case 'activate':
        update = { isActive: true };
        message = 'Users activated successfully';
        break;
      case 'deactivate':
        update = { isActive: false };
        message = 'Users deactivated successfully';
        break;
      case 'make-admin':
        update = { role: 'admin' };
        message = 'Users promoted to admin';
        break;
      case 'remove-admin':
        update = { role: 'user' };
        message = 'Users demoted to user';
        break;
    }

    // Perform bulk update
    const result = await User.updateMany(
      { _id: { $in: filteredUserIds } },
      update
    );

    res.status(200).json({
      success: true,
      message,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ============================================
// DASHBOARD METHODS
// ============================================

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
      recentUsers: recentUsers.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }))
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

// ============================================
// ADDITIONAL ADMIN METHODS
// ============================================

// Get user statistics
exports.getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = totalUsers - activeUsers;

    // Get users per day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        activeUsers,
        inactiveUsers,
        dailyStats
      }
    });
  } catch (error) {
    console.error("Error getting user statistics:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('-password')
    .limit(20)
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Update user profile (admin can update any user)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Update username if provided
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username: username,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Username already taken" 
        });
      }
      user.username = username;
    }

    // Update email if provided
    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ 
        email: email,
        _id: { $ne: userId }
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
    
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Reset user password (admin only)
exports.resetUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User password reset successfully"
    });
  } catch (error) {
    console.error("Error resetting user password:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};