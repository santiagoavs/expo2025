// controllers/order.controller.js - Controlador optimizado para órdenes
import Order from "../models/order.js";
import Design from "../models/design.js";
import Address from "../models/address.js";
import User from "../models/users.js";
import Product from "../models/product.js";
import mongoose from "mongoose";
import { sendNotification } from "../services/notification.service.js";
import { 
  processWompiPayment, 
  validateWompiWebhook, 
  isWompiConfigured,
  simulatePaymentConfirmation,
  checkTransactionStatus 
} from "../services/wompi.service.js";
import { calculateDeliveryFee, validateDepartmentAndMunicipality } from "../utils/locationUtils.js";

const orderController = {};

/**
 * Obtiene todos los pedidos con filtros (admin y cliente)
 */
orderController.getAllOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.roles?.some(role => ['admin', 'manager'].includes(role));
    const { 
      page = 1, 
      limit = 10, 
      status, 
      user, 
      search,
      startDate,
      endDate 
    } = req.query;

    // Construir filtro base
    let filter = {};
    
    // Si no es admin, solo mostrar sus propios pedidos
    if (!isAdmin) {
      filter.user = userId;
    } else if (user && mongoose.Types.ObjectId.isValid(user)) {
      filter.user = user;
    }

    // Filtros adicionales
    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { clientNotes: { $regex: search, $options: 'i' } },
        { adminNotes: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'user', select: 'name email phone' },
        { path: 'items.product', select: 'name images' },
        { path: 'items.design', select: 'name previewImage' }
      ]
    };

    const result = await Order.paginate(filter, options);

    res.status(200).json({
      success: true,
      data: {
        orders: result.docs,
        pagination: {
          total: result.totalDocs,
          pages: result.totalPages,
          currentPage: result.page,
          limit: result.limit,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error("❌ Error en getAllOrders:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener pedidos",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Crea un nuevo pedido a partir de un diseño aprobado
 */
orderController.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    console.log('📦 Iniciando creación de orden:', {
      userId: req.user._id,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    const { 
      designId, 
      quantity = 1, 
      deliveryType = 'meetup',
      addressId, 
      meetupDetails,
      clientNotes,
      paymentMethod = 'cash',
      paymentTiming = 'on_delivery'
    } = req.body;
    
    const userId = req.user._id;
    
    // Validaciones básicas mejoradas
    if (!designId || !mongoose.Types.ObjectId.isValid(designId)) {
      console.log('❌ ID de diseño inválido:', designId);
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: "ID de diseño inválido",
        error: 'INVALID_DESIGN_ID'
      });
    }
    
    // Validar cantidad
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      console.log('❌ Cantidad inválida:', quantity);
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: "La cantidad debe ser un número entero entre 1 y 100",
        error: 'INVALID_QUANTITY'
      });
    }
    
    // Buscar diseño con populate completo
    const design = await Design.findById(designId)
      .populate({
        path: 'product',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .populate('user')
      .session(session);
    
    if (!design) {
      console.log('❌ Diseño no encontrado:', designId);
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }
    
    console.log('✅ Diseño encontrado:', {
      id: design._id,
      status: design.status,
      userId: design.user._id,
      productName: design.product.name
    });
    
    // Verificar propiedad del diseño
    if (!design.user._id.equals(userId)) {
      console.log('❌ Usuario no autorizado:', {
        designUser: design.user._id,
        requestUser: userId
      });
      await session.abortTransaction();
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para crear un pedido con este diseño",
        error: 'UNAUTHORIZED_DESIGN_ACCESS'
      });
    }
    
    // Verificar estado del diseño - debe estar cotizado o aprobado
    if (!['quoted', 'approved'].includes(design.status)) {
      console.log('❌ Estado de diseño inválido:', design.status);
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: `No se puede crear pedido para un diseño en estado "${design.status}". El diseño debe estar cotizado o aprobado.`,
        error: 'INVALID_DESIGN_STATUS',
        data: {
          currentStatus: design.status,
          requiredStatus: ['quoted', 'approved']
        }
      });
    }
    
    // Verificar que el diseño tenga precio
    if (!design.price || design.price <= 0) {
      console.log('❌ Diseño sin precio válido:', design.price);
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: "El diseño no tiene un precio válido. Debe ser cotizado primero.",
        error: 'DESIGN_NOT_PRICED'
      });
    }
    
    // Verificar si ya existe un pedido activo para este diseño
    const existingOrder = await Order.findOne({ 
      'items.design': designId,
      status: { $nin: ['cancelled', 'rejected'] }
    }).session(session);
    
    if (existingOrder) {
      console.log('⚠️ Ya existe un pedido para este diseño:', existingOrder.orderNumber);
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: "Ya existe un pedido activo para este diseño",
        error: 'DUPLICATE_ORDER',
        data: {
          orderId: existingOrder._id,
          orderNumber: existingOrder.orderNumber,
          status: existingOrder.status
        }
      });
    }
    
    // Verificar producto activo
    if (!design.product.isActive) {
      console.log('❌ Producto inactivo:', design.product.name);
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: "El producto no está disponible actualmente",
        error: 'PRODUCT_UNAVAILABLE'
      });
    }
    
    // Validar y procesar dirección de entrega
    let deliveryAddress = null;
    let deliveryFee = 0;
    
    if (deliveryType === 'delivery') {
      console.log('🚚 Procesando entrega a domicilio');
      
      if (!addressId && !req.body.address) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false,
          message: "Debe proporcionar una dirección para entrega a domicilio",
          error: 'ADDRESS_REQUIRED'
        });
      }
      
      if (addressId) {
        // Usar dirección existente
        if (!mongoose.Types.ObjectId.isValid(addressId)) {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false,
            message: "ID de dirección inválido",
            error: 'INVALID_ADDRESS_ID'
          });
        }
        
        const address = await Address.findOne({ 
          _id: addressId, 
          user: userId,
          isActive: true 
        }).session(session);
        
        if (!address) {
          console.log('❌ Dirección no encontrada:', addressId);
          await session.abortTransaction();
          return res.status(404).json({ 
            success: false,
            message: "Dirección no encontrada o no pertenece al usuario",
            error: 'ADDRESS_NOT_FOUND'
          });
        }
        
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
        
        deliveryFee = calculateDeliveryFee(address.department);
        console.log('✅ Dirección existente seleccionada:', address.label);
        
      } else if (req.body.address) {
        // Crear nueva dirección con validación completa
        const newAddr = req.body.address;
        
        // Validar campos requeridos
        const requiredFields = ['recipient', 'phoneNumber', 'department', 'municipality', 'address'];
        const missingFields = requiredFields.filter(field => !newAddr[field]);
        
        if (missingFields.length > 0) {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false,
            message: `Faltan campos obligatorios en la dirección: ${missingFields.join(', ')}`,
            error: 'INCOMPLETE_ADDRESS',
            data: { missingFields }
          });
        }
        
        // Validar departamento y municipio
        const locationValidation = validateDepartmentAndMunicipality(newAddr.department, newAddr.municipality);
        if (!locationValidation.isValid) {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false,
            message: locationValidation.message,
            error: locationValidation.error
          });
        }
        
        // Validar formato de teléfono
        const phoneRegex = /^[267]\d{7}$/;
        const cleanPhone = newAddr.phoneNumber.replace(/[\s-]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false,
            message: "Formato de teléfono inválido. Debe ser un número de El Salvador válido.",
            error: 'INVALID_PHONE_FORMAT'
          });
        }
        
        deliveryAddress = {
          label: newAddr.label || "Dirección de entrega",
          recipient: newAddr.recipient.trim(),
          phoneNumber: cleanPhone,
          department: newAddr.department.trim(),
          municipality: newAddr.municipality.trim(),
          address: newAddr.address.trim(),
          additionalDetails: newAddr.additionalDetails?.trim() || "",
          location: newAddr.location || { type: "Point", coordinates: [-89.2182, 13.6929] }
        };
        
        deliveryFee = calculateDeliveryFee(newAddr.department);
        
        // Guardar dirección si el usuario lo solicita
        if (req.body.saveAddress) {
          console.log('💾 Guardando nueva dirección');
          
          const newAddress = new Address({
            ...deliveryAddress,
            user: userId,
            isDefault: req.body.makeDefault || false
          });
          
          await newAddress.save({ session });
          console.log('✅ Nueva dirección guardada:', newAddress._id);
        }
      }
      
    } else if (deliveryType === 'meetup') {
      console.log('📍 Procesando punto de encuentro');
      
      if (!meetupDetails) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false,
          message: "Debe proporcionar detalles para el punto de encuentro",
          error: 'MEETUP_DETAILS_REQUIRED'
        });
      }
      
      // Validar fecha del punto de encuentro
      if (meetupDetails.date) {
        const meetupDate = new Date(meetupDetails.date);
        const now = new Date();
        const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Mínimo 24 horas
        
        if (meetupDate < minDate) {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false,
            message: "La fecha del punto de encuentro debe ser al menos 24 horas en el futuro",
            error: 'INVALID_MEETUP_DATE'
          });
        }
      }
      
    } else {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: "Tipo de entrega inválido. Opciones válidas: 'delivery' o 'meetup'",
        error: 'INVALID_DELIVERY_TYPE',
        data: {
          provided: deliveryType,
          valid: ['delivery', 'meetup']
        }
      });
    }
    
    // Calcular precios con validación
    const unitPrice = design.price;
    
    // Agregar costos adicionales de las opciones del producto
    let optionsCost = 0;
    if (design.productOptions && design.productOptions.length > 0) {
      for (const option of design.productOptions) {
        const productOption = design.product.options?.find(o => o.name === option.name);
        if (productOption) {
          const selectedValue = productOption.values?.find(v => v.value === option.value);
          if (selectedValue && selectedValue.additionalPrice) {
            optionsCost += selectedValue.additionalPrice;
          }
        }
      }
    }
    
    const adjustedUnitPrice = unitPrice + optionsCost;
    const subtotal = adjustedUnitPrice * quantity;
    
    // Calcular impuestos (IVA 13% en El Salvador)
    const taxRate = 0.13;
    const tax = Math.round((subtotal + deliveryFee) * taxRate * 100) / 100;
    
    const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;
    
    // Determinar si es pedido grande (para configuraciones especiales)
    const isLargeOrder = total > 100 || quantity > 10;
    
    console.log('💰 Cálculo de precios:', {
      unitPrice,
      optionsCost,
      adjustedUnitPrice,
      quantity,
      subtotal,
      deliveryFee,
      tax,
      total,
      isLargeOrder
    });
    
    // Validar método de pago
    const validPaymentMethods = ['cash', 'card', 'transfer', 'wompi'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: "Método de pago inválido",
        error: 'INVALID_PAYMENT_METHOD',
        data: {
          provided: paymentMethod,
          valid: validPaymentMethods
        }
      });
    }
    
    // Configurar pago según método y timing
    let paymentConfig = {
      method: paymentMethod,
      status: 'pending',
      amount: total,
      currency: 'USD',
      timing: paymentTiming,
      isFictitious: false
    };
    
    // Crear objeto de punto de encuentro si corresponde
    const formattedMeetupDetails = deliveryType === 'meetup' ? {
      date: meetupDetails.date ? new Date(meetupDetails.date) : null,
      location: {
        type: "Point",
        coordinates: meetupDetails.location?.coordinates || [-89.2182, 13.6929],
        address: meetupDetails.address || "",
        placeName: meetupDetails.placeName || ""
      },
      notes: meetupDetails.notes || ""
    } : null;
    
    // Calcular fecha estimada de entrega
    const estimatedReadyDate = new Date();
    estimatedReadyDate.setDate(estimatedReadyDate.getDate() + (design.productionDays || 7));
    
    // Si es punto de encuentro y tiene fecha, usar esa como referencia
    if (deliveryType === 'meetup' && formattedMeetupDetails?.date) {
      const meetupDate = new Date(formattedMeetupDetails.date);
      if (meetupDate > estimatedReadyDate) {
        estimatedReadyDate.setTime(meetupDate.getTime());
      }
    }
    
    // Crear el pedido con estados de producción detallados
    const newOrder = new Order({
      user: userId,
      items: [{
        product: design.product._id,
        design: design._id,
        options: design.productOptions || [],
        quantity,
        unitPrice: adjustedUnitPrice,
        subtotal,
        status: 'pending',
        productionStatus: 'not_started',
        productionStages: {
          sourcing_product: { completed: false },
          preparing_materials: { completed: false },
          printing: { completed: false },
          sublimating: { completed: false },
          quality_check: { completed: false },
          packaging: { completed: false }
        }
      }],
      status: 'pending_approval',
      deliveryType,
      deliveryAddress,
      meetupDetails: formattedMeetupDetails,
      subtotal,
      discounts: 0,
      deliveryFee,
      tax,
      total,
      estimatedReadyDate,
      clientNotes: clientNotes || design.clientNotes || "",
      adminNotes: "",
      statusHistory: [{
        status: 'pending_approval',
        changedBy: userId,
        changedByModel: 'User',
        notes: 'Pedido creado por el cliente',
        timestamp: new Date()
      }],
      payment: paymentConfig,
      metadata: {
        source: 'web',
        priority: isLargeOrder ? 'high' : 'normal',
        tags: isLargeOrder ? ['pedido-grande'] : [],
        isLargeOrder,
        wompiConfigured: isWompiConfigured()
      }
    });
    
    await newOrder.save({ session });
    
    console.log('✅ Orden creada:', {
      id: newOrder._id,
      orderNumber: newOrder.orderNumber,
      total: newOrder.total,
      paymentMethod: newOrder.payment.method,
      paymentTiming: newOrder.payment.timing
    });
    
    // Actualizar estado del diseño
    if (design.status === 'quoted') {
      design.status = 'approved';
      design.approvedAt = new Date();
      
      await design.save({ session });
      console.log('✅ Diseño actualizado a estado aprobado');
    }
    
    // Actualizar estadísticas del producto
    await Product.findByIdAndUpdate(
      design.product._id,
      { 
        $inc: { 
          'metadata.stats.orders': 1,
          'metadata.stats.designs': design.status === 'quoted' ? 1 : 0
        }
      },
      { session }
    );
    
    await session.commitTransaction();
    
    // Procesar pago virtual si se requiere y está configurado
    let paymentData = null;
    if (paymentMethod === 'wompi' && paymentTiming === 'advance') {
      try {
        console.log('💳 Procesando pago virtual...');
        
        paymentData = await processWompiPayment({
          orderId: newOrder._id,
          amount: total,
          currency: 'USD',
          customerEmail: design.user.email,
          customerName: design.user.name,
          description: `Pedido #${newOrder.orderNumber} - ${design.product.name}`,
          isPartialPayment: false
        });
        
        // Actualizar orden con datos de pago
        if (paymentData.success) {
          newOrder.payment.wompiData = {
            paymentLinkId: paymentData.paymentLinkId,
            paymentUrl: paymentData.paymentUrl,
            reference: paymentData.reference,
            expiresAt: paymentData.expiresAt,
            isFake: paymentData.isFake || false
          };
          await newOrder.save();
          
          console.log('✅ Datos de pago agregados a la orden');
        }
        
      } catch (paymentError) {
        console.error('⚠️ Error generando link de pago (no crítico):', paymentError);
        // No fallar la orden por error de pago, el admin puede gestionar manualmente
      }
    }
    
    // Notificar al administrador (fuera de la transacción)
    try {
      await sendNotification({
        type: "NEW_ORDER",
        data: {
          orderId: newOrder._id,
          orderNumber: newOrder.orderNumber,
          userName: design.user.name,
          userEmail: design.user.email,
          productName: design.product.name,
          total: newOrder.total,
          paymentMethod: newOrder.payment.method,
          requiresPayment: paymentTiming === 'advance',
          isLargeOrder
        }
      });
      console.log('📧 Notificación enviada al administrador');
    } catch (notificationError) {
      console.error('❌ Error enviando notificación:', notificationError);
      // No fallar la operación por error de notificación
    }
    
    // Respuesta exitosa con datos completos
    res.status(201).json({
      success: true,
      message: "Pedido creado exitosamente",
      data: {
        order: {
          _id: newOrder._id,
          orderNumber: newOrder.orderNumber,
          status: newOrder.status,
          items: newOrder.items,
          deliveryType: newOrder.deliveryType,
          subtotal: newOrder.subtotal,
          deliveryFee: newOrder.deliveryFee,
          tax: newOrder.tax,
          total: newOrder.total,
          estimatedReadyDate: newOrder.estimatedReadyDate,
          payment: {
            method: newOrder.payment.method,
            status: newOrder.payment.status,
            timing: newOrder.payment.timing,
            wompiPaymentUrl: paymentData?.paymentUrl || null,
            isFictitious: paymentData?.isFake || false
          }
        },
        design: {
          _id: design._id,
          status: design.status,
          name: design.name
        },
        product: {
          _id: design.product._id,
          name: design.product.name,
          category: design.product.category?.name
        },
        _links: {
          order: `/api/orders/${newOrder._id}`,
          design: `/api/designs/${design._id}`,
          tracking: `/api/orders/${newOrder._id}/tracking`,
          payment: paymentData?.paymentUrl || null
        }
      }
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Error en createOrder:", error);
    
    // Manejar errores específicos de MongoDB
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false,
        message: "Error de validación",
        error: 'VALIDATION_ERROR',
        details: errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Ya existe un pedido con estos datos",
        error: 'DUPLICATE_ORDER'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error al crear el pedido",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  } finally {
    session.endSession();
  }
};

