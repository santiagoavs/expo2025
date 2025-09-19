// services/ValidationService.js - SERVICIO DE VALIDACIÓN MEJORADO
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

    // Validaciones básicas
    if (!element.id) {
      errors.push('ID del elemento requerido');
    }

    if (!element.type) {
      errors.push('Tipo de elemento requerido');
    }

    if (typeof element.x !== 'number' || typeof element.y !== 'number') {
      errors.push('Posición inválida (x, y deben ser números)');
    }

    if (element.x < 0 || element.y < 0) {
      errors.push('Posición no puede ser negativa');
    }

    // Validaciones específicas por tipo
    switch (element.type) {
      case 'text':
        if (!element.text || element.text.trim() === '') {
          errors.push('Texto no puede estar vacío');
        }
        if (element.fontSize && (element.fontSize < 8 || element.fontSize > 200)) {
          errors.push('Tamaño de fuente inválido (8-200px)');
        }
        if (element.width && element.width <= 0) {
          errors.push('Ancho del texto debe ser mayor que 0');
        }
        break;
      
      case 'image':
        // Validación mejorada de imágenes
        if (!element.imageUrl && !element.image) {
          errors.push('Imagen requerida (imageUrl o image)');
        }
        
        // Validar que la URL de imagen sea válida si existe
        const imageSource = element.imageUrl || element.image;
        if (imageSource) {
          if (!this.isValidImageUrl(imageSource)) {
            console.warn('URL de imagen inválida detectada:', {
              elementId: element.id,
              imageSource: imageSource?.substring(0, 100) + '...',
              isValidBase64: this.isValidBase64Image(imageSource),
              isDataUrl: imageSource?.startsWith('data:'),
              hasImageUrl: !!element.imageUrl,
              hasImage: !!element.image
            });
            errors.push('URL de imagen inválida');
          }
        }
        
        // Validar dimensiones solo si están definidas
        if (element.width !== undefined && element.width <= 0) {
          errors.push('Ancho de imagen debe ser mayor que 0');
        }
        if (element.height !== undefined && element.height <= 0) {
          errors.push('Alto de imagen debe ser mayor que 0');
        }
        
        // Validar tamaño máximo solo si están definidas
        if (element.width && element.width > 2000) {
          errors.push('Ancho de imagen excede el máximo (2000px)');
        }
        if (element.height && element.height > 2000) {
          errors.push('Alto de imagen excede el máximo (2000px)');
        }
        
        // Validar opacidad
        if (element.opacity !== undefined && (element.opacity < 0 || element.opacity > 1)) {
          errors.push('Opacidad debe estar entre 0 y 1');
        }
        break;
      
      case 'rect':
        if (element.width && element.width <= 0) {
          errors.push('Ancho debe ser mayor que 0');
        }
        if (element.height && element.height <= 0) {
          errors.push('Alto debe ser mayor que 0');
        }
        if (element.cornerRadius && element.cornerRadius < 0) {
          errors.push('Radio de esquina no puede ser negativo');
        }
        break;
        
      case 'circle':
        if (element.radius && element.radius <= 0) {
          errors.push('Radio debe ser mayor que 0');
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
        if (element.points && element.points.length % 2 !== 0) {
          errors.push('Los puntos deben ser pares (coordenadas x,y)');
        }
        break;
        
      default:
        errors.push(`Tipo de elemento no soportado: ${element.type}`);
    }

    // Validaciones de área de personalización
    if (element.areaId && customizationAreas) {
      const area = customizationAreas.find(a => a.id === element.areaId || a._id === element.areaId);
      if (!area) {
        errors.push(`Área de personalización no encontrada: ${element.areaId}`);
      } else {
        // Validar que el elemento esté dentro del área
        if (area.position) {
          const elementRight = element.x + (element.width || 0);
          const elementBottom = element.y + (element.height || 0);
          const areaRight = area.position.x + area.position.width;
          const areaBottom = area.position.y + area.position.height;
          
          if (element.x < area.position.x || element.y < area.position.y ||
              elementRight > areaRight || elementBottom > areaBottom) {
            errors.push('Elemento fuera de los límites del área de personalización');
          }
        }
      }
    }

    return errors;
  }

  // ==================== VALIDACIONES DE IMÁGENES ====================

  isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    // Primero verificar si es base64 (más común en el editor)
    if (this.isValidBase64Image(url)) {
      return true;
    }
    
    // Si no es base64, verificar si es una URL válida
    try {
      const urlObj = new URL(url);
      // Verificar que sea http/https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Validar extensiones de imagen en la URL
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
      const hasValidExtension = validExtensions.some(ext => 
        url.toLowerCase().includes(ext)
      );
      
      return hasValidExtension;
    } catch {
      // Si no es una URL válida, retornar false
      return false;
    }
  }

  isValidBase64Image(base64) {
    if (!base64 || typeof base64 !== 'string') return false;
    
    // Verificar formato base64 de imagen - regex más flexible
    const base64ImageRegex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml|bmp|tiff|ico);base64,/i;
    return base64ImageRegex.test(base64);
  }

  validateImageFile(file) {
    const errors = [];
    
    if (!file) {
      errors.push('Archivo requerido');
      return errors;
    }
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      errors.push('El archivo debe ser una imagen');
    }
    
    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('El archivo es demasiado grande (máximo 10MB)');
    }
    
    // Validar dimensiones de la imagen
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > 4000 || img.height > 4000) {
          errors.push('Las dimensiones de la imagen son demasiado grandes (máximo 4000x4000px)');
        }
        if (img.width < 10 || img.height < 10) {
          errors.push('Las dimensiones de la imagen son demasiado pequeñas (mínimo 10x10px)');
        }
        resolve(errors);
      };
      img.onerror = () => {
        errors.push('No se pudo cargar la imagen');
        resolve(errors);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // ==================== VALIDACIONES DE DISEÑO ====================

  validateDesignStructure(designData) {
    const errors = [];
    
    if (!designData) {
      errors.push('Datos del diseño requeridos');
      return { isValid: false, errors };
    }
    
    if (!designData.elements || !Array.isArray(designData.elements)) {
      errors.push('Elementos del diseño requeridos');
    }
    
    if (designData.elements && designData.elements.length === 0) {
      errors.push('El diseño debe tener al menos un elemento');
    }
    
    if (designData.elements && designData.elements.length > 50) {
      errors.push('Demasiados elementos (máximo 50)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateBackendCompatibility(elements) {
    const errors = [];
    
    elements.forEach((element, index) => {
      // Verificar que el elemento tenga la estructura esperada por el backend
      if (!element.id) {
        errors.push(`Elemento ${index + 1}: ID requerido`);
      }
      
      if (!element.type) {
        errors.push(`Elemento ${index + 1}: Tipo requerido`);
      }
      
      if (!element.areaId) {
        errors.push(`Elemento ${index + 1}: Área de personalización requerida`);
      }
      
      // Verificar que las propiedades estén en el formato correcto
      const requiredProps = ['x', 'y'];
      requiredProps.forEach(prop => {
        if (typeof element[prop] !== 'number') {
          errors.push(`Elemento ${index + 1}: ${prop} debe ser un número`);
        }
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== CÁLCULO DE COMPLEJIDAD ====================

  calculateComplexity(elements) {
    if (!elements || elements.length === 0) return 'low';

    const totalElements = elements.length;
    const imageElements = elements.filter(el => el.type === 'image').length;
    const textElements = elements.filter(el => el.type === 'text').length;
    const shapeElements = elements.filter(el => 
      ['rect', 'circle', 'line', 'triangle', 'star', 'customShape'].includes(el.type)
    ).length;

    let complexityScore = 0;
    complexityScore += totalElements * 1;
    complexityScore += imageElements * 2;
    complexityScore += textElements * 1;
    complexityScore += shapeElements * 1.5;

    // Penalizar elementos con efectos complejos
    elements.forEach(element => {
      if (element.filters && element.filters.length > 0) {
        complexityScore += element.filters.length * 0.5;
      }
      if (element.opacity && element.opacity < 1) {
        complexityScore += 0.3;
      }
    });

    if (complexityScore <= 5) return 'low';
    if (complexityScore <= 12) return 'medium';
    return 'high';
  }

  // ==================== UTILIDADES ====================

  getValidationSummary(elements) {
    const summary = {
      total: elements.length,
      byType: {},
      issues: [],
      complexity: this.calculateComplexity(elements)
    };
    
    elements.forEach(element => {
      summary.byType[element.type] = (summary.byType[element.type] || 0) + 1;
      
      const validation = this.validateElement(element);
      if (!validation.isValid) {
        summary.issues.push({
          elementId: element.id,
          errors: validation.errors
        });
      }
    });
    
    return summary;
  }
}
