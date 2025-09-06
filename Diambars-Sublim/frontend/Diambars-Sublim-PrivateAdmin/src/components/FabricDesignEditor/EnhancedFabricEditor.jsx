// src/components/EnhancedFabricEditor/EnhancedFabricEditor.jsx - EDITOR PRINCIPAL MEJORADO
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  CircularProgress,
  Alert,
  Snackbar,
  Backdrop
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  X as CloseIcon,
  ArrowLeft as BackIcon,
  FloppyDisk,
  Download,
  ArrowCounterClockwise,
  ArrowClockwise,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  Gear
} from '@phosphor-icons/react';
import { fabric } from 'fabric';
import { throttle } from 'lodash';
import toast from 'react-hot-toast';

// Importar componentes personalizados
import useEditorStore from './stores/useEditorStores';
import AdvancedToolsPanel from './components/AdvancedToolsPanel';
import ColorPicker from './components/ColorPicker';
import ExportManager from './components/ExportManager';
import ParticleBackground from './components/ParticleBackground';

// Constantes del tema
const THEME_COLORS = {
  primary: '#1F64BF',
  primaryDark: '#032CA6',
  accent: '#040DBF',
  background: '#F2F2F2',
  text: '#010326'
};

// Layout principal optimizado
const EditorLayout = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  overflow: 'hidden',
  
  // Optimización de renderizado
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}));

// Contenedor del canvas con glassmorphism
const CanvasContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  minHeight: 0,
  
  // Optimización de compositing
  transform: 'translateZ(0)',
  willChange: 'transform'
}));

