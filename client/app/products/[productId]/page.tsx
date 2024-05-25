"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Avis from "@/components/Avis"; // Import the Avis component
import { Product } from "../../../types";
import OfferCard from "@/components/OfferCards";

interface ProductProps {
  params: { productId: string };
}

interface Offer {
  _id: string;
  img: string;
  title: string;
  price: number;
  availability: boolean;
  reference: string;
  fournisseur: string;
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

  useEffect(() => {
    fetchProductDetails(productId).then((data) => {
      setProductDetails(data);
    });
  }, [productId]);

  if (!productDetails) {
    return <h1>Loading...</h1>;
  }

  const { product, similarProducts } = productDetails;

  if (!product) {
    return <h1>Data not found</h1>;
  }

  return (
    <div className="container mx-auto py-20 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Image
            src={product.img || "/path/to/placeholder-image.jpg"}
            alt="product image"
            width={400}
            height={400}
            layout="responsive"
            objectFit="cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/path/to/placeholder-image.jpg";
            }}
          />
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
          <h1 className="text-xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-600 mb-2 text-sm">{product.description}</p>
          <p className="text-red-600 font-bold text-lg mb-2">
            Price: {product.price} DT
          </p>
          <div className="flex items-center justify-between">
            <p className="text-gray-900 font-bold text-sm">
              Reference : {product.reference}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mt-6">
        <h2 className="text-lg font-bold mb-2">
          Other offers for the same product
        </h2>
        {similarProducts.map((offer, index) => (
          <OfferCard key={index} offer={offer} />
        ))}
      </div>
      {/* Avis container */}
      <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mt-6">
        <h2 className="text-lg font-bold mb-2">Avis</h2>
        <p className="text-sm text-gray-600 mb-4">
          Faites-nous part de votre avis sur le produit ou consultez les avis
          des autres membres.
        </p>
        <div>
          {" "}
          <Avis productId={productId} />
        </div>
      </div>
      {/* Avis component */}
    </div>
  );
}
