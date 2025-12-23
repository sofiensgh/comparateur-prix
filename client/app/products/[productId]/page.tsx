// app/product/[productId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Avis from "@/components/Avis";
import { Product } from "../../../types";
import OfferCard from "@/components/OfferCard";
import LoadingComponent from "@/components/Loading";
import ProductNotFound from "@/components/ProductNotFound";
import { useParams, useRouter } from "next/navigation";
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { 
  FaShoppingCart, 
  FaCheck, 
  FaExclamationTriangle,
  FaHeart,
  FaShareAlt,
  FaPlus,
  FaMinus
} from "react-icons/fa";

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
    console.log(`🔍 Fetching product details for ID: ${productId}`);
    
    const response = await fetch(
      `http://localhost:5000/api/product/${productId}`
    );
    
    console.log(`📊 API Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status}`, errorText);
      throw new Error(`API Error ${response.status}: ${response.statusText}. Details: ${errorText.substring(0, 200)}`);
    }
    
    const data = await response.json();
    console.log("✅ API Response Data:", data);
    return data as ProductDetailsResponse;
    
  } catch (error) {
    console.error("❌ Error fetching product details:", error);
    return null;
  }
}

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  
  const [productDetails, setProductDetails] = useState<ProductDetailsResponse | null>(null);
  const [availableOffersCount, setAvailableOffersCount] = useState(0);
  const [showAvailableOffers, setShowAvailableOffers] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      setError(null);
      console.log(`🔄 Starting fetch for productId: ${productId}`);
      
      fetchProductDetails(productId).then((data) => {
        if (data === null) {
          setError("Failed to load product details. The product may not exist or the server is unavailable.");
        }
        setProductDetails(data);
        setIsLoading(false);
      });
    }
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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!productDetails?.product) {
      setCartError("Product information not available");
      return;
    }

    const product = productDetails.product;
    
    // Validate required fields
    if (!product._id) {
      setCartError("Product ID is missing");
      return;
    }
    
    if (!product.title) {
      setCartError("Product title is missing");
      return;
    }
    
    if (product.price === undefined || product.price === null) {
      setCartError("Product price is missing");
      return;
    }

    setAddingToCart(true);
    setCartError(null);
    
    try {
      console.log('🛒 Adding product to cart:', {
        productId: product._id,
        title: product.title,
        price: product.price,
        supplier: product.fournisseur
      });
      
      await addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.img || '',
        supplier: product.fournisseur || 'Unknown',
        quantity: quantity
      });
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartError(error instanceof Error ? error.message : 'Failed to add to cart');
      setTimeout(() => setCartError(null), 5000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleIncrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (!cartError && !addingToCart) {
      router.push('/cart');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(price);
  };

  const isProductAvailable = () => {
    if (!productDetails?.product) return false;
    const availability = productDetails.product.availability?.toLowerCase().replace(/\s+/g, '');
    return availability === "enstock" || availability === "disponible" || availability === "instock";
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Product</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="bg-yellow-50 p-4 rounded mb-4">
            <p className="text-sm text-gray-600">
              <strong>Debug Info:</strong> Product ID: {productId}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!productDetails || !productDetails.product) {
    return <ProductNotFound />;
  }

  const { product, similarProducts } = productDetails;

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
      <div className="container mx-auto py-20 max-w-6xl">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="relative w-full h-96">
              <Image
                src={product.img || "/assets/images/placeholder-product.jpg"}
                alt={product.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/images/placeholder-product.jpg";
                }}
              />
              {/* Badges */}
              {!isProductAvailable() && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Out of Stock
                </div>
              )}
              {product.fournisseur && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {product.fournisseur}
                </div>
              )}
            </div>
          </div>

          {/* Product Info and Actions */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            {/* Product Title and Category */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <FaHeart className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <FaShareAlt className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {product.categorie || 'Uncategorized'}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">Ref: {product.reference || 'N/A'}</span>
              </div>
            </div>

            {/* Product Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Price Section */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(product.price)} DT
                </span>
                {product.price > 100 && (
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                    Free Shipping
                  </span>
                )}
              </div>
              
              {/* Availability Status */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${isProductAvailable() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-medium ${isProductAvailable() ? 'text-green-600' : 'text-red-600'}`}>
                  {isProductAvailable() ? 'In Stock' : 'Out of Stock'}
                </span>
                {availableOffersCount > 0 && (
                  <span className="text-sm text-blue-600 ml-2">
                    {availableOffersCount} other offers available
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={handleDecrementQuantity}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaMinus />
                  </button>
                  <span className="px-4 py-2 text-gray-800 font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrementQuantity}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">{formatPrice(product.price * quantity)} DT</span>
                  <span className="text-sm ml-2">total</span>
                </div>
              </div>
            </div>

            {/* Cart Error Message */}
            {cartError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-center">
                  <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-3" />
                  <p className="text-sm text-red-700">{cartError}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || addedToCart || !isProductAvailable()}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : addingToCart
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : !isProductAvailable()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <FaCheck />
                      Added to Cart
                    </>
                  ) : addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : !isProductAvailable() ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <FaShoppingCart />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart || addedToCart || !isProductAvailable()}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Login Prompt */}
              {!isAuthenticated && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Please login to add items to your cart
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Login or Create Account
                  </button>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Reference</p>
                  <p className="font-medium">{product.reference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-medium">{product.fournisseur || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{product.categorie || 'Uncategorized'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className={`font-medium ${isProductAvailable() ? 'text-green-600' : 'text-red-600'}`}>
                    {product.availability || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Offers Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Other Offers for This Product
              <span className="text-sm text-gray-500 ml-2">
                ({availableOffersCount} available)
              </span>
            </h2>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available-only"
                checked={showAvailableOffers}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="available-only" className="ml-2 text-sm text-gray-700">
                Show only available offers
              </label>
            </div>
          </div>
          
          {filteredOffers.length > 0 ? (
            <div className="space-y-4">
              {filteredOffers.map((offer, index) => (
                <OfferCard key={offer._id || index} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaExclamationTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No offers available</p>
              {showAvailableOffers && (
                <button
                  onClick={() => setShowAvailableOffers(false)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Show all offers (including out of stock)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          <p className="text-gray-600 mb-6">
            Share your opinion about this product or check reviews from other customers.
          </p>
          <div>
            <Avis productId={productId} />
          </div>
        </div>
      </div>
    </div>
  );
}