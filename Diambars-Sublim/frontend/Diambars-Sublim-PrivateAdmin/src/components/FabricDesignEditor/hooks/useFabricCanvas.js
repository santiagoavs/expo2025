// src/components/FabricDesignEditor/hooks/useFabricCanvas.js - CORREGIDO

import { useState, useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { CoordinateTransformer } from '../../../utils/CoordinateTransformer';
import { ImageUtils } from '../../../utils/imageUtils';
import fontService from '../../../services/FontService';

export const useFabricCanvas = ({ isOpen, product, initialDesign, onSave }) => {
  const [canvas, setCanvas] = useState(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);

  const canvasRef = useRef();
  const canvasContainerRef = useRef();
  const initializationRef = useRef(false);

  // ================ INICIALIZACIÓN ================
  const initializeCanvas = useCallback(async () => {
    if (initializationRef.current || !canvasRef.current || !isOpen) return;

    initializationRef.current = true;
    
    try {
      console.log('🎨 Inicializando Fabric canvas...');

      // Crear canvas de Fabric
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true
      });

      // Configurar eventos
      fabricCanvas.on('object:added', handleObjectAdded);
      fabricCanvas.on('object:modified', handleObjectModified);
      fabricCanvas.on('selection:created', handleSelectionCreated);

      setCanvas(fabricCanvas);
      setCanvasInitialized(true);

      // Inicializar fuentes
      await fontService.loadGoogleFonts();

      // Cargar áreas del producto
      if (product?.customizationAreas) {
        await loadProductAreas(fabricCanvas, product.customizationAreas);
      }

      // Cargar diseño inicial si existe
      if (initialDesign) {
        await loadInitialDesign(fabricCanvas, initialDesign);
      }

      console.log('✅ Fabric canvas inicializado');
    } catch (error) {
      console.error('❌ Error inicializando canvas:', error);
    } finally {
      initializationRef.current = false;
    }
  }, [isOpen, product, initialDesign]);

  // ================ EVENTOS DEL CANVAS ================
  const handleObjectAdded = useCallback((e) => {
    const obj = e.target;
    if (!obj.isAreaMarker) {
      console.log('📦 Objeto agregado:', obj.type);
      // Auto-guardar después de cambios
      setTimeout(() => autoSave(), 1000);
    }
  }, []);

  const handleObjectModified = useCallback((e) => {
    console.log('✏️ Objeto modificado:', e.target.type);
    setTimeout(() => autoSave(), 1000);
  }, []);

  const handleSelectionCreated = useCallback((e) => {
    console.log('👆 Selección creada');
  }, []);

  // ================ CARGAR ÁREAS DEL PRODUCTO ================
  const loadProductAreas = useCallback(async (fabricCanvas, customizationAreas) => {
    try {
      const processedAreas = [];

      for (const area of customizationAreas) {
        const fabricBounds = CoordinateTransformer.konvaAreaToFabricBounds(
          area.position, 
          fabricCanvas
        );

        if (fabricBounds) {
          // Crear rectángulo visual del área
          const areaRect = new fabric.Rect({
            left: fabricBounds.left,
            top: fabricBounds.top,
            width: fabricBounds.width,
            height: fabricBounds.height,
            fill: 'rgba(31, 100, 191, 0.1)',
            stroke: '#1F64BF',
            strokeWidth: 2,
            strokeDashArray: [8, 4],
            selectable: false,
            evented: false,
            isAreaMarker: true
          });

          fabricCanvas.add(areaRect);
          fabricCanvas.sendToBack(areaRect);

          processedAreas.push({
            id: area._id,
            name: area.name || area.displayName,
            bounds: fabricBounds,
            accepts: area.accepts
          });
        }
      }

      setAreas(processedAreas);
      fabricCanvas.requestRenderAll();
    } catch (error) {
      console.error('Error cargando áreas del producto:', error);
    }
  }, []);

  // ================ HERRAMIENTAS DE DISEÑO ================
  const addText = useCallback(async (text = 'Texto de ejemplo', options = {}) => {
    if (!canvas) return null;

    try {
      const textObject = new fabric.IText(text, {
        left: options.left || canvas.getWidth() / 2,
        top: options.top || canvas.getHeight() / 2,
        fontSize: options.fontSize || 24,
        fontFamily: options.fontFamily || 'Arial',
        fill: options.fill || '#000000',
        originX: 'center',
        originY: 'center',
        areaId: selectedArea?.id || null
      });

      // Aplicar fuente si es de Google
      if (options.fontFamily && options.fontFamily !== 'Arial') {
        await fontService.applyFontToFabricObject(textObject, options.fontFamily);
      }

      canvas.add(textObject);
      canvas.setActiveObject(textObject);
      canvas.requestRenderAll();

      return textObject;
    } catch (error) {
      console.error('Error agregando texto:', error);
      return null;
    }
  }, [canvas, selectedArea]);

  const addImage = useCallback(async (imageFile, options = {}) => {
    if (!canvas || !imageFile) return null;

    try {
      // Cargar imagen
      const imageElement = await ImageUtils.loadImageFromFile(imageFile);
      
      // Crear objeto de Fabric
      const fabricImage = await new Promise((resolve, reject) => {
        fabric.Image.fromURL(imageElement.src, (img) => {
          if (img) {
            resolve(img);
          } else {
            reject(new Error('Error creando objeto de imagen'));
          }
        });
      });

      // Configurar imagen
      const scale = Math.min(
        (canvas.getWidth() * 0.4) / fabricImage.width,
        (canvas.getHeight() * 0.4) / fabricImage.height,
        1
      );

      fabricImage.set({
        left: options.left || canvas.getWidth() / 2,
        top: options.top || canvas.getHeight() / 2,
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
        areaId: selectedArea?.id || null
      });

      canvas.add(fabricImage);
      canvas.setActiveObject(fabricImage);
      canvas.requestRenderAll();

      return fabricImage;
    } catch (error) {
      console.error('Error agregando imagen:', error);
      return null;
    }
  }, [canvas, selectedArea]);

  // ================ PROCESAMIENTO DE IMÁGENES ================
  const removeImageBackground = useCallback(async (fabricImageObject, tolerance = 20) => {
    if (!fabricImageObject || fabricImageObject.type !== 'image') return false;

    try {
      // Obtener elemento de imagen original
      const originalSrc = fabricImageObject.getSrc();
      const imageElement = await ImageUtils.loadImageFromUrl(originalSrc);
      
      // Remover fondo
      const processedImageUrl = await ImageUtils.removeWhiteBackground(imageElement, tolerance);
      
      // Actualizar objeto de Fabric
      fabricImageObject.setSrc(processedImageUrl, () => {
        canvas.requestRenderAll();
      });

      return true;
    } catch (error) {
      console.error('Error removiendo fondo de imagen:', error);
      return false;
    }
  }, [canvas]);

  const applyImageFilter = useCallback(async (fabricImageObject, filterType, value) => {
    if (!fabricImageObject || fabricImageObject.type !== 'image') return false;

    try {
      // Obtener imagen original
      const originalSrc = fabricImageObject.getSrc();
      const imageElement = await ImageUtils.loadImageFromUrl(originalSrc);
      
      // Aplicar filtro
      const filteredImageUrl = await ImageUtils.applyColorFilter(imageElement, filterType, value);
      
      // Actualizar objeto
      fabricImageObject.setSrc(filteredImageUrl, () => {
        canvas.requestRenderAll();
      });

      return true;
    } catch (error) {
      console.error('Error aplicando filtro:', error);
      return false;
    }
  }, [canvas]);

  // ================ GUARDADO AUTOMÁTICO ================
  const autoSave = useCallback(async () => {
    if (!canvas || isSaving) return;

    try {
      const designData = CoordinateTransformer.fabricCanvasToDesignData(canvas);
      console.log('💾 Auto-guardando diseño...', designData);
      
      // Guardar en localStorage como respaldo
      localStorage.setItem('fabric-design-backup', JSON.stringify(designData));
      
    } catch (error) {
      console.error('Error en auto-guardado:', error);
    }
  }, [canvas, isSaving]);

  // ================ GUARDADO MANUAL ================
  const saveDesign = useCallback(async () => {
    if (!canvas || isSaving) return null;

    setIsSaving(true);
    
    try {
      console.log('💾 Guardando diseño...');
      
      const designData = CoordinateTransformer.fabricCanvasToDesignData(canvas);
      
      if (onSave) {
        const result = await onSave(designData);
        console.log('✅ Diseño guardado exitosamente');
        return result;
      }
      
      return designData;
    } catch (error) {
      console.error('❌ Error guardando diseño:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [canvas, onSave, isSaving]);

  // ================ CARGAR DISEÑO INICIAL ================
  const loadInitialDesign = useCallback(async (fabricCanvas, designData) => {
    try {
      console.log('📂 Cargando diseño inicial...', designData);
      
      const success = await CoordinateTransformer.loadDesignDataToFabricCanvas(
        designData, 
        fabricCanvas, 
        fabric
      );
      
      if (success) {
        console.log('✅ Diseño inicial cargado');
      } else {
        console.warn('⚠️ Error cargando diseño inicial');
      }
    } catch (error) {
      console.error('❌ Error cargando diseño inicial:', error);
    }
  }, []);

  // ================ SELECCIÓN DE ÁREAS ================
  const selectArea = useCallback((areaId) => {
    const area = areas.find(a => a.id === areaId);
    if (area) {
      setSelectedArea(area);
      console.log('🎯 Área seleccionada:', area.name);
    }
  }, [areas]);

  // ================ VALIDACIONES ================
  const validateObjectPlacement = useCallback((fabricObject) => {
    if (!selectedArea || !fabricObject) return true;

    return CoordinateTransformer.isObjectWithinArea(fabricObject, selectedArea.bounds);
  }, [selectedArea]);

  // ================ FILTROS DE FABRIC.JS ================
  const applyFabricFilter = useCallback((fabricObject, filterType, value) => {
    if (!fabricObject || fabricObject.type !== 'image') return false;

    try {
      let filter;
      
      switch (filterType) {
        case 'brightness':
          filter = new fabric.Image.filters.Brightness({ brightness: (value - 100) / 100 });
          break;
        case 'contrast':
          filter = new fabric.Image.filters.Contrast({ contrast: (value - 100) / 100 });
          break;
        case 'saturation':
          filter = new fabric.Image.filters.Saturation({ saturation: (value - 100) / 100 });
          break;
        case 'blur':
          filter = new fabric.Image.filters.Blur({ blur: value / 100 });
          break;
        case 'sepia':
          filter = new fabric.Image.filters.Sepia();
          break;
        case 'grayscale':
          filter = new fabric.Image.filters.Grayscale();
          break;
        default:
          return false;
      }

      // Limpiar filtros anteriores del mismo tipo
      fabricObject.filters = fabricObject.filters?.filter(f => 
        f.constructor.name !== filter.constructor.name
      ) || [];
      
      // Agregar nuevo filtro
      fabricObject.filters.push(filter);
      
      // Aplicar filtros
      fabricObject.applyFilters();
      canvas.requestRenderAll();
      
      return true;
    } catch (error) {
      console.error('Error aplicando filtro de Fabric:', error);
      return false;
    }
  }, [canvas]);

  // ================ LIMPIEZA ================
  const cleanup = useCallback(() => {
    if (canvas) {
      console.log('🧹 Limpiando canvas de Fabric...');
      canvas.off();
      canvas.dispose();
      setCanvas(null);
      setCanvasInitialized(false);
    }
  }, [canvas]);

  // ================ EFECTOS ================
  useEffect(() => {
    if (isOpen && !canvasInitialized) {
      initializeCanvas();
    }
  }, [isOpen, initializeCanvas, canvasInitialized]);

  useEffect(() => {
    if (!isOpen && canvas) {
      cleanup();
    }
  }, [isOpen, canvas, cleanup]);

  // ================ EXPORTAR FUNCIONES ================
  return {
    // Estado
    canvas,
    canvasInitialized,
    isSaving,
    areas,
    selectedArea,

    // Referencias
    canvasRef,
    canvasContainerRef,

    // Herramientas
    addText,
    addImage,
    selectArea,

    // Procesamiento de imágenes
    removeImageBackground,
    applyImageFilter,
    applyFabricFilter,

    // Guardado
    saveDesign,
    autoSave,

    // Validaciones
    validateObjectPlacement,

    // Limpieza
    cleanup,

    // Estado calculado
    hasUnsavedChanges: false, // Implementar lógica de cambios
    canSave: canvasInitialized && !isSaving
  };
};