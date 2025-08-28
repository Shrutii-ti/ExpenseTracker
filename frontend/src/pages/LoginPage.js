import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const LoginPage = () => {
  const { isAuthenticated, checkAuth } = useAuth();
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const googleClientId = '536455245201-jcub08aa0k0qsiqo08s63563gbdck4qg.apps.googleusercontent.com';
    if (!googleClientId || googleClientId === '<your_google_client_id_here>') {
      setError('❌ Google Client ID is not configured. Please set it in LoginPage.js');
      return;
    }

    const handleCredentialResponse = async (response) => {
      setStatus('Logging in...');
      setError(null);
      try {
        const res = await axiosInstance.post('/google-login', {
          idToken: response.credential,
        });

        if (res.status === 200) {
          setStatus('Login successful!');
          checkAuth();
        }
      } catch (error) {
        setStatus('');
        const errorMessage = error.response?.data?.message || error.message || 'Unknown network error';
        setError('Login failed: ' + errorMessage);
        console.error('Login error:', error.response?.data || error);
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
  }, [checkAuth]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-sm text-center">
        <div className="flex justify-center items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.362a9 9 0 010 12.724 9 9 0 01-12.724 0 9 9 0 010-12.724 9 9 0 0112.724 0z" />
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
