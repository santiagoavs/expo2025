import React from 'react';
import FabricDesignEditorGlass from './FabricDesignEditorGlass.jsx';

const FabricDesignEditorSimple = ({
  product,
  initialDesign,
  onSave,
  onClose,
  isOpen = true
}) => {
  // Usar el nuevo editor glassmorphism
  return (
    <FabricDesignEditorGlass
      product={product}
      initialDesign={initialDesign}
      onSave={onSave}
      onClose={onClose}
      isOpen={isOpen}
    />
  );
};

export default FabricDesignEditorSimple;