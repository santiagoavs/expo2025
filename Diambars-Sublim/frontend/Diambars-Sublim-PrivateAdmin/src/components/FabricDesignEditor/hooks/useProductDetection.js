// src/components/FabricDesignEditor/hooks/useProductDetection.js
import { useState, useEffect, useCallback } from 'react';
import { getProductConfig } from '../config/products.js';

export const useProductDetection = (product) => {
  const [productType, setProductType] = useState('flat');
  const [productConfig, setProductConfig] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState('idle'); // idle, detecting, success, error
  const [detectionError, setDetectionError] = useState(null);

  // ================ DETECCIÓN AUTOMÁTICA MEJORADA ================
  const detectProduct = useCallback(async () => {
    if (!product) {
      setProductType('flat');
      setProductConfig(getProductConfig('flat'));
      setDetectionStatus('idle');
      return;
    }

    try {
      setDetectionStatus('detecting');
      setDetectionError(null);

      // Detectar tipo de producto basado en múltiples criterios
      let detectedType = 'flat';
      const productName = (product.name || '').toLowerCase();
      const imageUrl = (product.imageUrl || '').toLowerCase();
      
      // Intentar detectar por dimensiones de imagen si están disponibles
      let imageDimensions = null;
      if (product.imageUrl) {
        try {
          imageDimensions = await getImageDimensions(product.imageUrl);
        } catch (error) {
          console.log('[useProductDetection] No se pudieron obtener dimensiones de imagen:', error.message);
        }
      }

      // Detectar productos cilíndricos
      if (productName.includes('taza') || productName.includes('termo') ||
          productName.includes('vaso') || productName.includes('botella') ||
          productName.includes('cilindro') || productName.includes('redondo') ||
          productName.includes('mug') || productName.includes('cup') ||
          imageUrl.includes('taza') || imageUrl.includes('termo') ||
          imageUrl.includes('vaso') || imageUrl.includes('botella') ||
          imageUrl.includes('mug') || imageUrl.includes('cup') ||
          (imageDimensions && imageDimensions.width > imageDimensions.height * 1.5)) {
        detectedType = 'cylindrical';
      }
      // Detectar productos pequeños
      else if (productName.includes('gafete') || productName.includes('sticker') ||
               productName.includes('etiqueta') || productName.includes('insignia') ||
               productName.includes('pequeño') || productName.includes('mini') ||
               productName.includes('llavero') || productName.includes('pin') ||
               productName.includes('badge') || productName.includes('keychain') ||
               imageUrl.includes('gafete') || imageUrl.includes('sticker') ||
               imageUrl.includes('etiqueta') || imageUrl.includes('insignia') ||
               (imageDimensions && (imageDimensions.width < 200 || imageDimensions.height < 200))) {
        detectedType = 'small';
      }
      // Detectar productos planos (camisetas, gorras, etc.)
      else if (productName.includes('camiseta') || productName.includes('playera') ||
               productName.includes('gorra') || productName.includes('sombrero') ||
               productName.includes('shirt') || productName.includes('cap') ||
               productName.includes('hat') || productName.includes('tshirt') ||
               imageUrl.includes('camiseta') || imageUrl.includes('playera') ||
               imageUrl.includes('gorra') || imageUrl.includes('shirt') ||
               (imageDimensions && imageDimensions.width > 300 && imageDimensions.height > 300)) {
        detectedType = 'flat';
      }

      // Obtener configuración del producto
      const config = getProductConfig(detectedType);

      // Simular delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 150));

      setProductType(detectedType);
      setProductConfig(config);
      setDetectionStatus('success');

      console.log(`[useProductDetection] Producto detectado:`, {
        productName: product.name,
        productType: detectedType,
        imageUrl: product.imageUrl,
        imageDimensions,
        config
      });

    } catch (error) {
      console.error('[useProductDetection] Error detectando producto:', error);
      setDetectionError(error.message);
      setDetectionStatus('error');

      // Fallback a configuración por defecto
      setProductType('flat');
      setProductConfig(getProductConfig('flat'));
    }
  }, [product]);

  // ================ FUNCIÓN AUXILIAR PARA OBTENER DIMENSIONES DE IMAGEN ================
  const getImageDimensions = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.src = imageUrl;
    });
  };

  // ================ DETECCIÓN MANUAL ================
  const setProductTypeManually = useCallback((type) => {
    try {
      const config = getProductConfig(type);

      setProductType(type);
      setProductConfig(config);
      setDetectionStatus('success');
      setDetectionError(null);

      console.log(`[useProductDetection] Tipo de producto establecido manualmente:`, {
        productType: type,
        config
      });

    } catch (error) {
      console.error('[useProductDetection] Error estableciendo tipo manual:', error);
      setDetectionError(error.message);
      setDetectionStatus('error');
    }
  }, []);

  // ================ VALIDACIÓN DE PRODUCTO ================
  const validateProduct = useCallback(() => {
    if (!productConfig) return { valid: false, error: 'No hay configuración de producto' };

    const validation = {
      valid: true,
      warnings: [],
      errors: []
    };

    // Validar dimensiones del canvas
    if (productConfig.canvas) {
      if (productConfig.canvas.width <= 0 || productConfig.canvas.height <= 0) {
        validation.errors.push('Dimensiones del canvas inválidas');
        validation.valid = false;
      }

      if (productConfig.canvas.width > 5000 || productConfig.canvas.height > 5000) {
        validation.warnings.push('Dimensiones del canvas muy grandes, puede afectar el rendimiento');
      }
    }

    // Validar zona segura
    if (productConfig.safeZone) {
      const safeZone = productConfig.safeZone;
      if (safeZone.x < 0 || safeZone.y < 0 ||
          safeZone.width <= 0 || safeZone.height <= 0) {
        validation.errors.push('Zona segura inválida');
        validation.valid = false;
      }

      if (safeZone.x + safeZone.width > productConfig.canvas.width ||
          safeZone.y + safeZone.height > productConfig.canvas.height) {
        validation.errors.push('Zona segura fuera de los límites del canvas');
        validation.valid = false;
      }
    }

    // Validar restricciones
    if (productConfig.constraints) {
      if (productConfig.constraints.maxElements <= 0) {
        validation.warnings.push('Límite de elementos muy bajo');
      }

      if (productConfig.constraints.maxElements > 1000) {
        validation.warnings.push('Límite de elementos muy alto, puede afectar el rendimiento');
      }
    }

    return validation;
  }, [productConfig]);

  // ================ INFORMACIÓN DEL PRODUCTO ================
  const getProductInfo = useCallback(() => {
    if (!productConfig) return null;

    return {
      type: productType,
      name: productConfig.name,
      description: productConfig.description,
      icon: productConfig.icon,
      color: productConfig.color,
      canvas: {
        width: productConfig.canvas.width,
        height: productConfig.canvas.height,
        backgroundColor: productConfig.canvas.backgroundColor
      },
      safeZone: productConfig.safeZone,
      constraints: productConfig.constraints,
      export: productConfig.export
    };
  }, [productType, productConfig]);

  // ================ SUGERENCIAS DE DISEÑO ================
  const getDesignSuggestions = useCallback(() => {
    if (!productConfig) return [];

    const suggestions = [];

    // Sugerencias basadas en el tipo de producto
    switch (productType) {
      case 'small':
        suggestions.push(
          'Usa texto grande y legible',
          'Mantén el diseño simple y limpio',
          'Evita elementos muy pequeños',
          'Usa colores contrastantes'
        );
        break;

      case 'cylindrical':
        suggestions.push(
          'Considera la curvatura del producto',
          'Evita texto muy cerca de los bordes',
          'Usa imágenes que se vean bien al envolver',
          'Mantén elementos centrados'
        );
        break;

      case 'flat':
      default:
        suggestions.push(
          'Aprovecha todo el espacio disponible',
          'Puedes usar elementos más complejos',
          'Considera la orientación del producto',
          'Usa la zona segura como guía'
        );
        break;
    }

    // Sugerencias basadas en restricciones
    if (productConfig.constraints) {
      if (productConfig.constraints.maxElements < 20) {
        suggestions.push('Este producto tiene limitaciones de elementos, mantén el diseño simple');
      }

      if (productConfig.constraints.maxImageElements < 5) {
        suggestions.push('Limita el número de imágenes para mejor rendimiento');
      }
    }

    return suggestions;
  }, [productType, productConfig]);

  // ================ EFECTOS ================
  useEffect(() => {
    detectProduct();
  }, [detectProduct]);

  // ================ RETORNAR FUNCIONES Y ESTADOS ================
  return {
    // Estados
    productType,
    productConfig,
    detectionStatus,
    detectionError,

    // Funciones principales
    detectProduct,
    setProductTypeManually,

    // Funciones de utilidad
    validateProduct,
    getProductInfo,
    getDesignSuggestions,

    // Estados computados
    isDetecting: detectionStatus === 'detecting',
    isDetected: detectionStatus === 'success',
    hasError: detectionStatus === 'error',
    isValid: validateProduct().valid
  };
};
