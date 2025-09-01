// src/services/FontService.js - SERVICIO COMPLETO DE GESTIÓN DE FUENTES

/**
 * Servicio para cargar y gestionar fuentes del sistema, Google Fonts y fuentes personalizadas
 */
class FontService {
    constructor() {
      this.loadedGoogleFonts = new Set();
      this.loadedCustomFonts = new Map();
      this.fontLoadPromises = new Map();
    }
  
    /**
     * Obtiene las fuentes del sistema disponibles
     * @returns {Array<string>} Lista de fuentes del sistema
     */
    static getSystemFonts() {
      return [
        'Arial',
        'Arial Black', 
        'Helvetica',
        'Helvetica Neue',
        'Times New Roman',
        'Times',
        'Courier New',
        'Courier',
        'Georgia',
        'Verdana',
        'Tahoma',
        'Trebuchet MS',
        'Comic Sans MS',
        'Impact',
        'Lucida Console',
        'Lucida Sans Unicode',
        'Palatino',
        'Garamond',
        'Bookman',
        'Avant Garde'
      ];
    }
  
    /**
     * Obtiene la lista de Google Fonts populares con sus variantes
     * @returns {Array<string>} Lista de Google Fonts
     */
    static getGoogleFonts() {
      return [
        'Inter:wght@100;200;300;400;500;600;700;800;900',
        'Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900',
        'Open Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800',
        'Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900',
        'Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
        'Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
        'Source Sans Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900',
        'Oswald:wght@200;300;400;500;600;700',
        'Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
        'PT Sans:ital,wght@0,400;0,700;1,400;1,700',
        'Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900',
        'Nunito:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
        'Playfair Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900',
        'Libre Baskerville:ital,wght@0,400;0,700;1,400',
        'Work Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
        'Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
        'Fira Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
        'Crimson Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700',
        'Bitter:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
        'Dancing Script:wght@400;500;600;700'
      ];
    }
  
