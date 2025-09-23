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
  Divider,
  useTheme,
  useMediaQuery,
  Paper,
  Popper,
  Fade,
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
  Calculator,
  CaretDown,
  CaretUp,
  Plus,
  CreditCard,
  FileText,
  MapPin,
  House,
} from "@phosphor-icons/react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const customBreakpoints = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
};

const glassShine = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const slideInFromTop = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const dropdownFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const statusPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const GlassBase = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(31, 100, 191, 0.15)",
  boxShadow: `
    0 8px 25px rgba(31, 100, 191, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95)
  `,
  position: "relative",
  overflow: "visible",
  transition: "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
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
}));

const GlassButton = styled(Button)(({ theme, active, variant, hasActiveItems, open, ...props }) => {
  const isActive = active || hasActiveItems;
  const isHover = open;

  return {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    minWidth: "auto",
    borderRadius: 16,
    textTransform: "none",
    fontWeight: 600,
    fontSize: 14,
    transition: "color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
    overflow: "visible",
    whiteSpace: "nowrap",
    pointerEvents: "auto",
    
    // Solo aplicar estilos visuales cuando está activo, es danger o está open (hover)
    ...(isActive ? {
      color: "#FFFFFF",
      background: "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 6px 20px rgba(4, 13, 191, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
    } : variant === "danger" ? {
      color: "#FFFFFF",
      background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 6px 20px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
    } : isHover ? {
      color: "#040DBF",
      background: "rgba(31, 100, 191, 0.15)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(31, 100, 191, 0.25)",
      boxShadow: "0 6px 20px rgba(31, 100, 191, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    } : {
      // Estado por defecto: completamente transparente
      color: "#64748b",
      background: "transparent",
      border: "none",
      boxShadow: "none",
    }),
    
    "&:hover": {
      // Solo efecto de reflejo, sin cambios de tamaño o posición
      ...(isActive ? {
        background: "linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)",
        boxShadow: "0 8px 30px rgba(4, 13, 191, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
      } : variant === "danger" ? {
        background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
        boxShadow: "0 8px 30px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
      } : isHover ? {
        color: "#040DBF",
        background: "rgba(31, 100, 191, 0.2)",
      } : {
        // Hover minimalista solo con cambio de color
        color: "#040DBF",
      }),
    },
    
    [theme.breakpoints.down('lg')]: {
      padding: "8px 14px",
      fontSize: 13,
      gap: 6,
      borderRadius: 14,
    },
    
    [theme.breakpoints.down('md')]: {
      padding: "8px 10px",
      fontSize: 12,
      gap: 4,
      borderRadius: 12,
      minWidth: 40,
      
      "& .nav-label, & .dropdown-label": {
        display: "none",
      },
      "& .dropdown-caret": {
        display: "none",
      },
    },
  };
});

const GlassIconButton = styled(IconButton)(({ theme, variant, ...props }) => ({
  width: 44,
  height: 44,
  borderRadius: 12,
  background: variant === "danger" 
    ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
    : "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: variant === "danger" 
    ? "1px solid rgba(255, 255, 255, 0.25)"
    : "1px solid rgba(226, 232, 240, 0.6)",
  color: variant === "danger" ? "#FFFFFF" : "#64748b",
  transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
  boxShadow: variant === "danger" 
    ? "0 6px 20px rgba(220, 38, 38, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)"
    : "0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
  position: "relative",
  overflow: "hidden",

  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
    transition: "all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)",
    opacity: 0,
  },

  "&:hover": {
    background: variant === "danger" 
      ? "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)"
      : "rgba(31, 100, 191, 0.12)",
    borderColor: variant === "danger" 
      ? "rgba(255, 255, 255, 0.35)" 
      : "rgba(31, 100, 191, 0.35)",
    color: variant === "danger" ? "#FFFFFF" : "#040DBF",
    transform: "translateY(-3px) scale(1.06)",
    boxShadow: variant === "danger" 
      ? "0 8px 30px rgba(220, 38, 38, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5)"
      : "0 6px 25px rgba(31, 100, 191, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
  },

  "&:hover::before": {
    left: "100%",
    opacity: 1,
  },

  [theme.breakpoints.down('md')]: {
    width: 36,
    height: 36,
    borderRadius: 9,
  },
}));

