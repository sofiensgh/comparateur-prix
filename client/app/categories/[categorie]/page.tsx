"use client"
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

interface Product {
  _id: string;
  img: string;
  image: string;
  title: string;
  description: string;
  price: number;
  fournisseur: string;
}

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((res) => res.json());

export default function CategoryPage({ params }: { params: { categorie: string } }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, error } = useSWR(`http://localhost:5000/api/categories/${params.categorie}`, fetcher);

  if (error) {
    console.error('Error fetching data:', error);
    notFound();
  }

  if (!data) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-screen">
          <div className="spinner border-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      </div>
    );
  }

  const filteredData = data.filter((product: Product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!filteredData.length) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{params.categorie} Products</h1>
      <input
        type="text"
        placeholder="Search by title"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-8 p-2 border border-gray-300 rounded-lg w-full"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredData.map((product: Product) => (
          <Link href={`/products/${product._id}`} key={product._id}>
            <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <Image
                src={product.img || product.image || '/path/to/placeholder-image.jpg'}
                alt={product.title || 'Product Image'}
                width={700}
                height={700}
                className="w-full h-48 object-cover"
                priority
                quality={100}
                placeholder="blur"
                blurDataURL="/path/to/placeholder-image.jpg"
              />
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2">{product.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-gray-900 font-bold">Price: {product.price}</p>
                  <p className="text-gray-900 font-bold">by: {product.fournisseur}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
