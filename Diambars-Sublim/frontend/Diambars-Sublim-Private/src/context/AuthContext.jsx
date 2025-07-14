import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.authenticated && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { token, user } = await authService.login(credentials);
      localStorage.setItem('diambars_token', token);
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      if (error.message === 'Cuenta no verificada') {
        error.needsVerification = true;
      }
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('diambars_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};