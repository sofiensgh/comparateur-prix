"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Avis from '@/components/Avis'; // Import the Avis component
import { Product } from '../../../types';
import OfferCard from '@/components/OfferCards';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';

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
    { _id: '1', img: '/fournisseur/mytek.png', title: 'Offer 1', price: 100, availability: true, fournisseur: 'mytek', link: '/offer1' },
    { _id: '2', img: '/fournisseur/spacenet.png', title: 'Offer 2', price: 150, availability: false, fournisseur: 'spacenet', link: '/offer2' },
    { _id: '3', img: '/fournisseur/electrotounes.png', title: 'Offer 2', price: 150, availability: false, fournisseur: 'electrotounes', link: '/offer2' },
    { _id: '4', img: '/fournisseur/tunisianet.png', title: 'Offer 2', price: 150, availability: false, fournisseur: 'tunisianet', link: '/offer2' },
    // Add more offers as needed
  ];

  return (
    <div className="container mx-auto py-20 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Image
            src={product.img || '/path/to/placeholder-image.jpg'}
            alt="product image"
            width={400} 
            height={400} 
            layout="responsive"
            objectFit="cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/path/to/placeholder-image.jpg';
            }}
          />
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
          <h1 className="text-xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-600 mb-2 text-sm">{product.description}</p>
          <p className="text-red-600 font-bold text-lg mb-2">Price: {product.price} DT</p>
          <div className="flex items-center justify-between">
            <p className="text-gray-900 font-bold text-sm">Supplier: {product.fournisseur}</p>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mt-6">
        <h2 className="text-lg font-bold mb-2">Same product in other websites</h2>
        {otherProductOffers.map((offer, index) => (
          <OfferCard key={index} offer={offer} />
        ))}
      </div>
      {/* Avis container */}
      <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mt-6">
        <h2 className="text-lg font-bold mb-2">Avis</h2>
        <p className="text-sm text-gray-600 mb-4">
          Faites-nous part de votre avis sur le produit ou consultez les avis des autres membres.
        </p>
        <div
        
        > <Avis productId={productId} />
          
        </div>
      </div>
      {/* Avis component */}
     
    </div>
  );
}
