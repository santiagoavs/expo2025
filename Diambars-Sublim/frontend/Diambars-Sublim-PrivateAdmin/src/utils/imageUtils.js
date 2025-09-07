// src/utils/imageUtils.js - REMOCIÓN DE FONDO CORREGIDA

export const ImageUtils = {
  /**
   * Valida archivo de imagen
   */
  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!file) {
      return { isValid: false, error: 'No se seleccionó ningún archivo' };
    }
    
    if (!validTypes.includes(file.type)) {
      return { isValid: false, error: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WebP' };
    }
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'El archivo es demasiado grande. Máximo 10MB' };
    }
    
    return { isValid: true };
  },

  /**
   * Carga imagen desde archivo
   */
  async loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Optimiza imagen para web
   */
  async optimizeForWeb(imageElement, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calcular dimensiones manteniendo proporción
        let { width, height } = imageElement;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx.drawImage(imageElement, 0, 0, width, height);

        // Convertir a formato deseado
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const dataURL = canvas.toDataURL(mimeType, quality);
        
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Remueve fondo blanco correctamente (PNG transparente)
   */
  async removeWhiteBackground(imageElement, tolerance = 20) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Usar dimensiones naturales
        canvas.width = imageElement.naturalWidth || imageElement.width;
        canvas.height = imageElement.naturalHeight || imageElement.height;

        // IMPORTANTE: NO establecer fondo, mantener transparente
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar imagen
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convertir tolerancia
        const threshold = (tolerance / 100) * 255;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Calcular brillo del píxel
          const brightness = (r + g + b) / 3;

          // Si es blanco/claro según tolerancia, hacer transparente
          if (brightness > (255 - threshold)) {
            data[i + 3] = 0; // Alpha = 0 (transparente)
          }
        }

        // Aplicar cambios
        ctx.putImageData(imageData, 0, 0);
        
        // CRÍTICO: Usar PNG para mantener transparencia
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        console.error('Error removiendo fondo:', error);
        reject(error);
      }
    });
  },

  /**
   * Remoción de fondo avanzada con detección de bordes
   */
  async removeBackgroundAdvanced(imageElement, options = {}) {
    const {
      tolerance = 20,
      smoothEdges = true,
      targetColor = 'white', // 'white', 'black', 'green'
      featherEdges = true
    } = options;

    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = imageElement.naturalWidth || imageElement.width;
        canvas.height = imageElement.naturalHeight || imageElement.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Definir color objetivo
        let targetR, targetG, targetB;
        switch (targetColor) {
          case 'white':
            targetR = targetG = targetB = 255;
            break;
          case 'black':
            targetR = targetG = targetB = 0;
            break;
          case 'green':
            targetR = 0; targetG = 255; targetB = 0;
            break;
          default:
            targetR = targetG = targetB = 255;
        }

        const threshold = (tolerance / 100) * 255;

        // Primera pasada: detectar píxeles a remover
        const mask = new Uint8Array(width * height);
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Calcular distancia al color objetivo
            const distance = Math.sqrt(
              Math.pow(r - targetR, 2) +
              Math.pow(g - targetG, 2) +
              Math.pow(b - targetB, 2)
            );

            if (distance < threshold) {
              mask[y * width + x] = 1; // Marcar para remover
            }
          }
        }

        // Segunda pasada: aplicar remoción con suavizado
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const maskIdx = y * width + x;

            if (mask[maskIdx]) {
              if (featherEdges) {
                // Contar vecinos sólidos
                let solidNeighbors = 0;
                let totalNeighbors = 0;

                for (let dy = -1; dy <= 1; dy++) {
                  for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                      totalNeighbors++;
                      if (!mask[ny * width + nx]) {
                        solidNeighbors++;
                      }
                    }
                  }
                }

                // Calcular alpha basado en vecinos sólidos
                const solidRatio = solidNeighbors / totalNeighbors;
                if (solidRatio > 0.3) {
                  data[idx + 3] = Math.round(255 * solidRatio * 0.5); // Semi-transparente
                } else {
                  data[idx + 3] = 0; // Completamente transparente
                }
              } else {
                data[idx + 3] = 0; // Completamente transparente
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        console.error('Error en remoción avanzada:', error);
        reject(error);
      }
    });
  },

  /**
   * Aplicar filtros de color correctamente
   */
  async applyColorFilter(imageElement, filterType, value) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = imageElement.naturalWidth || imageElement.width;
        canvas.height = imageElement.naturalHeight || imageElement.height;

        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

        // Aplicar filtro CSS al contexto
        switch (filterType) {
          case 'brightness':
            ctx.filter = `brightness(${value}%)`;
            break;
          case 'contrast':
            ctx.filter = `contrast(${value}%)`;
            break;
          case 'saturation':
            ctx.filter = `saturate(${value}%)`;
            break;
          case 'hue':
            ctx.filter = `hue-rotate(${value}deg)`;
            break;
          case 'blur':
            ctx.filter = `blur(${value}px)`;
            break;
          default:
            ctx.filter = 'none';
        }

        // Limpiar y redibujar con filtro
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        console.error('Error aplicando filtro:', error);
        reject(error);
      }
    });
  }
};

export default ImageUtils;