// src/pages/Orders/Orders.jsx - Página principal de gestión de órdenes
import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  InputAdornment,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Paper,
  styled,
  useTheme,
  alpha,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  Tooltip,
  Dialog
} from '@mui/material';
import {
  Package,
  Eye,
  ShoppingCart,
  TrendUp,
  Plus,
  Funnel,
  MagnifyingGlass,
  ArrowsClockwise,
  ListBullets,
  Broom,
  DotsThreeVertical,
  PencilSimple,
  Trash,
  CurrencyDollar,
  Truck,
  MapPin,
  Calendar,
  User,
  Receipt,
} from '@phosphor-icons/react';

import { useOrders, useDashboardStats } from '../../hooks/useOrders';
import ManualOrderForm from './Components/ManualOrderForm';
import OrderDetailsModal from './Components/OrderDetailModal';

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

// ================ ESTILOS MODERNOS RESPONSIVE - ORDERS ================ 
const OrdersPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const OrdersContentWrapper = styled(Box)(({ theme }) => ({
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

const OrdersModernCard = styled(Paper)(({ theme }) => ({
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

const OrdersHeaderSection = styled(OrdersModernCard)(({ theme }) => ({
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

const OrdersHeaderContent = styled(Box)(({ theme }) => ({
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

const OrdersHeaderInfo = styled(Box)(({ theme }) => ({
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

const OrdersMainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: '700 !important',
  color: '#010326',
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

const OrdersMainDescription = styled(Typography)(({ theme }) => ({
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

const OrdersHeaderActions = styled(Box)(({ theme }) => ({
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

const OrdersPrimaryActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
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
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
    boxShadow: '0 6px 24px rgba(31, 100, 191, 0.32)',
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

const OrdersSecondaryActionButton = styled(IconButton)(({ theme }) => ({
  background: alpha('#1F64BF', 0.08),
  color: '#1F64BF',
  borderRadius: '12px',
  width: '52px',
  height: '52px',
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
    background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.15), transparent)',
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    background: alpha('#1F64BF', 0.12),
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

// GRID DE ESTADÍSTICAS ORDERS
const OrdersStatsGrid = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gap: '24px',
  gridTemplateColumns: 'repeat(4, 1fr)',
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

const OrdersStatCard = styled(OrdersModernCard)(({ theme, variant }) => {
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

const OrdersStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
  width: '100%',
});

const OrdersStatIconContainer = styled(Box)(({ variant, theme }) => ({
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: (variant === 'primary' || variant === 'success' || variant === 'warning')
    ? 'rgba(255, 255, 255, 0.15)' 
    : alpha('#1F64BF', 0.08),
  backdropFilter: 'blur(8px)',
  color: (variant === 'primary' || variant === 'success' || variant === 'warning') ? 'white' : '#1F64BF',
  flexShrink: 0,
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  position: 'relative',
  zIndex: 2,
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

const OrdersStatChange = styled(Box)(({ variant, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: 'auto',
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

const OrdersStatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
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

const OrdersStatValue = styled(Typography)(({ variant, theme }) => ({
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

const OrdersStatLabel = styled(Typography)(({ variant, theme }) => ({
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

const OrdersControlsSection = styled(OrdersModernCard)(({ theme }) => ({
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

const OrdersModernTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  fontFamily: "'Mona Sans'",
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F2F2F2',
    transition: 'all 0.3s ease',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(1, 3, 38, 0.08)',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: '0 4px 16px rgba(31, 100, 191, 0.12)',
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

const OrdersTableContainer = styled(OrdersModernCard)(({ theme }) => ({
  padding: '0',
  overflow: 'hidden',
  marginBottom: '32px',
  '& .MuiTableContainer-root': {
    borderRadius: '16px',
  }
}));

const OrdersTable = styled(Table)(({ theme }) => ({
  '& .MuiTableHead-root': {
    background: alpha('#1F64BF', 0.04),
  },
  '& .MuiTableCell-head': {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#032CA6',
    borderBottom: `1px solid ${alpha('#1F64BF', 0.1)}`,
    fontFamily: "'Mona Sans'",
  },
  '& .MuiTableCell-body': {
    fontSize: '0.9rem',
    color: '#010326',
    borderBottom: `1px solid ${alpha('#1F64BF', 0.05)}`,
    fontFamily: "'Mona Sans'",
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha('#1F64BF', 0.03),
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(31, 100, 191, 0.15)',
    }
  }
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const getStatusStyles = (status) => {
    const styles = {
      pending_approval: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
      quoted: { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' },
      approved: { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
      in_production: { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' },
      quality_check: { bg: '#fed7aa', color: '#9a3412', border: '#f97316' },
      quality_approved: { bg: '#ecfccb', color: '#365314', border: '#84cc16' },
      packaging: { bg: '#f3e8ff', color: '#581c87', border: '#a855f7' },
      ready_for_delivery: { bg: '#e9d5ff', color: '#7c2d12', border: '#8b5cf6' },
      out_for_delivery: { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' },
      delivered: { bg: '#dcfce7', color: '#166534', border: '#22c55e' },
      completed: { bg: '#d1fae5', color: '#064e3b', border: '#059669' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
      on_hold: { bg: '#f3f4f6', color: '#374151', border: '#6b7280' }
    };
    return styles[status] || styles.on_hold;
  };

  const statusStyles = getStatusStyles(status);

  return {
    backgroundColor: statusStyles.bg,
    color: statusStyles.color,
    border: `1px solid ${statusStyles.border}`,
    fontSize: '0.75rem',
    fontWeight: 600,
    height: '24px',
    fontFamily: "'Mona Sans'",
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }
  };
});

// Botón Limpiar con efecto shimmer
const OrdersClearButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#032CA6',
  backgroundColor: alpha('#032CA6', 0.1),
  padding: '10px 16px',
  minWidth: 'auto',
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
    background: 'linear-gradient(90deg, transparent, rgba(3, 44, 166, 0.15), transparent)',
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    backgroundColor: alpha('#032CA6', 0.15),
    '&::before': { left: '100%' }
  }
}));

// Botones de paginación con efecto shimmer
const OrdersPaginationButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  borderColor: alpha('#1F64BF', 0.3),
  color: '#1F64BF',
  minWidth: { xs: '100%', sm: 'auto' },
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
    background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.15), transparent)',
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    borderColor: '#1F64BF',
    backgroundColor: alpha('#1F64BF', 0.05),
    '&::before': { left: '100%' }
  },
  '&:disabled': {
    borderColor: alpha('#1F64BF', 0.1),
    color: alpha('#1F64BF', 0.3),
  }
}));

// Botones de acción en tabla con efecto shimmer
const OrdersActionButton = styled(IconButton)(({ theme, color: buttonColor }) => ({
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: buttonColor === 'success' 
      ? 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.15), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.15), transparent)',
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    backgroundColor: buttonColor === 'success' 
      ? alpha('#10b981', 0.08) 
      : alpha('#1F64BF', 0.08),
    transform: 'translateY(-1px)',
    '&::before': { left: '100%' }
  }
}));

// ================ COMPONENTE PRINCIPAL ================
const Orders = () => {
  const theme = useTheme();
  
  // ==================== HOOKS ====================
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    fetchOrders,
    updateOrderStatus,
    updateFilters,
    clearFilters,
    refreshOrders,
    hasOrders,
    isEmpty,
    getStatusColor
  } = useOrders();

  const {
    todayOrders,
    todayRevenue,
    monthOrders,
    inProduction,
    readyForDelivery,
    loading: statsLoading
  } = useDashboardStats();

  // ==================== ESTADOS LOCALES ====================
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // ==================== EFECTOS ====================
  useEffect(() => {
    updateFilters({
      search: searchQuery,
      status: statusFilter === 'all' ? '' : statusFilter,
      sort: sortOption
    });
  }, [searchQuery, statusFilter, sortOption, updateFilters]);

  // ==================== CALCULADOS ====================
  const stats = useMemo(() => [
    {
      id: 'today-orders',
      title: "Órdenes de Hoy",
      value: todayOrders,
      change: "+12% vs ayer",
      trend: "up",
      icon: Package,
      variant: "primary"
    },
    {
      id: 'today-revenue',
      title: "Ingresos de Hoy",
      value: new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(todayRevenue),
      change: `${todayRevenue.toFixed(0)}`,
      trend: "up",
      icon: CurrencyDollar,
      variant: "secondary"
    },
    {
      id: 'in-production',
      title: "En Producción",
      value: inProduction,
      change: `${inProduction} órdenes activas`,
      trend: "up",
      icon: ShoppingCart,
      variant: "secondary"
    },
    {
      id: 'ready-delivery',
      title: "Listas para Entrega",
      value: readyForDelivery,
      change: "Pendientes de envío",
      trend: "up",
      icon: Truck,
      variant: "secondary"
    }
  ], [todayOrders, todayRevenue, inProduction, readyForDelivery]);

  // ==================== MANEJADORES ====================
  const handleCreateManualOrder = () => {
    setShowManualOrderModal(true);
  };

  const handleCloseManualOrderModal = () => {
    setShowManualOrderModal(false);
  };

  const handleOrderCreated = async () => {
    setShowManualOrderModal(false);
    await refreshOrders();
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const handleStatusChange = async (orderId, newStatus, orderNumber) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: '¿Cambiar estado?',
        text: `¿Cambiar estado de la orden ${orderNumber} a "${newStatus}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1F64BF',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
      });

      if (isConfirmed) {
        await updateOrderStatus(orderId, newStatus);
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const handleViewOrder = (order) => {
    Swal.fire({
      title: `Orden ${order.orderNumber}`,
      html: `
        <div style="text-align: left; padding: 20px; line-height: 1.6;">
          <div style="margin-bottom: 12px;"><strong>Cliente:</strong> ${order.user?.name || 'N/A'}</div>
          <div style="margin-bottom: 12px;"><strong>Estado:</strong> ${order.statusLabel}</div>
          <div style="margin-bottom: 12px;"><strong>Total:</strong> ${order.formattedTotal}</div>
          <div style="margin-bottom: 12px;"><strong>Entrega:</strong> ${order.deliveryLabel}</div>
          <div style="margin-bottom: 12px;"><strong>Creado:</strong> ${order.formattedCreatedAt}</div>
          ${order.clientNotes ? `<div style="margin-top: 16px;"><strong>Notas:</strong><br/><span style="color: #666;">${order.clientNotes}</span></div>` : ''}
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#1F64BF',
      width: 600,
      customClass: {
        container: 'swal-overlay-custom',
        popup: 'swal-modal-custom'
      }
    });
  };

  const handleMenuClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortOption('newest');
    clearFilters();
  };

  // ==================== RENDER ====================
  if (loading && !hasOrders) {
    return (
      <OrdersPageContainer>
        <OrdersContentWrapper>
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
            <Typography variant="body1" sx={{ 
              color: '#010326', 
              fontWeight: 600, 
              fontFamily: "'Mona Sans'" 
            }}>
              Cargando órdenes...
            </Typography>
          </Box>
        </OrdersContentWrapper>
      </OrdersPageContainer>
    );
  }

  return (
    <OrdersPageContainer>
      <OrdersContentWrapper>
        {/* Header Principal */}
        <OrdersHeaderSection>
          <OrdersHeaderContent>
            <OrdersHeaderInfo>
              <OrdersMainTitle>
                Gestión de Órdenes
              </OrdersMainTitle>
              <OrdersMainDescription>
                Administra todos los pedidos y controla el flujo de producción
              </OrdersMainDescription>
            </OrdersHeaderInfo>
            
            <OrdersHeaderActions>
              <OrdersPrimaryActionButton
                onClick={handleCreateManualOrder}
                disabled={loading}
                startIcon={<Plus size={18} weight="bold" />}
              >
                Pedido Manual
              </OrdersPrimaryActionButton>
              
              <OrdersSecondaryActionButton
                onClick={refreshOrders}
                disabled={loading}
                title="Refrescar órdenes"
              >
                <ArrowsClockwise size={20} weight="bold" />
              </OrdersSecondaryActionButton>
            </OrdersHeaderActions>
          </OrdersHeaderContent>
        </OrdersHeaderSection>

        {/* Error Message */}
        {error && (
          <OrdersModernCard sx={{ 
            p: 3, 
            mb: 4,
            background: alpha('#dc2626', 0.05),
            border: `1px solid ${alpha('#dc2626', 0.2)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#dc2626', fontWeight: 500, fontFamily: "'Mona Sans'" }}>
                ⚠️ {error}
              </Typography>
              <Button 
                size="small" 
                onClick={refreshOrders}
                sx={{ 
                  color: '#dc2626',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontFamily: "'Mona Sans'"
                }}
              >
                Reintentar
              </Button>
            </Box>
          </OrdersModernCard>
        )}

        {/* Estadísticas */}
        <Box sx={{ mb: 4 }}>
          <OrdersStatsGrid>
            {stats.map((stat) => (
              <OrdersStatCard key={stat.id} variant={stat.variant}>
                <OrdersStatHeader>
                  <Box>
                    <OrdersStatValue variant={stat.variant}>
                      {stat.value}
                    </OrdersStatValue>
                    <OrdersStatLabel variant={stat.variant}>
                      {stat.title}
                    </OrdersStatLabel>
                  </Box>
                  <OrdersStatIconContainer variant={stat.variant}>
                    <stat.icon size={24} weight="duotone" />
                  </OrdersStatIconContainer>
                </OrdersStatHeader>
                <OrdersStatChange variant={stat.variant} trend={stat.trend}>
                  <TrendUp size={12} weight="bold" />
                  <OrdersStatTrendText variant={stat.variant} trend={stat.trend}>
                    {stat.change}
                  </OrdersStatTrendText>
                </OrdersStatChange>
              </OrdersStatCard>
            ))}
          </OrdersStatsGrid>
        </Box>

        {/* Controles de búsqueda y filtros */}
        <OrdersControlsSection>
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', md: 'row' }
          }}>
            {/* Búsqueda */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <OrdersModernTextField
                placeholder="Buscar por número de orden, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlass size={18} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Filtros */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              alignItems: 'center',
              flexWrap: 'wrap',
              width: { xs: '100%', md: 'auto' }
            }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#F2F2F2',
                    border: 'none',
                    fontFamily: "'Mona Sans'",
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '&:hover': { backgroundColor: 'white' },
                    '& .MuiSelect-select': { 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      fontFamily: "'Mona Sans'",
                    }
                  }}
                >
                  <MenuItem value="all">Todos los estados</MenuItem>
                  <MenuItem value="pending_approval">Pendiente Aprobación</MenuItem>
                  <MenuItem value="quoted">Cotizado</MenuItem>
                  <MenuItem value="approved">Aprobado</MenuItem>
                  <MenuItem value="in_production">En Producción</MenuItem>
                  <MenuItem value="quality_check">Control de Calidad</MenuItem>
                  <MenuItem value="quality_approved">Calidad Aprobada</MenuItem>
                  <MenuItem value="packaging">Empacando</MenuItem>
                  <MenuItem value="ready_for_delivery">Listo para Entrega</MenuItem>
                  <MenuItem value="out_for_delivery">En Camino</MenuItem>
                  <MenuItem value="delivered">Entregado</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#F2F2F2',
                    border: 'none',
                    fontFamily: "'Mona Sans'",
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '&:hover': { backgroundColor: 'white' },
                    '& .MuiSelect-select': { 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      fontFamily: "'Mona Sans'",
                    }
                  }}
                >
                  <MenuItem value="newest">Más recientes</MenuItem>
                  <MenuItem value="oldest">Más antiguos</MenuItem>
                  <MenuItem value="total_desc">Mayor valor</MenuItem>
                  <MenuItem value="total_asc">Menor valor</MenuItem>
                </Select>
              </FormControl>

              {(searchQuery || statusFilter !== 'all' || sortOption !== 'newest') && (
                <OrdersClearButton
                  onClick={handleClearFilters}
                  startIcon={<Broom size={16} weight="bold" />}
                >
                  Limpiar
                </OrdersClearButton>
              )}
            </Box>
          </Box>
        </OrdersControlsSection>

        {/* Tabla de Órdenes */}
        <OrdersTableContainer>
          {loading && hasOrders && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 2,
              backgroundColor: alpha('#1F64BF', 0.04)
            }}>
              <CircularProgress size={20} sx={{ color: '#1F64BF', mr: 2 }} />
              <Typography variant="body2" sx={{ 
                color: '#1F64BF', 
                fontWeight: 600, 
                fontFamily: "'Mona Sans'" 
              }}>
                Actualizando órdenes...
              </Typography>
            </Box>
          )}

          {hasOrders ? (
            <TableContainer>
              <OrdersTable>
                <TableHead>
                  <TableRow>
                    <TableCell>Orden</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Entrega</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600,
                            color: '#010326',
                            fontFamily: "'Mona Sans'"
                          }}>
                            # {order.orderNumber}
                          </Typography>
                          {order.isManualOrder && (
                            <Chip 
                              label="Manual" 
                              size="small"
                              sx={{
                                height: '18px',
                                fontSize: '0.7rem',
                                backgroundColor: alpha('#8b5cf6', 0.1),
                                color: '#8b5cf6',
                                fontWeight: 600,
                                fontFamily: "'Mona Sans'"
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <User size={16} color="#032CA6" />
                          <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                            {order.user?.name || 'Cliente no disponible'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusChip 
                          label={order.statusLabel}
                          status={order.status}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600,
                          color: '#010326',
                          fontFamily: "'Mona Sans'"
                        }}>
                          {order.formattedTotal}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {order.deliveryType === 'delivery' ? (
                            <Truck size={16} color="#032CA6" />
                          ) : (
                            <MapPin size={16} color="#032CA6" />
                          )}
                          <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                            {order.deliveryLabel}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Calendar size={16} color="#032CA6" />
                          <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                            {order.formattedCreatedAt}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Tooltip title="Ver detalles">
                            <OrdersActionButton
                              onClick={() => handleViewOrderDetails(order)}
                              size="small"
                              color="success"
                              sx={{
                                color: '#10b981',
                              }}
                            >
                              <Eye size={18} weight="bold" />
                            </OrdersActionButton>
                          </Tooltip>
                          <Tooltip title="Más acciones">
                            <OrdersActionButton
                              onClick={(e) => handleMenuClick(e, order)}
                              size="small"
                              sx={{
                                color: '#032CA6',
                              }}
                            >
                              <DotsThreeVertical size={18} weight="bold" />
                            </OrdersActionButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </OrdersTable>
            </TableContainer>
          ) : (
            <Box sx={{ 
              p: 8, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: alpha('#1F64BF', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F64BF'
              }}>
                <Package size={32} weight="duotone" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ 
                  color: '#010326', 
                  fontWeight: 600,
                  mb: 1,
                  fontFamily: "'Mona Sans'" 
                }}>
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No hay órdenes que coincidan' 
                    : 'No hay órdenes registradas'
                  }
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#032CA6', 
                  maxWidth: 400,
                  mx: 'auto',
                  fontFamily: "'Mona Sans'" 
                }}>
                  {searchQuery || statusFilter !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda o crear una nueva orden'
                    : 'Comienza creando tu primera orden o pedido manual'
                  }
                </Typography>
              </Box>
              <OrdersPrimaryActionButton
                onClick={handleCreateManualOrder}
                startIcon={<Plus size={18} weight="bold" />}
              >
                Crear Pedido Manual
              </OrdersPrimaryActionButton>
            </Box>
          )}
        </OrdersTableContainer>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}>
            <OrdersPaginationButton
              variant="outlined"
              onClick={() => fetchOrders({ ...filters, page: pagination.page - 1 })}
              disabled={!pagination.hasPrev || loading}
            >
              ← Anterior
            </OrdersPaginationButton>
            
            <OrdersModernCard sx={{ 
              px: 3, 
              py: 1,
              minWidth: { xs: '100%', sm: 'auto' },
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ 
                color: '#032CA6', 
                fontWeight: 600,
                fontFamily: "'Mona Sans'" 
              }}>
                Página {pagination.page} de {pagination.totalPages}
              </Typography>
            </OrdersModernCard>
            
            <OrdersPaginationButton
              variant="outlined"
              onClick={() => fetchOrders({ ...filters, page: pagination.page + 1 })}
              disabled={!pagination.hasNext || loading}
            >
              Siguiente →
            </OrdersPaginationButton>
          </Box>
        )}

        {/* Menú de acciones */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)',
              border: `1px solid ${alpha('#1F64BF', 0.08)}`
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              handleViewOrder(selectedOrder);
              handleMenuClose();
            }}
            sx={{ fontFamily: "'Mona Sans'", gap: 1 }}
          >
            <Eye size={16} weight="bold" />
            Ver detalles
          </MenuItem>
          
          {selectedOrder?.canBeEdited && (
            <MenuItem 
              onClick={() => {
                handleStatusChange(
                  selectedOrder._id, 
                  'in_production', 
                  selectedOrder.orderNumber
                );
                handleMenuClose();
              }}
              sx={{ fontFamily: "'Mona Sans'", gap: 1 }}
            >
              <PencilSimple size={16} weight="bold" />
              Pasar a producción
            </MenuItem>
          )}
          
          <MenuItem 
            onClick={() => {
              // Abrir modal de pagos
              handleMenuClose();
            }}
            sx={{ fontFamily: "'Mona Sans'", gap: 1 }}
          >
            <Receipt size={16} weight="bold" />
            Ver pagos
          </MenuItem>
        </Menu>

        {/* Modal de pedido manual */}
        <Dialog
          open={showManualOrderModal}
          onClose={handleCloseManualOrderModal}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 24px 64px rgba(1, 3, 38, 0.12)'
            }
          }}
        >
          <ManualOrderForm
            open={showManualOrderModal}
            onClose={handleCloseManualOrderModal}
            onOrderCreated={handleOrderCreated}
          />
        </Dialog>

        {/* Modal de detalles de orden */}
        <OrderDetailsModal
          open={showOrderDetailsModal}
          onClose={() => {
            setShowOrderDetailsModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onStatusChange={(orderId, newStatus) => {
            // Refrescar órdenes después del cambio de estado
            refreshOrders();
          }}
        />
      </OrdersContentWrapper>
    </OrdersPageContainer>
  );
};

export default Orders;