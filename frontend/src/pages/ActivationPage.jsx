import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { activation } from '../services/api';

function ActivationPage() {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    checkProduct();
  }, [qrToken]);

  const checkProduct = async () => {
    try {
      const response = await activation.getStatus(qrToken);
      setProduct(response.data.product);
      
      // If already activated, redirect to verify
      if (response.data.product.status === 'activated') {
        navigate(`/verify/${qrToken}`);
      }
    } catch (err) {
      setError('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    setError('');

    try {
      await activation.activate(qrToken);
      navigate(`/verify/${qrToken}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to activate product');
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Activate Product</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {product && (
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Product Details</h3>
            <p className="text-gray-600">Serial Number: {product.serialNumber}</p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700">
              <strong>Important:</strong> Activating this product will link it to your account.
              This action cannot be undone.
            </p>
          </div>

          <button
            onClick={handleActivate}
            disabled={activating}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {activating ? 'Activating...' : 'Activate Product'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivationPage;