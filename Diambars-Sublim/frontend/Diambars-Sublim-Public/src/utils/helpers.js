// utils/helpers.js - UTILITY FUNCTIONS (CSS VERSION)

// ==================== ID GENERATION ====================
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateElementId = () => generateId('element');
export const generateAreaId = () => generateId('area');

// ==================== DEBOUNCE & THROTTLE ====================
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ==================== MATH UTILITIES ====================
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start, end, factor) => {
  return start + (end - start) * factor;
};

export const distance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const angle = (point1, point2) => {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

export const rotatePoint = (point, center, angle) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
};

// ==================== ELEMENT BOUNDS ====================
export const getElementBounds = (element) => {
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
};

export const getBoundingBox = (elements) => {
  if (!elements || elements.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  elements.forEach(element => {
    const bounds = getElementBounds(element);
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.right);
    maxY = Math.max(maxY, bounds.bottom);
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};

// ==================== COLLISION DETECTION ====================
export const isPointInBounds = (point, bounds) => {
  return point.x >= bounds.x && 
         point.x <= bounds.x + bounds.width &&
         point.y >= bounds.y && 
         point.y <= bounds.y + bounds.height;
};

export const boundsIntersect = (bounds1, bounds2) => {
  return !(bounds1.x + bounds1.width < bounds2.x || 
           bounds2.x + bounds2.width < bounds1.x || 
           bounds1.y + bounds1.height < bounds2.y || 
           bounds2.y + bounds2.height < bounds1.y);
};

// ==================== COLOR UTILITIES ====================
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const adjustColorBrightness = (color, amount) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const r = clamp(rgb.r + amount, 0, 255);
  const g = clamp(rgb.g + amount, 0, 255);
  const b = clamp(rgb.b + amount, 0, 255);
  
  return rgbToHex(r, g, b);
};

export const getContrastColor = (backgroundColor) => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// ==================== FILE UTILITIES ====================
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// ==================== ARRAY UTILITIES ====================
export const moveArrayItem = (array, fromIndex, toIndex) => {
  const newArray = [...array];
  const item = newArray.splice(fromIndex, 1)[0];
  newArray.splice(toIndex, 0, item);
  return newArray;
};

export const removeArrayItem = (array, index) => {
  return array.filter((_, i) => i !== index);
};

export const insertArrayItem = (array, index, item) => {
  const newArray = [...array];
  newArray.splice(index, 0, item);
  return newArray;
};

// ==================== DEEP CLONE ====================
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// ==================== VALIDATION UTILITIES ====================
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// ==================== RESPONSIVE UTILITIES ====================
export const getDeviceType = () => {
  const width = window.innerWidth;
  
  if (width < 480) return 'mobile';
  if (width < 768) return 'tablet';
  if (width < 1024) return 'desktop';
  return 'large';
};

export const isMobile = () => {
  return getDeviceType() === 'mobile';
};

export const isTablet = () => {
  return getDeviceType() === 'tablet';
};

// ==================== PERFORMANCE UTILITIES ====================
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

export const createPerformanceMonitor = () => {
  const measurements = new Map();
  
  return {
    start: (name) => {
      measurements.set(name, performance.now());
    },
    
    end: (name) => {
      const start = measurements.get(name);
      if (start) {
        const duration = performance.now() - start;
        measurements.delete(name);
        return duration;
      }
      return 0;
    },
    
    measure: (name, fn) => {
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      return result;
    }
  };
};

// ==================== LOCAL STORAGE UTILITIES ====================
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};
