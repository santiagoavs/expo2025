// useMobileTransformations.js - HOOK PARA TRANSFORMACIONES MÓVILES ESPECÍFICAS
import { useState, useEffect, useCallback, useRef } from 'react';
import { useResponsiveLayout } from './useResponsiveLayout';

/**
 * Hook especializado para transformaciones móviles que mejora la UX
 * en dispositivos táctiles y pantallas pequeñas
 */
export const useMobileTransformations = () => {
  const { isMobile, isTablet, windowSize } = useResponsiveLayout();
  
  // Estados para transformaciones móviles
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [gestureStart, setGestureStart] = useState(null);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  
  // Referencias para gestos
  const touchTimeoutRef = useRef(null);
  const gestureTimeoutRef = useRef(null);

  // ==================== GESTOS TÁCTILES ====================
  
  // Detectar toque simple (tap)
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
    setTouchEnd(null);
    
    // Limpiar timeout anterior
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    
    // Timeout para detectar toque largo
    touchTimeoutRef.current = setTimeout(() => {
      if (touchStart) {
        handleLongPress(touchStart);
      }
    }, 500);
  }, [isMobile, touchStart]);

  // Detectar fin de toque
  const handleTouchEnd = useCallback((e) => {
    if (!isMobile || !touchStart) return;
    
    const touch = e.changedTouches[0];
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
    
    // Limpiar timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // Detectar tipo de gesto
    const duration = Date.now() - touchStart.time;
    const distance = Math.sqrt(
      Math.pow(touch.clientX - touchStart.x, 2) + 
      Math.pow(touch.clientY - touchStart.y, 2)
    );
    
    if (duration < 200 && distance < 10) {
      handleTap(touchStart);
    } else if (distance > 50) {
      handleSwipe(touchStart, { x: touch.clientX, y: touch.clientY });
    }
  }, [isMobile, touchStart]);

  // Detectar toque largo
  const handleLongPress = useCallback((touch) => {
    console.log('Long press detected at:', touch);
    // Aquí se puede implementar menú contextual o selección
  }, []);

  // Detectar tap simple
  const handleTap = useCallback((touch) => {
    console.log('Tap detected at:', touch);
    // Aquí se puede implementar selección de elementos
  }, []);

  // Detectar swipe
  const handleSwipe = useCallback((start, end) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    
    let direction = '';
    if (angle > -45 && angle <= 45) direction = 'right';
    else if (angle > 45 && angle <= 135) direction = 'down';
    else if (angle > 135 || angle <= -135) direction = 'left';
    else if (angle > -135 && angle <= -45) direction = 'up';
    
    console.log('Swipe detected:', direction, { deltaX, deltaY });
    
    // Implementar acciones según la dirección del swipe
    switch (direction) {
      case 'left':
        // Swipe izquierda - podría cambiar panel o herramienta
        break;
      case 'right':
        // Swipe derecha - podría mostrar panel
        break;
      case 'up':
        // Swipe arriba - podría mostrar toolbar
        break;
      case 'down':
        // Swipe abajo - podría ocultar toolbar
        break;
    }
  }, []);

  // ==================== GESTOS DE PINCH/ZOOM ====================
  
  // Detectar gesto de pellizco
  const handleGestureStart = useCallback((e) => {
    if (!isMobile || e.touches.length !== 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    
    setGestureStart({
      distance,
      centerX,
      centerY,
      time: Date.now()
    });
    
    setIsZooming(true);
  }, [isMobile]);

  // Actualizar gesto de pellizco
  const handleGestureChange = useCallback((e) => {
    if (!isMobile || !gestureStart || e.touches.length !== 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    const scale = distance / gestureStart.distance;
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    
    // Aplicar zoom
    handleZoom(scale, centerX, centerY);
  }, [isMobile, gestureStart]);

  // Finalizar gesto de pellizco
  const handleGestureEnd = useCallback((e) => {
    if (!isMobile) return;
    
    setIsZooming(false);
    setGestureStart(null);
  }, [isMobile]);

  // Función para aplicar zoom
  const handleZoom = useCallback((scale, centerX, centerY) => {
    // Esta función debe ser implementada por el componente padre
    console.log('Zoom:', scale, 'at:', centerX, centerY);
  }, []);

  // ==================== TRANSFORMACIONES DE UI ====================
  
  // Obtener tamaño de fuente responsivo
  const getResponsiveFontSize = useCallback((baseSize) => {
    if (isMobile) {
      return Math.max(baseSize * 0.8, 12);
    } else if (isTablet) {
      return Math.max(baseSize * 0.9, 14);
    }
    return baseSize;
  }, [isMobile, isTablet]);

  // Obtener espaciado responsivo
  const getResponsiveSpacing = useCallback((baseSpacing) => {
    if (isMobile) {
      return Math.max(baseSpacing * 0.6, 4);
    } else if (isTablet) {
      return Math.max(baseSpacing * 0.8, 6);
    }
    return baseSpacing;
  }, [isMobile, isTablet]);

  // Obtener tamaño de botón responsivo
  const getResponsiveButtonSize = useCallback((baseSize) => {
    if (isMobile) {
      return {
        minHeight: Math.max(baseSize.minHeight * 0.8, 36),
        padding: `${Math.max(baseSize.padding * 0.7, 8)}px ${Math.max(baseSize.padding * 0.8, 12)}px`,
        fontSize: Math.max(baseSize.fontSize * 0.85, 12)
      };
    } else if (isTablet) {
      return {
        minHeight: Math.max(baseSize.minHeight * 0.9, 40),
        padding: `${Math.max(baseSize.padding * 0.85, 10)}px ${Math.max(baseSize.padding * 0.9, 14)}px`,
        fontSize: Math.max(baseSize.fontSize * 0.9, 13)
      };
    }
    return baseSize;
  }, [isMobile, isTablet]);

  // Obtener tamaño de icono responsivo
  const getResponsiveIconSize = useCallback((baseSize) => {
    if (isMobile) {
      return Math.max(baseSize * 0.8, 16);
    } else if (isTablet) {
      return Math.max(baseSize * 0.9, 18);
    }
    return baseSize;
  }, [isMobile, isTablet]);

  // ==================== TRANSFORMACIONES DE CANVAS ====================
  
  // Obtener configuración de canvas para móvil
  const getMobileCanvasConfig = useCallback(() => {
    if (!isMobile) return null;
    
    return {
      // Reducir calidad para mejor rendimiento
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      
      // Ajustar tamaño máximo
      maxWidth: windowSize.width - 32,
      maxHeight: windowSize.height * 0.6,
      
      // Configuración de zoom
      minZoom: 0.5,
      maxZoom: 3,
      zoomStep: 0.1,
      
      // Configuración de pan
      panEnabled: true,
      panThreshold: 10,
      
      // Configuración de selección
      selectionEnabled: true,
      multiSelectEnabled: false, // Deshabilitar en móvil por simplicidad
      
      // Configuración de grid
      gridEnabled: false, // Ocultar grid en móvil para más espacio
      snapEnabled: false
    };
  }, [isMobile, windowSize]);

  // ==================== TRANSFORMACIONES DE PANEL ====================
  
  // Obtener configuración de panel para móvil
  const getMobilePanelConfig = useCallback(() => {
    if (!isMobile) return null;
    
    return {
      // Panel deslizable desde abajo
      position: 'bottom',
      height: '60vh',
      maxHeight: '400px',
      
      // Animaciones
      slideInDuration: 300,
      slideOutDuration: 200,
      
      // Configuración de pestañas
      tabHeight: 48,
      tabSpacing: 8,
      
      // Configuración de contenido
      contentPadding: 16,
      scrollEnabled: true,
      
      // Configuración de botones
      buttonHeight: 40,
      buttonSpacing: 8,
      
      // Configuración de controles
      controlSize: 'medium',
      controlSpacing: 12
    };
  }, [isMobile]);

  // ==================== TRANSFORMACIONES DE TOOLBAR ====================
  
  // Obtener configuración de toolbar para móvil
  const getMobileToolbarConfig = useCallback(() => {
    if (!isMobile) return null;
    
    return {
      // Toolbar compacta
      height: 56,
      padding: '0 16px',
      
      // Botones más grandes para touch
      buttonSize: 40,
      buttonSpacing: 8,
      
      // Menú de más opciones
      moreMenuEnabled: true,
      moreMenuItems: [
        'undo', 'redo', 'grid', 'snap', 'zoom', 'export'
      ],
      
      // Configuración de zoom
      zoomSliderEnabled: false, // Ocultar slider en móvil
      zoomButtonsEnabled: true,
      
      // Configuración de título
      titleMaxWidth: 120,
      titleTruncate: true
    };
  }, [isMobile]);

  // ==================== UTILIDADES DE GESTOS ====================
  
  // Detectar si es un gesto de arrastre
  const isDragGesture = useCallback((start, end, threshold = 10) => {
    if (!start || !end) return false;
    
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + 
      Math.pow(end.y - start.y, 2)
    );
    
    return distance > threshold;
  }, []);

  // Detectar velocidad del gesto
  const getGestureVelocity = useCallback((start, end) => {
    if (!start || !end) return 0;
    
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + 
      Math.pow(end.y - start.y, 2)
    );
    
    const duration = end.time - start.time;
    return duration > 0 ? distance / duration : 0;
  }, []);

  // Detectar dirección del gesto
  const getGestureDirection = useCallback((start, end) => {
    if (!start || !end) return null;
    
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  // ==================== EFECTOS ====================
  
  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
    };
  }, []);

  // ==================== RETORNO ====================
  
  return {
    // Estados
    isDragging,
    isZooming,
    touchStart,
    touchEnd,
    gestureStart,
    
    // Manejadores de gestos
    handleTouchStart,
    handleTouchEnd,
    handleGestureStart,
    handleGestureChange,
    handleGestureEnd,
    handleZoom,
    
    // Utilidades de transformación
    getResponsiveFontSize,
    getResponsiveSpacing,
    getResponsiveButtonSize,
    getResponsiveIconSize,
    
    // Configuraciones específicas
    getMobileCanvasConfig,
    getMobilePanelConfig,
    getMobileToolbarConfig,
    
    // Utilidades de gestos
    isDragGesture,
    getGestureVelocity,
    getGestureDirection,
    
    // Información del dispositivo
    isMobile,
    isTablet,
    windowSize
  };
};

export default useMobileTransformations;
