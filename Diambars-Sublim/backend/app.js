import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet'; 
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Importación de rutas
import authRoutes from "./src/routes/auth.routes.js";
import employeesRoutes from "./src/routes/employees.routes.js";
import registerEmployeesRoutes from "./src/routes/registerEmployees.routes.js";
import userRoutes from "./src/routes/users.routes.js";
import registerUsersRoutes from "./src/routes/registerUsers.routes.js";
import verifyEmailRoutes from "./src/routes/verifyEmail.routes.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import productRoutes from "./src/routes/product.routes.js"; // ✅ Ya está importado
import designRoutes from "./src/routes/design.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import addressRoutes from "./src/routes/address.routes.js";

import { debugEmailValidation } from "./src/middlewares/debugEmailValidaton.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración de CORS - DEBE IR ANTES de otros middlewares
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  exposedHeaders: ["set-cookie"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // ✅ Agregado PATCH
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-access-token']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware para logging - antes de procesar requests
app.use(morgan("dev"));

// Middleware para cookies - DEBE IR ANTES que las rutas que lo usan
app.use(cookieParser());

// Middleware para debugging de multipart/form-data
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    console.log('🔧 Multipart request detected:', {
      method: req.method,
      url: req.url,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      hasAuthHeader: !!req.headers.authorization,
      hasCookie: !!req.cookies.authToken,
      hasXAccessToken: !!req.headers['x-access-token']
    });
  }
  next();
});

// IMPORTANTE: Solo aplicar express.json() a rutas que NO manejan archivos
// Rutas que solo manejan JSON
app.use('/api/auth', express.json());
app.use('/api/employees/register', express.json());
app.use('/api/users/register', express.json());
app.use('/api/verify-email', express.json());
app.use('/api/password-recovery', express.json());
app.use('/api/addresses', express.json());

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"]
    }
  }
}));

// Middlewares para archivos estáticos
app.use("/public", express.static(path.join(__dirname, "public")));

// Crear directorios necesarios
const dirs = [
  path.join(__dirname, "public/uploads"),
  path.join(__dirname, "public/uploads/products"),
  path.join(__dirname, "public/uploads/designs"),
  path.join(__dirname, "public/uploads/categories")
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/employees/register", debugEmailValidation, registerEmployeesRoutes);
app.use("/api/users/register", debugEmailValidation, registerUsersRoutes);
app.use("/api/verify-email", verifyEmailRoutes);
app.use("/api/password-recovery", passwordRecoveryRoutes);
app.use("/api/addresses", addressRoutes);

// Rutas que pueden manejar tanto JSON como archivos
// Aplicar express.json() condicionalmente
app.use('/api/employees', (req, res, next) => {
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    express.json()(req, res, next);
  } else {
    next();
  }
}, employeesRoutes);

app.use('/api/users', (req, res, next) => {
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    express.json()(req, res, next);
  } else {
    next();
  }
}, userRoutes);

app.use('/api/orders', (req, res, next) => {
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    express.json()(req, res, next);
  } else {
    next();
  }
}, orderRoutes);

// Rutas que SÍ manejan archivos - SIN express.json()
app.use("/api/categories", categoryRoutes);

// ✅ PRODUCTOS - Configuración especial para manejar tanto GET como POST/PUT con archivos
app.use("/api/products", (req, res, next) => {
  // Para rutas que no manejan archivos (GET, DELETE, PATCH stats), aplicar JSON
  const isFileUploadRoute = (req.method === 'POST' || req.method === 'PUT') && 
                           req.headers['content-type']?.includes('multipart/form-data');
  
  if (!isFileUploadRoute) {
    express.json()(req, res, next);
  } else {
    next();
  }
}, productRoutes);

app.use("/api/designs", designRoutes);

// ✅ Ruta de salud mejorada
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Diambars Sublim funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      designs: '/api/designs',
      orders: '/api/orders',
      addresses: '/api/addresses'
    }
  });
});

// Ruta de prueba legacy
app.get("/ping", (req, res) => res.send("pong"));

// Middleware para manejar errores de Multer específicamente
app.use((err, req, res, next) => {
  console.error('🚨 Error capturado:', {
    name: err.name,
    message: err.message,
    code: err.code,
    type: typeof err,
    url: req.url,
    method: req.method
  });

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
      message: 'Demasiados archivos. Máximo 1 imagen principal y 5 adicionales.',
      error: 'TOO_MANY_FILES'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Campo de archivo inesperado. Use "mainImage" y "additionalImages".',
      error: 'UNEXPECTED_FILE_FIELD'
    });
  }
  
  if (err.message?.includes('Boundary not found')) {
    return res.status(400).json({
      success: false,
      message: 'Error en el formato multipart/form-data. No establezca Content-Type manualmente.',
      error: 'INVALID_MULTIPART',
      debug: {
        receivedContentType: req.headers['content-type'],
        hasAuthToken: !!req.headers.authorization || !!req.cookies.authToken
      }
    });
  }

  if (err.message?.includes('Solo se permiten imágenes')) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: 'INVALID_FILE_TYPE'
    });
  }

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación de datos',
      error: 'VALIDATION_ERROR',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Errores de cast de MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido proporcionado',
      error: 'INVALID_ID'
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

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} no encontrado`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/products',
      'POST /api/products (con archivos)',
      'GET /api/products/:id',
      'PUT /api/products/:id (con archivos)',
      'DELETE /api/products/:id',
      'GET /api/products/search',
      'POST /api/products/dev/create-samples (desarrollo)'
    ]
  });
});

export default app;