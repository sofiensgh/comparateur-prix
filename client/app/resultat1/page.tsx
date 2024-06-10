"use client"
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
  reference: string;
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
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [filterApplied, setFilterApplied] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!title) return;

      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        queryParams.set("title", title || "");
        queryParams.set("page", page.toString());
        if (filterApplied) {
          if (minPrice !== undefined) queryParams.set("minPrice", minPrice.toString());
          if (maxPrice !== undefined) queryParams.set("maxPrice", maxPrice.toString());
        }

        const response = await fetch(
          `http://localhost:5000/api/searchProductsByTitle?${queryParams.toString()}&limit=12`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setSearchResults(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError("error");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [title, page, minPrice, maxPrice, filterApplied]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const queryParams = new URLSearchParams();
    queryParams.set("title", title || "");
    queryParams.set("page", newPage.toString());
    if (filterApplied) {
      if (minPrice !== undefined) queryParams.set("minPrice", minPrice.toString());
      if (maxPrice !== undefined) queryParams.set("maxPrice", maxPrice.toString());
    }

    router.push(pathname + "?" + queryParams.toString());
  };

  const handleFilterApply = () => {
    setPage(1);
    setFilterApplied(true);
    const queryParams = new URLSearchParams();
    queryParams.set("title", title || "");
    queryParams.set("page", "1");
    if (minPrice !== undefined) queryParams.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined) queryParams.set("maxPrice", maxPrice.toString());

    router.push(pathname + "?" + queryParams.toString());
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;

    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md mr-2"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      buttons.push(<span key="ellipsis1" className="mx-2">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`px-4 py-2 ${
            page === i ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
          } rounded-md mr-2`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      buttons.push(<span key="ellipsis2" className="mx-2">...</span>);
      buttons.push(
        <button
          key="last"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md mr-2"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="bg-gradient-to-r from-gray-100 via-white-500 to-white-500 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-8">
        <h1 className="text-2xl font-bold my-4 text-center">
          Résultats de recherche pour "{title}"
        </h1>
        <div className="flex flex-col lg:flex-row justify-center items-center mb-4">
          <input
            type="number"
            placeholder="minimum prix"
            value={minPrice ?? ""}
            onChange={(e) => setMinPrice(parseInt(e.target.value) || undefined)}
            className="px-5 py-2 mr-2 mb-2 lg:mb-0 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="maximum prix"
            value={maxPrice ?? ""}
            onChange={(e) => setMaxPrice(parseInt(e.target.value) || undefined)}
            className="px-3 py-2 mr-2 mb-2 lg:mb-0 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
            onClick={handleFilterApply}
          >
            Filtrer
          </button>
        </div>
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
          <div className="text-center mt-4">
            <ProductNotFound />
          </div>
        )}
        <div className="flex justify-center mt-4">{renderPaginationButtons()}</div>
        <p className="text-center mt-4">Page {page} de {totalPages}</p>
      </div>
    </div>
  );
};

export default ResultatPage;
