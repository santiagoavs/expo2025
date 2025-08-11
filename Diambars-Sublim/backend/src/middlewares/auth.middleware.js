// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { config } from "../config.js";

/**
 * Middleware principal para verificar autenticación
 */
export const authRequired = (req, res, next) => {
  console.log('🔐 Verificando autenticación:', {
    url: req.url,
    method: req.method,
    hasCookie: !!req.cookies.authToken,
    hasHeader: !!req.headers.authorization,
    hasXAccessToken: !!req.headers['x-access-token']
  });

  const token = req.cookies.authToken 
    || req.headers['x-access-token']
    || req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.log('❌ Token no proporcionado');
    return res.status(401).json({ 
      success: false,
      message: "Token no proporcionado",
      error: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT.secret);
    
    if (!decoded.id) {
      console.log('❌ Token inválido - sin ID');
      return res.status(401).json({ 
        success: false,
        message: "Token inválido",
        error: 'INVALID_TOKEN'
      });
    }

    // Normalizar estructura del usuario
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      type: decoded.type || 'user',
      roles: decoded.roles || [decoded.role] || ['user'],
      role: decoded.role || decoded.roles?.[0] || 'user',
      email: decoded.email,
      name: decoded.name
    };

    console.log('✅ Usuario autenticado:', {
      id: req.user.id,
      type: req.user.type,
      roles: req.user.roles,
      email: req.user.email
    });

    next();
  } catch (error) {
    console.log('❌ Error verificando token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expirado",
        error: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: "Token inválido",
      error: 'INVALID_TOKEN'
    });
  }
};

/**
 * Alias para compatibilidad con código existente
 */
export const verifyToken = authRequired;

/**
 * Middleware para verificar roles específicos
 */
export const roleRequired = (allowedRoles = []) => {
  return (req, res, next) => {
    console.log('🔑 Verificando roles:', {
      required: allowedRoles,
      userRoles: req.user?.roles,
      userRole: req.user?.role
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Verificar si el usuario tiene alguno de los roles permitidos
    const userRoles = req.user.roles || [req.user.role];
    const hasRole = allowedRoles.some(role => 
      userRoles.some(userRole => 
        userRole?.toLowerCase() === role.toLowerCase()
      )
    );

    if (!hasRole) {
      console.log('❌ Rol insuficiente');
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Rol insuficiente.",
        error: 'INSUFFICIENT_ROLE',
        data: {
          required: allowedRoles,
          current: userRoles
        }
      });
    }

    console.log('✅ Rol autorizado');
    next();
  };
};

/**
 * Alias para compatibilidad
 */
export const checkRole = roleRequired;

/**
 * Middleware para verificar tipo de usuario
 */
export const checkUserType = (...allowedTypes) => {
  return (req, res, next) => {
    const userType = req.user?.type;

    console.log('👤 Verificando tipo de usuario:', {
      required: allowedTypes,
      current: userType
    });

    const isAllowed = allowedTypes.some(type => 
      type.toLowerCase() === userType?.toLowerCase()
    );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Tipo de usuario no autorizado.",
        error: 'INVALID_USER_TYPE',
        data: {
          required: allowedTypes,
          current: userType
        }
      });
    }

    next();
  };
};

/**
 * Middleware opcional - permite acceso sin autenticación pero añade user si existe token
 */
export const authOptional = (req, res, next) => {
  const token = req.cookies.authToken 
    || req.headers['x-access-token']
    || req.headers.authorization?.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT.secret);
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      type: decoded.type || 'user',
      roles: decoded.roles || [decoded.role] || ['user'],
      role: decoded.role || decoded.roles?.[0] || 'user',
      email: decoded.email,
      name: decoded.name
    };
  } catch (error) {
    req.user = null;
  }

  next();
};

/**
 * Middleware para verificar propiedad de recurso
 */
export const ownershipRequired = (resourceGetter) => {
  return async (req, res, next) => {
    try {
      const resource = await resourceGetter(req);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Recurso no encontrado",
          error: 'RESOURCE_NOT_FOUND'
        });
      }

      const isOwner = resource.user?.toString() === req.user._id.toString();
      const isAdmin = req.user.roles?.includes('admin');

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "No tienes permiso para acceder a este recurso",
          error: 'UNAUTHORIZED_ACCESS'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Error verificando propiedad:', error);
      return res.status(500).json({
        success: false,
        message: "Error verificando permisos",
        error: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware para evitar múltiples administradores
 */
export const checkAdminUniqueness = async (req, res, next) => {
  const { role, roles } = req.body;
  const hasAdminRole = (role && role.toLowerCase() === 'admin') || 
                       (roles && roles.some(r => r.toLowerCase() === 'admin'));

  if (hasAdminRole) {
    try {
      const Employee = (await import("../models/employees.js")).default;
      const User = (await import("../models/users.js")).default;

      // Excluir usuario actual si está editando
      const excludeId = req.params?.id;
      const filter = excludeId ? { _id: { $ne: excludeId } } : {};

      const existingEmployeeAdmin = await Employee.findOne({
        ...filter,
        $or: [
          { role: { $regex: /^admin$/i } },
          { roles: 'admin' }
        ]
      });

      const existingUserAdmin = await User.findOne({
        ...filter,
        $or: [
          { role: { $regex: /^admin$/i } },
          { roles: 'admin' }
        ]
      });

      if ((existingEmployeeAdmin || existingUserAdmin) && !excludeId) {
        return res.status(403).json({
          success: false,
          message: "Ya existe un administrador. No se pueden crear más.",
          error: 'ADMIN_ALREADY_EXISTS'
        });
      }
    } catch (error) {
      console.error("Error verificando unicidad de admin:", error);
      return res.status(500).json({ 
        success: false,
        message: "Error interno del servidor",
        error: 'INTERNAL_ERROR'
      });
    }
  }

  next();
};

export default {
  authRequired,
  verifyToken,
  roleRequired,
  checkRole,
  checkUserType,
  authOptional,
  ownershipRequired,
  checkAdminUniqueness
};