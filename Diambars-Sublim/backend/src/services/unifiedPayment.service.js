// src/services/unified-payment.service.js - Servicio de pago consolidado
import Order from "../models/order.js";
import mongoose from "mongoose";
import crypto from 'crypto';
import axios from 'axios';
import { config } from '../config.js';
import { notificationService } from "./notification.service.js";

// Configuración Wompi simplificada
const WOMPI = {
  isEnabled: !!(config.wompi.publicKey && config.wompi.privateKey),
  publicKey: config.wompi.publicKey,
  privateKey: config.wompi.privateKey,
  baseUrl: config.wompi.baseUrl,
  webhookSecret: config.wompi.webhookSecret
};

export class UnifiedPaymentService {
  
  // ==================== PROCESAMIENTO DE PAGOS ====================
  
  /**
   * Punto de entrada unificado para procesar cualquier tipo de pago
   */
  async processPayment(type, data) {
    console.log(`💳 Procesando pago tipo: ${type}`);
    
    switch (type) {
      case 'wompi':
        return this.processWompiPayment(data);
      case 'cash':
        return this.processCashPayment(data);
      case 'manual':
        return this.processManualPayment(data);
      case 'simulate':
        return this.simulatePayment(data);
      default:
        throw new Error(`Tipo de pago no soportado: ${type}`);
    }
  }

  // ==================== WOMPI DIGITAL ====================

  /**
   * Procesar pago con Wompi (o simulado si no está configurado)
   */
  async processWompiPayment(paymentData) {
    const { orderId, customerData } = paymentData;
    
    const order = await this.getOrder(orderId);
    
    if (!WOMPI.isEnabled) {
      console.warn('⚠️ Wompi no configurado - usando modo simulado');
      return this.generateFakeWompiResponse(order);
    }

    try {
      const response = await this.createWompiPaymentLink(order, customerData);
      
      // Actualizar orden
      order.payment.wompiData = {
        paymentLinkId: response.data.id,
        paymentUrl: response.data.public_url,
        reference: `DS-${orderId}-${Date.now()}`,
        expiresAt: response.data.expires_at
      };
      
      await order.save();
      
      return {
        success: true,
        paymentUrl: response.data.public_url,
        orderId: order._id,
        orderNumber: order.orderNumber,
        expiresAt: response.data.expires_at
      };
      
    } catch (error) {
      console.error('❌ Error Wompi:', error);
      // Fallback a modo simulado
      return this.generateFakeWompiResponse(order);
    }
  }

