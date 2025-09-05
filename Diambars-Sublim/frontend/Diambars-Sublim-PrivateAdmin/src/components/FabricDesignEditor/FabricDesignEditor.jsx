import React, { useState, useCallback, useRef, useMemo } from 'react';
import { fabric } from 'fabric';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFabricCanvas } from './hooks/useFabricCanvas.js';
import { useProductDetection } from './hooks/useProductDetection.js';
import ZoneListPanel from './components/ZoneListPanel.jsx';
import ToolsPanelGlass from './components/ToolsPanel.jsx';
import FloatingNavbar from './components/FloatingNavbar.jsx'; // Navbar optimizado
import ParticleBackground from './components/ParticleBackground.jsx';
import { THEME_COLORS } from './styles/glassmorphism.js';

// Layout principal optimizado
const OptimizedEditorLayout = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  overflow: 'hidden', // Prevenir scroll no deseado
  
  // Optimización de renderizado
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}));

// Contenedor del canvas optimizado con posicionamiento relativo
const CanvasContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  minHeight: 0, // Permite que el flex funcione correctamente
  
  // Optimización de compositing
  transform: 'translateZ(0)',
  willChange: 'transform'
}));

// Área del canvas con posicionamiento mejorado
const CanvasArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  paddingTop: theme.spacing(10), // Espacio para navbar flotante
  position: 'relative',
  overflow: 'hidden',
  
  [theme.breakpoints.down('md')]: {
    paddingTop: theme.spacing(8)
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    paddingTop: theme.spacing(7)
  }
}));

// Canvas wrapper optimizado
const CanvasWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: '20px',
  overflow: 'hidden',
  background: 'rgba(242, 242, 242, 0.98)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(31, 100, 191, 0.4)',
  boxShadow: `
    0 20px 60px rgba(1, 3, 38, 0.15),
    inset 0 1px 0 rgba(242, 242, 242, 0.9)
  `,
  
  // Optimización de compositing
  transform: 'translateZ(0)',
  willChange: 'transform',
  
  // Canvas responsivo
  maxWidth: '100%',
  maxHeight: '100%',
  
  '& canvas': {
    borderRadius: '20px',
    maxWidth: '100%',
    maxHeight: '100%',
    height: 'auto !important', // Mantener aspect ratio
    width: 'auto !important'
  }
}));

// Loading overlay optimizado
const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  background: 'rgba(242, 242, 242, 0.98)',
  backdropFilter: 'blur(20px)',
  padding: theme.spacing(4),
  borderRadius: '20px',
  border: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 15px 40px rgba(1, 3, 38, 0.15)',
  zIndex: 10
}));

// Footer de estado optimizado
const StatusFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(242, 242, 242, 0.95)',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 -2px 10px rgba(1, 3, 38, 0.1)',
  
  // Optimización
  willChange: 'transform',
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    fontSize: '0.75rem'
  }
}));

// Paneles laterales con z-index optimizado
const SidePanel = styled(Box)(({ theme }) => ({
  zIndex: 100, // Z-index menor que el navbar
  display: 'flex',
  
  [theme.breakpoints.down('md')]: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    '&.left-panel': {
      left: 0
    },
    '&.right-panel': {
      right: 0
    }
  }
}));

