// src/components/FabricDesignEditor/utils/KonvaFabricConverter.js
import { fabric } from 'fabric';

/**
 * Conversor híbrido entre Konva y Fabric.js
 * Maneja la conversión bidireccional de formas vectoriales
 */
class KonvaFabricConverter {
  
  /**
   * Convierte un objeto de Fabric.js a formato compatible con backend MongoDB
   * @param {fabric.Object} fabricObject - Objeto de Fabric.js
   * @param {string} areaId - ID del área de personalización
   * @returns {Object} Elemento compatible con backend
   */
  static fabricToBackend(fabricObject, areaId = null) {
    try {
      const bounds = fabricObject.getBoundingRect();
      
      return {
        type: 'shape',
        areaId: areaId,
        konvaAttrs: {
          // Posición y transformaciones estándar
          x: fabricObject.left || 0,
          y: fabricObject.top || 0,
          width: bounds.width,
          height: bounds.height,
          rotation: fabricObject.angle || 0,
          scaleX: fabricObject.scaleX || 1,
          scaleY: fabricObject.scaleY || 1,
          opacity: fabricObject.opacity || 1,
          
          // Propiedades visuales
          fill: fabricObject.fill || '#1F64BF',
          stroke: fabricObject.stroke || '#032CA6',
          strokeWidth: fabricObject.strokeWidth || 2,
          
          // Datos vectoriales específicos (si es una forma vectorial)
          ...(fabricObject.data?.konvaAttrs?.isVectorShape && {
            shapeType: fabricObject.data.konvaAttrs.shapeType,
            pathData: fabricObject.data.konvaAttrs.pathData,
            vectorParams: fabricObject.data.konvaAttrs.vectorParams,
            isVectorShape: true,
            konvaOrigin: true
          })
        },
        metadata: {
          originalFileName: `vector_shape_${fabricObject.data?.id || Date.now()}`,
          fileSize: 0, // Los vectores no tienen tamaño de archivo
          source: 'konva-vector',
          tags: ['vector', 'custom', fabricObject.data?.konvaAttrs?.shapeType || 'shape']
        }
      };
    } catch (error) {
      console.error('Error convirtiendo Fabric a Backend:', error);
      return null;
    }
  }

  /**
   * Convierte datos del backend a objeto de Fabric.js
   * @param {Object} backendElement - Elemento del backend
   * @returns {Promise<fabric.Object>} Objeto de Fabric.js
   */
  static async backendToFabric(backendElement) {
    try {
      const { konvaAttrs } = backendElement;
      
      // Si es una forma vectorial, crear Path
      if (konvaAttrs.isVectorShape && konvaAttrs.pathData) {
        return await this.createVectorShapeFromBackend(backendElement);
      }
      
      // Si es una forma básica, crear forma estándar
      return this.createBasicShapeFromBackend(backendElement);
      
    } catch (error) {
      console.error('Error convirtiendo Backend a Fabric:', error);
      return null;
    }
  }

