// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// User order routes
router.use(authMiddleware);

// Create new order
router.post('/create', orderController.createOrder);

// Get user's orders
router.get('/my-orders', orderController.getUserOrders);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Get order by order number
router.get('/number/:orderNumber', orderController.getOrderByNumber);

// Cancel order
router.put('/:id/cancel', orderController.cancelOrder);

// Admin order routes
router.use(adminMiddleware);

// Get all orders (admin only)
router.get('/', orderController.getAllOrders);

// Update order status (admin only)
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;