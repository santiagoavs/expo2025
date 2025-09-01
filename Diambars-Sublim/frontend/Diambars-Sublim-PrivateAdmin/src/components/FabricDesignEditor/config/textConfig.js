// src/components/FabricDesignEditor/config/textConfig.js

// ================ CONFIGURACIÓN DE TEXTO ================
export const TEXT_CONFIG = {
  // Fuentes del sistema
  systemFonts: [
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
    'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
    'Tahoma', 'Geneva', 'Lucida Grande'
  ],

  // Fuentes de Google (se cargan dinámicamente)
  googleFonts: [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Raleway',
    'PT Sans', 'Ubuntu', 'Noto Sans', 'Oswald', 'Playfair Display', 'Merriweather',
    'Bebas Neue', 'Barlow', 'Inter', 'Poppins', 'Work Sans', 'Nunito', 'Quicksand'
  ],

  // Tamaños de fuente predefinidos
  fontSizes: [
    8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 88, 96
  ],

  // Estilos de fuente
  fontStyles: {
    normal: 'normal',
    italic: 'italic',
    oblique: 'oblique'
  },

  // Pesos de fuente
  fontWeights: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },

  // Alineación de texto
  textAlign: {
    left: 'left',
    center: 'center',
    right: 'right',
    justify: 'justify'
  },

  // Decoración de texto
  textDecoration: {
    none: 'none',
    underline: 'underline',
    overline: 'overline',
    lineThrough: 'line-through'
  },

  // Transformación de texto
  textTransform: {
    none: 'none',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize'
  },

  // Espaciado entre letras
  letterSpacing: {
    normal: 'normal',
    tight: '-0.05em',
    wide: '0.05em',
    wider: '0.1em',
    widest: '0.2em'
  },

  // Espaciado entre líneas
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
};

// Configuración de propiedades por defecto para texto
export const DEFAULT_TEXT_PROPERTIES = {
  fontFamily: 'Arial',
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
  textDecoration: 'none',
  textTransform: 'none',
  letterSpacing: 'normal',
  lineHeight: 1.5,
  fill: '#000000',
  stroke: 'transparent',
  strokeWidth: 0,
  opacity: 1,
  left: 0,
  top: 0,
  scaleX: 1,
  scaleY: 1,
  angle: 0,
  flipX: false,
  flipY: false,
  selectable: true,
  evented: true,
  hasControls: true,
  hasBorders: true,
  transparentCorners: false,
  cornerColor: '#3f51b5',
  cornerStrokeColor: '#3f51b5',
  cornerSize: 10,
  cornerStyle: 'circle',
  cornerDashArray: [0, 0],
  padding: 0,
  borderColor: '#3f51b5',
  borderDashArray: [0, 0],
  borderScaleFactor: 1,
  excludeFromExport: false,
  text: 'Texto de ejemplo',
  charSpacing: 0,
  styles: {},
  path: null,
  pathSide: 'left',
  pathStartOffset: 0,
  pathAlign: 'baseline'
};

// Configuración de estilos predefinidos para texto
export const TEXT_STYLES = {
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 1.2,
    letterSpacing: 'tight'
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'semibold',
    lineHeight: 1.3,
    letterSpacing: 'tight'
  },
  heading3: {
    fontSize: 20,
    fontWeight: 'medium',
    lineHeight: 1.4,
    letterSpacing: 'normal'
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 1.6,
    letterSpacing: 'normal'
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 1.5,
    letterSpacing: 'wide'
  },
  button: {
    fontSize: 16,
    fontWeight: 'medium',
    lineHeight: 1.2,
    letterSpacing: 'wide',
    textTransform: 'uppercase'
  }
};

// Configuración de efectos para texto
export const TEXT_EFFECTS = {
  shadow: {
    color: 'rgba(0,0,0,0.3)',
    blur: 5,
    offsetX: 2,
    offsetY: 2
  },
  glow: {
    color: '#00ff00',
    blur: 10,
    offsetX: 0,
    offsetY: 0
  },
  outline: {
    color: '#000000',
    width: 2
  },
  gradient: {
    type: 'linear',
    colors: ['#ff0000', '#00ff00'],
    angle: 45
  }
};

// Configuración de validación para texto
export const TEXT_VALIDATION = {
  minLength: 1,
  maxLength: 1000,
  minFontSize: 6,
  maxFontSize: 200,
  maxLines: 100,
  allowedCharacters: /^[\x00-\x7F\u00A0-\uFFFF]*$/,
  maxTextObjects: 100
};

// Configuración de exportación para texto
export const TEXT_EXPORT = {
  formats: ['png', 'svg', 'pdf'],
  defaultFormat: 'png',
  quality: 0.9,
  multiplier: 1,
  enableRetinaScaling: true,
  backgroundColor: 'transparent',
  includeMetadata: true,
  preserveText: true,
  convertToPaths: false
};


