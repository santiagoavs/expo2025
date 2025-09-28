// services/whatsapp/WhatsAppService.js - Servicio de WhatsApp con Twilio
import twilio from 'twilio';
import { config } from '../../config.js';

export class WhatsAppService {
  constructor() {
    if (!config.twilio.isEnabled) {
      console.log('⚠️ WhatsAppService deshabilitado - faltan credenciales de Twilio');
      this.client = null;
      return;
    }

    this.client = twilio(
      config.twilio.accountSid,
      config.twilio.authToken
    );
    this.fromNumber = config.twilio.whatsappNumber;
    console.log('📱 WhatsAppService inicializado con Twilio');
  }

  /**
   * Enviar actualización de estado con foto de calidad
   */
  async sendOrderUpdateWithPhoto(order, status, photoUrl = null) {
    if (!this.client) {
      console.log('⚠️ WhatsApp deshabilitado - saltando envío');
      return;
    }

    try {
      const message = this.buildStatusMessage(order, status);
      
      if (photoUrl) {
        await this.sendPhotoMessage(order.user.phoneNumber, message, photoUrl);
      } else {
        await this.sendTextMessage(order.user.phoneNumber, message);
      }
      
      console.log(`✅ WhatsApp enviado a ${order.user.phoneNumber} para pedido ${order.orderNumber}`);
      
    } catch (error) {
      console.error('❌ Error enviando WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje de texto simple
   */
  async sendTextMessage(toNumber, message) {
    if (!this.client) {
      console.log('⚠️ WhatsApp deshabilitado - saltando envío de texto');
      return;
    }

    try {
      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: `whatsapp:${toNumber}`,
        body: message
      });
      
      console.log(`📱 WhatsApp texto enviado. SID: ${result.sid}`);
      return result;
      
    } catch (error) {
      console.error('❌ Error enviando WhatsApp texto:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje con foto
   */
  async sendPhotoMessage(toNumber, message, photoUrl) {
    if (!this.client) {
      console.log('⚠️ WhatsApp deshabilitado - saltando envío de foto');
      return;
    }

    try {
      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: `whatsapp:${toNumber}`,
        body: message,
        mediaUrl: [photoUrl]
      });
      
      console.log(`📱 WhatsApp con foto enviado. SID: ${result.sid}`);
      return result;
      
    } catch (error) {
      console.error('❌ Error enviando WhatsApp con foto:', error);
      throw error;
    }
  }

  /**
   * Enviar múltiples fotos de producción
   */
  async sendProductionPhotos(toNumber, message, photoUrls) {
    try {
      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: `whatsapp:${toNumber}`,
        body: message,
        mediaUrl: photoUrls
      });
      
      console.log(`📱 WhatsApp con ${photoUrls.length} fotos enviado. SID: ${result.sid}`);
      return result;
      
    } catch (error) {
      console.error('❌ Error enviando WhatsApp con múltiples fotos:', error);
      throw error;
    }
  }

  /**
   * Construir mensaje según el estado
   */
  buildStatusMessage(order, status) {
    const statusMessages = {
      'pending_approval': `🆕 *Nuevo Pedido*\n\nPedido: ${order.orderNumber}\nCliente: ${order.user.name}\nEstado: Pendiente de aprobación\n\n¡Gracias por tu pedido! Te notificaremos cuando esté listo.`,
      
      'quoted': `💰 *Cotización Lista*\n\nPedido: ${order.orderNumber}\nPrecio: $${order.total}\n\nTu pedido ha sido cotizado. Revisa los detalles y confirma para continuar.`,
      
      'approved': `✅ *Pedido Aprobado*\n\nPedido: ${order.orderNumber}\nEstado: Aprobado y listo para producción\n\n¡Tu pedido ha sido aprobado! Comenzaremos la producción pronto.`,
      
      'in_production': `🏭 *En Producción*\n\nPedido: ${order.orderNumber}\nEstado: En producción\n\nTu pedido está siendo fabricado. Te mantendremos informado del progreso.`,
      
      'ready_for_delivery': `📦 *Listo para Entrega*\n\nPedido: ${order.orderNumber}\nEstado: Listo para entrega\n\n¡Tu pedido está terminado! Coordinaremos la entrega contigo.`,
      
      'delivered': `🎉 *Entregado*\n\nPedido: ${order.orderNumber}\nEstado: Entregado\n\n¡Tu pedido ha sido entregado! Esperamos que te guste.`,
      
      'completed': `✅ *Completado*\n\nPedido: ${order.orderNumber}\nEstado: Completado\n\n¡Gracias por elegirnos! Tu pedido ha sido completado exitosamente.`
    };

    return statusMessages[status] || `📦 *Actualización de Pedido*\n\nPedido: ${order.orderNumber}\nNuevo estado: ${status}`;
  }

  /**
   * Construir mensaje con foto de calidad
   */
  buildQualityPhotoMessage(order, stage, photoUrl) {
    const stageMessages = {
      'cutting': `✂️ *Corte de Material*\n\nPedido: ${order.orderNumber}\nEtapa: Corte de material\n\nAquí está el progreso de tu pedido:`,
      
      'printing': `🖨️ *Impresión*\n\nPedido: ${order.orderNumber}\nEtapa: Impresión del diseño\n\nProceso de impresión en curso:`,
      
      'pressing': `🔥 *Prensado*\n\nPedido: ${order.orderNumber}\nEtapa: Prensado y fijado\n\nAplicando el diseño al producto:`,
      
      'quality_check': `🔍 *Control de Calidad*\n\nPedido: ${order.orderNumber}\nEtapa: Control de calidad\n\nVerificando la calidad del producto:`,
      
      'packaging': `📦 *Empaque*\n\nPedido: ${order.orderNumber}\nEtapa: Empaque final\n\nPreparando tu pedido para entrega:`
    };

    return stageMessages[stage] || `📸 *Progreso de Producción*\n\nPedido: ${order.orderNumber}\nEtapa: ${stage}`;
  }

  /**
   * Verificar si un número tiene WhatsApp
   */
  async verifyWhatsAppNumber(phoneNumber) {
    try {
      // Formatear número para WhatsApp
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Intentar enviar un mensaje de prueba (opcional)
      // En producción, podrías usar la API de verificación de Twilio
      return {
        isValid: true,
        formattedNumber: `whatsapp:${formattedNumber}`
      };
      
    } catch (error) {
      console.error('❌ Error verificando número WhatsApp:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificación de pedido grande con adelanto
   */
  async sendLargeOrderAdvanceNotification(order, advanceAmount, totalAmount) {
    try {
      const message = `💰 *Pedido Grande - Adelanto Requerido*\n\n` +
        `Pedido: ${order.orderNumber}\n` +
        `Total: $${totalAmount}\n` +
        `Adelanto requerido: $${advanceAmount} (30%)\n` +
        `Saldo restante: $${totalAmount - advanceAmount}\n\n` +
        `Para pedidos grandes requerimos un adelanto del 30%.\n` +
        `Puedes pagar el adelanto ahora y el saldo al recibir tu pedido.`;

      await this.sendTextMessage(order.user.phoneNumber, message);
      
    } catch (error) {
      console.error('❌ Error enviando notificación de adelanto:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const whatsAppService = new WhatsAppService();
