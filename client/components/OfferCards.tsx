"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { FaCheckCircle, FaTimesCircle, FaCartPlus } from "react-icons/fa"; // Import icons

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

interface OfferCardProps {
  offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const fournisseurImage = `/fournisseur/${offer.fournisseur
    .toLowerCase()
    .replace(/\s+/g, "")}.png`;

  const renderAvailabilityIcon = () => {
    const availabilityLower = offer.availability.toLowerCase().replace(/\s+/g, "");
    if (availabilityLower === "enstock" || availabilityLower === "disponible") {
      return <FaCheckCircle className="text-green-500" size={20} />;
    } else if (["epuisé", "horsstock", "rupturedestock"].includes(availabilityLower)) {
      return <FaTimesCircle className="text-red-500" size={20} />;
    } else if (["surcommande", "enarrivage"].includes(availabilityLower)) {
      return <FaCartPlus className="text-blue-500" size={20} />;
    } else {
      return null;
    }
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col md:flex-row items-center justify-between mb-4 shadow-md bg-white hover:shadow-lg transition-shadow duration-300 responsive styled">
      {/* Display fournisseur image from public folder */}
      {offer.fournisseur && (
        <div className="flex justify-center md:justify-start w-full md:w-auto mt-2 md:mt-0 mb-4 md:mb-0">
          <Image
            src={fournisseurImage}
            alt={`${offer.fournisseur} Logo`}
            width={100}
            height={50}
            className="object-contain"
          />
        </div>
      )}

      {/* Offer details */}
      <div className="flex flex-col ml-0 md:ml-4 text-center md:text-left w-full md:w-auto">
        <h3 className="font-bold text-l mb-2">{offer.title}</h3>
        <p className="text-red-600 font-bold text-s mb-1">{offer.price.toFixed(3)} DT</p>
        <div className="flex items-center justify-center md:justify-start">
          <span>{renderAvailabilityIcon()}</span>
          <span className="text-sm text-gray-500 ml-2">{offer.availability}</span>
        </div>
      </div>

      {/* Button to view offer */}
      <Link href={offer.productUrl} className="w-full md:w-auto mt-4 md:mt-0">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 text-center md:text-left font-medium">
          Voir Offre
        </button>
      </Link>
    </div>
  );
};

export default OfferCard;
