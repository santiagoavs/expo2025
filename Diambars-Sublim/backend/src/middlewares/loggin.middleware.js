// src/middlewares/logging.middleware.js - Middleware para logging detallado

// ✅ IMPORTACIONES CORREGIDAS PARA ES6 MODULES
import fs from 'fs';
import cloudinary from '../utils/cloudinary.js';

/**
 * Middleware de logging mejorado para requests de productos
 */
export const productLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Agregar ID de request para tracking
  req.requestId = requestId;
  
  console.log(`🔄 [${requestId}] ${req.method} ${req.originalUrl} - Inicio`);
  
  // Log de headers importantes
  console.log(`📋 [${requestId}] Headers relevantes:`, {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'user-agent': req.headers['user-agent']?.substring(0, 50) + '...',
    authorization: !!req.headers.authorization ? 'Presente' : 'Ausente'
  });
  
  // Log de query params
  if (Object.keys(req.query).length > 0) {
    console.log(`🔍 [${requestId}] Query params:`, req.query);
  }
  
  // Log de body (solo campos no sensibles)
  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    // Ocultar campos sensibles
    if (safeBody.customizationAreas) {
      safeBody.customizationAreas = `[Array con ${JSON.parse(safeBody.customizationAreas || '[]').length} áreas]`;
    }
    if (safeBody.options) {
      safeBody.options = `[Array con ${JSON.parse(safeBody.options || '[]').length} opciones]`;
    }
    console.log(`📝 [${requestId}] Body (simplificado):`, safeBody);
  }
  
  // Log de archivos subidos
  if (req.files) {
    const fileInfo = {};
    Object.keys(req.files).forEach(fieldName => {
      const files = req.files[fieldName];
      if (Array.isArray(files)) {
        fileInfo[fieldName] = files.map(file => ({
          originalname: file.originalname,
          size: `${(file.size / 1024).toFixed(2)}KB`,
          mimetype: file.mimetype,
          path: file.path
        }));
      } else {
        fileInfo[fieldName] = {
          originalname: files.originalname,
          size: `${(files.size / 1024).toFixed(2)}KB`,
          mimetype: files.mimetype,
          path: files.path
        };
      }
    });
    console.log(`📎 [${requestId}] Archivos subidos:`, fileInfo);
  }
  
  // Interceptar respuesta para logging
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Respuesta enviada - ${res.statusCode} - ${duration}ms`);
    
    // Log de respuesta (solo en desarrollo y si es error)
    if (process.env.NODE_ENV === 'development' || res.statusCode >= 400) {
      try {
        const responseData = typeof data === 'string' ? JSON.parse(data) : data;
        if (responseData && typeof responseData === 'object') {
          console.log(`📤 [${requestId}] Respuesta:`, {
            success: responseData.success,
            message: responseData.message,
            error: responseData.error,
            dataKeys: responseData.data ? Object.keys(responseData.data) : 'No data'
          });
        }
      } catch (parseError) {
        console.log(`📤 [${requestId}] Respuesta (texto):`, typeof data === 'string' ? data.substring(0, 200) + '...' : '[Objeto complejo]');
      }
    }
    
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] JSON enviado - ${res.statusCode} - ${duration}ms`);
    
    if (process.env.NODE_ENV === 'development' || res.statusCode >= 400) {
      console.log(`📤 [${requestId}] JSON Response:`, {
        success: data?.success,
        message: data?.message,
        error: data?.error,
        dataKeys: data?.data ? Object.keys(data.data) : 'No data'
      });
    }
    
    return originalJson.call(this, data);
  };
  
  // Manejar errores no capturados
  res.on('error', (error) => {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error en respuesta - ${duration}ms:`, {
      message: error.message,
      stack: error.stack
    });
  });
  
  next();
};

/**
 * Middleware específico para operaciones de archivos
 */
export const fileOperationLogger = (req, res, next) => {
  if (!req.files) {
    return next();
  }
  
  const requestId = req.requestId || 'unknown';
  
  console.log(`📁 [${requestId}] Operación con archivos detectada`);
  
  // Validar archivos antes de procesamiento
  Object.keys(req.files).forEach(fieldName => {
    const files = Array.isArray(req.files[fieldName]) ? req.files[fieldName] : [req.files[fieldName]];
    
    files.forEach((file, index) => {
      console.log(`📄 [${requestId}] Archivo ${fieldName}[${index}]:`, {
        nombre: file.originalname,
        tamaño: `${(file.size / 1024).toFixed(2)}KB`,
        tipo: file.mimetype,
        ruta_temporal: file.path,
        // ✅ CORREGIDO: Usar import en lugar de require
        existe: fs.existsSync(file.path)
      });
      
      // Validaciones básicas
      if (!fs.existsSync(file.path)) {
        console.error(`❌ [${requestId}] Archivo temporal no existe: ${file.path}`);
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        console.warn(`⚠️ [${requestId}] Archivo muy grande: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        console.warn(`⚠️ [${requestId}] Tipo de archivo no permitido: ${file.mimetype}`);
      }
    });
  });
  
  next();
};

