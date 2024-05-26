// controllers/productController.js

const ElectroTounesData = require("../models/ElectroTounesModel");
const MyTekData = require("../models/MyTekTtnModel");
const SpaceNetData = require("../models/SpaceNetModel");
const TunisiaNetData = require("../models/TunisiaNetModel");
const stringSimilarity = require("string-similarity");

// const preprocessReference = (reference) => {
//   let processedReference = reference.trim(); // Trim any leading or trailing spaces

//   if (!processedReference.startsWith("[") && !processedReference.endsWith("]")) {
//     processedReference = `[${processedReference}]`;
//   }

//   if (processedReference.endsWith(".")) {
//     processedReference = `[${processedReference}]`;
//   }

//   return processedReference;
// };



exports.getAllProducts = async (req, res) => {
  try {
    const electroTounesProducts = await ElectroTounesData.find().limit(10);
    const myTekProducts = await MyTekData.find().limit(10);
    const spaceNetProducts = await SpaceNetData.find().limit(10);
    const tunisiaNetProducts = await TunisiaNetData.find().limit(10);

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
};

exports.getProductsList = async (req, res) => {
  try {
    const { page = 1, categorie } = req.query;
    const pageNumber = parseInt(page, 10);

    const skip = (pageNumber - 1) * 10; // Assuming default limit is 10
    console.log(`Pagination parameters - Page: ${pageNumber}, Skip: ${skip}`);

    let query = {};

    if (categorie) {
      query = { categorie: categorie };
    }

    const electroTounesProducts = await ElectroTounesData.find(query).skip(
      skip
    );
    const myTekProducts = await MyTekData.find(query).skip(skip);
    const spaceNetProducts = await SpaceNetData.find(query).skip(skip);
    const tunisiaNetProducts = await TunisiaNetData.find(query).skip(skip);

    const allProducts = [
      ...electroTounesProducts,
      ...myTekProducts,
      ...spaceNetProducts,
      ...tunisiaNetProducts,
    ];

    console.log("Fetched products:", allProducts.length);
    res.json(allProducts);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};






 // comparaison
 const preprocessReference = (reference) => {
  // Remove brackets, spaces, and special characters from the reference
  return reference.replace(/[\[\]\s\-_/\\.,;:(){}]/g, '').toLowerCase();
};

const preprocessTitle = (title) => {
  // Remove unnecessary characters and convert to lowercase
  return title.replace(/[\[\]\s\-_/\\.,;:(){}]/g, '').toLowerCase();
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Received request for product ID: ${id}`);

    let product = await ElectroTounesData.findById(id);
    if (!product) product = await MyTekData.findById(id);
    if (!product) product = await SpaceNetData.findById(id);
    if (!product) product = await TunisiaNetData.findById(id);

    if (!product) {
      console.log(`No product found with ID: ${id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    const reference = preprocessReference(product.reference);
    const title = preprocessTitle(product.title);
    console.log(`Searching for products with reference: ${reference} and title: ${title}`);

    // Define a search query for each collection with logging
    const searchQuery = {
      $or: [
        { reference: new RegExp(`^${reference}$`, 'i') },
        { title: new RegExp(title, 'i') }
      ]
    };

    console.log('Searching in ElectroTounesData...');
    const electroTounesResults = await ElectroTounesData.find(searchQuery).lean().exec();
    console.log('ElectroTounesData results:', electroTounesResults);

    console.log('Searching in MyTekData...');
    const myTekResults = await MyTekData.find(searchQuery).lean().exec();
    console.log('MyTekData results:', myTekResults);

    console.log('Searching in SpaceNetData...');
    const spaceNetResults = await SpaceNetData.find(searchQuery).lean().exec();
    console.log('SpaceNetData results:', spaceNetResults);

    console.log('Searching in TunisiaNetData...');
    const tunisiaNetResults = await TunisiaNetData.find(searchQuery).lean().exec();
    console.log('TunisiaNetData results:', tunisiaNetResults);

    const similarProductsResults = [
      ...electroTounesResults,
      ...myTekResults,
      ...spaceNetResults,
      ...tunisiaNetResults
    ];

    // Calculate similarity based on reference and title
    const productWithSimilarity = similarProductsResults.map(p => ({
      ...p,
      similarity: calculateSimilarity(product, p)
    }));

    // Sort the similar products by similarity in descending order
    const sortedSimilarProducts = productWithSimilarity.sort((a, b) => b.similarity - a.similarity);

    res.json({ product, similarProducts: sortedSimilarProducts });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Helper function to calculate similarity between two products
function calculateSimilarity(product1, product2) {
  // Implement your similarity calculation logic here
  // This is a placeholder, you should replace it with your own algorithm
  const referenceSimilarity = preprocessReference(product1.reference) === preprocessReference(product2.reference) ? 1 : 0.5;
  const titleSimilarity = preprocessTitle(product1.title) === preprocessTitle(product2.title) ? 1 : 0.5;
  return (referenceSimilarity + titleSimilarity) / 2;
}











exports.getStock = async (req, res) => {
  try {
    const { reference } = req.params;
    console.log(
      `Received request for availability of product ID: ${reference}`
    );

    // First, fetch the product by ID to get its reference
    let product =
      (await ElectroTounesData.findById(reference)) ||
      (await MyTekData.findById(reference)) ||
      (await SpaceNetData.findById(reference)) ||
      (await TunisiaNetData.findById(reference));

    if (!product) {
      console.log(`No product found with ID: ${reference}`);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(`Product found: ${product.title}`);

    const productReference = preprocessReference(product.reference);
    console.log(`Normalized product reference: ${productReference}`);

    // Now, search for the product by reference in all stores
    const stores = [
      { name: "Electro Tounes", model: ElectroTounesData },
      { name: "MyTek", model: MyTekData },
      { name: "SpaceNet", model: SpaceNetData },
      { name: "TunisiaNet", model: TunisiaNetData },
    ];

    const exactMatchPromises = stores.map(async (store) => {
      const storeProduct = await store.model.findOne({
        reference: productReference,
      });

      if (storeProduct) {
        console.log(
          `Exact product found in store: ${store.name}, Availability: ${storeProduct.availability}`
        );
        return {
          store: store.name,
          availability: storeProduct.availability,
          product: storeProduct,
        };
      } else {
        console.log(`Product not found in store: ${store.name}`);
        return null;
      }
    });

    const exactMatches = await Promise.all(exactMatchPromises);
    const availableProducts = exactMatches.filter((result) => result !== null);

    if (availableProducts.length === 0) {
      console.log(
        `No exact match found for product reference: ${productReference}`
      );
      return res
        .status(404)
        .json({ message: "Exact match not found in any store" });
    }

    console.log(
      `Product availability in stores: ${JSON.stringify(availableProducts)}`
    );

    res.json(availableProducts);
  } catch (error) {
    console.error("Error fetching product availability:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// search for product
exports.searchProducts = async (req, res) => {
  try {
    const { title, categorie } = req.query;

    console.log(`Received request for products with title: ${title}`);

    let searchCriteria = {};
    if (title) {
      // Split the title into individual words
      const keywords = title.split(/\s+/);
      // Create an array to hold regex patterns for each keyword
      const regexPatterns = keywords.map((word) => new RegExp(word, "i"));
      // Construct a regex pattern that matches all keywords in any order
      const regex = regexPatterns
        .map((pattern) => `(?=.*${pattern.source})`)
        .join("");
      // Create the final regex pattern for the title search
      searchCriteria.title = new RegExp(regex, "i");
    }

    if (categorie) {
      searchCriteria.categorie = categorie;
    }

    console.log(`Search criteria: ${JSON.stringify(searchCriteria)}`);

    const electroTounesProducts = await ElectroTounesData.find(searchCriteria);
    const myTekProducts = await MyTekData.find(searchCriteria);
    const spaceNetProducts = await SpaceNetData.find(searchCriteria);
    const tunisiaNetProducts = await TunisiaNetData.find(searchCriteria);

    const products = [
      ...electroTounesProducts,
      ...myTekProducts,
      ...spaceNetProducts,
      ...tunisiaNetProducts,
    ];

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categorie } = req.params;
    console.log(`Received request for category: ${categorie}`);

    const dataElectroTounes = await ElectroTounesData.find({ categorie }).limit(
      50
    );
    const dataMyTek = await MyTekData.find({ categorie }).limit(50);
    const dataSpaceNet = await SpaceNetData.find({ categorie }).limit(50);
    const dataTunisiaNet = await TunisiaNetData.find({ categorie }).limit(50);

    const combinedData = [
      ...dataElectroTounes,
      ...dataMyTek,
      ...dataSpaceNet,
      ...dataTunisiaNet,
    ];

    if (combinedData.length === 0) {
      console.log(`No data found for category: ${categorie}`);
      return res
        .status(404)
        .json({ message: "No data found for this category" });
    } else {
      console.log(
        `Found ${combinedData.length} items for category: ${categorie}`
      );
    }

    res.json(combinedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.getProductsByReference = async (req, res) => {
  try {
    let { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    console.log(`Fetching products with reference: ${reference}`);

    reference = preprocessReference(reference);

    let allProducts = [];

    const suppliers = [
      { model: ElectroTounesData, name: "ElectroTounesData" },
      { model: MyTekData, name: "MyTekData" },
      { model: SpaceNetData, name: "SpaceNetData" },
      { model: TunisiaNetData, name: "TunisiaNetData" },
    ];

    for (const { model, name } of suppliers) {
      const products = await model.find({
        reference: { $regex: new RegExp(reference, "i") },
      });
      allProducts = allProducts.concat(products);
      console.log(`Found ${products.length} products for ${name}`);
    }

    if (allProducts.length === 0) {
      console.log("No products found");
      return res.status(404).json({ error: "No products found" });
    }

    console.log(`Found total ${allProducts.length} products`);

    res.json(allProducts);
  } catch (error) {
    console.error("Error fetching products by reference:", error);
    res.status(500).json({ error: "Error fetching products" });
  }
};
