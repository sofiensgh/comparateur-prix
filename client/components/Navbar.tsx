"use client"
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {HiMenuAlt2} from "react-icons/hi";
import CategoryWindow from './CategoryWindow'; // Import your CategoryWindow component
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { link } from 'fs';


const navIcons = [
  { src: '/assets/icons/black-heart.svg', alt: 'heart' },
  { src: '/assets/icons/user.svg', alt: 'user' },
];

const Navbar = () => {
  const[dropdownMenu, setDropdownMenu]=useState(false);
 
  const navBarList=[
    {
      title:"Home",
      link:"/",
  
    },
    { 

      title:"Categorie",
      link:"/categories",
  
    },
    { 

      title:"About",
      link:"/about",
  
    },
  ]
  const pathname= usePathname();
  console.log(pathname);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const toggleCategoryWindow = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };
  return (
  <header className="w-full sticky top-0 bg-white shadow-lg z-10">
      <nav className="nav flex justify-between items-center py-4 px-6">
      <div className="flex items-center gap-0">
  <Link href="/">
    <Image 
      src="/assets/icons/logo.svg"
      width={27}
      height={27}
      alt="logo"
    />
  </Link>
  <p className="nav-logo">
    Flash<span className='text-primary'>Prix</span> 
  </p>
</div>

        <div className="hidden md:inline-flex items-center gap-4">
        {/*<a href="#" onClick={toggleCategoryWindow}>
          Categories 
          </a>
        <div className="flex items-center gap-0">*/}
          {navBarList.map((item) => (
              <Link 
              href={item?.link} 
              key={item?.link} 
              className={`flex navbar__link relative ${pathname === item?.link }`}>
                {item?.title}
              </Link>
          ))}
  
          {/*{navIcons.map((icon) => (
            <Image
              key={icon.alt}
              src={icon.src}
              alt={icon.alt}
              width={28}
              height={28}
              className="object-contain"
            />
          ))}*/}
        {/*<CategoryWindow isOpen={isCategoryOpen} onClose={toggleCategoryWindow} />  Render CategoryWindow when showCategoryWindow is true */}
        </div>
        <HiMenuAlt2 className="inline-flex md:hidden cursor-pointer w-8 h-6" 
        onClick={() => setDropdownMenu(!dropdownMenu)}/>
        {dropdownMenu && (
          <div className="absolute top-10 right-5 flex flex-col gap-2 p-3 rounded lg border bg-white text-base-bold custom-styled-div">
            <Link href="/" className="hover:text-red-1">home</Link>
            <Link href="/about" className="hover:text-red-1">about</Link>
            <Link href="/categories" className="hover:text-red-1">categorie</Link>
          </div>
        )}
        
      </nav>
     

    </header>
  );
};

export default Navbar;
