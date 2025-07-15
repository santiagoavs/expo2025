// passwordRecovery.controller.js
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import userModel from "../models/users.js";
import employeeModel from "../models/employees.js";
import { config } from "../config.js";
import { sendRecoveryCode, sendPasswordResetConfirmation } from "../utils/passwordRecoveryEmail.js";

const passwordRecoveryController = {};

/**
 * Solicita un código de recuperación de contraseña
 *
 * - Requiere un email válido.
 * - Busca el usuario por email (en usuarios y empleados).
 * - Genera un código de 6 dígitos y lo almacena temporalmente.
 * - Envía el código al correo del usuario.
 */
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

    // Buscar en usuarios y luego en empleados
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

    // Crear código aleatorio de 6 dígitos y su metadata
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const recoveryData = {
      code: recoveryCode,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutos
      email: normalizedEmail,
      userType,
      userId: user._id
    };

    // Guardar en el modelo correspondiente
    user.recoveryData = recoveryData;
    await user.save();

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

/**
 * Verifica el código de recuperación ingresado por el usuario.
 *
 * - Comprueba si coincide y no ha expirado.
 * - Si es válido, devuelve un token temporal para cambiar la contraseña.
 */
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

    // Crear token para permitir cambio de contraseña
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

/**
 * Cambia la contraseña usando el token de verificación emitido previamente.
 *
 * - Verifica el token JWT.
 * - Encripta la nueva contraseña.
 * - Actualiza en la base de datos y limpia los datos de recuperación.
 * - Envía un correo confirmando el cambio.
 */
passwordRecoveryController.resetPassword = async (req, res) => {
  const { newPassword, token } = req.body;

  if (!newPassword || !token) {
    return res.status(400).json({ 
      success: false,
      message: "Se requieren ambos campos: newPassword y token",
      received: req.body
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT.secret);

    if (!decoded.verified) {
      return res.status(401).json({
        success: false,
        message: "Token no verificado"
      });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

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
      message: "Error al cambiar la contraseña",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default passwordRecoveryController;
