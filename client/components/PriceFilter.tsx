"use client";
import { useState } from "react";

interface PriceFilterProps {
  onFilterChange: (minPrice: number, maxPrice: number) => void;
}

export default function PriceFilter({ onFilterChange }: PriceFilterProps) {
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const handleApplyFilter = () => {
    onFilterChange(Number(minPrice), Number(maxPrice));
  };

  return (
    <div className="price-filter">
      <h3 className="text-lg font-semibold mb-2">Filtrage par prix</h3>
      <div className="mb-2">
        <label className="block mb-1">Minimum prix:</label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) =>
            setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Maximum prix:</label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button
        onClick={handleApplyFilter}
        className="px-4 py-2 bg-red-500 text-white rounded-md w-full hover:bg-red-600 focus:outline-none transition duration-300 ease-in-out"
      >
        Filter par prix
      </button>
    </div>
  );
}
