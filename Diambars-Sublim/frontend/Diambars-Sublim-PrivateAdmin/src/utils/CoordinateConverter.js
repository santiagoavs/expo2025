// src/utils/CoordinateConverter.js - CONVERSOR UNIFICADO DE COORDENADAS

/**
 * Conversor unificado de coordenadas entre diferentes sistemas
 * Maneja conversiones entre Fabric.js, Konva.js, Backend y Canvas
 */
export class CoordinateConverter {
  
  // Dimensiones estándar del sistema
  static STANDARD_WIDTH = 800;
  static STANDARD_HEIGHT = 600;
  
  /**
   * Convierte coordenadas de un sistema a otro
   * @param {Object} coords - Coordenadas {x, y, width, height}
   * @param {Object} from - Sistema origen {width, height}
   * @param {Object} to - Sistema destino {width, height}
   * @param {Object} options - Opciones adicionales
   * @returns {Object} Coordenadas convertidas
   */
  static convertCoordinates(coords, from, to, options = {}) {
    const { 
      preserveAspectRatio = true,
      centerOrigin = false,
      roundValues = true 
    } = options;
    
    // Calcular factores de escala
    const scaleX = to.width / from.width;
    const scaleY = to.height / from.height;
    
    // Si preserveAspectRatio es true, usar la escala más pequeña
    const scale = preserveAspectRatio ? Math.min(scaleX, scaleY) : { x: scaleX, y: scaleY };
    
    let finalScaleX, finalScaleY;
    if (preserveAspectRatio) {
      finalScaleX = finalScaleY = scale;
    } else {
      finalScaleX = scale.x;
      finalScaleY = scale.y;
    }
    
    // Convertir coordenadas
    let convertedCoords = {
      x: coords.x * finalScaleX,
      y: coords.y * finalScaleY,
      width: coords.width * finalScaleX,
      height: coords.height * finalScaleY
    };
    
    // Si centerOrigin, ajustar para centrar
    if (centerOrigin) {
      const offsetX = (to.width - (from.width * finalScaleX)) / 2;
      const offsetY = (to.height - (from.height * finalScaleY)) / 2;
      convertedCoords.x += offsetX;
      convertedCoords.y += offsetY;
    }
    
    // Redondear valores si es necesario
    if (roundValues) {
      convertedCoords.x = Math.round(convertedCoords.x);
      convertedCoords.y = Math.round(convertedCoords.y);
      convertedCoords.width = Math.round(convertedCoords.width);
      convertedCoords.height = Math.round(convertedCoords.height);
    }
    
    return convertedCoords;
  }
  
  /**
   * Convierte coordenadas de Fabric.js a Konva.js
   * @param {Object} fabricCoords - Coordenadas de Fabric.js
   * @param {Object} fabricCanvas - Canvas de Fabric.js
   * @param {Object} konvaStage - Stage de Konva.js
   * @returns {Object} Coordenadas de Konva.js
   */
  static fabricToKonva(fabricCoords, fabricCanvas, konvaStage) {
    const fabricDims = {
      width: fabricCanvas.getWidth(),
      height: fabricCanvas.getHeight()
    };
    
    const konvaDims = {
      width: konvaStage.width(),
      height: konvaStage.height()
    };
    
    return this.convertCoordinates(fabricCoords, fabricDims, konvaDims, {
      preserveAspectRatio: true,
      centerOrigin: true
    });
  }
  
  /**
   * Convierte coordenadas de Konva.js a Fabric.js
   * @param {Object} konvaCoords - Coordenadas de Konva.js
   * @param {Object} konvaStage - Stage de Konva.js
   * @param {Object} fabricCanvas - Canvas de Fabric.js
   * @returns {Object} Coordenadas de Fabric.js
   */
  static konvaToFabric(konvaCoords, konvaStage, fabricCanvas) {
    const konvaDims = {
      width: konvaStage.width(),
      height: konvaStage.height()
    };
    
    const fabricDims = {
      width: fabricCanvas.getWidth(),
      height: fabricCanvas.getHeight()
    };
    
    return this.convertCoordinates(konvaCoords, konvaDims, fabricDims, {
      preserveAspectRatio: true,
      centerOrigin: true
    });
  }
  
  /**
   * Convierte coordenadas a formato estándar (800x600)
   * @param {Object} coords - Coordenadas a convertir
   * @param {Object} sourceDims - Dimensiones del sistema origen
   * @returns {Object} Coordenadas normalizadas
   */
  static toStandard(coords, sourceDims) {
    return this.convertCoordinates(coords, sourceDims, {
      width: this.STANDARD_WIDTH,
      height: this.STANDARD_HEIGHT
    }, {
      preserveAspectRatio: true,
      centerOrigin: false
    });
  }
  
  /**
   * Convierte coordenadas desde formato estándar (800x600)
   * @param {Object} coords - Coordenadas normalizadas
   * @param {Object} targetDims - Dimensiones del sistema destino
   * @returns {Object} Coordenadas convertidas
   */
  static fromStandard(coords, targetDims) {
    return this.convertCoordinates(coords, {
      width: this.STANDARD_WIDTH,
      height: this.STANDARD_HEIGHT
    }, targetDims, {
      preserveAspectRatio: true,
      centerOrigin: false
    });
  }
  
  /**
   * Normaliza coordenadas de un elemento de diseño
   * @param {Object} element - Elemento con coordenadas
   * @param {Object} sourceCanvas - Canvas origen
   * @returns {Object} Elemento con coordenadas normalizadas
   */
  static normalizeDesignElement(element, sourceCanvas) {
    const sourceDims = {
      width: sourceCanvas.getWidth(),
      height: sourceCanvas.getHeight()
    };
    
    const normalizedCoords = this.toStandard({
      x: element.konvaAttrs?.x || element.x || 0,
      y: element.konvaAttrs?.y || element.y || 0,
      width: element.konvaAttrs?.width || element.width || 100,
      height: element.konvaAttrs?.height || element.height || 100
    }, sourceDims);
    
    return {
      ...element,
      konvaAttrs: {
        ...element.konvaAttrs,
        ...normalizedCoords
      }
    };
  }
  
  /**
   * Desnormaliza coordenadas de un elemento de diseño
   * @param {Object} element - Elemento con coordenadas normalizadas
   * @param {Object} targetCanvas - Canvas destino
   * @returns {Object} Elemento con coordenadas desnormalizadas
   */
  static denormalizeDesignElement(element, targetCanvas) {
    const targetDims = {
      width: targetCanvas.getWidth(),
      height: targetCanvas.getHeight()
    };
    
    const denormalizedCoords = this.fromStandard({
      x: element.konvaAttrs?.x || 0,
      y: element.konvaAttrs?.y || 0,
      width: element.konvaAttrs?.width || 100,
      height: element.konvaAttrs?.height || 100
    }, targetDims);
    
    return {
      ...element,
      konvaAttrs: {
        ...element.konvaAttrs,
        ...denormalizedCoords
      }
    };
  }
  
  /**
   * Valida que las coordenadas estén dentro de los límites
   * @param {Object} coords - Coordenadas a validar
   * @param {Object} bounds - Límites {width, height}
   * @returns {Object} {isValid: boolean, coords: Object}
   */
  static validateBounds(coords, bounds) {
    const isValid = 
      coords.x >= 0 && 
      coords.y >= 0 && 
      coords.x + coords.width <= bounds.width && 
      coords.y + coords.height <= bounds.height;
    
    if (!isValid) {
      // Ajustar coordenadas para que estén dentro de los límites
      const adjustedCoords = {
        x: Math.max(0, Math.min(coords.x, bounds.width - coords.width)),
        y: Math.max(0, Math.min(coords.y, bounds.height - coords.height)),
        width: Math.min(coords.width, bounds.width),
        height: Math.min(coords.height, bounds.height)
      };
      
      return { isValid: false, coords: adjustedCoords };
    }
    
    return { isValid: true, coords };
  }
}

export default CoordinateConverter;
