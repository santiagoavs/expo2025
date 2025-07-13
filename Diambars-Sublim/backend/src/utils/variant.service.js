/**
 * Servicio para manejo de variantes de productos
 */
const variantService = {};

/**
 * Genera todas las combinaciones posibles de atributos
 * @param {Array} attributes - Array de atributos con sus opciones
 * @returns {Array} - Array de todas las combinaciones posibles
 */
variantService.generateCombinations = (attributes) => {
  // Si no hay atributos, devolver un array con un objeto vacío
  if (!attributes || attributes.length === 0) {
    return [{}];
  }

  // Función recursiva para generar combinaciones
  const combineAttributes = (index, currentCombination = {}) => {
    // Si hemos procesado todos los atributos, devolver la combinación actual
    if (index >= attributes.length) {
      return [currentCombination];
    }

    const currentAttribute = attributes[index];
    const combinations = [];

    // Para cada opción del atributo actual, crear una nueva combinación
    if (currentAttribute.options && currentAttribute.options.length > 0) {
      for (const option of currentAttribute.options) {
        const newCombination = { ...currentCombination };
        newCombination[currentAttribute.name] = option.name;
        
        // Combinar con el resto de atributos recursivamente
        const nextCombinations = combineAttributes(index + 1, newCombination);
        combinations.push(...nextCombinations);
      }
    } else {
      // Si el atributo no tiene opciones, continuar con el siguiente atributo
      return combineAttributes(index + 1, currentCombination);
    }

    return combinations;
  };

  return combineAttributes(0);
};

export default variantService;