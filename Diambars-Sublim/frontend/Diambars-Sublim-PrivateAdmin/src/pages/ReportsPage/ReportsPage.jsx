                                                                                            // src/pages/ReportsPage/ReportsPage.jsx - Página de reportes con gráficas en posición original
import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  styled,
  useTheme,
  alpha,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  Chip,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import {
  ChartBar,
  TrendUp,
  Users,
  Package,
  Clock,
  Download,
  ChartLine,
  ChartPie,
  Target,
  Lightning,
  Coffee,
  Gear,
  ArrowRight,
  EyeSlash
} from '@phosphor-icons/react';
import { Line, Bar, Pie, Doughnut, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { 
  useOrderAnalysisReport,
  useReportExport
} from '../../hooks/useReports';
import useProducts from '../../hooks/useProducts';
import useUsers from '../../hooks/useUsers';
import useEmployees from '../../hooks/useEmployees';
import useDesigns from '../../hooks/useDesigns';
import ChartErrorBoundary from '../../components/ChartErrorBoundary/ChartErrorBoundary';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale
);

// Configuración global de SweetAlert2
Swal.mixin({
  customClass: {
    container: 'swal-overlay-custom',
    popup: 'swal-modal-custom'
  },
  didOpen: () => {
    const container = document.querySelector('.swal-overlay-custom');
    if (container) {
      container.style.zIndex = '1500';
    }
  }
});

// ================ KEYFRAMES PARA ANIMACIÓN DE MÁRMOL MUY VISIBLE ================ 
const marbleFlowKeyframes = `
@keyframes marbleFlow {
  0% {
    transform: translate(2%, 2%) rotate(0deg) scale(1);
  }
  25% {
    transform: translate(-8%, -8%) rotate(5deg) scale(1.05);
  }
  50% {
    transform: translate(-15%, 8%) rotate(-3deg) scale(1.08);
  }
  75% {
    transform: translate(-8%, -5%) rotate(2deg) scale(1.05);
  }
  100% {
    transform: translate(2%, 2%) rotate(0deg) scale(1);
  }
}
`;

// Inyectar keyframes en el documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = marbleFlowKeyframes;
  document.head.appendChild(styleSheet);
}

// ================ ESTILOS COMPLETAMENTE ACORDES AL DASHBOARD ================ 
const ReportsPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const ReportsContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1600px',
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

const ReportsModernCard = styled(Paper)(({ theme }) => ({
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

// Header Principal - Igual al Dashboard
const ReportsHeaderSection = styled(ReportsModernCard)(({ theme }) => ({
  padding: '40px',
  marginBottom: '32px',
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: '#FFFFFF',
  boxShadow: '0 4px 24px rgba(31, 100, 191, 0.25)',
  border: 'none',
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

const ReportsHeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '32px',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    gap: '24px',
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
  }
}));

const ReportsHeaderInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    alignItems: 'center',
    textAlign: 'center',
  }
}));

const ReportsMainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: '700 !important',
  color: '#FFFFFF',
  marginBottom: '12px',
  letterSpacing: '-0.025em',
  lineHeight: 1.2,
  textAlign: 'left',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '2.2rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '1.8rem',
    textAlign: 'center',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.6rem',
  }
}));

const ReportsMainDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: 'rgba(255, 255, 255, 0.9)',
  fontWeight: '500 !important',
  lineHeight: 1.6,
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

