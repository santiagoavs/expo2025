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
import Swal from "sweetalert2";

// ============================================
// BREAKPOINTS CUSTOMIZADOS PARA MÓVILES
// ============================================

const customBreakpoints = {
  xs: 0,      // 0px - 479px (móviles pequeños)
  sm: 480,    // 480px - 767px (móviles grandes)
  md: 768,    // 768px - 1023px (tablets)
  lg: 1024,   // 1024px - 1439px (desktop pequeño)
  xl: 1440,   // 1440px+ (desktop grande)
};

// ============================================
// ANIMACIONES Y KEYFRAMES
// ============================================

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

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(31, 100, 191, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(31, 100, 191, 0.1);
  }
`;

const statusPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
`;

// ============================================
// STYLED COMPONENTS RESPONSIVE
// ============================================

const StyledAppBar = styled(AppBar)(({ theme, scrolled }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 72,
  background: scrolled 
    ? "rgba(255, 255, 255, 0.98)" 
    : "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  borderBottom: "1px solid rgba(31, 100, 191, 0.12)",
  boxShadow: scrolled 
    ? "0 8px 32px rgba(1, 3, 38, 0.12)" 
    : "0 4px 20px rgba(1, 3, 38, 0.08)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  zIndex: 1300,
  
  // Tablets (768px - 1023px)
  [theme.breakpoints.down('lg')]: {
    height: 68,
  },
  
  // Móviles grandes (480px - 767px)
  [theme.breakpoints.down('md')]: {
    height: 64,
  },
  
  // Móviles pequeños (0px - 479px)
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    height: 60,
  },
  
  // iPhone SE y dispositivos muy pequeños
  [`@media (max-width: 375px)`]: {
    height: 56,
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  height: "100%",
  padding: "0 32px",
  justifyContent: "space-between",
  minHeight: "unset !important",
  
  // Desktop pequeño
  [theme.breakpoints.down('xl')]: {
    padding: "0 24px",
  },
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    padding: "0 20px",
  },
  
  // Móviles grandes
  [theme.breakpoints.down('md')]: {
    padding: "0 16px",
  },
  
  // Móviles pequeños
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    padding: "0 12px",
  },
  
  // iPhone SE y dispositivos muy pequeños
  [`@media (max-width: 375px)`]: {
    padding: "0 8px",
  },
}));

const BrandContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 16,
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  borderRadius: 16,
  padding: "8px 12px",
  flex: "0 0 auto",
  
  "&:hover": {
    transform: "translateY(-1px)",
    background: "rgba(31, 100, 191, 0.04)",
  },
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    gap: 14,
    padding: "6px 10px",
  },
  
  // Móviles grandes
  [theme.breakpoints.down('md')]: {
    gap: 12,
    padding: "4px 8px",
  },
  
  // Móviles pequeños
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
  background: "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)",
  boxShadow: "0 4px 12px rgba(4, 13, 191, 0.24)",
  transition: "all 0.3s ease",
  flexShrink: 0,
  
  "&:hover": {
    transform: "scale(1.05) rotate(2deg)",
    boxShadow: "0 6px 20px rgba(4, 13, 191, 0.32)",
  },
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    width: 44,
    height: 44,
    borderRadius: 11,
  },
  
  // Móviles grandes
  [theme.breakpoints.down('md')]: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  
  // Móviles pequeños
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    width: 36,
    height: 36,
    borderRadius: 9,
  },
  
  // iPhone SE
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
  
  // Móviles muy pequeños - ocultar texto secundario
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
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    fontSize: 22,
  },
  
  // Móviles grandes
  [theme.breakpoints.down('md')]: {
    fontSize: 20,
  },
  
  // Móviles pequeños
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    fontSize: 18,
  },
  
  // iPhone SE
  [`@media (max-width: 375px)`]: {
    fontSize: 16,
  },
  
  // Dispositivos muy pequeños
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
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    fontSize: 11,
  },
  
  // Móviles grandes
  [theme.breakpoints.down('md')]: {
    fontSize: 10,
  },
  
  // Móviles pequeños
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    fontSize: 9,
  },
  
  // iPhone SE
  [`@media (max-width: 375px)`]: {
    fontSize: 8,
  },
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  background: "rgba(248, 250, 252, 0.8)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  borderRadius: 20,
  padding: "6px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    gap: 3,
    padding: "5px",
    borderRadius: 18,
  },
  
  // Móviles grandes
  [theme.breakpoints.down('md')]: {
    gap: 2,
    padding: "4px",
    borderRadius: 16,
  },
}));

