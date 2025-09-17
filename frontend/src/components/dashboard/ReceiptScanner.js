import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import moment from 'moment';

const ReceiptScanner = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);

  // File select
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (
      !selectedFile.type.startsWith('image/') &&
      !selectedFile.type.includes('pdf')
    ) {
      setError('Only image or PDF files are allowed.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setOcrResult(null);
  };

  // Scan + Auto-save
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
      // OCR call
      const res = await axiosInstance.post('/expenses/ocr-scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = res.data.ocrResult;
      setOcrResult(result);

      


      // Auto-save expense
      const expenseData = {
        title: result.merchant || 'Receipt Scan',
        amount: result.amount || 0,
        category: result.category || 'Other',
        description: `Expense from scanned receipt: ${file?.name}`,
        date: result.date
          ? moment(result.date).format('YYYY-MM-DD')
          : moment().format('YYYY-MM-DD'),
      };

      // await axiosInstance.post('/expenses', expenseData);
      console.log("👉 Saving expense to DB:", expenseData);
      // await axiosInstance.post('/expenses', expenseData);
      onSuccess();  // refresh expenses
      onClose();    // close modal after save
    } catch (err) {
      console.error('OCR/Save error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to scan or save receipt. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative p-8 bg-white rounded-xl shadow-lg w-full max-w-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Title */}
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">
          Scan Receipt
        </h3>

        {/* File input */}
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
        />

        {/* Scan button */}
        <div className="mt-4">
          <button
            onClick={handleScan}
            disabled={loading || !file}
            className={`w-full px-4 py-2 font-medium rounded-lg transition ${
              loading
                ? 'bg-gray-300 text-gray-500'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {loading ? 'Scanning...' : 'Scan & Save'}
          </button>
        </div>

        {/* Error */}
        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

        {/* OCR Result Preview (just info, no Save button) */}
        {ocrResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800">Scan Result:</h4>
            <p>Merchant: {ocrResult.merchant || 'N/A'}</p>
            <p>Amount: {ocrResult.amount || 'N/A'}</p>
            <p>Date: {ocrResult.date || 'N/A'}</p>
            <p>Category: {ocrResult.category || 'Other'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;
