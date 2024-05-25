"use client";
import Link from "next/link";
import Image from "next/image";

interface Offer {
  _id: string;
  img: string;
  title: string;
  price: number;
  availability: boolean;
  fournisseur: string;
  productUrl: string;
}

interface OfferCardProps {
  offer: Offer;
}

export default function OfferCard({ offer }: OfferCardProps) {
  const fournisseurImage = `/fournisseur/${offer.fournisseur
    .toLowerCase()
    .replace(/\s+/g, "")}.png`;

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between mb-4 responsive styled">
      {/* Display fournisseur image from public folder */}
      {offer.fournisseur && (
        <div className="flex justify-center mt-2">
          <Image
            src={fournisseurImage}
            alt={`${offer.fournisseur} Logo`}
            width={100}
            height={50}
          />
        </div>
      )}

      {/* Offer details */}
      <div className="flex flex-col ml-4">
        <h3 className="font-bold text-lg">{offer.title}</h3>
        <p className="text-gray-600">${offer.price}</p>
        <div className="flex items-center">
          <span
            className={`mr-2 ${
              offer.availability ? "text-green-500" : "text-red-500"
            }`}
          >
            {offer.availability ? "Available" : "Out of Stock"}
          </span>
          <img
            src="/icons/availability-icon.png"
            alt="Availability Icon"
            width={20}
            height={20}
          />
        </div>
      </div>

      {/* Button to view offer */}
      <Link href={offer.productUrl}>
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer">
          Voir Offre
        </div>
      </Link>
    </div>
  );
}
