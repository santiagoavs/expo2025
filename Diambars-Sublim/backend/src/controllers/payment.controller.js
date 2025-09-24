// controllers/payment.controller.js - CONTROLADOR FINAL para la nueva arquitectura
import { paymentProcessor } from '../services/payment/PaymentProcessor.js';
import Payment from '../models/payment.js';
import Order from '../models/order.js';
import { validators } from '../utils/validators.utils.js';

/**
 * Controlador de pagos refactorizado
 * CONECTA con los services/providers
 */

// ==================== PROCESAMIENTO DE PAGOS ====================

/**
 * Procesar pago para una orden
 * Ruta: POST /api/payments/orders/:orderId/process
 */
export const processOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const paymentData = req.body;
    const userId = req.user?.id;
    const isAdmin = req.user?.role && ['admin', 'manager'].includes(req.user.role);
    
    console.log(`💳 [PaymentController] Procesando pago para orden: ${orderId}`);
    
    // Validar ID de orden
    const orderIdValidation = validators.mongoId(orderId, 'ID de orden');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: orderIdValidation.error
      });
    }
    
    // Validar datos del pago
    const paymentValidation = validatePaymentData(paymentData);
    if (!paymentValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: paymentValidation.error
      });
    }
    
    // Preparar contexto del usuario
    const userContext = {
      userId: isAdmin ? null : userId,
      adminId: isAdmin ? req.user._id : null,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      source: req.get('X-Source') || 'web'
    };
    
    // AQUÍ SE CONECTA CON LOS SERVICES
    const result = await paymentProcessor.processPayment(
      { orderId: orderIdValidation.cleaned },
      paymentValidation.cleaned,
      userContext
    );
    
    res.status(200).json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: result
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error procesando pago:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error procesando el pago'
    });
  }
};

/**
 * Confirmar pago (efectivo/transferencia)
 * Ruta: POST /api/payments/:paymentId/confirm
 */
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const confirmationData = req.body;
    const adminId = req.user?._id;
    
    console.log(`✅ [PaymentController] Confirmando pago: ${paymentId}`);
    
    // Validar ID del pago
    const paymentIdValidation = validators.mongoId(paymentId, 'ID de pago');
    if (!paymentIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: paymentIdValidation.error
      });
    }
    
    // Validar datos de confirmación
    const confirmationValidation = validateConfirmationData(confirmationData);
    if (!confirmationValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: confirmationValidation.error
      });
    }
    
    // AQUÍ SE CONECTA CON LOS SERVICES
    const result = await paymentProcessor.confirmPayment(
      paymentIdValidation.cleaned,
      confirmationValidation.cleaned,
      { adminId, adminRole: req.user.role }
    );
    
    res.status(200).json({
      success: true,
      message: 'Pago confirmado exitosamente',
      data: result
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error confirmando pago:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error confirmando el pago'
    });
  }
};

/**
 * Subir comprobante de transferencia
 * Ruta: POST /api/payments/:paymentId/transfer-proof
 */
export const submitTransferProof = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;
    
    console.log(`📄 [PaymentController] Subiendo comprobante: ${paymentId}`);
    
    // Validar ID del pago
    const paymentIdValidation = validators.mongoId(paymentId, 'ID de pago');
    if (!paymentIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: paymentIdValidation.error
      });
    }
    
    // Verificar que hay archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar el comprobante'
      });
    }
    
    // Verificar que el pago existe y es del usuario
    const payment = await Payment.findOne({
      _id: paymentIdValidation.cleaned,
      createdBy: userId,
      method: 'bank_transfer'
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    // Preparar datos del comprobante
    const proofData = {
      proofFile: req.file,
      transferDate: req.body.transferDate,
      bankReference: req.body.bankReference,
      notes: req.body.notes
    };
    
    // AQUÍ SE CONECTA CON EL PROVIDER ESPECÍFICO
    const bankProvider = paymentProcessor.getProvider('bank_transfer');
    const result = await bankProvider.submitProof(payment, proofData, { userId });
    
    res.status(200).json({
      success: true,
      message: 'Comprobante subido exitosamente',
      data: result
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error subiendo comprobante:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error subiendo el comprobante'
    });
  }
};

/**
 * Cancelar pago
 * Ruta: POST /api/payments/:paymentId/cancel
 */
