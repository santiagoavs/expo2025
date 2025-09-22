// components/Shapes/ShapeCreatorModal.jsx - MODAL PARA FORMAS PERSONALIZADAS
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  ButtonGroup,
  Slider,
  TextField,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Stage, Layer, Line, Circle } from 'react-konva';
import {
  Rectangle,
  Circle as CircleIcon,
  Triangle,
  Star,
  Polygon,
  Trash,
  Download,
  ArrowsClockwise,
  Plus,
  X as CloseIcon,
  Check
} from '@phosphor-icons/react';
import { FIXED_COLORS, BORDERS, TRANSITIONS, GRADIENTS_3D, SHADOWS_3D, Z_INDEX } from '../../styles/responsiveTheme';

// ==================== STYLED COMPONENTS ====================
const ModalContainer = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '90vw',
    maxWidth: '1000px',
    height: '85vh',
    maxHeight: '800px',
    borderRadius: BORDERS.radius.large,
    background: GRADIENTS_3D.panel,
    border: `1px solid ${FIXED_COLORS.border}`,
    boxShadow: SHADOWS_3D.modal,
    zIndex: Z_INDEX.modal
  }
}));

const ModalHeader = styled(DialogTitle)(({ theme }) => ({
  background: GRADIENTS_3D.primary,
  color: 'white',
  borderRadius: `${BORDERS.radius.large} ${BORDERS.radius.large} 0 0`,
  padding: theme.spacing(3, 4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '& .MuiTypography-root': {
    fontWeight: 600,
    fontSize: '1.25rem'
  }
}));

const ModalContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  overflow: 'hidden'
}));

const ContentGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(3),
  flex: 1,
  overflow: 'hidden',
  
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2)
  }
}));

const CanvasSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: GRADIENTS_3D.surface,
  borderRadius: BORDERS.radius.large,
  border: `1px solid ${FIXED_COLORS.border}`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

const ControlsSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: GRADIENTS_3D.surface,
  borderRadius: BORDERS.radius.large,
  border: `1px solid ${FIXED_COLORS.border}`,
  overflowY: 'auto',
  maxHeight: '100%'
}));

const PreviewCanvas = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '400px', // ✅ AUMENTADO: Canvas más grande para el modal
  border: `2px solid ${FIXED_COLORS.border}`,
  borderRadius: BORDERS.radius.medium,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: FIXED_COLORS.background,
  cursor: 'crosshair',
  position: 'relative',
  overflow: 'hidden',
  
  [theme.breakpoints.down('md')]: {
    height: '300px'
  }
}));

const ShapeButton = styled(Button)(({ theme, selected }) => ({
  minWidth: '80px',
  height: '80px',
  borderRadius: BORDERS.radius.medium,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  border: selected ? `2px solid ${FIXED_COLORS.primary}` : `1px solid ${FIXED_COLORS.border}`,
  backgroundColor: selected ? 'rgba(31, 100, 191, 0.1)' : FIXED_COLORS.surface,
  color: selected ? FIXED_COLORS.primary : FIXED_COLORS.textSecondary,
  transition: TRANSITIONS.normal,
  
  '&:hover': {
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
    borderColor: FIXED_COLORS.primary,
    transform: 'translateY(-2px)',
    boxShadow: SHADOWS_3D.medium
  }
}));

const PropertyGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'rgba(31, 100, 191, 0.05)',
  borderRadius: BORDERS.radius.medium,
  border: `1px solid rgba(31, 100, 191, 0.1)`
}));

