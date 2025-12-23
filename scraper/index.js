const express = require("express");
const mongoose = require("mongoose");
const ElectroTounesData = require("./models/ElectroTounesModel");
const MyTekData = require("./models/MyTekTtnModel");
const SpaceNetData = require("./models/SpaceNetModel");
const TunisiaNetData = require("./models/TunisiaNetModel");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/route");
const cookieParser = require("cookie-parser");
const nodemailerRoutes = require("./routes/nodemailerRoutes");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ========== ADD HEALTH CHECK ROUTE ==========
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    message: "Server is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    port: PORT,
    services: {
      userAuth: "✅",
      admin: "✅",
      cart: "✅",
      orders: "✅",
      products: "✅",
      email: "✅"
    }
  });
});

// ========== ADD TEST ROUTE ==========
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Test route working",
    timestamp: new Date().toISOString()
  });
});

// ========== ADD SIMPLE ADMIN SETUP ROUTE ==========
app.post("/api/admin/setup-first-admin", async (req, res) => {
  try {
    const User = require("./models/user");
    const { username, email, password } = req.body;
    
    console.log("Creating first admin with:", { username, email });
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: "Admin already exists" 
      });
    }
    
    // Create admin
    const adminUser = new User({
      username: username || 'admin',
      email: email || 'admin@example.com',
      password: password || 'Admin123456',
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
    console.error("Error creating admin:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
});

// ========== EXISTING ROUTES ==========
app.use("/api", productRoutes);
app.use("/api/users", require("./routes/userRoutes"));

// Try to load admin routes, if they exist
try {
  const adminRoutes = require("./routes/adminRoutes");
  app.use("/api/admin", adminRoutes);
  console.log("✅ Admin routes loaded");
} catch (error) {
  console.log("⚠️  Admin routes not loaded, using simple setup route");
}

// Try to load cart routes
try {
  const cartRoutes = require("./routes/cartRoutes");
  app.use("/api/cart", cartRoutes);
  console.log("✅ Cart routes loaded");
} catch (error) {
  console.log("⚠️  Cart routes not loaded:", error.message);
}

// Try to load order routes
try {
  const orderRoutes = require("./routes/orderRoutes");
  app.use("/api/orders", orderRoutes);
  console.log("✅ Order routes loaded");
} catch (error) {
  console.log("⚠️  Order routes not loaded:", error.message);
}

// Product routes from scraping
app.use('/api/nodemailer', nodemailerRoutes);

// ========== DATABASE INITIALIZATION ==========
// Create Cart and Order collections if they don't exist
const initializeCollections = async () => {
  try {
    // Check if Cart model exists
    const cartCollectionExists = await mongoose.connection.db.listCollections({ name: 'carts' }).hasNext();
    if (!cartCollectionExists) {
      console.log("🛒 Creating Cart collection...");
      const Cart = require("./models/CartModel");
      await Cart.createCollection();
      console.log("✅ Cart collection created");
    } else {
      console.log("✅ Cart collection already exists");
    }

    // Check if Order model exists
    const orderCollectionExists = await mongoose.connection.db.listCollections({ name: 'orders' }).hasNext();
    if (!orderCollectionExists) {
      console.log("📦 Creating Order collection...");
      const Order = require("./models/OrderModel");
      await Order.createCollection();
      console.log("✅ Order collection created");
    } else {
      console.log("✅ Order collection already exists");
    }
  } catch (error) {
    console.log("⚠️  Collections initialization:", error.message);
  }
};

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    requestedUrl: req.originalUrl,
    availableEndpoints: {
      health: "GET /api/health",
      test: "GET /api/test",
      users: "POST /api/users/signup, POST /api/users/signin",
      admin: "POST /api/admin/setup-first-admin",
      cart: "GET /api/cart, POST /api/cart/add",
      orders: "POST /api/orders/create, GET /api/orders/my-orders",
      products: "GET /api/products"
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🚨 Global error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test route: http://localhost:5000/api/test`);
  console.log(`👤 User signup: POST http://localhost:5000/api/users/signup`);
  console.log(`👑 Create admin: POST http://localhost:5000/api/admin/setup-first-admin`);
  console.log(`🛒 Cart: GET http://localhost:5000/api/cart (requires auth)`);
  console.log(`📦 Orders: POST http://localhost:5000/api/orders/create (requires auth)`);
  console.log(`🔑 JWT_SECRET: ${process.env.JWT_SECRET ? "✓ Set" : "✗ NOT SET!"}`);
  
});