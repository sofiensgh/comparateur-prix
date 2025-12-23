"use client";

import React, { useState } from "react";
import OfferCard from "./OfferCard"; // Ensure this path is correct

interface Offer {
  _id: string;
  img: string;
  image: string;
  title: string;
  price: number;
  fournisseur: string;
  categorie: string;
  rate: number;
  availability: string;
  productUrl: string;
}

interface OffersListProps {
  offers: Offer[];
}

const OffersList: React.FC<OffersListProps> = ({ offers }) => {
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowAvailableOnly(event.target.checked);
  };

  const filteredOffers = showAvailableOnly
  ? offers.filter((offer) => {
    const availabilityLower = offer.availability.toLowerCase().replace(/\s+/g, '');
    return availabilityLower === "enstock" || availabilityLower === "disponible";
  })
: offers;

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-center items-center">
        <label className="flex items-center text-lg font-medium">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={handleCheckboxChange}
            className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out mr-2"
          />
          Afficher seulement les offres disponibles en stock
        </label>
      </div>
      {filteredOffers.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <OfferCard key={offer._id} offer={offer} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Aucune offre disponible.</p>
      )}
    </div>
  );
};

export default OffersList;
