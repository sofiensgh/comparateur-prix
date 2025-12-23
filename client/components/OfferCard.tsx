// components/OfferCards.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCartPlus, 
  FaShoppingCart,
  FaCheck,
  FaExternalLinkAlt
} from "react-icons/fa";
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

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
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const fournisseurImage = `/fournisseur/${offer.fournisseur
    .toLowerCase()
    .replace(/\s+/g, "")}.png`;

  const renderAvailabilityIcon = () => {
    const availabilityLower = offer.availability.toLowerCase().replace(/\s+/g, "");
    if (availabilityLower === "enstock" || availabilityLower === "disponible") {
      return <FaCheckCircle className="text-green-500" size={16} />;
    } else if (["epuisé", "horsstock", "rupturedestock"].includes(availabilityLower)) {
      return <FaTimesCircle className="text-red-500" size={16} />;
    } else if (["surcommande", "enarrivage","surcommande48h"].includes(availabilityLower)) {
      return <FaCartPlus className="text-blue-500" size={16} />;
    } else {
      return null;
    }
  };

  const isAvailableForCart = () => {
    const availabilityLower = offer.availability.toLowerCase().replace(/\s+/g, "");
    return availabilityLower === "enstock" || availabilityLower === "disponible";
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isAvailableForCart()) {
      alert('This product is not available for purchase');
      return;
    }

    // Validate required fields
    if (!offer._id) {
      alert('Product ID is missing');
      return;
    }
    
    if (!offer.title) {
      alert('Product title is missing');
      return;
    }
    
    if (offer.price === undefined || offer.price === null) {
      alert('Product price is missing');
      return;
    }

    setAdding(true);
    
    try {
      await addToCart({
        productId: offer._id,
        title: offer.title,
        price: offer.price,
        image: offer.img || offer.image || '',
        supplier: offer.fournisseur || 'Unknown',
        quantity: 1
      });
      
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(price);
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col md:flex-row items-center justify-between mb-4 shadow-md bg-white hover:shadow-lg transition-shadow duration-300 responsive styled">
      {/* Supplier Logo */}
      {offer.fournisseur && (
        <div className="flex justify-center md:justify-start w-full md:w-auto mb-4 md:mb-0 md:mr-4">
          <div className="relative w-24 h-16">
            <Image
              src={fournisseurImage}
              alt={`${offer.fournisseur} Logo`}
              fill
              className="object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Offer details */}
      <div className="flex flex-col ml-0 md:ml-2 text-center md:text-left flex-grow">
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{offer.title}</h3>
        
        <div className="flex items-center justify-center md:justify-start mb-2">
          <div className="flex items-center mr-4">
            {renderAvailabilityIcon()}
            <span className="text-sm text-gray-600 ml-1">
              {offer.availability}
            </span>
          </div>
          
          {offer.rate > 0 && (
            <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              <span className="font-semibold">{offer.rate}</span>
              <span className="ml-1">★</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline justify-center md:justify-start">
          <span className="text-2xl font-bold text-red-600 mr-2">
            {formatPrice(offer.price)} DT
          </span>
          <span className="text-sm text-gray-500">TTC</span>
        </div>
        
        {offer.categorie && (
          <span className="text-xs text-gray-500 mt-1 hidden md:block">
            Category: {offer.categorie}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={adding || added || !isAvailableForCart()}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            added
              ? 'bg-green-600 text-white'
              : adding
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : !isAvailableForCart()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {added ? (
            <>
              <FaCheck size={14} />
              <span>Ajouté</span>
            </>
          ) : adding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Ajout...</span>
            </>
          ) : !isAvailableForCart() ? (
            <span>Indisponible</span>
          ) : (
            <>
              <FaShoppingCart size={14} />
              <span>Ajouter</span>
            </>
          )}
        </button>

        {/* View Offer Button */}
        <Link 
          href={offer.productUrl} 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
        >
          <FaExternalLinkAlt size={14} />
          <span>Voir Offre</span>
        </Link>
      </div>
    </div>
  );
};

export default OfferCard;