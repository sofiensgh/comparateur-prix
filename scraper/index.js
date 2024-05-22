const express = require("express");
const mongoose = require("mongoose");
const ElectroTounesData = require("./models/ElectroTounesModel");
const MyTekData = require("./models/MyTekTtnModel");

const SpaceNetData = require("./models/SpaceNetModel");

const TunisiaNetData = require("./models/TunisiaNetModel");
const bodyParser = require('body-parser');


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
  


// SEARCH PRODUCT BASED ON TITLE
app.get("/api/fetchProducts", async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ message: "Title query parameter is required" });
    }

    console.log(`Received request for products with title: ${title}`);

    // Perform a case-insensitive search using a regular expression
    const regex = new RegExp(title, 'i');
    const searchCriteria = { title: regex };

    console.log(`Search criteria: ${JSON.stringify(searchCriteria)}`);

    // Find products in all models based on the search criteria
    const electroTounesProducts = await ElectroTounesData.find(searchCriteria);
    const myTekProducts = await MyTekData.find(searchCriteria);
    const spaceNetProducts = await SpaceNetData.find(searchCriteria);
    const tunisiaNetProducts = await TunisiaNetData.find(searchCriteria);

    // console.log(`ElectroTounes products: ${JSON.stringify(electroTounesProducts)}`);
    // console.log(`MyTek products: ${JSON.stringify(myTekProducts)}`);
    // console.log(`SpaceNet products: ${JSON.stringify(spaceNetProducts)}`);
    // console.log(`TunisiaNet products: ${JSON.stringify(tunisiaNetProducts)}`);

    // Combine all products
    const products = [
      ...electroTounesProducts,
      ...myTekProducts,
      ...spaceNetProducts,
      ...tunisiaNetProducts,
    ];

    // console.log(`Combined products: ${JSON.stringify(products)}`);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});





  app.get('/api/categories/:categorie', async (req, res) => {
    try {
      const { categorie } = req.params;
      console.log(`Received request for category: ${categorie}`); // Log the received category
  
      const dataElectroTounes = await ElectroTounesData.find({ categorie }).limit(4);
      const dataMyTek = await MyTekData.find({ categorie }).limit(4);
      const dataSpaceNet = await SpaceNetData.find({ categorie }).limit(4);
      const dataTunisiaNet = await TunisiaNetData.find({ categorie }).limit(4);
  
      const combinedData = [
        ...dataElectroTounes,
        ...dataMyTek,
        ...dataSpaceNet,
        ...dataTunisiaNet
      ];
  
      if (combinedData.length === 0) {
        console.log(`No data found for category: ${categorie}`); // Log if no data is found
        return res.status(404).json({ message: "No data found for this category" });
      } else {
        console.log(`Found ${combinedData.length} items for category: ${categorie}`); // Log the number of items found
      }
  
      res.json(combinedData);
    } catch (error) {
      console.error("Error fetching data:", error); // Log the error
      res.status(500).json({ message: "Server Error", error });
    }
  });
  // Import necessary modules or libraries for fuzzy search or string matching if needed









  // Function to preprocess the reference
const preprocessReference = (reference) => {
  // Check if the reference contains brackets
  if (reference.startsWith('[') && reference.endsWith(']')) {
    // Remove the brackets
    return reference.slice(1, -1);
  } else {
    // If no brackets, return the reference as is
    return reference;
  }
};





// GET PRODUCT REFERENCE
app.get('/api/products/by-reference', async (req, res) => {
  try {
    let { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    console.log(`Fetching products with reference: ${reference}`);

    // Preprocess the reference
    reference = preprocessReference(reference);

    // Array to store products from all suppliers
    let allProducts = [];

    // Perform a separate query for each supplier model
    const suppliers = [
      { model: ElectroTounesData, name: 'ElectroTounesData' },
      { model: MyTekData, name: 'MyTekData' },
      { model: SpaceNetData, name: 'SpaceNetData' },
      { model: TunisiaNetData, name: 'TunisiaNetData' }
    ];

    for (const { model, name } of suppliers) {
      const products = await model.find({
        reference: { $regex: new RegExp(reference, 'i') }
      });
      allProducts = allProducts.concat(products);
      console.log(`Found ${products.length} products for ${name}`);
    }

    if (allProducts.length === 0) {
      console.log('No products found');
      return res.status(404).json({ error: 'No products found' });
    }

    console.log(`Found total ${allProducts.length} products`);

    res.json(allProducts);
  } catch (error) {
    console.error('Error fetching products by reference:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});











  app.use(bodyParser.json());

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
