// app/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const CartPage = () => {
  const router = useRouter();
  const { cart, loading, removeFromCart, updateQuantity, clearCart, refreshCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isClearing, setIsClearing] = useState(false);

  // Refresh cart on component mount
  useEffect(() => {
    refreshCart();
  }, []);

  const handleQuantityChange = async (productId: string, supplier: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(productId, supplier);
      toast.success('Item removed from cart');
    } else {
      await updateQuantity(productId, supplier, newQuantity);
    }
  };

  const handleRemoveItem = async (productId: string, supplier: string) => {
    await removeFromCart(productId, supplier);
    toast.success('Item removed from cart');
  };

  const handleClearCart = async () => {
    if (!cart?.items || cart.items.length === 0) return;
    
    setIsClearing(true);
    try {
      await clearCart();
      toast.success('Cart cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cart');
    } finally {
      setIsClearing(false);
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = 50; // DH
  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + shippingFee + tax;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaShoppingCart className="mr-3 text-blue-600" />
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-2">
            {cart?.items && cart.items.length > 0 
              ? `You have ${cart.items.length} item${cart.items.length > 1 ? 's' : ''} in your cart`
              : 'Your cart is empty'
            }
          </p>
        </div>

        {cart?.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border">
                {/* Cart Header */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Cart Items</h2>
                    <button
                      onClick={handleClearCart}
                      disabled={isClearing}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center disabled:opacity-50"
                    >
                      {isClearing ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                          Clearing...
                        </>
                      ) : (
                        <>
                          <FaTrash className="mr-2" />
                          Clear Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="divide-y">
                  {cart.items.map((item, index) => (
                    <div key={`${item.productId}-${item.supplier}-${index}`} className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title}
                                width={96}
                                height={96}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <FaShoppingCart className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{item.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">Supplier: {item.supplier}</p>
                              <p className="text-lg font-bold text-blue-600 mt-2">
                                {(item.price * item.quantity).toFixed(2)} DT
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.productId, item.supplier)}
                              className="text-red-500 hover:text-red-600 h-fit"
                            >
                              <FaTrash />
                            </button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center mt-4">
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.supplier, item.quantity - 1)}
                                className="px-3 py-2 text-gray-600 hover:text-gray-800"
                                disabled={item.quantity <= 1}
                              >
                                <FaMinus className="w-3 h-3" />
                              </button>
                              <span className="px-4 py-2 border-x">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.supplier, item.quantity + 1)}
                                className="px-3 py-2 text-gray-600 hover:text-gray-800"
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="ml-4 text-gray-600">
                              {item.price.toFixed(2)} DT each
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  <FaArrowRight className="mr-2 rotate-180" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{subtotal.toFixed(2)} DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{shippingFee.toFixed(2)} DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">{tax.toFixed(2)} DT</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{total.toFixed(2)} DT</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="mt-8">
                  <Link
                    href="/cart/checkout"
                    className={`block w-full text-center py-3.5 px-4 rounded-lg font-medium ${
                      cart?.items && cart.items.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    } transition duration-300 shadow-sm flex items-center justify-center`}
                    onClick={(e) => {
                      if (!cart?.items || cart.items.length === 0 || !isAuthenticated) {
                        e.preventDefault();
                        if (!isAuthenticated) {
                          toast.error('Please login to checkout');
                          router.push('/login?redirect=/cart/checkout');
                        } else {
                          toast.error('Your cart is empty');
                        }
                      }
                    }}
                  >
                    {isAuthenticated ? (
                      <>
                        Proceed to Checkout
                        <FaArrowRight className="ml-2" />
                      </>
                    ) : (
                      'Login to Checkout'
                    )}
                  </Link>
                </div>

                {/* Security Info */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Secure checkout</p>
                      <p className="text-xs text-green-700">Your payment information is protected</p>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">We accept:</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-800">COD</span>
                    </div>
                    <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-white">VISA</span>
                    </div>
                    <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-white">MC</span>
                    </div>
                    <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-white">PP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty Cart State
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to find amazing products!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
              >
                Start Shopping
              </Link>
              <Link
                href="/categories"
                className="inline-block bg-gray-100 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-200 transition duration-300 font-medium"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;