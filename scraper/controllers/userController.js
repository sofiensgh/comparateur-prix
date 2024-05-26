const User = require("../models/user");
const jwt = require("jsonwebtoken");
const ElectroTounesData = require("../models/ElectroTounesModel");
const MyTekData = require("../models/MyTekTtnModel");
const SpaceNetData = require("../models/SpaceNetModel");
const TunisiaNetData = require("../models/TunisiaNetModel");


exports.signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Create JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // Set cookie
    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({ message: "User created successfully" });
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
  
      // Create JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
  
      // Set cookie
      res.cookie("token", token, { httpOnly: true });
  
      res.status(200).json({ message: "User signed in successfully" });
    } catch (error) {
      console.error("Error signing in user:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


//   USER LOGOUT
exports.signOut = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "User signed out successfully" });
  };
  
  

