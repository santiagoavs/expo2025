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

  const isPublicPath = publicPaths.includes(location.pathname);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicPath) {
      showError('Acceso no autorizado', 'Debes iniciar sesión para acceder a esta sección');
    }
  }, [loading, isAuthenticated, isPublicPath]);

  if (loading) {
    return <div className="loading-indicator">Cargando...</div>;
  }

  if (!isAuthenticated && !isPublicPath) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && user) {
    const userType = user.type?.toLowerCase();
    const userRole = user.role?.toLowerCase();

    // Validar tipo de usuario
    if (!allowedTypes.includes(userType)) {
      return <Navigate to="/" replace />;
    }

    // Validar roles permitidos
    if (allowedRoles.length > 0) {
      const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
      if (!normalizedAllowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
      }
    }

  }

  // Si todo bien, mostrar la ruta
  return <Outlet />;
};

export default ProtectedRoute;
