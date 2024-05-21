"use client";
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import Link from 'next/link';
import { CiHeart } from "react-icons/ci";
import { MdFavoriteBorder } from "react-icons/md";
import { BsArrowsFullscreen } from "react-icons/bs";
import { MdOutlineStarPurple500 } from 'react-icons/md';
import { AiOutlineShopping } from "react-icons/ai";
import React, { ReactNode } from 'react';

// interface Product {
//   image?: string | StaticImport;
//   img?: string;
//   name?: ReactNode;
//   title?: string;
//   price: number;
//   currency: string;
//   id: string;
//   brand?: string;
//   rate?: number;
//   availability?: string;
//   reference?: string;
//   productUrl?: string;
//   // Add other properties of the product if needed
// }

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <>
      <div className="bg-gray-200 w-full relative group border-[1px] border-gray-300 hover:shadow-lg duration-200 shadow-gray-600 rounded-lg overflow-hidden group hover:bg-white hover:shadow-md hover:shadow-black/25 transition-all">
        <div className="w-full h-80 flex items-center justify-center bg-white overflow-hidden">
          <div className="relative">
            <Link href={`/products/${product.id}`}>
              <Image
                src={product.img || product.image || '/path/to/placeholder-image.jpg'}
                alt={product.title || product.name || 'Product Image'}
                width={700}
                height={700}
                className="w-72 h-72 object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/path/to/placeholder-image.jpg'; // Path to a local placeholder image
                }}
              />
            </Link>
            <div className="absolute bottom-0 flex items-center gap-5 justify-center translate-y-[110%] group-hover:-translate-y-2 transition-transform duration-300">
              <Link
                href={`/products/${product.id}`}
                className="bg-gray-800 text-gray-200 px-4 py-2 text-xs rounded-full flex items-center gap-1 hover:bg-gray-950 hover:text-white duration-200">
                <span>
                  <CiHeart />
                </span>
                Favoris
              </Link>
              <Link
                href={`/`}
                className="bg-gray-800 text-gray-200 px-4 py-2 text-xs rounded-full flex items-center gap-1 hover:bg-gray-950 hover:text-white duration-200">
                <span>
                  <BsArrowsFullscreen />
                </span>
                Voir Info
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-80 py-6 flex flex-col gap-1 px-5">
          <div className="flex items-center justify-between">
            <h2 className="text-primeColor font-bold truncate overflow-hidden">{(product.name as string)?.split(' ').slice(0, 2).join(' ') || product.title || 'No Name'}</h2>
            <div className="flex items-center gap-2">
              <p className="text-[#767676] text-xs ">{product.price} {product.currency}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
                  <p className="text-[#767676] text-sm truncate overflow-hidden">produit par <span className="font-semibold text-primeColor">{product.brand}</span></p> 
                  <div className="flex items-center gap-1">
                    <MdOutlineStarPurple500 className="text-lg text-yellow-500"/>
                    <span className="font-meduim text-sm">{product.rate}</span>
                  </div>
                </div>
        </div>
    </div>
    </>

    );
};

export default ProductCard;