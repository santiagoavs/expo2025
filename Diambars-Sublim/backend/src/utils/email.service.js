import nodemailer from "nodemailer";
import { config } from "../config.js";

// Crear transportador de correo electrónico
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

// Función para enviar correo de verificación
export async function sendVerificationEmail(email, token, userName) {
  try {
    console.log('=== GENERANDO URL DE VERIFICACIÓN ===');
    
    // Asegurar que la URL base no termine con barra diagonal
    const baseUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || 'http://localhost:5173';
    const verificationUrl = `${baseUrl}/verify-email/${token}`;
    
    console.log('Base URL (limpia):', baseUrl);
    console.log('Token:', token);
    console.log('URL generada:', verificationUrl);
    
    // Actualizar con el logo real de Diambars
    const logoUrl = "https://i.imgur.com/ZAatbcL.png";
    const currentYear = new Date().getFullYear();
    const html = `
    <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
          <img src="${logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Verifica tu cuenta de Diambars</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #444; margin-top: 0;">Hola ${userName || ''},</p>
          <p style="font-size: 16px; color: #444;">Gracias por registrarte en Diambars. Para verificar tu cuenta y activar todas las funcionalidades, por favor haz clic en el botón de abajo:</p>
          
          <!-- Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 16px;">
              Verificar mi cuenta
            </a>
          </div>
          
          <p style="font-size: 16px; color: #444;">O copia y pega el siguiente enlace en tu navegador:</p>
          <p style="font-size: 14px; color: #666; word-break: break-all;">
            ${verificationUrl}
          </p>
          
          <p style="font-size: 16px; color: #444; margin-top: 30px;">Si no solicitaste este correo, puedes ignorarlo de forma segura.</p>
          
          <p style="font-size: 16px; color: #444; margin-bottom: 0;">¡Gracias!</p>
          <p style="font-size: 16px; color: #444; margin-top: 5px;">El equipo de Diambars</p>
        </div>
        
        <!-- Footer -->
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
    
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: "Verifica tu correo electrónico | Diambars",
      html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente, Message ID:', result.messageId);
    
    return result;
  } catch (error) {
    console.error('Error al enviar email de verificación:', error);
    throw error;
  }
}

// Función para enviar correo de bienvenida después de verificación
export async function sendWelcomeEmail(email, userName) {
  try {
    const loginUrl = `${config.server.FRONTEND_URL}/login`;
    const logoUrl = "https://i.imgur.com/ZAatbcL.png";
    const currentYear = new Date().getFullYear();
    
    const html = `
    <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
          <img src="${logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">¡Bienvenido a Diambars!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #444; margin-top: 0;">¡Hola ${userName || ''}!</p>
          <p style="font-size: 16px; color: #444;">¡Tu cuenta ha sido verificada exitosamente! Ahora puedes acceder a todas las funcionalidades de Diambars.</p>
          
          <!-- Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 16px;">
              Iniciar sesión
            </a>
          </div>
          
          <p style="font-size: 16px; color: #444; margin-top: 30px;">¡Gracias por unirte a nuestra comunidad!</p>
          
          <p style="font-size: 16px; color: #444; margin-bottom: 0;">Saludos cordiales,</p>
          <p style="font-size: 16px; color: #444; margin-top: 5px;">El equipo de Diambars</p>
        </div>
        
        <!-- Footer -->
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

    const result = await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: "¡Bienvenido a Diambars!",
      html
    });
    
    return result;
    
  } catch (error) {
    console.error('Error en sendWelcomeEmail:', error);
    throw error;
  }
}

export default {
  sendVerificationEmail,
  sendWelcomeEmail
};