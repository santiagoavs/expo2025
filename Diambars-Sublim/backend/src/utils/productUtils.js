// src/utils/product.utils.js - Utilidades unificadas de productos
import mongoose from "mongoose";

/**
 * Valida áreas de personalización de un producto
 */
export const validateCustomizationAreas = (areas) => {
  if (!Array.isArray(areas) || areas.length === 0) {
    return {
      isValid: false,
      errors: ['Debe proporcionar al menos un área personalizable']
    };
  }
  
  const errors = [];
  const names = new Set();
  
  areas.forEach((area, index) => {
    const areaNum = index + 1;
    
    // Validar campos requeridos
    if (!area.name?.trim()) errors.push(`Área ${areaNum}: Nombre requerido`);
    if (!area.displayName?.trim()) errors.push(`Área ${areaNum}: Nombre de visualización requerido`);
    if (!area.position) errors.push(`Área ${areaNum}: Posición requerida`);
    
    // Validar posición
    if (area.position) {
      const { x, y, width, height } = area.position;
      if (typeof x !== 'number' || x < 0) errors.push(`Área ${areaNum}: Posición X inválida`);
      if (typeof y !== 'number' || y < 0) errors.push(`Área ${areaNum}: Posición Y inválida`);
      if (typeof width !== 'number' || width < 10) errors.push(`Área ${areaNum}: Ancho mínimo 10px`);
      if (typeof height !== 'number' || height < 10) errors.push(`Área ${areaNum}: Alto mínimo 10px`);
    }
    
    // Validar que acepte al menos un tipo
    if (!area.accepts?.text && !area.accepts?.image) {
      errors.push(`Área ${areaNum}: Debe aceptar texto o imagen`);
    }
    
    // Verificar nombres únicos
    if (area.name && names.has(area.name)) {
      errors.push(`Área ${areaNum}: Nombre "${area.name}" duplicado`);
    } else if (area.name) {
      names.add(area.name);
    }
  });
  
  // Verificar superposiciones
  for (let i = 0; i < areas.length; i++) {
    for (let j = i + 1; j < areas.length; j++) {
      if (areasOverlap(areas[i].position, areas[j].position)) {
        errors.push(`Áreas "${areas[i].name}" y "${areas[j].name}" se superponen`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Genera configuración Konva para un producto
 */
export const generateKonvaConfig = (product, options = {}) => {
  if (!product?.customizationAreas?.length) {
    throw new Error("Producto debe tener áreas personalizables");
  }
  
  const config = {
    // Configuración del stage
    stage: {
      width: options.width || 800,
      height: options.height || 600,
      padding: 20
    },
    
    // Información del producto
    product: {
      id: product._id.toString(),
      name: product.name,
      image: product.images?.main,
      basePrice: product.basePrice
    },
    
    // Áreas personalizables optimizadas
    areas: product.customizationAreas.map(area => ({
      id: area._id.toString(),
      name: area.name,
      displayName: area.displayName,
      position: {
        x: area.position.x,
        y: area.position.y,
        width: area.position.width,
        height: area.position.height,
        rotation: area.position.rotationDegree || 0
      },
      accepts: {
        text: !!area.accepts?.text,
        image: !!area.accepts?.image
      },
      maxElements: area.maxElements || 10,
      // Configuración visual para Konva
      stroke: area.konvaConfig?.strokeColor || '#06AED5',
      strokeWidth: area.konvaConfig?.strokeWidth || 2,
      opacity: area.konvaConfig?.fillOpacity || 0.1
    })),
    
    // Configuración del editor
    editor: {
      mode: options.mode || 'simple',
      tools: {
        text: true,
        image: true,
        undo: true,
        redo: true,
        zoom: true
      }
    }
  };
  
  // Opciones del producto si se solicitan
  if (options.includeProductOptions && product.options?.length) {
    config.productOptions = product.options.map(option => ({
      name: option.name,
      label: option.label,
      type: option.type,
      required: option.required || false,
      values: option.values.map(val => ({
        label: val.label,
        value: val.value,
        additionalPrice: val.additionalPrice || 0,
        inStock: val.inStock !== false
      }))
    }));
  }
  
  return config;
};

/**
 * Valida posición de elemento dentro de área
 */
export const validateElementPosition = (element, area) => {
  if (!element.position || !area.position) {
    return { isValid: false, error: 'Posición requerida' };
  }
  
  const { x, y, width, height } = element.position;
  const areaPos = area.position;
  
  // Verificar que esté dentro del área
  if (x < areaPos.x || y < areaPos.y ||
      (x + width) > (areaPos.x + areaPos.width) ||
      (y + height) > (areaPos.y + areaPos.height)) {
    return {
      isValid: false,
      error: `Elemento fuera del área "${area.name}"`
    };
  }
  
  // Verificar tamaños mínimos
  if (width < 10 || height < 10) {
    return {
      isValid: false,
      error: 'Elemento muy pequeño (mínimo 10x10px)'
    };
  }
  
  return { isValid: true };
};

/**
 * Calcula precio estimado del diseño
 */
export const calculateDesignPrice = (design, basePrice = 0) => {
  let price = basePrice;
  
  // Multiplicadores por complejidad
  const complexityMultipliers = { low: 1.0, medium: 1.2, high: 1.5 };
  const elementPrices = { text: 2, image: 5, shape: 3 };
  
  // Aplicar complejidad
  const complexity = design.metadata?.complexity || 'medium';
  price *= complexityMultipliers[complexity];
  
  // Agregar costo por elementos
  if (design.elements?.length) {
    design.elements.forEach(element => {
      price += elementPrices[element.type] || 3;
    });
  }
  
  // Costo por múltiples áreas
  const areas = new Set(design.elements?.map(el => el.areaId) || []);
  if (areas.size > 1) {
    price += (areas.size - 1) * 5;
  }
  
  // Costo por opciones del producto
  if (design.productOptions?.length) {
    design.productOptions.forEach(option => {
      if (['xl', 'xxl'].includes(option.value)) {
        price += 3;
      }
    });
  }
  
  return Math.round(price * 100) / 100;
};

/**
 * Genera metadatos del diseño
 */
export const generateDesignMetadata = (elements) => {
  if (!Array.isArray(elements)) return null;
  
  const colors = new Set();
  const fonts = new Set();
  const types = new Set();
  const areas = new Set();
  
  elements.forEach(element => {
    types.add(element.type);
    
    if (element.areaId) areas.add(element.areaId);
    
    if (element.styles) {
      if (element.styles.fill) colors.add(element.styles.fill);
      if (element.styles.stroke) colors.add(element.styles.stroke);
      if (element.styles.fontFamily) fonts.add(element.styles.fontFamily);
    }
  });
  
  // Calcular complejidad
  let complexityScore = elements.length + colors.size * 0.5 + areas.size * 2;
  const complexity = complexityScore <= 5 ? 'low' : 
                    complexityScore <= 12 ? 'medium' : 'high';
  
  return {
    elementCount: elements.length,
    types: Array.from(types),
    colors: Array.from(colors),
    fonts: Array.from(fonts),
    areas: Array.from(areas),
    complexity,
    estimatedPrintTime: Math.max(15, elements.length * 5 + areas.size * 10)
  };
};

/**
 * Optimiza elementos del diseño
 */
export const optimizeDesignElements = (elements) => {
  if (!Array.isArray(elements)) return [];
  
  return elements.map(element => {
    const optimized = { ...element };
    
    // Optimizar texto
    if (element.type === 'text' && optimized.content) {
      // Limitar longitud
      if (optimized.content.length > 500) {
        optimized.content = optimized.content.substring(0, 500) + '...';
      }
      
      // Normalizar tamaño de fuente
      if (optimized.styles?.fontSize) {
        optimized.styles.fontSize = Math.max(8, Math.min(72, optimized.styles.fontSize));
      }
    }
    
    // Optimizar imagen
    if (element.type === 'image' && optimized.position) {
      optimized.position.width = Math.min(500, optimized.position.width);
      optimized.position.height = Math.min(500, optimized.position.height);
    }
    
    return optimized;
  });
};

/**
 * Valida elementos de diseño contra áreas del producto
 */
export const validateDesignElements = (elements, customizationAreas) => {
  if (!Array.isArray(elements) || elements.length === 0) {
    return {
      isValid: false,
      errors: ['Debe incluir al menos un elemento']
    };
  }
  
  if (!Array.isArray(customizationAreas) || customizationAreas.length === 0) {
    return {
      isValid: false,
      errors: ['Producto sin áreas personalizables']
    };
  }
  
  const errors = [];
  
  elements.forEach((element, index) => {
    const elemNum = index + 1;
    
    // Validar estructura básica
    if (!element.type) {
      errors.push(`Elemento ${elemNum}: Tipo requerido`);
      return;
    }
    
    if (!element.areaId) {
      errors.push(`Elemento ${elemNum}: Área requerida`);
      return;
    }
    
    // Buscar área correspondiente
    const area = customizationAreas.find(a => 
      a._id.toString() === element.areaId.toString()
    );
    
    if (!area) {
      errors.push(`Elemento ${elemNum}: Área no válida`);
      return;
    }
    
    // Validar tipo permitido en área
    if (element.type === 'text' && !area.accepts?.text) {
      errors.push(`Elemento ${elemNum}: Área no acepta texto`);
    }
    
    if (element.type === 'image' && !area.accepts?.image) {
      errors.push(`Elemento ${elemNum}: Área no acepta imágenes`);
    }
    
    // Validar posición
    if (element.position) {
      const positionCheck = validateElementPosition(element, area);
      if (!positionCheck.isValid) {
        errors.push(`Elemento ${elemNum}: ${positionCheck.error}`);
      }
    }
    
    // Validar contenido específico
    if (element.type === 'text' && (!element.content || !element.content.trim())) {
      errors.push(`Elemento ${elemNum}: Contenido de texto requerido`);
    }
    
    if (element.type === 'image' && !element.source) {
      errors.push(`Elemento ${elemNum}: Fuente de imagen requerida`);
    }
  });
  
  // Validar límites por área
  const elementsByArea = {};
  elements.forEach(element => {
    if (!elementsByArea[element.areaId]) {
      elementsByArea[element.areaId] = [];
    }
    elementsByArea[element.areaId].push(element);
  });
  
  Object.entries(elementsByArea).forEach(([areaId, areaElements]) => {
    const area = customizationAreas.find(a => a._id.toString() === areaId);
    if (area?.maxElements && areaElements.length > area.maxElements) {
      errors.push(`Área "${area.name}": Máximo ${area.maxElements} elementos`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Obtiene configuración del editor para admin
 */
export const getEditorConfig = (product) => {
  if (!product) throw new Error('Producto requerido');
  
  return {
    productId: product._id,
    productName: product.name,
    imageUrl: product.images?.main,
    stageConfig: {
      width: 800,
      height: 600,
      draggable: false
    },
    areas: product.customizationAreas.map(area => ({
      id: area._id.toString(),
      name: area.name,
      displayName: area.displayName,
      position: area.position,
      editable: true,
      resizable: true,
      draggable: true
    }))
  };
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Verifica si dos áreas se superponen
 */
function areasOverlap(area1, area2) {
  if (!area1 || !area2) return false;
  
  return !(
    area1.x + area1.width < area2.x ||
    area2.x + area2.width < area1.x ||
    area1.y + area1.height < area2.y ||
    area2.y + area2.height < area1.y
  );
}

export default {
  validateCustomizationAreas,
  generateKonvaConfig,
  validateElementPosition,
  calculateDesignPrice,
  generateDesignMetadata,
  optimizeDesignElements,
  validateDesignElements,
  getEditorConfig
};