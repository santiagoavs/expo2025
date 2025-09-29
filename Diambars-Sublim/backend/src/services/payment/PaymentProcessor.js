// services/payment/PaymentProcessor.js - Procesador principal de pagos
import Payment from '../../models/payment.js';
import Order from '../../models/order.js';
import { WompiProvider } from './WompiProvider.js';
import { CashProvider } from './CashProvider.js';
import { BankTransferProvider } from './BankTransferProvider.js';

/**
 * Procesador principal que implementa el patrón Factory
 * para manejar diferentes métodos de pago
 */
export class PaymentProcessor {
  
  constructor() {
    // Inicializar providers
    this.providers = new Map([
      ['wompi', new WompiProvider()],
      ['cash', new CashProvider()],
      ['bank_transfer', new BankTransferProvider()]
    ]);
    
    console.log('💳 PaymentProcessor inicializado con providers:', [...this.providers.keys()]);
  }
  
  // ==================== PROCESAMIENTO DE PAGOS ====================
  
  /**
   * Procesar pago - Punto de entrada principal
   */
  async processPayment(orderData, paymentData, userContext) {
    const { method } = paymentData;
    
    console.log(`💳 [PaymentProcessor] Procesando pago: ${method} para orden ${orderData.orderId}`);
    
    try {
      // Validar orden
      const order = await this.validateOrder(orderData.orderId, userContext);
      
      // Validar método de pago
      const provider = this.getProvider(method);
      
      // Crear registro de pago
      const payment = await this.createPaymentRecord(order, paymentData, userContext);
      
      // Procesar con el provider específico
      const providerResult = await provider.process(payment, order, paymentData);
      
      // Actualizar registro de pago
      await this.updatePaymentFromProvider(payment, providerResult);
      
      // Actualizar orden
      await this.updateOrderPaymentInfo(order, payment);
      
      console.log(`✅ [PaymentProcessor] Pago procesado exitosamente: ${payment._id}`);
      
      return {
        success: true,
        paymentId: payment._id,
        orderId: order._id,
        method: payment.method,
        status: payment.status,
        amount: payment.amount,
        ...providerResult.responseData
      };
      
    } catch (error) {
      console.error(`❌ [PaymentProcessor] Error procesando pago:`, error);
      throw error;
    }
  }
  
  /**
   * Confirmar pago (para efectivo y transferencias)
   */
  async confirmPayment(paymentId, confirmationData, adminContext) {
    console.log(`✅ [PaymentProcessor] Confirmando pago: ${paymentId}`);
    
    try {
      const payment = await Payment.findById(paymentId).populate('orderId');
      if (!payment) {
        throw new Error('Pago no encontrado');
      }
      
      if (!payment.canBeCompleted()) {
        throw new Error(`El pago no puede ser confirmado en estado: ${payment.status}`);
      }
      
      const provider = this.getProvider(payment.method);
      
      // Confirmar con el provider específico
      const confirmationResult = await provider.confirm(payment, confirmationData, adminContext);
      
      // Actualizar orden si el pago está completado
      if (payment.status === 'completed') {
        await this.updateOrderPaymentCompletion(payment.orderId, payment);
      }
      
      console.log(`✅ [PaymentProcessor] Pago confirmado: ${paymentId}`);
      
      return {
        success: true,
        paymentId: payment._id,
        orderId: payment.orderId._id,
        status: payment.status,
        ...confirmationResult
      };
      
    } catch (error) {
      console.error(`❌ [PaymentProcessor] Error confirmando pago:`, error);
      throw error;
    }
  }
  
  /**
   * Cancelar pago
   */
  async cancelPayment(paymentId, reason, context) {
    console.log(`❌ [PaymentProcessor] Cancelando pago: ${paymentId}`);
    
    try {
      const payment = await Payment.findById(paymentId).populate('orderId');
      if (!payment) {
        throw new Error('Pago no encontrado');
      }
      
      if (!['pending', 'processing'].includes(payment.status)) {
        throw new Error(`El pago no puede ser cancelado en estado: ${payment.status}`);
      }
      
      const provider = this.getProvider(payment.method);
      
      // Cancelar con el provider específico
      await provider.cancel(payment, reason, context);
      
      // Actualizar estado
      await payment.updateStatus('cancelled', { reason, cancelledBy: context.userId || context.adminId });
      
      return {
        success: true,
        paymentId: payment._id,
        status: payment.status
      };
      
    } catch (error) {
      console.error(`❌ [PaymentProcessor] Error cancelando pago:`, error);
      throw error;
    }
  }
  
