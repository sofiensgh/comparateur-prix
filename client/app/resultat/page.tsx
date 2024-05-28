"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import ProductCards from "@/components/ProductCards";
import LoadingComponent from "@/components/Loading";
import ProductNotFound from "@/components/ProductNotFound";


interface Product {
  _id: string;
  img: string;
  image: string;
  title: string;
  price: number;
  fournisseur: string;
  categorie: string;
  rate: number;
  availability: string; // Add availability field to the Product interface
}


const ResultatPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const pageParam = searchParams.get("page");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(pageParam ? parseInt(pageParam) : 1);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!title) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:5000/api/searchProducts?title=${title}&page=${page}&limit=12`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.log("error")
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [title, page]);

  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      updateUrlQueryParam("page", newPage);
    }
  };

  const handleNextPage = () => {
    const newPage = page + 1;
    setPage(newPage);
    updateUrlQueryParam("page", newPage);
  };

  const updateUrlQueryParam = (key, value) => {
    const params = new URLSearchParams(router.query);
    params.set(key, value);
    navigate({ pathname: pathname, search: `?${params.toString()}` });
  };

  return (
    <div className="bg-gradient-to-r from-gray-100 via-white-500 to-white-500 min-h-screen flex items-center justify-center">
    <div className="container mx-auto px-4 sm:px-8">
      <h1 className="text-2xl font-bold my-4 text-center">Search Results for "{title}"</h1>
      {loading && <p className="text-center mt-4"><LoadingComponent /></p>}
      {error && <p className="text-center mt-4 text-red-600">Error: {error}</p>}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {searchResults.map((product: Product) => (
            <ProductCards key={product._id} product={product} />
          ))}
        </div>
      </div>
      {searchResults.length === 0 && !loading && !error && (
        <p className="text-center mt-4"><ProductNotFound /></p>
      )}
      <div className="flex justify-center mt-4">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-4 py-2 mr-2 bg-gray-200 rounded-md"
        >
          Previous Page
        </button>
        <button
          onClick={handleNextPage}
          disabled={searchResults.length < 12}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Next Page
        </button>
      </div>
    </div>
    </div>
  );
};

export default ResultatPage;