"use client";
// Imports related to client-side functionality
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import ProductCards from "@/components/ProductCards"; // Import the ProductCard component

interface Product {
  _id: string;
  img: string;
  image: string;
  title: string;
  price: number;
  fournisseur: string;
  categorie:string;
  rate: number;
}

interface ProductCardProps {
  product: Product;
}

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .catch((err) => {
      console.error('Error fetching data:', err);
      throw err;
    });

export default function CategoryPage({ params }: { params: { categorie: string } }) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const { data, error } = useSWR(
    `http://localhost:5000/api/productslist?categorie=${params.categorie}&page=${currentPage}&limit=${productsPerPage}`,
    fetcher,
    { onSuccess: () => setLoading(false) }
  );
  useEffect(() => {
    setLoading(true);
    const pageParam = new URLSearchParams(window.location.search).get('page');
    setCurrentPage(pageParam ? parseInt(pageParam) : 1);
  }, [params.categorie, currentPage]);

  if (error) {
    console.error('Error fetching data:', error);
    return <div>Error loading data</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  if (!Array.isArray(data)) {
    console.error('Data is not an array:', data);
    return <div>Error: Unexpected data format</div>;
  }

  const totalPages = Math.ceil(data.length / productsPerPage);
  const currentPageData = data.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="w-full md:w-1/4 p-4 bg-gray-200 sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        {/* Add filter options here */}
      </aside>

      <main className="w-full md:w-3/4 p-4">
        <h1 className="text-2xl font-bold mb-8">{params.categorie} Products</h1>
        {loading ? (
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
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Link href={`/categories/${params.categorie}?page=${index + 1}`} key={index}>
                      <button
                        className={`px-4 py-2 border border-gray-300 rounded-lg ${
                          currentPage === index + 1 ? 'bg-gray-300' : 'bg-white'
                        }`}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </Link> 
                  ))}
                </div>
                <div className="mt-4 text-center text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add your custom styles here */}
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
          .flex-col.md\:flex-row {
            flex-direction: column;
          }
          .md\:w-1/4 {
            width: 100%;
          }
          .md\:w-3/4 {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}