const NavItem = styled(Button)(({ theme, active }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  color: active ? "#FFFFFF" : "#64748b",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 16,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  background: active 
    ? "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)" 
    : "transparent",
  minWidth: "auto",
  textTransform: "none",
  boxShadow: active ? "0 4px 12px rgba(4, 13, 191, 0.3)" : "none",
  whiteSpace: "nowrap",
  
  "&:hover": {
    background: active 
      ? "linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)"
      : "rgba(31, 100, 191, 0.08)",
    color: active ? "#FFFFFF" : "#040DBF",
    transform: "translateY(-1px)",
    boxShadow: active 
      ? "0 6px 16px rgba(4, 13, 191, 0.4)"
      : "0 2px 8px rgba(31, 100, 191, 0.15)",
  },
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    padding: "8px 14px",
    fontSize: 13,
    gap: 6,
    borderRadius: 14,
  },
  
  // Móviles grandes - solo iconos
  [theme.breakpoints.down('md')]: {
    padding: "8px 10px",
    fontSize: 12,
    gap: 4,
    borderRadius: 12,
    minWidth: 40,
    
    "& .nav-label": {
      display: "none",
    },
  },
}));

const MoreButton = styled(Button)(({ theme, open }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  color: "#64748b",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 16,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  background: open ? "rgba(31, 100, 191, 0.08)" : "transparent",
  minWidth: "auto",
  textTransform: "none",
  whiteSpace: "nowrap",
  
  "&:hover": {
    background: "rgba(31, 100, 191, 0.08)",
    color: "#040DBF",
    transform: "translateY(-1px)",
  },
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    padding: "8px 14px",
    fontSize: 13,
    gap: 6,
    borderRadius: 14,
  },
  
  // Móviles grandes - solo iconos
  [theme.breakpoints.down('md')]: {
    padding: "8px 10px",
    fontSize: 12,
    gap: 4,
    borderRadius: 12,
    minWidth: 40,
    
    "& .more-label": {
      display: "none",
    },
    
    "& .more-caret": {
      display: "none",
    },
  },
}));

const UserContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "6px 12px 6px 6px",
  background: "linear-gradient(135deg, rgba(4, 13, 191, 0.04) 0%, rgba(31, 100, 191, 0.02) 100%)",
  border: "1px solid rgba(31, 100, 191, 0.12)",
  borderRadius: 24,
  transition: "all 0.3s ease",
  cursor: "pointer",
  
  "&:hover": {
    background: "linear-gradient(135deg, rgba(4, 13, 191, 0.08) 0%, rgba(31, 100, 191, 0.04) 100%)",
    borderColor: "rgba(31, 100, 191, 0.2)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(4, 13, 191, 0.15)",
  },
  
  // Móviles grandes - solo avatar
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
  },
  
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 4px 16px rgba(4, 13, 191, 0.4)",
  },
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    width: 38,
    height: 38,
    fontSize: 15,
    
    "&::after": {
      width: 11,
      height: 11,
    },
  },
  
  // Móviles
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

const ActionButton = styled(IconButton)(({ theme, variant }) => ({
  width: 44,
  height: 44,
  borderRadius: 12,
  background: variant === "danger" ? "rgba(239, 68, 68, 0.08)" : "rgba(248, 250, 252, 0.8)",
  border: `1px solid ${variant === "danger" ? "rgba(239, 68, 68, 0.2)" : "rgba(226, 232, 240, 0.8)"}`,
  color: variant === "danger" ? "#dc2626" : "#64748b",
  transition: "all 0.3s ease",
  backdropFilter: "blur(8px)",
  
  "&:hover": {
    background: variant === "danger" ? "rgba(239, 68, 68, 0.12)" : "rgba(31, 100, 191, 0.08)",
    borderColor: variant === "danger" ? "rgba(239, 68, 68, 0.3)" : "rgba(31, 100, 191, 0.2)",
    color: variant === "danger" ? "#dc2626" : "#040DBF",
    transform: "translateY(-1px)",
    boxShadow: `0 4px 12px ${variant === "danger" ? "rgba(239, 68, 68, 0.2)" : "rgba(31, 100, 191, 0.15)"}`,
  },
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  
  // Móviles
  [theme.breakpoints.down('md')]: {
    width: 36,
    height: 36,
    borderRadius: 9,
  },
}));