const FabricDesignEditor = ({
  product,
  initialDesign,
  onSave,
  onClose,
  onBack, // Nueva prop para navegación hacia atrás
  isOpen = true
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  const {
    canvas,
    canvasInitialized,
    canvasError,
    productType,
    productConfig,
    selectedZone,
    selectedZoneData,
    zonesList,
    showZoneLabels,
    canvasRef,
    canvasContainerRef,
    handleZoneSelect,
    toggleZoneLabels,
    addText,
    addImage,
    addShape,
    getCanvasData,
    clearCanvas,
    logEvent
  } = useFabricCanvas({ isOpen, product, initialDesign });

  const {
    productType: detectedType,
    productConfig: detectedConfig,
    detectionStatus,
    getProductInfo,
    getDesignSuggestions
  } = useProductDetection(product);

  const fileInputRef = useRef();

  // Funciones optimizadas con useCallback
  const handleToolSelect = useCallback((toolType, options = {}) => {
    logEvent('TOOL_SELECTED', { toolType, options });
    
    switch (toolType) {
      case 'addText':
        if (selectedZone && canvas) {
          const zoneRect = canvas.getObjects().find(obj => 
            obj.data?.zoneId === selectedZone && obj.data?.type === 'customizationArea'
          );
          
          if (zoneRect) {
            const textOptions = {
              left: zoneRect.left + zoneRect.width / 2,
              top: zoneRect.top + zoneRect.height / 2,
              fontSize: 24,
              fontFamily: 'Arial',
              fill: THEME_COLORS.text,
              originX: 'center',
              originY: 'center'
            };
            addText('Texto de ejemplo', textOptions);
          }
        } else {
          addText('Texto de ejemplo');
        }
        break;
        
      case 'addImage':
        fileInputRef.current?.click();
        break;
        
      case 'addShape':
        if (selectedZone && canvas) {
          const zoneRect = canvas.getObjects().find(obj => 
            obj.data?.zoneId === selectedZone && obj.data?.type === 'customizationArea'
          );
          
          if (zoneRect) {
            const shapeOptions = {
              left: zoneRect.left + zoneRect.width / 2,
              top: zoneRect.top + zoneRect.height / 2,
              fill: THEME_COLORS.primary,
              originX: 'center',
              originY: 'center'
            };
            addShape(options.shapeType || 'rectangle', shapeOptions);
          }
        } else {
          addShape(options.shapeType || 'rectangle');
        }
        break;
        
      case 'changeColor':
        if (canvas) {
          const activeObject = canvas.getActiveObject();
          if (activeObject && options.color) {
            activeObject.set('fill', options.color);
            canvas.renderAll();
            logEvent('COLOR_CHANGED', { color: options.color, objectType: activeObject.type });
          }
        }
        break;
        
      default:
        console.log('Herramienta no implementada:', toolType);
    }
  }, [selectedZone, canvas, addText, addImage, addShape, logEvent]);

  const handleAction = useCallback((actionType, zoneId) => {
    logEvent('ACTION_TRIGGERED', { actionType, zoneId });
    
    if (!canvas) return;
    
    switch (actionType) {
      case 'duplicate':
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          activeObject.clone((cloned) => {
            cloned.set({
              left: cloned.left + 10,
              top: cloned.top + 10
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
          });
        }
        break;
        
      case 'delete':
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach(obj => {
            if (!obj.data?.isArea && !obj.data?.isProductImage && obj.data?.type !== 'areaLabel') {
              canvas.remove(obj);
            }
          });
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        break;
        
      case 'rotate':
        const rotateObject = canvas.getActiveObject();
        if (rotateObject && !rotateObject.data?.isArea && !rotateObject.data?.isProductImage) {
          rotateObject.rotate(rotateObject.angle + 15);
          canvas.renderAll();
        }
        break;
        
      default:
        console.log('Acción no implementada:', actionType);
    }
  }, [canvas, logEvent]);

  // Funciones del navbar optimizadas
  const handleSave = useCallback(async () => {
    if (!canvas) return;

    try {
      setIsSaving(true);
      const canvasData = getCanvasData();
      
      if (onSave) {
        await onSave(canvasData);
        logEvent('DESIGN_SAVED_SUCCESS');
      }
    } catch (error) {
      logEvent('DESIGN_SAVE_ERROR', { error: error.message });
    } finally {
      setIsSaving(false);
    }
  }, [canvas, getCanvasData, onSave, logEvent]);

  const handleExport = useCallback(() => {
    if (!canvas) return;

    try {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });
      
      const link = document.createElement('a');
      link.download = `diseno-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      
      logEvent('DESIGN_EXPORTED', { format: 'png' });
    } catch (error) {
      logEvent('DESIGN_EXPORT_ERROR', { error: error.message });
    }
  }, [canvas, logEvent]);

  const handleZoomIn = useCallback(() => {
    if (canvas) {
      const newZoom = Math.min(zoomLevel + 25, 300);
      canvas.setZoom(newZoom / 100);
      setZoomLevel(newZoom);
    }
  }, [canvas, zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (canvas) {
      const newZoom = Math.max(zoomLevel - 25, 25);
      canvas.setZoom(newZoom / 100);
      setZoomLevel(newZoom);
    }
  }, [canvas, zoomLevel]);

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && canvas) {
      addImage(file);
    }
  }, [canvas, addImage]);

  // Memoizar elementos que no cambian frecuentemente
  const elementsCount = useMemo(() => {
    if (!canvas) return 0;
    return canvas.getObjects().filter(obj => 
      !obj.data?.isArea && !obj.data?.isProductImage && obj.data?.type !== 'areaLabel'
    ).length;
  }, [canvas, canvasInitialized]); // Solo recalcular cuando canvas cambie

  const statusText = useMemo(() => {
    return detectionStatus === 'success' ? `✅ ${productType}` : '🔍 Detectando...';
  }, [detectionStatus, productType]);

  if (!isOpen) return null;

  if (canvasError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error al inicializar el editor: {canvasError}
      </Alert>
    );
  }

  return (
    <OptimizedEditorLayout>
      {/* Fondo animado optimizado */}
      <ParticleBackground />
      
      {/* Panel izquierdo - Lista de zonas */}
      <SidePanel className="left-panel">
        <ZoneListPanel
          zones={zonesList}
          selectedZone={selectedZone}
          onSelectZone={(id) => {
            const data = zonesList?.find(z => z.id === id);
            if (data) handleZoneSelect(id, { ...data, name: data.name, displayName: data.name });
          }}
          showLabels={showZoneLabels}
          onToggleLabels={toggleZoneLabels}
        />
      </SidePanel>

      {/* Área central - Canvas */}
      <CanvasContainer>
        {/* Navbar flotante optimizado */}
        <FloatingNavbar
          onSave={handleSave}
          onExport={handleExport}
          onClose={onClose}
          onBack={onBack} // Nueva prop para navegación hacia atrás
          onUndo={() => console.log('Undo')}
          onRedo={() => console.log('Redo')}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          canUndo={false}
          canRedo={false}
          isSaving={isSaving}
          zoomLevel={zoomLevel}
        />

        {/* Canvas */}
        <CanvasArea>
          <CanvasWrapper
            ref={canvasContainerRef}
          >
            <canvas ref={canvasRef} />
            
            {/* Indicador de carga optimizado */}
            {!canvasInitialized && (
              <LoadingOverlay>
                <CircularProgress size={40} sx={{ color: THEME_COLORS.primary }} />
                <Typography variant="body1" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  Inicializando editor...
                </Typography>
              </LoadingOverlay>
            )}
          </CanvasWrapper>
        </CanvasArea>

        {/* Barra de estado optimizada */}
        <StatusFooter>
          <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
            📊 Elementos: {elementsCount}
          </Typography>
          
          <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
            {statusText}
          </Typography>
        </StatusFooter>
      </CanvasContainer>

      {/* Panel derecho - Herramientas */}
      <SidePanel className="right-panel">
        <ToolsPanelGlass 
          selectedZone={selectedZone}
          selectedZoneData={selectedZoneData}
          onToolSelect={handleToolSelect}
          onAction={handleAction}
        />
      </SidePanel>

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
    </OptimizedEditorLayout>
  );
};

export default FabricDesignEditor;