// src/api/loginService.js - VERSION ACTUALIZADA CON MEJOR MANEJO DE ERRORES
import apiClient from './apiClient';
import { clearAuthCookies, debugCookies } from '../utils/clearAuthCookies';

export const loginUser = async (credentials) => {
  try {
    console.log('🚀 [loginService] Iniciando login con:', { 
      email: credentials.email,
      passwordLength: credentials.password?.length,
      hasPassword: !!credentials.password
    });
    
    // Verificar que apiClient esté configurado
    console.log('🔧 [loginService] URL Base:', apiClient.defaults.baseURL);
    console.log('🍪 [loginService] WithCredentials:', apiClient.defaults.withCredentials);
    
    // Debuggear cookies antes del login
    debugCookies();
    
    // Limpiar cookies corruptas antes de intentar login
    if (document.cookie.includes('authToken')) {
      console.log('🗑️ [loginService] Limpiando cookies existentes antes del login');
      clearAuthCookies();
    }
    
    const response = await apiClient.post('/auth/login', {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    });
    
    console.log('✅ [loginService] Respuesta completa del servidor:', response);
    console.log('📊 [loginService] Status implícito: 200 (porque no hay error)');
    console.log('👤 [loginService] Usuario en respuesta:', !!response.user);
    console.log('🔑 [loginService] Success flag:', response.success);
    console.log('💬 [loginService] Mensaje:', response.message);
    
    // Debuggear cookies después del login
    setTimeout(() => {
      console.log('🍪 [loginService] Cookies después del login:');
      debugCookies();
    }, 100);
    
    // Verificar estructura de respuesta
    if (response.success && response.user) {
      console.log('✅ [loginService] Login exitoso con estructura correcta');
      console.log('👤 [loginService] Datos del usuario:', {
        id: response.user._id || response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        type: response.user.type,
        verified: response.user.verified,
        active: response.user.active
      });
      
      // MOBILE FIX: Guardar token en localStorage si viene en la respuesta (fallback para iOS)
      if (response.token) {
        try {
          localStorage.setItem('authToken', response.token);
          console.log('🔑 [loginService] Token guardado en localStorage para iOS fallback');
        } catch (error) {
          console.warn('⚠️ [loginService] No se pudo guardar token en localStorage:', error);
        }
      }
      
      return response.user;
    } else if (response.user && !response.success) {
      console.log('⚠️ [loginService] Usuario presente pero sin success flag');
      return response.user;
    } else if (response.needsVerification || response.error === 'USER_NOT_VERIFIED') {
      console.log('📧 [loginService] Usuario necesita verificación');
      const error = new Error('Usuario no verificado');
      error.needsVerification = true;
      error.email = credentials.email;
      throw error;
    } else {
      console.error('❌ [loginService] Estructura de respuesta inesperada:', response);
      throw new Error('Respuesta inesperada del servidor');
    }
  } catch (error) {
    console.error('💥 [loginService] Error capturado:', error);
    console.error('📊 [loginService] Error status:', error.response?.status);
    console.error('📄 [loginService] Error data:', error.response?.data);
    console.error('🏷️ [loginService] Error message:', error.message);
    console.error('🔗 [loginService] Error config URL:', error.config?.url);
    
    // Analizar el error en detalle
    if (error.response?.status === 401) {
      const data = error.response.data;
      console.log('🔍 [loginService] Analizando error 401:', data);
      
      // Verificar si es un error de verificación
      if (data.needsVerification === true || 
          data.error === 'USER_NOT_VERIFIED' ||
          (data.message && data.message.toLowerCase().includes('verifica'))) {
        console.log('📧 [loginService] Error de verificación detectado');
        const verificationError = new Error('Usuario no verificado');
        verificationError.needsVerification = true;
        verificationError.email = credentials.email;
        throw verificationError;
      } else {
        console.log('🔐 [loginService] Error de credenciales');
        
        // Si hay cookies corruptas, limpiarlas
        if (document.cookie.includes('authToken')) {
          console.log('🗑️ [loginService] Limpiando cookies después de error 401');
          clearAuthCookies();
        }
        
        throw new Error('Email o contraseña incorrectos');
      }
    } else if (error.response?.status === 400) {
      console.log('📝 [loginService] Error de datos de entrada');
      throw new Error(error.response.data?.message || 'Datos de entrada inválidos');
    } else if (error.response?.status >= 500) {
      console.log('🖥️ [loginService] Error del servidor');
      throw new Error('Error del servidor. Intenta más tarde.');
    } else if (error.needsVerification) {
      console.log('📧 [loginService] Re-lanzando error de verificación');
      throw error;
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.log('🌐 [loginService] Error de red');
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    } else {
      console.log('❓ [loginService] Error desconocido');
      throw new Error(error.message || 'Error desconocido en login');
    }
  }
};