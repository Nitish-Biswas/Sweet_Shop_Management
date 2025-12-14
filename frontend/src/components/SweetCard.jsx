import React, { useState } from 'react';

function SweetCard({ sweet, user, onPurchase, onEdit, onDelete }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (quantity > 0 && quantity <= sweet.quantity) {
      setLoading(true);
      await onPurchase(sweet.id, quantity);
      setQuantity(1);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition p-6">
      {/* Sweet Info */}
      <h3 className="text-lg font-bold text-gray-800 mb-2">{sweet.name}</h3>
      <span className="inline-block text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full mb-3">
        {sweet.category}
      </span>

      {sweet.description && (
        <p className="text-sm text-gray-600 mb-3">{sweet.description}</p>
      )}

      {/* Price & Stock */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <div>
          <p className="text-3xl font-bold text-purple-600">₹{sweet.price}</p>
          <p className="text-sm text-gray-600">
            Stock: 
            <span className={`font-bold ml-1 ${sweet.quantity === 0 ? 'text-red-600' : 'text-green-600'}`}>
              {sweet.quantity}
            </span>
          </p>
        </div>
      </div>

      {/* Actions */}
      {!user?.is_admin ? (
        sweet.quantity > 0 ? (
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max={sweet.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, sweet.quantity))}
              className="w-20 px-2 py-2 border border-gray-300 rounded text-center text-sm"
            />
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        ) : (
          <button disabled className="w-full py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed font-semibold">
            Out of Stock
          </button>
        )
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(sweet)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(sweet.id)}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default SweetCard;
