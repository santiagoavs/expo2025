import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Divider, 
  IconButton, 
  Tooltip,
  Slider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Fade,
  Grow,
  Zoom,
  Collapse,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TextAa as TextIcon,
  Image as ImageIcon,
  Shapes as ShapesIcon,
  Palette as ColorIcon,
  Sparkle as EffectsIcon,
  Square as RectIcon,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  Hexagon as HexagonIcon,
  ArrowsOut,
  ArrowCounterClockwise,
  Lock,
  Copy,
  Trash,
  Plus,
  Minus,
  Camera,
  Download,
  CopySimple,
  Eye,
  EyeSlash
} from '@phosphor-icons/react';
import Swal from 'sweetalert2';

// Panel principal con glassmorphism mejorado
const GlassPanel = styled(Box)(({ theme }) => ({
  width: '320px',
  height: '100%',
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: `
    0 12px 40px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1)
  `,
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    zIndex: 1
  }
}));

// Tabs personalizados con glassmorphism
const GlassTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    background: 'linear-gradient(90deg, #1F64BF, #032CA6)',
    height: '3px',
    borderRadius: '2px'
  },
  '& .MuiTab-root': {
    color: '#010326',
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'none',
    minHeight: '48px',
    borderRadius: '12px 12px 0 0',
    transition: 'all 0.3s ease',
    
    '&.Mui-selected': {
      color: '#1F64BF',
      background: 'rgba(31, 100, 191, 0.1)'
    },
    
    '&:hover': {
      background: 'rgba(31, 100, 191, 0.05)'
    }
  }
});

// Contenedor de herramientas
const ToolContainer = styled(Box)({
  padding: '20px 0',
  minHeight: '400px'
});

// Grupo de herramientas
const ToolGroup = styled(Box)({
  marginBottom: '24px',
  padding: '16px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
});

// Título del grupo
const GroupTitle = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#010326',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
});

// Grid de herramientas
const ToolGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '12px'
});

// Botón de herramienta
const ToolButton = styled(IconButton)(({ active, variant = 'default' }) => ({
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  background: active
    ? 'linear-gradient(135deg, rgba(31, 100, 191, 0.2), rgba(3, 44, 166, 0.15))'
    : variant === 'primary'
      ? 'linear-gradient(135deg, rgba(31, 100, 191, 0.15), rgba(3, 44, 166, 0.1))'
      : 'rgba(255, 255, 255, 0.1)',
  border: active
    ? '2px solid rgba(31, 100, 191, 0.4)'
    : variant === 'primary'
      ? '1px solid rgba(31, 100, 191, 0.3)'
      : '1px solid rgba(255, 255, 255, 0.2)',
  color: active ? '#1F64BF' : variant === 'primary' ? '#1F64BF' : '#010326',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: active
      ? 'linear-gradient(135deg, rgba(31, 100, 191, 0.25), rgba(3, 44, 166, 0.2))'
      : variant === 'primary'
        ? 'linear-gradient(135deg, rgba(31, 100, 191, 0.2), rgba(3, 44, 166, 0.15))'
        : 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: active
      ? '0 8px 25px rgba(31, 100, 191, 0.3)'
      : '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  
  '&:active': {
    transform: 'translateY(0px) scale(0.95)'
  }
}));

// Control deslizante personalizado
const CustomSlider = styled(Slider)({
  '& .MuiSlider-track': {
    background: 'linear-gradient(90deg, #1F64BF, #032CA6)',
    height: '6px',
    borderRadius: '3px'
  },
  '& .MuiSlider-rail': {
    background: 'rgba(255, 255, 255, 0.2)',
    height: '6px',
    borderRadius: '3px'
  },
  '& .MuiSlider-thumb': {
    width: '20px',
    height: '20px',
    background: 'linear-gradient(135deg, #1F64BF, #032CA6)',
    border: '2px solid #FFFFFF',
    boxShadow: '0 4px 12px rgba(31, 100, 191, 0.3)',
    
    '&:hover': {
      boxShadow: '0 6px 16px rgba(31, 100, 191, 0.4)'
    }
  }
});

// Select personalizado
const CustomSelect = styled(Select)({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#010326',
    
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)'
    },
    
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.2)',
      borderColor: '#1F64BF'
    }
  },
  
  '& .MuiSelect-icon': {
    color: '#1F64BF'
  }
});

