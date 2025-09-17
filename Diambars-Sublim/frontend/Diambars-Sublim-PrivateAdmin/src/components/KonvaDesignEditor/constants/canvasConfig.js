// constants/canvasConfig.js
// Configuración unificada para el canvas de Konva

export const CANVAS_CONFIG = {
  // Dimensiones del canvas
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  
  // Factor de escalado para la imagen del producto y áreas de personalización
  productScale: 0.8, // 80% del tamaño máximo
  
  // Configuración del grid
  grid: {
    enabled: true,
    size: 20,
    color: '#e0e0e0',
    opacity: 0.5
  },
  
  // Configuración de snap
  snap: {
    enabled: true,
    threshold: 5
  },
  
  // Configuración de zoom
  zoom: {
    min: 0.1,
    max: 3,
    step: 0.1
  }
};

/**
 * Calcula las dimensiones escaladas y posición centrada para un elemento
 * @param {number} originalWidth - Ancho original
 * @param {number} originalHeight - Alto original
 * @param {number} scale - Factor de escalado (opcional, usa CANVAS_CONFIG.productScale por defecto)
 * @returns {Object} - { width, height, x, y }
 */
export const calculateScaledDimensions = (originalWidth, originalHeight, scale = CANVAS_CONFIG.productScale) => {
  const scaledWidth = originalWidth * scale;
  const scaledHeight = originalHeight * scale;
  
  // Centrar en el canvas
  const offsetX = (CANVAS_CONFIG.width - scaledWidth) / 2;
  const offsetY = (CANVAS_CONFIG.height - scaledHeight) / 2;
  
  return {
    width: scaledWidth,
    height: scaledHeight,
    x: offsetX,
    y: offsetY
  };
};

/**
 * Aplica escalado a coordenadas de área de personalización
 * @param {Object} area - Área original con x, y, width, height
 * @param {number} scale - Factor de escalado (opcional, usa CANVAS_CONFIG.productScale por defecto)
 * @returns {Object} - Área escalada y centrada
 */
export const scaleCustomizationArea = (area, scale = CANVAS_CONFIG.productScale) => {
  const scaledX = (area.position?.x || area.x || 0) * scale;
  const scaledY = (area.position?.y || area.y || 0) * scale;
  const scaledWidth = (area.position?.width || area.width || 200) * scale;
  const scaledHeight = (area.position?.height || area.height || 100) * scale;

  // Centrar en el canvas
  const scaledCanvasWidth = CANVAS_CONFIG.width * scale;
  const scaledCanvasHeight = CANVAS_CONFIG.height * scale;
  const offsetX = (CANVAS_CONFIG.width - scaledCanvasWidth) / 2;
  const offsetY = (CANVAS_CONFIG.height - scaledCanvasHeight) / 2;

  return {
    x: scaledX + offsetX,
    y: scaledY + offsetY,
    width: scaledWidth,
    height: scaledHeight
  };
};
