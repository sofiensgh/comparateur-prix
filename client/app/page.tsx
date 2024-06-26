"use client";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCards";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MdArrowForwardIos, MdArrowBackIos } from 'react-icons/md';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>('http://localhost:5000/api/products');
        console.log(response.data);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const newIndex = Math.max(currentIndex - 1, 0);
      setCurrentIndex(newIndex);
      scrollRef.current.scrollBy({
        left: -scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const newIndex = Math.min(currentIndex + 1, Math.ceil(products.length / itemsPerPage) - 1);
      setCurrentIndex(newIndex);
      scrollRef.current.scrollBy({
        left: scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <section className="px-6 md:px-20 py-20 border-0 border-gray-500 rounded-lg shadow-lg">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <h1 className="head-text">
              Trouvez les meilleures prix en un clic sur <span className="text-primary">FlashPrix</span>
            </h1>
            <p className="mt-6">
              Notre comparateur de prix vous aide à économiser sur vos achats en ligne. Explorez, comparez, et faites des économies facilement. Découvrez l'art de magasiner malin avec nous !
            </p>
          </div>
          <HeroCarousel />
        </div>
      </section>

      <section className="bg-gray-300 px-6 md:px-20 py-20 border-0 border-gray-500 rounded-lg shadow-lg">
        <h2 className="section-text">Produit Différentes</h2>
        <div className="relative">
          <button 
            className="absolute left-0 top-1/2 transform-translate-y-1/2 z-10 bg-gray-800 text-white rounded-full p-3 hover:bg-gray-700 focus:outline-none transition-all duration-200"
            onClick={scrollLeft}
          >
            <MdArrowBackIos size={20} />
          </button>
          <div className="text-sm overflow-x-auto whitespace-nowrap scroll-smooth scrollbar-hide" ref={scrollRef}>
            <div className="inline-flex space-x-4">
              {products.map((product) => (
                product && product._id ? (
                  <ProductCard key={product._id} product={product} />
                ) : null
              ))}
            </div>
          </div>
          <button 
            className="absolute right-0 top-1/2 transform-translate-y-1/2 z-1 bg-gray-800 text-white rounded-full p-3 hover:bg-gray-700 focus:outline-none transition-all duration-200"
            onClick={scrollRight}
          >
            <MdArrowForwardIos size={20} />
          </button>
        </div>
        <div className="flex justify-center mt-4">
          {Array.from({ length: Math.ceil(products.length / itemsPerPage) }, (_, index) => (
            <div
              key={index}
              className={`h-2 w-2 mx-1 rounded-full ${index === currentIndex ? 'bg-gray-800' : 'bg-gray-400'}`}
            />
          ))}
        </div>
      </section>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Home;
