import crypto from 'crypto';
import userModel from "../models/users.js";
import { sendWelcomeEmail, sendVerificationEmail } from "../services/email/email.service.js";

const verifyEmailController = {};

/**
 * Verifica el token de correo electrónico enviado al usuario.
 * Si el token es válido y no ha expirado, marca la cuenta como verificada,
 * limpia los campos de verificación y envía un correo de bienvenida.
 */
verifyEmailController.verifyEmail = async (req, res) => {
  const { token } = req.params;

  // Validar que el token esté presente en la petición
  if (!token) {
    return res.status(400).json({ message: "Token no proporcionado." });
  }

  try {
    // Buscar usuario con ese token y que esté dentro del tiempo de expiración
    const user = await userModel.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() }
    });

    // Si no existe un usuario válido, se retorna un error
    if (!user) {
      return res.status(400).json({ 
        message: "Token inválido o expirado. Solicita un nuevo correo de verificación." 
      });
    }

    // Marcar al usuario como verificado y limpiar campos del token
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Enviar correo de bienvenida al usuario
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

/**
 * Reenvía un nuevo correo de verificación a un usuario no verificado.
 * Genera un nuevo token y actualiza la fecha de expiración.
 */
verifyEmailController.resendVerification = async (req, res) => {
  console.log('=== RESEND VERIFICATION ===');
  
  const { email } = req.body;
  console.log('Email recibido:', email);

  // Validar que se haya proporcionado un correo
  if (!email) {
    console.log('ERROR: Email no proporcionado');
    return res.status(400).json({ message: "Correo electrónico no proporcionado." });
  }

  try {
    // Buscar el usuario por su correo
    const user = await userModel.findOne({ email });
    console.log('Usuario encontrado:', user ? 'SÍ' : 'NO');

    // Validar que el usuario existe
    if (!user) {
      console.log('ERROR: Usuario no encontrado');
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Validar que la cuenta aún no esté verificada
    if (user.verified) {
      console.log('ERROR: Usuario ya verificado');
      return res.status(400).json({ 
        message: "Esta cuenta ya ha sido verificada. Puedes iniciar sesión." 
      });
    }

    // Generar nuevo token de verificación y actualizar expiración
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    console.log('Token generado:', verificationToken);

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();
    console.log('Usuario actualizado en BD');

    // Enviar el nuevo correo con el token
    try {
      console.log('Intentando enviar email...');
      await sendVerificationEmail(email, verificationToken, user.name);
      console.log('Email enviado exitosamente');
    } catch (emailError) {
      console.error('Error específico del email:', emailError);
      throw emailError;
    }

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