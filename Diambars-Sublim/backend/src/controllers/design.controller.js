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
 * Crea un nuevo diseño personalizado
 */
designController.createDesign = async (req, res) => {
  try {
    const { productId, elements, clientNotes } = req.body;
    const userId = req.user._id; // Asumiendo autenticación JWT

    // Validar producto
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no disponible" 
      });
    }

    // Validar elementos del diseño
    const validationResult = validateDesignElements(elements, product.customizationAreas);
    if (!validationResult.isValid) {
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
      clientNotes,
      status: "pending",
      metadata: {
        colors: extractColorsFromElements(elements),
        fonts: extractFontsFromElements(elements)
      }
    });

    await newDesign.save();

    // Generar preview (simplificado)
    const previewUrl = await generateDesignPreview(newDesign, product);

    // Notificar al administrador
    await sendNotification({
      type: "NEW_DESIGN",
      designId: newDesign._id,
      productName: product.name,
      userId
    });

    res.status(201).json({
      success: true,
      message: "Diseño enviado para cotización",
      data: {
        design: newDesign,
        previewUrl
      }
    });

  } catch (error) {
    console.error("Error al crear diseño:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene los detalles de un diseño
 */
designController.getDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const design = await Design.findById(id)
      .populate('product', 'name basePrice images.main customizationAreas')
      .populate('user', 'name email');

    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado" 
      });
    }

    // Verificar permisos
    if (!design.user._id.equals(userId) && !req.user.roles.includes('admin')) {
      return res.status(403).json({ 
        success: false,
        message: "No autorizado para ver este diseño" 
      });
    }

    // Calcular precio estimado (si está pendiente)
    let priceEstimate = null;
    if (design.status === 'pending') {
      priceEstimate = calculateDesignPrice(design, design.product.basePrice);
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
    console.error("Error al obtener diseño:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el diseño",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Procesa la cotización de un diseño (admin)
 */
designController.submitQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, adminNotes, productionDays } = req.body;

    const design = await Design.findById(id)
      .populate('product', 'basePrice')
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
        message: "El diseño no está pendiente de cotización" 
      });
    }

    // Validar precio
    const calculatedPrice = calculateDesignPrice(design, design.product.basePrice);
    const minPrice = calculatedPrice * 0.8; // 20% menos
    const maxPrice = calculatedPrice * 1.2; // 20% más

    if (price < minPrice || price > maxPrice) {
      return res.status(400).json({ 
        success: false,
        message: `El precio debe estar entre $${minPrice.toFixed(2)} y $${maxPrice.toFixed(2)}`,
        suggestedPrice: calculatedPrice
      });
    }

    // Actualizar diseño
    design.price = price;
    design.adminNotes = adminNotes;
    design.productionDays = productionDays;
    design.status = 'quoted';
    design.quotedAt = new Date();
    
    await design.save();

    // Notificar al cliente
    await sendNotification({
      type: "QUOTE_SUBMITTED",
      designId: design._id,
      price,
      userEmail: design.user.email
    });

    res.status(200).json({
      success: true,
      message: "Cotización enviada al cliente",
      data: design
    });

  } catch (error) {
    console.error("Error al cotizar diseño:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al procesar la cotización",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Procesa la respuesta del cliente a la cotización
 */
designController.respondToQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { accepted, clientMessage } = req.body;
    const userId = req.user._id;

    const design = await Design.findById(id)
      .populate('product', 'name')
      .populate('user', 'email');

    if (!design) {
      return res.status(404).json({ 
        success: false,
        message: "Diseño no encontrado" 
      });
    }

    if (!design.user._id.equals(userId)) {
      return res.status(403).json({ 
        success: false,
        message: "No autorizado para responder a esta cotización" 
      });
    }

    if (design.status !== 'quoted') {
      return res.status(400).json({ 
        success: false,
        message: "El diseño no está en estado de cotizado" 
      });
    }

    // Actualizar diseño
    design.status = accepted ? 'approved' : 'rejected';
    design.clientResponse = {
      accepted,
      message: clientMessage,
      respondedAt: new Date()
    };
    
    await design.save();

    // Notificar al administrador
    await sendNotification({
      type: accepted ? "QUOTE_ACCEPTED" : "QUOTE_REJECTED",
      designId: design._id,
      productName: design.product.name,
      userEmail: design.user.email
    });

    res.status(200).json({
      success: true,
      message: `Cotización ${accepted ? 'aceptada' : 'rechazada'}`,
      data: design
    });

  } catch (error) {
    console.error("Error al responder a cotización:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al procesar la respuesta",
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