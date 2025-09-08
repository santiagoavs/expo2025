// utils/designUtils.js
import cloudinary from './cloudinary.js';

/**
 * Valida elementos de diseño contra áreas personalizables del producto
 */
export const validateDesignElements = (elements, customizationAreas) => {
  const errors = [];
  
  if (!Array.isArray(elements) || elements.length === 0) {
    return {
      isValid: false,
      errors: ['Debe proporcionar al menos un elemento de diseño']
    };
  }
  
  if (!Array.isArray(customizationAreas) || customizationAreas.length === 0) {
    return {
      isValid: false,
      errors: ['El producto no tiene áreas personalizables definidas']
    };
  }
  
  elements.forEach((element, index) => {
    // Validar estructura básica del elemento
    if (!element.type) {
      errors.push(`Elemento ${index + 1}: Tipo de elemento requerido`);
      return;
    }
    
    if (!element.areaId) {
      errors.push(`Elemento ${index + 1}: ID de área requerido`);
      return;
    }
    
    // Validar que el área existe
    const area = customizationAreas.find(a => a._id.toString() === element.areaId.toString());
    if (!area) {
      errors.push(`Elemento ${index + 1}: Área no válida`);
      return;
    }
    
    // Validar posición del elemento
    const positionValidation = validateElementPosition(element, area);
    if (!positionValidation.isValid) {
      errors.push(`Elemento ${index + 1}: ${positionValidation.error}`);
    }
    
    // Validar tipo específico de elemento
    switch (element.type) {
      case 'text':
        if (!element.content || element.content.trim() === '') {
          errors.push(`Elemento ${index + 1}: Contenido de texto requerido`);
        }
        if (!element.styles?.fontSize || element.styles.fontSize <= 0) {
          errors.push(`Elemento ${index + 1}: Tamaño de fuente inválido`);
        }
        break;
        
      case 'image':
        if (!element.source) {
          errors.push(`Elemento ${index + 1}: Fuente de imagen requerida`);
        }
        break;
        
      case 'shape':
        if (!element.shapeType) {
          errors.push(`Elemento ${index + 1}: Tipo de forma requerido`);
        }
        break;
        
      default:
        errors.push(`Elemento ${index + 1}: Tipo de elemento no soportado`);
    }
  });
  
  // Validar límites de elementos por área
  const elementsByArea = {};
  elements.forEach(element => {
    if (!elementsByArea[element.areaId]) {
      elementsByArea[element.areaId] = [];
    }
    elementsByArea[element.areaId].push(element);
  });
  
  Object.keys(elementsByArea).forEach(areaId => {
    const area = customizationAreas.find(a => a._id.toString() === areaId);
    if (area && area.maxElements && elementsByArea[areaId].length > area.maxElements) {
      errors.push(`Área "${area.name}": Máximo ${area.maxElements} elementos permitidos, se encontraron ${elementsByArea[areaId].length}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida la posición de un elemento dentro de un área
 */
export const validateElementPosition = (element, area) => {
  if (!element.position) {
    return {
      isValid: false,
      error: 'Posición del elemento requerida'
    };
  }
  
  const { x, y, width, height } = element.position;
  const areaPos = area.position;
  
  // Validar que el elemento esté dentro del área
  if (x < areaPos.x || y < areaPos.y) {
    return {
      isValid: false,
      error: 'Elemento fuera del área permitida (esquina superior izquierda)'
    };
  }
  
  if ((x + width) > (areaPos.x + areaPos.width) || 
      (y + height) > (areaPos.y + areaPos.height)) {
    return {
      isValid: false,
      error: 'Elemento fuera del área permitida (esquina inferior derecha)'
    };
  }
  
  // Validar tamaños mínimos
  if (width < 10 || height < 10) {
    return {
      isValid: false,
      error: 'Elemento demasiado pequeño (mínimo 10x10 píxeles)'
    };
  }
  
  return { isValid: true };
};

/**
 * Genera vista previa del diseño
 */
export const generateDesignPreview = async (design, product) => {
  try {
    console.log('🎨 Generando vista previa del diseño:', design._id);
    
    // Verificar que el diseño tenga elementos
    if (!design.elements || design.elements.length === 0) {
      console.warn('⚠️ Diseño sin elementos, usando imagen del producto');
      return product.images?.main || null;
    }
    
    // Generar vista previa usando Canvas API
    const previewUrl = await createDesignComposite(design, product);
    
    console.log('✅ Vista previa generada:', previewUrl);
    return previewUrl;
    
  } catch (error) {
    console.error('❌ Error generando vista previa:', error);
    return product.images?.main || null;
  }
};

/**
 * Función para crear composición de diseño usando Canvas API
 */
async function createDesignComposite(design, product) {
  try {
    // Crear canvas temporal
    const canvas = require('canvas');
    const { createCanvas, loadImage } = canvas;
    
    // Dimensiones estándar para la vista previa
    const previewWidth = 400;
    const previewHeight = 300;
    
    // Crear canvas
    const previewCanvas = createCanvas(previewWidth, previewHeight);
    const ctx = previewCanvas.getContext('2d');
    
    // Cargar imagen del producto
    let productImage;
    try {
      productImage = await loadImage(product.images?.main || product.images?.mainImage);
    } catch (error) {
      console.warn('⚠️ No se pudo cargar imagen del producto:', error.message);
      // Crear fondo blanco si no hay imagen
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, previewWidth, previewHeight);
    }
    
    // Dibujar imagen del producto si está disponible
    if (productImage) {
      // Escalar imagen para que quepa en el canvas manteniendo proporción
      const scale = Math.min(previewWidth / productImage.width, previewHeight / productImage.height);
      const scaledWidth = productImage.width * scale;
      const scaledHeight = productImage.height * scale;
      const x = (previewWidth - scaledWidth) / 2;
      const y = (previewHeight - scaledHeight) / 2;
      
      ctx.drawImage(productImage, x, y, scaledWidth, scaledHeight);
    }
    
    // Dibujar elementos del diseño
    const scaleX = previewWidth / 800; // Escalar desde 800x600 estándar
    const scaleY = previewHeight / 600;
    
    for (const element of design.elements) {
      try {
        await drawDesignElement(ctx, element, scaleX, scaleY);
      } catch (error) {
        console.warn('⚠️ Error dibujando elemento:', error.message);
      }
    }
    
    // Convertir canvas a buffer y luego a base64
    const buffer = previewCanvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');
    
    return `data:image/png;base64,${base64}`;
    
  } catch (error) {
    console.error('❌ Error en createDesignComposite:', error);
    return product.images?.main || null;
  }
}

/**
 * Dibuja un elemento de diseño en el canvas
 */
async function drawDesignElement(ctx, element, scaleX, scaleY) {
  const attrs = element.konvaAttrs || {};
  
  // Aplicar transformaciones
  ctx.save();
  
  // Posición escalada
  const x = (attrs.x || 0) * scaleX;
  const y = (attrs.y || 0) * scaleY;
  const width = (attrs.width || 100) * scaleX;
  const height = (attrs.height || 100) * scaleY;
  
  // Rotación
  if (attrs.rotation) {
    ctx.translate(x + width/2, y + height/2);
    ctx.rotate((attrs.rotation * Math.PI) / 180);
    ctx.translate(-width/2, -height/2);
  }
  
  // Opacidad
  ctx.globalAlpha = attrs.opacity || 1;
  
  // Colores
  ctx.fillStyle = attrs.fill || '#1F64BF';
  ctx.strokeStyle = attrs.stroke || '#032CA6';
  ctx.lineWidth = (attrs.strokeWidth || 2) * Math.min(scaleX, scaleY);
  
  // Dibujar según el tipo
  switch (element.type) {
    case 'text':
      drawTextElement(ctx, attrs, x, y, width, height);
      break;
    case 'image':
      await drawImageElement(ctx, attrs, x, y, width, height);
      break;
    case 'path':
      drawPathElement(ctx, attrs, x, y, width, height);
      break;
    case 'shape':
    default:
      drawShapeElement(ctx, attrs, x, y, width, height);
      break;
  }
  
  ctx.restore();
}

/**
 * Dibuja elemento de texto
 */
function drawTextElement(ctx, attrs, x, y, width, height) {
  ctx.font = `${attrs.fontSize || 24}px ${attrs.fontFamily || 'Arial'}`;
  ctx.textAlign = attrs.textAlign || 'left';
  ctx.fillStyle = attrs.fill || '#000000';
  
  const text = attrs.text || 'Texto';
  const lines = text.split('\n');
  const lineHeight = (attrs.fontSize || 24) * 1.2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + (index + 1) * lineHeight);
  });
}

/**
 * Dibuja elemento de imagen
 */
async function drawImageElement(ctx, attrs, x, y, width, height) {
  if (!attrs.image) return;
  
  try {
    const { loadImage } = require('canvas');
    const img = await loadImage(attrs.image);
    ctx.drawImage(img, x, y, width, height);
  } catch (error) {
    console.warn('⚠️ Error cargando imagen:', error.message);
  }
}

/**
 * Dibuja elemento de path (formas vectoriales)
 */
function drawPathElement(ctx, attrs, x, y, width, height) {
  if (!attrs.pathData) return;
  
  try {
    // Crear un path SVG simple (esto es una implementación básica)
    // En una implementación real, usarías una librería como fabric.js o similar
    ctx.beginPath();
    
    // Dibujar un rectángulo como placeholder para paths complejos
    ctx.rect(x, y, width, height);
    
    if (attrs.fill) {
      ctx.fill();
    }
    if (attrs.stroke) {
      ctx.stroke();
    }
  } catch (error) {
    console.warn('⚠️ Error dibujando path:', error.message);
  }
}

/**
 * Dibuja elemento de forma básica
 */
function drawShapeElement(ctx, attrs, x, y, width, height) {
  const shapeType = attrs.shapeType || 'rect';
  
  ctx.beginPath();
  
  switch (shapeType) {
    case 'circle':
      const radius = Math.min(width, height) / 2;
      ctx.arc(x + width/2, y + height/2, radius, 0, 2 * Math.PI);
      break;
    case 'triangle':
      ctx.moveTo(x + width/2, y);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      break;
    default: // rect
      ctx.rect(x, y, width, height);
      break;
  }
  
  if (attrs.fill) {
    ctx.fill();
  }
  if (attrs.stroke) {
    ctx.stroke();
  }
}

/**
 * Calcula el precio de un diseño basado en su complejidad
 */
export const calculateDesignPrice = (design, basePrice) => {
  let price = basePrice;
  
  // Factores de precio
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
  
  // Aplicar multiplicador por complejidad
  const complexity = design.metadata?.complexity || 'medium';
  price *= complexityMultipliers[complexity] || 1.2;
  
  // Agregar costo por elementos
  if (design.elements && Array.isArray(design.elements)) {
    design.elements.forEach(element => {
      const elementPrice = elementTypePrices[element.type] || 3;
      price += elementPrice;
    });
  }
  
  // Costo adicional por múltiples áreas
  const areas = new Set(design.elements?.map(el => el.areaId) || []);
  if (areas.size > 1) {
    price += (areas.size - 1) * 5; // $5 adicional por área extra
  }
  
  // Costo adicional por opciones del producto
  if (design.productOptions && Array.isArray(design.productOptions)) {
    design.productOptions.forEach(option => {
      // Aquí podrías agregar costos específicos por opciones
      if (option.name === 'size' && ['xl', 'xxl'].includes(option.value)) {
        price += 3;
      }
    });
  }
  
  // Redondear a 2 decimales
  return Math.round(price * 100) / 100;
};

/**
 * Valida que un diseño pueda ser modificado
 */
export const canModifyDesign = (design, user) => {
  // Solo se pueden modificar diseños en estado draft
  if (design.status !== 'draft') {
    return {
      canModify: false,
      reason: 'Solo se pueden modificar diseños en estado borrador'
    };
  }
  
  // Verificar propiedad
  if (!design.user.equals(user._id) && !user.roles?.includes('admin')) {
    return {
      canModify: false,
      reason: 'No tienes permiso para modificar este diseño'
    };
  }
  
  return { canModify: true };
};

/**
 * Valida que los colores del diseño sean válidos
 */
export const validateDesignColors = (elements) => {
  const errors = [];
  const colorRegex = /^#[0-9A-F]{6}$/i;
  
  elements.forEach((element, index) => {
    if (element.styles) {
      if (element.styles.fill && !colorRegex.test(element.styles.fill)) {
        errors.push(`Elemento ${index + 1}: Color de relleno inválido`);
      }
      
      if (element.styles.stroke && !colorRegex.test(element.styles.stroke)) {
        errors.push(`Elemento ${index + 1}: Color de borde inválido`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Optimiza elementos del diseño para reducir complejidad
 */
export const optimizeDesignElements = (elements) => {
  return elements.map(element => {
    const optimized = { ...element };
    
    // Optimizar elementos de texto
    if (element.type === 'text') {
      // Limitar longitud del texto
      if (optimized.content && optimized.content.length > 500) {
        optimized.content = optimized.content.substring(0, 500) + '...';
      }
      
      // Asegurar tamaño de fuente razonable
      if (optimized.styles?.fontSize) {
        optimized.styles.fontSize = Math.max(8, Math.min(72, optimized.styles.fontSize));
      }
    }
    
    // Optimizar elementos de imagen
    if (element.type === 'image') {
      // Asegurar dimensiones razonables
      if (optimized.position) {
        optimized.position.width = Math.min(500, optimized.position.width);
        optimized.position.height = Math.min(500, optimized.position.height);
      }
    }
    
    return optimized;
  });
};

/**
 * Genera metadatos del diseño
 */
export const generateDesignMetadata = (elements, product) => {
  const metadata = {
    elementCount: elements.length,
    types: [...new Set(elements.map(el => el.type))],
    colors: [],
    fonts: [],
    areas: [...new Set(elements.map(el => el.areaId))],
    complexity: 'medium',
    estimatedPrintTime: 0,
    requiredMaterials: []
  };
  
  // Extraer colores únicos
  elements.forEach(element => {
    if (element.styles) {
      if (element.styles.fill) metadata.colors.push(element.styles.fill);
      if (element.styles.stroke) metadata.colors.push(element.styles.stroke);
    }
  });
  metadata.colors = [...new Set(metadata.colors)];
  
  // Extraer fuentes únicas
  elements.forEach(element => {
    if (element.type === 'text' && element.styles?.fontFamily) {
      metadata.fonts.push(element.styles.fontFamily);
    }
  });
  metadata.fonts = [...new Set(metadata.fonts)];
  
  // Calcular complejidad
  let complexityScore = 0;
  complexityScore += elements.length * 1; // 1 punto por elemento
  complexityScore += metadata.colors.length * 0.5; // 0.5 por color
  complexityScore += metadata.areas.length * 2; // 2 puntos por área
  
  if (complexityScore <= 5) metadata.complexity = 'low';
  else if (complexityScore <= 12) metadata.complexity = 'medium';
  else metadata.complexity = 'high';
  
  // Estimar tiempo de impresión (en minutos)
  metadata.estimatedPrintTime = Math.max(15, elements.length * 5 + metadata.areas.length * 10);
  
  return metadata;
};

export default {
  validateDesignElements,
  validateElementPosition,
  generateDesignPreview,
  calculateDesignPrice,
  canModifyDesign,
  validateDesignColors,
  optimizeDesignElements,
  generateDesignMetadata
};