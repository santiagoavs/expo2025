// NAVBAR.JSX - CÓDIGO MEJORADO CON RESPONSIVE ROBUSTO
// ============================================================

/* 
MEJORAS DE RESPONSIVE APLICADAS:

1. BREAKPOINTS MEJORADOS:
   - md (960px-1279px): Navbar más compacta, menús ocultos
   - sm (600px-959px): Navbar móvil horizontal
   - xs (0px-599px): Navbar móvil full width

2. COMPORTAMIENTOS POR DISPOSITIVO:
   - Desktop (lg+): Todos los elementos visibles
   - Tablets/Laptops (md): Menús ocultos, solo brand + controls
   - Tablets pequeñas (sm): Layout móvil compacto
   - Móviles (xs): Layout móvil full width

3. FLUJO RESPONSIVE CLARO:
   - lg+: Navegación completa
   - md: Solo brand + user avatar + menu icon
   - sm: Brand compacto + menu icon
   - xs: Brand mínimo + menu icon
*/

// ============================================================
// IMPORTS
// ============================================================

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  Popper,
  ClickAwayListener,
  Chip,
  Stack,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  List as ListIcon,
  X,
  Gear,
  ChartBar,
  Users,
  ShoppingCart,
  UserList,
  Folders,
  Star,
  SignOut,
  PaintBrush,
  CaretDown,
  CaretUp,
  CreditCard,
  FileText,
  MapPin,
  House,
} from "@phosphor-icons/react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../utils/permissions";

// ============================================================
// BREAKPOINTS Y KEYFRAMES
// ============================================================

const customBreakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

const slideInFromTop = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const dropdownFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const statusPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

// ============================================================
// STYLED COMPONENTS CON RESPONSIVE MEJORADO
// ============================================================

const GlassBase = styled(Box)({
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(31, 100, 191, 0.15)",
  boxShadow: "0 8px 25px rgba(31, 100, 191, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
  position: "relative",
  overflow: "visible",
  transition: "all 0.3s ease",
  pointerEvents: "auto",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.3), transparent)",
  },
});

// BOTÓN PRINCIPAL CON EFECTO SHIMMER - RESPONSIVE MEJORADO
const GlassButton = styled(Button)(({ theme, active, variant, hasActiveItems, open }) => {
  const isActive = active || hasActiveItems;
  const isHover = open;

  return {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0px 16px",
    minWidth: "auto",
    height: 48,
    minHeight: 48,
    borderRadius: 18,
    textTransform: "none",
    fontWeight: 600,
    fontSize: 14,
    transition: "all 0.3s ease",
    overflow: "hidden",
    whiteSpace: "nowrap",
    pointerEvents: "auto",
    
    // EFECTO SHIMMER
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
      transition: 'left 0.5s ease',
      zIndex: 1
    },
    '& > *': {
      position: 'relative',
      zIndex: 2
    },
    
    ...(isActive ? {
      color: "#FFFFFF",
      background: "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 3px 10px rgba(4, 13, 191, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    } : variant === "danger" ? {
      color: "#FFFFFF",
      background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 3px 10px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    } : isHover ? {
      color: "#040DBF",
      background: "rgba(31, 100, 191, 0.15)",
      border: "1px solid rgba(31, 100, 191, 0.25)",
      boxShadow: "0 3px 10px rgba(31, 100, 191, 0.1)",
    } : {
      color: "#64748b",
      background: "transparent",
      border: "none",
      boxShadow: "none",
    }),
    
    "&:hover": {
      transform: "translateY(-2px)",
      ...(isActive ? {
        background: "linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)",
        boxShadow: "0 4px 12px rgba(4, 13, 191, 0.2)",
      } : variant === "danger" ? {
        background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
      } : isHover ? {
        color: "#040DBF",
        background: "rgba(31, 100, 191, 0.15)",
        boxShadow: "0 2px 8px rgba(31, 100, 191, 0.1)",
      } : {
        color: "#040DBF",
        background: "rgba(31, 100, 191, 0.06)",
        boxShadow: "0 2px 6px rgba(31, 100, 191, 0.05)",
      }),
      '&::before': { left: '100%' }
    },
    
    // Desktop grande (1920px+)
    [theme.breakpoints.up('xl')]: {
      height: 48,
      fontSize: 14,
      gap: 8,
    },
    
    // Desktop (1280px - 1919px)
    [theme.breakpoints.between('lg', 'xl')]: {
      height: 44,
      fontSize: 13,
      gap: 6,
    },
    
    // Tablets y laptops pequeños (960px - 1279px) - OCULTOS
    [theme.breakpoints.between('md', 'lg')]: {
      display: "none",
    },
    
    // Tablets pequeñas (600px - 959px) - OCULTOS
    [theme.breakpoints.between('sm', 'md')]: {
      display: "none",
    },
    
    // Móviles (0px - 599px) - OCULTOS
    [theme.breakpoints.down('sm')]: {
      display: "none",
    },
  };
});

