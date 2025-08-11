// auth.controller.js - VERSIÓN CORREGIDA
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

  console.log('🔐 [authController.login] Intento de login:', {
    email,
    passwordLength: password?.length,
    hasPassword: !!password
  });

  if (!email || !password) {
    console.log('❌ [authController.login] Faltan campos obligatorios');
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log('📧 [authController.login] Email normalizado:', normalizedEmail);

    // Buscar usuario en empleados primero
    let user = await employeeModel.findOne({ 
      email: normalizedEmail, 
      active: true 
    }).select('+password');
    
    let isEmployee = true;
    let userType = 'employee';

    console.log('👔 [authController.login] Búsqueda en empleados:', {
      found: !!user,
      userId: user?._id
    });

    // Si no es empleado, buscar en usuarios normales
    if (!user) {
      console.log('👤 [authController.login] Buscando en usuarios normales...');
      user = await userModel.findOne({ 
        email: normalizedEmail, 
        active: true 
      }).select('+password');
      
      isEmployee = false;
      userType = 'user';
      
      console.log('👤 [authController.login] Búsqueda en usuarios:', {
        found: !!user,
        userId: user?._id
      });
    }

    // Usuario no encontrado
    if (!user) {
      console.log('❌ [authController.login] Usuario no encontrado o inactivo');
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    console.log('✅ [authController.login] Usuario encontrado:', {
      id: user._id,
      email: user.email,
      role: user.role,
      isEmployee,
      hasPassword: !!user.password
    });

    // Verificar que la cuenta tenga contraseña (por seguridad)
    if (!user.password) {
      console.log('❌ [authController.login] Usuario sin contraseña configurada');
      return res.status(500).json({ message: "Error en la configuración de la cuenta" });
    }

    console.log('🔍 [authController.login] Verificando contraseña...');
    console.log('🔍 [authController.login] Password desde frontend:', password.substring(0, 3) + '***');
    console.log('🔍 [authController.login] Password hash en BD:', user.password.substring(0, 20) + '...');

    // Verificar contraseña ingresada vs la almacenada
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    console.log('🔍 [authController.login] Resultado de verificación de contraseña:', {
      match: passwordMatch,
      inputPasswordLength: password.length,
      hashLength: user.password.length,
      isValidHash: user.password.startsWith('$2b') || user.password.startsWith('$2a')
    });

    if (!passwordMatch) {
      console.log('❌ [authController.login] Contraseña incorrecta');
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Verificar estado de cuenta si es usuario normal (requiere verificación por correo)
    if (!isEmployee && !user.verified) {
      console.log('📧 [authController.login] Usuario no verificado');
      return res.status(401).json({ 
        message: "Cuenta no verificada. Por favor, verifica tu correo electrónico antes de iniciar sesión.",
        needsVerification: true,
        error: 'USER_NOT_VERIFIED'
      });
    }

    // Determinar tipo y rol del usuario
    const finalUserType = isEmployee ? user.role.toLowerCase() : userType;
    const userRole = user.role;

    console.log('🎭 [authController.login] Datos para token:', {
      id: user._id,
      role: userRole,
      type: finalUserType,
      email: user.email,
      name: user.name
    });

    // Generar token de sesión JWT
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: userRole,
        email: user.email,
        type: finalUserType,
        name: user.name
      },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

    console.log('🔑 [authController.login] Token generado:', {
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + '...',
      expiresIn: config.JWT.expiresIn
    });

    // Enviar token en cookie segura
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
    });

    console.log('🍪 [authController.login] Cookie configurada:', {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true
    });

    // Respuesta con datos del usuario y token
    const responseData = {
      message: "Login exitoso",
      success: true,
      user: {
        id: user._id,
        _id: user._id, 
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: userRole,
        type: finalUserType,
        verified: user.verified || false,
        active: user.active || true
      },
      token // Incluir token en respuesta para debugging
    };

    console.log('✅ [authController.login] Login exitoso - respuesta:', {
      userId: responseData.user.id,
      userEmail: responseData.user.email,
      userRole: responseData.user.role,
      userType: responseData.user.type,
      verified: responseData.user.verified
    });

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("❌ [authController.login] Error en login:", error);
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
    console.log('🔍 [authController.checkAuth] Verificando autenticación:', {
      hasUser: !!req.user,
      userId: req.user?.id,
      userType: req.user?.type
    });

    if (!req.user) {
      return res.status(200).json({
        authenticated: false,
        message: "Usuario no autenticado"
      });
    }

    const { id, type } = req.user;

    // Determinar si buscar en modelo de usuario o empleado
    let model = type === "user" ? userModel : employeeModel;

    console.log('📋 [authController.checkAuth] Buscando usuario en:', {
      model: type === "user" ? 'userModel' : 'employeeModel',
      userId: id
    });

    const user = await model.findById(id);

    if (!user || !user.active) {
      console.log('❌ [authController.checkAuth] Usuario no encontrado o inactivo');
      return res.status(200).json({
        authenticated: false,
        message: "Usuario no encontrado o inactivo"
      });
    }

    console.log('✅ [authController.checkAuth] Usuario autenticado:', {
      id: user._id,
      email: user.email,
      role: user.role,
      type
    });

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        type: type.toLowerCase(),
        verified: user.verified || false,
        active: user.active || true
      }
    });
  } catch (error) {
    console.error("❌ [authController.checkAuth] Error al verificar autenticación:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Cierra sesión del usuario eliminando la cookie de autenticación.
 */
authController.logout = (req, res) => {
  console.log('🚪 [authController.logout] Cerrando sesión');
  
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  console.log('✅ [authController.logout] Cookie eliminada exitosamente');
  return res.status(200).json({ message: "Sesión cerrada correctamente" });
};

export default authController;