import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import moment from 'moment';

const ReceiptScanner = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setOcrResult(null);
  };

  const handleScan = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await axiosInstance.post('/expenses/ocr-scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setOcrResult(res.data.ocrResult);
    } catch (err) {
      setError('Failed to scan receipt. Please try again.');
      console.error('OCR scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!ocrResult) {
      setError('No scan result to save.');
      return;
    }

    try {
      const expenseData = {
        title: ocrResult.merchant || 'Receipt Scan',
        amount: ocrResult.amount || 0,
        category: ocrResult.category || 'Other',
        description: `Expense from scanned receipt: ${file.name}`,
        date: ocrResult.date ? moment(ocrResult.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      };
      
      await axiosInstance.post('/expenses', expenseData);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to save expense. Please try again.');
      console.error('Save expense error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative p-8 bg-white rounded-xl shadow-lg w-full max-w-lg">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Scan Receipt</h3>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
        />
        <div className="mt-4 flex justify-between space-x-4">
          <button
            onClick={handleScan}
            disabled={loading || !file}
            className={`flex-1 px-4 py-2 font-medium rounded-lg transition ${
              loading ? 'bg-gray-300 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {loading ? 'Scanning...' : 'Scan'}
          </button>
        </div>
        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
        {ocrResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800">Scan Result:</h4>
            <p>Amount: {ocrResult.amount}</p>
            <p>Date: {ocrResult.date}</p>
            <p>Category: {ocrResult.category}</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => { setOcrResult(null); setFile(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition"
              >
                Save as Expense
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;
