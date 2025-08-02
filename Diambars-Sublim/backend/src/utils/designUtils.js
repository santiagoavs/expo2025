/**
 * Valida que los elementos de un diseño sean compatibles con las áreas del producto.
 * @param {Array} elements - Elementos del diseño a validar
 * @param {Array} productAreas - Áreas de personalización del producto
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateDesignAgainstProduct = (elements, productAreas) => {
  const errors = [];
  console.log('[validateDesignAgainstProduct] Iniciando validación diseño vs producto');

  if (!elements || !Array.isArray(elements)) {
    console.error('Elementos del diseño no válidos:', elements);
    return {
      isValid: false,
      errors: ['Los elementos del diseño deben ser un array']
    };
  }

  if (!productAreas || !Array.isArray(productAreas)) {
    console.error('Áreas del producto no válidas:', productAreas);
    return {
      isValid: false,
      errors: ['Las áreas de personalización del producto no son válidas']
    };
  }

  elements.forEach((element, index) => {
    const area = productAreas.find(a => a.name === element.area);
    
    if (!area) {
      const errorMsg = `Elemento ${index}: Área "${element.area}" no existe en el producto`;
      console.warn(errorMsg);
      errors.push(errorMsg);
      return;
    }

    // Validación de posición/dimensiones
    const positionError = validateElementPosition(element, area);
    if (positionError) {
      console.warn(positionError);
      errors.push(positionError);
    }
  });

  const result = {
    isValid: errors.length === 0,
    errors
  };

  console.log(`[validateDesignAgainstProduct] Validación completada. Resultado: ${result.isValid}`);
  return result;
};

// Función auxiliar para validar posición
function validateElementPosition(element, area) {
  const { x, y, width = 0, height = 0 } = element.position || {};
  const areaBounds = area.position;

  if (
    x < areaBounds.x ||
    y < areaBounds.y ||
    x + width > areaBounds.x + areaBounds.width ||
    y + height > areaBounds.y + areaBounds.height
  ) {
    return `Elemento excede los límites del área "${area.name}" (X:${x}, Y:${y}, W:${width}, H:${height})`;
  }
  return null;
}

/**
 * Calcula el precio de un diseño con logs detallados
 */
export const calculateDesignPrice = (design, basePrice) => {
  console.log('[calculateDesignPrice] Iniciando cálculo', {
    designId: design._id,
    basePrice
  });

  const complexityFactors = {
    text: 1.2,
    image: 1.5,
    areaMultiplier: 0.3
  };

  const elementsCost = design.elements.reduce((sum, el) => {
    return sum + (el.type === 'text' ? complexityFactors.text : complexityFactors.image);
  }, 0);

  const uniqueAreas = [...new Set(design.elements.map(el => el.area))];
  const areaCost = uniqueAreas.length * complexityFactors.areaMultiplier;

  const finalPrice = basePrice * (1 + elementsCost + areaCost);
  const roundedPrice = parseFloat(finalPrice.toFixed(2));

  console.log('[calculateDesignPrice] Detalles del cálculo:', {
    elementsCount: design.elements.length,
    uniqueAreas: uniqueAreas.length,
    elementsCost,
    areaCost,
    finalPrice: roundedPrice
  });

  return roundedPrice;
};