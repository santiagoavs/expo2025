// components/Elements/KonvaElementRenderer.jsx
import React, { useState, useEffect } from 'react';
import { Text, Rect, Circle, Line, Image } from 'react-konva';

export const KonvaElementRenderer = ({ 
  element, 
  isSelected, 
  onDragEnd, 
  onTransform 
}) => {
  // Validar que el elemento tenga un ID válido
  if (!element || !element.id) {
    console.warn('KonvaElementRenderer: Element missing ID', element);
    return null;
  }
  const [konvaImage, setKonvaImage] = useState(null);

  // Cargar imagen si es necesario
  useEffect(() => {
    if (element.type === 'image') {
      // Obtener la fuente de imagen (priorizar imageUrl para el editor)
      const imageSource = element.imageUrl || element.image;
      
      if (!imageSource) {
        console.warn('🖼️ [KonvaElementRenderer] No hay fuente de imagen:', {
          elementId: element.id,
          hasImageUrl: !!element.imageUrl,
          hasImage: !!element.image
        });
        return;
      }

      // Si ya tenemos la imagen cargada y es la misma fuente, usarla directamente
      if (konvaImage && konvaImage.src === imageSource) {
        return;
      }
      
      // Cargar la imagen
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        console.log('🖼️ [KonvaElementRenderer] Imagen cargada exitosamente:', {
          elementId: element.id,
          width: img.width,
          height: img.height,
          source: imageSource.substring(0, 50) + '...'
        });
        setKonvaImage(img);
      };
      img.onerror = (error) => {
        console.error('🖼️ [KonvaElementRenderer] Error cargando imagen:', {
          elementId: element.id,
          source: imageSource.substring(0, 50) + '...',
          error
        });
      };
      img.src = imageSource;
    }
  }, [element.type, element.imageUrl, element.image, element.id]);

  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    draggable: element.draggable !== false,
    listening: element.listening !== false,
    visible: element.visible !== false,
    opacity: element.opacity || 1,
    rotation: element.rotation || 0,
    scaleX: element.scaleX || 1,
    scaleY: element.scaleY || 1,
    offsetX: element.offsetX || 0,
    offsetY: element.offsetY || 0,
    onDragEnd: (e) => {
      if (onDragEnd) {
        onDragEnd({ x: e.target.x(), y: e.target.y() });
      }
    },
    onTransformEnd: (e) => {
      if (onTransform) {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotation = node.rotation();
        
        // Reset scale
        node.scaleX(1);
        node.scaleY(1);
        
        // ✅ DEBUGGING: Log de transformación
        console.log('🔄 [KonvaElementRenderer] onTransformEnd:', {
          elementId: element.id,
          elementType: element.type,
          scaleX,
          scaleY,
          rotation,
          hasPoints: !!element.points,
          hasWidth: !!element.width,
          hasHeight: !!element.height
        });
        
        // Manejar transformaciones según el tipo de elemento
        if (element.points && element.points.length > 0) {
          // ✅ Para formas complejas con puntos (pentágono, estrella, etc.)
          const transformedPoints = element.points.map((point, index) => {
            if (index % 2 === 0) {
              // Coordenada X
              return point * scaleX;
            } else {
              // Coordenada Y
              return point * scaleY;
            }
          });
          
          // ✅ CORRECCIÓN CRÍTICA: Calcular el centro de la forma para la rotación
          let centerX = 0, centerY = 0;
          if (transformedPoints.length > 0) {
            let sumX = 0, sumY = 0;
            for (let i = 0; i < transformedPoints.length; i += 2) {
              sumX += transformedPoints[i];
              sumY += transformedPoints[i + 1];
            }
            centerX = sumX / (transformedPoints.length / 2);
            centerY = sumY / (transformedPoints.length / 2);
          }
          
          // ✅ CORRECCIÓN: Usar offsetX y offsetY para centrar la rotación
          const offsetX = centerX;
          const offsetY = centerY;
          
          // ✅ DEBUGGING: Log de transformación con offsets
          console.log('🔄 [KonvaElementRenderer] Transformación con offsets:', {
            elementId: element.id,
            centerX,
            centerY,
            offsetX,
            offsetY,
            rotation,
            nodeX: node.x(),
            nodeY: node.y()
          });
          
          onTransform({
            x: node.x(),
            y: node.y(),
            points: transformedPoints,
            rotation: rotation,
            offsetX: offsetX,
            offsetY: offsetY
          });
        } else if (element.width && element.height) {
          // ✅ Para elementos con width/height (rectángulos, imágenes, etc.)
          onTransform({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: rotation
          });
        } else if (element.radius) {
          // ✅ Para círculos
          onTransform({
            x: node.x(),
            y: node.y(),
            radius: Math.max(5, element.radius * Math.max(scaleX, scaleY)),
            rotation: rotation
          });
        } else {
          // ✅ Fallback para otros elementos
          onTransform({
            x: node.x(),
            y: node.y(),
            rotation: rotation
          });
        }
      }
    },
  };

  // Debug: Log del elemento que se está renderizando
  console.log('🎨 [KonvaElementRenderer] Renderizando elemento:', {
    id: element.id,
    type: element.type,
    x: element.x,
    y: element.y,
    fill: element.fill,
    stroke: element.stroke,
    strokeWidth: element.strokeWidth,
    points: element.points,
    width: element.width,
    height: element.height,
    radius: element.radius
  });

  switch (element.type) {
    case 'text':
      return (
        <Text
          {...commonProps}
          text={element.text || ''}
          fontSize={element.fontSize || 24}
          fontFamily={element.fontFamily || 'Arial'}
          fill={element.fill || '#000000'}
          width={element.width}
          height={element.height}
          align={element.align || 'left'}
          verticalAlign={element.verticalAlign || 'top'}
          padding={element.padding || 0}
          lineHeight={element.lineHeight || 1}
          letterSpacing={element.letterSpacing || 0}
          fontStyle={element.fontStyle || 'normal'}
          textDecoration={element.textDecoration || ''}
          onTransformEnd={(e) => {
            if (onTransform) {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              const rotation = node.rotation();
              
              // Reset scale
              node.scaleX(1);
              node.scaleY(1);
              
              // ✅ DEBUGGING: Log de transformación de texto
              console.log('🔄 [KonvaElementRenderer] onTransformEnd texto:', {
                elementId: element.id,
                elementType: element.type,
                scaleX,
                scaleY,
                rotation,
                hasWidth: !!element.width,
                hasHeight: !!element.height
              });
              
              // ✅ Para texto, aplicar transformaciones a width/height
              if (element.width && element.height) {
                onTransform({
                  x: node.x(),
                  y: node.y(),
                  width: Math.max(5, element.width * scaleX),
                  height: Math.max(5, element.height * scaleY),
                  rotation: rotation
                });
              } else {
                // ✅ Fallback para texto sin dimensiones definidas
                onTransform({
                  x: node.x(),
                  y: node.y(),
                  rotation: rotation
                });
              }
            }
          }}
        />
      );

    case 'rect':
      return (
        <Rect
          {...commonProps}
          width={element.width || 100}
          height={element.height || 80}
          fill={element.fill || '#1F64BF'}
          stroke={element.stroke || '#032CA6'}
          strokeWidth={element.strokeWidth || 0}
          cornerRadius={element.cornerRadius || 0}
          dash={element.dash}
        />
      );

    case 'circle':
      return (
        <Circle
          {...commonProps}
          radius={element.radius || 50}
          fill={element.fill || '#1F64BF'}
          stroke={element.stroke || '#032CA6'}
          strokeWidth={element.strokeWidth || 0}
          dash={element.dash}
        />
      );

    case 'line':
      return (
        <Line
          {...commonProps}
          points={element.points || []}
          fill={element.fill || '#1F64BF'}
          stroke={element.stroke || '#032CA6'}
          strokeWidth={element.strokeWidth || 2}
          closed={element.closed || false}
          dash={element.dash}
          lineCap={element.lineCap || 'round'}
          lineJoin={element.lineJoin || 'round'}
        />
      );

    case 'triangle':
      return (
        <Line
          {...commonProps}
          points={element.points || [0, 50, 50, 0, 100, 50]}
          fill={element.fill || '#1F64BF'}
          stroke={element.stroke || '#032CA6'}
          strokeWidth={element.strokeWidth || 2}
          closed={true}
          dash={element.dash}
          lineCap={element.lineCap || 'round'}
          lineJoin={element.lineJoin || 'round'}
        />
      );

    case 'star':
      return (
        <Line
          {...commonProps}
          points={element.points || []}
          fill={element.fill || '#1F64BF'}
          stroke={element.stroke || '#032CA6'}
          strokeWidth={element.strokeWidth || 2}
          closed={true}
          dash={element.dash}
          lineCap={element.lineCap || 'round'}
          lineJoin={element.lineJoin || 'round'}
        />
      );

    // Formas adicionales del editor de formas
    case 'square':
      return (
        <Rect
          {...commonProps}
          width={element.width || 80}
          height={element.height || 80}
          fill={element.fill || '#1F64BF'}
          stroke={element.stroke || '#032CA6'}
          strokeWidth={element.strokeWidth || 0}
          cornerRadius={element.cornerRadius || 0}
          dash={element.dash}
        />
      );

    case 'ellipse':
      return (
        <Circle
          {...commonProps}
          radius={element.radius || 50}
          fill={element.fill || '#1F64BF'}
          stroke={element.stroke || '#032CA6'}
          strokeWidth={element.strokeWidth || 0}
          scaleX={element.scaleX || 1.2}
          scaleY={element.scaleY || 0.8}
          dash={element.dash}
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
          points={element.points || []}
          fill={element.fill || '#1F64BF'}
          stroke={element.stroke || '#032CA6'}
          strokeWidth={element.strokeWidth || 2}
          closed={element.closed !== false}
          dash={element.dash}
          lineCap={element.lineCap || 'round'}
          lineJoin={element.lineJoin || 'round'}
          tension={element.tension || 0}
        />
      );

    case 'customShape':
      return (
        <Line
          {...commonProps}
          points={element.points || []}
          fill={element.fill || '#1F64BF'}
          stroke={element.stroke || '#032CA6'}
          strokeWidth={element.strokeWidth || 2}
          closed={element.closed !== false}
          dash={element.dash}
          lineCap={element.lineCap || 'round'}
          lineJoin={element.lineJoin || 'round'}
        />
      );

    case 'image':
      if (!konvaImage) {
        // Solo mostrar log para elementos que no sean el producto base
        if (element.id !== 'product-background') {
          console.log('🖼️ [KonvaElementRenderer] Imagen no cargada, mostrando placeholder:', {
            elementId: element.id,
            hasImage: !!element.image,
            hasImageUrl: !!element.imageUrl,
            imageSource: (element.imageUrl || element.image)?.substring(0, 50) + '...',
            width: element.width,
            height: element.height
          });
        }
        return (
          <Rect
            {...commonProps}
            width={element.width || 100}
            height={element.height || 100}
            fill="#f0f0f0"
            stroke="#ccc"
            strokeWidth={1}
            dash={[5, 5]}
          />
        );
      }

          // ✅ CORREGIDO: Manejar el tintado del producto de manera especial
          if (element.id === 'product-background' && element.productColorFilter) {
        
        // ✅ CORREGIDO: Crear máscara automática para tintado selectivo
        const createProductMask = () => {
          if (!konvaImage) return null;
          
          // Crear un canvas temporal para analizar la imagen
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = konvaImage.width;
          canvas.height = konvaImage.height;
          
          // Dibujar la imagen en el canvas
          ctx.drawImage(konvaImage, 0, 0);
          
          // Obtener los datos de píxeles
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // ✅ CORREGIDO: Algoritmo MUY ESTRICTO para evitar colorear el fondo
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
              
              const colorRgb = hexToRgb(element.productColorFilter);
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
              {...commonProps}
              image={konvaImage}
              width={element.width || 100}
              height={element.height || 100}
              crop={element.crop}
            />
            {/* Máscara de color que solo afecta al producto */}
            {maskImage && (
              <Image
                {...commonProps}
                image={maskImage}
                width={element.width || 100}
                height={element.height || 100}
                crop={element.crop}
                globalCompositeOperation="multiply"
                opacity={0.8}
              />
            )}
          </>
        );
      }

      return (
        <Image
          {...commonProps}
          image={konvaImage}
          width={element.width || 100}
          height={element.height || 100}
          crop={element.crop}
          filters={element.filters}
          fill={element.fill}
          // Aplicar filtro de color si está presente
          {...(element.fill && {
            fillPatternImage: konvaImage,
            fillPatternScale: {
              x: (element.width || 100) / konvaImage.width,
              y: (element.height || 100) / konvaImage.height
            }
          })}
        />
      );

    default:
      console.warn(`Unsupported element type: ${element.type}`);
      return null;
  }
};
