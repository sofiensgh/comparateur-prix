// import React, { useState } from 'react';
// import axios from 'axios';
// import Link from 'next/link';

// interface Category {
//   id: number;
//   name: string;
//   options: string[];
// }

// interface CategoryWindowProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const CategoryWindow: React.FC<CategoryWindowProps> = ({ isOpen, onClose }) => {
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
//   const [showOptions, setShowOptions] = useState(false); // State for options container visibility

//   const categories: Category[] = [
//     { id: 1, name: 'Informatique', options: ['Option 1', 'Option 2', 'Option 3'] },
//     { id: 2, name: 'Téléphonie', options: ['Option A', 'Option B'] },
//     { id: 3, name: 'Electroménager', options: ['Option X', 'Option Y', 'Option Z'] },
//     // Add more categories and options as needed
//   ];

//   const handleCategoryClick = async (category: Category) => {
//     try {
//       await axios.post('/api/route', category); // Send the entire category object
//       // Handle success or navigate using Next.js router directly
//     } catch (error) {
//       // Handle error
//     }
//   };

//   return (
//     <div className={`category-window ${isOpen ? 'open' : ''}`}>
//       <div className="category-content">
//         <ul className="category-list">
//           <li><Link href="/categories/informatique">Informatique</Link></li>
//           <li><Link href="/categories/telephonie">Téléphonie</Link></li>
//           <li><Link href="/categories/electromenager">Électroménager</Link></li>
//         </ul>
//       </div>
//       <button className="close-button" onClick={onClose}>
//         Close
//       </button>
//     </div>
//   );
// };

// export default CategoryWindow;
