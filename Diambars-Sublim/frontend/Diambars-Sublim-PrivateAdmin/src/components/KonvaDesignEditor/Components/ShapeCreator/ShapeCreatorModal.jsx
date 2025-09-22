// ShapeCreatorModal.jsx - MODAL REDIMENSIONABLE PARA CREACIÓN DE FORMAS
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Slider,
  TextField,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  X as CloseIcon,
  Check as CheckIcon,
  Star,
  Circle as CircleIcon,
  Square,
  Triangle,
  Polygon,
  Eraser,
  Download,
  Upload
} from '@phosphor-icons/react';
import { Stage, Layer, Rect, Circle, Line, Transformer } from 'react-konva';
import { ChromePicker } from 'react-color';
import { GRADIENTS_3D, SHADOWS_3D, FIXED_COLORS, BORDERS, TRANSITIONS, Z_INDEX } from '../../styles/responsiveTheme';

// ==================== STYLED COMPONENTS ====================
const ResizableModal = styled(Dialog)(({ theme }) => ({
  zIndex: Z_INDEX.modal,
  '& .MuiDialog-paper': {
    background: GRADIENTS_3D.glass,
    backdropFilter: 'blur(20px)',
    borderRadius: BORDERS.radius.large,
    border: `1px solid rgba(255,255,255,0.2)`,
    boxShadow: SHADOWS_3D.strong,
    minWidth: '900px',
    minHeight: '700px',
    maxWidth: '95vw',
    maxHeight: '95vh',
    resize: 'both',
    overflow: 'auto',
    position: 'relative'
  },
  '& .MuiBackdrop-root': {
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)'
  }
}));

const ShapeCard = styled(Card)(({ theme, selected }) => ({
  background: selected 
    ? 'rgba(31, 100, 191, 0.1)' 
    : 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: BORDERS.radius.medium,
  border: selected 
    ? `2px solid ${FIXED_COLORS.primary}` 
    : '1px solid rgba(31, 100, 191, 0.2)',
  cursor: 'pointer',
  transition: TRANSITIONS.fast,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: SHADOWS_3D.medium,
    borderColor: FIXED_COLORS.primary
  }
}));

const MiniCanvas = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '400px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: BORDERS.radius.medium,
  border: `1px solid rgba(31, 100, 191, 0.2)`,
  overflow: 'hidden',
  position: 'relative'
}));

const ColorPreview = styled(Box)(({ theme, color }) => ({
  width: 40,
  height: 40,
  backgroundColor: color,
  borderRadius: BORDERS.radius.small,
  border: `2px solid ${FIXED_COLORS.border}`,
  cursor: 'pointer',
  transition: TRANSITIONS.fast,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: SHADOWS_3D.medium
  }
}));

// ==================== CONSTANTES ====================
const SHAPE_TYPES = {
  // Formas básicas compatibles con backend
  rect: { name: 'Rectángulo', icon: <Square size={20} />, category: 'basic', backendType: 'rect' },
  circle: { name: 'Círculo', icon: <CircleIcon size={20} />, category: 'basic', backendType: 'circle' },
  triangle: { name: 'Triángulo', icon: <Triangle size={20} />, category: 'basic', backendType: 'triangle' },
  star: { name: 'Estrella', icon: <Star size={20} />, category: 'basic', backendType: 'star' },
  square: { name: 'Cuadrado', icon: <Square size={20} />, category: 'basic', backendType: 'square' },
  ellipse: { name: 'Elipse', icon: <CircleIcon size={20} />, category: 'basic', backendType: 'ellipse' },
  
  // Formas avanzadas
  diamond: { name: 'Diamante', icon: <Polygon size={20} />, category: 'advanced', backendType: 'diamond' },
  hexagon: { name: 'Hexágono', icon: <Polygon size={20} />, category: 'advanced', backendType: 'hexagon' },
  octagon: { name: 'Octágono', icon: <Polygon size={20} />, category: 'advanced', backendType: 'octagon' },
  pentagon: { name: 'Pentágono', icon: <Polygon size={20} />, category: 'advanced', backendType: 'pentagon' },
  
  // Formas personalizadas
  custom: { name: 'Personalizada', icon: <Polygon size={20} />, category: 'custom', backendType: 'shape' }
};

const CANVAS_SIZE = { width: 400, height: 300 };


