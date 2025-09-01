// src/components/FabricDesignEditor/components/ToolsPanel.jsx
import React, { useState, useCallback } from 'react';
import {
  Box, Paper, Typography, IconButton, Tooltip, Divider, useTheme,
  useMediaQuery, Collapse, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Badge, Chip, Fade, Zoom, Slide, Accordion, AccordionSummary,
  AccordionDetails, ToggleButton, ToggleButtonGroup, Button, Avatar,
  ListItemAvatar, ListItemSecondaryAction, Switch, FormControlLabel
} from '@mui/material';
import {
  TextAa as TextIcon, Image as ImageIcon, Shapes as ShapesIcon,
  Sparkle as EffectsIcon, Stack as LayersIcon, Palette as ColorIcon,
  ArrowsOut as TransformIcon, Scissors as CropIcon, Copy as DuplicateIcon,
  Trash as DeleteIcon, Lock as LockIcon, LockOpen as UnlockIcon,
  Eye as VisibleIcon, EyeSlash as HiddenIcon, ArrowUp as BringForwardIcon,
  ArrowDown as SendBackwardIcon, ArrowUp as BringToFrontIcon,
  ArrowDown as SendToBackIcon, SquaresFour as GridIcon, Ruler as RulerIcon,
  MagnifyingGlassPlus as ZoomIcon, Hand as PanIcon, Cursor as SelectIcon,
  PaintBrush as BrushIcon, Gradient as GradientIcon, Drop as DropIcon,
  Sun as LightIcon, Moon as DarkIcon, Star as StarIcon, Heart as HeartIcon,
  Lightning as LightningIcon, Fire as FireIcon, Snowflake as SnowflakeIcon,
  Leaf as LeafIcon, Flower as FlowerIcon, Crown as CrownIcon,
  Diamond as DiamondIcon, Circle as CircleIcon, Square as SquareIcon,
  Triangle as TriangleIcon, Hexagon as HexagonIcon, Octagon as OctagonIcon,
  Pentagon as PentagonIcon, Package, Warning, CheckCircle, Info,
  Plus as AddIcon, Minus as RemoveIcon, Gear as SettingsIcon
} from '@phosphor-icons/react';

