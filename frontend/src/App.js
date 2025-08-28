import React from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="text-center p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-teal-600">Dashboard Page</h1>
      <p className="mt-4 text-gray-700">You are successfully logged in! All your features would be built here.</p>
    </div>
  ) : (
    <LoginPage />
  );
};

export default App;