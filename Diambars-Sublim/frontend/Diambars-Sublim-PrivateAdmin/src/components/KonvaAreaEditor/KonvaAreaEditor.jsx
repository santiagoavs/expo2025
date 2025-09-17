import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import { CANVAS_CONFIG, calculateScaledDimensions } from '../KonvaDesignEditor/constants/canvasConfig';
import Swal from 'sweetalert2';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  styled,
  useTheme
} from '@mui/material';
import {
  X as CloseIcon,
  FloppyDisk as SaveIcon,
  Plus as AddIcon,
  Trash as DeleteIcon,
  ArrowsOut as MoveIcon,
  Pencil as EditIcon,
  Eye as EyeIcon,
  MagnifyingGlassPlus as ZoomInIcon,
  MagnifyingGlassMinus as ZoomOutIcon,
  SquaresFour as GridIcon,
  Copy as DuplicateIcon,
  ArrowCounterClockwise as ResetIcon
} from '@phosphor-icons/react';

// Configuración global de SweetAlert2
Swal.mixin({
  customClass: {
    container: 'swal-overlay-custom',
    popup: 'swal-modal-custom'
  },
  didOpen: () => {
    const container = document.querySelector('.swal-overlay-custom');
    if (container) {
      container.style.zIndex = '2100';
    }
  }
});

// Estilos personalizados
const EditorOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(1, 3, 38, 0.9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  backdropFilter: 'blur(5px)',
}));

const EditorContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  width: '95vw',
  height: '95vh',
  maxWidth: '1400px',
  maxHeight: '900px',
  overflow: 'hidden',
  boxShadow: theme.shadows[10],
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
}));

const EditorHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  background: `linear-gradient(135deg, ${theme.palette.grey[100]}, ${theme.palette.primary.light}0D)`,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const EditorTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontWeight: 700,
}));

const Toolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

const ToolbarGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ToolButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
  borderRadius: '8px',
  fontSize: '0.8125rem',
  textTransform: 'none',
  gap: theme.spacing(1),
}));

const EditorContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const CanvasContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.palette.grey[50],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
  borderRight: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('md')]: {
    borderRight: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: '60vh',
  },
}));

const PropertiesPanel = styled(Box)(({ theme }) => ({
  width: '320px',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  borderLeft: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('lg')]: {
    width: '280px',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxHeight: '40vh',
  },
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: `linear-gradient(135deg, ${theme.palette.grey[100]}, ${theme.palette.primary.light}05)`,
}));

const PropertyGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
    marginBottom: 0,
  },
}));

const PropertyGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(1),
}));

const EditorFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 3),
  background: `linear-gradient(135deg, ${theme.palette.grey[100]}, ${theme.palette.primary.light}05)`,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

