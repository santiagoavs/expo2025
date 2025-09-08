// src/components/AdvancedToolsPanel/AdvancedToolsPanel.jsx - PANEL DE HERRAMIENTAS AVANZADAS
import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Button,
  Slider,
  Switch,
  FormControlLabel,
  Stack,
  Divider,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TextAa,
  Image as ImageIcon,
  Shapes,
  Palette,
  MagicWand,
  CaretDown,
  Copy,
  Trash,
  Lock,
  Eye,
  EyeSlash,
  ArrowsOut,
  FlipHorizontal,
  FlipVertical,
  ArrowClockwise,
  ArrowCounterClockwise,
  Plus,
  Minus,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Lightning,
  Drop,
  Sparkle
} from '@phosphor-icons/react';
import { debounce, throttle, cloneDeep } from 'lodash';
import { fabric } from 'fabric';

// Importar componentes personalizados
import ColorPicker from './ColorPicker';
import ImageUploader from './ImageUploader';
import FontSelector from './FontSelector';
import KonvaShapesModal from './KonvaShapesModal';
import useEditorStore from '../stores/useEditorStores';
import { useFontManager } from '../hooks/useFontManager';

// Función auxiliar para renderizado seguro usando el store
const safeRenderAll = (canvas) => {
  if (canvas && canvas.lowerCanvasEl) {
    const context = canvas.lowerCanvasEl.getContext('2d');
    if (context && typeof context.clearRect === 'function') {
      canvas.requestRenderAll();
      console.log('[AdvancedToolsPanel] Canvas renderizado correctamente');
    } else {
      console.warn('[AdvancedToolsPanel] Contexto perdido, usando store safeRender...');
      // Usar el método seguro del store
      useEditorStore.getState().safeRender();
    }
  } else {
    console.warn('[AdvancedToolsPanel] Canvas no disponible para renderizado');
  }
};

