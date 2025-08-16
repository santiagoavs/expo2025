import Design from "../models/design.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import User from "../models/users.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import { notificationService } from "../services/notification.service.js";
import { validateDesignElements, validateElementPosition, calculateDesignPrice } from "../utils/productUtils.js";
import { validators, validateFields } from "../utils/validators.utils.js";
import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';

const designController = {};

/**
 * Crea un nuevo diseño personalizado
 */
designController.createDesign = async (req, res) => {
  try {
    const { 
      productId, 
      elements, 
      productOptions,
      clientNotes,
      mode = 'simple'
    } = req.body;
    const userId = req.user._id;

    console.log('🎨 Creando diseño:', { productId, elementsCount: elements?.length });

    // Validación de entrada usando validadores centralizados
    const basicValidation = validateFields({
      productId,
      clientNotes,
      mode
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

    // Validar elementos
    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Debe proporcionar al menos un elemento para el diseño",
        error: 'ELEMENTS_REQUIRED'
      });
    }

    // Validar modo
    const validModes = ['simple', 'advanced', 'professional'];
    if (!validModes.includes(basicValidation.cleaned.mode)) {
      return res.status(400).json({
        success: false,
        message: `Modo inválido. Modos válidos: ${validModes.join(', ')}`,
        error: 'INVALID_MODE'
      });
    }

    // Buscar producto y validar
    const product = await Product.findById(basicValidation.cleaned.productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado",
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({ 
        success: false,
        message: "El producto no está disponible actualmente",
        error: 'PRODUCT_INACTIVE'
      });
    }

    // Validar elementos del diseño contra áreas personalizables
    const validation = validateDesignElements(elements, product.customizationAreas);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: "Diseño no válido",
        errors: validation.errors,
        error: 'INVALID_DESIGN_ELEMENTS'
      });
    }

    // Validar opciones del producto
    const parsedOptions = [];
    if (productOptions && Array.isArray(productOptions)) {
      const optionsValidation = await validateProductOptions(productOptions, product.options);
      if (!optionsValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: optionsValidation.error,
          error: 'INVALID_PRODUCT_OPTIONS'
        });
      }
      parsedOptions.push(...optionsValidation.cleaned);
    } else if (product.options.some(o => o.required)) {
      return res.status(400).json({
        success: false,
        message: "Debe seleccionar las opciones requeridas del producto",
        error: 'REQUIRED_OPTIONS_MISSING'
      });
    }

    // Crear diseño
    const newDesign = new Design({
      product: basicValidation.cleaned.productId,
      user: userId,
      name: `Diseño personalizado - ${product.name}`,
      elements,
      productOptions: parsedOptions,
      status: 'pending',
      clientNotes: basicValidation.cleaned.clientNotes || "",
      metadata: {
        mode: basicValidation.cleaned.mode,
        colors: extractColorsFromElements(elements),
        fonts: extractFontsFromElements(elements),
        complexity: calculateDesignComplexity(elements)
      }
    });

    await newDesign.save();
    
    // Generar vista previa (sin bloquear la respuesta)
    generatePreviewAndNotify(newDesign, product, userId).catch(error => {
      console.error('Error en procesamiento asíncrono:', error);
    });

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
 * Procesa la generación de preview y notificaciones en segundo plano
 */
