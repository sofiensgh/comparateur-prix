"use client"
import React from 'react';
import CategoryCards from '../../components/CategoryCards';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Categories</h1>
      <div className="flex flex-wrap">
        <CategoryCards
          imageSrc="https://electrotounes.tn/35530-large_default/pack-electromenager-candy-inox.jpg"
          title="Electroménager"
          description="Description of Electroménager"
          categorie="Electromenager"
        />
        <CategoryCards
          imageSrc="https://www.tunisianet.com.tn/319801-large/setup-gamer-special-pc-de-bureau-gaming-ryzen-5-5600x-rtx-4060-ventus-2x-black-8g-32-go-avec-ecran-msi-24-ips-full-hd-170-hz.jpg"
          title="Informatique"
          description="Description of Informatique"
          categorie="Informatique"
        />
        <CategoryCards
          imageSrc="https://static.swappa.com/static/images/categories/retro/category_phones_300x300.png"
          title="Téléphonie"
          description="Description of Téléphonie"
          categorie="Telephonie"
        />
        {/* Add more CategoryCards as needed */}
      </div>
    </div>
  );
};

export default HomePage;
