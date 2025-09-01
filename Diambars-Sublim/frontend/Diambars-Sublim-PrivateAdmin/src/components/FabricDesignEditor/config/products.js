// src/components/FabricDesignEditor/config/products.js

// ================ CONFIGURACIÓN DE PRODUCTOS DE SUBLIMACIÓN ================
export const PRODUCT_TEMPLATES = {
  // Productos planos (camisetas, gorras, llaveros, etc.)
  flat: {
    name: 'Producto Plano',
    description: 'Camisetas, gorras, llaveros, gafetes, etc.',
    icon: 'square',
    color: '#4caf50',
    canvas: {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff', 
      minWidth: 400,
      minHeight: 300,
      maxWidth: 2000,
      maxHeight: 1500
    },
    safeZone: {
      x: 50,
      y: 50,
      width: 700,
      height: 500,
      color: '#e8f5e8',
      borderColor: '#4caf50'
    },
    constraints: {
      maxElements: 50,
      maxTextElements: 20,
      maxImageElements: 15,
      maxShapeElements: 20
    },
    export: {
      formats: ['png', 'jpg', 'svg'],
      defaultFormat: 'png',
      defaultQuality: 0.9,
      defaultResolution: 300
    }
  },

  // Productos cilíndricos (tazas, termos, vasos, etc.)
  cylindrical: {
    name: 'Producto Cilíndrico',
    description: 'Tazas, termos, vasos, botellas, etc.',
    icon: 'circle',
    color: '#2196f3',
    canvas: {
      width: 600,
      height: 400,
      backgroundColor: '#ffffff',
      minWidth: 300,
      minHeight: 200,
      maxWidth: 1200,
      maxHeight: 800
    },
    safeZone: {
      x: 30,
      y: 30,
      width: 540,
      height: 340,
      color: '#e3f2fd',
      borderColor: '#2196f3'
    },
    constraints: {
      maxElements: 30,
      maxTextElements: 15,
      maxImageElements: 10,
      maxShapeElements: 15
    },
    export: {
      formats: ['png', 'jpg', 'svg'],
      defaultFormat: 'png',
      defaultQuality: 0.9,
      defaultResolution: 300
    },
    wrap: true // Para envolver alrededor del cilindro
  },

  // Productos pequeños (gafetes, stickers, etiquetas, etc.)
  small: {
    name: 'Producto Pequeño',
    description: 'Gafetes, stickers, etiquetas, insignias, etc.',
    icon: 'square',
    color: '#ff9800',
    canvas: {
      width: 300,
      height: 300,
      backgroundColor: '#ffffff',
      minWidth: 150,
      minHeight: 150,
      maxWidth: 600,
      maxHeight: 600
    },
    safeZone: {
      x: 20,
      y: 20,
      width: 260,
      height: 260,
      color: '#fff3e0',
      borderColor: '#ff9800'
    },
    constraints: {
      maxElements: 20,
      maxTextElements: 10,
      maxImageElements: 8,
      maxShapeElements: 10
    },
    export: {
      formats: ['png', 'jpg', 'svg'],
      defaultFormat: 'png',
      defaultQuality: 0.95,
      defaultResolution: 600
    }
  }
};

// Función para detectar automáticamente el tipo de producto
export const detectProductType = (imageUrl, productName = '') => {
  if (!imageUrl && !productName) return 'flat';

  const text = (imageUrl + ' ' + productName).toLowerCase();

  // Detectar productos cilíndricos
  if (text.includes('taza') || text.includes('termo') ||
      text.includes('vaso') || text.includes('botella') ||
      text.includes('cilindro') || text.includes('redondo')) {
    return 'cylindrical';
  }

  // Detectar productos pequeños
  if (text.includes('gafete') || text.includes('sticker') ||
      text.includes('etiqueta') || text.includes('insignia') ||
      text.includes('pequeño') || text.includes('mini')) {
    return 'small';
  }

  // Por defecto, producto plano
  return 'flat';
};

// Función para obtener la configuración de un producto
export const getProductConfig = (productType) => {
  return PRODUCT_TEMPLATES[productType] || PRODUCT_TEMPLATES.flat;
};

// Función para validar que un diseño cumple con las restricciones del producto
export const validateDesign = (canvas, productType) => {
  const config = getProductConfig(productType);
  const objects = canvas.getObjects();

  // Validar número de elementos
  if (objects.length > config.constraints.maxElements) {
    return {
      valid: false,
      error: `Demasiados elementos. Máximo: ${config.constraints.maxElements}`
    };
  }

  // Validar zona segura
  const safeZone = config.safeZone;
  const invalidElements = objects.filter(obj => {
    const bounds = obj.getBoundingRect();
    return bounds.left < safeZone.x ||
           bounds.top < safeZone.y ||
           bounds.left + bounds.width > safeZone.x + safeZone.width ||
           bounds.top + bounds.height > safeZone.y + safeZone.height;
  });

  if (invalidElements.length > 0) {
    return {
      valid: false,
      error: `${invalidElements.length} elementos están fuera de la zona segura`
    };
  }

  return { valid: true };
};

// Función para obtener la configuración de exportación recomendada
export const getExportConfig = (productType, format = null) => {
  const config = getProductConfig(productType);
  const exportConfig = config.export;

  if (format && exportConfig.formats.includes(format)) {
    return {
      ...exportConfig,
      format: format
    };
  }

  return exportConfig;
};
