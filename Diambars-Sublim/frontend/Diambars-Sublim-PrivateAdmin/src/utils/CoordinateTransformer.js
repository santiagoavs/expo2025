// src/utils/CoordinateTransformer.js - CORREGIDO PARA EVITAR PÉRDIDA DE CANVAS

export const CoordinateTransformer = {
  /**
   * Convierte canvas de Fabric a datos de diseño SIN DESTRUIR el canvas
   */
  fabricCanvasToDesignData(fabricCanvas) {
    if (!fabricCanvas) {
      console.warn('❌ Canvas no disponible para conversión');
      return null;
    }

    try {
      // CRÍTICO: Filtrar objetos ANTES de procesarlos
      const allObjects = fabricCanvas.getObjects();
      
      // Solo procesar objetos de diseño (NO áreas, NO imagen del producto)
      const designObjects = allObjects.filter(obj => {
        return !obj.isAreaMarker && 
               !obj.isProductImage && 
               !obj.isProductBackground &&
               !obj.data?.isArea &&
               !obj.data?.isProductImage &&
               obj.type !== 'areaLabel';
      });

      console.log('🔍 Objetos encontrados:', {
        total: allObjects.length,
        design: designObjects.length,
        areas: allObjects.filter(obj => obj.isAreaMarker).length,
        product: allObjects.filter(obj => obj.isProductImage).length
      });

      // Convertir solo objetos de diseño
      const elements = designObjects.map((obj, index) => {
        try {
          return this.fabricObjectToDesignElement(obj, index);
        } catch (error) {
          console.error(`Error procesando objeto ${index}:`, error);
          return null;
        }
      }).filter(element => element !== null);

      const canvasData = {
        width: fabricCanvas.getWidth(),
        height: fabricCanvas.getHeight(),
        backgroundColor: fabricCanvas.backgroundColor || '#ffffff',
        // NO incluir objects aquí para evitar serialización problemática
        version: fabricCanvas.version || '5.3.0'
      };

      const result = {
        elements,
        canvasData,
        timestamp: new Date().toISOString(),
        metadata: {
          objectsCount: designObjects.length,
          canvasSize: { 
            width: fabricCanvas.getWidth(), 
            height: fabricCanvas.getHeight() 
          }
        }
      };

      console.log('✅ Conversión exitosa:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en fabricCanvasToDesignData:', error);
      return null;
    }
  },

  /**
   * Convierte objeto de Fabric a elemento de diseño
   */
  fabricObjectToDesignElement(fabricObject, index = 0) {
    if (!fabricObject) return null;

    try {
      const baseElement = {
        type: this._getFabricObjectType(fabricObject),
        areaId: fabricObject.areaId || null,
        konvaAttrs: {
          x: Math.round(fabricObject.left || 0),
          y: Math.round(fabricObject.top || 0),
          width: Math.round(fabricObject.getScaledWidth?.() || fabricObject.width || 0),
          height: Math.round(fabricObject.getScaledHeight?.() || fabricObject.height || 0),
          rotation: Math.round(fabricObject.angle || 0),
          scaleX: fabricObject.scaleX || 1,
          scaleY: fabricObject.scaleY || 1,
          opacity: fabricObject.opacity ?? 1,
          visible: fabricObject.visible ?? true
        },
        metadata: {
          originalType: fabricObject.type,
          index: index
        }
      };

      // Propiedades específicas por tipo
      if (this._isTextObject(fabricObject)) {
        baseElement.konvaAttrs = {
          ...baseElement.konvaAttrs,
          text: fabricObject.text || '',
          fontFamily: fabricObject.fontFamily || 'Arial',
          fontSize: fabricObject.fontSize || 24,
          fill: fabricObject.fill || '#000000',
          fontWeight: fabricObject.fontWeight || 'normal',
          fontStyle: fabricObject.fontStyle || 'normal',
          textAlign: fabricObject.textAlign || 'left',
          underline: !!fabricObject.underline,
          linethrough: !!fabricObject.linethrough
        };
      }

      if (fabricObject.type === 'image') {
        baseElement.konvaAttrs = {
          ...baseElement.konvaAttrs,
          image: fabricObject.getSrc?.() || fabricObject.src || '',
          // Preservar filtros aplicados
          filters: fabricObject.filters ? this._serializeFilters(fabricObject.filters) : []
        };
      }

      if (this._isShapeObject(fabricObject)) {
        baseElement.konvaAttrs = {
          ...baseElement.konvaAttrs,
          fill: fabricObject.fill || '#ffffff',
          stroke: fabricObject.stroke || '#000000',
          strokeWidth: fabricObject.strokeWidth || 0
        };
      }

      return baseElement;
    } catch (error) {
      console.error('Error convirtiendo objeto de Fabric:', error);
      return null;
    }
  },

  /**
   * Carga diseño en canvas SIN DESTRUIR elementos existentes del producto
   */
  async loadDesignDataToFabricCanvas(designData, fabricCanvas, fabric) {
    if (!designData || !fabricCanvas || !fabric) {
      console.warn('❌ Datos insuficientes para cargar diseño');
      return false;
    }

    try {
      console.log('📂 Cargando diseño...', designData);

      // CRÍTICO: NO hacer clear() completo, solo remover objetos de diseño
      const allObjects = fabricCanvas.getObjects();
      const designObjects = allObjects.filter(obj => 
        !obj.isAreaMarker && 
        !obj.isProductImage && 
        !obj.isProductBackground &&
        !obj.data?.isArea &&
        !obj.data?.isProductImage
      );

      // Remover solo objetos de diseño, preservar producto y áreas
      designObjects.forEach(obj => {
        fabricCanvas.remove(obj);
      });

      // Cargar nuevos elementos de diseño
      if (designData.elements && Array.isArray(designData.elements)) {
        for (const element of designData.elements) {
          try {
            const fabricObject = await this.designElementToFabricObject(element, fabric);
            if (fabricObject) {
              fabricCanvas.add(fabricObject);
            }
          } catch (error) {
            console.error('Error cargando elemento:', error);
          }
        }
      }

      fabricCanvas.requestRenderAll();
      console.log('✅ Diseño cargado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error cargando diseño:', error);
      return false;
    }
  },

  /**
   * Convierte elemento de diseño a objeto de Fabric
   */
  async designElementToFabricObject(element, fabric) {
    if (!element || !element.konvaAttrs || !fabric) return null;

    const attrs = element.konvaAttrs;
    
    const commonProps = {
      left: attrs.x || 0,
      top: attrs.y || 0,
      angle: attrs.rotation || 0,
      opacity: attrs.opacity ?? 1,
      scaleX: attrs.scaleX || 1,
      scaleY: attrs.scaleY || 1,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      transparentCorners: false,
      cornerColor: '#1F64BF',
      cornerSize: 10,
      areaId: element.areaId,
      // Marcar como objeto de diseño
      isDesignObject: true
    };

    try {
      switch (element.type) {
        case 'text':
          return new fabric.IText(attrs.text || 'Texto', {
            ...commonProps,
            fontFamily: attrs.fontFamily || 'Arial',
            fontSize: attrs.fontSize || 24,
            fill: attrs.fill || '#000000',
            fontWeight: attrs.fontWeight || 'normal',
            fontStyle: attrs.fontStyle || 'normal',
            textAlign: attrs.textAlign || 'left',
            underline: !!attrs.underline,
            linethrough: !!attrs.linethrough
          });

        case 'image':
          return new Promise((resolve, reject) => {
            fabric.Image.fromURL(attrs.image, (img) => {
              if (img) {
                img.set({
                  ...commonProps,
                  width: attrs.width,
                  height: attrs.height
                });

                // Restaurar filtros si existen
                if (attrs.filters && Array.isArray(attrs.filters)) {
                  img.filters = this._deserializeFilters(attrs.filters, fabric);
                  img.applyFilters();
                }

                resolve(img);
              } else {
                reject(new Error('Error cargando imagen'));
              }
            });
          });

        case 'shape':
        default:
          // Determinar tipo de forma basado en metadata o crear rectángulo por defecto
          const shapeType = element.metadata?.originalType || 'rect';
          
          switch (shapeType) {
            case 'circle':
              return new fabric.Circle({
                ...commonProps,
                radius: Math.min(attrs.width, attrs.height) / 2,
                fill: attrs.fill || '#ffffff',
                stroke: attrs.stroke || '#000000',
                strokeWidth: attrs.strokeWidth || 0
              });
              
            case 'triangle':
              return new fabric.Triangle({
                ...commonProps,
                width: attrs.width || 100,
                height: attrs.height || 100,
                fill: attrs.fill || '#ffffff',
                stroke: attrs.stroke || '#000000',
                strokeWidth: attrs.strokeWidth || 0
              });
              
            default:
              return new fabric.Rect({
                ...commonProps,
                width: attrs.width || 100,
                height: attrs.height || 100,
                fill: attrs.fill || '#ffffff',
                stroke: attrs.stroke || '#000000',
                strokeWidth: attrs.strokeWidth || 0
              });
          }
      }
    } catch (error) {
      console.error('Error creando objeto de Fabric:', error);
      return null;
    }
  },

  /**
   * Preservar imagen del producto al limpiar canvas
   */
  clearDesignObjectsOnly(fabricCanvas) {
    if (!fabricCanvas) return;

    const allObjects = fabricCanvas.getObjects();
    const designObjects = allObjects.filter(obj => 
      obj.isDesignObject || 
      (!obj.isAreaMarker && !obj.isProductImage && !obj.isProductBackground)
    );

    designObjects.forEach(obj => {
      fabricCanvas.remove(obj);
    });

    fabricCanvas.requestRenderAll();
  },

  // ================ MÉTODOS AUXILIARES ================

  _getFabricObjectType(fabricObject) {
    if (this._isTextObject(fabricObject)) return 'text';
    if (fabricObject.type === 'image') return 'image';
    if (this._isShapeObject(fabricObject)) return 'shape';
    return 'group';
  },

  _isTextObject(fabricObject) {
    return ['text', 'i-text', 'textbox'].includes(fabricObject.type);
  },

  _isShapeObject(fabricObject) {
    return ['rect', 'circle', 'triangle', 'polygon', 'ellipse'].includes(fabricObject.type);
  },

  _serializeFilters(filters) {
    if (!filters || !Array.isArray(filters)) return [];
    
    return filters.map(filter => ({
      type: filter.type,
      ...filter
    }));
  },

  _deserializeFilters(serializedFilters, fabric) {
    if (!serializedFilters || !Array.isArray(serializedFilters)) return [];
    
    return serializedFilters.map(filterData => {
      try {
        switch (filterData.type) {
          case 'Brightness':
            return new fabric.Image.filters.Brightness(filterData);
          case 'Contrast':
            return new fabric.Image.filters.Contrast(filterData);
          case 'Saturation':
            return new fabric.Image.filters.Saturation(filterData);
          case 'Blur':
            return new fabric.Image.filters.Blur(filterData);
          case 'Sepia':
            return new fabric.Image.filters.Sepia();
          case 'Grayscale':
            return new fabric.Image.filters.Grayscale();
          case 'Invert':
            return new fabric.Image.filters.Invert();
          default:
            return null;
        }
      } catch (error) {
        console.error('Error deserializando filtro:', error);
        return null;
      }
    }).filter(filter => filter !== null);
  }
};

export default CoordinateTransformer;