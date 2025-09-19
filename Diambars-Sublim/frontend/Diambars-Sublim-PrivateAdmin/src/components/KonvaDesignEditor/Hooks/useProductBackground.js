// hooks/useProductBackground.js
import { useState, useEffect, useCallback } from 'react';
import { CANVAS_CONFIG, calculateScaledDimensions } from '../constants/canvasConfig';

export const useProductBackground = (product, canvasDimensions = null) => {
  const [productImage, setProductImage] = useState(null);
  const [productImageLoaded, setProductImageLoaded] = useState(false);
  const [productScale, setProductScale] = useState({ scaleX: 1, scaleY: 1 });
  const [productPosition, setProductPosition] = useState({ x: 0, y: 0 });

  const loadProductImage = useCallback(async () => {
    console.log('🖼️ [useProductBackground] Cargando imagen del producto:', product?.images?.main);
    
    if (!product?.images?.main) {
      console.log('❌ [useProductBackground] No hay imagen del producto');
      setProductImage(null);
      setProductImageLoaded(false);
      return;
    }

    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('✅ [useProductBackground] Imagen cargada:', {
            width: img.width,
            height: img.height,
            src: img.src
          });
          resolve();
        };
        img.onerror = (error) => {
          console.error('❌ [useProductBackground] Error cargando imagen:', error);
          reject(error);
        };
        img.src = product.images.main;
      });

      // ✅ CORREGIDO: Usar la misma lógica que KonvaAreaEditor
      const scaleX = CANVAS_CONFIG.width / img.width;
      const scaleY = CANVAS_CONFIG.height / img.height;
      const scale = Math.min(scaleX, scaleY) * CANVAS_CONFIG.productScale;

      const scaledDimensions = calculateScaledDimensions(img.width, img.height, scale);

      console.log('📐 [useProductBackground] Dimensiones calculadas:', {
        originalSize: { width: img.width, height: img.height },
        scale,
        scaledSize: { width: scaledDimensions.width, height: scaledDimensions.height },
        position: { x: scaledDimensions.x, y: scaledDimensions.y }
      });

      setProductImage(img);
      setProductScale({ scaleX: scale, scaleY: scale });
      setProductPosition({ x: scaledDimensions.x, y: scaledDimensions.y });
      setProductImageLoaded(true);
    } catch (error) {
      console.error('❌ [useProductBackground] Error cargando imagen del producto:', error);
      setProductImage(null);
      setProductImageLoaded(false);
    }
  }, [product, canvasDimensions]);

  useEffect(() => {
    loadProductImage();
  }, [loadProductImage]);

  return {
    productImage,
    productImageLoaded,
    productScale,
    productPosition,
    reloadProductImage: loadProductImage
  };
};
