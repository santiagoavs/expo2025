/**
 * Valida que las áreas de personalización de un producto sean correctas.
 * @param {Array} customizationAreas - Áreas definidas en el producto (ej: [{ name: "frente", x: 10, y: 20, width: 100, height: 50 }])
 * @returns {boolean} - True si las áreas son válidas, false si hay errores.
 */
export const validateCustomizationAreas = (customizationAreas) => {
  if (!Array.isArray(customizationAreas)) {
    console.error("Las áreas de personalización deben ser un array.");
    return false;
  }

  return customizationAreas.every((area) => {
    const { name, x, y, width, height } = area;
    if (!name || typeof x !== "number" || typeof y !== "number" || typeof width !== "number" || typeof height !== "number") {
      console.error(`Área inválida: ${name}. Faltan campos o tipos incorrectos.`);
      return false;
    }
    return true;
  });
};

/**
 * Valida que un diseño sea compatible con las especificaciones de un producto.
 * @param {Object} design - Diseño a validar (ej: { layers: [...] })
 * @param {Object} product - Producto de referencia (debe tener customizationAreas)
 * @returns {boolean} - True si el diseño es válido para el producto.
 */
export const validateDesignAgainstProduct = (design, product) => {
  if (!design || !product || !product.customizationAreas) {
    console.error("Datos de diseño o producto inválidos.");
    return false;
  }

  // Verifica que el diseño no exceda las áreas permitidas
  const areas = product.customizationAreas;
  const designLayers = design.layers || [];

  return designLayers.every((layer) => {
    const layerArea = areas.find((area) => area.name === layer.areaName);
    if (!layerArea) {
      console.error(`El área "${layer.areaName}" no existe en el producto.`);
      return false;
    }

    // Verifica posición y dimensión del layer dentro del área
    const isWithinArea = (
      layer.x >= layerArea.x &&
      layer.y >= layerArea.y &&
      layer.x + layer.width <= layerArea.x + layerArea.width &&
      layer.y + layer.height <= layerArea.y + layerArea.height
    );

    if (!isWithinArea) {
      console.error(`El layer "${layer.id}" excede los límites del área "${layerArea.name}".`);
      return false;
    }

    return true;
  });
};

/**
 * Genera la configuración inicial para Konva (editor de diseños en frontend).
 * @param {Object} product - Producto con áreas de personalización.
 * @returns {Object} - Configuración para Konva (stage, layers, etc.).
 */
export const generateKonvaConfig = (product) => {
  if (!product || !product.customizationAreas) {
    throw new Error("Producto inválido: faltan áreas de personalización.");
  }

  const stageConfig = {
    width: product.baseWidth || 800, // Ancho base del producto (ej: camiseta)
    height: product.baseHeight || 600, // Alto base
    areas: product.customizationAreas.map((area) => ({
      id: `area-${area.name}`,
      name: area.name,
      x: area.x,
      y: area.y,
      width: area.width,
      height: area.height,
      draggable: false, // Las áreas no se mueven
    })),
  };

  return stageConfig;
};