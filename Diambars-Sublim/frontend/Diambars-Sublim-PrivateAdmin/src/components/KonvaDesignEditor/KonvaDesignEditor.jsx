// KonvaDesignEditor.jsx - EDITOR REFACTORIZADO CON ARQUITECTURA MEJORADA
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Transformer, Line } from 'react-konva';
import { Box, Typography, CircularProgress, Backdrop, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';

// ==================== HOOKS Y SERVICIOS ESPECIALIZADOS ====================
import { useKonvaCanvas } from './hooks/useKonvaCanvas';
import { useKonvaHistory } from './hooks/useKonvaHistory';
import { useKonvaSelection } from './hooks/useKonvaSelection';
import { useProductBackground } from './hooks/useProductBackground';
import { useCustomizationAreas } from './hooks/useCustomizationAreas';
import { useUnifiedCanvasCentering } from './hooks/useUnifiedCanvasCentering';

// ==================== COMPONENTES ESPECIALIZADOS ====================
import { EditorToolbar } from './components/Editor/EditorToolbar';
import { ToolsPanel } from './components/Tools/ToolsPanel';
import { PropertiesPanel } from './components/Properties/PropertiesPanel';
import { LayersPanel } from './components/Layers/LayersPanel';
import { AssetsPanel } from './components/Assets/AssetsPanel';
import { ExportPanel } from './components/Export/ExportPanel';
import { ShapeCreator } from './components/Shapes/ShapeCreator';
import ColorPicker from '../FabricDesignEditor/components/ColorPicker';
import { testImageFlow } from './utils/imageTestUtils';

// ==================== ELEMENTOS RENDERIZABLES ====================
import { KonvaElementRenderer } from './components/Elements/KonvaElementRenderer';
import { CustomizationAreaRenderer } from './components/Areas/CustomizationAreaRenderer';
import { AreaSelector } from './components/Areas/AreaSelector';

// ==================== SERVICIOS ====================
import { ElementFactory } from './services/ElementFactory';
import { ValidationService } from './services/ValidationService';
import { FontService } from './services/FontService';
import { ExportService } from './services/ExportService';
import { HistoryManager } from './services/HistoryManager';
import { CANVAS_CONFIG, calculateScaledDimensions } from './constants/canvasConfig';

// ==================== CONSTANTES ====================
const EDITOR_CONFIG = {
  canvas: {
    ...CANVAS_CONFIG,
    pixelRatio: window.devicePixelRatio || 1
  },
  grid: CANVAS_CONFIG.grid,
  snap: CANVAS_CONFIG.snap,
  zoom: CANVAS_CONFIG.zoom
};

const THEME_COLORS = {
  primary: '#1F64BF',
  primaryDark: '#032CA6',
  accent: '#040DBF',
  background: '#F2F2F2',
  surface: '#FFFFFF',
  text: '#010326',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

// ==================== STYLED COMPONENTS ====================
const EditorLayout = styled(Box, {
  name: 'KonvaDesignEditor-Layout',
  slot: 'Root'
})(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10000,
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${THEME_COLORS.background} 0%, #E8E8E8 100%)`,
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}));

const CanvasContainer = styled(Box, {
  name: 'KonvaDesignEditor-CanvasContainer',
  slot: 'MainCanvasWrapper'
})(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  background: THEME_COLORS.surface,
  borderRadius: '16px',
  // ✅ CORREGIDO: Reducir margin para usar más espacio
  margin: theme.spacing(1),
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: `1px solid ${theme.palette.divider}`
}));

const StageWrapper = styled(Box, {
  name: 'KonvaDesignEditor-StageWrapper',
  slot: 'KonvaStageContainer'
})({
  position: 'relative',
  flex: 1,
  overflow: 'hidden',
  cursor: 'default',
  '&.drawing': {
    cursor: 'crosshair'
  },
  '&.dragging': {
    cursor: 'grabbing'
  },
  '&.resizing': {
    cursor: 'nw-resize'
  }
});

