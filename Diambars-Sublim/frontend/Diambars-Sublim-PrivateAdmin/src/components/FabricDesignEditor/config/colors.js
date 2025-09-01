// src/components/FabricDesignEditor/config/colors.js

// ================ CONFIGURACIÓN DE COLORES ================
export const COLOR_PALETTE = {
  // Colores principales de la marca
  primary: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrast: '#ffffff'
  },

  // Colores secundarios
  secondary: {
    main: '#757575',
    light: '#bdbdbd',
    dark: '#424242',
    contrast: '#ffffff'
  },

  // Colores de estado
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    contrast: '#ffffff'
  },

  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    contrast: '#000000'
  },

  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrast: '#ffffff'
  },

  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrast: '#ffffff'
  }
};

// Paleta de colores para diseño
export const DESIGN_COLORS = {
  // Colores básicos
  basic: [
    '#000000', // Negro
    '#ffffff', // Blanco
    '#808080', // Gris
    '#c0c0c0'  // Gris claro
  ],

  // Colores primarios
  primary: [
    '#ff0000', // Rojo
    '#00ff00', // Verde
    '#0000ff', // Azul
    '#ffff00', // Amarillo
    '#ff00ff', // Magenta
    '#00ffff'  // Cian
  ],

  // Colores pasteles
  pastel: [
    '#ffb3ba', // Rosa pastel
    '#baffc9', // Verde pastel
    '#bae1ff', // Azul pastel
    '#ffffba', // Amarillo pastel
    '#ffb3ff', // Magenta pastel
    '#b3ffff'  // Cian pastel
  ],

  // Colores metálicos
  metallic: [
    '#c0c0c0', // Plata
    '#ffd700', // Dorado
    '#cd7f32', // Bronce
    '#b8860b', // Oro oscuro
    '#708090'  // Slate
  ],

  // Colores de sublimación (colores vibrantes)
  sublimation: [
    '#ff1493', // Deep Pink
    '#00ff7f', // Spring Green
    '#00bfff', // Deep Sky Blue
    '#ff8c00', // Dark Orange
    '#8a2be2', // Blue Violet
    '#32cd32', // Lime Green
    '#ff4500', // Orange Red
    '#4169e1'  // Royal Blue
  ]
};

// Colores por defecto para elementos
export const DEFAULT_COLORS = {
  text: {
    primary: '#000000',
    secondary: '#333333',
    accent: '#2196f3'
  },

  shapes: {
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2
  },

  canvas: {
    background: '#ffffff',
    grid: '#e0e0e0',
    safeZone: '#f5f5f5'
  },

  ui: {
    primary: '#2196f3',
    secondary: '#757575',
    background: '#ffffff',
    surface: '#fafafa',
    border: '#e0e0e0'
  }
};

// Gradientes predefinidos
export const GRADIENTS = {
  // Gradientes básicos
  basic: {
    'red-to-blue': ['#ff0000', '#0000ff'],
    'green-to-yellow': ['#00ff00', '#ffff00'],
    'blue-to-purple': ['#0000ff', '#800080'],
    'orange-to-red': ['#ffa500', '#ff0000']
  },

  // Gradientes metálicos
  metallic: {
    'silver-to-gray': ['#c0c0c0', '#808080'],
    'gold-to-yellow': ['#ffd700', '#ffff00'],
    'bronze-to-brown': ['#cd7f32', '#8b4513']
  },

  // Gradientes de sublimación
  sublimation: {
    'sunset': ['#ff6b6b', '#feca57', '#48dbfb'],
    'ocean': ['#00bfff', '#1e90ff', '#4169e1'],
    'forest': ['#32cd32', '#228b22', '#006400'],
    'fire': ['#ff4500', '#ff6347', '#ff7f50']
  }
};

// Función para obtener colores por categoría
export const getColorsByCategory = (category) => {
  return DESIGN_COLORS[category] || [];
};

// Función para obtener gradiente por nombre
export const getGradient = (name) => {
  return GRADIENTS.basic[name] ||
         GRADIENTS.metallic[name] ||
         GRADIENTS.sublimation[name] ||
         null;
};

// Función para generar color aleatorio
export const getRandomColor = (category = 'primary') => {
  const colors = DESIGN_COLORS[category] || DESIGN_COLORS.primary;
  return colors[Math.floor(Math.random() * colors.length)];
};

// Función para obtener color de contraste
export const getContrastColor = (backgroundColor) => {
  // Convertir hex a RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calcular luminosidad
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Retornar negro o blanco según luminosidad
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Función para validar si un color es válido
export const isValidColor = (color) => {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
};
