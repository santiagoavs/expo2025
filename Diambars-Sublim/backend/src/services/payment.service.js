// services/payment.service.js - Integración PaymentMethod + Efectivo + Wompi
import Order from "../models/order.js";
import PaymentMethod from "../models/paymentMethod.js";
import mongoose from "mongoose";
import { 
  processWompiPayment, 
  simulatePaymentConfirmation,
  isWompiConfigured 
} from "./wompi.service.js";
import { notificationService } from "./notification.service.js";

export const paymentService = {

  // ==================== PAGOS DIGITALES ====================

  /**
   * Procesar pago digital (Wompi + PaymentMethod)
   */
  async processDigitalPayment(paymentData) {
    const { orderId, paymentMethodId, customerData, userId, method } = paymentData;

    const order = await Order.findById(orderId).populate('user', 'email name');
    
    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.payment.status === 'paid') {
      const error = new Error("Este pedido ya está pagado");
      error.statusCode = 400;
      error.code = 'ALREADY_PAID';
      throw error;
    }

    // Obtener método de pago si se especificó
    let paymentMethod = null;
    if (paymentMethodId) {
      paymentMethod = await PaymentMethod.findOne({
        _id: paymentMethodId,
        userId: userId,
        active: true
      });

      if (!paymentMethod) {
        const error = new Error("Método de pago no encontrado o inactivo");
        error.statusCode = 404;
        error.code = 'PAYMENT_METHOD_NOT_FOUND';
        throw error;
      }
    }

    // Procesar pago con Wompi
    const wompiResult = await processWompiPayment({
      orderId: order._id,
      amount: order.total,
      currency: 'USD',
      customerEmail: customerData?.email || order.user.email,
      customerName: customerData?.name || order.user.name,
      description: `Pago - Pedido #${order.orderNumber}`,
      isPartialPayment: false
    });

    if (wompiResult.success) {
      // Actualizar orden con datos de pago
      order.payment.wompiData = {
        paymentLinkId: wompiResult.paymentLinkId,
        paymentUrl: wompiResult.paymentUrl,
        reference: wompiResult.reference,
        expiresAt: wompiResult.expiresAt,
        isFake: wompiResult.isFake || false
      };

      // Si se usó un método de pago guardado, registrarlo
      if (paymentMethod) {
        order.payment.savedMethodUsed = {
          methodId: paymentMethod._id,
          lastFourDigits: paymentMethod.lastFourDigits,
          issuer: paymentMethod.issuer
        };
      }

      await order.save();

      return {
        success: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.total,
        paymentUrl: wompiResult.paymentUrl,
        isFictitious: wompiResult.isFake || false,
        expiresAt: wompiResult.expiresAt,
        paymentMethod: paymentMethod ? paymentMethod.toSafeObject() : null
      };
    }

    throw new Error("Error generando link de pago");
  },

  /**
   * Simular pago para desarrollo
   */
  async simulatePayment(orderId, status) {
    const order = await Order.findById(orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.payment.status === 'paid') {
      const error = new Error("Este pedido ya está pagado");
      error.statusCode = 400;
      error.code = 'ALREADY_PAID';
      throw error;
    }

    const simulationResult = await simulatePaymentConfirmation(
      order._id, 
      order.payment.wompiData?.reference || `SIM-${order._id}`
    );

    if (simulationResult.status === 'APPROVED') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      order.payment.simulatedResponse = simulationResult;
      
      // Cambiar estado del pedido solo si está pendiente de pago
      if (order.status === 'pending_approval' && order.payment.timing === 'advance') {
        order.status = 'approved';
        order.statusHistory.push({
          status: 'approved',
          changedByModel: 'System',
          notes: 'Pago simulado confirmado',
          timestamp: new Date()
        });
      }

      await order.save();

      // Notificar éxito
      notificationService.sendPaymentSuccessNotification({
        orderNumber: order.orderNumber,
        amount: order.total,
        paymentMethod: 'simulated',
        userEmail: order.user.email,
        userName: order.user.name
      }).catch(console.error);

      return {
        message: "Pago simulado confirmado exitosamente",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.payment.status,
          orderStatus: order.status,
          simulationResult
        }
      };
    }

    // Pago fallido
    order.payment.status = 'failed';
    order.payment.simulatedResponse = simulationResult;
    order.payment.failedAttempts.push({
      attemptedAt: new Date(),
      reason: simulationResult.statusMessage,
      errorCode: simulationResult.errorCode
    });

    await order.save();

    const error = new Error("Pago simulado falló");
    error.statusCode = 400;
    error.code = 'PAYMENT_FAILED';
    error.data = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      reason: simulationResult.statusMessage
    };
    throw error;
  },

  /**
   * Confirmar pago manual (admin)
   */
  async confirmManualPayment(paymentData) {
    const { orderId, method, amount, receiptNumber, notes, adminId } = paymentData;

    const order = await Order.findById(orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.payment.status === 'paid') {
      const error = new Error("Este pedido ya está pagado");
      error.statusCode = 400;
      error.code = 'ALREADY_PAID';
      throw error;
    }

    // Actualizar pago
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.payment.amount = amount || order.total;
    order.payment.method = method;

    // Agregar detalles del pago manual
    order.payment.manualConfirmation = {
      confirmedBy: adminId,
      confirmedAt: new Date(),
      receiptNumber: receiptNumber || `MANUAL-${Date.now()}`,
      notes: notes || '',
      originalAmount: order.total
    };

    // Cambiar estado del pedido si estaba pendiente
    if (order.status === 'pending_approval') {
      order.status = 'approved';
      order.statusHistory.push({
        status: 'approved',
        changedBy: adminId,
        changedByModel: 'Employee',
        notes: 'Pago confirmado manualmente',
        timestamp: new Date()
      });
    }

    await order.save();

    // Notificar al cliente
    notificationService.sendPaymentConfirmedNotification({
      orderNumber: order.orderNumber,
      amount: order.payment.amount,
      paymentMethod: order.payment.method,
      userEmail: order.user.email,
      userName: order.user.name
    }).catch(console.error);

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: order.payment.amount,
      paymentStatus: order.payment.status,
      orderStatus: order.status
    };
  },

  // ==================== PAGOS EN EFECTIVO ====================

  /**
   * Registrar pago en efectivo (entrega presencial)
   */
  async registerCashPayment(orderId, adminId, cashData) {
    const {
      totalAmount,
      cashReceived,
      changeGiven,
      paymentLocation,
      adminNotes,
      deliveredAt
    } = cashData;

    const order = await Order.findById(orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.payment.status === 'paid') {
      const error = new Error("Este pedido ya está pagado");
      error.statusCode = 400;
      error.code = 'ALREADY_PAID';
      throw error;
    }

    // Validar montos
    const expectedAmount = totalAmount || order.total;
    const receivedAmount = parseFloat(cashReceived) || expectedAmount;
    const change = parseFloat(changeGiven) || Math.max(0, receivedAmount - expectedAmount);

    if (receivedAmount < expectedAmount) {
      const error = new Error("El monto recibido es menor al total del pedido");
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_PAYMENT';
      throw error;
    }

    // Registrar pago en efectivo
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.payment.amount = expectedAmount;
    order.payment.method = 'cash';

    order.payment.cashPaymentDetails = {
      collectedBy: adminId,
      collectedAt: new Date(),
      receiptNumber: `CASH-${order.orderNumber}-${Date.now()}`,
      totalAmount: expectedAmount,
      cashReceived: receivedAmount,
      changeGiven: change,
      location: {
        type: 'Point',
        coordinates: [-89.2182, 13.6929], // Default San Salvador
        address: paymentLocation || 'Punto de entrega'
      },
      notes: adminNotes || '',
      deliveredAt: deliveredAt ? new Date(deliveredAt) : new Date()
    };

    // Actualizar estados
    if (order.status !== 'delivered') {
      order.status = 'delivered';
      order.deliveredAt = new Date();
      order.statusHistory.push({
        status: 'delivered',
        changedBy: adminId,
        changedByModel: 'Employee',
        notes: 'Producto entregado y pago en efectivo recibido',
        timestamp: new Date()
      });
    }

    await order.save();

    // Notificar confirmación
    notificationService.sendCashPaymentReceivedNotification({
      orderNumber: order.orderNumber,
      totalAmount: expectedAmount,
      cashReceived: receivedAmount,
      changeGiven: change,
      userEmail: order.user.email,
      userName: order.user.name,
      location: paymentLocation
    }).catch(console.error);

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      receiptNumber: order.payment.cashPaymentDetails.receiptNumber,
      totalAmount: expectedAmount,
      cashReceived: receivedAmount,
      changeGiven: change,
      paymentStatus: order.payment.status,
      orderStatus: order.status
    };
  },

  /**
   * Obtener historial de pagos en efectivo
   */
  async getCashPaymentHistory(filters) {
    const { startDate, endDate, adminId } = filters;

    const matchFilter = {
      'payment.method': 'cash',
      'payment.status': 'paid'
    };

    if (startDate && endDate) {
      matchFilter['payment.paidAt'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (adminId) {
      matchFilter['payment.cashPaymentDetails.collectedBy'] = new mongoose.Types.ObjectId(adminId);
    }

    const cashPayments = await Order.find(matchFilter)
      .select('orderNumber payment user createdAt')
      .populate('user', 'name email')
      .populate('payment.cashPaymentDetails.collectedBy', 'name')
      .sort({ 'payment.paidAt': -1 })
      .lean();

    // Estadísticas
    const stats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$payment.amount' },
          averagePayment: { $avg: '$payment.amount' },
          totalCashReceived: { $sum: '$payment.cashPaymentDetails.cashReceived' },
          totalChangeGiven: { $sum: '$payment.cashPaymentDetails.changeGiven' }
        }
      }
    ]);

    return {
      payments: cashPayments,
      statistics: stats[0] || {
        totalPayments: 0,
        totalAmount: 0,
        averagePayment: 0,
        totalCashReceived: 0,
        totalChangeGiven: 0
      },
      filters
    };
  },

  // ==================== WEBHOOKS ====================

  /**
   * Manejar actualización de transacción de Wompi
   */
  async handleTransactionUpdate(transactionData) {
    try {
      const { id: transactionId, reference, status } = transactionData;
      
      console.log('🔄 Procesando actualización de transacción:', { transactionId, reference, status });

      const order = await Order.findOne({ 
        'payment.wompiData.reference': reference 
      }).populate('user', 'email name');

      if (!order) {
        console.error('❌ Orden no encontrada para referencia:', reference);
        return { processed: false, message: 'Orden no encontrada' };
      }

      if (status === 'APPROVED') {
        order.payment.status = 'paid';
        order.payment.paidAt = new Date();
        order.payment.wompiData.transactionId = transactionId;
        order.payment.wompiData.status = status;

        // Cambiar estado del pedido si estaba pendiente de pago
        if (order.status === 'pending_approval' && order.payment.timing === 'advance') {
          order.status = 'approved';
          order.statusHistory.push({
            status: 'approved',
            changedByModel: 'System',
            notes: 'Pago confirmado vía Wompi',
            timestamp: new Date()
          });
        }

        await order.save();

        // Notificar éxito
        notificationService.sendPaymentSuccessNotification({
          orderNumber: order.orderNumber,
          amount: order.total,
          paymentMethod: 'wompi',
          userEmail: order.user.email,
          userName: order.user.name
        }).catch(console.error);

        return { processed: true, message: 'Pago confirmado exitosamente' };

      } else if (['DECLINED', 'ERROR'].includes(status)) {
        order.payment.status = 'failed';
        order.payment.wompiData.status = status;
        order.payment.failedAttempts.push({
          attemptedAt: new Date(),
          reason: 'Pago rechazado por Wompi',
          transactionId
        });

        await order.save();

        // Notificar fallo
        notificationService.sendPaymentFailedNotification({
          orderNumber: order.orderNumber,
          reason: 'Pago rechazado',
          userEmail: order.user.email,
          userName: order.user.name
        }).catch(console.error);

        return { processed: true, message: 'Pago fallido procesado' };
      }

      return { processed: false, message: 'Estado no reconocido' };

    } catch (error) {
      console.error('❌ Error manejando actualización de transacción:', error);
      return { processed: false, message: 'Error procesando transacción' };
    }
  },

  /**
   * Manejar payment link pagado
   */
  async handlePaymentLinkPaid(paymentLinkData) {
    console.log('💳 Processing payment link paid:', paymentLinkData);
    // Implementar lógica específica para payment links si es diferente
    return { processed: true, message: 'Payment link procesado' };
  },

  // ==================== MÉTODOS DE PAGO GUARDADOS ====================

  /**
   * Obtener métodos de pago del usuario
   */
  async getUserPaymentMethods(userId) {
    const methods = await PaymentMethod.findByUser(userId);
    return methods.map(method => method.toSafeObject());
  },

  /**
   * Crear método de pago
   */
  async createPaymentMethod(userId, methodData) {
    const { number, name, expiry, cvc, issuer } = methodData;

    // Validar datos básicos
    if (!number || !name || !expiry || !cvc) {
      const error = new Error("Faltan datos obligatorios del método de pago");
      error.statusCode = 400;
      error.code = 'MISSING_PAYMENT_DATA';
      throw error;
    }

    // Generar hash y encriptar datos sensibles
    const numberHash = PaymentMethod.generateNumberHash(number);
    const cvcEncrypted = PaymentMethod.encryptCVC(cvc);
    const lastFourDigits = number.slice(-4);

    const newMethod = new PaymentMethod({
      userId,
      lastFourDigits,
      numberHash,
      name: name.trim().toUpperCase(),
      expiry,
      cvcEncrypted,
      issuer: issuer || 'unknown',
      active: false // Los nuevos métodos inician inactivos
    });

    await newMethod.save();

    return newMethod.toSafeObject();
  },

  /**
   * Actualizar método de pago
   */
  async updatePaymentMethod(methodId, userId, updateData) {
    const method = await PaymentMethod.findOne({
      _id: methodId,
      userId
    });

    if (!method) {
      const error = new Error("Método de pago no encontrado");
      error.statusCode = 404;
      error.code = 'PAYMENT_METHOD_NOT_FOUND';
      throw error;
    }

    // Actualizar campos permitidos
    if (updateData.number) {
      method.numberHash = PaymentMethod.generateNumberHash(updateData.number);
      method.lastFourDigits = updateData.number.slice(-4);
    }

    if (updateData.name) {
      method.name = updateData.name.trim().toUpperCase();
    }

    if (updateData.expiry) {
      method.expiry = updateData.expiry;
    }

    if (updateData.cvc) {
      method.cvcEncrypted = PaymentMethod.encryptCVC(updateData.cvc);
    }

    if (updateData.issuer) {
      method.issuer = updateData.issuer;
    }

    await method.save();

    return method.toSafeObject();
  },

  /**
   * Eliminar método de pago
   */
  async deletePaymentMethod(methodId, userId) {
    const method = await PaymentMethod.findOneAndDelete({
      _id: methodId,
      userId
    });

    if (!method) {
      const error = new Error("Método de pago no encontrado");
      error.statusCode = 404;
      error.code = 'PAYMENT_METHOD_NOT_FOUND';
      throw error;
    }

    return true;
  },

  /**
   * Activar/desactivar método de pago
   */
  async togglePaymentMethod(methodId, userId, active) {
    const method = await PaymentMethod.findOne({
      _id: methodId,
      userId
    });

    if (!method) {
      const error = new Error("Método de pago no encontrado");
      error.statusCode = 404;
      error.code = 'PAYMENT_METHOD_NOT_FOUND';
      throw error;
    }

    // Si se está activando, desactivar todos los demás
    if (active) {
      await PaymentMethod.updateMany(
        { userId, _id: { $ne: methodId } },
        { active: false }
      );
    }

    method.active = active;
    await method.save();

    return method.toSafeObject();
  },

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtener estadísticas de pagos
   */
  async getPaymentStats(filters) {
    const { startDate, endDate, method } = filters;

    const matchFilter = {
      'payment.status': 'paid'
    };

    if (startDate && endDate) {
      matchFilter['payment.paidAt'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (method) {
      matchFilter['payment.method'] = method;
    }

    const stats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$payment.method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payment.amount' },
          averageAmount: { $avg: '$payment.amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const totalStats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalRevenue: { $sum: '$payment.amount' },
          averagePayment: { $avg: '$payment.amount' }
        }
      }
    ]);

    return {
      byMethod: stats,
      total: totalStats[0] || {
        totalPayments: 0,
        totalRevenue: 0,
        averagePayment: 0
      },
      filters,
      wompiStatus: {
        configured: isWompiConfigured(),
        mode: isWompiConfigured() ? 'real' : 'fictitious'
      }
    };
  }
};