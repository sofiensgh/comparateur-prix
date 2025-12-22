// components/FavoritesList.tsx
'use client';

import { FaHeart, FaShoppingCart, FaTrash, FaStar } from 'react-icons/fa';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  inStock: boolean;
  category: string;
}

export default function FavoritesList() {
  // Sample favorites data
  const favorites: Product[] = [
    { id: 'P001', name: 'Wireless Bluetooth Headphones', price: 89.99, originalPrice: 129.99, image: '/assets/products/headphones.jpg', rating: 4.5, inStock: true, category: 'Electronics' },
    { id: 'P002', name: 'Smart Watch Series 5', price: 249.99, image: '/assets/products/smartwatch.jpg', rating: 4.8, inStock: true, category: 'Electronics' },
    { id: 'P003', name: 'Running Shoes', price: 79.99, originalPrice: 99.99, image: '/assets/products/shoes.jpg', rating: 4.3, inStock: false, category: 'Fashion' },
    { id: 'P004', name: 'Coffee Maker', price: 129.99, image: '/assets/products/coffee.jpg', rating: 4.7, inStock: true, category: 'Home' },
    { id: 'P005', name: 'Backpack', price: 49.99, image: '/assets/products/backpack.jpg', rating: 4.2, inStock: true, category: 'Fashion' },
  ];

  const handleRemoveFavorite = (id: string) => {
    console.log(`Removing favorite: ${id}`);
    // Implement actual removal logic here
  };

  const handleAddToCart = (id: string) => {
    console.log(`Adding to cart: ${id}`);
    // Implement add to cart logic here
  };

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Favorites</h2>
            <p className="text-gray-600 mt-1">{favorites.length} items in your wishlist</p>
          </div>
          <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2">
            <FaHeart /> Clear All
          </button>
        </div>
      </div>

      <div className="divide-y">
        {favorites.map((product) => (
          <div key={product.id} className="p-6 hover:bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Product Image */}
              <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white font-bold">
                  {product.name.charAt(0)}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">{product.category}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded text-xs ${
                      product.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={!product.inStock}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    product.inStock
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
                <button
                  onClick={() => handleRemoveFavorite(product.id)}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {favorites.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHeart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Save items you love to purchase them later</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
}