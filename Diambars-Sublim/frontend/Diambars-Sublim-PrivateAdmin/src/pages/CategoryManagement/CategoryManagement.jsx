import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import useCategories from '../../hooks/useCategories';
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
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  FolderOpen,
  Plus,
  MagnifyingGlass,
  Funnel,
  ArrowsClockwise,
  GridNine,
  TreeStructure,
  List,
  Eye,
  EyeSlash,
  Star,
  Pencil,
  Trash,
  X,
  Image,
  CaretDown,
  CaretRight,
  Folder,
  Broom,
  ChartBar
} from '@phosphor-icons/react';

// ================ KEYFRAMES PARA ANIMACIÓN DE MÁRMOL ================ 
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

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = marbleFlowKeyframes;
  document.head.appendChild(styleSheet);
}

// ================ STYLED COMPONENTS ================ 
const CategoryPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const CategoryContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1600px',
  margin: '0 auto',
  paddingTop: '120px',
  paddingBottom: '40px',
  paddingLeft: '32px',
  paddingRight: '32px',
  minHeight: 'calc(100vh - 120px)',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('xl')]: { maxWidth: '1400px', paddingLeft: '28px', paddingRight: '28px' },
  [theme.breakpoints.down('lg')]: { maxWidth: '1200px', paddingLeft: '24px', paddingRight: '24px' },
  [theme.breakpoints.down('md')]: { paddingTop: '110px', paddingLeft: '20px', paddingRight: '20px' },
  [theme.breakpoints.down('sm')]: { paddingTop: '100px', paddingLeft: '16px', paddingRight: '16px' }
}));

const CategoryModernCard = styled(Paper)(({ theme }) => ({
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

const CategoryHeaderSection = styled(CategoryModernCard)(({ theme }) => ({
  padding: '40px',
  marginBottom: '32px',
  background: 'white',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.down('lg')]: { padding: '32px' },
  [theme.breakpoints.down('md')]: { padding: '24px', marginBottom: '24px' },
  [theme.breakpoints.down('sm')]: { padding: '20px', marginBottom: '20px' }
}));

const CategoryHeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '32px',
  width: '100%',
  [theme.breakpoints.down('lg')]: { gap: '24px' },
  [theme.breakpoints.down('md')]: { flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' },
  [theme.breakpoints.down('sm')]: { gap: '16px' }
}));

const CategoryHeaderInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: { alignItems: 'center', textAlign: 'center' }
}));

const CategoryMainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: '700',
  color: '#010326',
  marginBottom: '12px',
  letterSpacing: '-0.025em',
  lineHeight: 1.2,
  textAlign: 'left',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: { fontSize: '2.2rem' },
  [theme.breakpoints.down('md')]: { fontSize: '1.8rem', textAlign: 'center' },
  [theme.breakpoints.down('sm')]: { fontSize: '1.6rem' }
}));

const CategoryMainDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: '#032CA6',
  fontWeight: '500',
  lineHeight: 1.6,
  opacity: 0.9,
  textAlign: 'left',
  maxWidth: '600px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: { fontSize: '1rem' },
  [theme.breakpoints.down('md')]: { fontSize: '0.95rem', textAlign: 'center', maxWidth: '100%' },
  [theme.breakpoints.down('sm')]: { fontSize: '0.9rem' }
}));

const CategoryHeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: { gap: '12px' },
  [theme.breakpoints.down('md')]: { justifyContent: 'center', gap: '12px', width: '100%' },
  [theme.breakpoints.down('sm')]: { flexDirection: 'row', width: '100%', gap: '10px', '& > *': { flex: 1 } }
}));

const CategoryPrimaryActionButton = styled(Button)(({ theme }) => ({
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
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.5s ease',
    zIndex: 0
  },
  '& > *': { position: 'relative', zIndex: 1 },
  '&:hover': {
    background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
    boxShadow: '0 6px 24px rgba(31, 100, 191, 0.32)',
    transform: 'translateY(-1px)',
    '&::before': { left: '100%' }
  },
  '&:active': { transform: 'translateY(0)' },
  [theme.breakpoints.down('lg')]: { minWidth: '140px', padding: '12px 24px', fontSize: '0.875rem' },
  [theme.breakpoints.down('md')]: { minWidth: 'auto', flex: 1 },
  [theme.breakpoints.down('sm')]: { minWidth: 'auto', padding: '12px 20px', fontSize: '0.85rem' }
}));