async function generatePreviewAndNotify(design, product, userId) {
  try {
    // Generar y guardar vista previa
    const previewUrl = await generateDesignPreview(design, product);
    if (previewUrl) {
      design.previewImage = previewUrl;
      await design.save();
    }
    
    // Notificar a administradores
    await notificationService.sendNotification({
      type: "NEW_DESIGN_REQUEST",
      data: {
        designId: design._id,
        productName: product.name,
        userId
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error en generatePreviewAndNotify:', error);
    return false;
  }
}

/**
 * Obtiene un diseño específico con su información relacionada
 */
designController.getDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRoles = req.user.roles || [];
    const isAdmin = userRoles.includes('admin') || userRoles.includes('manager');

    // Validar ID usando validador centralizado
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

    // Verificar permisos (solo el propietario o administradores)
    if (!design.user._id.equals(userId) && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para ver este diseño",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    // Buscar si hay un pedido asociado a este diseño
    const order = await Order.findOne({ 'items.design': design._id })
      .select('orderNumber status estimatedReadyDate')
      .lean();

    // Preparar respuesta
    const response = {
      success: true,
      data: {
        design,
        konvaConfig: {
          productImage: design.product.images.main,
          areas: design.product.customizationAreas.map(area => ({
            id: area._id,
            name: area.name,
            displayName: area.displayName,
            position: area.position,
            accepts: area.accepts
          })),
          elements: design.elements.map(el => ({
            ...el,
            id: el._id || `elem-${Math.random().toString(36).substring(2, 9)}`
          }))
        }
      }
    };

    // Añadir información de pedido si existe
    if (order) {
      response.data.order = {
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedReadyDate: order.estimatedReadyDate
      };
    }

    // Si el diseño está pendiente, calcular precio estimado (solo para admins)
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
 * Submite una cotización para un diseño pendiente (admin)
 */
designController.submitQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, productionDays, adminNotes } = req.body;
    const adminId = req.user._id;

    // Validar ID del diseño
    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    // Validar datos de cotización usando validadores centralizados
    const quoteValidation = validateFields({
      price,
      productionDays,
      adminNotes
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

    // Buscar diseño
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

    // Actualizar diseño con datos validados
    const { price: validPrice, productionDays: validDays, adminNotes: validNotes } = quoteValidation.cleaned;
    
    design.price = validPrice;
    design.productionDays = validDays;
    design.adminNotes = validNotes || "";
    design.status = 'quoted';
    design.quotedAt = new Date();
    
    await design.save();

    // Notificar al cliente
    try {
      await notificationService.sendNotification({
        type: "DESIGN_QUOTED",
        data: {
          designId: design._id,
          price: design.price,
          productionDays: design.productionDays,
          userEmail: design.user.email,
          userName: design.user.name,
          productName: design.product.name
        }
      });
    } catch (notificationError) {
      console.error('Error enviando notificación:', notificationError);
      // No bloquear la respuesta por error en notificación
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

    // Validar ID del diseño
    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    // Validar respuesta
    if (typeof accept !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        message: "Debe especificar si acepta o rechaza la cotización (accept: true|false)",
        error: 'INVALID_ACCEPT_VALUE'
      });
    }

    // Validar notas del cliente si se proporcionan
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

    // Buscar diseño
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

    // Verificar que el diseño pertenezca al usuario
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

    // Actualizar diseño según respuesta
    if (accept) {
      design.status = 'approved';
      design.approvedAt = new Date();
      
      // Actualizar notas del cliente si se proporcionaron
      if (clientNotes) {
        const notesValidation = validators.text(clientNotes, 0, 1000);
        if (notesValidation.isValid) {
          design.clientNotes = notesValidation.cleaned;
        }
      }
      
      await design.save();
      
      // Crear pedido automáticamente
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
      
      // Notificar al administrador
      try {
        await notificationService.sendNotification({
          type: "QUOTE_ACCEPTED",
          data: {
            designId: design._id,
            orderId: newOrder._id,
            orderNumber: newOrder.orderNumber,
            userName: design.user.name,
            productName: design.product.name
          }
        });
      } catch (notificationError) {
        console.error('Error enviando notificación:', notificationError);
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
      // Rechazar cotización
      design.status = 'rejected';
      design.rejectedAt = new Date();
      
      if (clientNotes) {
        const notesValidation = validators.text(clientNotes, 0, 1000);
        design.rejectionReason = notesValidation.isValid ? notesValidation.cleaned : "Motivo no especificado";
      } else {
        design.rejectionReason = "No se especificó motivo";
      }
      
      await design.save();
      
      // Notificar al administrador
      try {
        await notificationService.sendNotification({
          type: "QUOTE_REJECTED",
          data: {
            designId: design._id,
            userName: design.user.name,
            productName: design.product.name,
            reason: design.rejectionReason
          }
        });
      } catch (notificationError) {
        console.error('Error enviando notificación:', notificationError);
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
 * Lista todos los diseños con filtrado avanzado (admin)
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
    
    const isAdmin = req.user.roles.some(role => ['admin', 'manager'].includes(role));
    
    // Validar parámetros de consulta usando validadores centralizados
    const queryValidation = validateFields({
      page,
      limit,
      product,
      user,
      search
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

    // Validar estado si se proporciona
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

    // Validar ordenamiento
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
    
    // Para usuarios normales, solo mostrar sus propios diseños
    const filter = isAdmin ? {} : { user: req.user._id };
    
    // Filtros adicionales
    if (status) {
      filter.status = status;
    }
    
    if (queryValidation.cleaned.product) {
      filter.product = queryValidation.cleaned.product;
    }
    
    if (queryValidation.cleaned.user && isAdmin) {
      filter.user = queryValidation.cleaned.user;
    }
    
    if (queryValidation.cleaned.search) {
      filter.$or = [
        { name: { $regex: queryValidation.cleaned.search, $options: 'i' } },
        { clientNotes: { $regex: queryValidation.cleaned.search, $options: 'i' } }
      ];
    }
    
    // Opciones de consulta
    const options = {
      page: queryValidation.cleaned.page,
      limit: queryValidation.cleaned.limit,
      sort: { [sort]: order === 'asc' ? 1 : -1 },
      populate: [
        { path: 'product', select: 'name images' },
        { path: 'user', select: 'name email' }
      ],
      lean: true
    };
    
    // Ejecutar consulta paginada
    const result = await Design.paginate(filter, options);
    
    // Transformar resultado
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
    
    // Validar ID del diseño
    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }
    
    // Buscar diseño
    const design = await Design.findById(idValidation.cleaned).populate('product');
    
    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }
    
    // Verificar propiedad
    if (!design.user.equals(userId) && !req.user.roles.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para modificar este diseño",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }
    
    // Solo se pueden modificar diseños en estado draft
    if (design.status !== 'draft') {
      return res.status(400).json({ 
        success: false,
        message: "Solo se pueden modificar diseños en estado borrador",
        error: 'INVALID_DESIGN_STATUS'
      });
    }

    // Validar campos opcionales si se proporcionan
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

      // Actualizar campos validados
      if (fieldsValidation.cleaned.name) design.name = fieldsValidation.cleaned.name;
      if (fieldsValidation.cleaned.clientNotes !== undefined) design.clientNotes = fieldsValidation.cleaned.clientNotes;
    }
    
    // Validar elementos si se proporcionan
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
      
      design.elements = elements;
      design.metadata.colors = extractColorsFromElements(elements);
      design.metadata.fonts = extractFontsFromElements(elements);
      design.metadata.complexity = calculateDesignComplexity(elements);
    }
    
    // Actualizar opciones si se proporcionan
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
    
    // Guardar cambios
    await design.save();
    
    // Regenerar vista previa en segundo plano
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
 * Duplica/clona un diseño existente
 */
designController.cloneDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user._id;
    
    console.log('📋 Clonando diseño:', { designId: id, userId });
    
    // Validar ID del diseño
    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    // Validar nombre si se proporciona
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
    
    const originalDesign = await Design.findById(idValidation.cleaned)
      .populate('product');
    
    if (!originalDesign) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }
    
    // Verificar permisos
    if (!originalDesign.user.equals(userId) && !req.user.roles?.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para clonar este diseño",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    // Validar nombre final
    const nameValidation = validators.text(name || `Copia de ${originalDesign.name}`, 1, 100);
    if (!nameValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Nombre del clon inválido: ${nameValidation.error}`,
        error: 'INVALID_CLONE_NAME'
      });
    }
    
    // Crear clon
    const clonedData = {
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
    };
    
    const clonedDesign = new Design(clonedData);
    await clonedDesign.save();
    
    console.log('✅ Diseño clonado:', clonedDesign._id);
    
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
    console.error("❌ Error en cloneDesign:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al clonar el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Guarda diseño como borrador para editar después
 */
designController.saveDraft = async (req, res) => {
  try {
    const { 
      productId, 
      elements,
      productOptions,
      name,
      clientNotes 
    } = req.body;
    const userId = req.user._id;
    
    console.log('💾 Guardando borrador de diseño');
    
    // Validar datos básicos usando validadores centralizados
    const basicValidation = validateFields({
      productId,
      name,
      clientNotes
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

    // Validar elementos si se proporcionan
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

    // Validar opciones del producto si se proporcionan
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

    // Generar nombre por defecto si no se proporciona
    const finalName = basicValidation.cleaned.name || `Borrador - ${product.name}`;
    
    // Crear diseño en estado draft
    const draft = new Design({
      product: basicValidation.cleaned.productId,
      user: userId,
      name: finalName,
      elements: elements || [],
      productOptions: validatedOptions,
      status: 'draft',
      clientNotes: basicValidation.cleaned.clientNotes || "",
      metadata: {
        mode: 'simple',
        lastSavedAt: new Date(),
        colors: elements ? extractColorsFromElements(elements) : [],
        fonts: elements ? extractFontsFromElements(elements) : [],
        complexity: elements ? calculateDesignComplexity(elements) : 'low'
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
    console.error("❌ Error en saveDraft:", error);
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
    
    // Validar parámetros
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
    
    // Si no se piden detalles, enviar versión resumida
    const formattedDesigns = designs.map(design => {
      if (includeDetails !== 'true') {
        return {
          _id: design._id,
          name: design.name,
          productName: design.product.name,
          productImage: design.product.images.main,
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
    console.error("❌ Error en getUserDesignHistory:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener historial de diseños",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Cancela un diseño (solo en estados específicos)
 */
designController.cancelDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    // Validar ID del diseño
    const idValidation = validators.mongoId(id, 'ID de diseño');
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: idValidation.error,
        error: 'INVALID_DESIGN_ID'
      });
    }

    // Validar razón si se proporciona
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

    const design = await Design.findById(idValidation.cleaned)
      .populate('user', 'name email');

    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }

    // Verificar permisos
    if (!design.user._id.equals(userId) && !req.user.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para cancelar este diseño",
        error: 'UNAUTHORIZED_ACCESS'
      });
    }

    // Verificar que el diseño se pueda cancelar
    const cancellableStatuses = ['pending', 'quoted', 'draft'];
    if (!cancellableStatuses.includes(design.status)) {
      return res.status(400).json({
        success: false,
        message: `No se puede cancelar un diseño en estado ${design.status}`,
        error: 'INVALID_DESIGN_STATUS'
      });
    }

    // Cancelar diseño
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
    console.error("❌ Error en cancelDesign:", error);
    res.status(500).json({
      success: false,
      message: "Error al cancelar el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Valida opciones del producto
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
    // Validar estructura de la opción
    const optionValidation = validateFields(option, {
      name: (value) => validators.text(value, 1, 50),
      value: (value) => validators.text(value, 1, 50)
    });

    if (!optionValidation.isValid) {
      errors.push(`Opción inválida: ${optionValidation.errors.join('; ')}`);
      continue;
    }

    const { name: optionName, value: optionValue } = optionValidation.cleaned;

    // Verificar que la opción exista en el producto
    const productOption = availableOptions.find(po => po.name === optionName);
    if (!productOption) {
      errors.push(`La opción "${optionName}" no existe para este producto`);
      continue;
    }

    // Verificar que el valor sea válido
    const validValue = productOption.values.find(v => v.value === optionValue);
    if (!validValue) {
      errors.push(`El valor "${optionValue}" no es válido para la opción "${optionName}"`);
      continue;
    }

    cleaned.push({
      name: optionName,
      value: optionValue
    });
  }

  // Verificar opciones requeridas
  for (const reqOption of availableOptions.filter(o => o.required)) {
    if (!cleaned.find(o => o.name === reqOption.name)) {
      errors.push(`Debe seleccionar un valor para la opción requerida "${reqOption.name}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join('; ') : null,
    cleaned
  };
}

/**
 * Genera vista previa del diseño usando Canvas
 */
async function generateDesignPreview(design, product) {
  try {
    console.log('🖼️ Generando vista previa para diseño:', design._id);

    // Configuración del canvas
    const canvasWidth = 800;
    const canvasHeight = 600;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Cargar imagen del producto si existe
    if (product.images?.main) {
      try {
        // Validar URL de imagen
        const imageUrlValidation = validators.text(product.images.main, 1, 500);
        if (imageUrlValidation.isValid) {
          let productImage;
          
          // Si es una URL completa, cargarla directamente
          if (product.images.main.startsWith('http')) {
            productImage = await loadImage(product.images.main);
          } else {
            // Si es una ruta local, construir la ruta completa
            const imagePath = path.join(process.cwd(), 'public', product.images.main);
            if (fs.existsSync(imagePath)) {
              productImage = await loadImage(imagePath);
            }
          }

          if (productImage) {
            // Escalar imagen para que quepa en el canvas manteniendo proporción
            const scale = Math.min(canvasWidth / productImage.width, canvasHeight / productImage.height) * 0.8;
            const scaledWidth = productImage.width * scale;
            const scaledHeight = productImage.height * scale;
            const x = (canvasWidth - scaledWidth) / 2;
            const y = (canvasHeight - scaledHeight) / 2;

            ctx.drawImage(productImage, x, y, scaledWidth, scaledHeight);
          }
        }
      } catch (imageError) {
        console.warn('⚠️ Error cargando imagen del producto:', imageError.message);
        // Continuar sin la imagen del producto
      }
    }

    // Dibujar elementos del diseño
    if (design.elements && Array.isArray(design.elements)) {
      for (const element of design.elements) {
        await drawElement(ctx, element, canvasWidth, canvasHeight);
      }
    }

    // Agregar marca de agua sutil
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Vista Previa', canvasWidth / 2, canvasHeight - 30);
    ctx.restore();

    // Convertir canvas a buffer
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });

    // Subir a Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'design-previews',
          format: 'jpg',
          transformation: [
            { width: 400, height: 300, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    console.log('✅ Vista previa generada:', uploadResult.secure_url);
    return uploadResult.secure_url;

  } catch (error) {
    console.error('❌ Error generando vista previa:', error);
    return null;
  }
}

/**
 * Dibuja un elemento individual en el canvas
 */
async function drawElement(ctx, element, canvasWidth, canvasHeight) {
  try {
    const { type, position, styles } = element;

    if (!position || !position.x || !position.y) {
      console.warn('⚠️ Elemento sin posición válida:', element);
      return;
    }

    // Normalizar posición al tamaño del canvas
    const x = (position.x / 100) * canvasWidth;
    const y = (position.y / 100) * canvasHeight;
    const width = position.width ? (position.width / 100) * canvasWidth : 100;
    const height = position.height ? (position.height / 100) * canvasHeight : 100;

    ctx.save();

    switch (type) {
      case 'text':
        await drawTextElement(ctx, element, x, y, width, height);
        break;
      case 'image':
        await drawImageElement(ctx, element, x, y, width, height);
        break;
      case 'shape':
        await drawShapeElement(ctx, element, x, y, width, height);
        break;
      default:
        console.warn('⚠️ Tipo de elemento desconocido:', type);
    }

    ctx.restore();
  } catch (error) {
    console.error('❌ Error dibujando elemento:', error);
  }
}

/**
 * Dibuja elemento de texto
 */
async function drawTextElement(ctx, element, x, y, width, height) {
  const { content, styles = {} } = element;
  
  if (!content) return;

  // Validar contenido del texto
  const contentValidation = validators.text(content, 1, 500);
  if (!contentValidation.isValid) return;

  // Configurar estilo del texto
  const fontSize = Math.max(12, Math.min(72, styles.fontSize || 24));
  const fontFamily = styles.fontFamily || 'Arial';
  const color = styles.fill || styles.color || '#000000';
  const textAlign = styles.textAlign || 'left';

  // Validar color
  const colorValidation = validators.color(color);
  const finalColor = colorValidation.isValid ? colorValidation.cleaned : '#000000';

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = finalColor;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';

  // Dibujar texto con ajuste automático
  const words = contentValidation.cleaned.split(' ');
  let line = '';
  let lineHeight = fontSize * 1.2;
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > width && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
      
      // Evitar que el texto se salga del área
      if (currentY + lineHeight > y + height) break;
    } else {
      line = testLine;
    }
  }
  
  // Dibujar la última línea
  if (line.trim() && currentY + lineHeight <= y + height) {
    ctx.fillText(line, x, currentY);
  }

  // Agregar borde si se especifica
  if (styles.stroke && styles.strokeWidth) {
    const strokeColorValidation = validators.color(styles.stroke);
    if (strokeColorValidation.isValid) {
      ctx.strokeStyle = strokeColorValidation.cleaned;
      ctx.lineWidth = Math.max(1, Math.min(10, styles.strokeWidth));
      ctx.strokeText(contentValidation.cleaned, x, y);
    }
  }
}

/**
 * Dibuja elemento de imagen
 */
async function drawImageElement(ctx, element, x, y, width, height) {
  const { src, styles = {} } = element;
  
  if (!src) return;

  // Validar URL de imagen
  const srcValidation = validators.text(src, 1, 500);
  if (!srcValidation.isValid) return;

  try {
    let image;
    
    // Cargar imagen desde URL o archivo local
    if (src.startsWith('http')) {
      image = await loadImage(src);
    } else {
      const imagePath = path.join(process.cwd(), 'public', src);
      if (fs.existsSync(imagePath)) {
        image = await loadImage(imagePath);
      } else {
        console.warn('⚠️ Imagen no encontrada:', imagePath);
        return;
      }
    }

    // Aplicar opacidad si se especifica
    if (styles.opacity && styles.opacity < 1) {
      ctx.globalAlpha = Math.max(0.1, Math.min(1, styles.opacity));
    }

    // Dibujar imagen escalada
    ctx.drawImage(image, x, y, width, height);

    // Agregar borde si se especifica
    if (styles.stroke && styles.strokeWidth) {
      const strokeColorValidation = validators.color(styles.stroke);
      if (strokeColorValidation.isValid) {
        ctx.strokeStyle = strokeColorValidation.cleaned;
        ctx.lineWidth = Math.max(1, Math.min(10, styles.strokeWidth));
        ctx.strokeRect(x, y, width, height);
      }
    }

  } catch (imageError) {
    console.warn('⚠️ Error cargando imagen del elemento:', imageError.message);
    
    // Dibujar placeholder en caso de error
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Texto indicativo
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Imagen', x + width/2, y + height/2);
  }
}

/**
 * Dibuja elemento de forma geométrica
 */
async function drawShapeElement(ctx, element, x, y, width, height) {
  const { shapeType = 'rectangle', styles = {} } = element;
  
  const fillColor = styles.fill || '#cccccc';
  const strokeColor = styles.stroke || '#000000';
  const strokeWidth = Math.max(0, Math.min(10, styles.strokeWidth || 1));

  // Validar colores
  const fillValidation = validators.color(fillColor);
  const strokeValidation = validators.color(strokeColor);

  const finalFillColor = fillValidation.isValid ? fillValidation.cleaned : '#cccccc';
  const finalStrokeColor = strokeValidation.isValid ? strokeValidation.cleaned : '#000000';

  ctx.fillStyle = finalFillColor;
  ctx.strokeStyle = finalStrokeColor;
  ctx.lineWidth = strokeWidth;

  switch (shapeType) {
    case 'rectangle':
      ctx.fillRect(x, y, width, height);
      if (strokeWidth > 0) ctx.strokeRect(x, y, width, height);
      break;
      
    case 'circle':
    case 'ellipse':
      ctx.beginPath();
      ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, 2 * Math.PI);
      ctx.fill();
      if (strokeWidth > 0) ctx.stroke();
      break;
      
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(x + width/2, y);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      ctx.fill();
      if (strokeWidth > 0) ctx.stroke();
      break;
      
    default:
      // Forma por defecto: rectángulo
      ctx.fillRect(x, y, width, height);
      if (strokeWidth > 0) ctx.strokeRect(x, y, width, height);
  }
}

/**
 * Extrae colores de los elementos del diseño
 */
function extractColorsFromElements(elements) {
  if (!elements || !Array.isArray(elements)) return [];
  
  const colors = new Set();
  
  elements.forEach(el => {
    if (el.styles) {
      if (el.styles.fill) {
        const colorValidation = validators.color(el.styles.fill);
        if (colorValidation.isValid) colors.add(colorValidation.cleaned);
      }
      if (el.styles.stroke) {
        const colorValidation = validators.color(el.styles.stroke);
        if (colorValidation.isValid) colors.add(colorValidation.cleaned);
      }
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
    if (el.type === 'text' && el.styles?.fontFamily) {
      const fontValidation = validators.text(el.styles.fontFamily, 1, 50);
      if (fontValidation.isValid) {
        fonts.add(fontValidation.cleaned);
      }
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
  
  // Criterios para determinar complejidad
  const totalElements = elements.length;
  const imageElements = elements.filter(el => el.type === 'image').length;
  const textElements = elements.filter(el => el.type === 'text').length;
  const shapeElements = elements.filter(el => el.type === 'shape').length;
  const uniqueAreas = new Set(elements.map(el => el.areaId)).size;
  
  // Puntuación de complejidad
  let complexityScore = 0;
  complexityScore += totalElements * 1;
  complexityScore += imageElements * 2; // Las imágenes son más complejas
  complexityScore += textElements * 1;
  complexityScore += shapeElements * 0.5;
  complexityScore += uniqueAreas * 2; // Múltiples áreas aumentan complejidad
  
  // Factores adicionales de complejidad
  const hasCustomFonts = elements.some(el => 
    el.type === 'text' && 
    el.styles?.fontFamily && 
    !['Arial', 'Helvetica', 'Times New Roman', 'serif', 'sans-serif'].includes(el.styles.fontFamily)
  );
  if (hasCustomFonts) complexityScore += 2;
  
  const hasEffects = elements.some(el => 
    el.styles && (el.styles.opacity !== undefined || el.styles.rotation || el.styles.shadow)
  );
  if (hasEffects) complexityScore += 1.5;
  
  // Determinar nivel de complejidad
  if (complexityScore <= 5) return 'low';
  if (complexityScore <= 12) return 'medium';
  return 'high';
}

export default designController;