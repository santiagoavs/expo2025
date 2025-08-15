import Design from "../models/design.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import User from "../models/users.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import { notificationService } from "../services/notification.service.js";
import { 
  validateDesignElements, 
  validateElementPosition, 
  generateDesignPreview, 
  calculateDesignPrice 
} from "../utils/designUtils.js";

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

    // Validación de entrada
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de producto inválido"
      });
    }

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Debe proporcionar al menos un elemento para el diseño"
      });
    }

    // Buscar producto y validar
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    if (!product.isActive) {
      return res.status(400).json({ 
        success: false,
        message: "El producto no está disponible actualmente" 
      });
    }

    // Validar opciones del producto
    const parsedOptions = [];
    if (productOptions && Array.isArray(productOptions)) {
      // Verificar cada opción contra las definidas en el producto
      for (const option of productOptions) {
        const productOption = product.options.find(po => po.name === option.name);
        
        if (!productOption) {
          return res.status(400).json({
            success: false,
            message: `La opción "${option.name}" no existe para este producto`
          });
        }
        
        // Verificar si el valor seleccionado es válido
        const validValue = productOption.values.find(v => v.value === option.value);
        if (!validValue) {
          return res.status(400).json({
            success: false,
            message: `El valor "${option.value}" no es válido para la opción "${option.name}"`
          });
        }
        
        parsedOptions.push({
          name: option.name,
          value: option.value
        });
      }
      
      // Verificar que todas las opciones requeridas estén presentes
      for (const reqOption of product.options.filter(o => o.required)) {
        if (!parsedOptions.find(o => o.name === reqOption.name)) {
          return res.status(400).json({
            success: false,
            message: `Debe seleccionar un valor para la opción "${reqOption.name}"`
          });
        }
      }
    } else if (product.options.some(o => o.required)) {
      // Si hay opciones requeridas pero no se proporcionaron
      return res.status(400).json({
        success: false,
        message: "Debe seleccionar las opciones requeridas del producto"
      });
    }

    // Validar elementos del diseño contra áreas personalizables
    const validation = validateDesignElements(elements, product.customizationAreas);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: "Diseño no válido",
        errors: validation.errors
      });
    }

    // Crear diseño
    const newDesign = new Design({
      product: productId,
      user: userId,
      name: `Diseño personalizado - ${product.name}`,
      elements,
      productOptions: parsedOptions,
      status: 'pending',
      clientNotes: clientNotes || "",
      metadata: {
        mode,
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    await sendNotification({
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de diseño inválido" 
      });
    }

    const design = await Design.findById(id)
      .populate('product', 'name basePrice images customizationAreas options')
      .populate('user', 'name email');

    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado" 
      });
    }

    // Verificar permisos (solo el propietario o administradores)
    if (!design.user._id.equals(userId) && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para ver este diseño" 
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Validación básica
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Debe proporcionar un precio válido mayor que cero" 
      });
    }

    if (!productionDays || isNaN(parseInt(productionDays)) || parseInt(productionDays) <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Debe proporcionar un tiempo de producción válido en días" 
      });
    }

    // Buscar diseño
    const design = await Design.findById(id)
      .populate('product', 'basePrice name')
      .populate('user', 'email name');

    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado" 
      });
    }

    if (design.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: `No se puede cotizar un diseño en estado ${design.status}` 
      });
    }

    // Actualizar diseño
    design.price = parseFloat(price);
    design.productionDays = parseInt(productionDays);
    design.adminNotes = adminNotes || "";
    design.status = 'quoted';
    design.quotedAt = new Date();
    
    await design.save();

    // Notificar al cliente
    try {
      await sendNotification({
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    if (typeof accept !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        message: "Debe especificar si acepta o rechaza la cotización (accept: true|false)" 
      });
    }

    // Buscar diseño
    const design = await Design.findById(id)
      .populate('product', 'name')
      .populate('user', 'email name');

    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado" 
      });
    }

    // Verificar que el diseño pertenezca al usuario
    if (!design.user._id.equals(userId)) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para responder a esta cotización" 
      });
    }

    if (design.status !== 'quoted') {
      return res.status(400).json({ 
        success: false,
        message: "Solo se puede responder a diseños en estado 'quoted'" 
      });
    }

    // Actualizar diseño según respuesta
    if (accept) {
      design.status = 'approved';
      design.approvedAt = new Date();
      
      // Actualizar notas del cliente si se proporcionaron
      if (clientNotes) {
        design.clientNotes = clientNotes;
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
        clientNotes: clientNotes || design.clientNotes,
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
        await sendNotification({
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
      design.rejectionReason = clientNotes || "No se especificó motivo";
      
      await design.save();
      
      // Notificar al administrador
      try {
        await sendNotification({
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    
    // Para usuarios normales, solo mostrar sus propios diseños
    const filter = isAdmin ? {} : { user: req.user._id };
    
    // Filtros adicionales
    if (status) {
      filter.status = status;
    }
    
    if (product && mongoose.Types.ObjectId.isValid(product)) {
      filter.product = product;
    }
    
    if (user && isAdmin && mongoose.Types.ObjectId.isValid(user)) {
      filter.user = user;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { clientNotes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Opciones de consulta
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    
    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de diseño inválido" 
      });
    }
    
    // Buscar diseño
    const design = await Design.findById(id).populate('product');
    
    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado" 
      });
    }
    
    // Verificar propiedad
    if (!design.user.equals(userId) && !req.user.roles.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        message: "No tienes permiso para modificar este diseño" 
      });
    }
    
    // Solo se pueden modificar diseños en estado draft
    if (design.status !== 'draft') {
      return res.status(400).json({ 
        success: false,
        message: "Solo se pueden modificar diseños en estado borrador" 
      });
    }
    
    // Validar elementos si se proporcionan
    if (elements) {
      const validation = validateDesignElements(elements, design.product.customizationAreas);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false,
          message: "Elementos de diseño no válidos",
          errors: validation.errors
        });
      }
      
      design.elements = elements;
      design.metadata.colors = extractColorsFromElements(elements);
      design.metadata.fonts = extractFontsFromElements(elements);
      design.metadata.complexity = calculateDesignComplexity(elements);
    }
    
    // Actualizar opciones si se proporcionan
    if (productOptions) {
      // Validar opciones
      const parsedOptions = [];
      
      for (const option of productOptions) {
        const productOption = design.product.options.find(po => po.name === option.name);
        
        if (!productOption) {
          return res.status(400).json({
            success: false,
            message: `La opción "${option.name}" no existe para este producto`
          });
        }
        
        const validValue = productOption.values.find(v => v.value === option.value);
        if (!validValue) {
          return res.status(400).json({
            success: false,
            message: `El valor "${option.value}" no es válido para la opción "${option.name}"`
          });
        }
        
        parsedOptions.push({
          name: option.name,
          value: option.value
        });
      }
      
      // Verificar opciones requeridas
      for (const reqOption of design.product.options.filter(o => o.required)) {
        if (!parsedOptions.find(o => o.name === reqOption.name)) {
          return res.status(400).json({
            success: false,
            message: `Debe seleccionar un valor para la opción "${reqOption.name}"`
          });
        }
      }
      
      design.productOptions = parsedOptions;
    }
    
    // Actualizar otros campos
    if (name) design.name = name;
    if (clientNotes !== undefined) design.clientNotes = clientNotes;
    
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de diseño inválido",
        error: 'INVALID_DESIGN_ID'
      });
    }
    
    const originalDesign = await Design.findById(id)
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
    
    // Crear clon
    const clonedData = {
      product: originalDesign.product._id,
      user: userId,
      name: name || `Copia de ${originalDesign.name}`,
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
    
    // Validaciones básicas
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de producto inválido",
        error: 'INVALID_PRODUCT_ID'
      });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado",
        error: 'PRODUCT_NOT_FOUND'
      });
    }
    
    // Crear diseño en estado draft
    const draft = new Design({
      product: productId,
      user: userId,
      name: name || `Borrador - ${product.name}`,
      elements: elements || [],
      productOptions: productOptions || [],
      status: 'draft',
      clientNotes: clientNotes || "",
      metadata: {
        mode: 'simple',
        lastSavedAt: new Date()
      }
    });
    
    await draft.save();
    
    res.status(201).json({
      success: true,
      message: "Borrador guardado",
      data: {
        draftId: draft._id,
        status: draft.status
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
    const { includeDetails = false } = req.query;
    
    const designs = await Design.find({ user: userId })
      .populate('product', 'name images basePrice')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    // Si no se piden detalles, enviar versión resumida
    const formattedDesigns = designs.map(design => {
      if (!includeDetails) {
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

// Funciones auxiliares
function extractColorsFromElements(elements) {
  if (!elements || !Array.isArray(elements)) return [];
  
  const colors = new Set();
  
  elements.forEach(el => {
    if (el.styles) {
      if (el.styles.fill) colors.add(el.styles.fill);
      if (el.styles.stroke) colors.add(el.styles.stroke);
    }
  });
  
  return Array.from(colors);
}

function extractFontsFromElements(elements) {
  if (!elements || !Array.isArray(elements)) return [];
  
  const fonts = new Set();
  
  elements.forEach(el => {
    if (el.type === 'text' && el.styles?.fontFamily) {
      fonts.add(el.styles.fontFamily);
    }
  });
  
  return Array.from(fonts);
}

function calculateDesignComplexity(elements) {
  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return 'low';
  }
  
  // Criterios para determinar complejidad
  const totalElements = elements.length;
  const imageElements = elements.filter(el => el.type === 'image').length;
  const textElements = elements.filter(el => el.type === 'text').length;
  const uniqueAreas = new Set(elements.map(el => el.areaId)).size;
  
  // Puntuación de complejidad
  let complexityScore = 0;
  complexityScore += totalElements * 1;
  complexityScore += imageElements * 1.5;
  complexityScore += textElements * 0.8;
  complexityScore += uniqueAreas * 2;
  
  // Determinar nivel de complejidad
  if (complexityScore <= 5) return 'low';
  if (complexityScore <= 12) return 'medium';
  return 'high';
}

export default designController;