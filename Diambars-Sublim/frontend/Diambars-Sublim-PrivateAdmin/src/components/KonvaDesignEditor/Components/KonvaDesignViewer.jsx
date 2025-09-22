// src/components/KonvaDesignEditor/Components/KonvaDesignViewer.jsx - VIEWER KONVA
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image, Line } from 'react-konva';
import { CANVAS_CONFIG, scaleCustomizationArea, calculateScaledDimensions } from '../constants/canvasConfig';
import { useUnifiedCanvasCentering } from '../hooks/useUnifiedCanvasCentering';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Box, 
  Button, 
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { X as CloseIcon, Download } from '@phosphor-icons/react';

// Tema moderno 3D para el viewer
const COLOR_PALETTE = {
  white: '#FFFFFF',
  primary: '#1F64BF',
  primaryDark: '#032CA6',
  primaryLight: '#4A8BDF',
  dark: '#010326',
  accent: '#040DBF',
  surface: '#1A1F2E',
  surfaceLight: '#2A2F3E',
  text: '#FFFFFF',
  textSecondary: '#B0B8CC',
  border: '#374151'
};

const GRADIENTS_3D = {
  primary: `linear-gradient(135deg, ${COLOR_PALETTE.primary} 0%, ${COLOR_PALETTE.primaryDark} 50%, ${COLOR_PALETTE.primary} 100%)`,
  primaryHover: `linear-gradient(135deg, ${COLOR_PALETTE.primaryDark} 0%, ${COLOR_PALETTE.primary} 50%, ${COLOR_PALETTE.primaryDark} 100%)`,
  surface: `linear-gradient(135deg, ${COLOR_PALETTE.surface} 0%, ${COLOR_PALETTE.surfaceLight} 50%, ${COLOR_PALETTE.surface} 100%)`,
  surfaceHover: `linear-gradient(135deg, ${COLOR_PALETTE.surfaceLight} 0%, #3A3F4E 50%, ${COLOR_PALETTE.surfaceLight} 100%)`,
  success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  glassHover: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
  modal: 'linear-gradient(135deg, #0A0E1A 0%, #1A1F2E 50%, #0A0E1A 100%)'
};

const SHADOWS_3D = {
  light: '0 2px 4px rgba(0,0,0,0.1)',
  medium: '0 4px 16px rgba(0,0,0,0.2)',
  heavy: '0 8px 32px rgba(0,0,0,0.3)',
  floating: '0 12px 50px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  button: '0 4px 12px rgba(31,100,191,0.3), 0 2px 4px rgba(0,0,0,0.2)',
  buttonHover: '0 6px 20px rgba(31,100,191,0.4), 0 4px 8px rgba(0,0,0,0.3)'
};

const BORDERS = {
  radius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xlarge: '16px',
    xxlarge: '24px'
  }
};

const TRANSITIONS = {
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
};

// Componente para manejar imágenes con carga asíncrona
const KonvaImageElement = ({ imageUrl, image, ...props }) => {
  const [imageState, setImageState] = useState(null);

  useEffect(() => {
    // Priorizar imageUrl, pero también manejar image directamente
    const imageSource = imageUrl || image;
    
    console.log('🖼️ [KonvaImageElement] Procesando imagen:', {
      hasImageUrl: !!imageUrl,
      hasImage: !!image,
      imageSourceType: typeof imageSource,
      isImageElement: imageSource instanceof HTMLImageElement,
      sourcePreview: typeof imageSource === 'string' ? imageSource.substring(0, 50) + '...' : 'N/A'
    });
    
    if (imageSource && !imageState) {
      // Si ya es un objeto Image, usarlo directamente
      if (imageSource instanceof HTMLImageElement) {
        console.log('🖼️ [KonvaImageElement] Usando imagen HTMLImageElement existente');
        setImageState(imageSource);
        return;
      }
      
      // Si es una URL (string), cargarla
      if (typeof imageSource === 'string') {
        console.log('🖼️ [KonvaImageElement] Cargando imagen desde URL:', imageSource.substring(0, 50) + '...');
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          console.log('🖼️ [KonvaImageElement] Imagen cargada exitosamente:', {
            source: imageSource.substring(0, 50) + '...',
            width: img.width,
            height: img.height,
            isImageElement: img instanceof HTMLImageElement
          });
          setImageState(img);
        };
        img.onerror = (error) => {
          console.error('🖼️ [KonvaImageElement] Error cargando imagen:', {
            source: imageSource.substring(0, 50) + '...',
            error
          });
        };
        img.src = imageSource;
      } else {
        console.warn('🖼️ [KonvaImageElement] Tipo de imagen no soportado:', typeof imageSource);
      }
    }
  }, [imageUrl, image, imageState]);

  // Solo renderizar si tenemos una imagen válida HTMLImageElement
  if (!imageState && !image) {
    console.log('🖼️ [KonvaImageElement] No hay imagen válida, mostrando placeholder');
    return (
      <Rect
        {...props}
        fill="#f0f0f0"
        stroke="#ccc"
        strokeWidth={1}
        dash={[5, 5]}
      />
    );
  }

  const finalImage = imageState || image;
  console.log('🖼️ [KonvaImageElement] Renderizando imagen:', {
    hasImage: !!finalImage,
    isImageElement: finalImage instanceof HTMLImageElement,
    imageType: typeof finalImage
  });

  // ✅ VALIDACIÓN CRÍTICA: Solo renderizar si es HTMLImageElement
  if (!(finalImage instanceof HTMLImageElement)) {
    console.warn('🖼️ [KonvaImageElement] Imagen no es HTMLImageElement, mostrando placeholder:', {
      imageType: typeof finalImage,
      isImageElement: finalImage instanceof HTMLImageElement,
      hasImage: !!finalImage
    });
    return (
      <Rect
        {...props}
        fill="#f0f0f0"
        stroke="#ccc"
        strokeWidth={1}
        dash={[5, 5]}
      />
    );
  }

  return (
    <Image
      {...props}
      image={finalImage}
    />
  );
};

