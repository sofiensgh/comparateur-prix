const express = require("express");
const mongoose = require("mongoose");
const ElectroTounesData = require("./models/ElectroTounesModel");
const MyTekData = require("./models/MyTekTtnModel");

const SpaceNetData = require("./models/SpaceNetModel");

const TunisiaNetData = require("./models/TunisiaNetModel");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/route");
const cookieParser = require("cookie-parser");
const nodemailerRoutes = require("./routes/nodemailerRoutes"); // Import the nodemailer router


const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors"); // Import the cors package

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
app.use(cors());

// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser()); // Make sure this is used before the routes




app.use("/api", productRoutes);

// user Routes
const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);

app.use('/api/nodemailer', nodemailerRoutes);


app.use(bodyParser.json());

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