  /**
   * Crea una forma vectorial desde datos del backend
   * @param {Object} backendElement - Elemento del backend
   * @returns {Promise<fabric.Path>} Path de Fabric.js
   */
  static async createVectorShapeFromBackend(backendElement) {
    const { konvaAttrs } = backendElement;
    
    return new Promise((resolve, reject) => {
      try {
        const pathObject = new fabric.Path(konvaAttrs.pathData, {
          left: konvaAttrs.x,
          top: konvaAttrs.y,
          width: konvaAttrs.width,
          height: konvaAttrs.height,
          angle: konvaAttrs.rotation,
          scaleX: konvaAttrs.scaleX,
          scaleY: konvaAttrs.scaleY,
          opacity: konvaAttrs.opacity,
          fill: konvaAttrs.fill,
          stroke: konvaAttrs.stroke,
          strokeWidth: konvaAttrs.strokeWidth,
          originX: 'center',
          originY: 'center',
          selectable: true,
          evented: true,
          data: {
            type: 'shape',
            areaId: backendElement.areaId,
            konvaAttrs: konvaAttrs,
            isCustomElement: true,
            id: `restored_${konvaAttrs.shapeType}_${Date.now()}`
          }
        });

        resolve(pathObject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Crea una forma básica desde datos del backend
   * @param {Object} backendElement - Elemento del backend
   * @returns {fabric.Object} Objeto de Fabric.js
   */
  static createBasicShapeFromBackend(backendElement) {
    const { konvaAttrs } = backendElement;
    
    // Crear forma básica según el tipo
    let shape;
    
    switch (konvaAttrs.shapeType || 'rectangle') {
      case 'rectangle':
        shape = new fabric.Rect({
          left: konvaAttrs.x,
          top: konvaAttrs.y,
          width: konvaAttrs.width,
          height: konvaAttrs.height,
          angle: konvaAttrs.rotation,
          scaleX: konvaAttrs.scaleX,
          scaleY: konvaAttrs.scaleY,
          opacity: konvaAttrs.opacity,
          fill: konvaAttrs.fill,
          stroke: konvaAttrs.stroke,
          strokeWidth: konvaAttrs.strokeWidth
        });
        break;
        
      case 'circle':
        shape = new fabric.Circle({
          left: konvaAttrs.x,
          top: konvaAttrs.y,
          radius: Math.min(konvaAttrs.width, konvaAttrs.height) / 2,
          angle: konvaAttrs.rotation,
          scaleX: konvaAttrs.scaleX,
          scaleY: konvaAttrs.scaleY,
          opacity: konvaAttrs.opacity,
          fill: konvaAttrs.fill,
          stroke: konvaAttrs.stroke,
          strokeWidth: konvaAttrs.strokeWidth
        });
        break;
        
      case 'triangle':
        shape = new fabric.Triangle({
          left: konvaAttrs.x,
          top: konvaAttrs.y,
          width: konvaAttrs.width,
          height: konvaAttrs.height,
          angle: konvaAttrs.rotation,
          scaleX: konvaAttrs.scaleX,
          scaleY: konvaAttrs.scaleY,
          opacity: konvaAttrs.opacity,
          fill: konvaAttrs.fill,
          stroke: konvaAttrs.stroke,
          strokeWidth: konvaAttrs.strokeWidth
        });
        break;
        
      default:
        // Crear rectángulo por defecto
        shape = new fabric.Rect({
          left: konvaAttrs.x,
          top: konvaAttrs.y,
          width: konvaAttrs.width,
          height: konvaAttrs.height,
          angle: konvaAttrs.rotation,
          scaleX: konvaAttrs.scaleX,
          scaleY: konvaAttrs.scaleY,
          opacity: konvaAttrs.opacity,
          fill: konvaAttrs.fill,
          stroke: konvaAttrs.stroke,
          strokeWidth: konvaAttrs.strokeWidth
        });
    }

    // Agregar metadatos
    shape.set({
      data: {
        type: 'shape',
        areaId: backendElement.areaId,
        konvaAttrs: konvaAttrs,
        isCustomElement: true,
        id: `restored_${konvaAttrs.shapeType || 'shape'}_${Date.now()}`
      }
    });

    return shape;
  }

  /**
   * Migra formas básicas existentes a vectoriales
   * @param {fabric.Object} fabricObject - Objeto de Fabric.js existente
   * @param {string} shapeType - Tipo de forma vectorial a convertir
   * @param {Object} vectorParams - Parámetros de la forma vectorial
   * @returns {Promise<fabric.Path>} Nueva forma vectorial
   */
  static async migrateToVector(fabricObject, shapeType, vectorParams = {}) {
    try {
      // Generar path SVG basado en el tipo de forma
      const pathData = this.generateVectorPath(shapeType, vectorParams);
      
      if (!pathData) {
        throw new Error(`No se pudo generar path para ${shapeType}`);
      }

      // Crear nuevo path vectorial
      const vectorShape = new fabric.Path(pathData, {
        left: fabricObject.left,
        top: fabricObject.top,
        width: fabricObject.width,
        height: fabricObject.height,
        angle: fabricObject.angle,
        scaleX: fabricObject.scaleX,
        scaleY: fabricObject.scaleY,
        opacity: fabricObject.opacity,
        fill: fabricObject.fill,
        stroke: fabricObject.stroke,
        strokeWidth: fabricObject.strokeWidth,
        originX: fabricObject.originX,
        originY: fabricObject.originY,
        selectable: true,
        evented: true,
        data: {
          type: 'shape',
          areaId: fabricObject.data?.areaId,
          konvaAttrs: {
            x: fabricObject.left,
            y: fabricObject.top,
            width: fabricObject.width,
            height: fabricObject.height,
            rotation: fabricObject.angle,
            scaleX: fabricObject.scaleX,
            scaleY: fabricObject.scaleY,
            opacity: fabricObject.opacity,
            fill: fabricObject.fill,
            stroke: fabricObject.stroke,
            strokeWidth: fabricObject.strokeWidth,
            shapeType: shapeType,
            pathData: pathData,
            vectorParams: vectorParams,
            isVectorShape: true,
            konvaOrigin: true
          },
          isCustomElement: true,
          id: `migrated_${shapeType}_${Date.now()}`
        }
      });

      return vectorShape;
    } catch (error) {
      console.error('Error migrando a vector:', error);
      return null;
    }
  }

  /**
   * Genera path SVG para diferentes tipos de formas
   * @param {string} shapeType - Tipo de forma
   * @param {Object} params - Parámetros de la forma
   * @returns {string} Path SVG
   */
  static generateVectorPath(shapeType, params = {}) {
    const generators = {
      star: (p) => {
        const { points = 5, innerRadius = 0.5, outerRadius = 100 } = p;
        const step = Math.PI / points;
        let path = '';
        
        for (let i = 0; i <= 2 * points; i++) {
          const radius = i % 2 === 0 ? outerRadius : outerRadius * innerRadius;
          const x = Math.cos(i * step - Math.PI / 2) * radius;
          const y = Math.sin(i * step - Math.PI / 2) * radius;
          path += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
        }
        return path + 'Z';
      },

      heart: (p) => {
        const { size = 100, curve = 1 } = p;
        const scale = size / 100;
        const c = curve;
        
        return `M 0,${15 * scale * c} 
                C 0,${5 * scale * c} ${10 * scale},${-5 * scale * c} ${25 * scale},${5 * scale * c}
                C ${40 * scale},${-5 * scale * c} ${50 * scale},${5 * scale * c} ${50 * scale},${15 * scale * c}
                C ${50 * scale},${25 * scale * c} ${25 * scale},${50 * scale * c} 0,${70 * scale * c}
                C ${-25 * scale},${50 * scale * c} ${-50 * scale},${25 * scale * c} ${-50 * scale},${15 * scale * c}
                C ${-50 * scale},${5 * scale * c} ${-40 * scale},${-5 * scale * c} ${-25 * scale},${5 * scale * c}
                C ${-10 * scale},${-5 * scale * c} 0,${5 * scale * c} 0,${15 * scale * c} Z`;
      },

      arrow: (p) => {
        const { length = 150, headSize = 0.4, thickness = 20 } = p;
        const headLength = length * headSize;
        const bodyLength = length - headLength;
        const halfThickness = thickness / 2;
        const headWidth = thickness * 1.5;
        
        return `M 0,${-halfThickness}
                L ${bodyLength},${-halfThickness}
                L ${bodyLength},${-headWidth / 2}
                L ${length},0
                L ${bodyLength},${headWidth / 2}
                L ${bodyLength},${halfThickness}
                L 0,${halfThickness} Z`;
      },

      polygon: (p) => {
        const { sides = 6, radius = 100 } = p;
        const angle = (2 * Math.PI) / sides;
        let path = '';
        
        for (let i = 0; i < sides; i++) {
          const x = Math.cos(i * angle - Math.PI / 2) * radius;
          const y = Math.sin(i * angle - Math.PI / 2) * radius;
          path += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
        }
        return path + 'Z';
      }
    };

    const generator = generators[shapeType];
    return generator ? generator(params) : null;
  }

  /**
   * Valida la integridad de un path SVG
   * @param {string} pathData - Path SVG a validar
   * @returns {boolean} True si el path es válido
   */
  static validatePath(pathData) {
    try {
      // Verificar que el path tenga comandos válidos
      const validCommands = /^[MLQCZ][^MLQCZ]*$/gi;
      const commands = pathData.match(/[MLQCZ][^MLQCZ]*/gi) || [];
      
      if (commands.length === 0) return false;
      
      // Verificar que todos los comandos sean válidos
      return commands.every(cmd => validCommands.test(cmd));
    } catch (error) {
      console.error('Error validando path:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de un diseño para el backend
   * @param {fabric.Canvas} canvas - Canvas de Fabric.js
   * @returns {Object} Estadísticas del diseño
   */
  static getDesignStats(canvas) {
    const objects = canvas.getObjects();
    const vectorShapes = objects.filter(obj => 
      obj.data?.konvaAttrs?.isVectorShape
    );
    
    return {
      totalObjects: objects.length,
      vectorShapes: vectorShapes.length,
      basicShapes: objects.length - vectorShapes.length,
      hasVectorContent: vectorShapes.length > 0
    };
  }
}

export default KonvaFabricConverter;
