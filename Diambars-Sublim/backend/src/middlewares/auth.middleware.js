import jwt from "jsonwebtoken";
import { config } from "../config.js";

// Verifica el token JWT
export const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) return res.status(401).json({ message: "No autorizado. Token faltante." });

  try {
    const decoded = jwt.verify(token, config.JWT.secret);
    req.user = decoded; // Incluye id, role, type, etc.
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};

// Verifica el rol del usuario (insensible a mayúsculas/minúsculas)
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    // Debug para ayudar a diagnosticar problemas
    console.log('Usuario actual:', req.user);
    console.log('Rol requerido:', allowedRoles);
    console.log('Rol del usuario:', userRole);

    // Verificación insensible a mayúsculas/minúsculas
    if (!userRole || !allowedRoles.some(role => 
        role.toLowerCase() === userRole.toLowerCase())) {
      return res.status(403).json({ 
        message: "Acceso denegado. Rol insuficiente.",
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

// Verifica el tipo de usuario (employee o user)
export const checkUserType = (...allowedTypes) => {
  return (req, res, next) => {
    const userType = req.user?.type;

    // Verificación insensible a mayúsculas/minúsculas
    if (!userType || !allowedTypes.some(type => 
        type.toLowerCase() === userType.toLowerCase())) {
      return res.status(403).json({ 
        message: "Acceso denegado. Tipo de usuario no autorizado.",
        required: allowedTypes,
        current: userType
      });
    }

    next();
  };
};

// Verifica unicidad de admin (para uso en rutas de creación/edición)
export const checkAdminUniqueness = async (req, res, next) => {
  const { role } = req.body;
  
  // Verificar tanto "admin" como "Admin" (insensible a mayúsculas/minúsculas)
  const isAdminRole = role && role.toLowerCase() === 'admin';

  if (isAdminRole) {
    try {
      const employeeModel = (await import("../models/employees.js")).default;
      const userModel = (await import("../models/users.js")).default;
      
      // Buscar administradores existentes (insensible a mayúsculas)
      const existingEmployeeAdmin = await employeeModel.findOne({ 
        role: { $regex: new RegExp('^admin$', 'i') }
      });
      
      const existingUserAdmin = await userModel.findOne({ 
        role: { $regex: new RegExp('^admin$', 'i') }
      });
      
      // Excluir al usuario actual en caso de actualización
      const excludeCurrentUser = req.params?.id ? 
        { _id: { $ne: req.params.id } } : {};
      
      if ((existingEmployeeAdmin || existingUserAdmin) && 
          Object.keys(excludeCurrentUser).length === 0) {
        return res.status(403).json({ 
          message: "Ya existe un administrador. No se pueden crear más." 
        });
      }
    } catch (error) {
      console.error("Error al verificar unicidad de admin:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  }
  
  next();
};