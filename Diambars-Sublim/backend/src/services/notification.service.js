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
    logoUrl: "https://i.imgur.com/ZAatbcL.png",
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
 * Envía notificación sobre nuevo diseño a los administradores
 */
async function sendNewDesignRequestNotification(data, config) {
  // En producción, aquí se obtendría la lista de emails de administradores
  const adminEmails = ["admin@diambars.com"];
  
  const subject = "Nuevo diseño personalizado para cotizar";
  const html = `
    <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
          <img src="${config.logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Nuevo diseño para cotizar</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #444; margin-top: 0;">Se ha recibido un nuevo diseño personalizado que requiere cotización:</p>
          
          <div style="background: #f9f9f9; border-radius: 4px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Producto:</strong> ${data.productName}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>ID del diseño:</strong> ${data.designId}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/admin/designs/${data.designId}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 16px;">
              Ver y cotizar diseño
            </a>
          </div>
          
          <p style="font-size: 16px; color: #444;">La cotización oportuna mejora la experiencia del cliente y aumenta las posibilidades de conversión.</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            &copy; ${config.currentYear} Diambars. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Enviar a todos los administradores
  const result = await transporter.sendMail({
    from: config.from,
    to: adminEmails.join(','),
    subject,
    html
  });
  
  return result;
}

/**
 * Envía notificación al usuario cuando su diseño ha sido cotizado
 */
async function sendDesignQuotedNotification(data, config) {
  const subject = "Tu diseño personalizado ha sido cotizado";
  const html = `
    <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
          <img src="${config.logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">¡Tu diseño ha sido cotizado!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #444; margin-top: 0;">Hola ${data.userName || ''},</p>
          <p style="font-size: 16px; color: #444;">Buenas noticias! Hemos revisado tu diseño personalizado para ${data.productName} y tenemos una cotización lista.</p>
          
          <div style="background: #f9f9f9; border-radius: 4px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-size: 16px;"><strong>Precio:</strong> $${data.price.toFixed(2)}</p>
            <p style="margin: 0 0 10px; font-size: 16px;"><strong>Tiempo de producción:</strong> ${data.productionDays} días</p>
          </div>
          
          <p style="font-size: 16px; color: #444;">Por favor revisa la cotización y confírmanos si deseas proceder con tu pedido.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/designs/${data.designId}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 16px;">
              Ver cotización
            </a>
          </div>
          
          <p style="font-size: 16px; color: #444; margin-top: 30px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
          
          <p style="font-size: 16px; color: #444; margin-bottom: 0;">¡Gracias por elegir Diambars!</p>
          <p style="font-size: 16px; color: #444; margin-top: 5px;">El equipo de Diambars</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            &copy; ${config.currentYear} Diambars. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Enviar al usuario
  const result = await transporter.sendMail({
    from: config.from,
    to: data.userEmail,
    subject,
    html
  });
  
  return result;
}

/**
 * Envía notificación al administrador cuando un usuario acepta una cotización
 */
async function sendQuoteAcceptedNotification(data, config) {
  // En producción, aquí se obtendría la lista de emails de administradores
  const adminEmails = ["admin@diambars.com"];
  
  const subject = "Cotización aceptada - Nuevo pedido";
  const html = `
    <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
          <img src="${config.logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Cotización aceptada</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #444; margin-top: 0;">¡Buenas noticias! Un cliente ha aceptado una cotización:</p>
          
          <div style="background: #f9f9f9; border-radius: 4px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Cliente:</strong> ${data.userName}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Producto:</strong> ${data.productName}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Orden #:</strong> ${data.orderNumber}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/admin/orders/${data.orderId}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 16px;">
              Ver pedido
            </a>
          </div>
          
          <p style="font-size: 16px; color: #444;">Puedes comenzar la producción una vez confirmes los detalles del pedido.</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            &copy; ${config.currentYear} Diambars. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Enviar a todos los administradores
  const result = await transporter.sendMail({
    from: config.from,
    to: adminEmails.join(','),
    subject,
    html
  });
  
  return result;
}

/**
 * Envía notificación al administrador cuando un usuario rechaza una cotización
 */
async function sendQuoteRejectedNotification(data, config) {
  // En producción, aquí se obtendría la lista de emails de administradores
  const adminEmails = ["admin@diambars.com"];
  
  const subject = "Cotización rechazada";
  const html = `
    <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
          <img src="${config.logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Cotización rechazada</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #444; margin-top: 0;">Un cliente ha rechazado una cotización:</p>
          
          <div style="background: #f9f9f9; border-radius: 4px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Cliente:</strong> ${data.userName}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Producto:</strong> ${data.productName}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Motivo:</strong> ${data.reason || 'No especificado'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/admin/designs/${data.designId}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 16px;">
              Ver diseño
            </a>
          </div>
          
          <p style="font-size: 16px; color: #444;">Considere contactar al cliente para entender mejor sus necesidades y ofrecer una cotización alternativa.</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            &copy; ${config.currentYear} Diambars. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Enviar a todos los administradores
  const result = await transporter.sendMail({
    from: config.from,
    to: adminEmails.join(','),
    subject,
    html
  });
  
  return result;
}

