import Order from "../models/order.js";
import Design from "../models/design.js";
import Address from "../models/address.js";
import User from "../models/users.js";
import Product from "../models/product.js";
import mongoose from "mongoose";
import { sendNotification } from "../services/notification.service.js";

const orderController = {};

/**
 * Crea un nuevo pedido a partir de un diseño aprobado
 */
orderController.createOrder = async (req, res) => {
  try {
    const { 
      designId, 
      quantity = 1, 
      deliveryType = 'meetup',
      addressId, 
      meetupDetails,
      clientNotes 
    } = req.body;
    const userId = req.user._id;
    
    // Validaciones básicas
    if (!designId || !mongoose.Types.ObjectId.isValid(designId)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de diseño inválido"
      });
    }
    
    // Buscar diseño y validar estado
    const design = await Design.findById(designId)
      .populate('product')
      .populate('user');
    
    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado" 
      });
    }
    
    // Verificar si el diseño pertenece al usuario
    if (!design.user._id.equals(userId)) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para crear un pedido con este diseño" 
      });
    }
    
    // Verificar si el diseño está cotizado o aprobado
    if (!['quoted', 'approved'].includes(design.status)) {
      return res.status(400).json({ 
        success: false,
        message: `No se puede crear pedido para un diseño en estado "${design.status}"` 
      });
    }
    
    // Verificar si ya existe un pedido para este diseño
    const existingOrder = await Order.findOne({ 'items.design': designId });
    if (existingOrder) {
      return res.status(400).json({ 
        success: false,
        message: "Ya existe un pedido para este diseño",
        data: {
          orderId: existingOrder._id,
          orderNumber: existingOrder.orderNumber,
          status: existingOrder.status
        }
      });
    }
    
    // Validar tipo de entrega y dirección
    if (deliveryType === 'delivery') {
      if (!addressId && !req.body.address) {
        return res.status(400).json({ 
          success: false,
          message: "Debe proporcionar una dirección para entrega" 
        });
      }
      
      // Si se proporciona un ID de dirección, verificar que exista
      if (addressId) {
        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
          return res.status(404).json({ 
            success: false,
            message: "Dirección no encontrada" 
          });
        }
      }
    } else if (deliveryType === 'meetup') {
      // Para punto de encuentro, validar detalles
      if (!meetupDetails) {
        return res.status(400).json({ 
          success: false,
          message: "Debe proporcionar detalles para el punto de encuentro" 
        });
      }
    } else {
      return res.status(400).json({ 
        success: false,
        message: "Tipo de entrega inválido (opciones: delivery, meetup)" 
      });
    }
    
    // Calcular precios
    const unitPrice = design.price || design.product.basePrice;
    const subtotal = unitPrice * quantity;
    const deliveryFee = deliveryType === 'delivery' ? 5 : 0; // Tarifa fija de envío
    const total = subtotal + deliveryFee;
    
    // Crear objeto de dirección
    let deliveryAddress = null;
    
    if (deliveryType === 'delivery') {
      if (addressId) {
        // Usar dirección guardada
        const address = await Address.findById(addressId);
        deliveryAddress = {
          label: address.label,
          recipient: address.recipient,
          phoneNumber: address.phoneNumber,
          department: address.department,
          municipality: address.municipality,
          address: address.address,
          additionalDetails: address.additionalDetails,
          location: address.location
        };
      } else if (req.body.address) {
        // Crear nueva dirección con los datos proporcionados
        deliveryAddress = {
          label: req.body.address.label || "Sin etiqueta",
          recipient: req.body.address.recipient,
          phoneNumber: req.body.address.phoneNumber,
          department: req.body.address.department,
          municipality: req.body.address.municipality,
          address: req.body.address.address,
          additionalDetails: req.body.address.additionalDetails || "",
          location: req.body.address.location || { type: "Point", coordinates: [0, 0] }
        };
        
        // Opcional: guardar la dirección para futuras compras
        if (req.body.saveAddress) {
          const newAddress = new Address({
            ...deliveryAddress,
            user: userId,
            isDefault: req.body.makeDefault || false
          });
          
          await newAddress.save();
        }
      }
    }
    
    // Crear objeto de punto de encuentro
    const formattedMeetupDetails = deliveryType === 'meetup' ? {
      date: meetupDetails.date ? new Date(meetupDetails.date) : null,
      location: meetupDetails.location || { type: "Point", coordinates: [0, 0] },
      address: meetupDetails.address || "",
      placeName: meetupDetails.placeName || "",
      notes: meetupDetails.notes || ""
    } : null;
    
    // Fecha estimada de entrega basada en días de producción
    const estimatedReadyDate = new Date();
    estimatedReadyDate.setDate(estimatedReadyDate.getDate() + (design.productionDays || 7));
    
    // Crear el pedido
    const newOrder = new Order({
      user: userId,
      items: [{
        product: design.product._id,
        design: design._id,
        options: design.productOptions,
        quantity,
        unitPrice,
        subtotal
      }],
      status: 'pending_approval',
      deliveryType,
      deliveryAddress,
      meetupDetails: formattedMeetupDetails,
      subtotal,
      deliveryFee,
      total,
      estimatedReadyDate,
      clientNotes: clientNotes || design.clientNotes || "",
      statusHistory: [{
        status: 'pending_approval',
        changedBy: userId,
        changedByModel: 'User',
        notes: 'Pedido creado por el cliente'
      }],
      payment: {
        method: 'cash', // Por defecto es efectivo
        status: 'pending',
        amount: total,
        currency: 'USD'
      }
    });
    
    await newOrder.save();
    
    // Actualizar estado del diseño si es necesario
    if (design.status === 'quoted') {
      design.status = 'approved';
      design.approvedAt = new Date();
      await design.save();
    }
    
    // Notificar al administrador
    try {
      await sendNotification({
        type: "NEW_ORDER",
        data: {
          orderId: newOrder._id,
          orderNumber: newOrder.orderNumber,
          userName: design.user.name,
          userEmail: design.user.email,
          productName: design.product.name,
          total: newOrder.total
        }
      });
    } catch (notificationError) {
      console.error('Error enviando notificación:', notificationError);
    }
    
    res.status(201).json({
      success: true,
      message: "Pedido creado exitosamente",
      data: {
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        total: newOrder.total,
        estimatedReadyDate: newOrder.estimatedReadyDate
      }
    });
    
  } catch (error) {
    console.error("Error en createOrder:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear el pedido",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene un pedido específico
 */
orderController.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.roles.some(role => ['admin', 'manager'].includes(role));
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de pedido inválido" 
      });
    }
    
    // Buscar pedido con sus relaciones
    const order = await Order.findById(id)
      .populate({
        path: 'items.product',
        select: 'name images'
      })
      .populate({
        path: 'items.design',
        select: 'name elements previewImage productOptions'
      })
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado" 
      });
    }
    
    // Verificar permisos (solo propietario o admin)
    if (!isAdmin && !order.user._id.equals(userId)) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para ver este pedido" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
    
  } catch (error) {
    console.error("Error en getOrderById:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el pedido",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Lista todos los pedidos con filtros
 */
orderController.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      user,
      sort = 'createdAt',
      order = 'desc',
      search
    } = req.query;
    
    const isAdmin = req.user.roles.some(role => ['admin', 'manager'].includes(role));
    
    // Si no es admin, solo mostrar pedidos propios
    const filter = isAdmin ? {} : { user: req.user._id };
    
    // Filtros adicionales
    if (status) {
      filter.status = status;
    }
    
    if (isAdmin && user && mongoose.Types.ObjectId.isValid(user)) {
      filter.user = user;
    }
    
    // Búsqueda por número de pedido
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { clientNotes: { $regex: search, $options: 'i' } },
        { adminNotes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Opciones de consulta
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'asc' ? 1 : -1 },
      populate: [
        { path: 'user', select: 'name email' },
        { path: 'items.product', select: 'name images' },
        { path: 'items.design', select: 'name previewImage' }
      ],
      lean: true
    };
    
    // Ejecutar consulta paginada
    const result = await Order.paginate(filter, options);
    
    // Transformar resultado
    const orders = result.docs.map(order => ({
      ...order,
      _links: {
        self: `/api/orders/${order._id}`
      }
    }));
    
    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: result.totalDocs,
          pages: result.totalPages,
          currentPage: result.page,
          limit: result.limit,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
          nextPage: result.nextPage,
          prevPage: result.prevPage
        }
      }
    });
    
  } catch (error) {
    console.error("Error en getAllOrders:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los pedidos",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualiza el estado de un pedido (admin)
 */
orderController.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      notes,
      estimatedReadyDate,
      adminNotes,
      meetupDetails
    } = req.body;
    
    const adminId = req.user._id;
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de pedido inválido" 
      });
    }
    
    // Validar estado
    const validStatuses = [
      'pending_approval', 
      'quoted', 
      'approved', 
      'rejected',
      'in_production', 
      'ready_for_delivery', 
      'delivered', 
      'completed', 
      'cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Estado de pedido inválido" 
      });
    }
    
    // Buscar pedido
    const order = await Order.findById(id)
      .populate('user', 'email name')
      .populate('items.design');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado" 
      });
    }
    
    // Validar transición de estado
    const validTransition = validateStatusTransition(order.status, status);
    if (!validTransition.isValid) {
      return res.status(400).json({ 
        success: false,
        message: validTransition.message 
      });
    }
    
    // Actualizar estado
    const previousStatus = order.status;
    order.status = status;
    
    // Registrar en historial
    order.statusHistory.push({
      status,
      changedBy: adminId,
      changedByModel: 'Employee',
      notes: notes || `Estado actualizado de ${previousStatus} a ${status}`,
      timestamp: new Date()
    });
    
    // Actualizaciones adicionales según el estado
    if (status === 'in_production') {
      // Actualizar estados de los ítems
      order.items.forEach(item => {
        item.status = 'in_production';
      });
    }
    
    if (status === 'ready_for_delivery') {
      // Marcar todos los items como listos
      order.items.forEach(item => {
        item.status = 'ready';
        item.readyAt = new Date();
      });
    }
    
    if (status === 'completed') {
      order.completedAt = new Date();
      order.canReview = true;
    }
    
    // Actualizar otros campos si se proporcionan
    if (estimatedReadyDate) {
      order.estimatedReadyDate = new Date(estimatedReadyDate);
    }
    
    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes;
    }
    
    // Actualizar detalles del punto de encuentro
    if (meetupDetails && order.deliveryType === 'meetup') {
      if (meetupDetails.date) {
        order.meetupDetails.date = new Date(meetupDetails.date);
      }
      
      if (meetupDetails.location) {
        order.meetupDetails.location = meetupDetails.location;
      }
      
      if (meetupDetails.address !== undefined) {
        order.meetupDetails.address = meetupDetails.address;
      }
      
      if (meetupDetails.placeName !== undefined) {
        order.meetupDetails.placeName = meetupDetails.placeName;
      }
      
      if (meetupDetails.notes !== undefined) {
        order.meetupDetails.notes = meetupDetails.notes;
      }
    }
    
    await order.save();
    
    // Notificar al cliente sobre cambio de estado
    try {
      await sendNotification({
        type: "ORDER_STATUS_UPDATED",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          oldStatus: previousStatus,
          newStatus: status,
          userName: order.user.name,
          userEmail: order.user.email,
          notes: notes || null
        }
      });
    } catch (notificationError) {
      console.error('Error enviando notificación:', notificationError);
    }
    
    res.status(200).json({
      success: true,
      message: `Estado del pedido actualizado a "${status}"`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        previousStatus
      }
    });
    
  } catch (error) {
    console.error("Error en updateOrderStatus:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar el estado del pedido",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Confirma el pago de un pedido
 */
orderController.confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      method = 'cash',
      amount,
      transactionId,
      notes 
    } = req.body;
    
    const userId = req.user._id;
    const isAdmin = req.user.roles.some(role => ['admin', 'manager'].includes(role));
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de pedido inválido" 
      });
    }
    
    // Validar método de pago
    const validMethods = ['cash', 'card', 'transfer', 'wompi', 'paypal', 'other'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ 
        success: false,
        message: "Método de pago inválido" 
      });
    }
    
    // Buscar pedido
    const order = await Order.findById(id)
      .populate('user', 'email name');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado" 
      });
    }
    
    // Verificar permisos (solo admin puede confirmar pagos)
    if (!isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: "Solo el administrador puede confirmar pagos" 
      });
    }
    
    // Verificar que el pedido no esté ya pagado
    if (order.payment.status === 'paid') {
      return res.status(400).json({ 
        success: false,
        message: "Este pedido ya ha sido pagado" 
      });
    }
    
    // Actualizar datos de pago
    order.payment = {
      method,
      status: 'paid',
      amount: amount || order.total,
      currency: 'USD',
      transactionId: transactionId || null,
      paidAt: new Date(),
      metadata: {
        confirmedBy: userId,
        notes: notes || 'Pago confirmado por administrador'
      }
    };
    
    await order.save();
    
    // Notificar al cliente
    try {
      await sendNotification({
        type: "PAYMENT_CONFIRMED",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          userName: order.user.name,
          userEmail: order.user.email,
          amount: order.payment.amount,
          method: order.payment.method
        }
      });
    } catch (notificationError) {
      console.error('Error enviando notificación:', notificationError);
    }
    
    res.status(200).json({
      success: true,
      message: "Pago confirmado exitosamente",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        payment: order.payment
      }
    });
    
  } catch (error) {
    console.error("Error en confirmPayment:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al confirmar el pago",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función auxiliar para validar transiciones de estado
function validateStatusTransition(currentStatus, newStatus) {
  // Definir transiciones válidas
  const validTransitions = {
    'pending_approval': ['quoted', 'rejected', 'cancelled'],
    'quoted': ['approved', 'rejected', 'cancelled'],
    'approved': ['in_production', 'cancelled'],
    'in_production': ['ready_for_delivery', 'cancelled'],
    'ready_for_delivery': ['delivered', 'cancelled'],
    'delivered': ['completed', 'cancelled'],
    'rejected': ['pending_approval'], // Se puede reactivar un pedido rechazado
    'cancelled': ['pending_approval'], // Se puede reactivar un pedido cancelado
    'completed': [] // Estado final, no hay transición posible
  };
  
  // Verificar si la transición es válida
  if (currentStatus === newStatus) {
    return { isValid: true }; // No hay cambio de estado
  }
  
  if (validTransitions[currentStatus]?.includes(newStatus)) {
    return { isValid: true };
  }
  
  return { 
    isValid: false, 
    message: `No se puede cambiar el estado de "${currentStatus}" a "${newStatus}"` 
  };
}

export default orderController;