const ReportsHeaderActions = styled(Box)(({ theme }) => ({
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

// Botones con efecto shimmer - Iguales al Dashboard
const ReportsPrimaryActionButton = styled(Button)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  color: '#FFFFFF',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  borderRadius: '16px',
  padding: '14px 28px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    transform: 'translateY(-1px)',
    '&::before': { left: '100%' }
  },
  '&:active': {
    transform: 'translateY(0)',
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

const ReportsSecondaryActionButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  color: '#FFFFFF',
  borderRadius: '12px',
  width: '52px',
  height: '52px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  flexShrink: 0,
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
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    transform: 'translateY(-1px)',
    '&::before': { left: '100%' }
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

// GRID DE ESTADÍSTICAS - Igual al Dashboard
const ReportsStatsGrid = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gap: '24px',
  gridTemplateColumns: 'repeat(4, 1fr)',
  marginBottom: '32px',
  [theme.breakpoints.down(1400)]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '18px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  [theme.breakpoints.down(480)]: {
    gridTemplateColumns: '1fr',
    gap: '12px',
  }
}));

const ReportsStatCard = styled(ReportsModernCard)(({ theme, variant }) => {
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

const ReportsStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
  width: '100%',
});

const ReportsStatIconContainer = styled(Box)(({ variant, theme }) => ({
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : alpha('#1F64BF', 0.1),
  color: variant === 'primary' ? 'white' : '#1F64BF',
  flexShrink: 0,
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

const ReportsStatValue = styled(Typography)(({ variant, theme }) => ({
  fontSize: '2.2rem',
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: '6px',
  color: variant === 'primary' ? 'white' : '#010326',
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

const ReportsStatLabel = styled(Typography)(({ variant, theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 500,
  opacity: variant === 'primary' ? 0.9 : 0.7,
  color: variant === 'primary' ? 'white' : '#032CA6',
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

const ReportsStatChange = styled(Box)(({ variant, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: 'auto',
  padding: '6px 10px',
  borderRadius: '8px',
  background: variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : trend === 'up' 
      ? alpha('#10B981', 0.1) 
      : alpha('#EF4444', 0.1),
  width: 'fit-content',
}));

const ReportsStatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: variant === 'primary' 
    ? 'white' 
    : trend === 'up' 
      ? '#10B981' 
      : '#EF4444',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

// Sección de Control - Igual al Dashboard
const ReportsControlSection = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
  gap: '24px',
  marginBottom: '32px',
  [theme.breakpoints.down('md')]: {
    gap: '20px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
    marginBottom: '20px',
  }
}));

const ControlCard = styled(ReportsModernCard)(({ theme }) => ({
  padding: '32px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('lg')]: {
    padding: '28px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
  }
}));

// Botones de control con efecto shimmer
const ControlButton = styled(Button)(({ theme, variant = 'primary' }) => {
  const isPrimary = variant === 'primary';
  
  return {
    border: isPrimary ? 'none' : `1px solid ${alpha('#032CA6', 0.3)}`,
    background: isPrimary 
      ? 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)' 
      : 'transparent',
    color: isPrimary ? 'white' : '#032CA6',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: "'Mona Sans'",
    boxShadow: isPrimary ? '0 4px 16px rgba(31, 100, 191, 0.24)' : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: isPrimary
        ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(3, 44, 166, 0.15), transparent)',
      transition: 'left 0.5s ease'
    },
    '&:hover': {
      background: isPrimary 
        ? 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)' 
        : alpha('#032CA6', 0.05),
      boxShadow: isPrimary ? '0 6px 24px rgba(31, 100, 191, 0.32)' : 'none',
      transform: 'translateY(-1px)',
      borderColor: isPrimary ? 'none' : alpha('#032CA6', 0.5),
      '&::before': { left: '100%' }
    },
    '&:active': {
      transform: 'translateY(0)',
    }
  };
});

// Sección de Gráficas Principal - POSICIÓN ORIGINAL DE GRÁFICAS
const ReportsChartsSection = styled(ReportsModernCard)(({ theme }) => ({
  padding: { xs: '24px', sm: '32px', md: '40px' },
  marginBottom: '32px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('md')]: {
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '20px',
  }
}));

const ChartsHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: { xs: 'flex-start', sm: 'center' },
  justifyContent: 'space-between',
  gap: '16px',
  marginBottom: '32px',
  padding: '20px',
  background: '#f8fafc',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  [theme.breakpoints.down('sm')]: {
    marginBottom: '24px',
    padding: '16px',
  }
}));

