import React, { useState, useCallback, useRef } from 'react';
import { fabric } from 'fabric';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useFabricCanvas } from './hooks/useFabricCanvas';
import { useProductDetection } from './hooks/useProductDetection';
import ZoneListPanel from './components/ZoneListPanel.jsx';
import ToolsPanelGlass from './components/ToolsPanelGlass.jsx';
import FloatingNavbar from './components/FloatingNavbar.jsx';
import ParticleBackground from './components/ParticleBackground.jsx';
import { THEME_COLORS } from './styles/glassmorphism';

const FabricDesignEditorGlass = ({
  product,
  initialDesign,
  onSave,
  onClose,
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

  // ✅ NUEVO: Funciones funcionales para herramientas básicas
  const handleToolSelect = useCallback((toolType, options = {}) => {
    logEvent('TOOL_SELECTED', { toolType, options });
    
    switch (toolType) {
      case 'addText':
        // Agregar texto en la zona seleccionada
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
          // Si no hay zona seleccionada, agregar en el centro
          addText('Texto de ejemplo');
        }
        break;
        
      case 'addImage':
        fileInputRef.current?.click();
        break;
        
      case 'addShape':
        // Agregar forma en la zona seleccionada
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
          // Si no hay zona seleccionada, agregar en el centro
          addShape(options.shapeType || 'rectangle');
        }
        break;
        
      case 'changeColor':
        // Cambiar color del elemento seleccionado
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
            // No eliminar zonas de customización ni imagen del producto
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

  // Funciones del navbar flotante
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
        multiplier: 2 // Para mejor calidad
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

  if (!isOpen) return null;

  if (canvasError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error al inicializar el editor: {canvasError}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999
    }}>
      {/* Fondo animado con partículas */}
      <ParticleBackground />
      
      {/* Panel izquierdo - Lista de zonas */}
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

      {/* Área central - Canvas */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Navbar flotante */}
        <FloatingNavbar
          onSave={handleSave}
          onExport={handleExport}
          onUndo={() => console.log('Undo')}
          onRedo={() => console.log('Redo')}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onClose={onClose}
          canUndo={false}
          canRedo={false}
          isSaving={isSaving}
          zoomLevel={zoomLevel}
        />

        {/* Canvas */}
        <Box
          ref={canvasContainerRef}
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            pt: 8 // Espacio para el navbar flotante
          }}
        >
                     <Box sx={{
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
             `
           }}>
            <canvas ref={canvasRef} />
            
            {/* Indicador de carga */}
            {!canvasInitialized && (
                             <Box
                 sx={{
                   position: 'absolute',
                   top: '50%',
                   left: '50%',
                   transform: 'translate(-50%, -50%)',
                   display: 'flex',
                   flexDirection: 'column',
                   alignItems: 'center',
                   gap: 3,
                   background: 'rgba(242, 242, 242, 0.98)',
                   backdropFilter: 'blur(20px)',
                   padding: 4,
                   borderRadius: '20px',
                   border: '1px solid rgba(31, 100, 191, 0.3)',
                   boxShadow: '0 15px 40px rgba(1, 3, 38, 0.15)'
                 }}
               >
                <CircularProgress size={40} sx={{ color: THEME_COLORS.primary }} />
                <Typography variant="body1" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  Inicializando editor...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

                 {/* Barra de estado */}
         <Box sx={{ 
           p: 2, 
           display: 'flex', 
           justifyContent: 'space-between', 
           alignItems: 'center',
           background: 'rgba(242, 242, 242, 0.95)',
           backdropFilter: 'blur(20px)',
           borderTop: '1px solid rgba(31, 100, 191, 0.3)',
           boxShadow: '0 -2px 10px rgba(1, 3, 38, 0.1)'
         }}>
          <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
            {canvas && `📊 Elementos: ${canvas.getObjects().filter(obj => !obj.data?.isArea && !obj.data?.isProductImage && obj.data?.type !== 'areaLabel').length}`}
          </Typography>
          
          <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
            {detectionStatus === 'success' ? `✅ ${productType}` : '🔍 Detectando...'}
          </Typography>
        </Box>
      </Box>

      {/* Panel derecho - Herramientas */}
      <ToolsPanelGlass 
        selectedZone={selectedZone}
        selectedZoneData={selectedZoneData}
        onToolSelect={handleToolSelect}
        onAction={handleAction}
      />

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
    </Box>
  );
};

export default FabricDesignEditorGlass;

