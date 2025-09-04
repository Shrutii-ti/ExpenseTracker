import React from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const Header = ({ onOpenForm, onOpenScanner }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.362a9 9 0 010 12.724 9 9 0 01-12.724 0 9 9 0 010-12.724 9 9 0 0112.724 0z" />
            </svg>
            <h1 className="ml-2 text-xl font-bold text-gray-800">Expense Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onOpenForm()}
              className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
            >
              + Add Expense
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-500 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;