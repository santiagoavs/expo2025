// Importamos React y los hooks necesarios
import React, { createContext, useContext, useState } from 'react';

// Creamos un contexto para la autenticación
const AuthContext = createContext();

// Hook personalizado para consumir el contexto de autenticación
export const useAuth = () => {
  // Obtenemos el contexto
  const context = useContext(AuthContext);

  // Validación: si no existe contexto, lanzamos un error
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  // Retornamos el contexto
  return context;
};

// Componente proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  // Estado para almacenar la información del usuario
  const [user, setUser] = useState(null);

  // Estado para indicar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para iniciar sesión
  const login = async (credentials) => {
    console.log('🔐 AuthContext: Procesando login...');

    // Simulación de login con datos ficticios (mock)
    const mockUser = { 
      email: credentials.email, 
      role: 'admin',
      name: 'Usuario Admin'
    };

    // Actualizamos el estado con el usuario y autenticación
    setUser(mockUser);
    setIsAuthenticated(true);

    console.log('✅ AuthContext: Login exitoso:', mockUser);

    // Retornamos el usuario autenticado
    return mockUser;
  };

  // Función para cerrar sesión
  const logout = () => {
    console.log('🚪 AuthContext: Cerrando sesión...');

    // Reseteamos los estados
    setUser(null);
    setIsAuthenticated(false);
  };

  // Proveemos el contexto a todos los componentes hijos
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout 
    }}>
      {children} {/* Renderizamos los hijos que consumen este contexto */}
    </AuthContext.Provider>
  );
};
