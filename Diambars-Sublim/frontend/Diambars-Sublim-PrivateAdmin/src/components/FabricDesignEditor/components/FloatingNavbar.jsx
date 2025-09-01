import React, { useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Chip,
  Fade,
  Grow,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  X as CloseIcon,
  ArrowLeft as BackIcon,
  FloppyDisk, 
  ArrowCounterClockwise as UndoIcon,
  ArrowClockwise as RedoIcon,
  Download, 
  Share, 
  Gear as SettingsIcon,
  MagnifyingGlassPlus as ZoomInIcon,
  MagnifyingGlassMinus as ZoomOutIcon,
  SquaresFour,
  Ruler,
  Camera
} from '@phosphor-icons/react';

// Navbar flotante optimizado con posicionamiento relativo al canvas
const OptimizedFloatingNavbar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1050, // Mayor z-index para evitar solapamientos
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '8px 16px',
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  borderRadius: '28px',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 0 rgba(255, 255, 255, 0.15)
  `,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  maxWidth: '90vw', // Prevenir overflow en pantallas pequeñas
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.18)',
    transform: 'translateX(-50%) translateY(-2px)',
    boxShadow: `
      0 12px 40px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
    `
  },

  // Responsive design
  [theme.breakpoints.down('md')]: {
    padding: '6px 12px',
    gap: '2px'
  },

  [theme.breakpoints.down('sm')]: {
    padding: '4px 8px',
    flexWrap: 'wrap',
    maxWidth: '95vw'
  }
}));

// Botones optimizados con mejor rendimiento
const OptimizedNavButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'active'
})(({ theme, variant = 'default', active = false }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '14px',
  background: variant === 'primary' 
    ? 'linear-gradient(135deg, rgba(31, 100, 191, 0.25), rgba(3, 44, 166, 0.15))'
    : active
      ? 'rgba(31, 100, 191, 0.15)'
      : 'rgba(255, 255, 255, 0.08)',
  border: variant === 'primary'
    ? '1px solid rgba(31, 100, 191, 0.35)'
    : active
      ? '1px solid rgba(31, 100, 191, 0.25)'
      : '1px solid rgba(255, 255, 255, 0.15)',
  color: variant === 'primary' || active ? '#1F64BF' : '#010326',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', // Transición más rápida
  position: 'relative',
  
  '&:hover': {
    background: variant === 'primary'
      ? 'linear-gradient(135deg, rgba(31, 100, 191, 0.35), rgba(3, 44, 166, 0.25))'
      : 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-1px) scale(1.02)', // Efecto más sutil
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
  },
  
  '&:active': {
    transform: 'translateY(0px) scale(0.98)',
    transition: 'all 0.1s'
  },

  '&:disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
    transform: 'none'
  },

  // Responsive
  [theme.breakpoints.down('md')]: {
    width: '36px',
    height: '36px'
  },

  [theme.breakpoints.down('sm')]: {
    width: '32px',
    height: '32px'
  }
}));

// Separador optimizado
const NavSeparator = styled(Box)(({ theme }) => ({
  width: '1px',
  height: '24px',
  background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.25), transparent)',
  margin: '0 4px',
  flexShrink: 0,

  [theme.breakpoints.down('sm')]: {
    display: 'none' // Ocultar separadores en móvil
  }
}));

// Indicador de estado optimizado
const StatusChip = styled(Chip)(({ status, theme }) => ({
  height: '28px',
  fontSize: '0.75rem',
  fontWeight: 600,
  background: status === 'saved' 
    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1))'
    : status === 'saving'
      ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 152, 0, 0.1))'
      : 'linear-gradient(135deg, rgba(244, 67, 54, 0.2), rgba(244, 67, 54, 0.1))',
  color: status === 'saved' ? '#4CAF50' 
        : status === 'saving' ? '#FF9800' 
        : '#F44336',
  border: `1px solid ${status === 'saved' ? 'rgba(76, 175, 80, 0.3)' 
                      : status === 'saving' ? 'rgba(255, 152, 0, 0.3)' 
                      : 'rgba(244, 67, 54, 0.3)'}`,
  borderRadius: '14px',
  backdropFilter: 'blur(10px)',
  animation: status === 'saving' ? 'pulse 1.5s ease-in-out infinite' : 'none',
  
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.7 }
  },

  // Responsive
  [theme.breakpoints.down('sm')]: {
    height: '24px',
    fontSize: '0.7rem',
    minWidth: 'auto'
  }
}));

const FloatingNavbar = ({ 
  onSave, 
  onClose,
  onBack, // Nueva prop para volver al modal anterior
  onUndo, 
  onRedo,
  canUndo = false,
  canRedo = false,
  onZoomIn,
  onZoomOut,
  onExport,
  onShare,
  onSettings,
  isSaving = false,
  zoomLevel = 100,
  showGrid = false,
  showRulers = false,
  onToggleGrid,
  onToggleRulers
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estado optimizado con useMemo
  const saveStatus = useMemo(() => {
    return isSaving ? 'saving' : 'saved';
  }, [isSaving]);

  // Handlers optimizados con useCallback
  const handleSave = useCallback(async () => {
    if (onSave && !isSaving) {
      try {
        await onSave();
      } catch (error) {
        console.error('Error al guardar:', error);
      }
    }
  }, [onSave, isSaving]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  const handleUndo = useCallback(() => {
    if (canUndo && onUndo) {
      onUndo();
    }
  }, [canUndo, onUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo && onRedo) {
      onRedo();
    }
  }, [canRedo, onRedo]);

  // Grupos de botones para mejor organización en mobile
  const navigationButtons = useMemo(() => (
    <Grow in timeout={200}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {onBack && (
          <Tooltip title="Volver" arrow placement="bottom">
            <OptimizedNavButton onClick={handleBack} size="small">
              <BackIcon size={isMobile ? 16 : 18} />
            </OptimizedNavButton>
          </Tooltip>
        )}
        
        <Tooltip title="Cerrar Editor" arrow placement="bottom">
          <OptimizedNavButton onClick={handleClose} size="small">
            <CloseIcon size={isMobile ? 16 : 18} />
          </OptimizedNavButton>
        </Tooltip>
      </Box>
    </Grow>
  ), [onBack, handleBack, handleClose, isMobile]);

  const editingButtons = useMemo(() => (
    <Grow in timeout={300}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Deshacer (Ctrl+Z)" arrow placement="bottom">
          <OptimizedNavButton
            disabled={!canUndo}
            onClick={handleUndo}
            size="small"
          >
            <UndoIcon size={isMobile ? 16 : 18} />
          </OptimizedNavButton>
        </Tooltip>
        
        <Tooltip title="Rehacer (Ctrl+Y)" arrow placement="bottom">
          <OptimizedNavButton
            disabled={!canRedo}
            onClick={handleRedo}
            size="small"
          >
            <RedoIcon size={isMobile ? 16 : 18} />
          </OptimizedNavButton>
        </Tooltip>
      </Box>
    </Grow>
  ), [canUndo, canRedo, handleUndo, handleRedo, isMobile]);

  const viewButtons = useMemo(() => (
    <Grow in timeout={400}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Zoom +" arrow placement="bottom">
          <OptimizedNavButton onClick={onZoomIn} size="small">
            <ZoomInIcon size={isMobile ? 16 : 18} />
          </OptimizedNavButton>
        </Tooltip>
        
        <Tooltip title="Zoom -" arrow placement="bottom">
          <OptimizedNavButton onClick={onZoomOut} size="small">
            <ZoomOutIcon size={isMobile ? 16 : 18} />
          </OptimizedNavButton>
        </Tooltip>
        
        {!isMobile && (
          <>
            <Tooltip title="Cuadrícula" arrow placement="bottom">
              <OptimizedNavButton 
                active={showGrid}
                onClick={onToggleGrid} 
                size="small"
              >
                <SquaresFour size={18} />
              </OptimizedNavButton>
            </Tooltip>
            
            <Tooltip title="Reglas" arrow placement="bottom">
              <OptimizedNavButton 
                active={showRulers}
                onClick={onToggleRulers} 
                size="small"
              >
                <Ruler size={18} />
              </OptimizedNavButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Grow>
  ), [onZoomIn, onZoomOut, showGrid, showRulers, onToggleGrid, onToggleRulers, isMobile]);

  const actionButtons = useMemo(() => (
    <Grow in timeout={500}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Guardar (Ctrl+S)" arrow placement="bottom">
          <OptimizedNavButton
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            size="small"
          >
            <FloppyDisk size={isMobile ? 16 : 18} />
          </OptimizedNavButton>
        </Tooltip>
        
        {!isMobile && (
          <>
            <Tooltip title="Exportar" arrow placement="bottom">
              <OptimizedNavButton onClick={onExport} size="small">
                <Download size={18} />
              </OptimizedNavButton>
            </Tooltip>
            
            {!isTablet && (
              <>
                <Tooltip title="Compartir" arrow placement="bottom">
                  <OptimizedNavButton onClick={onShare} size="small">
                    <Share size={18} />
                  </OptimizedNavButton>
                </Tooltip>
                
                <Tooltip title="Configuración" arrow placement="bottom">
                  <OptimizedNavButton onClick={onSettings} size="small">
                    <SettingsIcon size={18} />
                  </OptimizedNavButton>
                </Tooltip>
              </>
            )}
          </>
        )}
      </Box>
    </Grow>
  ), [handleSave, isSaving, onExport, onShare, onSettings, isMobile, isTablet]);

  return (
    <OptimizedFloatingNavbar>
      {/* Navegación */}
      {navigationButtons}
      
      {!isMobile && <NavSeparator />}
      
      {/* Edición */}
      {editingButtons}
      
      {!isMobile && <NavSeparator />}
      
      {/* Vista */}
      {viewButtons}
      
      {!isMobile && <NavSeparator />}
      
      {/* Acciones */}
      {actionButtons}
      
      {!isMobile && <NavSeparator />}
      
      {/* Estado */}
      <Fade in timeout={600}>
        <StatusChip
          label={isSaving ? 'Guardando...' : 'Guardado'}
          status={saveStatus}
          size="small"
        />
      </Fade>

      {/* Indicador de zoom (solo desktop) */}
      {!isMobile && !isTablet && (
        <Fade in timeout={700}>
          <Box sx={{ 
            ml: 1, 
            px: 1, 
            py: 0.5, 
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#010326'
          }}>
            {zoomLevel}%
          </Box>
        </Fade>
      )}
    </OptimizedFloatingNavbar>
  );
};

export default FloatingNavbar;