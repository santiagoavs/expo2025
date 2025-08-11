// src/utils/clearAuthCookies.js - Utilidad para limpiar cookies corruptas
export const clearAuthCookies = () => {
  console.log('🗑️ [clearAuthCookies] Limpiando todas las cookies de autenticación...');
  
  // Lista de posibles cookies de autenticación
  const authCookieNames = ['authToken', 'token', 'jwt', 'sessionToken', 'accessToken'];
  
  // Lista de posibles dominios y paths
  const domains = ['', 'localhost', '.localhost', window.location.hostname];
  const paths = ['/', '/api', '/auth'];
  
  authCookieNames.forEach(cookieName => {
    domains.forEach(domain => {
      paths.forEach(path => {
        // Construir string de cookie para eliminar
        let cookieString = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
        
        if (domain) {
          cookieString += ` domain=${domain};`;
        }
        
        // Intentar eliminar la cookie
        document.cookie = cookieString;
        
        console.log(`🗑️ [clearAuthCookies] Intentando eliminar: ${cookieName} en ${domain || 'sin dominio'}${path}`);
      });
    });
  });
  
  // También intentar eliminar con SameSite y Secure
  authCookieNames.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure;`;
  });
  
  console.log('✅ [clearAuthCookies] Proceso de limpieza completado');
  
  // Verificar cookies restantes
  const remainingCookies = document.cookie.split(';').filter(cookie => 
    authCookieNames.some(name => cookie.trim().startsWith(name))
  );
  
  if (remainingCookies.length > 0) {
    console.warn('⚠️ [clearAuthCookies] Cookies restantes:', remainingCookies);
  } else {
    console.log('✅ [clearAuthCookies] Todas las cookies de autenticación eliminadas');
  }
};

// Función para verificar si hay cookies de autenticación
export const hasAuthCookies = () => {
  const authCookieNames = ['authToken', 'token', 'jwt', 'sessionToken', 'accessToken'];
  const cookies = document.cookie.split(';');
  
  return authCookieNames.some(name => 
    cookies.some(cookie => cookie.trim().startsWith(name + '='))
  );
};

// Función para debuggear cookies actuales
export const debugCookies = () => {
  console.log('🍪 [debugCookies] Todas las cookies actuales:');
  const cookies = document.cookie.split(';');
  
  if (cookies.length === 1 && cookies[0] === '') {
    console.log('🍪 [debugCookies] No hay cookies');
    return;
  }
  
  cookies.forEach((cookie, index) => {
    const [name, value] = cookie.trim().split('=');
    console.log(`🍪 [debugCookies] ${index + 1}. ${name}: ${value?.substring(0, 20)}${value?.length > 20 ? '...' : ''}`);
  });
};