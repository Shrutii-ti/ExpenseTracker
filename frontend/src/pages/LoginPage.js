import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId === '<your_google_client_id_here>') {
      setError('❌ Google Client ID is not configured. Please set it in LoginPage.js');
      return;
    }

    const handleCredentialResponse = async (response) => {
      setStatus('Logging in...');
      setError(null);
      const success = await login(response.credential);
      if (success) {
        setStatus('Login successful! Redirecting...');
        // Use navigate to redirect and pass state
        setTimeout(() => navigate('/dashboard', { state: { message: 'Login successful!' } }), 1000);
      } else {
        setStatus('');
        setError('Login failed. Please try again.');
      }
    };

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        auto_prompt: false,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', type: 'standard', width: '300' }
      );
    }
  }, [login, navigate]);
  
  if (isAuthenticated) {
    return null; // Don't render the login page if authenticated
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-sm text-center">
        <div className="flex justify-center items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 ml-2">Expense Tracker</h1>
        </div>
        <p className="text-gray-500 mb-8">Your secure and smart financial partner.</p>
        <div id="google-signin-button" className="mx-auto" />
        {status && !error && (
          <div className="mt-4 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium flex items-center justify-center transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {status}
          </div>
        )}
        {error && (
          <div className="mt-4 px-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium flex items-center justify-center transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;


// process.env.MONGODB_URI