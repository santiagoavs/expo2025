// responsiveTheme.js - SISTEMA RESPONSIVO COMPLETO PARA EDITOR KONVA
import { createTheme } from '@mui/material/styles';

// ==================== BREAKPOINTS RESPONSIVOS ====================
const RESPONSIVE_BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
  // Breakpoints específicos para el editor
  editor: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    wide: 1600
  }
};

// ==================== COLORES FIJOS INDEPENDIENTES DEL TEMA ====================
const FIXED_COLORS = {
  // Colores principales - NO cambian con el tema del navegador
  primary: '#1F64BF',
  primaryDark: '#0F4A8F',
  primaryLight: '#4A8BDF',
  secondary: '#FF6B35',
  secondaryDark: '#E55A2B',
  secondaryLight: '#FF8A5B',
  
  // Colores de superficie
  background: '#0A0E1A',
  surface: '#1A1F2E',
  surfaceLight: '#2A2F3E',
  surfaceDark: '#0F1419',
  
  // Colores de texto
  text: '#FFFFFF',
  textSecondary: '#B0B8CC',
  textDisabled: '#6B7280',
  
  // Colores de estado
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Colores de borde y divisores
  border: '#374151',
  borderLight: '#4B5563',
  borderDark: '#1F2937',
  divider: '#374151',
  
  // Colores de overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.3)'
};

// ==================== GRADIENTES 3D ====================
const GRADIENTS_3D = {
  // Gradientes principales
  primary: 'linear-gradient(135deg, #1F64BF 0%, #4A8BDF 50%, #1F64BF 100%)',
  primaryHover: 'linear-gradient(135deg, #0F4A8F 0%, #1F64BF 50%, #0F4A8F 100%)',
  secondary: 'linear-gradient(135deg, #FF6B35 0%, #FF8A5B 50%, #FF6B35 100%)',
  
  // Gradientes de superficie
  background: 'linear-gradient(135deg, #0A0E1A 0%, #1A1F2E 50%, #0A0E1A 100%)',
  surface: 'linear-gradient(135deg, #1A1F2E 0%, #2A2F3E 50%, #1A1F2E 100%)',
  surfaceHover: 'linear-gradient(135deg, #2A2F3E 0%, #3A3F4E 50%, #2A2F3E 100%)',
  
  // Gradientes de panel
  panel: 'linear-gradient(135deg, #1A1F2E 0%, #2A2F3E 30%, #1A1F2E 100%)',
  toolbar: 'linear-gradient(135deg, #0F1419 0%, #1A1F2E 50%, #0F1419 100%)',
  
  // Gradientes de botones
  button: 'linear-gradient(135deg, #1F64BF 0%, #4A8BDF 100%)',
  buttonHover: 'linear-gradient(135deg, #0F4A8F 0%, #1F64BF 100%)',
  buttonSecondary: 'linear-gradient(135deg, #374151 0%, #4B5563 100%)',
  
  // Gradientes de efectos 3D
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  glassHover: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
  shadow: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
};

// ==================== SOMBRAS 3D ====================
const SHADOWS_3D = {
  // Sombras básicas
  light: '0 2px 4px rgba(0,0,0,0.1)',
  medium: '0 4px 8px rgba(0,0,0,0.2)',
  heavy: '0 8px 16px rgba(0,0,0,0.3)',
  
  // Sombras 3D específicas
  panel: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
  button: '0 4px 12px rgba(31,100,191,0.3), 0 2px 4px rgba(0,0,0,0.2)',
  buttonHover: '0 6px 20px rgba(31,100,191,0.4), 0 4px 8px rgba(0,0,0,0.3)',
  modal: '0 20px 60px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)',
  toolbar: '0 4px 16px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
  
  // Sombras de elevación
  elevation1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  elevation2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  elevation3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  elevation4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  elevation5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)'
};

// ==================== BORDES Y RADIOS ====================
const BORDERS = {
  radius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xlarge: '16px',
    round: '50%'
  },
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px'
  }
};

// ==================== TRANSICIONES ====================
const TRANSITIONS = {
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};

