import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API
import { sweetsAPI } from '../services/api';

// Components
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilter from '../components/SearchFilter';
import ProductCard from '../components/ProductCard';
import CartSummary from '../components/CartSummary';
import Footer from '../components/Footer';

// Config
import { THEMES } from '../config/themes';

function Dashboard({ user, currentTheme = 'default', cart = {}, setCart }) {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState(new Set());
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const theme = THEMES[currentTheme];

  // Load sweets on mount
  useEffect(() => {
    loadSweets();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const loadSweets = async () => {
    setLoading(true);
    try {
      const response = await sweetsAPI.getAll();
      setSweets(response.data.sweets || []);
    } catch (err) {
      toast.error('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (searchTerm) filters.name = searchTerm;
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      
      const response = Object.keys(filters).length > 0
        ? await sweetsAPI.search(filters)
        : await sweetsAPI.getAll();
      setSweets(response.data.sweets || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Cart handlers
  const addToCart = (sweet) => {
    if (sweet.stock <= (cart[sweet.id] || 0)) {
      toast.warning('Maximum stock reached!');
      return;
    }
    setCart(prev => ({
      ...prev,
      [sweet.id]: (prev[sweet.id] || 0) + 1
    }));
    toast.success(`Added ${sweet.name} to cart!`);
  };

  const removeFromCart = (sweetId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[sweetId] > 1) {
        newCart[sweetId]--;
      } else {
        delete newCart[sweetId];
      }
      return newCart;
    });
  };

  // Favorite handler
  const toggleFavorite = (sweetId) => {
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(sweetId)) {
        newFavs.delete(sweetId);
        toast.info('Removed from favorites');
      } else {
        newFavs.add(sweetId);
        toast.success('Added to favorites!');
      }
      return newFavs;
    });
  };

  // Purchase handler
  const handlePurchase = async (sweetId, quantity) => {
    try {
      await sweetsAPI.purchase(sweetId, quantity);
      toast.success(`🎉 Purchased ${quantity} item(s) successfully!`);
      setCart(prev => {
        const newCart = { ...prev };
        delete newCart[sweetId];
        return newCart;
      });
      loadSweets();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Purchase failed');
    }
  };

  // Cart calculations
  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const sweet = sweets.find(s => s.id === parseInt(id));
    return total + (sweet?.price || 0) * qty;
  }, 0);

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  // Filter sweets
  const filteredSweets = sweets.filter(sweet => {
    const matchesSearch = sweet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      sweet.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`w-full min-h-screen bg-gradient-to-br ${theme.gradient} transition-all duration-500 overflow-x-hidden`}>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Hero Section */}
        <motion.div 
          className="mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Discover Our <span className={theme.text}>Sweets</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl">
            Browse our hand-picked collection of authentic traditional sweets made with love and premium ingredients.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          theme={theme}
        />

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner message="Loading delicious sweets..." />
        ) : filteredSweets.length === 0 ? (
          <motion.div
            className="text-center py-12 md:py-16 bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Grid3x3 className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 text-xl md:text-2xl font-semibold">No sweets found</p>
            <p className="text-gray-400 mt-2 text-sm md:text-base">Try adjusting your search or category</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredSweets.map((sweet, index) => (
              <ProductCard
                key={sweet.id}
                sweet={sweet}
                theme={theme}
                cart={cart}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onPurchase={handlePurchase}
                user={user}
                index={index}
              />
            ))}
          </motion.div>
        )}

        {/* Cart Summary */}
        <CartSummary 
          cartItemCount={cartItemCount} 
          cartTotal={cartTotal} 
          theme={theme} 
        />
      </main>

      {/* Footer */}
      <Footer theme={theme} />
    </div>
  );
}

export default Dashboard;