const StyledAppBar = styled(AppBar)(({ theme, scrolled, hidden, ...props }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 72,
  background: "#FFFFFF",
  borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  transition: "all 0.3s ease",
  zIndex: 1300,
  transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
  opacity: hidden ? 0 : 1,

  [theme.breakpoints.down('lg')]: {
    height: 68,
  },
  [theme.breakpoints.down('md')]: {
    height: 64,
  },
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    height: 60,
  },
  [`@media (max-width: 375px)`]: {
    height: 56,
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  height: "100%",
  padding: "0 32px",
  justifyContent: "space-between",
  minHeight: "unset !important",
  position: "relative",

  [theme.breakpoints.down('xl')]: {
    padding: "0 24px",
  },
  [theme.breakpoints.down('lg')]: {
    padding: "0 20px",
  },
  [theme.breakpoints.down('md')]: {
    padding: "0 16px",
  },
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    padding: "0 12px",
  },
  [`@media (max-width: 375px)`]: {
    padding: "0 8px",
  },
}));

const BrandContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 16,
  cursor: "pointer",
  padding: "8px 12px",
  flex: "0 0 auto",
  background: "transparent",
  border: "none",
  boxShadow: "none",

  [theme.breakpoints.down('lg')]: {
    gap: 14,
    padding: "6px 10px",
  },
  [theme.breakpoints.down('md')]: {
    gap: 12,
    padding: "4px 8px",
  },
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    gap: 10,
    padding: "2px 4px",
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  overflow: "hidden",
  background: "transparent",
  transition: "all 0.3s ease",
  flexShrink: 0,

  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
    transition: "all 0.6s ease",
    opacity: 0,
    zIndex: 1,
  },

  "&:hover::before": {
    left: "100%",
    opacity: 1,
  },

  "&:hover": {
    transform: "scale(1.05)",
  },

  [theme.breakpoints.down('lg')]: {
    width: 44,
    height: 44,
    borderRadius: 11,
  },
  [theme.breakpoints.down('md')]: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    width: 36,
    height: 36,
    borderRadius: 9,
  },
  [`@media (max-width: 375px)`]: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
}));

const BrandText = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  flex: "0 0 auto",
  background: "transparent",
  border: "none",
  boxShadow: "none",

  [`@media (max-width: 320px)`]: {
    "& .brand-subtitle": {
      display: "none",
    },
  },
}));

const BrandName = styled(Typography)(({ theme }) => ({
  fontSize: 24,
  fontWeight: 800,
  color: "#010326",
  margin: 0,
  letterSpacing: "-0.02em",
  lineHeight: 1,
  whiteSpace: "nowrap",
  textShadow: "0 1px 2px rgba(1, 3, 38, 0.1)",

  [theme.breakpoints.down('lg')]: {
    fontSize: 22,
  },
  [theme.breakpoints.down('md')]: {
    fontSize: 20,
  },
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    fontSize: 18,
  },
  [`@media (max-width: 375px)`]: {
    fontSize: 16,
  },
  [`@media (max-width: 320px)`]: {
    fontSize: 15,
  },
}));

const BrandSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: "#64748b",
  fontWeight: 500,
  letterSpacing: "0.5px",
  textTransform: "lowercase",
  lineHeight: 1,
  whiteSpace: "nowrap",

  [theme.breakpoints.down('lg')]: {
    fontSize: 11,
  },
  [theme.breakpoints.down('md')]: {
    fontSize: 10,
  },
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    fontSize: 9,
  },
  [`@media (max-width: 375px)`]: {
    fontSize: 8,
  },
}));

const NavContainer = styled(GlassBase)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  borderRadius: 20,
  padding: "6px",
  transition: "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
  pointerEvents: "auto",

  [theme.breakpoints.down('lg')]: {
    gap: 3,
    padding: "5px",
    borderRadius: 18,
  },
  [theme.breakpoints.down('md')]: {
    gap: 2,
    padding: "4px",
    borderRadius: 16,
  },
}));

