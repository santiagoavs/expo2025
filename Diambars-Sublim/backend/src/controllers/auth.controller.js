// auth.controller.js
import employeeModel from "../models/employees.js";
import userModel from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const authController = {};

/**
 * Controlador para el inicio de sesión.
 *
 * - Verifica que se ingresen email y contraseña.
 * - Busca primero en la colección de empleados activos.
 * - Si no encuentra, busca en usuarios normales.
 * - Compara la contraseña usando bcrypt.
 * - Verifica si el usuario está verificado (solo para usuarios normales).
 * - Genera un token JWT con los datos del usuario.
 * - Devuelve el token y los datos del usuario como respuesta.
 */
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

    // Usuario no encontrado
    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Verificar que la cuenta tenga contraseña (por seguridad)
    if (!user.password) {
      return res.status(500).json({ message: "Error en la configuración de la cuenta" });
    }

    // Verificar contraseña ingresada vs la almacenada
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Verificar estado de cuenta si es usuario normal (requiere verificación por correo)
    if (!isEmployee && !user.verified) {
      return res.status(403).json({ 
        message: "Cuenta no verificada. Por favor, verifica tu correo electrónico antes de iniciar sesión.",
        needsVerification: true
      });
    }

    const userType = isEmployee ? user.role.toLowerCase() : "user";
    const userRole = user.role;

    // Generar token de sesión JWT
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

    // Enviar token en cookie segura
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
    });

    // Respuesta con datos del usuario y token
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

/**
 * Verifica si el usuario actual está autenticado.
 *
 * - Usa los datos del token decodificado (`req.user`).
 * - Busca al usuario en la base de datos según su tipo.
 * - Devuelve estado de autenticación y datos del usuario.
 */
authController.checkAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        authenticated: false,
        message: "Usuario no autenticado"
      });
    }

    const { id, type } = req.user;

    // Determinar si buscar en modelo de usuario o empleado
    let model = type === "user" ? userModel : employeeModel;

    const user = await model.findById(id);

    if (!user || !user.active) {
      return res.status(200).json({
        authenticated: false,
        message: "Usuario no encontrado o inactivo"
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        type: type.toLowerCase()
      }
    });
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Cierra sesión del usuario eliminando la cookie de autenticación.
 */
authController.logout = (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({ message: "Sesión cerrada correctamente" });
};

export default authController;
