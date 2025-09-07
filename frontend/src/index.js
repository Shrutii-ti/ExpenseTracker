import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Add the Google Identity Services script to the body
const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.async = true;
document.body.appendChild(script);

if (!container) {
  console.error("The root element 'root' was not found in the DOM.");
}