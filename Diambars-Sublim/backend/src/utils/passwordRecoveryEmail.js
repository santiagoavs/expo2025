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
  <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
      
      <!-- Header -->
      <div style="background: #ffffff; padding: 40px 30px 30px; text-align: center; border-bottom: 3px solid #A00019;">
        <img src="${logoUrl}" alt="Diambars" style="height: 60px; margin-bottom: 20px;" />
        <h1 style="color: #593D3B; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Recuperación de Contraseña</h1>
        <p style="color: #01446C; margin: 10px 0 0; font-size: 16px;">Código de verificación</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <div style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #A00019;">
          <p style="font-size: 18px; color: #593D3B; margin: 0; font-weight: 500;">¡Hola ${userName || 'Usuario'}!</p>
        </div>
        
        <p style="font-size: 16px; color: #495057; line-height: 1.6; margin: 0 0 25px;">
          Hemos recibido una solicitud para restablecer tu contraseña en Diambars. Utiliza el siguiente código para continuar con el proceso:
        </p>
        
        <!-- Recovery Code -->
        <div style="text-align: center; margin: 35px 0;">
          <div style="background: linear-gradient(135deg, #01446C 0%, rgba(1,68,108,0.8) 100%); border-radius: 12px; padding: 2px; display: inline-block; box-shadow: 0 8px 32px rgba(1,68,108,0.15);">
            <div style="background: #ffffff; border-radius: 10px; padding: 30px 45px; border: 1px solid rgba(1,68,108,0.1);">
              <div style="margin-bottom: 15px;">
                <span style="color: #6c757d; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Tu código de recuperación</span>
              </div>
              <div style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #A00019; text-shadow: 0 2px 4px rgba(160,0,25,0.15); line-height: 1.2;">
                ${code}
              </div>
            </div>
          </div>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #01446C; box-shadow: 0 2px 12px rgba(1,68,108,0.08);">
          <p style="font-size: 14px; color: #593D3B; margin: 0; font-weight: 500;">
            ⏰ <strong>Tiempo de validez:</strong> Este código es válido por 20 minutos
          </p>
        </div>
        
        <div style="background: linear-gradient(135deg, #01446C 0%, rgba(1,68,108,0.9) 100%); border-radius: 12px; padding: 25px; color: #ffffff; text-align: center; margin: 25px 0; box-shadow: 0 4px 20px rgba(1,68,108,0.2);">
          <p style="margin: 0; font-size: 14px; line-height: 1.5; opacity: 0.95;">
            🔐 Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña permanecerá igual.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 16px; color: #593D3B; margin: 0; font-weight: 500;">Saludos,</p>
          <p style="font-size: 14px; color: #A00019; margin: 5px 0 0; font-weight: 500;">El equipo de Diambars</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
        <p style="font-size: 13px; color: #6c757d; margin: 0 0 10px;">
          &copy; ${currentYear} Diambars. Todos los derechos reservados.
        </p>
        <div style="margin-top: 15px;">
          <a href="${config.server.FRONTEND_URL}" style="color: #01446C; text-decoration: none; font-size: 13px; font-weight: 500;">
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
  const logoUrl = `${config.server.FRONTEND_URL}/logo.png`;
  const currentYear = new Date().getFullYear();
  
  const html = `
  <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%); padding: 40px 30px 30px; text-align: center; border-bottom: 3px solid #01446C;">
        <img src="${logoUrl}" alt="Diambars" style="height: 60px; margin-bottom: 20px;" />
        <h1 style="color: #593D3B; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">¡Contraseña Restablecida!</h1>
        <p style="color: #01446C; margin: 10px 0 0; font-size: 16px;">Proceso completado exitosamente</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <div style="background: linear-gradient(135deg, #01446C 0%, rgba(1,68,108,0.8) 100%); border-radius: 12px; padding: 1px; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(1,68,108,0.1);">
          <div style="background: #ffffff; border-radius: 11px; padding: 30px; text-align: center;">
            <p style="font-size: 18px; color: #593D3B; margin: 0; font-weight: 500;">
              ✅ ¡Hola ${userName || 'Usuario'}!
            </p>
          </div>
        </div>
        
        <p style="font-size: 16px; color: #495057; line-height: 1.6; margin: 0 0 25px; text-align: center;">
          Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión en tu cuenta de Diambars con tu nueva contraseña.
        </p>
        
        <!-- Success Icon -->
        <div style="text-align: center; margin: 35px 0;">
          <div style="background: linear-gradient(135deg, #01446C 0%, rgba(1,68,108,0.85) 100%); border-radius: 50%; width: 90px; height: 90px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 25px; box-shadow: 0 8px 32px rgba(1,68,108,0.2);">
            <span style="color: #ffffff; font-size: 40px;">🔓</span>
          </div>
        </div>
        
        <!-- Login Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #01446C 0%, rgba(1,68,108,0.9) 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-size: 16px; box-shadow: 0 6px 24px rgba(1,68,108,0.25); transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.1);">
            Iniciar sesión ahora
          </a>
        </div>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 4px solid #A00019;">
          <h3 style="color: #593D3B; margin: 0 0 15px; font-size: 16px; font-weight: 600;">🔐 Consejos de seguridad:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 14px; line-height: 1.5;">
            <li style="margin-bottom: 5px;">Usa una contraseña única y segura</li>
            <li style="margin-bottom: 5px;">No compartas tus credenciales con nadie</li>
            <li>Considera activar la autenticación en dos pasos</li>
          </ul>
        </div>
        <div style="background: linear-gradient(135deg, #A00019 0%, rgba(160,0,25,0.9) 100%); border-radius: 12px; padding: 25px; color: #ffffff; text-align: center; margin: 30px 0; box-shadow: 0 4px 20px rgba(160,0,25,0.2);">
          <p style="margin: 0; font-size: 14px; line-height: 1.5; opacity: 0.95;">
            🚨 Si no realizaste este cambio, contacta inmediatamente con nuestro soporte
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 16px; color: #593D3B; margin: 0; font-weight: 500;">Saludos,</p>
          <p style="font-size: 14px; color: #A00019; margin: 5px 0 0; font-weight: 500;">El equipo de Diambars</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
        <p style="font-size: 13px; color: #6c757d; margin: 0 0 10px;">
          &copy; ${currentYear} Diambars. Todos los derechos reservados.
        </p>
        <div style="margin-top: 15px;">
          <a href="${config.server.FRONTEND_URL}" style="color: #01446C; text-decoration: none; font-size: 13px; font-weight: 500;">
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