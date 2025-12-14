import React, { useState, useEffect } from 'react';

function SweetForm({ initialData, onSubmit, isLoading = false, mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData(initialData);
    }
  }, [initialData, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be > 0';
    if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Valid quantity required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Sweet Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Chocolate Truffles"
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            errors.name ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
          }`}
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Chocolate"
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            errors.category ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
          }`}
        />
        {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
              errors.price ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
            }`}
          />
          {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
              errors.quantity ? 'border-red-500' : 'border-gray-300 focus:border-purple-500'
            }`}
          />
          {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description..."
          rows="4"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition"
      >
        {isLoading ? 'Processing...' : mode === 'edit' ? 'Update Sweet' : 'Create Sweet'}
      </button>
    </form>
  );
}

export default SweetForm;