export const cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;
    const isAdmin = req.user?.role && ['admin', 'manager'].includes(req.user.role);
    
    // Validar ID del pago
    const paymentIdValidation = validators.mongoId(paymentId, 'ID de pago');
    if (!paymentIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: paymentIdValidation.error
      });
    }
    
    // AQUÍ SE CONECTA CON LOS SERVICES
    const result = await paymentProcessor.cancelPayment(
      paymentIdValidation.cleaned,
      reason,
      { userId, adminId: isAdmin ? req.user._id : null }
    );
    
    res.status(200).json({
      success: true,
      message: 'Pago cancelado exitosamente',
      data: result
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error cancelando pago:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelando el pago'
    });
  }
};

// ==================== CONSULTAS ====================

/**
 * Obtener estado de pagos de una orden
 * Ruta: GET /api/payments/orders/:orderId/status
 */
export const getOrderPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role && ['admin', 'manager', 'employee'].includes(req.user.role);
    
    // Validar ID de orden
    const orderIdValidation = validators.mongoId(orderId, 'ID de orden');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: orderIdValidation.error
      });
    }
    
    // Preparar contexto
    const userContext = {
      userId: isAdmin ? null : userId,
      adminId: isAdmin ? req.user._id : null
    };
    
    // AQUÍ SE CONECTA CON LOS SERVICES
    const status = await paymentProcessor.getOrderPaymentStatus(
      orderIdValidation.cleaned,
      userContext
    );
    
    res.status(200).json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error obteniendo estado:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error obteniendo el estado'
    });
  }
};

/**
 * Obtener detalles de un pago
 * Ruta: GET /api/payments/:paymentId
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role && ['admin', 'manager', 'employee'].includes(req.user.role);
    
    // Validar ID del pago
    const paymentIdValidation = validators.mongoId(paymentId, 'ID de pago');
    if (!paymentIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: paymentIdValidation.error
      });
    }
    
    // Construir query según permisos
    const query = { _id: paymentIdValidation.cleaned };
    if (!isAdmin) {
      query.createdBy = userId;
    }
    
    // Buscar pago
    const payment = await Payment.findOne(query)
      .populate('orderId', 'orderNumber total user')
      .populate('createdBy', 'name email')
      .populate('cashDetails.collectedBy', 'name')
      .populate('transferDetails.verifiedBy', 'name');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    // Determinar qué datos mostrar según el rol
    const paymentData = isAdmin ? 
      getFullPaymentDetails(payment) : 
      payment.toPublicObject();
    
    res.status(200).json({
      success: true,
      data: paymentData
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error obteniendo detalles:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error obteniendo detalles'
    });
  }
};

/**
 * Listar pagos (admin)
 * Ruta: GET /api/payments
 */
export const listPayments = async (req, res) => {
  try {
    // Parsear filtros
    const {
      status,
      method,
      orderId,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;
    
    // Construir query de filtros
    const query = {};
    
    if (status) query.status = status;
    if (method) query.method = method;
    if (orderId) {
      const orderValidation = validators.mongoId(orderId, 'ID de orden');
      if (orderValidation.isValid) {
        query.orderId = orderValidation.cleaned;
      }
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Validar paginación
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    
    // Ejecutar consulta
    const payments = await Payment.find(query)
      .populate('orderId', 'orderNumber user')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    
    const total = await Payment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        payments: payments.map(p => getListPaymentData(p)),
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error listando pagos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error listando pagos'
    });
  }
};

// ==================== MÉTODOS ESPECÍFICOS ====================

/**
 * Obtener transferencias pendientes
 * Ruta: GET /api/payments/transfers/pending
 */
export const getPendingTransfers = async (req, res) => {
  try {
    // AQUÍ SE CONECTA CON EL PROVIDER ESPECÍFICO
    const bankProvider = paymentProcessor.getProvider('bank_transfer');
    const pendingTransfers = await bankProvider.getPendingTransfers();
    
    res.status(200).json({
      success: true,
      data: {
        transfers: pendingTransfers.map(t => ({
          paymentId: t._id,
          orderNumber: t.orderId.orderNumber,
          customerName: t.createdBy?.name,
          amount: t.amount,
          formattedAmount: t.formattedAmount,
          referenceNumber: t.transferDetails?.referenceNumber,
          proofUrl: t.transferDetails?.proofUrl,
          transferDate: t.transferDetails?.transferDate,
          submittedAt: t.updatedAt,
          waitingTime: calculateWaitingTime(t.updatedAt)
        })),
        count: pendingTransfers.length
      }
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error obteniendo transferencias:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error obteniendo transferencias'
    });
  }
};