const CategorySecondaryActionButton = styled(IconButton)(({ theme }) => ({
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
    background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.2), transparent)',
    transition: 'left 0.5s ease',
    zIndex: 0
  },
  '& > *': { position: 'relative', zIndex: 1 },
  '&:hover': {
    background: alpha('#1F64BF', 0.12),
    transform: 'translateY(-1px)',
    '&::before': { left: '100%' }
  },
  [theme.breakpoints.down('lg')]: { width: '48px', height: '48px' },
  [theme.breakpoints.down('md')]: { width: '48px', height: '48px' },
  [theme.breakpoints.down('sm')]: { width: '48px', height: '48px' }
}));

const CategoryStatsContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1
}));

const CategoryStatsGrid = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gap: '24px',
  gridTemplateColumns: 'repeat(5, 1fr)',
  [theme.breakpoints.down(1400)]: { gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' },
  [theme.breakpoints.down('lg')]: { gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' },
  [theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' },
  [theme.breakpoints.down(480)]: { gridTemplateColumns: '1fr', gap: '12px' }
}));

const CategoryStatCard = styled(CategoryModernCard)(({ variant }) => {
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
    padding: '24px',
    width: '100%',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
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
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(1, 3, 38, 0.12)',
      '&::before': { opacity: 1 },
      '&::after': { left: '100%' }
    },

    '& > *': { position: 'relative', zIndex: 2 },
  };
});

const CategoryStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '12px',
  width: '100%'
});

const CategoryStatIconContainer = styled(Box)(({ variant }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: variant === 'primary' ? 'rgba(255, 255, 255, 0.2)' : alpha('#1F64BF', 0.1),
  color: variant === 'primary' ? 'white' : '#1F64BF',
  flexShrink: 0
}));

const CategoryStatValue = styled(Typography)(({ variant }) => ({
  fontSize: '1.8rem',
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: '4px',
  color: variant === 'primary' ? 'white' : '#010326',
  fontFamily: "'Mona Sans'"
}));

const CategoryStatLabel = styled(Typography)(({ variant }) => ({
  fontSize: '0.85rem',
  fontWeight: 500,
  opacity: variant === 'primary' ? 0.9 : 0.7,
  color: variant === 'primary' ? 'white' : '#032CA6',
  lineHeight: 1.3,
  fontFamily: "'Mona Sans'"
}));

const CategoryControlsSection = styled(CategoryModernCard)(({ theme }) => ({
  padding: '28px',
  marginBottom: '32px',
  background: 'white',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.down('lg')]: { padding: '24px' },
  [theme.breakpoints.down('md')]: { padding: '20px', marginBottom: '24px' },
  [theme.breakpoints.down('sm')]: { padding: '18px', marginBottom: '20px' }
}));

const CategoryControlsContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '20px',
  width: '100%',
  [theme.breakpoints.down('lg')]: { gap: '16px' },
  [theme.breakpoints.down('md')]: { flexDirection: 'column', alignItems: 'stretch', gap: '16px' },
  [theme.breakpoints.down('sm')]: { gap: '14px' }
}));

const CategorySearchSection = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  [theme.breakpoints.down('md')]: { flex: 'none', width: '100%' }
}));

const CategoryModernTextField = styled(TextField)({
  width: '100%',
  fontFamily: "'Mona Sans'",
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F2F2F2',
    transition: 'all 0.3s ease',
    '& fieldset': { border: 'none' },
    '&:hover': { backgroundColor: 'white', boxShadow: '0 2px 8px rgba(1, 3, 38, 0.08)' },
    '&.Mui-focused': { backgroundColor: 'white', boxShadow: '0 4px 16px rgba(31, 100, 191, 0.12)' },
    '& input': { color: '#010326', fontSize: '0.9rem', fontWeight: 500, '&::placeholder': { color: '#64748b', opacity: 1 } }
  }
});

const CategoryFiltersSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: { gap: '10px' },
  [theme.breakpoints.down('md')]: { justifyContent: 'flex-start', gap: '10px', width: '100%' },
  [theme.breakpoints.down('sm')]: { justifyContent: 'center', gap: '8px' }
}));

const CategoryFilterChip = styled(Box)(({ active }) => ({
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
  '&:hover': { background: active ? alpha('#1F64BF', 0.15) : 'white', transform: 'translateY(-1px)' }
}));

const CategoryViewToggle = styled(Box)({
  display: 'flex',
  background: '#F2F2F2',
  borderRadius: '10px',
  padding: '4px',
  gap: '4px'
});

const ViewToggleButton = styled(IconButton)(({ active }) => ({
  padding: '8px',
  borderRadius: '8px',
  background: active ? 'white' : 'transparent',
  color: active ? '#1F64BF' : '#032CA6',
  boxShadow: active ? '0 2px 8px rgba(31, 100, 191, 0.15)' : 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: active ? 'white' : alpha('#1F64BF', 0.1)
  }
}));

const CategoryContentSection = styled(Box)({
  width: '100%',
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1
});

const CategorySectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  width: '100%',
  [theme.breakpoints.down('sm')]: { flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }
}));

const CategorySectionTitle = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#010326',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: "'Mona Sans'"
});

// Grid View Components
const CategoryGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: '24px',
  width: '100%',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  [theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr', gap: '16px' }
}));

const CategoryCard = styled(CategoryModernCard)({
  padding: '0',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)'
  }
});

const CategoryCardImage = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '160px',
  overflow: 'hidden',
  background: '#F2F2F2'
});

const CategoryCardContent = styled(Box)({
  padding: '20px'
});

const CategoryCardHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '12px'
});

const CategoryCardTitle = styled(Typography)({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#010326',
  lineHeight: 1.3,
  fontFamily: "'Mona Sans'"
});

const CategoryCardDescription = styled(Typography)({
  fontSize: '0.875rem',
  color: '#64748b',
  lineHeight: 1.5,
  marginBottom: '16px',
  fontFamily: "'Mona Sans'"
});

const CategoryCardMeta = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.8rem',
  color: '#032CA6'
});

const CategoryCardActions = styled(Box)({
  display: 'flex',
  gap: '8px',
  marginTop: '16px'
});

const CategoryActionButton = styled(IconButton)(({ variant }) => ({
  padding: '6px',
  borderRadius: '8px',
  background: variant === 'edit' ? alpha('#1F64BF', 0.1) : alpha('#EF4444', 0.1),
  color: variant === 'edit' ? '#1F64BF' : '#EF4444',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: variant === 'edit' ? '#1F64BF' : '#EF4444',
    color: 'white',
    transform: 'scale(1.05)'
  }
}));

// Tree View Components
const TreeView = styled(Box)({
  background: 'white',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`
});

const TreeNode = styled(Box)(({ depth }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.04)}`,
  background: depth > 0 ? alpha('#1F64BF', 0.02) : 'white',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: alpha('#1F64BF', 0.05)
  },
  '&:last-child': {
    borderBottom: 'none'
  }
}));

const TreeToggle = styled(IconButton)({
  width: '32px',
  height: '32px',
  marginRight: '8px',
  color: '#1F64BF'
});

const TreeContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  gap: '12px'
});

const TreeIcon = styled(Box)({
  color: '#1F64BF',
  display: 'flex',
  alignItems: 'center'
});

const TreeInfo = styled(Box)({
  flex: 1
});

const TreeName = styled(Typography)({
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#010326',
  fontFamily: "'Mona Sans'"
});

const TreeDescription = styled(Typography)({
  fontSize: '0.8rem',
  color: '#64748b',
  marginTop: '2px',
  fontFamily: "'Mona Sans'"
});

const TreeMeta = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
});

const TreeStatus = styled(Chip)(({ status }) => ({
  fontSize: '0.7rem',
  fontWeight: 600,
  background: status === 'active' ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
  color: status === 'active' ? '#10B981' : '#EF4444'
}));

const TreeActions = styled(Box)({
  display: 'flex',
  gap: '4px'
});

// Modal Components
const ModalOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1400,
  padding: '20px'
});

const ModalContent = styled(CategoryModernCard)({
  width: '100%',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflow: 'auto'
});

const ModalHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`
});

const ModalTitle = styled(Typography)({
  fontSize: '1.4rem',
  fontWeight: 600,
  color: '#010326',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: "'Mona Sans'"
});

const ModalBody = styled(Box)({
  padding: '24px'
});

const FormRow = styled(Box)({
  display: 'flex',
  gap: '16px',
  marginBottom: '20px',
  '&:last-child': {
    marginBottom: 0
  }
});

const FormGroup = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
});

const FormLabel = styled(Typography)({
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#010326',
  fontFamily: "'Mona Sans'"
});

const FormInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& input, & textarea': {
      fontSize: '0.9rem',
      fontFamily: "'Mona Sans'"
    }
  }
});

const FormSelect = styled(Select)({
  borderRadius: '8px',
  '& .MuiSelect-select': {
    fontSize: '0.9rem',
    fontFamily: "'Mona Sans'"
  }
});

const FileUploadArea = styled(Box)({
  border: `2px dashed ${alpha('#1F64BF', 0.3)}`,
  borderRadius: '8px',
  padding: '32px',
  textAlign: 'center',
  background: alpha('#1F64BF', 0.02),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#1F64BF',
    background: alpha('#1F64BF', 0.05)
  }
});

const ModalActions = styled(Box)({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  padding: '20px 24px',
  borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`
});

