import employeeModel from "../models/employees.js";
import userModel from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const authController = {};

// Controlador de login unificado
authController.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  try {
    // Buscar primero en empleados
    let user = await employeeModel.findOne({ email, active: true }).select('+password');
    let isEmployee = true;

    // Si no se encuentra, buscar en usuarios
    if (!user) {
      user = await userModel.findOne({ email, active: true }).select('+password');
      isEmployee = false;
    }

    // Si no existe en ninguna colección
    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Verificar que user.password exista antes de comparar
    if (!user.password) {
      console.error("Contraseña no encontrada para el usuario:", email);
      return res.status(500).json({ message: "Error en la configuración de la cuenta" });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Si es un usuario (no empleado), verificar que la cuenta esté verificada
    if (!isEmployee && !user.verified) {
      return res.status(403).json({ 
        message: "Cuenta no verificada. Por favor, verifica tu correo electrónico antes de iniciar sesión.",
        needsVerification: true
      });
    }

    // *** IMPORTANTE: AQUÍ FALTABA TODA LA LÓGICA PARA CREAR EL TOKEN Y ENVIAR RESPUESTA ***
    
    // Usar el campo correcto para el rol
    // Importante: mantener el caso original (mayúsculas/minúsculas)
    const userRole = user.role;
    
    console.log("Usuario autenticado:", {
      id: user._id,
      email: user.email,
      role: userRole,
      type: isEmployee ? "employee" : "user"
    });

    // Crear token con tipo de usuario
    const token = jwt.sign(
      {
        id: user._id,
        role: userRole,
        email: user.email,
        type: isEmployee ? "employee" : "user",
        name: user.name
      },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

    // Enviar cookie con token
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
        type: isEmployee ? "employee" : "user"
      },
      token // Opcional: incluir el token en la respuesta para clientes que no usen cookies
    });
    
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Verificar si el token es válido y obtener información del usuario
authController.checkAuth = async (req, res) => {
  try {
    // El middleware verifyToken ya validó el token y añadió req.user
    const { id, type } = req.user;
    
    // Buscar el usuario según su tipo
    const model = type.toLowerCase() === "employee" ? employeeModel : userModel;
    const user = await model.findById(id);
    
    if (!user || !user.active) {
      return res.status(401).json({ message: "Usuario no encontrado o inactivo" });
    }
    
    return res.status(200).json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        type
      }
    });
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Logout
authController.logout = (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  
  return res.status(200).json({ message: "Sesión cerrada correctamente" });
};

export default authController;