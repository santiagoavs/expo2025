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

/**
 * Envía una notificación al usuario y/o administradores según el tipo
 * @param {Object} options - Opciones de notificación
 * @returns {Promise} - Resultado del envío
 */
export const sendNotification = async (options) => {
  const { type, data } = options;
  
  // Configuración por defecto para todos los correos
  const defaultConfig = {
    from: config.email.from,
    logoUrl: `${config.server.FRONTEND_URL}/logo.png`,
    frontendUrl: config.server.FRONTEND_URL,
    currentYear: new Date().getFullYear()
  };
  
  // Seleccionar plantilla según tipo
  switch (type) {
    case "NEW_DESIGN_REQUEST":
      return sendNewDesignRequestNotification(data, defaultConfig);
      
    case "DESIGN_QUOTED":
      return sendDesignQuotedNotification(data, defaultConfig);
      
    case "QUOTE_ACCEPTED":
      return sendQuoteAcceptedNotification(data, defaultConfig);
      
    case "QUOTE_REJECTED":
      return sendQuoteRejectedNotification(data, defaultConfig);
      
    case "NEW_ORDER":
      return sendNewOrderNotification(data, defaultConfig);
      
    case "ORDER_STATUS_UPDATED":
      return sendOrderStatusUpdatedNotification(data, defaultConfig);
      
    case "PAYMENT_CONFIRMED":
      return sendPaymentConfirmedNotification(data, defaultConfig);
      
    default:
      throw new Error(`Tipo de notificación no soportado: ${type}`);
  }
};

/**
 * Función para generar el header común de los emails
 */
const generateEmailHeader = (config, title, subtitle, accentColor = "#06AED5") => `
  <div style="background: #ffffff; padding: 40px 30px 30px; text-align: center; border-bottom: 3px solid ${accentColor};">
    <img src="${config.logoUrl}" alt="Diambars" style="height: 60px; margin-bottom: 20px;" />
    <h1 style="color: #593D3B; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">${title}</h1>
    ${subtitle ? `<p style="color: #086788; margin: 10px 0 0; font-size: 16px;">${subtitle}</p>` : ''}
  </div>
`;

/**
 * Función para generar el footer común de los emails
 */
const generateEmailFooter = (config) => `
  <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
    <p style="font-size: 13px; color: #6c757d; margin: 0 0 10px;">
      &copy; ${config.currentYear} Diambars. Todos los derechos reservados.
    </p>
    <div style="margin-top: 15px;">
      <a href="${config.frontendUrl}" style="color: #086788; text-decoration: none; font-size: 13px; font-weight: 500;">
        Visita nuestro sitio web
      </a>
    </div>
  </div>
`;

/**
 * Envía notificación sobre nuevo diseño a los administradores
 */
