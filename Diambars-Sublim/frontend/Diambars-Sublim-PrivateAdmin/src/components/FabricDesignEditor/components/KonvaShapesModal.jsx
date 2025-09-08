// src/components/FabricDesignEditor/components/KonvaShapesModal.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  X as CloseIcon,
  Check as CheckIcon,
  Star,
  Heart,
  ArrowRight,
  ChatCircle,
  Lightning,
  PaintBrush,
  Polygon,
  CursorClick
} from '@phosphor-icons/react';
import { fabric } from 'fabric';
import useEditorStore from '../stores/useEditorStores';
import ColorPicker from './ColorPicker';

// Constantes del tema
const THEME_COLORS = {
  primary: '#1F64BF',
  primaryDark: '#032CA6',
  accent: '#040DBF',
  background: '#F2F2F2',
  text: '#010326'
};

// Modal con glassmorphism
const KonvaModal = styled(Dialog)(({ theme }) => ({
  zIndex: 9999, // Z-index muy alto para estar por encima del editor
  '& .MuiDialog-paper': {
    background: 'rgba(242, 242, 242, 0.95)',
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    borderRadius: '20px',
    border: '1px solid rgba(31, 100, 191, 0.2)',
    boxShadow: `
      0 20px 60px rgba(1, 3, 38, 0.15),
      inset 0 1px 0 rgba(242, 242, 242, 0.9)
    `,
    minWidth: '900px',
    maxWidth: '1200px',
    minHeight: '700px',
    zIndex: 10000 // Z-index adicional en el paper
  },
  '& .MuiBackdrop-root': {
    zIndex: 9998 // Backdrop también con z-index alto
  }
}));

// Tarjeta de forma
const ShapeCard = styled(Card)(({ theme, selected }) => ({
  background: selected 
    ? 'rgba(31, 100, 191, 0.1)' 
    : 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: selected 
    ? `2px solid ${THEME_COLORS.primary}` 
    : '1px solid rgba(31, 100, 191, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(31, 100, 191, 0.2)',
    borderColor: THEME_COLORS.primary
  }
}));

// Configuraciones de formas predefinidas
const SHAPE_PRESETS = {
  star: {
    name: 'Estrella',
    icon: <Star size={20} />,
    description: 'Estrella personalizable',
    params: {
      points: { label: 'Puntas', min: 3, max: 20, default: 5 },
      innerRadius: { label: 'Radio interno', min: 0.1, max: 0.9, default: 0.5 },
      outerRadius: { label: 'Radio externo', min: 50, max: 200, default: 100 }
    }
  },
  heart: {
    name: 'Corazón',
    icon: <Heart size={20} />,
    description: 'Corazón matemático perfecto',
    params: {
      size: { label: 'Tamaño', min: 50, max: 200, default: 100 },
      curve: { label: 'Curvatura', min: 0.5, max: 2, default: 1 }
    }
  },
  arrow: {
    name: 'Flecha',
    icon: <ArrowRight size={20} />,
    description: 'Flecha direccional',
    params: {
      length: { label: 'Longitud', min: 50, max: 300, default: 150 },
      headSize: { label: 'Tamaño punta', min: 0.2, max: 0.8, default: 0.4 },
      thickness: { label: 'Grosor', min: 5, max: 50, default: 20 }
    }
  },
  bubble: {
    name: 'Burbuja',
    icon: <ChatCircle size={20} />,
    description: 'Burbuja de diálogo',
    params: {
      width: { label: 'Ancho', min: 80, max: 250, default: 150 },
      height: { label: 'Alto', min: 50, max: 200, default: 100 },
      tailPosition: { label: 'Posición cola', min: 0.1, max: 0.9, default: 0.3 }
    }
  },
  lightning: {
    name: 'Rayo',
    icon: <Lightning size={20} />,
    description: 'Rayo eléctrico',
    params: {
      height: { label: 'Altura', min: 80, max: 250, default: 150 },
      zigzag: { label: 'Zigzag', min: 2, max: 8, default: 4 },
      width: { label: 'Ancho', min: 30, max: 100, default: 60 }
    }
  },
  polygon: {
    name: 'Polígono',
    icon: <Polygon size={20} />,
    description: 'Polígono personalizable',
    params: {
      sides: { label: 'Lados', min: 3, max: 20, default: 6 },
      radius: { label: 'Radio', min: 50, max: 200, default: 100 }
    }
  }
};

