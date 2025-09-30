import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet'; 
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

// Importación de rutas
import authRoutes from "./src/routes/auth.routes.js";
import employeesRoutes from "./src/routes/employees.routes.js";
import registerEmployeesRoutes from "./src/routes/registerEmployees.routes.js";
import userRoutes from "./src/routes/users.routes.js";
import registerUsersRoutes from "./src/routes/registerUsers.routes.js";
import verifyEmailRoutes from "./src/routes/verifyEmail.routes.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import designRoutes from "./src/routes/design.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import addressRoutes from "./src/routes/address.routes.js";
import reviewsRoutes from "./src/routes/reviews.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import paymentConfigRoutes from "./src/routes/paymentConfig.routes.js";
import contactRoutes from "./src/routes/contact.routes.js";
import qualityApprovalRoutes from "./src/routes/quality-approval.routes.js";

// Importación de utilidades centralizadas
import { getLocationData, DELIVERY_CONFIG } from "./src/utils/locationUtils.js";
import { paymentProcessor } from "./src/services/payment/PaymentProcessor.js";
import Review from './src/models/reviews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ==================== CONFIGURACIÓN DE CORS ====================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",  // React dev privado
      "http://localhost:5174",  // React dev publico
      "http://192.168.1.5:5173",  // React dev privado (IP local)
      "http://192.168.1.5:5174",  // React dev publico (IP local)
      "https://diambars-sublim.vercel.app", // Vercel publica
      "https://diambars-panel-administrativo.vercel.app", // Vercel Panel administrativo
      process.env.FRONTEND_URL,
      process.env.MOBILE_URL
    ].filter(Boolean);
    
    // Permitir requests sin origin (ej: Postman, apps móviles)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ["set-cookie", "x-total-count"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-access-token']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ==================== RATE LIMITING ====================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10000, // límite de requests
  message: 'Demasiadas solicitudes desde esta IP, intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== MIDDLEWARES GENERALES ====================
app.use(morgan("dev"));
app.use(cookieParser());
app.use(limiter); // Aplicar rate limit general

// Middleware para debugging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`, {
      body: Object.keys(req.body || {}).length > 0 ? '✅ Body present' : '❌ No body',
      query: Object.keys(req.query || {}).length > 0 ? req.query : '❌ No query',
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': !!req.headers.authorization,
        'x-access-token': !!req.headers['x-access-token']
      },
      cookies: Object.keys(req.cookies || {}).length
    });
    next();
  });
}

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.cloudinary.com", "https://wompi.co", "https://sandbox.wompi.co"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.wompi.co"],
      frameSrc: ["'self'", "https://checkout.wompi.co"]
    }
  }
}));