const CategoryManagement = () => {
  const theme = useTheme();
  
  const {
    categories,
    categoryTree,
    flatCategories,
    loading,
    error,
    retryCount,
    hasError,
    canRetry,
    removeCategory,
    createCategory,
    updateCategory,
    retryFetch,
    clearError,
    validateCategoryData
  } = useCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    image: null,
    isActive: true,
    showOnHomepage: false,
    order: 0
  });
  const [filterActive, setFilterActive] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [expandedCategories, setExpandedCategories] = useState({});
  const fileInputRef = useRef(null);

  // Datos fallback para demostración
  const fallbackCategories = [
    {
      _id: 'cat1',
      name: 'Textiles',
      description: 'Productos textiles personalizados para sublimación',
      isActive: true,
      showOnHomepage: true,
      order: 1,
      createdAt: '2024-01-15',
      image: null,
      children: [
        {
          _id: 'cat1a',
          name: 'Camisetas',
          description: 'Camisetas sublimadas de alta calidad',
          isActive: true,
          parent: { _id: 'cat1' },
          order: 1,
          image: null
        },
        {
          _id: 'cat1b',
          name: 'Polos',
          description: 'Polos personalizados para empresas',
          isActive: true,
          parent: { _id: 'cat1' },
          order: 2,
          image: null
        }
      ]
    },
    {
      _id: 'cat2',
      name: 'Accesorios',
      description: 'Accesorios personalizados para complementar tu look',
      isActive: true,
      showOnHomepage: false,
      order: 2,
      createdAt: '2024-01-16',
      image: null,
      children: [
        {
          _id: 'cat2a',
          name: 'Gorras',
          description: 'Gorras con diseños únicos',
          isActive: true,
          parent: { _id: 'cat2' },
          order: 1,
          image: null
        }
      ]
    }
  ];

  // Usar datos fallback si no hay datos del hook
  const displayCategories = flatCategories.length > 0 ? flatCategories : fallbackCategories.flatMap(cat => [cat, ...cat.children]);
  const displayCategoryTree = categoryTree.length > 0 ? categoryTree : fallbackCategories;

  // Stats calculations
  const stats = [
    { 
      id: 'total', 
      title: 'Total de Categorías', 
      value: displayCategories.length, 
      change: '+5% este mes', 
      trend: 'up', 
      icon: FolderOpen, 
      variant: 'primary' 
    },
    { 
      id: 'active', 
      title: 'Categorías Activas', 
      value: displayCategories.filter(cat => cat.isActive).length, 
      change: `${Math.round((displayCategories.filter(cat => cat.isActive).length / displayCategories.length) * 100)}% del total`, 
      trend: 'up', 
      icon: Eye, 
      variant: 'success' 
    },
    { 
      id: 'main', 
      title: 'Categorías Principales', 
      value: displayCategories.filter(cat => !cat.parent).length, 
      change: 'Categorías raíz', 
      trend: 'up', 
      icon: Folder, 
      variant: 'secondary' 
    },
    { 
      id: 'sub', 
      title: 'Subcategorías', 
      value: displayCategories.filter(cat => cat.parent).length, 
      change: 'Categorías hijas', 
      trend: 'up', 
      icon: TreeStructure, 
      variant: 'secondary' 
    },
    { 
      id: 'featured', 
      title: 'En Página Principal', 
      value: displayCategories.filter(cat => cat.showOnHomepage).length, 
      change: 'Destacadas', 
      trend: 'up', 
      icon: Star, 
      variant: 'warning' 
    }
  ];

  // Filtrar y buscar categorías
  const filteredCategories = displayCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (category.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && category.isActive) ||
                         (filterActive === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Ordenar categorías
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'order':
        return (a.order || 0) - (b.order || 0);
      case 'created':
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      default:
        return 0;
    }
  });

  const handleOpenModal = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        parent: category.parent?._id || '',
        image: null,
        isActive: category.isActive,
        showOnHomepage: category.showOnHomepage || false,
        order: category.order || 0
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        parent: '',
        image: null,
        isActive: true,
        showOnHomepage: false,
        order: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      parent: '',
      image: null,
      isActive: true,
      showOnHomepage: false,
      order: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateCategoryData(formData);
    if (validationErrors.length > 0) {
      await Swal.fire({
        title: 'Datos inválidos',
        text: validationErrors.join(', '),
        icon: 'warning',
        confirmButtonText: 'Corregir',
        confirmButtonColor: '#F59E0B',
        background: '#ffffff',
        color: '#010326'
      });
      return;
    }
    
    const submitData = new FormData();
    submitData.append('name', formData.name.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('parent', formData.parent || null);
    submitData.append('isActive', formData.isActive);
    submitData.append('showOnHomepage', formData.showOnHomepage);
    submitData.append('order', formData.order);
    
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory._id, submitData);
      } else {
        await createCategory(submitData);
      }
      
      handleCloseModal();
      
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      
      await Swal.fire({
        title: 'Error al guardar',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#EF4444',
        background: '#ffffff',
        color: '#010326'
      });
    }
  };

  const handleDelete = async (categoryId) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer. La categoría y sus subcategorías serán eliminadas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#010326',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await removeCategory(categoryId);
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        
        await Swal.fire({
          title: 'No se pudo eliminar',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#EF4444',
          background: '#ffffff',
          color: '#010326'
        });
      }
    }
  };

  const getParentName = (parentId) => {
    if (!parentId) return 'Categoría Principal';
    const parent = displayCategories.find(cat => cat._id === parentId);
    return parent ? parent.name : 'Desconocido';
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderGridView = () => {
    return (
      <CategoryGrid>
        {sortedCategories.map((category) => (
          <CategoryCard key={category._id}>
            <CategoryCardImage>
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #F2F2F2 0%, #E5E7EB 100%)',
                  color: '#1F64BF'
                }}>
                  <FolderOpen size={48} weight="duotone" />
                </Box>
              )}
              
              <Box sx={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px', 
                display: 'flex', 
                gap: '6px' 
              }}>
                {category.showOnHomepage && (
                  <Chip 
                    icon={<Star size={12} weight="fill" />}
                    label="Destacada"
                    size="small"
                    sx={{ 
                      background: 'rgba(245, 158, 11, 0.9)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}
                  />
                )}
                <Chip 
                  icon={category.isActive ? <Eye size={12} weight="fill" /> : <EyeSlash size={12} weight="fill" />}
                  label={category.isActive ? 'Activa' : 'Inactiva'}
                  size="small"
                  sx={{ 
                    background: category.isActive ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                />
              </Box>
            </CategoryCardImage>

            <CategoryCardContent>
              <CategoryCardHeader>
                <CategoryCardTitle>{category.name}</CategoryCardTitle>
                <Chip 
                  label={`Orden: ${category.order || 0}`}
                  size="small"
                  sx={{ 
                    background: alpha('#1F64BF', 0.1),
                    color: '#1F64BF',
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />
              </CategoryCardHeader>
              
              {category.description && (
                <CategoryCardDescription>{category.description}</CategoryCardDescription>
              )}

              <CategoryCardMeta>
                <Typography variant="body2" sx={{ color: '#032CA6', fontWeight: 500 }}>
                  {getParentName(category.parent?._id)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {new Date(category.createdAt || Date.now()).toLocaleDateString()}
                </Typography>
              </CategoryCardMeta>

              <CategoryCardActions>
                <CategoryActionButton 
                  variant="edit"
                  onClick={() => handleOpenModal(category)}
                  title="Editar categoría"
                >
                  <Pencil size={16} />
                </CategoryActionButton>
                <CategoryActionButton 
                  variant="delete"
                  onClick={() => handleDelete(category._id)}
                  title="Eliminar categoría"
                >
                  <Trash size={16} />
                </CategoryActionButton>
              </CategoryCardActions>
            </CategoryCardContent>
          </CategoryCard>
        ))}
      </CategoryGrid>
    );
  };

  const renderTreeView = () => {
    const renderCategory = (category, depth = 0) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories[category._id];

      return (
        <Box key={category._id}>
          <TreeNode depth={depth}>
            <TreeToggle 
              onClick={() => hasChildren && toggleExpand(category._id)}
              disabled={!hasChildren}
            >
              {hasChildren ? (
                isExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />
              ) : (
                <Box sx={{ width: '16px', height: '16px' }} />
              )}
            </TreeToggle>

            <TreeContent>
              <TreeIcon>
                {depth === 0 ? <FolderOpen size={20} weight="duotone" /> : <Folder size={20} weight="duotone" />}
              </TreeIcon>
              
              <TreeInfo>
                <TreeName>
                  {category.name}
                  <Chip 
                    label={depth === 0 ? 'Principal' : 'Subcategoría'}
                    size="small"
                    sx={{ 
                      marginLeft: '8px',
                      background: alpha('#1F64BF', 0.1),
                      color: '#1F64BF',
                      fontSize: '0.6rem',
                      height: '18px'
                    }}
                  />
                </TreeName>
                {category.description && (
                  <TreeDescription>{category.description}</TreeDescription>
                )}
              </TreeInfo>

              <TreeMeta>
                <TreeStatus 
                  icon={category.isActive ? <Eye size={12} /> : <EyeSlash size={12} />}
                  label={category.isActive ? 'Activa' : 'Inactiva'}
                  status={category.isActive ? 'active' : 'inactive'}
                  size="small"
                />
                {category.showOnHomepage && (
                  <Chip 
                    icon={<Star size={12} weight="fill" />}
                    label="Homepage"
                    size="small"
                    sx={{ 
                      background: alpha('#F59E0B', 0.1),
                      color: '#F59E0B',
                      fontSize: '0.6rem'
                    }}
                  />
                )}
              </TreeMeta>

              <TreeActions>
                <IconButton 
                  size="small"
                  onClick={() => handleOpenModal(category)}
                  sx={{ color: '#1F64BF' }}
                >
                  <Pencil size={16} />
                </IconButton>
                <IconButton 
                  size="small"
                  onClick={() => handleDelete(category._id)}
                  sx={{ color: '#EF4444' }}
                >
                  <Trash size={16} />
                </IconButton>
              </TreeActions>
            </TreeContent>
          </TreeNode>

          {hasChildren && isExpanded && (
            <Box>
              {category.children.map(child => renderCategory(child, depth + 1))}
            </Box>
          )}
        </Box>
      );
    };

    return (
      <TreeView>
        {displayCategoryTree.map(category => renderCategory(category))}
      </TreeView>
    );
  };

  const renderListView = () => {
    return (
      <CategoryModernCard>
        <Box sx={{ padding: '20px', borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}` }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
            gap: '16px',
            fontWeight: 600,
            color: '#010326',
            fontSize: '0.9rem'
          }}>
            <div>Imagen</div>
            <div>Nombre</div>
            <div>Categoría Padre</div>
            <div>Estado</div>
            <div>Homepage</div>
            <div>Acciones</div>
          </Box>
        </Box>

        <Box>
          {sortedCategories.map((category) => (
            <Box 
              key={category._id}
              sx={{ 
                padding: '20px',
                borderBottom: `1px solid ${alpha('#1F64BF', 0.04)}`,
                '&:hover': {
                  background: alpha('#1F64BF', 0.02)
                },
                '&:last-child': {
                  borderBottom: 'none'
                }
              }}
            >
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
                gap: '16px',
                alignItems: 'center'
              }}>
                <Box>
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <Box sx={{ 
                      width: '40px', 
                      height: '40px', 
                      background: alpha('#1F64BF', 0.1),
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1F64BF'
                    }}>
                      <FolderOpen size={20} />
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#010326', fontSize: '0.9rem' }}>
                    {category.name}
                  </Typography>
                  {category.description && (
                    <Typography sx={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                      {category.description}
                    </Typography>
                  )}
                </Box>

                <Typography sx={{ color: '#032CA6', fontSize: '0.9rem' }}>
                  {getParentName(category.parent?._id)}
                </Typography>

                <Chip 
                  icon={category.isActive ? <Eye size={14} /> : <EyeSlash size={14} />}
                  label={category.isActive ? 'Activa' : 'Inactiva'}
                  size="small"
                  sx={{ 
                    background: category.isActive ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
                    color: category.isActive ? '#10B981' : '#EF4444',
                    fontSize: '0.8rem'
                  }}
                />

                <Chip 
                  icon={<Star size={14} weight={category.showOnHomepage ? 'fill' : 'regular'} />}
                  label={category.showOnHomepage ? 'Sí' : 'No'}
                  size="small"
                  sx={{ 
                    background: category.showOnHomepage ? alpha('#F59E0B', 0.1) : alpha('#6B7280', 0.1),
                    color: category.showOnHomepage ? '#F59E0B' : '#6B7280',
                    fontSize: '0.8rem'
                  }}
                />

                <Box sx={{ display: 'flex', gap: '8px' }}>
                  <IconButton 
                    size="small"
                    onClick={() => handleOpenModal(category)}
                    sx={{ color: '#1F64BF' }}
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => handleDelete(category._id)}
                    sx={{ color: '#EF4444' }}
                  >
                    <Trash size={16} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CategoryModernCard>
    );
  };

  if (loading && !displayCategories.length) {
    return (
      <CategoryPageContainer>
        <CategoryContentWrapper>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px' }}>
            <CircularProgress size={48} sx={{ color: '#1F64BF' }} />
            <Typography sx={{ color: '#010326', fontWeight: 600, fontFamily: "'Mona Sans'" }}>
              Cargando categorías...
            </Typography>
          </Box>
        </CategoryContentWrapper>
      </CategoryPageContainer>
    );
  }

  if (hasError) {
    return (
      <CategoryPageContainer>
        <CategoryContentWrapper>
          <CategoryModernCard sx={{ padding: '40px', textAlign: 'center' }}>
            <Box sx={{ color: '#EF4444', marginBottom: '20px' }}>
              <X size={48} weight="bold" />
            </Box>
            <Typography variant="h5" sx={{ color: '#010326', marginBottom: '12px', fontWeight: 600 }}>
              Error al cargar categorías
            </Typography>
            <Typography sx={{ color: '#64748b', marginBottom: '24px' }}>
              {error}
            </Typography>
            <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {canRetry && (
                <Button 
                  variant="contained"
                  onClick={retryFetch}
                  startIcon={<ArrowsClockwise size={16} />}
                  sx={{
                    background: '#1F64BF',
                    '&:hover': { background: '#032CA6' }
                  }}
                >
                  Reintentar ({3 - retryCount} intentos)
                </Button>
              )}
              <Button 
                variant="outlined"
                onClick={clearError}
                startIcon={<X size={16} />}
              >
                Limpiar error
              </Button>
            </Box>
          </CategoryModernCard>
        </CategoryContentWrapper>
      </CategoryPageContainer>
    );
  }

  return (
    <CategoryPageContainer>
      <CategoryContentWrapper>
        {/* Header */}
        <CategoryHeaderSection>
          <CategoryHeaderContent>
            <CategoryHeaderInfo>
              <CategoryMainTitle>Gestión de Categorías</CategoryMainTitle>
              <CategoryMainDescription>
                Organiza y administra la estructura completa de tu catálogo
              </CategoryMainDescription>
            </CategoryHeaderInfo>
            <CategoryHeaderActions>
              <CategoryPrimaryActionButton 
                onClick={() => handleOpenModal()}
                startIcon={<Plus size={18} weight="bold" />}
              >
                Nueva Categoría
              </CategoryPrimaryActionButton>
              <CategorySecondaryActionButton 
                onClick={retryFetch}
                title="Actualizar categorías"
              >
                <ArrowsClockwise size={20} weight="bold" />
              </CategorySecondaryActionButton>
            </CategoryHeaderActions>
          </CategoryHeaderContent>
        </CategoryHeaderSection>

        {/* Stats */}
        <CategoryStatsContainer>
          <CategoryStatsGrid>
            {stats.map((stat) => (
              <CategoryStatCard key={stat.id} variant={stat.variant}>
                <CategoryStatHeader>
                  <Box>
                    <CategoryStatValue variant={stat.variant}>{stat.value}</CategoryStatValue>
                    <CategoryStatLabel variant={stat.variant}>{stat.title}</CategoryStatLabel>
                  </Box>
                  <CategoryStatIconContainer variant={stat.variant}>
                    <stat.icon size={24} weight="duotone" />
                  </CategoryStatIconContainer>
                </CategoryStatHeader>
              </CategoryStatCard>
            ))}
          </CategoryStatsGrid>
        </CategoryStatsContainer>

        {/* Controls */}
        <CategoryControlsSection>
          <CategoryControlsContent>
            <CategorySearchSection>
              <CategoryModernTextField
                fullWidth
                placeholder="Buscar categorías por nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlass size={18} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  )
                }}
              />
            </CategorySearchSection>

            <CategoryFiltersSection>
              <CategoryFilterChip 
                active={filterActive !== 'all'}
                onClick={() => setFilterActive(filterActive === 'all' ? 'active' : 'all')}
              >
                <Funnel size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    displayEmpty
                    sx={{ 
                      border: 'none',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { 
                        padding: 0,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#010326'
                      }
                    }}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="active">Activas</MenuItem>
                    <MenuItem value="inactive">Inactivas</MenuItem>
                  </Select>
                </FormControl>
              </CategoryFilterChip>

              <CategoryFilterChip active={sortBy !== 'name'}>
                <ChartBar size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ 
                      border: 'none',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { 
                        padding: 0,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#010326'
                      }
                    }}
                  >
                    <MenuItem value="name">Por nombre</MenuItem>
                    <MenuItem value="order">Por orden</MenuItem>
                    <MenuItem value="created">Por fecha</MenuItem>
                  </Select>
                </FormControl>
              </CategoryFilterChip>

              <CategoryViewToggle>
                <ViewToggleButton 
                  active={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  title="Vista en cuadrícula"
                >
                  <GridNine size={18} />
                </ViewToggleButton>
                <ViewToggleButton 
                  active={viewMode === 'tree'}
                  onClick={() => setViewMode('tree')}
                  title="Vista de árbol"
                >
                  <TreeStructure size={18} />
                </ViewToggleButton>
                <ViewToggleButton 
                  active={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  title="Vista de lista"
                >
                  <List size={18} />
                </ViewToggleButton>
              </CategoryViewToggle>

              {(searchQuery || filterActive !== 'all' || sortBy !== 'name') && (
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterActive('all');
                    setSortBy('name');
                  }}
                  startIcon={<Broom size={16} />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#032CA6',
                    backgroundColor: alpha('#032CA6', 0.1),
                    padding: '8px 12px',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: alpha('#032CA6', 0.15)
                    }
                  }}
                >
                  Limpiar
                </Button>
              )}
            </CategoryFiltersSection>
          </CategoryControlsContent>
        </CategoryControlsSection>

        {/* Content */}
        <CategoryContentSection>
          <CategorySectionHeader>
            <CategorySectionTitle>
              <FolderOpen size={24} weight="duotone" />
              <span>Categorías</span>
              <Chip 
                label={`${sortedCategories.length}${sortedCategories.length !== displayCategories.length ? ` de ${displayCategories.length}` : ''}`}
                size="small"
                sx={{ 
                  background: alpha('#1F64BF', 0.1),
                  color: '#032CA6',
                  fontWeight: 600,
                  marginLeft: '8px'
                }}
              />
            </CategorySectionTitle>
          </CategorySectionHeader>

          {sortedCategories.length === 0 ? (
            <CategoryModernCard sx={{ padding: '60px 40px', textAlign: 'center' }}>
              <Box sx={{ 
                width: '80px', 
                height: '80px', 
                background: alpha('#1F64BF', 0.1),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: '#1F64BF'
              }}>
                <FolderOpen size={32} weight="duotone" />
              </Box>
              <Typography variant="h5" sx={{ color: '#010326', marginBottom: '12px', fontWeight: 600 }}>
                No se encontraron categorías
              </Typography>
              <Typography sx={{ color: '#64748b', marginBottom: '32px', maxWidth: '400px', margin: '0 auto' }}>
                {searchQuery || filterActive !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'Comienza creando tu primera categoría para organizar tu catálogo'
                }
              </Typography>
              <CategoryPrimaryActionButton 
                onClick={() => handleOpenModal()}
                startIcon={<Plus size={18} weight="bold" />}
              >
                Crear Primera Categoría
              </CategoryPrimaryActionButton>
            </CategoryModernCard>
          ) : (
            <>
              {viewMode === 'grid' && renderGridView()}
              {viewMode === 'tree' && renderTreeView()}
              {viewMode === 'list' && renderListView()}
            </>
          )}
        </CategoryContentSection>

        {/* Modal */}
        {showModal && (
          <ModalOverlay onClick={handleCloseModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  {selectedCategory ? <Pencil size={24} /> : <Plus size={24} />}
                  {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </ModalTitle>
                <IconButton onClick={handleCloseModal}>
                  <X size={20} />
                </IconButton>
              </ModalHeader>

              <ModalBody>
                <form onSubmit={handleSubmit}>
                  <FormRow>
                    <FormGroup>
                      <FormLabel>Nombre de la categoría *</FormLabel>
                      <FormInput
                        fullWidth
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Ej: Camisetas, Accesorios, etc."
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <FormLabel>Descripción</FormLabel>
                      <FormInput
                        fullWidth
                        multiline
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe brevemente esta categoría..."
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <FormLabel>Categoría padre</FormLabel>
                      <FormSelect
                        fullWidth
                        name="parent"
                        value={formData.parent}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">Sin padre (Categoría Principal)</MenuItem>
                        {displayCategories
                          .filter(cat => cat._id !== selectedCategory?._id && !cat.parent)
                          .map(cat => (
                            <MenuItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </MenuItem>
                          ))}
                      </FormSelect>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Orden de visualización</FormLabel>
                      <FormInput
                        fullWidth
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="0"
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <FormLabel>
                        Imagen de la categoría {!selectedCategory && '*'}
                      </FormLabel>
                      <FileUploadArea onClick={() => fileInputRef.current?.click()}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                          required={!selectedCategory}
                        />
                        <Box sx={{ color: '#1F64BF', marginBottom: '12px' }}>
                          <Image size={32} weight="duotone" />
                        </Box>
                        <Typography sx={{ color: '#010326', fontWeight: 500, marginBottom: '4px' }}>
                          <span style={{ color: '#1F64BF' }}>Haz clic para subir</span> o arrastra y suelta
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                          PNG, JPG, GIF hasta 5MB
                        </Typography>
                      </FileUploadArea>
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            color="primary"
                          />
                        }
                        label="Categoría activa"
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            name="showOnHomepage"
                            checked={formData.showOnHomepage}
                            onChange={handleInputChange}
                            color="primary"
                          />
                        }
                        label="Mostrar en página principal"
                      />
                    </FormGroup>
                  </FormRow>
                </form>
              </ModalBody>

              <ModalActions>
                <Button
                  onClick={handleCloseModal}
                  sx={{
                    color: '#64748b',
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  startIcon={selectedCategory ? <Pencil size={16} /> : <Plus size={16} />}
                  sx={{
                    background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  {selectedCategory ? 'Actualizar' : 'Crear'} Categoría
                </Button>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </CategoryContentWrapper>
    </CategoryPageContainer>
  );
};

export default CategoryManagement;