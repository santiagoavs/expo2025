import userModel from "../models/users.js";
import { sendWelcomeEmail } from "../utils/email.service.js";

const verifyEmailController = {};

// Verificar token de correo electrónico
verifyEmailController.verifyEmail = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token no proporcionado." });
  }

  try {
    // Buscar usuario con el token de verificación
    const user = await userModel.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Token inválido o expirado. Solicita un nuevo correo de verificación." 
      });
    }

    // Verificar usuario y limpiar campos de verificación
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Enviar correo de bienvenida
    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({ 
      message: "¡Correo electrónico verificado correctamente! Ahora puedes iniciar sesión." 
    });
  } catch (error) {
    console.error("Error al verificar correo:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error.message 
    });
  }
};

// Reenviar correo de verificación
verifyEmailController.resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Correo electrónico no proporcionado." });
  }

  try {
    // Buscar usuario por correo electrónico
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (user.verified) {
      return res.status(400).json({ 
        message: "Esta cuenta ya ha sido verificada. Puedes iniciar sesión." 
      });
    }

    // Generar nuevo token de verificación
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Enviar nuevo correo de verificación
    await sendVerificationEmail(email, verificationToken, user.name);

    return res.status(200).json({ 
      message: "Se ha enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada." 
    });
  } catch (error) {
    console.error("Error al reenviar correo de verificación:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error.message 
    });
  }
};

export default verifyEmailController;