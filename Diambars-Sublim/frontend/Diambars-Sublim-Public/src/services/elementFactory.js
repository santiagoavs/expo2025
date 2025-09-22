// Element Factory Service - Adapted from Private Admin for Public Project
// Handles creation and management of design elements with validation

export class ElementFactory {
  static createTextElement(options = {}) {
    const {
      x = 50,
      y = 50,
      text = 'Nuevo texto',
      fontSize = 24,
      fontFamily = 'Arial',
      fill = '#000000',
      align = 'left',
      areaId = 'area-1'
    } = options;

    return {
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      areaId,
      konvaAttrs: {
        x,
        y,
        text,
        fontSize,
        fontFamily,
        fill,
        align,
        rotation: 0,
        visible: true
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
  }

  static createImageElement(options = {}) {
    const {
      x = 50,
      y = 50,
      width = 200,
      height = 150,
      image,
      areaId = 'area-1'
    } = options;

    if (!image) {
      throw new Error('Image source is required for image elements');
    }

    return {
      id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'image',
      areaId,
      konvaAttrs: {
        x,
        y,
        width,
        height,
        image,
        rotation: 0,
        visible: true
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        originalImage: image
      }
    };
  }

  static createShapeElement(shapeType = 'rect', options = {}) {
    const {
      x = 50,
      y = 50,
      fill = '#3F2724',
      stroke = '#000000',
      strokeWidth = 0,
      areaId = 'area-1'
    } = options;

    const baseElement = {
      id: `${shapeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'shape',
      shapeType,
      areaId,
      konvaAttrs: {
        x,
        y,
        fill,
        stroke,
        strokeWidth,
        rotation: 0,
        visible: true
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };

    // Add shape-specific attributes
    if (shapeType === 'circle') {
      baseElement.konvaAttrs.radius = options.radius || 50;
    } else if (shapeType === 'rect') {
      baseElement.konvaAttrs.width = options.width || 100;
      baseElement.konvaAttrs.height = options.height || 100;
    }

    return baseElement;
  }

  static updateElement(element, updates) {
    if (!element || !element.id) {
      throw new Error('Invalid element provided for update');
    }

    return {
      ...element,
      konvaAttrs: {
        ...element.konvaAttrs,
        ...updates
      },
      metadata: {
        ...element.metadata,
        lastModified: new Date().toISOString()
      }
    };
  }

  static cloneElement(element, offsetX = 20, offsetY = 20) {
    if (!element || !element.id) {
      throw new Error('Invalid element provided for cloning');
    }

    const clonedElement = {
      ...element,
      id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      konvaAttrs: {
        ...element.konvaAttrs,
        x: (element.konvaAttrs.x || 0) + offsetX,
        y: (element.konvaAttrs.y || 0) + offsetY
      },
      metadata: {
        ...element.metadata,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        clonedFrom: element.id
      }
    };

    return clonedElement;
  }

  static validateElement(element) {
    const errors = [];

    if (!element) {
      errors.push('Element is required');
      return { isValid: false, errors };
    }

    if (!element.id) {
      errors.push('Element ID is required');
    }

    if (!element.type) {
      errors.push('Element type is required');
    }

    if (!element.konvaAttrs) {
      errors.push('Element konvaAttrs are required');
    } else {
      // Validate based on element type
      switch (element.type) {
        case 'text':
          if (!element.konvaAttrs.text) {
            errors.push('Text content is required for text elements');
          }
          if (!element.konvaAttrs.fontSize || element.konvaAttrs.fontSize <= 0) {
            errors.push('Valid font size is required for text elements');
          }
          break;

        case 'image':
          if (!element.konvaAttrs.image) {
            errors.push('Image source is required for image elements');
          }
          if (!element.konvaAttrs.width || element.konvaAttrs.width <= 0) {
            errors.push('Valid width is required for image elements');
          }
          if (!element.konvaAttrs.height || element.konvaAttrs.height <= 0) {
            errors.push('Valid height is required for image elements');
          }
          break;

        case 'shape':
          if (!element.shapeType) {
            errors.push('Shape type is required for shape elements');
          }
          if (element.shapeType === 'circle' && (!element.konvaAttrs.radius || element.konvaAttrs.radius <= 0)) {
            errors.push('Valid radius is required for circle elements');
          }
          if (element.shapeType === 'rect') {
            if (!element.konvaAttrs.width || element.konvaAttrs.width <= 0) {
              errors.push('Valid width is required for rectangle elements');
            }
            if (!element.konvaAttrs.height || element.konvaAttrs.height <= 0) {
              errors.push('Valid height is required for rectangle elements');
            }
          }
          break;

        default:
          errors.push(`Unknown element type: ${element.type}`);
      }

      // Validate position
      if (typeof element.konvaAttrs.x !== 'number') {
        errors.push('Valid x position is required');
      }
      if (typeof element.konvaAttrs.y !== 'number') {
        errors.push('Valid y position is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static getElementBounds(element) {
    if (!element || !element.konvaAttrs) {
      return null;
    }

    const { x = 0, y = 0, rotation = 0 } = element.konvaAttrs;
    let width = 0, height = 0;

    switch (element.type) {
      case 'text':
        // Approximate text bounds (would need actual measurement in real implementation)
        const fontSize = element.konvaAttrs.fontSize || 24;
        const textLength = (element.konvaAttrs.text || '').length;
        width = textLength * fontSize * 0.6; // Approximate
        height = fontSize * 1.2;
        break;

      case 'image':
        width = element.konvaAttrs.width || 0;
        height = element.konvaAttrs.height || 0;
        break;

      case 'shape':
        if (element.shapeType === 'circle') {
          const radius = element.konvaAttrs.radius || 0;
          width = height = radius * 2;
        } else {
          width = element.konvaAttrs.width || 0;
          height = element.konvaAttrs.height || 0;
        }
        break;
    }

    return {
      x,
      y,
      width,
      height,
      rotation,
      centerX: x + width / 2,
      centerY: y + height / 2
    };
  }

  static isElementInArea(element, area) {
    if (!element || !area || !area.scaledPosition) {
      return false;
    }

    const elementBounds = this.getElementBounds(element);
    if (!elementBounds) return false;

    const areaX = area.scaledPosition.x;
    const areaY = area.scaledPosition.y;
    const areaWidth = area.scaledPosition.width;
    const areaHeight = area.scaledPosition.height;

    // Check if element center is within area bounds
    return (
      elementBounds.centerX >= areaX &&
      elementBounds.centerX <= areaX + areaWidth &&
      elementBounds.centerY >= areaY &&
      elementBounds.centerY <= areaY + areaHeight
    );
  }

  static snapToGrid(value, gridSize = 10) {
    return Math.round(value / gridSize) * gridSize;
  }

  static constrainToArea(element, area) {
    if (!element || !area || !area.scaledPosition) {
      return element;
    }

    const elementBounds = this.getElementBounds(element);
    if (!elementBounds) return element;

    const areaX = area.scaledPosition.x;
    const areaY = area.scaledPosition.y;
    const areaWidth = area.scaledPosition.width;
    const areaHeight = area.scaledPosition.height;

    let newX = element.konvaAttrs.x;
    let newY = element.konvaAttrs.y;

    // Constrain X position
    if (newX < areaX) {
      newX = areaX;
    } else if (newX + elementBounds.width > areaX + areaWidth) {
      newX = areaX + areaWidth - elementBounds.width;
    }

    // Constrain Y position
    if (newY < areaY) {
      newY = areaY;
    } else if (newY + elementBounds.height > areaY + areaHeight) {
      newY = areaY + areaHeight - elementBounds.height;
    }

    return this.updateElement(element, { x: newX, y: newY });
  }
}

export default ElementFactory;
