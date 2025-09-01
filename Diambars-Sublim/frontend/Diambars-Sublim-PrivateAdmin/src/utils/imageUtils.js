// src/utils/imageUtils.js - UTILIDADES COMPLETAS DE PROCESAMIENTO DE IMÁGENES

/**
 * Utilidades para procesamiento de imágenes en canvas
 * Incluye remoción de fondos, filtros de color, redimensionamiento y optimizaciones
 */
export const ImageUtils = {
    /**
     * Remueve el fondo blanco/claro de una imagen (versión original mejorada)
     * @param {HTMLImageElement} imageElement - Elemento de imagen
     * @param {number} tolerance - Tolerancia para detección de color (0-100)
     * @returns {Promise<string>} - URL de la imagen procesada
     */
    async removeWhiteBackground(imageElement, tolerance = 10) {
      return new Promise((resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          // Usar dimensiones naturales para mejor calidad
          canvas.width = imageElement.naturalWidth || imageElement.width;
          canvas.height = imageElement.naturalHeight || imageElement.height;
  
          ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
  
          // Convertir tolerancia de 0-100 a 0-255
          const threshold = Math.round((tolerance / 100) * 255);
  
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
  
            // Si el píxel está cerca del blanco según la tolerancia
            if (r > (255 - threshold) && g > (255 - threshold) && b > (255 - threshold)) {
              data[i + 3] = 0; // Hacer transparente (alpha = 0)
            }
          }
  
          ctx.putImageData(imageData, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          console.error('Error removiendo fondo blanco:', error);
          reject(error);
        }
      });
    },
  
    /**
     * Aplica un filtro de color tipo multiplicación (versión original mejorada)
     * @param {HTMLImageElement} imageElement - Elemento de imagen
     * @param {string} color - Color del filtro en formato hex
     * @param {number} intensity - Intensidad del filtro (0-1)
     * @returns {Promise<string>} - URL de la imagen procesada
     */
    async applyColorTint(imageElement, color, intensity = 0.5) {
      return new Promise((resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          canvas.width = imageElement.naturalWidth || imageElement.width;
          canvas.height = imageElement.naturalHeight || imageElement.height;
  
          // Dibujar imagen original
          ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  
          // Aplicar overlay de color con intensidad
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = color;
          ctx.globalAlpha = intensity;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
  
          // Restaurar transparencia original
          ctx.globalCompositeOperation = 'destination-in';
          ctx.globalAlpha = 1;
          ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          console.error('Error aplicando filtro de color:', error);
          reject(error);
        }
      });
    },
  
    /**
     * Remoción de fondo avanzada con detección de bordes y suavizado
     * @param {HTMLImageElement} imageElement - Elemento de imagen  
     * @param {number} tolerance - Tolerancia (0-100)
     * @param {boolean} smoothEdges - Suavizar bordes
     * @returns {Promise<string>} - URL de imagen procesada
     */
    async removeWhiteBackgroundAdvanced(imageElement, tolerance = 10, smoothEdges = true) {
      return new Promise((resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          canvas.width = imageElement.naturalWidth || imageElement.width;
          canvas.height = imageElement.naturalHeight || imageElement.height;
  
          ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const threshold = (tolerance / 100) * 255;
  
          // Primera pasada: marcar píxeles para remover
          const toRemove = new Uint8Array(data.length / 4);
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const pixelIndex = i / 4;
  
            // Detectar píxeles blancos/claros
            if (r > (255 - threshold) && g > (255 - threshold) && b > (255 - threshold)) {
              toRemove[pixelIndex] = 1;
            }
          }
  
          // Segunda pasada: aplicar remoción con suavizado opcional
          for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = i / 4;
            
            if (toRemove[pixelIndex]) {
              if (smoothEdges) {
                // Suavizar bordes verificando píxeles vecinos
                const x = pixelIndex % canvas.width;
                const y = Math.floor(pixelIndex / canvas.width);
                let neighborSolid = false;
  
                // Verificar píxeles vecinos (3x3)
                for (let dy = -1; dy <= 1; dy++) {
                  for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                      const neighborIndex = ny * canvas.width + nx;
                      if (!toRemove[neighborIndex]) {
                        neighborSolid = true;
                        break;
                      }
                    }
                  }
                  if (neighborSolid) break;
                }
  
                // Si hay vecinos sólidos, hacer semi-transparente para suavizar
                if (neighborSolid) {
                  data[i + 3] = 64; // 25% de opacidad
                } else {
                  data[i + 3] = 0; // Completamente transparente
                }
              } else {
                data[i + 3] = 0; // Completamente transparente
              }
            }
          }
  
          ctx.putImageData(imageData, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          console.error('Error en remoción avanzada de fondo:', error);
          reject(error);
        }
      });
    },
  
    /**
     * Redimensiona una imagen manteniendo la proporción
     * @param {File|HTMLImageElement} source - Archivo o elemento de imagen
     * @param {number} maxWidth - Ancho máximo
     * @param {number} maxHeight - Alto máximo
     * @param {number} quality - Calidad de compresión (0-1)
     * @returns {Promise<string>} - URL de la imagen redimensionada
     */
    async resizeImage(source, maxWidth = 800, maxHeight = 600, quality = 0.8) {
      return new Promise((resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const processImage = (img) => {
            let { width, height } = img;
            
            // Calcular nuevas dimensiones manteniendo proporción
            const aspectRatio = width / height;
            
            if (width > maxWidth) {
              width = maxWidth;
              height = width / aspectRatio;
            }
            
            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Configurar para mejor calidad
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            
            // Determinar formato de salida basado en la transparencia
            let format = 'image/jpeg';
            if (source.type && source.type.includes('png')) {
              format = 'image/png';
            }
            
            const dataURL = canvas.toDataURL(format, quality);
            resolve(dataURL);
          };
  
          if (source instanceof File) {
            const img = new Image();
            img.onload = () => processImage(img);
            img.onerror = () => reject(new Error('Error cargando archivo de imagen'));
            img.src = URL.createObjectURL(source);
          } else if (source instanceof HTMLImageElement) {
            processImage(source);
          } else {
            reject(new Error('Tipo de fuente no válido'));
          }
        } catch (error) {
          console.error('Error redimensionando imagen:', error);
          reject(error);
        }
      });
    },
  
    /**
     * Convierte una imagen a escala de grises
     * @param {HTMLImageElement} imageElement - Elemento de imagen
     * @returns {Promise<string>} - URL de la imagen en escala de grises
     */
    async convertToGrayscale(imageElement) {
      return new Promise((resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          canvas.width = imageElement.naturalWidth || imageElement.width;
          canvas.height = imageElement.naturalHeight || imageElement.height;
  
          ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
  
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
  
            // Usar la fórmula de luminancia para escala de grises
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  
            data[i] = gray;     // R
            data[i + 1] = gray; // G
            data[i + 2] = gray; // B
            // Alpha permanece igual
          }
  
          ctx.putImageData(imageData, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          console.error('Error convirtiendo a escala de grises:', error);
          reject(error);
        }
      });
    },
  
    /**
     * Aplica un efecto sepia a la imagen
     * @param {HTMLImageElement} imageElement - Elemento de imagen
     * @param {number} intensity - Intensidad del efecto (0-1)
     * @returns {Promise<string>} - URL de la imagen con efecto sepia
     */
    async applySepiaEffect(imageElement, intensity = 0.8) {
      return new Promise((resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          canvas.width = imageElement.naturalWidth || imageElement.width;
          canvas.height = imageElement.naturalHeight || imageElement.height;
  
          ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
  
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
  
            // Aplicar matriz de transformación sepia
            const newR = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            const newG = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            const newB = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
  
            // Mezclar con color original según intensidad
            data[i] = r + intensity * (newR - r);
            data[i + 1] = g + intensity * (newG - g);
            data[i + 2] = b + intensity * (newB - b);
          }
  
          ctx.putImageData(imageData, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          console.error('Error aplicando efecto sepia:', error);
          reject(error);
        }
      });
    },
  
    /**
     * Valida si un archivo es una imagen válida
     * @param {File} file - Archivo a validar
     * @returns {Object} - Resultado de validación
     */
    validateImageFile(file) {
      const result = {
        isValid: false,
        error: null,
        warnings: []
      };
  
      if (!file) {
        result.error = 'No se proporcionó ningún archivo';
        return result;
      }
  
      // Verificar tipo MIME
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        result.error = `Tipo de archivo no soportado: ${file.type}. Tipos permitidos: JPG, PNG, GIF, WebP`;
        return result;
      }
  
      // Verificar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (file.size > maxSize) {
        result.error = `El archivo es demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo permitido: 10MB`;
        return result;
      }
  
      // Advertencias
      if (file.size > 2 * 1024 * 1024) { // 2MB
        result.warnings.push('Archivo grande, puede tardar en procesarse');
      }
  
      if (file.type === 'image/gif') {
        result.warnings.push('Las imágenes GIF animadas se convertirán a imagen estática');
      }
  
      result.isValid = true;
      return result;
    },
  
    /**
     * Carga una imagen desde una URL
     * @param {string} url - URL de la imagen
     * @returns {Promise<HTMLImageElement>} - Elemento de imagen cargado
     */
    async loadImageFromUrl(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Error cargando imagen desde URL: ${url}`));
        
        img.src = url;
      });
    },
  
    /**
     * Convierte un File a HTMLImageElement
     * @param {File} file - Archivo de imagen
     * @returns {Promise<HTMLImageElement>} - Elemento de imagen
     */
    async loadImageFromFile(file) {
      return new Promise((resolve, reject) => {
        const validation = this.validateImageFile(file);
        if (!validation.isValid) {
          reject(new Error(validation.error));
          return;
        }
  
        const img = new Image();
        
        img.onload = () => {
          URL.revokeObjectURL(img.src); // Liberar memoria
          resolve(img);
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          reject(new Error('Error cargando el archivo de imagen'));
        };
        
        img.src = URL.createObjectURL(file);
      });
    },
  
    /**
     * Optimiza una imagen para web
     * @param {HTMLImageElement} imageElement - Elemento de imagen
     * @param {Object} options - Opciones de optimización
     * @returns {Promise<string>} - URL de imagen optimizada
     */
    async optimizeForWeb(imageElement, options = {}) {
      const defaultOptions = {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        format: 'jpeg', // 'jpeg' | 'png' | 'webp'
        removeMetadata: true
      };
  
      const opts = { ...defaultOptions, ...options };
  
      return new Promise((resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          let { width, height } = imageElement;
          
          // Redimensionar si es necesario
          if (width > opts.maxWidth || height > opts.maxHeight) {
            const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
  
          canvas.width = width;
          canvas.height = height;
  
          // Configurar calidad de renderizado
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
  
          // Dibujar imagen optimizada
          ctx.drawImage(imageElement, 0, 0, width, height);
  
          // Determinar formato y calidad
          let mimeType = `image/${opts.format}`;
          if (opts.format === 'png') {
            const dataURL = canvas.toDataURL(mimeType);
            resolve(dataURL);
          } else {
            const dataURL = canvas.toDataURL(mimeType, opts.quality);
            resolve(dataURL);
          }
        } catch (error) {
          console.error('Error optimizando imagen:', error);
          reject(error);
        }
      });
    },
  
    /**
     * Detecta si una imagen tiene transparencia
     * @param {HTMLImageElement} imageElement - Elemento de imagen
     * @returns {Promise<boolean>} - true si tiene transparencia
     */
    async hasTransparency(imageElement) {
      return new Promise((resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          canvas.width = imageElement.naturalWidth || imageElement.width;
          canvas.height = imageElement.naturalHeight || imageElement.height;
  
          ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
  
          // Verificar canal alpha
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) {
              resolve(true);
              return;
            }
          }
  
          resolve(false);
        } catch (error) {
          console.error('Error detectando transparencia:', error);
          reject(error);
        }
      });
    }
  };
  
  export default ImageUtils;
