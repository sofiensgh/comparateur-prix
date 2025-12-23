// backend/controllers/cartController.js
const Cart = require('../models/CartModel');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    console.log(`🛒 Fetching cart for user: ${req.user.id}`);
    
    let cart = await Cart.findOne({ userId: req.user.id });
    
    // If no cart exists, create an empty one
    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: []
      });
      await cart.save();
      console.log('✅ Created new cart for user:', req.user.id);
    }
    
    // Calculate totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems,
        totalPrice,
        userId: cart.userId,
        updatedAt: cart.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cart'
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, title, price, image, supplier, quantity = 1 } = req.body;
    
    console.log('🛒 Adding to cart:', { 
      productId, 
      title, 
      price, 
      supplier, 
      quantity,
      userId: req.user.id 
    });
    
    // Validate required fields
    if (!productId || !title || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, title, and price are required'
      });
    }
    
    // Validate price is a number
    if (typeof price !== 'number' || isNaN(price)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number'
      });
    }
    
    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Find user's cart or create new one
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: []
      });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId === productId && item.supplier === supplier
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        title,
        price,
        image: image || '',
        supplier: supplier || 'Unknown',
        quantity
      });
    }
    
    await cart.save();
    
    // Calculate updated totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      message: 'Product added to cart',
      cart: {
        items: cart.items,
        totalItems,
        totalPrice,
        userId: cart.userId,
        _id: cart._id,
        updatedAt: cart.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Rest of the cart controller functions...

// Update item quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, supplier } = req.params;
    const { quantity } = req.body;
    
    console.log('🛒 Updating quantity:', { productId, supplier, quantity });
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item.productId === productId && item.supplier === supplier
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    // Calculate updated totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      message: 'Quantity updated',
      cart: {
        items: cart.items,
        totalItems,
        totalPrice
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quantity'
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId, supplier } = req.params;
    
    console.log('🛒 Removing from cart:', { productId, supplier });
    
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => 
      !(item.productId === productId && item.supplier === supplier)
    );
    
    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    await cart.save();
    
    // Calculate updated totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        items: cart.items,
        totalItems,
        totalPrice
      }
    });
    
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from cart'
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    console.log('🛒 Clearing cart for user:', req.user.id);
    
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json({
      success: true,
      message: 'Cart cleared',
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart'
    });
  }
};