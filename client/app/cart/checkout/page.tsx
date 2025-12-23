// app/cart/checkout/page.tsx - DEBUG VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useOrder } from '@/app/context/OrderContext';
import { useAuth } from '@/app/context/AuthContext';
import { 
  FaLock, 
  FaShippingFast, 
  FaCreditCard, 
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPaypal,
  FaCcVisa,
  FaCcMastercard,
  FaArrowLeft,
  FaExclamationCircle,
  FaShoppingCart,
  FaBug
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, loading: cartLoading } = useCart();
  const { createOrder, loading: orderLoading } = useOrder();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Morocco',
    phone: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'credit_card' | 'paypal'>('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Pre-fill user data when authenticated
  useEffect(() => {
    if (user?.username) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.username,
      }));
    }
  }, [user]);

  // Check authentication and cart on mount
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      router.push('/login?redirect=/cart/checkout');
      return;
    }

    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      toast.error('Your cart is empty');
      router.push('/cart');
    }
  }, [isAuthenticated, authLoading, cart, cartLoading, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s]{10,}$/.test(shippingAddress.phone)) {
      newErrors.phone = 'Invalid phone number (10+ digits)';
    }
    if (!shippingAddress.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingAddress.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotals = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return { subtotal: 0, shippingFee: 0, tax: 0, total: 0 };
    }
    
    const subtotal = cart.items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const shippingFee = shippingAddress.city?.toLowerCase().includes('casablanca') ? 30 : 50;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingFee + tax;
    
    return { subtotal, shippingFee, tax, total };
  };

  const { subtotal, shippingFee, tax, total } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty. Please add items to your cart first.');
      router.push('/cart');
      return;
    }

    // Debug: Show cart data
    if (debugMode) {
      console.log('🛒 DEBUG - Cart data before order:');
      console.log('Cart:', cart);
      console.log('Cart items:', cart.items);
      console.log('User:', user);
      console.log('Shipping address:', shippingAddress);
      console.log('Payment method:', paymentMethod);
      
      toast.success('Debug mode: Check console for cart data');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrder({
        shippingAddress,
        paymentMethod,
        notes,
      });

      console.log('🛒 Order creation result:', result);

      if (result.success && result.order) {
        toast.success('Order placed successfully!');
        router.push(`/orders/confirmation/${result.order.orderNumber}`);
      } else {
        toast.error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('An error occurred while placing your order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (authLoading || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // If not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <FaExclamationCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please login to proceed with checkout.
          </p>
          <Link
            href="/login?redirect=/cart/checkout"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <FaShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add items to your cart before checking out.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/cart"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Go to Cart
            </Link>
            <Link
              href="/"
              className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Debug Button */}
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="fixed bottom-4 right-4 z-50 bg-yellow-500 text-white p-3 rounded-full shadow-lg hover:bg-yellow-600 transition duration-300"
          title="Debug Mode"
        >
          <FaBug className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/cart" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
          
          {/* Debug Info */}
          {debugMode && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <FaBug className="text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Debug Mode Active</span>
              </div>
              <div className="text-sm text-yellow-700">
                <p>Cart items: {cart.items.length}</p>
                <p>User: {user?.username}</p>
                <p>Cart subtotal: {subtotal.toFixed(2)} DH</p>
                <button
                  onClick={() => {
                    console.log('🛒 Cart debug:', cart);
                    console.log('🛒 User debug:', user);
                    console.log('🛒 Cart items detailed:', cart.items);
                  }}
                  className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                >
                  Log to Console
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaMapMarkerAlt className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Shipping Information</h2>
                    <p className="text-gray-600 text-sm">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => {
                        setShippingAddress({...shippingAddress, fullName: e.target.value});
                        if (errors.fullName) setErrors({...errors, fullName: ''});
                      }}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => {
                        setShippingAddress({...shippingAddress, phone: e.target.value});
                        if (errors.phone) setErrors({...errors, phone: ''});
                      }}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="06XXXXXXXX"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => {
                        setShippingAddress({...shippingAddress, address: e.target.value});
                        if (errors.address) setErrors({...errors, address: ''});
                      }}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 Main Street, District"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => {
                        setShippingAddress({...shippingAddress, city: e.target.value});
                        if (errors.city) setErrors({...errors, city: ''});
                      }}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Casablanca"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => {
                        setShippingAddress({...shippingAddress, postalCode: e.target.value});
                        if (errors.postalCode) setErrors({...errors, postalCode: ''});
                      }}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="20000"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="Morocco">Morocco</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <FaCreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Payment Method</h2>
                    <p className="text-gray-600 text-sm">How would you like to pay?</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div 
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition ${
                      paymentMethod === 'cash_on_delivery' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                  >
                    <input
                      type="radio"
                      id="cash_on_delivery"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash_on_delivery')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="cash_on_delivery" className="ml-3 flex items-center cursor-pointer flex-1">
                      <FaMoneyBillWave className="text-green-600 mr-2" />
                      <span>Cash on Delivery</span>
                    </label>
                  </div>
                  
                  <div 
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition ${
                      paymentMethod === 'credit_card' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod('credit_card')}
                  >
                    <input
                      type="radio"
                      id="credit_card"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'credit_card')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="credit_card" className="ml-3 flex items-center cursor-pointer flex-1">
                      <div className="flex items-center mr-2">
                        <FaCcVisa className="text-blue-600 mr-1" />
                        <FaCcMastercard className="text-red-600" />
                      </div>
                      <span>Credit/Debit Card</span>
                    </label>
                  </div>
                  
                  <div 
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition ${
                      paymentMethod === 'paypal' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <input
                      type="radio"
                      id="paypal"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'paypal')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="paypal" className="ml-3 flex items-center cursor-pointer flex-1">
                      <FaPaypal className="text-blue-600 mr-2" />
                      <span>PayPal</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Any special instructions for delivery, building codes, gate access, etc..."
                  rows={3}
                />
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaShippingFast className="mr-2 text-blue-600" />
                Order Summary
              </h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.items.map((item, index) => (
                  <div key={`${item.productId}-${item.supplier}-${index}`} className="flex justify-between items-start pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-800">{item.title}</h3>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × {Number(item.price).toFixed(2)} DH</p>
                      {item.supplier && (
                        <p className="text-xs text-gray-400">Supplier: {item.supplier}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-gray-800">{(Number(item.price) * Number(item.quantity)).toFixed(2)} DH</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{subtotal.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shippingFee.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">{tax.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>{total.toFixed(2)} DH</span>
                </div>
              </div>

              {/* Secure Checkout Info */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center mb-2">
                  <FaLock className="text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Secure Checkout</span>
                </div>
                <p className="text-xs text-green-700">
                  Your payment information is encrypted and secure. We never store your payment details.
                </p>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || orderLoading || debugMode}
                className={`w-full mt-6 py-3.5 px-4 rounded-lg font-medium flex items-center justify-center ${
                  isSubmitting || orderLoading || debugMode
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                } text-white transition duration-300 shadow-sm`}
              >
                {debugMode ? (
                  <>
                    <FaBug className="mr-2" />
                    Debug Mode Active
                  </>
                ) : isSubmitting || orderLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaLock className="mr-2" />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By placing your order, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms & Conditions
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;