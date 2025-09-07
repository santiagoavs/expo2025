// src/services/FontService.js - VERSIÓN CORREGIDA
import WebFont from 'webfontloader';

class FontService {
  constructor() {
    this.loadedGoogleFonts = new Set();
    this.loadedCustomFonts = new Map();
    this.fontLoadPromises = new Map();
    this.isInitialized = false;
  }

  /**
   * Cargar fuentes de Google de forma correcta
   */
  async loadGoogleFonts(fontFamilies = []) {
    const defaultFonts = [
      'Inter:wght@300;400;500;600;700',
      'Roboto:wght@300;400;500;700',
      'Open Sans:wght@300;400;600;700',
      'Montserrat:wght@300;400;500;600;700',
      'Poppins:wght@300;400;500;600;700'
    ];

    const fontsToLoad = fontFamilies.length > 0 ? fontFamilies : defaultFonts;
    
    return new Promise((resolve, reject) => {
      WebFont.load({
        google: {
          families: fontsToLoad
        },
        active: () => {
          console.log('✅ Google Fonts cargadas exitosamente');
          fontsToLoad.forEach(font => {
            const fontName = font.split(':')[0];
            this.loadedGoogleFonts.add(fontName);
          });
          resolve(Array.from(this.loadedGoogleFonts));
        },
        inactive: () => {
          console.warn('⚠️ Algunas Google Fonts no se pudieron cargar');
          reject(new Error('Error cargando Google Fonts'));
        },
        timeout: 10000
      });
    });
  }

  /**
   * Verificar si una fuente está lista para usar
   */
  isFontReady(fontFamily) {
    if (!document.fonts) return true; // Fallback para navegadores antiguos
    
    try {
      return document.fonts.check(`16px "${fontFamily}"`);
    } catch (error) {
      console.warn('Error verificando fuente:', error);
      return true; // Asumir que está disponible
    }
  }

  /**
   * Esperar a que una fuente específica esté lista
   */
  async waitForFont(fontFamily, timeout = 5000) {
    if (this.isFontReady(fontFamily)) {
      return true;
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      const checkFont = () => {
        if (this.isFontReady(fontFamily)) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          console.warn(`Timeout esperando fuente: ${fontFamily}`);
          resolve(false);
        } else {
          setTimeout(checkFont, 100);
        }
      };
      checkFont();
    });
  }

  /**
   * Obtener fuentes del sistema
   */
  getSystemFonts() {
    return [
      'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
      'Verdana', 'Courier New', 'Impact', 'Comic Sans MS',
      'Trebuchet MS', 'Tahoma', 'Arial Black', 'Palatino',
      'Garamond', 'Bookman', 'Avant Garde', 'Verdana'
    ];
  }

  /**
   * Obtener fuentes de Google disponibles
   */
  getGoogleFonts() {
    return [
      'Inter:wght@300;400;500;600;700',
      'Roboto:wght@300;400;500;700',
      'Open Sans:wght@300;400;600;700',
      'Montserrat:wght@300;400;500;600;700',
      'Poppins:wght@300;400;500;600;700',
      'Lato:wght@300;400;700',
      'Source Sans Pro:wght@300;400;600;700',
      'Nunito:wght@300;400;600;700',
      'Raleway:wght@300;400;500;600;700',
      'Ubuntu:wght@300;400;500;700'
    ];
  }

  /**
   * Obtener todas las fuentes disponibles
   */
  getAvailableFonts() {
    const systemFonts = this.getSystemFonts();

    return {
      system: systemFonts,
      google: Array.from(this.loadedGoogleFonts),
      custom: Array.from(this.loadedCustomFonts.keys()),
      all: [
        ...systemFonts,
        ...Array.from(this.loadedGoogleFonts),
        ...Array.from(this.loadedCustomFonts.keys())
      ]
    };
  }

  /**
   * Aplicar fuente a un objeto de Fabric.js
   */
  async applyFontToFabricObject(fabricObject, fontFamily) {
    try {
      // Esperar a que la fuente esté lista
      await this.waitForFont(fontFamily);
      
      // Aplicar la fuente
      fabricObject.set('fontFamily', fontFamily);
      
      // Re-renderizar si está en un canvas
      if (fabricObject.canvas) {
        fabricObject.canvas.requestRenderAll();
      }
      
      return true;
    } catch (error) {
      console.error('Error aplicando fuente:', error);
      return false;
    }
  }

  /**
   * Cargar fuente personalizada
   */
  async loadCustomFont(fontFile, fontName) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fontData = e.target.result;
        const fontFace = new FontFace(fontName, fontData);
        
        fontFace.load().then(() => {
          document.fonts.add(fontFace);
          this.loadedCustomFonts.set(fontName, fontData);
          console.log(`✅ Fuente personalizada cargada: ${fontName}`);
          resolve(fontName);
        }).catch(reject);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(fontFile);
    });
  }

  /**
   * Remover fuente personalizada
   */
  removeCustomFont(fontName) {
    if (this.loadedCustomFonts.has(fontName)) {
      this.loadedCustomFonts.delete(fontName);
      return true;
    }
    return false;
  }

  /**
   * Limpiar fuentes personalizadas
   */
  clearCustomFonts() {
    this.loadedCustomFonts.clear();
  }

  /**
   * Verificar si una fuente está disponible
   */
  isFontAvailable(fontName) {
    return this.getSystemFonts().includes(fontName) || 
           this.loadedGoogleFonts.has(fontName) || 
           this.loadedCustomFonts.has(fontName);
  }

  /**
   * Obtener información de una fuente
   */
  getFontInfo(fontName) {
    return {
      name: fontName,
      type: this.getSystemFonts().includes(fontName) ? 'system' : 
            this.loadedGoogleFonts.has(fontName) ? 'google' : 'custom',
      available: this.isFontAvailable(fontName)
    };
  }
}

// Crear instancia singleton
const fontService = new FontService();
export { FontService };
export default fontService;