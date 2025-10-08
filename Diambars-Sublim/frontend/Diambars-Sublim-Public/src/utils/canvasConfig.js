// constants/canvasConfig.js - UNIFIED CANVAS CONFIGURATION (CSS VERSION)

// ==================== CANVAS DIMENSIONS ====================
export const CANVAS_CONFIG = {
  // Base canvas dimensions
  width: 800,
  height: 600,
  
  // Minimum and maximum zoom levels
  minZoom: 0.1,
  maxZoom: 5,
  defaultZoom: 1,
  
  // Grid configuration
  grid: {
    enabled: true,
    size: 20,
    color: 'rgba(255, 255, 255, 0.1)',
    strokeWidth: 1
  },
  
  // Snapping configuration
  snap: {
    enabled: true,
    threshold: 10,
    gridSnap: true,
    elementSnap: true
  },
  
  // Selection configuration
  selection: {
    strokeColor: '#00D4FF',
    strokeWidth: 2,
    cornerSize: 8,
    cornerColor: '#00D4FF',
    rotateAnchorOffset: 50
  },
  
  // Background configuration
  background: {
    color: 'transparent',
    pattern: null
  },
  
  // Product scaling
  productScale: 0.8
};

// ==================== RESPONSIVE BREAKPOINTS ====================
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1440
};

// ==================== CANVAS UTILITIES ====================
export class CanvasUtils {
  static getResponsiveCanvasSize(containerWidth, containerHeight) {
    const aspectRatio = CANVAS_CONFIG.width / CANVAS_CONFIG.height;
    
    let canvasWidth = containerWidth;
    let canvasHeight = containerHeight;
    
    // Maintain aspect ratio
    if (containerWidth / containerHeight > aspectRatio) {
      canvasWidth = containerHeight * aspectRatio;
    } else {
      canvasHeight = containerWidth / aspectRatio;
    }
    
    return {
      width: Math.max(canvasWidth, 300), // Minimum width
      height: Math.max(canvasHeight, 200) // Minimum height
    };
  }
  
  static calculateZoomToFit(canvasWidth, canvasHeight, containerWidth, containerHeight) {
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY, CANVAS_CONFIG.maxZoom);
    
    return Math.max(scale, CANVAS_CONFIG.minZoom);
  }
  
  static centerCanvas(canvasWidth, canvasHeight, containerWidth, containerHeight, zoom = 1) {
    const scaledCanvasWidth = canvasWidth * zoom;
    const scaledCanvasHeight = canvasHeight * zoom;
    
    const x = (containerWidth - scaledCanvasWidth) / 2;
    const y = (containerHeight - scaledCanvasHeight) / 2;
    
    return { x: Math.max(x, 0), y: Math.max(y, 0) };
  }
  
  static snapToGrid(value, gridSize = CANVAS_CONFIG.grid.size) {
    if (!CANVAS_CONFIG.snap.enabled || !CANVAS_CONFIG.snap.gridSnap) {
      return value;
    }
    
    return Math.round(value / gridSize) * gridSize;
  }
  
  static snapToElement(targetPos, elements, threshold = CANVAS_CONFIG.snap.threshold) {
    if (!CANVAS_CONFIG.snap.enabled || !CANVAS_CONFIG.snap.elementSnap) {
      return targetPos;
    }
    
    let snappedX = targetPos.x;
    let snappedY = targetPos.y;
    
    elements.forEach(element => {
      const elementBounds = this.getElementBounds(element);
      
      // Snap to element edges
      if (Math.abs(targetPos.x - elementBounds.x) < threshold) {
        snappedX = elementBounds.x;
      } else if (Math.abs(targetPos.x - elementBounds.right) < threshold) {
        snappedX = elementBounds.right;
      } else if (Math.abs(targetPos.x - elementBounds.centerX) < threshold) {
        snappedX = elementBounds.centerX;
      }
      
      if (Math.abs(targetPos.y - elementBounds.y) < threshold) {
        snappedY = elementBounds.y;
      } else if (Math.abs(targetPos.y - elementBounds.bottom) < threshold) {
        snappedY = elementBounds.bottom;
      } else if (Math.abs(targetPos.y - elementBounds.centerY) < threshold) {
        snappedY = elementBounds.centerY;
      }
    });
    
    return { x: snappedX, y: snappedY };
  }
  
  static getElementBounds(element) {
    const x = element.x || 0;
    const y = element.y || 0;
    
    let width = 0;
    let height = 0;
    
    switch (element.type) {
      case 'text':
        width = element.width || 200;
        height = element.fontSize || 24;
        break;
      case 'image':
        width = element.width || 100;
        height = element.height || 100;
        break;
      case 'shape':
        if (element.shapeType === 'circle') {
          const radius = element.radius || 50;
          width = height = radius * 2;
        } else if (element.shapeType === 'ellipse') {
          width = (element.radiusX || 50) * 2;
          height = (element.radiusY || 30) * 2;
        } else {
          width = element.width || 100;
          height = element.height || 100;
        }
        break;
      default:
        width = element.width || 100;
        height = element.height || 100;
    }
    
    return {
      x,
      y,
      width,
      height,
      right: x + width,
      bottom: y + height,
      centerX: x + width / 2,
      centerY: y + height / 2
    };
  }
}

