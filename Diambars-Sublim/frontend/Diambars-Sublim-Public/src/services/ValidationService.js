// services/ValidationService.js - VALIDATION SERVICE (CSS VERSION)
export class ValidationService {
  validateDesign(elements, customizationAreas) {
    const errors = [];
    
    if (!elements || elements.length === 0) {
      errors.push('El diseño debe tener al menos un elemento');
    }

    elements.forEach((element, index) => {
      const elementErrors = this.validateElement(element, customizationAreas);
      errors.push(...elementErrors.map(error => `Elemento ${index + 1}: ${error}`));
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateElement(element, customizationAreas) {
    const errors = [];

    // Basic validation
    if (!element.id) {
      errors.push('ID del elemento requerido');
    }

    if (!element.type) {
      errors.push('Tipo de elemento requerido');
    }

    if (typeof element.x !== 'number' || typeof element.y !== 'number') {
      errors.push('Posición inválida (x, y deben ser números)');
    }

    // Type-specific validation
    switch (element.type) {
      case 'text':
        this.validateTextElement(element, errors);
        break;
      case 'image':
        this.validateImageElement(element, errors);
        break;
      case 'shape':
        this.validateShapeElement(element, errors);
        break;
      case 'group':
        this.validateGroupElement(element, errors);
        break;
      default:
        errors.push(`Tipo de elemento desconocido: ${element.type}`);
    }

    // Area validation
    if (customizationAreas && customizationAreas.length > 0) {
      this.validateElementInArea(element, customizationAreas, errors);
    }

    return errors;
  }

  validateTextElement(element, errors) {
    if (element.text === undefined || element.text === null) {
      errors.push('Texto requerido');
    }

    if (element.fontSize && (element.fontSize < 1 || element.fontSize > 500)) {
      errors.push('Tamaño de fuente debe estar entre 1 y 500');
    }

    if (element.width && element.width <= 0) {
      errors.push('Ancho del texto debe ser positivo');
    }

    if (element.fontFamily && typeof element.fontFamily !== 'string') {
      errors.push('Familia de fuente debe ser una cadena');
    }

    if (element.fill && !this.isValidColor(element.fill)) {
      errors.push('Color de texto inválido');
    }

    if (element.align && !['left', 'center', 'right', 'justify'].includes(element.align)) {
      errors.push('Alineación de texto inválida');
    }

    if (element.lineHeight && (element.lineHeight < 0.5 || element.lineHeight > 5)) {
      errors.push('Altura de línea debe estar entre 0.5 y 5');
    }
  }

  validateImageElement(element, errors) {
    if (!element.imageUrl && !element.image) {
      errors.push('URL de imagen o datos de imagen requeridos');
    }

    if (element.width && element.width <= 0) {
      errors.push('Ancho de imagen debe ser positivo');
    }

    if (element.height && element.height <= 0) {
      errors.push('Alto de imagen debe ser positivo');
    }

    if (element.opacity && (element.opacity < 0 || element.opacity > 1)) {
      errors.push('Opacidad debe estar entre 0 y 1');
    }

    if (element.crop && !this.isValidCrop(element.crop)) {
      errors.push('Configuración de recorte inválida');
    }
  }

  validateShapeElement(element, errors) {
    if (!element.shapeType) {
      errors.push('Tipo de forma requerido');
    }

    const validShapeTypes = ['rect', 'circle', 'ellipse', 'line', 'polygon'];
    if (element.shapeType && !validShapeTypes.includes(element.shapeType)) {
      errors.push(`Tipo de forma inválido: ${element.shapeType}`);
    }

    if (element.fill && !this.isValidColor(element.fill)) {
      errors.push('Color de relleno inválido');
    }

    if (element.stroke && !this.isValidColor(element.stroke)) {
      errors.push('Color de borde inválido');
    }

    if (element.strokeWidth && element.strokeWidth < 0) {
      errors.push('Grosor de borde debe ser positivo');
    }

    // Shape-specific validation
    switch (element.shapeType) {
      case 'rect':
        if (element.width && element.width <= 0) {
          errors.push('Ancho del rectángulo debe ser positivo');
        }
        if (element.height && element.height <= 0) {
          errors.push('Alto del rectángulo debe ser positivo');
        }
        break;

      case 'circle':
        if (element.radius && element.radius <= 0) {
          errors.push('Radio del círculo debe ser positivo');
        }
        break;

      case 'ellipse':
        if (element.radiusX && element.radiusX <= 0) {
          errors.push('Radio X de la elipse debe ser positivo');
        }
        if (element.radiusY && element.radiusY <= 0) {
          errors.push('Radio Y de la elipse debe ser positivo');
        }
        break;

      case 'line':
        if (!element.points || !Array.isArray(element.points) || element.points.length < 4) {
          errors.push('Línea debe tener al menos 2 puntos (4 coordenadas)');
        }
        break;

      case 'polygon':
        if (!element.points || !Array.isArray(element.points) || element.points.length < 6) {
          errors.push('Polígono debe tener al menos 3 puntos (6 coordenadas)');
        }
        break;
    }
  }

  validateGroupElement(element, errors) {
    if (!element.children || !Array.isArray(element.children)) {
      errors.push('Grupo debe tener un array de elementos hijos');
    }

    if (element.children && element.children.length === 0) {
      errors.push('Grupo no puede estar vacío');
    }

    // Validate children recursively
    if (element.children) {
      element.children.forEach((child, index) => {
        const childErrors = this.validateElement(child);
        errors.push(...childErrors.map(error => `Hijo ${index + 1}: ${error}`));
      });
    }
  }

  validateElementInArea(element, customizationAreas, errors) {
    if (!element.areaId) {
      errors.push('Elemento debe estar asignado a un área de personalización');
      return;
    }

    const area = customizationAreas.find(a => a._id === element.areaId || a.id === element.areaId);
    if (!area) {
      errors.push(`Área de personalización no encontrada: ${element.areaId}`);
      return;
    }

    // Check if element is within area bounds
    const elementBounds = this.getElementBounds(element);
    const areaBounds = {
      x: area.position?.x || 0,
      y: area.position?.y || 0,
      width: area.position?.width || 200,
      height: area.position?.height || 100
    };

    if (elementBounds.x < areaBounds.x || 
        elementBounds.y < areaBounds.y ||
        elementBounds.x + elementBounds.width > areaBounds.x + areaBounds.width ||
        elementBounds.y + elementBounds.height > areaBounds.y + areaBounds.height) {
      errors.push('Elemento está fuera del área de personalización permitida');
    }
  }

  // ==================== UTILITY METHODS ====================

  isValidColor(color) {
    if (typeof color !== 'string') return false;
    
    // Check hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }
    
    // Check rgb/rgba colors
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
      return true;
    }
    
    // Check named colors (basic set)
    const namedColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'grey', 'transparent'
    ];
    
    return namedColors.includes(color.toLowerCase());
  }

  isValidCrop(crop) {
    if (!crop || typeof crop !== 'object') return false;
    
    const requiredProps = ['x', 'y', 'width', 'height'];
    return requiredProps.every(prop => 
      typeof crop[prop] === 'number' && crop[prop] >= 0
    );
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
    
    return { x, y, width, height };
  }

  // ==================== DESIGN VALIDATION ====================

  validateDesignForExport(design) {
    const errors = [];
    
    if (!design.name || design.name.trim().length === 0) {
      errors.push('Nombre del diseño requerido');
    }

    if (!design.elements || design.elements.length === 0) {
      errors.push('Diseño debe tener al menos un elemento');
    }

    if (!design.productId) {
      errors.push('ID del producto requerido');
    }

    // Validate all elements
    if (design.elements) {
      design.elements.forEach((element, index) => {
        const elementValidation = this.validateElement(element);
        if (elementValidation.length > 0) {
          errors.push(`Elemento ${index + 1}: ${elementValidation.join(', ')}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateDesignForSave(design) {
    const errors = [];
    
    if (!design.name || design.name.trim().length === 0) {
      errors.push('Nombre del diseño requerido para guardar');
    }

    if (design.name && design.name.length > 100) {
      errors.push('Nombre del diseño no puede exceder 100 caracteres');
    }

    if (design.clientNotes && design.clientNotes.length > 1000) {
      errors.push('Notas del cliente no pueden exceder 1000 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== PERFORMANCE VALIDATION ====================

  validateDesignComplexity(design) {
    const warnings = [];
    const elementCount = design.elements?.length || 0;
    
    if (elementCount > 50) {
      warnings.push('Diseño con muchos elementos puede afectar el rendimiento');
    }

    if (design.elements) {
      const imageCount = design.elements.filter(el => el.type === 'image').length;
      if (imageCount > 10) {
        warnings.push('Muchas imágenes pueden afectar el tiempo de carga');
      }

      const textElements = design.elements.filter(el => el.type === 'text');
      const largeTextCount = textElements.filter(el => (el.fontSize || 24) > 100).length;
      if (largeTextCount > 5) {
        warnings.push('Muchos textos grandes pueden afectar el rendimiento');
      }
    }

    return {
      complexity: elementCount > 30 ? 'high' : elementCount > 15 ? 'medium' : 'low',
      warnings
    };
  }
}

// Export singleton instance
export const validationService = new ValidationService();