const UserContainer = styled(GlassBase)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "6px 12px 6px 6px",
  borderRadius: 24,
  cursor: "pointer",

  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `
      0 12px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
    `,
  },

  [theme.breakpoints.down('md')]: {
    padding: "4px",
    gap: 0,
    borderRadius: 20,
    
    "& .user-info": {
      display: "none",
    },
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  background: "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)",
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 16,
  boxShadow: "0 3px 12px rgba(4, 13, 191, 0.3)",
  transition: "all 0.3s ease",
  position: "relative",

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
    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)",
  },

  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 4px 16px rgba(4, 13, 191, 0.4)",
  },

  [theme.breakpoints.down('lg')]: {
    width: 38,
    height: 38,
    fontSize: 15,
    
    "&::after": {
      width: 11,
      height: 11,
    },
  },
  [theme.breakpoints.down('md')]: {
    width: 36,
    height: 36,
    fontSize: 14,
    
    "&::after": {
      width: 10,
      height: 10,
    },
  },
}));

const StyledPopper = styled(Popper)(({ theme }) => ({
  zIndex: 1400,
  pointerEvents: "auto",
  transition: "none !important",
  animation: "none !important",

  "& .MuiPaper-root": {
    animation: `${dropdownFadeIn} 0.2s ease-out`,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: 20,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: `
      0 8px 25px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 1)
    `,
    padding: "12px",
    minWidth: 280,
    marginTop: "8px !important",
    overflow: "visible",
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
    
    [theme.breakpoints.down('lg')]: {
      minWidth: 260,
      borderRadius: 18,
      padding: "10px",
    },
    [theme.breakpoints.down('md')]: {
      minWidth: 240,
      borderRadius: 16,
      padding: "8px",
    },
  },
}));

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
    [`@media (max-width: ${customBreakpoints.md - 1}px)`]: {
      width: "100%",
      maxWidth: "100vw",
    },
  },
}));

const LogoutConfirmationModal = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 320,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.6)",
  boxShadow: `
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.8)
  `,
  padding: 24,
  zIndex: 1500,

  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 1), transparent)",
  },
}));

const MenuItemStyled = styled(ListItemButton)(({ theme, active, ...props }) => ({
  borderRadius: 12,
  padding: "12px 16px",
  marginBottom: 4,
  background: active 
    ? "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)" 
    : "rgba(248, 250, 252, 0.8)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: active 
    ? "1px solid rgba(255, 255, 255, 0.2)" 
    : "1px solid rgba(226, 232, 240, 0.6)",
  transition: "background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
  overflow: "visible",
  position: "relative",
  pointerEvents: "auto",

  "&:hover": {
    background: active 
      ? "linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)"
      : "rgba(31, 100, 191, 0.08)",
    borderColor: active 
      ? "rgba(255, 255, 255, 0.3)" 
      : "rgba(31, 100, 191, 0.2)",
    transform: "translateX(4px)",
    boxShadow: active 
      ? "0 4px 12px rgba(4, 13, 191, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
      : "0 4px 12px rgba(31, 100, 191, 0.1)",
  },

  "&:last-child": {
    marginBottom: 0,
  },

  [theme.breakpoints.down('md')]: {
    padding: "10px 14px",
    borderRadius: 10,
  },
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    padding: "8px 12px",
    borderRadius: 8,
  },
}));

