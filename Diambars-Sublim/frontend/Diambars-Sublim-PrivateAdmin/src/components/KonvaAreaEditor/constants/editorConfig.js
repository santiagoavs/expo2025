// constants/editorConfig.js
// Configuración compartida para editores de Konva

export const EDITOR_THEME = {
  colors: {
    primary: '#3b82f6',
    primaryDark: '#1d4ed8',
    primaryLight: '#60a5fa',
    accent: '#8b5cf6',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: 'rgba(226, 232, 240, 0.6)',
    shadow: 'rgba(0, 0, 0, 0.1)'
  },
  gradients: {
    overlay: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
    container: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    header: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
    toolbar: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.4) 100%)',
    canvas: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    panel: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
  },
  shadows: {
    container: `
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    canvas: `
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    button: '0 1px 3px rgba(0, 0, 0, 0.1)',
    buttonHover: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  borderRadius: {
    container: '24px',
    panel: '16px',
    button: '10px',
    input: '8px',
    small: '6px'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
};

export const EDITOR_LAYOUT = {
  container: {
    width: '98vw',
    height: '96vh',
    maxWidth: '1600px',
    maxHeight: '1000px'
  },
  panels: {
    properties: {
      width: '360px',
      widthLg: '320px'
    },
    tools: {
      height: '60px'
    }
  },
  canvas: {
    padding: '24px'
  }
};

export const CANVAS_RENDERING = {
  pixelRatio: window.devicePixelRatio || 1,
  grid: {
    minor: {
      size: 20,
      color: 'rgba(59, 130, 246, 0.08)',
      strokeColor: 'rgba(59, 130, 246, 0.12)',
      strokeWidth: 0.5
    },
    major: {
      size: 100,
      color: 'rgba(59, 130, 246, 0.15)',
      strokeColor: 'rgba(59, 130, 246, 0.2)',
      strokeWidth: 1
    }
  },
  areas: {
    default: {
      strokeColor: '#1F64BF',
      strokeWidth: 2,
      fillOpacity: 0.2,
      cornerRadius: 8,
      dash: [5, 5]
    },
    selected: {
      strokeColor: '#3b82f6',
      strokeWidth: 3,
      fillOpacity: 0.3,
      cornerRadius: 8,
      dash: [8, 4],
      shadowColor: 'rgba(59, 130, 246, 0.3)',
      shadowBlur: 8,
      shadowOffset: { x: 2, y: 2 }
    }
  },
  transformer: {
    borderStroke: '#3b82f6',
    borderStrokeWidth: 2,
    anchorSize: 8,
    anchorStroke: '#3b82f6',
    anchorFill: '#ffffff',
    anchorStrokeWidth: 2
  }
};

export const CLOUDINARY_CONFIG = {
  // Configuración basada en el backend
  products: {
    main: {
      folder: "products/main",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto:good" }
      ]
    },
    additional: {
      folder: "products/additional", 
      transformation: [
        { width: 600, height: 600, crop: "limit" },
        { quality: "auto:good" }
      ]
    }
  },
  designs: {
    folder: "designs",
    transformation: [
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto:best" }
    ]
  },
  areas: {
    folder: "areas",
    transformation: [
      { width: 800, height: 600, crop: "limit" },
      { quality: "auto:good" }
    ]
  }
};

export const VALIDATION_RULES = {
  areas: {
    minSize: 10,
    maxSize: 2000,
    maxAreas: 10
  },
  elements: {
    minSize: 5,
    maxSize: 1000,
    maxElements: 50
  },
  images: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxDimensions: { width: 2000, height: 2000 }
  }
};
