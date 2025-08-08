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
    
    // Logo actualizado
    const logoUrl = `${baseUrl}/logo.png`;
    const currentYear = new Date().getFullYear();
    
    const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        
        <!-- Header -->
        <div style="background: #ffffff; padding: 40px 30px 30px; text-align: center; border-bottom: 3px solid #06AED5;">
          <img src="${logoUrl}" alt="Diambars" style="height: 60px; margin-bottom: 20px;" />
          <h1 style="color: #086788; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Verifica tu cuenta</h1>
          <p style="color: #593D3B; margin: 10px 0 0; font-size: 16px;">¡Bienvenido a Diambars!</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="background: linear-gradient(135deg, #FFF1D0 0%, #ffffff 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #E5446D;">
            <p style="font-size: 18px; color: #593D3B; margin: 0; font-weight: 500;">¡Hola ${userName || 'Usuario'}!</p>
          </div>
          
          <p style="font-size: 16px; color: #495057; line-height: 1.6; margin: 0 0 25px;">
            Gracias por registrarte en Diambars. Para verificar tu cuenta y activar todas las funcionalidades, por favor haz clic en el botón de abajo:
          </p>
          
          <!-- Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #06AED5 0%, #086788 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 15px rgba(6,174,213,0.3); transition: all 0.3s ease;">
              Verificar mi cuenta
            </a>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
            <p style="font-size: 14px; color: #6c757d; margin: 0 0 10px; font-weight: 500;">O copia y pega el siguiente enlace:</p>
            <p style="font-size: 13px; color: #086788; word-break: break-all; margin: 0; font-family: 'Monaco', 'Menlo', monospace;">
              ${verificationUrl}
            </p>
          </div>
          
          <div style="border-top: 1px solid #e9ecef; padding-top: 25px; margin-top: 30px;">
            <p style="font-size: 14px; color: #6c757d; margin: 0; text-align: center;">
              Si no solicitaste este correo, puedes ignorarlo de forma segura.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 16px; color: #593D3B; margin: 0; font-weight: 500;">¡Gracias!</p>
            <p style="font-size: 14px; color: #E5446D; margin: 5px 0 0; font-weight: 500;">El equipo de Diambars</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="font-size: 13px; color: #6c757d; margin: 0 0 10px;">
            &copy; ${currentYear} Diambars. Todos los derechos reservados.
          </p>
          <div style="margin-top: 15px;">
            <a href="${config.server.FRONTEND_URL}" style="color: #086788; text-decoration: none; font-size: 13px; font-weight: 500;">
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
    const logoUrl = `${config.server.FRONTEND_URL}/logo.png`;
    const currentYear = new Date().getFullYear();
    
    const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ffffff 0%, #FFF1D0 100%); padding: 40px 30px 30px; text-align: center; border-bottom: 3px solid #E5446D;">
          <img src="${logoUrl}" alt="Diambars" style="height: 60px; margin-bottom: 20px;" />
          <h1 style="color: #593D3B; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">¡Bienvenido a Diambars!</h1>
          <p style="color: #086788; margin: 10px 0 0; font-size: 16px;">Tu cuenta ha sido verificada</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="background: linear-gradient(135deg, #06AED5, #ffffff); border-radius: 8px; padding: 1px; margin-bottom: 30px;">
            <div style="background: #ffffff; border-radius: 7px; padding: 25px;">
              <p style="font-size: 18px; color: #593D3B; margin: 0; font-weight: 500; text-align: center;">
                ¡Hola ${userName || 'Usuario'}!
              </p>
            </div>
          </div>
          
          <p style="font-size: 16px; color: #495057; line-height: 1.6; margin: 0 0 25px; text-align: center;">
            ¡Tu cuenta ha sido verificada exitosamente! Ahora puedes acceder a todas las funcionalidades de Diambars.
          </p>
          
          <!-- Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #E5446D 0%, #593D3B 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 15px rgba(229,68,109,0.3);">
              Iniciar sesión
            </a>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 4px solid #06AED5;">
            <h3 style="color: #086788; margin: 0 0 15px; font-size: 18px; font-weight: 600;">¿Qué puedes hacer ahora?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #495057;">
              <li style="margin-bottom: 8px;">Crear diseños personalizados</li>
              <li style="margin-bottom: 8px;">Solicitar cotizaciones</li>
              <li style="margin-bottom: 8px;">Realizar pedidos</li>
              <li>Hacer seguimiento de tus órdenes</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 16px; color: #593D3B; margin: 0; font-weight: 500;">¡Gracias por unirte a nuestra comunidad!</p>
            <p style="font-size: 14px; color: #E5446D; margin: 5px 0 0; font-weight: 500;">El equipo de Diambars</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="font-size: 13px; color: #6c757d; margin: 0 0 10px;">
            &copy; ${currentYear} Diambars. Todos los derechos reservados.
          </p>
          <div style="margin-top: 15px;">
            <a href="${config.server.FRONTEND_URL}" style="color: #086788; text-decoration: none; font-size: 13px; font-weight: 500;">
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