/**
 * Generadores de formas vectoriales con Konva
 */
const ShapeGenerators = {
  star: (params) => {
    const { points = 5, innerRadius = 0.5, outerRadius = 100 } = params;
    const step = Math.PI / points;
    let path = '';
    
    for (let i = 0; i <= 2 * points; i++) {
      const radius = i % 2 === 0 ? outerRadius : outerRadius * innerRadius;
      const x = Math.cos(i * step - Math.PI / 2) * radius;
      const y = Math.sin(i * step - Math.PI / 2) * radius;
      path += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
    }
    path += 'Z';
    return path;
  },

  heart: (params) => {
    const { size = 100, curve = 1 } = params;
    const scale = size / 100;
    const c = curve;
    
    // Corregir el path del corazón para que se vea correctamente
    return `M 0,${20 * scale * c} 
            C 0,${10 * scale * c} ${15 * scale},${0 * scale * c} ${30 * scale},${10 * scale * c}
            C ${45 * scale},${0 * scale * c} ${60 * scale},${10 * scale * c} ${60 * scale},${20 * scale * c}
            C ${60 * scale},${35 * scale * c} ${30 * scale},${60 * scale * c} 0,${80 * scale * c}
            C ${-30 * scale},${60 * scale * c} ${-60 * scale},${35 * scale * c} ${-60 * scale},${20 * scale * c}
            C ${-60 * scale},${10 * scale * c} ${-45 * scale},${0 * scale * c} ${-30 * scale},${10 * scale * c}
            C ${-15 * scale},${0 * scale * c} 0,${10 * scale * c} 0,${20 * scale * c} Z`;
  },

  arrow: (params) => {
    const { length = 150, headSize = 0.4, thickness = 20 } = params;
    const headLength = length * headSize;
    const bodyLength = length - headLength;
    const halfThickness = thickness / 2;
    const headWidth = thickness * 1.5;
    
    return `M 0,${-halfThickness}
            L ${bodyLength},${-halfThickness}
            L ${bodyLength},${-headWidth / 2}
            L ${length},0
            L ${bodyLength},${headWidth / 2}
            L ${bodyLength},${halfThickness}
            L 0,${halfThickness} Z`;
  },

  bubble: (params) => {
    const { width = 150, height = 100, tailPosition = 0.3 } = params;
    const rx = 20; // Radio de esquinas
    const tailX = width * tailPosition;
    const tailHeight = 20;
    
    return `M ${rx},0
            L ${width - rx},0
            Q ${width},0 ${width},${rx}
            L ${width},${height - rx}
            Q ${width},${height} ${width - rx},${height}
            L ${tailX + 10},${height}
            L ${tailX},${height + tailHeight}
            L ${tailX - 10},${height}
            L ${rx},${height}
            Q 0,${height} 0,${height - rx}
            L 0,${rx}
            Q 0,0 ${rx},0 Z`;
  },

  lightning: (params) => {
    const { height = 150, zigzag = 4, width = 60 } = params;
    const step = height / zigzag;
    const halfWidth = width / 2;
    
    // Crear un rayo más simétrico y realista
    let path = `M ${-halfWidth * 0.2},0`;
    
    // Lado izquierdo del rayo
    for (let i = 1; i <= zigzag; i++) {
      const y = step * i;
      const x = i % 2 === 1 ? -halfWidth * 0.8 : -halfWidth * 0.3;
      path += ` L ${x},${y}`;
    }
    
    // Punta inferior
    path += ` L ${-halfWidth * 0.1},${height}`;
    path += ` L ${halfWidth * 0.1},${height}`;
    
    // Lado derecho del rayo (simétrico)
    for (let i = zigzag - 1; i >= 1; i--) {
      const y = step * i;
      const x = i % 2 === 1 ? halfWidth * 0.3 : halfWidth * 0.8;
      path += ` L ${x},${y}`;
    }
    
    path += ' Z';
    return path;
  },

  polygon: (params) => {
    const { sides = 6, radius = 100 } = params;
    const angle = (2 * Math.PI) / sides;
    let path = '';
    
    // Asegurar que el radio sea un número válido
    const validRadius = Math.max(10, Math.min(500, radius || 100));
    
    for (let i = 0; i < sides; i++) {
      const x = Math.cos(i * angle - Math.PI / 2) * validRadius;
      const y = Math.sin(i * angle - Math.PI / 2) * validRadius;
      path += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
    }
    path += 'Z';
    return path;
  }
};

