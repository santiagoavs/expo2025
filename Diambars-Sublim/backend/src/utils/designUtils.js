/**
 * Utilidades para manejar diseños
 */
import mongoose from 'mongoose';
import cloudinary from './cloudinary.js';

/**
 * Valida elementos de un diseño contra las áreas de un producto
 * @param {Array} elements - Elementos del diseño
 * @param {Array} areas - Áreas personalizables del producto
 * @returns {Object} - Resultado de validación
 */
export const validateDesignElements = (elements, areas) => {
  if (!Array.isArray(elements) || elements.length === 0) {
    return {
      isValid: false,
      errors: ['Debe proporcionar al menos un elemento para el diseño']
    };
  }
  
  if (!Array.isArray(areas) || areas.length === 0) {
    return {
      isValid: false,
      errors: ['El producto no tiene áreas personalizables definidas']
    };
  }
  
  const errors = [];
  
  // Validar cada elemento
  elements.forEach((element, index) => {
    // Validar tipo
    if (!element.type || !['text', 'image'].includes(element.type)) {
      errors.push(`Elemento ${index + 1}: Tipo inválido (debe ser "text" o "image")`);
      return;
    }
    
    // Validar contenido
    if (!element.content) {
      errors.push(`Elemento ${index + 1}: Falta el contenido`);
      return;
    }
    
    // Validar área
    if (!element.areaId || !mongoose.Types.ObjectId.isValid(element.areaId)) {
      errors.push(`Elemento ${index + 1}: ID de área inválido`);
      return;
    }
    
    // Encontrar área correspondiente
    const area = areas.find(a => a._id.toString() === element.areaId.toString());
    
    if (!area) {
      errors.push(`Elemento ${index + 1}: El área especificada no existe`);
      return;
    }
    
    // Verificar que el tipo de elemento sea aceptado en el área
    if (element.type === 'text' && !area.accepts.text) {
      errors.push(`Elemento ${index + 1}: El área "${area.name}" no acepta elementos de texto`);
      return;
    }
    
    if (element.type === 'image' && !area.accepts.image) {
      errors.push(`Elemento ${index + 1}: El área "${area.name}" no acepta elementos de imagen`);
      return;
    }
    
    // Validar posición
    if (!element.position || !element.position.x || !element.position.y) {
      errors.push(`Elemento ${index + 1}: La posición es requerida (x, y)`);
      return;
    }
    
    // Validar posición dentro del área
    const positionError = validateElementPosition(element, area);
    if (positionError) {
      errors.push(`Elemento ${index + 1}: ${positionError}`);
    }
  });
  
  // Validar límites por área
  const elementsByArea = {};
  elements.forEach(element => {
    const areaId = element.areaId.toString();
    elementsByArea[areaId] = (elementsByArea[areaId] || 0) + 1;
  });
  
  areas.forEach(area => {
    const areaId = area._id.toString();
    const elementCount = elementsByArea[areaId] || 0;
    const maxElements = area.maxElements || 10;
    
    if (elementCount > maxElements) {
      errors.push(`Área "${area.name}": Excede el máximo de ${maxElements} elementos (tiene ${elementCount})`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida la posición de un elemento dentro de un área
 * @param {Object} element - Elemento a validar
 * @param {Object} area - Área donde debe estar el elemento
 * @returns {String|null} - Mensaje de error o null si es válido
 */
export const validateElementPosition = (element, area) => {
  const { position } = element;
  const { position: areaPos } = area;
  
  // Obtener dimensiones del elemento
  const width = position.width || 0;
  const height = position.height || 0;
  
  // Verificar si está dentro de los límites del área
  if (position.x < areaPos.x || 
      position.y < areaPos.y ||
      position.x + width > areaPos.x + areaPos.width ||
      position.y + height > areaPos.y + areaPos.height) {
    return `Elemento fuera de los límites del área "${area.name}"`;
  }
  
  return null;
};

/**
 * Genera una vista previa del diseño
 * @param {Object} design - Diseño completo
 * @param {Object} product - Producto asociado
 * @returns {Promise<String>} - URL de la imagen generada
 */
export const generateDesignPreview = async (design, product) => {
  try {
    // En producción, aquí se implementaría la lógica para generar una imagen
    // usando Canvas o un servicio de renderizado de imágenes.
    // Por ahora, simularemos esto con un placeholder

    // Si ya existe una preview, devolverla
    if (design.previewImage) {
      return design.previewImage;
    }

    // URL placeholder para desarrollo
    return `https://via.placeholder.com/400x300?text=Diseño+${design._id}`;
    
    // Ejemplo de implementación real (comentado):
    /*
    // Crear canvas y renderizar elementos
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    
    // Dibujar imagen base del producto
    const productImg = await loadImage(product.images.main);
    ctx.drawImage(productImg, 0, 0, 800, 600);
    
    // Dibujar cada elemento
    for (const element of design.elements) {
      if (element.type === 'text') {
        // Configurar texto
        ctx.font = `${element.styles.fontSize || 20}px ${element.styles.fontFamily || 'Arial'}`;
        ctx.fillStyle = element.styles.fill || '#000000';
        
        // Dibujar texto
        ctx.fillText(element.content, element.position.x, element.position.y);
      } else if (element.type === 'image') {
        // Cargar y dibujar imagen
        const img = await loadImage(element.content);
        ctx.drawImage(
          img, 
          element.position.x, 
          element.position.y,
          element.position.width || 100,
          element.position.height || 100
        );
      }
    }
    
    // Convertir canvas a buffer
    const buffer = canvas.toBuffer('image/png');
    
    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'design-previews' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });
    
    return result.secure_url;
    */
  } catch (error) {
    console.error('Error generando vista previa:', error);
    return null;
  }
};

/**
 * Calcula el precio de un diseño
 * @param {Object} design - Diseño a calcular
 * @param {Number} basePrice - Precio base del producto
 * @returns {Number} - Precio calculado
 */
export const calculateDesignPrice = (design, basePrice) => {
  if (!design || !design.elements || !Array.isArray(design.elements)) {
    throw new Error('Diseño inválido para cálculo de precio');
  }
  
  if (!basePrice || isNaN(basePrice)) {
    throw new Error('Precio base inválido');
  }
  
  // Factores de complejidad
  const factors = {
    text: 0.05, // 5% extra por elemento de texto
    image: 0.1, // 10% extra por elemento de imagen
    areaMultiplier: 0.15, // 15% extra por cada área adicional usada
    complexityMultiplier: {
      low: 1.0,
      medium: 1.2,
      high: 1.5
    }
  };
  
  // Contar elementos por tipo
  const textElements = design.elements.filter(el => el.type === 'text').length;
  const imageElements = design.elements.filter(el => el.type === 'image').length;
  
  // Calcular áreas únicas utilizadas
  const uniqueAreas = new Set(design.elements.map(el => el.areaId.toString())).size;
  
  // Calcular precio base con elementos
  let calculatedPrice = basePrice;
  
  // Sumar precio por elementos
  calculatedPrice += basePrice * (textElements * factors.text);
  calculatedPrice += basePrice * (imageElements * factors.image);
  
  // Sumar precio por áreas adicionales
  if (uniqueAreas > 1) {
    calculatedPrice += basePrice * ((uniqueAreas - 1) * factors.areaMultiplier);
  }
  
  // Multiplicador por complejidad
  const complexity = design.metadata?.complexity || 'medium';
  calculatedPrice *= factors.complexityMultiplier[complexity];
  
  // Redondear a 2 decimales
  return Math.round(calculatedPrice * 100) / 100;
};

export default {
  validateDesignElements,
  validateElementPosition,
  generateDesignPreview,
  calculateDesignPrice
};