/**
 * Generar reporte de efectivo
 * Ruta: GET /api/payments/reports/cash
 */
export const generateCashReport = async (req, res) => {
  try {
    const { date, startDate, endDate, collectorId } = req.query;
    
    // AQUÍ SE CONECTA CON EL PROVIDER ESPECÍFICO
    const cashProvider = paymentProcessor.getProvider('cash');
    
    let report;
    if (date) {
      report = await cashProvider.generateDailyCashReport(date);
    } else if (startDate && endDate) {
      report = await cashProvider.getCashPaymentsSummary(startDate, endDate, collectorId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar fecha o rango de fechas'
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error generando reporte:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generando reporte'
    });
  }
};

/**
 * Webhook de Wompi
 * Ruta: POST /api/payments/webhooks/wompi
 */
export const handleWompiWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.get('x-wompi-signature');
    const timestamp = req.get('x-wompi-timestamp');
    
    console.log('📥 [PaymentController] Webhook Wompi recibido');
    
    // Buscar pago por referencia
    const { data: transactionData } = webhookData;
    const payment = await Payment.findOne({
      method: 'wompi',
      'wompiDetails.reference': transactionData.reference
    });
    
    if (!payment) {
      return res.status(404).json({ 
        received: false, 
        message: 'Payment not found' 
      });
    }
    
    // AQUÍ SE CONECTA CON EL PROVIDER ESPECÍFICO
    const wompiProvider = paymentProcessor.getProvider('wompi');
    await wompiProvider.confirm(payment, {
      transactionData,
      signature,
      timestamp,
      isWebhook: true
    }, { source: 'webhook' });
    
    res.status(200).json({
      received: true,
      processed: true,
      paymentId: payment._id
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error en webhook:', error);
    res.status(500).json({
      received: true,
      processed: false,
      error: error.message
    });
  }
};

/**
 * Reenviar instrucciones de transferencia
 * Ruta: POST /api/payments/:paymentId/resend-instructions
 */
export const resendTransferInstructions = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;
    
    // Validar y buscar pago
    const paymentIdValidation = validators.mongoId(paymentId, 'ID de pago');
    if (!paymentIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: paymentIdValidation.error
      });
    }
    
    const payment = await Payment.findOne({
      _id: paymentIdValidation.cleaned,
      createdBy: userId,
      method: 'bank_transfer',
      status: 'pending'
    }).populate('orderId');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    // AQUÍ SE CONECTA CON EL PROVIDER ESPECÍFICO
    const bankProvider = paymentProcessor.getProvider('bank_transfer');
    const bankConfig = await bankProvider.getBankAccountsConfig();
    const instructions = await bankProvider.generateTransferInstructions(
      payment,
      payment.orderId,
      payment.transferDetails?.referenceNumber || `TRF-${payment.orderId.orderNumber}-${Date.now()}`,
      bankConfig
    );
    
    await bankProvider.sendTransferInstructionsEmail(
      payment,
      payment.orderId,
      instructions,
      payment.transferDetails?.customerEmail || payment.orderId.user?.email
    );
    
    res.status(200).json({
      success: true,
      message: 'Instrucciones reenviadas exitosamente'
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error reenviando:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error reenviando instrucciones'
    });
  }
};

/**
 * Rechazar transferencia
 * Ruta: POST /api/payments/:paymentId/reject
 */
export const rejectTransfer = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?._id;
    
    // Validar ID del pago
    const paymentIdValidation = validators.mongoId(paymentId, 'ID de pago');
    if (!paymentIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: paymentIdValidation.error
      });
    }
    
    // AQUÍ SE CONECTA CON LOS SERVICES
    const result = await paymentProcessor.confirmPayment(
      paymentIdValidation.cleaned,
      {
        isApproved: false,
        verificationNotes: reason
      },
      { adminId, adminRole: req.user.role }
    );
    
    res.status(200).json({
      success: true,
      message: 'Transferencia rechazada exitosamente',
      data: result
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error rechazando:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error rechazando transferencia'
    });
  }
};

/**
 * Historial de cliente
 * Ruta: GET /api/payments/customers/:userId/history
 */
