import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingCart, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { THEMES } from '../config/themes';

function Navbar({ user, onLogout, currentTheme, setCurrentTheme, cartItemCount = 0 }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const theme = THEMES[currentTheme] || THEMES.default;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-lg shadow-md border-b border-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 ${theme.accent} rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-colors`}>
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className={`text-lg md:text-xl font-bold ${theme.text} transition-colors`}>Sweet Shop</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Premium Delicacies</p>
            </div>
          </Link>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border ${theme.border} hover:shadow-md transition-all`}
              >
                <Sparkles size={16} className={theme.text} />
                <span className="text-sm font-medium text-gray-700">Flavor</span>
                <div className={`w-3 h-3 rounded-full ${theme.accent}`}></div>
                <ChevronDown size={14} className="text-gray-500" />
              </button>
              
              <AnimatePresence>
                {showThemeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    {Object.entries(THEMES).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setCurrentTheme(key);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                          currentTheme === key ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${t.accent}`}></div>
                        <span className="text-sm font-medium text-gray-700">{t.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <ShoppingCart size={20} className="text-gray-700" />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.button>

            {/* Admin Link */}
            {user?.is_admin && (
              <Link
                to="/admin"
                className={`px-4 py-2 text-sm font-medium ${theme.text} hover:bg-gray-100 rounded-lg transition-colors`}
              >
                Admin
              </Link>
            )}

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className={`flex items-center gap-2 px-5 py-2.5 ${theme.accent} text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all`}
            >
              <span>Logout</span>
              <LogOut size={16} />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4 space-y-3"
            >
              {/* Theme Selector Mobile */}
              <div className="flex flex-wrap gap-2 pb-3 border-b border-gray-100">
                <span className="w-full text-xs text-gray-500 mb-1">Select Flavor:</span>
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentTheme(key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      currentTheme === key 
                        ? `${t.accent} text-white` 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${currentTheme === key ? 'bg-white' : t.accent}`}></div>
                    {t.name}
                  </button>
                ))}
              </div>

              {/* Cart */}
              <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg">
                <span className="flex items-center gap-2 text-gray-700">
                  <ShoppingCart size={18} />
                  Cart
                </span>
                {cartItemCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Admin Link */}
              {user?.is_admin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className={`block w-full px-3 py-2 ${theme.text} font-medium hover:bg-gray-50 rounded-lg`}
                >
                  Admin Panel
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 ${theme.accent} text-white font-semibold rounded-xl`}
              >
                <span>Logout</span>
                <LogOut size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default Navbar;