// ================ PANEL DE HERRAMIENTAS ================
export const ToolsPanel = ({
  activeTool = 'select',
  onToolChange,
  onAddText,
  onAddImage,
  onAddShape,
  onAddEffect,
  onToggleGrid,
  onToggleRulers,
  onToggleSnap,
  showGrid = false,
  showRulers = false,
  snapToGrid = false,
  snapToObjects = false,
  selectedElements = [],
  onDuplicate,
  onDelete,
  onLock,
  onUnlock,
  onShow,
  onHide,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onGroup,
  onUngroup,
  isGrouped = false,
  canGroup = false,
  canUngroup = false,
  onClearCanvas,
  onResetCanvas,
  onImportDesign,
  onExportDesign,
  onSaveTemplate,
  onLoadTemplate,
  templates = [],
  recentDesigns = [],
  onLoadRecentDesign,
  onClearHistory,
  isCollapsed = false,
  onToggleCollapse,
  onSettings,
  onHelp,
  onAbout
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Estados locales
  const [expandedSections, setExpandedSections] = useState({
    tools: true,
    shapes: true,
    effects: true,
    layers: true,
    view: true,
    history: false,
    templates: false
  });

  const [activeCategory, setActiveCategory] = useState('tools');

  // Handlers
  const handleSectionToggle = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleToolSelect = useCallback((tool) => {
    if (onToolChange) {
      onToolChange(tool);
    }
  }, [onToolChange]);

  const handleAddText = useCallback(() => {
    if (onAddText) {
      onAddText();
    }
  }, [onAddText]);

  const handleAddImage = useCallback(() => {
    if (onAddImage) {
      onAddImage();
    }
  }, [onAddImage]);

  const handleAddShape = useCallback((shapeType) => {
    if (onAddShape) {
      onAddShape(shapeType);
    }
  }, [onAddShape]);

  const handleAddEffect = useCallback((effectType) => {
    if (onAddEffect) {
      onAddEffect(effectType);
    }
  }, [onAddEffect]);

  const handleToggleGrid = useCallback(() => {
    if (onToggleGrid) {
      onToggleGrid();
    }
  }, [onToggleGrid]);

  const handleToggleRulers = useCallback(() => {
    if (onToggleRulers) {
      onToggleRulers();
    }
  }, [onToggleRulers]);

  const handleDuplicate = useCallback(() => {
    if (onDuplicate) {
      onDuplicate();
    }
  }, [onDuplicate]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  const handleLock = useCallback(() => {
    if (onLock) {
      onLock();
    }
  }, [onLock]);

  const handleUnlock = useCallback(() => {
    if (onUnlock) {
      onUnlock();
    }
  }, [onUnlock]);

  const handleShow = useCallback(() => {
    if (onShow) {
      onShow();
    }
  }, [onShow]);

  const handleHide = useCallback(() => {
    if (onHide) {
      onHide();
    }
  }, [onHide]);

  const handleBringForward = useCallback(() => {
    if (onBringForward) {
      onBringForward();
    }
  }, [onBringForward]);

  const handleSendBackward = useCallback(() => {
    if (onSendBackward) {
      onSendBackward();
    }
  }, [onSendBackward]);

  const handleBringToFront = useCallback(() => {
    if (onBringToFront) {
      onBringToFront();
    }
  }, [onBringToFront]);

  const handleSendToBack = useCallback(() => {
    if (onSendToBack) {
      onSendToBack();
    }
  }, [onSendToBack]);

  const handleGroup = useCallback(() => {
    if (onGroup) {
      onGroup();
    }
  }, [onGroup]);

  const handleUngroup = useCallback(() => {
    if (onUngroup) {
      onUngroup();
    }
  }, [onUngroup]);

  const handleClearCanvas = useCallback(() => {
    if (onClearCanvas) {
      onClearCanvas();
    }
  }, [onClearCanvas]);

  const handleResetCanvas = useCallback(() => {
    if (onResetCanvas) {
      onResetCanvas();
    }
  }, [onResetCanvas]);

  const handleImportDesign = useCallback(() => {
    if (onImportDesign) {
      onImportDesign();
    }
  }, [onImportDesign]);

  const handleExportDesign = useCallback(() => {
    if (onExportDesign) {
      onExportDesign();
    }
  }, [onExportDesign]);

  const handleSaveTemplate = useCallback(() => {
    if (onSaveTemplate) {
      onSaveTemplate();
    }
  }, [onSaveTemplate]);

  const handleLoadTemplate = useCallback((template) => {
    if (onLoadTemplate) {
      onLoadTemplate(template);
    }
  }, [onLoadTemplate]);

  const handleLoadRecentDesign = useCallback((design) => {
    if (onLoadRecentDesign) {
      onLoadRecentDesign(design);
    }
  }, [onLoadRecentDesign]);

  const handleClearHistory = useCallback(() => {
    if (onClearHistory) {
      onClearHistory();
    }
  }, [onClearHistory]);

  const handleSettings = useCallback(() => {
    if (onSettings) {
      onSettings();
    }
  }, [onSettings]);

  const handleHelp = useCallback(() => {
    if (onHelp) {
      onHelp();
    }
  }, [onHelp]);

  const handleAbout = useCallback(() => {
    if (onAbout) {
      onAbout();
    }
  }, [onAbout]);

  // Configuración de herramientas
  const tools = [
    { id: 'select', icon: CursorIcon, label: 'Seleccionar', shortcut: 'V' },
    { id: 'pan', icon: HandIcon, label: 'Mover', shortcut: 'H' },
    { id: 'zoom', icon: ZoomIcon, label: 'Zoom', shortcut: 'Z' },
    { id: 'text', icon: TextIcon, label: 'Texto', shortcut: 'T' },
    { id: 'image', icon: ImageIcon, label: 'Imagen', shortcut: 'I' },
    { id: 'shapes', icon: ShapesIcon, label: 'Formas', shortcut: 'S' },
    { id: 'effects', icon: EffectsIcon, label: 'Efectos', shortcut: 'E' },
    { id: 'brush', icon: BrushIcon, label: 'Pincel', shortcut: 'B' }
  ];

  // Configuración de formas
  const shapes = [
    { id: 'rectangle', icon: SquareIcon, label: 'Rectángulo', shortcut: 'R' },
    { id: 'circle', icon: CircleIcon, label: 'Círculo', shortcut: 'C' },
    { id: 'triangle', icon: TriangleIcon, label: 'Triángulo', shortcut: 'T' },
    { id: 'star', icon: StarIcon, label: 'Estrella', shortcut: 'S' },
    { id: 'heart', icon: HeartIcon, label: 'Corazón', shortcut: 'H' },
    { id: 'hexagon', icon: HexagonIcon, label: 'Hexágono', shortcut: 'X' },
    { id: 'octagon', icon: OctagonIcon, label: 'Octágono', shortcut: 'O' },
    { id: 'pentagon', icon: PentagonIcon, label: 'Pentágono', shortcut: 'P' }
  ];

  // Configuración de efectos
  const effects = [
    { id: 'shadow', icon: DropIcon, label: 'Sombra', shortcut: 'D' },
    { id: 'glow', icon: LightIcon, label: 'Resplandor', shortcut: 'G' },
    { id: 'blur', icon: SnowflakeIcon, label: 'Desenfoque', shortcut: 'B' },
    { id: 'noise', icon: LightningIcon, label: 'Ruido', shortcut: 'N' },
    { id: 'gradient', icon: GradientIcon, label: 'Gradiente', shortcut: 'L' },
    { id: 'pattern', icon: FlowerIcon, label: 'Patrón', shortcut: 'P' }
  ];

  // Renderizado para móviles
  if (isSmallScreen) {
    return (
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderRadius: '16px 16px 0 0',
          backgroundColor: 'white',
          borderTop: `1px solid ${theme.palette.divider}`,
          maxHeight: '60vh',
          overflow: 'hidden'
        }}
      >
        {/* Header móvil */}
        <Box
          sx={{
            p: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Herramientas
          </Typography>
          <IconButton
            size="small"
            onClick={onToggleCollapse}
            sx={{ color: theme.palette.text.secondary }}
          >
            {isCollapsed ? <AddIcon size={20} /> : <RemoveIcon size={20} />}
          </IconButton>
        </Box>

        {/* Contenido móvil */}
        <Collapse in={!isCollapsed}>
          <Box sx={{ p: 1, maxHeight: '50vh', overflow: 'auto' }}>
            {/* Herramientas principales */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Herramientas
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {tools.slice(0, 4).map((tool) => (
                  <Tooltip key={tool.id} title={`${tool.label} (${tool.shortcut})`}>
                    <IconButton
                      size="small"
                      onClick={() => handleToolSelect(tool.id)}
                      sx={{
                        backgroundColor: activeTool === tool.id ? theme.palette.primary.main : 'transparent',
                        color: activeTool === tool.id ? 'white' : theme.palette.text.secondary,
                        '&:hover': {
                          backgroundColor: activeTool === tool.id ? theme.palette.primary.dark : `${theme.palette.primary.main}10`
                        }
                      }}
                    >
                      <tool.icon size={18} />
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            {/* Acciones rápidas */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Acciones
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title="Añadir texto">
                  <IconButton size="small" onClick={handleAddText} sx={{ color: theme.palette.primary.main }}>
                    <TextIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Añadir imagen">
                  <IconButton size="small" onClick={handleAddImage} sx={{ color: theme.palette.primary.main }}>
                    <ImageIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Duplicar">
                  <IconButton size="small" onClick={handleDuplicate} disabled={selectedElements.length === 0}>
                    <DuplicateIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={handleDelete} disabled={selectedElements.length === 0}>
                    <DeleteIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Vista */}
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Vista
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title="Mostrar/Ocultar cuadrícula">
                  <IconButton
                    size="small"
                    onClick={handleToggleGrid}
                    sx={{
                      color: showGrid ? theme.palette.primary.main : theme.palette.text.secondary,
                      backgroundColor: showGrid ? `${theme.palette.primary.main}10` : 'transparent'
                    }}
                  >
                    <GridIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Mostrar/Ocultar reglas">
                  <IconButton
                    size="small"
                    onClick={handleToggleRulers}
                    sx={{
                      color: showRulers ? theme.palette.primary.main : theme.palette.text.secondary,
                      backgroundColor: showRulers ? `${theme.palette.primary.main}10` : 'transparent'
                    }}
                  >
                    <RulerIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Paper>
    );
  }

  // Renderizado para pantallas medianas y grandes
  return (
    <Paper
      elevation={0}
      sx={{
        width: isCollapsed ? '60px' : '280px',
        height: '100%',
        backgroundColor: 'white',
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create(['width'], {
          duration: theme.transitions.duration.standard
        }),
        overflow: 'hidden'
      }}
    >
      {/* Header del panel */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px'
        }}
      >
        {!isCollapsed && (
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Herramientas
          </Typography>
        )}
        <IconButton
          size="small"
          onClick={onToggleCollapse}
          sx={{ color: theme.palette.text.secondary }}
        >
          {isCollapsed ? <AddIcon size={20} /> : <RemoveIcon size={20} />}
        </IconButton>
      </Box>

      {/* Contenido del panel */}
      <Box sx={{ flex: 1, overflow: 'auto', p: isCollapsed ? 1 : 2 }}>
        {isCollapsed ? (
          // Vista colapsada
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {tools.slice(0, 6).map((tool) => (
              <Tooltip key={tool.id} title={`${tool.label} (${tool.shortcut})`} placement="right">
                <IconButton
                  size="small"
                  onClick={() => handleToolSelect(tool.id)}
                  sx={{
                    backgroundColor: activeTool === tool.id ? theme.palette.primary.main : 'transparent',
                    color: activeTool === tool.id ? 'white' : theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: activeTool === tool.id ? theme.palette.primary.dark : `${theme.palette.primary.main}10`
                    }
                  }}
                >
                  <tool.icon size={20} />
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        ) : (
          // Vista expandida
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Herramientas principales */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
                Herramientas
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {tools.map((tool) => (
                  <Tooltip key={tool.id} title={`${tool.label} (${tool.shortcut})`}>
                    <Button
                      variant={activeTool === tool.id ? "contained" : "outlined"}
                      startIcon={<tool.icon size={18} />}
                      onClick={() => handleToolSelect(tool.id)}
                      size="small"
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1
                      }}
                    >
                      {tool.label}
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Formas */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
                Formas
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {shapes.slice(0, 6).map((shape) => (
                  <Tooltip key={shape.id} title={`${shape.label} (${shape.shortcut})`}>
                    <Button
                      variant="outlined"
                      startIcon={<shape.icon size={16} />}
                      onClick={() => handleAddShape(shape.id)}
                      size="small"
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1
                      }}
                    >
                      {shape.label}
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Efectos */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
                Efectos
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {effects.slice(0, 4).map((effect) => (
                  <Tooltip key={effect.id} title={`${effect.label} (${effect.shortcut})`}>
                    <Button
                      variant="outlined"
                      startIcon={<effect.icon size={16} />}
                      onClick={() => handleAddEffect(effect.id)}
                      size="small"
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1
                      }}
                    >
                      {effect.label}
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Acciones rápidas */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
                Acciones
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<TextIcon size={18} />}
                  onClick={handleAddText}
                  size="small"
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Añadir Texto
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ImageIcon size={18} />}
                  onClick={handleAddImage}
                  size="small"
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Añadir Imagen
                </Button>
              </Box>
            </Box>

            {/* Elementos seleccionados */}
            {selectedElements.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
                    Elementos ({selectedElements.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DuplicateIcon size={18} />}
                      onClick={handleDuplicate}
                      size="small"
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        fontSize: '0.875rem'
                      }}
                    >
                      Duplicar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon size={18} />}
                      onClick={handleDelete}
                      size="small"
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        color: theme.palette.error.main,
                        borderColor: theme.palette.error.main
                      }}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Box>
              </>
            )}

            <Divider />

            {/* Vista */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
                Vista
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showGrid}
                      onChange={handleToggleGrid}
                      size="small"
                    />
                  }
                  label="Cuadrícula"
                  sx={{ fontSize: '0.875rem' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showRulers}
                      onChange={handleToggleRulers}
                      size="small"
                    />
                  }
                  label="Reglas"
                  sx={{ fontSize: '0.875rem' }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Utilidades */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}>
                Utilidades
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon size={18} />}
                  onClick={handleSettings}
                  size="small"
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Configuración
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Info size={18} />}
                  onClick={handleHelp}
                  size="small"
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Ayuda
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

