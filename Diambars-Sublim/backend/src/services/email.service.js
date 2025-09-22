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

// NUEVA FUNCIÓN: Enviar correo de contacto
export async function sendContactEmail(contactData) {
  const { fullName, email, message } = contactData;
  
  console.log(' Enviando email de contacto...');
  
  /* <img src="${logoUrl}" alt="Diambars" style="height: 60px; margin-bottom: 20px; filter: brightness(0) invert(1);" /> */
  
  try {
    const baseUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || 'http://localhost:5173';
    const logoUrl = `${baseUrl}/logo.png`;
    const currentYear = new Date().getFullYear();
    
    const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #06AED5 0%, #086788 100%); color: white; padding: 40px 30px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">Nueva Consulta</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Formulario de Contacto - Diambars</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <!-- Información del Cliente -->
          <div style="background: linear-gradient(135deg, #FFF1D0 0%, #ffffff 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #06AED5;">
            <h2 style="color: #593D3B; margin: 0 0 20px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
              Información del Cliente
            </h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #593D3B; width: 120px;">Nombre:</td>
                <td style="padding: 8px 0; color: #495057;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #593D3B;">Email:</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${email}" style="color: #06AED5; text-decoration: none; font-weight: 500;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #593D3B;">Fecha:</td>
                <td style="padding: 8px 0; color: #495057;">
                  ${new Date().toLocaleString('es-ES', {
                    timeZone: 'America/El_Salvador',
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            </table>
          </div>

          <!-- Mensaje -->
          <div style="background: linear-gradient(135deg, #FFF1D0 0%, #ffffff 100%); border-radius: 12px; padding: 25px; border-left: 4px solid #E5446D;">
            <h2 style="color: #593D3B; margin: 0 0 15px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
              Mensaje
            </h2>
            
            <div style="background: rgba(255, 246, 226, 0.8); padding: 20px; border-radius: 8px; border: 1px solid rgba(230, 207, 156, 0.3); font-size: 16px; line-height: 1.6; color: #593D3B; white-space: pre-wrap;">${message}</div>
          </div>

          <!-- Acciones Rápidas -->
          <div style="text-align: center; margin-top: 30px; padding: 25px; background: linear-gradient(135deg, rgba(6, 174, 213, 0.1), rgba(255, 241, 208, 0.1)); border-radius: 12px;">
            <h3 style="color: #593D3B; margin: 0 0 20px; font-size: 18px;">Acciones Rápidas</h3>
            
            <div style="display: flex; justify-content: center;"> 
              <a href="mailto:${email}?subject=Re: Tu consulta en Diambars&body=Hola ${fullName},%0A%0AGracias por contactarnos. En respuesta a tu consulta:%0A%0A"${message.substring(0, 50)}..."%0A%0A" style="display: inline-block; background: linear-gradient(135deg, #06AED5 0%, #086788 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 25px; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(6,174,213,0.3);">
                Responder por Email
              </a>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0 0 10px; color: #6c757d; font-size: 13px;">
            Este correo fue generado automáticamente desde el formulario de contacto de <strong>Diambars</strong>
          </p>
          <p style="margin: 0; color: #6c757d; font-size: 13px; opacity: 0.8;">
            Para responder, usa el botón "Responder por Email" o contesta directamente a este correo
          </p>
          <div style="margin-top: 15px;">
            <p style="font-size: 13px; color: #6c757d; margin: 0;">
              &copy; ${currentYear} Diambars. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
    `;

    const mailOptions = {
      from: config.email.from,
      to: "diambars.sublim@gmail.com", // Email de destino fijo
      replyTo: email, // Para poder responder directamente al usuario
      subject: `Nueva consulta de ${fullName} - Diambars`,
      html,
      text: `
        Nueva consulta de contacto - Diambars
        
        Información del Cliente:
        - Nombre: ${fullName}
        - Email: ${email}
        - Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'America/El_Salvador' })}
        
        Mensaje:
        ${message}
        
        Responde directamente a este email para contactar al cliente.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email de contacto enviado exitosamente:', result.messageId);
    
    return result;
    
  } catch (error) {
    console.error('Error enviando email de contacto:', error);
    throw new Error(`Error al enviar email de contacto: ${error.message}`);
  }
}

