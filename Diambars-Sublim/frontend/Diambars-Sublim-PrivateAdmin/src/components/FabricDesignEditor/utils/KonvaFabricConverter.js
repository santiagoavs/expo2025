// src/components/FabricDesignEditor/utils/KonvaFabricConverter.js
import { fabric } from 'fabric';
import CoordinateConverter from '../../../utils/CoordinateConverter';

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
  static fabricToBackend(fabricObject, areaId = null, canvasDimensions = { width: 800, height: 600 }) {
    try {
      const bounds = fabricObject.getBoundingRect();
      
      // Verificar el tipo de elemento
      const isVectorShape = fabricObject.data?.konvaAttrs?.isVectorShape || false;
      const isBasicShape = fabricObject.data?.konvaAttrs?.isBasicShape || false;
      const shapeType = fabricObject.data?.konvaAttrs?.shapeType;
      const elementType = fabricObject.data?.type || fabricObject.type;
      
      // Obtener pathData - solo para formas vectoriales
      let pathData = null;
      if (isVectorShape) {
        // Si es una forma vectorial, usar el pathData guardado o el path actual
        pathData = fabricObject.data?.konvaAttrs?.pathData || 
                  (fabricObject.path ? fabricObject.path.join(' ') : null);
      } else if (fabricObject.type === 'path' && fabricObject.path) {
        // Si es un path de Fabric.js, usar su path
        pathData = fabricObject.path.join(' ');
      }
      
      // Normalizar coordenadas a formato estándar (800x600)
      const normalizedCoords = CoordinateConverter.toStandard({
        x: fabricObject.left || 0,
        y: fabricObject.top || 0,
        width: bounds.width,
        height: bounds.height
      }, canvasDimensions);
      
      console.log('🔄 [KonvaFabricConverter] fabricToBackend - isVectorShape:', isVectorShape);
      console.log('🔄 [KonvaFabricConverter] fabricToBackend - isBasicShape:', isBasicShape);
      console.log('🔄 [KonvaFabricConverter] fabricToBackend - shapeType:', shapeType);
      console.log('🔄 [KonvaFabricConverter] fabricToBackend - elementType:', elementType);
      console.log('🔄 [KonvaFabricConverter] fabricToBackend - pathData:', pathData);
      console.log('🔄 [KonvaFabricConverter] fabricToBackend - Coordenadas originales:', {
        x: fabricObject.left || 0,
        y: fabricObject.top || 0,
        width: bounds.width,
        height: bounds.height
      });
      console.log('🔄 [KonvaFabricConverter] fabricToBackend - Coordenadas normalizadas:', normalizedCoords);
      
      // Determinar el tipo de elemento para el backend
      let backendType = elementType;
      if (isVectorShape) {
        backendType = 'path';
      } else if (isBasicShape) {
        backendType = elementType; // 'text', 'rect', 'circle', 'triangle'
      }
      
      return {
        type: backendType,
        areaId: areaId,
        konvaAttrs: {
          // Posición y transformaciones normalizadas
          x: normalizedCoords.x,
          y: normalizedCoords.y,
          width: normalizedCoords.width,
          height: normalizedCoords.height,
          rotation: fabricObject.angle || 0,
          scaleX: fabricObject.scaleX || 1,
          scaleY: fabricObject.scaleY || 1,
          opacity: fabricObject.opacity || 1,
          
          // Propiedades visuales
          fill: fabricObject.fill || '#1F64BF',
          stroke: fabricObject.stroke || '#032CA6',
          strokeWidth: fabricObject.strokeWidth || 2,
          
          // Propiedades específicas por tipo
          ...(elementType === 'text' || elementType === 'i-text' ? {
            fontSize: fabricObject.fontSize || 24,
            fontFamily: fabricObject.fontFamily || 'Arial',
            fontWeight: fabricObject.fontWeight || 'normal',
            fontStyle: fabricObject.fontStyle || 'normal',
            textAlign: fabricObject.textAlign || 'left',
            textDecoration: fabricObject.textDecoration || '',
            text: fabricObject.text || fabricObject.data?.konvaAttrs?.text || 'Texto'
          } : {}),
          
          // Datos vectoriales específicos (si es una forma vectorial)
          ...(isVectorShape && {
            shapeType: shapeType,
            pathData: pathData,
            vectorParams: fabricObject.data?.konvaAttrs?.vectorParams || {},
            isVectorShape: true,
            konvaOrigin: true
          }),
          
          // Datos básicos específicos (si es una forma básica)
          ...(isBasicShape && {
            shapeType: shapeType,
            isBasicShape: true,
            konvaOrigin: true
          }),
          
          // Si no es forma vectorial pero tiene path, preservarlo también
          ...(!isVectorShape && pathData && {
            pathData: pathData,
            isPath: true
          })
        },
        metadata: {
          originalFileName: `${backendType}_${fabricObject.data?.id || Date.now()}`,
          fileSize: 0,
          source: isVectorShape ? 'konva-vector' : (isBasicShape ? 'fabric-basic' : 'fabric-path'),
          tags: isVectorShape ? ['vector', 'custom', shapeType || 'path'] : 
                isBasicShape ? ['basic', 'custom', shapeType || elementType] : 
                ['path', 'custom', 'fabric']
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
      console.log('🔄 [KonvaFabricConverter] isVectorShape:', konvaAttrs.isVectorShape);
      console.log('🔄 [KonvaFabricConverter] pathData:', konvaAttrs.pathData);
      
      // Si es una forma vectorial O tiene pathData, crear Path
      if ((konvaAttrs.isVectorShape || konvaAttrs.pathData) && konvaAttrs.pathData) {
        console.log('🔄 [KonvaFabricConverter] Creando forma vectorial con pathData');
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
    console.log('🔄 [KonvaFabricConverter] isVectorShape:', konvaAttrs.isVectorShape);
    console.log('🔄 [KonvaFabricConverter] shapeType:', konvaAttrs.shapeType);
    
    return new Promise((resolve, reject) => {
      try {
        if (!konvaAttrs.pathData) {
          console.error('❌ [KonvaFabricConverter] No hay pathData para la forma vectorial');
          reject(new Error('No hay pathData para la forma vectorial'));
          return;
        }
        
        // Desnormalizar coordenadas desde formato estándar (800x600) al canvas actual
        const denormalizedCoords = CoordinateConverter.fromStandard({
          x: konvaAttrs.x || 0,
          y: konvaAttrs.y || 0,
          width: konvaAttrs.width || 100,
          height: konvaAttrs.height || 100
        }, canvasDimensions);
        
        // Determinar el tipo de forma para el ID
        const shapeType = konvaAttrs.shapeType || 'path';
        const isVectorShape = konvaAttrs.isVectorShape || false;
        
        console.log('🔄 [KonvaFabricConverter] Coordenadas normalizadas:', {
          x: konvaAttrs.x,
          y: konvaAttrs.y,
          width: konvaAttrs.width,
          height: konvaAttrs.height
        });
        console.log('🔄 [KonvaFabricConverter] Coordenadas desnormalizadas:', denormalizedCoords);
        
        const pathObject = new fabric.Path(konvaAttrs.pathData, {
          left: denormalizedCoords.x,
          top: denormalizedCoords.y,
          width: denormalizedCoords.width,
          height: denormalizedCoords.height,
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
            konvaAttrs: {
              ...konvaAttrs,
              // Asegurar que los metadatos estén completos
              shapeType: shapeType,
              isVectorShape: isVectorShape,
              pathData: konvaAttrs.pathData,
              vectorParams: konvaAttrs.vectorParams || {}
            },
            isCustomElement: true,
            id: `restored_${shapeType}_${Date.now()}`
          }
        });

        console.log('🔄 [KonvaFabricConverter] Forma vectorial creada:', pathObject);
        console.log('🔄 [KonvaFabricConverter] Path del objeto:', pathObject.path);
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
    
    // Desnormalizar coordenadas desde formato estándar (800x600) al canvas actual
    const denormalizedCoords = CoordinateConverter.fromStandard({
      x: konvaAttrs.x || 0,
      y: konvaAttrs.y || 0,
      width: konvaAttrs.width || 100,
      height: konvaAttrs.height || 100
    }, canvasDimensions);
    
    console.log('🔄 [KonvaFabricConverter] Coordenadas normalizadas:', {
      x: konvaAttrs.x,
      y: konvaAttrs.y,
      width: konvaAttrs.width,
      height: konvaAttrs.height
    });
    console.log('🔄 [KonvaFabricConverter] Coordenadas desnormalizadas:', denormalizedCoords);
    
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
          left: denormalizedCoords.x,
          top: denormalizedCoords.y,
          width: denormalizedCoords.width,
          height: denormalizedCoords.height,
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
          left: denormalizedCoords.x,
          top: denormalizedCoords.y,
          radius: Math.min(denormalizedCoords.width, denormalizedCoords.height) / 2,
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
          left: denormalizedCoords.x,
          top: denormalizedCoords.y,
          width: denormalizedCoords.width,
          height: denormalizedCoords.height,
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
          left: denormalizedCoords.x,
          top: denormalizedCoords.y,
          width: denormalizedCoords.width,
          height: denormalizedCoords.height,
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
    
    // Desnormalizar coordenadas desde formato estándar (800x600) al canvas actual
    const denormalizedCoords = CoordinateConverter.fromStandard({
      x: konvaAttrs.x || 100,
      y: konvaAttrs.y || 100,
      width: 100, // Ancho por defecto para texto
      height: 50  // Alto por defecto para texto
    }, canvasDimensions);
    
    console.log('🔄 [KonvaFabricConverter] Coordenadas del texto normalizadas:', {
      x: konvaAttrs.x,
      y: konvaAttrs.y
    });
    console.log('🔄 [KonvaFabricConverter] Coordenadas del texto desnormalizadas:', denormalizedCoords);
    
    const textObject = new fabric.IText(konvaAttrs.text || 'Texto', {
      left: denormalizedCoords.x,
      top: denormalizedCoords.y,
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
        
        // Corregir el path del corazón para que se vea correctamente
        return `M 0,${20 * scale * c} 
                C 0,${10 * scale * c} ${15 * scale},${0 * scale * c} ${30 * scale},${10 * scale * c}
                C ${45 * scale},${0 * scale * c} ${60 * scale},${10 * scale * c} ${60 * scale},${20 * scale * c}
                C ${60 * scale},${35 * scale * c} ${30 * scale},${60 * scale * c} 0,${80 * scale * c}
                C ${-30 * scale},${60 * scale * c} ${-60 * scale},${35 * scale * c} ${-60 * scale},${20 * scale * c}
                C ${-60 * scale},${10 * scale * c} ${-45 * scale},${0 * scale * c} ${-30 * scale},${10 * scale * c}
                C ${-15 * scale},${0 * scale * c} 0,${10 * scale * c} 0,${20 * scale * c} Z`;
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

      lightning: (p) => {
        const { height = 150, zigzag = 4, width = 60 } = p;
        const step = height / zigzag;
        const halfWidth = width / 2;
        
        // Crear un rayo más simétrico y realista
        let path = `M ${-halfWidth * 0.2},0`;
        
        // Lado izquierdo del rayo
        for (let i = 1; i <= zigzag; i++) {
          const y = step * i;
          const x = i % 2 === 1 ? -halfWidth * 0.8 : -halfWidth * 0.3;
          path += ` L ${x},${y}`;
        }
        
        // Punta inferior
        path += ` L ${-halfWidth * 0.1},${height}`;
        path += ` L ${halfWidth * 0.1},${height}`;
        
        // Lado derecho del rayo (simétrico)
        for (let i = zigzag - 1; i >= 1; i--) {
          const y = step * i;
          const x = i % 2 === 1 ? halfWidth * 0.3 : halfWidth * 0.8;
          path += ` L ${x},${y}`;
        }
        
        return path + 'Z';
      },

      polygon: (p) => {
        const { sides = 6, radius = 100 } = p;
        const angle = (2 * Math.PI) / sides;
        let path = '';
        
        // Asegurar que el radio sea un número válido
        const validRadius = Math.max(10, Math.min(500, radius || 100));
        
        for (let i = 0; i < sides; i++) {
          const x = Math.cos(i * angle - Math.PI / 2) * validRadius;
          const y = Math.sin(i * angle - Math.PI / 2) * validRadius;
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
