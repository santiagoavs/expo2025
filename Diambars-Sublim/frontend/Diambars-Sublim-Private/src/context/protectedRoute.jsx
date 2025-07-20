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
  const isPublic = publicPaths.includes(location.pathname);

  useEffect(() => {
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
    const type = user.type?.toLowerCase();
    const role = user.role?.toLowerCase();

    if (!allowedTypes.includes(type)) {
      return <Navigate to="/" replace />;
    }
    if (allowedRoles.length) {
      const roles = allowedRoles.map(r => r.toLowerCase());
      if (!roles.includes(role)) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
