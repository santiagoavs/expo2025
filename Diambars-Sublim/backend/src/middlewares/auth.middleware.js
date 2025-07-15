import jwt from "jsonwebtoken";
import { config } from "../config.js";

/**
 * Middleware para verificar el token JWT enviado por el cliente.
 * Extrae el token desde cookies, headers personalizados o la cabecera Authorization.
 * Si no hay token, continúa sin autenticación (permite rutas públicas).
 * Si el token es válido, agrega los datos del usuario al objeto req.
 */
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

    // Validación de campos esenciales en el token
    if (!decoded.id || !decoded.type) {
      console.error("Token decodificado inválido:", decoded);
      return next();
    }

    // Agregar datos del usuario autenticado al objeto req
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

/**
 * Middleware para validar si el usuario tiene uno de los roles permitidos.
 * Se utiliza después de verificar el token.
 * Devuelve error 403 si el rol del usuario no está autorizado.
 */
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    // Comparación sin distinción de mayúsculas
    const isAllowed = allowedRoles.some(role => 
      role.toLowerCase() === userRole?.toLowerCase()
    );

    if (!isAllowed) {
      return res.status(403).json({
        message: "Acceso denegado. Rol insuficiente.",
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

/**
 * Middleware para validar si el tipo de usuario es uno de los permitidos.
 * Similar a checkRole, pero orientado al campo `type` del token.
 */
export const checkUserType = (...allowedTypes) => {
  return (req, res, next) => {
    const userType = req.user?.type;

    const isAllowed = allowedTypes.some(type => 
      type.toLowerCase() === userType?.toLowerCase()
    );

    if (!isAllowed) {
      return res.status(403).json({
        message: "Acceso denegado. Tipo de usuario no autorizado.",
        required: allowedTypes,
        current: userType
      });
    }

    next();
  };
};

/**
 * Middleware que evita la creación de múltiples administradores.
 * Se utiliza en rutas que registran o actualizan usuarios/empleados.
 * Verifica si ya existe un registro con rol "admin" en empleados o usuarios.
 * Si se está actualizando un registro, excluye al actual en la búsqueda.
 */
export const checkAdminUniqueness = async (req, res, next) => {
  const { role } = req.body;
  const isAdminRole = role && role.toLowerCase() === 'admin';

  if (isAdminRole) {
    try {
      // Importaciones dinámicas de modelos
      const employeeModel = (await import("../models/employees.js")).default;
      const userModel = (await import("../models/users.js")).default;

      // Verificar si existe un administrador en empleados o usuarios
      const existingEmployeeAdmin = await employeeModel.findOne({
        role: { $regex: /^admin$/i }
      });

      const existingUserAdmin = await userModel.findOne({
        role: { $regex: /^admin$/i }
      });

      // Excluir usuario actual si está en modo edición
      const excludeCurrentUser = req.params?.id 
        ? { _id: { $ne: req.params.id } } 
        : {};

      const isCreatingNew = Object.keys(excludeCurrentUser).length === 0;

      if ((existingEmployeeAdmin || existingUserAdmin) && isCreatingNew) {
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
