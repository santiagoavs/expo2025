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
  const isPublic = publicPaths.some(path => location.pathname.startsWith(path));
 
  useEffect(() => {
    // Agregar un pequeño delay para evitar que se ejecute durante el splash
    // Solo mostrar error si NO es una ruta pública y no está cargando
    const timer = setTimeout(() => {
      if (!loading && !isAuthenticated && !isPublic) {
        showError(
          'Acceso no autorizado',
          'Debes iniciar sesión para acceder a esta sección'
        );
      }
    }, 100); // Pequeño delay para evitar conflictos con el splash
 
    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, isPublic]);
 
  // Mostrar loading mientras está cargando
  if (loading) {
    return (
      <div className="loading-indicator" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }
 
  // Si no está autenticado y no es ruta pública, redirigir a login
  if (!isAuthenticated && !isPublic) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
 
  // Si está autenticado, verificar permisos
  if (isAuthenticated && user) {
    const userType = user.type?.toLowerCase();
    const userRole = user.role?.toLowerCase();
 
    // Verificar tipo de usuario
    if (!allowedTypes.includes(userType)) {
      console.warn(`Tipo de usuario no permitido: ${userType}`);
      return <Navigate to="/login" replace />;
    }
 
    // Verificar roles permitidos (solo si se especifican roles)
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      console.warn(`Rol no permitido: ${userRole}. Roles permitidos: ${allowedRoles.join(', ')}`);
      return <Navigate to="/login" replace />;
    }
  }
 
  return <Outlet />;
};
 
export default ProtectedRoute;