/**
 * Envía notificación al administrador cuando se crea un nuevo pedido
 */
async function sendNewOrderNotification(data, config) {
  // En producción, aquí se obtendría la lista de emails de administradores
  const adminEmails = ["admin@diambars.com"];
  
  const subject = "Nuevo pedido recibido";
  const html = `
    <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
          <img src="${config.logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Nuevo pedido</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #444; margin-top: 0;">Se ha recibido un nuevo pedido:</p>
          
          <div style="background: #f9f9f9; border-radius: 4px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Orden #:</strong> ${data.orderNumber}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Cliente:</strong> ${data.userName}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Email:</strong> ${data.userEmail}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Producto:</strong> ${data.productName}</p>
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Total:</strong> $${data.total.toFixed(2)}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/admin/orders/${data.orderId}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 16px;">
              Ver detalles del pedido
            </a>
          </div>
          
          <p style="font-size: 16px; color: #444;">Por favor revisa los detalles y confirma el pedido lo antes posible.</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            &copy; ${config.currentYear} Diambars. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Enviar a todos los administradores
  const result = await transporter.sendMail({
    from: config.from,
    to: adminEmails.join(','),
    subject,
    html
  });
  
  return result;
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
  
  const subject = `Actualización de tu pedido #${data.orderNumber}`;
  
  // Obtener mensaje apropiado según estado
  const statusName = statusMessages[data.newStatus] || data.newStatus;
  const description = statusDescriptions[data.newStatus] || `Tu pedido ha sido actualizado a: ${statusName}`;
  
  const html = `
    <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
          <img src="${config.logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Actualización de tu pedido</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #444; margin-top: 0;">Hola ${data.userName || ''},</p>
          <p style="font-size: 16px; color: #444;">${description}</p>
          
          <div style="background: #f9f9f9; border-radius: 4px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-size: 16px;"><strong>Orden #:</strong> ${data.orderNumber}</p>
            <p style="margin: 0 0 10px; font-size: 16px;"><strong>Estado actual:</strong> ${statusName}</p>
            ${data.notes ? `<p style="margin: 0; font-size: 16px;"><strong>Notas:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/orders/${data.orderId}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 16px;">
              Ver detalles del pedido
            </a>
          </div>
          
          <p style="font-size: 16px; color: #444; margin-top: 30px;">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
          
          <p style="font-size: 16px; color: #444; margin-bottom: 0;">¡Gracias por elegir Diambars!</p>
          <p style="font-size: 16px; color: #444; margin-top: 5px;">El equipo de Diambars</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            &copy; ${config.currentYear} Diambars. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Enviar al cliente
  const result = await transporter.sendMail({
    from: config.from,
    to: data.userEmail,
    subject,
    html
  });
  
  return result;
}

/**
 * Envía confirmación de pago al cliente
 */
async function sendPaymentConfirmedNotification(data, config) {
  const subject = `Pago confirmado - Pedido #${data.orderNumber}`;
  
  // Obtener nombre del método de pago
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
    <div style="background: #f6f6f6; padding: 40px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); padding: 30px; text-align: center;">
          <img src="${config.logoUrl}" alt="Diambars" style="height: 80px; margin-bottom: 15px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Pago confirmado</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #444; margin-top: 0;">Hola ${data.userName || ''},</p>
          <p style="font-size: 16px; color: #444;">Hemos confirmado el pago de tu pedido. ¡Gracias por tu compra!</p>
          
          <div style="background: #f9f9f9; border-radius: 4px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-size: 16px;"><strong>Orden #:</strong> ${data.orderNumber}</p>
            <p style="margin: 0 0 10px; font-size: 16px;"><strong>Monto:</strong> $${data.amount.toFixed(2)}</p>
            <p style="margin: 0; font-size: 16px;"><strong>Método de pago:</strong> ${paymentMethod}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.frontendUrl}/orders/${data.orderId}" style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%); color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 4px; font-size: 16px;">
              Ver detalles del pedido
            </a>
          </div>
          
          <p style="font-size: 16px; color: #444;">Seguiremos actualizándote sobre el estado de tu pedido.</p>
          
          <p style="font-size: 16px; color: #444; margin-top: 30px; margin-bottom: 0;">¡Gracias por elegir Diambars!</p>
          <p style="font-size: 16px; color: #444; margin-top: 5px;">El equipo de Diambars</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            &copy; ${config.currentYear} Diambars. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Enviar al cliente
  const result = await transporter.sendMail({
    from: config.from,
    to: data.userEmail,
    subject,
    html
  });
  
  return result;
}

export default {
  sendNotification
};