import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

function SearchBar({ onSearch }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = () => {
    onSearch({
      name: name || undefined,
      category: category || undefined,
      min_price: minPrice ? parseFloat(minPrice) : undefined,
      max_price: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const handleClear = () => {
    setName('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onSearch({});
  };

  const hasFilters = name || category || minPrice || maxPrice;

  return (
    <motion.div 
      className="card bg-base-100 shadow-lg p-6 mb-8 border border-gray-100"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="text-purple-600" size={24} />
          <h3 className="font-bold text-lg text-gray-800">Search & Filter</h3>
        </div>
        {hasFilters && (
          <motion.button
            onClick={handleClear}
            className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear All
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <motion.input
          type="text"
          placeholder="Search by name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input input-bordered w-full"
          whileFocus={{ scale: 1.02 }}
        />
        <motion.input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input input-bordered w-full"
          whileFocus={{ scale: 1.02 }}
        />
        <motion.input
          type="number"
          placeholder="Min Price (₹)"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="input input-bordered w-full"
          whileFocus={{ scale: 1.02 }}
        />
        <motion.input
          type="number"
          placeholder="Max Price (₹)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="input input-bordered w-full"
          whileFocus={{ scale: 1.02 }}
        />
      </div>

      <div className="flex gap-3">
        <motion.button
          onClick={handleSearch}
          className="btn btn-primary flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Search size={20} />
          Search
        </motion.button>
        {hasFilters && (
          <motion.button
            onClick={handleClear}
            className="btn btn-ghost"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X size={20} />
            Clear
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default SearchBar;
