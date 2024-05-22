"use client";

import React from 'react';
import { useRouter } from 'next/navigation'; // Updated import

interface CategoryCardProps {
  imageSrc: string;
  title: string;
  description: string;
  categorie: string; // Add category prop for routing
}

const CategoryCard: React.FC<CategoryCardProps> = ({ imageSrc, title, description, categorie }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/categories/${categorie}`);
  };

  return (
    <div
      className="w-72 h-96 rounded-md overflow-hidden shadow-lg m-4 bg-white hover:shadow-2xl transition-shadow duration-300"
      onClick={handleClick}
      style={{ cursor: 'pointer' }} // Add cursor style to indicate clickability
    >
      {/* Image and Overlay */}
      <div className="relative h-60 overflow-hidden transition-transform duration-500 transform-gpu group">
        <img
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          style={{ objectFit: 'cover' }}
          src={imageSrc}
          alt={title}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black opacity-40"></div>
        {/* Title and Description */}
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          <h2 className="text-white text-3xl font-bold mb-2">{title}</h2>
          <p className="text-white text-center">{description}</p>
        </div>
      </div>
      {/* Description */}
      <div className="px-6 py-2">
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
      {/* Footer */}
      <div className="px-6 py-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full w-full transition-colors duration-300"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
