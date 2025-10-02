// middlewares/auth.middleware.js - VERSIÓN CORREGIDA
import jwt from "jsonwebtoken";
import { config } from "../config.js";

/**
 * Middleware principal para verificar autenticación
 */
export const authRequired = async (req, res, next) => {
  console.log('🔐 Verificando autenticación:', {
    url: req.url,
    method: req.method,
    hasCookie: !!req.cookies.authToken,
    hasHeader: !!req.headers.authorization,
    hasXAccessToken: !!req.headers['x-access-token'],
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });

  // Priorizar tokens según el contexto y detectar tipo de aplicación
  let token = null;
  let tokenSource = '';
  let isAdminPanel = false;

  // Detectar si es panel administrativo basado en headers o URL
  const userAgent = req.headers['user-agent'] || '';
  const isFromEmployeeRoute = req.originalUrl.includes('/employees') || 
                             req.originalUrl.includes('/admin') ||
                             req.originalUrl.includes('/dashboard');
  
  // Si hay header Authorization (dashboard admin), usarlo con prioridad
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    tokenSource = 'Authorization header';
    isAdminPanel = true;
  }
  // Si hay x-access-token header
  else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
    tokenSource = 'x-access-token header';
    isAdminPanel = true;
  }
  // Solo usar cookies si no hay headers (app pública)
  else if (req.cookies.authToken) {
    token = req.cookies.authToken;
    tokenSource = 'Cookie';
    isAdminPanel = false;
  }

  console.log('🔍 Token encontrado:', {
    source: tokenSource,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 20) + '...',
    isAdminPanel,
    isFromEmployeeRoute
  });

  if (!token) {
    console.log('❌ Token no proporcionado');
    return res.status(401).json({ 
      success: false,
      message: "Token no proporcionado",
      error: 'NO_TOKEN'
    });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, config.JWT.secret);
    
    console.log('🔓 Token decodificado:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type,
      exp: new Date(decoded.exp * 1000),
      iat: new Date(decoded.iat * 1000)
    });
    
    if (!decoded.id) {
      console.log('❌ Token inválido - sin ID');
      return res.status(401).json({ 
        success: false,
        message: "Token inválido - sin ID de usuario",
        error: 'INVALID_TOKEN'
      });
    }

    // Buscar el usuario en la base de datos y actualizar lastLogin
    try {
      const User = (await import("../models/users.js")).default;
      const Employee = (await import("../models/employees.js")).default;
      
      let user = null;
      let userType = 'user';
      
      // Determinar dónde buscar basado en el tipo de token
      if (decoded.type === 'employee' || ['admin', 'manager', 'employee'].includes(decoded.role?.toLowerCase())) {
        // Buscar primero en empleados
        user = await Employee.findById(decoded.id);
        userType = 'employee';
        
        // Si no se encuentra en empleados, buscar en usuarios
        if (!user) {
          user = await User.findById(decoded.id);
          userType = 'user';
        }
      } else {
        // Buscar primero en usuarios
        user = await User.findById(decoded.id);
        userType = 'user';
        
        // Si no se encuentra en usuarios, buscar en empleados
        if (!user) {
          user = await Employee.findById(decoded.id);
          userType = 'employee';
        }
      }

      if (!user) {
        console.log('❌ Usuario no encontrado en BD:', decoded.id);
        return res.status(401).json({ 
          success: false,
          message: "Usuario no encontrado",
          error: 'USER_NOT_FOUND'
        });
      }

      if (user.active === false) {
        console.log('❌ Usuario inactivo:', decoded.id);
        return res.status(401).json({ 
          success: false,
          message: "Cuenta desactivada",
          error: 'ACCOUNT_DISABLED'
        });
      }

      // Actualizar último login
      try {
        if (user.updateLastLogin && typeof user.updateLastLogin === 'function') {
          await user.updateLastLogin();
        } else {
          // Fallback manual si el método no existe
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });
        }
        console.log('📅 LastLogin actualizado para usuario:', user._id);
      } catch (lastLoginError) {
        console.warn('⚠️ Error actualizando lastLogin:', lastLoginError.message);
        // No interrumpir el flujo por error de lastLogin
      }

      // Verificar que el tipo de usuario coincida con el contexto
      // Configurar rutas públicas de usuarios
      const isPublicUserRoute = req.originalUrl.includes('/orders/me') || 
                               req.originalUrl.includes('/orders/user/') ||
                               req.originalUrl.includes('/user/orders');
      
      // Solo las rutas específicas de empleados requieren verificación de empleado
      const isEmployeeRoute = !isPublicUserRoute && (
                             req.originalUrl.includes('/employees') || 
                             req.originalUrl.includes('/admin') ||
                             req.originalUrl.includes('/dashboard') ||
                             isAdminPanel);
      
      
      const isEmployee = userType === 'employee' || 
                        ['admin', 'manager', 'employee', 'warehouse'].includes(user.role?.toLowerCase());

      // Si es una ruta de empleados o panel admin pero el usuario no es empleado
      if (isEmployeeRoute && !isEmployee) {
        console.log('❌ Usuario no es empleado intentando acceder a ruta/panel de empleados:', {
          userType,
          userRole: user.role,
          isEmployeeRoute,
          isAdminPanel
        });
        return res.status(403).json({ 
          success: false,
          message: "Acceso denegado - Se requiere cuenta de empleado",
          error: 'EMPLOYEE_REQUIRED'
        });
      }
      
      console.log('✅ Usuario verificado en BD:', {
        id: user._id,
        email: user.email,
        role: user.role,
        type: userType,
        active: user.active
      });
      
    } catch (dbError) {
      console.error('❌ Error verificando usuario en BD:', dbError.message);
      return res.status(500).json({ 
        success: false,
        message: "Error verificando usuario",
        error: 'DB_ERROR'
      });
    }

    // Normalizar estructura del usuario para req.user
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      type: decoded.type || userType || 'user',
      roles: decoded.roles || [decoded.role] || ['user'],
      role: decoded.role || decoded.roles?.[0] || 'user',
      email: decoded.email,
      name: decoded.name,
      active: decoded.active !== false
    };

    console.log('✅ Usuario autenticado exitosamente:', {
      id: req.user.id,
      type: req.user.type,
      roles: req.user.roles,
      email: req.user.email,
      tokenSource
    });

    next();
  } catch (error) {
    console.log('❌ Error verificando token:', {
      message: error.message,
      name: error.name,
      tokenSource
    });
    
    // Limpiar cookie corrupta si el error viene de cookie
    if (tokenSource === 'Cookie' && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
      console.log('🗑️ Limpiando cookie corrupta');
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expirado",
        error: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Token inválido o corrupto",
        error: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: "Error de autenticación",
      error: 'AUTH_ERROR'
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

    // Normalizar roles permitidos para comparación insensible a mayúsculas
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    // Verificar si el usuario tiene alguno de los roles permitidos
    const userRoles = req.user.roles || [req.user.role];
    const normalizedUserRoles = userRoles.map(role => role?.toLowerCase());
    
    const hasRole = normalizedAllowedRoles.some(allowedRole => 
      normalizedUserRoles.includes(allowedRole)
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
export const checkRole = (...allowedRoles) => {
  // Convertir argumentos a array plano
  const roles = allowedRoles.flat();
  return roleRequired(roles);
};

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
      name: decoded.name,
      active: decoded.active !== false
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
      const isAdmin = req.user.roles?.some(role => role.toLowerCase() === 'admin') || 
                      req.user.role?.toLowerCase() === 'admin';

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
 * Middleware para verificar que el usuario es admin o está accediendo a sus propios datos
 */
export const checkOwnershipOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no autenticado',
        error: 'NOT_AUTHENTICATED' 
      });
    }

    const userId = req.params.id;
    const isAdmin = req.user.roles?.some(role => role.toLowerCase() === 'admin') || 
                    req.user.role?.toLowerCase() === 'admin';
    const isOwner = req.user.id === userId || req.user._id.toString() === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        success: false,
        message: 'Solo puedes acceder a tus propios datos o ser administrador',
        error: 'ACCESS_DENIED' 
      });
    }

    next();
  } catch (error) {
    console.error('Error en verificación de propiedad:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR' 
    });
  }
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

/**
 * Middleware para verificar usuarios activos
 */
export const checkActiveUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Verificar en base de datos si el usuario sigue activo
    const User = (await import("../models/users.js")).default;
    const Employee = (await import("../models/employees.js")).default;
    
    let user = await User.findById(req.user.id);
    if (!user) {
      user = await Employee.findById(req.user.id);
    }

    if (!user || user.active === false) {
      return res.status(403).json({
        success: false,
        message: "Cuenta desactivada",
        error: 'ACCOUNT_DISABLED'
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando usuario activo:', error);
    return res.status(500).json({
      success: false,
      message: "Error verificando estado del usuario",
      error: 'USER_CHECK_ERROR'
    });
  }
};

export default {
  authRequired,
  verifyToken,
  roleRequired,
  checkRole,
  checkUserType,
  authOptional,
  ownershipRequired,
  checkOwnershipOrAdmin,
  checkAdminUniqueness,
  checkActiveUser
};