// middlewares/validation.middleware.js
import { validationResult } from 'express-validator';

/**
 * Middleware para procesar errores de validación de express-validator
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('❌ Errores de validación:', errors.array());
    
    // Formatear errores para respuesta más clara
    const formattedErrors = errors.array().reduce((acc, error) => {
      const field = error.path || error.param;
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(error.msg);
      return acc;
    }, {});
    
    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos enviados',
      error: 'VALIDATION_ERROR',
      errors: formattedErrors,
      details: errors.array()
    });
  }
  
  next();
};

/**
 * Middleware para validar IDs de MongoDB
 */
export const validateMongoId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: `${paramName} es requerido`,
        error: 'MISSING_ID'
      });
    }
    
    // Validar formato de ObjectId de MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: `${paramName} no es un ID válido de MongoDB`,
        error: 'INVALID_MONGO_ID'
      });
    }
    
    next();
  };
};

/**
 * Middleware para validar paginación
 */
export const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'El número de página debe ser mayor a 0',
      error: 'INVALID_PAGE'
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'El límite debe estar entre 1 y 100',
      error: 'INVALID_LIMIT'
    });
  }
  
  // Normalizar valores
  req.query.page = pageNum;
  req.query.limit = limitNum;
  
  next();
};

/**
 * Middleware para sanear entrada de datos
 */
export const sanitizeInput = (fields = []) => {
  return (req, res, next) => {
    fields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        // Eliminar espacios al inicio y final
        req.body[field] = req.body[field].trim();
        
        // Prevenir inyección de HTML/Scripts
        req.body[field] = req.body[field]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
    });
    
    next();
  };
};

/**
 * Middleware para validar formato de email
 */
export const validateEmail = (field = 'email') => {
  return (req, res, next) => {
    const email = req.body[field];
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido',
        error: 'MISSING_EMAIL'
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido',
        error: 'INVALID_EMAIL_FORMAT'
      });
    }
    
    // Normalizar email
    req.body[field] = email.toLowerCase().trim();
    
    next();
  };
};

/**
 * Middleware para validar número de teléfono de El Salvador
 */
export const validatePhoneSV = (field = 'phoneNumber') => {
  return (req, res, next) => {
    const phone = req.body[field];
    
    if (!phone) {
      return next(); // Campo opcional
    }
    
    // Eliminar espacios y guiones
    const cleanPhone = phone.replace(/[\s-]/g, '');
    
    // Validar formato de El Salvador (8 dígitos comenzando con 2, 6 o 7)
    const phoneRegex = /^[267]\d{7}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de teléfono inválido. Debe ser un número de El Salvador',
        error: 'INVALID_PHONE_FORMAT',
        example: '7123-4567'
      });
    }
    
    // Guardar versión limpia
    req.body[field] = cleanPhone;
    
    next();
  };
};

/**
 * Middleware para validar archivos subidos
 */
export const validateFileUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB por defecto
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    required = false
  } = options;
  
  return (req, res, next) => {
    if (!req.file && !req.files) {
      if (required) {
        return res.status(400).json({
          success: false,
          message: 'Archivo requerido',
          error: 'FILE_REQUIRED'
        });
      }
      return next();
    }
    
    // Obtener archivos para validar
    const files = req.file ? [req.file] : Object.values(req.files).flat();
    
    for (const file of files) {
      // Validar tamaño
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `Archivo muy grande. Máximo ${maxSize / (1024 * 1024)}MB`,
          error: 'FILE_TOO_LARGE'
        });
      }
      
      // Validar tipo
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`,
          error: 'INVALID_FILE_TYPE'
        });
      }
    }
    
    next();
  };
};

export default {
  validateRequest,
  validateMongoId,
  validatePagination,
  sanitizeInput,
  validateEmail,
  validatePhoneSV,
  validateFileUpload
};