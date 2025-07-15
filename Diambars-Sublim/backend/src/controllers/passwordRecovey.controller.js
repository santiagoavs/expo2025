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
  console.log('Datos recibidos:', {
    body: req.body,
    headers: req.headers
  });

  const { newPassword, token } = req.body;
  
  if (!newPassword || !token) {
    console.error('Faltan campos requeridos');
    return res.status(400).json({ 
      success: false,
      message: "Se requieren ambos campos: newPassword y token",
      received: req.body
    });
  }

  try {
    console.log('Verificando token...');
    const decoded = jwt.verify(token, config.JWT.secret);
    console.log('Token decodificado:', decoded);
    
    if (!decoded.verified) {
      return res.status(401).json({
        success: false,
        message: "Token no verificado"
      });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    
    // Actualizar la contraseña según el tipo de usuario
    const Model = decoded.userType === 'user' ? userModel : employeeModel;
    const updateResult = await Model.findByIdAndUpdate(
      decoded.userId,
      { 
        password: hashedPassword,
        $unset: { recoveryData: 1 } 
      },
      { new: true }
    );

    if (!updateResult) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    console.log('Contraseña actualizada para:', updateResult.email);

    // Enviar confirmación por email
    await sendPasswordResetConfirmation(decoded.email, updateResult.name);

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada exitosamente"
    });

  } catch (error) {
    console.error('Error en resetPassword:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default passwordRecoveryController;