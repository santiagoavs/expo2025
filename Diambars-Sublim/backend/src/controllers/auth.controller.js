import employeeModel from "../models/employees.js";
import userModel from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const authController = {};

authController.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    
    // Buscar usuario en empleados
    let user = await employeeModel.findOne({ email: normalizedEmail, active: true }).select('+password');
    let isEmployee = true;

    // Si no es empleado, buscar en usuarios normales
    if (!user) {
      user = await userModel.findOne({ email: normalizedEmail, active: true }).select('+password');
      isEmployee = false;
    }

    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    if (!user.password) {
      return res.status(500).json({ message: "Error en la configuración de la cuenta" });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Verificar si es usuario normal no verificado
    if (!isEmployee && !user.verified) {
      return res.status(403).json({ 
        message: "Cuenta no verificada. Por favor, verifica tu correo electrónico antes de iniciar sesión.",
        needsVerification: true
      });
    }

    // Determinar tipo de usuario (convertir a minúsculas para consistencia)
    const userType = isEmployee ? user.role.toLowerCase() : "user";
    const userRole = user.role;

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: userRole,
        email: user.email,
        type: userType,
        name: user.name
      },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

    // Configurar cookie de autenticación
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
    });

    // Respuesta exitosa
    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        type: userType
      },
      token
    });
    
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

authController.checkAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        authenticated: false,
        message: "Usuario no autenticado"
      });
    }

    const { id, type } = req.user;
    
    // Determinar modelo basado en el tipo de usuario
    let model;
    if (type === "user") {
      model = userModel;
    } else {
      model = employeeModel;
    }
    
    // Buscar usuario en la base de datos
    const user = await model.findById(id);
    
    if (!user || !user.active) {
      return res.status(200).json({
        authenticated: false,
        message: "Usuario no encontrado o inactivo"
      });
    }
    
    // Usuario autenticado correctamente
    return res.status(200).json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        type: type.toLowerCase() // Asegurar minúsculas
      }
    });
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

authController.logout = (req, res) => {
  // Eliminar cookie de autenticación
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  
  return res.status(200).json({ message: "Sesión cerrada correctamente" });
};

export default authController;