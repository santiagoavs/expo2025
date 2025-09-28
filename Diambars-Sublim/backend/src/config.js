// src/config.js - Configuración simplificada
import dotenv from "dotenv";
dotenv.config();

export const config = {
  db: {
    URI: process.env.DB_URI,
  },
  server: {
    PORT: process.env.PORT || 4000,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
    BACKEND_URL: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`
  },
  superadmin: {
    EMAIL: process.env.SUPERADMIN_EMAIL,
    PASSWORD: process.env.SUPERADMIN_PASSWORD,
  },
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || `Diambars <${process.env.EMAIL_USER}>`
  },
  JWT: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES || "30d",
  },
  cloudinary: {
    cloudinary_name: process.env.CLOUDINARY_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  // ✅ CONFIGURACIÓN TWILIO PARA WHATSAPP
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
    isEnabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  },
  // ✅ CONFIGURACIÓN WOMPI SIMPLIFICADA
  wompi: {
    // Determinar si está habilitado basado en presencia de claves
    isEnabled: !!(process.env.WOMPI_PUBLIC_KEY && process.env.WOMPI_PRIVATE_KEY),
    
    // Claves directas (sin validación de placeholders complejos)
    publicKey: process.env.WOMPI_PUBLIC_KEY || null,
    privateKey: process.env.WOMPI_PRIVATE_KEY || null,
    webhookSecret: process.env.WOMPI_WEBHOOK_SECRET || null,
    
    // Entorno basado en NODE_ENV
    env: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://production.wompi.co/v1'
      : 'https://sandbox.wompi.co/v1',
    
    // Configuración básica
    currency: 'USD',
    country: 'SV',
    
    // URLs dinámicas
    urls: {
      success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/payment-success`,
      failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/payment-failed`,
      webhook: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/payments/webhook/wompi`
    }
  }
};

/**
 * Validar configuración crítica al inicio
 */
export const validateConfig = () => {
  console.log('🔧 Validando configuración...');
  
  const errors = [];
  const warnings = [];
  
  // Validaciones críticas
  if (!config.db.URI) errors.push('DB_URI es requerida');
  if (!config.JWT.secret) errors.push('JWT_SECRET es requerido');
  if (!config.cloudinary.cloudinary_name) errors.push('Configuración de Cloudinary incompleta');
  
  // Validaciones de advertencia
  if (!config.email.user) warnings.push('Email no configurado');
  if (!config.wompi.isEnabled) warnings.push('Wompi no configurado - solo pagos en efectivo');
  
  // Mostrar resultados
  if (errors.length > 0) {
    console.error('❌ ERRORES CRÍTICOS:');
    errors.forEach(error => console.error(`   - ${error}`));
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ ADVERTENCIAS:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  console.log('✅ Configuración validada');
  console.log(`🔧 Wompi: ${config.wompi.isEnabled ? 'HABILITADO' : 'DESHABILITADO'}`);
  
  return { valid: true, errors, warnings };
};

/**
 * Obtener configuración pública (sin secretos)
 */
export const getPublicConfig = () => {
  return {
    wompi: {
      enabled: config.wompi.isEnabled,
      publicKey: config.wompi.isEnabled ? config.wompi.publicKey : null,
      environment: config.wompi.env,
      currency: config.wompi.currency,
      country: config.wompi.country
    },
    system: {
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0'
    },
    urls: {
      frontend: config.server.FRONTEND_URL,
      backend: config.server.BACKEND_URL
    }
  };
};

// Validar configuración al importar en producción
if (process.env.NODE_ENV === 'production') {
  validateConfig();
} else {
  // En desarrollo, solo mostrar estado
  console.log(`🔧 Modo desarrollo: Wompi ${config.wompi.isEnabled ? 'REAL' : 'SIMULADO'}`);
}

export default config;