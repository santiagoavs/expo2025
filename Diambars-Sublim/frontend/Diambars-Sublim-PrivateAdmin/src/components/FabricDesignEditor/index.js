// src/components/EnhancedFabricEditor/index.js - EXPORTACIONES PRINCIPALES

// Exportar el editor principal mejorado
export { default } from './EnhancedFabricEditor';
export { default as EnhancedFabricEditor } from './EnhancedFabricEditor';

// Exportar store de Zustand
export { default as useEditorStore } from './stores/useEditorStores';
export {
  useCanvasState,
  useToolsState,
  useSelectionState,
  useHistoryState,
  useAreasState,
  useUIState
} from './stores/useEditorStores';

// Exportar componentes individuales
export { default as ColorPicker } from './components/ColorPicker';
export { default as ImageUploader } from './components/ImageUploader';
export { default as ExportManager } from './components/ExportManager';
export { default as AdvancedToolsPanel } from './components/AdvancedToolsPanel';

// Exportar utilidades
export { default as ImageUtils } from '../../utils/imageUtils';
export { default as CoordinateTransformer } from '../../utils/CoordinateTransformer';

// Exportar hooks personalizados para integración con el editor original
export { useFabricCanvas } from './hooks/useFabricCanvas';
export { useProductDetection } from './hooks/useProductDetection';

// Re-exportar componentes del editor original para compatibilidad
export { default as FabricDesignEditor } from './FabricDesignEditor';

/**
 * Hook personalizado para integrar el editor mejorado con el sistema existente
 * Proporciona una interfaz compatible con el DesignService existente
 */
export const useEnhancedEditor = () => {
  const store = useEditorStore();
  
  return {
    // Estados del canvas
    canvas: store.canvas,
    isInitialized: store.isCanvasInitialized,
    
    // Funciones principales
    initializeCanvas: store.initializeCanvas,
    destroyCanvas: store.destroyCanvas,
    
    // Gestión de objetos
    selectedObjects: store.selectedObjects,
    allObjects: store.allObjects,
    deleteSelected: store.deleteSelectedObjects,
    duplicateSelected: store.duplicateSelectedObjects,
    
    // Historial
    canUndo: store.currentHistoryIndex > 0,
    canRedo: store.currentHistoryIndex < store.objectHistory.length - 1,
    undo: store.undo,
    redo: store.redo,
    saveToHistory: store.saveToHistory,
    
    // Estados UI
    isLoading: store.isLoading,
    isSaving: store.isSaving,
    error: store.error,
    notifications: store.notifications,
    
    // Funciones de utilidad
    getCanvasData: () => {
      if (!store.canvas) return null;
      
      // Formato compatible con DesignService
      const customElements = store.canvas.getObjects().filter(obj => 
        !obj.data?.isProductImage && 
        !obj.data?.isArea && 
        obj.data?.type !== 'areaLabel'
      );

      return {
        canvas: store.canvas.toJSON(['data']),
        elements: customElements.map(obj => ({
          type: obj.type === 'i-text' ? 'text' : obj.type === 'image' ? 'image' : 'shape',
          areaId: obj.data?.areaId || '',
          konvaAttrs: {
            x: Math.round(obj.left || 0),
            y: Math.round(obj.top || 0),
            width: Math.round(obj.width || obj.getScaledWidth?.() || 0),
            height: Math.round(obj.height || obj.getScaledHeight?.() || 0),
            rotation: Math.round(obj.angle || 0),
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
            opacity: obj.opacity ?? 1,
            visible: obj.visible ?? true,
            
            // Propiedades específicas de texto
            ...(obj.type === 'i-text' && {
              text: obj.text || '',
              fontFamily: obj.fontFamily || 'Arial',
              fontSize: obj.fontSize || 24,
              fill: obj.fill || '#000000',
              fontWeight: obj.fontWeight || 'normal',
              fontStyle: obj.fontStyle || 'normal',
              textAlign: obj.textAlign || 'left',
              underline: !!obj.underline,
              linethrough: !!obj.linethrough,
              overline: !!obj.overline
            }),
            
            // Propiedades específicas de imagen (unificar naming para backend)
            ...(obj.type === 'image' && {
              image: obj.getSrc?.() || obj.data?.originalSrc || '',
              imageUrl: obj.getSrc?.() || obj.data?.originalSrc || '',
              filters: obj.filters || []
            }),
            
            // Propiedades específicas de formas
            ...(obj.type !== 'i-text' && obj.type !== 'image' && {
              fill: obj.fill || '#ffffff',
              stroke: obj.stroke || '#000000',
              strokeWidth: obj.strokeWidth || 0
            })
          }
        })),
        productType: store.productType || 'flat',
        timestamp: new Date().toISOString()
      };
    },
    
    // Función para limpiar el canvas
    clearCanvas: () => {
      if (!store.canvas) return;
      
      const objectsToRemove = store.canvas.getObjects().filter(obj => 
        !obj.data?.isProductImage && 
        !obj.data?.isArea && 
        obj.data?.type !== 'areaLabel'
      );
      
      objectsToRemove.forEach(obj => store.canvas.remove(obj));
      store.canvas.requestRenderAll();
      store.saveToHistory('Canvas limpiado');
    },
    
    // Estadísticas del editor
    getStats: store.getEditorStats
  };
};

