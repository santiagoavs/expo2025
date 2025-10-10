// src/utils/permissions.js - Sistema de permisos por rol
import { useAuth } from '../context/AuthContext';

// Definición de permisos por rol
export const ROLE_PERMISSIONS = {
  admin: {
    // Usuarios
    canViewUsers: true,
    canCreateUsers: true,
    canUpdateUsers: true,
    canDeleteUsers: true,
    canChangeUserStatus: true,
    
    // Empleados
    canViewEmployees: true,
    canCreateEmployees: true,
    canUpdateEmployees: true,
    canDeleteEmployees: true,
    canHardDeleteEmployees: true,
    canChangeEmployeeStatus: true,
    
    // Productos
    canViewProducts: true,
    canCreateProducts: true,
    canUpdateProducts: true,
    canDeleteProducts: true,
    canUpdateProductStats: true,
    
    // Categorías
    canViewCategories: true,
    canCreateCategories: true,
    canUpdateCategories: true,
    canDeleteCategories: true,
    
    // Diseños
    canViewDesigns: true,
    canCreateDesigns: true,
    canUpdateDesigns: true,
    canQuoteDesigns: true,
    canChangeDesignStatus: true,
    canRegeneratePreviews: true,
    
    // Órdenes
    canViewOrders: true,
    canCreateOrders: true,
    canUpdateOrders: true,
    canQuoteOrders: true,
    canChangeOrderStatus: true,
    canRegisterCashPayment: true,
    
    // Producción
    canViewProductionPhotos: true,
    canUploadProductionPhotos: true,
    canDeleteProductionPhotos: true,
    
    // Reportes
    canViewReports: true,
    canViewDashboard: true,
    canViewSalesReports: true,
    canViewTopProducts: true,
    canViewTopCustomers: true,
    canViewProductionReports: true,
    
    // Pagos
    canViewPayments: true,
    canConfirmPayments: true,
    canViewPendingTransfers: true,
    
    // Direcciones
    canViewAddresses: true,
    canCreateAddresses: true,
    canUpdateAddresses: true,
    canDeleteAddresses: true,
    
    // Reseñas
    canViewReviews: true,
    canApproveReviews: true,
    canRejectReviews: true,
    canViewReviewStats: true
  },
  
  manager: {
    // Usuarios
    canViewUsers: true,
    canCreateUsers: false, // Solo Admin
    canUpdateUsers: true,
    canDeleteUsers: false, // Solo Admin
    canChangeUserStatus: true,
    
    // Empleados
    canViewEmployees: true,
    canCreateEmployees: false, // Solo Admin
    canUpdateEmployees: true,
    canDeleteEmployees: false, // Solo inactivar, no hard delete
    canHardDeleteEmployees: false, // Solo Admin
    canChangeEmployeeStatus: true,
    
    // Productos
    canViewProducts: true,
    canCreateProducts: true,
    canUpdateProducts: true,
    canDeleteProducts: false, // Solo Admin
    canUpdateProductStats: true,
    
    // Categorías
    canViewCategories: true,
    canCreateCategories: true,
    canUpdateCategories: true,
    canDeleteCategories: false, // Solo Admin
    
    // Diseños
    canViewDesigns: true,
    canCreateDesigns: true,
    canUpdateDesigns: true,
    canQuoteDesigns: true,
    canChangeDesignStatus: true,
    canRegeneratePreviews: true,
    
    // Órdenes
    canViewOrders: true,
    canCreateOrders: true,
    canUpdateOrders: true,
    canQuoteOrders: true,
    canChangeOrderStatus: true,
    canRegisterCashPayment: true,
    
    // Producción
    canViewProductionPhotos: true,
    canUploadProductionPhotos: true,
    canDeleteProductionPhotos: true,
    
    // Reportes
    canViewReports: true,
    canViewDashboard: true,
    canViewSalesReports: true,
    canViewTopProducts: true,
    canViewTopCustomers: true,
    canViewProductionReports: true,
    
    // Pagos
    canViewPayments: true,
    canConfirmPayments: true,
    canViewPendingTransfers: true,
    
    // Direcciones
    canViewAddresses: true,
    canCreateAddresses: true,
    canUpdateAddresses: true,
    canDeleteAddresses: true,
    
    // Reseñas
    canViewReviews: true,
    canApproveReviews: true,
    canRejectReviews: true,
    canViewReviewStats: true
  },
  
  employee: {
    // Usuarios
    canViewUsers: false, // No puede ver usuarios
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,
    canChangeUserStatus: false,
    
    // Empleados
    canViewEmployees: false, // No puede ver empleados
    canCreateEmployees: false,
    canUpdateEmployees: false,
    canDeleteEmployees: false,
    canHardDeleteEmployees: false,
    canChangeEmployeeStatus: false,
    
    // Productos
    canViewProducts: true,
    canCreateProducts: false, // Solo ver/actualizar estadísticas
    canUpdateProducts: false,
    canDeleteProducts: false,
    canUpdateProductStats: true,
    
    // Categorías
    canViewCategories: true,
    canCreateCategories: false,
    canUpdateCategories: false,
    canDeleteCategories: false,
    
    // Diseños
    canViewDesigns: true,
    canCreateDesigns: true,
    canUpdateDesigns: true,
    canQuoteDesigns: true,
    canChangeDesignStatus: true,
    canRegeneratePreviews: false,
    
    // Órdenes
    canViewOrders: true,
    canCreateOrders: true,
    canUpdateOrders: true,
    canQuoteOrders: true,
    canChangeOrderStatus: true,
    canRegisterCashPayment: true,
    
    // Producción
    canViewProductionPhotos: true,
    canUploadProductionPhotos: true,
    canDeleteProductionPhotos: true,
    
    // Reportes
    canViewReports: false, // No puede ver reportes avanzados
    canViewDashboard: false,
    canViewSalesReports: false,
    canViewTopProducts: false,
    canViewTopCustomers: false,
    canViewProductionReports: false,
    
    // Pagos
    canViewPayments: true,
    canConfirmPayments: true,
    canViewPendingTransfers: true,
    
    // Direcciones
    canViewAddresses: true,
    canCreateAddresses: true,
    canUpdateAddresses: true,
    canDeleteAddresses: true,
    
    // Reseñas
    canViewReviews: true,
    canApproveReviews: true,
    canRejectReviews: true,
    canViewReviewStats: true
  },
  
  delivery: {
    // Usuarios
    canViewUsers: false,
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,
    canChangeUserStatus: false,
    
    // Empleados
    canViewEmployees: false,
    canCreateEmployees: false,
    canUpdateEmployees: false,
    canDeleteEmployees: false,
    canHardDeleteEmployees: false,
    canChangeEmployeeStatus: false,
    
    // Productos
    canViewProducts: false,
    canCreateProducts: false,
    canUpdateProducts: false,
    canDeleteProducts: false,
    canUpdateProductStats: false,
    
    // Categorías
    canViewCategories: false,
    canCreateCategories: false,
    canUpdateCategories: false,
    canDeleteCategories: false,
    
    // Diseños
    canViewDesigns: false,
    canCreateDesigns: false,
    canUpdateDesigns: false,
    canQuoteDesigns: false,
    canChangeDesignStatus: false,
    canRegeneratePreviews: false,
    
    // Órdenes
    canViewOrders: true,
    canCreateOrders: false,
    canUpdateOrders: false,
    canQuoteOrders: false,
    canChangeOrderStatus: true, // Solo estados de entrega
    canRegisterCashPayment: false,
    
    // Producción
    canViewProductionPhotos: true, // Solo lectura
    canUploadProductionPhotos: false,
    canDeleteProductionPhotos: false,
    
    // Reportes
    canViewReports: false,
    canViewDashboard: false,
    canViewSalesReports: false,
    canViewTopProducts: false,
    canViewTopCustomers: false,
    canViewProductionReports: false,
    
    // Pagos
    canViewPayments: false,
    canConfirmPayments: false,
    canViewPendingTransfers: false,
    
    // Direcciones
    canViewAddresses: true, // Solo lectura
    canCreateAddresses: false,
    canUpdateAddresses: false,
    canDeleteAddresses: false,
    
    // Reseñas
    canViewReviews: false,
    canApproveReviews: false,
    canRejectReviews: false,
    canViewReviewStats: false
  }
};