/**
 * Viewer de diseños usando Konva.js
 * Compatible con el formato de datos del backend existente
 */
const KonvaDesignViewer = ({ 
  isOpen, 
  onClose, 
  design, 
  product, 
  enableDownload = true 
}) => {
  // ✅ CORREGIDO: Extraer productColorFilter del diseño
  const productColorFilter = design?.productColorFilter || null;
  // console.log('🎨 [KonvaDesignViewer] Componente montado con props:', { isOpen, design, product });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const stageRef = useRef();
  const layerRef = useRef();
  const containerRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [customizationAreas, setCustomizationAreas] = useState([]);
  const [elements, setElements] = useState([]);

  // ✅ UNIFICADO: Usar hook compartido para centrado del canvas
  const {
    stageScale,
    stagePosition
  } = useUnifiedCanvasCentering(productImage?.image, containerRef);

  // Configuración del stage - usar constantes compartidas
  const stageConfig = useMemo(() => ({
    width: CANVAS_CONFIG.width,
    height: CANVAS_CONFIG.height,
    backgroundColor: CANVAS_CONFIG.backgroundColor
  }), []);

  // ==================== CARGA DE IMAGEN DEL PRODUCTO ====================

  const loadProductImage = useCallback(async () => {
    if (!product?.images?.main) {
      console.log('🖼️ [KonvaDesignViewer] No hay imagen principal del producto');
      return;
    }


    try {
      const imageObj = new window.Image();
      imageObj.crossOrigin = 'anonymous';
      
      imageObj.onload = () => {

        // ✅ UNIFICADO: Usar la misma lógica que los editores
        const scaleX = CANVAS_CONFIG.width / imageObj.width;
        const scaleY = CANVAS_CONFIG.height / imageObj.height;
        const scale = Math.min(scaleX, scaleY) * CANVAS_CONFIG.productScale;
        
        const scaledDimensions = calculateScaledDimensions(imageObj.width, imageObj.height, scale);

        const productImageData = {
          image: imageObj,
          x: scaledDimensions.x,
          y: scaledDimensions.y,
          width: scaledDimensions.width,
          height: scaledDimensions.height
        };


        setProductImage(productImageData);
      };

      imageObj.onerror = (error) => {
        console.error('🖼️ [KonvaDesignViewer] Error cargando imagen del producto:', {
          src: product.images.main,
          error
        });
        setError('Error cargando imagen del producto');
      };

      imageObj.src = product.images.main;
    } catch (error) {
      console.error('🖼️ [KonvaDesignViewer] Error en loadProductImage:', error);
      setError('Error cargando imagen del producto');
    }
  }, [product]);

  // ==================== CARGA DE ÁREAS DE PERSONALIZACIÓN ====================

  const loadCustomizationAreas = useCallback(() => {
    if (!product?.customizationAreas) return;

    const areas = product.customizationAreas.map(area => {
      // ✅ UNIFICADO: Usar la función compartida sin escalado adicional
      const scaledArea = scaleCustomizationArea(area, 1);

      return {
        id: area._id || area.id,
        name: area.name,
        ...scaledArea, // x, y, width, height (coordenadas originales)
        stroke: '#10B981',
        strokeWidth: 2,
        dash: [6, 6]
      };
    });

    setCustomizationAreas(areas);
  }, [product]);

  // ==================== CARGA DE ELEMENTOS DEL DISEÑO ====================

  const loadDesignElements = useCallback(() => {
    const designElements = design?.elements || [];
    
    if (designElements.length === 0) {
      console.log('🎨 [KonvaDesignViewer] No hay elementos de diseño para cargar');
      setElements([]);
      return;
    }

    console.log('🎨 [KonvaDesignViewer] Cargando elementos del diseño:', designElements.length);

    // ✅ UNIFICADO: Usar coordenadas originales (el escalado se maneja a nivel del stage)
    const scaleFactor = 1; // No escalado adicional
    const offsetX = 0; // No offset adicional
    const offsetY = 0; // No offset adicional

    const konvaElements = designElements.map((element, index) => {
      const { konvaAttrs, type, areaId } = element;
      
      // ✅ DEBUGGING: Log del elemento que se está procesando
      console.log('🔄 [KonvaDesignViewer] Procesando elemento del diseño:', {
        index,
        id: element._id,
        type,
        areaId,
        konvaAttrs: {
          x: konvaAttrs.x,
          y: konvaAttrs.y,
          width: konvaAttrs.width,
          height: konvaAttrs.height,
          radius: konvaAttrs.radius,
          points: konvaAttrs.points,
          fill: konvaAttrs.fill,
          stroke: konvaAttrs.stroke,
          strokeWidth: konvaAttrs.strokeWidth,
          hasImage: !!konvaAttrs.image,
          hasImageUrl: !!konvaAttrs.imageUrl,
          // ✅ DEBUGGING: Transformaciones del backend
          rotation: konvaAttrs.rotation,
          scaleX: konvaAttrs.scaleX,
          scaleY: konvaAttrs.scaleY,
          offsetX: konvaAttrs.offsetX,
          offsetY: konvaAttrs.offsetY
        }
      });
      
      // ✅ DEBUGGING: Log específico para texto
      if (type === 'text') {
        console.log('🔍 [KonvaDesignViewer] Procesando texto:', {
          index,
          id: element._id,
          text: konvaAttrs.text,
          fontFamily: konvaAttrs.fontFamily,
          fontSize: konvaAttrs.fontSize,
          fontWeight: konvaAttrs.fontWeight,
          fontStyle: konvaAttrs.fontStyle,
          textDecoration: konvaAttrs.textDecoration,
          fill: konvaAttrs.fill,
          stroke: konvaAttrs.stroke,
          strokeWidth: konvaAttrs.strokeWidth,
          align: konvaAttrs.align,
          verticalAlign: konvaAttrs.verticalAlign,
          lineHeight: konvaAttrs.lineHeight,
          letterSpacing: konvaAttrs.letterSpacing,
          padding: konvaAttrs.padding
        });
      }
      
      // ✅ CORRECCIÓN: Usar coordenadas originales sin escalado adicional
      const scaledX = konvaAttrs.x || 50;
      const scaledY = konvaAttrs.y || 50;
      
      const baseElement = {
        id: element._id || `element-${Date.now()}-${index}`,
        name: `${type}-${index}`,
        elementType: type,
        areaId: areaId || '',
        
        // Coordenadas escaladas
        x: scaledX,
        y: scaledY,
        opacity: konvaAttrs.opacity ?? 1,
        
        // ✅ CORRECCIÓN CRÍTICA: Aplicar transformaciones del backend
        rotation: konvaAttrs.rotation || 0,
        scaleX: konvaAttrs.scaleX || 1,
        scaleY: konvaAttrs.scaleY || 1,
        offsetX: konvaAttrs.offsetX || 0,
        offsetY: konvaAttrs.offsetY || 0,
        
        // Propiedades específicas por tipo
        ...(type === 'text' && {
          text: konvaAttrs.text || 'Texto',
          fontSize: konvaAttrs.fontSize || 24, // ✅ CORRECCIÓN: Sin escalado adicional
          fontFamily: konvaAttrs.fontFamily || 'Arial',
          fontWeight: konvaAttrs.fontWeight || 'normal',
          fontStyle: konvaAttrs.fontStyle || 'normal',
          textDecoration: konvaAttrs.textDecoration || 'none',
          fill: konvaAttrs.fill || '#000000',
          stroke: konvaAttrs.stroke || 'transparent',
          strokeWidth: konvaAttrs.strokeWidth || 0, // ✅ CORRECCIÓN: Sin escalado adicional
          width: konvaAttrs.width || 200, // ✅ CORRECCIÓN: Sin escalado adicional
          height: konvaAttrs.height || 50, // ✅ CORRECCIÓN: Sin escalado adicional
          align: konvaAttrs.align || 'left',
          verticalAlign: konvaAttrs.verticalAlign || 'top',
          lineHeight: konvaAttrs.lineHeight || 1.2,
          letterSpacing: konvaAttrs.letterSpacing || 0, // ✅ CORRECCIÓN: Sin escalado adicional
          padding: konvaAttrs.padding || 0 // ✅ CORRECCIÓN: Sin escalado adicional
        }),
        
        ...(type === 'rect' && {
          width: (konvaAttrs.width || 100) * scaleFactor,
          height: (konvaAttrs.height || 60) * scaleFactor,
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          cornerRadius: (konvaAttrs.cornerRadius || 0) * scaleFactor
        }),
        
        ...(type === 'circle' && {
          radius: (konvaAttrs.radius || 50) * scaleFactor,
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor
        }),
        
        ...(type === 'image' && {
          width: (konvaAttrs.width || 100) * scaleFactor,
          height: (konvaAttrs.height || 100) * scaleFactor,
          imageUrl: konvaAttrs.imageUrl,
          image: konvaAttrs.image,
          originalName: konvaAttrs.originalName
        }),
        
        ...(type === 'triangle' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [0, 50, 50, 0, 100, 50].map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ),
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: true
        }),
        
        ...(type === 'star' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [],
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: true,
          numPoints: konvaAttrs.numPoints || 5,
          innerRadius: (konvaAttrs.innerRadius || 20) * scaleFactor,
          outerRadius: (konvaAttrs.outerRadius || 40) * scaleFactor
        }),
        
        ...(type === 'customShape' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [],
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: konvaAttrs.closed !== false
        }),
        
        ...(type === 'line' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [0, 0, 100, 0].map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ),
          fill: konvaAttrs.fill || 'transparent',
          stroke: konvaAttrs.stroke || '#1F64BF',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: konvaAttrs.closed || false
        }),
        
        // Formas adicionales del editor
        ...(type === 'square' && {
          width: (konvaAttrs.width || 80) * scaleFactor,
          height: (konvaAttrs.height || 80) * scaleFactor,
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          cornerRadius: (konvaAttrs.cornerRadius || 0) * scaleFactor
        }),
        
        ...(type === 'ellipse' && {
          radius: (konvaAttrs.radius || 50) * scaleFactor,
          scaleX: konvaAttrs.scaleX || 1.2,
          scaleY: konvaAttrs.scaleY || 0.8,
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor
        }),
        
        ...(type === 'heart' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [],
          fill: konvaAttrs.fill || '#FF69B4',
          stroke: konvaAttrs.stroke || '#FF1493',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: true
        }),
        
        ...(type === 'diamond' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [],
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: true
        }),
        
        ...(type === 'hexagon' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [],
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: true
        }),
        
        ...(type === 'octagon' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [],
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: true
        }),
        
        ...(type === 'pentagon' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [],
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: true
        }),
        
        ...(type === 'polygon' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [],
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: konvaAttrs.closed !== false,
          tension: konvaAttrs.tension || 0
        }),
        
        ...(type === 'shape' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [],
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: konvaAttrs.closed !== false,
          tension: konvaAttrs.tension || 0
        }),
        
        ...(type === 'path' && {
          points: konvaAttrs.points ? konvaAttrs.points.map((point, i) => 
            i % 2 === 0 ? point * scaleFactor : point * scaleFactor
          ) : [],
          fill: konvaAttrs.fill || 'transparent',
          stroke: konvaAttrs.stroke || '#1F64BF',
          strokeWidth: (konvaAttrs.strokeWidth || 2) * scaleFactor,
          closed: konvaAttrs.closed || false,
          tension: konvaAttrs.tension || 0
        })
      };

      console.log('🔄 [KonvaDesignViewer] Elemento escalado:', {
        original: { x: konvaAttrs.x, y: konvaAttrs.y, width: konvaAttrs.width, height: konvaAttrs.height },
        scaled: { x: scaledX, y: scaledY, width: baseElement.width, height: baseElement.height },
        scaleFactor,
        offset: { x: offsetX, y: offsetY },
        // ✅ DEBUGGING: Transformaciones aplicadas
        transformations: {
          rotation: baseElement.rotation,
          scaleX: baseElement.scaleX,
          scaleY: baseElement.scaleY,
          offsetX: baseElement.offsetX,
          offsetY: baseElement.offsetY
        }
      });
      
      // ✅ DEBUGGING: Log específico para texto después de crear baseElement
      if (type === 'text') {
        console.log('🔍 [KonvaDesignViewer] BaseElement texto creado:', {
          index,
          id: element._id,
          text: baseElement.text,
          fontFamily: baseElement.fontFamily,
          fontSize: baseElement.fontSize,
          fontWeight: baseElement.fontWeight,
          fontStyle: baseElement.fontStyle,
          textDecoration: baseElement.textDecoration,
          fill: baseElement.fill,
          stroke: baseElement.stroke,
          strokeWidth: baseElement.strokeWidth,
          align: baseElement.align,
          verticalAlign: baseElement.verticalAlign,
          lineHeight: baseElement.lineHeight,
          letterSpacing: baseElement.letterSpacing,
          padding: baseElement.padding
        });
      }

      return baseElement;
    });

    setElements(konvaElements);
  }, [design, productImage]);

  // ==================== RENDERIZADO DE ELEMENTOS ====================

  const renderElement = useCallback((element) => {
    console.log('🎨 [KonvaDesignViewer] renderElement llamado:', {
      id: element.id,
      elementType: element.elementType,
      x: element.x,
      y: element.y,
      hasPoints: !!element.points,
      pointsLength: element.points?.length,
      hasWidth: !!element.width,
      hasHeight: !!element.height,
      hasRadius: !!element.radius,
      fill: element.fill,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth
    });

    const commonProps = {
      key: element.id,
      id: element.id,
      name: element.name,
      x: element.x,
      y: element.y,
      listening: false, // No interactivo en el viewer
      
      // ✅ CORRECCIÓN CRÍTICA: Aplicar transformaciones a los componentes de Konva
      rotation: element.rotation || 0,
      scaleX: element.scaleX || 1,
      scaleY: element.scaleY || 1,
      offsetX: element.offsetX || 0,
      offsetY: element.offsetY || 0,
      opacity: element.opacity || 1
    };

    // ✅ DEBUGGING: Log de transformaciones aplicadas a Konva
    console.log('🎨 [KonvaDesignViewer] Renderizando elemento con transformaciones:', {
      elementId: element.id,
      elementType: element.elementType,
      commonProps: {
        x: commonProps.x,
        y: commonProps.y,
        rotation: commonProps.rotation,
        scaleX: commonProps.scaleX,
        scaleY: commonProps.scaleY,
        offsetX: commonProps.offsetX,
        offsetY: commonProps.offsetY,
        opacity: commonProps.opacity
      }
    });

    switch (element.elementType) {
      case 'text':
        return (
          <Text
            {...commonProps}
            text={element.text}
            fontSize={element.fontSize}
            fontFamily={element.fontFamily}
            fill={element.fill}
            width={element.width}
            height={element.height}
            align={element.align || 'left'}
            verticalAlign={element.verticalAlign || 'top'}
            fontWeight={element.fontWeight || 'normal'}
            fontStyle={element.fontStyle || 'normal'}
            textDecoration={element.textDecoration || ''}
          />
        );

      case 'rect':
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            cornerRadius={element.cornerRadius}
          />
        );

      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );

      case 'image':
        return (
          <KonvaImageElement
            {...commonProps}
            width={element.width}
            height={element.height}
            imageUrl={element.imageUrl}
            image={element.image}
            opacity={element.opacity}
          />
        );

      case 'triangle':
        return (
          <Line
            {...commonProps}
            points={element.points}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            closed={true}
            lineCap={element.lineCap || 'round'}
            lineJoin={element.lineJoin || 'round'}
          />
        );

      case 'star':
        return (
          <Line
            {...commonProps}
            points={element.points}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            closed={true}
            lineCap={element.lineCap || 'round'}
            lineJoin={element.lineJoin || 'round'}
          />
        );

      case 'customShape':
        return (
          <Line
            {...commonProps}
            points={element.points}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            closed={element.closed !== false}
            lineCap={element.lineCap || 'round'}
            lineJoin={element.lineJoin || 'round'}
          />
        );

      case 'line':
        return (
          <Line
            {...commonProps}
            points={element.points}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            closed={element.closed || false}
            lineCap={element.lineCap || 'round'}
            lineJoin={element.lineJoin || 'round'}
            dash={element.dash}
          />
        );

      // Formas adicionales del editor
      case 'square':
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            cornerRadius={element.cornerRadius}
          />
        );

      case 'ellipse':
        return (
          <Circle
            {...commonProps}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            scaleX={element.scaleX}
            scaleY={element.scaleY}
          />
        );

      case 'heart':
      case 'diamond':
      case 'hexagon':
      case 'octagon':
      case 'pentagon':
      case 'polygon':
      case 'shape':
      case 'path':
        return (
          <Line
            {...commonProps}
            points={element.points}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            closed={element.closed !== false}
            lineCap={element.lineCap || 'round'}
            lineJoin={element.lineJoin || 'round'}
            tension={element.tension || 0}
            dash={element.dash}
          />
        );

      default:
        console.warn(`[KonvaDesignViewer] Tipo de elemento no soportado: ${element.elementType}`);
        return null;
    }
  }, []);

  // ==================== EFECTOS ====================

  useEffect(() => {
    if (!isOpen) {
      setElements([]);
      setProductImage(null);
      setCustomizationAreas([]);
      setError(null);
      return;
    }

    if (!design || !product) {
      console.log('🎨 [KonvaDesignViewer] Esperando datos del diseño y producto...');
      return;
    }

    console.log('🎨 [KonvaDesignViewer] Modal abierto, cargando contenido...');
    setIsLoading(true);
    setError(null);

    // Cargar todo el contenido
    const loadContent = async () => {
      try {
        await loadProductImage();
        loadCustomizationAreas();
        loadDesignElements();
        console.log('✅ [KonvaDesignViewer] Contenido cargado exitosamente');
      } catch (error) {
        console.error('❌ [KonvaDesignViewer] Error cargando contenido:', error);
        setError('Error al cargar la vista previa del diseño');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [isOpen, design?.id, product?.id]); // Remover las funciones de las dependencias

  // ==================== DESCARGA ====================

  const handleDownload = useCallback(() => {
    if (!stageRef.current) {
      console.error('Stage no disponible para descarga');
      return;
    }

    try {
      console.log('Iniciando descarga...');
      
      // Generar imagen en alta resolución
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1.0,
        pixelRatio: 2
      });
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `diseno-${design?.name || design?.id || 'preview'}-${Date.now()}.png`;
      
      // Simular clic para descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Descarga completada');

    } catch (error) {
      console.error('Error en descarga:', error);
      alert('Error al descargar la imagen');
    }
  }, [design]);

  const handleClose = useCallback(() => {
    setElements([]);
    setProductImage(null);
    setCustomizationAreas([]);
    setError(null);
    onClose();
  }, [onClose]);

  // console.log('🎨 [KonvaDesignViewer] Renderizando componente:', { isOpen, isLoading, error });
  
  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      maxWidth={false} 
      fullWidth
      style={{ zIndex: 5000 }}
      PaperProps={{
        sx: {
          width: isMobile ? '100vw' : '95vw',
          height: isMobile ? '100vh' : '90vh',
          maxWidth: isMobile ? 'none' : '1400px',
          maxHeight: isMobile ? 'none' : '900px',
          borderRadius: isMobile ? 0 : BORDERS.radius.xxlarge,
          overflow: 'hidden',
          zIndex: 5000,
          margin: isMobile ? 0 : 'auto',
          background: GRADIENTS_3D.modal,
          border: `1px solid ${COLOR_PALETTE.border}`,
          boxShadow: isMobile ? 'none' : SHADOWS_3D.floating,
          backdropFilter: 'blur(20px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 1
          }
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: GRADIENTS_3D.primary,
          color: COLOR_PALETTE.white,
          py: isMobile ? 2 : 2.5,
          px: isMobile ? 2.5 : 3.5,
          position: 'relative',
          zIndex: 2,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1.5 : 2 }}>
          <Box sx={{
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            borderRadius: BORDERS.radius.medium,
            background: GRADIENTS_3D.glass,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid rgba(255,255,255,0.2)`
          }}>
            <Download size={isMobile ? 16 : 20} />
          </Box>
          <Box>
            <Typography 
              variant={isMobile ? 'subtitle1' : 'h6'} 
              fontWeight={700}
              sx={{ 
                fontSize: isMobile ? '1rem' : '1.25rem',
                maxWidth: isMobile ? '200px' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Vista Previa del Diseño
            </Typography>
            {design?.name && !isMobile && (
              <Typography variant="body2" sx={{ 
                opacity: 0.9,
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                {design.name}
              </Typography>
            )}
          </Box>
        </Box>
        
        <IconButton 
          onClick={handleClose}
          size={isMobile ? 'small' : 'medium'}
          sx={{ 
            color: COLOR_PALETTE.white,
            background: GRADIENTS_3D.glass,
            backdropFilter: 'blur(10px)',
            border: `1px solid rgba(255,255,255,0.2)`,
            transition: TRANSITIONS.fast,
            '&:hover': { 
              background: GRADIENTS_3D.glassHover,
              transform: 'scale(1.05)',
              boxShadow: SHADOWS_3D.light
            },
            '&:active': {
              transform: 'scale(0.95)'
            }
          }}
        >
          <CloseIcon size={isMobile ? 18 : 20} />
        </IconButton>
      </DialogTitle>

      <DialogContent 
        sx={{ 
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          background: GRADIENTS_3D.surface,
          height: '100%',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Área del canvas */}
        <Box 
          ref={containerRef}
          sx={{ 
            flex: 1,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            p: isMobile ? 2 : isTablet ? 3 : 4,
            position: 'relative',
            minHeight: isMobile ? '300px' : '500px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)'
          }}
        >
          {isLoading && (
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                zIndex: 3010
              }}
            >
              <CircularProgress size={40} sx={{ color: '#1F64BF' }} />
              <Typography variant="body2" color="text.secondary">
                Cargando vista previa...
              </Typography>
            </Box>
          )}

          {error && (
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'error.main',
                zIndex: 3020 // Z-index alto para estar por encima de todo
              }}
            >
              <Typography variant="body1" gutterBottom>
                {error}
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
                sx={{ mt: 2 }}
              >
                Reintentar
              </Button>
            </Box>
          )}

          {!isLoading && !error && (!design?.elements || design.elements.length === 0) && (
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'text.secondary',
                p: 4
              }}
            >
              <Typography variant="h6" gutterBottom>
                No hay elementos en este diseño
              </Typography>
              <Typography variant="body2">
                Los elementos del diseño aparecerán aquí cuando estén disponibles
              </Typography>
            </Box>
          )}

          <Stage
            ref={stageRef}
            width={stageConfig.width}
            height={stageConfig.height}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stagePosition.x}
            y={stagePosition.y}
            style={{
              border: `1px solid ${COLOR_PALETTE.border}`,
              borderRadius: BORDERS.radius.large,
              boxShadow: SHADOWS_3D.floating,
              backgroundColor: COLOR_PALETTE.white,
              opacity: isLoading ? 0.5 : 1,
              transition: TRANSITIONS.normal,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                borderRadius: 'inherit',
                pointerEvents: 'none',
                zIndex: 1
              }
            }}
          >
            <Layer ref={layerRef}>
              {/* Imagen del producto con máscara de color */}
              {productImage && productImage.image && (() => {
                
                // ✅ CORREGIDO: Aplicar máscara de color si existe
                if (productColorFilter) {
                  // Crear máscara automática para tintado selectivo
                  const createProductMask = () => {
                    if (!productImage.image) return null;
                    
                    // Crear un canvas temporal para analizar la imagen
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = productImage.image.width;
                    canvas.height = productImage.image.height;
                    
                    // Dibujar la imagen en el canvas
                    ctx.drawImage(productImage.image, 0, 0);
                    
                    // Obtener los datos de píxeles
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    // Crear máscara: detectar píxeles que no sean fondo blanco
                    const maskData = new Uint8ClampedArray(data.length);
                    
                    for (let i = 0; i < data.length; i += 4) {
                      const r = data[i];
                      const g = data[i + 1];
                      const b = data[i + 2];
                      const a = data[i + 3];
                      
                      // ✅ MUY ESTRICTO: Solo colorear píxeles que claramente son del producto
                      let isProduct = false;
                      
                      if (a < 20) {
                        // Píxeles completamente transparentes - NO colorear
                        isProduct = false;
                      } else if (r > 250 && g > 250 && b > 250) {
                        // Píxeles casi blancos puros - NO colorear (fondo)
                        isProduct = false;
                      } else if (r < 30 && g < 30 && b < 30) {
                        // Píxeles muy oscuros - NO colorear (sombras del fondo)
                        isProduct = false;
                      } else {
                        // Píxeles con color medio - SÍ colorear (producto)
                        isProduct = true;
                      }
                      
                      if (isProduct) {
                        // Producto: usar el color seleccionado
                        const hexToRgb = (hex) => {
                          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                          return result ? {
                            r: parseInt(result[1], 16),
                            g: parseInt(result[2], 16),
                            b: parseInt(result[3], 16)
                          } : { r: 255, g: 255, b: 255 };
                        };
                        
                        const colorRgb = hexToRgb(productColorFilter);
                        maskData[i] = colorRgb.r;     // R
                        maskData[i + 1] = colorRgb.g; // G
                        maskData[i + 2] = colorRgb.b; // B
                        maskData[i + 3] = 255;        // A
                      } else {
                        // Fondo: transparente
                        maskData[i] = 0;     // R
                        maskData[i + 1] = 0; // G
                        maskData[i + 2] = 0; // B
                        maskData[i + 3] = 0; // A
                      }
                    }
                    
                    // Crear nueva imagen con la máscara
                    const maskImageData = new ImageData(maskData, canvas.width, canvas.height);
                    ctx.putImageData(maskImageData, 0, 0);
                    
                    // Convertir canvas a imagen
                    const maskImage = new window.Image();
                    maskImage.src = canvas.toDataURL();
                    
                    return maskImage;
                  };
                  
                  const maskImage = createProductMask();
                  
                  return (
                    <>
                      {/* Imagen base */}
                      <Image
                        image={productImage.image}
                        x={productImage.x}
                        y={productImage.y}
                        width={productImage.width}
                        height={productImage.height}
                        listening={false}
                      />
                      {/* Máscara de color que solo afecta al producto */}
                      {maskImage && (
                        <Image
                          image={maskImage}
                          x={productImage.x}
                          y={productImage.y}
                          width={productImage.width}
                          height={productImage.height}
                          globalCompositeOperation="multiply"
                          opacity={0.8}
                          listening={false}
                        />
                      )}
                    </>
                  );
                } else {
                  // Sin color: renderizar imagen normal
                  return (
                    <Image
                      image={productImage.image}
                      x={productImage.x}
                      y={productImage.y}
                      width={productImage.width}
                      height={productImage.height}
                      listening={false}
                    />
                  );
                }
              })()}

              {/* Áreas de personalización */}
              {customizationAreas.map(area => (
                <Rect
                  key={area.id}
                  {...area}
                  fill="transparent"
                  listening={false}
                />
              ))}

              {/* Elementos del diseño */}
              {elements.map(renderElement)}
            </Layer>
          </Stage>
        </Box>

        {/* Información del diseño */}
        {(design?.elements?.length > 0 || product?.name) && (
          <Box 
            sx={{ 
              borderTop: `1px solid ${COLOR_PALETTE.border}`,
              background: GRADIENTS_3D.surface,
              p: isMobile ? 2 : 3,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${COLOR_PALETTE.border}, transparent)`
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                {product?.name && (
                  <Typography variant="body2" sx={{ 
                    color: COLOR_PALETTE.textSecondary,
                    fontWeight: 600,
                    mb: 0.5
                  }}>
                    Producto: {product.name}
                  </Typography>
                )}
                {design?.elements && (
                  <Typography variant="caption" sx={{ 
                    color: COLOR_PALETTE.textSecondary,
                    display: 'block',
                    mb: 0.5
                  }}>
                    {design.elements.length} elemento(s) de diseño
                  </Typography>
                )}
                {design?.name && (
                  <Typography variant="caption" sx={{ 
                    color: COLOR_PALETTE.textSecondary,
                    display: 'block',
                    mb: 0.5
                  }}>
                    Diseño: {design.name}
                  </Typography>
                )}
                {design?.user?.name && (
                  <Typography variant="caption" sx={{ 
                    color: COLOR_PALETTE.textSecondary,
                    display: 'block',
                    mb: 0.5
                  }}>
                    Cliente: {design.user.name}
                  </Typography>
                )}
                {design?.status && (
                  <Typography variant="caption" sx={{ 
                    color: COLOR_PALETTE.textSecondary,
                    display: 'block'
                  }}>
                    Estado: {design.status}
                  </Typography>
                )}
              </Box>

              {enableDownload && (
                <Button 
                  variant="contained"
                  startIcon={<Download size={isMobile ? 16 : 18} />}
                  onClick={handleDownload}
                  disabled={isLoading || error}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ 
                    borderRadius: BORDERS.radius.large,
                    background: GRADIENTS_3D.success,
                    boxShadow: SHADOWS_3D.button,
                    border: `1px solid rgba(255,255,255,0.1)`,
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: TRANSITIONS.fast,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: SHADOWS_3D.buttonHover
                    },
                    '&:active': {
                      transform: 'translateY(0)'
                    },
                    '&:disabled': {
                      opacity: 0.6,
                      transform: 'none'
                    }
                  }}
                >
                  {isMobile ? 'Descargar' : 'Descargar PNG'}
                </Button>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KonvaDesignViewer;