/**
 * Función helper para crear un diseño compatible desde datos de Konva/DesignService
 * @param {Object} designData - Datos del diseño en formato DesignService
 * @param {fabric.Canvas} canvas - Canvas de Fabric.js
 * @returns {Promise<boolean>} - true si se cargó exitosamente
 */
export const loadDesignFromKonvaData = async (designData, canvas) => {
  if (!designData?.elements || !canvas) {
    console.warn('Datos de diseño o canvas inválidos');
    return false;
  }

  try {
    // Limpiar objetos existentes (excepto producto y áreas)
    const objectsToRemove = canvas.getObjects().filter(obj => 
      !obj.data?.isProductImage && 
      !obj.data?.isArea && 
      obj.data?.type !== 'areaLabel'
    );
    
    objectsToRemove.forEach(obj => canvas.remove(obj));

    // Crear objetos Fabric desde elementos Konva
    for (const element of designData.elements) {
      const attrs = element.konvaAttrs;
      if (!attrs) continue;

      let fabricObject;

      switch (element.type) {
        case 'text':
          fabricObject = new fabric.IText(attrs.text || 'Texto', {
            left: attrs.x || 0,
            top: attrs.y || 0,
            fontSize: attrs.fontSize || 24,
            fontFamily: attrs.fontFamily || 'Arial',
            fill: attrs.fill || '#000000',
            fontWeight: attrs.fontWeight || 'normal',
            fontStyle: attrs.fontStyle || 'normal',
            textAlign: attrs.textAlign || 'left',
            underline: !!attrs.underline,
            linethrough: !!attrs.linethrough,
            overline: !!attrs.overline,
            angle: attrs.rotation || 0,
            scaleX: attrs.scaleX || 1,
            scaleY: attrs.scaleY || 1,
            opacity: attrs.opacity ?? 1,
            data: {
              type: 'text',
              areaId: element.areaId,
              originalData: element
            }
          });
          break;

        case 'image':
          if (attrs.imageUrl || attrs.image) {
            await new Promise((resolve) => {
              const src = attrs.image || attrs.imageUrl;
              fabric.Image.fromURL(src, (img) => {
                if (img) {
                  img.set({
                    left: attrs.x || 0,
                    top: attrs.y || 0,
                    scaleX: attrs.scaleX || 1,
                    scaleY: attrs.scaleY || 1,
                    angle: attrs.rotation || 0,
                    opacity: attrs.opacity ?? 1,
                    data: {
                      type: 'image',
                      areaId: element.areaId,
                      originalData: element
                    }
                  });
                  
                  canvas.add(img);
                }
                resolve();
              }, { crossOrigin: 'anonymous' });
            });
          }
          continue; // Skip adding to canvas since it's done in the promise
          
        case 'shape':
        default:
          // Crear forma básica (rectángulo por defecto)
          fabricObject = new fabric.Rect({
            left: attrs.x || 0,
            top: attrs.y || 0,
            width: attrs.width || 100,
            height: attrs.height || 100,
            fill: attrs.fill || '#ffffff',
            stroke: attrs.stroke || '#000000',
            strokeWidth: attrs.strokeWidth || 0,
            angle: attrs.rotation || 0,
            scaleX: attrs.scaleX || 1,
            scaleY: attrs.scaleY || 1,
            opacity: attrs.opacity ?? 1,
            data: {
              type: 'shape',
              areaId: element.areaId,
              originalData: element
            }
          });
          break;
      }

      if (fabricObject) {
        canvas.add(fabricObject);
      }
    }

    canvas.requestRenderAll();
    console.log(`✅ Diseño cargado: ${designData.elements.length} elementos`);
    return true;

  } catch (error) {
    console.error('❌ Error cargando diseño desde datos Konva:', error);
    return false;
  }
};

/**
 * Función helper para convertir datos de Fabric a formato DesignService
 * @param {fabric.Canvas} canvas - Canvas de Fabric.js
 * @returns {Object} - Datos en formato DesignService
 */
