// useFixedColors.js - HOOK PARA SISTEMA DE COLORES FIJOS INDEPENDIENTE DEL TEMA
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FIXED_COLORS, GRADIENTS_3D } from '../styles/responsiveTheme';

/**
 * Hook para manejar colores fijos que no cambian con el tema del navegador
 * Garantiza consistencia visual independientemente del modo claro/oscuro del sistema
 */
export const useFixedColors = () => {
  const [isSystemDarkMode, setIsSystemDarkMode] = useState(false);
  const [forcedTheme, setForcedTheme] = useState(null); // 'light', 'dark', null (auto)

  // ==================== DETECCIÓN DEL TEMA DEL SISTEMA ====================
  
  // Detectar si el sistema está en modo oscuro
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsSystemDarkMode(mediaQuery.matches);

    const handleChange = (e) => {
      setIsSystemDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // ==================== APLICACIÓN DE COLORES FIJOS ====================
  
  // Aplicar colores fijos al documento
  const applyFixedColors = useCallback(() => {
    const root = document.documentElement;
    
    // Aplicar variables CSS personalizadas
    root.style.setProperty('--fixed-primary', FIXED_COLORS.primary);
    root.style.setProperty('--fixed-primary-dark', FIXED_COLORS.primaryDark);
    root.style.setProperty('--fixed-primary-light', FIXED_COLORS.primaryLight);
    root.style.setProperty('--fixed-secondary', FIXED_COLORS.secondary);
    root.style.setProperty('--fixed-background', FIXED_COLORS.background);
    root.style.setProperty('--fixed-surface', FIXED_COLORS.surface);
    root.style.setProperty('--fixed-surface-light', FIXED_COLORS.surfaceLight);
    root.style.setProperty('--fixed-surface-dark', FIXED_COLORS.surfaceDark);
    root.style.setProperty('--fixed-text', FIXED_COLORS.text);
    root.style.setProperty('--fixed-text-secondary', FIXED_COLORS.textSecondary);
    root.style.setProperty('--fixed-text-disabled', FIXED_COLORS.textDisabled);
    root.style.setProperty('--fixed-border', FIXED_COLORS.border);
    root.style.setProperty('--fixed-border-light', FIXED_COLORS.borderLight);
    root.style.setProperty('--fixed-border-dark', FIXED_COLORS.borderDark);
    root.style.setProperty('--fixed-divider', FIXED_COLORS.divider);
    root.style.setProperty('--fixed-success', FIXED_COLORS.success);
    root.style.setProperty('--fixed-warning', FIXED_COLORS.warning);
    root.style.setProperty('--fixed-error', FIXED_COLORS.error);
    root.style.setProperty('--fixed-info', FIXED_COLORS.info);
    root.style.setProperty('--fixed-overlay', FIXED_COLORS.overlay);
    root.style.setProperty('--fixed-overlay-light', FIXED_COLORS.overlayLight);
    root.style.setProperty('--fixed-backdrop', FIXED_COLORS.backdrop);

    // Aplicar gradientes
    root.style.setProperty('--fixed-gradient-primary', GRADIENTS_3D.primary);
    root.style.setProperty('--fixed-gradient-primary-hover', GRADIENTS_3D.primaryHover);
    root.style.setProperty('--fixed-gradient-secondary', GRADIENTS_3D.secondary);
    root.style.setProperty('--fixed-gradient-background', GRADIENTS_3D.background);
    root.style.setProperty('--fixed-gradient-surface', GRADIENTS_3D.surface);
    root.style.setProperty('--fixed-gradient-surface-hover', GRADIENTS_3D.surfaceHover);
    root.style.setProperty('--fixed-gradient-panel', GRADIENTS_3D.panel);
    root.style.setProperty('--fixed-gradient-toolbar', GRADIENTS_3D.toolbar);
    root.style.setProperty('--fixed-gradient-button', GRADIENTS_3D.button);
    root.style.setProperty('--fixed-gradient-button-hover', GRADIENTS_3D.buttonHover);
    root.style.setProperty('--fixed-gradient-glass', GRADIENTS_3D.glass);
    root.style.setProperty('--fixed-gradient-glass-hover', GRADIENTS_3D.glassHover);

    // Forzar el tema del editor independientemente del sistema
    root.setAttribute('data-editor-theme', 'fixed-dark');
    root.classList.add('editor-fixed-theme');
  }, []);

  // Remover colores fijos
  const removeFixedColors = useCallback(() => {
    const root = document.documentElement;
    
    // Remover variables CSS personalizadas
    const fixedProperties = [
      '--fixed-primary', '--fixed-primary-dark', '--fixed-primary-light',
      '--fixed-secondary', '--fixed-background', '--fixed-surface',
      '--fixed-surface-light', '--fixed-surface-dark', '--fixed-text',
      '--fixed-text-secondary', '--fixed-text-disabled', '--fixed-border',
      '--fixed-border-light', '--fixed-border-dark', '--fixed-divider',
      '--fixed-success', '--fixed-warning', '--fixed-error', '--fixed-info',
      '--fixed-overlay', '--fixed-overlay-light', '--fixed-backdrop',
      '--fixed-gradient-primary', '--fixed-gradient-primary-hover',
      '--fixed-gradient-secondary', '--fixed-gradient-background',
      '--fixed-gradient-surface', '--fixed-gradient-surface-hover',
      '--fixed-gradient-panel', '--fixed-gradient-toolbar',
      '--fixed-gradient-button', '--fixed-gradient-button-hover',
      '--fixed-gradient-glass', '--fixed-gradient-glass-hover'
    ];

    fixedProperties.forEach(prop => {
      root.style.removeProperty(prop);
    });

    // Remover atributos del tema
    root.removeAttribute('data-editor-theme');
    root.classList.remove('editor-fixed-theme');
  }, []);

  // ==================== CONTROL DEL TEMA ====================
  
  // Forzar tema claro
  const forceLightTheme = useCallback(() => {
    setForcedTheme('light');
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    root.classList.add('force-light-theme');
    root.classList.remove('force-dark-theme');
  }, []);

  // Forzar tema oscuro
  const forceDarkTheme = useCallback(() => {
    setForcedTheme('dark');
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    root.classList.add('force-dark-theme');
    root.classList.remove('force-light-theme');
  }, []);

  // Usar tema automático (seguir sistema)
  const useAutoTheme = useCallback(() => {
    setForcedTheme(null);
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    root.classList.remove('force-light-theme', 'force-dark-theme');
  }, []);

  // ==================== UTILIDADES DE COLOR ====================
  
  // Obtener color con opacidad
  const getColorWithOpacity = useCallback((color, opacity) => {
    // Convertir hex a rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, []);

  // Obtener color contrastante
  const getContrastColor = useCallback((backgroundColor) => {
    // Calcular luminancia
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? FIXED_COLORS.text : FIXED_COLORS.text;
  }, []);

  // Obtener color hover
  const getHoverColor = useCallback((baseColor, intensity = 0.1) => {
    return getColorWithOpacity(baseColor, intensity);
  }, [getColorWithOpacity]);

  // Obtener color activo
  const getActiveColor = useCallback((baseColor, intensity = 0.2) => {
    return getColorWithOpacity(baseColor, intensity);
  }, [getColorWithOpacity]);

  // ==================== PALETAS DE COLORES ====================
  
  // Paleta de colores primarios
  const primaryPalette = useMemo(() => ({
    main: FIXED_COLORS.primary,
    light: FIXED_COLORS.primaryLight,
    dark: FIXED_COLORS.primaryDark,
    hover: getHoverColor(FIXED_COLORS.primary),
    active: getActiveColor(FIXED_COLORS.primary),
    contrast: getContrastColor(FIXED_COLORS.primary)
  }), [getHoverColor, getActiveColor, getContrastColor]);

  // Paleta de colores secundarios
  const secondaryPalette = useMemo(() => ({
    main: FIXED_COLORS.secondary,
    light: FIXED_COLORS.secondaryLight,
    dark: FIXED_COLORS.secondaryDark,
    hover: getHoverColor(FIXED_COLORS.secondary),
    active: getActiveColor(FIXED_COLORS.secondary),
    contrast: getContrastColor(FIXED_COLORS.secondary)
  }), [getHoverColor, getActiveColor, getContrastColor]);

  // Paleta de colores de superficie
  const surfacePalette = useMemo(() => ({
    main: FIXED_COLORS.surface,
    light: FIXED_COLORS.surfaceLight,
    dark: FIXED_COLORS.surfaceDark,
    hover: getHoverColor(FIXED_COLORS.surface),
    active: getActiveColor(FIXED_COLORS.surface),
    contrast: getContrastColor(FIXED_COLORS.surface)
  }), [getHoverColor, getActiveColor, getContrastColor]);

  // Paleta de colores de texto
  const textPalette = useMemo(() => ({
    primary: FIXED_COLORS.text,
    secondary: FIXED_COLORS.textSecondary,
    disabled: FIXED_COLORS.textDisabled,
    contrast: getContrastColor(FIXED_COLORS.background)
  }), [getContrastColor]);

  // ==================== ESTILOS DINÁMICOS ====================
  
  // Obtener estilos para botón
  const getButtonStyles = useCallback((variant = 'primary', size = 'medium') => {
    const baseStyles = {
      borderRadius: '8px',
      fontWeight: 600,
      textTransform: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      },
      '&:active': {
        transform: 'translateY(0)'
      }
    };

    const sizeStyles = {
      small: {
        minHeight: 32,
        padding: '6px 12px',
        fontSize: '0.875rem'
      },
      medium: {
        minHeight: 40,
        padding: '8px 16px',
        fontSize: '1rem'
      },
      large: {
        minHeight: 48,
        padding: '12px 24px',
        fontSize: '1.125rem'
      }
    };

    const variantStyles = {
      primary: {
        background: GRADIENTS_3D.button,
        color: 'white',
        border: 'none',
        '&:hover': {
          background: GRADIENTS_3D.buttonHover,
          ...baseStyles['&:hover']
        }
      },
      secondary: {
        background: 'transparent',
        color: FIXED_COLORS.primary,
        border: `1px solid ${FIXED_COLORS.primary}`,
        '&:hover': {
          background: getHoverColor(FIXED_COLORS.primary),
          ...baseStyles['&:hover']
        }
      },
      outlined: {
        background: 'transparent',
        color: FIXED_COLORS.text,
        border: `1px solid ${FIXED_COLORS.border}`,
        '&:hover': {
          background: getHoverColor(FIXED_COLORS.primary),
          borderColor: FIXED_COLORS.primary,
          ...baseStyles['&:hover']
        }
      }
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant]
    };
  }, [getHoverColor]);

  // Obtener estilos para panel
  const getPanelStyles = useCallback((elevation = 1) => {
    const elevations = {
      1: {
        background: FIXED_COLORS.surface,
        border: `1px solid ${FIXED_COLORS.border}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      },
      2: {
        background: FIXED_COLORS.surface,
        border: `1px solid ${FIXED_COLORS.border}`,
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
      },
      3: {
        background: FIXED_COLORS.surface,
        border: `1px solid ${FIXED_COLORS.border}`,
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
      }
    };

    return {
      ...elevations[elevation],
      borderRadius: '12px',
      overflow: 'hidden'
    };
  }, []);

  // ==================== EFECTOS ====================
  
  // Aplicar colores fijos al montar
  useEffect(() => {
    applyFixedColors();
    return () => removeFixedColors();
  }, [applyFixedColors, removeFixedColors]);

  // ==================== RETORNO ====================
  
  return {
    // Estados
    isSystemDarkMode,
    forcedTheme,
    
    // Funciones de control
    applyFixedColors,
    removeFixedColors,
    forceLightTheme,
    forceDarkTheme,
    useAutoTheme,
    
    // Utilidades de color
    getColorWithOpacity,
    getContrastColor,
    getHoverColor,
    getActiveColor,
    
    // Paletas
    primaryPalette,
    secondaryPalette,
    surfacePalette,
    textPalette,
    
    // Estilos dinámicos
    getButtonStyles,
    getPanelStyles,
    
    // Colores fijos
    colors: FIXED_COLORS,
    gradients: GRADIENTS_3D
  };
};

export default useFixedColors;
