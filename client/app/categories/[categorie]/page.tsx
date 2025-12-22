"use client";
import { useState, useEffect, use } from "react"; // Added 'use' import
import useSWR from "swr";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProductCards from "@/components/ProductCards";
import LoadingComponent from "@/components/Loading";
import PriceFilter from "@/components/PriceFilter";
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
  brandId: string;
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
  params: Promise<{ categorie: string }>; // ✅ Changed to Promise
}) {
  // ✅ FIXED: Unwrap params using use() hook
  const { categorie } = use(params);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const brandIdParam = searchParams.get("brandId");

  const [currentPage, setCurrentPage] = useState(
    pageParam ? parseInt(pageParam) : 1
  );
  const [minPrice, setMinPrice] = useState<number | null>(
    minPriceParam ? parseInt(minPriceParam) : null
  );
  const [maxPrice, setMaxPrice] = useState<number | null>(
    maxPriceParam ? parseInt(maxPriceParam) : null
  );
  const [brandId, setBrandId] = useState<string | null>(brandIdParam);
  const [localBrandId, setLocalBrandId] = useState<string | null>(brandIdParam);

  const productsPerPage = 12;

  const { data, error, isLoading } = useSWR(
    `http://localhost:5000/api/productslist?categorie=${categorie}&page=${currentPage}&limit=${productsPerPage}${
      minPrice ? `&minPrice=${minPrice}` : ""
    }${maxPrice ? `&maxPrice=${maxPrice}` : ""}${
      brandId ? `&brandId=${encodeURIComponent(brandId)}` : ""
    }`,
    fetcher
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push(
      `${pathname}?page=${page}${
        minPrice !== null ? `&minPrice=${minPrice}` : ""
      }${maxPrice !== null ? `&maxPrice=${maxPrice}` : ""}${
        brandId !== null ? `&brandId=${brandId}` : ""
      }`
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
    );
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
  }, [categorie, pageParam]); // ✅ Changed params.categorie to categorie

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
    <div className="flex flex-col md:flex-row">
      <aside className="w-full md:w-1/4 p-4 bg-gray-200 sticky md:top-0 md:h-screen overflow-y-auto md:overflow-y-scroll transition-all duration-300 ease-in-out mb-4 md:mb-0">
        <h2 className="text-xl font-bold mb-4 text-center md:text-left">Filtres</h2>
        <input
          type="text"
          placeholder="Entrez la marque"
          value={localBrandId || ""}
          onChange={handleBrandIdInputChange}
          className="border border-gray-300 rounded-md p-2 mb-4 w-full transition duration-300 ease-in-out focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={handleFilterSubmit}
          className="px-4 py-2 bg-red-500 text-white rounded-md w-full hover:bg-red-600 focus:outline-none transition duration-300 ease-in-out"
        >
          Filtrez
        </button>
        <PriceFilter onFilterChange={handleFilterChange} />
      </aside>

      <main className="w-full md:w-3/4 p-4">
        <h1 className="text-2xl font-bold mb-8">{categorie} Produits</h1> {/* ✅ Changed params.categorie to categorie */}
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="spinner"></div>
          </div>
        ) : (
          <div>
            {currentPageData.length === 0 ? (
              <div><ProductNotFound /></div>
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
                  Page {currentPage} de {totalPages}
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