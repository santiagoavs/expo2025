// services/payment/CashProvider.js - Provider específico para pagos en efectivo
import { notificationService } from '../email/notification.service.js';

export class CashProvider {
  
  constructor() {
    console.log('💵 CashProvider inicializado');
  }
  
  // ==================== PROCESAMIENTO ====================
  
  /**
   * Procesar pago en efectivo
   * Para efectivo, solo preparamos el registro - la confirmación viene después
   */
  async process(payment, order, paymentData) {
    console.log(`💵 [Cash] Preparando pago en efectivo para orden: ${order.orderNumber}`);
    
    const { deliveryLocation, notes } = paymentData;
    
    try {
      return {
        status: 'pending',
        providerData: {
          paymentMethod: 'cash',
          instructions: this.generateCashInstructions(payment, order),
          expectedAmount: payment.amount,
          deliveryLocation: deliveryLocation || 'Por definir'
        },
        cashData: {
          expectedAmount: payment.amount,
          location: deliveryLocation || 'Punto de entrega',
          notes: notes || ''
        },
        responseData: {
          instructions: this.generateCashInstructions(payment, order),
          expectedAmount: payment.amount,
          formattedAmount: payment.formattedAmount,
          deliveryInfo: this.getDeliveryInfo(order, deliveryLocation),
          paymentCode: `CASH-${order.orderNumber}`,
          estimatedDeliveryDate: this.calculateDeliveryDate(order)
        }
      };
      
    } catch (error) {
      console.error('❌ [Cash] Error preparando pago en efectivo:', error);
      throw error;
    }
  }
  
  /**
   * Confirmar pago en efectivo (cuando el admin recibe el dinero)
   */
  async confirm(payment, confirmationData, adminContext) {
    console.log(`💵 [Cash] Confirmando pago en efectivo: ${payment._id}`);
    
    const { 
      receivedAmount, 
      cashReceived,
      changeGiven, 
      location, 
      notes,
      deliveredAt 
    } = confirmationData;
    
    try {
      // Validar datos recibidos
      this.validateCashConfirmation(payment, confirmationData);
      
      const finalReceivedAmount = receivedAmount || cashReceived;
      const finalChangeGiven = changeGiven || Math.max(0, finalReceivedAmount - payment.amount);
      
      // Validar que se recibió suficiente dinero
      if (finalReceivedAmount < payment.amount) {
        throw new Error(`Monto insuficiente recibido. Esperado: $${payment.amount}, Recibido: $${finalReceivedAmount}`);
      }
      
      // Generar número de recibo
      const receiptNumber = `CASH-${payment.orderId}-${Date.now()}`;
      
      // Actualizar detalles del pago
      payment.cashDetails = {
        expectedAmount: payment.amount,
        receivedAmount: finalReceivedAmount,
        changeGiven: finalChangeGiven,
        collectedBy: adminContext.adminId,
        collectedAt: deliveredAt || new Date(),
        location: location || payment.cashDetails?.location || 'Punto de entrega',
        receiptNumber,
        notes: notes || ''
      };
      
      // Marcar como completado
      await payment.updateStatus('completed', {
        confirmedBy: adminContext.adminId,
        confirmedAt: new Date(),
        method: 'admin_confirmation',
        receivedAmount: finalReceivedAmount,
        changeGiven: finalChangeGiven
      });
      
      // Enviar notificaciones
      await this.sendCashPaymentNotifications(payment, adminContext);
      
      console.log(`✅ [Cash] Pago confirmado: ${payment._id} - Recibo: ${receiptNumber}`);
      
      return {
        receiptNumber,
        receivedAmount: finalReceivedAmount,
        changeGiven: finalChangeGiven,
        collectedAt: payment.cashDetails.collectedAt,
        location: payment.cashDetails.location,
        collectedBy: adminContext.adminId
      };
      
    } catch (error) {
      console.error('❌ [Cash] Error confirmando pago:', error);
      
      await payment.addError(`Error confirmando pago en efectivo: ${error.message}`, {
        confirmationData,
        adminContext
      });
      
      throw error;
    }
  }
  