// ==================== CUSTOMIZATION AREAS ====================
export const DEFAULT_CUSTOMIZATION_AREAS = [
  {
    id: 'default-area',
    name: 'Área Principal',
    position: {
      x: 50,
      y: 50,
      width: 700,
      height: 500
    },
    constraints: {
      allowText: true,
      allowImages: true,
      allowShapes: true,
      maxElements: 50
    }
  }
];

// ==================== ELEMENT DEFAULTS ====================
export const ELEMENT_DEFAULTS = {
  text: {
    fontSize: 24,
    fontFamily: 'Arial',
    fill: '#000000',
    width: 200,
    align: 'left'
  },
  
  image: {
    width: 100,
    height: 100,
    opacity: 1
  },
  
  shape: {
    fill: '#3F2724',
    stroke: '#000000',
    strokeWidth: 0,
    width: 100,
    height: 100
  }
};

// ==================== EXPORT CONFIGURATION ====================
export const EXPORT_CONFIG = {
  formats: ['png', 'jpg', 'pdf'],
  quality: {
    low: 0.5,
    medium: 0.8,
    high: 1.0
  },
  
  resolutions: {
    web: { width: 800, height: 600 },
    print: { width: 3200, height: 2400 },
    thumbnail: { width: 200, height: 150 }
  }
};

// ==================== PERFORMANCE SETTINGS ====================
export const PERFORMANCE_CONFIG = {
  // Maximum number of elements before showing performance warning
  maxElements: 50,
  
  // Maximum image size in MB
  maxImageSize: 10,
  
  // Debounce delays for various operations
  debounce: {
    save: 1000,
    render: 100,
    resize: 250
  },
  
  // Enable/disable features based on performance
  features: {
    realTimePreview: true,
    autoSave: true,
    historyLimit: 50
  }
};

// ==================== SCALING UTILITIES ====================

/**
 * Scale customization area coordinates
 */
export const scaleCustomizationArea = (area, scaleFactor = 1) => {
  return {
    x: (area.x || 0) * scaleFactor,
    y: (area.y || 0) * scaleFactor,
    width: (area.width || 100) * scaleFactor,
    height: (area.height || 100) * scaleFactor
  };
};

/**
 * Calculate scaled dimensions for product images
 */
export const calculateScaledDimensions = (originalWidth, originalHeight, scale) => {
  const scaledWidth = originalWidth * scale;
  const scaledHeight = originalHeight * scale;
  
  // Center the scaled image
  const x = (CANVAS_CONFIG.width - scaledWidth) / 2;
  const y = (CANVAS_CONFIG.height - scaledHeight) / 2;
  
  return {
    width: scaledWidth,
    height: scaledHeight,
    x: Math.max(x, 0),
    y: Math.max(y, 0)
  };
};