const MobileButton = styled(IconButton)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "rgba(248, 250, 252, 0.8)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  color: "#64748b",
  transition: "all 0.3s ease",
  backdropFilter: "blur(8px)",
  
  "&:hover": {
    background: "rgba(31, 100, 191, 0.08)",
    borderColor: "rgba(31, 100, 191, 0.2)",
    color: "#040DBF",
    transform: "scale(1.05)",
  },
  
  // Tablets
  [theme.breakpoints.down('lg')]: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  
  // Móviles
  [theme.breakpoints.down('md')]: {
    width: 36,
    height: 36,
    borderRadius: 9,
  },
  
  // Móviles pequeños
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
}));

const StyledPopper = styled(Popper)(({ theme }) => ({
  zIndex: 1400,
  
  "& .MuiPaper-root": {
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(24px)",
    borderRadius: 20,
    border: "1px solid rgba(31, 100, 191, 0.12)",
    boxShadow: "0 12px 40px rgba(1, 3, 38, 0.15)",
    padding: "12px",
    minWidth: 280,
    animation: `${slideInFromTop} 0.3s ease-out`,
    marginTop: "8px !important",
    
    // Tablets
    [theme.breakpoints.down('lg')]: {
      minWidth: 260,
      borderRadius: 18,
      padding: "10px",
    },
    
    // Móviles
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
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(24px)",
    border: "none",
    boxShadow: "-12px 0 40px rgba(1, 3, 38, 0.15)",
    
    // Tablets grandes
    [theme.breakpoints.down('lg')]: {
      width: 360,
    },
    
    // Tablets pequeñas
    [theme.breakpoints.down('md')]: {
      width: 320,
    },
    
    // Móviles grandes
    [`@media (max-width: ${customBreakpoints.md - 1}px)`]: {
      width: "100%",
      maxWidth: "100vw",
    },
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "24px 24px 20px",
  borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
  
  // Móviles
  [theme.breakpoints.down('md')]: {
    padding: "20px 20px 16px",
  },
  
  // Móviles pequeños
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    padding: "16px 16px 12px",
  },
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: 24,
  overflowY: "auto",
  
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(248, 250, 252, 0.8)",
    borderRadius: 3,
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(148, 163, 184, 0.8)",
    borderRadius: 3,
    "&:hover": {
      background: "rgba(100, 116, 139, 0.9)",
    },
  },
  
  // Móviles
  [theme.breakpoints.down('md')]: {
    padding: "20px",
    gap: 20,
  },
  
  // Móviles pequeños
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    padding: "16px",
    gap: 16,
  },
}));

const MenuSection = styled(Box)(({ theme }) => ({
  padding: "16px",
  borderRadius: 16,
  background: "linear-gradient(135deg, rgba(4, 13, 191, 0.02) 0%, rgba(31, 100, 191, 0.01) 100%)",
  border: "1px solid rgba(31, 100, 191, 0.08)",
  
  // Móviles
  [theme.breakpoints.down('md')]: {
    padding: "12px",
    borderRadius: 14,
  },
}));

// Reemplaza tu MenuItemStyled actual con esto:

const MenuItemStyled = styled(ListItemButton, {
  // Filtrar props que no deben pasarse al DOM
  shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
  borderRadius: 12,
  padding: "12px 16px",
  marginBottom: 4,
  background: active ? "rgba(31, 100, 191, 0.1)" : "transparent",
  border: `1px solid ${active ? "rgba(31, 100, 191, 0.2)" : "transparent"}`,
  transition: "all 0.3s ease",
  
  "&:hover": {
    background: "rgba(31, 100, 191, 0.08)",
    borderColor: "rgba(31, 100, 191, 0.15)",
    transform: "translateX(4px)",
  },
  
  "&:last-child": {
    marginBottom: 0,
  },
  
  // Móviles
  [theme.breakpoints.down('md')]: {
    padding: "10px 14px",
    borderRadius: 10,
  },
  
  // Móviles pequeños
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    padding: "8px 12px",
    borderRadius: 8,
  },
}));

// ============================================
// CONFIGURACIÓN DE NAVEGACIÓN
// ============================================

