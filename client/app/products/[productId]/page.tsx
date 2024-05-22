"use client";

import Image from "next/image";
import { Product } from "../../types";

interface ProductProps {
  params: { productId: string };
}

async function fetchProductDetails(productId: string): Promise<Product | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/product/${productId}`);
    if (!res.ok) {
      return null;
    }
    const product: Product = await res.json();
    return product;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
}

export default async function ProductDetails({ params }: ProductProps) {
  const { productId } = params;
  const product = await fetchProductDetails(productId);

  if (!product) {
    return <h1>Data not found</h1>;
  }

  return (
    <div className="container mx-auto py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Image
            src={product.img || '/path/to/placeholder-image.jpg'}
            alt="product image"
            width={600}
            height={600}
            className="w-full h-auto object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/path/to/placeholder-image.jpg';
            }}
          />
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 md:p-10">
          <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-gray-900 font-bold text-xl mb-4">Price: {product.price} DT</p>
          <div className="flex items-center justify-between">
            <p className="text-gray-900 font-bold">Supplier: {product.fournisseur}</p>
            {/* Render other product details */}
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6 md:p-10 mt-10">
        <h2 className="text-xl font-bold mb-4">Same product in other websites</h2>
        {/* Render other product listings */}
      </div>
    </div>
  );
}