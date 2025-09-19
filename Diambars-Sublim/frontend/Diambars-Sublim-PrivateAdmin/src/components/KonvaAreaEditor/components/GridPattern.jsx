// components/GridPattern.jsx
// Componente compartido para el patrón de grid

import React from 'react';
import { Rect } from 'react-konva';
import { CANVAS_RENDERING } from '../constants/editorConfig';

export const GridPattern = ({ 
  width, 
  height, 
  showGrid = true,
  stageScale = 1 
}) => {
  if (!showGrid) return null;

  const { grid } = CANVAS_RENDERING;
  const elements = [];

  // Líneas menores cada 20px
  for (let i = 0; i <= width; i += grid.minor.size) {
    elements.push(
      <Rect
        key={`v-minor-${i}`}
        x={i}
        y={0}
        width={1}
        height={height}
        fill={grid.minor.color}
        stroke={grid.minor.strokeColor}
        strokeWidth={grid.minor.strokeWidth / stageScale}
        listening={false}
      />
    );
  }

  for (let i = 0; i <= height; i += grid.minor.size) {
    elements.push(
      <Rect
        key={`h-minor-${i}`}
        x={0}
        y={i}
        width={width}
        height={1}
        fill={grid.minor.color}
        stroke={grid.minor.strokeColor}
        strokeWidth={grid.minor.strokeWidth / stageScale}
        listening={false}
      />
    );
  }

  // Líneas principales cada 100px
  for (let i = 0; i <= width; i += grid.major.size) {
    elements.push(
      <Rect
        key={`v-major-${i}`}
        x={i}
        y={0}
        width={1}
        height={height}
        fill={grid.major.color}
        stroke={grid.major.strokeColor}
        strokeWidth={grid.major.strokeWidth / stageScale}
        listening={false}
      />
    );
  }

  for (let i = 0; i <= height; i += grid.major.size) {
    elements.push(
      <Rect
        key={`h-major-${i}`}
        x={0}
        y={i}
        width={width}
        height={1}
        fill={grid.major.color}
        stroke={grid.major.strokeColor}
        strokeWidth={grid.major.strokeWidth / stageScale}
        listening={false}
      />
    );
  }

  return <>{elements}</>;
};
