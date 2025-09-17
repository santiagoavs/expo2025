// services/ValidationService.js
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

    if (!element.type) {
      errors.push('Tipo de elemento requerido');
    }

    if (typeof element.x !== 'number' || typeof element.y !== 'number') {
      errors.push('Posición inválida');
    }

    switch (element.type) {
      case 'text':
        if (!element.text || element.text.trim() === '') {
          errors.push('Texto vacío');
        }
        if (element.fontSize && (element.fontSize < 8 || element.fontSize > 200)) {
          errors.push('Tamaño de fuente inválido');
        }
        break;
      
      case 'image':
        if (!element.imageUrl && !element.image) {
          errors.push('Imagen requerida');
        }
        break;
      
      case 'rect':
      case 'circle':
        if (element.width && element.width <= 0) {
          errors.push('Ancho debe ser mayor que 0');
        }
        if (element.height && element.height <= 0) {
          errors.push('Alto debe ser mayor que 0');
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

    return errors;
  }

  calculateComplexity(elements) {
    if (!elements || elements.length === 0) return 'low';

    const totalElements = elements.length;
    const imageElements = elements.filter(el => el.type === 'image').length;
    const textElements = elements.filter(el => el.type === 'text').length;
    const shapeElements = elements.filter(el => ['rect', 'circle', 'line', 'triangle', 'star', 'customShape'].includes(el.type)).length;

    let complexityScore = 0;
    complexityScore += totalElements * 1;
    complexityScore += imageElements * 2;
    complexityScore += textElements * 1;
    complexityScore += shapeElements * 1.5;

    if (complexityScore <= 5) return 'low';
    if (complexityScore <= 12) return 'medium';
    return 'high';
  }
}
