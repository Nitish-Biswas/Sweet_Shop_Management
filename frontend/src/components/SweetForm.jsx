import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Package } from 'lucide-react';

const CATEGORIES = ['Syrup', 'Dry', 'Ghee', 'Fried'];

function SweetForm({ initialData, onSubmit, isLoading = false, mode = 'create', theme }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Only reset form when initialData changes (mode switch or different item)
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        price: initialData.price?.toString() || '',
        quantity: initialData.quantity?.toString() || '',
        description: initialData.description || '',
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData?.id, mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Sweet name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Valid quantity is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
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

  const getInputClass = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    return `w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none transition ${
      hasError
        ? 'border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
    }`;
  };

  const renderError = (fieldName) => {
    if (errors[fieldName] && touched[fieldName]) {
      return (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          <AlertCircle size={12} />
          {errors[fieldName]}
        </p>
      );
    }
    return null;
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <Package className="text-purple-500" size={22} />
        {mode === 'edit' ? 'Edit Sweet Details' : 'Add New Sweet'}
      </h3>

      <div className="space-y-4">
        {/* Sweet Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Sweet Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Gulab Jamun"
            className={getInputClass('name')}
          />
          {renderError('name')}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getInputClass('category')} appearance-none cursor-pointer`}
            >
              <option value="">Select category...</option>
              {CATEGORIES.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {renderError('category')}
        </div>

        {/* Price and Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="450.00"
              step="0.01"
              className={getInputClass('price')}
            />
            {renderError('price')}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="100"
              className={getInputClass('quantity')}
            />
            {renderError('quantity')}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Soft, deep-fried dough balls soaked in aromatic rose-cardamom syrup."
            rows={3}
            className={`${getInputClass('description')} resize-none`}
          />
          {renderError('description')}
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 mt-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <CheckCircle size={18} />
        {isLoading ? 'Processing...' : mode === 'edit' ? 'Update Sweet' : 'Create Sweet'}
      </motion.button>
    </motion.form>
  );
}

export default SweetForm;
