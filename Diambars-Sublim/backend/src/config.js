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
  // Configuración Wompi con detección automática y modo híbrido
  wompi: {
    env: process.env.WOMPI_ENV || 'sandbox',
    baseUrl: process.env.WOMPI_ENV === 'production' 
      ? 'https://production.wompi.co/v1'
      : 'https://sandbox.wompi.co/v1',
    
    // Claves con validación de placeholders
    publicKey: process.env.WOMPI_PUBLIC_KEY && 
               process.env.WOMPI_PUBLIC_KEY !== 'pub_sandbox_placeholder' 
               ? process.env.WOMPI_PUBLIC_KEY : null,
               
    privateKey: process.env.WOMPI_PRIVATE_KEY && 
                process.env.WOMPI_PRIVATE_KEY !== 'prv_sandbox_placeholder' 
                ? process.env.WOMPI_PRIVATE_KEY : null,
                
    integritySecret: process.env.WOMPI_INTEGRITY_SECRET && 
                     process.env.WOMPI_INTEGRITY_SECRET !== 'integrity_placeholder' 
                     ? process.env.WOMPI_INTEGRITY_SECRET : null,
                     
    webhookSecret: process.env.WOMPI_WEBHOOK_SECRET && 
                   process.env.WOMPI_WEBHOOK_SECRET !== 'webhook_placeholder' 
                   ? process.env.WOMPI_WEBHOOK_SECRET : null,
    
    currency: 'USD',
    country: 'SV',
    
    // URLs dinámicas basadas en el entorno
    urls: {
      success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/payment-success`,
      failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/payment-failed`, 
      pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/payment-pending`,
      webhook: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/orders/webhook/wompi`
    },
    
    // Configuración específica para El Salvador
    settings: {
      defaultTimeout: 60, // minutos
      maxRetries: 3,
      supportedCards: ['visa', 'mastercard', 'amex'],
      locale: 'es_SV',
      minAmount: 1.00, // USD mínimo
      maxAmount: 10000.00 // USD máximo
    }
  }
};

/**
 * Función para validar si Wompi está completamente configurado
 */
export const isWompiFullyConfigured = () => {
  const wompiConfig = config.wompi;
  
  // Verificar que todas las claves estén presentes y no sean placeholders
  const hasAllKeys = !!(
    wompiConfig.publicKey &&
    wompiConfig.privateKey &&
    wompiConfig.integritySecret &&
    wompiConfig.webhookSecret
  );
  
  if (!hasAllKeys) {
    return {
      configured: false,
      missing: [
        !wompiConfig.publicKey && 'WOMPI_PUBLIC_KEY',
        !wompiConfig.privateKey && 'WOMPI_PRIVATE_KEY',
        !wompiConfig.integritySecret && 'WOMPI_INTEGRITY_SECRET',
        !wompiConfig.webhookSecret && 'WOMPI_WEBHOOK_SECRET'
      ].filter(Boolean),
      mode: 'fictitious'
    };
  }
  
  return {
    configured: true,
    missing: [],
    mode: 'real'
  };
};

/**
 * Función para validar configuración crítica del sistema al inicio
 */
export const validateSystemConfig = () => {
  console.log('🔧 Validando configuración del sistema...');
  
  const errors = [];
  const warnings = [];
  
  // Validar configuración de base de datos
  if (!config.db.URI) {
    errors.push('DB_URI es requerida');
  }
  
  // Validar configuración JWT
  if (!config.JWT.secret) {
    errors.push('JWT_SECRET es requerido');
  }
  
  // Validar configuración de email
  if (!config.email.user || !config.email.pass) {
    warnings.push('Configuración de email incompleta - las notificaciones por email no funcionarán');
  }
  
  // Validar configuración de Cloudinary
  if (!config.cloudinary.cloudinary_name || !config.cloudinary.cloudinary_api_key || !config.cloudinary.cloudinary_api_secret) {
    errors.push('Configuración de Cloudinary incompleta - la subida de imágenes no funcionará');
  }
  
  // Validar configuración de Wompi
  const wompiStatus = isWompiFullyConfigured();
  if (!wompiStatus.configured) {
    warnings.push(`Configuración de Wompi incompleta (${wompiStatus.missing.join(', ')}) - funcionará en modo ficticio`);
    console.log('⚠️ Wompi en modo FICTICIO:', {
      missing: wompiStatus.missing,
      message: 'Los pagos virtuales serán simulados'
    });
  } else {
    console.log('✅ Wompi configurado correctamente:', {
      environment: config.wompi.env,
      mode: wompiStatus.mode
    });
  }
  
  // Mostrar errores críticos
  if (errors.length > 0) {
    console.error('❌ ERRORES CRÍTICOS EN CONFIGURACIÓN:');
    errors.forEach(error => console.error(`   - ${error}`));
    console.error('🚫 La aplicación no puede iniciarse con estos errores');
    process.exit(1);
  }
  
  // Mostrar advertencias
  if (warnings.length > 0) {
    console.warn('⚠️ ADVERTENCIAS DE CONFIGURACIÓN:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  console.log('✅ Configuración del sistema validada');
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    wompi: wompiStatus
  };
};

/**
 * Obtener configuración pública para el frontend
 */
export const getPublicConfig = () => {
  const wompiStatus = isWompiFullyConfigured();
  
  return {
    system: {
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0'
    },
    wompi: {
      configured: wompiStatus.configured,
      mode: wompiStatus.mode,
      environment: config.wompi.env,
      publicKey: wompiStatus.configured ? config.wompi.publicKey : null,
      currency: config.wompi.currency,
      country: config.wompi.country,
      supportedCards: config.wompi.settings.supportedCards,
      minAmount: config.wompi.settings.minAmount,
      maxAmount: config.wompi.settings.maxAmount
    },
    urls: {
      frontend: config.server.FRONTEND_URL,
      backend: config.server.BACKEND_URL
    }
  };
};

/**
 * Configuración específica para desarrollo
 */
export const getDevConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return {
    allowSimulatedPayments: true,
    bypassEmailVerification: false,
    debugMode: true,
    mockExternalServices: !isWompiFullyConfigured().configured,
    testDataEnabled: true
  };
};

// Validar configuración al importar (solo en producción)
if (process.env.NODE_ENV === 'production') {
  validateSystemConfig();
} else {
  // En desarrollo, solo mostrar estado de Wompi
  const wompiStatus = isWompiFullyConfigured();
  console.log('🔧 Modo desarrollo:', {
    wompi: wompiStatus.configured ? 'REAL' : 'FICTICIO',
    message: wompiStatus.configured 
      ? 'Wompi configurado - pagos reales activos'
      : 'Wompi no configurado - usando simulaciones'
  });
}

export default config;