export const convertFabricToDesignService = (canvas) => {
  if (!canvas) return null;

  try {
    const customObjects = canvas.getObjects().filter(obj => 
      !obj.data?.isProductImage && 
      !obj.data?.isArea && 
      obj.data?.type !== 'areaLabel'
    );

    const elements = customObjects.map(obj => {
      const baseElement = {
        type: obj.type === 'i-text' ? 'text' : obj.type === 'image' ? 'image' : 'shape',
        areaId: obj.data?.areaId || '',
        konvaAttrs: {
          x: Math.round(obj.left || 0),
          y: Math.round(obj.top || 0),
          width: Math.round(obj.width || obj.getScaledWidth?.() || 0),
          height: Math.round(obj.height || obj.getScaledHeight?.() || 0),
          rotation: Math.round(obj.angle || 0),
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          opacity: obj.opacity ?? 1,
          visible: obj.visible ?? true
        }
      };

      // Agregar propiedades específicas según el tipo
      if (obj.type === 'i-text') {
        Object.assign(baseElement.konvaAttrs, {
          text: obj.text || '',
          fontFamily: obj.fontFamily || 'Arial',
          fontSize: obj.fontSize || 24,
          fill: obj.fill || '#000000',
          fontWeight: obj.fontWeight || 'normal',
          fontStyle: obj.fontStyle || 'normal',
          textAlign: obj.textAlign || 'left',
          underline: !!obj.underline,
          linethrough: !!obj.linethrough
        });
      } else if (obj.type === 'image') {
        Object.assign(baseElement.konvaAttrs, {
          imageUrl: obj.getSrc?.() || '',
          originalSrc: obj.data?.originalSrc || ''
        });
      } else {
        Object.assign(baseElement.konvaAttrs, {
          fill: obj.fill || '#ffffff',
          stroke: obj.stroke || '#000000',
          strokeWidth: obj.strokeWidth || 0
        });
      }

      return baseElement;
    });

    return {
      elements,
      canvas: canvas.toJSON(['data']),
      metadata: {
        objectsCount: elements.length,
        canvasSize: {
          width: canvas.getWidth(),
          height: canvas.getHeight()
        },
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error convirtiendo Fabric a DesignService:', error);
    return null;
  }
};

/**
 * Helper para integrar con react-dropzone para subir imágenes directamente al canvas
 * @param {File[]} files - Archivos de imagen
 * @param {fabric.Canvas} canvas - Canvas de Fabric.js
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<number>} - Número de imágenes agregadas
 */
export const addImagesToCanvas = async (files, canvas, onProgress) => {
  if (!files?.length || !canvas) return 0;

  let addedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Validar archivo
      if (!file.type.startsWith('image/')) continue;
      
      // Notificar progreso
      if (onProgress) {
        onProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // Crear URL del archivo
      const imageUrl = URL.createObjectURL(file);
      
      await new Promise((resolve) => {
        fabric.Image.fromURL(imageUrl, (img) => {
          if (img) {
            // Escalar imagen si es muy grande
            const maxSize = 300;
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            
            img.set({
              left: canvas.width / 2 + (addedCount * 20),
              top: canvas.height / 2 + (addedCount * 20),
              originX: 'center',
              originY: 'center',
              scaleX: scale,
              scaleY: scale,
              data: {
                type: 'image',
                originalSrc: imageUrl,
                fileName: file.name
              }
            });

            canvas.add(img);
            addedCount++;
          }
          
          // Liberar URL después de cargar
          URL.revokeObjectURL(imageUrl);
          resolve();
        }, { crossOrigin: 'anonymous' });
      });

    } catch (error) {
      console.error(`Error agregando imagen ${file.name}:`, error);
    }
  }

  if (addedCount > 0) {
    canvas.requestRenderAll();
  }

  return addedCount;
};

/**
 * Configuración por defecto del editor mejorado
 */
export const DEFAULT_EDITOR_CONFIG = {
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff'
  },
  tools: {
    enableColorPicker: true,
    enableImageUpload: true,
    enableShapes: true,
    enableEffects: true,
    enableExport: true
  },
  features: {
    autoSave: true,
    autoSaveInterval: 30000,
    maxHistorySteps: 50,
    enableKeyboardShortcuts: true,
    enableTooltips: true
  },
  export: {
    defaultFormat: 'png',
    defaultQuality: 0.9,
    enableMultipleFormats: true
  }
};

/**
 * Tema por defecto para el editor
 */
export const DEFAULT_EDITOR_THEME = {
  primary: '#1F64BF',
  primaryDark: '#032CA6',
  accent: '#040DBF',
  background: '#F2F2F2',
  text: '#010326',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};