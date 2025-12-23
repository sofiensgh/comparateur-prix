// app/context/CartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  supplier: string;
  quantity: number;
  addedAt?: string;
}

interface Cart {
  _id?: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  userId?: string;
  updatedAt?: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (itemData: {
    productId: string;
    title: string;
    price: number;
    image?: string;
    supplier: string;
    quantity?: number;
  }) => Promise<void>;
  updateQuantity: (productId: string, supplier: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, supplier: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local storage key for unauthenticated users
  const LOCAL_CART_KEY = 'local_cart';

  // Get local cart from localStorage
  const getLocalCart = (): Cart => {
    try {
      const localCart = localStorage.getItem(LOCAL_CART_KEY);
      if (localCart) {
        return JSON.parse(localCart);
      }
    } catch (error) {
      console.error('Error reading local cart:', error);
    }
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
  };

  // Save local cart to localStorage
  const saveLocalCart = (cartData: Cart) => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  };

  // Calculate totals for local cart
  const calculateLocalCartTotals = (items: CartItem[]): Omit<Cart, 'items'> => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      totalItems,
      totalPrice
    };
  };

  const fetchCart = async () => {
    console.log('🛒 Fetching cart, isAuthenticated:', isAuthenticated);
    
    // Always use local cart as fallback
    const localCart = getLocalCart();
    
    if (!isAuthenticated || !user) {
      console.log('🛒 User not authenticated, using local cart');
      setCart(localCart);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use credentials: 'include' to send cookies automatically
      const response = await fetch('http://localhost:5000/api/cart', {
        credentials: 'include', // This will include HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🛒 Cart API response status:', response.status);
      
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid, use local cart
        console.log('🛒 Authentication failed, falling back to local cart');
        setCart(localCart);
        return;
      }

      if (!response.ok) {
        console.log('🛒 Cart fetch failed, using local cart');
        setCart(localCart);
        return;
      }

      const data = await response.json();
      console.log('🛒 Cart API response data:', data);
      
      if (data.success && data.cart) {
        setCart(data.cart);
      } else {
        // API returned success: false or no cart, use local cart
        setCart(localCart);
      }
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      // On any error, use local cart
      setCart(localCart);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🛒 CartProvider mounted, checking auth:', isAuthenticated);
    fetchCart();
  }, [isAuthenticated, user]);

  const addToCart = async (itemData: {
    productId: string;
    title: string;
    price: number;
    image?: string;
    supplier: string;
    quantity?: number;
  }) => {
    console.log('🛒 addToCart called with:', itemData);
    
    // Always update local cart first for immediate UI update
    const localCart = getLocalCart();
    
    const existingItemIndex = localCart.items.findIndex(
      item => item.productId === itemData.productId && item.supplier === itemData.supplier
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      localCart.items[existingItemIndex].quantity += itemData.quantity || 1;
    } else {
      // Add new item
      localCart.items.push({
        productId: itemData.productId,
        title: itemData.title,
        price: itemData.price,
        image: itemData.image || '',
        supplier: itemData.supplier,
        quantity: itemData.quantity || 1,
        addedAt: new Date().toISOString()
      });
    }
    
    // Recalculate totals
    const totals = calculateLocalCartTotals(localCart.items);
    const updatedCart = {
      ...localCart,
      ...totals,
      items: localCart.items
    };
    
    // Save and update local cart immediately
    saveLocalCart(updatedCart);
    setCart(updatedCart);
    
    // If user is authenticated, also sync with server
    if (isAuthenticated && user) {
      setLoading(true);
      setError(null);

      try {
        const payload = {
          productId: itemData.productId,
          title: itemData.title,
          price: itemData.price,
          image: itemData.image || '',
          supplier: itemData.supplier,
          quantity: itemData.quantity || 1
        };

        console.log('🛒 Syncing with server:', payload);
        
        const response = await fetch('http://localhost:5000/api/cart/add', {
          method: 'POST',
          credentials: 'include', // Send cookies
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('🛒 Server sync response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Server sync error:', errorData);
          // Don't throw error here, we already updated local cart
          return;
        }

        const data = await response.json();
        console.log('✅ Server sync success:', data);
        
        if (data.success && data.cart) {
          // Update with server cart
          setCart(data.cart);
          // Also update local storage with server cart
          saveLocalCart(data.cart);
        }
      } catch (error) {
        console.error('❌ Error syncing with server:', error);
        // Silently fail - user already has local cart updated
      } finally {
        setLoading(false);
      }
    }
  };

  const updateQuantity = async (productId: string, supplier: string, quantity: number) => {
    // Update local cart first
    const localCart = getLocalCart();
    const itemIndex = localCart.items.findIndex(
      item => item.productId === productId && item.supplier === supplier
    );
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        localCart.items.splice(itemIndex, 1);
      } else {
        localCart.items[itemIndex].quantity = quantity;
      }
      
      const totals = calculateLocalCartTotals(localCart.items);
      const updatedCart = {
        ...localCart,
        ...totals,
        items: localCart.items
      };
      
      saveLocalCart(updatedCart);
      setCart(updatedCart);
      
      // Sync with server if authenticated
      if (isAuthenticated && user) {
        try {
          await fetch(`http://localhost:5000/api/cart/item/${productId}/${supplier}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
          });
        } catch (error) {
          console.error('Error syncing quantity update:', error);
        }
      }
    }
  };

  const removeFromCart = async (productId: string, supplier: string) => {
    // Update local cart first
    const localCart = getLocalCart();
    localCart.items = localCart.items.filter(
      item => !(item.productId === productId && item.supplier === supplier)
    );
    
    const totals = calculateLocalCartTotals(localCart.items);
    const updatedCart = {
      ...localCart,
      ...totals,
      items: localCart.items
    };
    
    saveLocalCart(updatedCart);
    setCart(updatedCart);
    
    // Sync with server if authenticated
    if (isAuthenticated && user) {
      try {
        await fetch(`http://localhost:5000/api/cart/item/${productId}/${supplier}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error syncing removal:', error);
      }
    }
  };

  const clearCart = async () => {
    // Clear local cart
    const emptyCart = {
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
    saveLocalCart(emptyCart);
    setCart(emptyCart);
    
    // Clear server cart if authenticated
    if (isAuthenticated && user) {
      try {
        await fetch('http://localhost:5000/api/cart/clear', {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error clearing server cart:', error);
      }
    }
  };

  const refreshCart = () => fetchCart();

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      error,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};