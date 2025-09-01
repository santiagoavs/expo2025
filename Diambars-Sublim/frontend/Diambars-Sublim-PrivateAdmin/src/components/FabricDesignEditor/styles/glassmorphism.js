// Estilos glassmorphism consistentes para el editor
import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

// Colores del tema - Paleta del usuario
export const THEME_COLORS = {
  primary: '#1F64BF',
  primaryDark: '#032CA6',
  accent: '#040DBF',
  background: 'rgba(242, 242, 242, 0.95)',
  backgroundDark: 'rgba(1, 3, 38, 0.08)',
  border: 'rgba(31, 100, 191, 0.3)',
  borderLight: 'rgba(31, 100, 191, 0.2)',
  text: '#010326',
  textSecondary: '#666',
  white: '#F2F2F2',
  surface: 'rgba(242, 242, 242, 0.9)',
  surfaceHover: 'rgba(242, 242, 242, 0.95)'
};

// Base glassmorphism card - Glassmorphism puro
export const GlassCard = styled(Paper)(({ theme, width = '240px', height = 'auto' }) => ({
  width,
  height,
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1)
  `,
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)'
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '1px',
    height: '100%',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8), transparent, rgba(255, 255, 255, 0.3))'
  }
}));

// Panel lateral glassmorphism
export const GlassPanel = styled(GlassCard)(({ theme }) => ({
  width: '280px',
  height: '100%',
  margin: theme.spacing(2),
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column'
}));

// Botón glassmorphism
export const GlassButton = styled('button')(({ theme, variant = 'default' }) => ({
  background: variant === 'primary' 
    ? `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`
    : 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${variant === 'primary' ? 'transparent' : 'rgba(255, 255, 255, 0.3)'}`,
  borderRadius: '12px',
  padding: '12px 20px',
  color: variant === 'primary' ? THEME_COLORS.white : THEME_COLORS.text,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'primary' 
      ? `0 12px 40px rgba(31, 100, 191, 0.4)`
      : `0 8px 32px rgba(0, 0, 0, 0.15)`,
    background: variant === 'primary' 
      ? `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`
      : 'rgba(255, 255, 255, 0.25)'
  },
  
  '&:active': {
    transform: 'translateY(0)',
    transition: 'all 0.1s'
  },
  
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none'
  }
}));

// Navbar flotante (isla dinámica)
export const FloatingIsland = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  borderRadius: '50px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5)
  `,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateX(-50%) translateY(-2px)',
    boxShadow: `
      0 12px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6)
    `
  }
}));

// Input glassmorphism
export const GlassInput = styled('input')(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  padding: '12px 16px',
  color: THEME_COLORS.text,
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&::placeholder': {
    color: 'rgba(1, 3, 38, 0.6)'
  },
  
  '&:focus': {
    border: `1px solid ${THEME_COLORS.primary}`,
    background: 'rgba(255, 255, 255, 0.15)',
    boxShadow: `0 0 0 3px rgba(31, 100, 191, 0.1)`
  }
}));

// Lista glassmorphism
export const GlassList = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  overflow: 'hidden'
}));

// Item de lista glassmorphism
export const GlassListItem = styled(Box)(({ theme, selected = false }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  background: selected ? 'rgba(31, 100, 191, 0.1)' : 'transparent',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  
  '&:hover': {
    background: selected ? 'rgba(31, 100, 191, 0.15)' : 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(4px)'
  },
  
  '&:last-child': {
    borderBottom: 'none'
  }
}));

