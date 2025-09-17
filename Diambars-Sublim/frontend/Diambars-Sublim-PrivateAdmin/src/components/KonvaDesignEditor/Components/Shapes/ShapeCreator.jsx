// components/Shapes/ShapeCreator.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
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
  MenuItem
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
  Plus
} from '@phosphor-icons/react';

const ShapeCreatorContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxHeight: '80vh',
  overflowY: 'auto',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 8px 32px rgba(1, 3, 38, 0.15)',
  padding: theme.spacing(2)
}));

const PreviewCanvas = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '200px',
  border: '2px solid #e0e0e0',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8f9fa',
  cursor: 'crosshair',
  position: 'relative',
  overflow: 'hidden'
}));

const ShapeButton = styled(Button)(({ theme, selected }) => ({
  minWidth: '60px',
  height: '60px',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  border: selected ? `2px solid #1F64BF` : `1px solid #e0e0e0`,
  backgroundColor: selected ? 'rgba(31, 100, 191, 0.1)' : 'white',
  color: selected ? '#1F64BF' : '#666',
  '&:hover': {
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
    borderColor: '#1F64BF'
  }
}));

export const ShapeCreator = ({ onAddShape, onAddCustomShape }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [customPoints, setCustomPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapeProperties, setShapeProperties] = useState({
    fill: '#1F64BF',
    stroke: '#032CA6',
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
    if (customPoints.length < 6) { // Al menos 3 puntos (6 coordenadas)
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
        onAddShape('star', starPoints);
        break;
      default:
        onAddShape(shapeType);
    }
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

  const renderCustomPoints = () => {
    const points = [];
    for (let i = 0; i < customPoints.length; i += 2) {
      points.push(
        <Circle
          key={i}
          x={customPoints[i]}
          y={customPoints[i + 1]}
          radius={3}
          fill="#1F64BF"
          stroke="#032CA6"
          strokeWidth={1}
        />
      );
    }
    return points;
  };

  return (
    <ShapeCreatorContainer>
      <Typography variant="h6" color="primary" gutterBottom>
        Creador de Formas
      </Typography>

      {/* Plantillas de formas */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Seleccionar tipo:
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
                  <Icon size={20} />
                  <Typography variant="caption">
                    {template.label}
                  </Typography>
                </ShapeButton>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Configuración específica por tipo */}
      {selectedTemplate === 'star' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Configuración de estrella:
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
        </Box>
      )}

      {/* Canvas para formas personalizadas */}
      {selectedTemplate === 'custom' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Dibujar forma personalizada:
          </Typography>
          
          <PreviewCanvas>
            <Stage
              ref={stageRef}
              width={280}
              height={200}
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

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant={isDrawing ? 'contained' : 'outlined'}
              onClick={() => setIsDrawing(!isDrawing)}
              size="small"
            >
              {isDrawing ? 'Modo dibujo ON' : 'Iniciar dibujo'}
            </Button>
            
            <IconButton
              onClick={clearCustomShape}
              disabled={customPoints.length === 0}
              size="small"
            >
              <Trash size={16} />
            </IconButton>
          </Box>

          {customPoints.length >= 6 && (
            <Button
              variant="contained"
              onClick={finishCustomShape}
              startIcon={<Plus />}
              sx={{ mt: 2 }}
              fullWidth
            >
              Crear forma ({customPoints.length / 2} puntos)
            </Button>
          )}
        </Box>
      )}

      {/* Propiedades de apariencia */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Propiedades:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Color de relleno"
            type="color"
            value={shapeProperties.fill}
            onChange={(e) => setShapeProperties(prev => ({ ...prev, fill: e.target.value }))}
            size="small"
            fullWidth
          />
          
          <TextField
            label="Color de borde"
            type="color"
            value={shapeProperties.stroke}
            onChange={(e) => setShapeProperties(prev => ({ ...prev, stroke: e.target.value }))}
            size="small"
            fullWidth
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
          />
        </Box>
      </Box>

      {/* Botones de acción */}
      {selectedTemplate !== 'custom' && (
        <Button
          variant="contained"
          onClick={() => createPresetShape(selectedTemplate)}
          startIcon={<Plus />}
          fullWidth
          size="large"
        >
          Agregar {shapeTemplates.find(t => t.id === selectedTemplate)?.label}
        </Button>
      )}
    </ShapeCreatorContainer>
  );
};