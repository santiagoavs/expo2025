// components/Editor/EditorToolbar.jsx - TOOLBAR FLOTANTE 3D RESPONSIVO
import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Slider,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Fab,
  Badge,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  X as CloseIcon,
  ArrowLeft as BackIcon,
  FloppyDisk,
  ArrowCounterClockwise,
  ArrowClockwise,
  SquaresFour,
  Magnet,
  DotsThree as MoreIcon,
  TestTube as TestIcon,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  List as MenuIcon,
  Gear as SettingsIcon,
  Trash as DeleteIcon
} from '@phosphor-icons/react';
import { GRADIENTS_3D, SHADOWS_3D, FIXED_COLORS, BORDERS, TRANSITIONS, Z_INDEX } from '../../styles/responsiveTheme';

// ==================== COMPONENTES STYLED FLOTANTES 3D ====================
const FloatingToolbarContainer = styled(Box, {
  name: 'FloatingToolbar-Container',
  slot: 'Root'
})(({ theme, isMobile, isTablet, isDesktop }) => ({
  position: 'fixed',
  top: isMobile ? '16px' : isTablet ? '20px' : '24px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: isMobile ? 'calc(100% - 32px)' : isTablet ? 'auto' : 'auto',
  minWidth: isMobile ? 'auto' : isTablet ? '600px' : '800px',
  maxWidth: isMobile ? 'none' : isTablet ? '90vw' : '1200px',
  height: isMobile ? '56px' : isTablet ? '64px' : '72px',
  padding: isMobile ? theme.spacing(0, 2) : isTablet ? theme.spacing(0, 3) : theme.spacing(0, 4),
  background: GRADIENTS_3D.toolbar,
  borderRadius: BORDERS.radius.xlarge,
  border: `1px solid ${FIXED_COLORS.border}`,
  boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  zIndex: Z_INDEX.toolbar,
  gap: theme.spacing(1),
  overflow: 'hidden',
  transition: TRANSITIONS.normal,
  '&:hover': {
    boxShadow: '0 12px 50px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
    transform: 'translateX(-50%) translateY(-2px)'
  }
}));

const ToolbarContainer = styled(Box, {
  name: 'EditorToolbar-Container',
  slot: 'Root'
})(({ theme, isMobile, isTablet }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: isMobile ? '56px' : isTablet ? '64px' : '72px',
  padding: isMobile ? theme.spacing(0, 2) : isTablet ? theme.spacing(0, 3) : theme.spacing(0, 4),
  background: GRADIENTS_3D.toolbar,
  borderRadius: BORDERS.radius.large,
  border: `1px solid ${FIXED_COLORS.border}`,
  boxShadow: SHADOWS_3D.toolbar,
  backdropFilter: 'blur(10px)',
  zIndex: Z_INDEX.toolbar,
  gap: theme.spacing(1),
  overflow: 'hidden'
}));

const ToolbarButton = styled(IconButton, {
  name: 'EditorToolbar-Button',
  slot: 'Button'
})(({ theme, isMobile, variant = 'default' }) => ({
  padding: isMobile ? theme.spacing(0.75) : theme.spacing(1),
  borderRadius: BORDERS.radius.medium,
  color: FIXED_COLORS.text,
  transition: TRANSITIONS.fast,
  position: 'relative',
  overflow: 'hidden',
  ...(variant === 'primary' && {
    background: GRADIENTS_3D.button,
    color: 'white',
    boxShadow: SHADOWS_3D.button,
    '&:hover': {
      background: GRADIENTS_3D.buttonHover,
      transform: 'translateY(-2px)',
      boxShadow: SHADOWS_3D.buttonHover
    }
  }),
  ...(variant === 'glass' && {
    background: GRADIENTS_3D.glass,
    backdropFilter: 'blur(10px)',
    border: `1px solid rgba(255,255,255,0.1)`,
    '&:hover': {
      background: GRADIENTS_3D.glassHover,
      border: `1px solid rgba(255,255,255,0.2)`,
      transform: 'translateY(-1px)',
      boxShadow: SHADOWS_3D.light
    }
  }),
  ...(variant === 'default' && {
    '&:hover': {
      backgroundColor: 'rgba(31, 100, 191, 0.1)',
      color: FIXED_COLORS.primary,
      transform: 'translateY(-1px)',
      boxShadow: SHADOWS_3D.light
    }
  }),
  ...(variant === 'danger' && {
    background: 'linear-gradient(135deg, #ff4757, #ff3838)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #ff3838, #ff2f2f)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(255, 71, 87, 0.4)'
    },
    '&:disabled': {
      background: 'rgba(255, 71, 87, 0.3)',
      color: 'rgba(255, 255, 255, 0.5)',
      boxShadow: 'none'
    }
  }),
  '&:disabled': {
    color: FIXED_COLORS.textDisabled,
    opacity: 0.5
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    transition: 'left 0.5s ease',
    zIndex: 1
  },
  '&:hover::before': {
    left: '100%'
  }
}));

