/**
 * Utilidades para productos y áreas personalizables
 */
import mongoose from "mongoose";

/**
 * Valida áreas de personalización de un producto
 * @param {Array} areas - Áreas a validar
 * @returns {Object} - Objeto con resultado de validación
 */
export const validateCustomizationAreas = (areas) => {
  if (!Array.isArray(areas) || areas.length === 0) {
    return {
      isValid: false,
      errors: ['Debe proporcionar al menos un área personalizable']
    };
  }
  
  const errors = [];
  
  areas.forEach((area, index) => {
    // Validar campos requeridos
    const requiredFields = ['name', 'displayName', 'position'];
    const missingFields = requiredFields.filter(field => !area[field]);
    
    if (missingFields.length > 0) {
      errors.push(`Área ${index + 1}: Faltan campos requeridos: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validar posición
    const { position } = area;
    if (!position.x || !position.y || !position.width || !position.height ||
        typeof position.x !== 'number' || typeof position.y !== 'number' ||
        typeof position.width !== 'number' || typeof position.height !== 'number') {
      errors.push(`Área ${index + 1}: La posición debe incluir x, y, width y height como números`);
    }
    
    // Validar que el área acepte al menos un tipo de elemento
    if (!area.accepts || (!area.accepts.text && !area.accepts.image)) {
      errors.push(`Área ${index + 1}: Debe aceptar al menos un tipo de elemento (texto o imagen)`);
    }
    
    // Verificar que el nombre del área sea único
    const otherAreas = areas.filter((_, i) => i !== index);
    if (otherAreas.some(otherArea => otherArea.name === area.name)) {
      errors.push(`Área ${index + 1}: El nombre "${area.name}" está duplicado`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Genera configuración para Konva basada en un producto
 * @param {Object} product - Producto
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - Configuración para Konva
 */
export const generateKonvaConfig = (product, options = {}) => {
  if (!product) {
    throw new Error("El producto es requerido");
  }
  
  // Configuración básica del editor
  const config = {
    // Configuración del contenedor
    container: {
      width: 800,  // Ancho base del editor
      height: 600, // Alto base del editor
      padding: 20  // Padding alrededor de la imagen
    },
    
    // Imagen del producto
    product: {
      id: product._id.toString(),
      name: product.name,
      image: product.images.main,
      basePrice: product.basePrice
    },
    
    // Áreas personalizables
    areas: product.customizationAreas.map(area => ({
      id: area._id.toString(),
      name: area.name,
      displayName: area.displayName,
      position: {
        x: area.position.x,
        y: area.position.y,
        width: area.position.width,
        height: area.position.height,
        rotationDegree: area.position.rotationDegree || 0
      },
      accepts: {
        text: area.accepts.text || false,
        image: area.accepts.image || false
      },
      defaultPlacement: area.defaultPlacement || 'center',
      maxElements: area.maxElements || 10
    })),
    
    // Opciones adicionales
    editor: {
      mode: options.editorMode || 'simple', // simple o advanced
      tools: {
        text: true,
        image: true,
        shapes: options.editorMode === 'advanced',
        layers: options.editorMode === 'advanced',
        undo: true,
        redo: true,
        zoom: true
      }
    }
  };
  
  // Incluir opciones del producto si se solicitan
  if (options.includeProductOptions && product.options && product.options.length > 0) {
    config.productOptions = product.options.map(option => ({
      name: option.name,
      type: option.type,
      values: option.values.map(val => ({
        label: val.label,
        value: val.value,
        additionalPrice: val.additionalPrice || 0,
        inStock: val.inStock !== false
      })),
      required: option.required || false
    }));
  }
  
  // Opciones adicionales para el editor avanzado
  if (options.editorMode === 'advanced') {
    config.editor.grid = {
      enabled: true,
      size: 10,
      color: 'rgba(0,0,0,0.1)'
    };
    
    config.editor.snapToGrid = true;
    config.editor.guidelines = true;
  }
  
  return config;
};

export default {
  validateCustomizationAreas,
  generateKonvaConfig
};