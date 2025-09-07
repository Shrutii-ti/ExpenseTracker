import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExpenseForm from './components/dashboard/ExpenseForm'; // We'll need a separate page for this

// A component that only allows authenticated users to access a route
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/" />;
};

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        {/* You can add a new route for the expense form here, like: */}
        <Route path="/add-expense" element={<PrivateRoute><ExpenseForm /></PrivateRoute>} />
      </Routes>
  
  );
};

export default App;