// ==================== COMPONENTE PRINCIPAL ====================
export const ShapeCreatorModal = ({ 
  isOpen, 
  onClose, 
  onAddShape, 
  onAddCustomShape 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [customPoints, setCustomPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapeProperties, setShapeProperties] = useState({
    fill: FIXED_COLORS.primary,
    stroke: FIXED_COLORS.primaryDark,
    strokeWidth: 2,
    closed: true
  });
  const [starProperties, setStarProperties] = useState({
    numPoints: 5,
    innerRadius: 20,
    outerRadius: 40
  });

  const canvasRef = useRef();
  const stageRef = useRef();

  const shapeTemplates = [
    { id: 'rect', icon: Rectangle, label: 'Rectángulo' },
    { id: 'circle', icon: CircleIcon, label: 'Círculo' },
    { id: 'triangle', icon: Triangle, label: 'Triángulo' },
    { id: 'star', icon: Star, label: 'Estrella' },
    { id: 'custom', icon: Polygon, label: 'Personalizada' }
  ];

  // ==================== MANEJADORES DE EVENTOS ====================
  const handleCanvasClick = (e) => {
    if (selectedTemplate !== 'custom' || !isDrawing) return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    setCustomPoints(prev => [
      ...prev,
      pointerPosition.x,
      pointerPosition.y
    ]);
  };

  const clearCustomShape = () => {
    setCustomPoints([]);
  };

  const finishCustomShape = () => {
    if (customPoints.length < 6) {
      alert('Necesitas al menos 3 puntos para crear una forma');
      return;
    }
    
    onAddCustomShape(customPoints);
    setCustomPoints([]);
    setIsDrawing(false);
  };

  const createPresetShape = (shapeType) => {
    switch (shapeType) {
      case 'star':
        const starPoints = generateStarPoints(
          starProperties.numPoints,
          starProperties.innerRadius,
          starProperties.outerRadius
        );
        onAddShape('star', { 
          points: starPoints,
          numPoints: starProperties.numPoints,
          innerRadius: starProperties.innerRadius,
          outerRadius: starProperties.outerRadius,
          fill: shapeProperties.fill,
          stroke: shapeProperties.stroke,
          strokeWidth: shapeProperties.strokeWidth,
          closed: true,
          lineCap: 'round',
          lineJoin: 'round'
        });
        break;
      case 'pentagon':
        const pentagonPoints = generatePentagonPoints();
        onAddShape('pentagon', { 
          points: pentagonPoints,
          fill: shapeProperties.fill,
          stroke: shapeProperties.stroke,
          strokeWidth: shapeProperties.strokeWidth,
          closed: true,
          lineCap: 'round',
          lineJoin: 'round'
        });
        break;
      case 'hexagon':
        const hexagonPoints = generateHexagonPoints();
        onAddShape('hexagon', { 
          points: hexagonPoints,
          fill: shapeProperties.fill,
          stroke: shapeProperties.stroke,
          strokeWidth: shapeProperties.strokeWidth,
          closed: true,
          lineCap: 'round',
          lineJoin: 'round'
        });
        break;
      case 'octagon':
        const octagonPoints = generateOctagonPoints();
        onAddShape('octagon', { 
          points: octagonPoints,
          fill: shapeProperties.fill,
          stroke: shapeProperties.stroke,
          strokeWidth: shapeProperties.strokeWidth,
          closed: true,
          lineCap: 'round',
          lineJoin: 'round'
        });
        break;
      default:
        onAddShape(shapeType, {
          fill: shapeProperties.fill,
          stroke: shapeProperties.stroke,
          strokeWidth: shapeProperties.strokeWidth
        });
    }
    onClose();
  };

  const generateStarPoints = (numPoints, innerRadius, outerRadius) => {
    const points = [];
    const step = Math.PI / numPoints;
    
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      points.push(Math.cos(angle) * radius + outerRadius);
      points.push(Math.sin(angle) * radius + outerRadius);
    }
    
    return points;
  };

  const generatePentagonPoints = () => {
    const points = [];
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      points.push(centerX + Math.cos(angle) * radius);
      points.push(centerY + Math.sin(angle) * radius);
    }
    
    return points;
  };

  const generateHexagonPoints = () => {
    const points = [];
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
      points.push(centerX + Math.cos(angle) * radius);
      points.push(centerY + Math.sin(angle) * radius);
    }
    
    return points;
  };

  const generateOctagonPoints = () => {
    const points = [];
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
      points.push(centerX + Math.cos(angle) * radius);
      points.push(centerY + Math.sin(angle) * radius);
    }
    
    return points;
  };

  const renderCustomPoints = () => {
    const points = [];
    for (let i = 0; i < customPoints.length; i += 2) {
      points.push(
        <Circle
          key={i}
          x={customPoints[i]}
          y={customPoints[i + 1]}
          radius={4}
          fill={FIXED_COLORS.primary}
          stroke={FIXED_COLORS.primaryDark}
          strokeWidth={2}
        />
      );
    }
    return points;
  };

  const handleClose = () => {
    setCustomPoints([]);
    setIsDrawing(false);
    setSelectedTemplate('custom');
    onClose();
  };

  // ==================== RENDER ====================
  return (
    <ModalContainer
      open={isOpen}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
    >
      <ModalHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Polygon size={24} />
          <Typography variant="h6">
            Creador de Formas Personalizadas
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{ 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <CloseIcon size={20} />
        </IconButton>
      </ModalHeader>

      <ModalContent>
        <ContentGrid>
          {/* Sección del Canvas */}
          <CanvasSection>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: FIXED_COLORS.text }}>
              🎨 Lienzo de Dibujo
            </Typography>
            
            <PreviewCanvas>
              <Stage
                ref={stageRef}
                width={500} // ✅ AUMENTADO: Canvas más grande
                height={400} // ✅ AUMENTADO: Canvas más grande
                onMouseDown={handleCanvasClick}
              >
                <Layer>
                  {/* Líneas conectando los puntos */}
                  {customPoints.length >= 4 && (
                    <Line
                      points={customPoints}
                      stroke={shapeProperties.stroke}
                      strokeWidth={shapeProperties.strokeWidth}
                      closed={false}
                      dash={[5, 5]}
                    />
                  )}
                  
                  {/* Puntos individuales */}
                  {renderCustomPoints()}
                  
                  {/* Vista previa de la forma cerrada */}
                  {customPoints.length >= 6 && shapeProperties.closed && (
                    <Line
                      points={customPoints}
                      fill={shapeProperties.fill}
                      stroke={shapeProperties.stroke}
                      strokeWidth={shapeProperties.strokeWidth}
                      closed={true}
                      opacity={0.7}
                    />
                  )}
                </Layer>
              </Stage>
            </PreviewCanvas>

            {/* Controles del canvas */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant={isDrawing ? 'contained' : 'outlined'}
                onClick={() => setIsDrawing(!isDrawing)}
                size="small"
                startIcon={isDrawing ? <Check size={16} /> : <Plus size={16} />}
              >
                {isDrawing ? 'Dibujando...' : 'Iniciar dibujo'}
              </Button>
              
              <IconButton
                onClick={clearCustomShape}
                disabled={customPoints.length === 0}
                size="small"
                sx={{ 
                  color: FIXED_COLORS.error,
                  '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                }}
              >
                <Trash size={16} />
              </IconButton>

              {customPoints.length > 0 && (
                <Chip
                  label={`${customPoints.length / 2} puntos`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </CanvasSection>

          {/* Sección de Controles */}
          <ControlsSection>
            {/* Plantillas de formas */}
            <PropertyGroup>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                📐 Tipo de Forma
              </Typography>
              <Grid container spacing={1}>
                {shapeTemplates.map(template => {
                  const Icon = template.icon;
                  return (
                    <Grid item xs={6} key={template.id}>
                      <ShapeButton
                        selected={selectedTemplate === template.id}
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setIsDrawing(false);
                          setCustomPoints([]);
                        }}
                        fullWidth
                      >
                        <Icon size={24} />
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                          {template.label}
                        </Typography>
                      </ShapeButton>
                    </Grid>
                  );
                })}
              </Grid>
            </PropertyGroup>

            {/* Configuración específica por tipo */}
            {selectedTemplate === 'star' && (
              <PropertyGroup>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  ⭐ Configuración de Estrella
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Puntas: {starProperties.numPoints}
                  </Typography>
                  <Slider
                    value={starProperties.numPoints}
                    onChange={(_, value) => setStarProperties(prev => ({ ...prev, numPoints: value }))}
                    min={3}
                    max={12}
                    step={1}
                    size="small"
                    color="primary"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Radio interior"
                    type="number"
                    value={starProperties.innerRadius}
                    onChange={(e) => setStarProperties(prev => ({ 
                      ...prev, 
                      innerRadius: parseInt(e.target.value) 
                    }))}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Radio exterior"
                    type="number"
                    value={starProperties.outerRadius}
                    onChange={(e) => setStarProperties(prev => ({ 
                      ...prev, 
                      outerRadius: parseInt(e.target.value) 
                    }))}
                    size="small"
                    fullWidth
                  />
                </Box>
              </PropertyGroup>
            )}

            {/* Propiedades de apariencia */}
            <PropertyGroup>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                🎨 Propiedades Visuales
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Color de relleno"
                  type="color"
                  value={shapeProperties.fill}
                  onChange={(e) => setShapeProperties(prev => ({ ...prev, fill: e.target.value }))}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  label="Color de borde"
                  type="color"
                  value={shapeProperties.stroke}
                  onChange={(e) => setShapeProperties(prev => ({ ...prev, stroke: e.target.value }))}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  label="Grosor de borde"
                  type="number"
                  value={shapeProperties.strokeWidth}
                  onChange={(e) => setShapeProperties(prev => ({ 
                    ...prev, 
                    strokeWidth: parseInt(e.target.value) 
                  }))}
                  size="small"
                  fullWidth
                  inputProps={{ min: 1, max: 10 }}
                />
              </Box>
            </PropertyGroup>
          </ControlsSection>
        </ContentGrid>
      </ModalContent>

      <DialogActions sx={{ 
        padding: 3, 
        background: GRADIENTS_3D.surface,
        borderRadius: `0 0 ${BORDERS.radius.large} ${BORDERS.radius.large}`
      }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ 
            borderColor: FIXED_COLORS.border,
            color: FIXED_COLORS.textSecondary
          }}
        >
          Cancelar
        </Button>
        
        {selectedTemplate === 'custom' && customPoints.length >= 6 && (
          <Button
            variant="contained"
            onClick={finishCustomShape}
            startIcon={<Check size={16} />}
            sx={{
              background: GRADIENTS_3D.primary,
              '&:hover': {
                background: GRADIENTS_3D.primaryHover
              }
            }}
          >
            Crear Forma Personalizada
          </Button>
        )}
        
        {selectedTemplate !== 'custom' && (
          <Button
            variant="contained"
            onClick={() => createPresetShape(selectedTemplate)}
            startIcon={<Plus size={16} />}
            sx={{
              background: GRADIENTS_3D.primary,
              '&:hover': {
                background: GRADIENTS_3D.primaryHover
              }
            }}
          >
            Agregar {shapeTemplates.find(t => t.id === selectedTemplate)?.label}
          </Button>
        )}
      </DialogActions>
    </ModalContainer>
  );
};
