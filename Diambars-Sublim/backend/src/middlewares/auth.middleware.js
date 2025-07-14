import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken 
    || req.headers['x-access-token']
    || req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.log("Token no encontrado. Continuando sin autenticación.");
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT.secret);
    
    if (!decoded.id || !decoded.type) {
      console.error("Token decodificado inválido:", decoded);
      return next();
    }
    
    req.user = {
      id: decoded.id,
      type: decoded.type,
      role: decoded.role,
      email: decoded.email
    };
    
    console.log("Usuario autenticado:", req.user);
    next();
  } catch (error) {
    console.error("Error de verificación de token:", error.message);
    next();
  }
};

export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
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

export const checkUserType = (...allowedTypes) => {
  return (req, res, next) => {
    const userType = req.user?.type;

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

export const checkAdminUniqueness = async (req, res, next) => {
  const { role } = req.body;
  
  const isAdminRole = role && role.toLowerCase() === 'admin';

  if (isAdminRole) {
    try {
      const employeeModel = (await import("../models/employees.js")).default;
      const userModel = (await import("../models/users.js")).default;
      
      const existingEmployeeAdmin = await employeeModel.findOne({ 
        role: { $regex: new RegExp('^admin$', 'i') }
      });
      
      const existingUserAdmin = await userModel.findOne({ 
        role: { $regex: new RegExp('^admin$', 'i') }
      });
      
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