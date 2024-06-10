"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Avis from "@/components/Avis"; // Import the Avis component
import { Product } from "../../../types";
import OfferCard from "@/components/OfferCards"; // Import the corrected OfferCard component
import LoadingComponent from "@/components/Loading";
import ProductNotFound from "@/components/ProductNotFound";

interface ProductProps {
  params: { productId: string };
}

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

interface ProductDetailsResponse {
  product: Product | null;
  similarProducts: Offer[];
}

async function fetchProductDetails(
  productId: string
): Promise<ProductDetailsResponse | null> {
  try {
    const response = await fetch(
      `http://localhost:5000/api/product/${productId}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data as ProductDetailsResponse;
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
}

export default function ProductDetails({ params }: ProductProps) {
  const { productId } = params;
  const [productDetails, setProductDetails] =
    useState<ProductDetailsResponse | null>(null);
  const [availableOffersCount, setAvailableOffersCount] = useState(0);
  const [showAvailableOffers, setShowAvailableOffers] = useState(true);

  useEffect(() => {
    fetchProductDetails(productId).then((data) => {
      setProductDetails(data);
    });
  }, [productId]);

  useEffect(() => {
    if (productDetails?.similarProducts) {
      const count = productDetails.similarProducts.filter((offer) => {
        const availabilityLower = offer.availability.toLowerCase().replace(/\s+/g, '');
        return availabilityLower === "enstock" || availabilityLower === "disponible";
      }).length;
      setAvailableOffersCount(count);
    }
  }, [productDetails]);

  const handleCheckboxChange = () => {
    setShowAvailableOffers(!showAvailableOffers);
  };

  if (!productDetails) {
    return <h1><LoadingComponent /></h1>;
  }

  const { product, similarProducts } = productDetails;

  if (!product) {
    return <h1><ProductNotFound /></h1>;
  }

  const filteredOffers = showAvailableOffers
  ? similarProducts.filter(
      (offer) => {
        const availabilityLower = offer.availability.toLowerCase().replace(/\s+/g, '');
        return availabilityLower === "enstock" || availabilityLower === "disponible";
      }
    )
  : similarProducts;

  return (
    <div className="bg-gradient-to-r from-gray-100 via-white-500 to-white-500 min-h-screen py-10">
      <div className="container mx-auto py-20 max-w-3xl ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden flex items-center justify-center">
  <div className="w-2/4">
    <Image
      src={product.img || "/path/to/placeholder-image.jpg"}
      alt="product image"
      width={400}
      height={400}
      layout="responsive"
      objectFit="cover"
      className="transition-transform duration-300 hover:scale-105"
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/path/to/placeholder-image.jpg";
      }}
    />
  </div>
</div>


          <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
            <h1 className="text-xl font-bold mb-10">{product.title}</h1>
            <p className="text-gray-600 mb-2 text-m pb-7">{product.description}</p>
            <p className="text-red-600 font-bold text-lg mb-10">
              Prix: {product.price.toFixed(3)} DT
            </p>
            <div className="flex items-center justify-between py-4 bg-green-100 p-4 rounded-md shadow-lg ">
              <p className="text-green-800 font-bold text-md flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 3.293a1 1 0 011.414 0L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                les offres disponible: {availableOffersCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mt-6">
          <h2 className="text-lg font-bold mb-2">Autres offres pour le même produit</h2>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={showAvailableOffers}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            <label className="text-gray-600 text-sm mt-1 truncate">Afficher seulement les offres disponibles en stock</label>
          </div>
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer, index) => (
              <OfferCard key={index} offer={offer} />
            ))
          ) : (
            <p className="text-center text-gray-500">Aucune offre disponible.</p>
          )}
        </div>
        {/* Avis container */}
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mt-6">
          <h2 className="text-lg font-bold mb-2">Avis</h2>
          <p className="text-sm text-gray-600 mb-4">
            Faites-nous part de votre avis sur le produit ou consultez les avis
            des autres membres.
          </p>
          <div>
            <Avis productId={productId} />
          </div>
        </div>
      </div>
    </div>
  );
}