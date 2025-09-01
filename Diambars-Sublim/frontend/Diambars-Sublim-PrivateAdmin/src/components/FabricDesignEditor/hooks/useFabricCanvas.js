// src/components/FabricDesignEditor/hooks/useFabricCanvas.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { getProductConfig } from '../config/products.js';
import { getEditorConfig } from '../config/editor.js';
import { getColorsByCategory } from '../config/colors.js';

// Colores para el área de diseño
const NEW_COLORS = {
  primaryBlue: '#1F64BF',
  darkBlue: '#032CA6'
};

export const useFabricCanvas = ({ isOpen, product, initialDesign }) => {
  const [canvas, setCanvas] = useState(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [canvasError, setCanvasError] = useState(null);
  const [productType, setProductType] = useState('flat');
  const [productConfig, setProductConfig] = useState(null);
  
  // ✅ NUEVO: Estado para selección de zonas
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedZoneData, setSelectedZoneData] = useState(null);
  // ✅ NUEVO: Lista de zonas y visibilidad de etiquetas
  const [zonesList, setZonesList] = useState([]);
  const [showZoneLabels, setShowZoneLabels] = useState(true);

  const canvasRef = useRef();
  const canvasContainerRef = useRef();
  const initializationRef = useRef(false);

  // ================ UTILIDADES ================
  const logEvent = useCallback((event, data = {}) => {
    console.log(`[useFabricCanvas] ${event}:`, {
      timestamp: new Date().toISOString(),
      fabricVersion: fabric?.version || 'unknown',
      canvasInitialized,
      isOpen,
      productType,
      ...data
    });
  }, [canvasInitialized, isOpen, productType]);

  // ================ DETECCIÓN DE PRODUCTO ================
  const detectAndSetProductType = useCallback(() => {
    if (!product) return;
    
    // Detección simple basada en el nombre del producto
    let detectedType = 'flat';
    const productName = (product.name || '').toLowerCase();
    
    if (productName.includes('taza') || productName.includes('termo') || 
        productName.includes('vaso') || productName.includes('botella') ||
        productName.includes('mug') || productName.includes('cup')) {
      detectedType = 'cylindrical';
    } else if (productName.includes('llavero') || productName.includes('gafete') || 
               productName.includes('sticker') || productName.includes('pequeño') ||
               productName.includes('mini') || productName.includes('badge')) {
      detectedType = 'small';
    }
    
    const config = getProductConfig(detectedType);
    
    setProductType(detectedType);
    setProductConfig(config);
    
    logEvent('PRODUCT_TYPE_DETECTED', { 
      productType: detectedType, 
      productName: product.name,
      config 
    });

    return { detectedType, config };
  }, [product, logEvent]);

  // ================ CLEANUP ================
  const cleanupCanvas = useCallback(() => {
    if (!canvas) {
      logEvent('CLEANUP_SKIP_NO_CANVAS');
      return;
    }

    logEvent('CANVAS_CLEANUP_START');
    
    try {
      canvas.off();
      canvas.clear();
      canvas.dispose();
      logEvent('CANVAS_CLEANUP_SUCCESS');
    } catch (error) {
      logEvent('CANVAS_CLEANUP_ERROR', { error: error.message });
    } finally {
      setCanvas(null);
      setCanvasInitialized(false);
      setCanvasError(null);
    }
  }, [canvas, logEvent]);

  // ✅ NUEVO: Cleanup solo cuando se cierra el modal
  const cleanupOnClose = useCallback(() => {
    if (canvas && !isOpen) {
      cleanupCanvas();
    }
  }, [canvas, isOpen, cleanupCanvas]);

  // ✅ NUEVO: Función para manejar selección de zonas
  const handleZoneSelect = useCallback((zoneId, zoneData) => {
    logEvent('ZONE_SELECTED', { zoneId, zoneName: zoneData?.displayName || zoneData?.name });
    
    // Deseleccionar zona anterior si existe
    if (selectedZone && canvas) {
      const previousZone = canvas.getObjects().find(obj => 
        obj.data?.zoneId === selectedZone && obj.data?.type === 'customizationArea'
      );
      if (previousZone) {
        previousZone.set({
          stroke: NEW_COLORS.primaryBlue,
          strokeWidth: 2
        });
        canvas.renderAll();
      }
    }
    
    // Seleccionar nueva zona
    setSelectedZone(zoneId);
    setSelectedZoneData(zoneData);
    
    // Resaltar zona seleccionada
    if (canvas) {
      const newZone = canvas.getObjects().find(obj => 
        obj.data?.zoneId === zoneId && obj.data?.type === 'customizationArea'
      );
      if (newZone) {
        newZone.set({
          stroke: '#FF6B35', // Color naranja para zona seleccionada
          strokeWidth: 4
        });
        canvas.renderAll();
      }
    }
  }, [selectedZone, canvas, logEvent]);

  // ✅ NUEVO: Alternar visibilidad de etiquetas de zonas
  const toggleZoneLabels = useCallback((visible) => {
    setShowZoneLabels(visible);
    if (!canvas) return;
    const labels = canvas.getObjects().filter(obj => obj.data?.type === 'areaLabel');
    labels.forEach(label => label.set({ visible }));
    canvas.requestRenderAll();
  }, [canvas]);

  // ================ CALCULAR DIMENSIONES DEL CANVAS ================
  const getCanvasDimensions = useCallback((config = null) => {
    try {
      // ✅ CORREGIDO: PRIORIDAD 1: Usar editorConfig del producto (dimensiones exactas)
      if (product?.editorConfig?.stageWidth && product?.editorConfig?.stageHeight) {
        const dimensions = {
          width: product.editorConfig.stageWidth,
          height: product.editorConfig.stageHeight
        };
        
        logEvent('CANVAS_DIMENSIONS_FROM_PRODUCT_EDITOR_CONFIG', dimensions);
        return dimensions;
      }
      
      // ✅ CORREGIDO: PRIORIDAD 2: Usar configuración del producto detectado
      const productConfigToUse = config || productConfig;
      if (productConfigToUse && productConfigToUse.canvas) {
        const dimensions = {
          width: productConfigToUse.canvas.width,
          height: productConfigToUse.canvas.height
        };
        
        logEvent('CANVAS_DIMENSIONS_FROM_PRODUCT_CONFIG', dimensions);
        return dimensions;
      }
      
      // ✅ CORREGIDO: PRIORIDAD 3: Fallback a dimensiones responsive
      const container = canvasContainerRef.current;
      if (!container) {
        logEvent('CANVAS_DIMENSIONS_NO_CONTAINER');
        return { width: 800, height: 600 };
      }

      const containerRect = container.getBoundingClientRect();
      const padding = 40;
      
      const maxWidth = Math.max(300, containerRect.width - padding);
      const maxHeight = Math.max(200, containerRect.height - padding);
      
      // Mantener aspect ratio del producto
      const aspectRatio = 4/3;
      let width = maxWidth;
      let height = width / aspectRatio;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      
      const dimensions = { 
        width: Math.floor(width), 
        height: Math.floor(height) 
      };
      
      logEvent('CANVAS_DIMENSIONS_CALCULATED', dimensions);
      return dimensions;
    } catch (error) {
      logEvent('CANVAS_DIMENSIONS_ERROR', { error: error.message });
      return { width: 800, height: 600 }; // ✅ CORREGIDO: Usar 800x600 como fallback
    }
  }, [logEvent, productConfig, product]);

  // ================ INICIALIZACIÓN DEL CANVAS ================
  const initializeCanvas = useCallback(async () => {
    if (initializationRef.current || !canvasRef.current || !isOpen) {
      logEvent('CANVAS_INIT_SKIP', { 
        alreadyInitializing: initializationRef.current,
        hasCanvasRef: !!canvasRef.current,
        isOpen
      });
      return;
    }

    // ✅ NUEVO: Log detallado del producto para debugging
    logEvent('PRODUCT_DEBUG_INFO', {
      productKeys: Object.keys(product || {}),
      hasProduct: !!product,
      productName: product?.name,
      mainImage: product?.mainImage,
      images: product?.images,
      imageUrl: product?.imageUrl,
      customizationAreas: product?.customizationAreas?.length || 0,
      editorConfig: product?.editorConfig,
      stageWidth: product?.editorConfig?.stageWidth,
      stageHeight: product?.editorConfig?.stageHeight
    });

    initializationRef.current = true;
    
    try {
      // ✅ CORREGIDO: Detectar y configurar el producto PRIMERO
      const { detectedType, config } = detectAndSetProductType() || {};
      
      // ✅ CORREGIDO: Pasar null para usar la prioridad 1 (editorConfig del producto)
      // Esto asegura que use las dimensiones exactas del producto (800x600)
      const dimensions = getCanvasDimensions(null);
      
      logEvent('CANVAS_INIT_START', { 
        productType: detectedType, 
        productConfig: config,
        dimensions,
        editorConfigUsed: !!product?.editorConfig?.stageWidth,
        stageWidth: product?.editorConfig?.stageWidth,
        stageHeight: product?.editorConfig?.stageHeight
      });
      
      // Obtener configuración del editor
      const editorConfig = getEditorConfig();
      
      // Crear el canvas con configuración del producto
      const newCanvas = new fabric.Canvas(canvasRef.current, {
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: config?.canvas?.backgroundColor || editorConfig.canvas.default.backgroundColor,
        selection: editorConfig.canvas.default.selection,
        preserveObjectStacking: editorConfig.canvas.default.preserveObjectStacking
      });
      
      // Configurar el canvas según el producto
      if (config?.canvas) {
        newCanvas.setBackgroundColor(config.canvas.backgroundColor || '#ffffff');
      }
      
      // Configurar zoom
      const zoomConfig = editorConfig.canvas.zoom;
      newCanvas.setZoom(zoomConfig.default);
      
      // Configurar eventos del canvas
      newCanvas.on('object:added', (e) => {
        logEvent('OBJECT_ADDED', { type: e.target.type });
      });
      
      newCanvas.on('object:removed', (e) => {
        logEvent('OBJECT_REMOVED', { type: e.target.type });
      });
      
      newCanvas.on('selection:created', (e) => {
        logEvent('SELECTION_CREATED', { count: e.selected.length });
      });
      
      newCanvas.on('selection:cleared', () => {
        logEvent('SELECTION_CLEARED');
      });
      
      // ✅ CORREGIDO: Establecer el canvas ANTES de cargar la imagen
      setCanvas(newCanvas);
      setCanvasInitialized(true);
      setCanvasError(null);
      
      logEvent('CANVAS_INIT_SUCCESS', { 
        dimensions, 
        productType: detectedType, 
        fabricVersion: fabric.version 
      });
      
      // ✅ CORREGIDO: Cargar imagen del producto DESPUÉS de establecer el canvas
      // Buscar en todas las propiedades posibles del producto
      const productSrc = product?.imageUrl || product?.images?.main || product?.mainImage || product?.image || product?.img;
      if (productSrc) {
        await loadProductImage(newCanvas);
      } else {
        logEvent('NO_PRODUCT_IMAGE_FOUND', { 
          productKeys: Object.keys(product || {}),
          imageUrl: product?.imageUrl,
          images: product?.images,
          mainImage: product?.mainImage,
          image: product?.image,
          img: product?.img
        });
      }
      
      // Cargar diseño inicial si existe
      if (initialDesign) {
        await loadInitialDesign(initialDesign, newCanvas);
      }
      
    } catch (error) {
      logEvent('CANVAS_INIT_ERROR', { error: error.message });
      setCanvasError(error.message);
    } finally {
      initializationRef.current = false;
    }
  }, [isOpen, product, initialDesign, getCanvasDimensions, logEvent, detectAndSetProductType]);

  // ================ CARGA DE IMAGEN DEL PRODUCTO Y ZONAS CUSTOMIZABLES ================
  const loadProductImage = useCallback(async (fabricCanvas) => {
    // ✅ CORREGIDO: Buscar la imagen en múltiples propiedades del producto
    const productSrc = product?.imageUrl || product?.images?.main || product?.mainImage || product?.image || product?.img;
    
    if (!productSrc || !fabricCanvas) {
      logEvent('PRODUCT_IMAGE_SKIP', { 
        hasSrc: !!productSrc, 
        hasCanvas: !!fabricCanvas,
        productKeys: Object.keys(product || {}),
        imageUrl: product?.imageUrl,
        images: product?.images,
        mainImage: product?.mainImage,
        image: product?.image,
        img: product?.img
      });
      
      // ✅ NUEVO: Si no hay imagen, crear un área de diseño vacía
      if (fabricCanvas && !productSrc) {
        const canvasWidth = fabricCanvas.getWidth();
        const canvasHeight = fabricCanvas.getHeight();
        
        // Crear un rectángulo que represente el área de diseño
        const designArea = new fabric.Rect({
          left: canvasWidth * 0.1,
          top: canvasHeight * 0.1,
          width: canvasWidth * 0.8,
          height: canvasHeight * 0.8,
          fill: 'transparent',
          stroke: NEW_COLORS.primaryBlue,
          strokeWidth: 2,
          strokeDashArray: [10, 5],
          selectable: false,
          evented: false,
          data: {
            type: 'designArea',
            isArea: true,
            isProductImage: false
          }
        });
        
        fabricCanvas.add(designArea);
        fabricCanvas.sendToBack(designArea);
        fabricCanvas.requestRenderAll();
        
        logEvent('DESIGN_AREA_CREATED', { 
          width: designArea.width, 
          height: designArea.height 
        });
      }
      
      return;
    }

    logEvent('PRODUCT_IMAGE_LOAD_START', { src: productSrc });

    try {
      const imageObject = await new Promise((resolve, reject) => {
        fabric.Image.fromURL(productSrc, (img) => {
          if (img) {
            // ✅ NUEVO: Mantener la resolución nativa de la imagen
            const canvasWidth = fabricCanvas.getWidth();
            const canvasHeight = fabricCanvas.getHeight();
            
            // Calcular escala para que la imagen quepa en el canvas sin distorsionar
            const scaleX = canvasWidth / img.width;
            const scaleY = canvasHeight / img.height;
            const scale = Math.min(scaleX, scaleY, 1);
            
            // Centrar la imagen en el canvas
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            
            img.set({
              left: (canvasWidth - scaledWidth) / 2,
              top: (canvasHeight - scaledHeight) / 2,
              scaleX: scale,
              scaleY: scale,
              selectable: false,
              evented: false,
              data: {
                type: 'image',
                isArea: false,
                isProductImage: true,
                originalSrc: productSrc,
                originalWidth: img.width,
                originalHeight: img.height,
                scale: scale
              }
            });

            resolve(img);
          } else {
            reject(new Error('No se pudo cargar la imagen del producto'));
          }
        }, { crossOrigin: 'anonymous' });
      });

      fabricCanvas.add(imageObject);
      fabricCanvas.sendToBack(imageObject);
      
      // ✅ NUEVO: Cargar las zonas customizables después de la imagen
      if (product?.customizationAreas && product.customizationAreas.length > 0) {
        await loadCustomizationAreas(fabricCanvas, imageObject, product.customizationAreas);
      }
      
      fabricCanvas.requestRenderAll();
      
      logEvent('PRODUCT_IMAGE_LOADED_SUCCESS', { 
        width: imageObject.width, 
        height: imageObject.height,
        scale: imageObject.scaleX,
        hasCustomizationAreas: !!product?.customizationAreas?.length
      });

    } catch (error) {
      logEvent('PRODUCT_IMAGE_LOAD_ERROR', { error: error.message });
      console.warn('No se pudo cargar la imagen del producto:', error.message);
    }
  }, [product, logEvent]);

  // ================ CARGA DE ZONAS CUSTOMIZABLES ================
  const loadCustomizationAreas = useCallback(async (fabricCanvas, productImage, areas) => {
    if (!fabricCanvas || !productImage || !areas || areas.length === 0) {
      logEvent('CUSTOMIZATION_AREAS_SKIP', { 
        hasCanvas: !!fabricCanvas, 
        hasImage: !!productImage, 
        areasCount: areas?.length 
      });
      return;
    }

    logEvent('CUSTOMIZATION_AREAS_LOAD_START', { areasCount: areas.length });

    // ✅ NUEVO: Log detallado de la primera área para debugging
    if (areas.length > 0) {
      const firstArea = areas[0];
      logEvent('FIRST_AREA_DEBUG', {
        areaName: firstArea.name,
        displayName: firstArea.displayName,
        position: firstArea.position,
        hasPosition: !!firstArea.position,
        x: firstArea.position?.x,
        y: firstArea.position?.y,
        width: firstArea.position?.width,
        height: firstArea.position?.height
      });
    }

    try {
      const builtZones = [];
      areas.forEach((area, index) => {
        // ✅ CORREGIDO: Usar la estructura correcta del backend (area.position.x, area.position.y)
        const areaRect = new fabric.Rect({
          left: area.position?.x || 0,
          top: area.position?.y || 0,
          width: area.position?.width || 100,
          height: area.position?.height || 100,
          fill: 'rgba(31, 100, 191, 0.1)', // Color azul semi-transparente
          stroke: NEW_COLORS.primaryBlue,
          strokeWidth: 2,
          strokeDashArray: [8, 4],
          selectable: false,
          evented: true,
          hoverCursor: 'pointer',
          data: {
            type: 'customizationArea',
            isArea: true,
            isProductImage: false,
            areaId: area._id || area.id,
            areaName: area.displayName || area.name,
            originalX: area.position?.x || 0,
            originalY: area.position?.y || 0,
            originalWidth: area.position?.width || 100,
            originalHeight: area.position?.height || 100
          }
        });

          // ✅ CORREGIDO: Posicionar zonas RELATIVAMENTE a la imagen del producto
  // Las coordenadas del MongoDB están en un canvas de 800x600
  // Necesito posicionarlas relativamente a la imagen del producto cargada
  
  // Obtener la posición y dimensiones de la imagen del producto
  const productImage = fabricCanvas.getObjects().find(obj => obj.data?.isProductImage);
  
  if (productImage) {
    // Calcular la relación entre las coordenadas del MongoDB y la imagen actual
    const imageLeft = productImage.left || 0;
    const imageTop = productImage.top || 0;
    const imageWidth = productImage.width * (productImage.scaleX || 1);
    const imageHeight = productImage.height * (productImage.scaleY || 1);
    
    // Calcular el factor de escala de la imagen
    const imageScaleX = imageWidth / 800; // Ancho original del canvas
    const imageScaleY = imageHeight / 600; // Alto original del canvas
    
    // Aplicar la escala y posicionar relativamente a la imagen
    const scaledX = (area.position?.x || 0) * imageScaleX + imageLeft;
    const scaledY = (area.position?.y || 0) * imageScaleY + imageTop;
    const scaledWidth = (area.position?.width || 100) * imageScaleX;
    const scaledHeight = (area.position?.height || 100) * imageScaleY;
    
    areaRect.set({
      left: scaledX,
      top: scaledY,
      width: scaledWidth,
      height: scaledHeight
    });
    
    // ✅ NUEVO: Log de las coordenadas calculadas para debugging
    logEvent('AREA_COORDINATES_CALCULATED', {
      areaName: area.displayName || area.name,
      original: {
        x: area.position?.x || 0,
        y: area.position?.y || 0,
        width: area.position?.width || 100,
        height: area.position?.height || 100
      },
      scaled: {
        x: scaledX,
        y: scaledY,
        width: scaledWidth,
        height: scaledHeight
      },
      imageInfo: {
        left: imageLeft,
        top: imageTop,
        width: imageWidth,
        height: imageHeight,
        scaleX: imageScaleX,
        scaleY: imageScaleY
      },
      canvasDimensions: { width: fabricCanvas.getWidth(), height: fabricCanvas.getHeight() }
    });
  } else {
    // Fallback: usar coordenadas absolutas si no hay imagen
    areaRect.set({
      left: area.position?.x || 0,
      top: area.position?.y || 0,
      width: area.position?.width || 100,
      height: area.position?.height || 100
    });
    
    logEvent('AREA_COORDINATES_FALLBACK', {
      areaName: area.displayName || area.name,
      reason: 'No product image found',
      coordinates: {
        x: area.position?.x || 0,
        y: area.position?.y || 0,
        width: area.position?.width || 100,
        height: area.position?.height || 100
      }
    });
  }

  // ✅ NUEVO: Hacer las zonas clickeables para selección
  areaRect.on('mousedown', () => {
    handleZoneSelect(area._id || area.id, area);
  });

  // ✅ NUEVO: Agregar datos de la zona para identificación
  areaRect.data = {
    ...areaRect.data,
    zoneId: area._id || area.id,
    zoneName: area.displayName || area.name,
    zoneData: area
  };

        fabricCanvas.add(areaRect);
        builtZones.push({
          id: area._id || area.id,
          name: area.displayName || area.name,
          accepts: area.accepts,
          position: area.position
        });
        
        // ✅ NUEVO: Agregar etiqueta de texto para el nombre del área
        if (area.displayName || area.name) {
          const label = new fabric.Text(area.displayName || area.name, {
            left: areaRect.left + areaRect.width / 2,
            top: areaRect.top - 20,
            fontSize: 12,
            fill: NEW_COLORS.darkBlue,
            fontWeight: 'bold',
            selectable: false,
            evented: false,
            originX: 'center',
            originY: 'bottom',
            data: {
              type: 'areaLabel',
              isArea: false,
              isProductImage: false,
              areaId: area._id || area.id
            }
          });
          label.set({ visible: showZoneLabels });
          
          fabricCanvas.add(label);
        }
      });

      // Exponer lista de zonas
      setZonesList(builtZones);

      logEvent('CUSTOMIZATION_AREAS_LOADED_SUCCESS', { 
        areasCount: areas.length,
        imageScale: productImage.scaleX 
      });

    } catch (error) {
      logEvent('CUSTOMIZATION_AREAS_LOAD_ERROR', { error: error.message });
      console.warn('Error al cargar zonas customizables:', error.message);
    }
  }, [logEvent, showZoneLabels]);

  // ================ CARGA DE DISEÑO INICIAL ================
  const loadInitialDesign = useCallback(async (design, fabricCanvas) => {
    if (!design || !fabricCanvas) {
      logEvent('INITIAL_DESIGN_SKIP', { hasDesign: !!design, hasCanvas: !!fabricCanvas });
      return;
    }

    logEvent('INITIAL_DESIGN_LOAD_START', { design });

    try {
      // Aquí puedes implementar la lógica para cargar un diseño guardado
      // Por ahora solo logueamos que se intentó cargar
      logEvent('INITIAL_DESIGN_LOAD_SUCCESS');
    } catch (error) {
      logEvent('INITIAL_DESIGN_LOAD_ERROR', { error: error.message });
      throw error;
    }
  }, [logEvent]);

  // ================ FUNCIONES DE HERRAMIENTAS ================
  const addText = useCallback((text = 'Texto de ejemplo', options = {}) => {
    if (!canvas || !canvasInitialized) {
      logEvent('ADD_TEXT_ERROR', { error: 'Canvas no inicializado', canvasInitialized });
      return null;
    }

    try {
      // ✅ CORREGIDO: Posicionar el texto en el centro del canvas
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      const defaultOptions = {
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: NEW_COLORS.darkBlue,
        stroke: NEW_COLORS.primaryBlue,
        strokeWidth: 1,
        selectable: true,
        evented: true,
        originX: 'center',
        originY: 'center',
        data: { type: 'text', originalText: text }
      };

      const textObject = new fabric.Text(text, { ...defaultOptions, ...options });
      
      canvas.add(textObject);
      canvas.setActiveObject(textObject);
      canvas.requestRenderAll();
      
      logEvent('TEXT_ADDED', { text, options: defaultOptions });
      return textObject;
    } catch (error) {
      logEvent('ADD_TEXT_ERROR', { error: error.message });
      return null;
    }
  }, [canvas, canvasInitialized, logEvent]);

  const addImage = useCallback((file, options = {}) => {
    if (!canvas || !canvasInitialized) {
      logEvent('ADD_IMAGE_ERROR', { error: 'Canvas no inicializado', canvasInitialized });
      return null;
    }

    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        fabric.Image.fromURL(e.target.result, (img) => {
          if (img) {
            // ✅ CORREGIDO: Posicionar la imagen en el centro del canvas
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            
            // Calcular escala para que la imagen quepa en el canvas
            const scaleX = (canvasWidth * 0.6) / img.width;
            const scaleY = (canvasHeight * 0.6) / img.height;
            const scale = Math.min(scaleX, scaleY, 1);
            
            const defaultOptions = {
              left: canvasWidth / 2,
              top: canvasHeight / 2,
              scaleX: scale,
              scaleY: scale,
              originX: 'center',
              originY: 'center',
              selectable: true,
              evented: true,
              data: { type: 'image', fileName: file.name }
            };

            img.set({ ...defaultOptions, ...options });
            
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.requestRenderAll();
            
            logEvent('IMAGE_ADDED', { fileName: file.name, options: defaultOptions });
          }
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      logEvent('ADD_IMAGE_ERROR', { error: error.message });
      return null;
    }
  }, [canvas, canvasInitialized, logEvent]);

  const addShape = useCallback((shapeType = 'rectangle', options = {}) => {
    if (!canvas || !canvasInitialized) {
      logEvent('ADD_SHAPE_ERROR', { error: 'Canvas no inicializado', canvasInitialized });
      return null;
    }

    try {
      // ✅ CORREGIDO: Posicionar la forma en el centro del canvas
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      const baseOptions = {
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        fill: NEW_COLORS.primaryBlue,
        stroke: NEW_COLORS.darkBlue,
        strokeWidth: 2,
        selectable: true,
        evented: true,
        originX: 'center',
        originY: 'center',
        data: { type: 'shape', shapeType }
      };

      let shape;
      switch (shapeType) {
        case 'circle':
          shape = new fabric.Circle({
            radius: 50,
            ...baseOptions,
            ...options
          });
          break;
        case 'triangle':
          shape = new fabric.Triangle({
            width: 100,
            height: 100,
            ...baseOptions,
            ...options
          });
          break;
        case 'line':
          shape = new fabric.Line([0, 0, 100, 0], {
            stroke: baseOptions.fill,
            strokeWidth: 3,
            left: baseOptions.left,
            top: baseOptions.top,
            data: baseOptions.data
          });
          break;
        default:
          shape = new fabric.Rect({
            width: 100,
            height: 100,
            ...baseOptions,
            ...options
          });
      }

      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.requestRenderAll();
      
      logEvent('SHAPE_ADDED', { shapeType, options });
      return shape;
    } catch (error) {
      logEvent('ADD_SHAPE_ERROR', { error: error.message });
      return null;
    }
  }, [canvas, canvasInitialized, logEvent]);

  // ================ FUNCIONES DE UTILIDAD ================
  const getCanvasData = useCallback(() => {
    if (!canvas) return null;
    
    try {
      return {
        canvas: canvas.toJSON(),
        productType,
        productConfig,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logEvent('GET_CANVAS_DATA_ERROR', { error: error.message });
      return null;
    }
  }, [canvas, productType, productConfig, logEvent]);

  const clearCanvas = useCallback(() => {
    if (!canvas) return;
    
    try {
      canvas.clear();
      canvas.setBackgroundColor(productConfig?.canvas?.backgroundColor || '#ffffff');
      canvas.requestRenderAll();
      
      logEvent('CANVAS_CLEARED');
    } catch (error) {
      logEvent('CANVAS_CLEAR_ERROR', { error: error.message });
    }
  }, [canvas, productConfig, logEvent]);

  // ================ EFECTOS ================
  // ✅ CORREGIDO: useEffect separado para detectar producto
  useEffect(() => {
    if (product && !productConfig) {
      detectAndSetProductType();
    }
  }, [product, productConfig, detectAndSetProductType]);

  // ✅ CORREGIDO: useEffect separado para inicializar canvas
  useEffect(() => {
    if (isOpen && productConfig && !initializationRef.current) {
      // Pequeño delay para asegurar que todo esté listo
      const timer = setTimeout(() => {
        initializeCanvas();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, productConfig, initializeCanvas]);

  // ✅ CORREGIDO: Cleanup solo cuando se cierra el modal
  useEffect(() => {
    if (!isOpen && canvas) {
      cleanupCanvas();
    }
  }, [isOpen, canvas, cleanupCanvas]);

  // ================ RETORNAR FUNCIONES Y ESTADOS ================
  return {
    // Estados
    canvas,
    canvasInitialized,
    canvasError,
    productType,
    productConfig,
    zonesList,
    showZoneLabels,
    
    // ✅ NUEVO: Estados de selección de zonas
    selectedZone,
    selectedZoneData,
    
    // Referencias
    canvasRef,
    canvasContainerRef,
    
    // Funciones principales
    initializeCanvas,
    cleanupCanvas,
    cleanupOnClose,
    
    // ✅ NUEVO: Función de selección de zonas
    handleZoneSelect,
    toggleZoneLabels,
    
    // Funciones de herramientas
    addText,
    addImage,
    addShape,
    
    // Funciones de utilidad
    getCanvasData,
    clearCanvas,
    
    // Logging
    logEvent
  };
};
