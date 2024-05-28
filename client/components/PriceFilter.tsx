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
      <h3 className="text-lg font-semibold mb-2">Price Filter</h3>
      <div className="mb-2">
        <label className="block mb-1">Min Price:</label>
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
        <label className="block mb-1">Max Price:</label>
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
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Apply Filter
      </button>
    </div>
  );
}
