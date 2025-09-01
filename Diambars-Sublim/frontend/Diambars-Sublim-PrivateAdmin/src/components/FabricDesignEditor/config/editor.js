// src/components/FabricDesignEditor/config/editor.js

// ================ CONFIGURACIÓN BÁSICA DEL EDITOR ================
export const EDITOR_CONFIG = {
  // Información básica
  name: 'Editor de Diseño Diambars Sublim',
  version: '1.0.0',
  description: 'Editor de diseño para productos de sublimación',

  // Configuración del canvas
  canvas: {
    // Configuración por defecto
    default: {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true
    },

    // Configuración de zoom
    zoom: {
      min: 0.1,
      max: 5,
      step: 0.1,
      default: 1
    },

    // Configuración de grid
    grid: {
      enabled: true,
      size: 20,
      color: '#e0e0e0',
      snapToGrid: false
    },

    // Configuración de reglas
    rulers: {
      enabled: true,
      color: '#999999',
      fontSize: 10
    }
  },

  // Configuración de herramientas
  tools: {
    // Herramienta activa por defecto
    default: 'select',

    // Herramientas disponibles
    available: ['select', 'text', 'image', 'shapes', 'effects', 'layers'],

    // Atajos de teclado
    shortcuts: {
      'V': 'select',
      'T': 'text',
      'I': 'image',
      'S': 'shapes',
      'E': 'effects',
      'L': 'layers',
      'Delete': 'delete',
      'Ctrl+Z': 'undo',
      'Ctrl+Y': 'redo',
      'Ctrl+S': 'save',
      'Ctrl+O': 'open',
      'Ctrl+E': 'export'
    }
  },

  // Configuración de archivos
  files: {
    // Formatos soportados para importar
    import: {
      images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      designs: ['json', 'fabric']
    },

    // Formatos soportados para exportar
    export: {
      images: ['png', 'jpg', 'jpeg', 'svg', 'webp'],
      designs: ['json', 'fabric', 'pdf']
    },

    // Límites de archivo
    limits: {
      maxImageSize: 10 * 1024 * 1024, // 10MB
      maxDesignSize: 5 * 1024 * 1024, // 5MB
      maxElements: 1000
    }
  },

  // Configuración de historial
  history: {
    enabled: true,
    maxSteps: 50,
    autoSave: true,
    autoSaveInterval: 30000 // 30 segundos
  },

  // Configuración de autoguardado
  autoSave: {
    enabled: true,
    interval: 30000, // 30 segundos
    showNotification: true,
    saveToLocalStorage: true
  },

  // Configuración de validación
  validation: {
    enabled: true,
    checkSafeZone: true,
    checkElementCount: true,
    checkFileSize: true,
    showWarnings: true
  },

  // Configuración de notificaciones
  notifications: {
    enabled: true,
    position: 'top-right',
    duration: 5000,
    types: ['success', 'warning', 'error', 'info']
  },

  // Configuración de rendimiento
  performance: {
    // Límites para evitar problemas de rendimiento
    maxElements: 1000,
    maxImages: 50,
    maxTextElements: 200,
    maxShapeElements: 500,

    // Optimizaciones
    enableObjectCaching: true,
    enableRetinaScaling: true,
    enableSelection: true
  },

  // Configuración de accesibilidad
  accessibility: {
    enabled: true,
    keyboardNavigation: true,
    screenReader: true,
    highContrast: false,
    largeText: false
  },

  // Configuración de idioma
  language: {
    default: 'es',
    available: ['es', 'en'],
    fallback: 'en'
  },

  // Configuración de tema
  theme: {
    default: 'light',
    available: ['light', 'dark', 'auto'],
    colors: {
      light: {
        background: '#ffffff',
        surface: '#fafafa',
        text: '#000000',
        primary: '#2196f3',
        secondary: '#757575'
      },
      dark: {
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff',
        primary: '#64b5f6',
        secondary: '#bdbdbd'
      }
    }
  }
};

// Función para obtener configuración del editor
export const getEditorConfig = (key = null) => {
  if (key) {
    return key.split('.').reduce((obj, k) => obj?.[k], EDITOR_CONFIG);
  }
  return EDITOR_CONFIG;
};

// Función para actualizar configuración del editor
export const updateEditorConfig = (key, value) => {
  const keys = key.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, k) => obj[k], EDITOR_CONFIG);

  if (target && lastKey) {
    target[lastKey] = value;
  }
};

// Función para validar configuración
export const validateEditorConfig = () => {
  const errors = [];

  // Validar configuración del canvas
  if (EDITOR_CONFIG.canvas.zoom.min >= EDITOR_CONFIG.canvas.zoom.max) {
    errors.push('Zoom mínimo debe ser menor que zoom máximo');
  }

  // Validar límites de archivo
  if (EDITOR_CONFIG.files.limits.maxImageSize <= 0) {
    errors.push('Tamaño máximo de imagen debe ser mayor que 0');
  }

  // Validar historial
  if (EDITOR_CONFIG.history.maxSteps <= 0) {
    errors.push('Número máximo de pasos del historial debe ser mayor que 0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Función para obtener configuración por producto
export const getProductSpecificConfig = (productType) => {
  const baseConfig = { ...EDITOR_CONFIG };

  // Ajustar configuración según el tipo de producto
  switch (productType) {
    case 'small':
      baseConfig.canvas.zoom.max = 10; // Más zoom para productos pequeños
      baseConfig.performance.maxElements = 500; // Menos elementos
      break;

    case 'cylindrical':
      baseConfig.canvas.zoom.max = 3; // Menos zoom para productos cilíndricos
      baseConfig.performance.maxElements = 800; // Elementos intermedios
      break;

    case 'flat':
    default:
      // Usar configuración por defecto
      break;
  }

  return baseConfig;
};