// ICONBUTTON CON EFECTO SHIMMER + RESPONSIVE MEJORADO
const GlassIconButton = styled(IconButton)(({ theme, variant }) => ({
  width: 48,
  height: 48,
  borderRadius: 18,
  background: variant === "danger" ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" : "transparent",
  border: variant === "danger" ? "1px solid rgba(255, 255, 255, 0.25)" : "none",
  color: variant === "danger" ? "#FFFFFF" : "#64748b",
  transition: "all 0.3s ease",
  boxShadow: variant === "danger" ? "0 6px 20px rgba(220, 38, 38, 0.25)" : "none",
  position: "relative",
  overflow: "hidden",
  flexShrink: 0,
  
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
    transition: "left 0.5s ease",
    opacity: 0,
    zIndex: 1,
  },
  
  "& > *": { 
    position: "relative", 
    zIndex: 2 
  },
  
  "&:hover": {
    background: variant === "danger" ? "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)" : "rgba(31, 100, 191, 0.08)",
    color: variant === "danger" ? "#FFFFFF" : "#040DBF",
    transform: "translateY(-2px)",
    boxShadow: variant === "danger" ? "0 4px 12px rgba(220, 38, 38, 0.2)" : "0 2px 8px rgba(31, 100, 191, 0.1)",
  },
  
  "&:hover::before": { 
    left: "100%", 
    opacity: 1 
  },
  
  // Tablets y laptops (960px - 1279px)
  [theme.breakpoints.between('md', 'lg')]: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  
  // Tablets pequeñas (600px - 959px)
  [theme.breakpoints.between('sm', 'md')]: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  
  // Móviles (0px - 599px)
  [theme.breakpoints.down('sm')]: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
}));

// APP BAR CON RESPONSIVE MEJORADO
const StyledAppBar = styled(AppBar)(({ theme, hidden }) => ({
  position: "fixed",
  top: 8,
  left: "50%",
  transform: `translateX(-50%) ${hidden ? 'translateY(-100%)' : 'translateY(0)'}`,
  width: "fit-content",
  maxWidth: "calc(100vw - 40px)",
  height: 72,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(226, 232, 240, 0.3)",
  borderRadius: 36,
  boxShadow: "0 2px 14px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  zIndex: 1300,
  opacity: hidden ? 0 : 1,
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    height: 68,
    borderRadius: 34,
  },
  
  // Tablets y laptops pequeños (960px - 1279px)
  [theme.breakpoints.between('md', 'lg')]: {
    height: 64,
    borderRadius: 32,
    maxWidth: "calc(100vw - 32px)",
    top: 8,
  },
  
  // Tablets pequeñas (600px - 959px)
  [theme.breakpoints.between('sm', 'md')]: {
    height: 60,
    borderRadius: 30,
    maxWidth: "calc(100vw - 24px)",
    top: 6,
  },
  
  // Móviles (0px - 599px) - Navbar normal de punta a punta
  [theme.breakpoints.down('sm')]: {
    top: 0,
    left: 0,
    transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
    width: "100%",
    maxWidth: "100%",
    height: 56,
    borderRadius: 0,
    border: "none",
    borderBottom: "1px solid rgba(226, 232, 240, 0.3)",
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  height: "100%",
  padding: "0 24px",
  justifyContent: "center",
  minHeight: "unset !important",
  display: "flex",
  alignItems: "center",
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    padding: "0 20px",
  },
  
  // Tablets y laptops (960px - 1279px)
  [theme.breakpoints.between('md', 'lg')]: {
    padding: "0 20px",
  },
  
  // Tablets pequeñas (600px - 959px)
  [theme.breakpoints.between('sm', 'md')]: {
    padding: "0 16px",
  },
  
  // Móviles (0px - 599px) - Justificar a los extremos
  [theme.breakpoints.down('sm')]: {
    padding: "0 16px",
    justifyContent: "space-between",
  },
}));

// MAIN CONTENT CON RESPONSIVE MEJORADO
const MainContent = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 32,
  maxWidth: "fit-content",
  width: "100%",
  
  // Desktop grande (1920px+)
  [theme.breakpoints.up('xl')]: {
    gap: 32,
  },
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    gap: 24,
  },
  
  // Tablets y laptops pequeños (960px - 1279px) - ESPACIO ENTRE BRAND Y CONTROLES
  [theme.breakpoints.between('md', 'lg')]: {
    gap: 16,
    justifyContent: "space-between",
  },
  
  // Tablets pequeñas (600px - 959px) - ESPACIO ENTRE BRAND Y CONTROLES
  [theme.breakpoints.between('sm', 'md')]: {
    gap: 12,
    justifyContent: "space-between",
  },
  
  // Móviles (0px - 599px) - ESPACIO ENTRE BRAND Y CONTROLES
  [theme.breakpoints.down('sm')]: {
    gap: 8,
    justifyContent: "space-between",
  },
}));

