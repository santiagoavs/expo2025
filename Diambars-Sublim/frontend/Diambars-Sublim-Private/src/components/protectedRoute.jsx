import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showError } from '../utils/sweetAlert';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const publicPaths = [
    '/login',
    '/recovery-password',
    '/code-confirmation',
    '/new-password'
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated && !publicPaths.includes(location.pathname)) {
      showError('Acceso no autorizado', 'Debes iniciar sesión para acceder a esta sección');
    }
  }, [loading, isAuthenticated, location.pathname]);

  if (loading) {
    return <div className="loading-indicator">Cargando...</div>;
  }

  if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && user) {
    const userType = user.type?.toLowerCase();
    const userRole = user.role?.toLowerCase();
    const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];

    if (!allowedTypes.includes(userType)) {
      return <Navigate to="/" replace />;
    }

    if (allowedRoles.length > 0) {
      const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
      if (!normalizedAllowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;