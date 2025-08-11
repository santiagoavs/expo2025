import { config } from "../config.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: config.email.host || "smtp.gmail.com",
  port: config.email.port || 587,
  secure: config.email.secure === true,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

export async function sendRecoveryCode(email, code, userName) {
  const logoUrl = `${config.server.FRONTEND_URL}/logo.png`;
  const currentYear = new Date().getFullYear();
  
  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; line-height: 1.5;">
    <!-- Header -->
    <div style="text-align: center; padding: 30px 0 20px; border-bottom: 1px solid #eaeaea;">
      <img src="${logoUrl}" alt="Diambars" style="height: 40px;" />
      <h1 style="font-size: 24px; font-weight: 600; margin: 20px 0 10px; color: #1a1a1a;">Recuperación de contraseña</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px 25px;">
      <p style="margin: 0 0 25px;">Hola ${userName || 'Usuario'},</p>
      
      <p style="margin: 0 0 25px;">Hemos recibido una solicitud para restablecer tu contraseña. Utiliza el siguiente código de verificación:</p>
      
      <!-- Code Box -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; border: 1px solid #eaeaea;">
        <div style="font-family: monospace; font-size: 32px; font-weight: 600; letter-spacing: 2px; color: #1a1a1a;">
          ${code}
        </div>
      </div>
      
      <p style="margin: 0 0 25px;">Este código es válido por <strong>20 minutos</strong>.</p>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 30px 0; font-size: 14px;">
        <p style="margin: 0;">Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña permanecerá igual.</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="padding: 20px 0; text-align: center; border-top: 1px solid #eaeaea; font-size: 14px; color: #666;">
      <p style="margin: 0 0 10px;">&copy; ${currentYear} Diambars. Todos los derechos reservados.</p>
      <p style="margin: 0;">Equipo de Soporte</p>
    </div>
  </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: config.email.from || `"Soporte Diambars" <${config.email.user}>`,
      to: email,
      subject: "Tu código de verificación | Diambars",
      html
    });
    
    console.log("Email enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error al enviar email de recuperación:", error);
    return false;
  }
}

// Función para enviar confirmación 
export async function sendPasswordResetConfirmation(email, userName) {
  const loginUrl = `${config.server.FRONTEND_URL}/login`;
  const logoUrl = `${config.server.FRONTEND_URL}/logo.png`;
  const currentYear = new Date().getFullYear();
  
  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; line-height: 1.5;">
    <!-- Header -->
    <div style="text-align: center; padding: 30px 0 20px; border-bottom: 1px solid #eaeaea;">
      <img src="${logoUrl}" alt="Diambars" style="height: 40px;" />
      <h1 style="font-size: 24px; font-weight: 600; margin: 20px 0 10px; color: #1a1a1a;">Contraseña actualizada</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px 25px;">
      <p style="margin: 0 0 25px;">Hola ${userName || 'Usuario'},</p>
      
      <p style="margin: 0 0 25px;">Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tus nuevas credenciales.</p>
      
      <!-- Success Icon -->
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: #f0f9f0; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; text-align: center; border: 1px solid #e0f0e0;">
          <span style="font-size: 36px; color: #2e7d32;">✓</span>
        </div>
      </div>
      
      <!-- Login Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 500;">
          Iniciar sesión
        </a>
      </div>
      
      <!-- Security Note -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 30px 0; font-size: 14px;">
        <p style="margin: 0 0 10px; font-weight: 500;">Consejos de seguridad:</p>
        <ul style="margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 5px;">Usa una contraseña única</li>
          <li style="margin-bottom: 5px;">No compartas tus credenciales</li>
          <li>Considera autenticación en dos pasos</li>
        </ul>
      </div>
      
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 30px 0; font-size: 14px;">
        <p style="margin: 0;">Si no realizaste este cambio, por favor contacta a nuestro equipo de soporte inmediatamente.</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="padding: 20px 0; text-align: center; border-top: 1px solid #eaeaea; font-size: 14px; color: #666;">
      <p style="margin: 0 0 10px;">&copy; ${currentYear} Diambars. Todos los derechos reservados.</p>
      <p style="margin: 0;">Equipo de Soporte</p>
    </div>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: config.email.from || `"Soporte Diambars" <${config.email.user}>`,
      to: email,
      subject: "Contraseña actualizada | Diambars",
      html
    });
    return true;
  } catch (error) {
    console.error("Error al enviar confirmación de contraseña restablecida:", error);
    return false;
  }
}