import React, { useState } from 'react';

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

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Search & Filter</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Search
        </button>
        <button
          onClick={handleClear}
          className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
