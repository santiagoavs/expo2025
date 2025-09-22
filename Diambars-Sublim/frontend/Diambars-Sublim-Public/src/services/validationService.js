// Validation Service - Adapted from Private Admin for Public Project
// Handles validation of design elements, canvas state, and export requirements

export class ValidationService {
  static validateDesign(design) {
    const errors = [];
    const warnings = [];

    if (!design) {
      errors.push('Design object is required');
      return { isValid: false, errors, warnings };
    }

    // Validate basic design structure
    if (!design.elements || !Array.isArray(design.elements)) {
      errors.push('Design must contain an elements array');
    } else {
      // Validate each element
      design.elements.forEach((element, index) => {
        const elementValidation = this.validateElement(element);
        if (!elementValidation.isValid) {
          errors.push(`Element ${index + 1}: ${elementValidation.errors.join(', ')}`);
        }
      });

      // Check for empty design
      if (design.elements.length === 0) {
        warnings.push('Design contains no elements');
      }

      // Check for overlapping elements
      const overlaps = this.checkElementOverlaps(design.elements);
      if (overlaps.length > 0) {
        warnings.push(`Found ${overlaps.length} overlapping elements`);
      }
    }

    // Validate product information
    if (!design.productId && !design.product) {
      warnings.push('No product associated with design');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      elementCount: design.elements?.length || 0,
      overlaps: this.checkElementOverlaps(design.elements || [])
    };
  }