// Hook para verificar permisos
export const usePermissions = () => {
  const { user } = useAuth();
  
  if (!user) {
    return {
      hasPermission: () => false,
      canAccess: () => false,
      userRole: null,
      permissions: {}
    };
  }
  
  const userRole = user.role?.toLowerCase() || user.type?.toLowerCase();
  const permissions = ROLE_PERMISSIONS[userRole] || {};
  
  const hasPermission = (permission) => {
    return permissions[permission] === true;
  };
  
  const canAccess = (permissions) => {
    if (Array.isArray(permissions)) {
      return permissions.some(permission => hasPermission(permission));
    }
    return hasPermission(permissions);
  };
  
  return {
    hasPermission,
    canAccess,
    userRole,
    permissions
  };
};

// Función utilitaria para obtener permisos sin hook
export const getPermissions = (user) => {
  if (!user) return {};
  
  const userRole = user.role?.toLowerCase() || user.type?.toLowerCase();
  return ROLE_PERMISSIONS[userRole] || {};
};

// Función para verificar si un rol puede hacer algo
export const canRoleDo = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role?.toLowerCase()] || {};
  return permissions[permission] === true;
};

// Función para obtener el estilo de elemento deshabilitado
export const getDisabledStyle = (hasPermission) => {
  return {
    opacity: hasPermission ? 1 : 0.5,
    pointerEvents: hasPermission ? 'auto' : 'none',
    cursor: hasPermission ? 'pointer' : 'not-allowed'
  };
};

// Función para obtener props de botón deshabilitado
export const getDisabledButtonProps = (hasPermission) => {
  return {
    disabled: !hasPermission,
    sx: {
      opacity: hasPermission ? 1 : 0.5,
      cursor: hasPermission ? 'pointer' : 'not-allowed'
    }
  };
};

export default ROLE_PERMISSIONS;
