"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/resultat?title=${searchQuery}`);
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="relative block w-full sm:max-w-md"
    >
      <div className="flex items-center rounded-full bg-gray-200 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition duration-300">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search..."
          className="bg-transparent text-gray-900 flex-1 outline-none text-xs sm:text-sm"
        />
        <button
          type="submit"
          className="bg-primary text-white rounded-full px-3 py-1.5 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-300 text-xs sm:text-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchInput;
