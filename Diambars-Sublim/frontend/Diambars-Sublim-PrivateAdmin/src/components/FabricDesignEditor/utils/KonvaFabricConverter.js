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
        type: 'path',
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
   * @param {Object} canvasDimensions - Dimensiones del canvas {width, height}
   * @returns {Promise<fabric.Object>} Objeto de Fabric.js
   */
  static async backendToFabric(backendElement, canvasDimensions = { width: 800, height: 600 }) {
    try {
      console.log('🔄 [KonvaFabricConverter] backendToFabric llamado con:', backendElement);
      const { konvaAttrs, type } = backendElement;
      console.log('🔄 [KonvaFabricConverter] konvaAttrs:', konvaAttrs);
      console.log('🔄 [KonvaFabricConverter] type:', type);
      
      // Si es una forma vectorial, crear Path
      if (konvaAttrs.isVectorShape && konvaAttrs.pathData) {
        console.log('🔄 [KonvaFabricConverter] Creando forma vectorial');
        return await this.createVectorShapeFromBackend(backendElement, canvasDimensions);
      }
      
      // Si es texto, crear objeto de texto
      if (type === 'text' || type === 'i-text') {
        console.log('🔄 [KonvaFabricConverter] Creando texto');
        return this.createTextFromBackend(backendElement, canvasDimensions);
      }
      
      // Si es imagen, crear objeto de imagen
      if (type === 'image') {
        console.log('🔄 [KonvaFabricConverter] Creando imagen');
        return await this.createImageFromBackend(backendElement, canvasDimensions);
      }
      
      // Si es una forma básica, crear forma estándar
      console.log('🔄 [KonvaFabricConverter] Creando forma básica');
      return this.createBasicShapeFromBackend(backendElement, canvasDimensions);
      
    } catch (error) {
      console.error('❌ [KonvaFabricConverter] Error convirtiendo Backend a Fabric:', error);
      return null;
    }
  }

  /**
   * Crea una forma vectorial desde datos del backend
   * @param {Object} backendElement - Elemento del backend
   * @param {Object} canvasDimensions - Dimensiones del canvas {width, height}
   * @returns {Promise<fabric.Path>} Path de Fabric.js
   */
  static async createVectorShapeFromBackend(backendElement, canvasDimensions = { width: 800, height: 600 }) {
    const { konvaAttrs } = backendElement;
    console.log('🔄 [KonvaFabricConverter] createVectorShapeFromBackend con konvaAttrs:', konvaAttrs);
    console.log('🔄 [KonvaFabricConverter] pathData:', konvaAttrs.pathData);
    
    return new Promise((resolve, reject) => {
      try {
        if (!konvaAttrs.pathData) {
          console.error('❌ [KonvaFabricConverter] No hay pathData para la forma vectorial');
          reject(new Error('No hay pathData para la forma vectorial'));
          return;
        }
        
        // Las coordenadas vienen normalizadas (800x600), escalarlas al canvas actual
        const canvasWidth = canvasDimensions.width || 800;
        const canvasHeight = canvasDimensions.height || 600;
        const scaleX = canvasWidth / 800;
        const scaleY = canvasHeight / 600;
        
        const pathObject = new fabric.Path(konvaAttrs.pathData, {
          left: konvaAttrs.x * scaleX,
          top: konvaAttrs.y * scaleY,
          width: konvaAttrs.width * scaleX,
          height: konvaAttrs.height * scaleY,
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
            type: 'path',
            areaId: backendElement.areaId,
            konvaAttrs: konvaAttrs,
            isCustomElement: true,
            id: `restored_${konvaAttrs.shapeType}_${Date.now()}`
          }
        });

        console.log('🔄 [KonvaFabricConverter] Forma vectorial creada:', pathObject);
        resolve(pathObject);
      } catch (error) {
        console.error('❌ [KonvaFabricConverter] Error creando forma vectorial:', error);
        reject(error);
      }
    });
  }

  /**
   * Crea una forma básica desde datos del backend
   * @param {Object} backendElement - Elemento del backend
   * @param {Object} canvasDimensions - Dimensiones del canvas {width, height}
   * @returns {fabric.Object} Objeto de Fabric.js
   */
  static createBasicShapeFromBackend(backendElement, canvasDimensions = { width: 800, height: 600 }) {
    const { konvaAttrs, type } = backendElement;
    console.log('🔄 [KonvaFabricConverter] createBasicShapeFromBackend con konvaAttrs:', konvaAttrs);
    console.log('🔄 [KonvaFabricConverter] type del elemento:', type);
    
    // Las coordenadas vienen normalizadas (800x600), escalarlas al canvas actual
    const canvasWidth = canvasDimensions.width || 800;
    const canvasHeight = canvasDimensions.height || 600;
    const scaleX = canvasWidth / 800;
    const scaleY = canvasHeight / 600;
    
    // Determinar el tipo de forma basado en el tipo del elemento o konvaAttrs
    let shapeType = konvaAttrs.shapeType || type || 'rectangle';
    
    // Si el tipo es 'circle' o 'triangle', usar ese tipo
    if (type === 'circle' || type === 'triangle') {
      shapeType = type;
    }
    
    console.log('🔄 [KonvaFabricConverter] shapeType determinado:', shapeType);
    
    // Crear forma básica según el tipo
    let shape;
    
    switch (shapeType) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: konvaAttrs.x * scaleX,
          top: konvaAttrs.y * scaleY,
          width: konvaAttrs.width * scaleX,
          height: konvaAttrs.height * scaleY,
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
          left: konvaAttrs.x * scaleX,
          top: konvaAttrs.y * scaleY,
          radius: Math.min(konvaAttrs.width * scaleX, konvaAttrs.height * scaleY) / 2,
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
          left: konvaAttrs.x * scaleX,
          top: konvaAttrs.y * scaleY,
          width: konvaAttrs.width * scaleX,
          height: konvaAttrs.height * scaleY,
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
          left: konvaAttrs.x * scaleX,
          top: konvaAttrs.y * scaleY,
          width: konvaAttrs.width * scaleX,
          height: konvaAttrs.height * scaleY,
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
        type: backendElement.type || 'shape',
        areaId: backendElement.areaId,
        konvaAttrs: {
          ...konvaAttrs,
          shapeType: shapeType // Asegurar que el shapeType esté en konvaAttrs
        },
        isCustomElement: true,
        id: `restored_${shapeType}_${Date.now()}`
      }
    });

    console.log('🔄 [KonvaFabricConverter] Forma básica creada:', shape);
    return shape;
  }

  /**
   * Crea un objeto de texto desde datos del backend
   * @param {Object} backendElement - Elemento del backend
   * @param {Object} canvasDimensions - Dimensiones del canvas {width, height}
   * @returns {fabric.IText} Objeto de texto de Fabric.js
   */
  static createTextFromBackend(backendElement, canvasDimensions = { width: 800, height: 600 }) {
    const { konvaAttrs } = backendElement;
    console.log('🔄 [KonvaFabricConverter] createTextFromBackend con konvaAttrs:', konvaAttrs);
    
    // Las coordenadas vienen normalizadas (800x600), escalarlas al canvas actual
    const canvasWidth = canvasDimensions.width || 800;
    const canvasHeight = canvasDimensions.height || 600;
    const scaleX = canvasWidth / 800;
    const scaleY = canvasHeight / 600;
    
    const textObject = new fabric.IText(konvaAttrs.text || 'Texto', {
      left: (konvaAttrs.x || 100) * scaleX,
      top: (konvaAttrs.y || 100) * scaleY,
      fontSize: konvaAttrs.fontSize || 24,
      fontFamily: konvaAttrs.fontFamily || 'Arial',
      fontWeight: konvaAttrs.fontWeight || 'normal',
      fontStyle: konvaAttrs.fontStyle || 'normal',
      textAlign: konvaAttrs.textAlign || 'left',
      textDecoration: konvaAttrs.textDecoration || '',
      fill: konvaAttrs.fill || '#000000',
      stroke: konvaAttrs.stroke || null,
      strokeWidth: konvaAttrs.strokeWidth || 0,
      angle: konvaAttrs.rotation || 0,
      scaleX: konvaAttrs.scaleX || 1,
      scaleY: konvaAttrs.scaleY || 1,
      opacity: konvaAttrs.opacity || 1,
      originX: 'left',
      originY: 'top',
      selectable: true,
      evented: true,
      data: {
        type: 'text',
        areaId: backendElement.areaId,
        konvaAttrs: konvaAttrs,
        isCustomElement: true,
        id: `restored_text_${Date.now()}`
      }
    });

    console.log('🔄 [KonvaFabricConverter] Texto creado:', textObject);
    return textObject;
  }

  /**
   * Crea un objeto de imagen desde datos del backend
   * @param {Object} backendElement - Elemento del backend
   * @param {Object} canvasDimensions - Dimensiones del canvas {width, height}
   * @returns {Promise<fabric.Image>} Objeto de imagen de Fabric.js
   */
  static async createImageFromBackend(backendElement, canvasDimensions = { width: 800, height: 600 }) {
    const { konvaAttrs, src } = backendElement;
    console.log('🔄 [KonvaFabricConverter] createImageFromBackend con konvaAttrs:', konvaAttrs);
    console.log('🔄 [KonvaFabricConverter] src:', src);
    
    return new Promise((resolve, reject) => {
      const imageUrl = src || konvaAttrs.image || konvaAttrs.imageUrl;
      
      if (!imageUrl) {
        console.warn('⚠️ [KonvaFabricConverter] No hay URL de imagen');
        resolve(null);
        return;
      }

      fabric.Image.fromURL(imageUrl, (img) => {
        try {
          // Las coordenadas vienen normalizadas (800x600), escalarlas al canvas actual
          const canvasWidth = canvasDimensions.width || 800;
          const canvasHeight = canvasDimensions.height || 600;
          const scaleX = canvasWidth / 800;
          const scaleY = canvasHeight / 600;
          
          img.set({
            left: (konvaAttrs.x || 100) * scaleX,
            top: (konvaAttrs.y || 100) * scaleY,
            width: (konvaAttrs.width || img.width) * scaleX,
            height: (konvaAttrs.height || img.height) * scaleY,
            angle: konvaAttrs.rotation || 0,
            scaleX: konvaAttrs.scaleX || 1,
            scaleY: konvaAttrs.scaleY || 1,
            opacity: konvaAttrs.opacity || 1,
            originX: 'left',
            originY: 'top',
            selectable: true,
            evented: true,
            data: {
              type: 'image',
              areaId: backendElement.areaId,
              konvaAttrs: konvaAttrs,
              isCustomElement: true,
              id: `restored_image_${Date.now()}`,
              imageUrl: imageUrl
            }
          });

          console.log('🔄 [KonvaFabricConverter] Imagen creada:', img);
          resolve(img);
        } catch (error) {
          console.error('❌ [KonvaFabricConverter] Error creando imagen:', error);
          reject(error);
        }
      }, {
        crossOrigin: 'anonymous'
      });
    });
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
          type: 'path',
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
