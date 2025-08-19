// src/components/auth/ProtectedRoute.jsx - ADAPTADO A TU SISTEMA EXISTENTE
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #FFF6E2 0%, #F5E7C6 100%)',
        fontFamily: 'DiambarsFont, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(63, 39, 36, 0.2)',
            borderTop: '3px solid #3F2724',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ 
            color: '#3F2724', 
            margin: 0,
            fontSize: '1rem',
            fontWeight: 600
          }}>
            Verificando autenticación...
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