// Constantes del tema
const THEME_COLORS = {
  primary: '#1F64BF',
  primaryDark: '#032CA6',
  accent: '#040DBF',
  background: '#F2F2F2',
  text: '#010326',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

// Panel principal con glassmorphism
const ToolsPanel = styled(Box)(({ theme }) => ({
  width: '350px',
  height: '100%',
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  borderRadius: '24px',
  border: '1px solid rgba(31, 100, 191, 0.2)',
  boxShadow: `
    0 12px 40px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1)
  `,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

// Tabs personalizados
const StyledTabs = styled(Tabs)({
  minHeight: '48px',
  '& .MuiTabs-indicator': {
    background: `linear-gradient(90deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
    height: '3px',
    borderRadius: '2px'
  },
  '& .MuiTab-root': {
    color: THEME_COLORS.text,
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'none',
    minHeight: '48px',
    borderRadius: '12px 12px 0 0',
    transition: 'all 0.3s ease',
    
    '&.Mui-selected': {
      color: THEME_COLORS.primary,
      background: 'rgba(31, 100, 191, 0.1)'
    },
    
    '&:hover': {
      background: 'rgba(31, 100, 191, 0.05)'
    }
  }
});

// Botón de herramienta
const ToolButton = styled(IconButton)(({ theme, active, variant = 'default' }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: active
    ? `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`
    : variant === 'primary'
      ? 'rgba(31, 100, 191, 0.1)'
      : 'rgba(255, 255, 255, 0.1)',
  border: active
    ? 'none'
    : `1px solid ${variant === 'primary' ? THEME_COLORS.primary : 'rgba(31, 100, 191, 0.2)'}`,
  color: active ? '#ffffff' : THEME_COLORS.primary,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: active
      ? `linear-gradient(135deg, ${THEME_COLORS.primaryDark}, ${THEME_COLORS.accent})`
      : `rgba(31, 100, 191, 0.15)`,
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: active
      ? '0 8px 25px rgba(31, 100, 191, 0.4)'
      : '0 6px 20px rgba(31, 100, 191, 0.2)'
  }
}));

// Accordion personalizado
const StyledAccordion = styled(Accordion)({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px !important',
  border: '1px solid rgba(31, 100, 191, 0.2)',
  boxShadow: 'none',
  marginBottom: '8px',
  
  '&:before': {
    display: 'none'
  },
  
  '&.Mui-expanded': {
    background: 'rgba(31, 100, 191, 0.1)',
    borderColor: THEME_COLORS.primary
  }
});

// Slider personalizado
const StyledSlider = styled(Slider)({
  '& .MuiSlider-track': {
    background: `linear-gradient(90deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
    height: '6px',
    borderRadius: '3px'
  },
  '& .MuiSlider-rail': {
    background: 'rgba(255, 255, 255, 0.2)',
    height: '6px',
    borderRadius: '3px'
  },
  '& .MuiSlider-thumb': {
    width: '20px',
    height: '20px',
    background: `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
    border: '2px solid #ffffff',
    boxShadow: '0 4px 12px rgba(31, 100, 191, 0.3)',
    
    '&:hover': {
      boxShadow: '0 6px 16px rgba(31, 100, 191, 0.4)'
    }
  }
});

/**
 * Panel de herramientas avanzadas para el editor
 * Incluye herramientas de texto, imagen, formas, efectos y propiedades
 */
const AdvancedToolsPanel = () => {
  // Estados del componente
  const [activeTab, setActiveTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('basic-tools');

  // Hook de gestión de fuentes
  const {
    fonts,
    googleFontsLoaded,
    isLoading: fontsLoading,
    loadGoogleFonts,
    isFontAvailable
  } = useFontManager();

  // Store del editor
  const {
    canvas,
    isCanvasInitialized,
    activeTool,
    setActiveTool,
    selectedObjects,
    toolProperties,
    updateToolProperties,
    deleteSelectedObjects,
    duplicateSelectedObjects,
    addNotification,
    saveToHistory
  } = useEditorStore();

  // Selectores directos para formas vectoriales (evita bucles infinitos)
  const vectorShapes = useEditorStore((state) => state.vectorShapes);
  const vectorEditMode = useEditorStore((state) => state.vectorEditMode);
  const konvaShapesModalOpen = useEditorStore((state) => state.konvaShapesModalOpen);
  const openKonvaShapesModal = useEditorStore((state) => state.openKonvaShapesModal);
  const closeKonvaShapesModal = useEditorStore((state) => state.closeKonvaShapesModal);
  const addVectorShape = useEditorStore((state) => state.addVectorShape);
  const updateVectorShapesList = useEditorStore((state) => state.updateVectorShapesList);
  
  // Valores computados
  const hasVectorContent = vectorShapes.length > 0;
  const vectorShapesCount = vectorShapes.length;

  // Debug del estado del canvas
  React.useEffect(() => {
    console.log('[AdvancedToolsPanel] Canvas state changed:', {
      canvas: !!canvas,
      isCanvasInitialized,
      canvasType: canvas?.constructor?.name,
      lowerCanvasEl: !!canvas?.lowerCanvasEl
    });
  }, [canvas, isCanvasInitialized]);

  // Debug del estado del modal
  React.useEffect(() => {
    console.log('🎨 [AdvancedToolsPanel] Modal state changed:', {
      konvaShapesModalOpen,
      openKonvaShapesModal: !!openKonvaShapesModal,
      closeKonvaShapesModal: !!closeKonvaShapesModal
    });
  }, [konvaShapesModalOpen, openKonvaShapesModal, closeKonvaShapesModal]);


  // ==================== HERRAMIENTAS BÁSICAS ====================

  /**
   * Agrega texto al canvas
   */
  const addText = useCallback(() => {
    if (!canvas) return;

    try {
      const text = new fabric.IText('Haz doble clic para editar', {
        left: canvas.width / 2,
        top: canvas.height / 2,
        originX: 'center',
        originY: 'center',
        fontFamily: toolProperties.text.fontFamily,
        fontSize: toolProperties.text.fontSize,
        fill: toolProperties.text.fill,
        fontWeight: toolProperties.text.fontWeight,
        fontStyle: toolProperties.text.fontStyle,
        // Configuraciones adicionales para edición
        editable: true,
        selectable: true,
        evented: true,
        // Datos personalizados con konvaAttrs para compatibilidad
        data: {
          type: 'text',
          id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isCustomElement: true,
          // ✅ AGREGADO: Metadatos konvaAttrs para compatibilidad con KonvaFabricConverter
          konvaAttrs: {
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: 200, // Se calculará automáticamente
            height: 50, // Se calculará automáticamente
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            fill: toolProperties.text.fill,
            stroke: null,
            strokeWidth: 0,
            fontSize: toolProperties.text.fontSize,
            fontFamily: toolProperties.text.fontFamily,
            fontWeight: toolProperties.text.fontWeight,
            fontStyle: toolProperties.text.fontStyle,
            textAlign: 'left',
            text: 'Haz doble clic para editar',
            // Identificadores para formas básicas
            isBasicShape: true,
            shapeType: 'text',
            konvaOrigin: true
          }
        }
      });

      // Configurar eventos de edición de texto
      text.on('editing:entered', () => {
        console.log('📝 [Editor] Entrando en modo edición de texto');
        canvas.setActiveObject(text);
        canvas.selection = false; // Deshabilitar selección durante edición
      });

      text.on('editing:exited', () => {
        console.log('📝 [Editor] Saliendo del modo edición de texto');
        canvas.selection = true; // Rehabilitar selección
        // Guardar en historial cuando se termina de editar
        saveToHistory('Texto editado');
      });

      // Configurar doble clic para editar - usar el evento del canvas
      text.on('mousedown', (e) => {
        // Solo procesar si es doble clic
        if (e.e && e.e.detail === 2) {
          console.log('📝 [Editor] Doble clic detectado en texto');
          setTimeout(() => {
            text.enterEditing();
            canvas.setActiveObject(text);
          }, 100);
        }
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      
      // Renderizado seguro
      safeRenderAll(canvas);
      
      setActiveTool('text');
      addNotification({
        type: 'success',
        title: 'Texto agregado',
        message: 'Haz doble clic en el texto para editarlo'
      });
    } catch (error) {
      console.error('Error agregando texto:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo agregar el texto'
      });
    }
  }, [canvas, toolProperties.text, setActiveTool, addNotification, saveToHistory]);

  /**
   * Agrega una forma básica al canvas
   */
  const addShape = useCallback((shapeType) => {
    if (!canvas) return;

    try {
      let shape;
      const baseOptions = {
        left: canvas.width / 2,
        top: canvas.height / 2,
        originX: 'center',
        originY: 'center',
        fill: toolProperties.shape.fill,
        stroke: toolProperties.shape.stroke,
        strokeWidth: toolProperties.shape.strokeWidth,
        opacity: toolProperties.shape.opacity
      };

      // ✅ AGREGADO: Metadatos konvaAttrs para todas las formas básicas
      const konvaAttrs = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 100,
        height: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: toolProperties.shape.opacity,
        fill: toolProperties.shape.fill,
        stroke: toolProperties.shape.stroke,
        strokeWidth: toolProperties.shape.strokeWidth,
        // Identificadores para formas básicas
        isBasicShape: true,
        shapeType: shapeType,
        konvaOrigin: true
      };

      switch (shapeType) {
        case 'rectangle':
          shape = new fabric.Rect({
            width: 100,
            height: 100,
            ...baseOptions,
            // ✅ AGREGADO: Metadatos konvaAttrs
            data: {
              type: 'rect',
              id: `rect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              isCustomElement: true,
              konvaAttrs: konvaAttrs
            }
          });
          break;
        case 'circle':
          konvaAttrs.width = 100; // Diámetro
          konvaAttrs.height = 100; // Diámetro
          shape = new fabric.Circle({
            radius: 50,
            ...baseOptions,
            // ✅ AGREGADO: Metadatos konvaAttrs
            data: {
              type: 'circle',
              id: `circle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              isCustomElement: true,
              konvaAttrs: konvaAttrs
            }
          });
          break;
        case 'triangle':
          shape = new fabric.Triangle({
            width: 100,
            height: 100,
            ...baseOptions,
            // ✅ AGREGADO: Metadatos konvaAttrs
            data: {
              type: 'triangle',
              id: `triangle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              isCustomElement: true,
              konvaAttrs: konvaAttrs
            }
          });
          break;
        default:
          shape = new fabric.Rect({
            width: 100,
            height: 100,
            ...baseOptions,
            // ✅ AGREGADO: Metadatos konvaAttrs
            data: {
              type: 'rect',
              id: `rect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              isCustomElement: true,
              konvaAttrs: konvaAttrs
            }
          });
      }

      canvas.add(shape);
      canvas.setActiveObject(shape);
      
      // Renderizado seguro
      safeRenderAll(canvas);
      
      setActiveTool('shapes');
      addNotification({
        type: 'success',
        title: 'Forma agregada',
        message: `Se agregó una nueva forma: ${shapeType}`
      });
    } catch (error) {
      console.error('Error agregando forma:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo agregar la forma'
      });
    }
  }, [canvas, toolProperties.shape, setActiveTool, addNotification]);

  /**
   * Maneja la subida de imágenes
   */
  const handleImageUpload = useCallback(async (images) => {
    console.log('[AdvancedToolsPanel] handleImageUpload llamado con:', images);
    
    // Obtener canvas directamente del store para asegurar sincronización
    const currentCanvas = useEditorStore.getState().canvas;
    const currentIsInitialized = useEditorStore.getState().isCanvasInitialized;
    
    console.log('[AdvancedToolsPanel] Estado del canvas (hook):', !!canvas);
    console.log('[AdvancedToolsPanel] Estado del canvas (store):', !!currentCanvas);
    console.log('[AdvancedToolsPanel] isCanvasInitialized:', currentIsInitialized);
    console.log('[AdvancedToolsPanel] Canvas lowerCanvasEl (hook):', !!canvas?.lowerCanvasEl);
    console.log('[AdvancedToolsPanel] Canvas lowerCanvasEl (store):', !!currentCanvas?.lowerCanvasEl);
    
    if (!currentCanvas) {
      console.error('[AdvancedToolsPanel] Canvas no está disponible en el store');
      addNotification({
        type: 'error',
        title: 'Error de Canvas',
        message: 'El canvas no está disponible. Espera a que el editor se inicialice completamente.'
      });
      return;
    }
    
    // Usar el canvas del store en lugar del hook
    const workingCanvas = currentCanvas;
    
    // Verificar que el canvas esté completamente inicializado
    if (!workingCanvas.lowerCanvasEl) {
      console.warn('[AdvancedToolsPanel] Canvas lowerCanvasEl no disponible, esperando...');
      
      // Esperar hasta que el canvas esté listo
      let retries = 0;
      while (!workingCanvas.lowerCanvasEl && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
        console.log(`[AdvancedToolsPanel] Reintento ${retries}/10 esperando lowerCanvasEl`);
      }
      
      if (!workingCanvas.lowerCanvasEl) {
        console.error('[AdvancedToolsPanel] Canvas no se pudo inicializar completamente');
        addNotification({
          type: 'error',
          title: 'Error de Canvas',
          message: 'El canvas no se pudo inicializar completamente. Inténtalo de nuevo.'
        });
        return;
      }
    }
    
    if (!images.length) {
      console.warn('[AdvancedToolsPanel] No hay imágenes para procesar');
      return;
    }

    images.forEach((imageData, index) => {
      console.log(`[AdvancedToolsPanel] Procesando imagen ${index + 1}:`, imageData);
      fabric.Image.fromURL(imageData.processedUrl || imageData.originalUrl, (img) => {
        console.log(`[AdvancedToolsPanel] Imagen ${index + 1} cargada:`, img);
        // Escalar imagen si es muy grande
        const maxSize = 300;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        
        img.set({
          left: workingCanvas.width / 2 + (index * 20),
          top: workingCanvas.height / 2 + (index * 20),
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          // Guardar datos de la imagen para la conversión
          data: {
            ...img.data,
            type: 'image',
            imageUrl: imageData.processedUrl || imageData.originalUrl,
            originalSrc: imageData.originalUrl,
            src: imageData.processedUrl || imageData.originalUrl,
            processedUrl: imageData.processedUrl,
            originalUrl: imageData.originalUrl
          }
        });

        workingCanvas.add(img);
        workingCanvas.setActiveObject(img);
        console.log(`[AdvancedToolsPanel] Imagen ${index + 1} agregada al canvas`);
        
        // Renderizado seguro
        safeRenderAll(workingCanvas);
        console.log(`[AdvancedToolsPanel] Imagen ${index + 1} renderizada`);
      });
    });

    setActiveTool('image');
    addNotification({
      type: 'success',
      title: 'Imágenes agregadas',
      message: `Se agregaron ${images.length} imagen${images.length === 1 ? '' : 'es'}`
    });
  }, [setActiveTool, addNotification]);

  // ==================== EFECTOS Y TRANSFORMACIONES ====================

  /**
   * Aplica efectos a los objetos seleccionados
   */
  const applyEffect = useCallback((effectType, options = {}) => {
    if (!canvas || selectedObjects.length === 0) return;

    try {
      selectedObjects.forEach(obj => {
        switch (effectType) {
          case 'shadow':
            obj.set({
              shadow: new fabric.Shadow({
                color: options.color || 'rgba(0,0,0,0.3)',
                blur: options.blur || 10,
                offsetX: options.offsetX || 5,
                offsetY: options.offsetY || 5
              })
            });
            break;
          
          case 'glow':
            obj.set({
              shadow: new fabric.Shadow({
                color: options.color || 'rgba(255,255,255,0.8)',
                blur: options.blur || 20,
                offsetX: 0,
                offsetY: 0
              })
            });
            break;
          
          case 'transparency':
            obj.set({ opacity: options.opacity || 0.7 });
            break;
          
          case 'rotate':
            obj.set({ angle: (obj.angle || 0) + (options.angle || 15) });
            break;
          
          case 'flip-horizontal':
            obj.set({ flipX: !obj.flipX });
            break;
          
          case 'flip-vertical':
            obj.set({ flipY: !obj.flipY });
            break;
        }
      });

      canvas.requestRenderAll();
      addNotification({
        type: 'success',
        title: 'Efecto aplicado',
        message: `Se aplicó el efecto: ${effectType}`
      });
    } catch (error) {
      console.error('Error aplicando efecto:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo aplicar el efecto'
      });
    }
  }, [canvas, selectedObjects, addNotification]);

  /**
   * Actualiza propiedades de los objetos seleccionados con debounce
   */
  const updateSelectedObjectsProperty = useCallback(
    debounce((property, value) => {
      console.log(`🎨 [Editor] updateSelectedObjectsProperty llamado`);
      console.log(`🎨 [Editor] property:`, property);
      console.log(`🎨 [Editor] value:`, value);
      console.log(`🎨 [Editor] canvas disponible:`, !!canvas);
      console.log(`🎨 [Editor] selectedObjects.length:`, selectedObjects?.length || 0);
      
      if (!canvas || selectedObjects.length === 0) {
        console.warn(`🎨 [Editor] No se puede actualizar - canvas o objetos no disponibles`);
        return;
      }

      console.log(`🎨 [Editor] Actualizando propiedad ${property} con valor:`, value);

      selectedObjects.forEach(obj => {
        try {
          if (property === 'fontSize' && obj.type === 'i-text') {
            obj.set({ fontSize: value });
            console.log(`📝 [Editor] Tamaño de fuente actualizado: ${value}`);
          } else if (property === 'fill') {
            obj.set({ fill: value });
            console.log(`🎨 [Editor] Color de relleno actualizado: ${value}`);
          } else if (property === 'stroke') {
            obj.set({ stroke: value });
            console.log(`🖌️ [Editor] Color de borde actualizado: ${value}`);
          } else if (property === 'strokeWidth') {
            obj.set({ strokeWidth: value });
            console.log(`📏 [Editor] Grosor de borde actualizado: ${value}`);
          } else if (property === 'opacity') {
            obj.set({ opacity: value });
            console.log(`👁️ [Editor] Opacidad actualizada: ${value}`);
          } else if (property === 'fontFamily' && obj.type === 'i-text') {
            console.log(`🔤 [Editor] Aplicando fuente ${value} a objeto i-text`);
            console.log(`🔤 [Editor] Objeto antes del cambio:`, {
              type: obj.type,
              fontFamily: obj.fontFamily,
              text: obj.text
            });
            obj.set({ fontFamily: value });
            console.log(`🔤 [Editor] Objeto después del cambio:`, {
              type: obj.type,
              fontFamily: obj.fontFamily,
              text: obj.text
            });
            console.log(`🔤 [Editor] Fuente actualizada: ${value}`);
          }
        } catch (error) {
          console.error(`❌ [Editor] Error actualizando propiedad ${property}:`, error);
        }
      });

      // Forzar renderizado inmediato
      console.log(`🎨 [Editor] Forzando renderizado del canvas`);
      canvas.requestRenderAll();
      console.log(`🎨 [Editor] Canvas renderizado`);
      
      // Guardar en historial
      console.log(`🎨 [Editor] Guardando en historial: Propiedad ${property} actualizada`);
      saveToHistory(`Propiedad ${property} actualizada`);
      console.log(`🎨 [Editor] updateSelectedObjectsProperty completado`);
    }, 100), // Reducir debounce para mejor respuesta
    [canvas, selectedObjects, saveToHistory]
  );

  // ==================== UTILIDADES CON LODASH ====================

  /**
   * Alinea objetos seleccionados
   */
  const alignObjects = useCallback((alignment) => {
    if (!canvas || selectedObjects.length === 0) return;

    try {
      const canvasCenter = {
        x: canvas.width / 2,
        y: canvas.height / 2
      };

      // Usar lodash para operaciones complejas
      const objectsData = selectedObjects.map(obj => ({
        object: obj,
        bounds: obj.getBoundingRect(),
        center: obj.getCenterPoint()
      }));

      switch (alignment) {
        case 'left':
          const minLeft = Math.min(...objectsData.map(data => data.bounds.left));
          objectsData.forEach(data => {
            data.object.set({ left: minLeft + data.object.width * data.object.originX });
          });
          break;
        
        case 'center-horizontal':
          objectsData.forEach(data => {
            data.object.set({ left: canvasCenter.x });
          });
          break;
        
        case 'right':
          const maxRight = Math.max(...objectsData.map(data => data.bounds.left + data.bounds.width));
          objectsData.forEach(data => {
            data.object.set({ left: maxRight - data.object.width * (1 - data.object.originX) });
          });
          break;
        
        case 'top':
          const minTop = Math.min(...objectsData.map(data => data.bounds.top));
          objectsData.forEach(data => {
            data.object.set({ top: minTop + data.object.height * data.object.originY });
          });
          break;
        
        case 'center-vertical':
          objectsData.forEach(data => {
            data.object.set({ top: canvasCenter.y });
          });
          break;
        
        case 'bottom':
          const maxBottom = Math.max(...objectsData.map(data => data.bounds.top + data.bounds.height));
          objectsData.forEach(data => {
            data.object.set({ top: maxBottom - data.object.height * (1 - data.object.originY) });
          });
          break;
      }

      canvas.requestRenderAll();
      addNotification({
        type: 'success',
        title: 'Objetos alineados',
        message: `Alineación: ${alignment}`
      });
    } catch (error) {
      console.error('Error alineando objetos:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron alinear los objetos'
      });
    }
  }, [canvas, selectedObjects, addNotification]);

  /**
   * Distribuye objetos uniformemente
   */
  const distributeObjects = useCallback((direction) => {
    if (!canvas || selectedObjects.length < 3) return;

    try {
      // Usar lodash para ordenar y distribuir
      const sortedObjects = [...selectedObjects].sort((a, b) => {
        const boundsA = a.getBoundingRect();
        const boundsB = b.getBoundingRect();
        return direction === 'horizontal' 
          ? boundsA.left - boundsB.left 
          : boundsA.top - boundsB.top;
      });

      const first = sortedObjects[0].getBoundingRect();
      const last = sortedObjects[sortedObjects.length - 1].getBoundingRect();
      
      const totalSpace = direction === 'horizontal'
        ? (last.left + last.width) - first.left
        : (last.top + last.height) - first.top;
      
      const totalObjectSize = sortedObjects.reduce((sum, obj) => {
        const bounds = obj.getBoundingRect();
        return sum + (direction === 'horizontal' ? bounds.width : bounds.height);
      }, 0);
      
      const spacing = (totalSpace - totalObjectSize) / (sortedObjects.length - 1);

      let currentPosition = direction === 'horizontal' ? first.left : first.top;
      
      sortedObjects.forEach((obj, index) => {
        if (index === 0) return; // Skip first object
        
        const bounds = obj.getBoundingRect();
        const prevBounds = sortedObjects[index - 1].getBoundingRect();
        
        currentPosition += (direction === 'horizontal' ? prevBounds.width : prevBounds.height) + spacing;
        
        if (direction === 'horizontal') {
          obj.set({ left: currentPosition + bounds.width * obj.originX });
        } else {
          obj.set({ top: currentPosition + bounds.height * obj.originY });
        }
      });

      canvas.requestRenderAll();
      addNotification({
        type: 'success',
        title: 'Objetos distribuidos',
        message: `Distribución: ${direction}`
      });
    } catch (error) {
      console.error('Error distribuyendo objetos:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron distribuir los objetos'
      });
    }
  }, [canvas, selectedObjects, addNotification]);

  // ==================== MEMOIZACIONES ====================

  const hasSelectedObjects = useMemo(() => selectedObjects.length > 0, [selectedObjects]);
  const hasMultipleSelectedObjects = useMemo(() => selectedObjects.length > 1, [selectedObjects]);
  const selectedObjectsCanDistribute = useMemo(() => selectedObjects.length >= 3, [selectedObjects]);

  const selectedObjectProperties = useMemo(() => {
    if (selectedObjects.length === 0) return null;
    
    // Usar lodash para mergear propiedades comunes
    const commonProps = selectedObjects.reduce((acc, obj) => {
      return {
        fontSize: obj.fontSize === acc.fontSize ? acc.fontSize : 'mixed',
        fill: obj.fill === acc.fill ? acc.fill : 'mixed',
        opacity: obj.opacity === acc.opacity ? acc.opacity : 'mixed',
        stroke: obj.stroke === acc.stroke ? acc.stroke : 'mixed',
        strokeWidth: obj.strokeWidth === acc.strokeWidth ? acc.strokeWidth : 'mixed',
        fontFamily: obj.fontFamily === acc.fontFamily ? acc.fontFamily : 'mixed'
      };
    }, {
      fontSize: selectedObjects[0].fontSize || 24,
      fill: selectedObjects[0].fill || '#000000',
      opacity: selectedObjects[0].opacity || 1,
      stroke: selectedObjects[0].stroke || 'transparent',
      strokeWidth: selectedObjects[0].strokeWidth || 0,
      fontFamily: selectedObjects[0].fontFamily || 'Arial'
    });

    return commonProps;
  }, [selectedObjects]);

  // ==================== RENDER ====================

  return (
    <ToolsPanel>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: THEME_COLORS.text,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <MagicWand size={20} />
          Herramientas
        </Typography>
        <Typography variant="caption" sx={{ color: THEME_COLORS.text, opacity: 0.7 }}>
          {hasSelectedObjects ? `${selectedObjects.length} objeto${selectedObjects.length === 1 ? '' : 's'} seleccionado${selectedObjects.length === 1 ? '' : 's'}` : 'Ningún objeto seleccionado'}
        </Typography>
      </Box>

      {/* Tabs principales */}
      <StyledTabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Básicas" />
        <Tab label="Efectos" />
        <Tab label="Organizar" />
      </StyledTabs>

      {/* Contenido de las tabs */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Tab: Herramientas Básicas */}
        {activeTab === 0 && (
          <Stack spacing={2}>
            {/* Herramientas de creación */}
            <StyledAccordion 
              expanded={expandedAccordion === 'basic-tools'}
              onChange={() => setExpandedAccordion(expandedAccordion === 'basic-tools' ? '' : 'basic-tools')}
            >
              <AccordionSummary expandIcon={<CaretDown />}>
                <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  Agregar Elementos
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Tooltip title="Agregar texto">
                      <ToolButton 
                        active={activeTool === 'text'}
                        onClick={addText}
                        fullWidth
                      >
                        <TextAa size={20} />
                      </ToolButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6}>
                    <Tooltip title="Rectángulo">
                      <ToolButton 
                        onClick={() => addShape('rectangle')}
                        fullWidth
                      >
                        <Square size={20} />
                      </ToolButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6}>
                    <Tooltip title="Círculo">
                      <ToolButton 
                        onClick={() => addShape('circle')}
                        fullWidth
                      >
                        <Circle size={20} />
                      </ToolButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6}>
                    <Tooltip title="Triángulo">
                      <ToolButton 
                        onClick={() => addShape('triangle')}
                        fullWidth
                      >
                        <Triangle size={20} />
                      </ToolButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6}>
                    <Tooltip title="Corazón">
                      <ToolButton 
                        onClick={() => addShape('heart')}
                        fullWidth
                      >
                        <Heart size={20} />
                      </ToolButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </StyledAccordion>

            {/* Formas Vectoriales */}
            <StyledAccordion>
              <AccordionSummary expandIcon={<CaretDown />}>
                <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  Formas Vectoriales
                </Typography>
                {vectorShapes.length > 0 && (
                  <Chip 
                    label={vectorShapes.length} 
                    size="small" 
                    sx={{ 
                      ml: 1, 
                      backgroundColor: THEME_COLORS.primary,
                      color: 'white',
                      fontSize: '0.75rem'
                    }} 
                  />
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography variant="body2" sx={{ color: THEME_COLORS.text, opacity: 0.8 }}>
                    Formas personalizables como Figma
                  </Typography>
                  
                  <Button
                    variant="contained"
                    onClick={() => {
                      console.log('🎨 [AdvancedToolsPanel] Botón clickeado, abriendo modal...');
                      console.log('🎨 [AdvancedToolsPanel] openKonvaShapesModal es:', typeof openKonvaShapesModal);
                      console.log('🎨 [AdvancedToolsPanel] Estado actual del modal:', konvaShapesModalOpen);
                      openKonvaShapesModal();
                      console.log('🎨 [AdvancedToolsPanel] openKonvaShapesModal ejecutado');
                    }}
                    startIcon={<Sparkle size={20} />}
                    sx={{
                      background: `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      boxShadow: '0 4px 16px rgba(31, 100, 191, 0.3)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${THEME_COLORS.primaryDark}, ${THEME_COLORS.accent})`,
                        boxShadow: '0 6px 20px rgba(31, 100, 191, 0.4)'
                      }
                    }}
                  >
                    Crear Forma Personalizada
                  </Button>

                  {vectorShapes.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                        Formas disponibles:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {vectorShapes.map((shape, index) => (
                          <Chip
                            key={shape.id || index}
                            label={shape.type}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: THEME_COLORS.primary,
                              color: THEME_COLORS.primary,
                              '&:hover': {
                                backgroundColor: 'rgba(31, 100, 191, 0.1)'
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {vectorEditMode && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        borderRadius: '12px',
                        backgroundColor: 'rgba(31, 100, 191, 0.1)',
                        border: `1px solid ${THEME_COLORS.primary}`
                      }}
                    >
                      <Typography variant="body2">
                        Modo edición vectorial activo
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </AccordionDetails>
            </StyledAccordion>

            {/* Subida de imágenes */}
            <StyledAccordion>
              <AccordionSummary expandIcon={<CaretDown />}>
                <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  Imágenes
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  maxFiles={3}
                  showPreview={false}
                  enableBackgroundRemoval={true}
                />
              </AccordionDetails>
            </StyledAccordion>

            {/* Propiedades de objetos seleccionados */}
            {hasSelectedObjects && selectedObjectProperties && (
              <StyledAccordion expanded>
                <AccordionSummary expandIcon={<CaretDown />}>
                  <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                    Propiedades
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {/* Color de relleno */}
                    <Box>
                      <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                        Color de relleno
                      </Typography>
                      <ColorPicker
                        currentcolor={selectedObjectProperties.fill !== 'mixed' ? selectedObjectProperties.fill : '#000000'}
                        onChange={(color) => updateSelectedObjectsProperty('fill', color)}
                        size="small"
                      />
                    </Box>

                    {/* Opacidad */}
                    <Box>
                      <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                        Opacidad: {selectedObjectProperties.opacity !== 'mixed' ? Math.round(selectedObjectProperties.opacity * 100) : 'Mixto'}%
                      </Typography>
                      <StyledSlider
                        value={selectedObjectProperties.opacity !== 'mixed' ? selectedObjectProperties.opacity : 0.5}
                        onChange={(e, value) => updateSelectedObjectsProperty('opacity', value)}
                        min={0}
                        max={1}
                        step={0.01}
                      />
                    </Box>

                    {/* Color de borde */}
                    <Box>
                      <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                        Color de borde
                      </Typography>
                      <ColorPicker
                        currentcolor={selectedObjectProperties.stroke !== 'mixed' ? selectedObjectProperties.stroke : '#000000'}
                        onChange={(color) => updateSelectedObjectsProperty('stroke', color)}
                        size="small"
                      />
                    </Box>

                    {/* Grosor de borde */}
                    <Box>
                      <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                        Grosor de borde: {selectedObjectProperties.strokeWidth !== 'mixed' ? selectedObjectProperties.strokeWidth : 'Mixto'}px
                      </Typography>
                      <StyledSlider
                        value={selectedObjectProperties.strokeWidth !== 'mixed' ? selectedObjectProperties.strokeWidth : 0}
                        onChange={(e, value) => updateSelectedObjectsProperty('strokeWidth', value)}
                        min={0}
                        max={10}
                        step={0.5}
                      />
                    </Box>

                    {/* Selector de fuente para texto */}
                    {selectedObjects.some(obj => obj.type === 'i-text') && (
                      <FontSelector
                        value={selectedObjectProperties.fontFamily || 'Arial'}
                        onChange={(fontFamily) => updateSelectedObjectsProperty('fontFamily', fontFamily)}
                        size="small"
                        showGoogleFonts={true}
                        showSystemFonts={true}
                        showCustomFonts={true}
                      />
                    )}
                  </Stack>
                </AccordionDetails>
              </StyledAccordion>
            )}
          </Stack>
        )}

        {/* Tab: Efectos */}
        {activeTab === 1 && (
          <Stack spacing={2}>
            {/* Efectos básicos */}
            <StyledAccordion expanded>
              <AccordionSummary expandIcon={<CaretDown />}>
                <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  Efectos Básicos
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Drop />}
                      onClick={() => applyEffect('shadow')}
                      disabled={!hasSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px' }}
                    >
                      Sombra
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Sparkle />}
                      onClick={() => applyEffect('glow')}
                      disabled={!hasSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px' }}
                    >
                      Brillo
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </StyledAccordion>

            {/* Transformaciones */}
            <StyledAccordion>
              <AccordionSummary expandIcon={<CaretDown />}>
                <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  Transformaciones
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ArrowClockwise />}
                      onClick={() => applyEffect('rotate', { angle: 15 })}
                      disabled={!hasSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px' }}
                    >
                      Rotar
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FlipHorizontal />}
                      onClick={() => applyEffect('flip-horizontal')}
                      disabled={!hasSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px' }}
                    >
                      Voltear H
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FlipVertical />}
                      onClick={() => applyEffect('flip-vertical')}
                      disabled={!hasSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px' }}
                    >
                      Voltear Vertical
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </StyledAccordion>
          </Stack>
        )}

        {/* Tab: Organizar */}
        {activeTab === 2 && (
          <Stack spacing={2}>
            {/* Acciones de objeto */}
            <StyledAccordion expanded>
              <AccordionSummary expandIcon={<CaretDown />}>
                <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  Acciones
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Copy />}
                      onClick={duplicateSelectedObjects}
                      disabled={!hasSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px' }}
                    >
                      Duplicar
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Trash />}
                      onClick={deleteSelectedObjects}
                      disabled={!hasSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px', color: THEME_COLORS.error }}
                    >
                      Eliminar
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </StyledAccordion>

            {/* Alineación */}
            <StyledAccordion>
              <AccordionSummary expandIcon={<CaretDown />}>
                <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  Alineación
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => alignObjects('left')}
                      disabled={!hasMultipleSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px', minWidth: 0, px: 1 }}
                    >
                      ←
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => alignObjects('center-horizontal')}
                      disabled={!hasSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px', minWidth: 0, px: 1 }}
                    >
                      ↕
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => alignObjects('right')}
                      disabled={!hasMultipleSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px', minWidth: 0, px: 1 }}
                    >
                      →
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => alignObjects('top')}
                      disabled={!hasMultipleSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px', minWidth: 0, px: 1 }}
                    >
                      ↑
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => alignObjects('center-vertical')}
                      disabled={!hasSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px', minWidth: 0, px: 1 }}
                    >
                      ↔
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => alignObjects('bottom')}
                      disabled={!hasMultipleSelectedObjects}
                      fullWidth
                      sx={{ borderRadius: '8px', minWidth: 0, px: 1 }}
                    >
                      ↓
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </StyledAccordion>

            {/* Distribución */}
            <StyledAccordion>
              <AccordionSummary expandIcon={<CaretDown />}>
                <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                  Distribución
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => distributeObjects('horizontal')}
                      disabled={!selectedObjectsCanDistribute}
                      fullWidth
                      sx={{ borderRadius: '8px' }}
                    >
                      Horizontal
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => distributeObjects('vertical')}
                      disabled={!selectedObjectsCanDistribute}
                      fullWidth
                      sx={{ borderRadius: '8px' }}
                    >
                      Vertical
                    </Button>
                  </Grid>
                </Grid>
                
                {!selectedObjectsCanDistribute && selectedObjects.length > 0 && (
                  <Typography variant="caption" sx={{ color: THEME_COLORS.text, opacity: 0.7, mt: 1, display: 'block' }}>
                    Se necesitan al menos 3 objetos para distribuir
                  </Typography>
                )}
              </AccordionDetails>
            </StyledAccordion>
          </Stack>
        )}
      </Box>

      {/* Modal de Formas Vectoriales */}
      <KonvaShapesModal
        open={konvaShapesModalOpen}
        onClose={closeKonvaShapesModal}
      />
    </ToolsPanel>
  );
};

export default AdvancedToolsPanel;