/**
 * Obtiene un pedido específico con detalles completos
 */
orderController.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.roles?.some(role => ['admin', 'manager'].includes(role));

    const order = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .populate('items.design', 'name previewImage');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Verificar permisos
    if (!isAdmin && !order.user._id.equals(userId)) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para ver este pedido",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error("❌ Error en getOrderById:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el pedido",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Simula confirmación de pago para testing
 */
orderController.simulatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'approved' } = req.body; // approved, declined, error

    // Solo permitir en desarrollo o cuando Wompi no esté configurado
    if (process.env.NODE_ENV === 'production' && isWompiConfigured()) {
      return res.status(403).json({
        success: false,
        message: "Simulación de pago no disponible en producción con Wompi configurado",
        error: 'SIMULATION_NOT_ALLOWED'
      });
    }

    const order = await Order.findById(id)
      .populate('user', 'email name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    if (order.payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: "Este pedido ya está pagado",
        error: 'ALREADY_PAID'
      });
    }

    // Simular resultado del pago
    const simulationResult = await simulatePaymentConfirmation(
      order._id, 
      order.payment.wompiData?.reference || `SIM-${order._id}`
    );

    // Actualizar orden según resultado
    if (simulationResult.status === 'APPROVED') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      order.payment.simulatedResponse = simulationResult;
      
      // Cambiar estado del pedido
      order.status = 'approved';
      order.statusHistory.push({
        status: 'approved',
        changedBy: req.user._id,
        changedByModel: 'User',
        notes: 'Pago simulado confirmado',
        timestamp: new Date()
      });

      await order.save();

      // Notificar éxito
      await sendNotification({
        type: "PAYMENT_SUCCESSFUL",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.total,
          paymentMethod: 'simulated',
          userName: order.user.name,
          userEmail: order.user.email
        }
      });

      res.status(200).json({
        success: true,
        message: "Pago simulado confirmado exitosamente",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.payment.status,
          orderStatus: order.status,
          simulationResult
        }
      });

    } else {
      // Pago fallido
      order.payment.status = 'failed';
      order.payment.simulatedResponse = simulationResult;
      order.payment.failedAttempts.push({
        attemptedAt: new Date(),
        reason: simulationResult.statusMessage,
        errorCode: simulationResult.errorCode
      });

      await order.save();

      res.status(200).json({
        success: false,
        message: "Pago simulado falló",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.payment.status,
          reason: simulationResult.statusMessage,
          simulationResult
        }
      });
    }

  } catch (error) {
    console.error("❌ Error en simulatePayment:", error);
    res.status(500).json({
      success: false,
      message: "Error al simular pago",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Procesa webhook de Wompi
 */
orderController.wompiWebhook = async (req, res) => {
  try {
    console.log('📥 Webhook recibido:', {
      headers: req.headers,
      bodyType: typeof req.body,
      hasBody: !!req.body
    });

    // Validar webhook
    const isValid = await validateWompiWebhook(req);
    if (!isValid) {
      console.error('❌ Webhook inválido');
      return res.status(400).json({ 
        success: false, 
        message: 'Webhook inválido' 
      });
    }

    const event = req.body;
    console.log('📨 Evento de webhook válido:', event.event, event.data?.id);

    // Procesar según tipo de evento
    switch (event.event) {
      case 'transaction.updated':
        await handleTransactionUpdate(event.data);
        break;
      case 'payment_link.paid':
        await handlePaymentLinkPaid(event.data);
        break;
      default:
        console.log('ℹ️ Evento no manejado:', event.event);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error procesando webhook' 
    });
  }
};

async function handleTransactionUpdate(transactionData) {
  try {
    const { id: transactionId, reference, status } = transactionData;
    
    console.log('🔄 Actualizando transacción:', { transactionId, reference, status });

    // Buscar orden por referencia
    const order = await Order.findOne({ 
      'payment.wompiData.reference': reference 
    }).populate('user', 'email name');

    if (!order) {
      console.error('❌ Orden no encontrada para referencia:', reference);
      return;
    }

    // Actualizar según estado
    if (status === 'APPROVED') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      order.payment.wompiData.transactionId = transactionId;
      order.payment.wompiData.status = status;

      // Cambiar estado del pedido
      order.status = 'approved';
      order.statusHistory.push({
        status: 'approved',
        changedByModel: 'System',
        notes: 'Pago confirmado vía Wompi',
        timestamp: new Date()
      });

      await order.save();

      // Notificar éxito
      await sendNotification({
        type: "PAYMENT_SUCCESSFUL",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.total,
          paymentMethod: 'wompi',
          userName: order.user.name,
          userEmail: order.user.email
        }
      });

    } else if (status === 'DECLINED' || status === 'ERROR') {
      order.payment.status = 'failed';
      order.payment.wompiData.status = status;
      order.payment.failedAttempts.push({
        attemptedAt: new Date(),
        reason: 'Pago rechazado por Wompi',
        transactionId
      });

      await order.save();

      // Notificar fallo
      await sendNotification({
        type: "PAYMENT_FAILED",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          reason: 'Pago rechazado',
          userName: order.user.name,
          userEmail: order.user.email
        }
      });
    }

  } catch (error) {
    console.error('❌ Error manejando actualización de transacción:', error);
  }
}