const ToolsPanelGlass = ({ 
  selectedZone, 
  selectedZoneData, 
  onToolSelect,
  onAction,
  activeTool = 'select',
  onPropertyChange
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [textProperties, setTextProperties] = useState({
    fontSize: 24,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    color: '#010326'
  });
  const [shapeProperties, setShapeProperties] = useState({
    fill: '#1F64BF',
    stroke: '#032CA6',
    strokeWidth: 2,
    opacity: 1
  });
  const [imageProperties, setImageProperties] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleToolSelect = (toolType, options = {}) => {
    onToolSelect(toolType, { zoneId: selectedZone, ...options });
  };

  const handleAction = (actionType) => {
    onAction(actionType, selectedZone);
  };

  const handlePropertyChange = (property, value) => {
    if (onPropertyChange) {
      onPropertyChange(property, value);
    }
  };

  // Función para mostrar SweetAlert
  const showAlert = (title, message, icon = 'info') => {
    Swal.fire({
      title,
      text: message,
      icon,
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      confirmButtonColor: '#1F64BF',
      borderRadius: '20px'
    });
  };

  const shapes = [
    { id: 'rectangle', icon: RectIcon, label: 'Rectángulo' },
    { id: 'circle', icon: CircleIcon, label: 'Círculo' },
    { id: 'triangle', icon: TriangleIcon, label: 'Triángulo' },
    { id: 'star', icon: StarIcon, label: 'Estrella' },
    { id: 'heart', icon: HeartIcon, label: 'Corazón' },
    { id: 'hexagon', icon: HexagonIcon, label: 'Hexágono' }
  ];

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
    'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'
  ];

  if (!selectedZone || !selectedZoneData) {
    return (
      <GlassPanel>
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          color: '#666',
          flexDirection: 'column',
          gap: 2
        }}>
          <ShapesIcon size={48} style={{ opacity: 0.5 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#010326' }}>
            Herramientas de Diseño
          </Typography>
          <Typography variant="body2">
            Selecciona una zona para comenzar a diseñar
          </Typography>
        </Box>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          sx={{ 
            color: '#010326', 
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <ShapesIcon size={20} />
          Herramientas
        </Typography>
        <Typography variant="subtitle2" sx={{ color: '#1F64BF' }}>
          Zona: {selectedZoneData.displayName || selectedZoneData.name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>
          Herramientas disponibles para esta zona
        </Typography>
      </Box>

      {/* Tabs de herramientas */}
      <GlassTabs 
        value={activeTab} 
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Básicas" />
        <Tab label="Texto" />
        <Tab label="Formas" />
        <Tab label="Imagen" />
        <Tab label="Efectos" />
        <Tab label="Avanzadas" />
      </GlassTabs>

      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Contenido de las tabs */}
      <ToolContainer>
        {/* Tab: Herramientas Básicas */}
        {activeTab === 0 && (
          <Fade in timeout={300}>
            <Box>
              <ToolGroup>
                <GroupTitle>
                  <ArrowsOut size={18} />
                  Selección y Navegación
                </GroupTitle>
                <ToolGrid>
                  <ToolButton
                    active={activeTool === 'select'}
                    onClick={() => handleToolSelect('select')}
                  >
                    <ArrowsOut size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleToolSelect('zoom-in')}
                  >
                    <Plus size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleToolSelect('zoom-out')}
                  >
                    <Minus size={24} />
                  </ToolButton>
                </ToolGrid>
              </ToolGroup>

              <ToolGroup>
                <GroupTitle>
                  <Camera size={18} />
                  Captura y Exportación
                </GroupTitle>
                <ToolGrid>
                  <ToolButton
                    onClick={() => handleAction('capture')}
                  >
                    <Camera size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleAction('export')}
                  >
                    <Download size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleAction('import')}
                  >
                    <Download size={24} />
                  </ToolButton>
                </ToolGrid>
              </ToolGroup>
            </Box>
          </Fade>
        )}

        {/* Tab: Herramientas de Texto */}
        {activeTab === 1 && (
          <Fade in timeout={400}>
            <Box>
              <ToolGroup>
                <GroupTitle>
                  <TextIcon size={18} />
                  Herramientas de Texto
                </GroupTitle>
                <ToolGrid>
                  <ToolButton
                    active={activeTool === 'text'}
                    onClick={() => handleToolSelect('text')}
                    variant="primary"
                  >
                    <TextIcon size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleToolSelect('text-edit')}
                  >
                    <Copy size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleAction('text-to-path')}
                  >
                    <Sparkle size={24} />
                  </ToolButton>
                </ToolGrid>
              </ToolGroup>

              <ToolGroup>
                <GroupTitle>
                  <TextIcon size={18} />
                  Propiedades del Texto
                </GroupTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Fuente</InputLabel>
                    <CustomSelect
                      value={textProperties.fontFamily}
                      onChange={(e) => {
                        setTextProperties({...textProperties, fontFamily: e.target.value});
                        handlePropertyChange('fontFamily', e.target.value);
                      }}
                    >
                      {fonts.map(font => (
                        <MenuItem key={font} value={font}>{font}</MenuItem>
                      ))}
                    </CustomSelect>
                  </FormControl>
                  
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                      Tamaño: {textProperties.fontSize}px
                    </Typography>
                    <CustomSlider
                      value={textProperties.fontSize}
                      onChange={(e, value) => {
                        setTextProperties({...textProperties, fontSize: value});
                        handlePropertyChange('fontSize', value);
                      }}
                      min={8}
                      max={72}
                      step={1}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant={textProperties.fontWeight === 'bold' ? 'contained' : 'outlined'}
                      onClick={() => {
                        const newWeight = textProperties.fontWeight === 'bold' ? 'normal' : 'bold';
                        setTextProperties({...textProperties, fontWeight: newWeight});
                        handlePropertyChange('fontWeight', newWeight);
                      }}
                      sx={{ flex: 1, borderRadius: '8px' }}
                    >
                      B
                    </Button>
                    <Button
                      size="small"
                      variant={textProperties.fontStyle === 'italic' ? 'contained' : 'outlined'}
                      onClick={() => {
                        const newStyle = textProperties.fontStyle === 'italic' ? 'normal' : 'italic';
                        setTextProperties({...textProperties, fontStyle: newStyle});
                        handlePropertyChange('fontStyle', newStyle);
                      }}
                      sx={{ flex: 1, borderRadius: '8px' }}
                    >
                      I
                    </Button>
                  </Box>
                </Box>
              </ToolGroup>
            </Box>
          </Fade>
        )}

        {/* Tab: Herramientas de Formas */}
        {activeTab === 2 && (
          <Fade in timeout={500}>
            <Box>
              <ToolGroup>
                <GroupTitle>
                  <ShapesIcon size={18} />
                  Formas Básicas
                </GroupTitle>
                <ToolGrid>
                  {shapes.map((shape) => (
                    <ToolButton
                      key={shape.id}
                      active={activeTool === `shape-${shape.id}`}
                      onClick={() => handleToolSelect(`shape-${shape.id}`)}
                    >
                      <shape.icon size={24} />
                    </ToolButton>
                  ))}
                </ToolGrid>
              </ToolGroup>

              <ToolGroup>
                <GroupTitle>
                  <ColorIcon size={18} />
                  Propiedades de Forma
                </GroupTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                      Opacidad: {Math.round(shapeProperties.opacity * 100)}%
                    </Typography>
                    <CustomSlider
                      value={shapeProperties.opacity}
                      onChange={(e, value) => {
                        setShapeProperties({...shapeProperties, opacity: value});
                        handlePropertyChange('opacity', value);
                      }}
                      min={0}
                      max={1}
                      step={0.01}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                      Grosor del borde: {shapeProperties.strokeWidth}px
                    </Typography>
                    <CustomSlider
                      value={shapeProperties.strokeWidth}
                      onChange={(e, value) => {
                        setShapeProperties({...shapeProperties, strokeWidth: value});
                        handlePropertyChange('strokeWidth', value);
                      }}
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </Box>
                </Box>
              </ToolGroup>
            </Box>
          </Fade>
        )}

        {/* Tab: Herramientas de Imagen */}
        {activeTab === 3 && (
          <Fade in timeout={600}>
            <Box>
              <ToolGroup>
                <GroupTitle>
                  <ImageIcon size={18} />
                  Herramientas de Imagen
                </GroupTitle>
                <ToolGrid>
                  <ToolButton
                    active={activeTool === 'image'}
                    onClick={() => handleToolSelect('image')}
                    variant="primary"
                  >
                    <ImageIcon size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleAction('crop')}
                  >
                    <ArrowsOut size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleAction('background-remove')}
                  >
                    <Sparkle size={24} />
                  </ToolButton>
                </ToolGrid>
              </ToolGroup>

              <ToolGroup>
                <GroupTitle>
                  <EffectsIcon size={18} />
                  Ajustes de Imagen
                </GroupTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                      Brillo: {imageProperties.brightness}%
                    </Typography>
                    <CustomSlider
                      value={imageProperties.brightness}
                      onChange={(e, value) => {
                        setImageProperties({...imageProperties, brightness: value});
                        handlePropertyChange('brightness', value);
                      }}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                      Contraste: {imageProperties.contrast}%
                    </Typography>
                    <CustomSlider
                      value={imageProperties.contrast}
                      onChange={(e, value) => {
                        setImageProperties({...imageProperties, contrast: value});
                        handlePropertyChange('contrast', value);
                      }}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                      Saturación: {imageProperties.saturation}%
                    </Typography>
                    <CustomSlider
                      value={imageProperties.saturation}
                      onChange={(e, value) => {
                        setImageProperties({...imageProperties, saturation: value});
                        handlePropertyChange('saturation', value);
                      }}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </Box>
                </Box>
              </ToolGroup>
            </Box>
          </Fade>
        )}

        {/* Tab: Efectos */}
        {activeTab === 4 && (
          <Fade in timeout={700}>
            <Box>
              <ToolGroup>
                <GroupTitle>
                  <EffectsIcon size={18} />
                  Efectos Visuales
                </GroupTitle>
                <ToolGrid>
                  <ToolButton
                    onClick={() => handleAction('shadow')}
                  >
                    <ShapesIcon size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleAction('blur')}
                  >
                    <Sparkle size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleAction('gradient')}
                  >
                    <ColorIcon size={24} />
                  </ToolButton>
                </ToolGrid>
              </ToolGroup>

              <ToolGroup>
                <GroupTitle>
                  <Sparkle size={18} />
                  Filtros Avanzados
                </GroupTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Chip 
                    label="Desenfoque Gaussiano" 
                    size="small" 
                    variant="outlined"
                    onClick={() => handleAction('gaussian-blur')}
                    sx={{ 
                      borderColor: 'rgba(31, 100, 191, 0.3)',
                      color: '#1F64BF',
                      cursor: 'pointer'
                    }}
                  />
                  <Chip 
                    label="Relieve" 
                    size="small" 
                    variant="outlined"
                    onClick={() => handleAction('emboss')}
                    sx={{ 
                      borderColor: 'rgba(31, 100, 191, 0.3)',
                      color: '#1F64BF',
                      cursor: 'pointer'
                    }}
                  />
                  <Chip 
                    label="Mosaico" 
                    size="small" 
                    variant="outlined"
                    onClick={() => handleAction('mosaic')}
                    sx={{ 
                      borderColor: 'rgba(31, 100, 191, 0.3)',
                      color: '#1F64BF',
                      cursor: 'pointer'
                    }}
                  />
                </Box>
              </ToolGroup>
            </Box>
          </Fade>
        )}

        {/* Tab: Herramientas Avanzadas */}
        {activeTab === 5 && (
          <Fade in timeout={800}>
            <Box>
              <ToolGroup>
                <GroupTitle>
                  <ArrowsOut size={18} />
                  Transformaciones
                </GroupTitle>
                <ToolGrid>
                  <ToolButton
                    onClick={() => handleAction('rotate')}
                  >
                    <ArrowCounterClockwise size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleAction('flip-horizontal')}
                  >
                    <ArrowsOut size={24} />
                  </ToolButton>
                  <ToolButton
                    onClick={() => handleAction('flip-vertical')}
                  >
                    <ArrowsOut size={24} />
                  </ToolButton>
                </ToolGrid>
              </ToolGroup>

              <ToolGroup>
                <GroupTitle>
                  <Lock size={18} />
                  Bloqueo y Protección
                </GroupTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        size="small"
                        onChange={(e) => handleAction('toggle-lock', e.target.checked)}
                      />
                    }
                    label="Bloquear elemento"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        size="small"
                        onChange={(e) => handleAction('toggle-visibility', e.target.checked)}
                      />
                    }
                    label="Ocultar elemento"
                  />
                </Box>
              </ToolGroup>

              <ToolGroup>
                <GroupTitle>
                  <Copy size={18} />
                  Operaciones
                </GroupTitle>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CopySimple size={16} />}
                    onClick={() => handleAction('duplicate')}
                    sx={{ borderRadius: '8px', justifyContent: 'flex-start' }}
                  >
                    Duplicar
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Trash size={16} />}
                    onClick={() => handleAction('delete')}
                    sx={{ borderRadius: '8px', justifyContent: 'flex-start', color: '#F44336' }}
                  >
                    Eliminar
                  </Button>
                </Box>
              </ToolGroup>
            </Box>
          </Fade>
        )}
      </ToolContainer>
    </GlassPanel>
  );
};

export default ToolsPanelGlass;

