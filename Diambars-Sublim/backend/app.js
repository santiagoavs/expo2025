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

// Importación de utilidades centralizadas
import { getLocationData, DELIVERY_CONFIG } from "./src/utils/locationUtils.js";
import { debugEmailValidation } from "./src/middlewares/debugEmailValidaton.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ==================== CONFIGURACIÓN DE CORS ====================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",  // React dev
      "http://localhost:5174",  // React dev publico
      "http://localhost:3000",  // React Native dev
      "http://localhost:19000", // Expo
      "http://localhost:19001", // Expo
      "http://localhost:19002", // Expo
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
  max: 100, // límite de requests
  message: 'Demasiadas solicitudes desde esta IP, intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit más estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de autenticación, intente más tarde',
  skipSuccessfulRequests: true
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
      connectSrc: ["'self'", "https://api.cloudinary.com", "https://wompi.co"],
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
  "public/uploads/temp"
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

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Diambars Sublim funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      employees: '/api/employees',
      products: '/api/products',
      categories: '/api/categories',
      designs: '/api/designs',
      orders: '/api/orders',
      addresses: '/api/addresses'
    }
  });
});

// ========== RUTAS DE AUTENTICACIÓN ==========
app.use("/api/auth", authLimiter, jsonMiddleware, authRoutes);

// ========== RUTAS DE REGISTRO ==========
app.use("/api/employees/register", jsonMiddleware, debugEmailValidation, registerEmployeesRoutes);
app.use("/api/users/register", jsonMiddleware, debugEmailValidation, registerUsersRoutes);

// ========== RUTAS DE VERIFICACIÓN Y RECUPERACIÓN ==========
app.use("/api/verify-email", jsonMiddleware, verifyEmailRoutes);
app.use("/api/password-recovery", authLimiter, jsonMiddleware, passwordRecoveryRoutes);

// ========== RUTAS DE DIRECCIONES ==========
app.use("/api/addresses", jsonMiddleware, addressRoutes);

// ========== RUTAS DE USUARIOS Y EMPLEADOS ==========
app.use('/api/employees', conditionalJsonMiddleware, employeesRoutes);
app.use('/api/users', conditionalJsonMiddleware, userRoutes);

// ========== RUTAS DE CATEGORÍAS ==========
app.use("/api/categories", conditionalJsonMiddleware, categoryRoutes);

// ========== RUTAS DE PRODUCTOS ==========
app.use("/api/products", conditionalJsonMiddleware, productRoutes);

// ========== RUTAS DE DISEÑOS ==========
app.use("/api/designs", jsonMiddleware, designRoutes);

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

// ==================== RUTAS DE CONFIGURACIÓN ====================

// Ruta para obtener configuración de Wompi (para el frontend)
app.get("/api/config/wompi", (req, res) => {
  res.json({
    publicKey: process.env.WOMPI_PUBLIC_KEY,
    currency: DELIVERY_CONFIG.CURRENCY,
    country: 'SV',
    testMode: process.env.WOMPI_ENV !== 'production'
  });
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

// Ruta para servir imágenes con marca de agua on-the-fly
app.get("/api/images/watermark/:path", (req, res) => {
  // Implementar lógica de marca de agua si es necesario
  res.status(501).json({ 
    message: "Función de marca de agua pendiente de implementación" 
  });
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