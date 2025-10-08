// services/ElementFactory.js - FACTORY FOR ALL ELEMENT TYPES (CSS VERSION)
export class ElementFactory {
  generateId() {
    return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== BASIC ELEMENTS ====================

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
      rotation: config.rotation || 0,
      opacity: config.opacity || 1,
      visible: config.visible !== false,
      draggable: config.draggable !== false,
      listening: true, // Critical for event handling
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
      rotation: config.rotation || 0,
      visible: config.visible !== false,
      draggable: config.draggable !== false,
      listening: true, // Critical for event handling
      areaId: config.areaId || 'default-area',
      ...config
    };

    // Validate image source
    if (!imageElement.imageUrl && !imageElement.image) {
      console.warn('ElementFactory: Image element created without image source');
    }

    return imageElement;
  }

  createShapeElement(config) {
    const shapeType = config.shapeType || 'rect';
    
    const baseElement = {
      id: config.id || this.generateId(),
      type: 'shape',
      shapeType: shapeType,
      x: config.x || 0,
      y: config.y || 0,
      fill: config.fill || '#3F2724',
      stroke: config.stroke || '#000000',
      strokeWidth: config.strokeWidth || 0,
      opacity: config.opacity || 1,
      rotation: config.rotation || 0,
      visible: config.visible !== false,
      draggable: config.draggable !== false,
      listening: true, // Critical for event handling
      areaId: config.areaId || 'default-area',
      ...config
    };

    // Add shape-specific properties
    switch (shapeType) {
      case 'rect':
        return {
          ...baseElement,
          width: config.width || 100,
          height: config.height || 100,
          cornerRadius: config.cornerRadius || 0
        };
      
      case 'ellipse':
        return {
          ...baseElement,
          radius: config.radius || 50,
          scaleX: config.scaleX || 1, // ✅ Start neutral, let user control the stretch
          scaleY: config.scaleY || 1  // ✅ Start neutral, let user control the stretch
        };
      
      case 'line':
        return {
          ...baseElement,
          points: config.points || [0, 0, 100, 100],
          strokeWidth: config.strokeWidth || 2
        };
      
      case 'polygon':
        return {
          ...baseElement,
          points: config.points || [0, 0, 50, 100, 100, 0],
          closed: config.closed !== false
        };
      
      default:
        console.warn(`ElementFactory: Unknown shape type: ${shapeType}`);
        return baseElement;
    }
  }

  // ==================== ADVANCED ELEMENTS ====================

  createGroupElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'group',
      x: config.x || 0,
      y: config.y || 0,
      rotation: config.rotation || 0,
      scaleX: config.scaleX || 1,
      scaleY: config.scaleY || 1,
      opacity: config.opacity || 1,
      visible: config.visible !== false,
      draggable: config.draggable !== false,
      children: config.children || [],
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  // ==================== BACKEND CONVERSION ====================

  /**
   * Convierte un elemento del editor a formato compatible con el backend
   */
  toBackendFormat(element) {
    // ✅ DEBUGGING: Solo logs importantes para formas complejas
    if (['star', 'heart', 'diamond', 'hexagon', 'octagon', 'pentagon', 'polygon', 'shape', 'path', 'triangle', 'custom', 'line'].includes(element.type)) {
      console.log('🔍 [ElementFactory] Convirtiendo forma compleja:', {
        type: element.type,
        hasPoints: !!element.points,
        pointsLength: element.points?.length,
        points: element.points
      });
    }
    
    // Extraer propiedades del elemento
    const { 
      id, 
      type, 
      areaId, 
      draggable, 
      visible, 
      locked,
      shapeType, // Propiedad específica del frontend
      ...konvaAttrs 
    } = element;
    
    // Validación especial para elementos de imagen
    if (type === 'image') {
      // El backend espera 'image' en lugar de 'imageUrl'
      const backendKonvaAttrs = {
        ...konvaAttrs,
        image: konvaAttrs.imageUrl || konvaAttrs.image,
        imageUrl: undefined
      };

      return {
        id: id,
        type: type,
        areaId: areaId,
        konvaAttrs: backendKonvaAttrs
      };
    }
    
    // ✅ CORRECCIÓN CRÍTICA: Asegurar que todas las propiedades estén en konvaAttrs
    const backendKonvaAttrs = {
      ...konvaAttrs,
      draggable: draggable !== undefined ? draggable : true,
      visible: visible !== undefined ? visible : true,
      listening: true
    };
    
    const result = {
      id: id,
      type: type,
      areaId: areaId,
      konvaAttrs: backendKonvaAttrs
    };
    
    return result;
  }

  // ==================== ELEMENT VALIDATION ====================

  validateElement(element) {
    const errors = [];

    // Basic validation
    if (!element.id) {
      errors.push('Element ID is required');
    }

    if (!element.type) {
      errors.push('Element type is required');
    }

    if (typeof element.x !== 'number' || typeof element.y !== 'number') {
      errors.push('Element position (x, y) must be numbers');
    }
    
    // Type-specific validation
    switch (element.type) {
      case 'text':
        if (!element.text || element.text.trim() === '') {
          errors.push('Text element must have content');
        }
        break;
      
      case 'image':
        if (!element.imageUrl && !element.image) {
          errors.push('Image element must have imageUrl or image');
        }
        break;
      
      case 'shape':
        if (element.shapeType === 'polygon' && (!element.points || element.points.length < 6)) {
          errors.push('Polygon must have at least 3 points (6 coordinates)');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== UTILITY METHODS ====================

  generateId() {
    return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  cloneElement(element) {
    const cloned = { ...element };
    cloned.id = this.generateId();
    // Offset position slightly for visual distinction
    cloned.x = (cloned.x || 0) + 20;
    cloned.y = (cloned.y || 0) + 20;
    
    return cloned;
  }

  getElementBounds(element) {
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

  // ==================== ELEMENT TRANSFORMATIONS ====================

  transformElement(element, transformation) {
    const transformed = { ...element };
    
    if (transformation.translate) {
      transformed.x = (transformed.x || 0) + transformation.translate.x;
      transformed.y = (transformed.y || 0) + transformation.translate.y;
    }
    
    if (transformation.scale) {
      if (element.type === 'shape' && element.shapeType === 'circle') {
        transformed.radius = (transformed.radius || 50) * transformation.scale;
      } else {
        transformed.width = (transformed.width || 100) * transformation.scale;
        transformed.height = (transformed.height || 100) * transformation.scale;
      }
    }
    
    if (transformation.rotate) {
      transformed.rotation = (transformed.rotation || 0) + transformation.rotate;
    }
    
    return transformed;
  }

  // ==================== ELEMENT SERIALIZATION ====================

  serializeElement(element) {
    // Create a clean version for saving
    const serialized = {
      id: element.id,
      type: element.type,
      x: element.x,
      y: element.y,
      rotation: element.rotation || 0,
      opacity: element.opacity || 1,
      visible: element.visible !== false,
      areaId: element.areaId
    };

    // Add type-specific properties
    switch (element.type) {
      case 'text':
        Object.assign(serialized, {
          text: element.text,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fill: element.fill,
          width: element.width,
          align: element.align,
          fontWeight: element.fontWeight,
          fontStyle: element.fontStyle,
          textDecoration: element.textDecoration,
          lineHeight: element.lineHeight,
          letterSpacing: element.letterSpacing
        });
        break;

      case 'image':
        Object.assign(serialized, {
          width: element.width,
          height: element.height,
          imageUrl: element.imageUrl,
          originalName: element.originalName,
          crop: element.crop,
          filters: element.filters
        });
        break;

      case 'shape':
        Object.assign(serialized, {
          shapeType: element.shapeType,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth
        });
        
        if (element.shapeType === 'circle') {
          serialized.radius = element.radius;
        } else {
          serialized.width = element.width;
          serialized.height = element.height;
        }
        break;

      case 'group':
        serialized.children = element.children.map(child => this.serializeElement(child));
        break;
    }

    return serialized;
  }
}

// Export singleton instance
export const elementFactory = new ElementFactory();
