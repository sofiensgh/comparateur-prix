const User = require("../models/user");
const jwt = require("jsonwebtoken");
const ElectroTounesData = require("../models/ElectroTounesModel");
const MyTekData = require("../models/MyTekTtnModel");
const SpaceNetData = require("../models/SpaceNetModel");
const TunisiaNetData = require("../models/TunisiaNetModel");

// USER SIGNUP
exports.signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new user with default role 'user'
    const newUser = new User({ 
      username, 
      email, 
      password 
      // role defaults to 'user' from schema
    });
    await newUser.save();

    // Create JWT token WITH USER DATA
    const token = jwt.sign(
      { 
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role // ✅ Include role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie("token", token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // ✅ Send user data in response
    res.status(201).json({ 
      message: "User created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role, // ✅ Include role
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// USER LOGIN
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // ✅ Create JWT token WITH FULL USER DATA
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role // ✅ CRITICAL: Include role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie("token", token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    // ✅ Send FULL user data in response
    res.status(200).json({ 
      message: "User signed in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role, // ✅ THIS IS WHAT MAKES IT DYNAMIC
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Error signing in user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// USER LOGOUT
exports.signOut = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ 
    message: "User signed out successfully",
    success: true
  });
};

// USER PROFILE UPDATE
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.params.id;
    
    console.log('📝 Update profile request:', { 
      userId, 
      username: username || 'not provided', 
      email: email || 'not provided', 
      hasCurrentPassword: !!currentPassword, 
      hasNewPassword: !!newPassword 
    });
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Verify the authenticated user is updating their own profile
    // Check token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required. No token found." 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔑 Decoded token user ID:', decoded.id, 'Requested user ID:', userId);
      
      if (decoded.id !== userId) {
        return res.status(403).json({ 
          success: false,
          message: "You can only update your own profile" 
        });
      }
    } catch (error) {
      console.error('❌ Token verification error:', error);
      return res.status(401).json({ 
        success: false,
        message: "Invalid or expired token" 
      });
    }

    let updatesMade = false;
    const updateLog = [];

    // Update username if provided and different
    if (username && username.trim() && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username: username.trim(),
        _id: { $ne: userId } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Username already taken" 
        });
      }
      
      user.username = username.trim();
      updatesMade = true;
      updateLog.push('username updated');
      console.log('✅ Username updated to:', username);
    }

    // Update email if provided and different
    if (email && email.trim() && email !== user.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid email format" 
        });
      }

      // Check if email is already taken
      const existingUser = await User.findOne({ 
        email: email.trim(),
        _id: { $ne: userId } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Email already in use" 
        });
      }
      
      user.email = email.trim();
      updatesMade = true;
      updateLog.push('email updated');
      console.log('✅ Email updated to:', email);
    }

    // Update password if new password is provided
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return res.status(400).json({ 
          success: false,
          message: "Current password is required to set a new password" 
        });
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json({ 
          success: false,
          message: "Current password is incorrect" 
        });
      }

      // Check if new password is different from current
      const isSamePassword = await user.comparePassword(newPassword.trim());
      if (isSamePassword) {
        return res.status(400).json({ 
          success: false,
          message: "New password must be different from current password" 
        });
      }

      // Check password length
      if (newPassword.trim().length < 6) {
        return res.status(400).json({ 
          success: false,
          message: "New password must be at least 6 characters long" 
        });
      }

      // Update password (the pre-save hook will hash it)
      user.password = newPassword.trim();
      updatesMade = true;
      updateLog.push('password updated');
      console.log('✅ Password updated');
    }

    // If no updates were requested
    if (!updatesMade) {
      return res.status(400).json({ 
        success: false,
        message: "No changes provided for update" 
      });
    }

    // Save the updated user
    await user.save();

    // Create new token with updated info
    const newToken = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Update the cookie with new token
    res.cookie("token", newToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log('✅ Profile update successful. Updates:', updateLog);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
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
    console.error("❌ Error updating profile:", error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Validation error",
        error: error.message 
      });
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Duplicate field value entered" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error while updating profile" 
    });
  }
};

// GET USER PROFILE (for editing)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find user without password
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Verify the authenticated user is accessing their own profile
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.id !== userId) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied" 
        });
      }
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid or expired token" 
      });
    }

    res.status(200).json({
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
    console.error("Error getting profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};