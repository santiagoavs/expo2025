// controllers/payment.controller.js - Controlador para pagos
import { PaymentProcessor } from '../services/payment/PaymentProcessor.js';
import Order from '../models/order.js';
import { notificationService } from '../services/email/notification.service.js';

const paymentController = {};
const paymentProcessor = new PaymentProcessor();

/**
 * Crear pago usando PaymentProcessor
 */
paymentController.createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentData } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // ✅ VALIDACIÓN FLEXIBLE: Permitir pagos en más estados
    const allowedPaymentStates = ['pending_approval', 'approved', 'quoted', 'ready_for_delivery'];
    
    // ✅ DETECTAR SI ES ADMIN: Los admins pueden acceder a cualquier orden
    const isAdmin = ['admin', 'manager'].includes(userRole);
    
    // Construir query según el tipo de usuario
    const query = {
      _id: orderId,
      status: { $in: allowedPaymentStates }
    };
    
    // Solo usuarios normales necesitan validar que la orden les pertenece
    if (!isAdmin) {
      query.user = userId;
    }
    
    // Validar que la orden existe y cumple los criterios
    const order = await Order.findOne(query).populate('user', 'name email phoneNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Orden no encontrada o no disponible para pago. Estados permitidos: ${allowedPaymentStates.join(', ')}`,
        error: 'ORDER_NOT_FOUND'
      });
    }

    // ✅ CONTEXTO DE USUARIO: Diferente para admins y usuarios normales
    const userContext = isAdmin ? {
      adminId: userId,
      adminRole: userRole,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      source: 'admin'
    } : {
      userId: userId,
      userEmail: order.user.email,
      userName: order.user.name,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      source: 'web'
    };

    // Usar PaymentProcessor para procesar el pago
    const result = await paymentProcessor.processPayment(
      { orderId: order._id },
      {
        method: paymentMethod,
        ...paymentData
      },
      userContext
    );

    // Actualizar orden con resultado del pago
    order.payment.method = paymentMethod;
    order.payment.status = result.status;
    order.payment.metadata = result.providerData || {};
    
    if (result.wompiData) {
      order.payment.metadata.wompiData = result.wompiData;
    }

    await order.save();

    res.status(201).json({
      success: true,
      message: `Pago iniciado con ${paymentMethod}`,
      data: {
        status: result.status,
        amount: order.total,
        ...result.responseData
      }
    });

  } catch (error) {
    console.error("❌ Error en createPayment:", error);
    res.status(500).json({
      success: false,
      message: "Error procesando pago",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtener métodos de pago disponibles
 */
paymentController.getPaymentMethods = async (req, res) => {
  try {
    const wompiProvider = paymentProcessor.getProvider('wompi');
    const bankTransferProvider = paymentProcessor.getProvider('bank_transfer');
    const cashProvider = paymentProcessor.getProvider('cash');

    const methods = [
      {
        id: 'cash',
        name: 'Efectivo',
        description: 'Pago contra entrega',
        available: true,
        config: cashProvider.getPublicConfig()
      },
      {
        id: 'bank_transfer',
        name: 'Transferencia Bancaria',
        description: 'Transferencia a cuenta bancaria',
        available: true,
        config: bankTransferProvider.getPublicConfig()
      },
      {
        id: 'wompi',
        name: 'Tarjeta de Crédito/Débito',
        description: 'Pago con tarjeta via Wompi',
        available: wompiProvider.getPublicConfig().isConfigured,
        config: wompiProvider.getPublicConfig()
      }
    ];

    res.status(200).json({
      success: true,
      data: { methods }
    });

  } catch (error) {
    console.error("❌ Error en getPaymentMethods:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo métodos de pago",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Verificar estado de pago
 */
paymentController.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).populate('user', 'name email phoneNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
        error: 'ORDER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: order.payment.status,
        method: order.payment.method,
        totalPaid: order.payment.totalPaid,
        balance: order.payment.balance,
        lastUpdated: order.updatedAt,
        metadata: order.payment.metadata
      }
    });

  } catch (error) {
    console.error("❌ Error en getPaymentStatus:", error);
    res.status(500).json({
      success: false,
      message: "Error consultando estado de pago",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Webhook de Wompi
 */
paymentController.handleWompiWebhook = async (req, res) => {
  try {
    const wompiProvider = paymentProcessor.getProvider('wompi');
    const result = await wompiProvider.handleWebhook(req.body, req.headers);
    
    if (result && result.orderId) {
      // Buscar orden
      const order = await Order.findById(result.orderId).populate('user', 'name email phoneNumber');

      if (order) {
        // Actualizar estado de pago
        order.payment.status = result.status;
        order.payment.totalPaid = result.amount;
        order.payment.balance = order.total - result.amount;

        if (result.status === 'APPROVED') {
          order.status = 'approved';
          order.payment.status = 'completed';
        }

        await order.save();

        // Notificar al cliente
        await notificationService.sendStatusUpdateNotification({
          orderNumber: order.orderNumber,
          newStatus: result.status,
          previousStatus: 'processing',
          userEmail: order.user.email,
          userName: order.user.name,
          userPhone: order.user.phoneNumber,
          order: order
        });
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ Error en handleWompiWebhook:", error);
    res.status(500).json({
      success: false,
      message: "Error procesando webhook"
    });
  }
};

/**
 * Listar pagos con paginación
 */
paymentController.listPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, method } = req.query;
    const userId = req.user._id;

    // Construir filtros
    const filters = { user: userId };
    if (status) filters['payment.status'] = status;
    if (method) filters['payment.method'] = method;

    // Buscar órdenes con paginación
    const orders = await Order.find(filters)
      .populate('user', 'name email phoneNumber')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filters);

    // Formatear datos de pagos
    const payments = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      amount: order.total,
      status: order.payment.status,
      method: order.payment.method,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user,
      items: order.items
    }));

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error("❌ Error en listPayments:", error);
    res.status(500).json({
      success: false,
      message: "Error listando pagos",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtener transferencias pendientes
 */
paymentController.getPendingTransfers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Buscar órdenes con transferencias bancarias pendientes
    const orders = await Order.find({
      user: userId,
      'payment.method': 'bank_transfer',
      'payment.status': { $in: ['pending', 'processing'] }
    })
    .populate('user', 'name email phoneNumber')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });

    // Formatear transferencias pendientes
    const pendingTransfers = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      amount: order.total,
      status: order.payment.status,
      createdAt: order.createdAt,
      user: order.user,
      items: order.items,
      bankDetails: order.payment.metadata?.bankDetails || null
    }));

    res.status(200).json({
      success: true,
      data: {
        transfers: pendingTransfers,
        count: pendingTransfers.length
      }
    });

  } catch (error) {
    console.error("❌ Error en getPendingTransfers:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo transferencias pendientes",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Confirmar pago (efectivo/transferencia)
 */
paymentController.confirmPayment = async (req, res) => {
  try {
    const { id: paymentId } = req.params;
    const { receivedAmount, changeGiven, notes, isApproved } = req.body;
    const adminId = req.user._id;

    console.log('✅ [paymentController] Confirmando pago:', {
      paymentId,
      receivedAmount,
      changeGiven,
      isApproved,
      adminId
    });

    // Buscar el pago
    const Payment = (await import('../models/payment.js')).default;
    const payment = await Payment.findById(paymentId).populate('orderId');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Pago no encontrado",
        error: 'PAYMENT_NOT_FOUND'
      });
    }

    // Verificar que el pago esté en estado pendiente
    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "El pago no está en estado pendiente",
        error: 'PAYMENT_NOT_PENDING'
      });
    }

    // Usar PaymentProcessor para confirmar el pago
    const confirmationData = {
      receivedAmount: parseFloat(receivedAmount),
      changeGiven: changeGiven ? parseFloat(changeGiven) : 0,
      notes: notes || '',
      isApproved: isApproved !== false,
      confirmedBy: adminId,
      confirmedAt: new Date()
    };

    const result = await paymentProcessor.confirmPayment(
      paymentId,
      confirmationData,
      { adminId, adminRole: req.user.role }
    );

    res.status(200).json({
      success: true,
      message: "Pago confirmado exitosamente",
      data: {
        paymentId: payment._id,
        status: result.status,
        amount: payment.amount,
        receivedAmount: confirmationData.receivedAmount,
        changeGiven: confirmationData.changeGiven
      }
    });

  } catch (error) {
    console.error("❌ Error en confirmPayment:", error);
    res.status(500).json({
      success: false,
      message: "Error confirmando pago",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

export default paymentController;