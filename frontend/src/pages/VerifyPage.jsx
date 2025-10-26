import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verification } from '../services/api';

function VerifyPage() {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyProduct();
  }, [qrToken]);

  const verifyProduct = async () => {
    try {
      const response = await verification.verifyProduct(qrToken);
      setVerificationResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify product');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateReturn = () => {
    navigate(`/return/${qrToken}`);
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Verifying product...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Product Verification</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {verificationResult && (
        <div>
          <div className={`p-4 rounded-lg mb-6 ${
            verificationResult.isAuthentic
              ? 'bg-green-100 border-green-400'
              : 'bg-red-100 border-red-400'
          }`}>
            <h3 className="font-bold text-lg mb-2">
              {verificationResult.isAuthentic ? 'Authentic Product' : 'Warning: Potential Counterfeit'}
            </h3>
            <p className="text-sm">
              Serial Number: {verificationResult.serialNumber}
            </p>
            <p className="text-sm">
              Status: {verificationResult.status}
            </p>
            {verificationResult.activatedAt && (
              <p className="text-sm">
                Activated: {new Date(verificationResult.activatedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {verificationResult.labelMatch && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Label Verification</h3>
              <div className="bg-gray-100 p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span>Match Score:</span>
                  <span className={`font-bold ${
                    verificationResult.labelMatch.score > 0.7 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.round(verificationResult.labelMatch.score * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {verificationResult.status === 'activated' && (
            <button
              onClick={handleInitiateReturn}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Request Return
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyPage;