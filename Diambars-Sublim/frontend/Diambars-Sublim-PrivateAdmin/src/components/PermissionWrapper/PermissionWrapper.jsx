// src/components/PermissionWrapper/PermissionWrapper.jsx
import React from 'react';
import { usePermissions } from '../../utils/permissions';

const PermissionWrapper = ({ 
  children, 
  permission, 
  permissions = [], 
  fallback = null,
  disabledStyle = true,
  className = '',
  ...props 
}) => {
  const { hasPermission, canAccess } = usePermissions();
  
  // Determinar si tiene permiso
  const hasAccess = permission ? hasPermission(permission) : canAccess(permissions);
  
  // Si no tiene permiso y hay fallback, mostrar fallback
  if (!hasAccess && fallback) {
    return fallback;
  }
  
  // Si no tiene permiso y no hay fallback, no mostrar nada
  if (!hasAccess && !fallback) {
    return null;
  }
  
  // Si tiene permiso, aplicar estilo deshabilitado si es necesario
  if (hasAccess && disabledStyle) {
    const style = {
      opacity: hasAccess ? 1 : 0.5,
      pointerEvents: hasAccess ? 'auto' : 'none',
      cursor: hasAccess ? 'pointer' : 'not-allowed'
    };
    
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }
  
  // Si tiene permiso y no necesita estilo deshabilitado
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

// Componente específico para botones
export const PermissionButton = ({ 
  children, 
  permission, 
  permissions = [], 
  disabled = false,
  sx = {},
  ...props 
}) => {
  const { hasPermission, canAccess } = usePermissions();
  
  const hasAccess = permission ? hasPermission(permission) : canAccess(permissions);
  const isDisabled = disabled || !hasAccess;
  
  const buttonSx = {
    opacity: isDisabled ? 0.5 : 1,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    ...sx
  };
  
  return (
    <button 
      disabled={isDisabled}
      style={buttonSx}
      {...props}
    >
      {children}
    </button>
  );
};

// Componente específico para elementos de navegación
export const PermissionNavItem = ({ 
  children, 
  permission, 
  permissions = [], 
  to,
  ...props 
}) => {
  const { hasPermission, canAccess } = usePermissions();
  
  const hasAccess = permission ? hasPermission(permission) : canAccess(permissions);
  
  if (!hasAccess) {
    return (
      <div 
        style={{
          opacity: 0.5,
          pointerEvents: 'none',
          cursor: 'not-allowed'
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
  
  return children;
};

// Componente para mostrar tooltip de permiso
export const PermissionTooltip = ({ 
  children, 
  permission, 
  permissions = [], 
  tooltip = "No tienes permisos para esta acción",
  ...props 
}) => {
  const { hasPermission, canAccess } = usePermissions();
  
  const hasAccess = permission ? hasPermission(permission) : canAccess(permissions);
  
  if (!hasAccess) {
    return (
      <div 
        title={tooltip}
        style={{
          opacity: 0.5,
          pointerEvents: 'none',
          cursor: 'not-allowed'
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
  
  return children;
};

export default PermissionWrapper;
