// services/notification.service.js
import nodemailer from 'nodemailer';

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // o tu servicio de email preferido
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Servicio principal de notificaciones
 */
export const sendNotification = async ({ type, data }) => {
  try {
    console.log(`📧 Enviando notificación: ${type}`);
    
    switch (type) {
      case 'NEW_ORDER':
        await sendNewOrderNotification(data);
        break;
        
      case 'ORDER_STATUS_UPDATED':
        await sendOrderStatusUpdateNotification(data);
        break;
        
      case 'PAYMENT_SUCCESSFUL':
        await sendPaymentSuccessNotification(data);
        break;
        
      case 'PAYMENT_FAILED':
        await sendPaymentFailedNotification(data);
        break;
        
      case 'PRODUCTION_UPDATE':
        await sendProductionUpdateNotification(data);
        break;
        
      case 'ORDER_DELIVERED':
        await sendOrderDeliveredNotification(data);
        break;
        
      case 'ORDER_COMPLETED':
        await sendOrderCompletedNotification(data);
        break;
        
      case 'NEW_DESIGN_REQUEST':
        await sendNewDesignRequestNotification(data);
        break;
        
      case 'DESIGN_QUOTED':
        await sendDesignQuotedNotification(data);
        break;
        
      case 'QUOTE_ACCEPTED':
        await sendQuoteAcceptedNotification(data);
        break;
        
      case 'QUOTE_REJECTED':
        await sendQuoteRejectedNotification(data);
        break;
        
      case 'PHOTO_APPROVED':
      case 'PHOTO_REJECTED':
        await sendPhotoApprovalNotification(data, type);
        break;
        
      case 'PRODUCTION_PHOTO_UPLOADED':
        await sendProductionPhotoNotification(data);
        break;
        
      case 'PAYMENT_REMINDER':
        await sendPaymentReminderNotification(data);
        break;
        
      case 'CUSTOM_MESSAGE':
        await sendCustomMessageNotification(data);
        break;
        
      default:
        console.warn(`⚠️ Tipo de notificación no reconocido: ${type}`);
    }
    
    console.log(`✅ Notificación ${type} enviada exitosamente`);
    
  } catch (error) {
    console.error(`❌ Error enviando notificación ${type}:`, error);
    throw error;
  }
};

// ==================== NOTIFICACIONES DE PEDIDOS ====================

