import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Star, Package } from 'lucide-react';

function SweetCard({ sweet, user, onEdit, onDelete, viewMode = 'grid', theme }) {
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

  const cardGradient = theme?.cardGradient || 'from-purple-100 via-pink-50 to-purple-100';
  const accent = theme?.accent || 'bg-gradient-to-r from-purple-500 to-pink-500';
  const pill = theme?.pill || 'bg-purple-100 text-purple-600';

  // List view
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-4 border border-gray-100"
      >
        {/* Emoji Icon */}
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cardGradient} flex items-center justify-center flex-shrink-0`}>
          <span className="text-2xl">{getEmojiByCategory(sweet.category)}</span>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-800 truncate">{sweet.name}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${pill}`}>
              {sweet.category}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-semibold text-gray-800">₹{sweet.price}</span>
            <span className={isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-green-500'}>
              {sweet.quantity} in stock
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(sweet)}
            className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit2 size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(sweet.id)}
            className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Grid view (similar to ProductCard)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <div className={`rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${cardGradient}`}>
        {/* Card Header */}
        <div className="relative h-36 flex items-center justify-center p-4">
          {/* Stock Badge */}
          {isOutOfStock && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-md">
              Out of Stock
            </span>
          )}
          {isLowStock && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-md">
              Only {sweet.quantity} left!
            </span>
          )}
          
          {/* Sweet Icon/Emoji */}
          <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <motion.span 
              className="text-4xl filter drop-shadow-md"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {getEmojiByCategory(sweet.category)}
            </motion.span>
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-white p-4">
          {/* Category Tag */}
          <span className={`inline-block px-2.5 py-1 ${pill} text-xs font-semibold rounded-full mb-2`}>
            {sweet.category || 'Sweet'}
          </span>
          
          {/* Name */}
          <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-1">{sweet.name}</h3>
          
          {/* Rating (dummy) */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">(4.0)</span>
          </div>

          {/* Stock Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1">
                <Package size={12} />
                Stock
              </span>
              <span className={isOutOfStock ? 'text-red-500 font-medium' : isLowStock ? 'text-orange-500 font-medium' : 'text-green-500 font-medium'}>
                {sweet.quantity} units
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((sweet.quantity / 100) * 100, 100)}%` }}
                className={`h-full rounded-full ${isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-orange-400' : 'bg-green-400'}`}
              />
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1 mb-3 pb-3 border-b border-gray-100">
            <span className="text-2xl font-bold text-gray-800">₹{sweet.price}</span>
            <span className="text-xs text-gray-400">/each</span>
          </div>

          {/* Admin Actions */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onEdit(sweet)}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all"
            >
              <Edit2 size={14} />
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDelete(sweet.id)}
              className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all"
            >
              <Trash2 size={14} />
              Delete
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SweetCard;
