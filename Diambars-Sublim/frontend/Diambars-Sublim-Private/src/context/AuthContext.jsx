// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      
      if (response?.authenticated && response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const user = await authService.login(credentials);
      await checkAuth(); // Verificar autenticación después de login
      return user;
    } catch (error) {
      throw error;
    }
  };

 const logout = async () => {
  try {
    await authService.logout();
    
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Sesión cerrada',
      showConfirmButton: false,
      timer: 1000,
      toast: true
    });
    
    // Espera 1s antes de redirigir para que se vea el mensaje
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
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