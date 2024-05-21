const express = require("express");
const mongoose = require("mongoose");
const ElectroTounesData = require("./models/ElectroTounesModel");
const MyTekData = require("./models/MyTekTtnModel");

const SpaceNetData = require("./models/SpaceNetModel");

const TunisiaNetData = require("./models/TunisiaNetModel");

const connectDB = require("./config/db");
require("dotenv").config();
const cors = require('cors'); // Import the cors package

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
app.use(cors());

// Middleware to parse JSON
app.use(express.json());




// FETCH ALL PRODUCTS
app.get("/api/products", async (req, res) => {
    try {
      const electroTounesProducts = await ElectroTounesData.find().limit(2);
      const myTekProducts = await MyTekData.find().limit(2);
      const spaceNetProducts = await SpaceNetData.find().limit(2);
      const tunisiaNetProducts = await TunisiaNetData.find().limit(2);
  
      const allProducts = [
        ...electroTounesProducts,
        ...myTekProducts,
        ...spaceNetProducts,
        ...tunisiaNetProducts,
      ];
  
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  });
  
  






// Define a route to fetch scraped data
app.get("/api/electrotounes/:categorie", async (req, res) => {
    try {
      const { categorie } = req.params;
      console.log(`Received request for category: ${categorie}`); // Log the received category
  
      const data = await ElectroTounesData.find({ categorie });
      if (data.length === 0) {
        console.log(`No data found for category: ${categorie}`); // Log if no data is found
      } else {
        console.log(`Found ${data.length} items for category: ${categorie}`); // Log the number of items found
      }
  
      res.json(data);
    } catch (error) {
      console.error("Error fetching data:", error); // Log the error
      res.status(500).json({ message: "Server Error", error });
    }
  });

  app.get("/api/product/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Received request for product ID: ${id}`); // Log the received product ID
  
      let product = await ElectroTounesData.findById(id);
      if (!product) product = await MyTekData.findById(id);
      if (!product) product = await SpaceNetData.findById(id);
      if (!product) product = await TunisiaNetData.findById(id);
  
      if (!product) {
        console.log(`No product found with ID: ${id}`); // Log if no product is found
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error); // Log the error
      res.status(500).json({ message: "Server Error", error });
    }
  });
  

  app.get("/api/mytek/:categorie", async (req, res) => {
    try {
      const { categorie } = req.params;
      console.log(`Received request for category: ${categorie}`); // Log the received category
  
      const data = await MyTekData.find({ categorie });
      if (data.length === 0) {
        console.log(`No data found for category: ${categorie}`); // Log if no data is found
      } else {
        console.log(`Found ${data.length} items for category: ${categorie}`); // Log the number of items found
      }
  
      res.json(data);
    } catch (error) {
      console.error("Error fetching data:", error); // Log the error
      res.status(500).json({ message: "Server Error", error });
    }
  });

  app.get("/api/spacenet/:categorie", async (req, res) => {
    try {
      const { categorie } = req.params;
      console.log(`Received request for category: ${categorie}`); // Log the received category
  
      const data = await SpaceNetData.find({ categorie });
      if (data.length === 0) {
        console.log(`No data found for category: ${categorie}`); // Log if no data is found
      } else {
        console.log(`Found ${data.length} items for category: ${categorie}`); // Log the number of items found
      }
  
      res.json(data);
    } catch (error) {
      console.error("Error fetching data:", error); // Log the error
      res.status(500).json({ message: "Server Error", error });
    }
  });

  app.get("/api/tunisianet/:categorie", async (req, res) => {
    try {
      const { categorie } = req.params;
      console.log(`Received request for category: ${categorie}`); // Log the received category
  
      const data = await TunisiaNetData.find({ categorie });
      if (data.length === 0) {
        console.log(`No data found for category: ${categorie}`); // Log if no data is found
      } else {
        console.log(`Found ${data.length} items for category: ${categorie}`); // Log the number of items found
      }
  
      res.json(data);
    } catch (error) {
      console.error("Error fetching data:", error); // Log the error
      res.status(500).json({ message: "Server Error", error });
    }
  });



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
