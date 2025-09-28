// Shapes.jsx - Shape rendering components for Konva canvas
import React from 'react';
import { Line, Circle, Rect, Star, RegularPolygon } from 'react-konva';

// ==================== BASIC SHAPES ====================

export const KonvaLine = ({ element, isSelected, onSelect, onTransform }) => {
  const { id, points, stroke, strokeWidth, fill, closed, lineCap, lineJoin, ...otherProps } = element;

  return (
    <Line
      id={id}
      name={id}
      points={points || []}
      stroke={stroke || '#000000'}
      strokeWidth={strokeWidth || 2}
      fill={fill || 'transparent'}
      closed={closed || false}
      lineCap={lineCap || 'round'}
      lineJoin={lineJoin || 'round'}
      listening={true}
      onClick={onSelect}
      onTap={onSelect}
      onTransform={onTransform}
      {...otherProps}
    />
  );
};

export const KonvaCircle = ({ element, isSelected, onSelect, onTransform }) => {
  const { id, x, y, radius, fill, stroke, strokeWidth, ...otherProps } = element;

  return (
    <Circle
      id={id}
      name={id}
      x={x || 0}
      y={y || 0}
      radius={radius || 50}
      fill={fill || '#1f64bf'}
      stroke={stroke || '#164a8a'}
      strokeWidth={strokeWidth || 2}
      listening={true}
      onClick={onSelect}
      onTap={onSelect}
      onTransform={onTransform}
      {...otherProps}
    />
  );
};

export const KonvaRect = ({ element, isSelected, onSelect, onTransform }) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth, cornerRadius, ...otherProps } = element;

  return (
    <Rect
      id={id}
      name={id}
      x={x || 0}
      y={y || 0}
      width={width || 100}
      height={height || 100}
      fill={fill || '#1f64bf'}
      stroke={stroke || '#164a8a'}
      strokeWidth={strokeWidth || 2}
      cornerRadius={cornerRadius || 0}
      listening={true}
      onClick={onSelect}
      onTap={onSelect}
      onTransform={onTransform}
      {...otherProps}
    />
  );
};

export const KonvaStar = ({ element, isSelected, onSelect, onTransform }) => {
  const { 
    id, 
    x, 
    y, 
    numPoints, 
    innerRadius, 
    outerRadius, 
    fill, 
    stroke, 
    strokeWidth,
    ...otherProps 
  } = element;

  return (
    <Star
      id={id}
      name={id}
      x={x || 0}
      y={y || 0}
      numPoints={numPoints || 5}
      innerRadius={innerRadius || 20}
      outerRadius={outerRadius || 40}
      fill={fill || '#1f64bf'}
      stroke={stroke || '#164a8a'}
      strokeWidth={strokeWidth || 2}
      listening={true}
      onClick={onSelect}
      onTap={onSelect}
      onTransform={onTransform}
      {...otherProps}
    />
  );
};

export const KonvaPolygon = ({ element, isSelected, onSelect, onTransform }) => {
  const { 
    id, 
    x, 
    y, 
    sides, 
    radius, 
    fill, 
    stroke, 
    strokeWidth,
    ...otherProps 
  } = element;

  return (
    <RegularPolygon
      id={id}
      name={id}
      x={x || 0}
      y={y || 0}
      sides={sides || 6}
      radius={radius || 40}
      fill={fill || '#1f64bf'}
      stroke={stroke || '#164a8a'}
      strokeWidth={strokeWidth || 2}
      listening={true}
      onClick={onSelect}
      onTap={onSelect}
      onTransform={onTransform}
      {...otherProps}
    />
  );
};

// ==================== CUSTOM SHAPES ====================

export const KonvaCustomShape = ({ element, isSelected, onSelect, onTransform }) => {
  const { 
    id, 
    points, 
    fill, 
    stroke, 
    strokeWidth, 
    closed, 
    lineCap, 
    lineJoin,
    x,
    y,
    ...otherProps 
  } = element;

  // For custom shapes, points should be relative to the element position
  // The Line component will be positioned at x,y and points are relative to that
  console.log('🎨 Rendering custom shape:', {
    id,
    position: { x: x || 0, y: y || 0 },
    points: points || [],
    pointsLength: (points || []).length
  });

  return (
    <Line
      id={id}
      name={id}
      x={x || 0}
      y={y || 0}
      points={points || []}
      fill={fill || '#1f64bf'}
      stroke={stroke || '#164a8a'}
      strokeWidth={strokeWidth || 2}
      closed={closed !== undefined ? closed : true}
      lineCap={lineCap || 'round'}
      lineJoin={lineJoin || 'round'}
      listening={true}
      onClick={onSelect}
      onTap={onSelect}
      onTransform={onTransform}
      {...otherProps}
    />
  );
};

// ==================== SHAPE FACTORY ====================