  static validateElement(element) {
    const errors = [];
    const warnings = [];

    if (!element) {
      errors.push('Element is required');
      return { isValid: false, errors, warnings };
    }

    // Basic element validation
    if (!element.id) {
      errors.push('Element ID is required');
    }

    if (!element.type) {
      errors.push('Element type is required');
    }

    if (!element.konvaAttrs) {
      errors.push('Element konvaAttrs are required');
      return { isValid: false, errors, warnings };
    }

    const attrs = element.konvaAttrs;

    // Position validation
    if (typeof attrs.x !== 'number' || isNaN(attrs.x)) {
      errors.push('Valid x position is required');
    }

    if (typeof attrs.y !== 'number' || isNaN(attrs.y)) {
      errors.push('Valid y position is required');
    }

    // Type-specific validation
    switch (element.type) {
      case 'text':
        this.validateTextElement(element, errors, warnings);
        break;
      case 'image':
        this.validateImageElement(element, errors, warnings);
        break;
      case 'shape':
        this.validateShapeElement(element, errors, warnings);
        break;
      default:
        errors.push(`Unknown element type: ${element.type}`);
    }

    // Canvas bounds validation
    const boundsCheck = this.validateElementBounds(element);
    if (!boundsCheck.isValid) {
      warnings.push(...boundsCheck.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateTextElement(element, errors, warnings) {
    const attrs = element.konvaAttrs;

    if (!attrs.text || attrs.text.trim() === '') {
      warnings.push('Text element is empty');
    }

    if (!attrs.fontSize || attrs.fontSize <= 0) {
      errors.push('Valid font size is required');
    } else if (attrs.fontSize > 200) {
      warnings.push('Font size is very large (>200px)');
    } else if (attrs.fontSize < 8) {
      warnings.push('Font size is very small (<8px)');
    }

    if (!attrs.fontFamily) {
      warnings.push('Font family not specified, using default');
    }

    if (!attrs.fill) {
      warnings.push('Text color not specified, using default');
    }

    // Check text length
    if (attrs.text && attrs.text.length > 500) {
      warnings.push('Text is very long (>500 characters)');
    }
  }

  static validateImageElement(element, errors, warnings) {
    const attrs = element.konvaAttrs;

    if (!attrs.image) {
      errors.push('Image source is required');
    }

    if (!attrs.width || attrs.width <= 0) {
      errors.push('Valid width is required for image');
    } else if (attrs.width > 2000) {
      warnings.push('Image width is very large (>2000px)');
    }

    if (!attrs.height || attrs.height <= 0) {
      errors.push('Valid height is required for image');
    } else if (attrs.height > 2000) {
      warnings.push('Image height is very large (>2000px)');
    }

    // Check aspect ratio preservation
    if (attrs.width && attrs.height) {
      const aspectRatio = attrs.width / attrs.height;
      if (aspectRatio > 10 || aspectRatio < 0.1) {
        warnings.push('Image has extreme aspect ratio');
      }
    }
  }

  static validateShapeElement(element, errors, warnings) {
    const attrs = element.konvaAttrs;

    if (!element.shapeType) {
      errors.push('Shape type is required');
      return;
    }

    switch (element.shapeType) {
      case 'rect':
        if (!attrs.width || attrs.width <= 0) {
          errors.push('Valid width is required for rectangle');
        }
        if (!attrs.height || attrs.height <= 0) {
          errors.push('Valid height is required for rectangle');
        }
        break;

      case 'circle':
        if (!attrs.radius || attrs.radius <= 0) {
          errors.push('Valid radius is required for circle');
        } else if (attrs.radius > 500) {
          warnings.push('Circle radius is very large (>500px)');
        }
        break;

      default:
        errors.push(`Unknown shape type: ${element.shapeType}`);
    }

    // Validate colors
    if (attrs.fill && !this.isValidColor(attrs.fill)) {
      warnings.push('Invalid fill color format');
    }

    if (attrs.stroke && !this.isValidColor(attrs.stroke)) {
      warnings.push('Invalid stroke color format');
    }

    if (attrs.strokeWidth && (attrs.strokeWidth < 0 || attrs.strokeWidth > 50)) {
      warnings.push('Stroke width should be between 0 and 50');
    }
  }

  static validateElementBounds(element, canvasWidth = 800, canvasHeight = 600) {
    const warnings = [];
    const attrs = element.konvaAttrs;

    if (!attrs) return { isValid: true, warnings };

    const x = attrs.x || 0;
    const y = attrs.y || 0;

    // Get element dimensions
    let width = 0, height = 0;
    
    switch (element.type) {
      case 'text':
        // Approximate text dimensions
        const fontSize = attrs.fontSize || 24;
        const textLength = (attrs.text || '').length;
        width = textLength * fontSize * 0.6;
        height = fontSize * 1.2;
        break;
      case 'image':
        width = attrs.width || 0;
        height = attrs.height || 0;
        break;
      case 'shape':
        if (element.shapeType === 'circle') {
          const radius = attrs.radius || 0;
          width = height = radius * 2;
        } else {
          width = attrs.width || 0;
          height = attrs.height || 0;
        }
        break;
    }

    // Check if element is outside canvas bounds
    if (x < 0) warnings.push('Element extends beyond left canvas edge');
    if (y < 0) warnings.push('Element extends beyond top canvas edge');
    if (x + width > canvasWidth) warnings.push('Element extends beyond right canvas edge');
    if (y + height > canvasHeight) warnings.push('Element extends beyond bottom canvas edge');

    // Check if element is completely outside canvas
    if (x > canvasWidth || y > canvasHeight || x + width < 0 || y + height < 0) {
      warnings.push('Element is completely outside canvas bounds');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  static checkElementOverlaps(elements) {
    const overlaps = [];
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        if (this.elementsOverlap(elements[i], elements[j])) {
          overlaps.push({
            element1: elements[i].id,
            element2: elements[j].id
          });
        }
      }
    }

    return overlaps;
  }

  static elementsOverlap(element1, element2) {
    const bounds1 = this.getElementBounds(element1);
    const bounds2 = this.getElementBounds(element2);

    if (!bounds1 || !bounds2) return false;

    return !(
      bounds1.x + bounds1.width < bounds2.x ||
      bounds2.x + bounds2.width < bounds1.x ||
      bounds1.y + bounds1.height < bounds2.y ||
      bounds2.y + bounds2.height < bounds1.y
    );
  }

  static getElementBounds(element) {
    if (!element || !element.konvaAttrs) return null;

    const attrs = element.konvaAttrs;
    const x = attrs.x || 0;
    const y = attrs.y || 0;
    let width = 0, height = 0;

    switch (element.type) {
      case 'text':
        const fontSize = attrs.fontSize || 24;
        const textLength = (attrs.text || '').length;
        width = textLength * fontSize * 0.6;
        height = fontSize * 1.2;
        break;
      case 'image':
        width = attrs.width || 0;
        height = attrs.height || 0;
        break;
      case 'shape':
        if (element.shapeType === 'circle') {
          const radius = attrs.radius || 0;
          width = height = radius * 2;
        } else {
          width = attrs.width || 0;
          height = attrs.height || 0;
        }
        break;
    }

    return { x, y, width, height };
  }

  static isValidColor(color) {
    if (!color || typeof color !== 'string') return false;

    // Check hex colors
    if (color.match(/^#([0-9A-F]{3}){1,2}$/i)) return true;

    // Check rgb/rgba colors
    if (color.match(/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/i)) return true;

    // Check named colors (basic set)
    const namedColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'grey', 'transparent'
    ];
    
    return namedColors.includes(color.toLowerCase());
  }

  static validateForExport(design) {
    const validation = this.validateDesign(design);
    const exportErrors = [];
    const exportWarnings = [...validation.warnings];

    // Additional export-specific validation
    if (!design.elements || design.elements.length === 0) {
      exportErrors.push('Cannot export empty design');
    }

    // Check for elements outside canvas bounds
    design.elements?.forEach((element, index) => {
      const boundsCheck = this.validateElementBounds(element);
      if (!boundsCheck.isValid) {
        exportWarnings.push(`Element ${index + 1} extends outside canvas bounds`);
      }
    });

    // Check for very small elements that might not be visible
    design.elements?.forEach((element, index) => {
      const bounds = this.getElementBounds(element);
      if (bounds && (bounds.width < 5 || bounds.height < 5)) {
        exportWarnings.push(`Element ${index + 1} is very small and might not be visible`);
      }
    });

    return {
      isValid: validation.isValid && exportErrors.length === 0,
      errors: [...validation.errors, ...exportErrors],
      warnings: exportWarnings,
      canExport: validation.isValid && exportErrors.length === 0
    };
  }

  static getValidationSummary(design) {
    const validation = this.validateDesign(design);
    
    return {
      isValid: validation.isValid,
      elementCount: validation.elementCount,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length,
      overlapCount: validation.overlaps.length,
      canExport: this.validateForExport(design).canExport
    };
  }
}

export default ValidationService;
