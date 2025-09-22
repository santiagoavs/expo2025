// KonvaDesignEditor.jsx - EDITOR REFACTORIZADO CON ARQUITECTURA MEJORADA Y DISEÑO MODERNO RESPONSIVO
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Transformer, Line } from 'react-konva';
import { Box, Typography, CircularProgress, Backdrop, Button, ThemeProvider } from '@mui/material';
import { Plus } from '@phosphor-icons/react';
import { styled } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { ChromePicker } from 'react-color';
// ✅ CORREGIDO: Importar estilos para SweetAlert
import './styles/sweetalert-fix.css';

// ==================== HOOKS Y SERVICIOS ESPECIALIZADOS ====================
import { useKonvaCanvas } from './hooks/useKonvaCanvas';
import { useKonvaHistory } from './hooks/useKonvaHistory';
import { useKonvaSelection } from './hooks/useKonvaSelection';
import { useProductBackground } from './hooks/useProductBackground';
import { useCustomizationAreas } from './hooks/useCustomizationAreas';
import { useUnifiedCanvasCentering } from './hooks/useUnifiedCanvasCentering';

// ==================== COMPONENTES ESPECIALIZADOS ====================
import { EditorToolbar } from './components/Editor/EditorToolbar';
import { ShapeCreatorModal } from './components/Shapes/ShapeCreatorModal';
import { testImageFlow } from './utils/imageTestUtils';
import UnifiedPanel from './components/UnifiedPanel/UnifiedPanel';
import AdvancedShapeCreatorModal from './Components/ShapeCreator/ShapeCreatorModal';

// ==================== TEMA Y ESTILOS RESPONSIVOS ====================
import { responsiveTheme, GRADIENTS_3D, SHADOWS_3D, FIXED_COLORS, BORDERS, TRANSITIONS, Z_INDEX } from './styles/responsiveTheme';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';

// ==================== ELEMENTOS RENDERIZABLES ====================
import { KonvaElementRenderer } from './components/Elements/KonvaElementRenderer';
import { CustomizationAreaRenderer } from './components/Areas/CustomizationAreaRenderer';

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

// ==================== STYLED COMPONENTS RESPONSIVOS ====================
const EditorLayout = styled(Box, {
  name: 'KonvaDesignEditor-Layout',
  slot: 'Root'
})(({ theme, isMobile, isTablet, isDesktop }) => ({
  display: 'flex',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: Z_INDEX.base,
  overflow: 'hidden',
  background: GRADIENTS_3D.background,
  backdropFilter: 'blur(10px)',
  
  // Layout responsivo - Sin padding superior para el toolbar flotante
  flexDirection: isMobile ? 'column' : 'row',
  padding: isMobile ? '8px 8px 8px 8px' : isTablet ? '12px 12px 12px 12px' : '16px 16px 16px 16px',
  paddingTop: isMobile ? '80px' : isTablet ? '90px' : '100px', // Espacio para toolbar flotante
  gap: isMobile ? '8px' : isTablet ? '12px' : '16px'
}));

const CanvasContainer = styled(Box, {
  name: 'KonvaDesignEditor-CanvasContainer',
  slot: 'MainCanvasWrapper'
})(({ theme, isMobile, isTablet }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  background: GRADIENTS_3D.surface,
  borderRadius: isMobile ? BORDERS.radius.medium : BORDERS.radius.large,
  overflow: 'hidden',
  boxShadow: SHADOWS_3D.panel,
  border: `1px solid ${FIXED_COLORS.border}`,
  minHeight: isMobile ? '300px' : 'auto'
}));

const StageWrapper = styled(Box, {
  name: 'KonvaDesignEditor-StageWrapper',
  slot: 'KonvaStageContainer'
})({
  position: 'relative',
  overflow: 'hidden',
  cursor: 'default',
  borderRadius: BORDERS.radius.medium,
  boxShadow: SHADOWS_3D.light,
  border: `1px solid ${FIXED_COLORS.border}`,
  transition: TRANSITIONS.fast,
  
  '&.drawing': {
    cursor: 'crosshair'
  },
  '&.dragging': {
    cursor: 'grabbing'
  },
  '&.resizing': {
    cursor: 'nw-resize'
  },
  '&:hover': {
    boxShadow: SHADOWS_3D.medium
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
  // ✅ OPTIMIZADO: Eliminado log excesivo que causaba problemas de rendimiento
  // ==================== REFS ====================
  const stageRef = useRef();
  const layerRef = useRef();
  const transformerRef = useRef();
  const containerRef = useRef();

  // ==================== HOOK RESPONSIVO ====================
  const {
    isMobile,
    isTablet,
    isDesktop,
    isPanelOpen,
    activePanel,
    togglePanel,
    openPanel,
    closePanel,
    changeActivePanel,
    getCanvasSize,
    getEditorLayout,
    getToolbarLayout,
    getCanvasLayout,
    getPanelLayout
  } = useResponsiveLayout();

  // ==================== ESTADO LOCAL ====================
  const [editorMode, setEditorMode] = useState(mode);
  const [activeTool, setActiveTool] = useState('select');
  const [isLoading, setIsLoading] = useState(false);
  const [showGrid, setShowGrid] = useState(EDITOR_CONFIG.grid.enabled);
  const [snapToGrid, setSnapToGrid] = useState(EDITOR_CONFIG.snap.enabled);
  const [zoom, setZoom] = useState(1);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  
  // ==================== ESTADO DE COLOR DE FONDO ====================
  const [productColorFilter, setProductColorFilter] = useState(initialDesign?.productColorFilter || null);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  
  // ✅ CORREGIDO: Actualizar productColorFilter cuando cambie initialDesign
  useEffect(() => {
    if (initialDesign?.productColorFilter) {
      setProductColorFilter(initialDesign.productColorFilter);
    }
  }, [initialDesign?.productColorFilter]);
  
  // ==================== ESTADO DEL MODAL DE FORMAS ====================
  const [showShapeModal, setShowShapeModal] = useState(false);
  const [showShapeCreatorModal, setShowShapeCreatorModal] = useState(false);

  // ==================== ESTADO DE FUENTES ====================
  const [availableFonts, setAvailableFonts] = useState(['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana']);

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


  // ✅ RESPONSIVO: Usar dimensiones del canvas basadas en el dispositivo
  const canvasSize = getCanvasSize();
  const stageDimensions = useMemo(() => ({
    width: canvasSize.width,
    height: canvasSize.height
  }), [canvasSize.width, canvasSize.height]);

  // Dimensiones del canvas escalado (después de stageScale) - MEMOIZADO para evitar bucles infinitos
  const canvasDimensions = useMemo(() => ({
    width: CANVAS_CONFIG.width * stageScale,
    height: CANVAS_CONFIG.height * stageScale
  }), [stageScale]);
  
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


  const handleAddShape = useCallback((shapeType, customPoints = null) => {
    const baseConfig = {
      x: 150,
      y: 150,
      fill: FIXED_COLORS.primary,
      stroke: FIXED_COLORS.primaryDark,
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
      case 'square':
        shapeElement = elementFactory.createSquareElement({
          ...baseConfig,
          width: 80,
          height: 80
        });
        break;
      case 'ellipse':
        shapeElement = elementFactory.createEllipseElement({
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
      case 'diamond':
        shapeElement = elementFactory.createDiamondElement(baseConfig);
        break;
      case 'hexagon':
        shapeElement = elementFactory.createHexagonElement({
          ...baseConfig,
          radius: 50
        });
        break;
      case 'octagon':
        shapeElement = elementFactory.createOctagonElement({
          ...baseConfig,
          radius: 50
        });
        break;
      case 'pentagon':
        shapeElement = elementFactory.createPentagonElement({
          ...baseConfig,
          radius: 50
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
        toast.error(`Tipo de forma no soportado: ${shapeType}`);
        return;
    }

    addElement(shapeElement);
    selectElement(shapeElement.id);
    saveState(`Agregar ${shapeType}`);
    toast.success(`${shapeType} agregado`);
  }, [elementFactory, addElement, selectElement, saveState, selectedAreaId, customizationAreas]);

  // ==================== MANEJADORES DEL MODAL DE FORMAS ====================
  
  const handleOpenShapeModal = useCallback(() => {
    setShowShapeModal(true);
  }, []);

  const handleCloseShapeModal = useCallback(() => {
    setShowShapeModal(false);
  }, []);

  // Manejadores del modal de creación de formas
  const handleOpenShapeCreatorModal = useCallback(() => {
    setShowShapeCreatorModal(true);
  }, []);

  const handleCloseShapeCreatorModal = useCallback(() => {
    setShowShapeCreatorModal(false);
  }, []);

  const handleAddShapeFromCreator = useCallback((shapeType, shapeData) => {
    // ✅ DEBUGGING: Solo logs importantes para formas complejas
    if (['star', 'diamond', 'hexagon', 'octagon', 'pentagon', 'shape'].includes(shapeType)) {
      console.log('🎨 [KonvaDesignEditor] Creando forma compleja:', {
        shapeType,
        hasPoints: !!shapeData.points,
        pointsLength: shapeData.points?.length,
        points: shapeData.points
      });
    }
    
    // Crear elemento de forma directamente
    const shapeElement = {
      id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: shapeType,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      ...shapeData,
      areaId: selectedAreaId || (customizationAreas.length > 0 ? customizationAreas[0].id : 'default-area'),
      draggable: true,
      visible: true,
      locked: false
    };
    
    addElement(shapeElement);
    selectElement(shapeElement.id);
    saveState(`Agregar ${shapeType} desde editor`);
    toast.success(`${shapeType} agregado desde editor`);
  }, [addElement, selectElement, saveState, selectedAreaId, customizationAreas]);

  const handleImageDrop = useCallback(async (files) => {
    setIsLoading(true);
    
    try {
      for (const file of files) {
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
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Error leyendo archivo'));
          reader.readAsDataURL(file);
        });

        // Obtener dimensiones
        const img = new window.Image();
        await new Promise((resolve, reject) => {
          img.onload = () => resolve();
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
          toast.error(`Error validando imagen ${file.name}: ${elementValidation.join(', ')}`);
          continue;
        }

        // ✅ OPTIMIZADO: Agregar elemento directamente
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
      setAvailableFonts(prev => [...new Set([...prev, ...fontNames])]);
      toast.success(`${fontNames.length} fuentes cargadas exitosamente`);
    } catch (error) {
      console.error('Error cargando fuentes:', error);
      toast.error('Error al cargar las fuentes de Google');
    } finally {
      setIsLoading(false);
    }
  }, [fontService]);

  const handleFontLoad = useCallback((fontFamily, variants) => {
    console.log('🎨 [KonvaDesignEditor] Fuente cargada:', { fontFamily, variants });
    setAvailableFonts(prev => {
      if (!prev.includes(fontFamily)) {
        return [...prev, fontFamily];
      }
      return prev;
    });
  }, []);

  const handleAddText = useCallback((textElement) => {
    console.log('🎨 [KonvaDesignEditor] handleAddText llamado:', textElement);
    
    // Validar el elemento de texto
    const validationErrors = validationService.validateElement(textElement);
    if (validationErrors && validationErrors.length > 0) {
      console.error('❌ [KonvaDesignEditor] Elemento de texto inválido:', validationErrors);
      const errorMessage = validationErrors.join(', ');
      toast.error(`Error en el texto: ${errorMessage}`);
      return;
    }

    // Agregar el elemento
    addElement(textElement);
    selectElement(textElement.id);
    saveState(`Agregar texto: ${textElement.text}`);
    toast.success(`Texto "${textElement.text}" agregado`);
  }, [addElement, selectElement, saveState, validationService]);

  const handleUpdateText = useCallback((updatedTextElement) => {
    console.log('🎨 [KonvaDesignEditor] handleUpdateText llamado:', updatedTextElement);
    
    // Validar el elemento de texto actualizado
    const validationErrors = validationService.validateElement(updatedTextElement);
    if (validationErrors && validationErrors.length > 0) {
      console.error('❌ [KonvaDesignEditor] Elemento de texto actualizado inválido:', validationErrors);
      const errorMessage = validationErrors.join(', ');
      toast.error(`Error en el texto: ${errorMessage}`);
      return;
    }

    // Actualizar el elemento
    updateElement(updatedTextElement.id, updatedTextElement);
    saveState(`Actualizar texto: ${updatedTextElement.text}`);
  }, [updateElement, saveState, validationService]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedElements.length === 0) {
      toast.warning('No hay elementos seleccionados para eliminar');
      return;
    }

    // Confirmar eliminación
    const elementNames = selectedElements.map(el => {
      if (el.type === 'text') return `"${el.text || 'Texto'}"`;
      if (el.type === 'image') return 'Imagen';
      return el.type;
    }).join(', ');

    // ✅ CORREGIDO: Configuración global de SweetAlert para evitar conflictos
    Swal.mixin({
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        content: 'swal2-content-custom'
      },
      buttonsStyling: false
    });

    try {
      const swalResult = await Swal.fire({
        title: '¿Eliminar elementos?',
        html: `¿Estás seguro de que quieres eliminar: <strong>${elementNames}</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4757',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        // ✅ CORREGIDO: Z-index alto para que aparezca sobre todo
        zIndex: 99999,
        // ✅ CORREGIDO: Prevenir cierre automático
        allowOutsideClick: false,
        allowEscapeKey: false,
        // ✅ CORREGIDO: Configuración adicional para evitar problemas
        backdrop: true,
        focusConfirm: false,
        reverseButtons: false,
        // ✅ CORREGIDO: Forzar que se muestre en el centro
        position: 'center',
        // ✅ CORREGIDO: Estilos personalizados para asegurar visibilidad
        customClass: {
          popup: 'swal2-popup-custom',
          title: 'swal2-title-custom',
          content: 'swal2-content-custom'
        },
        // ✅ CORREGIDO: Configuración adicional para evitar auto-dismiss
        timer: null,
        timerProgressBar: false
      });
      
      if (swalResult.isConfirmed) {
        // Eliminar elementos seleccionados
        selectedElements.forEach(element => {
          removeElement(element.id);
        });
        
        clearSelection();
        saveState(`Eliminar ${selectedElements.length} elemento(s)`);
        toast.success(`${selectedElements.length} elemento(s) eliminado(s)`);
      }
    } catch (error) {
      console.error('🗑️ [KonvaDesignEditor] Error en SweetAlert:', error);
      toast.error('Error al mostrar el diálogo de confirmación');
    }
  }, [selectedElements, removeElement, clearSelection, saveState]);

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
          const convertedElement = elementFactory.toBackendFormat(element);
          
          
          return convertedElement;
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

  if (!isOpen) {
    console.log('🚫 [KonvaDesignEditor] No se renderiza - isOpen es false');
    return null;
  }

  // ✅ OPTIMIZADO: Eliminado log excesivo que causaba problemas de rendimiento

  // ==================== RENDER ====================
  return (
    <ThemeProvider theme={responsiveTheme}>
      <EditorLayout isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop}>
      {/* Toolbar flotante 3D */}
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
        zoom={stageScale}
        onZoomChange={(newZoom) => setStageScale(newZoom)}
        showGrid={showGrid}
        onToggleGrid={setShowGrid}
        snapToGrid={snapToGrid}
        onToggleSnap={setSnapToGrid}
        onTestImageFlow={handleTestImageFlow}
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
        onTogglePanel={togglePanel}
        onDelete={handleDeleteSelected}
        hasSelectedElements={selectedElements.length > 0}
      />

      {/* Canvas principal responsivo */}
      <CanvasContainer ref={containerRef} isMobile={isMobile} isTablet={isTablet} sx={getCanvasLayout()}>

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
            scaleX={stageScale}
            scaleY={stageScale}
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
                  stageScale={stageScale}
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
                      // ✅ CORREGIDO: Pasar el color del producto para tintado
                      productColorFilter: productColorFilter || null
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
                borderStroke={FIXED_COLORS.primary}
                anchorStroke={FIXED_COLORS.primary}
                anchorFill={FIXED_COLORS.surface}
              />
            </Layer>
          </Stage>
        </StageWrapper>
      </CanvasContainer>

      {/* Panel unificado responsivo */}
      <UnifiedPanel
        isOpen={isPanelOpen}
        onToggle={togglePanel}
        activePanel={activePanel}
        onPanelChange={changeActivePanel}
        selectedElements={selectedElements}
        elements={elements}
        customizationAreas={customizationAreas}
        selectedAreaId={selectedAreaId}
        onAreaSelect={handleAreaSelect}
        productColorFilter={productColorFilter}
        onColorChange={handleBackgroundColorChange}
        onColorApply={handleBackgroundColorApply}
        onResetColor={handleResetBackgroundColor}
        onImageDrop={handleImageDrop}
        onLoadGoogleFonts={handleLoadGoogleFonts}
        onExport={handleExport}
        onAddText={handleAddText}
        onUpdateText={handleUpdateText}
        selectedElement={selectedElements.length === 1 ? selectedElements[0] : null}
        onAddShape={handleAddShape}
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
        onUpdateElement={updateElement}
        onOpenShapeCreator={handleOpenShapeCreatorModal}
        fontService={fontService}
        availableFonts={availableFonts}
        onFontLoad={handleFontLoad}
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
      />

      {/* Modal de Formas Personalizadas */}
      <ShapeCreatorModal
        isOpen={showShapeModal}
        onClose={handleCloseShapeModal}
        onAddShape={handleAddShapeFromCreator}
        onAddCustomShape={(points) => handleAddShapeFromCreator('custom', { points })}
      />

      {/* Modal de Creación de Formas Avanzado */}
      <AdvancedShapeCreatorModal
        isOpen={showShapeCreatorModal}
        onClose={handleCloseShapeCreatorModal}
        onAddShape={handleAddShapeFromCreator}
      />


      {/* Loading overlay responsivo */}
      <Backdrop open={isLoading} sx={{ zIndex: Z_INDEX.overlay }}>
        <Box sx={{ 
          textAlign: 'center', 
          color: 'white',
          background: FIXED_COLORS.overlay,
          borderRadius: BORDERS.radius.large,
          padding: isMobile ? 2 : 4,
          backdropFilter: 'blur(8px)'
        }}>
          <CircularProgress color="inherit" size={isMobile ? 40 : 60} />
          <Typography sx={{ mt: 2, fontWeight: 500, fontSize: isMobile ? '0.875rem' : '1rem' }}>Procesando...</Typography>
        </Box>
      </Backdrop>

      {/* Toast notifications responsivos */}
      <Toaster
        position={isMobile ? "bottom-center" : "bottom-left"}
        toastOptions={{
          duration: 4000,
          style: {
            background: FIXED_COLORS.surface,
            color: FIXED_COLORS.text,
            borderRadius: BORDERS.radius.medium,
            boxShadow: SHADOWS_3D.medium,
            border: `1px solid ${FIXED_COLORS.border}`,
            zIndex: Z_INDEX.toast,
            fontSize: isMobile ? '0.875rem' : '1rem',
            maxWidth: isMobile ? '90vw' : '400px'
          },
          success: {
            duration: 3000,
            style: {
              background: FIXED_COLORS.success,
              color: 'white',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: FIXED_COLORS.error,
              color: 'white',
            },
          },
        }}
        containerStyle={{
          zIndex: Z_INDEX.toast,
          bottom: isMobile ? '40px' : '60px', // ✅ AJUSTADO: Margen desde el borde inferior
          left: isMobile ? 'auto' : '20px',    // ✅ AJUSTADO: Margen desde el borde izquierdo
        }}
      />
      </EditorLayout>
    </ThemeProvider>
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


// ==================== COMPONENTE DE COLOR DE FONDO ====================

const BackgroundColorPanel = ({
  productColorFilter,
  onColorChange,
  onColorApply,
  onResetColor,
  product
}) => {
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography 
        variant="h6" 
        sx={{ 
          color: FIXED_COLORS.text,
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
            color: FIXED_COLORS.text,
            mb: 2,
            opacity: 0.8
          }}
        >
          Personaliza el color del producto base. Esto afectará toda la imagen del producto.
        </Typography>

        {/* Selector de color */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: FIXED_COLORS.text, mb: 1 }}>
            Color del Producto
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Preview del color actual */}
            <Box
              sx={{
                width: 50,
                height: 50,
                backgroundColor: productColorFilter || '#FFFFFF',
                borderRadius: BORDERS.radius.medium,
                border: `2px solid ${FIXED_COLORS.border}`,
                cursor: 'pointer',
                transition: TRANSITIONS.fast,
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: SHADOWS_3D.medium
                }
              }}
              onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
            />
            
            {/* Input de color */}
            <Box sx={{ flex: 1 }}>
              <input
                type="color"
                value={productColorFilter || '#FFFFFF'}
                onChange={(e) => onColorChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  border: `1px solid ${FIXED_COLORS.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
            </Box>
          </Box>
          
          {/* ChromePicker cuando está abierto */}
          {showBackgroundColorPicker && (
            <Box sx={{ 
              position: 'absolute', 
              zIndex: Z_INDEX.tooltip + 1,
              mt: 1,
              boxShadow: SHADOWS_3D.large,
              borderRadius: BORDERS.radius.medium
            }}>
              <ChromePicker
                color={productColorFilter || '#FFFFFF'}
                onChange={(color) => onColorChange(color.hex)}
                disableAlpha={true}
              />
            </Box>
          )}
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onResetColor}
            disabled={!productColorFilter}
            sx={{
              borderColor: FIXED_COLORS.primary,
              color: FIXED_COLORS.primary,
              '&:hover': {
                borderColor: FIXED_COLORS.primaryDark,
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
          border: `1px solid ${FIXED_COLORS.primary}20`
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: FIXED_COLORS.text,
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
              color: FIXED_COLORS.text,
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
            color: FIXED_COLORS.text,
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
                border: productColorFilter === color ? `2px solid ${FIXED_COLORS.primary}` : '1px solid rgba(0,0,0,0.2)',
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