// Navbar flotante mejorado
const FloatingNavbar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1050,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  borderRadius: '32px',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 0 rgba(255, 255, 255, 0.15)
  `,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  maxWidth: '90vw',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.18)',
    transform: 'translateX(-50%) translateY(-2px)',
    boxShadow: `
      0 12px 40px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.4)
    `
  }
}));

// Botón de navbar optimizado
const NavButton = styled(IconButton)(({ theme, variant = 'default', active = false }) => ({
  width: '44px',
  height: '44px',
  borderRadius: '16px',
  background: variant === 'primary' 
    ? `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`
    : active
      ? 'rgba(31, 100, 191, 0.15)'
      : 'rgba(255, 255, 255, 0.08)',
  border: variant === 'primary'
    ? 'none'
    : active
      ? `1px solid ${THEME_COLORS.primary}`
      : '1px solid rgba(255, 255, 255, 0.15)',
  color: variant === 'primary' ? '#ffffff' : active ? THEME_COLORS.primary : THEME_COLORS.text,
  backdropFilter: 'blur(8px)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: variant === 'primary'
      ? `linear-gradient(135deg, ${THEME_COLORS.primaryDark}, ${THEME_COLORS.accent})`
      : 'rgba(31, 100, 191, 0.2)',
    transform: 'translateY(-1px) scale(1.02)',
    boxShadow: '0 4px 16px rgba(31, 100, 191, 0.3)'
  },
  
  '&:active': {
    transform: 'translateY(0px) scale(0.98)',
    transition: 'all 0.1s'
  },

  '&:disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
    transform: 'none'
  }
}));

// Área del canvas
const CanvasArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  paddingTop: theme.spacing(10),
  position: 'relative',
  overflow: 'hidden'
}));

// Wrapper del canvas
const CanvasWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: '20px',
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.98)',
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
    display: 'block',
    /* Evitar que CSS fuerce escalado que desalinearía controles */
    maxWidth: '100%',
    maxHeight: '100%'
  }
}));

// Loading overlay
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

// Footer de estado
const StatusFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(242, 242, 242, 0.95)',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 -2px 10px rgba(1, 3, 38, 0.1)'
}));

/**
 * Editor principal mejorado con todas las librerías integradas
 * Incluye Zustand, react-color, html2canvas, lodash y funcionalidades avanzadas
 */
const EnhancedFabricEditor = ({
  product,
  initialDesign,
  onSave,
  onClose,
  onBack,
  isOpen = true
}) => {
  // Estados locales
  const [zoomLevel, setZoomLevel] = useState(100);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [productColorFilter, setProductColorFilter] = useState(null);

  // Store del editor
  const {
    canvas,
    isCanvasInitialized,
    initializeCanvas,
    destroyCanvas,
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    isLoading,
    isSaving,
    setSaving,
    error,
    clearError,
    notifications,
    removeNotification,
    getEditorStats
  } = useEditorStore();

  // Refs
  const canvasRef = useRef();
  const canvasContainerRef = useRef();
  const productImageLoadedRef = useRef(false);
  const areasLoadedRef = useRef(false);
  const initialDesignLoadedRef = useRef(false);

  // ==================== INICIALIZACIÓN ====================

  /**
   * Inicializa el editor con el producto
   */
  const initializeEditor = useCallback(async () => {
    if (!canvasRef.current || !isOpen) return;

    try {
      // Configuración del canvas basada en el producto
      const canvasConfig = {
        width: product?.editorConfig?.stageWidth || 800,
        height: product?.editorConfig?.stageHeight || 600,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true
      };

      // Inicializar canvas
      initializeCanvas(canvasRef.current, canvasConfig);

      // Esperar a que el canvas esté listo
      await new Promise(resolve => setTimeout(resolve, 100));

      // Cargar imagen del producto si existe
      if (product?.imageUrl || product?.images?.main || product?.mainImage) {
        await loadProductImage();
      }

      // Cargar áreas de personalización
      if (product?.customizationAreas?.length > 0) {
        await loadCustomizationAreas();
      }

      // Cargar diseño inicial si existe
      if (initialDesign) {
        await loadInitialDesign();
      }

      // Guardar estado inicial
      saveToHistory('Estado inicial');

    } catch (error) {
      console.error('Error inicializando editor:', error);
      toast.error('Error al inicializar el editor');
    }
  }, [isOpen, product, initialDesign, initializeCanvas, saveToHistory]);

  /**
   * Carga la imagen del producto
   */
  const loadProductImage = useCallback(async () => {
    if (!canvas) {
      console.warn('[Editor] loadProductImage: canvas no disponible aún');
      return;
    }

    const productSrc =
      product?.imageUrl ||
      product?.images?.main ||
      product?.mainImage ||
      product?.image ||
      product?.img ||
      product?.konvaConfig?.productImage;
    if (!productSrc) return;

    try {
      console.log('[Editor] Cargando imagen de producto:', productSrc);
      const loadWithFallback = (src, attempt = 1) => new Promise((resolve) => {
        const options = attempt === 1 ? { crossOrigin: 'anonymous' } : {};
        fabric.Image.fromURL(src, (img) => {
          if (img) {
            resolve(img);
          } else if (attempt === 1) {
            console.warn('[Editor] Reintentando carga de imagen sin CORS');
            loadWithFallback(src, 2).then(resolve);
          } else {
            console.error('[Editor] No se pudo cargar la imagen de producto');
            resolve(null);
          }
        }, options);
      });

      const img = await loadWithFallback(productSrc, 1);
      if (!img) return;

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      // Calcular escala para que la imagen quepa en el canvas
      const scaleX = canvasWidth / img.width;
      const scaleY = canvasHeight / img.height;
      const scale = Math.min(scaleX, scaleY, 1);

      // Centrar la imagen
      const left = (canvasWidth - img.width * scale) / 2;
      const top = (canvasHeight - img.height * scale) / 2;

      // Colocar como background para evitar solapamientos y eliminaciones accidentales
      canvas.setBackgroundImage(img, () => {
        if (canvas && canvas.lowerCanvasEl) {
          canvas.renderAll();
        }
      }, {
        left,
        top,
        originX: 'left',
        originY: 'top',
        scaleX: scale,
        scaleY: scale
      });
      productImageLoadedRef.current = true;
    } catch (error) {
      console.error('Error cargando imagen del producto:', error);
    }
  }, [canvas, product]);

  /**
   * Carga las áreas de personalización
   */
  const loadCustomizationAreas = useCallback(async () => {
    if (!canvas || !product?.customizationAreas?.length) return;

    try {
      product.customizationAreas.forEach((area, index) => {
        // Crear rectángulo del área
        const areaRect = new fabric.Rect({
          left: area.position?.x || 0,
          top: area.position?.y || 0,
          width: area.position?.width || 100,
          height: area.position?.height || 100,
          fill: 'rgba(31, 100, 191, 0.1)',
          stroke: THEME_COLORS.primary,
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
            areaName: area.displayName || area.name
          }
        });

        // Agregar etiqueta del área
        const label = new fabric.Text(area.displayName || area.name, {
          left: areaRect.left + areaRect.width / 2,
          top: areaRect.top - 20,
          fontSize: 12,
          fill: THEME_COLORS.primaryDark,
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

        canvas.add(areaRect);
        canvas.add(label);
      });

      canvas.requestRenderAll();
    } catch (error) {
      console.error('Error cargando áreas de personalización:', error);
    }
  }, [canvas, product]);

  /**
   * Carga el diseño inicial
   */
  const loadInitialDesign = useCallback(async () => {
    if (!canvas || !initialDesign) return;

    try {
      if (initialDesign.elements && Array.isArray(initialDesign.elements)) {
        // Cargar elementos del diseño
        initialDesign.elements.forEach(element => {
          // Lógica para recrear objetos Fabric desde datos guardados
          // Esto dependerá del formato de tus datos guardados
        });
      }
    } catch (error) {
      console.error('Error cargando diseño inicial:', error);
    }
  }, [canvas, initialDesign]);

  // ==================== HANDLERS ====================

  /**
   * Maneja el guardado del diseño
   */
  const handleSave = useCallback(async () => {
    if (!canvas || !onSave) return;

    try {
      setSaving(true);
      
      // Obtener datos del canvas
      const canvasData = canvas.toJSON(['data']);
      
      // Obtener elementos personalizados (filtrar imagen del producto y áreas)
      const customElements = canvas.getObjects().filter(obj => 
        !obj.data?.isProductImage && 
        !obj.data?.isArea && 
        obj.data?.type !== 'areaLabel'
      );

      const designData = {
        canvasData,
        elements: customElements.map(obj => ({
          type: obj.type,
          data: obj.data,
          properties: {
            left: obj.left,
            top: obj.top,
            width: obj.width || obj.getScaledWidth?.(),
            height: obj.height || obj.getScaledHeight?.(),
            angle: obj.angle,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            opacity: obj.opacity,
            ...obj.toObject()
          }
        })),
        productColorFilter,
        metadata: {
          ...getEditorStats(),
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      await onSave(designData);
      toast.success('Diseño guardado exitosamente');
    } catch (error) {
      console.error('Error guardando diseño:', error);
      toast.error('Error al guardar el diseño');
    } finally {
      setSaving(false);
    }
  }, [canvas, onSave, productColorFilter, getEditorStats, setSaving]);

  /**
   * Maneja el zoom del canvas
   */
  const handleZoom = useCallback(throttle((direction) => {
    if (!canvas) return;

    const currentZoom = canvas.getZoom();
    const zoomStep = 0.1;
    let newZoom;

    if (direction === 'in') {
      newZoom = Math.min(currentZoom + zoomStep, 3);
    } else {
      newZoom = Math.max(currentZoom - zoomStep, 0.3);
    }

    canvas.setZoom(newZoom);
    setZoomLevel(Math.round(newZoom * 100));
    canvas.requestRenderAll();
  }, 100), [canvas]);

  /**
   * Aplica filtro de color al producto
   */
  const applyProductColorFilter = useCallback((color) => {
    if (!canvas) return;
    // Si el producto está como backgroundImage
    if (canvas.backgroundImage && canvas.backgroundImage.filters !== undefined) {
      if (color) {
        const colorFilter = new fabric.Image.filters.BlendColor({
          color,
          mode: 'multiply',
          alpha: 0.3
        });
        canvas.backgroundImage.filters = [colorFilter];
        canvas.backgroundImage.applyFilters();
      } else {
        canvas.backgroundImage.filters = [];
        canvas.backgroundImage.applyFilters();
      }
      setProductColorFilter(color);
      canvas.renderAll();
      return;
    }

    // Fallback: imagen de producto como objeto (compatibilidad)
    const productImage = canvas.getObjects().find(obj => obj.data?.isProductImage);
    if (productImage) {
      if (color) {
        const colorFilter = new fabric.Image.filters.BlendColor({
          color,
          mode: 'multiply',
          alpha: 0.3
        });
        productImage.filters = [colorFilter];
        productImage.applyFilters();
      } else {
        productImage.filters = [];
        productImage.applyFilters();
      }
      setProductColorFilter(color);
      canvas.requestRenderAll();
    }
  }, [canvas]);

  // ==================== EFECTOS ====================

  // Inicializar editor cuando se abre
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(initializeEditor, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initializeEditor]);

  // Cargar imagen del producto una vez que el canvas esté listo
  useEffect(() => {
    if (!isOpen) return;
    if (isCanvasInitialized && product && !productImageLoadedRef.current) {
      loadProductImage().catch((e) => console.error('Error en loadProductImage:', e));
    }
  }, [isOpen, isCanvasInitialized, product, loadProductImage]);

  // Cargar áreas después de tener canvas e imagen del producto
  useEffect(() => {
    if (!isOpen) return;
    if (isCanvasInitialized && product?.customizationAreas?.length && productImageLoadedRef.current && !areasLoadedRef.current) {
      (async () => {
        try {
          await loadCustomizationAreas();
          areasLoadedRef.current = true;
          if (canvas && canvas.lowerCanvasEl) {
            canvas.renderAll();
          }
        } catch (e) {
          console.error('Error en loadCustomizationAreas:', e);
        }
      })();
    }
  }, [isOpen, isCanvasInitialized, product, loadCustomizationAreas]);

  // Cargar diseño inicial cuando el canvas esté listo
  useEffect(() => {
    if (!isOpen) return;
    if (isCanvasInitialized && initialDesign && !initialDesignLoadedRef.current) {
      loadInitialDesign()
        .then(() => { initialDesignLoadedRef.current = true; })
        .catch((e) => console.error('Error en loadInitialDesign:', e));
    }
  }, [isOpen, isCanvasInitialized, initialDesign, loadInitialDesign]);

  // Cleanup cuando se cierra
  useEffect(() => {
    if (!isOpen && canvas) {
      destroyCanvas();
    }
  }, [isOpen, canvas, destroyCanvas]);

  // Manejo de notificaciones
  useEffect(() => {
    notifications.forEach(notification => {
      const toastId = toast[notification.type || 'info'](notification.message, {
        id: notification.id,
        duration: notification.duration || 4000
      });
      
      // Remover notificación del store
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration || 4000);
    });
  }, [notifications, removeNotification]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!canvas) return;

      // Prevenir si está en un input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          const activeObjects = canvas.getActiveObjects();
          if (activeObjects.length > 0) {
            activeObjects.forEach(obj => {
              if (!obj.data?.isProductImage && !obj.data?.isArea) {
                canvas.remove(obj);
              }
            });
            canvas.discardActiveObject();
            canvas.requestRenderAll();
          }
          break;
        
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
        
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleSave();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas, undo, redo, handleSave]);

  // ==================== RENDER ====================

  if (!isOpen) return null;

  return (
    <EditorLayout>
      {/* Fondo animado */}
      <ParticleBackground />
      
      {/* Panel de herramientas izquierdo */}
      <AdvancedToolsPanel />

      {/* Área central del canvas */}
      <CanvasContainer>
        {/* Navbar flotante */}
        <FloatingNavbar>
          {/* Navegación */}
          {onBack && (
            <Tooltip title="Volver" arrow>
              <NavButton onClick={onBack}>
                <BackIcon size={18} />
              </NavButton>
            </Tooltip>
          )}
          
          <Tooltip title="Cerrar Editor" arrow>
            <NavButton onClick={onClose}>
              <CloseIcon size={18} />
            </NavButton>
          </Tooltip>

          {/* Separador */}
          <Box sx={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.3)', mx: 1 }} />

          {/* Historial */}
          <Tooltip title="Deshacer" arrow>
            <NavButton disabled={!canUndo} onClick={undo}>
              <ArrowCounterClockwise size={18} />
            </NavButton>
          </Tooltip>
          
          <Tooltip title="Rehacer" arrow>
            <NavButton disabled={!canRedo} onClick={redo}>
              <ArrowClockwise size={18} />
            </NavButton>
          </Tooltip>

          {/* Separador */}
          <Box sx={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.3)', mx: 1 }} />

          {/* Zoom */}
          <Tooltip title="Zoom +" arrow>
            <NavButton onClick={() => handleZoom('in')}>
              <MagnifyingGlassPlus size={18} />
            </NavButton>
          </Tooltip>
          
          <Tooltip title="Zoom -" arrow>
            <NavButton onClick={() => handleZoom('out')}>
              <MagnifyingGlassMinus size={18} />
            </NavButton>
          </Tooltip>

          {/* Separador */}
          <Box sx={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.3)', mx: 1 }} />

          {/* Color del producto */}
          <ColorPicker
            currentcolor={productColorFilter || '#ffffff'}
            onChange={applyProductColorFilter}
            label="Color del producto"
            size="small"
          />

          {/* Separador */}
          <Box sx={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.3)', mx: 1 }} />

          {/* Acciones principales */}
          <Tooltip title="Guardar" arrow>
            <NavButton 
              variant="primary" 
              onClick={handleSave}
              disabled={isSaving || !canvas}
            >
              <FloppyDisk size={18} />
            </NavButton>
          </Tooltip>
          
          <Tooltip title="Exportar" arrow>
            <NavButton onClick={() => setExportDialogOpen(true)}>
              <Download size={18} />
            </NavButton>
          </Tooltip>

          {/* Indicador de zoom */}
          <Typography 
            variant="caption" 
            sx={{ 
              color: THEME_COLORS.text,
              fontWeight: 600,
              ml: 1,
              px: 1,
              py: 0.5,
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)'
            }}
          >
            {zoomLevel}%
          </Typography>
        </FloatingNavbar>

        {/* Canvas */}
        <CanvasArea>
          <CanvasWrapper ref={canvasContainerRef}>
            <canvas ref={canvasRef} />
            
            {/* Loading overlay */}
            {(!isCanvasInitialized || isLoading) && (
              <LoadingOverlay>
                <CircularProgress size={40} sx={{ color: THEME_COLORS.primary }} />
                <Typography variant="body1" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  {isLoading ? 'Cargando...' : 'Inicializando editor...'}
                </Typography>
              </LoadingOverlay>
            )}
          </CanvasWrapper>
        </CanvasArea>

        {/* Footer de estado */}
        <StatusFooter>
          <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
            {canvas ? `Objetos: ${canvas.getObjects().filter(obj => !obj.data?.isProductImage && !obj.data?.isArea).length}` : 'Canvas no inicializado'}
          </Typography>
          
          <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
            {isSaving ? 'Guardando...' : 'Listo'}
          </Typography>
        </StatusFooter>
      </CanvasContainer>

      {/* Diálogo de exportación */}
      <ExportManager
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        canvasRef={canvasRef}
        designData={canvas?.toJSON()}
        productName={product?.name || 'diseño'}
      />

      {/* Snackbar para errores */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={clearError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={clearError} 
            severity="error" 
            sx={{ 
              background: 'rgba(239, 68, 68, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px'
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}

      {/* Backdrop para loading global */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: 10000,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)'
        }}
        open={isSaving}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Guardando diseño...
          </Typography>
        </Box>
      </Backdrop>
    </EditorLayout>
  );
};

export default EnhancedFabricEditor;