// src/components/EnhancedFabricEditor/EnhancedFabricEditor.jsx - EDITOR PRINCIPAL MEJORADO
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  CircularProgress,
  Alert,
  Snackbar,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
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
  Gear,
  Lightbulb,
  CheckCircle,
  Star,
  Target
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
import { useProductDetection } from './hooks/useProductDetection';

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
  const [suggestionsModalOpen, setSuggestionsModalOpen] = useState(false);
  const [showCustomizationAreas, setShowCustomizationAreas] = useState(true);
  const [selectedArea, setSelectedAreaState] = useState(null);

  // Hook de detección de productos
  const {
    productType,
    productConfig,
    detectionStatus,
    isDetecting,
    isDetected,
    hasError,
    getDesignSuggestions,
    getProductInfo
  } = useProductDetection(product);

  // Store del editor
  const {
    canvas,
    isCanvasInitialized,
    selectedObjects,
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
    getEditorStats,
    setSelectedArea,
    setSelectedAreaData
  } = useEditorStore();

  // Selectores directos para formas vectoriales (evita bucles infinitos)
  const vectorShapes = useEditorStore((state) => state.vectorShapes);
  const vectorEditMode = useEditorStore((state) => state.vectorEditMode);
  const hasVectorContent = useEditorStore((state) => state.vectorShapes.length > 0);

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
        preserveObjectStacking: true,
        enablePointerEvents: true,
        allowTouchScrolling: true,
        skipTargetFind: false
      };

      // Inicializar canvas
      initializeCanvas(canvasRef.current, canvasConfig);

      // Esperar a que el canvas esté completamente listo
      let retries = 0;
      let currentCanvas = null;
      
      while ((!currentCanvas || !currentCanvas.lowerCanvasEl) && retries < 20) {
        await new Promise(resolve => setTimeout(resolve, 50));
        // Obtener canvas directamente del store
        currentCanvas = useEditorStore.getState().canvas;
        retries++;
        console.log(`[Editor] Intento ${retries}/20 - Canvas:`, currentCanvas ? 'disponible' : 'no disponible');
      }

      if (!currentCanvas || !currentCanvas.lowerCanvasEl) {
        console.error('[Editor] Canvas no se pudo inicializar después de 1 segundo');
        console.error('[Editor] Estado final del canvas:', currentCanvas);
        return;
      }

      console.log('[Editor] Canvas inicializado correctamente');

      // ✅ VERIFICAR: Contexto del canvas después de la inicialización
      const context = currentCanvas.lowerCanvasEl.getContext('2d');
      if (!context || typeof context.clearRect !== 'function') {
        console.error('[Editor] Contexto del canvas no es válido después de la inicialización');
        return;
      }

      console.log('✅ [Editor] Canvas inicializado correctamente con contexto válido');

      // Verificar que el canvas esté realmente disponible
      if (!currentCanvas || !currentCanvas.lowerCanvasEl) {
        console.error('[Editor] Canvas no está disponible después de la inicialización');
        return;
      }

      // Cargar imagen del producto si existe
      if (product?.imageUrl || product?.images?.main || product?.mainImage) {
        try {
          console.log('[Editor] Iniciando carga de imagen del producto...');
          await loadProductImageWithCanvas(currentCanvas);
          console.log('[Editor] Imagen del producto cargada exitosamente');
        } catch (error) {
          console.error('[Editor] Error cargando imagen del producto:', error);
        }
      }

      // Cargar áreas de personalización
      if (product?.customizationAreas?.length > 0) {
        try {
          console.log('[Editor] Iniciando carga de áreas de personalización...');
          await loadCustomizationAreasWithCanvas(currentCanvas);
          console.log('[Editor] Áreas de personalización cargadas exitosamente');
        } catch (error) {
          console.error('[Editor] Error cargando áreas de personalización:', error);
        }
      }

      // Renderizar todo al final
      if (currentCanvas && currentCanvas.lowerCanvasEl) {
        // Usar renderizado seguro del store
        useEditorStore.getState().safeRender();
        console.log('[Editor] Canvas renderizado completamente');
      }

      // Cargar diseño inicial si existe (solo después de que el canvas esté completamente listo)
      if (initialDesign && canvas && canvas.lowerCanvasEl) {
        // Esperar un poco más para asegurar que el canvas esté completamente inicializado
        setTimeout(async () => {
          try {
            await loadInitialDesign();
          } catch (error) {
            console.error('❌ [Editor] Error cargando diseño inicial en initializeEditor:', error);
          }
        }, 100);
      }

      // Guardar estado inicial
      saveToHistory('Estado inicial');

    } catch (error) {
      console.error('Error inicializando editor:', error);
      toast.error('Error al inicializar el editor');
    }
  }, [isOpen, product, initialDesign, initializeCanvas, saveToHistory]);

  /**
   * Carga la imagen del producto en el canvas (versión con canvas específico)
   */
  const loadProductImageWithCanvas = useCallback(async (targetCanvas) => {
    if (!targetCanvas || !targetCanvas.lowerCanvasEl) {
      console.warn('[Editor] loadProductImageWithCanvas: canvas no disponible');
      return Promise.reject(new Error('Canvas no disponible'));
    }

    const productSrc =
      product?.imageUrl ||
      product?.images?.main ||
      product?.mainImage ||
      product?.image ||
      product?.img ||
      product?.konvaConfig?.productImage;
    
    if (!productSrc) {
      return Promise.reject(new Error('No hay imagen de producto disponible'));
    }

    return new Promise((resolve, reject) => {
      console.log('[Editor] Cargando imagen de producto:', productSrc);
      
      fabric.Image.fromURL(productSrc, (img) => {
        if (!img) {
          reject(new Error('Error cargando imagen del producto'));
          return;
        }

        // Configurar la imagen como fondo
        targetCanvas.setBackgroundImage(img, () => {
          // Usar renderizado seguro
          useEditorStore.getState().safeRender();
        }, {
          scaleX: targetCanvas.getWidth() / img.width,
          scaleY: targetCanvas.getHeight() / img.height,
          originX: 'left',
          originY: 'top'
        });

        // Marcar como imagen de producto
        img.set('data', { ...img.data, isProductImage: true });

        console.log('[Editor] Imagen de producto renderizada correctamente');
        resolve();
      }, {
        crossOrigin: 'anonymous'
      });
    });
  }, [product]);

  /**
   * Carga la imagen del producto
   */
  const loadProductImage = useCallback(async () => {
    if (!canvas || !canvas.lowerCanvasEl) {
      console.warn('[Editor] loadProductImage: canvas no disponible aún');
      return Promise.reject(new Error('Canvas no disponible'));
    }

    const productSrc =
      product?.imageUrl ||
      product?.images?.main ||
      product?.mainImage ||
      product?.image ||
      product?.img ||
      product?.konvaConfig?.productImage;
    if (!productSrc) {
      return Promise.reject(new Error('No hay imagen de producto disponible'));
    }

    return new Promise(async (resolve, reject) => {
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
        // Usar renderizado seguro del store
        useEditorStore.getState().safeRender();
        console.log('✅ [Editor] Imagen de producto renderizada correctamente');
      }, {
        left,
        top,
        originX: 'left',
        originY: 'top',
        scaleX: scale,
        scaleY: scale
      });
      productImageLoadedRef.current = true;
      resolve(); // Resolver la promesa cuando la imagen esté cargada
      } catch (error) {
        console.error('Error cargando imagen del producto:', error);
        reject(error);
      }
    });
  }, [canvas, product]);

  /**
   * Carga las áreas de personalización (versión con canvas específico)
   */
  const loadCustomizationAreasWithCanvas = useCallback(async (targetCanvas) => {
    if (!targetCanvas || !product?.customizationAreas?.length) {
      return Promise.reject(new Error('Canvas o áreas de personalización no disponibles'));
    }

    return new Promise(async (resolve, reject) => {
      try {
        console.log('🎯 [Editor] Cargando áreas de personalización:', product.customizationAreas);

        // Obtener dimensiones del canvas
        const canvasWidth = targetCanvas.getWidth();
        const canvasHeight = targetCanvas.getHeight();
        
        // Las coordenadas del MongoDB están en 800x600 (editorConfig.stageWidth/Height)
        // Necesito escalarlas para el canvas actual si es diferente
        const originalWidth = product.editorConfig?.stageWidth || 800;
        const originalHeight = product.editorConfig?.stageHeight || 600;
        
        const scaleX = canvasWidth / originalWidth;
        const scaleY = canvasHeight / originalHeight;
        
        console.log(`📐 [Editor] Canvas - Tamaño: ${canvasWidth}x${canvasHeight}`);
        console.log(`📐 [Editor] Original - Tamaño: ${originalWidth}x${originalHeight}, Escala: ${scaleX.toFixed(2)}x${scaleY.toFixed(2)}`);

        // Procesar cada área de personalización
        for (let index = 0; index < product.customizationAreas.length; index++) {
          const area = product.customizationAreas[index];
          console.log(`📍 [Editor] Procesando área ${index + 1}:`, area);
          
          const areaX = area.position?.x || 0;
          const areaY = area.position?.y || 0;
          const areaWidth = area.position?.width || 100;
          const areaHeight = area.position?.height || 100;
          
          // Escalar coordenadas para el canvas actual
          const left = Math.round(areaX * scaleX);
          const top = Math.round(areaY * scaleY);
          const scaledWidth = Math.round(areaWidth * scaleX);
          const scaledHeight = Math.round(areaHeight * scaleY);
          
          console.log(`📐 [Editor] Área ${index + 1} - Original: (${areaX}, ${areaY}) ${areaWidth}x${areaHeight}`);
          console.log(`📐 [Editor] Área ${index + 1} - Escalada: (${left}, ${top}) ${scaledWidth}x${scaledHeight}`);
          
          // Crear rectángulo del área
          const areaRect = new fabric.Rect({
            left: left,
            top: top,
            width: scaledWidth,
            height: scaledHeight,
            fill: 'rgba(31, 100, 191, 0.1)',
            stroke: THEME_COLORS.primary,
            strokeWidth: 2,
            strokeDashArray: [8, 4],
            selectable: false, // No permitir selección
            evented: false, // No permitir eventos
            lockMovementX: true, // Bloquear movimiento horizontal
            lockMovementY: true, // Bloquear movimiento vertical
            lockRotation: true, // Bloquear rotación
            lockScalingX: true, // Bloquear escalado horizontal
            lockScalingY: true, // Bloquear escalado vertical
            data: {
              isArea: true,
              areaName: area.name,
              areaData: area
            }
          });

          // Agregar al canvas
          targetCanvas.add(areaRect);
          targetCanvas.bringToFront(areaRect);
          
          console.log(`✅ [Editor] Área ${index + 1} agregada al canvas`);

          // Crear etiqueta del área
          const areaLabel = new fabric.Text(area.displayName || area.name, {
            left: left + 10,
            top: top + 10,
            fontSize: 12,
            fill: THEME_COLORS.primary,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            data: {
              isAreaLabel: true,
              areaName: area.name
            }
          });

          targetCanvas.add(areaLabel);
          targetCanvas.bringToFront(areaLabel);
        }

        // Usar renderizado seguro del store
        useEditorStore.getState().safeRender();
        console.log('✅ [Editor] Áreas de personalización renderizadas correctamente');
        resolve();
      } catch (error) {
        console.error('❌ [Editor] Error cargando áreas:', error);
        reject(error);
      }
    });
  }, [product]);

  /**
   * Carga las áreas de personalización
   */
  const loadCustomizationAreas = useCallback(async () => {
    if (!canvas || !product?.customizationAreas?.length) {
      return Promise.reject(new Error('Canvas o áreas de personalización no disponibles'));
    }

    return new Promise(async (resolve, reject) => {
      try {
        console.log('🎯 [Editor] Cargando áreas de personalización:', product.customizationAreas);
      
      product.customizationAreas.forEach((area, index) => {
        console.log(`📍 [Editor] Procesando área ${index + 1}:`, area);
        
        // Obtener dimensiones del canvas
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        // Las coordenadas del MongoDB están en 800x600 (editorConfig.stageWidth/Height)
        // Necesito escalarlas para el canvas actual si es diferente
        const originalWidth = product.editorConfig?.stageWidth || 800;
        const originalHeight = product.editorConfig?.stageHeight || 600;
        
        const scaleX = canvasWidth / originalWidth;
        const scaleY = canvasHeight / originalHeight;
        
        const areaX = area.position?.x || 0;
        const areaY = area.position?.y || 0;
        const areaWidth = area.position?.width || 100;
        const areaHeight = area.position?.height || 100;
        
        // Escalar coordenadas para el canvas actual
        const left = Math.round(areaX * scaleX);
        const top = Math.round(areaY * scaleY);
        const scaledWidth = Math.round(areaWidth * scaleX);
        const scaledHeight = Math.round(areaHeight * scaleY);
        
        console.log(`📐 [Editor] Canvas - Tamaño: ${canvasWidth}x${canvasHeight}`);
        console.log(`📐 [Editor] Original - Tamaño: ${originalWidth}x${originalHeight}, Escala: ${scaleX.toFixed(2)}x${scaleY.toFixed(2)}`);
        console.log(`📐 [Editor] Área ${index + 1} - Original: (${areaX}, ${areaY}) ${areaWidth}x${areaHeight}`);
        console.log(`📐 [Editor] Área ${index + 1} - Escalada: (${left}, ${top}) ${scaledWidth}x${scaledHeight}`);
        console.log(`📐 [Editor] Área ${index + 1} - Datos completos:`, {
          name: area.name,
          originalPosition: area.position,
          canvasSize: { width: canvasWidth, height: canvasHeight },
          originalSize: { width: originalWidth, height: originalHeight },
          scale: { x: scaleX, y: scaleY },
          finalPosition: { left, top, width: scaledWidth, height: scaledHeight }
        });
        
        // Crear rectángulo del área
        const areaRect = new fabric.Rect({
          left: left,
          top: top,
          width: scaledWidth,
          height: scaledHeight,
          fill: 'rgba(31, 100, 191, 0.1)',
          stroke: THEME_COLORS.primary,
          strokeWidth: 2,
          strokeDashArray: [8, 4],
          selectable: false, // No permitir selección
          evented: false, // No permitir eventos
          lockMovementX: true, // Bloquear movimiento horizontal
          lockMovementY: true, // Bloquear movimiento vertical
          lockRotation: true, // Bloquear rotación
          lockScalingX: true, // Bloquear escalado horizontal
          lockScalingY: true, // Bloquear escalado vertical
          data: {
            type: 'customizationArea',
            isArea: true,
            isProductImage: false,
            areaId: area._id || area.id,
            areaName: area.displayName || area.name,
            skipHistory: true
          }
        });

        // Agregar etiqueta del área
        const label = new fabric.Text(area.displayName || area.name, {
          left: left + areaWidth / 2,
          top: top - 20,
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
            areaId: area._id || area.id,
            skipHistory: true
          }
        });

        // Agregar manejador de clic para seleccionar área
        // Agregar event listener para selección
        areaRect.on('mousedown', () => {
          console.log(`🎯 [Editor] Área seleccionada: ${area.displayName || area.name}`);
          setSelectedAreaState({
            id: area._id || area.id,
            name: area.displayName || area.name,
            area: area
          });
          
          // Mostrar confirmación con SweetAlert
          Swal.fire({
            title: '🎯 Zona Seleccionada',
            text: `Estás trabajando en: "${area.displayName || area.name}"`,
            icon: 'success',
            confirmButtonText: 'Continuar',
            confirmButtonColor: '#1F64BF',
            timer: 2000,
            timerProgressBar: true
          });
        });

        // Agregar al canvas
        canvas.add(areaRect);
        canvas.add(label);
        
        // Asegurar que las áreas estén encima de la imagen de fondo
        canvas.bringToFront(areaRect);
        canvas.bringToFront(label);
        
        console.log(`✅ [Editor] Área ${index + 1} agregada al canvas`);
      });

      // Usar renderizado seguro del store
      useEditorStore.getState().safeRender();
      console.log('✅ [Editor] Áreas de personalización renderizadas correctamente');
      resolve(); // Resolver la promesa cuando las áreas estén cargadas
      } catch (error) {
        console.error('❌ [Editor] Error cargando áreas de personalización:', error);
        reject(error);
      }
    });
  }, [canvas, product]);

  /**
   * Carga el diseño inicial
   */
  const loadInitialDesign = useCallback(async () => {
    if (!canvas || !initialDesign) return;

    try {
      console.log('🎨 [Editor] Cargando diseño inicial:', initialDesign);
      
      if (initialDesign.elements && Array.isArray(initialDesign.elements)) {
        console.log('🎨 [Editor] Cargando', initialDesign.elements.length, 'elementos');
        
        // ✅ VERIFICAR: Canvas completamente inicializado antes de limpiar
        if (!canvas || !canvas.lowerCanvasEl) {
          console.warn('⚠️ [Editor] Canvas no completamente inicializado para limpiar');
          return;
        }
        
        // Verificar que el contexto del canvas esté disponible
        const context = canvas.lowerCanvasEl.getContext('2d');
        if (!context) {
          console.warn('⚠️ [Editor] Contexto del canvas no disponible');
          return;
        }
        
        // Limpiar canvas antes de cargar
        try {
          canvas.clear();
        } catch (error) {
          console.warn('⚠️ [Editor] Error al limpiar canvas:', error);
          return;
        }
        
        // Cargar elementos del diseño usando el store
        const { loadElementsFromBackend } = useEditorStore.getState();
        await loadElementsFromBackend(initialDesign.elements);
        
        // Renderizar canvas
        canvas.renderAll();
        
        console.log('✅ [Editor] Diseño inicial cargado exitosamente');
      }
    } catch (error) {
      console.error('❌ [Editor] Error cargando diseño inicial:', error);
      toast.error('Error al cargar el diseño inicial');
    }
  }, [canvas, initialDesign]);

  // ==================== HANDLERS ====================

  /**
   * Maneja el guardado del diseño
   */
  const handleSave = useCallback(async () => {
    console.log('🔍 [Editor] handleSave llamado - canvas:', !!canvas, 'onSave:', !!onSave);
    
    if (!canvas || !onSave) {
      console.warn('⚠️ [Editor] Canvas o onSave no disponible para guardar');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 [Editor] Iniciando guardado del diseño...');
      
      // Obtener elementos personalizados (filtrar imagen del producto y áreas)
      const customElements = canvas.getObjects().filter(obj => 
        !obj.data?.isProductImage && 
        !obj.data?.isArea && 
        obj.data?.type !== 'areaLabel' &&
        !obj.data?.skipHistory
      );

      console.log('📋 [Editor] Elementos a guardar:', customElements.length);

      // Obtener la primera área de personalización disponible
      const firstArea = product?.customizationAreas?.[0];
      const defaultAreaId = firstArea?._id || firstArea?.id;
      
      if (!defaultAreaId) {
        console.error('❌ [Editor] No hay áreas de personalización disponibles');
        Swal.fire({
          title: '❌ Sin Áreas de Personalización',
          text: 'Este producto no tiene áreas de personalización configuradas. No se puede crear el diseño.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#EF4444'
        });
        toast.error('No hay áreas de personalización disponibles');
        return;
      }

      console.log('📍 [Editor] Usando área de personalización:', defaultAreaId);

      // Lista de fuentes permitidas por el backend
      const allowedFonts = [
        'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 
        'Verdana', 'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Tahoma'
      ];

      // Función para normalizar fuentes
      const normalizeFontFamily = (fontFamily) => {
        if (!fontFamily) return 'Arial';
        
        // Tomar solo la primera fuente de la lista
        const primaryFont = fontFamily.split(',')[0].trim();
        
        // Verificar si está en la lista permitida
        const allowedFont = allowedFonts.find(font => 
          font.toLowerCase() === primaryFont.toLowerCase()
        );
        
        return allowedFont || 'Arial';
      };

      // Convertir elementos de Fabric.js a formato Konva.js para el backend
      const convertedElements = customElements.map(obj => {
        const fabricObj = obj.toObject(['data']);
        
        // Debug: Log del objeto original y convertido
        console.log('🔍 [Editor] Objeto original:', obj);
        console.log('🔍 [Editor] FabricObj convertido:', fabricObj);
        console.log('🔍 [Editor] FabricObj.data:', fabricObj.data);
        console.log('🔍 [Editor] FontFamily original:', fabricObj.fontFamily);
        console.log('🔍 [Editor] FontFamily normalizada:', normalizeFontFamily(fabricObj.fontFamily));
        
        // Verificar si es una forma vectorial
        const isVectorShape = fabricObj.data?.konvaAttrs?.isVectorShape || false;
        const shapeType = fabricObj.data?.konvaAttrs?.shapeType;
        const pathData = fabricObj.data?.konvaAttrs?.pathData;
        
        console.log('🔍 [Editor] Es forma vectorial:', isVectorShape, 'Tipo:', shapeType, 'PathData:', pathData);
        
        // Normalizar coordenadas a 800x600 para consistencia
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const standardWidth = 800;
        const standardHeight = 600;
        
        // Calcular escala
        const scaleX = standardWidth / canvasWidth;
        const scaleY = standardHeight / canvasHeight;
        
        // Normalizar coordenadas
        const elementX = (fabricObj.left || 0) * scaleX;
        const elementY = (fabricObj.top || 0) * scaleY;
        const elementWidth = (fabricObj.width || obj.getScaledWidth?.() || 0) * scaleX;
        const elementHeight = (fabricObj.height || obj.getScaledHeight?.() || 0) * scaleY;
        
        console.log('📐 [Editor] Canvas actual:', { width: canvasWidth, height: canvasHeight });
        console.log('📐 [Editor] Escala:', { x: scaleX, y: scaleY });
        console.log('📐 [Editor] Coordenadas originales:', { x: fabricObj.left, y: fabricObj.top, width: fabricObj.width, height: fabricObj.height });
        console.log('📐 [Editor] Coordenadas normalizadas:', { x: elementX, y: elementY, width: elementWidth, height: elementHeight });
        
        // Convertir a formato Konva.js esperado por el backend
        const konvaElement = {
          id: fabricObj.data?.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: fabricObj.type,
          areaId: fabricObj.data?.areaId || defaultAreaId, // Asignar área automáticamente
          // Para texto - poner el texto en el nivel raíz también
          text: fabricObj.text || fabricObj.data?.text || '',
        // Para imágenes - poner la URL en el nivel raíz también (con fallback a obj._element.src)
        src: fabricObj.data?.imageUrl || fabricObj.data?.originalSrc || fabricObj.data?.src || obj._element?.src || obj.getSrc?.() || null,
          konvaAttrs: {
            x: elementX,
            y: elementY,
            width: elementWidth,
            height: elementHeight,
            rotation: fabricObj.angle || 0,
            scaleX: fabricObj.scaleX || 1,
            scaleY: fabricObj.scaleY || 1,
            opacity: fabricObj.opacity || 1,
            fill: fabricObj.fill || '#000000',
            stroke: fabricObj.stroke || null,
            strokeWidth: fabricObj.strokeWidth || 0,
            fontSize: fabricObj.fontSize || 24,
            fontFamily: normalizeFontFamily(fabricObj.fontFamily),
            fontWeight: fabricObj.fontWeight || 'normal',
            fontStyle: fabricObj.fontStyle || 'normal',
            textAlign: fabricObj.textAlign || 'left',
            textDecoration: (fabricObj.textDecoration === 'none' || !fabricObj.textDecoration) ? '' : fabricObj.textDecoration,
            // Para texto - también en konvaAttrs
            text: fabricObj.text || fabricObj.data?.text || '',
            // Para imágenes - también en konvaAttrs (con fallback a obj._element.src)
            image: fabricObj.data?.imageUrl || fabricObj.data?.originalSrc || fabricObj.data?.src || obj._element?.src || obj.getSrc?.() || null,
            imageUrl: fabricObj.data?.imageUrl || fabricObj.data?.originalSrc || fabricObj.data?.src || obj._element?.src || obj.getSrc?.() || null,
            // Para formas
            cornerRadius: fabricObj.rx || 0,
            // Datos vectoriales específicos
            ...(isVectorShape && {
              isVectorShape: true,
              shapeType: shapeType,
              pathData: pathData,
              vectorParams: fabricObj.data?.konvaAttrs?.vectorParams || {},
              konvaOrigin: true
            }),
            // Datos personalizados
            ...fabricObj.data
          },
          data: {
            ...fabricObj.data,
            fabricType: fabricObj.type,
            savedAt: new Date().toISOString()
          }
        };

        console.log('🔄 [Editor] Elemento convertido:', konvaElement);
        return konvaElement;
      });

      const designData = {
        elements: convertedElements,
        canvasData: {
          width: canvas.getWidth(),
          height: canvas.getHeight(),
          backgroundColor: canvas.backgroundColor || '#ffffff',
          zoom: canvas.getZoom(),
          viewportTransform: canvas.viewportTransform
        },
        productColorFilter,
        metadata: {
          ...getEditorStats(),
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          totalElements: convertedElements.length,
          fabricVersion: '5.3.0'
        }
      };

      console.log('📤 [Editor] Datos del diseño preparados:', designData);
      await onSave(designData);
      toast.success('Diseño guardado exitosamente');
    } catch (error) {
      console.error('❌ [Editor] Error guardando diseño:', error);
      Swal.fire({
        title: '❌ Error al Guardar',
        text: error.message || 'No se pudo guardar el diseño. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#EF4444'
      });
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
    console.log('🎨 [Editor] Aplicando filtro de color al producto:', color);
    
    if (!canvas) {
      console.warn('⚠️ [Editor] Canvas no disponible para aplicar filtro de color');
      return;
    }

    try {
      // Si el producto está como backgroundImage
      if (canvas.backgroundImage && canvas.backgroundImage.filters !== undefined) {
        console.log('🎨 [Editor] Aplicando filtro a backgroundImage');
        
        if (color && color !== '#ffffff') {
          const colorFilter = new fabric.Image.filters.BlendColor({
            color,
            mode: 'multiply',
            alpha: 0.3
          });
          canvas.backgroundImage.filters = [colorFilter];
          canvas.backgroundImage.applyFilters();
          console.log('✅ [Editor] Filtro de color aplicado a backgroundImage');
        } else {
          canvas.backgroundImage.filters = [];
          canvas.backgroundImage.applyFilters();
          console.log('✅ [Editor] Filtro de color removido de backgroundImage');
        }
        
        setProductColorFilter(color);
        // Usar renderizado seguro del store
        useEditorStore.getState().safeRender();
        return;
      }

      // Fallback: imagen de producto como objeto (compatibilidad)
      const productImage = canvas.getObjects().find(obj => obj.data?.isProductImage);
      if (productImage) {
        console.log('🎨 [Editor] Aplicando filtro a objeto de imagen');
        
        if (color && color !== '#ffffff') {
          const colorFilter = new fabric.Image.filters.BlendColor({
            color,
            mode: 'multiply',
            alpha: 0.3
          });
          productImage.filters = [colorFilter];
          productImage.applyFilters();
          console.log('✅ [Editor] Filtro de color aplicado a objeto de imagen');
        } else {
          productImage.filters = [];
          productImage.applyFilters();
          console.log('✅ [Editor] Filtro de color removido de objeto de imagen');
        }
        
        setProductColorFilter(color);
        canvas.requestRenderAll();
      } else {
        console.warn('⚠️ [Editor] No se encontró imagen de producto para aplicar filtro');
      }
    } catch (error) {
      console.error('❌ [Editor] Error aplicando filtro de color:', error);
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

  // Este useEffect se ejecuta después de initializeEditor
  // No necesita ejecutarse independientemente

  // Cargar diseño inicial cuando el canvas esté listo
  useEffect(() => {
    if (!isOpen) return;
    if (isCanvasInitialized && initialDesign && !initialDesignLoadedRef.current && canvas && canvas.lowerCanvasEl) {
      // Esperar un poco más para asegurar que el canvas esté completamente listo
      const timer = setTimeout(async () => {
        try {
          await loadInitialDesign();
          initialDesignLoadedRef.current = true;
        } catch (e) {
          console.error('❌ [Editor] Error en loadInitialDesign useEffect:', e);
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isCanvasInitialized, initialDesign, loadInitialDesign, canvas]);

  // Controlar visibilidad de las áreas customizables y sus etiquetas
  useEffect(() => {
    if (!canvas) return;
    
    const areas = canvas.getObjects().filter(obj => obj.data?.isArea);
    const labels = canvas.getObjects().filter(obj => obj.data?.isAreaLabel);
    
    // Ocultar/mostrar áreas y etiquetas
    [...areas, ...labels].forEach(obj => {
      obj.set('visible', showCustomizationAreas);
    });
    
    if (canvas.lowerCanvasEl) {
    // Usar renderizado seguro del store
    useEditorStore.getState().safeRender();
    }
  }, [showCustomizationAreas, canvas]);

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

      // Prevenir si está en un input o si el texto está en modo edición
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Verificar si hay un objeto de texto en modo edición
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'i-text' && activeObject.isEditing) {
        return; // No procesar atajos si el texto está siendo editado
      }

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          const activeObjects = canvas.getActiveObjects();
          if (activeObjects.length > 0) {
            activeObjects.forEach(obj => {
              // No eliminar imagen del producto, áreas de personalización, etiquetas de área o elementos en edición
              if (!obj.data?.isProductImage && 
                  !obj.data?.isArea && 
                  obj.data?.type !== 'areaLabel' &&
                  !obj.data?.skipHistory &&
                  !(obj.type === 'i-text' && obj.isEditing)) {
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
              onClick={() => {
                console.log('🔍 [Editor] Botón guardar clickeado - isSaving:', isSaving, 'canvas:', !!canvas);
                handleSave();
              }}
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

          {/* Botón de Sugerencias */}
          <Tooltip title="Sugerencias de Diseño" arrow>
            <NavButton 
              onClick={() => setSuggestionsModalOpen(true)}
              sx={{
                background: isDetected ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' : 
                           hasError ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' :
                           isDetecting ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' :
                           'rgba(31, 100, 191, 0.1)',
                color: isDetected || hasError || isDetecting ? 'white' : '#1F64BF',
                '&:hover': {
                  background: isDetected ? 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)' : 
                             hasError ? 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)' :
                             isDetecting ? 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)' :
                             'rgba(31, 100, 191, 0.2)'
                }
              }}
            >
              <Lightbulb size={18} />
            </NavButton>
          </Tooltip>

          {/* Toggle Áreas Customizables */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              ml: 2,
              px: 2,
              py: 0.5,
              borderRadius: '12px',
              background: showCustomizationAreas ? 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)' : 'rgba(31, 100, 191, 0.1)',
              border: `1px solid ${showCustomizationAreas ? '#1F64BF' : 'rgba(31, 100, 191, 0.3)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: showCustomizationAreas ? 'linear-gradient(135deg, #032CA6 0%, #001A7A 100%)' : 'rgba(31, 100, 191, 0.2)',
                transform: 'scale(1.02)'
              }
            }}
            onClick={() => setShowCustomizationAreas(!showCustomizationAreas)}
          >
            <Target size={16} color={showCustomizationAreas ? 'white' : '#1F64BF'} />
            <Typography 
              variant="caption" 
              fontWeight="600"
              color={showCustomizationAreas ? 'white' : '#1F64BF'}
            >
              {showCustomizationAreas ? 'Ocultar Zonas' : 'Mostrar Zonas'}
            </Typography>
          </Box>

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

          {/* Indicador de tipo de producto */}
          {isDetected && productConfig && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                ml: 2,
                px: 2,
                py: 0.5,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${productConfig.color}20 0%, ${productConfig.color}10 100%)`,
                border: `1px solid ${productConfig.color}40`,
                color: productConfig.color
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: productConfig.color
                }}
              />
              <Typography variant="caption" fontWeight="600">
                {productConfig.name}
              </Typography>
            </Box>
          )}

          {/* Indicador de estado de detección */}
          {isDetecting && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                ml: 2,
                px: 2,
                py: 0.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff980020 0%, #f57c0010 100%)',
                border: '1px solid #ff980040',
                color: '#f57c00'
              }}
            >
              <CircularProgress size={12} thickness={4} />
              <Typography variant="caption" fontWeight="600">
                Analizando...
              </Typography>
            </Box>
          )}

          {/* Indicador de zona seleccionada */}
          {selectedArea && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                ml: 2,
                px: 2,
                py: 0.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4caf5020 0%, #2e7d3210 100%)',
                border: '1px solid #4caf5040',
                color: '#2e7d32'
              }}
            >
              <Target size={12} />
              <Typography variant="caption" fontWeight="600">
                {selectedArea.name}
              </Typography>
            </Box>
          )}

          {/* Indicador de formas vectoriales */}
          {hasVectorContent && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1F64BF20 0%, #032CA610 100%)',
                border: '1px solid #1F64BF40',
                color: '#1F64BF'
              }}
            >
              <Star size={12} />
              <Typography variant="caption" fontWeight="600">
                {vectorShapes.length} Vector{vectorShapes.length !== 1 ? 'es' : ''}
              </Typography>
            </Box>
          )}

          {/* Indicador de modo edición vectorial */}
          {vectorEditMode && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F59E0B20 0%, #D9770610 100%)',
                border: '1px solid #F59E0B40',
                color: '#D97706'
              }}
            >
              <Lightbulb size={12} />
              <Typography variant="caption" fontWeight="600">
                Editando Vector
              </Typography>
            </Box>
          )}
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

      {/* Modal de Sugerencias de Diseño */}
      <Dialog
        open={suggestionsModalOpen}
        onClose={() => setSuggestionsModalOpen(false)}
        maxWidth="md"
        fullWidth
        style={{ zIndex: 9999 }} // Z-index alto para estar por encima del editor
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(31, 100, 191, 0.2)',
            boxShadow: '0 20px 40px rgba(1, 3, 38, 0.15)',
            zIndex: 10000 // Z-index adicional en el paper
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
          color: 'white',
          borderRadius: '16px 16px 0 0',
          padding: 3,
          fontSize: '1.25rem',
          fontWeight: 'bold'
        }}>
          <Lightbulb size={24} />
          Sugerencias de Diseño
        </DialogTitle>
        
        <DialogContent sx={{ padding: 3 }}>
          {isDetecting ? (
            <Box display="flex" alignItems="center" justifyContent="center" py={4}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Analizando producto...
              </Typography>
            </Box>
          ) : hasError ? (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              Error al analizar el producto. Usando configuración por defecto.
            </Alert>
          ) : isDetected ? (
            <Box>
              {/* Información del producto detectado */}
              <Box mb={3} p={2} sx={{ 
                background: 'rgba(31, 100, 191, 0.1)', 
                borderRadius: '12px',
                border: '1px solid rgba(31, 100, 191, 0.3)'
              }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  📦 Producto Detectado: {productConfig?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {productConfig?.description}
                </Typography>
                {productConfig?.canvas && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Dimensiones recomendadas: {productConfig.canvas.width} × {productConfig.canvas.height}px
                  </Typography>
                )}
              </Box>

              {/* Sugerencias de diseño */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star size={20} />
                Recomendaciones para tu diseño:
              </Typography>
              
              <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
                {getDesignSuggestions().map((suggestion, index) => (
                  <Box 
                    key={index} 
                    component="li" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2, 
                      mb: 2,
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <CheckCircle size={20} color="#4caf50" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography variant="body2">{suggestion}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Restricciones del producto */}
              {productConfig?.constraints && (
                <Box mt={3} p={2} sx={{ 
                  background: 'rgba(255, 152, 0, 0.1)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 152, 0, 0.3)'
                }}>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    ⚠️ Limitaciones del Producto
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Máximo {productConfig.constraints.maxElements} elementos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Máximo {productConfig.constraints.maxTextElements} textos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Máximo {productConfig.constraints.maxImageElements} imágenes
                  </Typography>
                </Box>
              )}
            </Box>
          ) : null}
        </DialogContent>
        
        <DialogActions sx={{ padding: 3, background: 'rgba(248, 249, 250, 0.8)' }}>
          <Button
            onClick={() => setSuggestionsModalOpen(false)}
            variant="outlined"
            startIcon={<CloseIcon size={20} />}
            sx={{ borderRadius: '8px' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </EditorLayout>
  );
};

export default EnhancedFabricEditor;