/**
 * PÁGINAS PRINCIPALES - Aparecen en el navbar
 * Modifica este array para cambiar las páginas principales
 */
const MAIN_NAVIGATION = [
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
];

/**
 * NAVEGACIÓN SECUNDARIA - Aparece en el menú "Más"
 * Organizada por categorías para mejor UX
 */
const SECONDARY_NAVIGATION = {
  management: {
    title: "Gestión",
    items: [
      {
        to: "/category-management",
        label: "Categorías",
        icon: <Folders size={18} weight="duotone" />,
        description: "Organización de productos"
      },
      {
        to: "/reviews",
        label: "Reseñas",
        icon: <Star size={18} weight="duotone" />,
        description: "Opiniones de clientes"
      },
    ]
  },
  tools: {
    title: "Herramientas",
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
  analytics: {
    title: "Reportes y Análisis",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: <House size={18} weight="duotone" />,
        description: "Panel principal"
      },
      {
        to: "/payment-dashboard",
        label: "Dashboard de Pagos",
        icon: <CreditCard size={18} weight="duotone" />,
        description: "Control de pagos"
      },
      {
        to: "/reports",
        label: "Reportes",
        icon: <FileText size={18} weight="duotone" />,
        description: "Informes detallados"
      },
      {
        to: "/address-dashboard",
        label: "Dashboard de Direcciones",
        icon: <MapPin size={18} weight="duotone" />,
        description: "Gestión de direcciones"
      },
    ]
  }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const theme = useTheme();
  
  // Breakpoints responsivos mejorados
  const isXs = useMediaQuery(`(max-width: ${customBreakpoints.sm - 1}px)`); // 0-479px
  const isSm = useMediaQuery(`(min-width: ${customBreakpoints.sm}px) and (max-width: ${customBreakpoints.md - 1}px)`); // 480-767px
  const isMd = useMediaQuery(`(min-width: ${customBreakpoints.md}px) and (max-width: ${customBreakpoints.lg - 1}px)`); // 768-1023px
  const isLg = useMediaQuery(`(min-width: ${customBreakpoints.lg}px) and (max-width: ${customBreakpoints.xl - 1}px)`); // 1024-1439px
  const isMobile = useMediaQuery(`(max-width: ${customBreakpoints.md - 1}px)`); // 0-767px (todos los móviles)
  const isTablet = useMediaQuery(`(min-width: ${customBreakpoints.md}px) and (max-width: ${customBreakpoints.lg - 1}px)`); // 768-1023px

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determinar elementos visibles según dispositivo (RESPONSIVE PERFECTO)
  const getVisibleItemsCount = () => {
    if (isXs || isSm) return 0; // Móviles: solo hamburguesa
    if (isMd) return 2; // Tablets: 2 links + "Más"
    if (isLg) return 3; // Desktop pequeño: 3 links + "Más"
    return 4; // Desktop grande: 4 links completos
  };

  const visibleItemsCount = getVisibleItemsCount();
  const visibleItems = MAIN_NAVIGATION.slice(0, visibleItemsCount);
  const hasMoreItems = visibleItemsCount < MAIN_NAVIGATION.length || Object.keys(SECONDARY_NAVIGATION).length > 0;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMoreClick = (event) => {
    setMoreMenuAnchor(event.currentTarget);
    setMoreMenuOpen(!moreMenuOpen);
  };

  const handleMoreClose = () => {
    setMoreMenuOpen(false);
    setMoreMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleMoreClose();
    
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas salir del sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#040DBF',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: '#FFFFFF',
      color: '#010326',
      borderRadius: '16px',
    });

    if (result.isConfirmed) {
      try {
        await logout();
        
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Sesión cerrada correctamente',
          showConfirmButton: false,
          timer: 2000,
          toast: true,
          background: '#FFFFFF',
          color: '#010326',
        });
        
        navigate('/login');
      } catch (error) {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Error al cerrar sesión',
          showConfirmButton: false,
          timer: 2000,
          toast: true,
          background: '#fef2f2',
          color: '#dc2626'
        });
      }
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Navbar Principal */}
      <StyledAppBar scrolled={isScrolled} elevation={0}>
        <StyledToolbar>
          {/* Logo y Marca */}
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

          {/* Navegación Desktop - Solo visible en tablets y desktop */}
          {!isMobile && (
            <NavContainer>
              {visibleItems.map((item) => (
                <NavItem
                  key={item.to}
                  component={Link}
                  to={item.to}
                  active={isActiveRoute(item.to)}
                  startIcon={item.icon}
                  title={item.description}
                >
                  <span className="nav-label">{item.label}</span>
                </NavItem>
              ))}
              
              {hasMoreItems && (
                <MoreButton
                  onClick={handleMoreClick}
                  open={moreMenuOpen}
                  startIcon={<ListIcon size={18} weight="duotone" />}
                  endIcon={
                    <span className="more-caret">
                      {moreMenuOpen ? <CaretUp size={14} /> : <CaretDown size={14} />}
                    </span>
                  }
                  title="Ver más opciones"
                >
                  <span className="more-label">Más</span>
                </MoreButton>
              )}
            </NavContainer>
          )}

          {/* Acciones del Navbar */}
          <Box display="flex" alignItems="center" gap={1.5}>
            {/* Usuario - Solo visible en desktop grande */}
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

            {/* Botones de Acción - Solo visible en desktop */}
            {!isMobile && !isTablet && (
              <Stack direction="row" spacing={1}>
                <ActionButton component={Link} to="/profile" title="Perfil">
                  <Gear size={20} weight="duotone" />
                </ActionButton>
                <ActionButton variant="danger" onClick={handleLogout} title="Cerrar sesión">
                  <SignOut size={20} weight="duotone" />
                </ActionButton>
              </Stack>
            )}

            {/* Botón Móvil - Siempre visible */}
            <MobileButton onClick={toggleSidebar}>
              <ListIcon size={20} weight="duotone" />
            </MobileButton>
          </Box>
        </StyledToolbar>
      </StyledAppBar>

      {/* Menú Desplegable "Más" - Solo para desktop/tablet */}
      {!isMobile && (
        <StyledPopper
          open={moreMenuOpen}
          anchorEl={moreMenuAnchor}
          placement="bottom-end"
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={300}>
              <Paper>
                <ClickAwayListener onClickAway={handleMoreClose}>
                  <Box>
                    {Object.entries(SECONDARY_NAVIGATION).map(([key, section]) => (
                      <MenuSection key={key}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="#475569"
                          textTransform="uppercase"
                          letterSpacing={0.5}
                          fontSize={11}
                          sx={{ mb: 1.5, px: 1 }}
                        >
                          {section.title}
                        </Typography>
                        <List dense sx={{ p: 0 }}>
                          {section.items.map((item) => (
                            <MenuItemStyled
                              key={item.to}
                              component={Link}
                              to={item.to}
                              active={isActiveRoute(item.to)}
                              onClick={handleMoreClose}
                            >
                              <ListItemIcon sx={{ 
                                color: isActiveRoute(item.to) ? "#040DBF" : "#64748b",
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
                                  color: isActiveRoute(item.to) ? "#040DBF" : "#334155"
                                }}
                                secondaryTypographyProps={{
                                  fontSize: 12,
                                  color: "#64748b"
                                }}
                              />
                            </MenuItemStyled>
                          ))}
                        </List>
                      </MenuSection>
                    ))}
                    
                    {/* Enlaces principales ocultos en responsive */}
                    {MAIN_NAVIGATION.slice(visibleItemsCount).length > 0 && (
                      <MenuSection>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="#475569"
                          textTransform="uppercase"
                          letterSpacing={0.5}
                          fontSize={11}
                          sx={{ mb: 1.5, px: 1 }}
                        >
                          Navegación Principal
                        </Typography>
                        <List dense sx={{ p: 0 }}>
                          {MAIN_NAVIGATION.slice(visibleItemsCount).map((item) => (
                            <MenuItemStyled
                              key={item.to}
                              component={Link}
                              to={item.to}
                              active={isActiveRoute(item.to)}
                              onClick={handleMoreClose}
                            >
                              <ListItemIcon sx={{ 
                                color: isActiveRoute(item.to) ? "#040DBF" : "#64748b",
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
                                  color: isActiveRoute(item.to) ? "#040DBF" : "#334155"
                                }}
                                secondaryTypographyProps={{
                                  fontSize: 12,
                                  color: "#64748b"
                                }}
                              />
                            </MenuItemStyled>
                          ))}
                        </List>
                      </MenuSection>
                    )}
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </StyledPopper>
      )}

      {/* Sidebar Móvil */}
      <StyledDrawer
        anchor="right"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{
          keepMounted: true, // Mejor performance en móviles
        }}
      >
        {/* Header del Sidebar */}
        <DrawerHeader>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)",
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 2,
              }}
            >
              D
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#010326" fontSize={20}>
                DIAMBARS
              </Typography>
              <Typography variant="caption" color="#64748b" fontWeight={500}>
                administración
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={toggleSidebar}
            sx={{
              width: 40,
              height: 40,
              background: "rgba(4, 13, 191, 0.08)",
              color: "#040DBF",
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                background: "#040DBF",
                color: "#FFFFFF",
                transform: "rotate(90deg) scale(1.05)",
              },
            }}
          >
            <X size={20} weight="bold" />
          </IconButton>
        </DrawerHeader>

        {/* Contenido del Sidebar */}
        <DrawerContent>
          {/* Información del Usuario */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: "linear-gradient(135deg, rgba(4, 13, 191, 0.04) 0%, rgba(31, 100, 191, 0.02) 100%)",
              border: "1px solid rgba(31, 100, 191, 0.12)",
              borderRadius: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, rgba(4, 13, 191, 0.06) 0%, rgba(31, 100, 191, 0.03) 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(4, 13, 191, 0.1)",
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <StyledAvatar sx={{ width: 56, height: 56, fontSize: 22 }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </StyledAvatar>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={700} color="#010326" fontSize={18}>
                  {user?.name || 'Usuario'}
                </Typography>
                <Chip
                  label={user?.type || 'admin'}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #040DBF 0%, #1F64BF 100%)",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                />
              </Box>
            </Box>
          </Paper>

          {/* Navegación Principal */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="#475569"
              textTransform="uppercase"
              letterSpacing={1}
              sx={{ mb: 2, px: 1 }}
            >
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
                    <ListItemIcon
                      sx={{
                        color: isActiveRoute(item.to) ? "#040DBF" : "#64748b",
                        minWidth: 40,
                        fontSize: 20,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: isActiveRoute(item.to) ? "#040DBF" : "#334155",
                      }}
                      secondaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#64748b",
                      }}
                    />
                  </MenuItemStyled>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Navegación Secundaria */}
          {Object.entries(SECONDARY_NAVIGATION).map(([key, section], sectionIndex) => (
            <Box key={key}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="#475569"
                textTransform="uppercase"
                letterSpacing={1}
                sx={{ mb: 2, px: 1 }}
              >
                {section.title}
              </Typography>
              <List sx={{ p: 0 }}>
                {section.items.map((item, itemIndex) => (
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
                      <ListItemIcon
                        sx={{
                          color: isActiveRoute(item.to) ? "#040DBF" : "#64748b",
                          minWidth: 40,
                          fontSize: 20,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.description}
                        primaryTypographyProps={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: isActiveRoute(item.to) ? "#040DBF" : "#334155",
                        }}
                        secondaryTypographyProps={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#64748b",
                        }}
                      />
                    </MenuItemStyled>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}

          {/* Acciones */}
          <Box sx={{ mt: "auto", pt: 3, borderTop: "1px solid rgba(226, 232, 240, 0.8)" }}>
            <Stack spacing={2}>
              <Button
                component={Link}
                to="/profile"
                onClick={toggleSidebar}
                startIcon={<Gear size={20} weight="duotone" />}
                sx={{
                  justifyContent: "flex-start",
                  py: 2,
                  px: 3,
                  borderRadius: 2,
                  background: "rgba(248, 250, 252, 0.8)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  color: "#334155",
                  fontWeight: 600,
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(31, 100, 191, 0.08)",
                    borderColor: "rgba(31, 100, 191, 0.2)",
                    color: "#040DBF",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Perfil
              </Button>
              
              <Button
                onClick={handleLogout}
                startIcon={<SignOut size={20} weight="duotone" />}
                sx={{
                  justifyContent: "flex-start",
                  py: 2,
                  px: 3,
                  borderRadius: 2,
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#dc2626",
                  fontWeight: 600,
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(239, 68, 68, 0.12)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Cerrar Sesión
              </Button>
            </Stack>
          </Box>
        </DrawerContent>
      </StyledDrawer>
    </>
  );
};

export default Navbar;