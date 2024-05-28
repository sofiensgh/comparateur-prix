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
  availability: string;
}

const ResultatPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const pageParam = searchParams.get("page");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [totalPages, setTotalPages] = useState(0);

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
        setSearchResults(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError("error.message");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [title, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const queryParams = new URLSearchParams();
    queryParams.set("title", title || "");
    queryParams.set("page", newPage.toString());
    const queryString = queryParams.toString();
    router.push(pathname + "?" + queryString);
  };

  return (
    <div className="bg-gradient-to-r from-gray-100 via-white-500 to-white-500 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-8">
        <h1 className="text-2xl font-bold my-4 text-center">
          Search Results for "{title}"
        </h1>
        {loading && (
          <p className="text-center mt-4">
            <LoadingComponent />
          </p>
        )}
        {error && (
          <p className="text-center mt-4 text-red-600">Error: {error}</p>
        )}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults.map((product) => (
              <ProductCards key={product._id} product={product} />
            ))}
          </div>
        </div>
        {searchResults.length === 0 && !loading && !error && (
          <p className="text-center mt-4">
            <ProductNotFound />
          </p>
        )}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => {
            if (
              index === 0 ||
              index === totalPages - 1 ||
              (index >= page - 1 && index <= page + 1)
            ) {
              return (
                <button
                  key={index}
                  className={`px-4 py-2 ${
                    page === index + 1
                      ? "bg-gray-200"
                      : "bg-gray-100 hover:bg-gray-200"
                  } rounded-md mr-2`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultatPage;