// ==================== Z-INDEX ESCALONADOS ====================
const Z_INDEX = {
  // Nivel base del editor
  base: 2000,        
  canvas: 2001,      // Canvas del editor
  toolbar: 2100,     // Toolbar flotante
  panel: 2200,       // Panel de herramientas
  panelToggle: 2210, // Botón flotante del panel
  
  // Nivel de overlays y modales
  overlay: 3000,     // Overlays del editor
  modal: 4000,       // Modales de creación de diseños
  viewer: 5000,      // Modal del viewer de diseños
  viewerContent: 5100, // Contenido del viewer
  
  // Nivel superior
  toast: 6000,       // Notificaciones toast
  tooltip: 6100,     // Tooltips
  contextMenu: 6200, // Menús contextuales
  dragDrop: 6300     // Elementos en drag & drop
};

// ==================== LAYOUTS RESPONSIVOS ====================
const RESPONSIVE_LAYOUTS = {
  // Layout para móviles (xs, sm)
  mobile: {
    editor: {
      flexDirection: 'column',
      height: '100vh',
      padding: '8px',
      gap: '8px'
    },
    toolbar: {
      height: '56px',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 16px',
      borderRadius: BORDERS.radius.medium,
      background: GRADIENTS_3D.toolbar,
      boxShadow: SHADOWS_3D.toolbar
    },
    canvas: {
      flex: 1,
      minHeight: '300px',
      borderRadius: BORDERS.radius.medium,
      background: GRADIENTS_3D.surface,
      boxShadow: SHADOWS_3D.panel
    },
    panel: {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      height: '60vh',
      maxHeight: '400px',
      borderRadius: `${BORDERS.radius.large} ${BORDERS.radius.large} 0 0`,
      background: GRADIENTS_3D.panel,
      boxShadow: SHADOWS_3D.modal,
      transform: 'translateY(100%)',
      transition: TRANSITIONS.normal,
      zIndex: Z_INDEX.panel,
      '&.open': {
        transform: 'translateY(0)'
      }
    },
    panelToggle: {
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      width: '56px',
      height: '56px',
      borderRadius: BORDERS.radius.round,
      background: GRADIENTS_3D.primary,
      boxShadow: SHADOWS_3D.button,
      zIndex: Z_INDEX.panel + 1
    }
  },
  
  // Layout para tablets (md)
  tablet: {
    editor: {
      flexDirection: 'row',
      height: '100vh',
      padding: '12px',
      gap: '12px'
    },
    toolbar: {
      height: '64px',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      borderRadius: BORDERS.radius.medium,
      background: GRADIENTS_3D.toolbar,
      boxShadow: SHADOWS_3D.toolbar
    },
    canvas: {
      flex: 1,
      borderRadius: BORDERS.radius.large,
      background: GRADIENTS_3D.surface,
      boxShadow: SHADOWS_3D.panel
    },
    panel: {
      width: '320px',
      height: '100%',
      borderRadius: BORDERS.radius.large,
      background: GRADIENTS_3D.panel,
      boxShadow: SHADOWS_3D.panel,
      transform: 'translateX(100%)',
      transition: TRANSITIONS.normal,
      zIndex: Z_INDEX.panel,
      '&.open': {
        transform: 'translateX(0)'
      }
    },
    panelToggle: {
      position: 'fixed',
      top: '50%',
      right: '16px',
      transform: 'translateY(-50%)',
      width: '48px',
      height: '48px',
      borderRadius: BORDERS.radius.round,
      background: GRADIENTS_3D.primary,
      boxShadow: SHADOWS_3D.button,
      zIndex: Z_INDEX.panel + 1
    }
  },
  
  // Layout para desktop (lg, xl)
  desktop: {
    editor: {
      flexDirection: 'row',
      height: '100vh',
      padding: '16px',
      gap: '16px'
    },
    toolbar: {
      height: '72px',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 24px',
      borderRadius: BORDERS.radius.large,
      background: GRADIENTS_3D.toolbar,
      boxShadow: SHADOWS_3D.toolbar
    },
    canvas: {
      flex: 1,
      borderRadius: BORDERS.radius.large,
      background: GRADIENTS_3D.surface,
      boxShadow: SHADOWS_3D.panel
    },
    panel: {
      width: '360px',
      height: '100%',
      borderRadius: BORDERS.radius.large,
      background: GRADIENTS_3D.panel,
      boxShadow: SHADOWS_3D.panel
    }
  }
};

