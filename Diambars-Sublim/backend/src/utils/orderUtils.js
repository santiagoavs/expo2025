// utils/orderUtils.js - Helpers SIN cálculos de precios
import mongoose from 'mongoose';

/**
 * Validar formato de número de pedido
 */
export const isValidOrderNumber = (orderNumber) => {
  if (!orderNumber || typeof orderNumber !== 'string') return false;
  
  // Formato: DS241201001 (DS + YYMMDD + 3 dígitos)
  const orderRegex = /^DS\d{8}$/;
  return orderRegex.test(orderNumber);
};

/**
 * Generar número de pedido único
 */
export const generateOrderNumber = async (OrderModel) => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const prefix = `DS${year}${month}${day}`;
  
  // Buscar el último pedido del día
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const lastOrder = await OrderModel.findOne({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    orderNumber: { $regex: `^${prefix}` }
  }, {}, { sort: { orderNumber: -1 } });
  
  let nextNumber = 1;
  if (lastOrder && lastOrder.orderNumber) {
    const lastNumber = parseInt(lastOrder.orderNumber.slice(-3));
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  const suffix = ('000' + nextNumber).slice(-3);
  return `${prefix}${suffix}`;
};

/**
 * Validar estado de transición de pedido
 */
export const isValidStatusTransition = (currentStatus, newStatus, userRole = 'user') => {
  const transitions = {
    user: {
      'quoted': ['rejected'], // Cliente puede rechazar cotización
      'delivered': ['completed'] // Cliente puede marcar como completado
    },
    admin: {
      'pending_approval': ['quoted', 'rejected', 'cancelled'],
      'quoted': ['approved', 'rejected', 'cancelled'],
      'approved': ['in_production', 'cancelled'],
      'rejected': ['pending_approval'],
      'in_production': ['ready_for_delivery', 'cancelled'],
      'ready_for_delivery': ['delivered', 'cancelled'],
      'delivered': ['completed'],
      'cancelled': ['pending_approval'], // Admin puede reactivar
      'completed': [] // Estado final
    }
  };
  
  const roleTransitions = transitions[userRole === 'admin' ? 'admin' : 'user'];
  return roleTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Obtener siguiente estados válidos
 */
export const getNextValidStatuses = (currentStatus, userRole = 'user') => {
  const transitions = {
    user: {
      'quoted': ['rejected'],
      'delivered': ['completed']
    },
    admin: {
      'pending_approval': ['quoted', 'rejected', 'cancelled'],
      'quoted': ['approved', 'rejected', 'cancelled'],
      'approved': ['in_production', 'cancelled'],
      'rejected': ['pending_approval'],
      'in_production': ['ready_for_delivery', 'cancelled'],
      'ready_for_delivery': ['delivered', 'cancelled'],
      'delivered': ['completed'],
      'cancelled': ['pending_approval']
    }
  };
  
  const roleTransitions = transitions[userRole === 'admin' ? 'admin' : 'user'];
  return roleTransitions[currentStatus] || [];
};

/**
 * Verificar si un pedido puede ser cancelado
 */
export const canBeCancelled = (order) => {
  const cancellableStatuses = ['pending_approval', 'quoted', 'approved'];
  return cancellableStatuses.includes(order.status) && 
         order.payment.status !== 'paid';
};

/**
 * Obtener descripción amigable del estado
 */
export const getStatusDescription = (status) => {
  const descriptions = {
    'pending_approval': 'Esperando aprobación del admin',
    'quoted': 'Cotizado - esperando respuesta del cliente',
    'approved': 'Aprobado - listo para producción',
    'rejected': 'Rechazado',
    'in_production': 'En proceso de producción',
    'ready_for_delivery': 'Listo para entrega',
    'delivered': 'Entregado al cliente',
    'completed': 'Completado exitosamente',
    'cancelled': 'Cancelado'
  };
  
  return descriptions[status] || status;
};

/**
 * Obtener color del estado para UI
 */
export const getStatusColor = (status) => {
  const colors = {
    'pending_approval': '#FFA500', // Naranja
    'quoted': '#4169E1',           // Azul
    'approved': '#32CD32',         // Verde claro
    'rejected': '#DC143C',         // Rojo
    'in_production': '#FF69B4',    // Rosa
    'ready_for_delivery': '#00CED1', // Turquesa
    'delivered': '#228B22',        // Verde
    'completed': '#006400',        // Verde oscuro
    'cancelled': '#696969'         // Gris
  };
  
  return colors[status] || '#808080';
};

/**
 * Validar datos de dirección de entrega
 */
export const validateDeliveryAddress = (address) => {
  const errors = [];
  
  if (!address) {
    errors.push('Dirección es requerida');
    return { isValid: false, errors };
  }
  
  const requiredFields = ['recipient', 'phoneNumber', 'department', 'municipality', 'address'];
  const missingFields = requiredFields.filter(field => !address[field] || address[field].trim() === '');
  
  if (missingFields.length > 0) {
    errors.push(`Faltan campos requeridos: ${missingFields.join(', ')}`);
  }
  
  // Validar formato de teléfono salvadoreño
  if (address.phoneNumber) {
    const cleanPhone = address.phoneNumber.replace(/[\s-]/g, '');
    const phoneRegex = /^[267]\d{7}$/;
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Formato de teléfono inválido (debe ser de El Salvador)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar datos de punto de encuentro
 */
export const validateMeetupDetails = (meetupDetails) => {
  const errors = [];
  
  if (!meetupDetails) {
    errors.push('Detalles del punto de encuentro son requeridos');
    return { isValid: false, errors };
  }
  
  // Validar fecha futura
  if (meetupDetails.date) {
    const meetupDate = new Date(meetupDetails.date);
    const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Mínimo 24 horas
    
    if (meetupDate < minDate) {
      errors.push('La fecha del encuentro debe ser al menos 24 horas en el futuro');
    }
  }
  
  // Validar coordenadas si se proporcionan
  if (meetupDetails.location?.coordinates) {
    const [lng, lat] = meetupDetails.location.coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number' ||
        lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      errors.push('Coordenadas de ubicación inválidas');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calcular progreso de producción
 */
export const calculateProductionProgress = (productionStages) => {
  if (!productionStages || typeof productionStages !== 'object') {
    return 0;
  }
  
  const stages = Object.keys(productionStages);
  if (stages.length === 0) return 0;
  
  const completedStages = stages.filter(stage => 
    productionStages[stage]?.completed === true
  );
  
  return Math.round((completedStages.length / stages.length) * 100);
};

/**
 * Obtener etapas de producción completadas
 */
export const getCompletedStages = (productionStages) => {
  if (!productionStages || typeof productionStages !== 'object') {
    return [];
  }
  
  return Object.keys(productionStages).filter(stage => 
    productionStages[stage]?.completed === true
  );
};

/**
 * Obtener próxima etapa de producción
 */
export const getNextProductionStage = (productionStages) => {
  const stageOrder = [
    'sourcing_product',
    'preparing_materials', 
    'printing',
    'sublimating',
    'quality_check',
    'packaging'
  ];
  
  if (!productionStages) return stageOrder[0];
  
  for (const stage of stageOrder) {
    if (!productionStages[stage]?.completed) {
      return stage;
    }
  }
  
  return null; // Todas las etapas completadas
};

/**
 * Formatear timeline del pedido
 */
export const formatOrderTimeline = (order) => {
  const timeline = [];
  
  // Agregar eventos del historial
  if (order.statusHistory && Array.isArray(order.statusHistory)) {
    order.statusHistory.forEach(entry => {
      timeline.push({
        date: entry.timestamp,
        type: 'status_change',
        status: entry.status,
        title: getStatusDescription(entry.status),
        description: entry.notes || '',
        user: entry.changedByModel,
        completed: true
      });
    });
  }
  
  // Agregar eventos de producción
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach(item => {
      if (item.productionStages) {
        Object.entries(item.productionStages).forEach(([stage, data]) => {
          if (data.completed) {
            timeline.push({
              date: data.completedAt,
              type: 'production',
              stage,
              title: getStageTitle(stage),
              description: data.notes || '',
              photoUrl: data.photoUrl,
              completed: true
            });
          }
        });
      }
    });
  }
  
  // Ordenar por fecha
  timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return timeline;
};

/**
 * Obtener título amigable de etapa de producción
 */
export const getStageTitle = (stage) => {
  const titles = {
    'sourcing_product': 'Adquisición de Producto',
    'preparing_materials': 'Preparación de Materiales',
    'printing': 'Impresión',
    'sublimating': 'Sublimación',
    'quality_check': 'Control de Calidad',
    'packaging': 'Empaquetado'
  };
  
  return titles[stage] || stage;
};

/**
 * Validar si el usuario puede realizar una acción
 */
export const canPerformAction = (order, action, userRole, userId) => {
  // Verificar propiedad del pedido
  const isOwner = order.user.toString() === userId.toString();
  const isAdmin = ['admin', 'manager'].includes(userRole);
  
  if (!isOwner && !isAdmin) {
    return false;
  }
  
  // Acciones específicas por rol y estado
  const permissions = {
    user: {
      'respond_to_quote': order.status === 'quoted' && isOwner,
      'approve_photo': isOwner && order.productionPhotos?.some(p => !p.clientApproved),
      'cancel_order': isOwner && canBeCancelled(order),
      'mark_completed': order.status === 'delivered' && isOwner
    },
    admin: {
      'submit_quote': order.status === 'pending_approval' && isAdmin,
      'update_status': isAdmin,
      'update_production': ['approved', 'in_production'].includes(order.status) && isAdmin,
      'upload_photo': ['approved', 'in_production'].includes(order.status) && isAdmin,
      'register_payment': order.payment.status !== 'paid' && isAdmin,
      'cancel_order': isAdmin
    }
  };
  
  const rolePerms = permissions[isAdmin ? 'admin' : 'user'];
  return rolePerms[action] || false;
};

/**
 * Obtener acciones disponibles para un usuario en un pedido
 */
export const getAvailableActions = (order, userRole, userId) => {
  const actions = [];
  const isOwner = order.user.toString() === userId.toString();
  const isAdmin = ['admin', 'manager'].includes(userRole);
  
  if (isOwner) {
    if (order.status === 'quoted') {
      actions.push('accept_quote', 'reject_quote');
    }
    
    if (order.productionPhotos?.some(photo => !photo.clientApproved)) {
      actions.push('approve_photos');
    }
    
    if (canBeCancelled(order)) {
      actions.push('cancel_order');
    }
    
    if (order.status === 'delivered') {
      actions.push('mark_completed');
    }
    
    if (order.status === 'completed' && order.canReview) {
      actions.push('leave_review');
    }
  }
  
  if (isAdmin) {
    if (order.status === 'pending_approval') {
      actions.push('submit_quote', 'reject_order');
    }
    
    if (['approved', 'in_production'].includes(order.status)) {
      actions.push('update_production', 'upload_photo');
    }
    
    if (order.status === 'ready_for_delivery') {
      actions.push('mark_delivered');
    }
    
    if (order.payment.status !== 'paid') {
      actions.push('register_payment', 'confirm_payment');
    }
    
    if (canBeCancelled(order) || order.status === 'approved') {
      actions.push('cancel_order');
    }
    
    actions.push('update_status', 'add_notes');
  }
  
  return [...new Set(actions)]; // Remover duplicados
};

/**
 * Formatear datos del pedido para respuesta segura
 */
export const formatOrderForResponse = (order, includePrivateData = false) => {
  const safeOrder = {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusDescription: getStatusDescription(order.status),
    deliveryType: order.deliveryType,
    createdAt: order.createdAt,
    estimatedReadyDate: order.estimatedReadyDate,
    actualReadyDate: order.actualReadyDate,
    deliveredAt: order.deliveredAt,
    completedAt: order.completedAt
  };
  
  // Información pública del usuario
  if (order.user) {
    safeOrder.user = {
      _id: order.user._id,
      name: order.user.name,
      email: includePrivateData ? order.user.email : undefined
    };
  }
  
  // Items con información básica
  if (order.items) {
    safeOrder.items = order.items.map(item => ({
      _id: item._id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      status: item.status,
      productionProgress: item.productionProgress || 0,
      product: item.product ? {
        _id: item.product._id,
        name: item.product.name,
        images: item.product.images
      } : null,
      design: item.design ? {
        _id: item.design._id,
        name: item.design.name,
        previewImage: item.design.previewImage
      } : null
    }));
  }
  
  // Totales
  safeOrder.pricing = {
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    tax: order.tax,
    discounts: order.discounts,
    total: order.total
  };
  
  // Estado del pago (información limitada)
  safeOrder.payment = {
    method: order.payment.method,
    status: order.payment.status,
    timing: order.payment.timing
  };
  
  // Información de entrega
  if (order.deliveryType === 'delivery' && order.deliveryAddress) {
    safeOrder.deliveryAddress = includePrivateData ? order.deliveryAddress : {
      department: order.deliveryAddress.department,
      municipality: order.deliveryAddress.municipality
    };
  }
  
  if (order.deliveryType === 'meetup' && order.meetupDetails) {
    safeOrder.meetupDetails = {
      date: order.meetupDetails.date,
      location: order.meetupDetails.location,
      notes: includePrivateData ? order.meetupDetails.notes : undefined
    };
  }
  
  // Notas (solo si tiene permiso)
  if (includePrivateData) {
    safeOrder.clientNotes = order.clientNotes;
    safeOrder.adminNotes = order.adminNotes;
  }
  
  return safeOrder;
};

/**
 * Validar datos de pago en efectivo
 */
export const validateCashPaymentData = (cashData, orderTotal) => {
  const errors = [];
  
  if (!cashData) {
    errors.push('Datos de pago en efectivo requeridos');
    return { isValid: false, errors };
  }
  
  const { totalAmount, cashReceived, changeGiven } = cashData;
  
  // Validar montos
  const expectedAmount = parseFloat(totalAmount) || orderTotal;
  const receivedAmount = parseFloat(cashReceived);
  const change = parseFloat(changeGiven) || 0;
  
  if (isNaN(receivedAmount) || receivedAmount <= 0) {
    errors.push('Monto recibido debe ser mayor que cero');
  }
  
  if (receivedAmount < expectedAmount) {
    errors.push('El monto recibido es menor al total del pedido');
  }
  
  if (change < 0) {
    errors.push('El cambio no puede ser negativo');
  }
  
  const expectedChange = Math.max(0, receivedAmount - expectedAmount);
  if (Math.abs(change - expectedChange) > 0.01) {
    errors.push('El cambio calculado no coincide');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    calculatedChange: expectedChange
  };
};

/**
 * Obtener métricas rápidas de un pedido
 */
export const getOrderMetrics = (order) => {
  const now = new Date();
  const created = new Date(order.createdAt);
  const estimated = new Date(order.estimatedReadyDate);
  
  return {
    daysInSystem: Math.floor((now - created) / (1000 * 60 * 60 * 24)),
    isOverdue: order.status !== 'completed' && order.status !== 'delivered' && now > estimated,
    daysUntilDelivery: Math.ceil((estimated - now) / (1000 * 60 * 60 * 24)),
    productionProgress: order.items?.[0]?.productionProgress || 0,
    needsAction: order.status === 'quoted' || 
                 (order.productionPhotos?.some(p => !p.clientApproved)) ||
                 (order.status === 'pending_approval'),
    canBeCancelled: canBeCancelled(order),
    paymentPending: order.payment.status === 'pending',
    isLargeOrder: order.total > 100 || order.items?.reduce((sum, item) => sum + item.quantity, 0) > 10
  };
};

/**
 * Generar resumen ejecutivo del pedido
 */
export const generateOrderSummary = (order) => {
  const metrics = getOrderMetrics(order);
  
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    statusDescription: getStatusDescription(order.status),
    customer: order.user?.name || 'Cliente',
    total: order.total,
    createdAt: order.createdAt,
    estimatedReadyDate: order.estimatedReadyDate,
    metrics,
    priority: metrics.isOverdue ? 'high' : 
              metrics.needsAction ? 'medium' : 'normal',
    nextAction: getNextActionDescription(order, metrics)
  };
};

/**
 * Obtener descripción de la próxima acción requerida
 */
export const getNextActionDescription = (order, metrics) => {
  if (order.status === 'pending_approval') {
    return 'Admin debe revisar y cotizar el pedido';
  }
  
  if (order.status === 'quoted') {
    return 'Cliente debe aceptar o rechazar la cotización';
  }
  
  if (order.status === 'approved') {
    return 'Iniciar proceso de producción';
  }
  
  if (order.status === 'in_production') {
    const nextStage = getNextProductionStage(order.items?.[0]?.productionStages);
    return nextStage ? `Completar etapa: ${getStageTitle(nextStage)}` : 'Finalizar producción';
  }
  
  if (order.status === 'ready_for_delivery') {
    return order.deliveryType === 'delivery' ? 'Coordinar entrega' : 'Coordinar punto de encuentro';
  }
  
  if (order.status === 'delivered') {
    return 'Confirmar satisfacción del cliente';
  }
  
  if (order.productionPhotos?.some(p => !p.clientApproved)) {
    return 'Cliente debe aprobar fotos de producción';
  }
  
  if (metrics.paymentPending) {
    return 'Pendiente de pago';
  }
  
  return 'Sin acciones pendientes';
};

/**
 * Validar permisos de acceso a un pedido
 */
export const validateOrderAccess = (order, userId, userRole) => {
  const isOwner = order.user.toString() === userId.toString();
  const isAdmin = ['admin', 'manager', 'employee'].includes(userRole);
  
  if (!isOwner && !isAdmin) {
    const error = new Error('No tienes permiso para acceder a este pedido');
    error.statusCode = 403;
    error.code = 'UNAUTHORIZED_ACCESS';
    throw error;
  }
  
  return {
    isOwner,
    isAdmin,
    canEdit: isAdmin || (isOwner && ['pending_approval', 'quoted'].includes(order.status)),
    canCancel: isAdmin || (isOwner && canBeCancelled(order)),
    canViewFullDetails: isAdmin || isOwner
  };
};

/**
 * Normalizar datos de entrada de pedido
 */
export const normalizeOrderInput = (inputData) => {
  const normalized = { ...inputData };
  
  // Normalizar cantidad
  if (normalized.quantity) {
    normalized.quantity = Math.max(1, Math.min(100, parseInt(normalized.quantity) || 1));
  }
  
  // Normalizar tipo de entrega
  if (normalized.deliveryType && !['delivery', 'meetup'].includes(normalized.deliveryType)) {
    normalized.deliveryType = 'meetup';
  }
  
  // Normalizar método de pago
  const validPaymentMethods = ['cash', 'card', 'transfer', 'wompi'];
  if (normalized.paymentMethod && !validPaymentMethods.includes(normalized.paymentMethod)) {
    normalized.paymentMethod = 'cash';
  }
  
  // Normalizar timing de pago
  const validTimings = ['on_delivery', 'advance'];
  if (normalized.paymentTiming && !validTimings.includes(normalized.paymentTiming)) {
    normalized.paymentTiming = 'on_delivery';
  }
  
  // Limpiar notas
  if (normalized.clientNotes) {
    normalized.clientNotes = normalized.clientNotes.trim().slice(0, 1000);
  }
  
  return normalized;
};

export default {
  isValidOrderNumber,
  generateOrderNumber,
  isValidStatusTransition,
  getNextValidStatuses,
  canBeCancelled,
  getStatusDescription,
  getStatusColor,
  validateDeliveryAddress,
  validateMeetupDetails,
  calculateProductionProgress,
  getCompletedStages,
  getNextProductionStage,
  formatOrderTimeline,
  getStageTitle,
  canPerformAction,
  getAvailableActions,
  formatOrderForResponse,
  validateCashPaymentData,
  getOrderMetrics,
  generateOrderSummary,
  getNextActionDescription,
  validateOrderAccess,
  normalizeOrderInput
};