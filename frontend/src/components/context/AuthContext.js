import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const response = await axiosInstance.get('/expenses/totals');
      if (response.status === 200) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (idToken) => {
    try {
      await axiosInstance.post('/google-login', { idToken });
      setIsAuthenticated(true);
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/logout');
      setIsAuthenticated(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    checkAuth,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