// BRAND CONTAINER CON RESPONSIVE MEJORADO
const BrandContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 16,
  cursor: "pointer",
  padding: "8px 12px",
  borderRadius: 18,
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  flexShrink: 0,
  
  // EFECTO SHIMMER
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.2), transparent)",
    transition: "left 0.5s ease",
    zIndex: 1,
  },
  "& > *": {
    position: "relative",
    zIndex: 2,
  },
  
  "&:hover": {
    transform: "translateY(-1px)",
    background: "rgba(31, 100, 191, 0.04)",
    boxShadow: "0 2px 12px rgba(31, 100, 191, 0.06)",
  },
  "&:hover::before": {
    left: "100%",
  },
  
  // Desktop grande (1920px+)
  [theme.breakpoints.up('xl')]: {
    gap: 16,
    padding: "8px 12px",
  },
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    gap: 14,
    padding: "6px 10px",
  },
  
  // Tablets y laptops (960px - 1279px)
  [theme.breakpoints.between('md', 'lg')]: {
    gap: 12,
    padding: "4px 8px",
  },
  
  // Tablets pequeñas (600px - 959px)
  [theme.breakpoints.between('sm', 'md')]: {
    gap: 10,
    padding: "4px 6px",
  },
  
  // Móviles (0px - 599px)
  [theme.breakpoints.down('sm')]: {
    gap: 8,
    padding: "2px 4px",
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 18,
  overflow: "hidden",
  flexShrink: 0,
  position: "relative",
  transition: "all 0.3s ease",
  
  // EFECTO SHIMMER
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
    transition: "left 0.5s ease",
    opacity: 0,
    zIndex: 1,
  },
  
  "&:hover::before": {
    left: "100%",
    opacity: 1,
  },
  
  "&:hover": {
    transform: "scale(1.02)",
  },
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    width: 44,
    height: 44,
    borderRadius: 16,
  },
  
  // Tablets y laptops (960px - 1279px)
  [theme.breakpoints.between('md', 'lg')]: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  
  // Tablets pequeñas (600px - 959px)
  [theme.breakpoints.between('sm', 'md')]: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  
  // Móviles (0px - 599px)
  [theme.breakpoints.down('sm')]: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
}));

const BrandText = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 2,
});

const BrandName = styled(Typography)(({ theme }) => ({
  fontSize: 24,
  fontWeight: 800,
  color: "#010326",
  letterSpacing: "-0.02em",
  lineHeight: 1,
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    fontSize: 22,
  },
  
  // Tablets y laptops (960px - 1279px)
  [theme.breakpoints.between('md', 'lg')]: {
    fontSize: 20,
  },
  
  // Tablets pequeñas (600px - 959px)
  [theme.breakpoints.between('sm', 'md')]: {
    fontSize: 18,
  },
  
  // Móviles (0px - 599px)
  [theme.breakpoints.down('sm')]: {
    fontSize: 16,
  },
}));

const BrandSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: "#64748b",
  fontWeight: 500,
  textTransform: "lowercase",
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    fontSize: 11,
  },
  
  // Tablets y laptops (960px - 1279px) - OCULTAR
  [theme.breakpoints.between('md', 'lg')]: {
    display: "none",
  },
  
  // Tablets pequeñas y móviles - Ocultar
  [theme.breakpoints.down('md')]: {
    display: "none",
  },
}));

// NAV CONTAINER - SOLO VISIBLE EN DESKTOP
const NavContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "6px",
  
  // Desktop grande (1920px+)
  [theme.breakpoints.up('xl')]: {
    gap: 4,
  },
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    gap: 3,
  },
  
  // Tablets y laptops pequeños (960px - 1279px) - OCULTAR
  [theme.breakpoints.between('md', 'lg')]: {
    display: "none",
  },
  
  // Tablets pequeñas y móviles - OCULTAR
  [theme.breakpoints.down('md')]: {
    display: "none",
  },
}));

// USER CONTAINER CON RESPONSIVE MEJORADO
const UserContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "6px 12px 6px 6px",
  borderRadius: 18,
  cursor: "pointer",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  
  // EFECTO SHIMMER
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.2), transparent)",
    transition: "left 0.5s ease",
    zIndex: 1,
  },
  "& > *": {
    position: "relative",
    zIndex: 2,
  },
  
  "&:hover": {
    transform: "translateY(-1px)",
    background: "rgba(31, 100, 191, 0.08)",
    boxShadow: "0 4px 20px rgba(31, 100, 191, 0.08)",
  },
  "&:hover::before": {
    left: "100%",
  },
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    gap: 10,
    padding: "4px 10px 4px 4px",
  },
  
  // Tablets y laptops pequeños (960px - 1279px) - MOSTRAR SOLO AVATAR
  [theme.breakpoints.between('md', 'lg')]: {
    display: "flex",
    gap: 0,
    padding: "4px",
    "& .user-info": { display: "none" },
  },
  
  // Tablets pequeñas y móviles - SOLO MOSTRAR AVATAR
  [theme.breakpoints.down('md')]: {
    display: "none", // Ocultar completamente en móviles
  },
}));

const RightControls = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 16,
  flexShrink: 0,
  
  // Desktop grande (1920px+)
  [theme.breakpoints.up('xl')]: {
    gap: 16,
  },
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    gap: 12,
  },
  
  // Tablets y laptops pequeños (960px - 1279px)
  [theme.breakpoints.between('md', 'lg')]: {
    gap: 10,
  },
  
  // Tablets pequeñas (600px - 959px)
  [theme.breakpoints.between('sm', 'md')]: {
    gap: 8,
  },
  
  // Móviles (0px - 599px)
  [theme.breakpoints.down('sm')]: {
    gap: 8,
  },
}));