  /**
   * Cancelar pago en efectivo
   */
  async cancel(payment, reason, context) {
    console.log(`❌ [Cash] Cancelando pago en efectivo: ${payment._id}`);
    
    // Para efectivo, simplemente actualizar las notas con el motivo
    payment.notes = `${payment.notes ? payment.notes + ' | ' : ''}Cancelado: ${reason}`;
    
    return {
      cancelled: true,
      reason,
      cancelledAt: new Date()
    };
  }
  
  // ==================== MÉTODOS DE UTILIDAD ====================
  
  /**
   * Generar instrucciones para pago en efectivo
   */
  generateCashInstructions(payment, order) {
    const baseInstructions = [
      `💵 **PAGO EN EFECTIVO**`,
      ``,
      `📋 **Detalles del pago:**`,
      `• Orden: ${order.orderNumber}`,
      `• Monto a pagar: ${payment.formattedAmount}`,
      `• Tipo de pago: ${payment.timing === 'advance' ? 'Adelanto' : 'Contra entrega'}`,
      ``,
      `📍 **Instrucciones:**`
    ];
    
    if (payment.timing === 'advance') {
      baseInstructions.push(
        `• El pago debe realizarse antes de iniciar la producción`,
        `• Coordine la entrega del efectivo con nuestro equipo`,
        `• Una vez recibido el pago, iniciaremos su pedido`
      );
    } else {
      baseInstructions.push(
        `• El pago se realizará al momento de la entrega`,
        `• Tenga el monto exacto o cambio disponible`,
        `• Nuestro repartidor confirmará el pago recibido`
      );
    }
    
    baseInstructions.push(
      ``,
      `📞 **Contacto:**`,
      `• WhatsApp: +503 1234-5678`,
      `• Email: pagos@diambars.com`,
      ``,
      `⚠️ **IMPORTANTE:** Conserve este código de pago: **CASH-${order.orderNumber}**`
    );
    
    return baseInstructions.join('\n');
  }
  
  /**
   * Obtener información de entrega
   */
  getDeliveryInfo(order, customLocation) {
    const deliveryInfo = {
      type: order.deliveryType,
      location: customLocation
    };
    
    if (order.deliveryType === 'delivery' && order.deliveryAddress) {
      deliveryInfo.address = {
        recipient: order.deliveryAddress.recipient,
        phoneNumber: order.deliveryAddress.phoneNumber,
        fullAddress: `${order.deliveryAddress.address}, ${order.deliveryAddress.municipality}, ${order.deliveryAddress.department}`,
        additionalDetails: order.deliveryAddress.additionalDetails
      };
    } else if (order.deliveryType === 'meetup' && order.meetupDetails) {
      deliveryInfo.meetup = {
        date: order.meetupDetails.date,
        location: order.meetupDetails.location?.address || order.meetupDetails.location?.placeName,
        coordinates: order.meetupDetails.location?.coordinates
      };
    }
    
    return deliveryInfo;
  }
  
  /**
   * Calcular fecha estimada de entrega
   */
  calculateDeliveryDate(order) {
    if (order.estimatedReadyDate) {
      return order.estimatedReadyDate;
    }
    
    // Estimar basado en items y complejidad
    const baseHours = 48; // 2 días base
    const itemComplexity = order.items?.reduce((sum, item) => {
      return sum + (item.complexity || 1) * item.quantity;
    }, 0) || 1;
    
    const additionalHours = Math.min(itemComplexity * 8, 72); // Máximo 3 días adicionales
    
    const estimatedDate = new Date();
    estimatedDate.setHours(estimatedDate.getHours() + baseHours + additionalHours);
    
    return estimatedDate;
  }
  
