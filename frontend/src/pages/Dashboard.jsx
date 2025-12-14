import React, { useState, useEffect } from 'react';
import { sweetsAPI } from '../services/api';
import SweetCard from '../components/SweetCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard({ user }) {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSweets();
  }, []);

  const loadSweets = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = Object.keys(filters).length > 0
        ? await sweetsAPI.search(filters)
        : await sweetsAPI.getAll();
      setSweets(response.data.sweets || []);
    } catch (err) {
      setError('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (sweetId, quantity) => {
    try {
      await sweetsAPI.purchase(sweetId, quantity);
      setMessage(`✓ Purchased ${quantity} sweet(s)!`);
      setTimeout(() => setMessage(''), 3000);
      loadSweets();
    } catch (err) {
      setError(err.response?.data?.detail || 'Purchase failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🍬 Sweet Shop</h1>
        <p className="text-gray-600 mb-6">Browse and purchase our delicious sweets</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        
        {message && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <p className="text-green-700 font-medium">{message}</p>
          </div>
        )}

        <SearchBar onSearch={loadSweets} />

        {loading ? (
          <LoadingSpinner message="Loading sweets..." />
        ) : sweets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No sweets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sweets.map((sweet) => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                user={user}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;