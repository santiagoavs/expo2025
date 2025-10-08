// components/designs/KonvaDesignViewer.jsx - KONVA DESIGN VIEWER (CSS VERSION)
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image, Line, RegularPolygon } from 'react-konva';
import { CANVAS_CONFIG, scaleCustomizationArea, calculateScaledDimensions } from '../../utils/canvasConfig';
import { useUnifiedCanvasCentering } from '../../hooks/useUnifiedCanvasCentering';
import './KonvaDesignViewer.css';
import Swal from 'sweetalert2';

// Componente para manejar imágenes con carga asíncrona
const KonvaImageElement = ({ imageUrl, image, ...props }) => {
  const [imageState, setImageState] = useState(null);

  useEffect(() => {
    const imageSource = imageUrl || image;
    
    if (imageSource && !imageState) {
      if (imageSource instanceof HTMLImageElement) {
        setImageState(imageSource);
        return;
      }
      
      if (typeof imageSource === 'string') {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setImageState(img);
        };
        img.onerror = (error) => {
          console.error('Error cargando imagen:', error);
        };
        img.src = imageSource;
      }
    }
  }, [imageUrl, image, imageState]);

  if (!imageState && !image) {
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
  
  if (!(finalImage instanceof HTMLImageElement)) {
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
 * Viewer de diseños usando Konva.js con CSS tradicional
 * Compatible con el formato de datos del backend existente
 */
const KonvaDesignViewer = ({ 
  design, 
  product, 
  enableDownload = true,
  onDownload 
}) => {
  const productColorFilter = design?.productColorFilter || null;
  
  const stageRef = useRef();
  const layerRef = useRef();
  const containerRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [customizationAreas, setCustomizationAreas] = useState([]);
  const [elements, setElements] = useState([]);

  // Hook unificado para centrado del canvas
  const {
    stageScale,
    stagePosition,
    stageConfig
  } = useUnifiedCanvasCentering(productImage?.image, containerRef);

  // ==================== CARGA DE IMAGEN DEL PRODUCTO ====================

  const loadProductImage = useCallback(async () => {
    console.log('🖼️ [KonvaDesignViewer] loadProductImage called with:', {
      product,
      hasProduct: !!product,
      hasImages: !!product?.images,
      hasMain: !!product?.images?.main,
      hasImage: !!product?.image,
      mainImage: product?.images?.main,
      image: product?.image
    });
    
    // Handle both data structures: product.images.main (private admin) or product.image (public)
    const productImageUrl = product?.images?.main || product?.image;
    
    if (!productImageUrl) {
      console.log('🖼️ [KonvaDesignViewer] No hay imagen principal del producto');
      return;
    }

    try {
      const imageObj = new window.Image();
      imageObj.crossOrigin = 'anonymous';
      
      imageObj.onload = () => {
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
        console.error('Error cargando imagen del producto:', {
          src: productImageUrl,
          error
        });
        setError('Error cargando imagen del producto');
      };

      imageObj.src = productImageUrl;
    } catch (error) {
      console.error('Error en loadProductImage:', error);
      setError('Error cargando imagen del producto');
    }
  }, [product]);

  // ==================== CARGA DE ÁREAS DE PERSONALIZACIÓN ====================

  const loadCustomizationAreas = useCallback(() => {
    if (!product?.customizationAreas) return;

    const areas = product.customizationAreas.map(area => {
      const scaledArea = scaleCustomizationArea(area, 1);
      
      return {
        id: area._id || area.id,
        name: area.name,
        ...scaledArea,
        stroke: '#10B981',
        strokeWidth: 2,
        dash: [6, 6]
      };
    });

    setCustomizationAreas(areas);
  }, [product]);

  // ==================== CARGA DE ELEMENTOS DEL DISEÑO ====================

  const loadDesignElements = useCallback(() => {
    console.log('🎨 [KonvaDesignViewer] loadDesignElements called with:', {
      design,
      hasDesign: !!design,
      hasElements: !!design?.elements,
      elementsLength: design?.elements?.length || 0,
      elements: design?.elements
    });
    
    const designElements = design?.elements || [];
    
    if (designElements.length === 0) {
      console.log('🎨 [KonvaDesignViewer] No hay elementos de diseño para cargar');
      setElements([]);
      return;
    }
    
    console.log('🎨 [KonvaDesignViewer] Cargando elementos del diseño:', designElements.length);

    const konvaElements = designElements.map((element, index) => {
      const { konvaAttrs, type, areaId } = element;
      
      // ✅ VALIDACIÓN: Asegurar que konvaAttrs existe
      if (!konvaAttrs) {
        console.warn(`⚠️ [KonvaDesignViewer] Elemento ${index} sin konvaAttrs:`, element);
        return null;
      }
      

      console.log(`🔄 [KonvaDesignViewer] Procesando elemento ${index}:`, {
        id: element._id,
        type,
        areaId,
        konvaAttrs: {
          x: konvaAttrs?.x,
          y: konvaAttrs?.y,
          width: konvaAttrs?.width,
          height: konvaAttrs?.height,
          fill: konvaAttrs?.fill,
          stroke: konvaAttrs?.stroke,
          strokeWidth: konvaAttrs?.strokeWidth,
          imageUrl: konvaAttrs?.imageUrl,
          text: konvaAttrs?.text,
          points: konvaAttrs?.points,
          pointsLength: konvaAttrs?.points?.length,
          radius: konvaAttrs?.radius,
          rotation: konvaAttrs?.rotation,
          scaleX: konvaAttrs?.scaleX,
          scaleY: konvaAttrs?.scaleY,
          offsetX: konvaAttrs?.offsetX,
          offsetY: konvaAttrs?.offsetY
        }
      });
      
      // ✅ DEBUGGING ESPECÍFICO: Log extra para shapes
      if (type === 'shape' || type === 'hexagon' || type === 'customShape') {
        console.log(`🔶 [KonvaDesignViewer] SHAPE DEBUG - ${type}:`, {
          hasPoints: !!konvaAttrs.points,
          pointsArray: konvaAttrs.points,
          pointsCount: konvaAttrs.points?.length || 0,
          x: konvaAttrs.x,
          y: konvaAttrs.y,
          fill: konvaAttrs.fill,
          stroke: konvaAttrs.stroke
        });
        
      }
      
      const scaledX = konvaAttrs.x || 50;
      const scaledY = konvaAttrs.y || 50;
      
      const baseElement = {
        id: element._id || `element-${Date.now()}-${index}`,
        name: `${type}-${index}`,
        elementType: type,
        areaId: areaId || '',
        
        x: scaledX,
        y: scaledY,
        opacity: konvaAttrs.opacity ?? 1,
        
        rotation: konvaAttrs.rotation || 0,
        scaleX: konvaAttrs.scaleX || 1,
        scaleY: konvaAttrs.scaleY || 1,
        offsetX: konvaAttrs.offsetX || 0,
        offsetY: konvaAttrs.offsetY || 0,
        
        ...(type === 'text' && {
          text: konvaAttrs.text || 'Texto',
          fontSize: konvaAttrs.fontSize || 24,
          fontFamily: konvaAttrs.fontFamily || 'Arial',
          fontWeight: konvaAttrs.fontWeight || 'normal',
          fontStyle: konvaAttrs.fontStyle || 'normal',
          textDecoration: konvaAttrs.textDecoration || 'none',
          fill: konvaAttrs.fill || '#000000',
          stroke: konvaAttrs.stroke || 'transparent',
          strokeWidth: konvaAttrs.strokeWidth || 0,
          width: konvaAttrs.width || 200,
          height: konvaAttrs.height || 50,
          align: konvaAttrs.align || 'left',
          verticalAlign: konvaAttrs.verticalAlign || 'top',
          lineHeight: konvaAttrs.lineHeight || 1.2,
          letterSpacing: konvaAttrs.letterSpacing || 0,
          padding: konvaAttrs.padding || 0
        }),
        
        ...(type === 'rect' && {
          width: konvaAttrs.width || 100,
          height: konvaAttrs.height || 60,
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: konvaAttrs.strokeWidth || 2,
          cornerRadius: konvaAttrs.cornerRadius || 0
        }),
        
        ...(type === 'circle' && {
          radius: konvaAttrs.radius || 50,
          fill: konvaAttrs.fill || '#1F64BF',
          stroke: konvaAttrs.stroke || '#032CA6',
          strokeWidth: konvaAttrs.strokeWidth || 2
        }),
        
        ...(type === 'image' && {
          width: konvaAttrs.width || 100,
          height: konvaAttrs.height || 100,
          imageUrl: konvaAttrs.imageUrl,
          image: konvaAttrs.image,
          originalName: konvaAttrs.originalName
        }),
        
        // ✅ MATCH PRIVATE ADMIN: Universal shape handler for ALL shape types
        ...(['triangle', 'pentagon', 'hexagon', 'octagon', 'star', 'heart', 'diamond', 'polygon', 'custom', 'line', 'shape', 'customShape', 'path', 'square', 'ellipse'].includes(type) && {
          // Handle points-based shapes (most shapes)
          ...(konvaAttrs.points && Array.isArray(konvaAttrs.points) && {
            points: konvaAttrs.points,
            fill: konvaAttrs.fill || '#1F64BF',
            stroke: konvaAttrs.stroke || '#032CA6',
            strokeWidth: konvaAttrs.strokeWidth || 2,
            closed: konvaAttrs.closed !== false,
            lineCap: konvaAttrs.lineCap || 'round',
            lineJoin: konvaAttrs.lineJoin || 'round',
            tension: konvaAttrs.tension || 0,
            
            // Star-specific properties
            ...(konvaAttrs.numPoints && {
              numPoints: konvaAttrs.numPoints,
              innerRadius: konvaAttrs.innerRadius,
              outerRadius: konvaAttrs.outerRadius
            })
          }),
          
          // Handle square (rect-based)
          ...(type === 'square' && {
            width: konvaAttrs.width || 80,
            height: konvaAttrs.height || 80,
            fill: konvaAttrs.fill || '#1F64BF',
            stroke: konvaAttrs.stroke || '#032CA6',
            strokeWidth: konvaAttrs.strokeWidth || 2,
            cornerRadius: konvaAttrs.cornerRadius || 0
          }),
          
          // Handle ellipse (circle-based)
          ...(type === 'ellipse' && {
            radius: konvaAttrs.radius || 50,
            scaleX: konvaAttrs.scaleX || 1.2,
            scaleY: konvaAttrs.scaleY || 0.8,
            fill: konvaAttrs.fill || '#1F64BF',
            stroke: konvaAttrs.stroke || '#032CA6',
            strokeWidth: konvaAttrs.strokeWidth || 2
          }),
          
          // Store metadata for debugging
          originalType: type,
          shapeType: element.shapeType
        })
      };

      return baseElement;
    }).filter(Boolean); // ✅ FILTRAR: Eliminar elementos null/undefined

    console.log('🎨 [KonvaDesignViewer] Elementos procesados:', konvaElements.length);
    setElements(konvaElements);
  }, [design, productImage]);

  // ==================== RENDERIZADO DE ELEMENTOS ====================

  const renderElement = useCallback((element) => {
    console.log('🎨 [KonvaDesignViewer] Renderizando elemento:', {
      id: element.id,
      elementType: element.elementType,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      radius: element.radius,
      points: element.points,
      fill: element.fill,
      stroke: element.stroke
    });

    const commonProps = {
      key: element.id,
      id: element.id,
      name: element.name,
      x: element.x,
      y: element.y,
      listening: false,
      
      rotation: element.rotation || 0,
      scaleX: element.scaleX || 1,
      scaleY: element.scaleY || 1,
      offsetX: element.offsetX || 0,
      offsetY: element.offsetY || 0,
      opacity: element.opacity || 1
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
        // ✅ CORRECCIÓN: Detectar tipo de renderizado para triangle
        if (element._renderType === 'polygon' && element.sides && element.radius) {
          return (
            <RegularPolygon
              {...commonProps}
              sides={element.sides}
              radius={element.radius}
              fill={element.fill}
              stroke={element.stroke}
              strokeWidth={element.strokeWidth}
            />
          );
        } else {
          return (
            <Line
              {...commonProps}
              points={element.points}
              fill={element.fill}
              stroke={element.stroke}
              strokeWidth={element.strokeWidth}
              closed={element.closed !== false}
              lineCap="round"
              lineJoin="round"
              tension={element.tension || 0}
            />
          );
        }

      // ✅ MATCH PRIVATE ADMIN: Universal shape rendering for ALL shape types
      case 'triangle':
      case 'pentagon':
      case 'hexagon':
      case 'octagon':
      case 'star':
      case 'heart':
      case 'diamond':
      case 'polygon':
      case 'custom':
      case 'line':
      case 'shape':
      case 'customShape':
      case 'path':
        console.log(`🔶 [KonvaDesignViewer] Renderizando shape (${element.elementType}):`, {
          originalType: element.originalType,
          shapeType: element.shapeType,
          points: element.points,
          pointsLength: element.points?.length,
          x: element.x,
          y: element.y,
          fill: element.fill,
          stroke: element.stroke,
          strokeWidth: element.strokeWidth
        });
        
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
          />
        );

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

      default:
        console.warn(`Tipo de elemento no soportado: ${element.elementType}`);
        return null;
    }
  }, []);

  // ==================== EFECTOS ====================

  useEffect(() => {
    if (!design || !product) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const loadContent = async () => {
      try {
        await loadProductImage();
        loadCustomizationAreas();
        loadDesignElements();
      } catch (error) {
        console.error('Error cargando contenido:', error);
        setError('Error al cargar la vista previa del diseño');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [design?.id, product?.id, loadProductImage, loadCustomizationAreas, loadDesignElements]);

  // ==================== DESCARGA ====================

  const handleDownload = useCallback(() => {
    if (!stageRef.current) {
      console.error('Stage no disponible para descarga');
      return;
    }

    try {
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1.0,
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `diseno-${design?.name || design?.id || 'preview'}-${Date.now()}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (onDownload) {
        onDownload(dataURL);
      }

    } catch (error) {
      console.error('Error en descarga:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de descarga',
        text: 'Error al descargar la imagen',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3F2724'
      });
    }
  }, [design, onDownload]);

  // ==================== RENDER ====================

  return (
    <div className="konva-design-viewer">
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="canvas-container"
      >
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Cargando vista previa...</p>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <div className="error-content">
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && (!design?.elements || design.elements.length === 0) && (
          <div className="empty-overlay">
            <div className="empty-content">
              <h3>No hay elementos en este diseño</h3>
              <p>Los elementos del diseño aparecerán aquí cuando estén disponibles</p>
            </div>
          </div>
        )}

        <Stage
          ref={stageRef}
          width={stageConfig.width}
          height={stageConfig.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          className="design-stage"
        >
          <Layer ref={layerRef}>
            {/* Imagen del producto con máscara de color */}
            {productImage && productImage.image && (() => {
              
              // ✅ CORRECCIÓN: Aplicar máscara de color si existe
              if (productColorFilter && productColorFilter !== '#ffffff') {
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

            {/* Áreas de personalización - Hidden in viewer */}
            {/* {customizationAreas.map(area => (
              <Rect
                key={area.id}
                {...area}
                fill="transparent"
                listening={false}
              />
            ))} */}


            {/* Elementos del diseño */}
            {elements.map(renderElement)}
          </Layer>
        </Stage>
      </div>

      {/* Información del diseño */}
      {(design?.elements?.length > 0 || product?.name) && (
        <div className="design-info">
          <div className="info-content">
            <div className="design-details">
              {product?.name && (
                <p className="product-name">
                  <strong>Producto:</strong> {product.name}
                </p>
              )}
              {design?.elements && (
                <p className="elements-count">
                  <strong>Elementos:</strong> {design.elements.length} elemento(s)
                </p>
              )}
              {design?.name && (
                <p className="design-name">
                  <strong>Diseño:</strong> {design.name}
                </p>
              )}
              {design?.status && (
                <p className="design-status">
                  <strong>Estado:</strong> {design.status}
                </p>
              )}
            </div>

            {enableDownload && (
              <button 
                className="download-btn"
                onClick={handleDownload}
                disabled={isLoading || error}
              >
                <span className="download-icon">⬇️</span>
                Descargar PNG
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KonvaDesignViewer;