// NUEVA FUNCIÓN: Enviar correo de solicitud de sublimación
export async function sendSublimationRequestEmail(requestData) {
  const { subject, email, message } = requestData;
  
  console.log('Enviando email de solicitud...');
  
  try {
    const baseUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || 'http://localhost:5173';
    const logoUrl = `${baseUrl}/logo.png`;
    const currentYear = new Date().getFullYear();
    
    const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E5446D 0%, #8B1538 100%); color: white; padding: 40px 30px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">Nueva Solicitud de Sublimación</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Proyecto Personalizado - Diambars</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <!-- Información del Cliente -->
          <div style="background: linear-gradient(135deg, #FFF1D0 0%, #ffffff 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #E5446D;">
            <h2 style="color: #8B1538; margin: 0 0 20px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
              Información del Cliente
            </h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #8B1538; width: 140px;">Tipo de Proyecto:</td>
                <td style="padding: 8px 0; color: #495057; font-weight: 500;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #8B1538;">Email:</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${email}" style="color: #E5446D; text-decoration: none; font-weight: 500;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #8B1538;">Fecha:</td>
                <td style="padding: 8px 0; color: #495057;">
                  ${new Date().toLocaleString('es-ES', {
                    timeZone: 'America/El_Salvador',
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            </table>
          </div>

          <!-- Detalles del Proyecto -->
          <div style="background: linear-gradient(135deg, rgba(229, 68, 109, 0.05) 0%, #ffffff 100%); border-radius: 12px; padding: 25px; border-left: 4px solid #8B1538;">
            <h2 style="color: #8B1538; margin: 0 0 15px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
              Detalles del Proyecto
            </h2>
            
            <div style="background: rgba(255, 246, 226, 0.8); padding: 20px; border-radius: 8px; border: 1px solid rgba(229, 68, 109, 0.2); font-size: 16px; line-height: 1.6; color: #593D3B; white-space: pre-wrap;">${message}</div>
          </div>

          <!-- Acciones Rápidas -->
          <div style="text-align: center; margin-top: 30px; padding: 25px; background: linear-gradient(135deg, rgba(229, 68, 109, 0.1), rgba(255, 241, 208, 0.1)); border-radius: 12px;">
            <h3 style="color: #8B1538; margin: 0 0 20px; font-size: 18px;">Acciones Rápidas</h3>
            
            <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;"> 
              <a href="mailto:${email}?subject=Re: ${subject} - Diambars&body=Hola,%0A%0AGracias por contactarnos sobre tu proyecto de sublimación:%0A%0A"${subject}"%0A%0AHemos revisado tu solicitud y..." style="display: inline-block; background: linear-gradient(135deg, #E5446D 0%, #8B1538 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 25px; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(229,68,109,0.3); margin: 5px;">
                Responder por Email
              </a>
            </div>
          </div>

          <!-- Información Adicional -->
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #E5446D;">
            <h3 style="color: #8B1538; margin: 0 0 15px; font-size: 16px; font-weight: 600;">Próximos Pasos Recomendados:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #495057; line-height: 1.6;">
              <li>Revisar los detalles del proyecto y evaluar viabilidad</li>
              <li>Preparar cotización basada en especificaciones</li>
              <li>Contactar al cliente para aclarar dudas adicionales</li>
              <li>Enviar propuesta detallada con tiempos de entrega</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0 0 10px; color: #6c757d; font-size: 13px;">
            Este correo fue generado automáticamente desde el formulario de solicitud de sublimación de <strong>Diambars</strong>
          </p>
          <p style="margin: 0; color: #6c757d; font-size: 13px; opacity: 0.8;">
            Para responder, usa los botones de acción rápida o contesta directamente a este correo
          </p>
          <div style="margin-top: 15px;">
            <p style="font-size: 13px; color: #6c757d; margin: 0;">
              &copy; ${currentYear} Diambars. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
    `;

    const mailOptions = {
      from: config.email.from,
      to: "diambars.sublim@gmail.com", // Email de destino fijo
      replyTo: email, // Para poder responder directamente al usuario
      subject: `Nueva Solicitud: ${subject} - Diambars`,
      html,
      text: `
        Nueva Solicitud de Sublimación - Diambars
        
        Tipo de Proyecto: ${subject}
        Email del Cliente: ${email}
        Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'America/El_Salvador' })}
        
        Detalles del Proyecto:
        ${message}
        
        Responde directamente a este email para contactar al cliente.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email de solicitud de sublimación enviado exitosamente:', result.messageId);
    
    return result;
    
  } catch (error) {
    console.error('Error enviando email de solicitud de sublimación:', error);
    throw new Error(`Error al enviar email de solicitud de sublimación: ${error.message}`);
  }
}

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendContactEmail,
  sendSublimationRequestEmail
};