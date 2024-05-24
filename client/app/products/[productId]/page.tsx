"use client"
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../../../types';
import OfferCard from '@/components/OfferCards';

interface ProductProps {
  params: { productId: string };
}

function fetchProductDetails(productId: string): Promise<Product | null> {
  return fetch(`http://localhost:5000/api/product/${productId}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .catch((error) => {
      console.error('Error fetching product details:', error);
      return null;
    });
}

export default function ProductDetails({ params }: ProductProps) {
  const { productId } = params;
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProductDetails(productId).then((data) => {
      setProduct(data);
    });
  }, [productId]);

  if (!product) {
    return <h1>Data not found</h1>;
  }

  // Use local image paths for each fournisseur
  const otherProductOffers = [
    { _id: '1', img: '../../../public/fournisseur/mytek.png', title: 'Offer 1', price: 100, availability: true, fournisseur: 'mytek', link: '/offer1' },
    { _id: '2', img: '../../../public/fournisseur/spacenet.png', title: 'Offer 2', price: 150, availability: false, fournisseur: 'spacenet', link: '/offer2' },
    { _id: '3', img: '../../../public/fournisseur/electrotounes.png', title: 'Offer 2', price: 150, availability: false, fournisseur: 'electrotounes', link: '/offer2' },
    { _id: '4', img: '../../../public/fournisseur/tunisianet.png', title: 'Offer 2', price: 150, availability: false, fournisseur: 'tunisianet', link: '/offer2' },
    // Add more offers as needed
  ];

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
        {otherProductOffers.map((offer, index) => (
          <OfferCard key={index} offer={offer} />
        ))}
        {/* Render other product listings */}
      </div>
    </div>
  );
}