// ==================== UTILIDADES RESPONSIVAS ====================
const RESPONSIVE_UTILS = {
  // Función para obtener el layout actual basado en el ancho de pantalla
  getCurrentLayout: (width) => {
    if (width < RESPONSIVE_BREAKPOINTS.editor.mobile) {
      return RESPONSIVE_LAYOUTS.mobile;
    } else if (width < RESPONSIVE_BREAKPOINTS.editor.tablet) {
      return RESPONSIVE_LAYOUTS.tablet;
    } else {
      return RESPONSIVE_LAYOUTS.desktop;
    }
  },
  
  // Función para obtener el breakpoint actual
  getCurrentBreakpoint: (width) => {
    if (width < RESPONSIVE_BREAKPOINTS.editor.mobile) return 'mobile';
    if (width < RESPONSIVE_BREAKPOINTS.editor.tablet) return 'tablet';
    if (width < RESPONSIVE_BREAKPOINTS.editor.desktop) return 'desktop';
    return 'wide';
  },
  
  // Función para verificar si es móvil
  isMobile: (width) => width < RESPONSIVE_BREAKPOINTS.editor.mobile,
  
  // Función para verificar si es tablet
  isTablet: (width) => width >= RESPONSIVE_BREAKPOINTS.editor.mobile && width < RESPONSIVE_BREAKPOINTS.editor.tablet,
  
  // Función para verificar si es desktop
  isDesktop: (width) => width >= RESPONSIVE_BREAKPOINTS.editor.tablet,
  
  // Función para obtener estilos responsivos
  getResponsiveStyles: (width, styles) => {
    const breakpoint = RESPONSIVE_UTILS.getCurrentBreakpoint(width);
    return {
      ...styles.base,
      ...(styles[breakpoint] || {})
    };
  }
};

// ==================== TEMA MUI RESPONSIVO ====================
export const responsiveTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: FIXED_COLORS.primary,
      dark: FIXED_COLORS.primaryDark,
      light: FIXED_COLORS.primaryLight,
      contrastText: FIXED_COLORS.text
    },
    secondary: {
      main: FIXED_COLORS.secondary,
      dark: FIXED_COLORS.secondaryDark,
      light: FIXED_COLORS.secondaryLight,
      contrastText: FIXED_COLORS.text
    },
    background: {
      default: FIXED_COLORS.background,
      paper: FIXED_COLORS.surface
    },
    text: {
      primary: FIXED_COLORS.text,
      secondary: FIXED_COLORS.textSecondary,
      disabled: FIXED_COLORS.textDisabled
    },
    divider: FIXED_COLORS.divider,
    error: {
      main: FIXED_COLORS.error
    },
    warning: {
      main: FIXED_COLORS.warning
    },
    info: {
      main: FIXED_COLORS.info
    },
    success: {
      main: FIXED_COLORS.success
    }
  },
  
  breakpoints: {
    values: RESPONSIVE_BREAKPOINTS
  },
  
  shape: {
    borderRadius: parseInt(BORDERS.radius.medium)
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none'
    }
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: BORDERS.radius.medium,
          textTransform: 'none',
          fontWeight: 600,
          transition: TRANSITIONS.fast,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: SHADOWS_3D.buttonHover
          }
        },
        contained: {
          background: GRADIENTS_3D.button,
          boxShadow: SHADOWS_3D.button,
          '&:hover': {
            background: GRADIENTS_3D.buttonHover,
            boxShadow: SHADOWS_3D.buttonHover
          }
        },
        outlined: {
          borderColor: FIXED_COLORS.border,
          color: FIXED_COLORS.text,
          '&:hover': {
            borderColor: FIXED_COLORS.primary,
            backgroundColor: 'rgba(31, 100, 191, 0.1)'
          }
        }
      }
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          background: GRADIENTS_3D.surface,
          border: `1px solid ${FIXED_COLORS.border}`,
          boxShadow: SHADOWS_3D.panel
        }
      }
    },
    
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: GRADIENTS_3D.panel,
          border: `1px solid ${FIXED_COLORS.border}`,
          boxShadow: SHADOWS_3D.modal,
          borderRadius: BORDERS.radius.large
        }
      }
    },
    
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: FIXED_COLORS.overlay,
          backdropFilter: 'blur(8px)'
        }
      }
    }
  }
});

// ==================== EXPORTACIONES ====================
export {
  RESPONSIVE_BREAKPOINTS,
  FIXED_COLORS,
  GRADIENTS_3D,
  SHADOWS_3D,
  BORDERS,
  TRANSITIONS,
  Z_INDEX,
  RESPONSIVE_LAYOUTS,
  RESPONSIVE_UTILS
};

export default responsiveTheme;
