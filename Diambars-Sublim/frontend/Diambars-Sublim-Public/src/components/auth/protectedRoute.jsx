// src/components/auth/ProtectedRoute.jsx - ADAPTADO A TU SISTEMA EXISTENTE
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './protectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="protected-route-page">
        <div className="protected-route-card">
          <div className="protected-spinner"></div>
          <p className="protected-message">
            Verificando autenticación...
          </p>
          <p className="protected-submessage">
            Por favor espera un momento
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al perfil (donde está tu login)
  // Guardamos la URL actual en state para poder redirigir después del login
  if (!isAuthenticated) {
    return <Navigate 
      to="/profile" 
      state={{ 
        from: location,
        message: "Inicia sesión para acceder a tus diseños personalizados" 
      }} 
      replace 
    />;
  }

  // Si está autenticado, mostrar el componente protegido
  return children;
};

export default ProtectedRoute;