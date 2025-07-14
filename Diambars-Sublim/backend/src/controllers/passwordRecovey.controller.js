import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import userModel from "../models/users.js";
import employeeModel from "../models/employees.js";
import { config } from "../config.js";
import { sendRecoveryCode, sendPasswordResetConfirmation } from "../utils/passwordRecoveryEmail.js";

const passwordRecoveryController = {};

passwordRecoveryController.requestRecoveryCode = async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ 
      message: "El campo 'email' es requerido",
      receivedBody: req.body
    });
  }
  
  const { email } = req.body;
  
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ 
      message: "Se requiere un correo electrónico válido" 
    });
  }

  const normalizedEmail = email.toLowerCase();
  
  try {
    let user = null;
    let userType = null;
    let userName = null;
    
    user = await userModel.findOne({ email: normalizedEmail });
    if (user) {
      userType = "user";
      userName = user.name;
    } else {
      user = await employeeModel.findOne({ email: normalizedEmail });
      if (user) {
        userType = "employee";
        userName = user.name;
      }
    }
    
    if (!user) {
      return res.status(404).json({ 
        message: "No se encontró ninguna cuenta asociada a este correo electrónico." 
      });
    }
    
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const recoveryData = {
      code: recoveryCode,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutos
      email: normalizedEmail,
      userType,
      userId: user._id
    };
    
    // Actualizar usando save() en lugar de findByIdAndUpdate
    if (userType === "user") {
      user.recoveryData = recoveryData;
      await user.save();
    } else if (userType === "employee") {
      user.recoveryData = recoveryData;
      await user.save();
    }
    
    const emailSent = await sendRecoveryCode(normalizedEmail, recoveryCode, userName);
    
    if (!emailSent) {
      return res.status(500).json({ 
        message: "No se pudo enviar el correo. Por favor, intenta más tarde." 
      });
    }
    
    return res.status(200).json({ 
      message: "Se ha enviado un código de recuperación a tu correo electrónico.",
      email: normalizedEmail
    });
    
  } catch (error) {
    console.error("[PasswordRecovery] Error al solicitar código:", error);
    return res.status(500).json({ 
      message: "Error al procesar la solicitud. Por favor, intenta más tarde." 
    });
  }
};

passwordRecoveryController.verifyRecoveryCode = async (req, res) => {
  const { code, email } = req.body;
  
  if (!code || typeof code !== 'string' || !email) {
    return res.status(400).json({ 
      message: "Se requiere un código de verificación válido y un correo" 
    });
  }
  
  try {
    const normalizedEmail = email.toLowerCase();
    
    let user = await userModel.findOne({ email: normalizedEmail });
    let userType = "user";
    
    if (!user) {
      user = await employeeModel.findOne({ email: normalizedEmail });
      userType = "employee";
    }
    
    if (!user || !user.recoveryData) {
      return res.status(404).json({ 
        message: "Solicitud de recuperación no encontrada. Por favor, solicita un nuevo código." 
      });
    }
    
    const recoveryData = user.recoveryData;
    
    if (new Date() > new Date(recoveryData.expiresAt)) {
      return res.status(401).json({ 
        message: "El código ha expirado. Por favor, solicita un nuevo código." 
      });
    }
    
    if (recoveryData.code !== code) {
      return res.status(400).json({ 
        message: "El código ingresado es incorrecto. Por favor, verifica e intenta nuevamente." 
      });
    }
    
    const verificationToken = jwt.sign(
      {
        email: normalizedEmail,
        userType: recoveryData.userType,
        userId: recoveryData.userId,
        verified: true
      },
      config.JWT.secret,
      { expiresIn: "20m" }
    );
    
    return res.status(200).json({ 
      message: "Código verificado correctamente. Ahora puedes establecer una nueva contraseña.",
      token: verificationToken
    });
    
  } catch (error) {
    console.error("[PasswordRecovery] Error al verificar código:", error);
    return res.status(500).json({ 
      message: "Error al verificar el código. Por favor, intenta más tarde." 
    });
  }
};

passwordRecoveryController.resetPassword = async (req, res) => {
  const { newPassword, token } = req.body;
  
  if (!newPassword || typeof newPassword !== 'string' || !token) {
    return res.status(400).json({ 
      message: "Se requiere una nueva contraseña válida y token de verificación" 
    });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ 
      message: "La contraseña debe tener al menos 6 caracteres" 
    });
  }
  
  try {
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, config.JWT.secret);
    } catch (err) {
      return res.status(401).json({ 
        message: "Token inválido o expirado. Por favor, inicia el proceso nuevamente." 
      });
    }
    
    if (!decodedToken.verified) {
      return res.status(401).json({ 
        message: "Token no verificado. Por favor, verifica el código primero." 
      });
    }
    
    const { email, userType, userId } = decodedToken;
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    
    let user;
    
    if (userType === "user") {
      user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: "Usuario no encontrado." 
        });
      }
      user.password = hashedPassword;
      user.recoveryData = undefined; // Eliminar recoveryData
      await user.save();
    } else if (userType === "employee") {
      user = await employeeModel.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: "Empleado no encontrado." 
        });
      }
      user.password = hashedPassword;
      user.recoveryData = undefined; // Eliminar recoveryData
      await user.save();
    } else {
      return res.status(400).json({ message: "Tipo de usuario no válido" });
    }
    
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