// src/components/FabricDesignEditor/index.js

// Exportar el editor principal
export { default } from './FabricDesignEditor';
export { default as FabricDesignEditor } from './FabricDesignEditor';

// Exportar hooks
export { useFabricCanvas } from './hooks/useFabricCanvas';
export { useProductDetection } from './hooks/useProductDetection';

// Exportar herramientas
export { EDITOR_TOOLS, getToolByName, getToolsByCategory, getAllTools } from './editorTools';

// Exportar configuraciones
export { 
  PRODUCT_TEMPLATES, 
  detectProductType, 
  getProductConfig, 
  validateDesign,
  getExportConfig 
} from './config/products';

export { 
  ADAPTIVE_TOOLS, 
  BASIC_TOOLS, 
  TOOL_CATEGORIES,
  getToolsByCategory as getToolsByCategoryFromConfig,
  getToolConfig,
  isToolAvailable as isToolAvailableFromConfig
} from './config/tools';

export { 
  COLOR_PALETTE, 
  DESIGN_COLORS, 
  DEFAULT_COLORS, 
  GRADIENTS,
  getColorsByCategory,
  getGradient,
  getRandomColor,
  getContrastColor,
  isValidColor
} from './config/colors';

export { 
  EDITOR_CONFIG, 
  getEditorConfig, 
  updateEditorConfig, 
  validateEditorConfig,
  getProductSpecificConfig
} from './config/editor';

// Exportar el editor antiguo para compatibilidad (opcional)
export { default as FabricDesignEditor } from './FabricDesignEditor';
