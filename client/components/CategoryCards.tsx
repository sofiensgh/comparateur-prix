import React from 'react';
import { useRouter } from 'next/navigation';

interface CategoryCardProps {
  imageSrc: string;
  title: string;
  categorie: string;
  items: string[]; // Array of items for each category
}

const CategoryCard: React.FC<CategoryCardProps> = ({ imageSrc, title, categorie, items }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/categories/${categorie}`);
  };

  return (
    <div
      className="w-full md:w-72 h-auto rounded-lg overflow-hidden shadow-lg m-4 bg-white hover:shadow-2xl transform transition-all duration-500"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Image and Overlay */}
      <div className="relative h-60 md:h-80 overflow-hidden transition-transform duration-500 transform-gpu group">
        <img
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          style={{ objectFit: 'cover' }}
          src={imageSrc}
          alt={title}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black opacity-40"></div>
        {/* Title and Description */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white p-4">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {/* Organized List */}
          <ul className="mt-2 text-sm text-gray-200">
            {items.map((item, index) => (
              <li key={index} className="py-1">{item}</li>
            ))}
          </ul>
        </div>
      </div>
      {/* Footer */}
      <div className="px-6 py-4">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full w-full transition-colors duration-300"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
