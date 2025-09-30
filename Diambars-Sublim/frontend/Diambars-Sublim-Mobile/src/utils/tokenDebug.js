// src/utils/tokenDebug.js - Utilidades para debuggear el token
import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugToken = async () => {
  try {
    console.log('🔍 [TokenDebug] Verificando token en AsyncStorage...');
    
    const token = await AsyncStorage.getItem('token');
    
    if (token) {
      console.log('✅ [TokenDebug] Token encontrado:');
      console.log('   - Longitud:', token.length);
      console.log('   - Primeros 20 caracteres:', token.substring(0, 20));
      console.log('   - Últimos 20 caracteres:', token.substring(token.length - 20));
      console.log('   - Formato Bearer:', `Bearer ${token.substring(0, 20)}...`);
      
      // Verificar si es un JWT válido (debe tener 3 partes separadas por puntos)
      const parts = token.split('.');
      if (parts.length === 3) {
        console.log('✅ [TokenDebug] Token parece ser un JWT válido (3 partes)');
        try {
          // Decodificar el payload (sin verificar firma)
          const payload = JSON.parse(atob(parts[1]));
          console.log('📋 [TokenDebug] Payload del token:', {
            userId: payload.userId || payload.id,
            email: payload.email,
            role: payload.role,
            type: payload.type,
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A',
            iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'N/A'
          });
        } catch (decodeError) {
          console.warn('⚠️ [TokenDebug] No se pudo decodificar el payload del token:', decodeError);
        }
      } else {
        console.warn('⚠️ [TokenDebug] Token no parece ser un JWT válido (debe tener 3 partes)');
      }
    } else {
      console.log('❌ [TokenDebug] No hay token en AsyncStorage');
    }
    
    return token;
  } catch (error) {
    console.error('❌ [TokenDebug] Error verificando token:', error);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    console.log('🗑️ [TokenDebug] Token eliminado de AsyncStorage');
  } catch (error) {
    console.error('❌ [TokenDebug] Error eliminando token:', error);
  }
};

export const setTestToken = async (testToken) => {
  try {
    await AsyncStorage.setItem('token', testToken);
    console.log('🧪 [TokenDebug] Token de prueba guardado');
  } catch (error) {
    console.error('❌ [TokenDebug] Error guardando token de prueba:', error);
  }
};
