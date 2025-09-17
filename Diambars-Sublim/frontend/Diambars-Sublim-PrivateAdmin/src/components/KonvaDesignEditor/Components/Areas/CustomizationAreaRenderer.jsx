// components/Areas/CustomizationAreaRenderer.jsx
import React from 'react';
import { Rect, Text, Group } from 'react-konva';

export const CustomizationAreaRenderer = ({ area, isActive, showLabel }) => {
  return (
    <Group>
      <Rect
        x={area.x}
        y={area.y}
        width={area.width}
        height={area.height}
        fill="transparent"
        stroke={area.strokeColor || '#10B981'}
        strokeWidth={area.strokeWidth || 2}
        dash={area.dash || [6, 6]}
        listening={false}
        opacity={isActive ? 0.8 : 0.5}
      />
      
      {showLabel && (
        <Text
          x={area.x + 5}
          y={area.y + 5}
          text={area.displayName || area.name}
          fontSize={12}
          fontFamily="Arial"
          fill={area.strokeColor || '#10B981'}
          listening={false}
          opacity={0.8}
        />
      )}
    </Group>
  );
};