async function handlePaymentLinkPaid(paymentLinkData) {
  // Similar al handleTransactionUpdate pero para payment links
  console.log('💳 Payment link pagado:', paymentLinkData);
}

/**
 * Confirma pago manual (admin)
 */
orderController.confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, receiptNumber, notes } = req.body;
    const adminId = req.user._id;

    const order = await Order.findById(id).populate('user', 'email name');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    if (order.payment.status === 'paid') {
      return res.status(400).json({ 
        success: false,
        message: "Este pedido ya está pagado",
        error: 'ALREADY_PAID'
      });
    }

    // Actualizar pago
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.payment.amount = amount || order.total;
    
    if (order.payment.method === 'cash') {
      order.payment.cashPaymentDetails = {
        collectedBy: adminId,
        collectedAt: new Date(),
        receiptNumber: receiptNumber || `CASH-${Date.now()}`,
        notes: notes || '',
        location: { type: 'Point', coordinates: [0, 0] }
      };
    }

    // Cambiar estado del pedido
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
    await sendNotification({
      type: "PAYMENT_CONFIRMED",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.payment.amount,
        paymentMethod: order.payment.method,
        userName: order.user.name,
        userEmail: order.user.email
      }
    });

    res.status(200).json({
      success: true,
      message: "Pago confirmado exitosamente",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.payment.amount,
        paymentStatus: order.payment.status,
        orderStatus: order.status
      }
    });

  } catch (error) {
    console.error("❌ Error en confirmPayment:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al confirmar pago",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Actualiza el estado de producción de un pedido
 */
orderController.updateProductionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      productionStage,
      notes,
      photoUrl,
      estimatedCompletion
    } = req.body;
    
    const adminId = req.user._id;
    
    console.log('🏭 Actualizando estado de producción:', {
      orderId: id,
      stage: productionStage,
      adminId
    });
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de pedido inválido",
        error: 'INVALID_ORDER_ID'
      });
    }
    
    // Validar etapa de producción
    const validStages = [
      'sourcing_product',
      'preparing_materials', 
      'printing',
      'sublimating',
      'quality_check',
      'packaging'
    ];
    
    if (!validStages.includes(productionStage)) {
      return res.status(400).json({ 
        success: false,
        message: "Etapa de producción inválida",
        error: 'INVALID_PRODUCTION_STAGE',
        data: { validStages }
      });
    }
    
    // Buscar pedido
    const order = await Order.findById(id)
      .populate('user', 'email name')
      .populate('items.product', 'name')
      .populate('items.design', 'name');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }
    
    // Verificar que el pedido esté en producción
    if (!['approved', 'in_production'].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        message: "El pedido debe estar aprobado o en producción",
        error: 'INVALID_ORDER_STATUS'
      });
    }
    
    // Actualizar estado de producción
    if (order.status === 'approved') {
      order.status = 'in_production';
      order.statusHistory.push({
        status: 'in_production',
        changedBy: adminId,
        changedByModel: 'Employee',
        notes: 'Iniciando producción',
        timestamp: new Date()
      });
    }
    
    // Actualizar etapa específica
    order.items.forEach(item => {
      item.productionStages[productionStage] = {
        completed: true,
        completedAt: new Date(),
        completedBy: adminId,
        notes: notes || '',
        photoUrl: photoUrl || null
      };
      
      // Actualizar estado general del item
      const stages = Object.keys(item.productionStages);
      const completedStages = stages.filter(stage => 
        item.productionStages[stage].completed
      );
      
      if (completedStages.length === stages.length) {
        item.status = 'ready';
        item.readyAt = new Date();
      } else {
        item.status = 'in_production';
      }
      
      // Calcular progreso
      item.productionProgress = Math.round((completedStages.length / stages.length) * 100);
    });
    
    // Si todos los items están listos, actualizar estado del pedido
    const allItemsReady = order.items.every(item => item.status === 'ready');
    if (allItemsReady) {
      order.status = 'ready_for_delivery';
      order.actualReadyDate = new Date();
      order.statusHistory.push({
        status: 'ready_for_delivery',
        changedBy: adminId,
        changedByModel: 'Employee',
        notes: 'Todos los productos están listos',
        timestamp: new Date()
      });
    }
    
    // Actualizar fecha estimada si se proporciona
    if (estimatedCompletion) {
      order.estimatedReadyDate = new Date(estimatedCompletion);
    }
    
    await order.save();
    
    // Notificar al cliente sobre el progreso
    try {
      await sendNotification({
        type: "PRODUCTION_UPDATE",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          stage: productionStage,
          stageLabel: getStageLabel(productionStage),
          progress: order.items[0].productionProgress,
          userName: order.user.name,
          userEmail: order.user.email,
          photoUrl: photoUrl || null,
          notes: notes || null
        }
      });
      console.log('📧 Notificación de progreso enviada al cliente');
    } catch (notificationError) {
      console.error('Error enviando notificación:', notificationError);
    }
    
    res.status(200).json({
      success: true,
      message: `Etapa de producción "${getStageLabel(productionStage)}" completada`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        productionProgress: order.items[0].productionProgress,
        completedStages: Object.keys(order.items[0].productionStages)
          .filter(stage => order.items[0].productionStages[stage].completed)  
      }
    });
  } catch (error) {
    console.error("❌ Error en updateProductionStatus:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el estado de producción",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

// Helper para obtener etiqueta de etapa
function getStageLabel(stage) {
  const labels = {
    sourcing_product: "Adquisición de producto",
    preparing_materials: "Preparación de materiales",
    printing: "Impresión",
    sublimating: "Sublimación",
    quality_check: "Control de calidad",
    packaging: "Empaquetado"
  };
  return labels[stage] || stage;
}

/**
 * Cancela un pedido (solo en estados iniciales)
 */
orderController.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.roles?.some(role => ['admin', 'manager'].includes(role));
    
    console.log('🚫 Cancelando pedido:', {
      orderId: id,
      userId,
      isAdmin,
      reason
    });
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de pedido inválido",
        error: 'INVALID_ORDER_ID'
      });
    }
    
    // Buscar pedido
    const order = await Order.findById(id)
      .populate('user', 'email name');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }
    
    // Verificar permisos
    if (!isAdmin && !order.user._id.equals(userId)) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para cancelar este pedido",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }
    
    // Verificar si se puede cancelar
    const cancellableStatuses = ['pending_approval', 'quoted', 'approved'];
    if (!cancellableStatuses.includes(order.status) || order.payment.status === 'paid') {
      return res.status(400).json({ 
        success: false,
        message: "Este pedido no puede ser cancelado en su estado actual",
        error: 'CANNOT_CANCEL',
        data: {
          currentStatus: order.status,
          paymentStatus: order.payment.status
        }
      });
    }
    
    // Actualizar estado
    const previousStatus = order.status;
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelado por el usuario';
    
    order.statusHistory.push({
      status: 'cancelled',
      previousStatus,
      changedBy: userId,
      changedByModel: isAdmin ? 'Employee' : 'User',
      notes: reason || 'Pedido cancelado',
      timestamp: new Date()
    });
    
    await order.save();
    
    // Notificar
    const notificationTarget = isAdmin ? order.user : { email: 'admin@diambars.com' };
    await sendNotification({
      type: "ORDER_CANCELLED",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        reason: reason || 'No especificado',
        cancelledBy: isAdmin ? 'Administrador' : 'Cliente',
        userEmail: notificationTarget.email,
        userName: notificationTarget.name
      }
    });
    
    res.status(200).json({
      success: true,
      message: "Pedido cancelado exitosamente",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        cancelledAt: order.cancelledAt
      }
    });
    
  } catch (error) {
    console.error("❌ Error en cancelOrder:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al cancelar el pedido",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtiene tracking detallado de un pedido
 */
orderController.getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .populate('items.design', 'name previewImage');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Verificar permisos
    if (!order.user._id.equals(userId) && !req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para ver este tracking",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    // Construir tracking info
    const tracking = {
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedReadyDate: order.estimatedReadyDate,
      actualReadyDate: order.actualReadyDate,
      deliveredAt: order.deliveredAt,
      statusHistory: order.statusHistory,
      productionProgress: order.items.map(item => ({
        productName: item.product.name,
        progress: item.productionProgress || 0,
        currentStage: item.productionStatus,
        stages: item.productionStages
      })),
      deliveryInfo: order.deliveryType === 'delivery' ? order.deliveryAddress : order.meetupDetails,
      deliveryType: order.deliveryType,
      payment: {
        method: order.payment.method,
        status: order.payment.status,
        isFictitious: order.payment.isFictitious || false
      }
    };

    res.status(200).json({
      success: true,
      data: { tracking }
    });

  } catch (error) {
    console.error("❌ Error en getOrderTracking:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener tracking",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtiene estadísticas de pedidos
 */
orderController.getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    
    const filter = Object.keys(dateFilter).length > 0 
      ? { createdAt: dateFilter }
      : {};
    
    // Estadísticas generales
    const [
      totalOrders,
      ordersByStatus,
      ordersByPaymentMethod,
      revenue,
      averageOrderValue
    ] = await Promise.all([
      Order.countDocuments(filter),
      
      Order.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      Order.aggregate([
        { $match: filter },
        { $group: { _id: '$payment.method', count: { $sum: 1 } } }
      ]),
      
      Order.aggregate([
        { $match: { ...filter, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      
      Order.aggregate([
        { $match: filter },
        { $group: { _id: null, avg: { $avg: '$total' } } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue: revenue[0]?.total || 0,
          averageOrderValue: averageOrderValue[0]?.avg || 0
        },
        byStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPaymentMethod: ordersByPaymentMethod.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        period: {
          startDate: startDate || 'all-time',
          endDate: endDate || 'current'
        },
        wompiStatus: {
          configured: isWompiConfigured(),
          mode: isWompiConfigured() ? 'real' : 'fictitious'
        }
      }
    });
    
  } catch (error) {
    console.error("❌ Error en getOrderStats:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener estadísticas",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Actualiza el estado general del pedido (admin)
 */
orderController.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user._id;

    const order = await Order.findById(id)
      .populate('user', 'email name');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Validar transición de estado
    const validStatuses = [
      'pending_approval', 'quoted', 'approved', 'rejected',
      'in_production', 'ready_for_delivery', 'delivered', 
      'completed', 'cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Estado inválido: ${status}`,
        error: 'INVALID_STATUS',
        validStatuses
      });
    }

    const previousStatus = order.status;
    order.status = status;
    
    // Actualizar campos específicos según el estado
    switch (status) {
      case 'delivered':
        order.deliveredAt = new Date();
        break;
      case 'completed':
        order.completedAt = new Date();
        order.canReview = true;
        break;
      case 'cancelled':
        order.cancelledAt = new Date();
        order.cancellationReason = notes || 'Cancelado por administrador';
        break;
      case 'ready_for_delivery':
        order.actualReadyDate = new Date();
        break;
    }

    // Agregar al historial
    order.statusHistory.push({
      status,
      previousStatus,
      changedBy: adminId,
      changedByModel: 'Employee',
      notes: notes || `Estado cambiado a ${status}`,
      timestamp: new Date()
    });

    await order.save();

    // Notificar al cliente
    await sendNotification({
      type: "ORDER_STATUS_UPDATED",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        newStatus: status,
        previousStatus,
        notes,
        userName: order.user.name,
        userEmail: order.user.email
      }
    });

    res.status(200).json({
      success: true,
      message: `Estado actualizado a ${status}`,
      data: {
        orderId: order._id,
        newStatus: status,
        previousStatus
      }
    });

  } catch (error) {
    console.error("❌ Error en updateOrderStatus:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar estado",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

// Métodos placeholder para futuras implementaciones
orderController.sendPaymentReminder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('user', 'email name')
      .populate('items.product', 'name');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }
    
    if (order.payment.status === 'paid') {
      return res.status(400).json({ 
        success: false,
        message: "Este pedido ya está pagado",
        error: 'ALREADY_PAID'
      });
    }
    
    await sendNotification({
      type: "PAYMENT_REMINDER",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.total,
        userName: order.user.name,
        userEmail: order.user.email,
        productName: order.items[0]?.product?.name
      }
    });
    
    res.status(200).json({
      success: true,
      message: "Recordatorio de pago enviado"
    });
    
  } catch (error) {
    console.error("❌ Error en sendPaymentReminder:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al enviar recordatorio",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

orderController.getTodayOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const orders = await Order.find({
      $or: [
        { createdAt: { $gte: today, $lt: tomorrow } },
        { estimatedReadyDate: { $gte: today, $lt: tomorrow } }
      ]
    })
    .populate('user', 'name phone email')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 })
    .lean();
    
    res.status(200).json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        total: orders.length,
        orders
      }
    });
    
  } catch (error) {
    console.error("❌ Error en getTodayOrders:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener pedidos del día",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

// Métodos de placeholder adicionales
orderController.getPendingProduction = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Función pendiente de implementación completa",
    data: { orders: [] }
  });
};

