// routes/productRoutes.js

const express = require("express");
const router = express.Router();
const productController = require("../controllers/controller");

router.get("/products", productController.getAllProducts);
router.get("/productslist", productController.getProductsList);
router.get("/product/:id", productController.getProductById);
router.get("/searchProducts", productController.searchProducts);
router.get("/categories/:categorie", productController.getProductsByCategory);
router.get("/products/by-reference", productController.getProductsByReference);
router.get("/:id/availability", productController.getStock);

module.exports = router;
