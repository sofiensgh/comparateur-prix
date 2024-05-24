"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface SliderbarProps {
  isOpen: boolean;
  toggleSliderbar: () => void;
}

const Sliderbar: React.FC<SliderbarProps> = ({ isOpen, toggleSliderbar }) => {
  const sliderbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sliderbarRef.current && !sliderbarRef.current.contains(event.target as Node)) {
        toggleSliderbar();
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toggleSliderbar();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen, toggleSliderbar]);

  useEffect(() => {
    // Reset the sidebar state when the component is unmounted
    return () => {
      toggleSliderbar();
    };
  }, [toggleSliderbar]);

  return (
    <div
      ref={sliderbarRef}
      role="dialog"
      aria-modal="true"
      className={`fixed top-0 right-0 w-full h-full bg-black bg-opacity-50 z-40 flex justify-end ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } transition-opacity duration-300 ease-out`}
    >
      <div
        className={`bg-white shadow-2xl w-full md:w-1/2 h-full flex flex-col justify-between transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-out`}
      >
        <div className="relative">
          <button
            onClick={toggleSliderbar}
            className="absolute top-5 left-5 text-gray-700 hover:text-red-500 transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <nav className="flex flex-col gap-4 p-6 mt-12">
            <Link href="/">
              <span className="text-xl font-medium hover:text-red-500 transition duration-300">Home</span>
            </Link>
            <Link href="/about">
              <span className="text-xl font-medium hover:text-red-500 transition duration-300">About</span>
            </Link>
            <Link href="/products">
              <span className="text-xl font-medium hover:text-red-500 transition duration-300">All products</span>
            </Link>
            <Link href="/categories">
              <span className="text-xl font-medium hover:text-red-500 transition duration-300">Categories</span>
            </Link>
            <Link href="/contact">
              <span className="text-xl font-medium hover:text-red-500 transition duration-300">Contact</span>
            </Link>
            {/* Add more links as needed */}
          </nav>
        </div>
        <div className="px-6 pb-6">
          <p className="text-gray-500 text-sm">© 2024 FlashPrix. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Sliderbar;