  /**
   * Validar datos de confirmación de efectivo
   */
  validateCashConfirmation(payment, confirmationData) {
    const { receivedAmount, cashReceived } = confirmationData;
    const finalAmount = receivedAmount || cashReceived;
    
    if (!finalAmount || finalAmount <= 0) {
      throw new Error('El monto recibido es obligatorio y debe ser mayor a 0');
    }
    
    if (finalAmount < payment.amount) {
      throw new Error(`Monto insuficiente. Esperado: $${payment.amount}, Recibido: $${finalAmount}`);
    }
    
    if (finalAmount > payment.amount * 5) {
      throw new Error(`Monto recibido excesivo. Verifique los datos: $${finalAmount}`);
    }
  }
  
  /**
   * Enviar notificaciones de pago en efectivo
   */
  async sendCashPaymentNotifications(payment, adminContext) {
    try {
      // Poplar orden y usuario si no están poblados
      await payment.populate([
        { path: 'orderId', populate: { path: 'user', select: 'name email' } },
        { path: 'createdBy', select: 'name email' }
      ]);
      
      const order = payment.orderId;
      const user = order.user;
      
      // Notificar al cliente
      if (user?.email) {
        await notificationService.sendCashPaymentReceivedNotification({
          orderNumber: order.orderNumber,
          amount: payment.amount,
          receiptNumber: payment.cashDetails.receiptNumber,
          receivedAmount: payment.cashDetails.receivedAmount,
          changeGiven: payment.cashDetails.changeGiven,
          location: payment.cashDetails.location,
          collectedAt: payment.cashDetails.collectedAt,
          userEmail: user.email,
          userName: user.name
        });
      }
      
      // Notificar al equipo interno
      await notificationService.sendInternalCashPaymentNotification({
        orderNumber: order.orderNumber,
        amount: payment.amount,
        receiptNumber: payment.cashDetails.receiptNumber,
        receivedAmount: payment.cashDetails.receivedAmount,
        changeGiven: payment.cashDetails.changeGiven,
        location: payment.cashDetails.location,
        collectedBy: adminContext.adminId,
        customerName: user?.name,
        customerEmail: user?.email
      });
      
    } catch (error) {
      console.error('❌ [Cash] Error enviando notificaciones:', error);
      // No interrumpir el flujo por error de notificación
    }
  }
  
  // ==================== MÉTODOS PARA REPORTES ====================
  
  /**
   * Obtener resumen de pagos en efectivo
   */
  async getCashPaymentsSummary(startDate, endDate, collectorId = null) {
    const Payment = (await import('../../models/payment.js')).default;
    
    const matchStage = {
      method: 'cash',
      status: 'completed',
      completedAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (collectorId) {
      matchStage['cashDetails.collectedBy'] = collectorId;
    }
    
    const summary = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$cashDetails.collectedBy',
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalReceived: { $sum: '$cashDetails.receivedAmount' },
          totalChange: { $sum: '$cashDetails.changeGiven' },
          avgAmount: { $avg: '$amount' },
          locations: { $addToSet: '$cashDetails.location' }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'collector'
        }
      }
    ]);
    
    return summary;
  }
  
  /**
   * Generar reporte de efectivo por fecha
   */
  async generateDailyCashReport(date) {
    const Payment = (await import('../../models/payment.js')).default;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const payments = await Payment.find({
      method: 'cash',
      status: 'completed',
      'cashDetails.collectedAt': {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .populate('orderId', 'orderNumber user')
    .populate('cashDetails.collectedBy', 'name')
    .sort({ 'cashDetails.collectedAt': 1 });
    
    const summary = {
      date: date,
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      totalReceived: payments.reduce((sum, p) => sum + (p.cashDetails?.receivedAmount || 0), 0),
      totalChange: payments.reduce((sum, p) => sum + (p.cashDetails?.changeGiven || 0), 0),
      payments: payments.map(p => ({
        receiptNumber: p.cashDetails.receiptNumber,
        orderNumber: p.orderId.orderNumber,
        amount: p.amount,
        receivedAmount: p.cashDetails.receivedAmount,
        changeGiven: p.cashDetails.changeGiven,
        location: p.cashDetails.location,
        collectedAt: p.cashDetails.collectedAt,
        collectedBy: p.cashDetails.collectedBy?.name
      }))
    };
    
    return summary;
  }
}