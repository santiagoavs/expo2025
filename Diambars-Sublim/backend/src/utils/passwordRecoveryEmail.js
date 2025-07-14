import nodemailer from "nodemailer";
import { config } from "../config.js";

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
  const logoUrl = "https://i.imgur.com/ZAatbcL.png";
  const currentYear = new Date().getFullYear();
  
  const html = `
  <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
        <img src="${logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Recuperación de Contraseña</h1>
      </div>
      
      <div style="padding: 40px 30px;">
        <p style="font-size: 16px; color: #444; margin-top: 0;">Hola ${userName || ''},</p>
        <p style="font-size: 16px; color: #444;">Hemos recibido una solicitud para restablecer tu contraseña en Diambars. Utiliza el siguiente código para continuar con el proceso:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background-color: #f0f0f0; padding: 15px 25px; border-radius: 8px; border: 1px solid #ddd; font-family: monospace;">
            <span style="font-size: 26px; letter-spacing: 5px; font-weight: bold; color: #333;">${code}</span>
          </div>
        </div>
        
        <p style="font-size: 16px; color: #444;">Este código es válido por 20 minutos. Después de este tiempo, tendrás que solicitar uno nuevo.</p>
        
        <p style="font-size: 16px; color: #444; margin-top: 30px;">Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña permanecerá igual.</p>
        
        <p style="font-size: 16px; color: #444; margin-bottom: 0;">Saludos,</p>
        <p style="font-size: 16px; color: #444; margin-top: 5px;">El equipo de Diambars</p>
      </div>
      
      <div style="background: #f0f0f0; padding: 20px; text-align: center;">
        <p style="font-size: 14px; color: #888; margin: 0;">
          &copy; ${currentYear} Diambars. Todos los derechos reservados.
        </p>
        <div style="margin-top: 10px;">
          <a href="${config.server.FRONTEND_URL}" style="color: #8a2be2; text-decoration: none; font-size: 14px;">
            Visita nuestro sitio web
          </a>
        </div>
      </div>
    </div>
  </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: config.email.from || `"Soporte Diambars" <${config.email.user}>`,
      to: email,
      subject: "Código de recuperación de contraseña | Diambars",
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
  const logoUrl = "https://i.imgur.com/ZAatbcL.png";
  const currentYear = new Date().getFullYear();
  
  const html = `
  <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
        <img src="${logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Contraseña Restablecida</h1>
      </div>
      
      <div style="padding: 40px 30px;">
        <p style="font-size: 16px; color: #444; margin-top: 0;">Hola ${userName || ''},</p>
        <p style="font-size: 16px; color: #444;">Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión en tu cuenta de Diambars con tu nueva contraseña.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 16px;">
            Iniciar sesión
          </a>
        </div>
        
        <p style="font-size: 16px; color: #444; margin-top: 30px;">Si no realizaste este cambio, por favor contacta inmediatamente con nuestro soporte.</p>
        
        <p style="font-size: 16px; color: #444; margin-bottom: 0;">Saludos,</p>
        <p style="font-size: 16px; color: #444; margin-top: 5px;">El equipo de Diambars</p>
      </div>
      
      <div style="background: #f0f0f0; padding: 20px; text-align: center;">
        <p style="font-size: 14px; color: #888; margin: 0;">
          &copy; ${currentYear} Diambars. Todos los derechos reservados.
        </p>
        <div style="margin-top: 10px;">
          <a href="${config.server.FRONTEND_URL}" style="color: #8a2be2; text-decoration: none; font-size: 14px;">
            Visita nuestro sitio web
          </a>
        </div>
      </div>
    </div>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: config.email.from || `"Soporte Diambars" <${config.email.user}>`,
      to: email,
      subject: "Contraseña restablecida exitosamente | Diambars",
      html
    });
    return true;
  } catch (error) {
    console.error("Error al enviar confirmación de contraseña restablecida:", error);
    return false;
  }
}