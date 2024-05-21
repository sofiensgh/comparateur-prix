"use client";
import HeroCarousel from "@/components/HeroCarousel"
import ProductCards from "@/components/ProductCards"
import Searchbar from "@/components/Searchbar"
import { useState, useEffect } from 'react'
import axios from 'axios'
import FavoritesSidebar from "@/components/FavoritesSidebar";
import Image from 'next/image';


const Home = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>('http://localhost:5000/api/products');
        console.log(response.data);
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
  
    };

    fetchProducts();
  }, []);

  return (
    <>
      <section className="px-6 md:px-20 py-20 border-0 border-gray-500 rounded-lg shadow-lg">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              La stratégie de shopping intelligent est ici:
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              />
            </p>
            <h1 className="head-text">
              Trouvez les meilleures prix en un clic sur <span className="text-primary">FlashPrix</span>
            </h1>
            <p className="mt-6">
              Notre comparateur de prix vous aide à économiser sur vos achats en ligne. Explorez, comparez, et faites des économies facilement. Découvrez l'art de magasiner malin avec nous !
            </p>
            <Searchbar />
          </div>
          <HeroCarousel />
        </div>
      </section>

      <section className="bg-gray-300 px-6 md:px-20 py-20 border-0 border-gray-500 rounded-lg shadow-lg">
        <h2 className="section-text">Trending Products</h2>
        <div className="text-sm overflow-hidden ">
          {/* <input 
            type="text" 
            placeholder="Search products" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="mb-4 p-2 border border-gray-400 rounded"
          /> */}
          <div className="flex flex-wrap gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <ProductCards key={product._id} product={product} />
            ))}
          </div>
        </div>
        <div>
          <FavoritesSidebar />
        </div>
      </section>
    </>
  )
}

export default Home