async function sendNewOrderNotification(data) {
  const { orderNumber, userName, userEmail, productName, total, paymentMethod } = data;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'admin@diambars.com', // Email del administrador
    subject: `🆕 Nuevo Pedido - ${orderNumber}`,
    html: `
      <h2>Nuevo Pedido Recibido</h2>
      <p><strong>Número de Pedido:</strong> ${orderNumber}</p>
      <p><strong>Cliente:</strong> ${userName} (${userEmail})</p>
      <p><strong>Producto:</strong> ${productName}</p>
      <p><strong>Total:</strong> $${total}</p>
      <p><strong>Método de Pago:</strong> ${paymentMethod}</p>
      <p>Por favor revisa el pedido en el panel de administración.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

async function sendOrderStatusUpdateNotification(data) {
  const { orderNumber, newStatus, userName, userEmail, notes } = data;
  
  const statusMessages = {
    'quoted': 'Tu pedido ha sido cotizado',
    'approved': 'Tu pedido ha sido aprobado',
    'in_production': 'Tu pedido está en producción',
    'ready_for_delivery': 'Tu pedido está listo para entrega',
    'delivered': 'Tu pedido ha sido entregado',
    'completed': 'Tu pedido ha sido completado',
    'cancelled': 'Tu pedido ha sido cancelado'
  };
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `📦 Actualización de Pedido - ${orderNumber}`,
    html: `
      <h2>${statusMessages[newStatus] || 'Actualización de tu pedido'}</h2>
      <p><strong>Hola ${userName},</strong></p>
      <p><strong>Pedido:</strong> ${orderNumber}</p>
      <p><strong>Estado:</strong> ${newStatus}</p>
      ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
      <p>Puedes ver más detalles en tu panel de cliente.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

async function sendPaymentSuccessNotification(data) {
  const { orderNumber, amount, paymentMethod, userName, userEmail } = data;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `✅ Pago Confirmado - ${orderNumber}`,
    html: `
      <h2>Pago Recibido Exitosamente</h2>
      <p><strong>Hola ${userName},</strong></p>
      <p>Hemos recibido tu pago por el pedido <strong>${orderNumber}</strong></p>
      <p><strong>Monto:</strong> $${amount}</p>
      <p><strong>Método:</strong> ${paymentMethod}</p>
      <p>Tu pedido será procesado y entregado según el tiempo estimado.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

async function sendPaymentFailedNotification(data) {
  const { orderNumber, reason, userName, userEmail } = data;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `❌ Error en Pago - ${orderNumber}`,
    html: `
      <h2>Error al Procesar Pago</h2>
      <p><strong>Hola ${userName},</strong></p>
      <p>Hubo un problema al procesar el pago para tu pedido <strong>${orderNumber}</strong></p>
      <p><strong>Motivo:</strong> ${reason}</p>
      <p>Por favor, intenta realizar el pago nuevamente o contacta a nuestro equipo de soporte.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

async function sendProductionUpdateNotification(data) {
  const { orderNumber, stage, stageLabel, progress, userName, userEmail, photoUrl } = data;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `🏭 Actualización de Producción - ${orderNumber}`,
    html: `
      <h2>Progreso de Producción</h2>
      <p><strong>Hola ${userName},</strong></p>
      <p>Tu pedido <strong>${orderNumber}</strong> tiene una actualización:</p>
      <p><strong>Etapa Actual:</strong> ${stageLabel}</p>
      <p><strong>Progreso:</strong> ${progress}%</p>
      ${photoUrl ? `<p><strong>Foto del Progreso:</strong></p><img src="${photoUrl}" style="max-width: 300px;">` : ''}
    `
  };
  
  await transporter.sendMail(mailOptions);
}

// ==================== NOTIFICACIONES DE DISEÑOS ====================

async function sendNewDesignRequestNotification(data) {
  const { designId, productName, userId } = data;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'admin@diambars.com',
    subject: `🎨 Nueva Solicitud de Diseño`,
    html: `
      <h2>Nueva Solicitud de Diseño</h2>
      <p><strong>ID de Diseño:</strong> ${designId}</p>
      <p><strong>Producto:</strong> ${productName}</p>
      <p><strong>Usuario:</strong> ${userId}</p>
      <p>Por favor revisa y cotiza el diseño en el panel de administración.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

async function sendDesignQuotedNotification(data) {
  const { price, productionDays, userEmail, userName, productName } = data;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `💰 Cotización Lista - ${productName}`,
    html: `
      <h2>Tu Diseño Ha Sido Cotizado</h2>
      <p><strong>Hola ${userName},</strong></p>
      <p>Hemos cotizado tu diseño personalizado:</p>
      <p><strong>Producto:</strong> ${productName}</p>
      <p><strong>Precio:</strong> $${price}</p>
      <p><strong>Tiempo de Producción:</strong> ${productionDays} días</p>
      <p>Puedes aceptar o rechazar la cotización desde tu panel de cliente.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

// ==================== NOTIFICACIONES ADICIONALES ====================

async function sendPaymentReminderNotification(data) {
  const { orderNumber, amount, userName, userEmail, productName } = data;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `⏰ Recordatorio de Pago - ${orderNumber}`,
    html: `
      <h2>Recordatorio de Pago Pendiente</h2>
      <p><strong>Hola ${userName},</strong></p>
      <p>Te recordamos que tienes un pago pendiente:</p>
      <p><strong>Pedido:</strong> ${orderNumber}</p>
      <p><strong>Producto:</strong> ${productName}</p>
      <p><strong>Monto:</strong> $${amount}</p>
      <p>Por favor completa tu pago para que podamos procesar tu pedido.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

async function sendCustomMessageNotification(data) {
  const { orderNumber, message, userName, userEmail } = data;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `📝 Mensaje sobre tu Pedido - ${orderNumber}`,
    html: `
      <h2>Mensaje del Equipo Diambars</h2>
      <p><strong>Hola ${userName},</strong></p>
      <p>Tenemos un mensaje sobre tu pedido <strong>${orderNumber}</strong>:</p>
      <p>${message}</p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

// Implementar las funciones restantes de manera similar...
async function sendOrderDeliveredNotification(data) {
  // Implementación similar a las anteriores
}

async function sendOrderCompletedNotification(data) {
  // Implementación similar a las anteriores
}

async function sendQuoteAcceptedNotification(data) {
  // Implementación similar a las anteriores
}

async function sendQuoteRejectedNotification(data) {
  // Implementación similar a las anteriores
}

async function sendPhotoApprovalNotification(data, type) {
  // Implementación similar a las anteriores
}

async function sendProductionPhotoNotification(data) {
  // Implementación similar a las anteriores
}

export default { sendNotification };