// ==================== EDITOR PRINCIPAL ====================
const KonvaDesignEditor = ({
  product,
  initialDesign,
  onSave,
  onClose,
  onBack,
  isOpen = true,
  mode = 'full' // 'full', 'simple', 'viewer'
}) => {
  // ==================== REFS ====================
  const stageRef = useRef();
  const layerRef = useRef();
  const transformerRef = useRef();
  const containerRef = useRef();

  // ==================== ESTADO LOCAL ====================
  const [editorMode, setEditorMode] = useState(mode);
  const [activeTool, setActiveTool] = useState('select');
  const [isLoading, setIsLoading] = useState(false);
  const [activePanel, setActivePanel] = useState('tools'); // 'tools', 'properties', 'layers', 'assets', 'areas'
  const [showGrid, setShowGrid] = useState(EDITOR_CONFIG.grid.enabled);
  const [snapToGrid, setSnapToGrid] = useState(EDITOR_CONFIG.snap.enabled);
  const [zoom, setZoom] = useState(1);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  
  // ==================== ESTADO DE COLOR DE FONDO ====================
  const [productColorFilter, setProductColorFilter] = useState(null);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);

  // ==================== HOOKS ESPECIALIZADOS ====================
  
  // Canvas y elementos
  const {
    elements,
    setElements,
    addElement,
    updateElement,
    removeElement,
    duplicateElement,
    canvasConfig,
    updateCanvasConfig
  } = useKonvaCanvas(initialDesign, product);

  // Sistema de historial
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    saveState,
    getHistoryInfo
  } = useKonvaHistory(elements, setElements);

  // Sistema de selección
  const {
    selectedIds,
    selectedElements,
    selectElement,
    selectMultiple,
    clearSelection,
    isSelected,
    selectionBounds
  } = useKonvaSelection(elements);

  // Fondo del producto (sin canvasDimensions inicialmente)
  const {
    productImage,
    productImageLoaded,
    productScale,
    productPosition
  } = useProductBackground(product, null);

  // ✅ UNIFICADO: Usar hook compartido para centrado del canvas (después de productImage)
  const {
    stageScale,
    stagePosition,
    setStageScale,
    setStagePosition,
    handleWheel: handleCanvasWheel,
    zoomIn,
    zoomOut,
    resetZoom
  } = useUnifiedCanvasCentering(productImage, containerRef);

  // ✅ CORREGIDO: Usar dimensiones fijas del canvas como KonvaAreaEditor
  const stageDimensions = {
    width: CANVAS_CONFIG.width,
    height: CANVAS_CONFIG.height
  };

  // Dimensiones del canvas escalado (después de stageScale)
  const canvasDimensions = {
    width: CANVAS_CONFIG.width * stageScale,
    height: CANVAS_CONFIG.height * stageScale
  };
  
  const {
    customizationAreas,
    getAreaForPosition,
    validateElementInArea,
    snapToArea
  } = useCustomizationAreas(product, canvasDimensions);

  // ==================== SERVICIOS ESPECIALIZADOS ====================
  const elementFactory = new ElementFactory();
  const validationService = new ValidationService();
  const fontService = new FontService();
  const exportService = new ExportService();
  const historyManager = new HistoryManager();

  // ==================== MANEJADORES DE EVENTOS ====================

  const handleStageClick = useCallback((e) => {
    // Si se hace clic en el stage vacío, limpiar selección
    if (e.target === e.target.getStage()) {
      clearSelection();
      return;
    }

    const clickedElement = e.target;
    const elementId = clickedElement.attrs.id;

    if (!elementId) return;

    // Manejar selección múltiple con Ctrl/Cmd
    if (e.evt.ctrlKey || e.evt.metaKey) {
      if (isSelected(elementId)) {
        // Deseleccionar si ya está seleccionado
        const newSelection = selectedIds.filter(id => id !== elementId);
        selectMultiple(newSelection);
      } else {
        // Agregar a la selección
        selectMultiple([...selectedIds, elementId]);
      }
    } else {
      // Selección simple
      selectElement(elementId);
    }
  }, [selectedIds, isSelected, selectElement, selectMultiple, clearSelection]);

  const handleElementDragEnd = useCallback((elementId, newPosition) => {
    // Validar que el elemento esté en un área válida
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // No validar áreas para el producto base
    if (elementId === 'product-background') {
      updateElement(elementId, {
        x: newPosition.x,
        y: newPosition.y
      });
      saveState(`Mover elemento ${element.type}`);
      return;
    }

    const targetArea = getAreaForPosition(newPosition.x, newPosition.y);
    
    // Si no hay área específica, usar la zona seleccionada o mantener la actual
    let finalAreaId = element.areaId;
    if (targetArea) {
      finalAreaId = targetArea.id;
      console.log('🎯 [KonvaDesignEditor] Elemento movido a área específica:', targetArea.id);
    } else if (selectedAreaId) {
      finalAreaId = selectedAreaId;
      console.log('🎯 [KonvaDesignEditor] Elemento asignado a zona seleccionada:', selectedAreaId);
    } else if (customizationAreas.length > 0) {
      finalAreaId = customizationAreas[0].id;
      console.log('🎯 [KonvaDesignEditor] Elemento asignado a primera zona disponible:', customizationAreas[0].id);
    } else {
      finalAreaId = 'default-area';
      console.log('🎯 [KonvaDesignEditor] Elemento asignado a zona por defecto');
    }

    // Aplicar snap si está habilitado
    let finalPosition = newPosition;
    if (snapToGrid) {
      finalPosition = {
        x: Math.round(newPosition.x / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size,
        y: Math.round(newPosition.y / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size
      };
    }

    // Actualizar elemento y guardar en historial
    updateElement(elementId, {
      x: finalPosition.x,
      y: finalPosition.y,
      areaId: finalAreaId
    });

    saveState(`Mover elemento ${element.type}`);
  }, [elements, updateElement, getAreaForPosition, snapToGrid, saveState, selectedAreaId, customizationAreas]);

  const handleElementTransform = useCallback((elementId, newAttrs) => {
    updateElement(elementId, newAttrs);
    saveState(`Transformar elemento`);
  }, [updateElement, saveState]);

  // ==================== HERRAMIENTAS ====================

  const handleToolChange = useCallback((toolId) => {
    setActiveTool(toolId);
    clearSelection(); // Limpiar selección al cambiar herramienta
  }, [clearSelection]);

  const handleAddText = useCallback(() => {
    const textElement = elementFactory.createTextElement({
      x: 100,
      y: 100,
      text: 'Nuevo texto',
      fontSize: 24,
      fill: THEME_COLORS.text,
      areaId: selectedAreaId || (customizationAreas.length > 0 ? customizationAreas[0].id : 'default-area')
    });

    addElement(textElement);
    selectElement(textElement.id);
    saveState('Agregar texto');
    toast.success('Texto agregado');
  }, [elementFactory, addElement, selectElement, saveState, selectedAreaId, customizationAreas]);

  const handleAddShape = useCallback((shapeType, customPoints = null) => {
    const baseConfig = {
      x: 150,
      y: 150,
      fill: THEME_COLORS.primary,
      stroke: THEME_COLORS.primaryDark,
      strokeWidth: 2,
      areaId: selectedAreaId || (customizationAreas.length > 0 ? customizationAreas[0].id : 'default-area')
    };

    let shapeElement;

    switch (shapeType) {
      case 'rect':
        shapeElement = elementFactory.createRectElement({
          ...baseConfig,
          width: 100,
          height: 80
        });
        break;
      case 'circle':
        shapeElement = elementFactory.createCircleElement({
          ...baseConfig,
          radius: 50
        });
        break;
      case 'triangle':
        shapeElement = elementFactory.createTriangleElement({
          ...baseConfig,
          points: [0, 50, 50, 0, 100, 50]
        });
        break;
      case 'star':
        shapeElement = elementFactory.createStarElement({
          ...baseConfig,
          numPoints: 5,
          innerRadius: 20,
          outerRadius: 40
        });
        break;
      case 'custom':
        if (customPoints) {
          shapeElement = elementFactory.createCustomShapeElement({
            ...baseConfig,
            points: customPoints
          });
        } else {
          toast.error('Puntos personalizados requeridos para forma personalizada');
          return;
        }
        break;
      default:
        toast.error('Tipo de forma no soportado');
        return;
    }

    addElement(shapeElement);
    selectElement(shapeElement.id);
    saveState(`Agregar ${shapeType}`);
    toast.success(`${shapeType} agregado`);
  }, [elementFactory, addElement, selectElement, saveState, selectedAreaId, customizationAreas]);

  const handleImageDrop = useCallback(async (files) => {
    setIsLoading(true);
    
    try {
      for (const file of files) {
        console.log('🖼️ [KonvaDesignEditor] Procesando archivo:', {
          name: file.name,
          type: file.type,
          size: file.size
        });

        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }

        // Validar archivo antes de procesar
        const validationErrors = await validationService.validateImageFile(file);
        if (validationErrors.length > 0) {
          toast.error(`${file.name}: ${validationErrors.join(', ')}`);
          continue;
        }

        // Convertir a base64
        const imageDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('🖼️ [KonvaDesignEditor] Imagen convertida a base64:', {
              name: file.name,
              dataUrlLength: reader.result.length,
              dataUrlStart: reader.result.substring(0, 50) + '...'
            });
            resolve(reader.result);
          };
          reader.onerror = () => reject(new Error('Error leyendo archivo'));
          reader.readAsDataURL(file);
        });

        // Obtener dimensiones
        const img = new window.Image();
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('🖼️ [KonvaDesignEditor] Imagen cargada:', {
              name: file.name,
              width: img.width,
              height: img.height
            });
            resolve();
          };
          img.onerror = () => reject(new Error('Error cargando imagen'));
          img.src = imageDataUrl;
        });

        // Calcular tamaño apropiado
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);

        const imageElement = elementFactory.createImageElement({
          x: 100 + Math.random() * 100,
          y: 100 + Math.random() * 100,
          width: img.width * scale,
          height: img.height * scale,
          imageUrl: imageDataUrl, // Para el editor
          image: imageDataUrl, // Para el backend (mismo valor)
          originalName: file.name,
          originalSize: file.size,
          areaId: selectedAreaId || (customizationAreas.length > 0 ? customizationAreas[0].id : 'default-area')
        });

        // Validar el elemento antes de agregarlo
        const elementValidation = validationService.validateElement(imageElement);
        if (elementValidation.length > 0) {
          console.error('🖼️ [KonvaDesignEditor] Error validando elemento de imagen:', elementValidation);
          toast.error(`Error validando imagen ${file.name}: ${elementValidation.join(', ')}`);
          continue;
        }

        console.log('🖼️ [KonvaDesignEditor] Elemento de imagen creado:', {
          id: imageElement.id,
          type: imageElement.type,
          hasImageUrl: !!imageElement.imageUrl,
          hasImage: !!imageElement.image,
          imageUrlStart: imageElement.imageUrl?.substring(0, 50) + '...',
          imageStart: imageElement.image?.substring(0, 50) + '...',
          width: imageElement.width,
          height: imageElement.height
        });

        addElement(imageElement);
        selectElement(imageElement.id);
        toast.success(`Imagen ${file.name} agregada`);
      }

      saveState('Agregar imágenes');
    } catch (error) {
      console.error('Error procesando imágenes:', error);
      toast.error('Error al procesar las imágenes');
    } finally {
      setIsLoading(false);
    }
  }, [elementFactory, addElement, selectElement, saveState, selectedAreaId, customizationAreas, validationService]);

  // ==================== FUNCIONES DE PRUEBA ====================

  const handleTestImageFlow = useCallback(() => {
    console.log('🧪 [KonvaDesignEditor] Iniciando prueba de flujo de imágenes...');
    const testResult = testImageFlow();
    if (testResult) {
      toast.success('Prueba de flujo de imágenes exitosa ✅');
    } else {
      toast.error('Prueba de flujo de imágenes falló ❌');
    }
  }, []);

  // ==================== GESTIÓN DE FUENTES ====================

  const handleLoadGoogleFonts = useCallback(async (fontNames) => {
    setIsLoading(true);
    
    try {
      await fontService.loadGoogleFonts(fontNames);
      toast.success(`${fontNames.length} fuentes cargadas exitosamente`);
    } catch (error) {
      console.error('Error cargando fuentes:', error);
      toast.error('Error al cargar las fuentes de Google');
    } finally {
      setIsLoading(false);
    }
  }, [fontService]);

  // ==================== GESTIÓN DE ÁREAS ====================

  const handleAreaSelect = useCallback((areaId) => {
    setSelectedAreaId(areaId);
    console.log('🎯 [KonvaDesignEditor] Zona seleccionada:', areaId);
  }, []);

  const handleAssignElementsToArea = useCallback(() => {
    if (!selectedAreaId) return;

    const elementsWithoutArea = elements.filter(el => !el.areaId || el.areaId === 'default-area');
    
    if (elementsWithoutArea.length === 0) {
      toast.info('No hay elementos sin zona asignada');
      return;
    }

    // Asignar todos los elementos sin área a la zona seleccionada
    elementsWithoutArea.forEach(element => {
      updateElement(element.id, { areaId: selectedAreaId });
    });

    saveState(`Asignar ${elementsWithoutArea.length} elemento(s) a zona`);
    toast.success(`${elementsWithoutArea.length} elemento(s) asignado(s) a la zona seleccionada`);
  }, [selectedAreaId, elements, updateElement, saveState]);

  // ==================== GESTIÓN DE COLOR DE FONDO ====================

  const handleBackgroundColorChange = useCallback((color) => {
    setProductColorFilter(color);
    console.log('🎨 [KonvaDesignEditor] Color de fondo cambiado:', color);
  }, []);

  const handleBackgroundColorApply = useCallback((color) => {
    setProductColorFilter(color);
    setShowBackgroundColorPicker(false);
    saveState('Cambiar color de fondo del producto');
    toast.success('Color de fondo aplicado');
  }, [saveState]);

  const handleResetBackgroundColor = useCallback(() => {
    setProductColorFilter(null);
    saveState('Restablecer color de fondo del producto');
    toast.success('Color de fondo restablecido');
  }, [saveState]);

  // ==================== EXPORTACIÓN ====================

  const handleExport = useCallback(async (format, options = {}) => {
    if (!stageRef.current) return;

    setIsLoading(true);
    
    try {
      const exportResult = await exportService.exportStage(stageRef.current, {
        format,
        quality: options.quality || 1,
        pixelRatio: options.pixelRatio || 2,
        includeBackground: options.includeBackground !== false,
        ...options
      });

      if (exportResult.success) {
        toast.success(`Exportado como ${format.toUpperCase()}`);
      } else {
        toast.error(exportResult.error || 'Error en la exportación');
      }
    } catch (error) {
      console.error('Error en exportación:', error);
      toast.error('Error al exportar');
    } finally {
      setIsLoading(false);
    }
  }, [exportService]);

  // ==================== GUARDADO ====================

  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setIsLoading(true);

    try {
      // Validar diseño antes de guardar
      const validationResult = validationService.validateDesign(elements, customizationAreas);
      
      if (!validationResult.isValid) {
        toast.error(`Errores de validación: ${validationResult.errors.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Preparar datos para el backend
      const designData = {
        productId: product?._id || product?.id,
        elements: elements.map(element => {
          // Usar el ElementFactory para convertir al formato del backend
          return elementFactory.toBackendFormat(element);
        }),
        canvasConfig,
        productColorFilter: productColorFilter, // Incluir el color de fondo
        metadata: {
          editor: 'konva-enhanced',
          version: '2.0.0',
          totalElements: elements.length,
          complexity: validationService.calculateComplexity(elements),
          exportedAt: new Date().toISOString()
        }
      };

      // Log de depuración para verificar que las imágenes se están guardando
      console.log('💾 [KonvaDesignEditor] Datos preparados para guardar:', {
        totalElements: designData.elements.length,
        elements: designData.elements.map(el => ({
          id: el.id,
          type: el.type,
          hasImageUrl: !!el.konvaAttrs?.imageUrl,
          hasImage: !!el.konvaAttrs?.image,
          imageUrlPreview: el.konvaAttrs?.imageUrl?.substring(0, 50) + '...',
          imagePreview: el.konvaAttrs?.image?.substring(0, 50) + '...',
          originalName: el.konvaAttrs?.originalName,
          imageUrlValid: el.konvaAttrs?.imageUrl ? validationService.isValidImageUrl(el.konvaAttrs.imageUrl) : false,
          imageValid: el.konvaAttrs?.image ? validationService.isValidImageUrl(el.konvaAttrs.image) : false
        }))
      });

      // Validar cada elemento antes de guardar
      const invalidElements = [];
      designData.elements.forEach((element, index) => {
        const elementValidation = validationService.validateElement({
          id: element.id,
          type: element.type,
          ...element.konvaAttrs
        });
        if (elementValidation.length > 0) {
          invalidElements.push({
            index: index + 1,
            id: element.id,
            type: element.type,
            errors: elementValidation
          });
        }
      });

      if (invalidElements.length > 0) {
        console.error('💾 [KonvaDesignEditor] Elementos inválidos encontrados:', invalidElements);
        const errorMessages = invalidElements.map(el => 
          `Elemento ${el.index} (${el.type}): ${el.errors.join(', ')}`
        );
        toast.error(`Errores de validación: ${errorMessages.join('; ')}`);
        setIsLoading(false);
        return;
      }

      await onSave(designData);
      toast.success('Diseño guardado exitosamente');
    } catch (error) {
      console.error('Error guardando diseño:', error);
      toast.error('Error al guardar el diseño');
    } finally {
      setIsLoading(false);
    }
  }, [onSave, elements, validationService, customizationAreas, canvasConfig, product]);

  // ==================== TECLAS DE ATAJO ====================

  useEffect(() => {
    const handleKeyboard = (e) => {
      // Evitar conflictos con inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'd':
            e.preventDefault();
            if (selectedIds.length > 0) {
              selectedIds.forEach(id => duplicateElement(id));
              saveState('Duplicar elementos');
            }
            break;
          case 'a':
            e.preventDefault();
            const allIds = elements.map(el => el.id);
            selectMultiple(allIds);
            break;
        }
      }

      // Teclas sin modificadores
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedIds.length > 0) {
            selectedIds.forEach(id => removeElement(id));
            clearSelection();
            saveState('Eliminar elementos');
          }
          break;
        case 'Escape':
          clearSelection();
          setActiveTool('select');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleSave, undo, redo, selectedIds, elements, duplicateElement, removeElement, clearSelection, selectMultiple, saveState]);

  // ==================== EFECTOS ====================

  // Actualizar transformer cuando cambia la selección
  useEffect(() => {
    if (transformerRef.current) {
      const selectedNodes = selectedIds
        .map(id => stageRef.current?.findOne(`#${id}`))
        .filter(Boolean);
      
      transformerRef.current.nodes(selectedNodes);
    }
  }, [selectedIds]);

  // ✅ UNIFICADO: Configurar zoom con rueda del mouse usando hook compartido
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (e) => {
      e.evt.preventDefault();
      
      if (e.evt.ctrlKey) {
        // Zoom con Ctrl + rueda usando el hook unificado
        handleCanvasWheel(e);
      }
    };

    stage.on('wheel', handleWheel);
    return () => stage.off('wheel', handleWheel);
  }, [handleCanvasWheel]);

  if (!isOpen) return null;

  // ==================== RENDER ====================
  return (
    <EditorLayout>
      {/* Toolbar principal */}
      <EditorToolbar
        product={product}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onClose={onClose}
        onBack={onBack}
        isLoading={isLoading}
        zoom={stageScale * zoom}
        onZoomChange={(newZoom) => setZoom(newZoom / stageScale)}
        showGrid={showGrid}
        onToggleGrid={setShowGrid}
        snapToGrid={snapToGrid}
        onToggleSnap={setSnapToGrid}
        onTestImageFlow={handleTestImageFlow}
      />

      {/* Panel de herramientas */}
      <ToolsPanel
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onAddText={handleAddText}
        onAddShape={handleAddShape}
        onImageDrop={handleImageDrop}
        selectedCount={selectedIds.length}
        onDeleteSelected={() => {
          selectedIds.forEach(id => removeElement(id));
          clearSelection();
          saveState('Eliminar elementos');
        }}
        onDuplicateSelected={() => {
          selectedIds.forEach(id => duplicateElement(id));
          saveState('Duplicar elementos');
        }}
        // Nuevas props para funcionalidades movidas
        customizationAreas={customizationAreas}
        selectedAreaId={selectedAreaId}
        onAreaSelect={handleAreaSelect}
        productColorFilter={productColorFilter}
        onColorChange={handleBackgroundColorChange}
        onColorApply={handleBackgroundColorApply}
        onResetColor={handleResetBackgroundColor}
      />

      {/* Canvas principal */}
      <CanvasContainer ref={containerRef}>
        <StageWrapper
          className={`
            ${activeTool === 'draw' ? 'drawing' : ''}
            ${selectedIds.length > 0 && activeTool === 'select' ? 'selecting' : ''}
          `}
        >
          <Stage
            ref={stageRef}
            width={stageDimensions.width}
            height={stageDimensions.height}
            scaleX={stageScale * zoom}
            scaleY={stageScale * zoom}
            x={stagePosition.x}
            y={stagePosition.y}
            onMouseDown={handleStageClick}
            onTouchStart={handleStageClick}
            onWheel={handleCanvasWheel}
            draggable
            pixelRatio={window.devicePixelRatio || 1}
            listening={true}
          >
            <Layer ref={layerRef}>
              {/* Grid de fondo */}
              {showGrid && (
                <GridPattern
                  width={stageDimensions.width}
                  height={stageDimensions.height}
                  size={CANVAS_CONFIG.grid.size}
                  stroke={CANVAS_CONFIG.grid.color}
                  opacity={CANVAS_CONFIG.grid.opacity}
                  stageScale={stageScale * zoom}
                />
              )}

              {/* Imagen del producto con filtro de color - CORREGIDO para usar misma lógica que KonvaAreaEditor */}
              {productImage && productImageLoaded && (() => {
                // ✅ CORREGIDO: Usar la función compartida calculateScaledDimensions
                const scaleX = stageDimensions.width / productImage.width;
                const scaleY = stageDimensions.height / productImage.height;
                const scale = Math.min(scaleX, scaleY) * CANVAS_CONFIG.productScale;
                const scaledDimensions = calculateScaledDimensions(productImage.width, productImage.height, scale);
                
                return (
                  <KonvaElementRenderer
                    element={{
                      id: 'product-background',
                      type: 'image',
                      x: scaledDimensions.x,
                      y: scaledDimensions.y,
                      width: scaledDimensions.width,
                      height: scaledDimensions.height,
                      imageUrl: product.images?.main,
                      image: productImage,
                      listening: false,
                      opacity: 0.8,
                      draggable: false,
                      // Aplicar filtro de color directamente
                      fill: productColorFilter || undefined,
                      filters: productColorFilter ? ['ColorMatrix'] : []
                    }}
                  />
                );
              })()}

              {/* Áreas de personalización */}
              {customizationAreas.map((area, index) => (
                <CustomizationAreaRenderer
                  key={area.id || `area-${index}`}
                  area={area}
                  isActive={false}
                  showLabel={true}
                />
              ))}

              {/* Elementos del diseño */}
              {elements.map((element, index) => (
                <KonvaElementRenderer
                  key={element.id || `element-${index}`}
                  element={element}
                  isSelected={isSelected(element.id)}
                  onDragEnd={(newPos) => handleElementDragEnd(element.id, newPos)}
                  onTransform={(newAttrs) => handleElementTransform(element.id, newAttrs)}
                />
              ))}

              {/* Transformer para elementos seleccionados */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limitar tamaño mínimo
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
                rotateEnabled={true}
                resizeEnabled={true}
                borderEnabled={true}
                anchorSize={8}
                borderStroke={THEME_COLORS.primary}
                anchorStroke={THEME_COLORS.primary}
                anchorFill={THEME_COLORS.surface}
              />
            </Layer>
          </Stage>
        </StageWrapper>
      </CanvasContainer>

      {/* Panel lateral derecho */}
      <Box sx={{ width: 280, display: 'flex', flexDirection: 'column' }}>
        {/* Pestañas del panel */}
        <PanelTabs
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          hasSelection={selectedIds.length > 0}
        />

        {/* Contenido del panel activo */}
        {activePanel === 'properties' && (
          <PropertiesPanel
            selectedElements={selectedElements}
            onUpdateElement={updateElement}
            onLoadGoogleFonts={handleLoadGoogleFonts}
            availableFonts={fontService.getAvailableFonts()}
          />
        )}

        {activePanel === 'layers' && (
          <LayersPanel
            elements={elements}
            selectedIds={selectedIds}
            onSelectElement={selectElement}
            onSelectMultiple={selectMultiple}
            onReorderElements={(newOrder) => {
              setElements(newOrder);
              saveState('Reordenar capas');
            }}
            onToggleVisibility={(elementId) => {
              const element = elements.find(el => el.id === elementId);
              if (element) {
                updateElement(elementId, { visible: !element.visible });
              }
            }}
            onToggleLock={(elementId) => {
              const element = elements.find(el => el.id === elementId);
              if (element) {
                updateElement(elementId, { draggable: !element.locked });
              }
            }}
          />
        )}

        {activePanel === 'assets' && (
          <AssetsPanel
            onImageDrop={handleImageDrop}
            onLoadGoogleFonts={handleLoadGoogleFonts}
            fontService={fontService}
          />
        )}

        {activePanel === 'export' && (
          <ExportPanel
            onExport={handleExport}
            elements={elements}
            canvasConfig={canvasConfig}
          />
        )}

        {activePanel === 'shapes' && (
          <ShapeCreator
            onAddShape={handleAddShape}
            onAddCustomShape={(points) => handleAddShape('custom', points)}
          />
        )}

        {/* Estas funcionalidades se movieron al panel izquierdo */}
      </Box>

      {/* Loading overlay */}
      <Backdrop open={isLoading} sx={{ zIndex: 20000 }}>
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography sx={{ mt: 2 }}>Procesando...</Typography>
        </Box>
      </Backdrop>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            zIndex: 99999,
          },
          success: {
            duration: 3000,
            style: {
              background: THEME_COLORS.success,
            },
          },
          error: {
            duration: 5000,
            style: {
              background: THEME_COLORS.error,
            },
          },
        }}
        containerStyle={{
          zIndex: 99999,
        }}
      />
    </EditorLayout>
  );
};

