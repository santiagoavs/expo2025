// src/context/protectedRoute.js
import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showError } from '../utils/sweetAlert';

const publicPaths = [
  '/login',
  '/recovery-password',
  '/code-confirmation',
  '/new-password'
];
const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isPublic = publicPaths.some(path => location.pathname.startsWith(path)); // Mejor comparación

  useEffect(() => {
    // Solo mostrar error si NO es una ruta pública
    if (!loading && !isAuthenticated && !isPublic) {
      showError(
        'Acceso no autorizado',
        'Debes iniciar sesión para acceder a esta sección'
      );
    }
  }, [loading, isAuthenticated, isPublic]);

  if (loading) return <div className="loading-indicator">Cargando...</div>;

  if (!isAuthenticated && !isPublic) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && user) {
    const userType = user.type?.toLowerCase();
    const userRole = user.role?.toLowerCase();

    // Verificar tipo de usuario
    if (!allowedTypes.includes(userType)) {
      return <Navigate to="/" replace />;
    }

    // Verificar roles permitidos
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;