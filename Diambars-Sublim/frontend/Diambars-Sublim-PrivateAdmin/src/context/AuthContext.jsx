// src/context/AuthContext.jsx - PANEL ADMIN CORREGIDO
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as authService from '../api/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log("[AuthContext-ADMIN] Verificando autenticación...");
      
      // Verificar si hay token en localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log("[AuthContext-ADMIN] No hay token, usuario no autenticado");
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      console.log("[AuthContext-ADMIN] Token encontrado, verificando con servidor...");
      const response = await authService.getCurrentUser();
      
      if (response?.authenticated && response?.user) {
        console.log("[AuthContext-ADMIN] Usuario autenticado:", response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        console.log("[AuthContext-ADMIN] Usuario no autenticado según servidor");
        setIsAuthenticated(false);
        setUser(null);
        // Limpiar token si la respuesta indica que no está autenticado
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.warn('[AuthContext-ADMIN] Error verificando autenticación:', error);
      setIsAuthenticated(false);
      setUser(null);
      
      // Si el error es 401 o 403, limpiar tokens
      if (error.status === 401 || error.status === 403) {
        console.log('[AuthContext-ADMIN] Limpiando token por error de auth');
        localStorage.removeItem('token');
      }
    } finally {
      console.log("[AuthContext-ADMIN] Verificación de auth completada");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Delay para permitir que el splash se muestre
    const authTimer = setTimeout(() => {
      checkAuth();
    }, 2000);

    return () => clearTimeout(authTimer);
  }, []);

  const login = async (credentials) => {
    try {
      console.log("[AuthContext-ADMIN] Iniciando proceso de login...");
      setLoading(true);
      
      const user = await authService.login(credentials);
      console.log("[AuthContext-ADMIN] Login exitoso, usuario:", user);
      
      // Actualizar estado inmediatamente
      setUser(user);
      setIsAuthenticated(true);
      setLoading(false);
      
      return user;
    } catch (error) {
      console.error("[AuthContext-ADMIN] Error en login:", error);
      setLoading(false);
      
      // Asegurar que el estado esté limpio después de error
      setUser(null);
      setIsAuthenticated(false);
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("[AuthContext-ADMIN] Iniciando cierre de sesión...");
      setLoading(true);
      
      await authService.logout();
      
      // Limpiar estado
      setUser(null);
      setIsAuthenticated(false);
      
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Sesión cerrada correctamente',
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: '#ffffff',
        color: '#1f2937',
        iconColor: '#10b981'
      });
      
      // Esperar un momento antes de redirigir
      setTimeout(() => {
        setLoading(false);
        navigate('/login', { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error("[AuthContext-ADMIN] Error al cerrar sesión:", error);
      
      // Limpiar estado local aunque falle el servidor
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      
      navigate('/login', { replace: true });
    }
  };

  // Función para refrescar la autenticación sin loading
  const refreshAuth = async () => {
    try {
      console.log("[AuthContext-ADMIN] Refrescando autenticación...");
      const response = await authService.getCurrentUser();
      
      if (response?.authenticated && response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.warn('[AuthContext-ADMIN] Error refrescando autenticación:', error);
      if (error.status === 401 || error.status === 403) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
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