/**
 * Modal para crear formas vectoriales personalizadas con Konva
 */
const KonvaShapesModal = React.memo(({ open, onClose }) => {
  // Debug del modal
  console.log('🎨 [KonvaShapesModal] Renderizando con props:', { open, onClose: !!onClose });
  
  // Estados del modal
  const [selectedShape, setSelectedShape] = useState('star');
  const [shapeParams, setShapeParams] = useState(SHAPE_PRESETS.star.params);
  const [currentParams, setCurrentParams] = useState({});
  const [shapeColor, setShapeColor] = useState('#1F64BF');
  const [strokeColor, setStrokeColor] = useState('#032CA6');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [previewPath, setPreviewPath] = useState('');

  // Referencias
  const stageRef = useRef();
  const layerRef = useRef();

  // Store del editor
  const { canvas, addNotification, saveToHistory, addVectorShape } = useEditorStore();

  // ==================== EFECTOS ====================

  // Debug del estado del modal
  useEffect(() => {
    console.log('🎨 [KonvaShapesModal] Estado del modal cambió:', { open });
    if (open) {
      console.log('🎨 [KonvaShapesModal] Modal debería estar visible ahora');
      // Verificar si el modal está en el DOM
      setTimeout(() => {
        const modalElement = document.querySelector('[role="dialog"]');
        console.log('🎨 [KonvaShapesModal] Elemento modal en DOM:', !!modalElement);
        if (modalElement) {
          console.log('🎨 [KonvaShapesModal] Z-index del modal:', window.getComputedStyle(modalElement).zIndex);
        }
      }, 100);
    }
  }, [open]);

  // Inicializar parámetros cuando cambia la forma
  useEffect(() => {
    if (selectedShape && SHAPE_PRESETS[selectedShape]) {
      const preset = SHAPE_PRESETS[selectedShape];
      setShapeParams(preset.params);
      
      // Establecer valores por defecto
      const defaultParams = {};
      Object.keys(preset.params).forEach(key => {
        defaultParams[key] = preset.params[key].default;
      });
      setCurrentParams(defaultParams);
    }
  }, [selectedShape]);

  // Generar preview cuando cambian los parámetros
  useEffect(() => {
    if (selectedShape && ShapeGenerators[selectedShape] && Object.keys(currentParams).length > 0) {
      try {
        const path = ShapeGenerators[selectedShape](currentParams);
        setPreviewPath(path);
      } catch (error) {
        console.error('Error generando preview:', error);
      }
    }
  }, [selectedShape, currentParams]);

  // ==================== HANDLERS ====================

  /**
   * Cambia la forma seleccionada
   */
  const handleShapeSelect = useCallback((shapeType) => {
    setSelectedShape(shapeType);
  }, []);

  /**
   * Actualiza un parámetro de la forma
   */
  const handleParamChange = useCallback((paramName, value) => {
    setCurrentParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  }, []);

  /**
   * Convierte forma de Konva a objeto de Fabric.js
   */
  const convertKonvaToFabric = useCallback(async () => {
    if (!previewPath || !canvas) return null;

    try {
      // Crear un path de Fabric.js desde el path SVG generado
      const fabricPath = new fabric.Path(previewPath, {
        fill: shapeColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        originX: 'center',
        originY: 'center',
        selectable: true,
        evented: true,
        // Metadatos para compatibilidad con backend
        data: {
          type: 'path',
          areaId: null, // Se asignará cuando se coloque en un área
          konvaAttrs: {
            x: canvas.getWidth() / 2,
            y: canvas.getHeight() / 2,
            width: 200, // Se calculará automáticamente
            height: 200,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            fill: shapeColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            // Datos vectoriales específicos
            shapeType: selectedShape,
            pathData: previewPath,
            vectorParams: { ...currentParams },
            isVectorShape: true,
            konvaOrigin: true
          },
          isCustomElement: true,
          id: `konva_${selectedShape}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });

      return fabricPath;
    } catch (error) {
      console.error('Error convirtiendo Konva a Fabric:', error);
      return null;
    }
  }, [previewPath, shapeColor, strokeColor, strokeWidth, selectedShape, currentParams, canvas]);

  /**
   * Agrega la forma al canvas principal
   */
  const handleAddShape = useCallback(async () => {
    try {
      const fabricShape = await convertKonvaToFabric();
      
      if (fabricShape) {
        // Usar la función del store para agregar la forma vectorial
        addVectorShape(fabricShape);
        
        addNotification({
          type: 'success',
          title: 'Forma agregada',
          message: `${SHAPE_PRESETS[selectedShape]?.name} agregada al diseño`
        });

        // Cerrar modal
        onClose();
      } else {
        throw new Error('No se pudo crear la forma');
      }
    } catch (error) {
      console.error('Error agregando forma:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo agregar la forma al diseño'
      });
    }
  }, [convertKonvaToFabric, addVectorShape, addNotification, selectedShape, onClose]);

  /**
   * Renderiza el preview de la forma
   */
  const renderPreview = useCallback(() => {
    if (!previewPath) return null;

    // Calcular dimensiones del viewBox basado en la forma
    const bounds = calculatePathBounds(previewPath);
    const padding = 20;
    const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`;

    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(31, 100, 191, 0.2)'
        }}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox={viewBox}
          style={{ maxWidth: '180px', maxHeight: '180px' }}
        >
          <path
            d={previewPath}
            fill={shapeColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            transform="translate(0, 0)"
          />
        </svg>
      </Box>
    );
  }, [previewPath, shapeColor, strokeColor, strokeWidth]);

  // ==================== UTILIDADES ====================

  /**
   * Calcula los límites de un path SVG
   */
  const calculatePathBounds = (pathString) => {
    // Función simple para calcular bounds (en producción usarías una librería)
    const commands = pathString.match(/[MLQCZ][^MLQCZ]*/gi) || [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    commands.forEach(cmd => {
      const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      for (let i = 0; i < coords.length; i += 2) {
        if (coords[i] !== undefined && coords[i + 1] !== undefined) {
          minX = Math.min(minX, coords[i]);
          maxX = Math.max(maxX, coords[i]);
          minY = Math.min(minY, coords[i + 1]);
          maxY = Math.max(maxY, coords[i + 1]);
        }
      }
    });
    
    return {
      minX: minX === Infinity ? -100 : minX,
      minY: minY === Infinity ? -100 : minY,
      maxX: maxX === -Infinity ? 100 : maxX,
      maxY: maxY === -Infinity ? 100 : maxY,
      width: maxX === -Infinity ? 200 : maxX - minX,
      height: maxY === -Infinity ? 200 : maxY - minY
    };
  };

  // ==================== RENDER ====================

  return (
    <KonvaModal
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      disablePortal={false}
      style={{ zIndex: 9999 }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        color: THEME_COLORS.text,
        fontWeight: 700,
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaintBrush size={24} />
          Formas Vectoriales Personalizadas
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Panel izquierdo - Selección de formas */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 2 }}>
              Tipo de Forma
            </Typography>
            
            <Stack spacing={2}>
              {Object.entries(SHAPE_PRESETS).map(([key, preset]) => (
                <ShapeCard
                  key={key}
                  selected={selectedShape === key}
                  onClick={() => handleShapeSelect(key)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: THEME_COLORS.primary }}>
                        {preset.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                          {preset.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: THEME_COLORS.text, opacity: 0.7 }}>
                          {preset.description}
                        </Typography>
                      </Box>
                      {selectedShape === key && (
                        <CheckIcon size={16} color={THEME_COLORS.primary} />
                      )}
                    </Box>
                  </CardContent>
                </ShapeCard>
              ))}
            </Stack>
          </Grid>

          {/* Panel central - Preview */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 2 }}>
              Vista Previa
            </Typography>
            
            {renderPreview()}

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 2 }}>
                Colores
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                    Color de relleno
                  </Typography>
                  <ColorPicker
                    currentcolor={shapeColor}
                    onChange={setShapeColor}
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                    Color de borde
                  </Typography>
                  <ColorPicker
                    currentcolor={strokeColor}
                    onChange={setStrokeColor}
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                    Grosor de borde: {strokeWidth}px
                  </Typography>
                  <Slider
                    value={strokeWidth}
                    onChange={(e, value) => setStrokeWidth(value)}
                    min={0}
                    max={10}
                    step={0.5}
                    sx={{
                      '& .MuiSlider-track': {
                        background: `linear-gradient(90deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`
                      },
                      '& .MuiSlider-thumb': {
                        backgroundColor: THEME_COLORS.primary
                      }
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Panel derecho - Parámetros */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 2 }}>
              Parámetros
            </Typography>
            
            {selectedShape && shapeParams && (
              <Stack spacing={3}>
                {Object.entries(shapeParams).map(([paramName, paramConfig]) => (
                  <Box key={paramName}>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                      {paramConfig.label}: {currentParams[paramName] || paramConfig.default}
                    </Typography>
                    
                    {paramConfig.min !== undefined ? (
                      <Slider
                        value={currentParams[paramName] || paramConfig.default}
                        onChange={(e, value) => handleParamChange(paramName, value)}
                        min={paramConfig.min}
                        max={paramConfig.max}
                        step={paramConfig.step || 1}
                        sx={{
                          '& .MuiSlider-track': {
                            background: `linear-gradient(90deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`
                          },
                          '& .MuiSlider-thumb': {
                            backgroundColor: THEME_COLORS.primary
                          }
                        }}
                      />
                    ) : (
                      <TextField
                        type="number"
                        value={currentParams[paramName] || paramConfig.default}
                        onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))}
                        size="small"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px'
                          }
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            )}

            <Divider sx={{ my: 3, borderColor: 'rgba(31, 100, 191, 0.2)' }} />

            <Box>
              <Typography variant="subtitle2" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 1 }}>
                Información
              </Typography>
              <Typography variant="caption" sx={{ color: THEME_COLORS.text, opacity: 0.7 }}>
                Las formas se crearán como vectores editables y se convertirán automáticamente para su uso en el editor principal.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, background: 'rgba(248, 249, 250, 0.8)' }}>
        <Button
          onClick={onClose}
          sx={{ 
            color: THEME_COLORS.text,
            borderRadius: '8px'
          }}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleAddShape}
          variant="contained"
          disabled={!previewPath}
          startIcon={<CheckIcon size={16} />}
          sx={{ 
            background: `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(31, 100, 191, 0.3)',
            '&:hover': {
              background: `linear-gradient(135deg, ${THEME_COLORS.primaryDark}, ${THEME_COLORS.accent})`
            },
            '&:disabled': {
              background: 'rgba(31, 100, 191, 0.3)'
            }
          }}
        >
          Agregar Forma
        </Button>
      </DialogActions>
    </KonvaModal>
  );
});

KonvaShapesModal.displayName = 'KonvaShapesModal';

export default KonvaShapesModal;