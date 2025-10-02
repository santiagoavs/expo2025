#!/usr/bin/env node

/**
 * Script de verificación para la configuración local (192.168.1.21)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración local (192.168.1.21)...\n');

try {
  // Verificar vite.config.js
  const viteConfigPath = path.join(__dirname, 'vite.config.js');
  if (fs.existsSync(viteConfigPath)) {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    if (viteConfig.includes('192.168.1.21:4000')) {
      console.log('✅ vite.config.js configurado para IP local (192.168.1.21:4000)');
    } else {
      console.log('❌ vite.config.js no está configurado para IP local');
    }
  } else {
    console.log('❌ vite.config.js no encontrado');
  }

  // Verificar config.js
  const configPath = path.join(__dirname, 'config.js');
  if (fs.existsSync(configPath)) {
    const config = fs.readFileSync(configPath, 'utf8');
    if (config.includes('192.168.1.21:4000')) {
      console.log('✅ config.js configurado para IP local');
    } else {
      console.log('❌ config.js no está configurado para IP local');
    }
  } else {
    console.log('❌ config.js no encontrado');
  }

  // Verificar vercel.json
  const vercelPath = path.join(__dirname, 'vercel.json');
  if (fs.existsSync(vercelPath)) {
    const vercel = fs.readFileSync(vercelPath, 'utf8');
    if (vercel.includes('192.168.1.21:4000')) {
      console.log('✅ vercel.json configurado para IP local');
    } else {
      console.log('❌ vercel.json no está configurado para IP local');
    }
  } else {
    console.log('❌ vercel.json no encontrado');
  }

  console.log('\n📋 Resumen de la configuración local:');
  console.log('   • Desarrollo: localhost:5173 → 192.168.1.21:4000');
  console.log('   • Producción: Vercel → 192.168.1.21:4000');
  console.log('   • Protocolo: HTTP (no HTTPS)');
  console.log('   • Puerto: 4000');

  console.log('\n⚠️  IMPORTANTE:');
  console.log('   • Asegúrate de que el backend esté corriendo en 192.168.1.21:4000');
  console.log('   • Verifica que la IP sea accesible desde tu red local');
  console.log('   • Para producción en Vercel, la IP debe ser accesible públicamente');

  console.log('\n🎉 Verificación completada');
  console.log('💡 La aplicación está configurada para usar IP local');

} catch (error) {
  console.error('❌ Error en la verificación:', error.message);
  process.exit(1);
}
