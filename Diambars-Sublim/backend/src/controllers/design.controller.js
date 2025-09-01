import Design from "../models/design.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import User from "../models/users.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import { notificationService } from "../services/notification.service.js";
import { validators, validateFields } from "../utils/validators.utils.js";
import { createCanvas, loadImage, registerFont } from 'canvas';

const designController = {};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Valida elementos de diseño
 * @param {Array} elements - Elementos del diseño a validar
 * @param {Array} customizationAreas - Áreas de personalización del producto
 * @returns {Object} Objeto con isValid (boolean) y errors (array)
 */
const validateDesignElements = (elements, customizationAreas = []) => {
  const errors = [];
  
  if (!Array.isArray(elements)) {
    return {
      isValid: false,
      errors: ['Los elementos deben ser un array']
    };
  }

  elements.forEach((element, index) => {
    if (!element.type) {
      errors.push(`Elemento ${index + 1}: Tipo de elemento requerido`);
      return;
    }
    
    if (!element.konvaAttrs) {
      errors.push(`Elemento ${index + 1}: Configuración de posición requerida`);
      return;
    }
    
    if (typeof element.konvaAttrs.x !== 'number') {
      errors.push(`Elemento ${index + 1}: Posición X requerida`);
    }
    
    if (typeof element.konvaAttrs.y !== 'number') {
      errors.push(`Elemento ${index + 1}: Posición Y requerida`);
    }
    
    switch (element.type) {
      case 'text':
        if (!element.konvaAttrs.text || element.konvaAttrs.text.trim() === '') {
          errors.push(`Elemento ${index + 1}: Contenido de texto requerido`);
        }
        break;
        
      case 'image':
        if (!element.konvaAttrs.image) {
          errors.push(`Elemento ${index + 1}: URL de imagen requerida`);
        }
        break;
    }
    
    if (customizationAreas.length > 0) {
      const areaId = element.areaId;
      if (!areaId) {
        console.warn(`Elemento ${index + 1}: Sin área asignada, se usará la primera disponible`);
      } else {
        const area = customizationAreas.find(a => a._id.toString() === areaId.toString());
        if (!area) {
          errors.push(`Elemento ${index + 1}: Área de personalización no válida`);
        }
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Normaliza elementos del diseño para almacenamiento
 * @param {Array} elements - Elementos a normalizar
 * @param {Array} customizationAreas - Áreas de personalización disponibles
 * @returns {Array} Elementos normalizados
 */
const normalizeDesignElements = (elements, customizationAreas = []) => {
  return elements.map((element, index) => {
    const normalized = {
      type: element.type || 'text',
      areaId: element.areaId || (customizationAreas[0]?._id) || new mongoose.Types.ObjectId(),
      konvaAttrs: {
        x: element.konvaAttrs?.x || 0,
        y: element.konvaAttrs?.y || 0,
        ...element.konvaAttrs
      }
    };
    
    if (normalized.type === 'text') {
      normalized.konvaAttrs = {
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000',
        ...normalized.konvaAttrs
      };
      
      if (!normalized.konvaAttrs.text) {
        normalized.konvaAttrs.text = 'Texto sin contenido';
      }
    }
    
    if (normalized.type === 'image') {
      normalized.konvaAttrs = {
        width: 200,
        height: 150,
        ...normalized.konvaAttrs
      };
    }
    
    return normalized;
  });
};

/**
 * Valida opciones del producto
 * @param {Array} productOptions - Opciones a validar
 * @param {Array} availableOptions - Opciones disponibles del producto
 * @returns {Object} Resultado de validación
 */
async function validateProductOptions(productOptions, availableOptions) {
  const errors = [];
  const cleaned = [];

  if (!Array.isArray(productOptions)) {
    return {
      isValid: false,
      error: 'Las opciones del producto deben ser un array'
    };
  }

  for (const option of productOptions) {
    const optionValidation = validateFields(option, {
      name: (value) => validators.text(value, 1, 50),
      value: (value) => validators.text(value, 1, 50)
    });

    if (!optionValidation.isValid) {
      errors.push(`Opción inválida: ${optionValidation.errors.join('; ')}`);
      continue;
    }

    const { name: optionName, value: optionValue } = optionValidation.cleaned;
    const productOption = availableOptions?.find(po => po.name === optionName);
    
    if (!productOption) {
      errors.push(`La opción "${optionName}" no existe para este producto`);
      continue;
    }

    const validValue = productOption.values?.find(v => v.value === optionValue);
    if (!validValue) {
      errors.push(`El valor "${optionValue}" no es válido para la opción "${optionName}"`);
      continue;
    }

    cleaned.push({
      name: optionName,
      value: optionValue
    });
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join('; ') : null,
    cleaned
  };
}

// ==================== FUNCIONES PRINCIPALES ====================

/**
 * Crea un nuevo diseño personalizado
 */
designController.createDesign = async (req, res) => {
  try {
    const { productId, elements, productOptions, clientNotes, mode = 'simple', productColorFilter } = req.body;
    const userId = req.user._id;

    const basicValidation = validateFields({
      productId, clientNotes, mode
    }, {
      productId: (value) => validators.mongoId(value, 'ID de producto'),
      clientNotes: (value) => validators.text(value, 0, 1000),
      mode: (value) => validators.text(value, 1, 20)
    });

    if (!basicValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: `Datos básicos inválidos: ${basicValidation.errors.join('; ')}`,
        error: 'VALIDATION_ERROR'
      });
    }

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Debe proporcionar al menos un elemento para el diseño",
        error: 'ELEMENTS_REQUIRED'
      });
    }

    const product = await Product.findById(basicValidation.cleaned.productId);
    if (!product || !product.isActive) {
      return res.status(!product ? 404 : 400).json({ 
        success: false,
        message: !product ? "Producto no encontrado" : "El producto no está disponible",
        error: !product ? 'PRODUCT_NOT_FOUND' : 'PRODUCT_INACTIVE'
      });
    }

    const elementsValidation = validateDesignElements(elements, product.customizationAreas);
    if (!elementsValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: "Elementos de diseño no válidos",
        errors: elementsValidation.errors,
        error: 'INVALID_DESIGN_ELEMENTS'
      });
    }

    const normalizedElements = normalizeDesignElements(elements, product.customizationAreas);
    const optionsValidation = await validateProductOptions(productOptions, product.options);
    
    if (!optionsValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: optionsValidation.error,
        error: 'INVALID_PRODUCT_OPTIONS'
      });
    }

    const newDesign = new Design({
      product: product._id,
      user: userId,
      name: `Diseño personalizado - ${product.name}`,
      elements: normalizedElements,
      productColorFilter: productColorFilter || null,
      productOptions: optionsValidation.cleaned,
      status: 'pending',
      clientNotes: basicValidation.cleaned.clientNotes || "",
      metadata: {
        mode: basicValidation.cleaned.mode,
        colors: extractColorsFromElements(normalizedElements),
        fonts: extractFontsFromElements(normalizedElements),
        complexity: calculateDesignComplexity(normalizedElements)
      }
    });

    await newDesign.save();
    generatePreviewAndNotify(newDesign, product, userId).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Diseño enviado para cotización",
      data: {
        designId: newDesign._id,
        status: newDesign.status,
        message: "Tu diseño será revisado y cotizado por nuestro equipo"
      }
    });

  } catch (error) {
    console.error("Error en createDesign:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Crea un diseño para un cliente (admin)
 */
designController.createDesignForClient = async (req, res) => {
  try {
    const { userId, productId, elements, productOptions, clientNotes, name, mode = 'simple', productColorFilter } = req.body;
    const adminId = req.user._id;
    const adminRoles = req.user.roles || [];

    if (!adminRoles.includes('admin') && !adminRoles.includes('manager')) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permisos para crear diseños para clientes",
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const basicValidation = validateFields({
      userId, productId, name, clientNotes, mode
    }, {
      userId: (value) => validators.mongoId(value, 'ID de cliente'),
      productId: (value) => validators.mongoId(value, 'ID de producto'),
      name: (value) => validators.text(value, 1, 100),
      clientNotes: (value) => validators.text(value, 0, 1000),
      mode: (value) => validators.text(value, 1, 20)
    });

    if (!basicValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: `Datos básicos inválidos: ${basicValidation.errors.join('; ')}`,
        error: 'VALIDATION_ERROR'
      });
    }

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Debe proporcionar al menos un elemento para el diseño",
        error: 'ELEMENTS_REQUIRED'
      });
    }

    const [client, product] = await Promise.all([
      User.findById(basicValidation.cleaned.userId),
      Product.findById(basicValidation.cleaned.productId)
    ]);

    if (!client || !product) {
      return res.status(!client ? 404 : 404).json({ 
        success: false,
        message: !client ? "Cliente no encontrado" : "Producto no encontrado",
        error: !client ? 'CLIENT_NOT_FOUND' : 'PRODUCT_NOT_FOUND'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({ 
        success: false,
        message: "El producto no está disponible actualmente",
        error: 'PRODUCT_INACTIVE'
      });
    }

    const elementsValidation = validateDesignElements(elements, product.customizationAreas);
    if (!elementsValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: "Elementos de diseño no válidos",
        errors: elementsValidation.errors,
        error: 'INVALID_DESIGN_ELEMENTS'
      });
    }

    const normalizedElements = normalizeDesignElements(elements, product.customizationAreas);
    const optionsValidation = await validateProductOptions(productOptions, product.options);
    
    if (!optionsValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: optionsValidation.error,
        error: 'INVALID_PRODUCT_OPTIONS'
      });
    }

    const newDesign = new Design({
      product: product._id,
      user: client._id,
      name: basicValidation.cleaned.name,
      elements: normalizedElements,
      productColorFilter: productColorFilter || null,
      productOptions: optionsValidation.cleaned,
      status: 'pending',
      clientNotes: basicValidation.cleaned.clientNotes || "",
      adminNotes: `Diseño creado por administrador: ${req.user.name || req.user.email}`,
      metadata: {
        mode: basicValidation.cleaned.mode,
        colors: extractColorsFromElements(normalizedElements),
        fonts: extractFontsFromElements(normalizedElements),
        complexity: calculateDesignComplexity(normalizedElements),
        createdByAdmin: true,
        createdByAdminId: adminId,
        createdByAdminName: req.user.name || req.user.email
      },
      history: [{
        action: 'created',
        changedBy: adminId,
        changedByModel: 'Employee',
        timestamp: new Date(),
        notes: 'Diseño creado por administrador para cliente'
      }]
    });

    await newDesign.save();
    generatePreviewAndNotifyAdmin(newDesign, product, client._id, adminId).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Diseño creado exitosamente para el cliente",
      data: {
        designId: newDesign._id,
        status: newDesign.status,
        clientName: client.name,
        clientEmail: client.email,
        productName: product.name,
        message: "El diseño está listo para cotización"
      }
    });

  } catch (error) {
    console.error("Error en createDesignForClient:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear el diseño para el cliente",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Obtiene un diseño por ID
 */
designController.getDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.roles?.some(r => ['admin', 'manager'].includes(r));

    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    const design = await Design.findById(idValidation.cleaned)
      .populate('product', 'name basePrice images customizationAreas options')
      .populate('user', 'name email');

    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }

    if (!design.user._id.equals(userId) && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para ver este diseño",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    const order = await Order.findOne({ 'items.design': design._id })
      .select('orderNumber status estimatedReadyDate')
      .lean();

    const response = {
      success: true,
      data: {
        design,
        konvaConfig: {
          productImage: design.product.images?.main,
          areas: design.product.customizationAreas?.map(area => ({
            id: area._id,
            name: area.name,
            displayName: area.displayName,
            position: area.position,
            accepts: area.accepts
          })) || [],
          elements: design.elements.map(el => ({
            ...el.toObject(),
            id: el._id || `elem-${Math.random().toString(36).substring(2, 9)}`
          }))
        }
      }
    };

    if (order) {
      response.data.order = {
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedReadyDate: order.estimatedReadyDate
      };
    }

    if (isAdmin && design.status === 'pending') {
      try {
        const priceEstimate = calculateDesignPrice(design, design.product.basePrice);
        response.data.priceEstimate = {
          min: priceEstimate * 0.8,
          recommended: priceEstimate,
          max: priceEstimate * 1.2
        };
      } catch (calcError) {
        console.error('Error calculando precio estimado:', calcError);
      }
    }

    res.status(200).json(response);

  } catch (error) {
    console.error("Error en getDesignById:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Envía una cotización para un diseño (admin)
 */
designController.submitQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, productionDays, adminNotes } = req.body;
    const adminId = req.user._id;

    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    const quoteValidation = validateFields({
      price, productionDays, adminNotes
    }, {
      price: (value) => validators.price(value, 0.01),
      productionDays: (value) => validators.quantity(value, 1, 60),
      adminNotes: (value) => validators.text(value, 0, 1000)
    });

    if (!quoteValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: `Datos de cotización inválidos: ${quoteValidation.errors.join('; ')}`,
        error: 'VALIDATION_ERROR'
      });
    }

    const design = await Design.findById(idValidation.cleaned)
      .populate('product', 'basePrice name')
      .populate('user', 'email name');

    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }

    if (design.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: `No se puede cotizar un diseño en estado ${design.status}`,
        error: 'INVALID_DESIGN_STATUS'
      });
    }

    const { price: validPrice, productionDays: validDays, adminNotes: validNotes } = quoteValidation.cleaned;
    
    design.price = validPrice;
    design.productionDays = validDays;
    design.adminNotes = validNotes || "";
    design.status = 'quoted';
    design.quotedAt = new Date();
    
    await design.save();

    try {
      await notificationService.sendCustomNotification({
        to: design.user.email,
        subject: `💰 Cotización lista para tu diseño ${design.name}`,
        isHtml: true,
        message: `
          <h2>Tu diseño ha sido cotizado</h2>
          <p>Precio: <strong>$${design.price}</strong></p>
          <p>Días de producción: <strong>${design.productionDays}</strong></p>
          <p>Producto: ${design.product.name}</p>
        `
      });
    } catch (notificationError) {
      console.error('Error enviando notificación:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Cotización enviada al cliente",
      data: {
        design: {
          _id: design._id,
          status: design.status,
          price: design.price,
          productionDays: design.productionDays,
          quotedAt: design.quotedAt
        }
      }
    });

  } catch (error) {
    console.error("Error en submitQuote:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al procesar la cotización",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Responde a una cotización (cliente)
 */
designController.respondToQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept, clientNotes } = req.body;
    const userId = req.user._id;

    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    if (typeof accept !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        message: "Debe especificar si acepta o rechaza la cotización (accept: true|false)",
        error: 'INVALID_ACCEPT_VALUE'
      });
    }

    if (clientNotes) {
      const notesValidation = validators.text(clientNotes, 0, 1000);
      if (!notesValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: `Notas del cliente inválidas: ${notesValidation.error}`,
          error: 'INVALID_CLIENT_NOTES'
        });
      }
    }

    const design = await Design.findById(idValidation.cleaned)
      .populate('product', 'name')
      .populate('user', 'email name');

    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }

    if (!design.user._id.equals(userId)) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para responder a esta cotización",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    if (design.status !== 'quoted') {
      return res.status(400).json({ 
        success: false,
        message: "Solo se puede responder a diseños en estado 'quoted'",
        error: 'INVALID_DESIGN_STATUS'
      });
    }

    if (accept) {
      design.status = 'approved';
      design.approvedAt = new Date();
      if (clientNotes) design.clientNotes = clientNotes;
      
      await design.save();
      
      const newOrder = new Order({
        user: userId,
        items: [{
          product: design.product._id,
          design: design._id,
          options: design.productOptions,
          quantity: 1,
          unitPrice: design.price,
          subtotal: design.price
        }],
        subtotal: design.price,
        total: design.price,
        status: 'pending_approval',
        estimatedReadyDate: new Date(Date.now() + design.productionDays * 24 * 60 * 60 * 1000),
        clientNotes: design.clientNotes,
        statusHistory: [{
          status: 'pending_approval',
          changedBy: userId,
          changedByModel: 'User',
          notes: 'Pedido creado automáticamente al aprobar cotización'
        }]
      });
      
      await newOrder.save();
      
      try {
        await notificationService.sendQuoteAcceptedNotification({
          orderNumber: newOrder.orderNumber,
          userName: design.user.name,
          clientNotes
        });
        await notificationService.sendStatusUpdateNotification({
          orderNumber: newOrder.orderNumber,
          newStatus: 'approved',
          previousStatus: 'quoted',
          notes: clientNotes,
          userEmail: design.user.email,
          userName: design.user.name
        });
      } catch (e) {
        console.error('Error enviando notificaciones de aprobación:', e);
      }

      res.status(200).json({
        success: true,
        message: "Cotización aceptada. Tu pedido ha sido creado.",
        data: {
          design: {
            _id: design._id,
            status: design.status
          },
          order: {
            _id: newOrder._id,
            orderNumber: newOrder.orderNumber,
            status: newOrder.status,
            total: newOrder.total
          }
        }
      });
      
    } else {
      design.status = 'rejected';
      design.rejectedAt = new Date();
      design.rejectionReason = clientNotes || "No se especificó motivo";
      
      await design.save();

      try {
        await notificationService.sendQuoteRejectedNotification({
          orderNumber: `DESIGN-${design._id}`,
          userName: design.user.name,
          reason: design.rejectionReason
        });
      } catch (e) {
        console.error('Error enviando notificación de rechazo:', e);
      }

      res.status(200).json({
        success: true,
        message: "Cotización rechazada",
        data: {
          design: {
            _id: design._id,
            status: design.status,
            rejectionReason: design.rejectionReason
          }
        }
      });
    }

  } catch (error) {
    console.error("Error en respondToQuote:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al procesar la respuesta a la cotización",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Lista todos los diseños con filtros (admin)
 */
designController.getAllDesigns = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      product,
      user,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const isAdmin = req.user.roles?.some(role => ['admin', 'manager'].includes(role));
    
    const queryValidation = validateFields({
      page, limit, product, user, search
    }, {
      page: (value) => validators.quantity(value, 1, 1000),
      limit: (value) => validators.quantity(value, 1, 100),
      product: (value) => value ? validators.mongoId(value, 'ID de producto') : { isValid: true },
      user: (value) => value ? validators.mongoId(value, 'ID de usuario') : { isValid: true },
      search: (value) => value ? validators.text(value, 1, 100) : { isValid: true }
    });

    if (!queryValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Parámetros de consulta inválidos: ${queryValidation.errors.join('; ')}`,
        error: 'VALIDATION_ERROR'
      });
    }

    if (status) {
      const validStatuses = ['pending', 'quoted', 'approved', 'rejected', 'draft'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Estado inválido. Estados válidos: ${validStatuses.join(', ')}`,
          error: 'INVALID_STATUS'
        });
      }
    }

    const validSortFields = ['createdAt', 'updatedAt', 'status', 'price', 'name'];
    if (!validSortFields.includes(sort)) {
      return res.status(400).json({
        success: false,
        message: `Campo de ordenamiento inválido. Campos válidos: ${validSortFields.join(', ')}`,
        error: 'INVALID_SORT_FIELD'
      });
    }

    const validOrderOptions = ['asc', 'desc'];
    if (!validOrderOptions.includes(order)) {
      return res.status(400).json({
        success: false,
        message: `Orden inválido. Opciones válidas: ${validOrderOptions.join(', ')}`,
        error: 'INVALID_ORDER'
      });
    }
    
    const filter = isAdmin ? {} : { user: req.user._id };
    if (status) filter.status = status;
    if (queryValidation.cleaned.product) filter.product = queryValidation.cleaned.product;
    if (queryValidation.cleaned.user && isAdmin) filter.user = queryValidation.cleaned.user;
    if (queryValidation.cleaned.search) {
      filter.$or = [
        { name: { $regex: queryValidation.cleaned.search, $options: 'i' } },
        { clientNotes: { $regex: queryValidation.cleaned.search, $options: 'i' } }
      ];
    }
    
    const result = await Design.paginate(filter, {
      page: queryValidation.cleaned.page,
      limit: queryValidation.cleaned.limit,
      sort: { [sort]: order === 'asc' ? 1 : -1 },
      populate: [
        { path: 'product', select: 'name images' },
        { path: 'user', select: 'name email' }
      ],
      lean: true
    });
    
    const designs = result.docs.map(design => ({
      ...design,
      _links: {
        self: `/api/designs/${design._id}`,
        product: `/api/products/${design.product._id}`
      }
    }));
    
    res.status(200).json({
      success: true,
      data: {
        designs,
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
    console.error("Error en getAllDesigns:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los diseños",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Actualiza un diseño existente (solo en estado draft)
 */
designController.updateDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const { elements, productOptions, clientNotes, name } = req.body;
    const userId = req.user._id;
    
    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }
    
    const design = await Design.findById(idValidation.cleaned).populate('product');
    
    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }
    
    if (!design.user.equals(userId) && !req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para modificar este diseño",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }
    
    if (design.status !== 'draft') {
      return res.status(400).json({ 
        success: false,
        message: "Solo se pueden modificar diseños en estado borrador",
        error: 'INVALID_DESIGN_STATUS'
      });
    }

    const fieldsToValidate = {};
    if (name !== undefined) fieldsToValidate.name = name;
    if (clientNotes !== undefined) fieldsToValidate.clientNotes = clientNotes;

    if (Object.keys(fieldsToValidate).length > 0) {
      const fieldsValidation = validateFields(fieldsToValidate, {
        name: (value) => validators.text(value, 1, 100),
        clientNotes: (value) => validators.text(value, 0, 1000)
      });

      if (!fieldsValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: `Campos inválidos: ${fieldsValidation.errors.join('; ')}`,
          error: 'VALIDATION_ERROR'
        });
      }

      if (fieldsValidation.cleaned.name) design.name = fieldsValidation.cleaned.name;
      if (fieldsValidation.cleaned.clientNotes !== undefined) design.clientNotes = fieldsValidation.cleaned.clientNotes;
    }
    
    if (elements) {
      const validation = validateDesignElements(elements, design.product.customizationAreas);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false,
          message: "Elementos de diseño no válidos",
          errors: validation.errors,
          error: 'INVALID_DESIGN_ELEMENTS'
        });
      }
      
      const normalizedElements = normalizeDesignElements(elements, design.product.customizationAreas);
      design.elements = normalizedElements;
      design.metadata.colors = extractColorsFromElements(normalizedElements);
      design.metadata.fonts = extractFontsFromElements(normalizedElements);
      design.metadata.complexity = calculateDesignComplexity(normalizedElements);
    }

    if (designData.productColorFilter !== undefined) {
      const colorValidation = validators.text(designData.productColorFilter, 0, 7);
      if (!colorValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: `Color del producto inválido: ${colorValidation.error}`,
          error: 'INVALID_PRODUCT_COLOR'
        });
      }
    }

    if (productOptions) {
      const optionsValidation = await validateProductOptions(productOptions, design.product.options);
      if (!optionsValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: optionsValidation.error,
          error: 'INVALID_PRODUCT_OPTIONS'
        });
      }
      
      design.productOptions = optionsValidation.cleaned;
    }
    
    await design.save();
    
    if (elements) {
      generateDesignPreview(design, design.product)
        .then(previewUrl => {
          if (previewUrl) {
            design.previewImage = previewUrl;
            return design.save();
          }
        })
        .catch(error => console.error('Error regenerando vista previa:', error));
    }
    
    res.status(200).json({
      success: true,
      message: "Diseño actualizado exitosamente",
      data: {
        design: {
          _id: design._id,
          name: design.name,
          status: design.status,
          updatedAt: design.updatedAt
        }
      }
    });
    
  } catch (error) {
    console.error("Error en updateDesign:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Actualizar color del producto en un diseño
 */
designController.updateProductColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { color } = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.roles?.some(r => ['admin', 'manager'].includes(r));

    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    // Validar color
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({
        success: false,
        message: 'El color debe estar en formato hexadecimal (#RRGGBB)',
        error: 'INVALID_COLOR_FORMAT'
      });
    }

    const design = await Design.findById(idValidation.cleaned);

    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }

    if (!design.user.equals(userId) && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para modificar este diseño",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    if (!['draft', 'pending'].includes(design.status)) {
      return res.status(400).json({ 
        success: false,
        message: "Solo se puede cambiar el color en diseños en borrador o pendientes",
        error: 'INVALID_DESIGN_STATUS'
      });
    }

    design.productColorFilter = color || null;
    await design.save();

    try {
      await notificationService.sendCustomNotification({
        to: design.user.email,
        subject: `🎨 Color del producto actualizado`,
        message: `Se actualizó el color del producto para tu diseño ${design.name} a ${design.productColorFilter || 'sin filtro'}`
      });
    } catch (e) {
      console.error('Error notificando cambio de color:', e);
    }

    res.status(200).json({
      success: true,
      message: "Color del producto actualizado exitosamente",
      data: {
        designId: design._id,
        productColorFilter: design.productColorFilter
      }
    });

  } catch (error) {
    console.error("Error en updateProductColor:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar color del producto",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Duplica/clona un diseño existente
 */
designController.cloneDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user._id;
    
    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    if (name) {
      const nameValidation = validators.text(name, 1, 100);
      if (!nameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: `Nombre inválido: ${nameValidation.error}`,
          error: 'INVALID_NAME'
        });
      }
    }
    
    const originalDesign = await Design.findById(idValidation.cleaned).populate('product');
    
    if (!originalDesign) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }
    
    if (!originalDesign.user.equals(userId) && !req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para clonar este diseño",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    const finalName = name || `Copia de ${originalDesign.name}`;
    const nameValidation = validators.text(finalName, 1, 100);
    if (!nameValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Nombre del clon inválido: ${nameValidation.error}`,
        error: 'INVALID_CLONE_NAME'
      });
    }
    
    const clonedDesign = new Design({
      product: originalDesign.product._id,
      user: userId,
      name: nameValidation.cleaned,
      elements: JSON.parse(JSON.stringify(originalDesign.elements)),
      productOptions: JSON.parse(JSON.stringify(originalDesign.productOptions)),
      status: 'draft',
      clientNotes: originalDesign.clientNotes || "",
      metadata: {
        ...originalDesign.metadata,
        clonedFrom: originalDesign._id,
        clonedAt: new Date()
      }
    });
    
    await clonedDesign.save();
    
    res.status(201).json({
      success: true,
      message: "Diseño clonado exitosamente",
      data: {
        originalId: originalDesign._id,
        clonedId: clonedDesign._id,
        design: clonedDesign
      }
    });
    
  } catch (error) {
    console.error("Error en cloneDesign:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al clonar el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Guarda diseño como borrador
 */
designController.saveDraft = async (req, res) => {
  try {
    const { productId, elements, productOptions, name, clientNotes } = req.body;
    const userId = req.user._id;
    
    const basicValidation = validateFields({
      productId, name, clientNotes
    }, {
      productId: (value) => validators.mongoId(value, 'ID de producto'),
      name: (value) => value ? validators.text(value, 1, 100) : { isValid: true },
      clientNotes: (value) => value ? validators.text(value, 0, 1000) : { isValid: true }
    });

    if (!basicValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: `Datos básicos inválidos: ${basicValidation.errors.join('; ')}`,
        error: 'VALIDATION_ERROR'
      });
    }
    
    const product = await Product.findById(basicValidation.cleaned.productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado",
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    if (elements && Array.isArray(elements) && elements.length > 0) {
      const validation = validateDesignElements(elements, product.customizationAreas);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false,
          message: "Elementos de diseño no válidos",
          errors: validation.errors,
          error: 'INVALID_DESIGN_ELEMENTS'
        });
      }
    }

    let validatedOptions = [];
    if (productOptions && Array.isArray(productOptions)) {
      const optionsValidation = await validateProductOptions(productOptions, product.options);
      if (!optionsValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: optionsValidation.error,
          error: 'INVALID_PRODUCT_OPTIONS'
        });
      }
      validatedOptions = optionsValidation.cleaned;
    }

    const normalizedElements = elements && elements.length > 0 
      ? normalizeDesignElements(elements, product.customizationAreas) 
      : [];

    const draft = new Design({
      product: product._id,
      user: userId,
      name: name || `Borrador - ${product.name}`,
      elements: normalizedElements,
      productOptions: validatedOptions,
      status: 'draft',
      clientNotes: clientNotes || "",
      metadata: {
        mode: 'simple',
        lastSavedAt: new Date(),
        colors: normalizedElements.length > 0 ? extractColorsFromElements(normalizedElements) : [],
        fonts: normalizedElements.length > 0 ? extractFontsFromElements(normalizedElements) : [],
        complexity: normalizedElements.length > 0 ? calculateDesignComplexity(normalizedElements) : 'low'
      }
    });
    
    await draft.save();
    
    res.status(201).json({
      success: true,
      message: "Borrador guardado",
      data: {
        draftId: draft._id,
        status: draft.status,
        name: draft.name
      }
    });
    
  } catch (error) {
    console.error("Error en saveDraft:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al guardar borrador",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtiene historial de diseños del usuario
 */
designController.getUserDesignHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { includeDetails = false, limit = 20 } = req.query;
    
    const limitValidation = validators.quantity(limit, 1, 100);
    if (!limitValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Límite inválido: ${limitValidation.error}`,
        error: 'INVALID_LIMIT'
      });
    }

    const designs = await Design.find({ user: userId })
      .populate('product', 'name images basePrice')
      .sort({ createdAt: -1 })
      .limit(limitValidation.cleaned)
      .lean();
    
    const formattedDesigns = designs.map(design => {
      if (includeDetails !== 'true') {
        return {
          _id: design._id,
          name: design.name,
          productName: design.product.name,
          productImage: design.product.images?.main,
          status: design.status,
          createdAt: design.createdAt,
          previewImage: design.previewImage,
          canReuse: ['quoted', 'approved', 'completed'].includes(design.status)
        };
      }
      return design;
    });
    
    res.status(200).json({
      success: true,
      data: {
        designs: formattedDesigns,
        total: formattedDesigns.length
      }
    });
    
  } catch (error) {
    console.error("Error en getUserDesignHistory:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener historial de diseños",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Cancela un diseño
 */
designController.cancelDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    let validatedReason = '';
    if (reason) {
      const reasonValidation = validators.text(reason, 0, 500);
      if (!reasonValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: `Razón inválida: ${reasonValidation.error}`,
          error: 'INVALID_REASON'
        });
      }
      validatedReason = reasonValidation.cleaned;
    }

    const design = await Design.findById(idValidation.cleaned).populate('user', 'name email');

    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }

    if (!design.user._id.equals(userId) && !req.user.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para cancelar este diseño",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    const cancellableStatuses = ['pending', 'quoted', 'draft'];
    if (!cancellableStatuses.includes(design.status)) {
      return res.status(400).json({
        success: false,
        message: `No se puede cancelar un diseño en estado ${design.status}`,
        error: 'INVALID_DESIGN_STATUS'
      });
    }

    design.status = 'cancelled';
    design.cancelledAt = new Date();
    design.cancellationReason = validatedReason || 'Cancelado por el usuario';

    await design.save();

    res.status(200).json({
      success: true,
      message: "Diseño cancelado exitosamente",
      data: {
        designId: design._id,
        status: design.status,
        cancelledAt: design.cancelledAt,
        cancellationReason: design.cancellationReason
      }
    });

  } catch (error) {
    console.error("Error en cancelDesign:", error);
    res.status(500).json({
      success: false,
      message: "Error al cancelar el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtiene estadísticas de diseños (admin)
 */
designController.getDesignStats = async (req, res) => {
  try {
    const adminRoles = req.user.roles || [];
    
    if (!adminRoles.includes('admin') && !adminRoles.includes('manager')) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permisos para ver estadísticas",
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const stats = await Design.aggregate([
      {
        $facet: {
          statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          monthlyDesigns: [
            { $match: { createdAt: { $gte: oneMonthAgo } } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
          ],
          popularProducts: [
            { $group: { _id: '$product', count: { $sum: 1 } } },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productInfo' } },
            { $unwind: '$productInfo' },
            { $project: { productName: '$productInfo.name', count: 1 } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ],
          revenue: [
            { $match: { status: { $in: ['approved', 'completed'] }, price: { $gt: 0 } } },
            { $group: { _id: null, totalRevenue: { $sum: '$price' }, averagePrice: { $avg: '$price' }, count: { $sum: 1 } } }
          ],
          averageQuoteTime: [
            { $match: { quotedAt: { $exists: true }, createdAt: { $exists: true } } },
            { $project: { quoteTimeHours: { $divide: [{ $subtract: ['$quotedAt', '$createdAt'] }, 1000 * 60 * 60] } } },
            { $group: { _id: null, averageHours: { $avg: '$quoteTimeHours' } } }
          ]
        }
      }
    ]);

    const result = stats[0];
    
    const formattedStats = {
      overview: {
        total: result.statusCounts.reduce((sum, item) => sum + item.count, 0),
        pending: result.statusCounts.find(s => s._id === 'pending')?.count || 0,
        quoted: result.statusCounts.find(s => s._id === 'quoted')?.count || 0,
        approved: result.statusCounts.find(s => s._id === 'approved')?.count || 0,
        rejected: result.statusCounts.find(s => s._id === 'rejected')?.count || 0,
        completed: result.statusCounts.find(s => s._id === 'completed')?.count || 0,
        drafts: result.statusCounts.find(s => s._id === 'draft')?.count || 0
      },
      revenue: {
        total: result.revenue[0]?.totalRevenue || 0,
        average: result.revenue[0]?.averagePrice || 0,
        designs: result.revenue[0]?.count || 0
      },
      performance: {
        averageQuoteTimeHours: Math.round((result.averageQuoteTime[0]?.averageHours || 0) * 10) / 10,
        conversionRate: result.statusCounts.find(s => s._id === 'quoted')?.count ? 
          Math.round((result.statusCounts.find(s => s._id === 'approved')?.count || 0) / 
          result.statusCounts.find(s => s._id === 'quoted').count * 100) : 0
      },
      trends: {
        monthly: result.monthlyDesigns,
        popularProducts: result.popularProducts
      }
    };

    res.status(200).json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error("Error en getDesignStats:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener estadísticas de diseños",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

/**
 * Cambia el estado de un diseño (admin)
 */
designController.changeDesignStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user._id;
    const adminRoles = req.user.roles || [];

    if (!adminRoles.includes('admin') && !adminRoles.includes('manager')) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permisos para cambiar estados de diseño",
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    const validStatuses = ['draft', 'pending', 'quoted', 'approved', 'rejected', 'completed', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Estados válidos: ${validStatuses.join(', ')}`,
        error: 'INVALID_STATUS'
      });
    }

    const design = await Design.findById(idValidation.cleaned)
      .populate('product', 'name')
      .populate('user', 'email name');

    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }

    const previousStatus = design.status;

    const validTransitions = {
      'draft': ['pending', 'archived'],
      'pending': ['quoted', 'rejected', 'archived'],
      'quoted': ['approved', 'rejected', 'pending'],
      'approved': ['completed', 'quoted'],
      'rejected': ['pending', 'archived'],
      'completed': ['archived'],
      'archived': ['draft', 'pending']
    };

    if (!validTransitions[previousStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `No se puede cambiar de ${previousStatus} a ${status}`,
        error: 'INVALID_STATUS_TRANSITION'
      });
    }

    design.status = status;
    design._changedBy = adminId;
    design._changedByModel = 'Employee';
    design._changeNotes = notes || `Estado cambiado por administrador de ${previousStatus} a ${status}`;

    if (status === 'quoted' && !design.quotedAt) design.quotedAt = new Date();
    if (status === 'approved' && !design.approvedAt) design.approvedAt = new Date();
    if (status === 'rejected' && !design.rejectedAt) {
      design.rejectedAt = new Date();
      if (notes) design.rejectionReason = notes;
    }
    if (status === 'completed' && !design.completedAt) design.completedAt = new Date();

    await design.save();

    try {
      await notificationService.sendCustomNotification({
        to: design.user.email,
        subject: `📦 Estado de tu diseño actualizado: ${status}`,
        isHtml: true,
        message: `
          <h2>Actualización de estado</h2>
          <p><strong>Diseño:</strong> ${design.name}</p>
          <p><strong>Anterior:</strong> ${previousStatus}</p>
          <p><strong>Nuevo:</strong> ${status}</p>
          ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
        `
      });
    } catch (notificationError) {
      console.error('Error enviando notificación de cambio de estado:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: `Estado del diseño actualizado a ${status}`,
      data: {
        design: {
          _id: design._id,
          status: design.status,
          previousStatus,
          updatedAt: design.updatedAt
        }
      }
    });

  } catch (error) {
    console.error("Error en changeDesignStatus:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al cambiar estado del diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno"
    });
  }
};

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Calcula el precio estimado de un diseño
 */
function calculateDesignPrice(design, basePrice) {
  let price = basePrice || 10;
  
  const complexityMultipliers = {
    low: 1.0,
    medium: 1.2,
    high: 1.5
  };
  
  const elementTypePrices = {
    text: 2,
    image: 5,
    shape: 3
  };
  
  const complexity = design.metadata?.complexity || 'medium';
  price *= complexityMultipliers[complexity] || 1.2;
  
  if (design.elements && Array.isArray(design.elements)) {
    design.elements.forEach(element => {
      const elementPrice = elementTypePrices[element.type] || 3;
      price += elementPrice;
    });
  }
  
  return Math.round(price * 100) / 100;
}

/**
 * Extrae colores de los elementos del diseño
 */
function extractColorsFromElements(elements) {
  if (!elements || !Array.isArray(elements)) return [];
  
  const colors = new Set();
  
  elements.forEach(el => {
    if (el.konvaAttrs) {
      if (el.konvaAttrs.fill) colors.add(el.konvaAttrs.fill);
      if (el.konvaAttrs.stroke) colors.add(el.konvaAttrs.stroke);
    }
  });
  
  return Array.from(colors);
}

/**
 * Extrae fuentes de los elementos del diseño
 */
function extractFontsFromElements(elements) {
  if (!elements || !Array.isArray(elements)) return [];
  
  const fonts = new Set();
  
  elements.forEach(el => {
    if (el.type === 'text' && el.konvaAttrs?.fontFamily) {
      fonts.add(el.konvaAttrs.fontFamily);
    }
  });
  
  return Array.from(fonts);
}

/**
 * Calcula la complejidad del diseño
 */
function calculateDesignComplexity(elements) {
  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return 'low';
  }
  
  const totalElements = elements.length;
  const imageElements = elements.filter(el => el.type === 'image').length;
  const textElements = elements.filter(el => el.type === 'text').length;
  
  let complexityScore = 0;
  complexityScore += totalElements * 1;
  complexityScore += imageElements * 2;
  complexityScore += textElements * 1;
  
  if (complexityScore <= 5) return 'low';
  if (complexityScore <= 12) return 'medium';
  return 'high';
}

/**
 * Genera preview y notifica al usuario
 */
async function generatePreviewAndNotify(design, product, userId) {
  try {
    console.log('Generando preview y notificando...');
    return true;
  } catch (error) {
    console.error('Error en generatePreviewAndNotify:', error);
    return false;
  }
}

/**
 * Genera preview y notifica para diseños admin
 */
async function generatePreviewAndNotifyAdmin(design, product, clientId, adminId) {
  try {
    console.log('Generando preview admin y notificando...');
    return true;
  } catch (error) {
    console.error('Error en generatePreviewAndNotifyAdmin:', error);
    return false;
  }
}

/**
 * Genera una vista previa del diseño
 */
async function generateDesignPreview(design, product) {
  try {
    console.log('Generando vista previa del diseño...');
    return null;
  } catch (error) {
    console.error('Error generando vista previa:', error);
    return null;
  }
}

export default designController;