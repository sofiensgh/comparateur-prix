import HeroCarousel from "@/components/HeroCarousel"
import ProductCard from "@/components/ProductCard"
import Searchbar from "@/components/Searchbar"
import {data} from './utils/data'
import Image from "next/image"
import FavoritesSidebar from "@/components/FavoritesSidebar"
import Trending from "@/components/Trending"
const Home = () => {
const{products}=data
  
  
return(
  <><section className="px-6 md:px-20 py-20 border-0 border-gray-500 rounded-lg shadow-lg">
    <div className="flex max-xl:flex-col gap-16">
      <div className="flex flex-col justify-center">
        <p className="small-text">
          La stratégie de shopping intelligent est ici:
          <Image
            src="/assets/icons/arrow-right.svg"
            alt="arrow-right"
            width={16}
            height={16} />
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
  {/* </section><section className="trending-section">
      <h2 className="section-text">
        trending
      </h2>
      <div className="flex flex-wrap grap-x-8 gap-y-16">
        {['Apple Iphone 13', 'Asus', 'LG'].map((product) => (
          <div>{product}</div>

        ))}

      </div>
    */}</section>
    
    
    <section className="bg-gray-300 px-6 md:px-20 py-20 border-0 border-gray-500 rounded-lg shadow-lg">
  <h2 className="section-text">Trending Products</h2>
  <div className="text-sm overflow-hidden ">
    {/* {products.map((product) => (
      <ProductCard key={product.id} product={product}>
    ------------------------------------
       
       
       
       {product.name}
        <div className="product-stars">
        <Image
            src="/assets/icons/star.svg"
            alt="star"
            width={16}
            height={16} />
        </div>
       <button>Ajouter au favoris</button>
      
    -----------------------
       </ProductCard>
    ))}*/}

<Trending />

  </div>
  <div>{/* Include the FavoritesSidebar component */}
            <FavoritesSidebar /></div>
   {/*<section className="trending-section">
        <h2 className="section-text">Trending</h2>

        <div className="flex flex-wrap gap-x-8 gap-y-16">
          
         <ProductCard productI={{
          _id: undefined,
          url: "",
          currency: "",
          image: "",
          title: "",
          currentPrice: 0,
          originalPrice: 0,
          priceHistory: [],
          highestPrice: 0,
          lowestPrice: 0,
          averagePrice: 0,
          discountRate: 0,
          description: "",
          category: "",
          reviewsCount: 0,
          stars: 0,
          //isOutOfStock: undefined,
          users: undefined
        }}/>
      
        </div>*/}
</section>
{/* <section className="trending-section">
<h2 className="section-text">Informatique</h2>

</section> */}
 </>



)

}
export default Home