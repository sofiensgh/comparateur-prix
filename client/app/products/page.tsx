// import Image from "next/image";
// import { GetServerSideProps } from 'next';

// interface Product {
//   id: string;
//   image: string;
//   name: string;
//   description: string;
//   price: number;
//   currency: string;
// }

// interface ProductDetailsProps {
//   product: Product | null;
// }

// export default function ProductDetails({ product }: ProductDetailsProps) {
//   if (!product) {
//     return <h1>Data not found</h1>;
//   }

//   return (
//     <>
//       <section className="px-6 md:px-20 py-20 border-3 border-gray-500 rounded-lg shadow-lg">
//         <div className="max-w-screen-xl mx-auto flex items-center gap-10 xl:gap-0">
//           <Image
//             src={product.image}
//             alt="product image"
//             width={400}
//             height={400}
//             onError={(e) => {
//               (e.target as HTMLImageElement).src = '/path/to/placeholder-image.jpg'; // Path to a local placeholder image
//             }}
//           />
//           <section className="px-6 md:px-20 py-24 border-0 broder-red-500">
//             <div className="flex flex-col justify-center gap-2">
//               <p className="text-xl font-semibold">{product.name}</p>
//               <p>{product.description}</p>
//               <p>Prix: {product.price} {product.currency}</p>
//               {/* Render other product details */}
//             </div>
//           </section>
//         </div>
//       </section>
//       <section className="px-6 md:px-20 py-24 border-0 broder-red-500">
//         <div className="flex flex-col justify-center gap-2">same product in other websites</div>
//       </section>
//     </>
//   );
// }

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { productId } = context.params!;
  
//   try {
//     const res = await fetch(`http://your-backend-url/api/product/${productId}`);
//     if (!res.ok) {
//       return { props: { product: null } };
//     }
//     const product = await res.json();
//     return { props: { product } };
//   } catch (error) {
//     console.error('Error fetching product details:', error);
//     return { props: { product: null } };
//   }
// };
