import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import { verification } from '../services/api';

function ScanPage() {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleScan = async (result) => {
    if (result) {
      setScanning(false);
      try {
        const qrToken = result.text;
        const response = await verification.verifyProduct(qrToken);
        
        // Decide where to navigate based on product status
        if (response.data.status === 'created') {
          navigate(`/activate/${qrToken}`);
        } else {
          navigate(`/verify/${qrToken}`);
        }
      } catch (err) {
        setError('Invalid QR code or product not found');
        setScanning(true);
      }
    }
  };

  const handleError = (err) => {
    setError('Error accessing camera: ' + err.message);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Scan Product QR Code</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="relative">
        {scanning && (
          <QrReader
            onResult={handleScan}
            onError={handleError}
            constraints={{ facingMode: 'environment' }}
            className="w-full"
          />
        )}
        
        <div className="mt-4 text-center text-gray-600">
          Position the QR code in the center of the camera
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => setScanning(!scanning)}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          {scanning ? 'Stop Scanning' : 'Start Scanning'}
        </button>
      </div>
    </div>
  );
}

export default ScanPage;