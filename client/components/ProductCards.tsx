"use client"
import Image from 'next/image';
import Link from 'next/link';
import { CiHeart } from "react-icons/ci";
import { BsArrowsFullscreen } from "react-icons/bs";
import { MdOutlineStarPurple500 } from 'react-icons/md';
import { FaCheckCircle, FaTimesCircle, FaCartPlus } from 'react-icons/fa'; // Import icons
import React from 'react';

interface Product {
  _id: string;
  img: string;
  image: string;
  title: string;
  price: number;
  fournisseur: string;
  categorie: string;
  rate: number;
  availability: string; // Updated availability field
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const fournisseurImage = `/fournisseur/${product.fournisseur.toLowerCase().replace(/\s+/g, '')}.png`;

  const renderAvailabilityIcon = () => {
    const availabilityLower = product.availability.toLowerCase().replace(/\s+/g, '');
    if (availabilityLower === 'enstock') {
      return <FaCheckCircle className="text-green-500" size={20} />;
    } else if (['epuisé', 'horsstock', 'rupturedestock'].includes(availabilityLower)) {
      return <FaTimesCircle className="text-red-500" size={20} />;
    } else if (['surcommmande', 'surcommande', 'enarrivage'].includes(availabilityLower)) {
      return <FaCartPlus className="text-blue-500" size={20} />;
    } else {
      return null;
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-64">
      <Link href={`/products/${product._id}`} className="block cursor-pointer">
        <div className="relative w-full h-56 sm:h-64 bg-gray-200">
          <Image
            src={product.img || product.image || '/path/to/placeholder-image.jpg'}
            alt={product.title || 'Product Image'}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-4 sm:p-2">
          <h2 className="text-md font-semibold text-gray-800 truncate">{product.title}</h2>
          <p className="text-gray-600 text-xs mt-1 truncate">Category <span className="font-semibold text-primeColor">{product.categorie}</span></p>
          <div className="flex items-center justify-between mt-4">
            <p className="text-red-600 truncate">Price</p>
            <span className="text-md font-bold text-red-600"> {product.price.toFixed(3)} DT</span>
            <div className="flex space-x-2">
              {renderAvailabilityIcon()} {/* Render availability icon */}
              <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <BsArrowsFullscreen size={20} />
              </button>
            </div>
          </div>
        </div>
      </Link>
      {product.fournisseur && (
        <div className="flex justify-center mt-2">
          <Image
            src={fournisseurImage}
            alt={`${product.fournisseur} Logo`}
            width={100}
            height={50}
          />
        </div>
      )}
    </div>
  );
};

export default ProductCard;