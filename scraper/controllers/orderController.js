// backend/controllers/orderController.js
const Order = require('../models/OrderModel');
const Cart = require('../models/CartModel');
const User = require('../models/user');

// Create new order from cart
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Get user details
    const user = await User.findById(req.user.id);
    
    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || 
        !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country ||
        !shippingAddress.phone || !shippingAddress.email) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }
    
    // Calculate totals
    const subtotal = cart.totalPrice;
    const shippingCost = calculateShippingCost(cart.totalPrice, shippingAddress.country);
    const tax = calculateTax(subtotal, shippingAddress.country);
    const totalAmount = subtotal + shippingCost + tax;
    
    // Create order
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
        image: item.image,
        supplier: item.supplier,
        reference: item.reference,
        category: item.category
      })),
      shippingAddress,
      paymentMethod: paymentMethod || 'credit_card',
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      notes: notes || '',
      orderStatus: 'pending',
      paymentStatus: 'pending'
    });
    
    await order.save();
    
    // Clear the cart after successful order
    cart.items = [];
    await cart.save();
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderNumber: order.orderNumber,
        items: order.items,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get order by order number
exports.getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      orderNumber: req.params.orderNumber,
      user: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Cancel order (if pending)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Only allow cancellation if order is pending or processing
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`
      });
    }
    
    order.orderStatus = 'cancelled';
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Helper functions
function calculateShippingCost(subtotal, country) {
  // Base shipping cost
  let shippingCost = 7.0;
  
  // Free shipping for orders over 100 TND
  if (subtotal >= 100) {
    shippingCost = 0;
  }
  
  // Adjust for country (Tunisia specific)
  if (country.toLowerCase() === 'tunisia') {
    shippingCost = Math.max(5.0, shippingCost);
  }
  
  return shippingCost;
}

function calculateTax(subtotal, country) {
  // VAT rate (19% for Tunisia)
  if (country.toLowerCase() === 'tunisia') {
    return subtotal * 0.19;
  }
  
  // Default no tax for international
  return 0;
}

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) {
      query.orderStatus = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      orders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { status, trackingNumber } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (status) {
      order.orderStatus = status;
    }
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};