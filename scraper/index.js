const express = require("express");
const mongoose = require("mongoose");
const ElectroTounesData = require("./models/ElectroTounesModel");
const MyTekData = require("./models/MyTekTtnModel");

const SpaceNetData = require("./models/SpaceNetModel");

const TunisiaNetData = require("./models/TunisiaNetModel");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/route");

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

app.use("/api", productRoutes);

app.use(bodyParser.json());

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