// ==================== COMPONENTE PRINCIPAL ====================
const ShapeCreatorModal = ({
  isOpen,
  onClose,
  onAddShape
}) => {
  // Estados principales
  const [activeTab, setActiveTab] = useState(0);
  const [selectedShapeType, setSelectedShapeType] = useState('rect');
  const [shapeProperties, setShapeProperties] = useState({
    fill: '#1F64BF',
    stroke: '#000000',
    strokeWidth: 2,
    cornerRadius: 0,
    points: 5,
    innerRadius: 0.5,
    outerRadius: 1
  });
  
  // Estados del canvas
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [customPoints, setCustomPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Estados de UI
  const [showFillPicker, setShowFillPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  
  // Refs
  const stageRef = useRef();
  const transformerRef = useRef();

  // ==================== FUNCIONES GENERADORAS DE FORMAS ====================
  
  // Generar puntos para estrella
  const generateStarPoints = useCallback((points, outerRadius, innerRadius) => {
    const angle = Math.PI / points;
    const result = [];
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(i * angle - Math.PI / 2) * radius + 50;
      const y = Math.sin(i * angle - Math.PI / 2) * radius + 50;
      result.push(x, y);
    }
    
    return result;
  }, []);


  // Generar puntos para hexágono
  const generateHexagonPoints = useCallback((radius) => {
    const points = [];
    const centerX = 50;
    const centerY = 50;
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(x, y);
    }
    
    return points;
  }, []);

  // Generar puntos para octágono
  const generateOctagonPoints = useCallback((radius) => {
    const points = [];
    const centerX = 50;
    const centerY = 50;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(x, y);
    }
    
    return points;
  }, []);

  // Generar puntos para pentágono
  const generatePentagonPoints = useCallback((radius) => {
    const points = [];
    const centerX = 50;
    const centerY = 50;
    
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(x, y);
    }
    
    return points;
  }, []);

  // ==================== MANEJADORES DE EVENTOS ====================
  
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleShapeTypeSelect = useCallback((shapeType) => {
    console.log('🎨 [ShapeCreator] handleShapeTypeSelect llamado:', shapeType);
    setSelectedShapeType(shapeType);
    setSelectedElement(null);
    setCustomPoints([]);
  }, []);

  const handlePropertyChange = useCallback((property, value) => {
    setShapeProperties(prev => ({
      ...prev,
      [property]: value
    }));
  }, []);

  const handleCanvasClick = useCallback((e) => {
    console.log('🎨 [ShapeCreator] Canvas clickeado:', { selectedShapeType, target: e.target });
    
    if (selectedShapeType === 'custom') {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      console.log('🎨 [ShapeCreator] Agregando punto personalizado:', point);
      setCustomPoints(prev => {
        const newPoints = [...prev, { x: point.x, y: point.y }];
        console.log('🎨 [ShapeCreator] Puntos personalizados actualizados:', newPoints);
        return newPoints;
      });
    }
  }, [selectedShapeType]);

  const handleAddToCanvas = useCallback(() => {
    console.log('🎨 [ShapeCreator] handleAddToCanvas llamado:', { selectedShapeType, shapeProperties, customPoints });
    
    const shapeConfig = SHAPE_TYPES[selectedShapeType];
    if (!shapeConfig) {
      console.error('❌ [ShapeCreator] Tipo de forma no encontrado:', selectedShapeType);
      return;
    }

    // Validar formas personalizadas
    if (selectedShapeType === 'custom' && customPoints.length < 3) {
      console.warn('⚠️ [ShapeCreator] Se necesitan al menos 3 puntos para una forma personalizada');
      alert('Se necesitan al menos 3 puntos para crear una forma personalizada');
      return;
    }

    const newElement = {
      id: `shape-${Date.now()}`,
      type: shapeConfig.backendType,
      shapeType: selectedShapeType,
      x: 50,
      y: 50,
      ...shapeProperties,
      // Propiedades específicas por tipo de forma
      ...(selectedShapeType === 'rect' && { width: 100, height: 80 }),
      ...(selectedShapeType === 'square' && { width: 80, height: 80 }),
      ...(selectedShapeType === 'circle' && { radius: 50 }),
      ...(selectedShapeType === 'ellipse' && { 
        radius: 50,
        scaleX: 1.2,
        scaleY: 0.8
      }),
      ...(selectedShapeType === 'triangle' && { 
        points: [0, 50, 50, 0, 100, 50],
        closed: true 
      }),
      ...(selectedShapeType === 'star' && { 
        points: generateStarPoints(shapeProperties.points, 50, 25),
        closed: true 
      }),
      ...(selectedShapeType === 'custom' && { 
        points: customPoints.flatMap(p => [p.x, p.y]),
        closed: true 
      }),
      // Formas avanzadas
      ...(selectedShapeType === 'diamond' && { 
        points: [50, 0, 100, 50, 50, 100, 0, 50],
        closed: true 
      }),
      ...(selectedShapeType === 'hexagon' && { 
        points: generateHexagonPoints(50),
        closed: true 
      }),
      ...(selectedShapeType === 'octagon' && { 
        points: generateOctagonPoints(50),
        closed: true 
      }),
      ...(selectedShapeType === 'pentagon' && { 
        points: generatePentagonPoints(50),
        closed: true 
      })
    };
    
    console.log('🎨 [ShapeCreator] Nuevo elemento creado:', newElement);
    setCanvasElements(prev => {
      const newElements = [...prev, newElement];
      console.log('🎨 [ShapeCreator] Elementos del canvas actualizados:', newElements);
      return newElements;
    });
    
    if (selectedShapeType === 'custom') {
      setCustomPoints([]);
    }
  }, [selectedShapeType, shapeProperties, customPoints]);

  const handleClearCanvas = useCallback(() => {
    setCanvasElements([]);
    setCustomPoints([]);
    setSelectedElement(null);
  }, []);

  const handleAddToDesign = useCallback(() => {
    if (canvasElements.length > 0) {
      canvasElements.forEach(element => {
        onAddShape(element.type, element);
      });
      onClose();
    }
  }, [canvasElements, onAddShape, onClose]);

  // ==================== RENDERIZADO DE ELEMENTOS ====================
  
  const renderCanvasElement = useCallback((element) => {
    console.log('🎨 [ShapeCreator] renderCanvasElement llamado:', element);
    
    const commonProps = {
      id: element.id,
      x: element.x,
      y: element.y,
      fill: element.fill,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      draggable: true,
      onClick: () => setSelectedElement(element.id)
    };

    switch (element.type) {
      case 'rect':
        return (
          <Rect
            key={element.id}
            {...commonProps}
            width={element.width}
            height={element.height}
            cornerRadius={element.cornerRadius}
          />
        );
      case 'square':
        return (
          <Rect
            key={element.id}
            {...commonProps}
            width={element.width}
            height={element.height}
            cornerRadius={element.cornerRadius}
          />
        );
      case 'circle':
        return (
          <Circle
            key={element.id}
            {...commonProps}
            radius={element.radius}
          />
        );
      case 'ellipse':
        return (
          <Circle
            key={element.id}
            {...commonProps}
            radius={element.radiusX || element.radiusY || 50}
            scaleX={element.radiusX ? element.radiusX / 50 : 1}
            scaleY={element.radiusY ? element.radiusY / 50 : 1}
          />
        );
      case 'triangle':
      case 'star':
      case 'diamond':
      case 'hexagon':
      case 'octagon':
      case 'pentagon':
      case 'custom':
      case 'shape':
        return (
          <Line
            key={element.id}
            {...commonProps}
            points={element.points || []}
            closed={element.closed || true}
            lineCap="round"
            lineJoin="round"
          />
        );
      default:
        return null;
    }
  }, []);

  // ==================== RENDER ====================
  
  return (
    <ResizableModal
      open={isOpen}
      onClose={onClose}
      maxWidth={false}
      fullWidth
    >
      <DialogTitle sx={{ 
        background: GRADIENTS_3D.surface,
        borderBottom: `1px solid rgba(31, 100, 191, 0.2)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h5" sx={{ 
          color: FIXED_COLORS.text, 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Polygon size={24} />
          Editor de Formas
        </Typography>
        <IconButton onClick={onClose} sx={{ color: FIXED_COLORS.textSecondary }}>
          <CloseIcon size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, background: GRADIENTS_3D.background }}>
        <Box sx={{ display: 'flex', height: '600px' }}>
          {/* Panel Lateral */}
          <Box sx={{ 
            width: '300px', 
            borderRight: `1px solid rgba(31, 100, 191, 0.2)`,
            background: GRADIENTS_3D.surface
          }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              orientation="vertical"
              sx={{
                '& .MuiTab-root': {
                  color: FIXED_COLORS.textSecondary,
                  '&.Mui-selected': {
                    color: FIXED_COLORS.primary
                  }
                }
              }}
            >
              <Tab label="Formas Básicas" />
              <Tab label="Personalizadas" />
              <Tab label="Avanzadas" />
              <Tab label="Propiedades" />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" sx={{ color: FIXED_COLORS.text, mb: 2 }}>
                    Formas Básicas
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(SHAPE_TYPES)
                      .filter(([_, config]) => config.category === 'basic')
                      .map(([type, config]) => (
                        <Grid item xs={6} key={type}>
                          <ShapeCard
                            selected={selectedShapeType === type}
                            onClick={() => {
                              console.log('🎨 [ShapeCreator] Forma clickeada:', type);
                              handleShapeTypeSelect(type);
                            }}
                          >
                            <CardContent sx={{ p: 1, textAlign: 'center' }}>
                              {config.icon}
                              <Typography variant="caption" sx={{ 
                                display: 'block', 
                                mt: 0.5,
                                color: FIXED_COLORS.text
                              }}>
                                {config.name}
                              </Typography>
                            </CardContent>
                          </ShapeCard>
                        </Grid>
                      ))}
                  </Grid>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ color: FIXED_COLORS.text, mb: 2 }}>
                    Formas Personalizadas
                  </Typography>
                  <ShapeCard
                    selected={selectedShapeType === 'custom'}
                    onClick={() => {
                      console.log('🎨 [ShapeCreator] Forma clickeada:', 'custom');
                      handleShapeTypeSelect('custom');
                    }}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Polygon size={32} />
                      <Typography variant="body2" sx={{ mt: 1, color: FIXED_COLORS.text }}>
                        Personalizada
                      </Typography>
                      <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary }}>
                        Haz clic en el canvas para agregar puntos
                      </Typography>
                      {selectedShapeType === 'custom' && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" sx={{ color: FIXED_COLORS.primary, fontWeight: 600 }}>
                            Puntos agregados: {customPoints.length}
                          </Typography>
                          <Typography variant="caption" sx={{ color: FIXED_COLORS.textSecondary, display: 'block' }}>
                            Mínimo: 3 puntos
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </ShapeCard>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ color: FIXED_COLORS.text, mb: 2 }}>
                    Formas Avanzadas
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(SHAPE_TYPES)
                      .filter(([_, config]) => config.category === 'advanced')
                      .map(([type, config]) => (
                        <Grid item xs={6} key={type}>
                          <ShapeCard
                            selected={selectedShapeType === type}
                            onClick={() => {
                              console.log('🎨 [ShapeCreator] Forma clickeada:', type);
                              handleShapeTypeSelect(type);
                            }}
                          >
                            <CardContent sx={{ p: 1, textAlign: 'center' }}>
                              {config.icon}
                              <Typography variant="caption" sx={{ 
                                display: 'block', 
                                mt: 0.5,
                                color: FIXED_COLORS.text
                              }}>
                                {config.name}
                              </Typography>
                            </CardContent>
                          </ShapeCard>
                        </Grid>
                      ))}
                  </Grid>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" sx={{ color: FIXED_COLORS.text, mb: 2 }}>
                    Propiedades
                  </Typography>
                  
                  {/* Color de Relleno */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: FIXED_COLORS.text, mb: 1 }}>
                      Color de Relleno
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ColorPreview
                        color={shapeProperties.fill}
                        onClick={() => setShowFillPicker(!showFillPicker)}
                      />
                      <TextField
                        size="small"
                        value={shapeProperties.fill}
                        onChange={(e) => handlePropertyChange('fill', e.target.value)}
                        sx={{ flex: 1 }}
                      />
                    </Box>
                    {showFillPicker && (
                      <Box sx={{ mt: 1, zIndex: Z_INDEX.tooltip + 1 }}>
                        <ChromePicker
                          color={shapeProperties.fill}
                          onChange={(color) => handlePropertyChange('fill', color.hex)}
                          disableAlpha={true}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Color de Borde */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: FIXED_COLORS.text, mb: 1 }}>
                      Color de Borde
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ColorPreview
                        color={shapeProperties.stroke}
                        onClick={() => setShowStrokePicker(!showStrokePicker)}
                      />
                      <TextField
                        size="small"
                        value={shapeProperties.stroke}
                        onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                        sx={{ flex: 1 }}
                      />
                    </Box>
                    {showStrokePicker && (
                      <Box sx={{ mt: 1, zIndex: Z_INDEX.tooltip + 1 }}>
                        <ChromePicker
                          color={shapeProperties.stroke}
                          onChange={(color) => handlePropertyChange('stroke', color.hex)}
                          disableAlpha={true}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Grosor del Borde */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: FIXED_COLORS.text, mb: 1 }}>
                      Grosor del Borde: {shapeProperties.strokeWidth}px
                    </Typography>
                    <Slider
                      value={shapeProperties.strokeWidth}
                      onChange={(e, value) => handlePropertyChange('strokeWidth', value)}
                      min={0}
                      max={10}
                      step={1}
                      sx={{ color: FIXED_COLORS.primary }}
                    />
                  </Box>

                  {/* Redondeado de Esquinas (solo para rectángulos) */}
                  {selectedShapeType === 'rect' && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: FIXED_COLORS.text, mb: 1 }}>
                        Redondeado: {shapeProperties.cornerRadius}px
                      </Typography>
                      <Slider
                        value={shapeProperties.cornerRadius}
                        onChange={(e, value) => handlePropertyChange('cornerRadius', value)}
                        min={0}
                        max={50}
                        step={1}
                        sx={{ color: FIXED_COLORS.primary }}
                      />
                    </Box>
                  )}

                  {/* Controles específicos para estrellas */}
                  {selectedShapeType === 'star' && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: FIXED_COLORS.text, mb: 1 }}>
                        Puntas: {shapeProperties.points}
                      </Typography>
                      <Slider
                        value={shapeProperties.points}
                        onChange={(e, value) => handlePropertyChange('points', value)}
                        min={3}
                        max={20}
                        step={1}
                        sx={{ color: FIXED_COLORS.primary }}
                      />
                    </Box>
                  )}

                </Box>
              )}
            </Box>
          </Box>

          {/* Canvas Principal */}
          <Box sx={{ flex: 1, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: FIXED_COLORS.text }}>
                Previsualización
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    console.log('🎨 [ShapeCreator] Botón "Agregar al Canvas" clickeado');
                    handleAddToCanvas();
                  }}
                  startIcon={<CheckIcon size={16} />}
                >
                  Agregar al Canvas
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    console.log('🎨 [ShapeCreator] Botón "Limpiar" clickeado');
                    handleClearCanvas();
                  }}
                  startIcon={<Eraser size={16} />}
                >
                  Limpiar
                </Button>
              </Stack>
            </Box>

            <MiniCanvas>
              <Stage
                ref={stageRef}
                width={CANVAS_SIZE.width}
                height={CANVAS_SIZE.height}
                onClick={handleCanvasClick}
              >
                <Layer>
                  {/* Debug: Mostrar información del canvas */}
                  {console.log('🎨 [ShapeCreator] Renderizando canvas con elementos:', canvasElements)}
                  
                  {/* Renderizar elementos del canvas */}
                  {canvasElements.map(renderCanvasElement)}
                  
                  {/* Renderizar puntos personalizados */}
                  {selectedShapeType === 'custom' && customPoints.map((point, index) => (
                    <Circle
                      key={index}
                      x={point.x}
                      y={point.y}
                      radius={5}
                      fill={FIXED_COLORS.primary}
                      stroke={FIXED_COLORS.primaryDark}
                      strokeWidth={2}
                    />
                  ))}
                  
                  {/* Transformer para elementos seleccionados */}
                  <Transformer ref={transformerRef} />
                </Layer>
              </Stage>
            </MiniCanvas>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        background: GRADIENTS_3D.surface,
        borderTop: `1px solid rgba(31, 100, 191, 0.2)`,
        p: 2
      }}>
        <Button
          onClick={onClose}
          sx={{ color: FIXED_COLORS.textSecondary }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleAddToDesign}
          disabled={canvasElements.length === 0}
          sx={{
            background: GRADIENTS_3D.primary,
            boxShadow: SHADOWS_3D.button,
            '&:hover': {
              boxShadow: SHADOWS_3D.strong
            }
          }}
        >
          Agregar al Diseño ({canvasElements.length})
        </Button>
      </DialogActions>
    </ResizableModal>
  );
};

export default ShapeCreatorModal;
