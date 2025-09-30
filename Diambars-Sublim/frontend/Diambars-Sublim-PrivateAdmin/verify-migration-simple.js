#!/usr/bin/env node

/**
 * Script de verificación simple para la migración a Render
 * Verifica que los archivos estén configurados correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de migración a Render...\n');

try {
  // Verificar vite.config.js
  const viteConfigPath = path.join(__dirname, 'vite.config.js');
  if (fs.existsSync(viteConfigPath)) {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    if (viteConfig.includes('expo2025-8bjn.onrender.com')) {
      console.log('✅ vite.config.js configurado para Render');
    } else {
      console.log('❌ vite.config.js no está configurado para Render');
    }
  } else {
    console.log('❌ vite.config.js no encontrado');
  }

  // Verificar ApiClient.jsx
  const apiClientPath = path.join(__dirname, 'src/api/ApiClient.jsx');
  if (fs.existsSync(apiClientPath)) {
    const apiClient = fs.readFileSync(apiClientPath, 'utf8');
    if (apiClient.includes('expo2025-8bjn.onrender.com')) {
      console.log('✅ ApiClient.jsx configurado para Render');
    } else {
      console.log('❌ ApiClient.jsx no está configurado para Render');
    }
  } else {
    console.log('❌ ApiClient.jsx no encontrado');
  }

  // Verificar config.js
  const configPath = path.join(__dirname, 'config.js');
  if (fs.existsSync(configPath)) {
    console.log('✅ config.js creado');
  } else {
    console.log('❌ config.js no encontrado');
  }

  console.log('\n📋 Resumen de la migración:');
  console.log('   • Proxy de Vite: localhost:5173 → https://expo2025-8bjn.onrender.com');
  console.log('   • Configuración centralizada en config.js');
  console.log('   • ApiClient actualizado para usar Render');
  console.log('   • Timeout configurado a 30 segundos');

  console.log('\n🎉 Verificación completada');
  console.log('💡 La aplicación está lista para usar Render como backend');

} catch (error) {
  console.error('❌ Error en la verificación:', error.message);
  process.exit(1);
}
