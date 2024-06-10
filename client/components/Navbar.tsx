"use client";
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
    { title: "Contact", link: "/contact" },
  ];

  const pathname = usePathname();

  const toggleCategoryWindow = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSliderbar = () => {
    setSliderbarOpen((prevOpen) => !prevOpen);
  };

  const handleNavbarItemClick = () => {
    setSliderbarOpen(false);
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
          <p className="text-base sm:text-xl font-bold ">
            Flash<span className='text-primary'>Prix</span> 
          </p>
        </div>
        <div> 
          <SearchInput 
            searchQuery={searchQuery} 
            onSearchChange={handleSearchChange}
          />
        </div>
        <div className="hidden md:flex items-center gap-4">
          {navBarList.map((item) => (
            <Link href={item.link} key={item.link}>
              <span
                className={`navbar__link ${pathname === item.link ? 'text-red-600' : 'text-gray-700'} hover:text-red-500 transition duration-300`}
                onClick={handleNavbarItemClick} // Added onClick event
              >
                {item.title}
              </span>
            </Link>
          ))}
          <Link href="/Login">
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300">
              Login
            </button>
          </Link> 
        </div>
        <HiMenuAlt2 className="md:hidden cursor-pointer w-8 h-6" onClick={toggleSliderbar} />
        {sliderbarOpen && <Sliderbar isOpen={sliderbarOpen} toggleSliderbar={toggleSliderbar} />} 
      </nav>
    </header>
  );
};

export default Navbar;
