// app/products/page.tsx
"use client";
import axios from 'axios';
import { useState, useEffect } from 'react';
import ProductCards from '@/components/ProductCards';

// interface Product {
//   _id: string;
//   image?: string;
//   img?: string;
//   name?: string;
//   title?: string;
//   price: number;
//   currency: string;
//   brand?: string;
//   rate?: number;
//   availability?: string;
//   reference?: string;
//   productUrl?: string;
//   fournisseur?: string;
// }

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCards key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductsPage;