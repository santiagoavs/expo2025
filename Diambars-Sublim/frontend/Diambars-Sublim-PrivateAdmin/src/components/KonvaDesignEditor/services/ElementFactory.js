// services/ElementFactory.js - FACTORY MEJORADO PARA TODOS LOS TIPOS DE ELEMENTOS
export class ElementFactory {
  generateId() {
    return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== ELEMENTOS BÁSICOS ====================

  createTextElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'text',
      text: config.text || 'Nuevo texto',
      x: config.x || 0,
      y: config.y || 0,
      fontSize: config.fontSize || 24,
      fontFamily: config.fontFamily || 'Arial',
      fill: config.fill || '#000000',
      width: config.width || 200,
      align: config.align || 'left',
      verticalAlign: config.verticalAlign || 'top',
      fontWeight: config.fontWeight || 'normal',
      fontStyle: config.fontStyle || 'normal',
      textDecoration: config.textDecoration || '',
      lineHeight: config.lineHeight || 1.2,
      letterSpacing: config.letterSpacing || 0,
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  createImageElement(config) {
    const imageElement = {
      id: config.id || this.generateId(),
      type: 'image',
      x: config.x || 0,
      y: config.y || 0,
      width: config.width || 100,
      height: config.height || 100,
      imageUrl: config.imageUrl,
      image: config.image,
      originalName: config.originalName,
      originalSize: config.originalSize,
      crop: config.crop || null,
      filters: config.filters || [],
      opacity: config.opacity || 1,
      areaId: config.areaId || 'default-area',
      ...config
    };

    // Validar que la imagen tenga al menos una fuente válida
    if (!imageElement.imageUrl && !imageElement.image) {
      console.warn('🖼️ [ElementFactory] Elemento de imagen creado sin fuente de imagen válida:', {
        id: imageElement.id,
        hasImageUrl: !!imageElement.imageUrl,
        hasImage: !!imageElement.image
      });
    }

    // Asegurar que imageUrl esté presente si hay una imagen
    if (imageElement.image && !imageElement.imageUrl) {
      console.warn('🖼️ [ElementFactory] Imagen presente pero sin imageUrl, esto puede causar problemas al guardar');
    }

    console.log('🖼️ [ElementFactory] Elemento de imagen creado:', {
      id: imageElement.id,
      type: imageElement.type,
      hasImageUrl: !!imageElement.imageUrl,
      hasImage: !!imageElement.image,
      imageUrlStart: imageElement.imageUrl?.substring(0, 50) + '...',
      width: imageElement.width,
      height: imageElement.height,
      originalName: imageElement.originalName
    });

    return imageElement;
  }

  // ==================== FORMAS BÁSICAS ====================

  createRectElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'rect',
      x: config.x || 0,
      y: config.y || 0,
      width: config.width || 100,
      height: config.height || 80,
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      cornerRadius: config.cornerRadius || 0,
      opacity: config.opacity || 1,
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  createCircleElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'circle',
      x: config.x || 0,
      y: config.y || 0,
      radius: config.radius || 50,
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      opacity: config.opacity || 1,
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  // ==================== FORMAS COMPLEJAS ====================

  createTriangleElement(config) {
    const points = config.points || [0, 50, 50, 0, 100, 50];
    return {
      id: config.id || this.generateId(),
      type: 'triangle',
      x: config.x || 0,
      y: config.y || 0,
      points: points,
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      closed: true,
      opacity: config.opacity || 1,
      lineCap: config.lineCap || 'round',
      lineJoin: config.lineJoin || 'round',
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  createStarElement(config) {
    const { numPoints = 5, innerRadius = 20, outerRadius = 40 } = config;
    const points = this.generateStarPoints(numPoints, innerRadius, outerRadius);
    
    return {
      id: config.id || this.generateId(),
      type: 'star',
      x: config.x || 0,
      y: config.y || 0,
      points: points,
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      closed: true,
      opacity: config.opacity || 1,
      lineCap: config.lineCap || 'round',
      lineJoin: config.lineJoin || 'round',
      numPoints: numPoints,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  createCustomShapeElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'customShape',
      x: config.x || 0,
      y: config.y || 0,
      points: config.points || [],
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      closed: config.closed !== false,
      opacity: config.opacity || 1,
      lineCap: config.lineCap || 'round',
      lineJoin: config.lineJoin || 'round',
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  createLineElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'line',
      x: config.x || 0,
      y: config.y || 0,
      points: config.points || [0, 0, 100, 0],
      fill: config.fill || 'transparent',
      stroke: config.stroke || '#1F64BF',
      strokeWidth: config.strokeWidth || 2,
      closed: config.closed || false,
      opacity: config.opacity || 1,
      lineCap: config.lineCap || 'round',
      lineJoin: config.lineJoin || 'round',
      dash: config.dash || null,
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  // ==================== FORMAS PREDEFINIDAS ====================

  createHeartElement(config) {
    const points = this.generateHeartPoints();
    return {
      id: config.id || this.generateId(),
      type: 'customShape',
      x: config.x || 0,
      y: config.y || 0,
      points: points,
      fill: config.fill || '#FF69B4',
      stroke: config.stroke || '#FF1493',
      strokeWidth: config.strokeWidth || 2,
      closed: true,
      opacity: config.opacity || 1,
      lineCap: config.lineCap || 'round',
      lineJoin: config.lineJoin || 'round',
      shapeType: 'heart',
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  createArrowElement(config) {
    const { direction = 'right', size = 50 } = config;
    const points = this.generateArrowPoints(direction, size);
    return {
      id: config.id || this.generateId(),
      type: 'customShape',
      x: config.x || 0,
      y: config.y || 0,
      points: points,
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      closed: true,
      opacity: config.opacity || 1,
      lineCap: config.lineCap || 'round',
      lineJoin: config.lineJoin || 'round',
      shapeType: 'arrow',
      direction: direction,
      size: size,
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  // ==================== UTILIDADES DE GENERACIÓN ====================

  generateStarPoints(numPoints, innerRadius, outerRadius) {
    const points = [];
    const step = Math.PI / numPoints;
    
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      points.push(Math.cos(angle) * radius + outerRadius);
      points.push(Math.sin(angle) * radius + outerRadius);
    }
    
    return points;
  }

  generateHeartPoints() {
    // Genera puntos para una forma de corazón
    const points = [];
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
      points.push(x + 25, y + 25);
    }
    
    return points;
  }

  generateArrowPoints(direction, size) {
    const halfSize = size / 2;
    const quarterSize = size / 4;
    
    switch (direction) {
      case 'right':
        return [
          0, quarterSize,
          halfSize, quarterSize,
          halfSize, 0,
          size, halfSize,
          halfSize, size,
          halfSize, size - quarterSize,
          0, size - quarterSize
        ];
      case 'left':
        return [
          size, quarterSize,
          halfSize, quarterSize,
          halfSize, 0,
          0, halfSize,
          halfSize, size,
          halfSize, size - quarterSize,
          size, size - quarterSize
        ];
      case 'up':
        return [
          quarterSize, size,
          quarterSize, halfSize,
          0, halfSize,
          halfSize, 0,
          size, halfSize,
          size - quarterSize, halfSize,
          size - quarterSize, size
        ];
      case 'down':
        return [
          quarterSize, 0,
          quarterSize, halfSize,
          0, halfSize,
          halfSize, size,
          size, halfSize,
          size - quarterSize, halfSize,
          size - quarterSize, 0
        ];
      default:
        return this.generateArrowPoints('right', size);
    }
  }

  // ==================== MÉTODOS DE VALIDACIÓN ====================

  validateElement(element) {
    const errors = [];
    
    if (!element.id) {
      errors.push('ID del elemento requerido');
    }
    
    if (!element.type) {
      errors.push('Tipo de elemento requerido');
    }
    
    if (typeof element.x !== 'number' || typeof element.y !== 'number') {
      errors.push('Posición inválida (x, y deben ser números)');
    }
    
    // Validaciones específicas por tipo
    switch (element.type) {
      case 'text':
        if (!element.text || element.text.trim() === '') {
          errors.push('Texto no puede estar vacío');
        }
        break;
        
      case 'image':
        if (!element.imageUrl && !element.image) {
          errors.push('Imagen requerida (imageUrl o image)');
        }
        break;
        
      case 'triangle':
      case 'star':
      case 'customShape':
      case 'line':
        if (!element.points || element.points.length === 0) {
          errors.push('Puntos de la forma requeridos');
        }
        if (element.points && element.points.length < 6) {
          errors.push('La forma debe tener al menos 3 puntos (6 coordenadas)');
        }
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== MÉTODOS DE CONVERSIÓN ====================

  /**
   * Convierte un elemento del editor a formato compatible con el backend
   */
  toBackendFormat(element) {
    const { id, type, areaId, ...konvaAttrs } = element;
    
    // Validación especial para elementos de imagen
    if (type === 'image') {
      if (!konvaAttrs.imageUrl) {
        console.error('🖼️ [ElementFactory] Error: imageUrl faltante al convertir elemento de imagen:', {
          elementId: id,
          hasImageUrl: !!konvaAttrs.imageUrl,
          hasImage: !!konvaAttrs.image,
          originalName: konvaAttrs.originalName
        });
        throw new Error(`Elemento de imagen ${id} no tiene imageUrl válido`);
      }

      // El backend espera 'image' en lugar de 'imageUrl'
      const backendKonvaAttrs = {
        ...konvaAttrs,
        image: konvaAttrs.imageUrl, // Convertir imageUrl a image para el backend
        // Remover imageUrl ya que el backend no lo espera
        imageUrl: undefined
      };

      console.log('🖼️ [ElementFactory] Elemento de imagen convertido para backend:', {
        id: id,
        hasImage: !!backendKonvaAttrs.image,
        imageStart: backendKonvaAttrs.image?.substring(0, 50) + '...',
        originalName: konvaAttrs.originalName,
        width: konvaAttrs.width,
        height: konvaAttrs.height
      });

      return {
        id: id,
        type: type,
        areaId: areaId || 'default-area',
        konvaAttrs: backendKonvaAttrs
      };
    }
    
    return {
      id: id,
      type: type,
      areaId: areaId || 'default-area',
      konvaAttrs: {
        ...konvaAttrs
      }
    };
  }

  /**
   * Convierte un elemento del backend a formato del editor
   */
  fromBackendFormat(backendElement) {
    const { id, type, areaId, konvaAttrs } = backendElement;
    
    // Conversión especial para elementos de imagen
    if (type === 'image' && konvaAttrs.image) {
      const editorKonvaAttrs = {
        ...konvaAttrs,
        imageUrl: konvaAttrs.image, // Convertir image a imageUrl para el editor
        // Mantener image para compatibilidad
        image: konvaAttrs.image
      };

      console.log('🖼️ [ElementFactory] Elemento de imagen convertido del backend:', {
        id: id,
        hasImageUrl: !!editorKonvaAttrs.imageUrl,
        hasImage: !!editorKonvaAttrs.image,
        imageStart: editorKonvaAttrs.imageUrl?.substring(0, 50) + '...'
      });

      return {
        id: id,
        type: type,
        areaId: areaId,
        ...editorKonvaAttrs
      };
    }
    
    return {
      id: id,
      type: type,
      areaId: areaId,
      ...konvaAttrs
    };
  }
}
