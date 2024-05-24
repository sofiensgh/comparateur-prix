"use client";
import React from 'react';
import CategoryCards from '../../components/CategoryCards';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">Categories</h1>
      <div className="container mx-auto">
        <div className="flex flex-wrap justify-center gap-6">
          <CategoryCards
            imageSrc="https://electrotounes.tn/35530-large_default/pack-electromenager-candy-inox.jpg"
            title="Electroménager"
            categorie="Electromenager"
            items={['Aspirateurs', 'Machine à Laver', 'Climatiseur','Lave vaisselles' ,'Cuisinières']} // Add your specific items here
          />
          <CategoryCards
            imageSrc="https://www.tunisianet.com.tn/319801-large/setup-gamer-special-pc-de-bureau-gaming-ryzen-5-5600x-rtx-4060-ventus-2x-black-8g-32-go-avec-ecran-msi-24-ips-full-hd-170-hz.jpg"
            title="Informatique"
            categorie="Informatique"
            items={['Ordinateurs', 'Composants', 'Péripherique','Stockages','Réseaux et connectivité',]} // Add your specific items here
          />
          <CategoryCards
            imageSrc="https://static.swappa.com/static/images/categories/retro/category_phones_300x300.png"
            title="Téléphonie"
            categorie="Telephonie"
            items={['Smartphones', 'Tablettes', 'Téléphones Fixes','Accessoires Téléphones','Smart Watches']} // Add your specific items here
          />
          {/* Add more CategoryCards as needed */}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
