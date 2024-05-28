"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProductCards from "@/components/ProductCards";
import LoadingComponent from "@/components/Loading";
import PriceFilter from "@/components/PriceFilter";

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
  brandId: string; // Added brandId field
}

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .catch((err) => {
      console.error("Error fetching data:", err);
      throw err;
    });

export default function CategoryPage({
  params,
}: {
  params: { categorie: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const brandIdParam = searchParams.get("brandId"); // Add brandId parameter

  const [currentPage, setCurrentPage] = useState(
    pageParam ? parseInt(pageParam) : 1
  );
  const [minPrice, setMinPrice] = useState<number | null>(
    minPriceParam ? parseInt(minPriceParam) : null
  );
  const [maxPrice, setMaxPrice] = useState<number | null>(
    maxPriceParam ? parseInt(maxPriceParam) : null
  );
  const [brandId, setBrandId] = useState<string | null>(brandIdParam); // Initialize brandId state
  const [localBrandId, setLocalBrandId] = useState<string | null>(brandIdParam); // Local state for input

  const productsPerPage = 12;

  const { data, error, isLoading } = useSWR(
    `http://localhost:5000/api/productslist?categorie=${
      params.categorie
    }&page=${currentPage}&limit=${productsPerPage}${
      minPrice ? `&minPrice=${minPrice}` : ""
    }${maxPrice ? `&maxPrice=${maxPrice}` : ""}${
      brandId ? `&brandId=${encodeURIComponent(brandId)}` : ""
    }`, // Include brandId parameter in fetcher URL
    fetcher
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push(
      `${pathname}?page=${page}${
        minPrice !== null ? `&minPrice=${minPrice}` : ""
      }${maxPrice !== null ? `&maxPrice=${maxPrice}` : ""}${
        brandId !== null ? `&brandId=${brandId}` : ""
      }` // Update router push to include brandId parameter
    );
  };

  const handleFilterChange = (minPrice: number, maxPrice: number) => {
    setMinPrice(minPrice);
    setMaxPrice(maxPrice);
    setCurrentPage(1);
    router.push(
      `${pathname}?page=1&minPrice=${minPrice}&maxPrice=${maxPrice}${
        brandId !== null ? `&brandId=${brandId}` : ""
      }`
    ); // Update router push to include brandId parameter
  };

  const handleBrandIdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBrandId(e.target.value);
  };

  const handleFilterSubmit = () => {
    setBrandId(localBrandId);
    setCurrentPage(1);
    router.push(
      `${pathname}?page=1${minPrice !== null ? `&minPrice=${minPrice}` : ""}${
        maxPrice !== null ? `&maxPrice=${maxPrice}` : ""
      }${localBrandId !== null ? `&brandId=${localBrandId}` : ""}`
    );
  };

  useEffect(() => {
    setCurrentPage(pageParam ? parseInt(pageParam) : 1);
  }, [params.categorie, pageParam]);

  if (error) {
    console.error("Error fetching data:", error);
    return <div>Error loading data</div>;
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!data) {
    return <div>Error: Unexpected data format</div>;
  }

  const { products, totalPages } = data;
  const currentPageData = products;

  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, startPage + 2);

  return (
    <div className="bg-gradient-to-r from-gray-100 via-white-500 to-white-500 flex flex-col md:flex-row min-h-screen">
      <aside className="w-full md:w-1/4 p-4 bg-gray-200 sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <input
          type="text"
          placeholder="Enter brandId"
          value={localBrandId || ""}
          onChange={handleBrandIdInputChange}
          className="border border-gray-300 rounded-md p-2 mb-4 mr-2" // Added mr-2 for margin
        />
        <button
          onClick={handleFilterSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-md" // Added styling for button
        >
          Apply Filter
        </button>
        <PriceFilter onFilterChange={handleFilterChange} />
      </aside>

      <main className="w-full md:w-3/4 p-4">
        <h1 className="text-2xl font-bold mb-8">{params.categorie} Products</h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="spinner"></div>
          </div>
        ) : (
          <div>
            {currentPageData.length === 0 ? (
              <div>No products found</div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentPageData.map((product: Product) => (
                    <ProductCards key={product._id} product={product} />
                  ))}
                </div>
                <div className="mt-8 flex justify-center space-x-2">
                  {Array.from(
                    { length: endPage - startPage + 1 },
                    (_, index) => (
                      <button
                        key={startPage + index}
                        className={`px-4 py-2 border border-gray-300 rounded-lg pagination-btn ${
                          currentPage === startPage + index
                            ? "bg-gray-300"
                            : "bg-white"
                        }`}
                        onClick={() => handlePageChange(startPage + index)}
                      >
                        {startPage + index}
                      </button>
                    )
                  )}
                  {totalPages > endPage && (
                    <>
                      <span>...</span>
                      <button
                        className={`px-4 py-2 border border-gray-300 rounded-lg pagination-btn ${
                          currentPage === totalPages
                            ? "bg-gray-300"
                            : "bg-white"
                        }`}
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <div className="mt-4 text-center text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <style jsx>{`
        .spinner {
          border: 8px solid rgba(0, 0, 0, 0.1);
          border-left-color: #000;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .flex-col.md\\:flex-row {
            flex-direction: column;
          }
          .md\\:w-1/4 {
            width: 100%;
          }
          .md\\:w-3/4 {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