const ToolbarSection = styled(Box, {
  name: 'EditorToolbar-Section',
  slot: 'Section'
})(({ theme, isMobile }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: isMobile ? theme.spacing(0.5) : theme.spacing(1),
  flexWrap: isMobile ? 'wrap' : 'nowrap'
}));

const ToolbarDivider = styled(Box, {
  name: 'EditorToolbar-Divider',
  slot: 'Divider'
})(({ theme, isMobile }) => ({
  width: '1px',
  height: isMobile ? '20px' : '24px',
  background: `linear-gradient(to bottom, transparent, ${FIXED_COLORS.border}, transparent)`,
  margin: isMobile ? theme.spacing(0, 0.5) : theme.spacing(0, 1),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(to bottom, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.1))`,
    borderRadius: '1px'
  }
}));

const ZoomControl = styled(Box, {
  name: 'ZoomControl',
  slot: 'Container'
})(({ theme, isMobile }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  background: GRADIENTS_3D.glass,
  borderRadius: BORDERS.radius.medium,
  border: `1px solid rgba(255,255,255,0.1)`,
  backdropFilter: 'blur(10px)',
  minWidth: isMobile ? '100px' : '140px'
}));

const StatusChip = styled(Chip, {
  name: 'StatusChip',
  slot: 'Root'
})(({ theme, variant = 'default' }) => ({
  height: '24px',
  fontSize: '0.75rem',
  fontWeight: 600,
  ...(variant === 'success' && {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: 'white',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
  }),
  ...(variant === 'warning' && {
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    color: 'white',
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
  }),
  ...(variant === 'default' && {
    background: GRADIENTS_3D.glass,
    color: FIXED_COLORS.text,
    border: `1px solid rgba(255,255,255,0.1)`
  })
}));

// ==================== COMPONENTE PRINCIPAL FLOTANTE ====================
export const EditorToolbar = ({
  product,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onClose,
  onBack,
  isLoading,
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  onTestImageFlow,
  isMobile = false,
  isTablet = false,
  isDesktop = false,
  onTogglePanel,
  onDelete,
  hasSelectedElements = false
}) => {
  const theme = useTheme();
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  const handleSettingsMenuOpen = (event) => {
    setSettingsMenuAnchor(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsMenuAnchor(null);
  };

  const iconSize = isMobile ? 18 : 20;

  // Usar el contenedor flotante para todos los dispositivos
  const Container = FloatingToolbarContainer;

  return (
    <Container isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop}>
      {/* Sección izquierda - Navegación */}
      <ToolbarSection isMobile={isMobile}>
        <Tooltip title="Volver">
          <ToolbarButton onClick={onBack} size="small" isMobile={isMobile}>
            <BackIcon size={iconSize} />
          </ToolbarButton>
        </Tooltip>
        
        <Typography 
          variant={isMobile ? 'body1' : 'h6'} 
          sx={{ 
            color: FIXED_COLORS.text, 
            fontWeight: 600,
            mx: isMobile ? 1 : 2,
            fontSize: isMobile ? '0.875rem' : '1.125rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: isMobile ? '120px' : '200px'
          }}
        >
          {product?.name || 'Editor Konva'}
        </Typography>
      </ToolbarSection>

      {/* Sección central - Controles principales */}
      <ToolbarSection isMobile={isMobile}>
        {/* Historial - Siempre visible */}
        <Tooltip title="Deshacer">
          <span>
            <ToolbarButton onClick={onUndo} disabled={!canUndo} size="small" isMobile={isMobile} variant="glass">
              <ArrowCounterClockwise size={iconSize} />
            </ToolbarButton>
          </span>
        </Tooltip>
        
        <Tooltip title="Rehacer">
          <span>
            <ToolbarButton onClick={onRedo} disabled={!canRedo} size="small" isMobile={isMobile} variant="glass">
              <ArrowClockwise size={iconSize} />
            </ToolbarButton>
          </span>
        </Tooltip>

        <ToolbarDivider isMobile={isMobile} />

        {/* Botón de eliminar - Solo visible cuando hay elementos seleccionados */}
        {onDelete && (
          <Tooltip title={`Eliminar elemento seleccionado ${hasSelectedElements ? '(habilitado)' : '(deshabilitado)'}`}>
            <span>
              <ToolbarButton 
                onClick={onDelete} 
                disabled={!hasSelectedElements} 
                size="small" 
                isMobile={isMobile} 
                variant="danger"
                sx={{
                  opacity: hasSelectedElements ? 1 : 0.5,
                  '&:hover': {
                    backgroundColor: hasSelectedElements ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                  }
                }}
              >
                <DeleteIcon size={iconSize} />
              </ToolbarButton>
            </span>
          </Tooltip>
        )}

        <ToolbarDivider isMobile={isMobile} />

        {/* Zoom Control - Mejorado */}
        {!isMobile && (
          <ZoomControl isMobile={isMobile}>
            <Tooltip title="Zoom Out">
              <ToolbarButton 
                onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))} 
                size="small" 
                isMobile={isMobile}
                variant="glass"
              >
                <MagnifyingGlassMinus size={iconSize} />
              </ToolbarButton>
            </Tooltip>
            
            <Typography variant="caption" sx={{ 
              color: FIXED_COLORS.text, 
              fontSize: '0.75rem',
              fontWeight: 600,
              minWidth: '40px',
              textAlign: 'center'
            }}>
              {Math.round(zoom * 100)}%
            </Typography>
            
            <Tooltip title="Zoom In">
              <ToolbarButton 
                onClick={() => onZoomChange(Math.min(3, zoom + 0.1))} 
                size="small" 
                isMobile={isMobile}
                variant="glass"
              >
                <MagnifyingGlassPlus size={iconSize} />
              </ToolbarButton>
            </Tooltip>
          </ZoomControl>
        )}

        <ToolbarDivider isMobile={isMobile} />

        {/* Controles de Grid - Solo en tablet/desktop */}
        {!isMobile && (
          <>
            <Tooltip title={showGrid ? "Ocultar Cuadrícula" : "Mostrar Cuadrícula"}>
              <ToolbarButton 
                onClick={() => onToggleGrid(!showGrid)} 
                size="small" 
                isMobile={isMobile}
                variant={showGrid ? "primary" : "glass"}
              >
                <SquaresFour size={iconSize} />
              </ToolbarButton>
            </Tooltip>
            
            <Tooltip title={snapToGrid ? "Desactivar Snap" : "Activar Snap"}>
              <ToolbarButton 
                onClick={() => onToggleSnap(!snapToGrid)} 
                size="small" 
                isMobile={isMobile}
                variant={snapToGrid ? "primary" : "glass"}
              >
                <Magnet size={iconSize} />
              </ToolbarButton>
            </Tooltip>
          </>
        )}

        {/* Estado del editor */}
        {!isMobile && (
          <>
            <ToolbarDivider isMobile={isMobile} />
            <StatusChip 
              label={isLoading ? "Guardando..." : "Listo"} 
              variant={isLoading ? "warning" : "success"}
              size="small"
            />
          </>
        )}
      </ToolbarSection>

      {/* Sección derecha - Acciones */}
      <ToolbarSection isMobile={isMobile}>
        {/* Botón de panel en móvil */}
        {isMobile && onTogglePanel && (
          <Tooltip title="Panel de Herramientas">
            <ToolbarButton onClick={onTogglePanel} size="small" isMobile={isMobile} variant="glass">
              <MenuIcon size={iconSize} />
            </ToolbarButton>
          </Tooltip>
        )}

        {/* Guardar - Siempre visible */}
        <Tooltip title="Guardar">
          <span>
            <ToolbarButton 
              onClick={onSave} 
              disabled={isLoading} 
              size="small" 
              isMobile={isMobile}
              variant="primary"
            >
              <FloppyDisk size={iconSize} />
            </ToolbarButton>
          </span>
        </Tooltip>
        
        {/* Menú de configuración */}
        <Tooltip title="Configuración">
          <ToolbarButton onClick={handleSettingsMenuOpen} size="small" isMobile={isMobile} variant="glass">
            <SettingsIcon size={iconSize} />
          </ToolbarButton>
        </Tooltip>
        
        {/* Menú de configuración */}
        <Menu
          anchorEl={settingsMenuAnchor}
          open={Boolean(settingsMenuAnchor)}
          onClose={handleSettingsMenuClose}
          PaperProps={{
            sx: {
              background: GRADIENTS_3D.surface,
              border: `1px solid ${FIXED_COLORS.border}`,
              boxShadow: SHADOWS_3D.panel,
              borderRadius: BORDERS.radius.medium,
              backdropFilter: 'blur(20px)'
            }
          }}
        >
          <MenuItem onClick={() => { onToggleGrid(!showGrid); handleSettingsMenuClose(); }}>
            <SquaresFour size={16} style={{ marginRight: 8 }} />
            {showGrid ? 'Ocultar' : 'Mostrar'} Cuadrícula
          </MenuItem>
          <MenuItem onClick={() => { onToggleSnap(!snapToGrid); handleSettingsMenuClose(); }}>
            <Magnet size={16} style={{ marginRight: 8 }} />
            {snapToGrid ? 'Desactivar' : 'Activar'} Snap
          </MenuItem>
          {onTestImageFlow && [
            <Divider key="divider" sx={{ backgroundColor: FIXED_COLORS.border }} />,
            <MenuItem key="test-flow" onClick={() => { onTestImageFlow(); handleSettingsMenuClose(); }}>
              <TestIcon size={16} style={{ marginRight: 8 }} />
              Probar Imágenes
            </MenuItem>
          ]}
        </Menu>
        
        {/* Cerrar */}
        <Tooltip title="Cerrar">
          <ToolbarButton onClick={onClose} size="small" isMobile={isMobile} variant="glass">
            <CloseIcon size={iconSize} />
          </ToolbarButton>
        </Tooltip>
      </ToolbarSection>
    </Container>
  );
};

export default EditorToolbar;