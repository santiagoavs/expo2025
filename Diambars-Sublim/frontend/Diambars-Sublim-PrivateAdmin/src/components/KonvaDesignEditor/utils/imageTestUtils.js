/**
 * Utilidades para probar el flujo de imágenes en el editor
 */

export const createTestImageElement = () => {
  // Crear una imagen de prueba base64 (1x1 pixel PNG transparente)
  const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  return {
    id: 'test-image-' + Date.now(),
    type: 'image',
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    imageUrl: testImageBase64,
    originalName: 'test-image.png',
    originalSize: 100,
    areaId: 'default-area',
    opacity: 1
  };
};

export const validateImageElement = (element) => {
  const errors = [];
  
  if (!element.id) {
    errors.push('ID faltante');
  }
  
  if (element.type !== 'image') {
    errors.push('Tipo debe ser "image"');
  }
  
  if (!element.imageUrl) {
    errors.push('imageUrl faltante');
  } else if (!element.imageUrl.startsWith('data:image/')) {
    errors.push('imageUrl no es base64 válido');
  }
  
  if (!element.width || element.width <= 0) {
    errors.push('Ancho inválido');
  }
  
  if (!element.height || element.height <= 0) {
    errors.push('Alto inválido');
  }
  
  return errors;
};

export const testImageFlow = () => {
  console.log('🧪 [ImageTestUtils] Iniciando prueba de flujo de imágenes...');
  
  // Crear elemento de prueba
  const testElement = createTestImageElement();
  console.log('🧪 [ImageTestUtils] Elemento de prueba creado:', testElement);
  
  // Validar elemento
  const validationErrors = validateImageElement(testElement);
  if (validationErrors.length > 0) {
    console.error('🧪 [ImageTestUtils] Errores de validación:', validationErrors);
    return false;
  }
  
  console.log('🧪 [ImageTestUtils] Elemento de prueba válido ✅');
  return true;
};
