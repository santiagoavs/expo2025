import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    console.log('🔐 AuthContext: Procesando login...');
    
    // Simulación de login (puedes cambiar esto después)
    const mockUser = { 
      email: credentials.email, 
      role: 'admin',
      name: 'Usuario Admin'
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    
    console.log('✅ AuthContext: Login exitoso:', mockUser);
    return mockUser;
  };

  const logout = () => {
    console.log('🚪 AuthContext: Cerrando sesión...');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};