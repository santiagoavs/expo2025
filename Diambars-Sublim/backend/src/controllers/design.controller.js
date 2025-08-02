import Design from "../models/Design.model.js";
import Product from "../models/Product.model.js";
import { sendNotification } from "../utils/notificationService.js";
import {
  validateDesignElements,
  generateDesignPreview,
  calculateDesignPrice
} from "../utils/designUtils.js";

const designController = {};

/**
 * Crea un nuevo diseño personalizado con validación robusta
 */
designController.createDesign = async (req, res) => {
  try {
    const { productId, elements, clientNotes } = req.body;
    const userId = req.user._id;

    // Validación básica de entrada
    if (!productId || !elements || !Array.isArray(elements)) {
      console.error('Datos de entrada inválidos:', { productId, elements });
      return res.status(400).json({ 
        success: false,
        message: "Datos de diseño incompletos o inválidos"
      });
    }

    // Validar producto
    const product = await Product.findById(productId).lean();
    if (!product || !product.isActive) {
      console.error(`Producto no encontrado o inactivo: ${productId}`);
      return res.status(404).json({ 
        success: false,
        message: "Producto no disponible" 
      });
    }

    // Validar elementos del diseño
    const validationResult = validateDesignElements(elements, product.customizationAreas);
    if (!validationResult.isValid) {
      console.error('Error en validación de diseño:', {
        errors: validationResult.errors,
        elements,
        productAreas: product.customizationAreas
      });
      return res.status(400).json({ 
        success: false,
        message: "Diseño no válido",
        errors: validationResult.errors 
      });
    }

    // Crear diseño
    const newDesign = new Design({
      product: productId,
      user: userId,
      elements,
      clientNotes: clientNotes || "",
      status: "pending",
      metadata: {
        colors: extractColorsFromElements(elements),
        fonts: extractFontsFromElements(elements)
      }
    });

    await newDesign.save();
    console.log(`Nuevo diseño creado: ${newDesign._id}`);

    // Generar preview (con manejo de errores)
    let previewUrl;
    try {
      previewUrl = await generateDesignPreview(newDesign, product);
      console.log(`Preview generado para diseño ${newDesign._id}`);
    } catch (previewError) {
      console.error('Error generando preview:', previewError);
      previewUrl = null;
    }

    // Notificar al administrador (no bloqueante)
    try {
      await sendNotification({
        type: "NEW_DESIGN",
        designId: newDesign._id,
        productName: product.name,
        userId
      });
      console.log(`Notificación enviada para diseño ${newDesign._id}`);
    } catch (notificationError) {
      console.error('Error enviando notificación:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: "Diseño enviado para cotización",
      data: {
        design: newDesign,
        previewUrl
      }
    });

  } catch (error) {
    console.error("Error crítico en createDesign:", {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      success: false,
      message: "Error interno al crear el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene los detalles de un diseño con validación de permisos
 */
designController.getDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "ID de diseño inválido" 
      });
    }

    const design = await Design.findById(id)
      .populate('product', 'name basePrice images.main customizationAreas')
      .populate('user', 'name email');

    if (!design) {
      console.error(`Diseño no encontrado: ${id}`);
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado" 
      });
    }

    // Verificar permisos
    if (!design.user._id.equals(userId) && !req.user.roles.includes('admin')) {
      console.warn(`Intento de acceso no autorizado al diseño ${id} por usuario ${userId}`);
      return res.status(403).json({ 
        success: false,
        message: "No autorizado para ver este diseño" 
      });
    }

    // Calcular precio estimado (si está pendiente)
    let priceEstimate = null;
    if (design.status === 'pending') {
      try {
        priceEstimate = calculateDesignPrice(design, design.product.basePrice);
        console.log(`Precio estimado calculado para diseño ${id}: ${priceEstimate}`);
      } catch (calcError) {
        console.error('Error calculando precio:', calcError);
        priceEstimate = null;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        design,
        priceEstimate,
        konvaConfig: generateKonvaConfig(design, design.product)
      }
    });

  } catch (error) {
    console.error("Error en getDesignById:", {
      error: error.message,
      params: req.params
    });
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Procesa la cotización de un diseño con validación robusta
 */
designController.submitQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, adminNotes, productionDays } = req.body;

    // Validación básica
    if (!price || isNaN(price)) {
      return res.status(400).json({ 
        success: false,
        message: "El precio es requerido y debe ser un número" 
      });
    }

    const design = await Design.findById(id)
      .populate('product', 'basePrice')
      .populate('user', 'email name');

    if (!design) {
      console.error(`Diseño no encontrado para cotización: ${id}`);
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado" 
      });
    }

    if (design.status !== 'pending') {
      console.warn(`Intento de cotizar diseño en estado inválido: ${design.status}`);
      return res.status(400).json({ 
        success: false,
        message: "El diseño no está pendiente de cotización" 
      });
    }

    // Validar precio con tolerancia
    let calculatedPrice;
    try {
      calculatedPrice = calculateDesignPrice(design, design.product.basePrice);
      const minPrice = calculatedPrice * 0.8;
      const maxPrice = calculatedPrice * 1.2;

      console.log(`Validando cotización:`, {
        designId: design._id,
        calculatedPrice,
        proposedPrice: price,
        minPrice,
        maxPrice
      });

      if (price < minPrice || price > maxPrice) {
        return res.status(400).json({ 
          success: false,
          message: `El precio debe estar entre $${minPrice.toFixed(2)} y $${maxPrice.toFixed(2)}`,
          suggestedPrice: calculatedPrice
        });
      }
    } catch (calcError) {
      console.error('Error calculando precio de referencia:', calcError);
      return res.status(500).json({ 
        success: false,
        message: "Error al validar el precio" 
      });
    }

    // Actualizar diseño
    design.price = parseFloat(price);
    design.adminNotes = adminNotes || "";
    design.productionDays = parseInt(productionDays) || 7;
    design.status = 'quoted';
    design.quotedAt = new Date();
    
    await design.save();
    console.log(`Diseño cotizado: ${design._id} por $${design.price}`);

    // Notificar al cliente (no bloqueante)
    try {
      await sendNotification({
        type: "QUOTE_SUBMITTED",
        designId: design._id,
        price: design.price,
        userEmail: design.user.email
      });
      console.log(`Notificación de cotización enviada a ${design.user.email}`);
    } catch (notificationError) {
      console.error('Error enviando notificación:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Cotización enviada al cliente",
      data: design
    });

  } catch (error) {
    console.error("Error en submitQuote:", {
      error: error.message,
      params: req.params,
      body: req.body
    });
    res.status(500).json({ 
      success: false,
      message: "Error al procesar la cotización",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Funciones auxiliares
function extractColorsFromElements(elements) {
  const colors = new Set();
  elements.forEach(el => {
    if (el.styles?.fill) colors.add(el.styles.fill);
    if (el.styles?.stroke) colors.add(el.styles.stroke);
  });
  return Array.from(colors);
}

function extractFontsFromElements(elements) {
  const fonts = new Set();
  elements.forEach(el => {
    if (el.type === 'text' && el.styles?.fontFamily) {
      fonts.add(el.styles.fontFamily);
    }
  });
  return Array.from(fonts);
}

function generateKonvaConfig(design, product) {
  return {
    productImage: product.images.main,
    areas: product.customizationAreas.map(area => ({
      id: area._id,
      name: area.name,
      position: area.position,
      accepts: area.accepts
    })),
    elements: design.elements.map(el => ({
      ...el,
      id: el._id || Math.random().toString(36).substr(2, 9)
    }))
  };
}

export default designController;