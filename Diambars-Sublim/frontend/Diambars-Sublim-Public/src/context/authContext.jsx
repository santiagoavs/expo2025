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
      
      // MOBILE FIX: Primero intentar recuperar desde localStorage para móviles
      // iOS Safari tiene problemas con cookies en ciertos contextos
      let localStorageValid = false;
      try {
        const savedUser = localStorage.getItem('user');
        const savedAuth = localStorage.getItem('isAuthenticated');
        const savedTimestamp = localStorage.getItem('authTimestamp');
        
        if (savedUser && savedAuth === 'true' && savedTimestamp) {
          const timestamp = parseInt(savedTimestamp);
          const now = Date.now();
          const hoursSinceAuth = (now - timestamp) / (1000 * 60 * 60);
          
          // Sesión válida si es menor a 24 horas
          if (hoursSinceAuth < 24) {
            const userData = JSON.parse(savedUser);
            console.log('📱 [AuthContext] Sesión válida desde localStorage (móvil):', userData.email);
            setUser(userData);
            setIsAuthenticated(true);
            localStorageValid = true;
          } else {
            console.log('⏰ [AuthContext] Sesión localStorage expirada');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('authTimestamp');
          }
        }
      } catch (localStorageError) {
        console.warn('⚠️ [AuthContext] Error leyendo localStorage:', localStorageError);
      }
      
      // Intentar verificar autenticación usando las cookies del servidor
      try {
        const response = await apiClient.get('/auth/checkAuth');
        
        if (response.authenticated && response.user) {
          console.log('✅ [AuthContext] Usuario autenticado via cookies:', response.user);
          setUser(response.user);
          setIsAuthenticated(true);
          
          // Sincronizar localStorage con datos del servidor
          try {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authTimestamp', Date.now().toString());
          } catch (error) {
            console.warn('⚠️ [AuthContext] No se pudo sincronizar localStorage:', error);
          }
        } else if (!localStorageValid) {
          // Solo limpiar si localStorage tampoco era válido
          console.log('❌ [AuthContext] No hay usuario autenticado');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('❌ [AuthContext] Error verificando cookies:', error.response?.status);
        
        // Si localStorage es válido, mantener la sesión aunque fallen las cookies
        if (!localStorageValid) {
          setUser(null);
          setIsAuthenticated(false);
          clearAuthCookies();
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('authTimestamp');
        } else {
          console.log('📱 [AuthContext] Manteniendo sesión desde localStorage (modo offline)');
        }
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error crítico en checkAuthStatus:', error);
      setUser(null);
      setIsAuthenticated(false);
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
    
    // MOBILE FIX: Guardar en localStorage con timestamp para móviles
    // donde las cookies pueden fallar (especialmente iOS Safari)
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authTimestamp', Date.now().toString());
      console.log('💾 [AuthContext] Usuario guardado en localStorage con timestamp');
    } catch (error) {
      console.warn('⚠️ [AuthContext] No se pudo guardar en localStorage:', error);
    }
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
      
      // Limpiar localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authTimestamp');
      
      // Limpiar cualquier cache del navegador relacionado con la sesión
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('auth') || name.includes('user')) {
              caches.delete(name);
            }
          });
        });
      }
      
      console.log('✅ [AuthContext] Sesión cerrada localmente y cache limpiado');
    }
  };

  // Método para actualizar datos del usuario
  const updateUser = (newUserData) => {
    console.log('🔄 [AuthContext] Actualizando datos del usuario');
    setUser(prevUser => ({ ...prevUser, ...newUserData }));
  };

  // Método para refrescar datos del usuario
  const refreshUser = async () => {
    try {
      console.log('🔄 [AuthContext] Refrescando datos del usuario...');
      const response = await apiClient.get('/auth/checkAuth');
      
      if (response.authenticated && response.user) {
        console.log('🔄 [AuthContext] Usuario actualizado desde servidor:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Actualizar localStorage también
        try {
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('authTimestamp', Date.now().toString());
        } catch (error) {
          console.warn('⚠️ [AuthContext] No se pudo actualizar localStorage:', error);
        }
        
        console.log('✅ [AuthContext] Datos del usuario actualizados correctamente');
      } else {
        console.log('❌ [AuthContext] No hay usuario autenticado en refresh');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error refrescando usuario:', error);
      
      // Si hay error 401, cerrar sesión
      if (error.response?.status === 401) {
        console.log('🚪 [AuthContext] Error 401 - cerrando sesión');
        setUser(null);
        setIsAuthenticated(false);
        clearAuthCookies();
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('authTimestamp');
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