async function sendNewDesignRequestNotification(data, config) {
  const adminEmails = ["admin@diambars.com"];
  
  const subject = "Nuevo diseño personalizado para cotizar";
  const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        ${generateEmailHeader(config, "Nuevo diseño para cotizar", "Acción requerida", "#E5446D")}
        
        <div style="padding: 40px 30px;">
          <div style="background: linear-gradient(135deg, #FFF1D0 0%, #ffffff 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #E5446D;">
            <p style="font-size: 16px; color: #593D3B; margin: 0; font-weight: 500;">
              Se ha recibido un nuevo diseño personalizado que requiere cotización
            </p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
                <span style="color: #6c757d; font-weight: 500;">Producto:</span>
                <span style="color: #593D3B; font-weight: 600;">${data.productName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #6c757d; font-weight: 500;">ID del diseño:</span>
                <span style="color: #086788; font-weight: 600; font-family: monospace;">${data.designId}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${config.frontendUrl}/admin/designs/${data.designId}" style="display: inline-block; background: linear-gradient(135deg, #E5446D 0%, #593D3B 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 15px rgba(229,68,109,0.3);">
              Ver y cotizar diseño
            </a>
          </div>
          
          <div style="background: #06AED5; background: linear-gradient(135deg, #06AED5 0%, #086788 100%); border-radius: 8px; padding: 20px; color: #ffffff; text-align: center;">
            <p style="margin: 0; font-size: 14px; opacity: 0.95;">
              💡 La cotización oportuna mejora la experiencia del cliente y aumenta las posibilidades de conversión
            </p>
          </div>
        </div>
        
        ${generateEmailFooter(config)}
      </div>
    </div>
  `;
  
  return await transporter.sendMail({
    from: config.from,
    to: adminEmails.join(','),
    subject,
    html
  });
}

/**
 * Envía notificación al usuario cuando su diseño ha sido cotizado
 */
async function sendDesignQuotedNotification(data, config) {
  const subject = "Tu diseño personalizado ha sido cotizado";
  const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        ${generateEmailHeader(config, "¡Tu diseño ha sido cotizado!", "Revisa los detalles")}
        
        <div style="padding: 40px 30px;">
          <div style="background: linear-gradient(135deg, #FFF1D0 0%, #ffffff 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #06AED5;">
            <p style="font-size: 18px; color: #593D3B; margin: 0; font-weight: 500;">¡Hola ${data.userName || 'Usuario'}!</p>
          </div>
          
          <p style="font-size: 16px; color: #495057; line-height: 1.6; margin: 0 0 25px;">
            Buenas noticias! Hemos revisado tu diseño personalizado para <strong style="color: #086788;">${data.productName}</strong> y tenemos una cotización lista.
          </p>
          
          <div style="background: linear-gradient(135deg, #06AED5, #ffffff); border-radius: 8px; padding: 1px; margin: 30px 0;">
            <div style="background: #ffffff; border-radius: 7px; padding: 30px;">
              <div style="text-align: center;">
                <div style="margin-bottom: 20px;">
                  <span style="color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Precio</span>
                  <div style="color: #E5446D; font-size: 32px; font-weight: 700; margin: 5px 0;">$${data.price.toFixed(2)}</div>
                </div>
                <div>
                  <span style="color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Tiempo de producción</span>
                  <div style="color: #086788; font-size: 24px; font-weight: 600; margin: 5px 0;">${data.productionDays} días</div>
                </div>
              </div>
            </div>
          </div>
          
          <p style="font-size: 16px; color: #495057; line-height: 1.6; margin: 25px 0; text-align: center;">
            Por favor revisa la cotización y confírmanos si deseas proceder con tu pedido.
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${config.frontendUrl}/designs/${data.designId}" style="display: inline-block; background: linear-gradient(135deg, #06AED5 0%, #086788 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 15px rgba(6,174,213,0.3);">
              Ver cotización completa
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 16px; color: #593D3B; margin: 0; font-weight: 500;">¡Gracias por elegir Diambars!</p>
            <p style="font-size: 14px; color: #E5446D; margin: 5px 0 0; font-weight: 500;">El equipo de Diambars</p>
          </div>
        </div>
        
        ${generateEmailFooter(config)}
      </div>
    </div>
  `;
  
  return await transporter.sendMail({
    from: config.from,
    to: data.userEmail,
    subject,
    html
  });
}

/**
 * Envía notificación al administrador cuando un usuario acepta una cotización
 */
async function sendQuoteAcceptedNotification(data, config) {
  const adminEmails = ["admin@diambars.com"];
  
  const subject = "Cotización aceptada - Nuevo pedido";
  const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        ${generateEmailHeader(config, "Cotización aceptada", "¡Nuevo pedido confirmado!", "#06AED5")}
        
        <div style="padding: 40px 30px;">
          <div style="background: linear-gradient(135deg, #06AED5, #ffffff); border-radius: 8px; padding: 1px; margin-bottom: 30px;">
            <div style="background: #ffffff; border-radius: 7px; padding: 25px; text-align: center;">
              <p style="font-size: 18px; color: #593D3B; margin: 0; font-weight: 500;">
                🎉 ¡Buenas noticias! Un cliente ha aceptado una cotización
              </p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
                <span style="color: #6c757d; font-weight: 500;">Cliente:</span>
                <span style="color: #593D3B; font-weight: 600;">${data.userName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
                <span style="color: #6c757d; font-weight: 500;">Producto:</span>
                <span style="color: #086788; font-weight: 600;">${data.productName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #6c757d; font-weight: 500;">Orden #:</span>
                <span style="color: #E5446D; font-weight: 600; font-family: monospace;">${data.orderNumber}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${config.frontendUrl}/admin/orders/${data.orderId}" style="display: inline-block; background: linear-gradient(135deg, #06AED5 0%, #086788 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 15px rgba(6,174,213,0.3);">
              Ver detalles del pedido
            </a>
          </div>
          
          <div style="background: #FFF1D0; border-radius: 8px; padding: 20px; border-left: 4px solid #E5446D;">
            <p style="margin: 0; font-size: 14px; color: #593D3B;">
              💼 Puedes comenzar la producción una vez confirmes los detalles del pedido
            </p>
          </div>
        </div>
        
        ${generateEmailFooter(config)}
      </div>
    </div>
  `;
  
  return await transporter.sendMail({
    from: config.from,
    to: adminEmails.join(','),
    subject,
    html
  });
}

/**
 * Envía notificación al administrador cuando un usuario rechaza una cotización
 */
async function sendQuoteRejectedNotification(data, config) {
  const adminEmails = ["admin@diambars.com"];
  
  const subject = "Cotización rechazada";
  const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        ${generateEmailHeader(config, "Cotización rechazada", "Oportunidad de mejora", "#593D3B")}
        
        <div style="padding: 40px 30px;">
          <div style="background: linear-gradient(135deg, #FFF1D0 0%, #ffffff 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #593D3B;">
            <p style="font-size: 16px; color: #593D3B; margin: 0; font-weight: 500;">
              Un cliente ha rechazado una cotización
            </p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
                <span style="color: #6c757d; font-weight: 500;">Cliente:</span>
                <span style="color: #593D3B; font-weight: 600;">${data.userName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
                <span style="color: #6c757d; font-weight: 500;">Producto:</span>
                <span style="color: #086788; font-weight: 600;">${data.productName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #6c757d; font-weight: 500;">Motivo:</span>
                <span style="color: #E5446D; font-weight: 600;">${data.reason || 'No especificado'}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${config.frontendUrl}/admin/designs/${data.designId}" style="display: inline-block; background: linear-gradient(135deg, #593D3B 0%, #E5446D 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 15px rgba(89,61,59,0.3);">
              Ver diseño
            </a>
          </div>
          
          <div style="background: #06AED5; background: linear-gradient(135deg, #06AED5 0%, #086788 100%); border-radius: 8px; padding: 20px; color: #ffffff; text-align: center;">
            <p style="margin: 0; font-size: 14px; opacity: 0.95;">
              💡 Considera contactar al cliente para entender mejor sus necesidades y ofrecer una cotización alternativa
            </p>
          </div>
        </div>
        
        ${generateEmailFooter(config)}
      </div>
    </div>
  `;
  
  return await transporter.sendMail({
    from: config.from,
    to: adminEmails.join(','),
    subject,
    html
  });
}

/**
 * Envía notificación al administrador cuando se crea un nuevo pedido
 */
async function sendNewOrderNotification(data, config) {
  const adminEmails = ["admin@diambars.com"];
  
  const subject = "Nuevo pedido recibido";
  const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        ${generateEmailHeader(config, "Nuevo pedido recibido", "Acción requerida", "#E5446D")}
        
        <div style="padding: 40px 30px;">
          <div style="background: linear-gradient(135deg, #E5446D, #ffffff); border-radius: 8px; padding: 1px; margin-bottom: 30px;">
            <div style="background: #ffffff; border-radius: 7px; padding: 25px; text-align: center;">
              <p style="font-size: 18px; color: #593D3B; margin: 0; font-weight: 500;">
                📦 Se ha recibido un nuevo pedido
              </p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
                <span style="color: #6c757d; font-weight: 500;">Orden #:</span>
                <span style="color: #E5446D; font-weight: 600; font-family: monospace;">${data.orderNumber}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
                <span style="color: #6c757d; font-weight: 500;">Cliente:</span>
                <span style="color: #593D3B; font-weight: 600;">${data.userName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
                <span style="color: #6c757d; font-weight: 500;">Email:</span>
                <span style="color: #086788; font-weight: 600;">${data.userEmail}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">
                <span style="color: #6c757d; font-weight: 500;">Producto:</span>
                <span style="color: #593D3B; font-weight: 600;">${data.productName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #6c757d; font-weight: 500;">Total:</span>
                <span style="color: #E5446D; font-weight: 700; font-size: 18px;">${data.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${config.frontendUrl}/admin/orders/${data.orderId}" style="display: inline-block; background: linear-gradient(135deg, #E5446D 0%, #593D3B 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 15px rgba(229,68,109,0.3);">
              Ver detalles del pedido
            </a>
          </div>
          
          <div style="background: #06AED5; background: linear-gradient(135deg, #06AED5 0%, #086788 100%); border-radius: 8px; padding: 20px; color: #ffffff; text-align: center;">
            <p style="margin: 0; font-size: 14px; opacity: 0.95;">
              ⚡ Por favor revisa los detalles y confirma el pedido lo antes posible
            </p>
          </div>
        </div>
        
        ${generateEmailFooter(config)}
      </div>
    </div>
  `;
  
  return await transporter.sendMail({
    from: config.from,
    to: adminEmails.join(','),
    subject,
    html
  });
}

/**
 * Envía notificación al cliente cuando cambia el estado de su pedido
 */
async function sendOrderStatusUpdatedNotification(data, config) {
  const statusMessages = {
    pending_approval: "Pendiente de aprobación",
    quoted: "Cotizado",
    approved: "Aprobado",
    rejected: "Rechazado",
    in_production: "En producción",
    ready_for_delivery: "Listo para entrega",
    delivered: "Entregado",
    completed: "Completado",
    cancelled: "Cancelado"
  };
  
  const statusDescriptions = {
    in_production: "¡Buenas noticias! Tu pedido está ahora en producción. Estamos trabajando para entregar tu diseño personalizado lo antes posible.",
    ready_for_delivery: "¡Tu pedido está listo! Ahora podemos coordinar la entrega según tus preferencias.",
    completed: "Tu pedido ha sido completado y entregado. ¡Gracias por elegir Diambars!",
    cancelled: "Tu pedido ha sido cancelado. Si tienes preguntas, por favor contáctanos."
  };
  
  const statusColors = {
    in_production: "#06AED5",
    ready_for_delivery: "#E5446D",
    completed: "#086788",
    cancelled: "#593D3B"
  };
  
  const subject = `Actualización de tu pedido #${data.orderNumber}`;
  
  const statusName = statusMessages[data.newStatus] || data.newStatus;
  const description = statusDescriptions[data.newStatus] || `Tu pedido ha sido actualizado a: ${statusName}`;
  const statusColor = statusColors[data.newStatus] || "#06AED5";
  
  const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        ${generateEmailHeader(config, "Actualización de tu pedido", "Nuevas noticias", statusColor)}
        
        <div style="padding: 40px 30px;">
          <div style="background: linear-gradient(135deg, #FFF1D0 0%, #ffffff 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid ${statusColor};">
            <p style="font-size: 18px; color: #593D3B; margin: 0; font-weight: 500;">¡Hola ${data.userName || 'Usuario'}!</p>
          </div>
          
          <p style="font-size: 16px; color: #495057; line-height: 1.6; margin: 0 0 25px;">
            ${description}
          </p>
          
          <div style="background: linear-gradient(135deg, ${statusColor}, #ffffff); border-radius: 8px; padding: 1px; margin: 30px 0;">
            <div style="background: #ffffff; border-radius: 7px; padding: 30px;">
              <div style="display: grid; gap: 20px;">
                <div style="text-align: center;">
                  <span style="color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Orden</span>
                  <div style="color: #593D3B; font-size: 24px; font-weight: 700; margin: 5px 0; font-family: monospace;">${data.orderNumber}</div>
                </div>
                <div style="text-align: center;">
                  <span style="color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Estado actual</span>
                  <div style="color: ${statusColor}; font-size: 20px; font-weight: 600; margin: 5px 0;">${statusName}</div>
                </div>
                ${data.notes ? `
                <div style="background: #f8f9fa; border-radius: 6px; padding: 15px;">
                  <span style="color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Notas</span>
                  <div style="color: #495057; font-size: 14px; margin: 5px 0; line-height: 1.4;">${data.notes}</div>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${config.frontendUrl}/orders/${data.orderId}" style="display: inline-block; background: linear-gradient(135deg, ${statusColor} 0%, #593D3B 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
              Ver detalles del pedido
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 16px; color: #593D3B; margin: 0; font-weight: 500;">¡Gracias por elegir Diambars!</p>
            <p style="font-size: 14px; color: #E5446D; margin: 5px 0 0; font-weight: 500;">El equipo de Diambars</p>
          </div>
        </div>
        
        ${generateEmailFooter(config)}
      </div>
    </div>
  `;
  
  return await transporter.sendMail({
    from: config.from,
    to: data.userEmail,
    subject,
    html
  });
}

/**
 * Envía confirmación de pago al cliente
 */
async function sendPaymentConfirmedNotification(data, config) {
  const subject = `Pago confirmado - Pedido #${data.orderNumber}`;
  
  const paymentMethods = {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia bancaria",
    wompi: "Wompi",
    paypal: "PayPal",
    other: "Otro método"
  };
  
  const paymentMethod = paymentMethods[data.method] || data.method;
  
  const html = `
    <div style="background: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e9ecef;">
        ${generateEmailHeader(config, "Pago confirmado", "¡Transacción exitosa!", "#086788")}
        
        <div style="padding: 40px 30px;">
          <div style="background: linear-gradient(135deg, #FFF1D0 0%, #ffffff 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #086788;">
            <p style="font-size: 18px; color: #593D3B; margin: 0; font-weight: 500;">¡Hola ${data.userName || 'Usuario'}!</p>
          </div>
          
          <p style="font-size: 16px; color: #495057; line-height: 1.6; margin: 0 0 25px; text-align: center;">
            Hemos confirmado el pago de tu pedido. ¡Gracias por tu compra!
          </p>
          
          <div style="background: linear-gradient(135deg, #086788, #ffffff); border-radius: 8px; padding: 1px; margin: 30px 0;">
            <div style="background: #ffffff; border-radius: 7px; padding: 30px;">
              <div style="display: grid; gap: 20px;">
                <div style="text-align: center;">
                  <span style="color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Orden</span>
                  <div style="color: #593D3B; font-size: 24px; font-weight: 700; margin: 5px 0; font-family: monospace;">${data.orderNumber}</div>
                </div>
                <div style="text-align: center;">
                  <span style="color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Monto</span>
                  <div style="color: #E5446D; font-size: 32px; font-weight: 700; margin: 5px 0;">${data.amount.toFixed(2)}</div>
                </div>
                <div style="text-align: center;">
                  <span style="color: #6c757d; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Método de pago</span>
                  <div style="color: #086788; font-size: 18px; font-weight: 600; margin: 5px 0;">${paymentMethod}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${config.frontendUrl}/orders/${data.orderId}" style="display: inline-block; background: linear-gradient(135deg, #086788 0%, #06AED5 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 15px rgba(8,103,136,0.3);">
              Ver detalles del pedido
            </a>
          </div>
          
          <div style="background: #06AED5; background: linear-gradient(135deg, #06AED5 0%, #086788 100%); border-radius: 8px; padding: 20px; color: #ffffff; text-align: center;">
            <p style="margin: 0; font-size: 14px; opacity: 0.95;">
              📦 Seguiremos actualizándote sobre el estado de tu pedido
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 16px; color: #593D3B; margin: 0; font-weight: 500;">¡Gracias por elegir Diambars!</p>
            <p style="font-size: 14px; color: #E5446D; margin: 5px 0 0; font-weight: 500;">El equipo de Diambars</p>
          </div>
        </div>
        
        ${generateEmailFooter(config)}
      </div>
    </div>
  `;
  
  return await transporter.sendMail({
    from: config.from,
    to: data.userEmail,
    subject,
    html
  });
}

export default {
  sendNotification
};