// Componente AreaRect para representar cada área
const AreaRect = ({ area, isSelected, onSelect, onChange, stageScale }) => {
  const rectRef = useRef();
  const transformerRef = useRef();

  useEffect(() => {
    if (isSelected && transformerRef.current && rectRef.current) {
      transformerRef.current.nodes([rectRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = useCallback(() => {
    if (!rectRef.current) return;

    const node = rectRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update width/height
    node.scaleX(1);
    node.scaleY(1);

    const newArea = {
      ...area,
      position: {
        ...area.position,
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.round(node.width() * scaleX),
        height: Math.round(node.height() * scaleY),
        rotationDegree: Math.round(node.rotation())
      }
    };

    onChange(newArea);
  }, [area, onChange]);

  return (
    <>
      <Rect
        ref={rectRef}
        x={area.position.x}
        y={area.position.y}
        width={area.position.width}
        height={area.position.height}
        rotation={area.position.rotationDegree || 0}
        stroke={area.konvaConfig?.strokeColor || '#1F64BF'}
        strokeWidth={(area.konvaConfig?.strokeWidth || 2) / stageScale}
        fill={area.konvaConfig?.strokeColor || '#1F64BF'}
        opacity={area.konvaConfig?.fillOpacity || 0.2}
        cornerRadius={area.konvaConfig?.cornerRadius || 0}
        dash={area.konvaConfig?.dash || [5, 5]}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onTransformEnd={handleTransformEnd}
        onDragEnd={handleTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// Componente principal del editor
const KonvaAreaEditor = ({ 
  isOpen, 
  onClose, 
  productImage, 
  initialAreas = [], 
  onSaveAreas 
}) => {
  const theme = useTheme();
  const [areas, setAreas] = useState(initialAreas);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  // ✅ CORREGIDO: Stage dimensions SIEMPRE fijas usando constantes compartidas
  const [stageDimensions] = useState({ 
    width: CANVAS_CONFIG.width, 
    height: CANVAS_CONFIG.height 
  });
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  
  const stageRef = useRef();
  const containerRef = useRef();
  const [image] = useImage(productImage, 'anonymous');

  // ✅ CORREGIDO: Solo calcular el zoom inicial para que quepa en el contenedor
  useEffect(() => {
    if (image && containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.offsetWidth - 40;
      const containerHeight = container.offsetHeight - 40;
      
      // ✅ CORREGIDO: Calcular zoom para que el stage quepa en el contenedor
      const scaleX = containerWidth / CANVAS_CONFIG.width;
      const scaleY = containerHeight / CANVAS_CONFIG.height;
      const initialScale = Math.min(scaleX, scaleY, 1); // No ampliar, solo reducir si es necesario
      
      setStageScale(initialScale);
      
      // ✅ CORREGIDO: Centrar el stage en el contenedor
      const scaledWidth = CANVAS_CONFIG.width * initialScale;
      const scaledHeight = CANVAS_CONFIG.height * initialScale;
      const centerX = (containerWidth - scaledWidth) / 2;
      const centerY = (containerHeight - scaledHeight) / 2;
      
      setStagePosition({ x: centerX, y: centerY });
    }
  }, [image]);

  const handleAreaSelect = useCallback((index) => {
    setSelectedAreaIndex(index);
  }, []);

  const handleAreaChange = useCallback((index, newArea) => {
    setAreas(prev => prev.map((area, i) => i === index ? newArea : area));
  }, []);

  const addNewArea = useCallback(() => {
    const newArea = {
      name: `Área ${areas.length + 1}`,
      displayName: `Área ${areas.length + 1}`,
      position: {
        x: 50,
        y: 50,
        width: 150,
        height: 100,
        rotationDegree: 0
      },
      accepts: { text: true, image: true },
      maxElements: 5,
      konvaConfig: {
        strokeColor: '#1F64BF',
        strokeWidth: 2,
        fillOpacity: 0.2,
        cornerRadius: 0,
        dash: [5, 5]
      }
    };
    
    setAreas(prev => [...prev, newArea]);
    setSelectedAreaIndex(areas.length);
  }, [areas.length]);

  const deleteSelectedArea = useCallback(async () => {
    if (selectedAreaIndex === null || areas.length <= 1) return;

    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar área?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1F64BF',
      cancelButtonColor: theme.palette.error.main,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: `rgba(0,0,0,0.7)`,
      customClass: {
        container: 'swal-overlay-custom',
        popup: 'swal-modal-custom'
      }
    });

    if (isConfirmed) {
      setAreas(prev => prev.filter((_, i) => i !== selectedAreaIndex));
      setSelectedAreaIndex(null);
    }
  }, [selectedAreaIndex, areas.length, theme.palette.error.main]);

  const duplicateSelectedArea = useCallback(() => {
    if (selectedAreaIndex === null) return;

    const areaToClone = areas[selectedAreaIndex];
    const clonedArea = {
      ...areaToClone,
      name: `${areaToClone.name} (Copia)`,
      displayName: `${areaToClone.displayName} (Copia)`,
      position: {
        ...areaToClone.position,
        x: areaToClone.position.x + 20,
        y: areaToClone.position.y + 20
      }
    };
    
    setAreas(prev => [...prev, clonedArea]);
    setSelectedAreaIndex(areas.length);
  }, [selectedAreaIndex, areas]);

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(3, newScale));
    
    setStageScale(clampedScale);
    setStagePosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, []);

  const zoomIn = useCallback(() => {
    setStageScale(prev => Math.min(3, prev * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setStageScale(prev => Math.max(0.1, prev / 1.2));
  }, []);

  const resetZoom = useCallback(() => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  }, []);

  const updateSelectedArea = useCallback((field, value) => {
    if (selectedAreaIndex === null) return;

    const updatedArea = { ...areas[selectedAreaIndex] };
    
    if (field.startsWith('position.')) {
      const posField = field.replace('position.', '');
      updatedArea.position[posField] = posField === 'rotationDegree' ? value : Number(value);
    } else if (field.startsWith('accepts.')) {
      const acceptField = field.replace('accepts.', '');
      updatedArea.accepts[acceptField] = value;
    } else if (field.startsWith('konvaConfig.')) {
      const configField = field.replace('konvaConfig.', '');
      updatedArea.konvaConfig[configField] = configField === 'strokeColor' ? value : Number(value);
    } else {
      updatedArea[field] = field === 'maxElements' ? Number(value) : value;
    }
    
    handleAreaChange(selectedAreaIndex, updatedArea);
  }, [selectedAreaIndex, areas, handleAreaChange]);

  const validateAreas = useCallback(() => {
    const errors = [];
    
    areas.forEach((area, index) => {
      if (!area.name.trim()) {
        errors.push(`Área ${index + 1}: Nombre requerido`);
      }
      
      if (area.position.width <= 0 || area.position.height <= 0) {
        errors.push(`Área ${index + 1}: Dimensiones inválidas`);
      }
      
      if (!area.accepts.text && !area.accepts.image) {
        errors.push(`Área ${index + 1}: Debe aceptar al menos un tipo de elemento`);
      }
    });
    
    for (let i = 0; i < areas.length; i++) {
      for (let j = i + 1; j < areas.length; j++) {
        const a1 = areas[i].position;
        const a2 = areas[j].position;
        
        if (!(a1.x + a1.width < a2.x || 
              a2.x + a2.width < a1.x || 
              a1.y + a1.height < a2.y || 
              a2.y + a2.height < a1.y)) {
          errors.push(`Las áreas ${i + 1} y ${j + 1} se superponen`);
        }
      }
    }
    
    return errors;
  }, [areas]);

  const handleSave = useCallback(async () => {
    const errors = validateAreas();
    
    if (errors.length > 0) {
      await Swal.fire({
        title: 'Errores de validación',
        html: errors.join('<br>'),
        icon: 'error',
        confirmButtonText: 'Revisar',
        confirmButtonColor: '#1F64BF',
        backdrop: `rgba(0,0,0,0.7)`,
        customClass: {
          container: 'swal-overlay-custom',
          popup: 'swal-modal-custom'
        }
      });
      return;
    }
    
    onSaveAreas(areas);
  }, [areas, validateAreas, onSaveAreas]);

  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage()) {
      setSelectedAreaIndex(null);
    }
  }, []);

  if (!isOpen) return null;

  const selectedArea = selectedAreaIndex !== null ? areas[selectedAreaIndex] : null;

  return (
    <EditorOverlay>
      <EditorContainer>
        {/* Header */}
        <EditorHeader>
          <EditorTitle variant="h6">
            <EditIcon size={20} weight="bold" />
            Editor de Áreas de Personalización
          </EditorTitle>
          <IconButton onClick={onClose} color="inherit">
            <CloseIcon size={20} />
          </IconButton>
        </EditorHeader>

        {/* Toolbar */}
        <Toolbar>
          <ToolbarGroup>
            <ToolButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon size={16} />}
              onClick={addNewArea}
            >
              Nueva Área
            </ToolButton>
            
            <ToolButton
              variant="outlined"
              startIcon={<DuplicateIcon size={16} />}
              onClick={duplicateSelectedArea}
              disabled={selectedAreaIndex === null}
            >
              Duplicar
            </ToolButton>
            
            <ToolButton
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon size={16} />}
              onClick={deleteSelectedArea}
              disabled={selectedAreaIndex === null || areas.length <= 1}
            >
              Eliminar
            </ToolButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolButton
              variant={showGrid ? 'contained' : 'outlined'}
              startIcon={<GridIcon size={16} />}
              onClick={() => setShowGrid(!showGrid)}
            >
              Cuadrícula
            </ToolButton>
            
            <ToolButton
              variant={showLabels ? 'contained' : 'outlined'}
              startIcon={<EyeIcon size={16} />}
              onClick={() => setShowLabels(!showLabels)}
            >
              Etiquetas
            </ToolButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolButton
              variant="outlined"
              onClick={zoomOut}
              startIcon={<ZoomOutIcon size={16} />}
            />
            
            <Typography variant="body2" sx={{ px: 1 }}>
              {Math.round(stageScale * 100)}%
            </Typography>
            
            <ToolButton
              variant="outlined"
              onClick={zoomIn}
              startIcon={<ZoomInIcon size={16} />}
            />
            
            <ToolButton
              variant="outlined"
              onClick={resetZoom}
              startIcon={<ResetIcon size={16} />}
            >
              Ajustar
            </ToolButton>
          </ToolbarGroup>
        </Toolbar>

        {/* Main content */}
        <EditorContent>
          {/* Canvas */}
          <CanvasContainer ref={containerRef}>
            <Stage
              ref={stageRef}
              width={stageDimensions.width}
              height={stageDimensions.height}
              scaleX={stageScale}
              scaleY={stageScale}
              x={stagePosition.x}
              y={stagePosition.y}
              onWheel={handleWheel}
              onClick={handleStageClick}
              onTap={handleStageClick}
              draggable
            >
              <Layer>
                {/* Grid */}
                {showGrid && (
                  <>
                    {Array.from({ length: Math.ceil(stageDimensions.width / 20) + 1 }).map((_, i) => (
                      <Rect
                        key={`v-${i}`}
                        x={i * 20}
                        y={0}
                        width={1}
                        height={stageDimensions.height}
                        fill="rgba(31, 100, 191, 0.1)"
                      />
                    ))}
                    {Array.from({ length: Math.ceil(stageDimensions.height / 20) + 1 }).map((_, i) => (
                      <Rect
                        key={`h-${i}`}
                        x={0}
                        y={i * 20}
                        width={stageDimensions.width}
                        height={1}
                        fill="rgba(31, 100, 191, 0.1)"
                      />
                    ))}
                  </>
                )}
                
                {/* Background image - Usar misma lógica que KonvaDesignEditor */}
                {image && (() => {
                  // Calcular dimensiones escaladas y centradas usando la función compartida
                  const scaleX = CANVAS_CONFIG.width / image.width;
                  const scaleY = CANVAS_CONFIG.height / image.height;
                  const scale = Math.min(scaleX, scaleY) * CANVAS_CONFIG.productScale;
                  const scaledDimensions = calculateScaledDimensions(image.width, image.height, scale);
                  
                  return (
                    <KonvaImage
                      image={image}
                      x={scaledDimensions.x}
                      y={scaledDimensions.y}
                      width={scaledDimensions.width}
                      height={scaledDimensions.height}
                      listening={false}
                      opacity={0.8}
                    />
                  );
                })()}
                
                {/* Areas */}
                {areas.map((area, index) => (
                  <AreaRect
                    key={index}
                    area={area}
                    isSelected={selectedAreaIndex === index}
                    onSelect={() => handleAreaSelect(index)}
                    onChange={(newArea) => handleAreaChange(index, newArea)}
                    stageScale={stageScale}
                  />
                ))}

                {/* Labels */}
                {showLabels && areas.map((area, index) => (
                  <Text
                    key={`label-${index}`}
                    x={area.position.x}
                    y={area.position.y - 20}
                    text={area.displayName || area.name}
                    fontSize={14 / stageScale}
                    fill="#1F64BF"
                    fontStyle="bold"
                    listening={false}
                  />
                ))}
              </Layer>
            </Stage>
          </CanvasContainer>

          {/* Properties panel */}
          <PropertiesPanel>
            <PanelHeader>
              <Typography variant="subtitle1" fontWeight="bold">
                Propiedades
              </Typography>
              {selectedArea && (
                <Typography variant="caption" color="primary" sx={{ 
                  bgcolor: 'primary.light', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  display: 'inline-block',
                  mt: 1
                }}>
                  Área {selectedAreaIndex + 1} seleccionada
                </Typography>
              )}
            </PanelHeader>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {selectedArea ? (
                <>
                  {/* Basic properties */}
                  <PropertyGroup>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Información Básica
                    </Typography>
                    
                    <TextField
                      label="Nombre"
                      value={selectedArea.name}
                      onChange={(e) => updateSelectedArea('name', e.target.value)}
                      fullWidth
                      size="small"
                      margin="dense"
                    />
                    
                    <TextField
                      label="Nombre Visible"
                      value={selectedArea.displayName}
                      onChange={(e) => updateSelectedArea('displayName', e.target.value)}
                      fullWidth
                      size="small"
                      margin="dense"
                    />
                  </PropertyGroup>

                  {/* Position properties */}
                  <PropertyGroup>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Posición y Tamaño
                    </Typography>
                    
                    <PropertyGrid>
                      <TextField
                        label="X"
                        value={selectedArea.position.x}
                        onChange={(e) => updateSelectedArea('position.x', e.target.value)}
                        type="number"
                        size="small"
                        margin="dense"
                      />
                      
                      <TextField
                        label="Y"
                        value={selectedArea.position.y}
                        onChange={(e) => updateSelectedArea('position.y', e.target.value)}
                        type="number"
                        size="small"
                        margin="dense"
                      />
                      
                      <TextField
                        label="Ancho"
                        value={selectedArea.position.width}
                        onChange={(e) => updateSelectedArea('position.width', e.target.value)}
                        type="number"
                        size="small"
                        margin="dense"
                        inputProps={{ min: 1 }}
                      />
                      
                      <TextField
                        label="Alto"
                        value={selectedArea.position.height}
                        onChange={(e) => updateSelectedArea('position.height', e.target.value)}
                        type="number"
                        size="small"
                        margin="dense"
                        inputProps={{ min: 1 }}
                      />
                    </PropertyGrid>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Rotación: {selectedArea.position.rotationDegree || 0}°
                      </Typography>
                      <Slider
                        value={selectedArea.position.rotationDegree || 0}
                        onChange={(_, value) => updateSelectedArea('position.rotationDegree', value)}
                        min={-180}
                        max={180}
                        step={1}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </PropertyGroup>

                  {/* Element settings */}
                  <PropertyGroup>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Configuración de Elementos
                    </Typography>
                    
                    <TextField
                      label="Máximo de Elementos"
                      value={selectedArea.maxElements}
                      onChange={(e) => updateSelectedArea('maxElements', e.target.value)}
                      type="number"
                      fullWidth
                      size="small"
                      margin="dense"
                      inputProps={{ min: 1, max: 20 }}
                    />
                    
                    <Typography variant="caption" display="block" gutterBottom>
                      Tipos de Elementos Permitidos
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedArea.accepts.text}
                            onChange={(e) => updateSelectedArea('accepts.text', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Texto"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedArea.accepts.image}
                            onChange={(e) => updateSelectedArea('accepts.image', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Imágenes"
                      />
                    </Box>
                  </PropertyGroup>

                  {/* Visual properties */}
                  <PropertyGroup>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Apariencia
                    </Typography>
                    
                    <TextField
                      label="Color del Borde"
                      type="color"
                      value={selectedArea.konvaConfig?.strokeColor || '#1F64BF'}
                      onChange={(e) => updateSelectedArea('konvaConfig.strokeColor', e.target.value)}
                      fullWidth
                      size="small"
                      margin="dense"
                      InputLabelProps={{ shrink: true }}
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Grosor del Borde: {selectedArea.konvaConfig?.strokeWidth || 2}px
                      </Typography>
                      <Slider
                        value={selectedArea.konvaConfig?.strokeWidth || 2}
                        onChange={(_, value) => updateSelectedArea('konvaConfig.strokeWidth', value)}
                        min={1}
                        max={10}
                        step={1}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Opacidad del Relleno: {Math.round((selectedArea.konvaConfig?.fillOpacity || 0.2) * 100)}%
                      </Typography>
                      <Slider
                        value={selectedArea.konvaConfig?.fillOpacity || 0.2}
                        onChange={(_, value) => updateSelectedArea('konvaConfig.fillOpacity', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </PropertyGroup>
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  textAlign: 'center',
                  color: 'text.secondary'
                }}>
                  <MoveIcon size={48} />
                  <Typography component="div" variant="body1" sx={{ mt: 2 }}>
                    Selecciona un área para editar sus propiedades
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Haz clic en un área del canvas o usa el botón "Nueva Área" para comenzar
                  </Typography>
                </Box>
              )}
            </Box>
          </PropertiesPanel>
        </EditorContent>

        {/* Footer */}
        <EditorFooter>
          <Typography variant="caption" color="text.secondary">
            Áreas definidas: {areas.length}
            {selectedArea && (
              <>
                {' • '}
                Área seleccionada: {selectedArea.name}
              </>
            )}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              color="inherit"
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon size={16} />}
              onClick={handleSave}
            >
              Guardar Áreas
            </Button>
          </Box>
        </EditorFooter>
      </EditorContainer>
    </EditorOverlay>
  );
};

export default KonvaAreaEditor;