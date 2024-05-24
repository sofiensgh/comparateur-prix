'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiMenuAlt2 } from "react-icons/hi";
import { usePathname } from 'next/navigation';
import SearchInput from './SearchInput';
import Sliderbar from './Sliderbar';

const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sliderbarOpen, setSliderbarOpen] = useState(false);

  const navBarList = [
    { title: "Home", link: "/" },
    { title: "Categorie", link: "/categories" },
    { title: "About", link: "/about" },
  ];

  const pathname = usePathname();

  const toggleCategoryWindow = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };

  const handleSearchChange = (ee: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(ee.target.value);
  };

  const handleSearchSubmit = (ee: React.FormEvent<HTMLFormElement>) => {
    ee.preventDefault();
    console.log("Search Query:", searchQuery);
  };

  const toggleSliderbar = () => {
    setSliderbarOpen(!sliderbarOpen);
  };

  return (
    <header className="w-full sticky top-0 bg-white shadow-lg z-10">
      <nav className="flex justify-between items-center py-2 px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/">
            <Image 
              src="/assets/icons/logo.svg"
              width={27}
              height={27}
              alt="logo"
            />
          </Link>
          <p className="text-base sm:text-xl font-bold">
            Flash<span className='text-primary'>Prix</span> 
          </p>
        </div>
        <div> 
          <SearchInput 
            searchQuery={searchQuery} 
            onSearchChange={handleSearchChange} 
            onSearchSubmit={handleSearchSubmit}
          />
        </div>
        <div className="hidden md:flex items-center gap-4">
          {navBarList.map((item) => (
            <Link href={item.link} key={item.link}>
              <span className={`navbar__link ${pathname === item.link ? 'text-red-600' : 'text-gray-700'} hover:text-red-500 transition duration-300`}>
                {item.title}
              </span>
            </Link>
          ))}
        </div>
        <HiMenuAlt2 className="md:hidden cursor-pointer w-8 h-6" onClick={toggleSliderbar} />
        {/* <Sliderbar isOpen={sliderbarOpen} toggleSliderbar={toggleSliderbar} /> */}
      </nav>
    </header>
  );
};

export default Navbar;
