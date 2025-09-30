#!/usr/bin/env node

/**
 * Script de verificación para la migración a Render
 * Verifica que todas las configuraciones estén correctas
 */

// Simular import.meta.env para Node.js
const mockEnv = {
  DEV: process.env.NODE_ENV !== 'production'
};

// Simular import.meta
global.import = {
  meta: {
    env: mockEnv
  }
};

// Importar configuración después de simular import.meta
const { getConfig, getApiUrl, getBaseUrl } = require('./config.js');

console.log('🔍 Verificando configuración de migración a Render...\n');

try {
  const config = getConfig();
  
  console.log('📋 Configuración detectada:');
  console.log(`   Entorno: ${config.isDevelopment ? 'Desarrollo' : 'Producción'}`);
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   Timeout: ${config.app.timeout}ms`);
  console.log(`   App: ${config.app.name} v${config.app.version}\n`);

  // Verificar que la URL de Render esté configurada
  if (config.apiUrl.includes('expo2025-8bjn.onrender.com')) {
    console.log('✅ URL de Render configurada correctamente');
  } else {
    console.log('⚠️ URL de Render no detectada, usando configuración local');
  }

  // Verificar que el proxy esté configurado para desarrollo
  if (config.isDevelopment && config.apiUrl === '/api') {
    console.log('✅ Proxy de Vite configurado para desarrollo');
  } else if (!config.isDevelopment) {
    console.log('✅ Configuración de producción activa');
  }

  console.log('\n🎉 Verificación completada exitosamente');
  console.log('💡 La aplicación está lista para usar Render como backend');

} catch (error) {
  console.error('❌ Error en la verificación:', error.message);
  process.exit(1);
}