// AVATAR CON RESPONSIVE MEJORADO
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  background: "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)",
  color: "#FFFFFF",
  fontWeight: 700,
  boxShadow: "0 3px 12px rgba(4, 13, 191, 0.3)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "visible",
  
  // Indicador de estado
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    background: "#10b981",
    border: "2px solid #FFFFFF",
    borderRadius: "50%",
    animation: `${statusPulse} 2s ease-in-out infinite`,
    zIndex: 3,
  },
  
  // EFECTO SHIMMER
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
    transition: "left 0.5s ease",
    borderRadius: "50%",
    zIndex: 1,
  },
  
  "&:hover": {
    transform: "translateY(-1px) scale(1.02)",
    boxShadow: "0 4px 16px rgba(4, 13, 191, 0.2)",
  },
  "&:hover::before": {
    left: "100%",
  },
  
  // Desktop (1280px - 1919px)
  [theme.breakpoints.between('lg', 'xl')]: {
    width: 38,
    height: 38,
    "&::after": { width: 11, height: 11 },
  },
  
  // Tablets y laptops (960px - 1279px)
  [theme.breakpoints.between('md', 'lg')]: {
    width: 36,
    height: 36,
    "&::after": { width: 10, height: 10 },
  },
  
  // Tablets pequeñas (600px - 959px)
  [theme.breakpoints.between('sm', 'md')]: {
    width: 34,
    height: 34,
    "&::after": { width: 9, height: 9 },
  },
  
  // Móviles (0px - 599px)
  [theme.breakpoints.down('sm')]: {
    width: 32,
    height: 32,
    "&::after": { width: 8, height: 8 },
  },
}));

const StyledPopper = styled(Popper)({
  zIndex: 1400,
  "& .MuiPaper-root": {
    animation: `${dropdownFadeIn} 0.2s ease-out`,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    borderRadius: 20,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
    padding: "12px",
    minWidth: 280,
    marginTop: "8px !important",
  },
});

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: 380,
    background: "#FFFFFF",
    border: "none",
    borderLeft: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "-4px 0 15px rgba(0, 0, 0, 0.1)",
    
    [theme.breakpoints.down('lg')]: {
      width: 360,
    },
    [theme.breakpoints.down('md')]: {
      width: 320,
    },
    [theme.breakpoints.down('sm')]: {
      width: "100%",
      maxWidth: "100vw",
    },
  },
}));

const LogoutConfirmationModal = styled(Box)({
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 320,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderRadius: 20,
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  padding: 24,
  zIndex: 1500,
});

// MENU ITEM CON HOVER DISMINUIDO + SHIMMER SIEMPRE VISIBLE
const MenuItemStyled = styled(ListItemButton)(({ active }) => ({
  borderRadius: 12,
  padding: "12px 16px",
  marginBottom: 4,
  background: active ? "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)" : "rgba(248, 250, 252, 0.8)",
  border: active ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(226, 232, 240, 0.6)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  
  // EFECTO SHIMMER
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: active 
      ? "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)"
      : "linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.15), transparent)",
    transition: "left 0.5s ease",
    zIndex: 1,
  },
  "& > *": {
    position: "relative",
    zIndex: 2,
  },
  
  "&:hover": {
    background: active ? "linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)" : "rgba(31, 100, 191, 0.08)",
    transform: "translateY(-2px) translateX(4px)",
    boxShadow: active ? "0 8px 28px rgba(4, 13, 191, 0.1)" : "0 4px 20px rgba(31, 100, 191, 0.08)",
  },
  "&:hover::before": {
    left: "100%",
  },
}));

// SIDEBAR BUTTON CON EFECTO SHIMMER
const SidebarButton = styled(Button)(({ theme, variant }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "14px 20px",
  minWidth: "auto",
  borderRadius: 12,
  textTransform: "none",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.3s ease",
  overflow: "hidden",
  whiteSpace: "nowrap",
  pointerEvents: "auto",
  
  ...(variant === "profile" ? {
    color: "#FFFFFF",
    background: "#040DBF",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 12px rgba(4, 13, 191, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
  } : variant === "danger" ? {
    color: "#FFFFFF",
    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
  } : {
    color: "#64748b",
    background: "rgba(248, 250, 252, 0.8)",
    border: "1px solid rgba(226, 232, 240, 0.6)",
    boxShadow: "none",
  }),

  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
    transition: "left 0.5s ease",
    opacity: 0,
    zIndex: 1,
  },
  
  "& > *": {
    position: "relative",
    zIndex: 2,
  },

  "&:hover": {
    ...(variant === "profile" ? {
      background: "#1F64BF",
      color: "#FFFFFF",
      boxShadow: "0 3px 10px rgba(4, 13, 191, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      transform: "translateY(-2px)",
    } : variant === "danger" ? {
      background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
      color: "#FFFFFF",
      boxShadow: "0 6px 20px rgba(220, 38, 38, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
      transform: "translateY(-2px)",
    } : {
      background: "rgba(31, 100, 191, 0.08)",
      borderColor: "rgba(31, 100, 191, 0.2)",
      color: "#040DBF",
      transform: "translateY(-2px)",
    }),
  },

  "&:hover::before": {
    left: "100%",
    opacity: 1,
  },

  [theme.breakpoints.down('md')]: {
    padding: "12px 18px",
    fontSize: 13,
    gap: 10,
  },
}));

// ============================================================
// NAVIGATION DATA
// ============================================================

