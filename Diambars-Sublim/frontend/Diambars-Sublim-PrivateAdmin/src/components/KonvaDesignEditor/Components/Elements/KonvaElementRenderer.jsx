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
      // Si ya tenemos la imagen cargada, usarla directamente
      if (element.image) {
        setKonvaImage(element.image);
        return;
      }
      
      // Si no, cargar desde URL
      if (element.imageUrl && !konvaImage) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => setKonvaImage(img);
        img.onerror = () => console.error('Error loading image:', element.imageUrl);
        img.src = element.imageUrl;
      }
    }
  }, [element.type, element.imageUrl, element.image, konvaImage]);

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
        
        // Reset scale and apply to width/height
        node.scaleX(1);
        node.scaleY(1);
        
        onTransform({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation()
        });
      }
    }
  };

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
            hasImageUrl: !!element.imageUrl
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

      return (
        <Image
          {...commonProps}
          image={konvaImage}
          width={element.width || 100}
          height={element.height || 100}
          crop={element.crop}
          filters={element.filters}
        />
      );

    default:
      console.warn(`Unsupported element type: ${element.type}`);
      return null;
  }
};
