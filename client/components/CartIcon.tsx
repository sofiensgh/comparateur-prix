// app/components/CartIcon.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const CartIcon = () => {
  const { cart } = useCart();
  
  const itemCount = cart?.totalItems || 0;

  return (
    <Link href="/cart" className="relative group">
      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="relative">
          <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-blue-600" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </div>
        <div className="hidden md:block">
          <div className="text-sm font-medium text-gray-700">Cart</div>
          <div className="text-xs text-gray-500">
            {cart?.totalPrice ? `$${cart.totalPrice.toFixed(2)}` : '$0.00'}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CartIcon;