const MAIN_NAVIGATION = [
  { to: "/Dashboard", label: "Inicio", icon: <House size={18} weight="duotone" />, description: "Panel principal" },
];

const DROPDOWN_MENUS = {
  personal: {
    label: "Personal",
    icon: <Users size={18} weight="duotone" />,
    permission: "canViewEmployees", // Requiere al menos ver empleados
    items: [
      { to: "/employees", label: "Empleados", icon: <UserList size={18} weight="duotone" />, description: "Gestión de personal", permission: "canViewEmployees" },
      { to: "/users", label: "Usuarios", icon: <Users size={18} weight="duotone" />, description: "Administración de usuarios", permission: "canViewUsers" },
    ]
  },
  gestion: {
    label: "Gestión",
    icon: <Folders size={18} weight="duotone" />,
    permission: "canViewProducts", // Requiere al menos ver productos
    items: [
      { to: "/catalog-management", label: "Productos", icon: <ChartBar size={18} weight="duotone" />, description: "Gestión de productos", permission: "canViewProducts" },
      { to: "/category-management", label: "Categorías", icon: <Folders size={18} weight="duotone" />, description: "Organización", permission: "canViewCategories" },
      { to: "/address-management", label: "Direcciones", icon: <MapPin size={18} weight="duotone" />, description: "Direcciones de envío", permission: "canViewAddresses" },
      { to: "/ReviewsManagement", label: "Reseñas", icon: <Star size={18} weight="duotone" />, description: "Opiniones", permission: "canViewReviews" },
    ]
  },
  herramientas: {
    label: "Herramientas",
    icon: <PaintBrush size={18} weight="duotone" />,
    permission: "canViewDesigns", // Requiere al menos ver diseños
    items: [
      { to: "/design-management", label: "Editor de Diseños", icon: <PaintBrush size={18} weight="duotone" />, description: "Herramientas de diseño", permission: "canViewDesigns" },
      { to: "/orders", label: "Pedidos", icon: <ShoppingCart size={18} weight="duotone" />, description: "Control de pedidos", permission: "canViewOrders" },
    ]
  },
  analisis: {
    label: "Análisis",
    icon: <ChartBar size={18} weight="duotone" />,
    permission: "canViewReports", // Requiere ver reportes
    items: [
      { to: "/analytics", label: "Analytics", icon: <ChartBar size={18} weight="duotone" />, description: "Estadísticas y métricas", permission: "canViewReports" },
      { to: "/reports", label: "Reportes", icon: <FileText size={18} weight="duotone" />, description: "Informes detallados", permission: "canViewReports" },
      { to: "/payment-methods", label: "Métodos de Pago", icon: <CreditCard size={18} weight="duotone" />, description: "Gestión de pagos", permission: "canViewPayments" },
    ]
  }
};