// Archivos estáticos
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Crear directorios necesarios
const dirs = [
  "public/uploads",
  "public/uploads/products",
  "public/uploads/designs", 
  "public/uploads/categories",
  "public/uploads/orders",
  "public/uploads/temp",
  "uploads" // Carpeta para fotos de producción
].map(dir => path.join(__dirname, dir));

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Directorio creado: ${dir}`);
  }
});

// ==================== MIDDLEWARE PARA MANEJO DE JSON/MULTIPART ====================
const jsonMiddleware = express.json({ limit: '10mb' });
const urlencodedMiddleware = express.urlencoded({ extended: true, limit: '10mb' });

// Función helper para aplicar middleware condicional
const conditionalJsonMiddleware = (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    next();
  } else {
    jsonMiddleware(req, res, () => {
      urlencodedMiddleware(req, res, next);
    });
  }
};

// ==================== RUTAS DE LA API ====================

// Health check con información de configuración
app.get("/api/health", async (req, res) => {
  try {
    const wompiProvider = paymentProcessor.getProvider('wompi');
    const wompiConfig = wompiProvider.getPublicConfig();
    
    res.status(200).json({
      success: true,
      message: 'API Diambars Sublim funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0',
      wompi: {
        configured: wompiConfig.isConfigured,
        mode: wompiConfig.isConfigured ? 'real' : 'fictitious'
      },
      endpoints: {
        Reviews: "/api/reviews",
        auth: '/api/auth',
        users: '/api/users',
        employees: '/api/employees',
        products: '/api/products',
        categories: '/api/categories',
        designs: '/api/designs',
        orders: '/api/orders',
        addresses: '/api/addresses',
        payments: '/api/payments',
        contact: '/api/contact',
        config: '/api/config'
      }
    });
  } catch (error) {
    console.error('❌ Error en health check:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuración del sistema'
    });
  }
});

// ========== RUTAS DE AUTENTICACIÓN ==========
app.use("/api/auth", jsonMiddleware, authRoutes);

// ========== RUTAS DE REGISTRO ==========
app.use("/api/employees/register", jsonMiddleware, registerEmployeesRoutes);
app.use("/api/users/register", jsonMiddleware, registerUsersRoutes);

// ========== RUTAS DE VERIFICACIÓN Y RECUPERACIÓN ==========
app.use("/api/verify-email", jsonMiddleware, verifyEmailRoutes);
app.use("/api/password-recovery", jsonMiddleware, passwordRecoveryRoutes);

// ========== RUTA DE CONTACTO ==========
app.use("/api/contact", contactRoutes);

// ========== RUTAS DE DIRECCIONES ==========
app.use("/api/addresses", jsonMiddleware, addressRoutes);

// ========== RUTAS DE USUARIOS Y EMPLEADOS ==========
app.use('/api/employees', conditionalJsonMiddleware, employeesRoutes);
app.use('/api/users', conditionalJsonMiddleware, userRoutes);


// ========== RUTAS DE CONFIGURACIÓN DE MÉTODOS DE PAGO ==========
app.use("/api/payment-config", jsonMiddleware, paymentConfigRoutes);

// ========== RUTAS DE CATEGORÍAS ==========
app.use("/api/categories", conditionalJsonMiddleware, categoryRoutes);

// ========== RUTAS DE PRODUCTOS ==========
app.use("/api/products", conditionalJsonMiddleware, productRoutes);
app.use("/api/reviews", jsonMiddleware, reviewsRoutes);

// ========== RUTAS DE DISEÑOS ==========
app.use("/api/designs", jsonMiddleware, designRoutes);


// ========== RUTAS DE PRODUCCIÓN ==========
import productionRoutes from './src/routes/production.routes.js';
app.use("/api/production", jsonMiddleware, productionRoutes);

// ========== RUTAS DE PEDIDOS ==========
// Webhook de Wompi sin autenticación y con raw body
app.post('/api/orders/webhook/wompi', 
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Convertir raw body a JSON para el controlador
    try {
      req.body = JSON.parse(req.body.toString());
      next();
    } catch (error) {
      console.error('❌ Error parseando webhook body:', error);
      res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON in webhook body' 
      });
    }
  },
  orderRoutes
);

// Resto de rutas de orders con middleware condicional
app.use("/api/orders", conditionalJsonMiddleware, orderRoutes);

// ========== RUTAS DE PAGOS (NUEVA ARQUITECTURA) ==========
app.use("/api/payments", jsonMiddleware, paymentRoutes);

// ========== RUTAS DE APROBACIÓN DE CALIDAD ==========
app.use("/api/quality-approval", jsonMiddleware, qualityApprovalRoutes);

// ==================== RUTAS DE CONFIGURACIÓN ====================

// Ruta para obtener configuración completa del sistema (para el frontend)
app.get("/api/config", async (req, res) => {
  try {
    const wompiProvider = paymentProcessor.getProvider('wompi');
    const wompiConfig = wompiProvider.getPublicConfig();
    
    const config = {
      // Configuración de Wompi
      wompi: wompiConfig,
      
      // Configuración de entrega
      delivery: {
        currency: DELIVERY_CONFIG.CURRENCY,
        freeDeliveryThreshold: DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD,
        defaultFee: DELIVERY_CONFIG.DEFAULT_FEE
      },
      
      // Configuración de ubicaciones
      locations: getLocationData(),
      
      // Configuración del sistema
      system: {
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0',
        supportEmail: 'soporte@diambars.com',
        maxFileSize: '5MB',
        allowedImageTypes: ['jpg', 'jpeg', 'png', 'webp'],
        features: {
          wompiPayments: wompiConfig.isConfigured,
          cashPayments: true,
          deliveryTracking: true,
          productionPhotos: true,
          designCloning: true
        }
      },
      
      // URLs importantes
      urls: {
        frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
        backend: process.env.BACKEND_URL || 'http://localhost:4000',
        support: 'mailto:soporte@diambars.com',
        terms: '/terms',
        privacy: '/privacy'
      }
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración del sistema'
    });
  }
});

// Ruta específica para configuración de Wompi (legacy)
app.get("/api/config/wompi", async (req, res) => {
  try {
    const wompiProvider = paymentProcessor.getProvider('wompi');
    const wompiConfig = wompiProvider.getPublicConfig();
    
    res.json({
      success: true,
      data: wompiConfig
    });
  } catch (error) {
    console.error('❌ Error obteniendo configuración de Wompi:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuración de Wompi'
    });
  }
});

// Ruta optimizada para obtener departamentos y municipios de El Salvador
app.get("/api/config/locations", (req, res) => {
  try {
    const locationData = getLocationData();
    res.json({
      success: true,
      data: locationData
    });
  } catch (error) {
    console.error('❌ Error al obtener ubicaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de ubicaciones'
    });
  }
});

// Ruta alternativa para compatibilidad con el frontend
app.get("/api/locations/data", (req, res) => {
  try {
    const locationData = getLocationData();
    res.json({
      success: true,
      data: locationData
    });
  } catch (error) {
    console.error('❌ Error al obtener ubicaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de ubicaciones'
    });
  }
});


// Endpoint para verificar estado del servicio Wompi
app.get("/api/config/payment-status", async (req, res) => {
  try {
    const wompiProvider = paymentProcessor.getProvider('wompi');
    const wompiConfig = wompiProvider.getPublicConfig();
    
    res.json({
      success: true,
      data: {
        wompi: {
          configured: wompiConfig.isConfigured,
          environment: wompiConfig.environment,
          mode: wompiConfig.isConfigured ? 'real' : 'fictitious',
          message: wompiConfig.isConfigured 
            ? 'Wompi configurado correctamente'
            : 'Wompi en modo ficticio - configurar credenciales para usar pagos reales'
        },
        cash: {
          enabled: true,
          message: 'Pagos en efectivo siempre disponibles'
        },
        bankTransfer: {
          enabled: true,
          message: 'Transferencias bancarias disponibles'
        }
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo estado de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado de pagos'
    });
  }
});

// ==================== MANEJO DE ERRORES ====================

// Error 404 para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} no encontrado`,
    error: 'ENDPOINT_NOT_FOUND',
    suggestion: 'Verifica la ruta o consulta /api/health para ver endpoints disponibles'
  });
});

// Manejador de errores de Multer
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande. Máximo 5MB permitido.',
      error: 'FILE_TOO_LARGE'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Demasiados archivos.',
      error: 'TOO_MANY_FILES'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Campo de archivo inesperado.',
      error: 'UNEXPECTED_FILE_FIELD'
    });
  }
  
  if (err.message?.includes('Solo se permiten imágenes')) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: 'INVALID_FILE_TYPE'
    });
  }

  // Errores de CORS
  if (err.message?.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Origen no permitido por CORS',
      error: 'CORS_ERROR'
    });
  }

  next(err);
});

// Manejador de errores de validación de Mongoose
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      error: 'VALIDATION_ERROR',
      errors
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      error: 'INVALID_ID'
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `El ${field} ya está en uso`,
      error: 'DUPLICATE_KEY',
      field
    });
  }
  
  next(err);
});

// Middleware para manejar errores generales
app.use((err, req, res, next) => {
  console.error('🚨 Error general:', err.stack);
  res.status(500).json({
    success: false,
    message: "Ha ocurrido un error en el servidor",
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : 'Error interno del servidor'
  });
});

export default app;