// src/pages/Users/Users.jsx - CON EFECTO HOVER MÁRMOL EN STATS CARDS
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
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Users as UsersIcon,
  Plus,
  MagnifyingGlass,
  ArrowsClockwise,
  User,
  Shield,
  Crown,
  UserPlus,
  Download,
  SortAscending,
  SortDescending,
  Funnel,
  Broom,
  TrendUp,
  Warning,
  CheckCircle,
  Clock,
  GridNine
} from '@phosphor-icons/react';

import UserCard from '../../components/UserCard/UserCard';
import CreateUserModal from '../../components/CreateUserModal/CreateUserModal';
import UserFilters from '../../components/UserFilters/UserFilters';

// Importar hooks personalizados
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

// ================ ESTILOS MODERNOS RESPONSIVE - USERS ================
const UsersPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const UsersContentWrapper = styled(Box)(({ theme }) => ({
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

const UsersModernCard = styled(Paper)(({ theme }) => ({
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

const UsersHeaderSection = styled(UsersModernCard)(({ theme }) => ({
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

const UsersHeaderContent = styled(Box)(({ theme }) => ({
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

const UsersHeaderInfo = styled(Box)(({ theme }) => ({
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

const UsersMainTitle = styled(Typography)(({ theme }) => ({
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

const UsersMainDescription = styled(Typography)(({ theme }) => ({
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

const UsersHeaderActions = styled(Box)(({ theme }) => ({
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

const UsersPrimaryActionButton = styled(Button)(({ theme }) => ({
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

const UsersSecondaryActionButton = styled(Button)(({ theme }) => ({
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

const UsersUnifiedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
}));

const UsersStatsContainer = styled(UsersUnifiedContainer)(({ theme }) => ({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
}));

const UsersStatsGrid = styled(Box)(({ theme }) => ({
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

// ================ NUEVA STAT CARD CON EFECTO MÁRMOL MUY MARCADO Y ADAPTADO AL COLOR ================
const UsersStatCard = styled(UsersModernCard)(({ theme, variant }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
      color: 'white',
      border: 'none',
      // Efecto mármol AZUL sobre fondo azul
      marbleBase: 'rgba(25, 83, 158, 0.2)',
      marbleVeins: 'rgba(3, 44, 166, 0.35)',
      marbleHighlight: 'rgba(123, 164, 221, 0.4)',
      marbleDark: 'rgba(1, 21, 63, 0.15)',
    },
    success: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      // Efecto mármol VERDE sobre fondo verde
      marbleBase: 'rgba(13, 75, 54, 0.2)',
      marbleVeins: 'rgba(9, 138, 97, 0.35)',
      marbleHighlight: 'rgba(86, 236, 181, 0.4)',
      marbleDark: 'rgba(2, 77, 55, 0.15)',
    },
    warning: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: 'white',
      border: 'none',
      // Efecto mármol NARANJA/AMARILLO sobre fondo naranja
      marbleBase: 'rgba(245, 158, 11, 0.2)',
      marbleVeins: 'rgba(217, 119, 6, 0.35)',
      marbleHighlight: 'rgba(251, 191, 36, 0.4)',
      marbleDark: 'rgba(180, 83, 9, 0.15)',
    },
    secondary: {
      background: 'white',
      color: '#010326',
      // Para blanco: efecto mármol AZULADO como ProductCard
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
    
    // EFECTO MÁRMOL ANIMADO MUY VISIBLE - DETRÁS DEL CONTENIDO
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
      zIndex: 0, // DETRÁS del contenido
      // Mármol adaptado al color de la card
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

    // Efecto de destello horizontal - ENCIMA del mármol pero DETRÁS del contenido
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
      zIndex: 1, // DETRÁS del contenido
      pointerEvents: 'none',
    },

    '&:hover': {
      transform: 'translateY(-1px) scale(1.02)',
      boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
      // ACTIVAR MÁRMOL CON OPACIDAD ALTA
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

    // TODO EL CONTENIDO ENCIMA (z-index: 2)
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

const UsersStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
  width: '100%',
});

const UsersStatIconContainer = styled(Box)(({ variant, theme }) => ({
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

const UsersStatValue = styled(Typography)(({ variant, theme }) => ({
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

const UsersStatLabel = styled(Typography)(({ variant, theme }) => ({
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

const UsersStatChange = styled(Box)(({ variant, trend }) => ({
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

const UsersStatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
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

const UsersControlsSection = styled(UsersModernCard)(({ theme }) => ({
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

const UsersControlsContent = styled(Box)(({ theme }) => ({
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

const UsersSearchSection = styled(Box)(({ theme }) => ({
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

const UsersModernTextField = styled(TextField)(({ theme }) => ({
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

const UsersFiltersSection = styled(Box)(({ theme }) => ({
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

const UsersFilterControl = styled(FormControl)(({ theme }) => ({
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

const UsersSortControl = styled(Box)(({ theme }) => ({
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

const UsersSection = styled(UsersUnifiedContainer)({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
});

const UsersSectionHeader = styled(Box)(({ theme }) => ({
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

const UsersSectionTitle = styled(Typography)(({ theme }) => ({
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

const UsersGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: '28px',
  width: '100%',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  [theme.breakpoints.down('xl')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '18px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  [theme.breakpoints.down(480)]: {
    gridTemplateColumns: '1fr',
    gap: '14px',
  }
}));

const UsersEmptyState = styled(UsersModernCard)(({ theme }) => ({
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

const UsersEmptyStateIcon = styled(Box)(({ theme }) => ({
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

const UsersEmptyStateTitle = styled(Typography)(({ theme }) => ({
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

const UsersEmptyStateDescription = styled(Typography)(({ theme }) => ({
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

const UsersLoadingContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: '24px',
});

const UsersLoadingOverlay = styled(UsersModernCard)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '14px',
  padding: '24px',
  marginBottom: '24px',
  background: alpha('#1F64BF', 0.04),
});

const ErrorAlert = styled(UsersModernCard)(({ theme }) => ({
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
const Users = () => {
  const theme = useTheme();
  
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    getUserStats,
    refetch
  } = useUsers();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery));

      const matchesRole = !selectedRole || user.role === selectedRole;
      const matchesStatus = !selectedStatus || 
        (selectedStatus === 'active' && user.active) ||
        (selectedStatus === 'inactive' && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortOption];
      let bValue = b[sortOption];
      
      if (sortOption === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchQuery, selectedRole, selectedStatus, sortOption, sortOrder]);

  const stats = useMemo(() => {
    const userStats = getUserStats();
    
    return [
      {
        id: 'total-users',
        title: "Total de Usuarios",
        value: userStats.total,
        change: "+12% este mes",
        trend: "up",
        icon: UsersIcon,
        variant: "primary",
        onClick: () => handleFilterByRole('')
      },
      {
        id: 'active-users',
        title: "Usuarios Activos",
        value: userStats.active,
        change: `${((userStats.active / userStats.total) * 100).toFixed(1)}% activos`,
        trend: "up",
        icon: CheckCircle,
        variant: "success",
        onClick: () => handleFilterByStatus('active')
      },
      {
        id: 'admin-users',
        title: "Administradores",
        value: userStats.admins,
        change: userStats.admins > 0 ? 'Acceso completo' : 'Sin admins',
        trend: userStats.admins > 0 ? "up" : "warning",
        icon: Shield,
        variant: userStats.admins > 0 ? "warning" : "secondary",
        onClick: () => handleFilterByRole('admin')
      },
      {
        id: 'premium-users',
        title: "Usuarios Premium",
        value: userStats.premium,
        change: `${userStats.premium} con beneficios`,
        trend: "up",
        icon: Crown,
        variant: "secondary",
        onClick: () => handleFilterByRole('premium')
      }
    ];
  }, [getUserStats]);

  const handleFilterByRole = (role) => {
    setSelectedRole(role);
  };

  const handleFilterByStatus = (status) => {
    setSelectedStatus(status);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleSortChange = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRole('');
    setSelectedStatus('');
    setSortOption('createdAt');
    setSortOrder('desc');
  };

  const handleCreateUser = async (userData) => {
    try {
      setActionLoading(true);
      await createUser(userData);
      setShowCreateModal(false);

      await Swal.fire({
        title: '¡Usuario creado exitosamente!',
        text: `${userData.name} ha sido añadido al sistema`,
        icon: 'success',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster'
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      await Swal.fire({
        title: 'Error al crear usuario',
        text: error.message || 'Ocurrió un error inesperado',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (userId, userData) => {
    try {
      setActionLoading(true);
      await updateUser(userId, userData);

      await Swal.fire({
        title: 'Usuario actualizado',
        text: 'Los cambios se han guardado exitosamente',
        icon: 'success',
        confirmButtonColor: '#1F64BF',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error updating user:', error);
      await Swal.fire({
        title: 'Error al actualizar',
        text: error.message || 'No se pudo actualizar el usuario',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const userName = user?.name || 'este usuario';
      
      const { isConfirmed } = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: `¿Estás seguro de que quieres eliminar a "${userName}"? Esta acción no se puede deshacer`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        width: 500
      });

      if (isConfirmed) {
        setActionLoading(true);
        await deleteUser(userId);
        
        await Swal.fire({
          title: 'Usuario eliminado',
          text: 'El usuario ha sido eliminado exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF',
          timer: 2000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      await Swal.fire({
        title: 'Error al eliminar',
        text: error.message || 'No se pudo eliminar el usuario',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      setActionLoading(true);
      const isActive = newStatus === 'active';
      await updateUserStatus(userId, isActive);

      const statusText = isActive ? 'activado' : 'desactivado';
      await Swal.fire({
        title: 'Estado actualizado',
        text: `El usuario ha sido ${statusText}`,
        icon: 'success',
        confirmButtonColor: '#1F64BF',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error updating status:', error);
      await Swal.fire({
        title: 'Error al cambiar estado',
        text: error.message || 'No se pudo actualizar el estado',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExportUsers = async () => {
    try {
      const { value: format } = await Swal.fire({
        title: 'Exportar usuarios',
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
        const exportData = filteredUsers.map(user => ({
          Nombre: user.name,
          Email: user.email,
          Teléfono: user.phone || 'N/A',
          Rol: user.role,
          Estado: user.active ? 'Activo' : 'Inactivo',
          'Fecha de Creación': new Date(user.createdAt).toLocaleDateString('es-ES'),
          'Último Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca'
        }));

        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => 
            headers.map(header => `"${row[header]}"`).join(',')
          )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await Swal.fire({
          title: 'Exportación completada',
          text: 'El archivo se ha descargado exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF',
          timer: 2000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      await Swal.fire({
        title: 'Error en exportación',
        text: 'No se pudo exportar la lista de usuarios',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  if (loading && users.length === 0) {
    return (
      <UsersPageContainer>
        <UsersContentWrapper>
          <UsersLoadingContainer>
            <CircularProgress 
              size={48} 
              sx={{ 
                color: '#1F64BF',
                filter: 'drop-shadow(0 4px 8px rgba(31, 100, 191, 0.3))'
              }} 
            />
            <Typography component="div" variant="body1" sx={{ color: '#010326', fontWeight: 600, fontFamily: "'Mona Sans'" }}>
              Cargando gestión de usuarios...
            </Typography>
          </UsersLoadingContainer>
        </UsersContentWrapper>
      </UsersPageContainer>
    );
  }

  return (
    <UsersPageContainer>
      <UsersContentWrapper>
        <UsersHeaderSection sx={{ fontWeight: '700 !important' }} className="force-bold" style={{ fontWeight: '700 !important' }}>
          <UsersHeaderContent>
            <UsersHeaderInfo>
              <UsersMainTitle sx={{ fontWeight: '700 !important' }} className="force-bold" style={{ fontWeight: '700 !important' }}>
                <UsersIcon size={32} weight="duotone" />
                Gestión de Usuarios
              </UsersMainTitle>
              <UsersMainDescription sx={{ fontWeight: '700 !important' }} className="force-bold" style={{ fontWeight: '700 !important' }}>
                Administra usuarios, roles y permisos del sistema de manera eficiente
              </UsersMainDescription>
            </UsersHeaderInfo>
            
            <UsersHeaderActions>
              <UsersSecondaryActionButton
                variant="outlined"
                onClick={handleRefresh}
                disabled={loading || actionLoading}
                startIcon={loading ? <CircularProgress size={16} /> : <ArrowsClockwise size={18} weight="bold" />}
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </UsersSecondaryActionButton>
              
              <UsersSecondaryActionButton
                variant="outlined"
                onClick={handleExportUsers}
                disabled={filteredUsers.length === 0 || loading}
                startIcon={<Download size={18} weight="bold" />}
              >
                Exportar
              </UsersSecondaryActionButton>
              
              <UsersPrimaryActionButton
                onClick={() => setShowCreateModal(true)}
                disabled={loading || actionLoading}
                startIcon={<UserPlus size={18} weight="bold" />}
              >
                Nuevo Usuario
              </UsersPrimaryActionButton>
            </UsersHeaderActions>
          </UsersHeaderContent>
        </UsersHeaderSection>

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

        <UsersStatsContainer>
          <UsersStatsGrid>
            {stats.map((stat) => (
              <UsersStatCard 
                key={stat.id} 
                variant={stat.variant}
                onClick={stat.onClick}
              >
                <UsersStatHeader>
                  <Box>
                    <UsersStatValue variant={stat.variant}>
                      {stat.value}
                    </UsersStatValue>
                    <UsersStatLabel variant={stat.variant}>
                      {stat.title}
                    </UsersStatLabel>
                  </Box>
                  <UsersStatIconContainer variant={stat.variant}>
                    <stat.icon size={24} weight="duotone" />
                  </UsersStatIconContainer>
                </UsersStatHeader>
                <UsersStatChange variant={stat.variant} trend={stat.trend}>
                  <TrendUp size={12} weight="bold" />
                  <UsersStatTrendText variant={stat.variant} trend={stat.trend}>
                    {stat.change}
                  </UsersStatTrendText>
                </UsersStatChange>
              </UsersStatCard>
            ))}
          </UsersStatsGrid>
        </UsersStatsContainer>

        <UsersControlsSection>
          <UsersControlsContent>
            <UsersSearchSection>
              <UsersModernTextField
                placeholder="Buscar usuarios por nombre, email o teléfono..."
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
              
              <UsersSortControl onClick={handleSortChange}>
                <Typography variant="body2" sx={{ color: '#032CA6', fontWeight: 500, fontFamily: "'Mona Sans'" }}>
                  Fecha
                </Typography>
                {sortOrder === 'desc' ? (
                  <SortDescending size={16} weight="bold" color="#032CA6" />
                ) : (
                  <SortAscending size={16} weight="bold" color="#032CA6" />
                )}
              </UsersSortControl>
            </UsersSearchSection>

            <UsersFiltersSection>
              <UsersFilterControl size="small">
                <Select
                  value={selectedRole}
                  onChange={handleRoleChange}
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
                  <MenuItem value="">Todos los roles</MenuItem>
                  <MenuItem value="admin">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={14} />
                      Administradores
                    </Box>
                  </MenuItem>
                  <MenuItem value="premium">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Crown size={14} />
                      Premium
                    </Box>
                  </MenuItem>
                  <MenuItem value="customer">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} />
                      Clientes
                    </Box>
                  </MenuItem>
                </Select>
              </UsersFilterControl>

              <UsersFilterControl size="small">
                <Select
                  value={selectedStatus}
                  onChange={handleStatusFilterChange}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <CheckCircle size={16} weight="bold" color="#032CA6" />
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
                  <MenuItem value="active">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} />
                      Activos
                    </Box>
                  </MenuItem>
                  <MenuItem value="inactive">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} />
                      Inactivos
                    </Box>
                  </MenuItem>
                </Select>
              </UsersFilterControl>

              {(searchQuery || selectedRole || selectedStatus) && (
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
            </UsersFiltersSection>
          </UsersControlsContent>
        </UsersControlsSection>

        <UsersSection>
          <UsersSectionHeader>
            <UsersSectionTitle component="div">
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <GridNine size={24} weight="duotone" />
                <Box component="span">Usuarios</Box>
                
                <Chip 
                  label={filteredUsers.length}
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
            </UsersSectionTitle>

            {filteredUsers.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Typography variant="body2" sx={{ color: '#032CA6', opacity: 0.8, fontFamily: "'Mona Sans'" }}>
                  {loading ? 'Actualizando...' : `${filteredUsers.length} resultado${filteredUsers.length !== 1 ? 's' : ''}`}
                </Typography>
              </Box>
            )}
          </UsersSectionHeader>

          {loading && users.length > 0 && (
            <UsersLoadingOverlay>
              <CircularProgress size={20} sx={{ color: '#1F64BF' }} />
              <Typography variant="body2" sx={{ color: '#1F64BF', fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                Actualizando usuarios...
              </Typography>
            </UsersLoadingOverlay>
          )}

          {filteredUsers.length > 0 ? (
            <UsersGrid>
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onStatusChange={handleUserStatusChange}
                  loading={actionLoading}
                />
              ))}
            </UsersGrid>
          ) : (
            <UsersEmptyState>
              <UsersEmptyStateIcon>
                <UsersIcon size={40} weight="duotone" />
              </UsersEmptyStateIcon>
              
              <UsersEmptyStateTitle>
                {searchQuery || selectedRole || selectedStatus
                  ? 'No hay usuarios que coincidan con los filtros' 
                  : 'No hay usuarios registrados aún'
                }
              </UsersEmptyStateTitle>
              
              <UsersEmptyStateDescription>
                {searchQuery || selectedRole || selectedStatus
                  ? 'Intenta ajustar los filtros de búsqueda o crear un nuevo usuario'
                  : 'Comienza creando tu primer usuario en el sistema. Define roles y permisos según las necesidades de tu organización.'
                }
              </UsersEmptyStateDescription>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                maxWidth: '400px'
              }}>
                <UsersPrimaryActionButton
                  onClick={() => setShowCreateModal(true)}
                  disabled={loading || actionLoading}
                  startIcon={<UserPlus size={18} weight="bold" />}
                  sx={{
                    minWidth: { xs: '100%', sm: '140px' }
                  }}
                >
                  Crear Usuario
                </UsersPrimaryActionButton>
                
                {(searchQuery || selectedRole || selectedStatus) && (
                  <UsersSecondaryActionButton
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<Broom size={18} weight="bold" />}
                    sx={{
                      minWidth: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    Limpiar Filtros
                  </UsersSecondaryActionButton>
                )}
              </Box>

              {users.length === 0 && !loading && (
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
                      • Define roles y permisos según tu organización
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#032CA6', mb: 1, fontFamily: "'Mona Sans'" }}>
                      • Crea administradores con acceso completo
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#032CA6', mb: 1, fontFamily: "'Mona Sans'" }}>
                      • Añade usuarios premium con beneficios especiales
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#032CA6', fontFamily: "'Mona Sans'" }}>
                      • Gestiona estados activo/inactivo según necesidad
                    </Typography>
                  </Box>
                </Box>
              )}
            </UsersEmptyState>
          )}
        </UsersSection>

        {loading && users.length > 0 && (
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
              Actualizando usuarios...
            </Typography>
          </Box>
        )}
      </UsersContentWrapper>

      {showCreateModal && (
        <CreateUserModal
          open={showCreateModal}
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </UsersPageContainer>
  );
};

export default Users;