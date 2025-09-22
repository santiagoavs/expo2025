// useResponsiveLayout.js - HOOK PARA MANEJO RESPONSIVO DEL EDITOR
import { useState, useEffect, useCallback } from 'react';
import { RESPONSIVE_UTILS, RESPONSIVE_LAYOUTS, RESPONSIVE_BREAKPOINTS } from '../styles/responsiveTheme';

/**
 * Hook personalizado para manejar el layout responsivo del editor
 * Proporciona información sobre el tamaño de pantalla actual y utilidades para el layout
 */
export const useResponsiveLayout = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('properties');

  // Función para actualizar el tamaño de ventana
  const updateWindowSize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  // Efecto para escuchar cambios en el tamaño de ventana
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, [updateWindowSize]);

  // Calcular información responsiva
  const currentBreakpoint = RESPONSIVE_UTILS.getCurrentBreakpoint(windowSize.width);
  const currentLayout = RESPONSIVE_UTILS.getCurrentLayout(windowSize.width);
  const isMobile = RESPONSIVE_UTILS.isMobile(windowSize.width);
  const isTablet = RESPONSIVE_UTILS.isTablet(windowSize.width);
  const isDesktop = RESPONSIVE_UTILS.isDesktop(windowSize.width);

  // Función para alternar el panel
  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  // Función para abrir el panel
  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  // Función para cerrar el panel
  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  // Función para cambiar el panel activo
  const changeActivePanel = useCallback((panelId) => {
    setActivePanel(panelId);
    // En móvil, abrir el panel automáticamente al cambiar
    if (isMobile) {
      setIsPanelOpen(true);
    }
  }, [isMobile]);

  // Función para obtener estilos responsivos
  const getResponsiveStyles = useCallback((styles) => {
    return RESPONSIVE_UTILS.getResponsiveStyles(windowSize.width, styles);
  }, [windowSize.width]);

  // Función para obtener el tamaño del canvas basado en el dispositivo
  const getCanvasSize = useCallback(() => {
    const baseSize = { width: 800, height: 600 };
    
    if (isMobile) {
      return {
        width: Math.min(windowSize.width - 32, 400),
        height: Math.min(windowSize.height - 200, 300)
      };
    } else if (isTablet) {
      return {
        width: Math.min(windowSize.width - 400, 600),
        height: Math.min(windowSize.height - 100, 450)
      };
    } else {
      return {
        width: Math.min(windowSize.width - 500, baseSize.width),
        height: Math.min(windowSize.height - 100, baseSize.height)
      };
    }
  }, [windowSize, isMobile, isTablet]);

  // Función para obtener el tamaño del panel
  const getPanelSize = useCallback(() => {
    if (isMobile) {
      return {
        width: '100%',
        height: '60vh',
        maxHeight: '400px'
      };
    } else if (isTablet) {
      return {
        width: '320px',
        height: '100%'
      };
    } else {
      return {
        width: '360px',
        height: '100%'
      };
    }
  }, [isMobile, isTablet]);

  // Función para obtener la posición del panel
  const getPanelPosition = useCallback(() => {
    if (isMobile) {
      return {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        transform: isPanelOpen ? 'translateY(0)' : 'translateY(100%)'
      };
    } else if (isTablet) {
      return {
        position: 'fixed',
        top: 0,
        right: 0,
        transform: isPanelOpen ? 'translateX(0)' : 'translateX(100%)'
      };
    } else {
      return {
        position: 'relative',
        transform: 'none'
      };
    }
  }, [isMobile, isTablet, isPanelOpen]);

  // Función para obtener la posición del botón de toggle del panel
  const getPanelTogglePosition = useCallback(() => {
    if (isMobile) {
      return {
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 1001
      };
    } else if (isTablet) {
      return {
        position: 'fixed',
        top: '50%',
        right: '16px',
        transform: 'translateY(-50%)',
        zIndex: 1001
      };
    } else {
      return {
        display: 'none'
      };
    }
  }, [isMobile, isTablet]);

  // Función para obtener el layout del editor
  const getEditorLayout = useCallback(() => {
    return {
      ...currentLayout.editor,
      ...(isMobile && {
        flexDirection: 'column',
        height: '100vh',
        padding: '8px',
        gap: '8px'
      }),
      ...(isTablet && {
        flexDirection: 'row',
        height: '100vh',
        padding: '12px',
        gap: '12px'
      }),
      ...(isDesktop && {
        flexDirection: 'row',
        height: '100vh',
        padding: '16px',
        gap: '16px'
      })
    };
  }, [currentLayout, isMobile, isTablet, isDesktop]);

  // Función para obtener el layout del toolbar
  const getToolbarLayout = useCallback(() => {
    return {
      ...currentLayout.toolbar,
      ...(isMobile && {
        height: '56px',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px'
      }),
      ...(isTablet && {
        height: '64px',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px'
      }),
      ...(isDesktop && {
        height: '72px',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px'
      })
    };
  }, [currentLayout, isMobile, isTablet, isDesktop]);

  // Función para obtener el layout del canvas
  const getCanvasLayout = useCallback(() => {
    return {
      ...currentLayout.canvas,
      ...(isMobile && {
        flex: 1,
        minHeight: '300px'
      }),
      ...(isTablet && {
        flex: 1
      }),
      ...(isDesktop && {
        flex: 1
      })
    };
  }, [currentLayout, isMobile, isTablet, isDesktop]);

  // Función para obtener el layout del panel
  const getPanelLayout = useCallback(() => {
    const panelSize = getPanelSize();
    const panelPosition = getPanelPosition();
    
    return {
      ...currentLayout.panel,
      ...panelSize,
      ...panelPosition,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1000
    };
  }, [currentLayout, getPanelSize, getPanelPosition]);

  // Función para obtener el layout del botón de toggle
  const getPanelToggleLayout = useCallback(() => {
    const togglePosition = getPanelTogglePosition();
    
    return {
      ...currentLayout.panelToggle,
      ...togglePosition,
      width: isMobile ? '56px' : '48px',
      height: isMobile ? '56px' : '48px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #1F64BF 0%, #4A8BDF 100%)',
      boxShadow: '0 4px 12px rgba(31,100,191,0.3), 0 2px 4px rgba(0,0,0,0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: isMobile ? 'scale(1.05)' : 'translateY(-50%) scale(1.05)',
        boxShadow: '0 6px 20px rgba(31,100,191,0.4), 0 4px 8px rgba(0,0,0,0.3)'
      }
    };
  }, [currentLayout, getPanelTogglePosition, isMobile]);

  // Función para verificar si un elemento debe mostrarse en el breakpoint actual
  const shouldShow = useCallback((breakpoints) => {
    if (typeof breakpoints === 'string') {
      return breakpoints === currentBreakpoint;
    }
    if (Array.isArray(breakpoints)) {
      return breakpoints.includes(currentBreakpoint);
    }
    if (typeof breakpoints === 'object') {
      return breakpoints[currentBreakpoint] === true;
    }
    return true;
  }, [currentBreakpoint]);

  // Función para obtener el número de columnas para grids responsivos
  const getGridColumns = useCallback((baseColumns = 1) => {
    if (isMobile) return 1;
    if (isTablet) return Math.min(baseColumns, 2);
    return baseColumns;
  }, [isMobile, isTablet]);

  // Función para obtener el tamaño de fuente responsivo
  const getResponsiveFontSize = useCallback((baseSize) => {
    if (isMobile) return baseSize * 0.9;
    if (isTablet) return baseSize * 0.95;
    return baseSize;
  }, [isMobile, isTablet]);

  // Función para obtener el espaciado responsivo
  const getResponsiveSpacing = useCallback((baseSpacing) => {
    if (isMobile) return baseSpacing * 0.75;
    if (isTablet) return baseSpacing * 0.875;
    return baseSpacing;
  }, [isMobile, isTablet]);

  return {
    // Información básica
    windowSize,
    currentBreakpoint,
    currentLayout,
    isMobile,
    isTablet,
    isDesktop,
    
    // Estado del panel
    isPanelOpen,
    activePanel,
    
    // Funciones de control
    togglePanel,
    openPanel,
    closePanel,
    changeActivePanel,
    
    // Funciones de layout
    getResponsiveStyles,
    getCanvasSize,
    getPanelSize,
    getPanelPosition,
    getPanelTogglePosition,
    getEditorLayout,
    getToolbarLayout,
    getCanvasLayout,
    getPanelLayout,
    getPanelToggleLayout,
    
    // Utilidades
    shouldShow,
    getGridColumns,
    getResponsiveFontSize,
    getResponsiveSpacing,
    
    // Constantes
    breakpoints: RESPONSIVE_BREAKPOINTS,
    layouts: RESPONSIVE_LAYOUTS
  };
};

export default useResponsiveLayout;
