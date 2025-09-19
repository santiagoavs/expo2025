import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import { CANVAS_CONFIG, calculateScaledDimensions } from '../KonvaDesignEditor/constants/canvasConfig';
import { EDITOR_THEME, EDITOR_LAYOUT, CANVAS_RENDERING } from './constants/editorConfig';
import { useUnifiedCanvasCentering } from '../KonvaDesignEditor/hooks/useUnifiedCanvasCentering';
import { GridPattern } from './components/GridPattern';
import { ExportService } from './services/ExportService';
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
      container.style.zIndex = '3000'; // Mayor que el editor (2000)
    }
  }
});

// Estilos personalizados modernos
const EditorOverlay = styled(Box, {
  name: 'KonvaAreaEditor-Overlay',
  slot: 'ModalBackdrop'
})(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  backdropFilter: 'blur(12px)',
  padding: theme.spacing(2),
}));

const EditorContainer = styled(Box, {
  name: 'KonvaAreaEditor-Container',
  slot: 'MainEditorWindow'
})(({ theme }) => ({
  background: EDITOR_THEME.gradients.container,
  borderRadius: EDITOR_THEME.borderRadius.container,
  width: EDITOR_LAYOUT.container.width,
  height: EDITOR_LAYOUT.container.height,
  maxWidth: EDITOR_LAYOUT.container.maxWidth,
  maxHeight: EDITOR_LAYOUT.container.maxHeight,
  overflow: 'hidden',
  boxShadow: EDITOR_THEME.shadows.container,
  border: `1px solid ${EDITOR_THEME.colors.border}`,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: EDITOR_THEME.borderRadius.container,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    pointerEvents: 'none',
  },
}));

const EditorHeader = styled(Box, {
  name: 'KonvaAreaEditor-Header',
  slot: 'TopToolbar'
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(3, 4),
  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
  borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
  borderRadius: '24px 24px 0 0',
  position: 'relative',
  zIndex: 1,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
  },
}));

const EditorTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  fontWeight: 700,
  fontSize: '1.25rem',
  color: '#1e293b',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
}));

const Toolbar = styled(Box, {
  name: 'KonvaAreaEditor-Toolbar',
  slot: 'ActionButtons'
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 4),
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.4) 100%)',
  borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
  position: 'relative',
  zIndex: 1,
}));

const ToolbarGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1),
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.5)',
  border: '1px solid rgba(226, 232, 240, 0.5)',
}));

const ToolButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1.5, 2.5),
  borderRadius: '10px',
  fontSize: '0.875rem',
  textTransform: 'none',
  gap: theme.spacing(1),
  fontWeight: 500,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  '&.MuiButton-contained': {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    },
  },
}));

const EditorContent = styled(Box, {
  name: 'KonvaAreaEditor-Content',
  slot: 'MainContentArea'
})(({ theme }) => ({
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const CanvasContainer = styled(Box, {
  name: 'KonvaAreaEditor-CanvasContainer',
  slot: 'MainCanvasWrapper'
})(({ theme }) => ({
  flex: 1,
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
  borderRight: '1px solid rgba(226, 232, 240, 0.6)',
  // ✅ CORREGIDO: Sin padding para usar todo el espacio disponible
  padding: 0,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
  [theme.breakpoints.down('md')]: {
    borderRight: 'none',
    borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
    minHeight: '60vh',
    padding: 0,
  },
}));

const PropertiesPanel = styled(Box, {
  name: 'KonvaAreaEditor-PropertiesPanel',
  slot: 'RightSidebar'
})(({ theme }) => ({
  width: EDITOR_LAYOUT.panels.properties.width,
  background: EDITOR_THEME.gradients.panel,
  display: 'flex',
  flexDirection: 'column',
  borderLeft: `1px solid ${EDITOR_THEME.colors.border}`,
  borderRadius: `0 0 ${EDITOR_THEME.borderRadius.container} 0`,
  position: 'relative',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)',
    borderRadius: `0 0 ${EDITOR_THEME.borderRadius.container} 0`,
    pointerEvents: 'none',
  },
  [theme.breakpoints.down('lg')]: {
    width: EDITOR_LAYOUT.panels.properties.widthLg,
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxHeight: '40vh',
    borderRadius: `0 0 ${EDITOR_THEME.borderRadius.container} ${EDITOR_THEME.borderRadius.container}`,
  },
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.7) 100%)',
  borderRadius: '0 0 16px 0',
  position: 'relative',
  zIndex: 2,
}));

const PropertyGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2, 3),
  background: 'rgba(255, 255, 255, 0.6)',
  borderRadius: '12px',
  border: '1px solid rgba(226, 232, 240, 0.5)',
  '&:last-child': {
    marginBottom: 0,
  },
}));

const PropertyGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(1.5),
}));

const EditorFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 4),
  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
  borderTop: '1px solid rgba(226, 232, 240, 0.6)',
  borderRadius: '0 0 24px 24px',
  position: 'relative',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
  },
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
        stroke={isSelected ? CANVAS_RENDERING.areas.selected.strokeColor : (area.konvaConfig?.strokeColor || CANVAS_RENDERING.areas.default.strokeColor)}
        strokeWidth={(isSelected ? CANVAS_RENDERING.areas.selected.strokeWidth : (area.konvaConfig?.strokeWidth || CANVAS_RENDERING.areas.default.strokeWidth)) / stageScale}
        fill={isSelected ? CANVAS_RENDERING.areas.selected.fillOpacity : (area.konvaConfig?.strokeColor || CANVAS_RENDERING.areas.default.strokeColor)}
        opacity={isSelected ? CANVAS_RENDERING.areas.selected.fillOpacity : (area.konvaConfig?.fillOpacity || CANVAS_RENDERING.areas.default.fillOpacity)}
        cornerRadius={area.konvaConfig?.cornerRadius || CANVAS_RENDERING.areas.default.cornerRadius}
        dash={isSelected ? CANVAS_RENDERING.areas.selected.dash : (area.konvaConfig?.dash || CANVAS_RENDERING.areas.default.dash)}
        shadowColor={isSelected ? CANVAS_RENDERING.areas.selected.shadowColor : 'rgba(0, 0, 0, 0.1)'}
        shadowBlur={isSelected ? CANVAS_RENDERING.areas.selected.shadowBlur : 4}
        shadowOffset={isSelected ? CANVAS_RENDERING.areas.selected.shadowOffset : { x: 1, y: 1 }}
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
            // ✅ VALIDACIÓN MEJORADA: Limitar redimensionado a mínimo 10px (igual que el backend)
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          resizeEnabled={true}
          borderEnabled={true}
          anchorSize={CANVAS_RENDERING.transformer.anchorSize}
          borderStroke={CANVAS_RENDERING.transformer.borderStroke}
          borderStrokeWidth={CANVAS_RENDERING.transformer.borderStrokeWidth}
          anchorStroke={CANVAS_RENDERING.transformer.anchorStroke}
          anchorFill={CANVAS_RENDERING.transformer.anchorFill}
          anchorStrokeWidth={CANVAS_RENDERING.transformer.anchorStrokeWidth}
          keepRatio={false}
          centeredScaling={false}
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

  // ✅ UNIFICADO: Usar hook compartido para centrado del canvas
  const {
    stageScale,
    stagePosition,
    handleWheel,
    zoomIn,
    zoomOut,
    resetZoom
  } = useUnifiedCanvasCentering(image, containerRef);

  // ✅ NUEVO: Servicio de exportación optimizado
  const exportService = new ExportService();


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
      },
      zIndex: 3000
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
      
      // ✅ VALIDACIÓN AGREGADA: Alto y ancho mínimo de 10px (igual que el backend)
      if (area.position.width < 10) {
        errors.push(`Área ${index + 1}: Ancho mínimo 10px`);
      }
      
      if (area.position.height < 10) {
        errors.push(`Área ${index + 1}: Alto mínimo 10px`);
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
        },
        zIndex: 3000
      });
      return;
    }

    // ✅ MEJORADO: Exportar con resoluciones optimizadas para Cloudinary
    try {
      if (stageRef.current) {
        const exportResult = await exportService.exportStage(stageRef.current, {
          format: 'png',
          quality: 0.9,
          pixelRatio: 2,
          targetResolution: 'areas' // Usar configuración para áreas
        });

        if (exportResult.success) {
          console.log('💾 [KonvaAreaEditor] Áreas exportadas con resolución optimizada:', {
            dimensions: exportResult.dimensions,
            cloudinaryConfig: exportResult.cloudinaryConfig,
            metadata: exportResult.metadata
          });
        }
      }
    } catch (exportError) {
      console.warn('⚠️ [KonvaAreaEditor] Error en exportación (continuando con guardado):', exportError);
    }
    
    onSaveAreas(areas);
  }, [areas, validateAreas, onSaveAreas, exportService]);

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

          <ToolbarGroup>
            <ToolButton
              variant="outlined"
              color="success"
              startIcon={<SaveIcon size={16} />}
              onClick={async () => {
                try {
                  if (stageRef.current) {
                    const exportResult = await exportService.exportStage(stageRef.current, {
                      format: 'png',
                      quality: 0.9,
                      pixelRatio: 2,
                      targetResolution: 'areas'
                    });

                    if (exportResult.success) {
                      // Crear enlace de descarga
                      const link = document.createElement('a');
                      link.download = `areas-${Date.now()}.png`;
                      link.href = exportResult.dataURL;
                      link.click();
                      
                      Swal.fire({
                        title: 'Exportado exitosamente',
                        text: `Imagen exportada con resolución ${exportResult.dimensions.width}x${exportResult.dimensions.height}px`,
                        icon: 'success',
                        confirmButtonColor: '#1F64BF',
                        backdrop: `rgba(0,0,0,0.7)`,
                        customClass: {
                          container: 'swal-overlay-custom',
                          popup: 'swal-modal-custom'
                        },
                        zIndex: 3000
                      });
                    }
                  }
                } catch (error) {
                  console.error('Error en exportación:', error);
                  Swal.fire({
                    title: 'Error en exportación',
                    text: error.message,
                    icon: 'error',
                    confirmButtonColor: '#1F64BF',
                    backdrop: `rgba(0,0,0,0.7)`,
                    customClass: {
                      container: 'swal-overlay-custom',
                      popup: 'swal-modal-custom'
                    },
                    zIndex: 3000
                  });
                }
              }}
            >
              Exportar
            </ToolButton>
          </ToolbarGroup>
        </Toolbar>

        {/* Main content */}
        <EditorContent>
          {/* Canvas */}
          <CanvasContainer ref={containerRef}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: `
                  0 20px 25px -5px rgba(0, 0, 0, 0.1),
                  0 10px 10px -5px rgba(0, 0, 0, 0.04),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              }}
            >
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
                pixelRatio={window.devicePixelRatio || 1}
                listening={true}
              >
              <Layer>
                {/* Grid compartido */}
                <GridPattern 
                  width={stageDimensions.width}
                  height={stageDimensions.height}
                  showGrid={showGrid}
                  stageScale={stageScale}
                />
                
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

                {/* ✅ INDICADORES VISUALES DE ERROR MEJORADOS */}
                {areas.map((area, index) => {
                  const hasError = area.position.width < 10 || area.position.height < 10;
                  if (!hasError) return null;
                  
                  return (
                    <Text
                      key={`error-${index}`}
                      x={area.position.x}
                      y={area.position.y + area.position.height + 8}
                      text={`⚠️ Área ${index + 1}: Muy pequeña (mín. 10x10px)`}
                      fontSize={Math.max(10, 12 / stageScale)}
                      fill="#ef4444"
                      fontStyle="bold"
                      listening={false}
                      shadowColor="rgba(255, 255, 255, 0.8)"
                      shadowBlur={2}
                      shadowOffset={{ x: 1, y: 1 }}
                    />
                  );
                })}

                {/* Labels mejorados */}
                {showLabels && areas.map((area, index) => (
                  <Text
                    key={`label-${index}`}
                    x={area.position.x}
                    y={area.position.y - 25}
                    text={area.displayName || area.name}
                    fontSize={Math.max(12, 14 / stageScale)}
                    fill="#1e293b"
                    fontStyle="bold"
                    listening={false}
                    shadowColor="rgba(255, 255, 255, 0.9)"
                    shadowBlur={3}
                    shadowOffset={{ x: 1, y: 1 }}
                    padding={4}
                    background="rgba(255, 255, 255, 0.8)"
                    cornerRadius={4}
                  />
                ))}
              </Layer>
            </Stage>
            </Box>
          </CanvasContainer>

          {/* Properties panel */}
          <PropertiesPanel>
            <PanelHeader>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: EDITOR_THEME.colors.text }}>
                  Propiedades del Área
                </Typography>
                {selectedArea ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ 
                      bgcolor: 'rgba(59, 130, 246, 0.1)', 
                      color: EDITOR_THEME.colors.primary,
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: 2,
                      display: 'inline-block',
                      fontWeight: 500
                    }}>
                      ✓ Área {selectedAreaIndex + 1} seleccionada
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: EDITOR_THEME.colors.textSecondary,
                      opacity: 0.8
                    }}>
                      {selectedArea.displayName || selectedArea.name}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ 
                    color: EDITOR_THEME.colors.textSecondary,
                    opacity: 0.7
                  }}>
                    Selecciona un área para editar sus propiedades
                  </Typography>
                )}
              </Box>
            </PanelHeader>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {selectedArea ? (
                <>
                  {/* Basic properties */}
                  <PropertyGroup>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ 
                      color: EDITOR_THEME.colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      📝 Información Básica
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
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ 
                      color: EDITOR_THEME.colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      📐 Posición y Tamaño
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
                        inputProps={{ min: 10 }}
                        error={selectedArea.position.width < 10}
                        helperText={selectedArea.position.width < 10 ? "Mínimo 10px" : ""}
                      />
                      
                      <TextField
                        label="Alto"
                        value={selectedArea.position.height}
                        onChange={(e) => updateSelectedArea('position.height', e.target.value)}
                        type="number"
                        size="small"
                        margin="dense"
                        inputProps={{ min: 10 }}
                        error={selectedArea.position.height < 10}
                        helperText={selectedArea.position.height < 10 ? "Mínimo 10px" : ""}
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
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ 
                      color: EDITOR_THEME.colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      ⚙️ Configuración de Elementos
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
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ 
                      color: EDITOR_THEME.colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      🎨 Apariencia
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

        {/* Footer mejorado */}
        <EditorFooter>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Áreas definidas: {areas.length}
              {selectedArea && (
                <>
                  {' • '}
                  Área seleccionada: {selectedArea.name}
                </>
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
              Canvas: {stageDimensions.width}×{stageDimensions.height}px • 
              Zoom: {Math.round(stageScale * 100)}% • 
              Resolución exportación: 800×600px (optimizada para Cloudinary)
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              color="inherit"
              sx={{
                borderRadius: EDITOR_THEME.borderRadius.button,
                borderColor: EDITOR_THEME.colors.border,
                color: EDITOR_THEME.colors.textSecondary,
                px: 3,
                py: 1.5,
                fontWeight: 500,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: EDITOR_THEME.colors.primary,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  transform: 'translateY(-1px)',
                  boxShadow: EDITOR_THEME.shadows.buttonHover
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon size={16} />}
              onClick={handleSave}
              sx={{
                borderRadius: EDITOR_THEME.borderRadius.button,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                px: 3,
                py: 1.5,
                fontWeight: 500,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: EDITOR_THEME.shadows.button,
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: EDITOR_THEME.shadows.buttonHover
                }
              }}
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