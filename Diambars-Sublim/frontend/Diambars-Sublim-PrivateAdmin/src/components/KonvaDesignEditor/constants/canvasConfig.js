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
 * @param {number} scale - Factor de escalado
 * @param {Object} canvasDimensions - Dimensiones del canvas (opcional)
 * @returns {Object} - { width, height, x, y }
 */
export const calculateScaledDimensions = (originalWidth, originalHeight, scale, canvasDimensions = null) => {
  const scaledWidth = originalWidth * scale;
  const scaledHeight = originalHeight * scale;
  
  // Usar dimensiones del canvas si están disponibles
  const canvasWidth = canvasDimensions?.width || CANVAS_CONFIG.width;
  const canvasHeight = canvasDimensions?.height || CANVAS_CONFIG.height;
  
  // Centrar en el canvas
  const offsetX = (canvasWidth - scaledWidth) / 2;
  const offsetY = (canvasHeight - scaledHeight) / 2;
  
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
 * @param {Object} canvasDimensions - Dimensiones del canvas actual (opcional)
 * @returns {Object} - Área escalada y centrada
 */
export const scaleCustomizationArea = (area, scale = 1, canvasDimensions = null) => {
  // ✅ CORREGIDO: Usar la misma lógica que KonvaAreaEditor
  // Las áreas deben mantener sus coordenadas originales sin escalado adicional
  // ya que el escalado se aplica a nivel del stage
  
  // Obtener coordenadas originales del área
  const originalX = area.position?.x || area.x || 0;
  const originalY = area.position?.y || area.y || 0;
  const originalWidth = area.position?.width || area.width || 200;
  const originalHeight = area.position?.height || area.height || 100;

  // ✅ CORREGIDO: No aplicar escalado adicional, mantener coordenadas originales
  // El escalado se maneja a nivel del stage en ambos editores
  const result = {
    x: originalX,
    y: originalY,
    width: originalWidth,
    height: originalHeight,
    // Metadatos para debugging
    _debug: {
      original: { x: originalX, y: originalY, width: originalWidth, height: originalHeight },
      scale: { applied: scale, note: 'No se aplica escalado adicional - se maneja a nivel stage' },
      canvas: { width: CANVAS_CONFIG.width, height: CANVAS_CONFIG.height }
    }
  };

  console.log('🔄 [scaleCustomizationArea] Área procesada (sin escalado adicional):', {
    areaName: area.name,
    original: result._debug.original,
    final: { x: result.x, y: result.y, width: result.width, height: result.height },
    note: 'Coordenadas mantenidas - escalado manejado por stage'
  });

  return result;
};
