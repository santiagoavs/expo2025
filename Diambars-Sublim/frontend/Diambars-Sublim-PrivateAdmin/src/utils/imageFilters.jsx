export const applyColorFilter = (imageElement, color) => {
  if (!imageElement || !color || color === '#ffffff') return imageElement;
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    
    // Dibujar imagen original
    ctx.drawImage(imageElement, 0, 0);
    
    // Crear filtro de color usando multiply blend mode
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Preservar canal alpha original
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(imageElement, 0, 0);
    
    // Crear nueva imagen
    const filteredImage = new Image();
    filteredImage.src = canvas.toDataURL('image/png');
    
    return filteredImage;
  } catch (error) {
    console.error('Error aplicando filtro de color:', error);
    return imageElement;
  }
};

export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};