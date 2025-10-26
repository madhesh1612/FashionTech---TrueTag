import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { returns, verification } from '../services/api';

function ReturnPage() {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reason, setReason] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    checkProduct();
  }, [qrToken]);

  const checkProduct = async () => {
    try {
      const response = await verification.verifyProduct(qrToken);
      setProduct(response.data);
      if (response.data.status !== 'activated') {
        setError('This product cannot be returned');
      }
    } catch (err) {
      setError('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await returns.requestReturn(qrToken, reason, image);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
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
      <h2 className="text-2xl font-bold mb-6 text-center">Return Request</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {result ? (
        <div className="text-center">
          <div className={`p-4 rounded-lg mb-6 ${
            result.approved ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            <h3 className="font-bold text-lg mb-2">
              {result.approved ? 'Return Approved' : 'Return Under Review'}
            </h3>
            <p className="mb-2">Trust Score: {Math.round(result.trustScore * 100)}%</p>
            {!result.approved && (
              <p className="text-sm text-gray-600">
                Our team will review your return request and contact you soon.
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="reason">
              Return Reason
            </label>
            <textarea
              id="reason"
              className="w-full px-3 py-2 border rounded-lg"
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Product Label Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {image && (
              <img
                src={image}
                alt="Label preview"
                className="mt-2 max-h-40 mx-auto"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !reason}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ReturnPage;