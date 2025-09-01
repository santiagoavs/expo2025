// src/components/FabricDesignEditor/config/tools.js

// ================ CONFIGURACIÓN DE HERRAMIENTAS ADAPTATIVAS ================
export const ADAPTIVE_TOOLS = {
  // Herramienta de texto que se ajusta al producto
  text: {
    getDefaultSize: (productType) => {
      switch(productType) {
        case 'small': return 16;
        case 'flat': return 24;
        case 'cylindrical': return 20;
        default: return 20;
      }
    },

    getMaxSize: (productType) => {
      switch(productType) {
        case 'small': return 48;
        case 'flat': return 120;
        case 'cylindrical': return 80;
        default: return 100;
      }
    },

    getMinSize: (productType) => {
      switch(productType) {
        case 'small': return 8;
        case 'flat': return 12;
        case 'cylindrical': return 10;
        default: return 10;
      }
    }
  },

  // Herramienta de imagen que se ajusta al producto
  image: {
    getMaxDimensions: (productType, canvasSize) => {
      switch(productType) {
        case 'small':
          return {
            width: canvasSize.width * 0.8,
            height: canvasSize.height * 0.8
          };
        case 'flat':
          return {
            width: canvasSize.width * 0.9,
            height: canvasSize.height * 0.9
          };
        case 'cylindrical':
          return {
            width: canvasSize.width * 0.85,
            height: canvasSize.height * 0.85
          };
        default:
          return {
            width: canvasSize.width * 0.9,
            height: canvasSize.height * 0.9
          };
      }
    },

    getMaxFileSize: (productType) => {
      switch(productType) {
        case 'small': return 2 * 1024 * 1024; // 2MB
        case 'flat': return 5 * 1024 * 1024; // 5MB
        case 'cylindrical': return 3 * 1024 * 1024; // 3MB
        default: return 5 * 1024 * 1024; // 5MB
      }
    }
  },

  // Herramienta de formas que se ajusta al producto
  shapes: {
    getMaxStrokeWidth: (productType) => {
      switch(productType) {
        case 'small': return 8;
        case 'flat': return 20;
        case 'cylindrical': return 15;
        default: return 15;
      }
    },

    getMinSize: (productType) => {
      switch(productType) {
        case 'small': return 10;
        case 'flat': return 20;
        case 'cylindrical': return 15;
        default: return 15;
      }
    }
  }
};

// Herramientas básicas del editor con configuración
export const BASIC_TOOLS = {
  select: {
    name: 'Seleccionar',
    icon: 'cursor',
    shortcut: 'V',
    description: 'Seleccionar y mover elementos',
    category: 'selection'
  },

  text: {
    name: 'Texto',
    icon: 'text',
    shortcut: 'T',
    description: 'Agregar texto al diseño',
    category: 'content',
    properties: {
      fontFamily: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia'],
      fontSize: [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72],
      fontWeight: ['normal', 'bold'],
      fontStyle: ['normal', 'italic']
    }
  },

  image: {
    name: 'Imagen',
    icon: 'image',
    shortcut: 'I',
    description: 'Agregar imagen al diseño',
    category: 'content',
    supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    features: ['removeBackground', 'crop', 'resize', 'filters']
  },

  shapes: {
    name: 'Formas',
    icon: 'shapes',
    shortcut: 'S',
    description: 'Agregar formas geométricas',
    category: 'content',
    types: ['rectangle', 'circle', 'triangle', 'line', 'polygon'],
    properties: {
      fill: true,
      stroke: true,
      strokeWidth: true,
      cornerRadius: true
    }
  },

  effects: {
    name: 'Efectos',
    icon: 'sparkles',
    shortcut: 'E',
    description: 'Aplicar efectos visuales',
    category: 'enhancement',
    types: ['shadow', 'glow', 'blur', 'brightness', 'contrast', 'saturation']
  },

  layers: {
    name: 'Capas',
    icon: 'layers',
    shortcut: 'L',
    description: 'Gestionar capas del diseño',
    category: 'organization',
    features: ['reorder', 'hide', 'lock', 'group', 'ungroup']
  }
};

// Configuración de herramientas por categoría
export const TOOL_CATEGORIES = {
  selection: {
    name: 'Selección',
    description: 'Herramientas para seleccionar y manipular elementos',
    color: '#2196f3',
    tools: ['select', 'pan', 'zoom']
  },

  content: {
    name: 'Contenido',
    description: 'Herramientas para agregar elementos al diseño',
    color: '#4caf50',
    tools: ['text', 'image', 'shapes']
  },

  enhancement: {
    name: 'Mejoras',
    description: 'Herramientas para mejorar la apariencia',
    color: '#9c27b0',
    tools: ['effects', 'filters', 'gradients']
  },

  organization: {
    name: 'Organización',
    description: 'Herramientas para organizar el diseño',
    color: '#ff9800',
    tools: ['layers', 'align', 'distribute']
  }
};

// Función para obtener herramientas por categoría
export const getToolsByCategory = (category) => {
  return Object.values(BASIC_TOOLS).filter(tool => tool.category === category);
};

// Función para obtener configuración de herramienta
export const getToolConfig = (toolName) => {
  return BASIC_TOOLS[toolName] || null;
};

// Función para validar si una herramienta está disponible para un producto
export const isToolAvailable = (toolName, productType) => {
  const tool = BASIC_TOOLS[toolName];
  if (!tool) return false;

  // Algunas herramientas pueden no estar disponibles para ciertos productos
  const restrictions = {
    small: ['effects'], // Productos pequeños no soportan efectos complejos
    cylindrical: ['layers'] // Productos cilíndricos tienen limitaciones de capas
  };

  return !restrictions[productType]?.includes(toolName);
};
