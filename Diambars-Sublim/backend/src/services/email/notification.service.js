// services/notificationService.js - Servicio simplificado de notificaciones
import nodemailer from 'nodemailer';
import { config } from '../../config.js';
import { whatsAppService } from '../whatsapp/WhatsAppService.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

export const notificationService = {

  // ==================== CONFIGURACIÓN DE NOTIFICACIONES ====================
  
  /**
   * Verificar si el email está disponible
   */
  async isEmailAvailable() {
    try {
      // Intentar crear una conexión de prueba
      await transporter.verify();
      return true;
    } catch (error) {
      console.log('⚠️ Email no disponible:', error.message);
      return false;
    }
  },

  // ==================== NOTIFICACIONES DE PEDIDOS ====================

  /**
   * Notificar nuevo pedido al admin
   */
  async sendNewOrderNotification(order) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: 'admin@diambars.com',
        subject: `🆕 Nuevo Pedido - ${order.orderNumber}`,
        html: `
          <h2>Nuevo Pedido Recibido</h2>
          <p><strong>Número de Pedido:</strong> ${order.orderNumber}</p>
          <p><strong>Cliente:</strong> ${order.user.name} (${order.user.email})</p>
          <p><strong>Subtotal:</strong> $${order.subtotal}</p>
          <p><strong>Estado:</strong> ${order.status}</p>
          <p><strong>Tipo de Entrega:</strong> ${order.deliveryType}</p>
          <p><strong>Método de Pago:</strong> ${order.payment.method}</p>
          <br>
          <p><strong>IMPORTANTE:</strong> Este pedido requiere cotización manual del admin.</p>
          <p>Revisa el pedido en el panel de administración para cotizar precio final, envío e impuestos.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de nuevo pedido enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de nuevo pedido:', error);
    }
  },

  /**
   * Notificar cotización lista al cliente
   */
  async sendQuoteReadyNotification(data) {
    try {
      const { orderNumber, total, deliveryFee, tax, userEmail, userName } = data;

      const mailOptions = {
        from: config.email.from,
        to: userEmail,
        subject: `💰 Cotización Lista - Pedido ${orderNumber}`,
        html: `
          <h2>Tu Pedido Ha Sido Cotizado</h2>
          <p><strong>Hola ${userName},</strong></p>
          <p>Hemos preparado la cotización final para tu pedido <strong>${orderNumber}</strong>:</p>
          <br>
          <table style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Concepto</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Monto</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Productos</td>
              <td style="padding: 10px; border: 1px solid #ddd;">$${(total - deliveryFee - tax).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Envío</td>
              <td style="padding: 10px; border: 1px solid #ddd;">$${deliveryFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Impuestos</td>
              <td style="padding: 10px; border: 1px solid #ddd;">$${tax.toFixed(2)}</td>
            </tr>
            <tr style="background-color: #e8f5e8; font-weight: bold;">
              <td style="padding: 10px; border: 1px solid #ddd;">TOTAL</td>
              <td style="padding: 10px; border: 1px solid #ddd;">$${total.toFixed(2)}</td>
            </tr>
          </table>
          <br>
          <p>Puedes aceptar o rechazar esta cotización desde tu panel de cliente.</p>
          <p>Si tienes alguna pregunta sobre los precios, no dudes en contactarnos.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de cotización enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de cotización:', error);
    }
  },

  /**
   * Notificar cotización aceptada al admin
   */
  async sendQuoteAcceptedNotification(data) {
    try {
      const { orderNumber, userName, clientNotes } = data;

      const mailOptions = {
        from: config.email.from,
        to: 'admin@diambars.com',
        subject: `✅ Cotización Aceptada - ${orderNumber}`,
        html: `
          <h2>Cotización Aceptada por el Cliente</h2>
          <p><strong>Pedido:</strong> ${orderNumber}</p>
          <p><strong>Cliente:</strong> ${userName}</p>
          ${clientNotes ? `<p><strong>Notas del Cliente:</strong> ${clientNotes}</p>` : ''}
          <br>
          <p><strong>ACCIÓN REQUERIDA:</strong> El pedido está aprobado y listo para producción.</p>
          <p>Puedes comenzar el proceso de producción desde el panel de administración.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de cotización aceptada enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de cotización aceptada:', error);
    }
  },

  /**
   * Notificar cotización rechazada al admin
   */
  async sendQuoteRejectedNotification(data) {
    try {
      const { orderNumber, userName, reason } = data;

      const mailOptions = {
        from: config.email.from,
        to: 'admin@diambars.com',
        subject: `❌ Cotización Rechazada - ${orderNumber}`,
        html: `
          <h2>Cotización Rechazada por el Cliente</h2>
          <p><strong>Pedido:</strong> ${orderNumber}</p>
          <p><strong>Cliente:</strong> ${userName}</p>
          <p><strong>Motivo:</strong> ${reason}</p>
          <br>
          <p>El cliente ha rechazado la cotización. Puedes contactarlo para ajustar los precios o resolver dudas.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de cotización rechazada enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de cotización rechazada:', error);
    }
  },

  /**
   * Notificar actualización de estado al cliente (Email + WhatsApp)
   */
  async sendStatusUpdateNotification(data) {
    try {
      const { orderNumber, newStatus, previousStatus, notes, userEmail, userName, userPhone, order } = data;

      const statusMessages = {
        'quoted': 'Tu pedido ha sido cotizado',
        'approved': 'Tu pedido ha sido aprobado',
        'in_production': 'Tu pedido está en producción',
        'quality_check': 'Tu pedido está en control de calidad',
        'quality_approved': 'Tu pedido ha pasado el control de calidad',
        'packaging': 'Tu pedido está siendo empacado',
        'ready_for_delivery': 'Tu pedido está listo para entrega',
        'out_for_delivery': 'Tu pedido está en camino',
        'delivered': 'Tu pedido ha sido entregado',
        'completed': 'Tu pedido ha sido completado',
        'cancelled': 'Tu pedido ha sido cancelado'
      };

      // Verificar si el email está disponible
      const emailAvailable = await this.isEmailAvailable();
      
      if (emailAvailable) {
        // Enviar email
        const mailOptions = {
          from: config.email.from,
          to: userEmail,
          subject: `📦 Actualización de Pedido - ${orderNumber}`,
          html: `
            <h2>${statusMessages[newStatus] || 'Actualización de tu pedido'}</h2>
            <p><strong>Hola ${userName},</strong></p>
            <p><strong>Pedido:</strong> ${orderNumber}</p>
            <p><strong>Estado Anterior:</strong> ${previousStatus}</p>
            <p><strong>Nuevo Estado:</strong> ${newStatus}</p>
            ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
            <br>
            <p>Puedes ver más detalles en tu panel de cliente o rastrear tu pedido en línea.</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Notificación de actualización de estado enviada por email');
      } else {
        console.log('⚠️ Email no disponible - usando solo WhatsApp');
      }

      // Enviar WhatsApp si el usuario tiene número de teléfono
      if (userPhone && order) {
        try {
          await whatsAppService.sendOrderUpdateWithPhoto(order, newStatus);
          console.log('✅ Notificación de actualización de estado enviada por WhatsApp');
        } catch (whatsappError) {
          console.error('⚠️ Error enviando WhatsApp (no crítico):', whatsappError.message);
        }
      } else if (!emailAvailable && !userPhone) {
        console.log('⚠️ No se puede notificar: Email y WhatsApp no disponibles');
      }

    } catch (error) {
      console.error('❌ Error enviando notificación de actualización:', error);
    }
  },

  // ==================== NOTIFICACIONES DE PRODUCCIÓN ====================

  /**
   * Notificar actualización de producción al cliente
   */
  async sendProductionUpdateNotification(data) {
    try {
      const { orderNumber, stage, stageLabel, progress, userEmail, userName, photoUrl, notes } = data;

      const mailOptions = {
        from: config.email.from,
        to: userEmail,
        subject: `🏭 Actualización de Producción - ${orderNumber}`,
        html: `
          <h2>Progreso de tu Pedido</h2>
          <p><strong>Hola ${userName},</strong></p>
          <p>Tu pedido <strong>${orderNumber}</strong> tiene una actualización de producción:</p>
          <br>
          <p><strong>Etapa Completada:</strong> ${stageLabel}</p>
          <p><strong>Progreso Total:</strong> ${progress}%</p>
          ${notes ? `<p><strong>Notas del Equipo:</strong> ${notes}</p>` : ''}
          ${photoUrl ? `
            <br>
            <p><strong>Foto del Progreso:</strong></p>
            <img src="${photoUrl}" style="max-width: 400px; border-radius: 8px;" alt="Progreso de producción">
          ` : ''}
          <br>
          <p>¡Estamos trabajando duro en tu pedido! Te mantendremos informado de cada paso.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de progreso de producción enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de producción:', error);
    }
  },

  /**
   * Notificar foto subida para aprobación del cliente
   */
  async sendPhotoUploadedNotification(data) {
    try {
      const { orderNumber, stage, photoUrl, userEmail, userName } = data;

      const stageLabels = {
        'printing': 'Impresión',
        'sublimating': 'Sublimación',
        'quality_check': 'Control de Calidad',
        'final': 'Producto Terminado'
      };

      const mailOptions = {
        from: config.email.from,
        to: userEmail,
        subject: `📸 Foto para Aprobación - ${orderNumber}`,
        html: `
          <h2>Necesitamos tu Aprobación</h2>
          <p><strong>Hola ${userName},</strong></p>
          <p>Hemos subido una foto del progreso de tu pedido <strong>${orderNumber}</strong> en la etapa de <strong>${stageLabels[stage] || stage}</strong>.</p>
          <br>
          <p><strong>Foto de ${stageLabels[stage] || stage}:</strong></p>
          <img src="${photoUrl}" style="max-width: 400px; border-radius: 8px;" alt="Foto de producción">
          <br><br>
          <p><strong>¿Apruebas esta etapa?</strong></p>
          <p>Por favor revisa la foto y confirma si está de acuerdo con tus expectativas.</p>
          <p>Puedes aprobar o solicitar cambios desde tu panel de cliente.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de foto subida enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de foto:', error);
    }
  },

  /**
   * Notificar respuesta de aprobación de foto al admin
   */
  async sendPhotoApprovalNotification(data) {
    try {
      const { orderNumber, stage, approved, changeRequested, clientNotes } = data;

      const mailOptions = {
        from: config.email.from,
        to: 'admin@diambars.com',
        subject: `${approved ? '✅' : '🔄'} ${approved ? 'Foto Aprobada' : 'Cambios Solicitados'} - ${orderNumber}`,
        html: `
          <h2>${approved ? 'Cliente Aprobó la Foto' : 'Cliente Solicita Cambios'}</h2>
          <p><strong>Pedido:</strong> ${orderNumber}</p>
          <p><strong>Etapa:</strong> ${stage}</p>
          <p><strong>Estado:</strong> ${approved ? 'Aprobada' : 'Cambios solicitados'}</p>
          ${changeRequested ? `<p><strong>Cambios Solicitados:</strong> ${changeRequested}</p>` : ''}
          ${clientNotes ? `<p><strong>Notas del Cliente:</strong> ${clientNotes}</p>` : ''}
          <br>
          <p><strong>Acción:</strong> ${approved ? 'Continuar con la siguiente etapa' : 'Realizar los cambios solicitados'}</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de aprobación de foto enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de aprobación:', error);
    }
  },

  // ==================== NOTIFICACIONES DE PAGOS ====================

  /**
   * Notificar pago exitoso
   */
  async sendPaymentSuccessNotification(data) {
    try {
      const { orderNumber, amount, paymentMethod, userEmail, userName } = data;

      const mailOptions = {
        from: config.email.from,
        to: userEmail,
        subject: `✅ Pago Confirmado - ${orderNumber}`,
        html: `
          <h2>¡Pago Recibido Exitosamente!</h2>
          <p><strong>Hola ${userName},</strong></p>
          <p>Hemos confirmado el pago de tu pedido <strong>${orderNumber}</strong></p>
          <br>
          <p><strong>Detalles del Pago:</strong></p>
          <ul>
            <li><strong>Monto:</strong> ${amount}</li>
            <li><strong>Método:</strong> ${paymentMethod}</li>
            <li><strong>Estado:</strong> Confirmado</li>
          </ul>
          <br>
          <p>Tu pedido será procesado y te mantendremos informado del progreso.</p>
          <p>¡Gracias por confiar en Diambars Sublim!</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de pago exitoso enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de pago exitoso:', error);
    }
  },

  /**
   * Notificar pago fallido
   */
  async sendPaymentFailedNotification(data) {
    try {
      const { orderNumber, reason, userEmail, userName } = data;

      const mailOptions = {
        from: config.email.from,
        to: userEmail,
        subject: `❌ Error en Pago - ${orderNumber}`,
        html: `
          <h2>Problema con el Pago</h2>
          <p><strong>Hola ${userName},</strong></p>
          <p>Hubo un problema al procesar el pago de tu pedido <strong>${orderNumber}</strong></p>
          <br>
          <p><strong>Motivo:</strong> ${reason}</p>
          <br>
          <p>Por favor, intenta realizar el pago nuevamente o contacta a nuestro equipo de soporte.</p>
          <p>Tu pedido permanecerá reservado mientras resolvemos este inconveniente.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de pago fallido enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de pago fallido:', error);
    }
  },

  /**
   * Notificar confirmación de pago manual
   */
  async sendPaymentConfirmedNotification(data) {
    try {
      const { orderNumber, amount, paymentMethod, userEmail, userName } = data;

      const mailOptions = {
        from: config.email.from,
        to: userEmail,
        subject: `✅ Pago Confirmado Manualmente - ${orderNumber}`,
        html: `
          <h2>Pago Confirmado por Nuestro Equipo</h2>
          <p><strong>Hola ${userName},</strong></p>
          <p>Nuestro equipo ha confirmado manualmente el pago de tu pedido <strong>${orderNumber}</strong></p>
          <br>
          <p><strong>Detalles:</strong></p>
          <ul>
            <li><strong>Monto:</strong> ${amount}</li>
            <li><strong>Método:</strong> ${paymentMethod}</li>
            <li><strong>Estado:</strong> Confirmado</li>
          </ul>
          <br>
          <p>Tu pedido ahora será procesado normalmente.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de pago confirmado enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de pago confirmado:', error);
    }
  },

  /**
   * Notificar pago en efectivo recibido
   */
  async sendCashPaymentReceivedNotification(data) {
    try {
      const { orderNumber, totalAmount, cashReceived, changeGiven, userEmail, userName, location } = data;

      const mailOptions = {
        from: config.email.from,
        to: userEmail,
        subject: `💰 Pago en Efectivo Recibido - ${orderNumber}`,
        html: `
          <h2>¡Pago en Efectivo Confirmado!</h2>
          <p><strong>Hola ${userName},</strong></p>
          <p>Hemos recibido tu pago en efectivo para el pedido <strong>${orderNumber}</strong></p>
          <br>
          <p><strong>Detalles de la Transacción:</strong></p>
          <ul>
            <li><strong>Total del Pedido:</strong> ${totalAmount.toFixed(2)}</li>
            <li><strong>Efectivo Recibido:</strong> ${cashReceived.toFixed(2)}</li>
            <li><strong>Cambio Entregado:</strong> ${changeGiven.toFixed(2)}</li>
            <li><strong>Ubicación:</strong> ${location}</li>
          </ul>
          <br>
          <p>Tu pedido ha sido entregado y completado exitosamente.</p>
          <p>¡Gracias por tu compra!</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de pago en efectivo enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación de pago en efectivo:', error);
    }
  },

  // ==================== NOTIFICACIONES DE FOTOS DE CALIDAD ====================

  /**
   * Enviar foto de calidad por WhatsApp
   */
  async sendQualityPhotoNotification(order, stage, photoUrl, notes = '') {
    try {
      if (!order.user.phoneNumber) {
        console.log('⚠️ Usuario sin número de teléfono, saltando WhatsApp');
        return;
      }

      const message = whatsAppService.buildQualityPhotoMessage(order, stage, photoUrl);
      await whatsAppService.sendPhotoMessage(order.user.phoneNumber, message, photoUrl);
      
      console.log(`✅ Foto de calidad enviada por WhatsApp - Etapa: ${stage}`);
      
    } catch (error) {
      console.error('❌ Error enviando foto de calidad por WhatsApp:', error);
    }
  },

  /**
   * Notificar pedido grande con adelanto
   */
  async sendLargeOrderAdvanceNotification(order, advanceAmount, totalAmount) {
    try {
      // Email al cliente
      const mailOptions = {
        from: config.email.from,
        to: order.user.email,
        subject: `💰 Pedido Grande - Adelanto Requerido - ${order.orderNumber}`,
        html: `
          <h2>Pedido Grande - Adelanto Requerido</h2>
          <p><strong>Hola ${order.user.name},</strong></p>
          <p><strong>Pedido:</strong> ${order.orderNumber}</p>
          <p><strong>Total:</strong> $${totalAmount}</p>
          <p><strong>Adelanto requerido:</strong> $${advanceAmount} (30%)</p>
          <p><strong>Saldo restante:</strong> $${totalAmount - advanceAmount}</p>
          <br>
          <p>Para pedidos grandes requerimos un adelanto del 30% para comenzar la producción.</p>
          <p>Puedes pagar el adelanto ahora y el saldo al recibir tu pedido.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación de adelanto enviada por email');

      // WhatsApp si tiene número
      if (order.user.phoneNumber) {
        try {
          await whatsAppService.sendLargeOrderAdvanceNotification(order, advanceAmount, totalAmount);
          console.log('✅ Notificación de adelanto enviada por WhatsApp');
        } catch (whatsappError) {
          console.error('⚠️ Error enviando WhatsApp de adelanto:', whatsappError.message);
        }
      }

    } catch (error) {
      console.error('❌ Error enviando notificación de adelanto:', error);
    }
  },

  // ==================== NOTIFICACIONES GENERALES ====================

  /**
   * Enviar notificación personalizada
   */
  async sendCustomNotification(data) {
    try {
      const { to, subject, message, isHtml = false } = data;

      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        [isHtml ? 'html' : 'text']: message
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Notificación personalizada enviada');

    } catch (error) {
      console.error('❌ Error enviando notificación personalizada:', error);
    }
  },

  /**
   * Verificar configuración de email
   */
  async verifyEmailConfig() {
    try {
      await transporter.verify();
      console.log('✅ Configuración de email verificada');
      return true;
    } catch (error) {
      console.error('❌ Error en configuración de email:', error);
      return false;
    }
  }
};

