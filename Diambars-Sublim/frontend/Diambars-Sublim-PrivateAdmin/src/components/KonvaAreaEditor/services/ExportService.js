// services/ExportService.js
// Servicio optimizado para exportación con resoluciones específicas para Cloudinary

import { CLOUDINARY_CONFIG, VALIDATION_RULES } from '../constants/editorConfig';

export class ExportService {
  constructor() {
    this.supportedFormats = ['png', 'jpg', 'jpeg', 'webp'];
    this.defaultQuality = 0.9;
  }

  /**
   * Exporta el stage de Konva con optimizaciones para Cloudinary
   * @param {Object} stage - Stage de Konva
   * @param {Object} options - Opciones de exportación
   * @returns {Promise<Object>} - Resultado de la exportación
   */
  async exportStage(stage, options = {}) {
    try {
      const {
        format = 'png',
        quality = this.defaultQuality,
        pixelRatio = 2,
        includeBackground = true,
        targetResolution = 'designs' // 'products', 'designs', 'areas'
      } = options;

      // Validar formato
      if (!this.supportedFormats.includes(format.toLowerCase())) {
        throw new Error(`Formato no soportado: ${format}`);
      }

      // Obtener configuración de Cloudinary para la resolución objetivo
      const cloudinaryConfig = this.getCloudinaryConfig(targetResolution);
      
      // Calcular dimensiones optimizadas
      const optimizedDimensions = this.calculateOptimizedDimensions(
        stage.width(),
        stage.height(),
        cloudinaryConfig.transformation[0]
      );

      console.log('📤 [ExportService] Exportando con configuración optimizada:', {
        format,
        quality,
        pixelRatio,
        targetResolution,
        originalSize: { width: stage.width(), height: stage.height() },
        optimizedSize: optimizedDimensions,
        cloudinaryConfig: cloudinaryConfig.transformation[0]
      });

      // Configurar el stage para exportación
      const originalScale = stage.scaleX();
      const originalPosition = stage.position();
      
      // Aplicar escala para la resolución objetivo
      const scaleX = optimizedDimensions.width / stage.width();
      const scaleY = optimizedDimensions.height / stage.height();
      const exportScale = Math.min(scaleX, scaleY) * pixelRatio;

      stage.scale({ x: exportScale, y: exportScale });
      stage.position({ x: 0, y: 0 });

      // Exportar
      const dataURL = stage.toDataURL({
        mimeType: `image/${format}`,
        quality: quality,
        pixelRatio: 1, // Ya aplicamos el pixelRatio en la escala
        x: 0,
        y: 0,
        width: optimizedDimensions.width * pixelRatio,
        height: optimizedDimensions.height * pixelRatio
      });

      // Restaurar estado original
      stage.scale({ x: originalScale, y: originalScale });
      stage.position(originalPosition);

      // Validar resultado
      if (!dataURL || dataURL === 'data:,') {
        throw new Error('Error al generar imagen de exportación');
      }

      return {
        success: true,
        dataURL,
        format,
        dimensions: {
          width: optimizedDimensions.width * pixelRatio,
          height: optimizedDimensions.height * pixelRatio
        },
        cloudinaryConfig,
        metadata: {
          originalSize: { width: stage.width(), height: stage.height() },
          exportScale,
          pixelRatio,
          quality,
          exportedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ [ExportService] Error en exportación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene la configuración de Cloudinary para el tipo de resolución
   * @param {string} targetResolution - Tipo de resolución ('products', 'designs', 'areas')
   * @returns {Object} - Configuración de Cloudinary
   */
  getCloudinaryConfig(targetResolution) {
    switch (targetResolution) {
      case 'products':
        return CLOUDINARY_CONFIG.products.main;
      case 'designs':
        return CLOUDINARY_CONFIG.designs;
      case 'areas':
        return CLOUDINARY_CONFIG.areas;
      default:
        return CLOUDINARY_CONFIG.designs;
    }
  }

  /**
   * Calcula dimensiones optimizadas basadas en la configuración de Cloudinary
   * @param {number} originalWidth - Ancho original
   * @param {number} originalHeight - Alto original
   * @param {Object} transformation - Transformación de Cloudinary
   * @returns {Object} - Dimensiones optimizadas
   */
  calculateOptimizedDimensions(originalWidth, originalHeight, transformation) {
    const { width: maxWidth, height: maxHeight, crop } = transformation;
    
    if (crop === 'limit') {
      // Mantener proporción, limitar a las dimensiones máximas
      const scaleX = maxWidth / originalWidth;
      const scaleY = maxHeight / originalHeight;
      const scale = Math.min(scaleX, scaleY, 1); // No ampliar
      
      return {
        width: Math.round(originalWidth * scale),
        height: Math.round(originalHeight * scale)
      };
    } else {
      // Usar dimensiones exactas
      return {
        width: maxWidth,
        height: maxHeight
      };
    }
  }

  /**
   * Valida las dimensiones de exportación
   * @param {Object} dimensions - Dimensiones a validar
   * @returns {Object} - Resultado de validación
   */
  validateDimensions(dimensions) {
    const { width, height } = dimensions;
    const errors = [];

    if (width < VALIDATION_RULES.elements.minSize) {
      errors.push(`Ancho mínimo: ${VALIDATION_RULES.elements.minSize}px`);
    }
    
    if (height < VALIDATION_RULES.elements.minSize) {
      errors.push(`Alto mínimo: ${VALIDATION_RULES.elements.minSize}px`);
    }
    
    if (width > VALIDATION_RULES.elements.maxSize) {
      errors.push(`Ancho máximo: ${VALIDATION_RULES.elements.maxSize}px`);
    }
    
    if (height > VALIDATION_RULES.elements.maxSize) {
      errors.push(`Alto máximo: ${VALIDATION_RULES.elements.maxSize}px`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepara datos para el backend con optimizaciones
   * @param {Object} exportResult - Resultado de la exportación
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Object} - Datos preparados para el backend
   */
  prepareForBackend(exportResult, metadata = {}) {
    if (!exportResult.success) {
      throw new Error(`Error en exportación: ${exportResult.error}`);
    }

    return {
      imageData: exportResult.dataURL,
      format: exportResult.format,
      dimensions: exportResult.dimensions,
      cloudinaryConfig: exportResult.cloudinaryConfig,
      metadata: {
        ...exportResult.metadata,
        ...metadata,
        exportedBy: 'KonvaAreaEditor',
        version: '2.0.0'
      }
    };
  }
}
