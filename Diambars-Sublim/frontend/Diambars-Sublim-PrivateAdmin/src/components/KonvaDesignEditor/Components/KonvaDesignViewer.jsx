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
  CircularProgress
} from '@mui/material';
import { X as CloseIcon, Download } from '@phosphor-icons/react';

// Componente para manejar imágenes con carga asíncrona
const KonvaImageElement = ({ imageUrl, image, ...props }) => {
  const [imageState, setImageState] = useState(null);

  useEffect(() => {
    if (imageUrl && !imageState) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setImageState(img);
      img.onerror = () => console.error('Error cargando imagen:', imageUrl);
      img.src = imageUrl;
    }
  }, [imageUrl, imageState]);

  return (
    <Image
      {...props}
      image={imageState || image}
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
  // console.log('🎨 [KonvaDesignViewer] Componente montado con props:', { isOpen, design, product });
  
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
    if (!product?.images?.main) return;

    try {
      const imageObj = new window.Image();
      imageObj.crossOrigin = 'anonymous';
      
      imageObj.onload = () => {
        // ✅ UNIFICADO: Usar la misma lógica que los editores
        const scaleX = CANVAS_CONFIG.width / imageObj.width;
        const scaleY = CANVAS_CONFIG.height / imageObj.height;
        const scale = Math.min(scaleX, scaleY) * CANVAS_CONFIG.productScale;
        
        const scaledDimensions = calculateScaledDimensions(imageObj.width, imageObj.height, scale);

        setProductImage({
          image: imageObj,
          x: scaledDimensions.x,
          y: scaledDimensions.y,
          width: scaledDimensions.width,
          height: scaledDimensions.height
        });
      };

      imageObj.src = product.images.main;
    } catch (error) {
      console.error('Error cargando imagen del producto:', error);
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
      
      // Aplicar escalado y offset a las coordenadas
      const scaledX = (konvaAttrs.x || 50) * scaleFactor + offsetX;
      const scaledY = (konvaAttrs.y || 50) * scaleFactor + offsetY;
      
      const baseElement = {
        id: element._id || `element-${Date.now()}-${index}`,
        name: `${type}-${index}`,
        elementType: type,
        areaId: areaId || '',
        
        // Coordenadas escaladas
        x: scaledX,
        y: scaledY,
        opacity: konvaAttrs.opacity ?? 1,
        
        // Propiedades específicas por tipo
        ...(type === 'text' && {
          text: konvaAttrs.text || 'Texto',
          fontSize: (konvaAttrs.fontSize || 24) * scaleFactor,
          fontFamily: konvaAttrs.fontFamily || 'Arial',
          fill: konvaAttrs.fill || '#000000',
          width: (konvaAttrs.width || 200) * scaleFactor,
          height: (konvaAttrs.height || 50) * scaleFactor
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
        })
      };

      console.log('🔄 [KonvaDesignViewer] Elemento escalado:', {
        original: { x: konvaAttrs.x, y: konvaAttrs.y, width: konvaAttrs.width, height: konvaAttrs.height },
        scaled: { x: scaledX, y: scaledY, width: baseElement.width, height: baseElement.height },
        scaleFactor,
        offset: { x: offsetX, y: offsetY }
      });

      return baseElement;
    });

    setElements(konvaElements);
  }, [design, productImage]);

  // ==================== RENDERIZADO DE ELEMENTOS ====================

  const renderElement = useCallback((element) => {
    const commonProps = {
      key: element.id,
      id: element.id,
      name: element.name,
      x: element.x,
      y: element.y,
      listening: false // No interactivo en el viewer
    };

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
      style={{ zIndex: 10100 }}
      PaperProps={{
        sx: {
          width: '95vw',
          height: '90vh',
          maxWidth: '1200px',
          maxHeight: '800px',
          borderRadius: '16px',
          overflow: 'hidden',
          zIndex: 10101
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
          color: 'white',
          py: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Vista Previa del Diseño (Konva)
          </Typography>
          {design?.name && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {design.name}
            </Typography>
          )}
        </Box>
        
        <IconButton 
          onClick={handleClose}
          sx={{ 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <CloseIcon size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent 
        sx={{ 
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F8F9FA'
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
            p: 3,
            position: 'relative',
            minHeight: '500px'
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
                zIndex: 10110
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
                zIndex: 10120 // Z-index alto para estar por encima de todo
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
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'white',
              opacity: isLoading ? 0.5 : 1,
              transition: 'opacity 0.3s ease'
            }}
          >
            <Layer ref={layerRef}>
              {/* Imagen del producto */}
              {productImage && (
                <Image
                  image={productImage.image}
                  x={productImage.x}
                  y={productImage.y}
                  width={productImage.width}
                  height={productImage.height}
                  listening={false}
                />
              )}

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
              borderTop: '1px solid #e0e0e0',
              backgroundColor: 'white',
              p: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                {product?.name && (
                  <Typography variant="body2" color="text.secondary">
                    Producto: {product.name}
                  </Typography>
                )}
                {design?.elements && (
                  <Typography variant="caption" color="text.secondary">
                    {design.elements.length} elemento(s) de diseño
                  </Typography>
                )}
                {design?.name && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Diseño: {design.name}
                  </Typography>
                )}
                {design?.user?.name && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Cliente: {design.user.name}
                  </Typography>
                )}
                {design?.status && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Estado: {design.status}
                  </Typography>
                )}
              </Box>

              {enableDownload && (
                <Button 
                  variant="contained"
                  startIcon={<Download size={16} />}
                  onClick={handleDownload}
                  disabled={isLoading || error}
                  sx={{ 
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    }
                  }}
                >
                  Descargar PNG
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