const SidebarButton = styled(Button)(({ theme, variant, ...props }) => ({
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
    transition: "all 0.6s ease",
    opacity: 0,
    zIndex: 1,
  },

  "&:hover": {
    ...(variant === "profile" ? {
      background: "#1F64BF",
      color: "#FFFFFF",
      boxShadow: "0 6px 20px rgba(4, 13, 191, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
      transform: "translateY(-1px)",
    } : variant === "danger" ? {
      background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
      color: "#FFFFFF",
      boxShadow: "0 6px 20px rgba(220, 38, 38, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
      transform: "translateY(-1px)",
    } : {
      background: "rgba(31, 100, 191, 0.08)",
      borderColor: "rgba(31, 100, 191, 0.2)",
      color: "#040DBF",
      transform: "translateY(-1px)",
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

const MAIN_NAVIGATION = [
  {
    to: "/dashboard",
    label: "Inicio",
    icon: <House size={18} weight="duotone" />,
    description: "Panel principal"
  },
];

const DROPDOWN_MENUS = {
  personal: {
    label: "Personal",
    icon: <Users size={18} weight="duotone" />,
    items: [
      {
        to: "/employees",
        label: "Empleados",
        icon: <UserList size={18} weight="duotone" />,
        description: "Gestión de personal"
      },
      {
        to: "/users",
        label: "Usuarios",
        icon: <Users size={18} weight="duotone" />,
        description: "Administración de usuarios"
      },
    ]
  },
  gestion: {
    label: "Gestión",
    icon: <Folders size={18} weight="duotone" />,
    items: [
      {
        to: "/catalog-management",
        label: "Catálogo",
        icon: <ChartBar size={18} weight="duotone" />,
        description: "Gestión de productos y servicios"
      },
      {
        to: "/orders",
        label: "Pedidos",
        icon: <ShoppingCart size={18} weight="duotone" />,
        description: "Control de pedidos y órdenes"
      },
      {
        to: "/category-management",
        label: "Categorías",
        icon: <Folders size={18} weight="duotone" />,
        description: "Organización de productos"
      },
      {
        to: "/address-management",
        label: "Direcciones",
        icon: <MapPin size={18} weight="duotone" />,
        description: "Gestión de direcciones de envío"
      },
      {
        to: "/ReviewsManagement",
        label: "Reseñas",
        icon: <Star size={18} weight="duotone" />,
        description: "Opiniones de clientes"
      },
    ]
  },
  herramientas: {
    label: "Herramientas",
    icon: <PaintBrush size={18} weight="duotone" />,
    items: [
      {
        to: "/design-management",
        label: "Editor de Diseños",
        icon: <PaintBrush size={18} weight="duotone" />,
        description: "Herramientas de diseño"
      },
      {
        to: "/quotes",
        label: "Cotización",
        icon: <Calculator size={18} weight="duotone" />,
        description: "Gestión de presupuestos"
      },
      {
        to: "/manual-orders",
        label: "Pedido Manual",
        icon: <Plus size={18} weight="duotone" />,
        description: "Crear pedidos manualmente"
      },
    ]
  },
  analisis: {
    label: "Análisis",
    icon: <ChartBar size={18} weight="duotone" />,
    items: [
      {
        to: "/reports",
        label: "Reportes",
        icon: <FileText size={18} weight="duotone" />,
        description: "Informes detallados"
      },
      {
        to: "/payment-methods",
        label: "Métodos de Pago",
        icon: <CreditCard size={18} weight="duotone" />,
        description: "Gestión de pagos"
      },
    ]
  }
};

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNavbarLogoutConfirm, setShowNavbarLogoutConfirm] = useState(false);

  const [dropdownStates, setDropdownStates] = useState({
    personal: { open: false, anchor: null },
    gestion: { open: false, anchor: null },
    herramientas: { open: false, anchor: null },
    analisis: { open: false, anchor: null }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const theme = useTheme();

  const isXs = useMediaQuery(`(max-width: ${customBreakpoints.sm - 1}px)`);
  const isSm = useMediaQuery(`(min-width: ${customBreakpoints.sm}px) and (max-width: ${customBreakpoints.md - 1}px)`);
  const isMd = useMediaQuery(`(min-width: ${customBreakpoints.md}px) and (max-width: ${customBreakpoints.lg - 1}px)`);
  const isLg = useMediaQuery(`(min-width: ${customBreakpoints.lg}px) and (max-width: ${customBreakpoints.xl - 1}px)`);
  const isMobile = useMediaQuery(`(max-width: ${customBreakpoints.md - 1}px)`);
  const isTablet = useMediaQuery(`(min-width: ${customBreakpoints.md}px) and (max-width: ${customBreakpoints.lg - 1}px)`);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getVisibleItemsCount = () => {
    if (isXs || isSm) return 0;
    return 1;
  };

  const visibleItemsCount = getVisibleItemsCount();
  const visibleMainItems = MAIN_NAVIGATION.slice(0, visibleItemsCount);

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
        setDropdownStates(prev => ({
          ...prev,
          [key]: { open: false, anchor: null }
        }));
      }
    });
  };

  const handleDropdownClose = (dropdownKey) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownKey]: { open: false, anchor: null }
    }));
  };

  const toggleSidebar = () => {
    setDropdownStates({
      personal: { open: false, anchor: null },
      gestion: { open: false, anchor: null },
      herramientas: { open: false, anchor: null },
      analisis: { open: false, anchor: null }
    });
    
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Logout desde sidebar
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

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

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // Logout desde navbar
  const handleNavbarLogoutClick = () => {
    setShowNavbarLogoutConfirm(true);
  };

  const handleNavbarLogoutConfirm = async () => {
    try {
      await logout();
      setShowNavbarLogoutConfirm(false);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleNavbarLogoutCancel = () => {
    setShowNavbarLogoutConfirm(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const hasActiveItems = (dropdownKey) => {
    return DROPDOWN_MENUS[dropdownKey].items.some(item => isActiveRoute(item.to));
  };

  return (
    <>
      <StyledAppBar scrolled={isScrolled} hidden={isSidebarOpen} elevation={0}>
        <StyledToolbar>
          <BrandContainer>
            <LogoContainer>
              <img 
                src="/logo.png" 
                alt="DIAMBARS Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  borderRadius: 'inherit'
                }} 
              />
            </LogoContainer>
            <BrandText>
              <BrandName>DIAMBARS</BrandName>
              <BrandSubtitle className="brand-subtitle">administración</BrandSubtitle>
            </BrandText>
          </BrandContainer>

          {!isMobile && (
            <NavContainer>
              {visibleMainItems.map((item) => (
                <GlassButton
                  key={item.to}
                  component={Link}
                  to={item.to}
                  active={isActiveRoute(item.to)}
                  startIcon={item.icon}
                  title={item.description}
                >
                  <span className="nav-label">{item.label}</span>
                </GlassButton>
              ))}
              
              {Object.entries(DROPDOWN_MENUS).map(([key, dropdown]) => (
                <GlassButton
                  key={key}
                  onClick={(e) => handleDropdownClick(key, e)}
                  open={dropdownStates[key].open}
                  hasActiveItems={hasActiveItems(key)}
                  startIcon={dropdown.icon}
                  endIcon={
                    <span className="dropdown-caret">
                      {dropdownStates[key].open ? <CaretUp size={14} /> : <CaretDown size={14} />}
                    </span>
                  }
                  title={`Ver opciones de ${dropdown.label}`}
                >
                  <span className="dropdown-label">{dropdown.label}</span>
                </GlassButton>
              ))}
            </NavContainer>
          )}

          <Box display="flex" alignItems="center" gap={1.5}>
            {!isMd && !isMobile && (
              <UserContainer>
                <StyledAvatar>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </StyledAvatar>
                <Box className="user-info">
                  <Typography variant="body2" fontWeight={700} color="#010326" fontSize={14}>
                    {user?.name || 'Usuario'}
                  </Typography>
                  <Typography variant="caption" color="#64748b" textTransform="uppercase" fontSize={11}>
                    {user?.type || 'admin'}
                  </Typography>
                </Box>
              </UserContainer>
            )}

            {!isMobile && !isTablet && (
              <Stack direction="row" spacing={1}>
                <GlassIconButton component={Link} to="/profile" title="Perfil">
                  <Gear size={20} weight="duotone" />
                </GlassIconButton>
                <GlassIconButton variant="danger" onClick={handleNavbarLogoutClick} title="Cerrar sesión">
                  <SignOut size={20} weight="duotone" />
                </GlassIconButton>
              </Stack>
            )}

            <GlassIconButton onClick={toggleSidebar}>
              <ListIcon size={20} weight="duotone" />
            </GlassIconButton>
          </Box>
        </StyledToolbar>
      </StyledAppBar>

      {/* Modal de confirmación de logout para navbar */}
      {showNavbarLogoutConfirm && (
        <>
          <Box sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1350,
          }} onClick={handleNavbarLogoutCancel} />
          
          <LogoutConfirmationModal sx={{ zIndex: 1360 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}>
                <SignOut size={24} weight="duotone" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="#010326" fontSize={18}>
                  Cerrar Sesión
                </Typography>
                <Typography variant="body2" color="#64748b" fontSize={14}>
                  ¿Estás seguro que deseas salir?
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body2" color="#475569" mb={3} fontSize={14}>
              Tu sesión actual se cerrará y serás redirigido a la página de inicio de sesión.
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <GlassButton onClick={handleNavbarLogoutCancel} sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 2,
                background: "rgba(148, 163, 184, 0.2)",
                color: "#64748b",
                "&:hover": {
                  background: "rgba(148, 163, 184, 0.3)",
                  color: "#475569",
                },
              }}>
                Cancelar
              </GlassButton>
              
              <GlassButton variant="danger" onClick={handleNavbarLogoutConfirm} sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 2,
              }}>
                Confirmar
              </GlassButton>
            </Stack>
          </LogoutConfirmationModal>
        </>
      )}

      <StyledDrawer
        anchor="right"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        }}>
                     <Box display="flex" alignItems="center" gap={2}>
             <Box sx={{
               width: 40,
               height: 40,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               borderRadius: 2,
               overflow: "hidden",
             }}>
               <img 
                 src="/logo.png" 
                 alt="DIAMBARS Logo" 
                 style={{ 
                   width: '100%', 
                   height: '100%', 
                   objectFit: 'contain'
                 }} 
               />
             </Box>
             <Box>
               <Typography variant="h6" fontWeight={800} color="#010326" fontSize={20}>
                 DIAMBARS
               </Typography>
               <Typography variant="caption" color="#64748b" fontWeight={500}>
                 administración
               </Typography>
             </Box>
           </Box>
          <GlassIconButton onClick={toggleSidebar} sx={{
            "&:hover": { transform: "rotate(90deg) scale(1.05)" }
          }}>
            <X size={20} weight="bold" />
          </GlassIconButton>
        </Box>

        <Box sx={{ 
          flex: 1, 
          p: 3, 
          display: "flex", 
          flexDirection: "column", 
          gap: 3,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { background: "rgba(226, 232, 240, 0.3)", borderRadius: 3 },
          "&::-webkit-scrollbar-thumb": { 
            background: "rgba(148, 163, 184, 0.6)", 
            borderRadius: 3,
            "&:hover": { background: "rgba(100, 116, 139, 0.8)" }
          },
        }}>
          <Paper elevation={0} sx={{
            p: 3,
            background: "rgba(31, 100, 191, 0.05)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(31, 100, 191, 0.1)",
            borderRadius: 3,
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "visible",
            width: "100%",
            boxSizing: "border-box",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.2), transparent)",
            },
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(31, 100, 191, 0.1)",
            },
          }}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <StyledAvatar sx={{ width: 56, height: 56, fontSize: 22, flexShrink: 0 }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </StyledAvatar>
              <Box flex={1} minWidth={0}>
                <Typography variant="h6" fontWeight={700} color="#010326" fontSize={18} noWrap>
                  {user?.name || 'Usuario'}
                </Typography>
                <Chip label={user?.type || 'admin'} size="small" sx={{
                  background: "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mt: 0.5,
                }} />
              </Box>
            </Box>
          </Paper>

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
                    sx={{
                      width: "100%",
                      py: 2,
                      animationDelay: `${index * 0.1}s`,
                      animation: `${slideInFromTop} 0.4s ease-out`,
                    }}
                  >
                    <ListItemIcon sx={{
                      color: isActiveRoute(item.to) ? "#FFFFFF" : "#475569",
                      minWidth: 40,
                      fontSize: 20,
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: isActiveRoute(item.to) ? "#FFFFFF" : "#010326",
                      }}
                      secondaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: isActiveRoute(item.to) ? "rgba(255, 255, 255, 0.8)" : "#64748b",
                      }}
                    />
                  </MenuItemStyled>
                </ListItem>
              ))}
            </List>
          </Box>

          {Object.entries(DROPDOWN_MENUS).map(([key, dropdown], sectionIndex) => (
            <Box key={key}>
              <Typography variant="subtitle2" fontWeight={700} color="#010326" textTransform="uppercase" letterSpacing={1} sx={{ mb: 2, px: 1 }}>
                {dropdown.label}
              </Typography>
              <List sx={{ p: 0 }}>
                {dropdown.items.map((item, itemIndex) => (
                  <ListItem key={item.to} disablePadding sx={{ mb: 1 }}>
                    <MenuItemStyled
                      component={Link}
                      to={item.to}
                      active={isActiveRoute(item.to)}
                      onClick={toggleSidebar}
                      sx={{
                        width: "100%",
                        py: 2,
                        animationDelay: `${(sectionIndex + 1) * 0.2 + itemIndex * 0.1}s`,
                        animation: `${slideInFromTop} 0.4s ease-out`,
                      }}
                    >
                      <ListItemIcon sx={{
                        color: isActiveRoute(item.to) ? "#FFFFFF" : "#475569",
                        minWidth: 40,
                        fontSize: 20,
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.description}
                        primaryTypographyProps={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: isActiveRoute(item.to) ? "#FFFFFF" : "#010326",
                        }}
                        secondaryTypographyProps={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: isActiveRoute(item.to) ? "rgba(255, 255, 255, 0.8)" : "#64748b",
                        }}
                      />
                    </MenuItemStyled>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}

          <Box sx={{ mt: "auto", pt: 3, borderTop: "1px solid rgba(226, 232, 240, 0.8)" }}>
            <Stack spacing={2}>
              <SidebarButton
                component={Link}
                to="/profile"
                onClick={toggleSidebar}
                variant="profile"
                startIcon={<Gear size={20} weight="duotone" />}
                sx={{ justifyContent: "flex-start", width: "100%" }}
              >
                Perfil
              </SidebarButton>
              
              <SidebarButton
                variant="danger"
                onClick={handleLogoutClick}
                startIcon={<SignOut size={20} weight="duotone" />}
                sx={{ justifyContent: "flex-start", width: "100%" }}
              >
                Cerrar Sesión
              </SidebarButton>
            </Stack>
          </Box>

          {/* Modal de confirmación de logout dentro del sidebar */}
          {showLogoutConfirm && (
            <>
              <Box sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                zIndex: 1450,
              }} onClick={handleLogoutCancel} />
              
              <LogoutConfirmationModal>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                  }}>
                    <SignOut size={24} weight="duotone" />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="#010326" fontSize={18}>
                      Cerrar Sesión
                    </Typography>
                    <Typography variant="body2" color="#64748b" fontSize={14}>
                      ¿Estás seguro que deseas salir?
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="#475569" mb={3} fontSize={14}>
                  Tu sesión actual se cerrará y serás redirigido a la página de inicio de sesión.
                </Typography>
                
                <Stack direction="row" spacing={2}>
                  <GlassButton onClick={handleLogoutCancel} sx={{
                    flex: 1,
                    py: 1.5,
                    borderRadius: 2,
                    background: "rgba(148, 163, 184, 0.2)",
                    color: "#64748b",
                    "&:hover": {
                      background: "rgba(148, 163, 184, 0.3)",
                      color: "#475569",
                    },
                  }}>
                    Cancelar
                  </GlassButton>
                  
                  <GlassButton variant="danger" onClick={handleLogoutConfirm} sx={{
                    flex: 1,
                    py: 1.5,
                    borderRadius: 2,
                  }}>
                    Confirmar
                  </GlassButton>
                </Stack>
              </LogoutConfirmationModal>
            </>
          )}
        </Box>
      </StyledDrawer>

      {/* Menús Desplegables - Solo cuando navbar visible y sidebar cerrado */}
      {!isMobile && !isSidebarOpen && Object.entries(DROPDOWN_MENUS).map(([key, dropdown]) => (
        <StyledPopper
          key={key}
          open={dropdownStates[key].open}
          anchorEl={dropdownStates[key].anchor}
          placement="bottom-end"
        >
          {dropdownStates[key].open && (
            <Paper>
                <ClickAwayListener onClickAway={() => handleDropdownClose(key)}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#010326" textTransform="uppercase" letterSpacing={0.5} fontSize={11} sx={{ mb: 1.5, px: 1 }}>
                      {dropdown.label}
                    </Typography>
                    <List dense sx={{ p: 0 }}>
                      {dropdown.items.map((item) => (
                        <MenuItemStyled
                          key={item.to}
                          component={Link}
                          to={item.to}
                          active={isActiveRoute(item.to)}
                          onClick={() => handleDropdownClose(key)}
                        >
                          <ListItemIcon sx={{ 
                            color: isActiveRoute(item.to) ? "#FFFFFF" : "#475569",
                            minWidth: 32 
                          }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            secondary={item.description}
                            primaryTypographyProps={{
                              fontWeight: 600,
                              fontSize: 14,
                              color: isActiveRoute(item.to) ? "#FFFFFF" : "#010326"
                            }}
                            secondaryTypographyProps={{
                              fontSize: 12,
                              color: isActiveRoute(item.to) ? "rgba(255, 255, 255, 0.8)" : "#64748b"
                            }}
                          />
                        </MenuItemStyled>
                      ))}
                    </List>
                  </Box>
                </ClickAwayListener>
              </Paper>
          )}
        </StyledPopper>
      ))}
    </>
  );
};

export default Navbar;