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

  // ==================== FORMAS ADICIONALES DEL EDITOR ====================

  createSquareElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'square',
      x: config.x || 0,
      y: config.y || 0,
      width: config.width || 80,
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

  createEllipseElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'ellipse',
      x: config.x || 0,
      y: config.y || 0,
      radius: config.radius || 50,
      scaleX: config.scaleX || 1.2,
      scaleY: config.scaleY || 0.8,
      fill: config.fill || '#1F64BF',
      stroke: config.stroke || '#032CA6',
      strokeWidth: config.strokeWidth || 2,
      opacity: config.opacity || 1,
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  createHeartElement(config) {
    const points = this.generateHeartPoints();
    return {
      id: config.id || this.generateId(),
      type: 'heart',
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
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  createDiamondElement(config) {
    const points = [50, 0, 100, 50, 50, 100, 0, 50];
    return {
      id: config.id || this.generateId(),
      type: 'diamond',
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

  createHexagonElement(config) {
    const points = this.generateHexagonPoints(config.radius || 50);
    return {
      id: config.id || this.generateId(),
      type: 'hexagon',
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

  createOctagonElement(config) {
    const points = this.generateOctagonPoints(config.radius || 50);
    return {
      id: config.id || this.generateId(),
      type: 'octagon',
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

  createPentagonElement(config) {
    const points = this.generatePentagonPoints(config.radius || 50);
    return {
      id: config.id || this.generateId(),
      type: 'pentagon',
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

  createPolygonElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'polygon',
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
      tension: config.tension || 0,
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  createShapeElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'shape',
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
      tension: config.tension || 0,
      areaId: config.areaId || 'default-area',
      ...config
    };
  }

  createPathElement(config) {
    return {
      id: config.id || this.generateId(),
      type: 'path',
      x: config.x || 0,
      y: config.y || 0,
      points: config.points || [],
      fill: config.fill || 'transparent',
      stroke: config.stroke || '#1F64BF',
      strokeWidth: config.strokeWidth || 2,
      closed: config.closed || false,
      opacity: config.opacity || 1,
      lineCap: config.lineCap || 'round',
      lineJoin: config.lineJoin || 'round',
      tension: config.tension || 0,
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
    // Genera puntos para una forma de corazón más simple
    const points = [];
    const centerX = 25;
    const centerY = 25;
    const size = 15;
    
    const heartPoints = [
      [centerX, centerY + 10], // Punto inferior
      [centerX - 8, centerY + 5], // Lado izquierdo inferior
      [centerX - 12, centerY - 2], // Lado izquierdo medio
      [centerX - 8, centerY - 8], // Lado izquierdo superior
      [centerX, centerY - 12], // Punto superior izquierdo
      [centerX + 8, centerY - 8], // Punto superior derecho
      [centerX + 12, centerY - 2], // Lado derecho medio
      [centerX + 8, centerY + 5], // Lado derecho inferior
    ];
    
    // Convertir a array plano
    heartPoints.forEach(point => {
      points.push(point[0], point[1]);
    });
    
    return points;
  }

  generateHexagonPoints(radius) {
    const points = [];
    const centerX = radius;
    const centerY = radius;
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(x, y);
    }
    
    return points;
  }

  generateOctagonPoints(radius) {
    const points = [];
    const centerX = radius;
    const centerY = radius;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(x, y);
    }
    
    return points;
  }

  generatePentagonPoints(radius) {
    const points = [];
    const centerX = radius;
    const centerY = radius;
    
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(x, y);
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
      case 'heart':
      case 'diamond':
      case 'hexagon':
      case 'octagon':
      case 'pentagon':
      case 'polygon':
      case 'shape':
      case 'path':
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
    // ✅ DEBUGGING: Solo logs importantes para formas complejas
    if (['star', 'heart', 'diamond', 'hexagon', 'octagon', 'pentagon', 'polygon', 'shape', 'path'].includes(element.type)) {
      console.log('🔍 [ElementFactory] Convirtiendo forma compleja:', {
        type: element.type,
        hasPoints: !!element.points,
        pointsLength: element.points?.length,
        points: element.points
      });
    }
    
    // ✅ DEBUGGING: Log específico para texto
    if (element.type === 'text') {
      console.log('🔍 [ElementFactory] Convirtiendo texto:', {
        type: element.type,
        text: element.text,
        hasText: !!element.text,
        textLength: element.text?.length,
        konvaAttrs: element.konvaAttrs
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
      // Verificar si tiene imageUrl o image válido
      if (!konvaAttrs.imageUrl && !konvaAttrs.image) {
        console.error('🖼️ [ElementFactory] Error: Ni imageUrl ni image válidos al convertir elemento de imagen:', {
          elementId: id,
          hasImageUrl: !!konvaAttrs.imageUrl,
          hasImage: !!konvaAttrs.image,
          originalName: konvaAttrs.originalName
        });
        throw new Error(`Elemento de imagen ${id} no tiene imageUrl ni image válido`);
      }

      // El backend espera 'image' en lugar de 'imageUrl'
      const backendKonvaAttrs = {
        ...konvaAttrs,
        // Si tiene imageUrl, usarlo como image; si no, mantener el image existente
        image: konvaAttrs.imageUrl || konvaAttrs.image,
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
    
    // ✅ CORRECCIÓN CRÍTICA: Asegurar que todas las propiedades estén en konvaAttrs
    const backendKonvaAttrs = {
      ...konvaAttrs,
      // Asegurar que las propiedades básicas estén presentes
      draggable: draggable !== undefined ? draggable : true,
      visible: visible !== undefined ? visible : true,
      listening: true // Propiedad requerida por Konva
    };
    
    const result = {
      id: id,
      type: type,
      areaId: areaId || 'default-area',
      konvaAttrs: backendKonvaAttrs
    };
    
    // ✅ DEBUGGING: Solo logs importantes para formas complejas en el resultado
    if (['star', 'heart', 'diamond', 'hexagon', 'octagon', 'pentagon', 'polygon', 'shape', 'path'].includes(result.type)) {
      console.log('🔍 [ElementFactory] Resultado forma compleja:', {
        type: result.type,
        hasPoints: !!result.konvaAttrs.points,
        pointsLength: result.konvaAttrs.points?.length,
        points: result.konvaAttrs.points
      });
    }
    
    // ✅ DEBUGGING: Log específico para texto en el resultado
    if (result.type === 'text') {
      console.log('🔍 [ElementFactory] Resultado texto:', {
        type: result.type,
        text: result.konvaAttrs.text,
        hasText: !!result.konvaAttrs.text,
        textLength: result.konvaAttrs.text?.length,
        konvaAttrs: result.konvaAttrs
      });
    }
    
    return result;
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