// ==================== COMPONENTES AUXILIARES ====================

// Grid Pattern para el fondo
const GridPattern = ({ width, height, size, stroke, opacity }) => {
  const lines = [];

  // Líneas verticales
  for (let i = 0; i <= width; i += size) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, 0, i, height]}
        stroke={stroke}
        strokeWidth={1}
        opacity={opacity}
        listening={false}
      />
    );
  }

  // Líneas horizontales
  for (let i = 0; i <= height; i += size) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i, width, i]}
        stroke={stroke}
        strokeWidth={1}
        opacity={opacity}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
};

// Panel Tabs
const PanelTabs = ({ activePanel, onPanelChange, hasSelection }) => {
  const tabs = [
    { id: 'properties', label: 'Propiedades', icon: '⚙️', disabled: !hasSelection },
    { id: 'layers', label: 'Capas', icon: '📋' },
    { id: 'assets', label: 'Recursos', icon: '📁' },
    { id: 'shapes', label: 'Formas', icon: '🔷' },
    { id: 'export', label: 'Exportar', icon: '💾' }
  ];

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      {tabs.map(tab => (
        <Button
          key={tab.id}
          onClick={() => onPanelChange(tab.id)}
          disabled={tab.disabled}
          sx={{
            minWidth: 'auto',
            p: 1,
            backgroundColor: activePanel === tab.id ? 'primary.main' : 'transparent',
            color: activePanel === tab.id ? 'primary.contrastText' : 'text.secondary'
          }}
        >
          {tab.icon} {tab.label}
        </Button>
      ))}
    </Box>
  );
};

// ==================== COMPONENTE DE COLOR DE FONDO ====================

const BackgroundColorPanel = ({
  productColorFilter,
  onColorChange,
  onColorApply,
  onResetColor,
  product
}) => {
  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography 
        variant="h6" 
        sx={{ 
          color: THEME_COLORS.text,
          fontWeight: 700,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        🎨 Color de Fondo del Producto
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: THEME_COLORS.text,
            mb: 2,
            opacity: 0.8
          }}
        >
          Personaliza el color del producto base. Esto afectará toda la imagen del producto.
        </Typography>

        {/* Selector de color */}
        <Box sx={{ mb: 2 }}>
          <ColorPicker
            currentcolor={productColorFilter || '#FFFFFF'}
            onChange={onColorChange}
            onColorApply={onColorApply}
            label="Color del Producto"
            showTransparency={false}
            showPalettes={true}
            showFavorites={true}
            pickerType="sketch"
            size="medium"
          />
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onResetColor}
            disabled={!productColorFilter}
            sx={{
              borderColor: THEME_COLORS.primary,
              color: THEME_COLORS.primary,
              '&:hover': {
                borderColor: THEME_COLORS.primaryDark,
                backgroundColor: 'rgba(31, 100, 191, 0.1)'
              }
            }}
          >
            Restablecer
          </Button>
        </Box>
      </Box>

      {/* Información del producto */}
      {product && (
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'rgba(31, 100, 191, 0.1)',
          borderRadius: 2,
          border: `1px solid ${THEME_COLORS.primary}20`
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: THEME_COLORS.text,
              fontWeight: 600,
              mb: 1
            }}
          >
            Producto: {product.name || 'Sin nombre'}
          </Typography>
          
          {product.images?.main && (
            <Box sx={{ 
              width: '100%', 
              height: 60, 
              backgroundImage: `url(${product.images.main})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              borderRadius: 1,
              border: '1px solid rgba(31, 100, 191, 0.2)',
              mb: 1
            }} />
          )}
          
          <Typography 
            variant="caption" 
            sx={{ 
              color: THEME_COLORS.text,
              opacity: 0.7
            }}
          >
            El color se aplicará como filtro sobre la imagen del producto
          </Typography>
        </Box>
      )}

      {/* Colores predefinidos */}
      <Box sx={{ mt: 3 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: THEME_COLORS.text,
            fontWeight: 600,
            mb: 2
          }}
        >
          Colores Populares
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
            '#FF00FF', '#00FFFF', '#FFA500', '#800080',
            '#FFC0CB', '#A52A2A', '#808080', '#000000'
          ].map((color) => (
            <Box
              key={color}
              onClick={() => onColorChange(color)}
              sx={{
                width: 32,
                height: 32,
                backgroundColor: color,
                borderRadius: 1,
                cursor: 'pointer',
                border: productColorFilter === color ? `2px solid ${THEME_COLORS.primary}` : '1px solid rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default KonvaDesignEditor;
