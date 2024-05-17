// src/pages/categories.tsx
import React from 'react';
import CategoryCard from '@/components/CategoryCard';
const categories = [
  {
    title: 'Informatique',
    imageSrc: 'https://www.tunisianet.com.tn/319801-large/setup-gamer-special-pc-de-bureau-gaming-ryzen-5-5600x-rtx-4060-ventus-2x-black-8g-32-go-avec-ecran-msi-24-ips-full-hd-170-hz.jpg',
    description: 'category1',
  },
  {
    title: 'Téléphonie',
    imageSrc: 'https://static.swappa.com/static/images/categories/retro/category_phones_300x300.png',
    description: 'category1',
  },
  {
    title: 'Electroménager',
    imageSrc: 'https://electrotounes.tn/35530-large_default/pack-electromenager-candy-inox.jpg',
    description: 'category1',
  },
  // Add more categories as needed
];


const CategoriesPage = () => {
  return (
    <div className="flex flex-wrap justify-center bg-gray-100 min-h-screen p-6">
      {categories.map((category, index) => (
        <CategoryCard key={index} imageSrc={category.imageSrc} title={category.title} description={category.description}/>
      ))}
    </div>
  );
};

export default CategoriesPage;