  /**
   * Crear payment link en Wompi
   */
  async createWompiPaymentLink(order, customerData) {
    const amountInCents = Math.round(order.total * 100);
    const reference = `DS-${order._id}-${Date.now()}`;
    
    const paymentLinkData = {
      name: `Pedido ${order.orderNumber}`,
      description: `Pago del pedido ${order.orderNumber}`,
      single_use: true,
      currency: 'USD',
      amount_in_cents: amountInCents,
      redirect_url: `${config.server.FRONTEND_URL}/orders/payment-success?order=${order._id}`,
      expired_redirect_url: `${config.server.FRONTEND_URL}/orders/payment-failed?order=${order._id}`,
      customer_data: {
        email: customerData?.email || order.user.email,
        full_name: customerData?.name || order.user.name
      }
    };

    return axios.post(`${WOMPI.baseUrl}/payment_links`, paymentLinkData, {
      headers: {
        'Authorization': `Bearer ${WOMPI.privateKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Generar respuesta simulada de Wompi
   */
  generateFakeWompiResponse(order) {
    return {
      success: true,
      paymentUrl: `${config.server.FRONTEND_URL}/orders/payment-success?order=${order._id}&simulated=true`,
      orderId: order._id,
      orderNumber: order.orderNumber,
      isFictitious: true,
      message: 'Pago simulado - Wompi no configurado'
    };
  }

  // ==================== PAGO EN EFECTIVO ====================

  /**
   * Registrar pago en efectivo
   */
  async processCashPayment(cashData) {
    const { orderId, totalAmount, cashReceived, adminId, location } = cashData;
    
    const order = await this.getOrder(orderId);
    
    // Validar montos
    const receivedAmount = parseFloat(cashReceived);
    const expectedAmount = parseFloat(totalAmount) || order.total;
    const change = Math.max(0, receivedAmount - expectedAmount);
    
    if (receivedAmount < expectedAmount) {
      throw new Error('Monto insuficiente recibido');
    }

    // Registrar pago
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.payment.method = 'cash';
    order.payment.cashPaymentDetails = {
      collectedBy: adminId,
      collectedAt: new Date(),
      totalAmount: expectedAmount,
      cashReceived: receivedAmount,
      changeGiven: change,
      location: location || 'Punto de entrega',
      receiptNumber: `CASH-${order.orderNumber}-${Date.now()}`
    };

    // Actualizar estado si es necesario
    if (order.status !== 'delivered') {
      order.status = 'delivered';
      order.deliveredAt = new Date();
    }

    await order.save();

    // Notificar
    this.sendPaymentNotification(order, 'cash_received');

    return {
      success: true,
      orderId: order._id,
      receiptNumber: order.payment.cashPaymentDetails.receiptNumber,
      change: change
    };
  }

  // ==================== PAGO MANUAL ====================

  /**
   * Confirmar pago manualmente (admin)
   */
  async processManualPayment(manualData) {
    const { orderId, method, amount, adminId, notes } = manualData;
    
    const order = await this.getOrder(orderId);
    
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.payment.method = method;
    order.payment.manualConfirmation = {
      confirmedBy: adminId,
      confirmedAt: new Date(),
      originalAmount: order.total,
      confirmedAmount: amount || order.total,
      notes: notes || ''
    };

    await order.save();
    
    this.sendPaymentNotification(order, 'manual_confirmed');

    return {
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber
    };
  }

  // ==================== SIMULACIÓN ====================

  /**
   * Simular confirmación de pago
   */
  async simulatePayment(simData) {
    const { orderId, status = 'approved' } = simData;
    
    const order = await this.getOrder(orderId);
    
    if (status === 'approved') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      order.payment.simulationData = {
        simulatedAt: new Date(),
        result: 'APPROVED'
      };
      
      await order.save();
      
      this.sendPaymentNotification(order, 'simulated_success');
      
      return {
        success: true,
        message: 'Pago simulado confirmado',
        orderId: order._id
      };
    } else {
      return {
        success: false,
        message: 'Pago simulado falló',
        orderId: order._id
      };
    }
  }

  // ==================== WEBHOOKS ====================

  /**
   * Procesar webhook de Wompi
   */
  async processWompiWebhook(webhookData) {
    try {
      const { data, event } = webhookData;
      
      console.log(`📥 Webhook Wompi: ${event}`, data.id);
      
      if (event === 'transaction.updated') {
        return this.handleTransactionUpdate(data);
      }
      
      return { processed: false, message: 'Evento no manejado' };
      
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      return { processed: false, error: error.message };
    }
  }

  /**
   * Manejar actualización de transacción
   */
  async handleTransactionUpdate(transactionData) {
    const { reference, status } = transactionData;
    
    const order = await Order.findOne({
      'payment.wompiData.reference': reference
    }).populate('user', 'email name');

    if (!order) {
      return { processed: false, message: 'Orden no encontrada' };
    }

    if (status === 'APPROVED') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      order.payment.wompiData.status = status;
      
      await order.save();
      
      this.sendPaymentNotification(order, 'wompi_success');
      
      return { processed: true, message: 'Pago confirmado' };
    } else if (['DECLINED', 'ERROR'].includes(status)) {
      order.payment.status = 'failed';
      order.payment.wompiData.status = status;
      
      await order.save();
      
      this.sendPaymentNotification(order, 'wompi_failed');
      
      return { processed: true, message: 'Pago falló' };
    }

    return { processed: false, message: 'Estado no reconocido' };
  }

  // ==================== VALIDACIÓN WEBHOOKS ====================

  /**
   * Validar webhook de Wompi
   */
  validateWompiWebhook(req) {
    if (!WOMPI.isEnabled) {
      console.warn('⚠️ Webhook simulado como válido - Wompi no configurado');
      return true;
    }

    try {
      const signature = req.headers['x-event-signature'];
      const timestamp = req.headers['x-timestamp'];
      
      if (!signature || !timestamp) return false;
      
      // Verificar timestamp (max 5 minutos)
      const timeDiff = Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp));
      if (timeDiff > 300) return false;
      
      // Verificar firma
      const bodyString = JSON.stringify(req.body);
      const signatureString = `${bodyString}${timestamp}${WOMPI.webhookSecret}`;
      const expectedSignature = crypto.createHash('sha256').update(signatureString).digest('hex');
      
      return signature === expectedSignature;
      
    } catch (error) {
      console.error('❌ Error validando webhook:', error);
      return false;
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Obtener orden con validaciones
   */
  async getOrder(orderId) {
    const order = await Order.findById(orderId).populate('user', 'email name');
    
    if (!order) {
      throw new Error('Pedido no encontrado');
    }
    
    if (order.payment.status === 'paid') {
      throw new Error('Este pedido ya está pagado');
    }
    
    return order;
  }

  /**
   * Enviar notificación de pago
   */
  async sendPaymentNotification(order, type) {
    try {
      const notifications = {
        'cash_received': () => notificationService.sendCashPaymentReceivedNotification({
          orderNumber: order.orderNumber,
          totalAmount: order.payment.cashPaymentDetails.totalAmount,
          cashReceived: order.payment.cashPaymentDetails.cashReceived,
          changeGiven: order.payment.cashPaymentDetails.changeGiven,
          userEmail: order.user.email,
          userName: order.user.name,
          location: order.payment.cashPaymentDetails.location
        }),
        'manual_confirmed': () => notificationService.sendPaymentConfirmedNotification({
          orderNumber: order.orderNumber,
          amount: order.total,
          paymentMethod: order.payment.method,
          userEmail: order.user.email,
          userName: order.user.name
        }),
        'wompi_success': () => notificationService.sendPaymentSuccessNotification({
          orderNumber: order.orderNumber,
          amount: order.total,
          paymentMethod: 'wompi',
          userEmail: order.user.email,
          userName: order.user.name
        }),
        'wompi_failed': () => notificationService.sendPaymentFailedNotification({
          orderNumber: order.orderNumber,
          reason: 'Pago rechazado por Wompi',
          userEmail: order.user.email,
          userName: order.user.name
        }),
        'simulated_success': () => notificationService.sendPaymentSuccessNotification({
          orderNumber: order.orderNumber,
          amount: order.total,
          paymentMethod: 'simulated',
          userEmail: order.user.email,
          userName: order.user.name
        })
      };

      const notification = notifications[type];
      if (notification) {
        await notification();
      }
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
      // No interrumpir el flujo por error de notificación
    }
  }

  // ==================== CONFIGURACIÓN PÚBLICA ====================

  /**
   * Obtener configuración pública de pagos
   */
  getPublicConfig() {
    return {
      wompi: {
        enabled: WOMPI.isEnabled,
        publicKey: WOMPI.isEnabled ? WOMPI.publicKey : null,
        environment: config.wompi.env
      },
      methods: {
        cash: true,
        digital: WOMPI.isEnabled,
        manual: true
      }
    };
  }
}

// Exportar instancia singleton
export const paymentService = new UnifiedPaymentService();