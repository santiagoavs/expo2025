// controllers/paymentSelection.controller.js - Controlador para selección de métodos de pago
import { 
  getAvailablePaymentMethodsForUser, 
  validateSelectedPaymentMethod,
  processPayment 
} from '../services/payment/paymentSelection.service.js';
import Order from '../models/order.js';

const paymentSelectionController = {};

/**
 * Obtener métodos de pago disponibles para un usuario
 */
paymentSelectionController.getAvailableMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`💳 [PaymentSelection] Obteniendo métodos para usuario: ${userId}`);

    const result = await getAvailablePaymentMethodsForUser(userId);

    res.json(result);

  } catch (error) {
    console.error('❌ [PaymentSelection] Error obteniendo métodos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Validar método de pago seleccionado
 */
paymentSelectionController.validateMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentData = req.body;

    console.log(`🔍 [PaymentSelection] Validando método para usuario: ${userId}`);

    const result = await validateSelectedPaymentMethod(userId, paymentData);

    res.json(result);

  } catch (error) {
    console.error('❌ [PaymentSelection] Error validando método:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error validando método de pago',
      error: error.message
    });
  }
};

/**
 * Procesar pago para una orden
 */
paymentSelectionController.processOrderPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const paymentData = req.body;

    console.log(`💳 [PaymentSelection] Procesando pago para orden: ${orderId}`);

    // Verificar que la orden pertenece al usuario
    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Verificar que la orden puede ser pagada
    if (!['pending_approval', 'approved'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'La orden no puede ser pagada en su estado actual',
        error: 'INVALID_ORDER_STATUS'
      });
    }

    // Validar método de pago
    const validationResult = await validateSelectedPaymentMethod(userId, paymentData);
    if (!validationResult.success) {
      return res.status(400).json(validationResult);
    }

    // Procesar pago
    const paymentResult = await processPayment(orderId, validationResult.method, paymentData);

    // Actualizar orden con información de pago
    order.payment = {
      method: validationResult.method.type,
      status: 'pending',
      timing: paymentData.timing || 'on_delivery',
      amount: order.total,
      currency: 'USD',
      ...paymentResult.paymentResult
    };

    await order.save();

    console.log(`✅ [PaymentSelection] Pago procesado para orden: ${orderId}`);

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      payment: order.payment,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total
      }
    });

  } catch (error) {
    console.error('❌ [PaymentSelection] Error procesando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener estado de pago de una orden
 */
paymentSelectionController.getPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    console.log(`📊 [PaymentSelection] Obteniendo estado de pago para orden: ${orderId}`);

    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    }).select('payment orderNumber status total');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
        error: 'ORDER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      payment: order.payment,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total
      }
    });

  } catch (error) {
    console.error('❌ [PaymentSelection] Error obteniendo estado de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Exportar funciones individuales
export const {
  getAvailableMethods,
  validateMethod,
  processOrderPayment,
  getPaymentStatus
} = paymentSelectionController;

export default paymentSelectionController;
