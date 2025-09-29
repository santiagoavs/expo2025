// controllers/quality-approval.controller.js - Controlador para manejo de aprobaciones de calidad
import Order from '../models/order.js';
import { qualityApprovalService } from '../services/email/quality-approval.service.js';
import { validateMongoId } from '../middlewares/validation.middleware.js';

// Aprobar calidad del producto
export const approveQuality = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { token } = req.query;

    // Validar ID de orden
    const orderIdValidation = validateMongoId(orderId);
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido",
        error: orderIdValidation.error
      });
    }

    // Verificar token
    if (!qualityApprovalService.verifyToken(token, orderId, 'approve')) {
      return res.status(400).json({
        success: false,
        message: "Token de aprobación inválido o expirado"
      });
    }

    // Buscar la orden
    const order = await Order.findById(orderIdValidation.cleaned);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    // Verificar que esté en control de calidad
    if (order.status !== 'quality_check') {
      return res.status(400).json({
        success: false,
        message: "La orden no está en etapa de control de calidad"
      });
    }

    // Actualizar estado a calidad aprobada
    order.status = 'quality_approved';
    order.statusHistory.push({
      status: 'quality_approved',
      timestamp: new Date(),
      notes: 'Calidad aprobada por el cliente',
      updatedBy: 'customer'
    });

    await order.save();

    console.log('✅ [QualityApproval] Calidad aprobada para orden:', order.orderNumber);

    res.json({
      success: true,
      message: "Calidad aprobada exitosamente",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        newStatus: order.status
      }
    });

  } catch (error) {
    console.error('❌ [QualityApproval] Error aprobando calidad:', error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// Rechazar calidad del producto
export const rejectQuality = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { token, reason } = req.query;

    // Validar ID de orden
    const orderIdValidation = validateMongoId(orderId);
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido",
        error: orderIdValidation.error
      });
    }

    // Verificar token
    if (!qualityApprovalService.verifyToken(token, orderId, 'reject')) {
      return res.status(400).json({
        success: false,
        message: "Token de rechazo inválido o expirado"
      });
    }

    // Buscar la orden
    const order = await Order.findById(orderIdValidation.cleaned);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    // Verificar que esté en control de calidad
    if (order.status !== 'quality_check') {
      return res.status(400).json({
        success: false,
        message: "La orden no está en etapa de control de calidad"
      });
    }

    // Agregar nota de rechazo al historial
    order.statusHistory.push({
      status: 'quality_check',
      timestamp: new Date(),
      notes: `Calidad rechazada por el cliente. Razón: ${reason || 'No especificada'}`,
      updatedBy: 'customer',
      rejectionReason: reason
    });

    await order.save();

    console.log('❌ [QualityApproval] Calidad rechazada para orden:', order.orderNumber, 'Razón:', reason);

    res.json({
      success: true,
      message: "Calidad rechazada. El equipo revisará tus comentarios.",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        rejectionReason: reason
      }
    });

  } catch (error) {
    console.error('❌ [QualityApproval] Error rechazando calidad:', error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// Obtener estado de aprobación de calidad
export const getQualityStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validar ID de orden
    const orderIdValidation = validateMongoId(orderId);
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido",
        error: orderIdValidation.error
      });
    }

    // Buscar la orden
    const order = await Order.findById(orderIdValidation.cleaned)
      .populate('user', 'name email phoneNumber')
      .populate('items.product', 'name images')
      .populate('items.design', 'name previewImage');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    // Buscar eventos de control de calidad en el historial
    const qualityEvents = order.statusHistory.filter(event => 
      event.status === 'quality_check' || 
      event.notes?.includes('calidad') ||
      event.notes?.includes('Calidad')
    );

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        qualityEvents,
        isInQualityCheck: order.status === 'quality_check',
        lastQualityEvent: qualityEvents[qualityEvents.length - 1] || null
      }
    });

  } catch (error) {
    console.error('❌ [QualityApproval] Error obteniendo estado de calidad:', error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// Obtener información de la orden para aprobación
export const getOrderForApproval = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validar ID
    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido"
      });
    }

    // Buscar la orden con información completa
    const order = await Order.findById(orderId)
      .populate('user', 'name email phoneNumber')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que esté en control de calidad
    if (order.status !== 'quality_check') {
      return res.status(400).json({
        success: false,
        message: 'La orden no está en etapa de control de calidad'
      });
    }

    // Obtener la foto de calidad más reciente
    const qualityPhoto = order.statusHistory
      .filter(entry => entry.photoUrl)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.photoUrl;

    // Preparar respuesta
    const orderData = {
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      user: order.user,
      items: order.items,
      qualityPhoto: qualityPhoto,
      createdAt: order.createdAt,
      statusHistory: order.statusHistory
    };

    console.log('✅ [QualityApprovalController] Orden obtenida para aprobación:', {
      orderId,
      orderNumber: order.orderNumber,
      hasPhoto: !!qualityPhoto
    });

    res.json({
      success: true,
      data: orderData
    });

  } catch (error) {
    console.error('❌ [QualityApprovalController] Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Enviar respuesta del cliente
export const submitClientResponse = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { approved, notes, responseDate } = req.body;

    // Validar ID
    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido"
      });
    }

    // Validar datos
    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "Campo 'approved' es requerido y debe ser boolean"
      });
    }

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que esté en control de calidad
    if (order.status !== 'quality_check') {
      return res.status(400).json({
        success: false,
        message: 'La orden no está en etapa de control de calidad'
      });
    }

    // Actualizar estado según respuesta
    const newStatus = approved ? 'quality_approved' : 'quality_check';
    
    // Agregar entrada al historial
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      notes: approved 
        ? 'Calidad aprobada por el cliente' 
        : `Calidad rechazada por el cliente${notes ? ': ' + notes : ''}`,
      updatedBy: 'client',
      clientResponse: {
        approved: approved,
        notes: notes || '',
        responseDate: responseDate || new Date().toISOString()
      }
    });

    // Actualizar estado si fue aprobado
    if (approved) {
      order.status = 'quality_approved';
    }

    await order.save();

    console.log('✅ [QualityApprovalController] Respuesta del cliente registrada:', {
      orderId,
      approved,
      hasNotes: !!notes,
      newStatus
    });

    res.json({
      success: true,
      message: 'Respuesta registrada exitosamente',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        approved: approved,
        newStatus: newStatus,
        responseDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [QualityApprovalController] Error registrando respuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener respuestas del cliente
export const getClientResponses = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validar ID
    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido"
      });
    }

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Obtener todas las respuestas del cliente
    const responses = order.statusHistory
      .filter(entry => entry.clientResponse)
      .map(entry => ({
        id: entry._id,
        approved: entry.clientResponse.approved,
        notes: entry.clientResponse.notes,
        responseDate: entry.clientResponse.responseDate,
        timestamp: entry.timestamp,
        status: entry.status
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        responses: responses,
        totalResponses: responses.length
      }
    });

  } catch (error) {
    console.error('❌ [QualityApprovalController] Error obteniendo respuestas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export default {
  approveQuality,
  rejectQuality,
  getQualityStatus,
  getOrderForApproval,
  submitClientResponse,
  getClientResponses
};
