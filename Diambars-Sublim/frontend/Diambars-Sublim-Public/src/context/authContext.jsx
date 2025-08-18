// src/context/authContext.jsx - ACTUALIZADO PARA USAR COOKIES
import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient.js';
import { clearAuthCookies } from '../utils/clearAuthCookies';

// Crea el contexto
export const AuthContext = createContext();

// Hook personalizado para acceder al contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ← CAMBIAR A true
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para verificar el estado de autenticación
  const checkAuthStatus = async () => {
    try {
      console.log('🔍 [AuthContext] Verificando estado de autenticación...');
      
      // Intentar verificar autenticación usando las cookies
      const response = await apiClient.get('/auth/checkAuth');
      
      if (response.authenticated && response.user) {
        console.log('✅ [AuthContext] Usuario autenticado:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Limpiar localStorage si existe data obsoleta
        if (localStorage.getItem('user')) {
          console.log('🗑️ [AuthContext] Limpiando datos obsoletos de localStorage');
          localStorage.removeItem('user');
        }
      } else {
        console.log('❌ [AuthContext] No hay usuario autenticado');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('❌ [AuthContext] Error verificando autenticación:', error.response?.status);
      
      // Si el error es 401, el usuario no está autenticado
      if (error.response?.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
        clearAuthCookies(); // Limpiar cookies corruptas
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar autenticación al cargar la aplicación
    checkAuthStatus();
  }, []);

  // Método para iniciar sesión
  const login = (userData) => {
    console.log('🔐 [AuthContext] Iniciando sesión para:', userData.email);
    setUser(userData);
    setIsAuthenticated(true);
    
    // NO guardar en localStorage, solo en estado
    // Las cookies manejan la persistencia
  };

  // Método para cerrar sesión
  const logout = async () => {
    try {
      console.log('👋 [AuthContext] Cerrando sesión...');
      
      // Llamar al endpoint de logout del backend
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('❌ [AuthContext] Error en logout del servidor:', error);
    } finally {
      // Limpiar estado local independientemente del resultado del servidor
      setUser(null);
      setIsAuthenticated(false);
      
      // Limpiar cookies
      clearAuthCookies();
      
      // Limpiar cualquier dato obsoleto en localStorage
      localStorage.removeItem('user');
      
      console.log('✅ [AuthContext] Sesión cerrada localmente');
    }
  };

  // Método para actualizar datos del usuario
  const updateUser = (newUserData) => {
    console.log('🔄 [AuthContext] Actualizando datos del usuario');
    setUser(prevUser => ({ ...prevUser, ...newUserData }));
  };

  // Método para refrescar datos del usuario
  const refreshUser = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('🔄 [AuthContext] Refrescando datos del usuario...');
      const response = await apiClient.get('/auth/checkAuth');
      
      if (response.authenticated && response.user) {
        setUser(response.user);
        console.log('✅ [AuthContext] Datos del usuario actualizados');
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error refrescando usuario:', error);
      
      // Si hay error 401, cerrar sesión
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const contextValue = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};