export const ShapeRenderer = ({ element, isSelected, onSelect, onTransform }) => {
  const { shapeType, type } = element;
  const actualType = shapeType || type;
  
  console.log('ShapeRenderer - element:', element);
  console.log('ShapeRenderer - actualType:', actualType);

  switch (actualType) {
    case 'line':
    case 'custom':
    case 'shape': // Handle generic 'shape' type
      return (
        <KonvaCustomShape
          element={element}
          isSelected={isSelected}
          onSelect={onSelect}
          onTransform={onTransform}
        />
      );
    
    case 'circle':
      return (
        <KonvaCircle
          element={element}
          isSelected={isSelected}
          onSelect={onSelect}
          onTransform={onTransform}
        />
      );
    
    case 'rect':
    case 'rectangle':
      return (
        <KonvaRect
          element={element}
          isSelected={isSelected}
          onSelect={onSelect}
          onTransform={onTransform}
        />
      );
    
    case 'star':
      return (
        <KonvaStar
          element={element}
          isSelected={isSelected}
          onSelect={onSelect}
          onTransform={onTransform}
        />
      );
    
    case 'triangle':
      return (
        <KonvaPolygon
          element={{ ...element, sides: 3 }}
          isSelected={isSelected}
          onSelect={onSelect}
          onTransform={onTransform}
        />
      );
    
    case 'pentagon':
      return (
        <KonvaPolygon
          element={{ ...element, sides: 5 }}
          isSelected={isSelected}
          onSelect={onSelect}
          onTransform={onTransform}
        />
      );
    
    case 'hexagon':
      return (
        <KonvaPolygon
          element={{ ...element, sides: 6 }}
          isSelected={isSelected}
          onSelect={onSelect}
          onTransform={onTransform}
        />
      );
    
    case 'octagon':
      return (
        <KonvaPolygon
          element={{ ...element, sides: 8 }}
          isSelected={isSelected}
          onSelect={onSelect}
          onTransform={onTransform}
        />
      );
    
    default:
      // Fallback to custom shape for unknown types
      return (
        <KonvaCustomShape
          element={element}
          isSelected={isSelected}
          onSelect={onSelect}
          onTransform={onTransform}
        />
      );
  }
};

// ==================== SHAPE UTILITIES ====================

export const createShapeElement = (shapeType, properties = {}) => {
  const baseElement = {
    id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'shape',
    shapeType,
    x: properties.x || 100,
    y: properties.y || 100,
    fill: properties.fill || '#1f64bf',
    stroke: properties.stroke || '#164a8a',
    strokeWidth: properties.strokeWidth || 2,
    listening: true,
    draggable: true,
    ...properties
  };

  // Add specific properties based on shape type
  switch (shapeType) {
    case 'circle':
      return {
        ...baseElement,
        radius: properties.radius || 50
      };
    
    case 'rect':
    case 'rectangle':
      return {
        ...baseElement,
        width: properties.width || 100,
        height: properties.height || 100,
        cornerRadius: properties.cornerRadius || 0
      };
    
    case 'star':
      return {
        ...baseElement,
        numPoints: properties.numPoints || 5,
        innerRadius: properties.innerRadius || 20,
        outerRadius: properties.outerRadius || 40
      };
    
    case 'triangle':
    case 'pentagon':
    case 'hexagon':
    case 'octagon':
      const sidesMap = {
        triangle: 3,
        pentagon: 5,
        hexagon: 6,
        octagon: 8
      };
      return {
        ...baseElement,
        sides: sidesMap[shapeType] || 6,
        radius: properties.radius || 40
      };
    
    case 'custom':
    case 'line':
      return {
        ...baseElement,
        points: properties.points || [],
        closed: properties.closed !== undefined ? properties.closed : true,
        lineCap: properties.lineCap || 'round',
        lineJoin: properties.lineJoin || 'round',
        // Ensure width and height are set for custom shapes
        width: properties.width || 100,
        height: properties.height || 100
      };
    
    default:
      return baseElement;
  }
};

export const getShapeDefaults = (shapeType) => {
  const defaults = {
    fill: '#1f64bf',
    stroke: '#164a8a',
    strokeWidth: 2
  };

  switch (shapeType) {
    case 'circle':
      return { ...defaults, radius: 50 };
    
    case 'rect':
    case 'rectangle':
      return { ...defaults, width: 100, height: 100 };
    
    case 'star':
      return { 
        ...defaults, 
        numPoints: 5, 
        innerRadius: 20, 
        outerRadius: 40 
      };
    
    case 'triangle':
    case 'pentagon':
      return { ...defaults, radius: 40 };
    
    case 'hexagon':
    case 'octagon':
      return { ...defaults, radius: 40 };
    
    default:
      return defaults;
  }
};

export default ShapeRenderer;
