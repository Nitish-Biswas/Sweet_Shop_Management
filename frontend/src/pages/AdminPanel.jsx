import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sweetsAPI } from '../services/api';
import SweetCard from '../components/SweetCard';
import SweetForm from '../components/SweetForm';
import { Plus, Package, RefreshCw, AlertCircle, CheckCircle, Search, LayoutGrid, List } from 'lucide-react';
import { THEMES } from '../config/themes';

function AdminPanel({ user, currentTheme = 'default' }) {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [restockData, setRestockData] = useState({ sweetId: null, quantity: '' });
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  const theme = THEMES[currentTheme] || THEMES.default;

  useEffect(() => {
    loadSweets();
  }, []);

  const loadSweets = async () => {
    setLoading(true);
    try {
      const response = await sweetsAPI.getAll(0, 1000);
      setSweets(response.data.sweets || []);
    } catch {
      setError('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingSweet) {
        await sweetsAPI.update(editingSweet.id, data);
        setMessage('✓ Sweet updated successfully!');
        setEditingSweet(null);
      } else {
        await sweetsAPI.create(data);
        setMessage('✓ Sweet created successfully!');
      }
      
      setShowForm(false);
      setTimeout(() => setMessage(''), 4000);
      loadSweets();
    } catch (err) {
      setError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (sweet) => {
    setEditingSweet(sweet);
    setShowForm(true);
  };

  // Memoize filtered sweets to prevent unnecessary recalculations
  const filteredSweets = useMemo(() => {
    return sweets.filter(sweet => 
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sweets, searchTerm]);

  const handleDelete = async (sweetId) => {
    if (window.confirm('Are you sure you want to delete this sweet? This action cannot be undone.')) {
      try {
        await sweetsAPI.delete(sweetId);
        setMessage('✓ Sweet deleted successfully!');
        setTimeout(() => setMessage(''), 4000);
        loadSweets();
      } catch {
        setError('Delete failed');
      }
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    try {
      await sweetsAPI.restock(restockData.sweetId, parseInt(restockData.quantity));
      setMessage('✓ Restocked successfully!');
      setShowRestockForm(false);
      setRestockData({ sweetId: null, quantity: '' });
      setTimeout(() => setMessage(''), 4000);
      loadSweets();
    } catch {
      setError('Restock failed');
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${theme.gradient.replace('from-purple-50 via-pink-50 to-orange-50', 'from-purple-500 to-pink-500').replace('from-red-50 via-pink-50 to-rose-50', 'from-red-500 to-pink-500').replace('from-orange-50 via-amber-50 to-yellow-50', 'from-orange-500 to-amber-500').replace('from-amber-50 via-yellow-50 to-orange-50', 'from-amber-600 to-yellow-600').replace('from-emerald-50 via-green-50 to-teal-50', 'from-emerald-500 to-teal-500').replace('from-blue-50 via-indigo-50 to-purple-50', 'from-blue-500 to-indigo-500')} flex items-center justify-center shadow-lg`}>
              <Package className="text-white" size={20} />
            </div>
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>
                Admin Panel
              </h1>
              <p className="text-gray-500 text-sm">Manage your sweet inventory</p>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-red-700 font-medium text-sm">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
            </motion.div>
          )}

          {message && (
            <motion.div
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
              <p className="text-green-700 font-medium text-sm">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={() => { setShowForm(!showForm); setEditingSweet(null); }}
              className={`flex-1 px-5 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                showForm && !editingSweet 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={18} />
              {showForm && !editingSweet ? 'Cancel' : 'Add New Sweet'}
            </motion.button>

            <motion.button
              onClick={() => setShowRestockForm(!showRestockForm)}
              className={`flex-1 px-5 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                showRestockForm 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Package size={18} />
              {showRestockForm ? 'Cancel' : 'Restock Item'}
            </motion.button>

            <motion.button
              onClick={loadSweets}
              disabled={loading}
              className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Sweet Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SweetForm
                key={editingSweet?.id || 'new'}
                initialData={editingSweet}
                onSubmit={handleSubmit}
                mode={editingSweet ? 'edit' : 'create'}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Restock Form */}
        <AnimatePresence>
          {showRestockForm && (
            <motion.div
              className="mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-gray-100"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="text-emerald-500" size={22} />
                Restock Sweet
              </h2>
              <form onSubmit={handleRestock} className="flex gap-3 flex-col sm:flex-row">
                <select
                  value={restockData.sweetId || ''}
                  onChange={(e) => setRestockData({...restockData, sweetId: parseInt(e.target.value)})}
                  required
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 font-medium text-gray-700"
                >
                  <option value="">Select sweet...</option>
                  {sweets.map(s => <option key={s.id} value={s.id}>{s.name} (Stock: {s.quantity})</option>)}
                </select>
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={restockData.quantity}
                  onChange={(e) => setRestockData({...restockData, quantity: e.target.value})}
                  required
                  className="w-full sm:w-28 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 font-medium"
                />
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Restock
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sweets List */}
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* List Header with Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <h2 className={`text-xl font-bold ${theme.text}`}>
                Inventory
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${theme.pillActive}`}>
                {filteredSweets.length} items
              </span>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search sweets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-56 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 text-sm"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={`w-12 h-12 border-4 border-gray-200 rounded-full`}
                style={{ borderTopColor: theme.text.includes('purple') ? '#9333ea' : theme.text.includes('red') ? '#ef4444' : theme.text.includes('orange') ? '#f97316' : theme.text.includes('amber') ? '#d97706' : theme.text.includes('emerald') ? '#10b981' : '#3b82f6' }}
              />
              <p className="mt-4 text-gray-500 font-medium">Loading inventory...</p>
            </div>
          ) : filteredSweets.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${theme.cardGradient} flex items-center justify-center`}>
                <Package className="text-gray-400" size={36} />
              </div>
              <p className="text-gray-600 text-lg font-semibold mb-1">
                {searchTerm ? 'No matching sweets' : 'No sweets yet'}
              </p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'Try a different search term' : 'Click "Add New Sweet" to get started'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredSweets.map((sweet, index) => (
                <motion.div
                  key={sweet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <SweetCard
                    sweet={sweet}
                    user={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    viewMode={viewMode}
                    theme={theme}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default AdminPanel;
