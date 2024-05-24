"use client";
import Image from 'next/image';
import Link from 'next/link';
import { CiHeart } from "react-icons/ci";
import { BsArrowsFullscreen } from "react-icons/bs";
import { MdOutlineStarPurple500 } from 'react-icons/md';
import React from 'react';

interface Product {
  _id: string;
  img: string;
  image: string;
  title: string;
  price: number;
  fournisseur: string;
  categorie:string;
  rate: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-64">
      <Link href={`/products/${product._id}`} className="block cursor-pointer">
        <div className="relative w-full h-56 bg-gray-200">
          <Image
            src={product.img || product.image || '/path/to/placeholder-image.jpg'}
            alt={product.title || 'Product Image'}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-2">
          <h2 className="text-sm font-semibold text-gray-800 truncate">{product.title}</h2>
          <p className="text-gray-600 text-xs mt-1 truncate">categorie <span className="font-semibold text-primeColor">{product.categorie}</span></p>
          <div className="flex items-center mt-1">
            {/* <MdOutlineStarPurple500 className="text-yellow-500 text-lg" /> */}
            <span className="ml-1 text-gray-600 text-sm">offres</span>
          </div>
          <div className="flex items-center justify-between mt-1">
          <p className="text-gray-600 truncate">à partir de</p>
            <span className="text-md font-bold text-gray-800"> {product.price} DT</span>
            <div className="flex space-x-2">
              <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <CiHeart size={20} />
              </button>
              <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <BsArrowsFullscreen size={20} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
