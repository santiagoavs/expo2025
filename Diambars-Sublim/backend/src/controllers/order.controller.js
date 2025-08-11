import Order from "../models/order.js";
import Design from "../models/design.js";
import Address from "../models/address.js";
import User from "../models/users.js";
import Product from "../models/product.js";
import mongoose from "mongoose";
import { sendNotification } from "../services/notification.service.js";
 import { processWompiPayment, validateWompiWebhook } from "../services/wompi.service.js";

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
      paymentTiming = 'on_delivery', // 'on_delivery' o 'advance'
      advancePercentage = 0 // Para pagos parciales
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
          user: userId 
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
        
        // Validar formato de teléfono (ejemplo para El Salvador)
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
          location: newAddr.location || { type: "Point", coordinates: [-89.2182, 13.6929] } // Default: San Salvador
        };
        
        // Guardar dirección si el usuario lo solicita
        if (req.body.saveAddress) {
          console.log('💾 Guardando nueva dirección');
          
          const newAddress = new Address({
            ...deliveryAddress,
            user: userId,
            isDefault: req.body.makeDefault || false
          });
          
          // Si se marca como default, actualizar otras direcciones
          if (newAddress.isDefault) {
            await Address.updateMany(
              { user: userId, _id: { $ne: newAddress._id } },
              { isDefault: false },
              { session }
            );
          }
          
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
        const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Mínimo 24 horas desde ahora
        
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
    
    // Calcular tarifa de envío basada en departamento (El Salvador)
    let deliveryFee = 0;
    if (deliveryType === 'delivery') {
      const deliveryFees = {
        'San Salvador': 3,
        'La Libertad': 5,
        'Santa Tecla': 4,
        'Santa Ana': 7,
        'San Miguel': 8,
        'Sonsonate': 6,
        'Ahuachapán': 8,
        'Usulután': 7,
        'La Unión': 10,
        'La Paz': 5,
        'Chalatenango': 7,
        'Cuscatlán': 5,
        'Morazán': 9,
        'San Vicente': 6,
        'Cabañas': 7,
        'default': 10
      };
      
      deliveryFee = deliveryFees[deliveryAddress?.department] || deliveryFees.default;
    }
    
    // Calcular impuestos (IVA 13% en El Salvador)
    const taxRate = 0.13;
    const tax = Math.round((subtotal + deliveryFee) * taxRate * 100) / 100;
    
    const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;
    
    // Determinar si es pedido grande (para pagos parciales)
    const isLargeOrder = total > 100 || quantity > 10; // Ajustar según criterio del negocio
    
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
    
    // Validar método de pago y timing
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
      timing: paymentTiming
    };
    
    // Si es pago anticipado con Wompi
    if (paymentMethod === 'wompi' && paymentTiming === 'advance') {
      // Para pedidos grandes, permitir pago parcial
      if (isLargeOrder && advancePercentage > 0 && advancePercentage < 100) {
        const advanceAmount = Math.round(total * (advancePercentage / 100) * 100) / 100;
        const remainingAmount = total - advanceAmount;
        
        paymentConfig.partialPayment = {
          enabled: true,
          advancePercentage,
          advanceAmount,
          remainingAmount,
          advancePaid: false,
          remainingPaid: false
        };
        
        console.log('💳 Configurando pago parcial:', {
          advancePercentage,
          advanceAmount,
          remainingAmount
        });
      }
    }
    
    // Crear objeto de punto de encuentro
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
    
    // Calcular fecha estimada de entrega basada en días de producción
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
        productionStatus: 'not_started', // Estado inicial de producción
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
        requiresAdvancePayment: isLargeOrder && paymentTiming === 'advance'
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
      if (design.history) {
        design.history.push({
          action: 'approved',
          changedBy: userId,
          changedByModel: 'User',
          timestamp: new Date(),
          notes: 'Aprobado automáticamente al crear pedido'
        });
      }
      
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
    
    // Si es pago con Wompi anticipado, iniciar proceso de pago
    let wompiPaymentData = null;
    if (paymentMethod === 'wompi' && paymentTiming === 'advance') {
      try {
        // const paymentAmount = paymentConfig.partialPayment?.enabled 
        //   ? paymentConfig.partialPayment.advanceAmount 
        //   : total;
          
        // wompiPaymentData = await processWompiPayment({
        //   orderId: newOrder._id,
        //   amount: paymentAmount,
        //   currency: 'USD',
        //   customerEmail: design.user.email,
        //   customerName: design.user.name,
        //   description: `Pedido #${newOrder.orderNumber} - ${design.product.name}`,
        //   redirectUrl: `${process.env.FRONTEND_URL}/orders/${newOrder._id}/payment-success`,
        //   isPartialPayment: paymentConfig.partialPayment?.enabled || false
        // });
        
        console.log('💳 Link de pago Wompi generado (simulado)');
      } catch (wompiError) {
        console.error('⚠️ Error generando link de Wompi (no crítico):', wompiError);
        // No fallar la orden por error de Wompi, el admin puede gestionar manualmente
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
            partialPayment: newOrder.payment.partialPayment,
            wompiPaymentUrl: wompiPaymentData?.paymentUrl || null
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
          payment: wompiPaymentData?.paymentUrl || null
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
    
    // Si hay pago confirmado, procesar reembolso
    if (order.payment.status === 'paid') {
      // TODO: Implementar lógica de reembolso según método de pago
      if (order.payment.method === 'wompi') {
        try {
          // const refund = await processRefund(
          //   order.payment.wompiData.transactionId,
          //   order.total
          // );
          
          order.payment.refunds.push({
            // refundId: refund.refundId,
            amount: order.total,
            reason: reason || 'Pedido cancelado',
            status: 'processed',
            requestedAt: new Date(),
            processedAt: new Date(),
            requestedBy: userId,
            requestedByModel: 'User'
          });
          
          order.payment.status = 'refunded';
        } catch (refundError) {
          console.error('Error procesando reembolso:', refundError);
          // Continuar con cancelación aunque falle el reembolso
          order.payment.refunds.push({
            amount: order.total,
            reason: reason || 'Pedido cancelado',
            status: 'pending',
            requestedAt: new Date(),
            requestedBy: userId,
            requestedByModel: 'User'
          });
        }
      }
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
        refundStatus: order.payment.refunds.length > 0 ? 
          order.payment.refunds[order.payment.refunds.length - 1].status : null
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
 * Procesa pago manual (admin)
 */
orderController.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    console.log('💳 Procesando pago manual:', {
      orderId: id,
      amount
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
      .populate('user', 'email name')
      .populate('items.product', 'name');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }
    
    // Verificar que no esté pagado
    if (order.payment.status === 'paid') {
      return res.status(400).json({ 
        success: false,
        message: "Este pedido ya está pagado",
        error: 'ALREADY_PAID'
      });
    }
    
    // Calcular monto a pagar
    const paymentAmount = amount || (
      order.payment.partialPayment?.enabled && !order.payment.partialPayment.advancePaid
        ? order.payment.partialPayment.advanceAmount
        : order.total
    );
    
    // Generar link de pago con Wompi (simulado)
    // const wompiPaymentData = await processWompiPayment({
    //   orderId: order._id,
    //   amount: paymentAmount,
    //   currency: 'USD',
    //   customerEmail: order.user.email,
    //   customerName: order.user.name,
    //   description: `Pago manual - Pedido #${order.orderNumber}`,
    //   redirectUrl: `${process.env.FRONTEND_URL}/orders/${order._id}/payment-success`,
    //   isPartialPayment: order.payment.partialPayment?.enabled || false
    // });
    
    res.status(200).json({
      success: true,
      message: "Link de pago generado",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: paymentAmount,
        paymentUrl: `${process.env.FRONTEND_URL}/payment/simulated`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
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

/**
 * Procesa reembolso
 */
orderController.processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const adminId = req.user._id;
    
    console.log('💸 Procesando reembolso:', {
      orderId: id,
      amount,
      reason
    });
    
    // Validaciones...
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de pedido inválido",
        error: 'INVALID_ORDER_ID'
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
    
    if (order.payment.status !== 'paid') {
      return res.status(400).json({ 
        success: false,
        message: "El pedido no está pagado",
        error: 'NOT_PAID'
      });
    }
    
    const refundAmount = amount || order.total;
    
    // Procesar según método de pago
    if (order.payment.method === 'wompi' && order.payment.wompiData?.transactionId) {
      // const refund = await processRefund(
      //   order.payment.wompiData.transactionId,
      //   refundAmount
      // );
      
      order.payment.refunds.push({
        // refundId: refund.refundId,
        amount: refundAmount,
        reason: reason || 'Reembolso solicitado por administrador',
        status: 'processed',
        requestedAt: new Date(),
        processedAt: new Date(),
        requestedBy: adminId,
        requestedByModel: 'Employee'
      });
      
      order.payment.status = refundAmount >= order.total ? 'refunded' : 'partially_refunded';
    } else {
      // Para pagos en efectivo, solo registrar
      order.payment.refunds.push({
        amount: refundAmount,
        reason: reason || 'Reembolso manual',
        status: 'processed',
        requestedAt: new Date(),
        processedAt: new Date(),
        requestedBy: adminId,
        requestedByModel: 'Employee'
      });
      
      order.payment.status = 'refunded';
    }
    
    await order.save();
    
    // Notificar al cliente
    await sendNotification({
      type: "REFUND_PROCESSED",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: refundAmount,
        reason,
        userName: order.user.name,
        userEmail: order.user.email
      }
    });
    
    res.status(200).json({
      success: true,
      message: "Reembolso procesado exitosamente",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        refundAmount,
        paymentStatus: order.payment.status
      }
    });
    
  } catch (error) {
    console.error("❌ Error en processRefund:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al procesar el reembolso",
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
    
    // Productos más vendidos
    const topProducts = await Order.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.product',
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' }
      }},
      { $sort: { quantity: -1 } },
      { $limit: 10 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }},
      { $unwind: '$product' },
      { $project: {
        productName: '$product.name',
        quantity: 1,
        revenue: 1
      }}
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue: revenue[0]?.total || 0,
          averageOrderValue: averageOrderValue[0]?.avg || 0,
          conversionRate: calculateConversionRate(ordersByStatus)
        },
        byStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPaymentMethod: ordersByPaymentMethod.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topProducts,
        period: {
          startDate: startDate || 'all-time',
          endDate: endDate || 'current'
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
 * Obtiene pedidos del día (para app móvil)
 */
orderController.getTodayOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const orders = await Order.find({
      $or: [
        { createdAt: { $gte: today, $lt: tomorrow } },
        { estimatedReadyDate: { $gte: today, $lt: tomorrow } },
        { 'meetupDetails.date': { $gte: today, $lt: tomorrow } }
      ]
    })
    .populate('user', 'name phone email')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 })
    .lean();
    
    // Agrupar por estado
    const grouped = {
      pending: [],
      inProgress: [],
      ready: [],
      delivered: []
    };
    
    orders.forEach(order => {
      if (['pending_approval', 'quoted', 'approved'].includes(order.status)) {
        grouped.pending.push(order);
      } else if (order.status === 'in_production') {
        grouped.inProgress.push(order);
      } else if (order.status === 'ready_for_delivery') {
        grouped.ready.push(order);
      } else if (['delivered', 'completed'].includes(order.status)) {
        grouped.delivered.push(order);
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        total: orders.length,
        orders: grouped,
        summary: {
          pending: grouped.pending.length,
          inProgress: grouped.inProgress.length,
          ready: grouped.ready.length,
          delivered: grouped.delivered.length
        }
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

/**
 * Obtiene pedidos pendientes de producción
 */
orderController.getPendingProduction = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['approved', 'in_production'] }
    })
    .populate('user', 'name email phone')
    .populate('items.product', 'name productionTime')
    .populate('items.design', 'name previewImage')
    .sort({ 'metadata.priority': -1, createdAt: 1 })
    .lean();
    
    // Calcular tiempo en producción
    const ordersWithTime = orders.map(order => {
      const now = new Date();
      const startTime = order.statusHistory.find(h => h.status === 'in_production')?.timestamp || order.createdAt;
      const hoursInProduction = Math.floor((now - new Date(startTime)) / (1000 * 60 * 60));
      
      return {
        ...order,
        hoursInProduction,
        isOverdue: now > new Date(order.estimatedReadyDate),
        productionProgress: order.items[0]?.productionProgress || 0
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        orders: ordersWithTime,
        total: ordersWithTime.length,
        overdue: ordersWithTime.filter(o => o.isOverdue).length,
        highPriority: ordersWithTime.filter(o => o.metadata?.priority === 'high').length
      }
    });
    
  } catch (error) {
    console.error("❌ Error en getPendingProduction:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener pedidos pendientes",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Envía recordatorio de pago
 */
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

/**
 * Notifica al cliente sobre actualización
 */
orderController.notifyCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    const order = await Order.findById(id)
      .populate('user', 'email name phone');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }
    
    // Guardar mensaje en el pedido
    order.messages.push({
      sender: req.user._id,
      senderModel: 'Employee',
      message,
      sentAt: new Date()
    });
    
    await order.save();
    
    // Enviar notificación
    await sendNotification({
      type: "CUSTOM_MESSAGE",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        message,
        userName: order.user.name,
        userEmail: order.user.email
      }
    });
    
    res.status(200).json({
      success: true,
      message: "Notificación enviada al cliente"
    });
    
  } catch (error) {
    console.error("❌ Error en notifyCustomer:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al enviar notificación",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

// Función auxiliar para calcular tasa de conversión
function calculateConversionRate(ordersByStatus) {
  const total = ordersByStatus.reduce((sum, item) => sum + item.count, 0);
  const completed = ordersByStatus.find(item => item._id === 'completed')?.count || 0;
  
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// (Duplicate getOrderById function removed to fix syntax error)

// Agregar estos métodos al final del orderController antes del export:

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
      deliveryType: order.deliveryType
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
 * Cliente aprueba o rechaza foto del producto
 */
orderController.approveProductPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { photoId, approved, changeRequested, clientNotes } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(id).populate('user', 'email name');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Verificar que el pedido pertenezca al usuario
    if (!order.user._id.equals(userId)) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para aprobar fotos de este pedido",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    // Buscar la foto
    const photo = order.productionPhotos.id(photoId);
    if (!photo) {
      return res.status(404).json({ 
        success: false,
        message: "Foto no encontrada",
        error: 'PHOTO_NOT_FOUND'
      });
    }

    // Actualizar aprobación
    photo.clientApproved = approved;
    photo.clientResponse = {
      approved,
      changeRequested: changeRequested || '',
      notes: clientNotes || '',
      respondedAt: new Date()
    };

    await order.save();

    // Notificar al admin
    await sendNotification({
      type: approved ? "PHOTO_APPROVED" : "PHOTO_REJECTED",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        photoId,
        changeRequested,
        clientNotes,
        userName: order.user.name
      }
    });

    res.status(200).json({
      success: true,
      message: approved ? "Foto aprobada" : "Foto rechazada",
      data: { 
        photoId,
        approved,
        requiresChanges: !approved && changeRequested
      }
    });

  } catch (error) {
    console.error("❌ Error en approveProductPhoto:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al procesar aprobación",
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

    // Validar transición de estado básica
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

/**
 * Sube foto de producción (admin)
 */
orderController.uploadProductionPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, notes } = req.body;
    const adminId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "Debe subir una foto",
        error: 'FILE_REQUIRED'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Subir imagen usando tu configuración de Cloudinary
    // Nota: Necesitarías importar tu utilidad de cloudinary
    const photoUrl = `/uploads/temp/photo-${Date.now()}.jpg`; // Temporal

    // Agregar foto al pedido
    const productionPhoto = {
      url: photoUrl,
      stage: stage || 'progress',
      uploadedAt: new Date(),
      uploadedBy: adminId,
      notes: notes || '',
      clientApproved: false
    };

    order.productionPhotos.push(productionPhoto);
    await order.save();

    // Notificar al cliente
    await sendNotification({
      type: "PRODUCTION_PHOTO_UPLOADED",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        photoUrl,
        stage,
        notes
      }
    });

    res.status(200).json({
      success: true,
      message: "Foto de producción subida",
      data: {
        photoId: productionPhoto._id,
        photoUrl,
        stage,
        requiresApproval: true
      }
    });

  } catch (error) {
    console.error("❌ Error en uploadProductionPhoto:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al subir foto",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

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
    order.payment.amount = amount;
    
    if (order.payment.method === 'cash') {
      order.payment.cashPaymentDetails = {
        collectedBy: adminId,
        collectedAt: new Date(),
        receiptNumber: receiptNumber || `CASH-${Date.now()}`,
        notes: notes || '',
        location: { type: 'Point', coordinates: [0, 0] }
      };
    }

    await order.save();

    // Notificar al cliente
    await sendNotification({
      type: "PAYMENT_CONFIRMED",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount,
        paymentMethod: order.payment.method,
        userName: order.user.name,
        userEmail: order.user.email
      }
    });

    res.status(200).json({
      success: true,
      message: "Pago confirmado",
      data: {
        orderId: order._id,
        amount,
        paymentStatus: order.payment.status
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
 * Marcar pedido como entregado (admin)
 */
orderController.markAsDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryNotes, deliveredAt } = req.body;
    const adminId = req.user._id;

    const order = await Order.findById(id).populate('user', 'email name');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    if (order.status !== 'ready_for_delivery') {
      return res.status(400).json({ 
        success: false,
        message: "El pedido debe estar listo para entrega",
        error: 'INVALID_STATUS'
      });
    }

    // Actualizar estado
    order.status = 'delivered';
    order.deliveredAt = deliveredAt ? new Date(deliveredAt) : new Date();
    order.adminNotes = deliveryNotes || '';

    // Agregar al historial
    order.statusHistory.push({
      status: 'delivered',
      previousStatus: 'ready_for_delivery',
      changedBy: adminId,
      changedByModel: 'Employee',
      notes: deliveryNotes || 'Pedido entregado',
      timestamp: new Date()
    });

    await order.save();

    // Notificar al cliente
    await sendNotification({
      type: "ORDER_DELIVERED",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        deliveredAt: order.deliveredAt,
        userName: order.user.name,
        userEmail: order.user.email
      }
    });

    res.status(200).json({
      success: true,
      message: "Pedido marcado como entregado",
      data: {
        orderId: order._id,
        status: order.status,
        deliveredAt: order.deliveredAt
      }
    });

  } catch (error) {
    console.error("❌ Error en markAsDelivered:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al marcar como entregado",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Completar pedido (admin)
 */
orderController.completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { completionNotes } = req.body;
    const adminId = req.user._id;

    const order = await Order.findById(id).populate('user', 'email name');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        success: false,
        message: "El pedido debe estar entregado para completarse",
        error: 'INVALID_STATUS'
      });
    }

    // Actualizar estado
    order.status = 'completed';
    order.completedAt = new Date();
    order.canReview = true;
    order.adminNotes = completionNotes || '';

    // Agregar al historial
    order.statusHistory.push({
      status: 'completed',
      previousStatus: 'delivered',
      changedBy: adminId,
      changedByModel: 'Employee',
      notes: completionNotes || 'Pedido completado',
      timestamp: new Date()
    });

    await order.save();

    // Notificar al cliente
    await sendNotification({
      type: "ORDER_COMPLETED",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        completedAt: order.completedAt,
        userName: order.user.name,
        userEmail: order.user.email,
        canReview: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Pedido completado",
      data: {
        orderId: order._id,
        status: order.status,
        completedAt: order.completedAt,
        canReview: order.canReview
      }
    });

  } catch (error) {
    console.error("❌ Error en completeOrder:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al completar pedido",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Métodos adicionales de reportes y búsqueda
 */
orderController.getSalesReport = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Reporte de ventas - función pendiente de implementación completa",
      data: { reportData: "placeholder" }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en reporte" });
  }
};

orderController.getTopProductsReport = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Reporte de productos - función pendiente de implementación completa",
      data: { reportData: "placeholder" }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en reporte" });
  }
};

orderController.getTopCustomersReport = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Reporte de clientes - función pendiente de implementación completa",
      data: { reportData: "placeholder" }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en reporte" });
  }
};

orderController.searchOrders = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Búsqueda de pedidos - función pendiente de implementación completa",
      data: { searchResults: [] }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en búsqueda" });
  }
};

orderController.exportOrders = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Exportación de pedidos - función pendiente de implementación completa",
      data: { exportData: "placeholder" }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en exportación" });
  }
};

orderController.wompiWebhook = async (req, res) => {
  try {
    console.log('📥 Webhook simulado recibido:', req.body);
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default orderController;