/**
 * Middleware para logging de operaciones de base de datos
 */
export const dbOperationLogger = (operation, model) => {
  return (req, res, next) => {
    const requestId = req.requestId || 'unknown';
    const startTime = Date.now();
    
    console.log(`🗄️ [${requestId}] Operación DB: ${operation} en ${model}`);
    
    // Hook para después de la operación
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - startTime;
      console.log(`🏁 [${requestId}] Operación DB completada en ${duration}ms`);
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

/**
 * Middleware para logging de operaciones de Cloudinary
 */
export const cloudinaryOperationLogger = (req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  // Interceptar las operaciones de Cloudinary agregando logs
  // ✅ CORREGIDO: Usar import en lugar de require
  const originalCloudinaryUpload = cloudinary.uploader.upload;
  const originalCloudinaryDestroy = cloudinary.uploader.destroy;
  
  // Solo hacerlo una vez por request
  if (!req.cloudinaryLogged) {
    req.cloudinaryLogged = true;
    
    cloudinary.uploader.upload = async function(filePath, options) {
      console.log(`☁️ [${requestId}] Subiendo a Cloudinary:`, {
        archivo: filePath,
        carpeta: options?.folder,
        transformaciones: options?.transformation ? 'Sí' : 'No'
      });
      
      const startTime = Date.now();
      try {
        const result = await originalCloudinaryUpload.call(this, filePath, options);
        const duration = Date.now() - startTime;
        
        console.log(`✅ [${requestId}] Cloudinary upload exitoso en ${duration}ms:`, {
          public_id: result.public_id,
          secure_url: result.secure_url.substring(0, 60) + '...',
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: `${(result.bytes / 1024).toFixed(2)}KB`
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [${requestId}] Cloudinary upload falló en ${duration}ms:`, {
          archivo: filePath,
          error: error.message
        });
        throw error;
      }
    };
    
    cloudinary.uploader.destroy = async function(publicId) {
      console.log(`🗑️ [${requestId}] Eliminando de Cloudinary: ${publicId}`);
      
      const startTime = Date.now();
      try {
        const result = await originalCloudinaryDestroy.call(this, publicId);
        const duration = Date.now() - startTime;
        
        console.log(`✅ [${requestId}] Cloudinary delete exitoso en ${duration}ms:`, {
          public_id: publicId,
          result: result.result
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [${requestId}] Cloudinary delete falló en ${duration}ms:`, {
          public_id: publicId,
          error: error.message
        });
        throw error;
      }
    };
  }
  
  next();
};

/**
 * Middleware de resumen al final del request
 */
export const requestSummaryLogger = (req, res, next) => {
  const requestId = req.requestId || 'unknown';
  const startTime = Date.now();
  
  // Al final del request
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    
    console.log(`🏁 [${requestId}] REQUEST COMPLETADO:`, {
      metodo: req.method,
      url: req.originalUrl,
      status: status,
      duracion: `${duration}ms`,
      tipo: status >= 400 ? '❌ ERROR' : status >= 300 ? '🔄 REDIRECT' : '✅ ÉXITO',
      archivos_procesados: req.files ? Object.keys(req.files).length : 0,
      tamaño_respuesta: res.get('content-length') || 'desconocido'
    });
    
    // Separador visual para requests largos
    if (duration > 1000) {
      console.log(`${'='.repeat(80)}`);
    }
  });
  
  next();
};