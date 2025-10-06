// ACTUALIZACIÓN DE COMPONENTES STYLED CON EFECTOS HOVER

// 1. GlassButton - EFECTO SHIMMER en TODOS los botones
const GlassButton = styled(Button)(({ theme, active, variant, hasActiveItems, open, ...props }) => {
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
    
    // EFECTO SHIMMER - Aplicado a TODOS los botones
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
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 3px 10px rgba(4, 13, 191, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    } : variant === "danger" ? {
      color: "#FFFFFF",
      background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 3px 10px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    } : isHover ? {
      color: "#040DBF",
      background: "rgba(31, 100, 191, 0.15)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(31, 100, 191, 0.25)",
      boxShadow: "0 3px 10px rgba(31, 100, 191, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
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
        boxShadow: "0 4px 12px rgba(4, 13, 191, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      } : variant === "danger" ? {
        background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      } : isHover ? {
        color: "#040DBF",
        background: "rgba(31, 100, 191, 0.15)",
        boxShadow: "0 2px 8px rgba(31, 100, 191, 0.1)",
      } : {
        color: "#040DBF",
        background: "rgba(31, 100, 191, 0.06)",
        boxShadow: "0 2px 6px rgba(31, 100, 191, 0.05)",
      }),
      '&::before': {
        left: '100%'
      }
    },
    
    [theme.breakpoints.down('lg')]: {
      padding: "0px 14px",
      fontSize: 13,
      gap: 6,
      borderRadius: 16,
      height: 44,
      minHeight: 44,
    },
    
    [`@media (max-width: ${customBreakpoints.lg - 1}px)`]: {
      padding: "0px 12px",
      fontSize: 12,
      gap: 4,
      borderRadius: 14,
      height: 40,
      minHeight: 40,
    },
    
    [`@media (max-width: ${customBreakpoints.md - 1}px)`]: {
      padding: "0px 10px",
      fontSize: 11,
      gap: 4,
      borderRadius: 12,
      minWidth: 40,
      height: 36,
      minHeight: 36,
      
      "& .nav-label": {
        display: "none",
      },
      "& .dropdown-label": {
        display: "none",
      },
      "& .dropdown-caret": {
        display: "none",
      },
    },
    
    [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
      padding: "0px 8px",
      minWidth: 36,
      borderRadius: 10,
      height: 32,
      minHeight: 32,
    },
  };
});

// 2. GlassIconButton - EFECTO SHIMMER
const GlassIconButton = styled(IconButton)(({ theme, variant, ...props }) => ({
  width: 48,
  height: 48,
  borderRadius: 18,
  background: variant === "danger" 
    ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
    : "transparent",
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
  border: variant === "danger" 
    ? "1px solid rgba(255, 255, 255, 0.25)"
    : "none",
  color: variant === "danger" ? "#FFFFFF" : "#64748b",
  transition: "all 0.3s ease",
  boxShadow: variant === "danger" 
    ? "0 6px 20px rgba(220, 38, 38, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)"
    : "none",
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
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
    transition: "left 0.5s ease",
    opacity: 0,
    zIndex: 1,
  },
  
  "& > *": {
    position: "relative",
    zIndex: 2,
  },

  "&:hover": {
    background: variant === "danger" 
      ? "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)"
      : "rgba(31, 100, 191, 0.08)",
    borderColor: variant === "danger" 
      ? "rgba(255, 255, 255, 0.25)" 
      : "rgba(31, 100, 191, 0.2)",
    color: variant === "danger" ? "#FFFFFF" : "#040DBF",
    transform: "translateY(-2px)",
    boxShadow: variant === "danger" 
      ? "0 4px 12px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
      : "0 2px 8px rgba(31, 100, 191, 0.1)",
  },

  "&:hover::before": {
    left: "100%",
    opacity: 1,
  },

  [theme.breakpoints.down('lg')]: {
    width: 44,
    height: 44,
    borderRadius: 16,
  },
  [theme.breakpoints.down('md')]: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  [`@media (max-width: ${customBreakpoints.sm - 1}px)`]: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  [`@media (max-width: 375px)`]: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
}));

// 3. UserContainer - HOVER SUTIL (-1px)
const UserContainer = styled(GlassBase)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "6px 12px 6px 6px",
  borderRadius: 18,
  cursor: "pointer",
  transition: "all 0.3s ease",
  background: "transparent",
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
  border: "none",
  boxShadow: "none",

  "&:hover": {
    transform: "translateY(-1px)",
    background: "rgba(31, 100, 191, 0.08)",
    boxShadow: "0 4px 20px rgba(31, 100, 191, 0.08)",
  },

  [theme.breakpoints.down('md')]: {
    padding: "4px",
    gap: 0,
    borderRadius: 14,
    
    "& .user-info": {
      display: "none",
    },
  },
}));

// 4. BrandContainer - HOVER SUTIL (-1px)
const BrandContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 16,
  cursor: "pointer",
  padding: "8px 12px",
  background: "transparent",
  border: "none",
  boxShadow: "none",
  flexShrink: 0,
  borderRadius: 18,
  transition: "all 0.3s ease",

  "&:hover": {
    transform: "translateY(-1px)",
    background: "rgba(31, 100, 191, 0.04)",
    boxShadow: "0 2px 12px rgba(31, 100, 191, 0.06)",
  },

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

// 5. MenuItemStyled - HOVER DISMINUIDO (-2px)
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
  transition: "all 0.3s ease",
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
    transform: "translateY(-2px) translateX(4px)",
    boxShadow: active 
      ? "0 8px 28px rgba(4, 13, 191, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
      : "0 4px 20px rgba(31, 100, 191, 0.08)",
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

// 6. SidebarButton - EFECTO SHIMMER
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

// 7. StyledAvatar - HOVER SUTIL (-1px) ajustado
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
    transform: "translateY(-1px) scale(1.02)",
    boxShadow: "0 4px 16px rgba(4, 13, 191, 0.2)",
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

// RESUMEN DE EFECTOS APLICADOS:
// ===================================
// 
// 1. EFECTO SHIMMER (::before con gradiente animado):
//    - GlassButton (todos los botones de navegación)
//    - GlassIconButton (iconos de hamburguesa, etc)
//    - SidebarButton (botones del sidebar)
//
// 2. HOVER SUTIL (translateY -1px):
//    - UserContainer (contenedor de usuario)
//    - BrandContainer (logo y marca)
//    - StyledAvatar (avatar de usuario)
//
// 3. HOVER DISMINUIDO (translateY -2px):
//    - MenuItemStyled (items del menú en sidebar y dropdowns)
//    - GlassButton en hover
//    - GlassIconButton en hover
//    - SidebarButton en hover
//
// Todos los componentes tienen:
// - Transición suave: 0.3s ease
// - Box-shadow ajustado según el tipo de hover
// - z-index correctamente aplicado para efecto shimmer