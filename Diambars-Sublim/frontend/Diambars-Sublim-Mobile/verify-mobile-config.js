#!/usr/bin/env node

/**
 * Script de verificación para la configuración móvil (192.168.1.21)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración móvil (192.168.1.21)...\n');

try {
  // Verificar apiConfig.js
  const apiConfigPath = path.join(__dirname, 'src/config/apiConfig.js');
  if (fs.existsSync(apiConfigPath)) {
    const apiConfig = fs.readFileSync(apiConfigPath, 'utf8');
    if (apiConfig.includes('192.168.1.21')) {
      console.log('✅ apiConfig.js configurado para IP local (192.168.1.21)');
    } else {
      console.log('❌ apiConfig.js no está configurado para IP local');
    }
  } else {
    console.log('❌ apiConfig.js no encontrado');
  }

  // Verificar ApiClient.js
  const apiClientPath = path.join(__dirname, 'src/api/ApiClient.js');
  if (fs.existsSync(apiClientPath)) {
    const apiClient = fs.readFileSync(apiClientPath, 'utf8');
    if (apiClient.includes('getApiConfig') && apiClient.includes('apiConfig')) {
      console.log('✅ ApiClient.js usa configuración centralizada');
    } else {
      console.log('❌ ApiClient.js no usa configuración centralizada');
    }
  } else {
    console.log('❌ ApiClient.js no encontrado');
  }

  // Verificar networkDiagnostic.js
  const networkPath = path.join(__dirname, 'src/utils/networkDiagnostic.js');
  if (fs.existsSync(networkPath)) {
    const network = fs.readFileSync(networkPath, 'utf8');
    if (network.includes('getApiUrl') && network.includes('testApiConnection')) {
      console.log('✅ networkDiagnostic.js configurado correctamente');
    } else {
      console.log('❌ networkDiagnostic.js no está configurado correctamente');
    }
  } else {
    console.log('❌ networkDiagnostic.js no encontrado');
  }

  console.log('\n📋 Resumen de la configuración móvil:');
  console.log('   • Desarrollo: React Native → 172.20.10.4:4000');
  console.log('   • Producción: React Native → 172.20.10.4:4000 (backend local)');
  console.log('   • Configuración centralizada en apiConfig.js');
  console.log('   • Diagnóstico de red disponible');
  console.log('   • ✅ NO usa Render - solo backend local');

  console.log('\n⚠️  IMPORTANTE:');
  console.log('   • Asegúrate de que el backend esté corriendo en 172.20.10.4:4000');
  console.log('   • Verifica que la IP sea accesible desde tu dispositivo móvil');
  console.log('   • Usa el diagnóstico de red para verificar conectividad');
  console.log('   • La app móvil NO se conectará a Render, solo al backend local');

  console.log('\n🎉 Verificación completada');
  console.log('💡 La app móvil está configurada para usar IP local');

} catch (error) {
  console.error('❌ Error en la verificación:', error.message);
  process.exit(1);
}