export const getCustomerPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validar ID del usuario
    const userIdValidation = validators.mongoId(userId, 'ID de usuario');
    if (!userIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: userIdValidation.error
      });
    }
    
    // Buscar pagos del cliente
    const payments = await Payment.find({
      createdBy: userIdValidation.cleaned
    })
    .populate('orderId', 'orderNumber total status')
    .sort({ createdAt: -1 });
    
    // Calcular estadísticas
    const stats = {
      totalPayments: payments.length,
      completedPayments: payments.filter(p => p.status === 'completed').length,
      totalPaid: payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
      preferredMethod: getPreferredPaymentMethod(payments),
      avgAmount: payments.length > 0 ? 
        payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0
    };
    
    res.status(200).json({
      success: true,
      data: {
        payments: payments.map(p => getListPaymentData(p)),
        stats
      }
    });
    
  } catch (error) {
    console.error('❌ [PaymentController] Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error obteniendo historial'
    });
  }
};

// ==================== FUNCIONES UTILITARIAS ====================

function validatePaymentData(paymentData) {
  const { method, amount, timing, paymentType, percentage, notes } = paymentData;
  
  if (!method || !['wompi', 'cash', 'bank_transfer'].includes(method)) {
    return { isValid: false, error: 'Método de pago inválido' };
  }
  
  if (timing && !['advance', 'on_delivery'].includes(timing)) {
    return { isValid: false, error: 'Timing inválido' };
  }
  
  if (paymentType && !['full', 'partial', 'advance_deposit'].includes(paymentType)) {
    return { isValid: false, error: 'Tipo de pago inválido' };
  }
  
  if (paymentType === 'partial' && (!percentage || percentage < 1 || percentage > 100)) {
    return { isValid: false, error: 'Porcentaje inválido' };
  }
  
  if (amount && (amount <= 0 || amount > 50000)) {
    return { isValid: false, error: 'Monto inválido' };
  }
  
  if (notes && notes.length > 1000) {
    return { isValid: false, error: 'Notas muy largas' };
  }
  
  return {
    isValid: true,
    cleaned: {
      method,
      amount: amount ? parseFloat(amount) : undefined,
      timing: timing || 'on_delivery',
      paymentType: paymentType || 'full',
      percentage: percentage ? parseInt(percentage) : 100,
      notes: notes?.trim() || '',
      ...paymentData
    }
  };
}

function validateConfirmationData(confirmationData) {
  const errors = [];
  
  if (confirmationData.receivedAmount !== undefined) {
    const amount = parseFloat(confirmationData.receivedAmount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Monto recibido inválido');
    }
  }
  
  if (confirmationData.isApproved !== undefined) {
    if (typeof confirmationData.isApproved !== 'boolean') {
      errors.push('isApproved debe ser true/false');
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, error: errors.join(', ') };
  }
  
  return { isValid: true, cleaned: confirmationData };
}

function getFullPaymentDetails(payment) {
  return {
    ...payment.toPublicObject(),
    adminData: {
      createdBy: payment.createdBy,
      createdByModel: payment.createdByModel,
      processedAt: payment.processedAt,
      errorMessages: payment.errorMessages,
      metadata: payment.metadata,
      cashDetails: payment.method === 'cash' ? payment.cashDetails : undefined,
      transferDetails: payment.method === 'bank_transfer' ? payment.transferDetails : undefined,
      wompiDetails: payment.method === 'wompi' ? payment.wompiDetails : undefined
    }
  };
}

function getListPaymentData(payment) {
  return {
    id: payment._id,
    orderId: payment.orderId?._id,
    orderNumber: payment.orderId?.orderNumber,
    customerName: payment.createdBy?.name,
    amount: payment.amount,
    formattedAmount: payment.formattedAmount,
    method: payment.method,
    status: payment.status,
    timing: payment.timing,
    paymentType: payment.paymentType,
    createdAt: payment.createdAt,
    processedAt: payment.processedAt,
    completedAt: payment.completedAt
  };
}

function calculateWaitingTime(submittedAt) {
  const now = new Date();
  const submitted = new Date(submittedAt);
  const diffHours = Math.floor((now - submitted) / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Menos de 1 hora';
  if (diffHours < 24) return `${diffHours} horas`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} días`;
}

function getPreferredPaymentMethod(payments) {
  const methodCounts = payments.reduce((acc, payment) => {
    acc[payment.method] = (acc[payment.method] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(methodCounts).reduce((a, b) => 
    methodCounts[a] > methodCounts[b] ? a : b, 'none'
  );
}