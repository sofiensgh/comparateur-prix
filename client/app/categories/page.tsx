"use client";
import React from 'react';
import CategoryCards from '../../components/CategoryCards';

const CategoryPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-200 via-white-500 to-white-500 min-h-screen  p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">Categories</h1>
      <div className="container mx-auto">
        <div className="flex flex-wrap justify-center gap-6">
          <CategoryCards
            imageSrc="https://electrotounes.tn/35530-large_default/pack-electromenager-candy-inox.jpg"
            title="ELECTROMÉNAGER"
            categorie="Electromenager"
            items={['Aspirateurs', 'Machine à Laver', 'Climatiseur','Lave vaisselles' ,'Cuisinières']} // Add your specific items here
          />
          <CategoryCards
            imageSrc="https://www.tunisianet.com.tn/319801-large/setup-gamer-special-pc-de-bureau-gaming-ryzen-5-5600x-rtx-4060-ventus-2x-black-8g-32-go-avec-ecran-msi-24-ips-full-hd-170-hz.jpg"
            title="INFORMATIQUE"
            categorie="Informatique"
            items={['Ordinateurs', 'Composants', 'Péripherique','Stockages','Réseaux et connectivité',]} // Add your specific items here
          />
          <CategoryCards
            imageSrc="https://static.swappa.com/static/images/categories/retro/category_phones_300x300.png"
            title="TÉLÉPHONIE"
            categorie="Telephonie"
            items={['Smartphones', 'Tablettes', 'Téléphones Fixes','Accessoires Téléphones','Smart Watches']} // Add your specific items here
          />
          <CategoryCards
            imageSrc="https://www.picclickimg.com/DGcAAOSwu0RlIDpK/Pack-ANTARION-TV-LED-22-55cm-Full-HD.webp"
            title="IMAGE ET SON"
            categorie="TvAndSon"
            items={['Téléviseur', 'Photos Camescopes', 'Recepteurs Numerique','Projection','Accessoire Téléviseur']} // Add your specific items here
          />
          <CategoryCards
            imageSrc="https://c8.alamy.com/compfr/ea4hj7/set-de-beaute-baignoire-avec-eponge-ea4hj7.jpg"
            title="BEAUTÉ | BIEN ÊTRE "
            categorie="SoinBeaute"
            items={['Montres et Bracelets', 'Parfums', 'Soins Homme','Soins Femme','Massage Bien Etre']} // Add your specific items here
          />
          {/* Add more CategoryCards as needed */}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
