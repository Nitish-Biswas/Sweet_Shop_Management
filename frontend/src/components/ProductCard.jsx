import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Plus, Minus, Package } from 'lucide-react';

function ProductCard({ 
  sweet, 
  theme, 
  cart, 
  favorites, 
  onToggleFavorite, 
  onAddToCart, 
  onRemoveFromCart, 
  onPurchase,
  user,
  index = 0 
}) {
  const cartQuantity = cart[sweet.id] || 0;
  const isFavorite = favorites.has(sweet.id);

  // Stock logic
  const isOutOfStock = sweet.quantity === 0;
  const isLowStock = sweet.quantity > 0 && sweet.quantity <= 10;

  const getEmojiByCategory = (category) => {
    switch (category) {
      case 'Syrup': return '🍬';
      case 'Dry': return '🥜';
      case 'Ghee': return '🧈';
      case 'Fried': return '🍩';
      default: return '🍬';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className={`rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${theme.cardGradient}`}>
        {/* Card Header with Gradient */}
        <div className="relative h-48 sm:h-52 md:h-56 flex items-center justify-center p-6">
          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite(sweet.id)}
            className="absolute top-4 right-4 p-2.5 bg-white/30 backdrop-blur-sm rounded-full shadow-md hover:bg-white/50 transition-colors z-10"
          >
            <Heart 
              size={20} 
              className={isFavorite ? 'fill-pink-500 text-pink-500' : 'text-white'}
            />
          </button>
          
          {/* Sweet Icon/Emoji in Circle */}
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <motion.span 
              className="text-5xl md:text-6xl filter drop-shadow-md"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {getEmojiByCategory(sweet.category)}
            </motion.span>
          </div>
          
          {/* Stock Badge (Header) */}
          {isLowStock && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-md">
              Only {sweet.quantity} left!
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-md">
              Out of Stock
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="bg-white p-5">
          {/* Category Tag */}
          <span className={`inline-block px-3 py-1 ${theme.pill} text-xs font-semibold rounded-full mb-2`}>
            {sweet.category || 'Sweet'}
          </span>
          
          {/* Name */}
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 line-clamp-1">{sweet.name}</h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">(4.0)</span>
          </div>

          {/* Stock Bar (Updated to match SweetCard style) */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1">
                <Package size={12} />
                Stock
              </span>
              <span className={isOutOfStock ? 'text-red-500 font-medium' : isLowStock ? 'text-orange-500 font-medium' : 'text-green-500 font-medium'}>
                {sweet.quantity} units
              </span>
            </div>
            <div className="h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((sweet.quantity / 100) * 100, 100)}%` }}
                className={`h-full rounded-full ${isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-orange-400' : 'bg-green-400'}`}
              />
            </div>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl md:text-2xl font-bold text-gray-800">${sweet.price?.toFixed(2)}</span>
              <span className="text-xs md:text-sm text-gray-400 ml-1">/each</span>
            </div>
            
            {cartQuantity > 0 ? (
              <div className="flex items-center gap-1.5 md:gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemoveFromCart(sweet.id)}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Minus size={16} />
                </motion.button>
                <span className="font-bold text-base md:text-lg w-5 md:w-6 text-center">{cartQuantity}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onAddToCart(sweet)}
                  disabled={sweet.quantity <= cartQuantity}
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${theme.accent} text-white flex items-center justify-center ${theme.accentHover} transition-colors disabled:opacity-50`}
                >
                  <Plus size={16} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddToCart(sweet)}
                disabled={isOutOfStock}
                className={`p-2.5 md:p-3 ${theme.accent} text-white rounded-full shadow-lg ${theme.accentHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Plus size={20} />
              </motion.button>
            )}
          </div>

          {/* Buy Now Button */}
          {cartQuantity > 0 && user && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPurchase(sweet.id, cartQuantity)}
              className={`w-full mt-2 md:mt-3 py-2.5 md:py-3 ${theme.accent} text-white text-sm md:text-base font-semibold rounded-lg md:rounded-xl ${theme.accentHover} transition-colors shadow-lg`}
            >
              Buy {cartQuantity} for ${(sweet.price * cartQuantity).toFixed(2)}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;