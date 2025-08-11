// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as authService from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log("[AuthContext] Checking authentication...");
      
      // Verificar si hay token en localStorage/sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        console.log("[AuthContext] No token found, user not authenticated");
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      const response = await authService.getCurrentUser();
      
      if (response?.authenticated && response?.user) {
        console.log("[AuthContext] User is authenticated:", response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        console.log("[AuthContext] User is not authenticated");
        setIsAuthenticated(false);
        setUser(null);
        // Limpiar token si la respuesta indica que no está autenticado
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    } catch (error) {
      console.warn('[AuthContext] Error checking authentication:', error);
      setIsAuthenticated(false);
      setUser(null);
      
      // Si el error es 401 o 403, limpiar tokens
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    } finally {
      console.log("[AuthContext] Auth check complete, setting loading to false");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Delay más largo para permitir que el splash se muestre completamente
    const authTimer = setTimeout(() => {
      checkAuth();
    }, 2000); // Aumentado de 100ms a 2000ms

    return () => clearTimeout(authTimer);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true); // Mostrar loading durante el login
      const response = await authService.login(credentials);
      
      // Si el login devuelve un token, guardarlo
      if (response?.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Verificar autenticación después de login
      await checkAuth();
      return response;
    } catch (error) {
      setLoading(false); // Asegurar que loading se desactive si falla
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      
      // Limpiar tokens y estado
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      
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
        setLoading(false);
        navigate('/login', { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      
      // Limpiar estado local aunque falle el servidor
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      navigate('/login', { replace: true });
    }
  };

  // Función para refrescar la autenticación sin loading
  const refreshAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      
      if (response?.authenticated && response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    } catch (error) {
      console.warn('[AuthContext] Error refreshing authentication:', error);
      if (error.status === 401 || error.status === 403) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
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
        checkAuth,
        refreshAuth
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