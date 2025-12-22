const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No authentication token, access denied" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID from token
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Account is deactivated" 
      });
    }

    // ✅ Attach FULL user object to request
    req.user = {
      _id: user._id,
      id: user._id, // Add both for compatibility
      username: user.username,
      email: user.email,
      role: user.role, // ✅ CRITICAL: Include role
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Authentication error" 
    });
  }
};

module.exports = authMiddleware;