// Cards de Gráficas Individuales - POSICIÓN ORIGINAL
const ChartCard = styled(ReportsModernCard)(({ theme }) => ({
  padding: '24px',
  borderRadius: '12px',
  background: 'white',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 12px rgba(1, 3, 38, 0.06)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
  }
}));

// Tabs personalizados
const ReportsTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    fontFamily: "'Mona Sans'",
    minHeight: '48px',
    color: '#64748b',
    '&.Mui-selected': {
      color: '#1F64BF',
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#1F64BF',
    height: '3px',
    borderRadius: '2px',
  },
}));

const ReportsPage = React.memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [exportLoading, setExportLoading] = useState(false);
  
  // Hooks de reportes y datos
  const { data: reportData, loading: reportLoading, error: reportError, refetch: refetchReport } = useOrderAnalysisReport();
  const { exportReport } = useReportExport();
  
  // Hooks para estadísticas adicionales
  const { getProductStats } = useProducts();
  const { getUserStats } = useUsers();
  const { getEmployeeStats } = useEmployees();
  const { getDesignStats } = useDesigns();

  
  
  // Función para manejar cambio de pestaña
  
  // Función para exportar reportes
  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      await exportReport('order-analysis', format);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Extraer estadísticas de todos los hooks
  const stats = useMemo(() => {
    const productStats = getProductStats();
    const userStats = getUserStats();
    const employeeStats = getEmployeeStats();
    const designStats = getDesignStats();
    
    const baseStats = {
      totalRevenue: reportData?.summary?.totalRevenue || 0,
      totalOrders: reportData?.summary?.totalOrders || 0,
      averageOrderValue: reportData?.summary?.averageOrderValue || 0,
      totalUniqueCustomers: reportData?.summary?.totalUniqueCustomers || 0,
    };
    
    return {
      ...baseStats,
      // Estadísticas de productos
      totalProducts: productStats?.total || 0,
      activeProducts: productStats?.active || 0,
      inactiveProducts: productStats?.inactive || 0,
      featuredProducts: productStats?.featured || 0,
      productRevenue: productStats?.totalRevenue || 0,
      avgProductPrice: productStats?.avgPrice || 0,
      
      // Estadísticas de usuarios
      totalUsers: userStats?.total || 0,
      activeUsers: userStats?.active || 0,
      inactiveUsers: userStats?.inactive || 0,
      adminUsers: userStats?.admins || 0,
      premiumUsers: userStats?.premium || 0,
      customerUsers: userStats?.customers || 0,
      
      // Estadísticas de empleados
      totalEmployees: employeeStats?.total || 0,
      activeEmployees: employeeStats?.active || 0,
      inactiveEmployees: employeeStats?.inactive || 0,
      adminEmployees: employeeStats?.roles?.admins || 0,
      managerEmployees: employeeStats?.roles?.managers || 0,
      regularEmployees: employeeStats?.roles?.employees || 0,
      deliveryEmployees: employeeStats?.roles?.delivery || 0,
      
      // Estadísticas de diseños
      totalDesigns: designStats?.total || 0,
      pendingDesigns: designStats?.pending || 0,
      quotedDesigns: designStats?.quoted || 0,
      approvedDesigns: designStats?.approved || 0,
      rejectedDesigns: designStats?.rejected || 0,
      completedDesigns: designStats?.completed || 0,
      draftDesigns: designStats?.drafts || 0,
      designRevenue: designStats?.totalRevenue || 0,
      avgDesignPrice: designStats?.avgPrice || 0,
      designConversionRate: designStats?.conversionRate || 0,
    };
  }, [reportData, getProductStats, getUserStats, getEmployeeStats, getDesignStats]);

  // Función para validar y formatear datos de gráficos
  const getValidChartData = (labels, data, chartType) => {
    const chartColors = [
      '#1F64BF', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#3B82F6',
      '#059669', '#D97706', '#7C3AED', '#DC2626', '#2563EB', '#047857'
    ];

    if (chartType === 'line') {
      return {
        labels,
        datasets: [{
          label: 'Ingresos',
          data,
          fill: true,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, alpha('#1F64BF', 0.3));
            gradient.addColorStop(1, alpha('#1F64BF', 0));
            return gradient;
          },
          borderColor: '#1F64BF',
          borderWidth: 3,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#1F64BF',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
        }],
      };
    }

    if (chartType === 'doughnut' || chartType === 'pie') {
      return {
        labels,
        datasets: [{
          data,
          backgroundColor: chartColors.map(color => alpha(color, 0.8)),
          borderColor: '#FFFFFF',
          borderWidth: 3,
        }],
      };
    }

    // Default for Bar chart
    return {
      labels,
      datasets: [{
        label: 'Total',
        data,
        backgroundColor: chartColors.map(color => alpha(color, 0.6)),
        borderColor: chartColors,
        borderWidth: 2,
        borderRadius: 4,
      }],
    };
  };

  // Opciones de gráficos consistentes y responsive
  const getChartOptions = (chartType) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType !== 'line',
          position: isMobile ? 'bottom' : 'top',
          labels: {
            usePointStyle: true,
            padding: isMobile ? 8 : 15,
            font: { 
              size: isMobile ? 9 : isTablet ? 11 : 12, 
              weight: '600', 
              family: "'Mona Sans'" 
            },
            color: '#475569',
            boxWidth: isMobile ? 12 : 16,
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: alpha('#010326', 0.9),
          titleColor: '#FFFFFF',
          bodyColor: '#E2E8F0',
          titleFont: { 
            size: isMobile ? 12 : 14, 
            weight: 'bold', 
            family: "'Mona Sans'" 
          },
          bodyFont: { 
            size: isMobile ? 10 : 12, 
            family: "'Mona Sans'" 
          },
          padding: isMobile ? 8 : 12,
          cornerRadius: 8,
          boxPadding: 4,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(context.parsed.y);
              } else if (context.parsed !== null) {
                label += context.parsed;
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: { 
            font: { 
              family: "'Mona Sans'",
              size: isMobile ? 9 : 11
            }, 
            color: '#64748b',
            maxRotation: isMobile ? 45 : 0
          }
        },
        y: {
          border: { display: false },
          grid: { color: '#E2E8F0' },
          ticks: { 
            font: { 
              family: "'Mona Sans'",
              size: isMobile ? 9 : 11
            }, 
            color: '#64748b' 
          }
        }
      }
    };

    if (chartType === 'line') {
      return {
        ...baseOptions,
        scales: {
          ...baseOptions.scales,
          y: {
            ...baseOptions.scales.y,
            grid: { display: false }
          }
        }
      };
    }

    if (chartType === 'doughnut') {
      return {
        ...baseOptions,
        cutout: isMobile ? '50%' : '60%',
        scales: {
          x: { display: false }, 
          y: { display: false }
        }
      };
    }

    if (chartType === 'pie') {
      return {
        ...baseOptions,
        scales: {
          x: { display: false }, 
          y: { display: false }
        }
      };
    }

    if (chartType === 'polarArea') {
      return {
        ...baseOptions,
        scales: {
          r: {
            beginAtZero: true,
            grid: { color: '#E2E8F0' },
            ticks: { 
              font: { 
                family: "'Mona Sans'",
                size: isMobile ? 9 : 11
              }, 
              color: '#64748b' 
            }
          }
        }
      };
    }

    return baseOptions;
  };

  if (reportLoading) {
    return (
      <ReportsPageContainer>
        <ReportsContentWrapper>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '60vh', 
            gap: '24px' 
          }}>
            <CircularProgress 
              size={48} 
              sx={{ 
                color: '#1F64BF',
                filter: 'drop-shadow(0 4px 8px rgba(31, 100, 191, 0.3))'
              }} 
            />
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#010326', 
              fontWeight: 600, 
              fontFamily: "'Mona Sans'" 
            }}>
              Cargando reportes...
            </Typography>
          </Box>
        </ReportsContentWrapper>
      </ReportsPageContainer>
    );
  }

  return (
    <ReportsPageContainer>
      <ReportsContentWrapper>
        <ReportsHeaderSection>
          <ReportsHeaderContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
              <Box sx={{ 
                width: 56, 
                height: 56, 
                borderRadius: '16px', 
                background: 'rgba(255, 255, 255, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <ChartBar size={24} weight="duotone" />
              </Box>
              <Box>
                <ReportsMainTitle>
                  Reportes y Estadísticas
                </ReportsMainTitle>
                <ReportsMainDescription>
                  Análisis detallado de órdenes, ventas y rendimiento.
                </ReportsMainDescription>
              </Box>
            </Box>
            <ReportsHeaderActions>
              <ReportsPrimaryActionButton
                startIcon={<Download size={18} weight="bold" />}
                onClick={() => handleExport('excel')}
                disabled={exportLoading}
              >
                {isMobile ? 'Exportar' : 'Exportar Excel'}
              </ReportsPrimaryActionButton>
              <ReportsSecondaryActionButton
                onClick={() => handleExport('pdf')}
                title="Exportar PDF"
                disabled={exportLoading}
              >
                <Download size={20} weight="bold" />
              </ReportsSecondaryActionButton>
            </ReportsHeaderActions>
          </ReportsHeaderContent>
        </ReportsHeaderSection>

        {/* Grid de estadísticas principales - Responsive con MUI Grid */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
          {/* Ingresos Totales */}
          <Grid item xs={12} sm={6} md={3}>
            <ReportsStatCard variant="primary">
              <ReportsStatHeader>
                <Box>
                  <ReportsStatValue variant="primary">
                    {formatCurrency(stats.totalRevenue)}
                  </ReportsStatValue>
                  <ReportsStatLabel variant="primary">
                    Ingresos Totales
                  </ReportsStatLabel>
                </Box>
                <ReportsStatIconContainer variant="primary">
                  <TrendUp size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatChange variant="primary" trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText variant="primary" trend="up">
                  +12% este mes
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>
          </Grid>

          {/* Total de Órdenes */}
          <Grid item xs={12} sm={6} md={3}>
            <ReportsStatCard variant="secondary">
              <ReportsStatHeader>
                <Box>
                  <ReportsStatValue variant="secondary">
                    {stats.totalOrders}
                  </ReportsStatValue>
                  <ReportsStatLabel variant="secondary">
                    Total de Órdenes
                  </ReportsStatLabel>
                </Box>
                <ReportsStatIconContainer variant="secondary">
                  <ChartBar size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatChange variant="secondary" trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText variant="secondary" trend="up">
                  +8% este mes
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>
          </Grid>

          {/* Ticket Promedio */}
          <Grid item xs={12} sm={6} md={3}>
            <ReportsStatCard variant="secondary">
              <ReportsStatHeader>
                <Box>
                  <ReportsStatValue variant="secondary">
                    {formatCurrency(stats.averageOrderValue)}
                  </ReportsStatValue>
                  <ReportsStatLabel variant="secondary">
                    Ticket Promedio
                  </ReportsStatLabel>
                </Box>
                <ReportsStatIconContainer variant="secondary">
                  <Users size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatChange variant="secondary" trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText variant="secondary" trend="up">
                  +5% este mes
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>
          </Grid>

          {/* Clientes Únicos */}
          <Grid item xs={12} sm={6} md={3}>
            <ReportsStatCard variant="secondary">
              <ReportsStatHeader>
                <Box>
                  <ReportsStatValue variant="secondary">
                    {stats.totalUniqueCustomers}
                  </ReportsStatValue>
                  <ReportsStatLabel variant="secondary">
                    Clientes Únicos
                  </ReportsStatLabel>
                </Box>
                <ReportsStatIconContainer variant="secondary">
                  <Package size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatChange variant="secondary" trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText variant="secondary" trend="up">
                  +20 nuevos
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>
          </Grid>

          {/* Productos Activos */}
          <Grid item xs={12} sm={6} md={3}>
            <ReportsStatCard variant="secondary">
              <ReportsStatHeader>
                <Box>
                  <ReportsStatValue variant="secondary">
                    {stats.activeProducts}
                  </ReportsStatValue>
                  <ReportsStatLabel variant="secondary">
                    Productos Activos
                  </ReportsStatLabel>
                </Box>
                <ReportsStatIconContainer variant="secondary">
                  <Package size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatChange variant="secondary" trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText variant="secondary" trend="up">
                  {stats.totalProducts} total
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>
          </Grid>

          {/* Usuarios Activos */}
          <Grid item xs={12} sm={6} md={3}>
            <ReportsStatCard variant="secondary">
              <ReportsStatHeader>
                <Box>
                  <ReportsStatValue variant="secondary">
                    {stats.activeUsers}
                  </ReportsStatValue>
                  <ReportsStatLabel variant="secondary">
                    Usuarios Activos
                  </ReportsStatLabel>
                </Box>
                <ReportsStatIconContainer variant="secondary">
                  <Users size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatChange variant="secondary" trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText variant="secondary" trend="up">
                  {stats.totalUsers} total
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>
          </Grid>

          {/* Empleados Activos */}
          <Grid item xs={12} sm={6} md={3}>
            <ReportsStatCard variant="secondary">
              <ReportsStatHeader>
                <Box>
                  <ReportsStatValue variant="secondary">
                    {stats.activeEmployees}
                  </ReportsStatValue>
                  <ReportsStatLabel variant="secondary">
                    Empleados Activos
                  </ReportsStatLabel>
                </Box>
                <ReportsStatIconContainer variant="secondary">
                  <User size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatChange variant="secondary" trend="up">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText variant="secondary" trend="up">
                  {stats.totalEmployees} total
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>
          </Grid>

          {/* Diseños Pendientes */}
          <Grid item xs={12} sm={6} md={3}>
            <ReportsStatCard variant="secondary">
              <ReportsStatHeader>
                <Box>
                  <ReportsStatValue variant="secondary">
                    {stats.pendingDesigns}
                  </ReportsStatValue>
                  <ReportsStatLabel variant="secondary">
                    Diseños Pendientes
                  </ReportsStatLabel>
                </Box>
                <ReportsStatIconContainer variant="secondary">
                  <ChartLine size={24} weight="duotone" />
                </ReportsStatIconContainer>
              </ReportsStatHeader>
              <ReportsStatChange variant="secondary" trend="down">
                <TrendUp size={14} weight="bold" />
                <ReportsStatTrendText variant="secondary" trend="down">
                  {stats.totalDesigns} total
                </ReportsStatTrendText>
              </ReportsStatChange>
            </ReportsStatCard>
          </Grid>
        </Grid>

        {/* Sección de gráficas principales */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
          {/* Gráfico de Tendencia de Ingresos */}
          <Grid item xs={12}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Tendencia de Ingresos</Typography>
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 } }}>
                {reportData?.salesOverTime && reportData.salesOverTime.length > 0 ? (
                  <ChartErrorBoundary>
                    <Line
                      data={getValidChartData(
                        reportData.salesOverTime.map(item => new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })),
                        reportData.salesOverTime.map(item => item.totalRevenue),
                        'line'
                      )}
                      options={getChartOptions('line')}
                    />
                  </ChartErrorBoundary>
                ) : (
                  <Typography>No hay datos de ventas a lo largo del tiempo.</Typography>
                )}
              </Box>
            </ChartCard>
          </Grid>

          {/* Gráfico de Desglose de Órdenes por Estado */}
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Órdenes por Estado</Typography>
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 } }}>
                {reportData?.statusBreakdown ? (
                  <ChartErrorBoundary>
                    <Doughnut
                      data={getValidChartData(
                        reportData.statusBreakdown.map(item => item._id),
                        reportData.statusBreakdown.map(item => item.count),
                        'doughnut'
                      )}
                      options={getChartOptions('doughnut')}
                    />
                  </ChartErrorBoundary>
                ) : (
                  <Typography>No hay datos de estado.</Typography>
                )}
              </Box>
            </ChartCard>
          </Grid>

          {/* Gráfico de Ventas por Categoría */}
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Ventas por Categoría</Typography>
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 } }}>
                {reportData?.salesByCategory ? (
                  <ChartErrorBoundary>
                    <Bar
                      data={getValidChartData(
                        reportData.salesByCategory.map(item => item.categoryName),
                        reportData.salesByCategory.map(item => item.totalRevenue),
                        'bar'
                      )}
                      options={getChartOptions('bar')}
                    />
                  </ChartErrorBoundary>
                ) : (
                  <Typography>No hay datos de ventas por categoría.</Typography>
                )}
              </Box>
            </ChartCard>
          </Grid>

          {/* Gráfico de Distribución de Usuarios */}
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Distribución de Usuarios</Typography>
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 } }}>
                <ChartErrorBoundary>
                  <Pie
                    data={getValidChartData(
                      ['Activos', 'Inactivos', 'Admins', 'Premium', 'Clientes'],
                      [stats.activeUsers, stats.inactiveUsers, stats.adminUsers, stats.premiumUsers, stats.customerUsers],
                      'pie'
                    )}
                    options={getChartOptions('pie')}
                  />
                </ChartErrorBoundary>
              </Box>
            </ChartCard>
          </Grid>

          {/* Gráfico de Distribución de Empleados */}
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Distribución de Empleados</Typography>
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 } }}>
                <ChartErrorBoundary>
                  <PolarArea
                    data={getValidChartData(
                      ['Admins', 'Gerentes', 'Empleados', 'Delivery'],
                      [stats.adminEmployees, stats.managerEmployees, stats.regularEmployees, stats.deliveryEmployees],
                      'polarArea'
                    )}
                    options={getChartOptions('polarArea')}
                  />
                </ChartErrorBoundary>
              </Box>
            </ChartCard>
          </Grid>

          {/* Gráfico de Estado de Diseños */}
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Estado de Diseños</Typography>
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 } }}>
                <ChartErrorBoundary>
                  <Bar
                    data={getValidChartData(
                      ['Pendientes', 'Cotizados', 'Aprobados', 'Rechazados', 'Completados', 'Borradores'],
                      [stats.pendingDesigns, stats.quotedDesigns, stats.approvedDesigns, stats.rejectedDesigns, stats.completedDesigns, stats.draftDesigns],
                      'bar'
                    )}
                    options={getChartOptions('bar')}
                  />
                </ChartErrorBoundary>
              </Box>
            </ChartCard>
          </Grid>

          {/* Gráfico de Estado de Productos */}
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Estado de Productos</Typography>
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 } }}>
                <ChartErrorBoundary>
                  <Doughnut
                    data={getValidChartData(
                      ['Activos', 'Inactivos'],
                      [stats.activeProducts, stats.inactiveProducts],
                      'doughnut'
                    )}
                    options={getChartOptions('doughnut')}
                  />
                </ChartErrorBoundary>
              </Box>
            </ChartCard>
          </Grid>
        </Grid>

        {reportError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error al cargar los reportes: {reportError}
          </Alert>
        )}
      </ReportsContentWrapper>
    </ReportsPageContainer>
  );
});

export default ReportsPage;