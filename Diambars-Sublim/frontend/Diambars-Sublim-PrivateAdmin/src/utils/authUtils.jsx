// src/utils/authUtils.js - Utilidades de autenticación para Panel Admin
export const clearAdminAuth = () => {
    console.log('🗑️ [authUtils] Limpiando autenticación del panel admin...');
    
    // Limpiar token del localStorage
    localStorage.removeItem('token');
    
    // También limpiar sessionStorage por si acaso
    sessionStorage.removeItem('token');
    
    // Limpiar cualquier otro dato de sesión admin
    const keysToRemove = ['user', 'authUser', 'adminUser', 'employee'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('✅ [authUtils] Autenticación del panel admin limpiada');
  };
  
  export const hasAdminAuth = () => {
    const token = localStorage.getItem('token');
    console.log('🔍 [authUtils] Verificando auth admin:', {
      hasToken: !!token,
      tokenLength: token?.length
    });
    return !!token;
  };
  
  export const getAdminToken = () => {
    return localStorage.getItem('token');
  };
  
  export const setAdminToken = (token) => {
    if (!token) {
      console.warn('⚠️ [authUtils] Intentando establecer token vacío');
      return;
    }
    
    console.log('💾 [authUtils] Guardando token admin:', {
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + '...'
    });
    
    localStorage.setItem('token', token);
  };
  
  // Función para verificar si el usuario tiene permisos de empleado
  export const isEmployeeUser = (user) => {
    if (!user) return false;
    
    const allowedTypes = ['employee', 'manager', 'delivery', 'admin'];
    const allowedRoles = ['admin', 'manager', 'employee', 'delivery'];
    
    const userType = user.type?.toLowerCase();
    const userRole = user.role?.toLowerCase();
    
    const hasValidType = allowedTypes.includes(userType);
    const hasValidRole = allowedRoles.includes(userRole);
    
    console.log('👤 [authUtils] Verificando permisos de empleado:', {
      userType,
      userRole,
      hasValidType,
      hasValidRole,
      isEmployee: hasValidType || hasValidRole
    });
    
    return hasValidType || hasValidRole;
  };
  
  // Debug para ver el estado actual de auth
  export const debugAdminAuth = () => {
    console.log('🐛 [authUtils] Debug de autenticación admin:');
    console.log('- Token en localStorage:', !!localStorage.getItem('token'));
    console.log('- Token length:', localStorage.getItem('token')?.length);
    console.log('- SessionStorage keys:', Object.keys(sessionStorage));
    console.log('- LocalStorage keys:', Object.keys(localStorage));
  };