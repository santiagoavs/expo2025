// src/pages/DesignManagement/DesignManagement.jsx - PANEL ADMINISTRATIVO MEJORADO CON ESTRUCTURA DE CATALOG
import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Chip,
  Paper,
  styled,
  useTheme,
  alpha,
  Skeleton,
  Tooltip,
  Badge,
  IconButton
} from '@mui/material';
import {
  Palette,
  Eye,
  TrendUp,
  Plus,
  Funnel,
  MagnifyingGlass,
  ArrowsClockwise,
  GridNine,
  Broom,
  Users,
  Clock,
  CheckCircle,
  Money,
  Package,
  Warning,
  XCircle,
  ChartLine,
  Calendar,
  FileText,
  Download,
  SortAscending,
  SortDescending,
  PencilSimple
} from '@phosphor-icons/react';

// Importar componentes personalizados  
import DesignCard from '../../components/DesignCard/DesignCard';
import CreateDesignModal from '../../components/CreateDesignModal/CreateDesignModal';
import QuoteDesignModal from '../../components/QuoteDesignModal/QuoteDesignModal';
import KonvaDesignViewer from '../../components/KonvaDesignEditor/components/KonvaDesignViewer';

// Importar hooks personalizados
import useDesigns from '../../hooks/useDesigns';
import useProducts from '../../hooks/useProducts';
import useUsers from '../../hooks/useUsers';

// Configuración global de SweetAlert2
Swal.mixin({
  customClass: {
    container: 'swal-overlay-custom',
    popup: 'swal-modal-custom'
  },
  didOpen: () => {
    const container = document.querySelector('.swal-overlay-custom');
    if (container) {
      container.style.zIndex = '2000';
    }
  }
});

// ================ KEYFRAMES PARA ANIMACIÓN DE MÁRMOL MUY VISIBLE ================ const marbleFlowKeyframes = ` @keyframes marbleFlow { 0% { transform: translate(2%, 2%) rotate(0deg) scale(1); } 25% { transform: translate(-8%, -8%) rotate(5deg) scale(1.05); } 50% { transform: translate(-15%, 8%) rotate(-3deg) scale(1.08); } 75% { transform: translate(-8%, -5%) rotate(2deg) scale(1.05); } 100% { transform: translate(2%, 2%) rotate(0deg) scale(1); } } `; // Inyectar keyframes en el documento if (typeof document !== 'undefined') { const styleSheet = document.createElement('style'); styleSheet.textContent = marbleFlowKeyframes; document.head.appendChild(styleSheet); } // ================ ESTILOS MODERNOS RESPONSIVE - DISEÑOS ================ 
const DesignPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const DesignContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1600px', // Más ancho para mejor uso del espacio
  margin: '0 auto',
  paddingTop: '120px',
  paddingBottom: '40px',
  paddingLeft: '32px',
  paddingRight: '32px',
  minHeight: 'calc(100vh - 120px)',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('xl')]: {
    maxWidth: '1400px',
    paddingLeft: '28px',
    paddingRight: '28px',
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '1200px',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: '110px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: '100px',
    paddingLeft: '16px',
    paddingRight: '16px',
  }
}));

const DesignModernCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  }
}));

const DesignHeaderSection = styled(DesignModernCard)(({ theme }) => ({
  padding: '40px',
  marginBottom: '32px',
  fontWeight: '700 !important',
  background: 'white',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.down('lg')]: {
    padding: '32px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '24px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
    marginBottom: '20px',
  }
}));

const DesignHeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center', // Centrado vertical
  justifyContent: 'space-between',
  gap: '32px',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    gap: '24px',
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center', // Centrado en móvil
    textAlign: 'center', // Texto centrado
    gap: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
  }
}));

const DesignHeaderInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start', // Alineación a la izquierda en desktop
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    alignItems: 'center', // Centrado en móvil
    textAlign: 'center',
  }
}));

const DesignMainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: '700 !important',
  color: '#010326',
  marginBottom: '12px',
  letterSpacing: '-0.025em',
  lineHeight: 1.2,
  textAlign: 'left',
  fontFamily: "'Mona Sans'",
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  [theme.breakpoints.down('lg')]: {
    fontSize: '2.2rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '1.8rem',
    textAlign: 'center',
    justifyContent: 'center',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.6rem',
  }
}));

const DesignMainDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: '#032CA6',
  fontWeight: '700 !important',
  lineHeight: 1.6,
  opacity: 0.9,
  textAlign: 'left',
  maxWidth: '600px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '1rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '0.95rem',
    textAlign: 'center',
    maxWidth: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  }
}));

const DesignHeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    gap: '12px',
  },
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    width: '100%',
    gap: '10px',
    '& > *': {
      flex: 1,
    }
  }
}));

const DesignPrimaryActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  boxShadow: '0 2px 12px rgba(31, 100, 191, 0.18)',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  minWidth: '160px',
  whiteSpace: 'nowrap',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.5s ease',
    zIndex: 1,
  },
  '& .MuiButton-startIcon, & span': {
    position: 'relative',
    zIndex: 2,
  },
  '&:hover': {
    boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
    transform: 'translateY(-1px) scale(1.02)',
    '&::before': {
      left: '100%',
    }
  },
  '&:active': {
    transform: 'translateY(0)',
    transition: 'transform 0.1s ease-out',
  },
  '&:disabled': {
    background: alpha('#1F64BF', 0.3),
    color: alpha('#ffffff', 0.7),
    boxShadow: 'none',
    transform: 'none',
    '&::before': {
      display: 'none',
    }
  },
  [theme.breakpoints.down('lg')]: {
    minWidth: '140px',
    padding: '12px 24px',
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: 'auto',
    flex: 1,
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    padding: '12px 20px',
    fontSize: '0.85rem',
  }
}));

const DesignSecondaryActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '14px 24px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  borderColor: alpha('#1F64BF', 0.25),
  color: '#1F64BF',
  minWidth: '140px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  boxShadow: '0 2px 8px rgba(31, 100, 191, 0.08)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)',
    transition: 'left 0.5s ease',
    zIndex: 1,
  },
  '& .MuiButton-startIcon, & span': {
    position: 'relative',
    zIndex: 2,
  },
  '&:hover': {
    borderColor: '#1F64BF',
    transform: 'translateY(-1px) scale(1.02)',
    boxShadow: '0 4px 12px rgba(31, 100, 191, 0.12)',
    '&::before': {
      left: '100%',
    }
  },
  '&:active': {
    transform: 'translateY(0)',
    transition: 'transform 0.1s ease-out',
  },
  [theme.breakpoints.down('lg')]: {
    minWidth: '120px',
    padding: '12px 20px',
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: 'auto',
    flex: 1,
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    padding: '12px 16px',
    fontSize: '0.85rem',
  }
}));

const DesignActionIconButton = styled(IconButton)(({ theme }) => ({
  background: alpha('#1F64BF', 0.08),
  color: '#1F64BF',
  borderRadius: '12px',
  width: '52px',
  height: '52px',
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  flexShrink: 0,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: alpha('#1F64BF', 0.12),
    transform: 'scale(0)',
    borderRadius: '50%',
    transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  '& svg': {
    position: 'relative',
    zIndex: 2,
  },
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 16px rgba(31, 100, 191, 0.2)',
    '&::before': {
      transform: 'scale(1)',
    }
  },
  '&:active': {
    transform: 'translateY(0)',
    transition: 'transform 0.1s ease-out',
  },
  [theme.breakpoints.down('lg')]: {
    width: '48px',
    height: '48px',
  },
  [theme.breakpoints.down('md')]: {
    width: '48px',
    height: '48px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '48px',
    height: '48px',
  }
}));

// CONTENEDOR UNIFICADO DISEÑOS
const DesignUnifiedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
}));

const DesignStatsContainer = styled(DesignUnifiedContainer)(({ theme }) => ({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
}));

// GRID DE ESTADÍSTICAS DISEÑOS - MEJORADO
const DesignStatsGrid = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gap: '24px',
  // Grid responsivo mejorado
  gridTemplateColumns: 'repeat(4, 1fr)', // Desktop - 4 columnas iguales
  [theme.breakpoints.down(1400)]: { // Pantallas grandes pero no ultra wide
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  [theme.breakpoints.down('lg')]: { // Tablets grandes (≥992px) 
    gridTemplateColumns: 'repeat(2, 1fr)', // 2x2 grid para tablets
    gap: '18px',
  },
  [theme.breakpoints.down('md')]: { // Tablets pequeñas (≥768px)
    gridTemplateColumns: 'repeat(2, 1fr)', // Mantener 2x2
    gap: '16px',
  },
  [theme.breakpoints.down('sm')]: { // Móviles grandes (≥600px)
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 columnas en móviles grandes
    gap: '14px',
  },
  [theme.breakpoints.down(480)]: { // Móviles pequeños
    gridTemplateColumns: '1fr', // 1 columna para móviles muy pequeños
    gap: '12px',
  }
}));

const DesignStatCard = styled(DesignModernCard)(({ theme, variant }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
      color: 'white',
      border: 'none',
      marbleBase: 'rgba(25, 83, 158, 0.2)',
      marbleVeins: 'rgba(3, 44, 166, 0.35)',
      marbleHighlight: 'rgba(123, 164, 221, 0.4)',
      marbleDark: 'rgba(1, 21, 63, 0.15)',
    },
    success: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      marbleBase: 'rgba(13, 75, 54, 0.2)',
      marbleVeins: 'rgba(9, 138, 97, 0.35)',
      marbleHighlight: 'rgba(86, 236, 181, 0.4)',
      marbleDark: 'rgba(2, 77, 55, 0.15)',
    },
    warning: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: 'white',
      border: 'none',
      marbleBase: 'rgba(245, 158, 11, 0.2)',
      marbleVeins: 'rgba(217, 119, 6, 0.35)',
      marbleHighlight: 'rgba(251, 191, 36, 0.4)',
      marbleDark: 'rgba(180, 83, 9, 0.15)',
    },
    secondary: {
      background: 'white',
      color: '#010326',
      marbleBase: 'rgba(31, 100, 191, 0.08)',
      marbleVeins: 'rgba(3, 44, 166, 0.15)',
      marbleHighlight: 'rgba(100, 150, 220, 0.25)',
      marbleDark: 'rgba(31, 100, 191, 0.05)',
    }
  };

  const selectedVariant = variants[variant] || variants.secondary;
  const isColoredVariant = variant === 'primary' || variant === 'success' || variant === 'warning';

  return {
    padding: '28px',
    width: '100%',
    minHeight: '160px',
    maxHeight: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
    boxShadow: '0 2px 12px rgba(1, 3, 38, 0.04)',
    ...selectedVariant,
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      opacity: 0,
      transition: 'opacity 0.5s ease',
      pointerEvents: 'none',
      zIndex: 0, 
      background: `
        radial-gradient(ellipse at 15% 30%, ${selectedVariant.marbleHighlight} 0%, transparent 40%),
        radial-gradient(ellipse at 85% 20%, ${selectedVariant.marbleVeins} 0%, transparent 45%),
        radial-gradient(ellipse at 50% 80%, ${selectedVariant.marbleBase} 0%, transparent 50%),
        radial-gradient(ellipse at 70% 50%, ${selectedVariant.marbleHighlight} 0%, transparent 35%),
        radial-gradient(ellipse at 30% 70%, ${selectedVariant.marbleVeins} 0%, transparent 40%),
        radial-gradient(ellipse at 90% 90%, ${selectedVariant.marbleBase} 0%, transparent 45%),
        radial-gradient(ellipse at 10% 90%, ${selectedVariant.marbleDark} 0%, transparent 30%),
        linear-gradient(125deg, 
          ${selectedVariant.marbleBase} 0%, 
          transparent 25%, 
          ${selectedVariant.marbleVeins} 50%, 
          transparent 75%, 
          ${selectedVariant.marbleHighlight} 100%
        )
      `,
      backgroundSize: '100% 100%',
      animation: 'marbleFlow 10s ease-in-out infinite',
      filter: 'blur(2px)',
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: isColoredVariant 
        ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)',
      transition: 'left 0.6s ease',
      zIndex: 1, 
      pointerEvents: 'none',
    },

    '&:hover': {
      transform: 'translateY(-1px) scale(1.02)',
      boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
      '&::before': {
        opacity: 1,
      },
      '&::after': {
        left: '100%',
      }
    },

    '&:active': {
      transform: 'translateY(0)',
      transition: 'transform 0.1s ease-out',
    },

    '& > *': {
      position: 'relative',
      zIndex: 2,
    },

    [theme.breakpoints.down('lg')]: {
      padding: '24px',
      minHeight: '150px',
    },
    [theme.breakpoints.down('md')]: {
      padding: '20px',
      minHeight: '140px',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '18px',
      minHeight: '130px',
    }
  };
});

const DesignStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
  width: '100%',
});

const DesignStatIconContainer = styled(Box)(({ variant, theme }) => ({
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: (variant === 'primary' || variant === 'success' || variant === 'warning')
    ? 'rgba(255, 255, 255, 0.2)' 
    : alpha('#1F64BF', 0.1),
  color: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 'white' : '#1F64BF',
  flexShrink: 0,
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  [theme.breakpoints.down('lg')]: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
  },
  [theme.breakpoints.down('md')]: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
  }
}));

const DesignStatValue = styled(Typography)(({ variant, theme }) => ({
  fontSize: '2.2rem',
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: '6px',
  color: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 'white' : '#010326',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '1.8rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.6rem',
  }
}));

const DesignStatLabel = styled(Typography)(({ variant, theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 500,
  opacity: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 0.9 : 0.7,
  color: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 'white' : '#032CA6',
  lineHeight: 1.3,
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const DesignStatChange = styled(Box)(({ variant, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: 'auto', // Empujar hacia abajo
  padding: '6px 10px',
  borderRadius: '8px',
  background: (variant === 'primary' || variant === 'success' || variant === 'warning')
    ? 'rgba(255, 255, 255, 0.15)' 
    : trend === 'up' 
      ? alpha('#10B981', 0.1) 
      : alpha('#EF4444', 0.1),
  width: 'fit-content',
  transition: 'all 0.3s ease',
}));

const DesignStatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: (variant === 'primary' || variant === 'success' || variant === 'warning')
    ? 'white' 
    : trend === 'up' 
      ? '#10B981' 
      : '#EF4444',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const DesignControlsSection = styled(DesignModernCard)(({ theme }) => ({
  padding: '32px',
  marginBottom: '32px',
  background: 'white',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.down('lg')]: {
    padding: '28px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '24px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
    marginBottom: '20px',
  }
}));

const DesignControlsContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    gap: '20px',
  },
  [theme.breakpoints.down('md')]: {
    gap: '18px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
  }
}));

const DesignSearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '16px',
  }
}));

const DesignModernTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  fontFamily: "'Mona Sans'",
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F2F2F2',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'white',
      boxShadow: '0 2px 6px rgba(1, 3, 38, 0.06)',
      transform: 'translateY(-1px)',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: '0 3px 12px rgba(31, 100, 191, 0.08)',
      transform: 'translateY(-1px)',
    },
    '& input': {
      color: '#010326',
      fontSize: '0.9rem',
      fontWeight: 500,
      '&::placeholder': {
        color: '#64748b',
        opacity: 1,
      }
    }
  }
}));

const DesignFiltersSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  flexWrap: 'wrap',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    gap: '12px',
  },
  [theme.breakpoints.down('md')]: {
    justifyContent: 'flex-start',
    gap: '12px',
  },
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
    gap: '10px',
    '& > *': {
      minWidth: 'fit-content',
    }
  }
}));

const DesignFilterControl = styled(FormControl)(({ theme }) => ({
  minWidth: '140px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F2F2F2',
    height: '44px',
    fontSize: '0.875rem',
    border: 'none',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'white',
      boxShadow: '0 2px 6px rgba(1, 3, 38, 0.06)',
      transform: 'translateY(-1px)',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: '0 3px 12px rgba(31, 100, 191, 0.08)',
      transform: 'translateY(-1px)',
    },
    '& .MuiSelect-select': {
      color: '#010326',
      fontFamily: "'Mona Sans'",
      fontWeight: 500,
    }
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '120px',
  }
}));

const DesignSortControl = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
  borderRadius: '12px',
  backgroundColor: '#F2F2F2',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  fontFamily: "'Mona Sans'",
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)',
    transition: 'left 0.5s ease',
    zIndex: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 2,
  },
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 6px rgba(1, 3, 38, 0.06)',
    backgroundColor: 'white',
    '&::before': {
      left: '100%',
    }
  },
  '&:active': {
    transform: 'translateY(0)',
    transition: 'transform 0.1s ease-out',
  }
}));

// Lista de diseños
const DesignsSection = styled(DesignUnifiedContainer)({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
});

const DesignSectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '28px',
  paddingBottom: '18px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    marginBottom: '24px',
    paddingBottom: '16px',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '20px',
    paddingBottom: '12px',
  }
}));

const DesignSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.6rem',
  fontWeight: 600,
  color: '#010326',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '1.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.3rem',
  }
}));

const DesignsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: '28px',
  width: '100%',
  // Grid responsivo para diseños mejorado - 4 columnas por fila
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Desktop - 4 columnas
  [theme.breakpoints.down('xl')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '18px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  [theme.breakpoints.down(480)]: {
    gridTemplateColumns: '1fr',
    gap: '14px',
  }
}));

const DesignEmptyState = styled(DesignModernCard)(({ theme }) => ({
  padding: '100px 40px',
  textAlign: 'center',
  background: 'white',
  border: `2px dashed ${alpha('#1F64BF', 0.2)}`,
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    padding: '80px 30px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '60px 30px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '40px 20px',
  }
}));

const DesignEmptyStateIcon = styled(Box)(({ theme }) => ({
  width: '90px',
  height: '90px',
  borderRadius: '50%',
  background: alpha('#1F64BF', 0.1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 28px',
  color: '#1F64BF',
  [theme.breakpoints.down('lg')]: {
    width: '80px',
    height: '80px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '60px',
    height: '60px',
    marginBottom: '16px',
  }
}));

const DesignEmptyStateTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.6rem',
  fontWeight: 600,
  color: '#010326',
  marginBottom: '14px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '1.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.3rem',
  }
}));

const DesignEmptyStateDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: '#032CA6',
  marginBottom: '36px',
  maxWidth: '450px',
  margin: '0 auto 36px',
  lineHeight: 1.6,
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '1rem',
    marginBottom: '32px',
    maxWidth: '400px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    marginBottom: '24px',
    maxWidth: '300px',
  }
}));

const DesignLoadingContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: '24px',
});

const DesignLoadingOverlay = styled(DesignModernCard)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '14px',
  padding: '24px',
  marginBottom: '24px',
  background: alpha('#1F64BF', 0.04),
});

const ErrorAlert = styled(DesignModernCard)(({ theme }) => ({
  padding: '20px',
  marginBottom: '24px',
  background: alpha('#EF4444', 0.05),
  border: `1px solid ${alpha('#EF4444', 0.2)}`,
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
}));

// ================ COMPONENTE PRINCIPAL ================
const DesignManagement = () => {
  const theme = useTheme();
  
  // ==================== HOOKS ====================
  const {
    designs,
    loading,
    error,
    pagination,
    filters,
    fetchDesigns,
    createDesignForClient,
    updateDesign,
    getDesignById,
    cloneDesign,
    submitQuote,
    changeDesignStatus,
    cancelDesign,
    getDesignStats,
    updateFilters,
    clearFilters,
    hasDesigns,
    isEmpty,
    refetch
  } = useDesigns();

  const {
    products,
    loading: loadingProducts,
    fetchProducts
  } = useProducts();

  const {
    users,
    loading: loadingUsers,
    fetchUsers
  } = useUsers();

  // ==================== ESTADOS LOCALES ====================
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingDesign, setEditingDesign] = useState(null);
  const [quotingDesign, setQuotingDesign] = useState(null);
  const [viewingDesign, setViewingDesign] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ==================== EFECTOS ====================
  
  // Actualizar filtros cuando cambien los valores locales
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({
        search: searchQuery,
        status: selectedStatus,
        product: selectedProduct,
        user: selectedUser,
        sort: sortOption,
        order: sortOrder
      });
    }, 300); // Debounce para búsqueda

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedStatus, selectedProduct, selectedUser, sortOption, sortOrder, updateFilters]);

  // Cargar datos iniciales
  useEffect(() => {
    if (products.length === 0 && !loadingProducts) {
      fetchProducts();
    }
    if (users.length === 0 && !loadingUsers) {
      fetchUsers();
    }
  }, [products.length, users.length, loadingProducts, loadingUsers, fetchProducts, fetchUsers]);

  // ==================== ESTADÍSTICAS CALCULADAS ====================
  const stats = useMemo(() => {
    const designStats = getDesignStats();
    
    return [
      {
        id: 'total-designs',
        title: "Total de Diseños",
        value: designStats.total,
        change: "+15% este mes",
        trend: "up",
        icon: Palette,
        variant: "primary",
        onClick: () => handleFilterByStatus('')
      },
      {
        id: 'pending-designs',
        title: "Pendientes de Cotizar",
        value: designStats.pending,
        change: designStats.pending > 0 ? `${designStats.pending} requieren atención` : 'Al día',
        trend: designStats.pending > 0 ? "warning" : "up",
        icon: Clock,
        variant: designStats.pending > 0 ? "warning" : "secondary",
        onClick: () => handleFilterByStatus('pending')
      },
      {
        id: 'approved-designs',
        title: "Diseños Aprobados",
        value: designStats.approved,
        change: `${designStats.conversionRate.toFixed(1)}% tasa de conversión`,
        trend: "up",
        icon: CheckCircle,
        variant: "success",
        onClick: () => handleFilterByStatus('approved')
      },
      {
        id: 'total-revenue',
        title: "Ingresos por Diseños",
        value: new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(designStats.totalRevenue),
        change: "Solo diseños aprobados",
        trend: "up",
        icon: Money,
        variant: "secondary",
        onClick: () => handleFilterByStatus('approved')
      }
    ];
  }, [getDesignStats]);

  // ==================== MANEJADORES DE FILTROS ====================
  
  const handleFilterByStatus = (status) => {
    setSelectedStatus(status);
    updateFilters({ status });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
  };

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleSortChange = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedProduct('');
    setSelectedUser('');
    setSortOption('createdAt');
    setSortOrder('desc');
    clearFilters();
  };

  // ==================== MANEJADORES DE ACCIONES ====================
  
  const handleCreateDesign = () => {
    setEditingDesign(null);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingDesign(null);
  };

  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false);
    setQuotingDesign(null);
  };

  const handleCloseViewerModal = () => {
    setShowViewerModal(false);
    setViewingDesign(null);
  };

  const handleDesignCreated = async (designData) => {
    try {
      setActionLoading(true);
      // ✅ CORREGIDO: Usar updateDesign si está en modo edición, sino createDesignForClient
      if (editingDesign) {
        console.log('✏️ [DesignManagement] Actualizando diseño existente:', editingDesign._id);
        await updateDesign(editingDesign._id, designData);
      } else {
        console.log('➕ [DesignManagement] Creando nuevo diseño');
        await createDesignForClient(designData);
      }
      setShowCreateModal(false);
      setEditingDesign(null);

      await Swal.fire({
        title: editingDesign ? '¡Diseño actualizado exitosamente!' : '¡Diseño creado exitosamente!',
        text: editingDesign ? 'Los cambios se han guardado correctamente' : 'El diseño se ha enviado para cotización',
        icon: 'success',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster'
        }
      });
    } catch (error) {
      console.error('Error en handleDesignCreated:', error);
      await Swal.fire({
        title: editingDesign ? 'Error al actualizar diseño' : 'Error al crear diseño',
        text: error.message || 'Ocurrió un error inesperado',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDesign = async (designId) => {
    try {
      setActionLoading(true);
      const design = await getDesignById(designId);
      if (design) {
        // Encontrar el producto correspondiente para el visor
        const product = products.find(p => p.id === design.productId || p._id === design.productId);
        
        setViewingDesign({
          ...design,
          product: product || design.product
        });
        setShowViewerModal(true);
      }
    } catch (error) {
      console.error('Error obteniendo diseño:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el diseño',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditDesign = async (designId) => {
    try {
      setActionLoading(true);
      const designData = await getDesignById(designId);
      if (designData) {
        // Verificar que el diseño se puede editar
        if (!designData.canEdit) {
          Swal.fire({
            title: 'No se puede editar',
            text: 'Este diseño no se puede editar en su estado actual',
            icon: 'warning',
            confirmButtonColor: '#F59E0B'
          });
          return;
        }
        
        setEditingDesign(designData);
        setShowCreateModal(true);
      }
    } catch (error) {
      console.error('Error cargando diseño para editar:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el diseño para editar',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloneDesign = async (designId) => {
    try {
      const design = designs.find(d => d.id === designId);
      const designName = design?.name || 'este diseño';
      
      const { value: name } = await Swal.fire({
        title: 'Clonar diseño',
        text: `¿Cómo quieres llamar la copia de "${designName}"?`,
        input: 'text',
        inputValue: `Copia de ${designName}`,
        showCancelButton: true,
        confirmButtonColor: '#1F64BF',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Clonar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value || value.trim().length < 3) {
            return 'El nombre debe tener al menos 3 caracteres';
          }
        }
      });

      if (name) {
        setActionLoading(true);
        await cloneDesign(designId, { name: name.trim() });
      }
    } catch (error) {
      console.error('Error clonando diseño:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo clonar el diseño',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuoteDesign = async (designId) => {
    try {
      setActionLoading(true);
      const designData = await getDesignById(designId);
      if (designData) {
        // Verificar que el diseño se puede cotizar
        if (designData.status !== 'pending') {
          const statusMessages = {
            'quoted': 'Este diseño ya ha sido cotizado anteriormente',
            'approved': 'Este diseño ya fue aprobado por el cliente',
            'rejected': 'Este diseño fue rechazado por el cliente',
            'completed': 'Este diseño ya fue completado',
            'archived': 'Este diseño está archivado'
          };
          
          Swal.fire({
            title: 'No se puede cotizar',
            text: statusMessages[designData.status] || 'Este diseño no se puede cotizar en su estado actual',
            icon: 'warning',
            confirmButtonColor: '#F59E0B'
          });
          return;
        }
        
        setQuotingDesign(designData);
        setShowQuoteModal(true);
      }
    } catch (error) {
      console.error('Error cargando diseño para cotizar:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el diseño para cotizar',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuoteSubmitted = async (quoteData) => {
    try {
      if (quotingDesign) {
        setActionLoading(true);
        await submitQuote(quotingDesign.id, quoteData);
        setShowQuoteModal(false);
        setQuotingDesign(null);
      }
    } catch (error) {
      console.error('Error en handleQuoteSubmitted:', error);
      // Mostrar error específico al usuario
      await Swal.fire({
        title: 'Error al cotizar',
        text: error.message || 'No se pudo enviar la cotización',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (designId) => {
    try {
      const design = designs.find(d => d.id === designId);
      if (!design) return;

      const statusOptions = [
        { value: 'draft', text: 'Borrador', disabled: false },
        { value: 'pending', text: 'Pendiente', disabled: false },
        { value: 'quoted', text: 'Cotizado', disabled: design.status === 'draft' },
        { value: 'approved', text: 'Aprobado', disabled: design.status !== 'quoted' },
        { value: 'rejected', text: 'Rechazado', disabled: design.status !== 'quoted' },
        { value: 'completed', text: 'Completado', disabled: design.status !== 'approved' },
        { value: 'archived', text: 'Archivado', disabled: false }
      ].filter(option => option.value !== design.status);

      const { value: formValues } = await Swal.fire({
        title: 'Cambiar estado del diseño',
        html: `
          <div style="text-align: left; padding: 16px;">
            <p style="margin-bottom: 16px; color: #374151;">
              <strong>Estado actual:</strong> <span style="color: #1F64BF;">${design.statusText}</span>
            </p>
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                Nuevo estado:
              </label>
              <select id="swal-status" class="swal2-input" style="margin-bottom: 0;">
                <option value="">Seleccionar nuevo estado</option>
                ${statusOptions.map(option => 
                  `<option value="${option.value}" ${option.disabled ? 'disabled' : ''}>
                    ${option.text}${option.disabled ? ' (No disponible)' : ''}
                  </option>`
                ).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                Notas del cambio (opcional):
              </label>
              <textarea id="swal-notes" class="swal2-textarea" placeholder="Explica el motivo del cambio de estado..." style="height: 80px;"></textarea>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#1F64BF',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Cambiar estado',
        cancelButtonText: 'Cancelar',
        width: 500,
        preConfirm: () => {
          const status = document.getElementById('swal-status').value;
          const notes = document.getElementById('swal-notes').value;
          
          if (!status) {
            Swal.showValidationMessage('Debes seleccionar un estado');
            return false;
          }
          
          return { status, notes: notes.trim() };
        }
      });

      if (formValues) {
        setActionLoading(true);
        await changeDesignStatus(designId, formValues.status, formValues.notes);
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cambiar el estado del diseño',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDesign = async (designId) => {
    try {
      const design = designs.find(d => d.id === designId);
      const designName = design?.name || 'este diseño';
      
      const { isConfirmed, value: reason } = await Swal.fire({
        title: '¿Cancelar diseño?',
        html: `
          <div style="text-align: left; padding: 16px;">
            <p style="margin-bottom: 16px; color: #374151;">
              ¿Estás seguro de que quieres cancelar <strong>"${designName}"</strong>?
            </p>
            <p style="margin-bottom: 16px; color: #6B7280; font-size: 0.875rem;">
              Esta acción no se puede deshacer. El diseño se marcará como cancelado.
            </p>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                Motivo de cancelación:
              </label>
              <textarea id="swal-reason" class="swal2-textarea" placeholder="Explica por qué se cancela este diseño..." style="height: 80px;"></textarea>
            </div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, cancelar diseño',
        cancelButtonText: 'No cancelar',
        width: 500,
        preConfirm: () => {
          const reason = document.getElementById('swal-reason').value;
          return reason.trim() || 'Cancelado por administrador';
        }
      });

      if (isConfirmed) {
        setActionLoading(true);
        await cancelDesign(designId, reason);
      }
    } catch (error) {
      console.error('Error cancelando diseño:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cancelar el diseño',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== MANEJADORES DE PAGINACIÓN ====================
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      fetchDesigns({ page: newPage });
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // ==================== MANEJADORES DE EXPORTACIÓN ====================
  
  const handleExportData = async () => {
    try {
      const { value: format } = await Swal.fire({
        title: 'Exportar datos',
        text: 'Selecciona el formato de exportación',
        input: 'select',
        inputOptions: {
          'csv': 'Archivo CSV',
          'pdf': 'Reporte PDF',
          'excel': 'Archivo Excel'
        },
        inputPlaceholder: 'Seleccionar formato',
        showCancelButton: true,
        confirmButtonColor: '#1F64BF',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Exportar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return 'Debes seleccionar un formato';
          }
        }
      });

      if (format) {
        // Aquí implementarías la lógica de exportación según el formato
        Swal.fire({
          title: 'Exportando...',
          text: `Generando archivo ${format.toUpperCase()}`,
          icon: 'info',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        
        // Simulación de exportación
        setTimeout(() => {
          Swal.fire({
            title: 'Exportación completada',
            text: 'El archivo se ha descargado exitosamente',
            icon: 'success',
            confirmButtonColor: '#1F64BF'
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error exportando datos:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo exportar los datos',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // ==================== RENDER DE LOADING INICIAL ====================
  
  if (loading && !hasDesigns && designs.length === 0) {
    return (
      <DesignPageContainer>
        <DesignContentWrapper>
          <DesignLoadingContainer>
            <CircularProgress 
              size={48} 
              sx={{ 
                color: '#1F64BF',
                filter: 'drop-shadow(0 4px 8px rgba(31, 100, 191, 0.3))'
              }} 
            />
            <Typography component="div" variant="body1" sx={{ color: '#010326', fontWeight: 600, fontFamily: "'Mona Sans'" }}>
              Cargando gestión de diseños...
            </Typography>
          </DesignLoadingContainer>
        </DesignContentWrapper>
      </DesignPageContainer>
    );
  }

  // ==================== RENDER PRINCIPAL ====================
  
  return (
    <DesignPageContainer>
      <DesignContentWrapper>
        {/* Header Principal */}
        <DesignHeaderSection sx={{ fontWeight: '700 !important' }} className="force-bold" style={{ fontWeight: '700 !important' }}>
          <DesignHeaderContent>
            <DesignHeaderInfo>
              <DesignMainTitle sx={{ fontWeight: '700 !important' }} className="force-bold" style={{ fontWeight: '700 !important' }}>
                <Palette size={32} weight="duotone" />
                Gestión de Diseños
              </DesignMainTitle>
              <DesignMainDescription sx={{ fontWeight: '700 !important' }} className="force-bold" style={{ fontWeight: '700 !important' }}>
                Administra diseños personalizados, cotizaciones y flujo de aprobación de clientes
              </DesignMainDescription>
            </DesignHeaderInfo>
            
            <DesignHeaderActions>
              <DesignSecondaryActionButton
                variant="outlined"
                onClick={handleRefresh}
                disabled={loading || actionLoading}
                startIcon={loading ? <CircularProgress size={16} /> : <ArrowsClockwise size={18} weight="bold" />}
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </DesignSecondaryActionButton>
              
              <DesignSecondaryActionButton
                variant="outlined"
                onClick={handleExportData}
                disabled={!hasDesigns || loading}
                startIcon={<Download size={18} weight="bold" />}
              >
                Exportar
              </DesignSecondaryActionButton>
              
              <DesignPrimaryActionButton
                onClick={handleCreateDesign}
                disabled={loading || actionLoading}
                startIcon={<Plus size={18} weight="bold" />}
              >
                Nuevo Diseño
              </DesignPrimaryActionButton>
            </DesignHeaderActions>
          </DesignHeaderContent>
        </DesignHeaderSection>

        {/* Alerta de Error */}
        {error && (
          <ErrorAlert>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Warning size={24} weight="fill" color="#EF4444" />
              <Box>
                <Typography sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.875rem', fontFamily: "'Mona Sans'" }}>
                  Error en la carga de datos
                </Typography>
                <Typography sx={{ color: '#DC2626', fontSize: '0.8rem', opacity: 0.8, fontFamily: "'Mona Sans'" }}>
                  {error}
                </Typography>
              </Box>
            </Box>
            <Button 
              size="small" 
              onClick={handleRefresh}
              disabled={loading}
              sx={{ 
                color: '#EF4444',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 'auto',
                fontFamily: "'Mona Sans'"
              }}
            >
              Reintentar
            </Button>
          </ErrorAlert>
        )}

        {/* Estadísticas Interactivas */}
        <DesignStatsContainer>
          <DesignStatsGrid>
            {stats.map((stat) => (
              <DesignStatCard 
                key={stat.id} 
                variant={stat.variant}
                onClick={stat.onClick}
              >
                <DesignStatHeader>
                  <Box>
                    <DesignStatValue variant={stat.variant}>
                      {stat.value}
                    </DesignStatValue>
                    <DesignStatLabel variant={stat.variant}>
                      {stat.title}
                    </DesignStatLabel>
                  </Box>
                  <DesignStatIconContainer variant={stat.variant}>
                    <stat.icon size={24} weight="duotone" />
                  </DesignStatIconContainer>
                </DesignStatHeader>
                <DesignStatChange variant={stat.variant} trend={stat.trend}>
                  <TrendUp size={12} weight="bold" />
                  <DesignStatTrendText variant={stat.variant} trend={stat.trend}>
                    {stat.change}
                  </DesignStatTrendText>
                </DesignStatChange>
              </DesignStatCard>
            ))}
          </DesignStatsGrid>
        </DesignStatsContainer>

        {/* Controles de búsqueda y filtros */}
        <DesignControlsSection>
          <DesignControlsContent>
            {/* Barra de búsqueda principal */}
            <DesignSearchSection>
              <DesignModernTextField
                placeholder="Buscar diseños por nombre, cliente o producto..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlass size={20} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <DesignSortControl onClick={handleSortChange}>
                <Typography variant="body2" sx={{ color: '#032CA6', fontWeight: 500, fontFamily: "'Mona Sans'" }}>
                  Fecha
                </Typography>
                {sortOrder === 'desc' ? (
                  <SortDescending size={16} weight="bold" color="#032CA6" />
                ) : (
                  <SortAscending size={16} weight="bold" color="#032CA6" />
                )}
              </DesignSortControl>
            </DesignSearchSection>

            {/* Filtros avanzados */}
            <DesignFiltersSection>
              <DesignFilterControl size="small">
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <Funnel size={16} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  }
                  MenuProps={{
                    style: { zIndex: 10000 },
                    PaperProps: {
                      style: { zIndex: 10001 }
                    }
                  }}
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  <MenuItem value="draft">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PencilSimple size={14} />
                      Borradores
                    </Box>
                  </MenuItem>
                  <MenuItem value="pending">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} />
                      Pendientes
                    </Box>
                  </MenuItem>
                  <MenuItem value="quoted">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Money size={14} />
                      Cotizados
                    </Box>
                  </MenuItem>
                  <MenuItem value="approved">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} />
                      Aprobados
                    </Box>
                  </MenuItem>
                  <MenuItem value="rejected">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <XCircle size={14} />
                      Rechazados
                    </Box>
                  </MenuItem>
                  <MenuItem value="completed">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} />
                      Completados
                    </Box>
                  </MenuItem>
                  <MenuItem value="cancelled">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <XCircle size={14} />
                      Cancelados
                    </Box>
                  </MenuItem>
                </Select>
              </DesignFilterControl>

              <DesignFilterControl size="small">
                <Select
                  value={selectedProduct}
                  onChange={handleProductChange}
                  displayEmpty
                  disabled={loadingProducts}
                  startAdornment={
                    <InputAdornment position="start">
                      <Package size={16} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  }
                  MenuProps={{
                    style: { zIndex: 10000 },
                    PaperProps: {
                      style: { zIndex: 10001 }
                    }
                  }}
                >
                  <MenuItem value="">
                    {loadingProducts ? 'Cargando productos...' : 'Todos los productos'}
                  </MenuItem>
                  {products.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {product.mainImage && (
                          <Box
                            component="img"
                            src={product.mainImage}
                            alt=""
                            sx={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <Typography variant="body2" noWrap sx={{ fontFamily: "'Mona Sans'" }}>
                          {product.name}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </DesignFilterControl>

              <DesignFilterControl size="small">
                <Select
                  value={selectedUser}
                  onChange={handleUserChange}
                  displayEmpty
                  disabled={loadingUsers}
                  startAdornment={
                    <InputAdornment position="start">
                      <Users size={16} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  }
                  MenuProps={{
                    style: { zIndex: 10000 },
                    PaperProps: {
                      style: { zIndex: 10001 }
                    }
                  }}
                >
                  <MenuItem value="">
                    {loadingUsers ? 'Cargando clientes...' : 'Todos los clientes'}
                  </MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      <Typography variant="body2" noWrap sx={{ fontFamily: "'Mona Sans'" }}>
                        {user.name}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </DesignFilterControl>

              {/* Botón para limpiar filtros */}
              {(searchQuery || selectedStatus || selectedProduct || selectedUser) && (
                <Tooltip title="Limpiar todos los filtros">
                  <Button
                    onClick={handleClearFilters}
                    startIcon={<Broom size={16} weight="bold" />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#EF4444',
                      backgroundColor: alpha('#EF4444', 0.1),
                      padding: '8px 16px',
                      minWidth: 'auto',
                      fontFamily: "'Mona Sans'",
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha('#EF4444', 0.15),
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    Limpiar
                  </Button>
                </Tooltip>
              )}
            </DesignFiltersSection>
          </DesignControlsContent>
        </DesignControlsSection>

        {/* Lista de Diseños */}
        <DesignsSection>
          <DesignSectionHeader>
            <DesignSectionTitle component="div">
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <GridNine size={24} weight="duotone" />
                <Box component="span">Diseños</Box>
                
                <Chip 
                  label={`${designs.length}${pagination.totalDesigns !== designs.length ? ` de ${pagination.totalDesigns}` : ''}`}
                  size="small"
                  sx={{
                    background: alpha('#1F64BF', 0.1),
                    color: '#032CA6',
                    fontWeight: 600,
                    ml: 1,
                    fontFamily: "'Mona Sans'"
                  }}
                />
              </Box>
            </DesignSectionTitle>

            {/* Información de resultados */}
            {hasDesigns && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Typography variant="body2" sx={{ color: '#032CA6', opacity: 0.8, fontFamily: "'Mona Sans'" }}>
                  {loading ? 'Actualizando...' : `${designs.length} resultado${designs.length !== 1 ? 's' : ''}`}
                </Typography>
              </Box>
            )}
          </DesignSectionHeader>

          {/* Estado de carga durante refetch */}
          {loading && hasDesigns && (
            <DesignLoadingOverlay>
              <CircularProgress size={20} sx={{ color: '#1F64BF' }} />
              <Typography variant="body2" sx={{ color: '#1F64BF', fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                Actualizando diseños...
              </Typography>
            </DesignLoadingOverlay>
          )}

          {/* Grid de diseños o estado vacío */}
          {designs.length > 0 ? (
            <>
              <DesignsGrid>
                {designs.map((design) => (
                  <DesignCard
                    key={design.id}
                    id={design.id}
                    name={design.name}
                    status={design.status}
                    clientName={design.clientName}
                    clientEmail={design.clientEmail}
                    productName={design.productName}
                    productImage={design.productImage}
                    previewImage={design.previewImage}
                    elements={design.elements}
                    price={design.price}
                    formattedPrice={design.formattedPrice}
                    createdDate={design.createdDate}
                    updatedDate={design.updatedDate}
                    elementsCount={design.elementsCount}
                    complexity={design.complexity}
                    canEdit={design.canEdit}
                    canQuote={design.canQuote}
                    canApprove={design.canApprove}
                    daysAgo={design.daysAgo}
                    onView={handleViewDesign}
                    onEdit={handleEditDesign}
                    onClone={handleCloneDesign}
                    onDelete={handleDeleteDesign}
                    onQuote={handleQuoteDesign}
                    onChangeStatus={handleChangeStatus}
                    loading={actionLoading}
                  />
                ))}
              </DesignsGrid>

              {/* Controles de paginación */}
              {pagination.totalPages > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  mt: 5,
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev || loading}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: alpha('#1F64BF', 0.3),
                      color: '#1F64BF',
                      minWidth: { xs: '100%', sm: 'auto' },
                      fontFamily: "'Mona Sans'",
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#1F64BF',
                        backgroundColor: alpha('#1F64BF', 0.05),
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        borderColor: alpha('#1F64BF', 0.1),
                        color: alpha('#1F64BF', 0.3),
                      }
                    }}
                  >
                    ← Anterior
                  </Button>
                  
                  <DesignModernCard sx={{ 
                    px: 3, 
                    py: 1,
                    minWidth: { xs: '100%', sm: 'auto' },
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" sx={{ color: '#032CA6', fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                      {pagination.currentPage} de {pagination.totalPages}
                    </Typography>
                  </DesignModernCard>
                  
                  <Button
                    variant="outlined"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext || loading}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: alpha('#1F64BF', 0.3),
                      color: '#1F64BF',
                      minWidth: { xs: '100%', sm: 'auto' },
                      fontFamily: "'Mona Sans'",
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#1F64BF',
                        backgroundColor: alpha('#1F64BF', 0.05),
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        borderColor: alpha('#1F64BF', 0.1),
                        color: alpha('#1F64BF', 0.3),
                      }
                    }}
                  >
                    Siguiente →
                  </Button>
                </Box>
              )}
            </>
          ) : (
            /* Estado vacío mejorado */
            <DesignEmptyState>
              <DesignEmptyStateIcon>
                <Palette size={40} weight="duotone" />
              </DesignEmptyStateIcon>
              
              <DesignEmptyStateTitle>
                {searchQuery || selectedStatus || selectedProduct || selectedUser
                  ? 'No hay diseños que coincidan con los filtros' 
                  : 'No hay diseños creados aún'
                }
              </DesignEmptyStateTitle>
              
              <DesignEmptyStateDescription>
                {searchQuery || selectedStatus || selectedProduct || selectedUser
                  ? 'Intenta ajustar los filtros de búsqueda o crear un nuevo diseño personalizado'
                  : 'Comienza creando tu primer diseño personalizado para un cliente. Usa nuestro editor visual para crear diseños únicos.'
                }
              </DesignEmptyStateDescription>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                maxWidth: '400px'
              }}>
                <DesignPrimaryActionButton
                  onClick={handleCreateDesign}
                  disabled={loading || actionLoading}
                  startIcon={<Plus size={18} weight="bold" />}
                  sx={{
                    minWidth: { xs: '100%', sm: '140px' }
                  }}
                >
                  Crear Diseño
                </DesignPrimaryActionButton>
                
                {(searchQuery || selectedStatus || selectedProduct || selectedUser) && (
                  <DesignSecondaryActionButton
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<Broom size={18} weight="bold" />}
                    sx={{
                      minWidth: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    Limpiar Filtros
                  </DesignSecondaryActionButton>
                )}
              </Box>

              {/* Sugerencias de acción */}
              {!hasDesigns && !loading && (
                <Box sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: '12px',
                  background: alpha('#1F64BF', 0.05),
                  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
                  maxWidth: '500px'
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: '#1F64BF', 
                    fontWeight: 600, 
                    mb: 2,
                    textAlign: 'center',
                    fontFamily: "'Mona Sans'"
                  }}>
                    💡 Primeros pasos
                  </Typography>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ color: '#032CA6', mb: 1, fontFamily: "'Mona Sans'" }}>
                      • Selecciona un cliente y producto base
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#032CA6', mb: 1, fontFamily: "'Mona Sans'" }}>
                      • Usa el editor visual para crear elementos
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#032CA6', mb: 1, fontFamily: "'Mona Sans'" }}>
                      • Envía cotización al cliente
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#032CA6', fontFamily: "'Mona Sans'" }}>
                      • Gestiona aprobaciones y producción
                    </Typography>
                  </Box>
                </Box>
              )}
            </DesignEmptyState>
          )}
        </DesignsSection>

        {/* Indicador de carga durante actualizaciones */}
        {loading && hasDesigns && (
          <Box sx={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '12px 20px',
            boxShadow: '0 4px 20px rgba(1, 3, 38, 0.15)',
            border: `1px solid ${alpha('#1F64BF', 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CircularProgress size={20} sx={{ color: '#1F64BF' }} />
            <Typography variant="body2" sx={{ color: '#032CA6', fontWeight: 500, fontFamily: "'Mona Sans'" }}>
              Actualizando diseños...
            </Typography>
          </Box>
        )}
      </DesignContentWrapper>

      {/* ==================== MODALES ==================== */}

      {/* Modal de creación/edición de diseño */}
      {showCreateModal && (
        <CreateDesignModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          onCreateDesign={handleDesignCreated}
          editMode={!!editingDesign}
          designToEdit={editingDesign}
          products={products}
          users={users}
          loadingProducts={loadingProducts}
          loadingUsers={loadingUsers}
        />
      )}

      {/* Modal de cotización */}
      {showQuoteModal && quotingDesign && (
        <QuoteDesignModal
          isOpen={showQuoteModal}
          onClose={handleCloseQuoteModal}
          onSubmitQuote={handleQuoteSubmitted}
          design={quotingDesign}
        />
      )}

      {/* Modal de visualización de diseño */}
      {showViewerModal && viewingDesign && (
        <KonvaDesignViewer
          isOpen={showViewerModal}
          onClose={handleCloseViewerModal}
          design={viewingDesign}
          product={viewingDesign.product}
          enableDownload={true}
        />
      )}
    </DesignPageContainer>
  );
};

// ==================== EXPORT ==================== 
export default DesignManagement;