orderController.getSalesReport = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Reporte de ventas - función pendiente",
    data: { reportData: "placeholder" }
  });
};

orderController.getTopProductsReport = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Reporte de productos - función pendiente",
    data: { reportData: "placeholder" }
  });
};

orderController.getTopCustomersReport = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Reporte de clientes - función pendiente",
    data: { reportData: "placeholder" }
  });
};

orderController.searchOrders = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Búsqueda de pedidos - función pendiente",
    data: { searchResults: [] }
  });
};

orderController.exportOrders = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Exportación de pedidos - función pendiente",
    data: { exportData: "placeholder" }
  });
};

orderController.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('user', 'email name')
      .populate('items.product', 'name');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }
    
    if (order.payment.status === 'paid') {
      return res.status(400).json({ 
        success: false,
        message: "Este pedido ya está pagado",
        error: 'ALREADY_PAID'
      });
    }

    // Generar link de pago (real o ficticio)
    const paymentData = await processWompiPayment({
      orderId: order._id,
      amount: order.total,
      currency: 'USD',
      customerEmail: order.user.email,
      customerName: order.user.name,
      description: `Pago - Pedido #${order.orderNumber}`,
      isPartialPayment: false
    });

    res.status(200).json({
      success: true,
      message: "Link de pago generado",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.total,
        paymentUrl: paymentData.paymentUrl,
        isFictitious: paymentData.isFake || false,
        expiresAt: paymentData.expiresAt
      }
    });
    
  } catch (error) {
    console.error("❌ Error en processPayment:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al procesar el pago",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

orderController.processRefund = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Función de reembolso pendiente de implementación",
    data: { refundData: "placeholder" }
  });
};

orderController.notifyCustomer = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Función de notificación pendiente de implementación",
    data: { notificationData: "placeholder" }
  });
};

orderController.approveProductPhoto = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Función de aprobación de fotos pendiente de implementación",
    data: { approvalData: "placeholder" }
  });
};

orderController.uploadProductionPhoto = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Función de subida de fotos pendiente de implementación",
    data: { uploadData: "placeholder" }
  });
};

orderController.markAsDelivered = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Función de marcar como entregado pendiente de implementación",
    data: { deliveryData: "placeholder" }
  });
};

orderController.completeOrder = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Función de completar pedido pendiente de implementación",
    data: { completionData: "placeholder" }
  });
};

export default orderController;