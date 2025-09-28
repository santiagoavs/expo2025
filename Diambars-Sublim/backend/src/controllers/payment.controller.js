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

    // Validar que la orden existe y pertenece al usuario
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: { $in: ['pending_approval', 'approved'] }
    }).populate('user', 'name email phoneNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada o no disponible para pago",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Usar PaymentProcessor para procesar el pago
    const result = await paymentProcessor.processPayment(
      order,
      {
        method: paymentMethod,
        ...paymentData
      },
      {
        userId: userId,
        userEmail: order.user.email,
        userName: order.user.name
      }
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

export default paymentController;