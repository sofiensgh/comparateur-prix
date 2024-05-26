const ElectroTounesData = require("../models/ElectroTounesModel");
const MyTekData = require("../models/MyTekTtnModel");
const SpaceNetData = require("../models/SpaceNetModel");
const TunisiaNetData = require("../models/TunisiaNetModel");
const stringSimilarity = require("string-similarity");

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

    const electroTounesProducts = await ElectroTounesData.find(query).skip(skip);
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

    const reference = product.reference; // Reference is already preprocessed in the model
    console.log(`Searching for products with reference: ${reference}`);

    const searchQuery = {
      reference: new RegExp(`^${reference}$`, 'i')
    };

    const searchAndLogResults = async (collection, collectionName) => {
      try {
        console.log(`Searching in ${collectionName}...`);
        const results = await collection.find(searchQuery).lean().exec();
        console.log(`${collectionName} results count:`, results.length);
        if (results.length > 0) {
          console.log(`${collectionName} sample data:`, results[0]);
        }
        return results;
      } catch (err) {
        console.error(`Error fetching data from ${collectionName}:`, err);
        return [];
      }
    };

    const electroTounesResults = await searchAndLogResults(ElectroTounesData, 'ElectroTounesData');
    const myTekResults = await searchAndLogResults(MyTekData, 'MyTekData');
    const spaceNetResults = await searchAndLogResults(SpaceNetData, 'SpaceNetData');
    const tunisiaNetResults = await searchAndLogResults(TunisiaNetData, 'TunisiaNetData');

    const similarProductsResults = [
      ...electroTounesResults,
      ...myTekResults,
      ...spaceNetResults,
      ...tunisiaNetResults
    ];

    if (similarProductsResults.length === 0) {
      console.log('No similar products found.');
      return res.json({ product, similarProducts: [] });
    }

    const productWithSimilarity = similarProductsResults.map(p => ({
      ...p,
      similarity: calculateSimilarity(product, p)
    }));

    const sortedSimilarProducts = productWithSimilarity.sort((a, b) => b.similarity - a.similarity);

    res.json({ product, similarProducts: sortedSimilarProducts });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const preprocessTitle = (title) => {
  return title.replace(/[\[\]\s\-_/\\.,;:(){}]/g, '').toLowerCase();
};

function calculateSimilarity(product1, product2) {
  const referenceSimilarity = product1.reference === product2.reference ? 1 : 0.5;
  const titleSimilarity = preprocessTitle(product1.title) === preprocessTitle(product2.title) ? 1 : 0.5;
  return (referenceSimilarity + titleSimilarity) / 2;
}

exports.getStock = async (req, res) => {
  try {
    const { reference } = req.params;
    console.log(`Received request for availability of product ID: ${reference}`);

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

    const productReference = product.reference; // Reference is already preprocessed in the model
    console.log(`Normalized product reference: ${productReference}`);

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
        console.log(`Exact product found in store: ${store.name}, Availability: ${storeProduct.availability}`);
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
      console.log(`No exact match found for product reference: ${productReference}`);
      return res.status(404).json({ message: "Exact match not found in any store" });
    }

    console.log(`Product availability in stores: ${JSON.stringify(availableProducts)}`);

    res.json(availableProducts);
  } catch (error) {
    console.error("Error fetching product availability:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { title, categorie } = req.query;

    console.log(`Received request for products with title: ${title}`);

    let searchCriteria = {};
    if (title) {
      const keywords = title.split(/\s+/);
      const regexPatterns = keywords.map((word) => new RegExp(word, "i"));
      const regex = regexPatterns.map((pattern) => `(?=.*${pattern.source})`).join("");
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

    const dataElectroTounes = await ElectroTounesData.find({ categorie }).limit(50);
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
      return res.status(404).json({ message: "No data found for this category" });
    } else {
      console.log(`Found ${combinedData.length} items for category: ${categorie}`);
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

    reference = reference.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); // Ensure reference is normalized

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
