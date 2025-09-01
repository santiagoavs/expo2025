// src/components/FabricDesignEditor/components/EditorHeader.jsx
import React, { useState, useCallback } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Button, Box, Chip,
  Tooltip, Divider, useTheme, useMediaQuery, Fade, Zoom,
  Menu, MenuItem, ListItemIcon, ListItemText, Badge
} from '@mui/material';
import {
  X as CloseIcon, FloppyDisk as SaveIcon, Download as ExportIcon,
  Share as ShareIcon, Gear as SettingsIcon, Question as HelpIcon,
  MagnifyingGlassPlus as ZoomInIcon, MagnifyingGlassMinus as ZoomOutIcon,
  ArrowCounterClockwise as ResetIcon, SquaresFour as GridIcon,
  Eye as PreviewIcon, Package, Warning, CheckCircle, Info,
  House as HomeIcon, ArrowLeft as BackIcon, Bookmark as BookmarkIcon,
  Clock as HistoryIcon, Palette as DesignIcon, Image as ImageIcon
} from '@phosphor-icons/react';

// ================ HEADER DEL EDITOR ================
export const EditorHeader = ({
  product,
  onClose,
  onSave,
  onExport,
  onShare,
  onSettings,
  onHelp,
  onBack,
  onPreview,
  onReset,
  onToggleGrid,
  onToggleRulers,
  zoomLevel = 100,
  onZoomChange,
  isModified = false,
  isSaving = false,
  hasUnsavedChanges = false,
  designName = '',
  onDesignNameChange,
  showGrid = false,
  showRulers = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onShowHistory,
  onShowBookmarks,
  onShowTemplates
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Estados locales
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempDesignName, setTempDesignName] = useState(designName);

  // Handlers
  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
    }
  }, [onSave]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    }
    handleMenuClose();
  }, [onExport, handleMenuClose]);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare();
    }
    handleMenuClose();
  }, [onShare, handleMenuClose]);

  const handleSettings = useCallback(() => {
    if (onSettings) {
      onSettings();
    }
    handleMenuClose();
  }, [onSettings, handleMenuClose]);

  const handleHelp = useCallback(() => {
    if (onHelp) {
      onHelp();
    }
    handleMenuClose();
  }, [onHelp, handleMenuClose]);

  const handleZoomIn = useCallback(() => {
    if (onZoomChange) {
      onZoomChange(Math.min(zoomLevel + 25, 400));
    }
  }, [onZoomChange, zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (onZoomChange) {
      onZoomChange(Math.max(zoomLevel - 25, 25));
    }
  }, [onZoomChange, zoomLevel]);

  const handleResetZoom = useCallback(() => {
    if (onZoomChange) {
      onZoomChange(100);
    }
  }, [onZoomChange]);

  const handleNameEdit = useCallback(() => {
    setIsEditingName(true);
    setTempDesignName(designName);
  }, [designName]);

  const handleNameSave = useCallback(() => {
    if (onDesignNameChange && tempDesignName.trim()) {
      onDesignNameChange(tempDesignName.trim());
    }
    setIsEditingName(false);
  }, [onDesignNameChange, tempDesignName]);

  const handleNameCancel = useCallback(() => {
    setTempDesignName(designName);
    setIsEditingName(false);
  }, [designName]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      handleNameSave();
    } else if (event.key === 'Escape') {
      handleNameCancel();
    }
  }, [handleNameSave, handleNameCancel]);

  // Renderizado condicional para móviles
  if (isSmallScreen) {
    return (
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          backgroundColor: 'white',
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: '56px'
        }}
      >
        <Toolbar sx={{ minHeight: '56px', px: 1 }}>
          {/* Botón de cerrar */}
          <Tooltip title="Cerrar editor">
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: theme.palette.error.main }}
            >
              <CloseIcon size={20} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Título del producto */}
          <Typography
            variant="body2"
            noWrap
            sx={{
              flex: 1,
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: '0.875rem'
            }}
          >
            {product?.name || 'Editor de Diseño'}
          </Typography>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Botón de guardar */}
          <Tooltip title="Guardar diseño">
            <IconButton
              onClick={handleSave}
              disabled={isSaving}
              size="small"
              sx={{
                color: isModified ? theme.palette.success.main : theme.palette.primary.main,
                backgroundColor: isModified ? `${theme.palette.success.main}10` : 'transparent'
              }}
            >
              <SaveIcon size={20} />
            </IconButton>
          </Tooltip>

          {/* Menú de opciones */}
          <Tooltip title="Más opciones">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ color: theme.palette.text.secondary }}
            >
              <SettingsIcon size={20} />
            </IconButton>
          </Tooltip>

          {/* Menú desplegable */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleExport}>
              <ListItemIcon>
                <ExportIcon size={18} />
              </ListItemIcon>
              <ListItemText>Exportar</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleShare}>
              <ListItemIcon>
                <ShareIcon size={18} />
              </ListItemIcon>
              <ListItemText>Compartir</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <SettingsIcon size={18} />
              </ListItemIcon>
              <ListItemText>Configuración</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleHelp}>
              <ListItemIcon>
                <HelpIcon size={18} />
              </ListItemIcon>
              <ListItemText>Ayuda</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    );
  }

  // Renderizado para pantallas medianas y grandes
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        backgroundColor: 'white',
        borderBottom: `1px solid ${theme.palette.divider}`,
        minHeight: '64px'
      }}
    >
      <Toolbar sx={{ minHeight: '64px', px: 2 }}>
        {/* Navegación izquierda */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onBack && (
            <Tooltip title="Volver">
              <IconButton
                onClick={onBack}
                size="small"
                sx={{ color: theme.palette.text.secondary }}
              >
                <BackIcon size={20} />
              </IconButton>
            </Tooltip>
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Icono del producto */}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <Package size={18} />
          </Box>

          {/* Información del producto */}
          <Box sx={{ ml: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: '0.875rem'
              }}
            >
              {product?.name || 'Editor de Diseño'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.75rem'
              }}
            >
              {product?.category?.name || 'Sin categoría'}
            </Typography>
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

        {/* Nombre del diseño */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
          {isEditingName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <input
                value={tempDesignName}
                onChange={(e) => setTempDesignName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleNameSave}
                autoFocus
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  backgroundColor: 'transparent',
                  minWidth: '150px'
                }}
              />
              <IconButton
                size="small"
                onClick={handleNameSave}
                sx={{ color: theme.palette.success.main }}
              >
                <CheckCircle size={16} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleNameCancel}
                sx={{ color: theme.palette.error.main }}
              >
                <CloseIcon size={16} />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
                onClick={handleNameEdit}
              >
                {designName || 'Diseño sin nombre'}
              </Typography>
              <IconButton
                size="small"
                onClick={handleNameEdit}
                sx={{ color: theme.palette.text.secondary }}
              >
                <DesignIcon size={16} />
              </IconButton>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Controles de zoom */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Tooltip title="Zoom out (Ctrl + -)">
            <IconButton
              onClick={handleZoomOut}
              size="small"
              disabled={zoomLevel <= 25}
              sx={{ color: theme.palette.text.secondary }}
            >
              <ZoomOutIcon size={18} />
            </IconButton>
          </Tooltip>

          <Typography
            variant="body2"
            sx={{
              minWidth: '50px',
              textAlign: 'center',
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            {zoomLevel}%
          </Typography>

          <Tooltip title="Zoom in (Ctrl + +)">
            <IconButton
              onClick={handleZoomIn}
              size="small"
              disabled={zoomLevel >= 400}
              sx={{ color: theme.palette.text.secondary }}
            >
              <ZoomInIcon size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset zoom (Ctrl + 0)">
            <IconButton
              onClick={handleResetZoom}
              size="small"
              disabled={zoomLevel === 100}
              sx={{ color: theme.palette.text.secondary }}
            >
              <ResetIcon size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Controles de vista */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Tooltip title="Mostrar/Ocultar cuadrícula">
            <IconButton
              onClick={onToggleGrid}
              size="small"
              sx={{
                color: showGrid ? theme.palette.primary.main : theme.palette.text.secondary,
                backgroundColor: showGrid ? `${theme.palette.primary.main}10` : 'transparent'
              }}
            >
              <GridIcon size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Vista previa">
            <IconButton
              onClick={onPreview}
              size="small"
              sx={{ color: theme.palette.text.secondary }}
            >
              <PreviewIcon size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Historial */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Tooltip title="Deshacer (Ctrl + Z)">
            <IconButton
              onClick={onUndo}
              disabled={!canUndo}
              size="small"
              sx={{
                color: canUndo ? theme.palette.text.primary : theme.palette.text.disabled
              }}
            >
              <HistoryIcon size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Rehacer (Ctrl + Y)">
            <IconButton
              onClick={onRedo}
              disabled={!canRedo}
              size="small"
              sx={{
                color: canRedo ? theme.palette.text.primary : theme.palette.text.disabled
              }}
            >
              <Clock size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Acciones principales */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Botón de guardar */}
          <Button
            variant={isModified ? "contained" : "outlined"}
            startIcon={<SaveIcon size={18} />}
            onClick={handleSave}
            disabled={isSaving}
            sx={{
              minWidth: '100px',
              backgroundColor: isModified ? theme.palette.success.main : 'transparent',
              color: isModified ? 'white' : theme.palette.primary.main,
              borderColor: isModified ? theme.palette.success.main : theme.palette.primary.main,
              '&:hover': {
                backgroundColor: isModified ? theme.palette.success.dark : `${theme.palette.primary.main}10`
              }
            }}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>

          {/* Indicador de cambios */}
          {hasUnsavedChanges && (
            <Chip
              icon={<Warning size={16} />}
              label="Sin guardar"
              size="small"
              color="warning"
              variant="outlined"
            />
          )}

          {/* Botón de exportar */}
          <Tooltip title="Exportar diseño">
            <IconButton
              onClick={handleExport}
              size="small"
              sx={{ color: theme.palette.text.secondary }}
            >
              <ExportIcon size={20} />
            </IconButton>
          </Tooltip>

          {/* Botón de cerrar */}
          <Tooltip title="Cerrar editor">
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: theme.palette.error.main }}
            >
              <CloseIcon size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

