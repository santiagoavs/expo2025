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
  Skeleton
} from '@mui/material';
import {
  MapPin,
  Users,
  House,
  TrendUp,
  Plus,
  Funnel,
  MagnifyingGlass,
  ArrowClockwise,
  SquaresFour as GridIcon,
  Broom,
  Star,
  ChartLine,
  Export,
  MapPin as MapIcon,
  Phone,
  Compass
} from '@phosphor-icons/react';

import useAddresses from '../../hooks/useAddresses';
import useUsers from '../../hooks/useUsers';
import AddressTable from '../../pages/AddressManagement/AddressTable/AddressTable';
import AddressFormModal from '../../pages/AddressManagement/AddressFormModal/AddressFormModal';
import AddressMap from '../../pages/AddressManagement/AddressMap/AddressMap';

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

// ================ ESTILOS MODERNOS RESPONSIVE - DIRECCIONES ================ 
const AddressPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const AddressContentWrapper = styled(Box)(({ theme }) => ({
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

const AddressModernCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s ease',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  }
}));

const AddressHeaderSection = styled(AddressModernCard)(({ theme }) => ({
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

const AddressHeaderContent = styled(Box)(({ theme }) => ({
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

const AddressHeaderInfo = styled(Box)(({ theme }) => ({
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

const AddressMainTitle = styled(Typography)(({ theme }) => ({
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

const AddressMainDescription = styled(Typography)(({ theme }) => ({
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

const AddressHeaderActions = styled(Box)(({ theme }) => ({
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

const AddressPrimaryActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
  transition: 'all 0.3s ease',
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

const AddressSecondaryActionButton = styled(IconButton)(({ theme }) => ({
  background: alpha('#1F64BF', 0.08),
  color: '#1F64BF',
  borderRadius: '12px',
  width: '52px',
  height: '52px',
  transition: 'all 0.3s ease',
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

// CONTENEDOR UNIFICADO DIRECCIONES
const AddressUnifiedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
}));

const AddressStatsContainer = styled(AddressUnifiedContainer)(({ theme }) => ({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
}));

// GRID DE ESTADÍSTICAS DIRECCIONES
const AddressStatsGrid = styled(Box)(({ theme }) => ({
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

const AddressStatCard = styled(AddressModernCard)(({ theme, variant }) => {
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

const AddressStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
  width: '100%',
});

const AddressStatIconContainer = styled(Box)(({ variant, theme }) => ({
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

const AddressStatValue = styled(Typography)(({ variant, theme }) => ({
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

const AddressStatLabel = styled(Typography)(({ variant, theme }) => ({
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

const AddressStatChange = styled(Box)(({ variant, trend }) => ({
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

const AddressStatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
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

const AddressControlsSection = styled(AddressModernCard)(({ theme }) => ({
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

const AddressControlsContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '24px',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    gap: '20px',
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '18px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
  }
}));

const AddressSearchSection = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  [theme.breakpoints.down('md')]: {
    flex: 'none',
    width: '100%',
  }
}));

const AddressModernTextField = styled(TextField)(({ theme }) => ({
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

const AddressFiltersSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  flexWrap: 'wrap',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    gap: '12px',
  },
  [theme.breakpoints.down('md')]: {
    justifyContent: 'flex-start',
    gap: '12px',
    width: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
    gap: '10px',
    '& > *': {
      minWidth: 'fit-content',
    }
  }
}));

const AddressFilterChip = styled(Box)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  borderRadius: '10px',
  background: active ? alpha('#1F64BF', 0.1) : '#F2F2F2',
  border: `1px solid ${active ? alpha('#1F64BF', 0.2) : 'transparent'}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.9rem',
  fontWeight: 500,
  color: active ? '#1F64BF' : '#032CA6',
  whiteSpace: 'nowrap',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    background: active ? alpha('#1F64BF', 0.15) : 'white',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('lg')]: {
    padding: '8px 12px',
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '8px 10px',
    fontSize: '0.8rem',
  }
}));

// Selects originales sin efectos especiales
const AddressStyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: '12px',
  backgroundColor: '#F2F2F2',
  transition: 'all 0.2s ease',
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiSelect-select': {
    padding: '8px 12px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#010326',
    fontFamily: "'Mona Sans'",
  }
}));

const AddressContentSection = styled(AddressUnifiedContainer)({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
});

const AddressSectionHeader = styled(Box)(({ theme }) => ({
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

const AddressSectionTitle = styled(Typography)(({ theme }) => ({
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

const AddressViewToggleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'center',
  }
}));

const AddressViewToggleButton = styled(Button)(({ theme, active }) => ({
  minWidth: '48px',
  height: '48px',
  borderRadius: '12px',
  background: active ? alpha('#1F64BF', 0.1) : '#F2F2F2',
  color: active ? '#1F64BF' : '#032CA6',
  border: `1px solid ${active ? alpha('#1F64BF', 0.2) : 'transparent'}`,
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
    background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)',
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    background: active ? alpha('#1F64BF', 0.15) : 'white',
    transform: 'translateY(-1px)',
    '&::before': { left: '100%' }
  },
  [theme.breakpoints.down('sm')]: {
    flex: 1,
    fontSize: '0.8rem',
    gap: '6px',
  }
}));

const AddressEmptyState = styled(AddressModernCard)(({ theme }) => ({
  padding: '100px 40px',
  textAlign: 'center',
  background: 'white',
  border: `2px dashed ${alpha('#1F64BF', 0.2)}`,
  width: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: alpha('#1F64BF', 0.4),
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)'
  },
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

const AddressEmptyStateIcon = styled(Box)(({ theme }) => ({
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

const AddressEmptyStateTitle = styled(Typography)(({ theme }) => ({
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

const AddressEmptyStateDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: '#64748b',
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

const AddressLoadingContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: '24px',
});

// Botón Limpiar con efecto shimmer
const AddressClearButton = styled(Button)(({ theme }) => ({
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

// ================ COMPONENTE PRINCIPAL ================
const AddressManagement = () => {
  const theme = useTheme();
  
  // ==================== HOOKS ====================
  const {
    addresses,
    loading,
    error,
    pagination,
    filters,
    statistics,
    selectedAddresses,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    hardDeleteAddress,
    setDefaultAddress,
    unsetDefaultAddress,
    activateAddress,
    deactivateAddress,
    updateFilters,
    clearFilters,
    batchUpdateAddresses,
    batchDeleteAddresses,
    exportAddresses,
    getCalculatedStats,
    hasAddresses,
    isEmpty
  } = useAddresses();

  const { users, loading: loadingUsers } = useUsers();

  // ==================== ESTADOS LOCALES ====================
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState('');
  const [sortOption, setSortOption] = useState('createdAt_desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'map'

  // ==================== EFECTOS ====================
  useEffect(() => {
    updateFilters({
      search: searchQuery,
      department: selectedDepartment,
      userId: selectedUser,
      isActive: selectedStatus === 'all' ? null : selectedStatus === 'active' ? true : false,
      sort: sortOption
    });
  }, [searchQuery, selectedDepartment, selectedUser, selectedStatus, sortOption, updateFilters]);

  // ==================== CALCULADOS ====================
  const stats = useMemo(() => {
    const calculatedStats = getCalculatedStats();
    
    return [
      {
        id: 'total-addresses',
        title: "Total Direcciones",
        value: calculatedStats.total,
        change: `${calculatedStats.activePercentage}% activas`,
        trend: "up",
        icon: MapPin,
        variant: "primary"
      },
      {
        id: 'active-addresses',
        title: "Direcciones Activas",
        value: calculatedStats.active,
        change: `${calculatedStats.active}/${calculatedStats.total} activas`,
        trend: "up",
        icon: House,
        variant: "secondary"
      },
      {
        id: 'total-users',
        title: "Usuarios con Direcciones",
        value: Object.keys(calculatedStats.byUser).length,
        change: "Usuarios registrados",
        trend: "up",
        icon: Users,
        variant: "secondary"
      },
      {
        id: 'departments-covered',
        title: "Departamentos Cubiertos",
        value: Object.keys(calculatedStats.byDepartment).length,
        change: "De 14 departamentos",
        trend: "up",
        icon: Compass,
        variant: "secondary"
      }
    ];
  }, [getCalculatedStats]);

  const departmentOptions = useMemo(() => {
    const uniqueDepartments = [...new Set(addresses.map(addr => addr.department))];
    return uniqueDepartments.sort();
  }, [addresses]);

  // ==================== MANEJADORES ====================
  const handleCreateAddress = () => {
    setEditingAddress(null);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingAddress(null);
  };

  const handleAddressCreated = async (addressData, mode = 'create') => {
    try {
      if (mode === 'edit' && editingAddress) {
        await updateAddress(editingAddress.id, addressData);
      } else {
        await createAddress(addressData);
      }
      
      setShowCreateModal(false);
      setEditingAddress(null);

      await Swal.fire({
        title: '¡Éxito!',
        text: mode === 'edit' ? 'Dirección actualizada exitosamente' : 'Dirección creada exitosamente',
        icon: 'success',
        confirmButtonColor: '#1F64BF',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
    } catch (error) {
      console.error('Error en handleAddressCreated:', error);
      await Swal.fire({
        title: 'Error',
        text: error.message || `Error al ${mode === 'edit' ? 'actualizar' : 'crear'} la dirección`,
        icon: 'error',
        confirmButtonColor: '#1F64BF',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
    }
  };

  const handleEditAddress = (address) => {
    console.log('🔧 [AddressManagement] Editing address:', address);
    setEditingAddress(address);
    setShowCreateModal(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const address = addresses.find(addr => addr.id === addressId);
      const addressLabel = address?.fullAddress || 'esta dirección';
      
      const { isConfirmed } = await Swal.fire({
        title: '¿Eliminar dirección?',
        text: `¿Estás seguro de eliminar "${addressLabel}"? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });

      if (isConfirmed) {
        await deleteAddress(addressId);
        
        await Swal.fire({
          title: '¡Eliminada!',
          text: 'La dirección ha sido eliminada exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF',
          backdrop: `rgba(0,0,0,0.7)`,
          customClass: {
            container: 'swal-overlay-custom',
            popup: 'swal-modal-custom'
          }
        });
      }
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la dirección',
        icon: 'error',
        confirmButtonColor: '#1F64BF',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleUnsetDefaultAddress = async (addressId) => {
    try {
      await unsetDefaultAddress(addressId);
    } catch (error) {
      console.error('Error unsetting default address:', error);
    }
  };

  const handleActivateAddress = async (addressId) => {
    try {
      await activateAddress(addressId);
    } catch (error) {
      console.error('Error activating address:', error);
    }
  };

  const handleDeactivateAddress = async (addressId) => {
    try {
      await deactivateAddress(addressId);
    } catch (error) {
      console.error('Error deactivating address:', error);
    }
  };

  const handleHardDeleteAddress = async (addressId) => {
    try {
      const address = addresses.find(addr => addr.id === addressId);
      const addressLabel = address?.fullAddress || 'esta dirección';
      
      const { isConfirmed } = await Swal.fire({
        title: '¿Eliminar permanentemente?',
        text: `¿Estás seguro de eliminar permanentemente "${addressLabel}"? Esta acción NO se puede deshacer.`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar permanentemente',
        cancelButtonText: 'Cancelar',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });

      if (isConfirmed) {
        await hardDeleteAddress(addressId);
        
        await Swal.fire({
          title: '¡Eliminada permanentemente!',
          text: 'La dirección ha sido eliminada permanentemente de la base de datos',
          icon: 'success',
          confirmButtonColor: '#1F64BF',
          backdrop: `rgba(0,0,0,0.7)`,
          customClass: {
            container: 'swal-overlay-custom',
            popup: 'swal-modal-custom'
          }
        });
      }
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la dirección permanentemente',
        icon: 'error',
        confirmButtonColor: '#1F64BF',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
    }
  };

  const handleBatchAction = async (action) => {
    if (selectedAddresses.length === 0) {
      await Swal.fire({
        title: 'Sin selección',
        text: 'Selecciona al menos una dirección para continuar',
        icon: 'warning',
        confirmButtonColor: '#1F64BF'
      });
      return;
    }

    try {
      let result;
      
      if (action === 'delete') {
        const { isConfirmed } = await Swal.fire({
          title: '¿Eliminar direcciones seleccionadas?',
          text: `Se eliminarán ${selectedAddresses.length} direcciones. Esta acción no se puede deshacer.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        });

        if (isConfirmed) {
          result = await batchDeleteAddresses(selectedAddresses);
        }
      } else if (action === 'activate') {
        result = await batchUpdateAddresses(selectedAddresses, { isActive: true });
      } else if (action === 'deactivate') {
        result = await batchUpdateAddresses(selectedAddresses, { isActive: false });
      }

      if (result) {
        await Swal.fire({
          title: '¡Completado!',
          text: 'Operación realizada exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF'
        });
      }
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo completar la operación',
        icon: 'error',
        confirmButtonColor: '#1F64BF'
      });
    }
  };

  const handleExport = async () => {
    try {
      const { value: format } = await Swal.fire({
        title: 'Exportar direcciones',
        text: 'Selecciona el formato de exportación',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'CSV',
        cancelButtonText: 'Excel',
        showDenyButton: true,
        denyButtonText: 'Cancelar',
        confirmButtonColor: '#1F64BF',
        cancelButtonColor: '#10B981',
        denyButtonColor: '#6b7280'
      });

      if (format !== undefined) {
        const exportFormat = format ? 'csv' : 'excel';
        await exportAddresses(exportFormat);
      }
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo exportar las direcciones',
        icon: 'error',
        confirmButtonColor: '#1F64BF'
      });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedStatus('all');
    setSelectedUser('');
    setSortOption('createdAt_desc');
    clearFilters();
  };

  // ==================== RENDER ====================
  if (loading && !hasAddresses) {
    return (
      <AddressPageContainer>
        <AddressContentWrapper>
          <AddressLoadingContainer>
            <CircularProgress 
              size={48} 
              sx={{ 
                color: '#1F64BF',
                filter: 'drop-shadow(0 4px 8px rgba(31, 100, 191, 0.3))'
              }} 
            />
            <Typography component="div" variant="body1" sx={{ color: '#010326', fontWeight: 600, fontFamily: "'Mona Sans'" }}>
              Cargando sistema de direcciones...
            </Typography>
          </AddressLoadingContainer>
        </AddressContentWrapper>
      </AddressPageContainer>
    );
  }

  return (
    <AddressPageContainer>
      <AddressContentWrapper>
        {/* Header Principal */}
        <AddressHeaderSection>
          <AddressHeaderContent>
            <AddressHeaderInfo>
              <AddressMainTitle>
                Gestión de Direcciones
              </AddressMainTitle>
              <AddressMainDescription>
                Administra las direcciones de entrega de todos los usuarios
              </AddressMainDescription>
            </AddressHeaderInfo>
            
            <AddressHeaderActions>
              <AddressPrimaryActionButton
                onClick={handleCreateAddress}
                disabled={loading}
                startIcon={<Plus size={18} weight="bold" />}
              >
                Nueva Dirección
              </AddressPrimaryActionButton>
              
              <AddressSecondaryActionButton
                onClick={fetchAddresses}
                disabled={loading}
                title="Refrescar direcciones"
              >
                <ArrowClockwise size={20} weight="bold" />
              </AddressSecondaryActionButton>

              <AddressSecondaryActionButton
                onClick={handleExport}
                disabled={loading || !hasAddresses}
                title="Exportar direcciones"
              >
                <Export size={20} weight="bold" />
              </AddressSecondaryActionButton>
            </AddressHeaderActions>
          </AddressHeaderContent>
        </AddressHeaderSection>

        {/* Mensajes de Error */}
        {error && (
          <AddressModernCard sx={{ 
            p: 3, 
            mb: 4,
            background: alpha('#dc2626', 0.05),
            border: `1px solid ${alpha('#dc2626', 0.2)}`,
            position: 'relative',
            zIndex: 1,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#dc2626', fontWeight: 500, fontFamily: "'Mona Sans'" }}>
                ⚠️ {error}
              </Typography>
              <Button 
                size="small" 
                onClick={fetchAddresses}
                sx={{ 
                  color: '#dc2626',
                  fontWeight: 600,
                  textTransform: 'none',
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
                    background: 'linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent)',
                    transition: 'left 0.5s ease'
                  },
                  '&:hover': {
                    '&::before': { left: '100%' }
                  }
                }}
              >
                Reintentar
              </Button>
            </Box>
          </AddressModernCard>
        )}

        {/* Estadísticas con hover disminuido */}
        <AddressStatsContainer>
          <AddressStatsGrid>
            {stats.map((stat) => (
              <AddressStatCard key={stat.id} variant={stat.variant}>
                <AddressStatHeader>
                  <Box>
                    <AddressStatValue variant={stat.variant}>
                      {stat.value}
                    </AddressStatValue>
                    <AddressStatLabel variant={stat.variant}>
                      {stat.title}
                    </AddressStatLabel>
                  </Box>
                  <AddressStatIconContainer variant={stat.variant}>
                    <stat.icon size={24} weight="duotone" />
                  </AddressStatIconContainer>
                </AddressStatHeader>
                <AddressStatChange variant={stat.variant} trend={stat.trend}>
                  <TrendUp size={12} weight="bold" />
                  <AddressStatTrendText variant={stat.variant} trend={stat.trend}>
                    {stat.change}
                  </AddressStatTrendText>
                </AddressStatChange>
              </AddressStatCard>
            ))}
          </AddressStatsGrid>
        </AddressStatsContainer>

        {/* Controles de búsqueda y filtros - Selects originales */}
        <AddressControlsSection>
          <AddressControlsContent>
            <AddressSearchSection>
              <AddressModernTextField
                fullWidth
                placeholder="Buscar por dirección, usuario, teléfono..."
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
            </AddressSearchSection>

            <AddressFiltersSection>
              <AddressFilterChip active={selectedStatus !== 'all'}>
                <Funnel size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <AddressStyledSelect
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="active">Activas</MenuItem>
                    <MenuItem value="inactive">Inactivas</MenuItem>
                  </AddressStyledSelect>
                </FormControl>
              </AddressFilterChip>

              <AddressFilterChip active={selectedDepartment !== ''}>
                <Compass size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <AddressStyledSelect
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">Departamentos</MenuItem>
                    {departmentOptions.map(department => (
                      <MenuItem key={department} value={department}>
                        {department}
                      </MenuItem>
                    ))}
                  </AddressStyledSelect>
                </FormControl>
              </AddressFilterChip>

              <AddressFilterChip active={selectedUser !== ''}>
                <Users size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <AddressStyledSelect
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    displayEmpty
                    disabled={loadingUsers}
                  >
                    <MenuItem value="">
                      {loadingUsers ? 'Cargando...' : 'Usuarios'}
                    </MenuItem>
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </AddressStyledSelect>
                </FormControl>
              </AddressFilterChip>

              <AddressFilterChip active={sortOption !== 'createdAt_desc'}>
                <ChartLine size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <AddressStyledSelect
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <MenuItem value="createdAt_desc">Más recientes</MenuItem>
                    <MenuItem value="createdAt_asc">Más antiguas</MenuItem>
                    <MenuItem value="department_asc">Departamento A-Z</MenuItem>
                    <MenuItem value="department_desc">Departamento Z-A</MenuItem>
                    <MenuItem value="user_asc">Usuario A-Z</MenuItem>
                  </AddressStyledSelect>
                </FormControl>
              </AddressFilterChip>

              {(searchQuery || selectedDepartment || selectedUser || selectedStatus !== 'all' || sortOption !== 'createdAt_desc') && (
                <AddressClearButton
                  onClick={handleClearFilters}
                  startIcon={<Broom size={16} weight="bold" />}
                >
                  Limpiar
                </AddressClearButton>
              )}
            </AddressFiltersSection>
          </AddressControlsContent>
        </AddressControlsSection>

        {/* Contenido Principal */}
        <AddressContentSection>
          <AddressSectionHeader>
            <AddressSectionTitle>
              <GridIcon size={24} weight="duotone" />
              Direcciones
              <Chip 
                label={`${addresses.length}${pagination.totalItems !== addresses.length ? ` de ${pagination.totalItems}` : ''}`}
                size="small"
                sx={{
                  background: alpha('#1F64BF', 0.1),
                  color: '#032CA6',
                  fontWeight: 600,
                  ml: 1,
                  fontFamily: "'Mona Sans'"
                }}
              />
            </AddressSectionTitle>

            <AddressViewToggleContainer>
              <AddressViewToggleButton
                active={viewMode === 'table'}
                onClick={() => setViewMode('table')}
                startIcon={<GridIcon size={16} weight="bold" />}
              >
                <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Tabla</Box>
              </AddressViewToggleButton>
              
              <AddressViewToggleButton
                active={viewMode === 'map'}
                onClick={() => setViewMode('map')}
                startIcon={<MapIcon size={16} weight="bold" />}
              >
                <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Mapa</Box>
              </AddressViewToggleButton>
            </AddressViewToggleContainer>
          </AddressSectionHeader>

          {/* Vista de Contenido */}
          {addresses.length > 0 ? (
            <>
              {viewMode === 'table' ? (
                <AddressTable
                  addresses={addresses}
                  loading={loading}
                  selectedAddresses={selectedAddresses}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                  onHardDelete={handleHardDeleteAddress}
                  onSetDefault={handleSetDefaultAddress}
                  onUnsetDefault={handleUnsetDefaultAddress}
                  onActivate={handleActivateAddress}
                  onDeactivate={handleDeactivateAddress}
                  onBatchAction={handleBatchAction}
                  pagination={pagination}
                  onPageChange={(page) => updateFilters({ page })}
                />
              ) : (
                <AddressMap
                  addresses={addresses}
                  loading={loading}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                  selectedDepartment={selectedDepartment}
                  onDepartmentSelect={setSelectedDepartment}
                />
              )}
            </>
          ) : (
            <AddressEmptyState>
              <AddressEmptyStateIcon>
                <MapPin size={40} weight="duotone" />
              </AddressEmptyStateIcon>
              <AddressEmptyStateTitle>
                {searchQuery || selectedDepartment || selectedUser || selectedStatus !== 'all'
                  ? 'No se encontraron direcciones' 
                  : 'No hay direcciones registradas'
                }
              </AddressEmptyStateTitle>
              <AddressEmptyStateDescription>
                {searchQuery || selectedDepartment || selectedUser || selectedStatus !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda o crear una nueva dirección'
                  : 'Comienza creando la primera dirección de entrega para un usuario'
                }
              </AddressEmptyStateDescription>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
              }}>
                <AddressPrimaryActionButton
                  onClick={handleCreateAddress}
                  startIcon={<Plus size={18} weight="bold" />}
                  sx={{
                    minWidth: { xs: '100%', sm: '140px' }
                  }}
                >
                  Crear Dirección
                </AddressPrimaryActionButton>
              </Box>
            </AddressEmptyState>
          )}
        </AddressContentSection>
      </AddressContentWrapper>

      {/* Modal de creación/edición */}
      {showCreateModal && (
        <AddressFormModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onSave={handleAddressCreated}
          editMode={!!editingAddress}
          addressToEdit={editingAddress}
          users={users}
          loadingUsers={loadingUsers}
        />
      )}
    </AddressPageContainer>
  );
};

export default AddressManagement;