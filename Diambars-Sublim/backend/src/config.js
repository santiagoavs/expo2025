import dotenv from "dotenv";
dotenv.config();

export const config = {
  db: {
    URI: process.env.DB_URI,
  },
  server: {
    PORT: process.env.PORT,
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
    expiresIn: process.env.JWT_EXPIRES,
  },
  cloudinary: {
    cloudinary_name: process.env.CLOUDINARY_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  // Configuración Wompi con valores por defecto seguros
  wompi: {
    env: process.env.WOMPI_ENV || 'sandbox',
    baseUrl: process.env.WOMPI_ENV === 'production' 
      ? 'https://production.wompi.co/v1'
      : 'https://sandbox.wompi.co/v1',
    publicKey: process.env.WOMPI_PUBLIC_KEY || null,
    privateKey: process.env.WOMPI_PRIVATE_KEY || null,
    integritySecret: process.env.WOMPI_INTEGRITY_SECRET || null,
    webhookSecret: process.env.WOMPI_WEBHOOK_SECRET || null,
    currency: 'USD',
    country: 'SV',
    // URLs dinámicas basadas en el entorno
    urls: {
      success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/payment-success`,
      failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/payment-failed`, 
      pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/payment-pending`,
      webhook: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/orders/webhook/wompi`
    },
    // Configuración para El Salvador
    settings: {
      defaultTimeout: 60, // minutos
      maxRetries: 3,
      supportedCards: ['visa', 'mastercard', 'amex'],
      locale: 'es_SV'
    }
  }
};

// Función para validar configuración crítica de Wompi
export const validateWompiConfig = () => {
  const requiredFields = [
    'WOMPI_PUBLIC_KEY',
    'WOMPI_PRIVATE_KEY', 
    'WOMPI_INTEGRITY_SECRET',
    'WOMPI_WEBHOOK_SECRET'
  ];
  
  const missing = requiredFields.filter(field => {
    const value = process.env[field];
    return !value || value === 'pub_sandbox_placeholder' || value === 'prv_sandbox_placeholder' || 
           value === 'integrity_placeholder' || value === 'webhook_placeholder';
  });
  
  if (missing.length > 0) {
    console.warn('⚠️ Configuración de Wompi incompleta. Faltan:', missing.join(', '));
    console.warn('💡 La funcionalidad de pagos estará limitada hasta completar la configuración');
    return false;
  }
  
  console.log('✅ Configuración de Wompi válida');
  console.log(`🌍 Entorno: ${config.wompi.env}`);
  console.log(`🔗 Webhook URL: ${config.wompi.urls.webhook}`);
  
  return true;
};

export default config;