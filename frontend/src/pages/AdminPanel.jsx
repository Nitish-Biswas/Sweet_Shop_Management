import React, { useState, useEffect } from 'react';
import { sweetsAPI } from '../services/api';
import SweetCard from '../components/SweetCard';

function AdminPanel({ user }) {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', category: '', price: '', quantity: '', description: ''
  });
  const [restockData, setRestockData] = useState({ sweetId: null, quantity: '' });
  const [showRestockForm, setShowRestockForm] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        description: formData.description || undefined,
      };

      if (editingId) {
        await sweetsAPI.update(editingId, data);
        setMessage('✓ Sweet updated!');
        setEditingId(null);
      } else {
        await sweetsAPI.create(data);
        setMessage('✓ Sweet created!');
      }
      
      setFormData({ name: '', category: '', price: '', quantity: '', description: '' });
      setShowForm(false);
      setTimeout(() => setMessage(''), 3000);
      loadSweets();
    } catch (err) {
      setError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (sweet) => {
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
      description: sweet.description || '',
    });
    setEditingId(sweet.id);
    setShowForm(true);
  };

  const handleDelete = async (sweetId) => {
    if (window.confirm('Are you sure you want to delete this sweet?')) {
      try {
        await sweetsAPI.delete(sweetId);
        setMessage('✓ Sweet deleted!');
        setTimeout(() => setMessage(''), 3000);
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
      setTimeout(() => setMessage(''), 3000);
      loadSweets();
    } catch {
      setError('Restock failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">📊 Admin Panel</h1>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {message && <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', category: '', price: '', quantity: '', description: '' }); }}
          className="px-6 py-3 bg-blue-500 text-white rounded font-bold hover:bg-blue-600"
        >
          {showForm && !editingId ? '✕ Cancel' : '+ New Sweet'}
        </button>

        <button
          onClick={() => setShowRestockForm(!showRestockForm)}
          className="px-6 py-3 bg-green-500 text-white rounded font-bold hover:bg-green-600"
        >
          {showRestockForm ? '✕ Cancel' : '📦 Restock'}
        </button>

        <button
          onClick={loadSweets}
          className="px-6 py-3 bg-gray-500 text-white rounded font-bold hover:bg-gray-600"
        >
          🔄 Refresh
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Sweet' : 'Create New Sweet'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="px-4 py-2 border rounded" />
            <input type="text" placeholder="Category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required className="px-4 py-2 border rounded" />
            <input type="number" placeholder="Price" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required className="px-4 py-2 border rounded" />
            <input type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required className="px-4 py-2 border rounded" />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="md:col-span-2 px-4 py-2 border rounded"></textarea>
            <button type="submit" className="md:col-span-2 py-3 bg-purple-600 text-white rounded font-bold hover:bg-purple-700">
              {editingId ? 'Update Sweet' : 'Create Sweet'}
            </button>
          </form>
        </div>
      )}

      {showRestockForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Restock Sweet</h2>
          <form onSubmit={handleRestock} className="flex gap-4">
            <select value={restockData.sweetId || ''} onChange={(e) => setRestockData({...restockData, sweetId: parseInt(e.target.value)})} required className="flex-1 px-4 py-2 border rounded">
              <option value="">Select sweet...</option>
              {sweets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="number" placeholder="Qty" min="1" value={restockData.quantity} onChange={(e) => setRestockData({...restockData, quantity: e.target.value})} required className="w-20 px-4 py-2 border rounded" />
            <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600">Restock</button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">All Sweets ({sweets.length})</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sweets.map(sweet => (
              <SweetCard key={sweet.id} sweet={sweet} user={user} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;