// ============================================================
// NAVBAR COMPONENT - CON LÓGICA RESPONSIVE MEJORADA
// ============================================================

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNavbarLogoutConfirm, setShowNavbarLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [dropdownStates, setDropdownStates] = useState({
    personal: { open: false, anchor: null },
    gestion: { open: false, anchor: null },
    herramientas: { open: false, anchor: null },
    analisis: { open: false, anchor: null }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { hasPermission } = usePermissions();
  const theme = useTheme();
  
  // MEDIA QUERIES MEJORADAS
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // 0-599px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-959px
  const isLaptopSmall = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 960-1279px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // 1280px+

  const handleDropdownClick = (dropdownKey, event) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownKey]: {
        open: !prev[dropdownKey].open,
        anchor: prev[dropdownKey].open ? null : event.currentTarget
      }
    }));
    Object.keys(dropdownStates).forEach(key => {
      if (key !== dropdownKey && dropdownStates[key].open) {
        setDropdownStates(prev => ({ ...prev, [key]: { open: false, anchor: null } }));
      }
    });
    if (showUserMenu) {
      setShowUserMenu(false);
      setUserMenuAnchor(null);
    }
  };

  const handleDropdownClose = (dropdownKey) => {
    setDropdownStates(prev => ({ ...prev, [dropdownKey]: { open: false, anchor: null } }));
  };

  const handleUserMenuClick = (event) => {
    setUserMenuAnchor(event.currentTarget);
    setShowUserMenu(!showUserMenu);
    setDropdownStates({
      personal: { open: false, anchor: null },
      gestion: { open: false, anchor: null },
      herramientas: { open: false, anchor: null },
      analisis: { open: false, anchor: null }
    });
  };

  const handleUserMenuClose = () => {
    setShowUserMenu(false);
    setUserMenuAnchor(null);
  };

  const toggleSidebar = () => {
    setDropdownStates({
      personal: { open: false, anchor: null },
      gestion: { open: false, anchor: null },
      herramientas: { open: false, anchor: null },
      analisis: { open: false, anchor: null }
    });
    setShowUserMenu(false);
    setUserMenuAnchor(null);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleLogoutConfirm = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      setIsSidebarOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  const handleLogoutCancel = () => setShowLogoutConfirm(false);

  const handleNavbarLogoutClick = () => setShowNavbarLogoutConfirm(true);
  const handleNavbarLogoutConfirm = async () => {
    try {
      await logout();
      setShowNavbarLogoutConfirm(false);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  const handleNavbarLogoutCancel = () => setShowNavbarLogoutConfirm(false);

  const isActiveRoute = (path) => location.pathname === path;
  const hasActiveItems = (dropdownKey) => {
    const dropdown = DROPDOWN_MENUS[dropdownKey];
    return dropdown.items.some(item => {
      const hasAccess = item.permission ? hasPermission(item.permission) : true;
      return hasAccess && isActiveRoute(item.to);
    });
  };

  return (
    <>
      <StyledAppBar hidden={isSidebarOpen} elevation={0}>
        <StyledToolbar>
          <MainContent>
            {/* BRAND - SIEMPRE VISIBLE */}
            <BrandContainer onClick={() => navigate('/dashboard')}>
              <LogoContainer>
                <img src="/logo.png" alt="DIAMBARS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </LogoContainer>
              <BrandText>
                <BrandName>DIAMBARS</BrandName>
                <BrandSubtitle className="brand-subtitle">administración</BrandSubtitle>
              </BrandText>
            </BrandContainer>

            {/* NAVIGATION - SOLO EN DESKTOP (lg+) */}
            {isDesktop && (
              <NavContainer>
                {MAIN_NAVIGATION.map((item) => (
                  <GlassButton
                    key={item.to}
                    component={Link}
                    to={item.to}
                    active={isActiveRoute(item.to)}
                    startIcon={item.icon}
                  >
                    <span className="nav-label">{item.label}</span>
                  </GlassButton>
                ))}
                
                {Object.entries(DROPDOWN_MENUS).map(([key, dropdown]) => {
                  const hasAccess = dropdown.permission ? hasPermission(dropdown.permission) : true;
                  return (
                    <GlassButton
                      key={key}
                      onClick={(e) => hasAccess ? handleDropdownClick(key, e) : null}
                      open={dropdownStates[key].open}
                      hasActiveItems={hasActiveItems(key)}
                      startIcon={dropdown.icon}
                      endIcon={
                        <span className="dropdown-caret">
                          {dropdownStates[key].open ? <CaretUp size={14} /> : <CaretDown size={14} />}
                        </span>
                      }
                      style={{
                        opacity: hasAccess ? 1 : 0.5,
                        pointerEvents: hasAccess ? 'auto' : 'none',
                        cursor: hasAccess ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <span className="dropdown-label">{dropdown.label}</span>
                    </GlassButton>
                  );
                })}
              </NavContainer>
            )}

            {/* RIGHT CONTROLS - ESTRATEGIA RESPONSIVE MEJORADA */}
            <RightControls>
              {/* USER MENU - VISIBLE EN DESKTOP Y TABLETS/LAPTOPS (md+) */}
              {(isDesktop || isLaptopSmall) && (
                <UserContainer onClick={handleUserMenuClick}>
                  <StyledAvatar>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</StyledAvatar>
                  <Box className="user-info">
                    <Typography variant="body2" fontWeight={700} color="#010326" fontSize={14}>
                      {user?.name || 'Usuario'}
                    </Typography>
                    <Typography variant="caption" color="#64748b" fontSize={11}>
                      {user?.type || 'admin'}
                    </Typography>
                  </Box>
                </UserContainer>
              )}
              
              {/* MENU BUTTON - SIEMPRE VISIBLE */}
              <GlassIconButton onClick={toggleSidebar}>
                <ListIcon size={20} weight="duotone" />
              </GlassIconButton>
            </RightControls>
          </MainContent>
        </StyledToolbar>
      </StyledAppBar>

      {/* Modal de logout navbar */}
      {showNavbarLogoutConfirm && (
        <>
          <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", zIndex: 1350 }} onClick={handleNavbarLogoutCancel} />
          <LogoutConfirmationModal>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box sx={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF" }}>
                <SignOut size={24} weight="duotone" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="#010326">Cerrar Sesión</Typography>
                <Typography variant="body2" color="#64748b">¿Estás seguro que deseas salir?</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="#475569" mb={3}>
              Tu sesión actual se cerrará y serás redirigido a la página de inicio de sesión.
            </Typography>
            <Stack direction="row" spacing={2}>
              <GlassButton onClick={handleNavbarLogoutCancel} sx={{ flex: 1, py: 1.5, borderRadius: 2, background: "rgba(148, 163, 184, 0.2)", color: "#64748b" }}>
                Cancelar
              </GlassButton>
              <GlassButton variant="danger" onClick={handleNavbarLogoutConfirm} sx={{ flex: 1, py: 1.5, borderRadius: 2 }}>
                Confirmar
              </GlassButton>
            </Stack>
          </LogoutConfirmationModal>
        </>
      )}

      {/* Sidebar Drawer */}
      <StyledDrawer anchor="right" open={isSidebarOpen} onClose={toggleSidebar} ModalProps={{ keepMounted: true }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 3, borderBottom: "1px solid rgba(226, 232, 240, 0.8)" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <LogoContainer sx={{ width: 40, height: 40 }}>
              <img src="/logo.png" alt="DIAMBARS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </LogoContainer>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#010326">DIAMBARS</Typography>
              <Typography variant="caption" color="#64748b">administración</Typography>
            </Box>
          </Box>
          <GlassIconButton onClick={toggleSidebar}>
            <X size={20} weight="bold" />
          </GlassIconButton>
        </Box>

        <Box sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
          {/* User Profile Card */}
          <Paper elevation={0} sx={{ p: 3, background: "rgba(31, 100, 191, 0.05)", border: "1px solid rgba(31, 100, 191, 0.1)", borderRadius: 3, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-1px)", boxShadow: "0 2px 6px rgba(31, 100, 191, 0.05)" } }}>
            <Box display="flex" alignItems="center" gap={2}>
              <StyledAvatar sx={{ width: 56, height: 56, fontSize: 22 }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </StyledAvatar>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={700} color="#010326" noWrap>{user?.name || 'Usuario'}</Typography>
                <Chip label={user?.type || 'admin'} size="small" sx={{ background: "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)", color: "#FFFFFF", fontWeight: 600, fontSize: 11, mt: 0.5 }} />
              </Box>
            </Box>
          </Paper>

          {/* Main Navigation */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#010326" textTransform="uppercase" letterSpacing={1} sx={{ mb: 2, px: 1 }}>
              Navegación Principal
            </Typography>
            <List sx={{ p: 0 }}>
              {MAIN_NAVIGATION.map((item, index) => (
                <ListItem key={item.to} disablePadding sx={{ mb: 1 }}>
                  <MenuItemStyled
                    component={Link}
                    to={item.to}
                    active={isActiveRoute(item.to)}
                    onClick={toggleSidebar}
                    sx={{ width: "100%", py: 2, animationDelay: `${index * 0.1}s`, animation: `${slideInFromTop} 0.4s ease-out` }}
                  >
                    <ListItemIcon sx={{ color: isActiveRoute(item.to) ? "#FFFFFF" : "#475569", minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: 16, color: isActiveRoute(item.to) ? "#FFFFFF" : "#010326" }}
                      secondaryTypographyProps={{ fontSize: 13, color: isActiveRoute(item.to) ? "rgba(255, 255, 255, 0.8)" : "#64748b" }}
                    />
                  </MenuItemStyled>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Dropdown Sections */}
          {Object.entries(DROPDOWN_MENUS).map(([key, dropdown], sectionIndex) => {
            const hasAccess = dropdown.permission ? hasPermission(dropdown.permission) : true;
            return (
              <Box key={key}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={700} 
                  color="#010326" 
                  textTransform="uppercase" 
                  letterSpacing={1} 
                  sx={{ 
                    mb: 2, 
                    px: 1,
                    opacity: hasAccess ? 1 : 0.5
                  }}
                >
                  {dropdown.label}
                </Typography>
                <List sx={{ p: 0 }}>
                  {dropdown.items.map((item, itemIndex) => {
                    const itemHasAccess = item.permission ? hasPermission(item.permission) : true;
                    return (
                      <ListItem key={item.to} disablePadding sx={{ mb: 1 }}>
                        <MenuItemStyled
                          component={itemHasAccess ? Link : 'div'}
                          to={itemHasAccess ? item.to : undefined}
                          active={isActiveRoute(item.to)}
                          onClick={itemHasAccess ? toggleSidebar : null}
                          sx={{ 
                            width: "100%", 
                            py: 2, 
                            animationDelay: `${(sectionIndex + 1) * 0.2 + itemIndex * 0.1}s`, 
                            animation: `${slideInFromTop} 0.4s ease-out`,
                            opacity: itemHasAccess ? 1 : 0.5,
                            pointerEvents: itemHasAccess ? 'auto' : 'none',
                            cursor: itemHasAccess ? 'pointer' : 'not-allowed'
                          }}
                        >
                          <ListItemIcon sx={{ color: isActiveRoute(item.to) ? "#FFFFFF" : "#475569", minWidth: 40 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            secondary={item.description}
                            primaryTypographyProps={{ fontWeight: 700, fontSize: 16, color: isActiveRoute(item.to) ? "#FFFFFF" : "#010326" }}
                            secondaryTypographyProps={{ fontSize: 13, color: isActiveRoute(item.to) ? "rgba(255, 255, 255, 0.8)" : "#64748b" }}
                          />
                        </MenuItemStyled>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            );
          })}

          {/* Bottom Actions */}
          <Box sx={{ mt: "auto", pt: 3, borderTop: "1px solid rgba(226, 232, 240, 0.8)" }}>
            <Stack spacing={2}>
              <SidebarButton component={Link} to="/profile" onClick={toggleSidebar} variant="profile" startIcon={<Gear size={20} weight="duotone" />} sx={{ justifyContent: "flex-start", width: "100%" }}>
                Perfil
              </SidebarButton>
              <SidebarButton variant="danger" onClick={handleLogoutClick} startIcon={<SignOut size={20} weight="duotone" />} sx={{ justifyContent: "flex-start", width: "100%" }}>
                Cerrar Sesión
              </SidebarButton>
            </Stack>
          </Box>

          {/* Modal de logout sidebar */}
          {showLogoutConfirm && (
            <>
              <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", zIndex: 1450 }} onClick={handleLogoutCancel} />
              <LogoutConfirmationModal>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box sx={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF" }}>
                    <SignOut size={24} weight="duotone" />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="#010326">Cerrar Sesión</Typography>
                    <Typography variant="body2" color="#64748b">¿Estás seguro que deseas salir?</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="#475569" mb={3}>
                  Tu sesión actual se cerrará y serás redirigido a la página de inicio de sesión.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <GlassButton onClick={handleLogoutCancel} sx={{ flex: 1, py: 1.5, borderRadius: 2, background: "rgba(148, 163, 184, 0.2)", color: "#64748b" }}>
                    Cancelar
                  </GlassButton>
                  <GlassButton variant="danger" onClick={handleLogoutConfirm} sx={{ flex: 1, py: 1.5, borderRadius: 2 }}>
                    Confirmar
                  </GlassButton>
                </Stack>
              </LogoutConfirmationModal>
            </>
          )}
        </Box>
      </StyledDrawer>

      {/* Dropdowns - Solo cuando navbar visible y en desktop */}
      {isDesktop && !isSidebarOpen && (
        <>
          {/* User Menu */}
          <StyledPopper open={showUserMenu} anchorEl={userMenuAnchor} placement="bottom-end">
            {showUserMenu && (
              <Paper>
                <ClickAwayListener onClickAway={handleUserMenuClose}>
                  <Box sx={{ p: 1 }}>
                    <Box sx={{ p: 2, borderBottom: "1px solid rgba(226, 232, 240, 0.6)", mb: 1 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <StyledAvatar sx={{ width: 48, height: 48 }}>
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </StyledAvatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="#010326">{user?.name || 'Usuario'}</Typography>
                          <Chip label={user?.type || 'admin'} size="small" sx={{ background: "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)", color: "#FFFFFF", fontWeight: 600, fontSize: 10, mt: 0.5 }} />
                        </Box>
                      </Box>
                    </Box>
                    <List dense sx={{ p: 0 }}>
                      <MenuItemStyled component={Link} to="/profile" onClick={handleUserMenuClose}>
                        <ListItemIcon sx={{ color: "#475569", minWidth: 32 }}>
                          <Gear size={18} weight="duotone" />
                        </ListItemIcon>
                        <ListItemText primary="Perfil" secondary="Configuración de cuenta" primaryTypographyProps={{ fontWeight: 600, fontSize: 14, color: "#010326" }} secondaryTypographyProps={{ fontSize: 12, color: "#64748b" }} />
                      </MenuItemStyled>
                      <MenuItemStyled onClick={() => { handleUserMenuClose(); handleNavbarLogoutClick(); }} sx={{ "&:hover": { background: "rgba(220, 38, 38, 0.08)" } }}>
                        <ListItemIcon sx={{ color: "#dc2626", minWidth: 32 }}>
                          <SignOut size={18} weight="duotone" />
                        </ListItemIcon>
                        <ListItemText primary="Cerrar Sesión" secondary="Salir del sistema" primaryTypographyProps={{ fontWeight: 600, fontSize: 14, color: "#dc2626" }} secondaryTypographyProps={{ fontSize: 12, color: "#dc2626" }} />
                      </MenuItemStyled>
                    </List>
                  </Box>
                </ClickAwayListener>
              </Paper>
            )}
          </StyledPopper>

          {/* Navigation Dropdowns */}
          {Object.entries(DROPDOWN_MENUS).map(([key, dropdown]) => {
            const hasAccess = dropdown.permission ? hasPermission(dropdown.permission) : true;
            return (
              <StyledPopper key={key} open={dropdownStates[key].open} anchorEl={dropdownStates[key].anchor} placement="bottom-end">
                {dropdownStates[key].open && hasAccess && (
                  <Paper>
                    <ClickAwayListener onClickAway={() => handleDropdownClose(key)}>
                      <Box sx={{ p: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="#010326" textTransform="uppercase" letterSpacing={0.5} fontSize={11} sx={{ mb: 1.5, px: 1 }}>
                          {dropdown.label}
                        </Typography>
                        <List dense sx={{ p: 0 }}>
                          {dropdown.items.map((item) => {
                            const itemHasAccess = item.permission ? hasPermission(item.permission) : true;
                            return (
                              <MenuItemStyled
                                key={item.to}
                                component={itemHasAccess ? Link : 'div'}
                                to={itemHasAccess ? item.to : undefined}
                                active={isActiveRoute(item.to)}
                                onClick={itemHasAccess ? () => handleDropdownClose(key) : null}
                                sx={{
                                  opacity: itemHasAccess ? 1 : 0.5,
                                  pointerEvents: itemHasAccess ? 'auto' : 'none',
                                  cursor: itemHasAccess ? 'pointer' : 'not-allowed'
                                }}
                              >
                                <ListItemIcon sx={{ color: isActiveRoute(item.to) ? "#FFFFFF" : "#475569", minWidth: 32 }}>
                                  {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                  primary={item.label}
                                  secondary={item.description}
                                  primaryTypographyProps={{ fontWeight: 600, fontSize: 14, color: isActiveRoute(item.to) ? "#FFFFFF" : "#010326" }}
                                  secondaryTypographyProps={{ fontSize: 12, color: isActiveRoute(item.to) ? "rgba(255, 255, 255, 0.8)" : "#64748b" }}
                                />
                              </MenuItemStyled>
                            );
                          })}
                        </List>
                      </Box>
                    </ClickAwayListener>
                  </Paper>
                )}
              </StyledPopper>
            );
          })}
        </>
      )}
    </>
  );
};

export default Navbar;