    /**
     * Carga múltiples Google Fonts
     * @param {Array<string>} fontFamilies - Lista de familias de fuentes
     * @returns {Promise<Array<string>>} Lista de fuentes cargadas exitosamente
     */
    async loadGoogleFonts(fontFamilies) {
      try {
        // Filtrar fuentes ya cargadas
        const fontsToLoad = fontFamilies.filter(font => {
          const fontName = font.split(':')[0];
          return !this.loadedGoogleFonts.has(fontName);
        });
  
        if (fontsToLoad.length === 0) {
          console.log('Todas las fuentes Google ya están cargadas');
          return Array.from(this.loadedGoogleFonts);
        }
  
        // Crear URL de Google Fonts
        const fontParams = fontsToLoad.map(font => `family=${encodeURIComponent(font)}`);
        const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontParams.join('&')}&display=swap`;
  
        // Cargar CSS de Google Fonts
        await this.loadFontCSS(googleFontsUrl);
  
        // Esperar a que las fuentes se carguen
        const fontPromises = fontsToLoad.map(font => {
          const fontName = font.split(':')[0];
          return this.waitForFont(fontName);
        });
  
        await Promise.all(fontPromises);
  
        // Marcar fuentes como cargadas
        fontsToLoad.forEach(font => {
          const fontName = font.split(':')[0];
          this.loadedGoogleFonts.add(fontName);
        });
  
        console.log(`✅ Google Fonts cargadas exitosamente:`, fontsToLoad.map(f => f.split(':')[0]));
        return Array.from(this.loadedGoogleFonts);
  
      } catch (error) {
        console.error('❌ Error cargando Google Fonts:', error);
        throw new Error(`Error cargando Google Fonts: ${error.message}`);
      }
    }
  
    /**
     * Carga una fuente personalizada desde un archivo
     * @param {File} fontFile - Archivo de fuente
     * @param {string} fontName - Nombre personalizado para la fuente
     * @returns {Promise<string>} Nombre de la familia de fuente cargada
     */
    async loadCustomFont(fontFile, fontName) {
      try {
        // Validar archivo
        const validation = this.validateFontFile(fontFile);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
  
        // Generar nombre único si no se proporciona
        const finalFontName = fontName || this.generateFontName(fontFile.name);
  
        // Verificar si ya está cargada
        if (this.loadedCustomFonts.has(finalFontName)) {
          console.log(`Fuente personalizada ya cargada: ${finalFontName}`);
          return finalFontName;
        }
  
        // Crear URL del archivo
        const fontUrl = URL.createObjectURL(fontFile);
  
        // Crear FontFace
        const fontFace = new FontFace(finalFontName, `url(${fontUrl})`);
        
        // Cargar la fuente
        await fontFace.load();
        
        // Agregar al documento
        document.fonts.add(fontFace);
        
        // Almacenar referencia
        this.loadedCustomFonts.set(finalFontName, {
          fontFace,
          url: fontUrl,
          originalFileName: fontFile.name,
          loadedAt: new Date()
        });
  
        console.log(`✅ Fuente personalizada cargada: ${finalFontName}`);
        return finalFontName;
  
      } catch (error) {
        console.error('❌ Error cargando fuente personalizada:', error);
        throw new Error(`Error cargando fuente personalizada: ${error.message}`);
      }
    }
  
    /**
     * Carga una fuente desde una URL
     * @param {string} fontUrl - URL de la fuente
     * @param {string} fontName - Nombre de la familia de fuente
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<string>} Nombre de la familia de fuente cargada
     */
    async loadFontFromUrl(fontUrl, fontName, options = {}) {
      try {
        const {
          weight = '400',
          style = 'normal',
          display = 'swap'
        } = options;
  
        // Verificar si ya está cargada
        if (this.loadedCustomFonts.has(fontName)) {
          console.log(`Fuente desde URL ya cargada: ${fontName}`);
          return fontName;
        }
  
        // Crear FontFace
        const fontFace = new FontFace(fontName, `url(${fontUrl})`, {
          weight,
          style,
          display
        });
  
        // Cargar la fuente
        await fontFace.load();
        
        // Agregar al documento
        document.fonts.add(fontFace);
        
        // Almacenar referencia
        this.loadedCustomFonts.set(fontName, {
          fontFace,
          url: fontUrl,
          loadedAt: new Date(),
          options
        });
  
        console.log(`✅ Fuente desde URL cargada: ${fontName}`);
        return fontName;
  
      } catch (error) {
        console.error('❌ Error cargando fuente desde URL:', error);
        throw new Error(`Error cargando fuente desde URL: ${error.message}`);
      }
    }
  
    /**
     * Obtiene todas las fuentes disponibles
     * @returns {Object} Objeto con todas las fuentes categorizadas
     */
    getAllAvailableFonts() {
      return {
        system: FontService.getSystemFonts(),
        google: Array.from(this.loadedGoogleFonts),
        custom: Array.from(this.loadedCustomFonts.keys()),
        all: [
          ...FontService.getSystemFonts(),
          ...Array.from(this.loadedGoogleFonts),
          ...Array.from(this.loadedCustomFonts.keys())
        ]
      };
    }
  
    /**
     * Verifica si una fuente está disponible
     * @param {string} fontName - Nombre de la fuente
     * @returns {boolean} true si la fuente está disponible
     */
    isFontAvailable(fontName) {
      // Verificar fuentes del sistema
      if (FontService.getSystemFonts().includes(fontName)) {
        return true;
      }
  
      // Verificar Google Fonts cargadas
      if (this.loadedGoogleFonts.has(fontName)) {
        return true;
      }
  
      // Verificar fuentes personalizadas
      if (this.loadedCustomFonts.has(fontName)) {
        return true;
      }
  
      // Verificar usando Font Loading API si está disponible
      if (document.fonts && document.fonts.check) {
        try {
          return document.fonts.check(`12px "${fontName}"`);
        } catch (e) {
          return false;
        }
      }
  
      return false;
    }
  
    /**
     * Obtiene información detallada de una fuente
     * @param {string} fontName - Nombre de la fuente
     * @returns {Object|null} Información de la fuente o null si no existe
     */
    getFontInfo(fontName) {
      // Fuentes del sistema
      if (FontService.getSystemFonts().includes(fontName)) {
        return {
          name: fontName,
          type: 'system',
          isAvailable: true,
          variants: ['400', '700'] // Asumimos variantes básicas
        };
      }
  
      // Google Fonts
      if (this.loadedGoogleFonts.has(fontName)) {
        return {
          name: fontName,
          type: 'google',
          isAvailable: true,
          loadedAt: new Date() // Las Google Fonts no tienen timestamp específico
        };
      }
  
      // Fuentes personalizadas
      if (this.loadedCustomFonts.has(fontName)) {
        const customFont = this.loadedCustomFonts.get(fontName);
        return {
          name: fontName,
          type: 'custom',
          isAvailable: true,
          originalFileName: customFont.originalFileName,
          loadedAt: customFont.loadedAt,
          options: customFont.options
        };
      }
  
      return null;
    }
  
    /**
     * Remueve una fuente personalizada
     * @param {string} fontName - Nombre de la fuente a remover
     * @returns {boolean} true si se removió exitosamente
     */
    removeCustomFont(fontName) {
      if (!this.loadedCustomFonts.has(fontName)) {
        return false;
      }
  
      try {
        const fontData = this.loadedCustomFonts.get(fontName);
        
        // Remover del documento
        document.fonts.delete(fontData.fontFace);
        
        // Liberar URL si existe
        if (fontData.url && fontData.url.startsWith('blob:')) {
          URL.revokeObjectURL(fontData.url);
        }
        
        // Remover de la lista
        this.loadedCustomFonts.delete(fontName);
        
        console.log(`🗑️ Fuente personalizada removida: ${fontName}`);
        return true;
  
      } catch (error) {
        console.error('Error removiendo fuente personalizada:', error);
        return false;
      }
    }
  
    /**
     * Carga el CSS de Google Fonts
     * @param {string} url - URL del CSS de Google Fonts
     * @returns {Promise<void>}
     */
    loadFontCSS(url) {
      return new Promise((resolve, reject) => {
        // Verificar si ya existe el link
        const existingLink = document.querySelector(`link[href="${url}"]`);
        if (existingLink) {
          resolve();
          return;
        }
  
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Error cargando CSS de fuentes: ${url}`));
        
        document.head.appendChild(link);
      });
    }
  
    /**
     * Espera a que una fuente específica se cargue
     * @param {string} fontName - Nombre de la fuente
     * @param {number} timeout - Timeout en milisegundos
     * @returns {Promise<void>}
     */
    waitForFont(fontName, timeout = 10000) {
      return new Promise((resolve, reject) => {
        // Si la fuente ya está disponible, resolver inmediatamente
        if (this.isFontAvailable(fontName)) {
          resolve();
          return;
        }
  
        // Usar Font Loading API si está disponible
        if (document.fonts && document.fonts.load) {
          const fontSpec = `400 12px "${fontName}"`;
          
          document.fonts.load(fontSpec).then(() => {
            if (document.fonts.check(fontSpec)) {
              resolve();
            } else {
              reject(new Error(`Fuente no disponible después de cargar: ${fontName}`));
            }
          }).catch(reject);
  
          // Timeout de seguridad
          setTimeout(() => {
            reject(new Error(`Timeout esperando fuente: ${fontName}`));
          }, timeout);
  
        } else {
          // Fallback para navegadores sin Font Loading API
          let attempts = 0;
          const maxAttempts = timeout / 100;
  
          const checkFont = () => {
            attempts++;
            
            if (this.isFontAvailable(fontName)) {
              resolve();
            } else if (attempts >= maxAttempts) {
              reject(new Error(`Timeout esperando fuente: ${fontName}`));
            } else {
              setTimeout(checkFont, 100);
            }
          };
  
          checkFont();
        }
      });
    }
  
    /**
     * Valida un archivo de fuente
     * @param {File} file - Archivo a validar
     * @returns {Object} Resultado de validación
     */
    validateFontFile(file) {
      const result = {
        isValid: false,
        error: null,
        warnings: []
      };
  
      if (!file) {
        result.error = 'No se proporcionó archivo';
        return result;
      }
  
      // Verificar extensión
      const allowedExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
      const fileExtension = file.name.toLowerCase().substr(file.name.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(fileExtension)) {
        result.error = `Formato de fuente no soportado: ${fileExtension}. Formatos permitidos: ${allowedExtensions.join(', ')}`;
        return result;
      }
  
      // Verificar tamaño (máximo 2MB para fuentes)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        result.error = `Archivo de fuente demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 2MB`;
        return result;
      }
  
      // Advertencias
      if (file.size > 500 * 1024) { // 500KB
        result.warnings.push('Archivo de fuente grande, puede afectar el rendimiento');
      }
  
      if (fileExtension === '.ttf' || fileExtension === '.otf') {
        result.warnings.push('Considera usar WOFF2 para mejor compresión y rendimiento');
      }
  
      result.isValid = true;
      return result;
    }
  
    /**
     * Genera un nombre único para una fuente
     * @param {string} originalName - Nombre original del archivo
     * @returns {string} Nombre único generado
     */
    generateFontName(originalName) {
      const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '');
      const timestamp = Date.now();
      return `CustomFont_${baseName}_${timestamp}`;
    }
  
    /**
     * Limpia todas las fuentes personalizadas cargadas
     */
    clearCustomFonts() {
      const fontNames = Array.from(this.loadedCustomFonts.keys());
      
      fontNames.forEach(fontName => {
        this.removeCustomFont(fontName);
      });
      
      console.log(`🧹 Limpiadas ${fontNames.length} fuentes personalizadas`);
    }
  
    /**
     * Obtiene estadísticas de uso de fuentes
     * @returns {Object} Estadísticas de fuentes
     */
    getFontStats() {
      return {
        system: {
          available: FontService.getSystemFonts().length,
          list: FontService.getSystemFonts()
        },
        custom: {
          loaded: this.loadedCustomFonts.size,
          list: Array.from(this.loadedCustomFonts.keys()),
          details: Array.from(this.loadedCustomFonts.entries()).map(([name, data]) => ({
            name,
            originalFileName: data.originalFileName,
            loadedAt: data.loadedAt,
            size: data.fontFace ? 'Unknown' : 0
          }))
        },
        total: {
          available: FontService.getSystemFonts().length + this.loadedGoogleFonts.size + this.loadedCustomFonts.size
        }
      };
    }
  }
  
  // Crear instancia singleton
  const fontService = new FontService();
  
  // Exportar tanto la clase como la instancia
  export { FontService };
  export default fontService;
