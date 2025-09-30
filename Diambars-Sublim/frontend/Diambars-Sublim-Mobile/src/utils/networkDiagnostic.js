// src/utils/networkDiagnostic.js - Herramientas de diagnóstico de red

import { getApiUrl, testApiConnection } from '../config/apiConfig';

/**
 * Diagnóstica problemas de conectividad de red
 * Útil para debugging durante desarrollo
 */
export const runNetworkDiagnostic = async () => {
  console.log('🔍 Iniciando diagnóstico de red...');
  
  const results = {
    timestamp: new Date().toISOString(),
    apiUrl: getApiUrl(),
    tests: {}
  };

  // Test 1: Verificar URL de API
  console.log('📡 URL de API configurada:', getApiUrl());
  results.tests.apiUrl = {
    configured: getApiUrl(),
    isLocalhost: getApiUrl().includes('localhost'),
    isLocalIP: getApiUrl().includes('192.168.'),
    status: 'configured'
  };

  // Test 2: Verificar conectividad básica
  try {
    console.log('🌐 Probando conectividad...');
    const isConnected = await testApiConnection();
    results.tests.connectivity = {
      status: isConnected ? 'success' : 'failed',
      message: isConnected ? 'Conexión exitosa' : 'No se pudo conectar'
    };
  } catch (error) {
    results.tests.connectivity = {
      status: 'error',
      message: error.message,
      error: error.toString()
    };
  }

  // Test 3: Verificar headers de respuesta
  try {
    console.log('📋 Verificando headers de respuesta...');
    const response = await fetch(`${getApiUrl()}/health`);
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    results.tests.headers = {
      status: 'success',
      cors: headers['access-control-allow-origin'] || 'No configurado',
      contentType: headers['content-type'] || 'No configurado',
      allHeaders: headers
    };
  } catch (error) {
    results.tests.headers = {
      status: 'error',
      message: error.message
    };
  }

  // Mostrar resultados
  console.log('📊 Resultados del diagnóstico:', results);
  
  // Sugerencias basadas en los resultados
  const suggestions = [];
  
  if (results.tests.apiUrl.isLocalhost) {
    suggestions.push('⚠️ Estás usando localhost - cambia a tu IP local (192.168.x.x)');
  }
  
  if (results.tests.connectivity.status === 'failed') {
    suggestions.push('❌ No se puede conectar - verifica que el backend esté corriendo');
    suggestions.push('🔧 Verifica que la IP en apiConfig.js sea correcta');
  }
  
  if (results.tests.headers.cors === 'No configurado') {
    suggestions.push('🔧 Configura CORS en el backend para permitir tu IP');
  }

  if (suggestions.length > 0) {
    console.log('💡 Sugerencias:');
    suggestions.forEach(suggestion => console.log(`   ${suggestion}`));
  }

  return results;
};

/**
 * Función para obtener la IP local automáticamente
 * (Solo funciona en algunos entornos)
 */
export const getLocalIP = async () => {
  try {
    // Intentar obtener IP local a través de una petición
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('No se pudo obtener IP automáticamente:', error);
    return null;
  }
};

export default {
  runNetworkDiagnostic,
  getLocalIP
};