  /**
   * Obtener estado de pagos de una orden
   */
  async getOrderPaymentStatus(orderId, userContext) {
    try {
      // Validar acceso a la orden
      const order = await this.validateOrder(orderId, userContext);
      
      // Obtener todos los pagos de la orden
      const payments = await Payment.findByOrderId(orderId);
      
      // Calcular totales
      const totalPaid = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalPending = payments
        .filter(p => ['pending', 'processing'].includes(p.status))
        .reduce((sum, p) => sum + p.amount, 0);
      
      const balance = Math.max(0, order.total - totalPaid);
      
      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderTotal: order.total,
        totalPaid,
        totalPending,
        balance,
        isFullyPaid: balance === 0,
        payments: payments.map(p => p.toPublicObject()),
        paymentSummary: {
          completed: payments.filter(p => p.status === 'completed').length,
          pending: payments.filter(p => p.status === 'pending').length,
          processing: payments.filter(p => p.status === 'processing').length,
          failed: payments.filter(p => p.status === 'failed').length
        }
      };
      
    } catch (error) {
      console.error(`❌ [PaymentProcessor] Error obteniendo estado:`, error);
      throw error;
    }
  }
  
  // ==================== MÉTODOS INTERNOS ====================
  
  /**
   * Obtener provider específico
   */
  getProvider(method) {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new Error(`Método de pago no soportado: ${method}`);
    }
    return provider;
  }
  
  /**
   * Validar orden y acceso del usuario
   */
  async validateOrder(orderId, userContext) {
    const query = { _id: orderId };
    
    // Si es usuario normal, validar que sea su orden
    if (userContext.userId) {
      query.user = userContext.userId;
    }
    // Si es admin, puede acceder a cualquier orden
    
    const order = await Order.findOne(query);
    if (!order) {
      throw new Error('Orden no encontrada o sin acceso');
    }
    
    // ✅ VALIDACIÓN FLEXIBLE: Permitir pagos en más estados
    const allowedPaymentStates = [
      'pending_approval', 
      'approved', 
      'quoted',
      'ready_for_delivery' // ✅ NUEVO: Permitir pagos cuando esté listo para entrega
    ];
    
    if (!allowedPaymentStates.includes(order.status)) {
      throw new Error(`La orden no puede ser pagada en estado: ${order.status}. Estados permitidos: ${allowedPaymentStates.join(', ')}`);
    }
    
    return order;
  }
  
  /**
   * Crear registro de pago
   */
  async createPaymentRecord(order, paymentData, userContext) {
    const {
      method,
      amount,
      timing = 'on_delivery',
      paymentType = 'full',
      percentage = 100,
      notes
    } = paymentData;
    
    // Calcular monto si es porcentual
    const calculatedAmount = amount || (order.total * percentage / 100);
    
    const paymentData_clean = {
      orderId: order._id,
      amount: calculatedAmount,
      method,
      timing,
      paymentType,
      percentage,
      notes,
      createdBy: userContext.userId || userContext.adminId,
      createdByModel: userContext.userId ? 'User' : 'Employee',
      metadata: {
        userAgent: userContext.userAgent,
        ipAddress: userContext.ipAddress,
        source: userContext.source || 'web'
      }
    };
    
    const payment = new Payment(paymentData_clean);
    await payment.save();
    
    console.log(`💳 [PaymentProcessor] Registro de pago creado: ${payment._id}`);
    
    return payment;
  }
  
  /**
   * Actualizar pago con resultado del provider
   */
  async updatePaymentFromProvider(payment, providerResult) {
    payment.status = providerResult.status;
    payment.providerData = providerResult.providerData || {};
    
    // Actualizar detalles específicos del método
    if (payment.method === 'wompi' && providerResult.wompiData) {
      payment.wompiDetails = { ...payment.wompiDetails, ...providerResult.wompiData };
    }
    
    if (payment.method === 'bank_transfer' && providerResult.transferData) {
      payment.transferDetails = { ...payment.transferDetails, ...providerResult.transferData };
    }
    
    if (payment.method === 'cash' && providerResult.cashData) {
      payment.cashDetails = { ...payment.cashDetails, ...providerResult.cashData };
    }
    
    if (providerResult.status === 'processing') {
      payment.processedAt = new Date();
    }
    
    await payment.save();
  }
  
  /**
   * Actualizar información de pago en la orden
   */
  async updateOrderPaymentInfo(order, payment) {
    // Obtener todos los pagos de la orden
    const allPayments = await Payment.findByOrderId(order._id);
    
    // Calcular totales
    const totalPaid = allPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const hasPendingPayments = allPayments.some(p => 
      ['pending', 'processing'].includes(p.status)
    );
    
    // Actualizar orden
    order.payment = {
      method: payment.method, // Método del último pago
      status: totalPaid >= order.total ? 'completed' : 
              hasPendingPayments ? 'processing' : 'pending',
      paymentId: payment._id, // Referencia al último pago
      totalPaid,
      balance: Math.max(0, order.total - totalPaid)
    };
    
    await order.save();
    
    console.log(`📦 [PaymentProcessor] Orden actualizada: ${order._id} - Pagado: $${totalPaid}/${order.total}`);
  }
  
  /**
   * Actualizar orden cuando un pago se completa
   */
  async updateOrderPaymentCompletion(order, payment) {
    await this.updateOrderPaymentInfo(order, payment);
    
    // Si la orden está completamente pagada, actualizar estado si es necesario
    if (order.payment.status === 'completed' && order.status === 'quoted') {
      order.status = 'approved';
      order.statusHistory.push({
        previousStatus: 'quoted',
        changedBy: payment.createdBy,
        changedByModel: payment.createdByModel,
        notes: 'Pago completado automáticamente',
        timestamp: new Date()
      });
      
      await order.save();
      
      console.log(`📦 [PaymentProcessor] Orden aprobada automáticamente por pago completo: ${order._id}`);
    }
  }
  
  // ==================== MÉTODOS UTILITARIOS ====================
  
  /**
   * Obtener métodos de pago disponibles
   */
  getAvailableMethods() {
    return [...this.providers.keys()];
  }
  
  /**
   * Validar si un método está disponible
   */
  isMethodAvailable(method) {
    return this.providers.has(method);
  }
  
  /**
   * Obtener estadísticas de pagos
   */
  async getPaymentStatistics(startDate, endDate) {
    return await Payment.getPaymentStats(startDate, endDate);
  }
}

// Exportar instancia singleton
export const paymentProcessor = new PaymentProcessor();