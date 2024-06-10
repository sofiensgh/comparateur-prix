"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Changed from 'next/navigation'

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const router = useRouter();
  const [searchType, setSearchType] = useState("title");

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchType === "reference") {
      router.push(`/resultat?reference=${searchQuery}`);
    } else if (searchType === "title") {
      router.push(`/resultat1?title=${searchQuery}`);
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="flex items-center space-x-4">
      <div className="relative flex items-center bg-gray-100 rounded-md overflow-hidden">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-3 py-2 bg-gray-100 text-gray-900 outline-none text-sm rounded-md appearance-none" // Removed max-width class and added appearance-none
        >
          <option value="title">Titre</option>
          <option value="reference">Référence</option>
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Recherche..."
          className="px-3 py-2 bg-transparent text-gray-900 outline-none text-sm flex-1 focus:ring-2 focus:ring-primary transition duration-300" // Adjusted padding and added focus styles
        />
        <button
          type="submit"
          className="bg-transparent text-gray-900 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-300"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchInput;