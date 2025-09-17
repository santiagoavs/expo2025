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

// ==================== COMPONENTES ESPECIALIZADOS ====================
import { EditorToolbar } from './components/Editor/EditorToolbar';
import { ToolsPanel } from './components/Tools/ToolsPanel';
import { PropertiesPanel } from './components/Properties/PropertiesPanel';
import { LayersPanel } from './components/Layers/LayersPanel';
import { AssetsPanel } from './components/Assets/AssetsPanel';
import { ExportPanel } from './components/Export/ExportPanel';
import { ShapeCreator } from './components/Shapes/ShapeCreator';

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
import { CANVAS_CONFIG } from './constants/canvasConfig';

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
const EditorLayout = styled(Box)(({ theme }) => ({
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

const CanvasContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  background: THEME_COLORS.surface,
  borderRadius: '16px',
  margin: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: `1px solid ${theme.palette.divider}`
}));

const StageWrapper = styled(Box)({
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

  // Fondo del producto
  const {
    productImage,
    productImageLoaded,
    productScale,
    productPosition
  } = useProductBackground(product);

  // Áreas de personalización
  const {
    customizationAreas,
    getAreaForPosition,
    validateElementInArea,
    snapToArea
  } = useCustomizationAreas(product);

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
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }

        // Convertir a base64
        const imageDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        // Obtener dimensiones
        const img = new window.Image();
        await new Promise((resolve) => {
          img.onload = resolve;
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
          imageUrl: imageDataUrl,
          originalName: file.name,
          originalSize: file.size,
          areaId: selectedAreaId || (customizationAreas.length > 0 ? customizationAreas[0].id : 'default-area')
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
  }, [elementFactory, addElement, selectElement, saveState, selectedAreaId, customizationAreas]);

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
          // Extraer propiedades que van en el nivel superior
          const { id, type, areaId, ...konvaAttrs } = element;
          
          return {
            id: id, // Mantener el ID
            type: type, // Mantener el tipo
            areaId: areaId,
            konvaAttrs: {
              ...konvaAttrs // Solo las propiedades de Konva, sin duplicar id, type, areaId
            }
          };
        }),
        canvasConfig,
        productColorFilter: null, // Implementar si necesario
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
          originalName: el.konvaAttrs?.originalName
        }))
      });

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

  // Configurar zoom con rueda del mouse
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (e) => {
      e.evt.preventDefault();
      
      if (e.evt.ctrlKey) {
        // Zoom con Ctrl + rueda
        const scaleBy = 1.05;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        const clampedScale = Math.max(EDITOR_CONFIG.zoom.min, Math.min(EDITOR_CONFIG.zoom.max, newScale));

        setZoom(clampedScale);

        stage.scale({ x: clampedScale, y: clampedScale });
        stage.position({
          x: pointer.x - mousePointTo.x * clampedScale,
          y: pointer.y - mousePointTo.y * clampedScale,
        });
      }
    };

    stage.on('wheel', handleWheel);
    return () => stage.off('wheel', handleWheel);
  }, []);

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
        zoom={zoom}
        onZoomChange={setZoom}
        showGrid={showGrid}
        onToggleGrid={setShowGrid}
        snapToGrid={snapToGrid}
        onToggleSnap={setSnapToGrid}
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
            width={EDITOR_CONFIG.canvas.width}
            height={EDITOR_CONFIG.canvas.height}
            scaleX={zoom}
            scaleY={zoom}
            onMouseDown={handleStageClick}
            onTouchStart={handleStageClick}
          >
            <Layer ref={layerRef}>
              {/* Grid de fondo */}
              {showGrid && (
                <GridPattern
                  width={EDITOR_CONFIG.canvas.width}
                  height={EDITOR_CONFIG.canvas.height}
                  size={EDITOR_CONFIG.grid.size}
                  stroke={EDITOR_CONFIG.grid.color}
                  opacity={EDITOR_CONFIG.grid.opacity}
                />
              )}

              {/* Imagen del producto */}
              {productImage && productImageLoaded && (
                <KonvaElementRenderer
                  element={{
                    id: 'product-background',
                    type: 'image',
                    x: productPosition.x,
                    y: productPosition.y,
                    width: productImage.width * productScale.scaleX,
                    height: productImage.height * productScale.scaleY,
                    imageUrl: product.images?.main,
                    image: productImage,
                    listening: false,
                    opacity: 0.8,
                    draggable: false
                  }}
                />
              )}

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
      <Box sx={{ width: 320, display: 'flex', flexDirection: 'column' }}>
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

        {activePanel === 'areas' && (
          <AreaSelector
            customizationAreas={customizationAreas}
            selectedAreaId={selectedAreaId}
            onAreaSelect={handleAreaSelect}
            elements={elements}
            product={product}
            onAssignElements={handleAssignElementsToArea}
          />
        )}
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
    { id: 'tools', label: 'Herramientas', icon: '🔧' },
    { id: 'areas', label: 'Zonas', icon: '📍' },
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

export default KonvaDesignEditor;
