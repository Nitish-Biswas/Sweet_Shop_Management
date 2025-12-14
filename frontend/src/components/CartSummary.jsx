import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

function CartSummary({ cartItemCount, cartTotal, theme }) {
  if (cartItemCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-2xl px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-6 border border-gray-100 z-50 max-w-[calc(100%-2rem)]"
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div className={`w-10 h-10 md:w-12 md:h-12 ${theme.accent} rounded-lg md:rounded-xl flex items-center justify-center`}>
          <ShoppingCart className="text-white" size={20} />
        </div>
        <div>
          <p className="text-xs md:text-sm text-gray-500">{cartItemCount} items</p>
          <p className="text-lg md:text-xl font-bold text-gray-800">${cartTotal.toFixed(2)}</p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 md:px-8 py-2.5 md:py-3 ${theme.accent} text-white text-sm md:text-base font-bold rounded-lg md:rounded-xl ${theme.accentHover} transition-colors shadow-lg whitespace-nowrap`}
      >
        View Cart
      </motion.button>
    </motion.div>
  );
}

export default CartSummary;
