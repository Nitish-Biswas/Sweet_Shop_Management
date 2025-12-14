import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'Syrup', 'Dry', 'Ghee', 'Fried'];

function SearchFilter({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  priceRange, 
  setPriceRange,
  theme 
}) {
  return (
    <motion.div 
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-lg mb-6 md:mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-shrink-0 md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for rasgulla, ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700 text-sm transition-all bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          {CATEGORIES.map(category => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                selectedCategory === category
                  ? `${theme.pillActive} border-transparent`
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Price Range Slider */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200 min-w-[200px]">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">PRICE</span>
          <div className="flex-1 flex flex-col gap-1">
            <div className="relative h-2">
              <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
              <div 
                className={`absolute h-full ${theme.pillActive.replace('text-white', '')} rounded-full`}
                style={{
                  left: `${(priceRange[0] / 1000) * 100}%`,
                  right: `${100 - (priceRange[1] / 1000) * 100}%`
                }}
              ></div>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[0]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value <= priceRange[1]) {
                    setPriceRange([value, priceRange[1]]);
                  }
                }}
                className="absolute w-full h-full opacity-0 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= priceRange[0]) {
                    setPriceRange([priceRange[0], value]);
                  }
                }}
                className="absolute w-full h-full opacity-0 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export { CATEGORIES };
export default SearchFilter;
