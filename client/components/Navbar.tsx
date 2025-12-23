"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiMenuAlt2 } from "react-icons/hi";
import { usePathname } from 'next/navigation';
import SearchInput from './SearchInput';
import Sliderbar from './Sliderbar';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';
import { FaUserCircle, FaCaretDown, FaShoppingCart } from "react-icons/fa";
import { FiLogOut, FiUser, FiSettings } from "react-icons/fi";

const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sliderbarOpen, setSliderbarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const pathname = usePathname();
  const { user, logout, isAuthenticated, loading, checkAuth } = useAuth();
  const { cart } = useCart();

  const navBarList = [
    { title: "Home", link: "/" },
    { title: "Categorie", link: "/categories" },
    { title: "About", link: "/about" },
    { title: "Contact", link: "/contact" },
  ];

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

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  const getUserInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  // Calculate cart item count
  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const cartItemCount = getCartItemCount();

  // Check auth on pathname change
  useEffect(() => {
    if (!loading) {
      checkAuth();
    }
  }, [pathname, loading]);

  // Show loading state
  if (loading) {
    return (
      <header className="w-full sticky top-0 bg-white shadow-lg z-10">
        <nav className="flex justify-between items-center py-2 px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex-1 max-w-xl mx-4">
            <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-8 h-6 bg-gray-200 rounded animate-pulse md:hidden"></div>
        </nav>
      </header>
    );
  }

  return (
    <header className="w-full sticky top-0 bg-white shadow-lg z-50">
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
            BEST<span className='text-primary'> BUY</span> 
          </p>
        </div>
        
        <div className="flex-1 max-w-xl mx-4"> 
          <SearchInput 
            searchQuery={searchQuery} 
            onSearchChange={handleSearchChange}
          />
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {/* Cart Icon - Standalone */}
          <Link href="/cart" className="relative group mr-2">
            <div className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center">
              <FaShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-red-600 transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
              <span className="ml-2 text-sm font-medium hidden lg:inline text-gray-700">
                Cart
              </span>
            </div>
          </Link>
          
          {navBarList.map((item) => (
            <Link href={item.link} key={item.link}>
              <span
                className={`navbar__link ${pathname === item.link ? 'text-red-600' : 'text-gray-700'} hover:text-red-500 transition duration-300 px-3 py-2 rounded-md text-sm font-medium`}
                onClick={handleNavbarItemClick}
              >
                {item.title}
              </span>
            </Link>
          ))}
          
          {/* User Authentication Section */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition duration-300 group"
              >
                {/* Avatar with user initials */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {getUserInitials(user.username)}
                  </span>
                </div>
                
                <span className="text-sm font-medium hidden lg:inline">
                  {user.username}
                </span>
                
                <FaCaretDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>
              
              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Role: <span className="font-medium">{user.role}</span>
                    </p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <Link href="/profile">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <FiUser className="w-4 h-4 mr-3 text-gray-400" />
                        My Profile
                      </div>
                    </Link>
                    
                    {/* Cart Link in dropdown */}
                    <Link href="/cart">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <FaShoppingCart className="w-4 h-4 mr-3 text-gray-400" />
                        My Cart
                        {cartItemCount > 0 && (
                          <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                            {cartItemCount}
                          </span>
                        )}
                      </div>
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link href="/admin">
                        <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                          <FiSettings className="w-4 h-4 mr-3 text-gray-400" />
                          Admin Dashboard
                        </div>
                      </Link>
                    )}
                    
                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <FiLogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 text-sm font-medium">
                  Login
                </button>
              </Link>
              
              <Link href="/register">
                <button className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition duration-300 text-sm font-medium">
                  Register
                </button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile menu button and mobile cart icon */}
        <div className="flex items-center gap-4 md:hidden">
          {/* Mobile Cart Icon */}
          <Link href="/cart" className="relative">
            <FaShoppingCart className="w-6 h-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </Link>
          
          <HiMenuAlt2 
            className="cursor-pointer w-8 h-6 text-gray-700" 
            onClick={toggleSliderbar} 
          />
        </div>
        
        {sliderbarOpen && (
          <Sliderbar 
            isOpen={sliderbarOpen} 
            toggleSliderbar={toggleSliderbar}
            user={user}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            cartItemCount={cartItemCount}
          />
        )}
      </nav>
    </header>
  );
};

export default Navbar;