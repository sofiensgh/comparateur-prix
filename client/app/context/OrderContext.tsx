// app/context/OrderContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  supplier: string;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: 'cash_on_delivery' | 'credit_card' | 'paypal';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: Order[];
}

interface OrderContextType {
  // User state
  myOrders: Order[];
  currentOrder: Order | null;
  
  // Admin state
  allOrders: Order[];
  orderStats: OrderStats | null;
  orderPagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // Loading states
  loading: boolean;
  adminLoading: boolean;
  error: string | null;
  
  // User actions
  createOrder: (orderData: {
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    paymentMethod: 'cash_on_delivery' | 'credit_card' | 'paypal';
    notes?: string;
  }) => Promise<{ success: boolean; order?: Order; message?: string }>;
  
  fetchMyOrders: () => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<Order | null>;
  fetchOrderByNumber: (orderNumber: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  
  // Admin actions
  fetchAllOrders: (filters?: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;
  
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => Promise<boolean>;
  fetchOrderStats: () => Promise<void>;
  
  // Clear states
  clearOrders: () => void;
  clearCurrentOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [orderPagination, setOrderPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Fetch user's orders on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    } else {
      setMyOrders([]);
      setCurrentOrder(null);
    }
  }, [isAuthenticated]);

  // User: Create new order - FIXED VERSION
  const createOrder = async (orderData: {
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    paymentMethod: 'cash_on_delivery' | 'credit_card' | 'paypal';
    notes?: string;
  }) => {
    console.log('🛒 createOrder called');
    console.log('🛒 User authenticated:', isAuthenticated);
    console.log('🛒 Cart state:', cart);
    
    if (!isAuthenticated || !user) {
      console.log('❌ User not authenticated');
      return { 
        success: false, 
        message: 'Please login to create an order' 
      };
    }

    // Validate cart exists and has items
    if (!cart) {
      console.log('❌ Cart is null');
      return { 
        success: false, 
        message: 'Your cart is not available. Please try again.' 
      };
    }

    if (!cart.items || cart.items.length === 0) {
      console.log('❌ Cart items is empty');
      return { 
        success: false, 
        message: 'Your cart is empty. Add items to your cart first.' 
      };
    }

    console.log('🛒 Cart items:', cart.items);

    setLoading(true);
    setError(null);

    try {
      // Calculate totals from cart
      const subtotal = cart.totalPrice || cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingFee = orderData.shippingAddress.city?.toLowerCase().includes('casablanca') ? 30 : 50;
      const tax = subtotal * 0.1; // 10% VAT
      const totalAmount = subtotal + shippingFee + tax;

      console.log('🛒 Calculated totals:', { subtotal, shippingFee, tax, totalAmount });

      // Format order items
      const orderItems = cart.items.map(item => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
        supplier: item.supplier,
        total: item.price * item.quantity,
      }));

      console.log('🛒 Formatted order items:', orderItems);

      const orderPayload = {
        ...orderData,
        items: orderItems,
        subtotal,
        shippingFee,
        tax,
        totalAmount,
        userEmail: user.email,
        userName: user.username,
      };

      console.log('🛒 Sending order payload:', orderPayload);

      const response = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      console.log('🛒 Order API response status:', response.status);

      const data = await response.json();
      console.log('🛒 Order API response data:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      // Clear cart after successful order
      try {
        await clearCart();
        console.log('✅ Cart cleared after order');
      } catch (cartError) {
        console.warn('⚠️ Could not clear cart:', cartError);
        // Don't fail the order if cart clearing fails
      }
      
      // Update orders list
      await fetchMyOrders();
      
      // Set current order for confirmation page
      if (data.order) {
        setCurrentOrder(data.order);
        console.log('✅ Order created successfully:', data.order.orderNumber);
      }

      return { 
        success: true, 
        order: data.order,
        message: 'Order created successfully!' 
      };
    } catch (error) {
      console.error('❌ Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // User: Fetch my orders
  const fetchMyOrders = async () => {
    if (!isAuthenticated) {
      console.log('🛒 Not authenticated, skipping order fetch');
      return;
    }

    setLoading(true);
    try {
      console.log('🛒 Fetching user orders...');
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        credentials: 'include',
      });

      console.log('🛒 Orders API response status:', response.status);
      
      if (response.status === 401) {
        console.log('🛒 Authentication expired');
        setMyOrders([]);
        return;
      }

      const data = await response.json();
      console.log('🛒 Orders API data:', data);

      if (data.success) {
        setMyOrders(data.orders || []);
        console.log('✅ User orders loaded:', data.orders?.length || 0);
      } else {
        console.warn('⚠️ Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setMyOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // User: Get order by ID
  const fetchOrderById = async (orderId: string) => {
    if (!orderId || !isAuthenticated) {
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        return data.order;
      }
      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // User: Get order by order number
  const fetchOrderByNumber = async (orderNumber: string) => {
    if (!orderNumber || !isAuthenticated) {
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/number/${orderNumber}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        return data.order;
      }
      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // User: Cancel order
  const cancelOrder = async (orderId: string) => {
    if (!orderId || !isAuthenticated) {
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Update local orders
        setMyOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, orderStatus: 'cancelled' }
              : order
          )
        );
        
        if (currentOrder?._id === orderId) {
          setCurrentOrder(prev => 
            prev ? { ...prev, orderStatus: 'cancelled' } : null
          );
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Fetch all orders
  const fetchAllOrders = async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    if (!user || user.role !== 'admin') {
      console.log('❌ User is not admin, skipping order fetch');
      return;
    }

    setAdminLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters?.page) {
        queryParams.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }
      if (filters?.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
      }
      if (filters?.sortOrder) {
        queryParams.append('sortOrder', filters.sortOrder);
      }

      const url = `${API_URL}/orders${queryParams.toString() ? `?${queryParams}` : ''}`;
      console.log('🛒 Fetching admin orders:', url);
      
      const response = await fetch(url, {
        credentials: 'include',
      });

      console.log('🛒 Admin orders response status:', response.status);
      const data = await response.json();
      console.log('🛒 Admin orders data:', data);

      if (data.success) {
        setAllOrders(data.orders || []);
        if (data.pagination) {
          setOrderPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching all orders:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin: Update order status
  const updateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    setAdminLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        // Update in all orders
        setAllOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, orderStatus: status, updatedAt: new Date().toISOString() }
              : order
          )
        );
        
        // Update in my orders if user owns it
        setMyOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, orderStatus: status, updatedAt: new Date().toISOString() }
              : order
          )
        );
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin: Fetch order statistics
  const fetchOrderStats = async () => {
    if (!user || user.role !== 'admin') {
      return;
    }

    setAdminLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/stats`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setOrderStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  // Clear states
  const clearOrders = () => {
    setMyOrders([]);
    setAllOrders([]);
    setOrderStats(null);
  };

  const clearCurrentOrder = () => {
    setCurrentOrder(null);
  };

  return (
    <OrderContext.Provider
      value={{
        // State
        myOrders,
        currentOrder,
        allOrders,
        orderStats,
        orderPagination,
        loading,
        adminLoading,
        error,
        
        // Actions
        createOrder,
        fetchMyOrders,
        fetchOrderById,
        fetchOrderByNumber,
        cancelOrder,
        fetchAllOrders,
        updateOrderStatus,
        fetchOrderStats,
        clearOrders,
        clearCurrentOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};