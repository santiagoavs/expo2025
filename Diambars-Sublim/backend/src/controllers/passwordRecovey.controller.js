import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import userModel from "../models/users.js";
import employeeModel from "../models/employees.js";
import { config } from "../config.js";
import { sendRecoveryCode, sendPasswordResetConfirmation } from "../utils/passwordRecoveryEmail.js";

const passwordRecoveryController = {};

// Solicitar código de recuperación
passwordRecoveryController.requestRecoveryCode = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "El correo electrónico es requerido" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  try {
    // Buscar el usuario en ambos modelos
    let user = null;
    let userType = null;
    let userName = null;
    
    // Primero buscar en usuarios (clientes)
    user = await userModel.findOne({ email: normalizedEmail });
    if (user) {
      userType = "user";
      userName = user.name;
      console.log(`[PasswordRecovery] Usuario encontrado en 'users'. Email: ${normalizedEmail}`);
    } else {
      // Buscar en empleados
      user = await employeeModel.findOne({ email: normalizedEmail });
      if (user) {
        userType = "employee";
        userName = user.name;
        console.log(`[PasswordRecovery] Usuario encontrado en 'employees'. Email: ${normalizedEmail}`);
      }
    }
    
    if (!user) {
      return res.status(404).json({ 
        message: "No se encontró ninguna cuenta asociada a este correo electrónico." 
      });
    }
    
    // Para usuarios (no empleados), verificar si está verificado
    // COMENTADO TEMPORALMENTE PARA PRUEBAS
    /*
    if (userType === "user" && !user.verified) {
      return res.status(403).json({ 
        message: "Esta cuenta no ha sido verificada. Por favor, verifica tu correo electrónico antes de continuar.",
        needsVerification: true
      });
    }
    */
    
    // Generar un código de 6 dígitos
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Crear token JWT con la información necesaria para la recuperación
    const token = jwt.sign(
      { 
        email: normalizedEmail,
        code: recoveryCode,
        userType,
        userId: user._id,
        verified: false
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );
    
    // Almacenar token en cookie segura
    res.cookie("passwordRecoveryToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 20 * 60 * 1000 // 20 minutos
    });
    
    // Enviar correo con código de recuperación
    const emailSent = await sendRecoveryCode(normalizedEmail, recoveryCode, userName);
    
    if (!emailSent) {
      return res.status(500).json({ 
        message: "No se pudo enviar el correo. Por favor, intenta más tarde." 
      });
    }
    
    return res.status(200).json({ 
      message: "Se ha enviado un código de recuperación a tu correo electrónico.",
      email: normalizedEmail // Devolver email para facilitar UX en frontend
    });
    
  } catch (error) {
    console.error("[PasswordRecovery] Error al solicitar código:", error);
    return res.status(500).json({ 
      message: "Error al procesar la solicitud. Por favor, intenta más tarde." 
    });
  }
};

// Verificar código de recuperación
passwordRecoveryController.verifyRecoveryCode = async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ message: "El código de verificación es requerido" });
  }
  
  try {
    // Obtener token de la cookie
    const token = req.cookies.passwordRecoveryToken;
    
    if (!token) {
      return res.status(401).json({ 
        message: "Sesión de recuperación no encontrada o expirada. Por favor, solicita un nuevo código." 
      });
    }
    
    // Verificar token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, config.JWT.secret);
    } catch (err) {
      // Si el token expiró o es inválido
      res.clearCookie("passwordRecoveryToken");
      return res.status(401).json({ 
        message: "Sesión de recuperación expirada. Por favor, solicita un nuevo código." 
      });
    }
    
    // Verificar si el código coincide
    if (decodedToken.code !== code) {
      return res.status(400).json({ 
        message: "El código ingresado es incorrecto. Por favor, verifica e intenta nuevamente." 
      });
    }
    
    // Generar nuevo token con código verificado
    const newToken = jwt.sign(
      {
        ...decodedToken,
        verified: true
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );
    
    // Actualizar cookie con nuevo token
    res.cookie("passwordRecoveryToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 20 * 60 * 1000 // 20 minutos
    });
    
    return res.status(200).json({ 
      message: "Código verificado correctamente. Ahora puedes establecer una nueva contraseña." 
    });
    
  } catch (error) {
    console.error("[PasswordRecovery] Error al verificar código:", error);
    return res.status(500).json({ 
      message: "Error al verificar el código. Por favor, intenta más tarde." 
    });
  }
};

// Establecer nueva contraseña
passwordRecoveryController.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword) {
    return res.status(400).json({ message: "La nueva contraseña es requerida" });
  }
  
  // Validación básica de contraseña
  if (newPassword.length < 6) {
    return res.status(400).json({ 
      message: "La contraseña debe tener al menos 6 caracteres" 
    });
  }
  
  try {
    // Obtener token de la cookie
    const token = req.cookies.passwordRecoveryToken;
    
    if (!token) {
      return res.status(401).json({ 
        message: "Sesión de recuperación no encontrada o expirada. Por favor, inicia el proceso nuevamente." 
      });
    }
    
    // Verificar token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, config.JWT.secret);
    } catch (err) {
      // Si el token expiró o es inválido
      res.clearCookie("passwordRecoveryToken");
      return res.status(401).json({ 
        message: "Sesión de recuperación expirada. Por favor, inicia el proceso nuevamente." 
      });
    }
    
    // Verificar que el código haya sido verificado
    if (!decodedToken.verified) {
      return res.status(401).json({ 
        message: "Debes verificar el código antes de establecer una nueva contraseña." 
      });
    }
    
    const { email, userType, userId } = decodedToken;
    
    // Encriptar la nueva contraseña
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    
    let user;
    
    // Actualizar contraseña según el tipo de usuario
    if (userType === "user") {
      user = await userModel.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );
    } else if (userType === "employee") {
      user = await employeeModel.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );
    } else {
      return res.status(400).json({ message: "Tipo de usuario no válido" });
    }
    
    if (!user) {
      return res.status(404).json({ 
        message: "Usuario no encontrado. No se pudo actualizar la contraseña." 
      });
    }
    
    // Limpiar cookie de recuperación
    res.clearCookie("passwordRecoveryToken");
    
    // Enviar correo de confirmación
    await sendPasswordResetConfirmation(email, user.name);
    
    return res.status(200).json({ 
      message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña." 
    });
    
  } catch (error) {
    console.error("[PasswordRecovery] Error al restablecer contraseña:", error);
    return res.status(500).json({ 
      message: "Error al actualizar la contraseña. Por favor, intenta más tarde." 
    });
  }
};

export default passwordRecoveryController;