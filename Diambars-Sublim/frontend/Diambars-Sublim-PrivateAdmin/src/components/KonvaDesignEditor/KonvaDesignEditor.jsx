// src/components/KonvaDesignEditor/KonvaDesignEditor.jsx - EDITOR VISUAL COMPLETO Y CORREGIDO
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Tooltip,
  styled,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemText,
  Checkbox,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  X as CloseIcon,
  FloppyDisk as SaveIcon,
  Plus,
  Trash as DeleteIcon,
  MagnifyingGlassPlus as ZoomInIcon,
  MagnifyingGlassMinus as ZoomOutIcon,
  ArrowsCounterClockwise as ResetIcon,
  GridFour as GridIcon,
  Eye as PreviewIcon,
  TextT as TextIcon,
  Image as ImageIcon,
  Copy as DuplicateIcon,
  Package,
  Upload,
  FolderOpen,
  Warning,
  CheckCircle,
  Info,
  PaintBrush,
  Palette,
  Target
} from '@phosphor-icons/react';

// ================ SERVICIO DE VALIDACIÓN INTEGRADO ================
const DesignService = {
  validateElementsForSubmission: (elements) => {
    const errors = [];
    
    if (!elements || elements.length === 0) {
      errors.push('Debe agregar al menos un elemento al diseño');
    }
    
    elements.forEach((element, index) => {
      if (!element.type) {
        errors.push(`Elemento ${index + 1}: tipo no definido`);
      }
      
      if (!element.konvaAttrs) {
        errors.push(`Elemento ${index + 1}: atributos no definidos`);
      }
      
      if (element.type === 'text' && (!element.konvaAttrs?.text || !element.konvaAttrs.text.trim())) {
        errors.push(`Elemento de texto ${index + 1}: texto vacío`);
      }
      
      if (element.type === 'image' && !element.konvaAttrs?.image) {
        errors.push(`Elemento de imagen ${index + 1}: URL de imagen no definida`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ================ ESTILOS MODERNOS ================
const EditorOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(1, 3, 38, 0.95)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  backdropFilter: 'blur(8px)',
});

const EditorContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '24px',
  width: '98vw',
  height: '98vh',
  maxWidth: '1800px',
  maxHeight: '1200px',
  overflow: 'hidden',
  boxShadow: '0 24px 64px rgba(1, 3, 38, 0.24)',
  border: `1px solid ${alpha('#1F64BF', 0.12)}`,
  display: 'flex',
  flexDirection: 'column',
}));

const EditorHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px',
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  borderRadius: '24px 24px 0 0',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '150px',
    height: '150px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '50%',
    transform: 'translate(50px, -50px)',
  }
}));

const HeaderTitle = styled(Typography)({
  fontSize: '1.25rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  zIndex: 1,
});

const HeaderActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  zIndex: 1,
});

const HeaderButton = styled(Button)(({ variant: buttonVariant }) => ({
  borderRadius: '12px',
  padding: '8px 16px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  minWidth: '100px',
  ...(buttonVariant === 'contained' ? {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
    }
  } : {
    background: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
    }
  })
}));

const CloseButton = styled(IconButton)({
  color: 'white',
  background: 'rgba(255, 255, 255, 0.15)',
  width: '40px',
  height: '40px',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.25)',
  }
});

const EditorContent = styled(Box)({
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
});

// Panel izquierdo de herramientas
const ToolsPanel = styled(Paper)(({ theme }) => ({
  width: '320px',
  backgroundColor: 'white',
  borderRight: `1px solid ${alpha('#1F64BF', 0.08)}`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const PanelTabs = styled(Tabs)({
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  minHeight: '48px',
  '& .MuiTab-root': {
    minHeight: '48px',
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
  }
});

const PanelContent = styled(Box)({
  flex: 1,
  overflow: 'auto',
  padding: '0',
});

const PanelSection = styled(Box)(({ theme }) => ({
  padding: '20px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  '&:last-child': {
    borderBottom: 'none',
  }
}));

const ImageUploadDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  }
}));

const SectionTitle = styled(Typography)({
  fontSize: '1rem',
  fontWeight: 700,
  color: '#010326',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const ToolButton = styled(Button)(({ theme, active }) => ({
  width: '100%',
  justifyContent: 'flex-start',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  marginBottom: '8px',
  border: `2px solid ${active ? '#1F64BF' : 'transparent'}`,
  background: active ? alpha('#1F64BF', 0.08) : 'transparent',
  color: active ? '#1F64BF' : '#032CA6',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: alpha('#1F64BF', 0.08),
    borderColor: alpha('#1F64BF', 0.3),
  }
}));

// Canvas central
const CanvasContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: '#F8F9FA',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
  backgroundImage: `
    radial-gradient(circle at 1px 1px, ${alpha('#1F64BF', 0.15)} 1px, transparent 0)
  `,
  backgroundSize: '20px 20px',
}));

const CanvasToolbar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  right: '20px',
  display: 'flex',
  gap: '8px',
  zIndex: 10,
}));

const ToolbarButton = styled(IconButton)(({ theme, active }) => ({
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  backgroundColor: active ? '#1F64BF' : 'white',
  color: active ? 'white' : '#1F64BF',
  border: `1px solid ${alpha('#1F64BF', 0.2)}`,
  boxShadow: '0 4px 16px rgba(1, 3, 38, 0.08)',
  backdropFilter: 'blur(8px)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: active ? '#032CA6' : alpha('#1F64BF', 0.08),
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 24px rgba(1, 3, 38, 0.12)',
  }
}));

// Panel derecho de propiedades
const PropertiesPanel = styled(Paper)(({ theme }) => ({
  width: '320px',
  backgroundColor: 'white',
  borderLeft: `1px solid ${alpha('#1F64BF', 0.08)}`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
}));

const ElementsList = styled(Box)({
  maxHeight: '200px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: alpha('#1F64BF', 0.05),
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha('#1F64BF', 0.3),
    borderRadius: '3px',
    '&:hover': {
      background: alpha('#1F64BF', 0.5),
    }
  }
});

const ElementItem = styled(Box)(({ theme, selected }) => ({
  padding: '12px',
  borderRadius: '12px',
  border: `2px solid ${selected ? '#1F64BF' : 'transparent'}`,
  backgroundColor: selected ? alpha('#1F64BF', 0.05) : 'transparent',
  cursor: 'pointer',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha('#1F64BF', 0.05),
    borderColor: alpha('#1F64BF', 0.3),
  }
}));

const AreaSelector = styled(Card)({
  marginBottom: '16px',
  border: `2px solid transparent`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: alpha('#1F64BF', 0.3),
  },
  '&.selected': {
    borderColor: '#1F64BF',
    backgroundColor: alpha('#1F64BF', 0.05),
  }
});

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F8F9FA',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: alpha('#1F64BF', 0.2),
    },
    '&:hover fieldset': {
      borderColor: alpha('#1F64BF', 0.4),
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1F64BF',
      borderWidth: '2px',
    }
  }
}));

const FileUploadArea = styled(Box)(({ theme, isDragOver }) => ({
  border: `2px dashed ${isDragOver ? '#1F64BF' : alpha('#1F64BF', 0.3)}`,
  borderRadius: '12px',
  padding: '40px 20px',
  textAlign: 'center',
  backgroundColor: isDragOver ? alpha('#1F64BF', 0.05) : '#F8F9FA',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#1F64BF',
    backgroundColor: alpha('#1F64BF', 0.05),
  }
}));

// ================ UTILIDADES ================
const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a base64
      const dataURL = canvas.toDataURL('image/jpeg', quality);
      resolve(dataURL);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Aplicar filtro de color a la imagen del producto
const applyColorFilter = (imageElement, color) => {
  if (!imageElement || !color) return null;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  
  // Dibujar imagen original
  ctx.drawImage(imageElement, 0, 0);
  
  // Aplicar filtro de color usando composite operation
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Restaurar el modo normal para preservar transparencia
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(imageElement, 0, 0);
  
  return canvas;
};

// ================ COMPONENTE TEXTO EDITABLE MEJORADO ================
const EditableText = ({ 
  id,
  text, 
  x, 
  y, 
  width, 
  height, 
  fontSize, 
  fontFamily, 
  fill, 
  onUpdate, 
  isSelected, 
  onSelect,
  onStartEdit,
  isEditing,
  onFinishEdit 
}) => {
  const textRef = useRef();

  const handleDoubleClick = useCallback(() => {
    if (onStartEdit) {
      onStartEdit(id);
    }
  }, [id, onStartEdit]);

  const handleDragMove = useCallback((e) => {
    if (onUpdate) {
      onUpdate(id, {
        x: Math.round(e.target.x()),
        y: Math.round(e.target.y())
      });
    }
  }, [id, onUpdate]);

  if (isEditing) {
    return (
      <Rect
        x={x}
        y={y}
        width={width || 200}
        height={height || fontSize + 10}
        fill="rgba(31, 100, 191, 0.1)"
        stroke="#1F64BF"
        strokeWidth={2}
        dash={[5, 5]}
        listening={false}
      />
    );
  }

  return (
    <Text
      ref={textRef}
      id={id}
      x={x}
      y={y}
      text={text || 'Texto vacío'}
      fontSize={fontSize || 24}
      fontFamily={fontFamily || 'Arial'}
      fill={fill || '#000000'}
      width={width}
      height={height}
      draggable
      onClick={onSelect}
      onDblClick={handleDoubleClick}
      onDragMove={handleDragMove}
      onDragEnd={handleDragMove}
      onTransform={() => {
        const node = textRef.current;
        if (node && onUpdate) {
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          node.scaleX(1);
          node.scaleY(1);
          
          onUpdate(id, {
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            width: Math.round(node.width() * scaleX),
            height: Math.round(node.height() * scaleY),
            rotation: Math.round(node.rotation())
          });
        }
      }}
    />
  );
};

// ================ COMPONENTE IMAGEN EDITABLE MEJORADO ================
const EditableImage = ({ 
  id,
  x, 
  y, 
  width, 
  height, 
  src, 
  onUpdate, 
  isSelected, 
  onSelect 
}) => {
  const [image] = useImage(src, 'anonymous');
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef();

  const handleDragMove = useCallback((e) => {
    if (onUpdate) {
      onUpdate(id, {
        x: Math.round(e.target.x()),
        y: Math.round(e.target.y())
      });
    }
  }, [id, onUpdate]);

  if (!src || imageError) {
    return (
      <Rect
        id={id}
        x={x}
        y={y}
        width={width || 200}
        height={height || 150}
        fill="#f0f0f0"
        stroke="#cccccc"
        strokeWidth={1}
        draggable
        onClick={onSelect}
        onDragMove={handleDragMove}
        onDragEnd={handleDragMove}
      />
    );
  }

  return (
    <KonvaImage
      ref={imageRef}
      id={id}
      x={x}
      y={y}
      width={width || 200}
      height={height || 150}
      image={image}
      draggable
      onClick={onSelect}
      onDragMove={handleDragMove}
      onDragEnd={handleDragMove}
      onError={() => setImageError(true)}
      onTransform={() => {
        const node = imageRef.current;
        if (node && onUpdate) {
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          node.scaleX(1);
          node.scaleY(1);
          
          onUpdate(id, {
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            width: Math.round(node.width() * scaleX),
            height: Math.round(node.height() * scaleY),
            rotation: Math.round(node.rotation())
          });
        }
      }}
    />
  );
};

// ================ COMPONENTE PRINCIPAL ================
const KonvaDesignEditor = ({ 
  isOpen, 
  onClose, 
  product,
  initialDesign = null,
  onSave 
}) => {
  // 1. Estados principales
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editingTextId, setEditingTextId] = useState(null);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [productColorFilter, setProductColorFilter] = useState('#ffffff');
  
  // Estados para nuevos elementos - CORREGIDO: texto por defecto vacío
  const [newTextContent, setNewTextContent] = useState('');
  const [textProperties, setTextProperties] = useState({
    fontSize: 24,
    fontFamily: 'Arial',
    fill: '#000000'
  });

  // 2. Referencias
  const theme = useTheme();
  const stageRef = useRef();
  const transformerRef = useRef();
  const fileInputRef = useRef(null);

  // Imagen del producto con filtro de color
  const [originalProductImage] = useImage(product?.images?.main || product?.mainImage, 'anonymous');
  const [filteredProductImage, setFilteredProductImage] = useState(null);

  // 3. Efectos - CORREGIDO: inicialización de elementos y área seleccionada
  useEffect(() => {
    if (isOpen) {
      // Configurar elementos iniciales con validación robusta
      if (initialDesign?.elements && Array.isArray(initialDesign.elements)) {
        const validElements = initialDesign.elements.filter(el => {
          // Validar que el elemento tiene todas las propiedades requeridas
          return el && 
                 el.id && 
                 el.type && 
                 el.konvaAttrs && 
                 typeof el.id === 'string' &&
                 typeof el.type === 'string' &&
                 typeof el.konvaAttrs === 'object';
        }).map(el => {
          // Asegurar que el elemento tiene un ID válido
          return {
            ...el,
            id: el.id || generateElementId(el.type),
            konvaAttrs: {
              ...el.konvaAttrs,
              x: el.konvaAttrs.x || 0,
              y: el.konvaAttrs.y || 0
            }
          };
        });
        
        console.log('Cargando elementos iniciales válidos:', validElements);
        setElements(validElements);
      } else {
        console.log('No hay elementos iniciales o son inválidos');
        setElements([]);
      }

      // Configurar área seleccionada
      if (product?.customizationAreas?.length > 0) {
        const firstAreaId = product.customizationAreas[0]._id || product.customizationAreas[0].id;
        setSelectedAreaId(firstAreaId);
      }

      // Resetear otros estados
      setSelectedElementId(null);
      setEditingTextId(null);
      setNewTextContent('');
      setStageScale(1);
      setStagePosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialDesign, product]);

  useEffect(() => {
    if (selectedElementId && transformerRef.current) {
      const stage = stageRef.current;
      const node = stage?.findOne(`#${selectedElementId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedElementId]);

  // Aplicar filtro de color a la imagen del producto
  useEffect(() => {
    if (originalProductImage && productColorFilter !== '#ffffff') {
      const filteredCanvas = applyColorFilter(originalProductImage, productColorFilter);
      if (filteredCanvas) {
        const filteredImg = new Image();
        filteredImg.onload = () => setFilteredProductImage(filteredImg);
        filteredImg.src = filteredCanvas.toDataURL();
      }
    } else {
      setFilteredProductImage(originalProductImage);
    }
  }, [originalProductImage, productColorFilter]);

  // 4. Funciones/manejadores
  const handleOpenImageDialog = useCallback(() => {
    setShowImageDialog(true);
  }, []);

  const handleCloseImageDialog = useCallback(() => {
    setShowImageDialog(false);
    setNewImageUrl('');
  }, []);

  // ==================== CONFIGURACIÓN DEL STAGE ====================
  const stageConfig = useMemo(() => {
    const defaultWidth = 800;
    const defaultHeight = 600;
    
    if (product?.customizationAreas?.length > 0) {
      let maxX = 0, maxY = 0;
      
      product.customizationAreas.forEach(area => {
        const areaRight = (area.position?.x || 0) + (area.position?.width || 200);
        const areaBottom = (area.position?.y || 0) + (area.position?.height || 100);
        maxX = Math.max(maxX, areaRight);
        maxY = Math.max(maxY, areaBottom);
      });
      
      return {
        width: Math.max(defaultWidth, maxX + 100),
        height: Math.max(defaultHeight, maxY + 100)
      };
    }
    
    return { width: defaultWidth, height: defaultHeight };
  }, [product]);

  // ==================== MANEJADORES DE CANVAS ====================
  const handleStageClick = useCallback((e) => {
    if (e.target === e.target.getStage()) {
      setSelectedElementId(null);
      setEditingTextId(null);
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }
    }
  }, []);

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

  // ==================== GESTIÓN DE ELEMENTOS ====================
  const generateElementId = (type) => {
    return `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  // CORREGIDO: función de agregar texto con validaciones mejoradas
  const addTextElement = useCallback(() => {
    if (!selectedAreaId) {
      alert('Por favor selecciona un área de personalización primero');
      return;
    }

    const selectedArea = product?.customizationAreas?.find(area => 
      (area._id === selectedAreaId || area.id === selectedAreaId)
    );
    
    if (!selectedArea) {
      alert('Área de personalización no válida');
      return;
    }

    // Usar texto del input o texto por defecto
    const textContent = newTextContent.trim() || 'Nuevo texto';

    const newElement = {
      id: generateElementId('text'),
      type: 'text',
      areaId: selectedAreaId,
      konvaAttrs: {
        x: (selectedArea.position?.x || 0) + 20,
        y: (selectedArea.position?.y || 0) + 20,
        text: textContent,
        fontSize: textProperties.fontSize,
        fontFamily: textProperties.fontFamily,
        fill: textProperties.fill,
        width: Math.min(200, (selectedArea.position?.width || 200) - 40),
        draggable: true
      }
    };
    
    console.log('Agregando elemento de texto:', newElement);
    
    setElements(prev => {
      const updated = [...prev, newElement];
      console.log('Lista de elementos actualizada:', updated);
      return updated;
    });
    setSelectedElementId(newElement.id);
    
    // Limpiar el input después de agregar
    setNewTextContent('');
  }, [newTextContent, textProperties, selectedAreaId, product]);

  const addImageElement = useCallback((imageData) => {
    if (!selectedAreaId) {
      alert('Por favor selecciona un área de personalización primero');
      return;
    }

    const selectedArea = product?.customizationAreas?.find(area => 
      (area._id === selectedAreaId || area.id === selectedAreaId)
    );
    
    if (!selectedArea) {
      alert('Área de personalización no válida');
      return;
    }
    
    const newElement = {
      id: generateElementId('image'),
      type: 'image',
      areaId: selectedAreaId,
      konvaAttrs: {
        x: (selectedArea.position?.x || 0) + 20,
        y: (selectedArea.position?.y || 0) + 20,
        width: Math.min(200, (selectedArea.position?.width || 200) - 40),
        height: Math.min(150, (selectedArea.position?.height || 150) - 40),
        image: imageData,
        draggable: true
      }
    };
    
    console.log('Agregando elemento de imagen:', newElement);
    
    setElements(prev => {
      const updated = [...prev, newElement];
      console.log('Lista de elementos actualizada:', updated);
      return updated;
    });
    setSelectedElementId(newElement.id);
    setShowImageDialog(false);
  }, [selectedAreaId, product]);

  // CORREGIDO: función de actualización de elementos con validaciones
  const updateElement = useCallback((elementId, updates) => {
    if (!elementId || !updates) {
      console.warn('updateElement: parámetros inválidos', { elementId, updates });
      return;
    }

    setElements(prev => {
      // Validar que todos los elementos en el array son válidos
      const validPrevElements = prev.filter(el => {
        if (!el || !el.id || !el.type) {
          console.warn('Elemento inválido encontrado y removido:', el);
          return false;
        }
        return true;
      });

      const updated = validPrevElements.map(el => {
        if (el.id === elementId) {
          const updatedElement = {
            ...el,
            konvaAttrs: { ...el.konvaAttrs, ...updates }
          };
          console.log('Actualizando elemento:', updatedElement);
          return updatedElement;
        }
        return el;
      });
      return updated;
    });
  }, []);

  const deleteElement = useCallback((elementId) => {
    console.log('Eliminando elemento:', elementId);
    setElements(prev => {
      const updated = prev.filter(el => el.id !== elementId);
      console.log('Elementos después de eliminar:', updated);
      return updated;
    });
    
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
    if (editingTextId === elementId) {
      setEditingTextId(null);
    }
  }, [selectedElementId, editingTextId]);

  const duplicateElement = useCallback((elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const newElement = {
        ...element,
        id: generateElementId(element.type),
        konvaAttrs: {
          ...element.konvaAttrs,
          x: (element.konvaAttrs.x || 0) + 20,
          y: (element.konvaAttrs.y || 0) + 20
        }
      };
      
      console.log('Duplicando elemento:', newElement);
      
      setElements(prev => {
        const updated = [...prev, newElement];
        console.log('Elementos después de duplicar:', updated);
        return updated;
      });
      setSelectedElementId(newElement.id);
    }
  }, [elements]);

  const moveElementToArea = useCallback((elementId, newAreaId) => {
    const element = elements.find(el => el.id === elementId);
    const newArea = product?.customizationAreas?.find(area => 
      (area._id === newAreaId || area.id === newAreaId)
    );
    
    if (element && newArea) {
      updateElement(elementId, {
        x: (newArea.position?.x || 0) + 20,
        y: (newArea.position?.y || 0) + 20
      });
      
      setElements(prev => prev.map(el => 
        el.id === elementId 
          ? { ...el, areaId: newAreaId }
          : el
      ));
    }
  }, [elements, product, updateElement]);

  // ==================== MANEJO DE IMÁGENES ====================
  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        if (!file.type.startsWith('image/')) {
          alert('Por favor selecciona un archivo de imagen válido');
          return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB máximo
          alert('El archivo es demasiado grande. Máximo 5MB permitido');
          return;
        }

        const resizedImage = await resizeImage(file);
        addImageElement(resizedImage);
      } catch (error) {
        console.error('Error procesando imagen:', error);
        alert('Error al procesar la imagen. Inténtalo de nuevo.');
      }
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addImageElement]);

  const handleImageUrlSubmit = useCallback(() => {
    if (newImageUrl.trim()) {
      // Validar URL básica
      try {
        new URL(newImageUrl);
        addImageElement(newImageUrl.trim());
        setNewImageUrl('');
      } catch (error) {
        alert('Por favor ingresa una URL válida');
      }
    }
  }, [newImageUrl, addImageElement]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      try {
        const resizedImage = await resizeImage(imageFile);
        addImageElement(resizedImage);
      } catch (error) {
        console.error('Error procesando imagen arrastrada:', error);
        alert('Error al procesar la imagen');
      }
    }
  }, [addImageElement]);

  // ==================== EDICIÓN DE TEXTO ====================
  const handleStartTextEdit = useCallback((elementId) => {
    console.log('Iniciando edición de texto para elemento:', elementId);
    setEditingTextId(elementId);
    setSelectedElementId(elementId);
  }, []);

  const handleFinishTextEdit = useCallback((elementId, newText) => {
    console.log('Finalizando edición de texto:', { elementId, newText });
    if (newText && newText.trim()) {
      updateElement(elementId, { text: newText.trim() });
    }
    setEditingTextId(null);
  }, [updateElement]);

  // CORREGIDO: manejo del cambio de contenido de texto
  const handleTextContentChange = useCallback((value) => {
    setNewTextContent(value);
    
    // Si hay un elemento seleccionado y es de texto, actualizarlo en tiempo real
    if (selectedElementId) {
      const element = elements.find(el => el.id === selectedElementId);
      if (element && element.type === 'text') {
        updateElement(selectedElementId, { text: value || 'Texto vacío' });
      }
    }
  }, [selectedElementId, elements, updateElement]);

  // ==================== CONTROLES DE ZOOM ====================
  const resetView = useCallback(() => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setStageScale(prev => Math.min(3, prev * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setStageScale(prev => Math.max(0.1, prev / 1.2));
  }, []);

  const fitToScreen = useCallback(() => {
    const containerWidth = 800;
    const containerHeight = 600;
    
    const scaleX = containerWidth / stageConfig.width;
    const scaleY = containerHeight / stageConfig.height;
    const optimalScale = Math.min(scaleX, scaleY, 1);
    
    setStageScale(optimalScale);
    setStagePosition({
      x: (containerWidth - stageConfig.width * optimalScale) / 2,
      y: (containerHeight - stageConfig.height * optimalScale) / 2
    });
  }, [stageConfig]);

  // ==================== GUARDAR DISEÑO ====================
  const handleSave = useCallback(() => {
    console.log('Intentando guardar elementos:', elements);
    
    // Validar que hay elementos
    if (!elements || elements.length === 0) {
      alert('Debe agregar al menos un elemento al diseño antes de guardar');
      return;
    }

    // Validar elementos antes de guardar
    const validation = DesignService.validateElementsForSubmission(elements);
    if (!validation.isValid) {
      alert(`Error de validación:\n${validation.errors.join('\n')}`);
      return;
    }

    // Convertir elementos al formato correcto para el backend
    const designElements = elements.map(el => {
      // Validar que el elemento tenga las propiedades necesarias
      if (!el.type || !el.konvaAttrs) {
        console.warn('Elemento inválido encontrado:', el);
        return null;
      }

      return {
        type: el.type,
        areaId: el.areaId || product?.customizationAreas?.[0]?._id || product?.customizationAreas?.[0]?.id || '',
        konvaAttrs: {
          ...el.konvaAttrs,
          // Remover propiedades que no necesita el backend
          id: undefined,
          draggable: undefined
        }
      };
    }).filter(Boolean); // Remover elementos null

    console.log('Elementos procesados para guardar:', designElements);

    if (designElements.length === 0) {
      alert('No hay elementos válidos para guardar');
      return;
    }
    
    // Llamar función de guardado
    try {
      onSave(designElements, productColorFilter !== '#ffffff' ? productColorFilter : null);
      console.log('Diseño guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar diseño:', error);
      alert('Error al guardar el diseño. Inténtalo de nuevo.');
    }
  }, [elements, onSave, product, productColorFilter]);

  // ==================== ELEMENTO SELECCIONADO ====================
  const selectedElement = elements.find(el => el && el.id === selectedElementId);
  const selectedArea = product?.customizationAreas?.find(area => 
    (area._id === selectedAreaId || area.id === selectedAreaId)
  );

  // ==================== RENDERIZADO DE ÁREAS ====================
  const renderCustomizationAreas = useCallback(() => {
    if (!product?.customizationAreas) return null;
    
    return product.customizationAreas.map((area, index) => (
      <Group key={area._id || area.id || `area-${index}`}>
        {/* Área de personalización */}
        <Rect
          x={area.position?.x || 0}
          y={area.position?.y || 0}
          width={area.position?.width || 200}
          height={area.position?.height || 100}
          stroke={(area._id === selectedAreaId || area.id === selectedAreaId) ? '#1F64BF' : '#10B981'}
          strokeWidth={(area._id === selectedAreaId || area.id === selectedAreaId) ? 3 : 2}
          fill={(area._id === selectedAreaId || area.id === selectedAreaId) ? 'rgba(31, 100, 191, 0.1)' : 'rgba(16, 185, 129, 0.05)'}
          dash={[5, 5]}
          listening={false}
        />
        
        {/* Etiqueta del área */}
        <Text
          x={area.position?.x || 0}
          y={(area.position?.y || 0) - 25}
          text={area.displayName || area.name || `Área ${index + 1}`}
          fontSize={12}
          fontFamily="Arial"
          fill={(area._id === selectedAreaId || area.id === selectedAreaId) ? '#1F64BF' : '#10B981'}
          fontStyle="bold"
          listening={false}
        />
      </Group>
    ));
  }, [product, selectedAreaId]);

  // 5. Return con el JSX
  if (!isOpen) return null;

  return (
    <EditorOverlay>
      <EditorContainer>
        {/* Header */}
        <EditorHeader>
          <HeaderTitle>
            <Palette size={20} weight="duotone" />
            Editor de Diseños - {product?.name}
          </HeaderTitle>
          
          <HeaderActions>
            <HeaderButton variant="outlined" onClick={fitToScreen}>
              <Target size={16} weight="bold" />
              Ajustar
            </HeaderButton>
            <HeaderButton variant="outlined" onClick={resetView}>
              <ResetIcon size={16} weight="bold" />
              Resetear
            </HeaderButton>
            <HeaderButton variant="contained" onClick={handleSave}>
              <SaveIcon size={16} weight="bold" />
              Guardar
            </HeaderButton>
            <CloseButton onClick={onClose}>
              <CloseIcon size={18} weight="bold" />
            </CloseButton>
          </HeaderActions>
        </EditorHeader>

        <EditorContent>
          {/* Panel izquierdo de herramientas */}
          <ToolsPanel>
            <PanelTabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
            >
              <Tab label="Elementos" icon={<Plus size={16} />} />
              <Tab label="Áreas" icon={<Target size={16} />} />
              <Tab label="Producto" icon={<Package size={16} />} />
            </PanelTabs>

            <PanelContent>
              {/* Tab 0: Agregar Elementos */}
              {activeTab === 0 && (
                <>
                  <PanelSection>
                    <SectionTitle component="div">
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TextIcon size={16} weight="bold" />
                        <span>Agregar texto</span>
                      </Box>
                    </SectionTitle>
                    
                    <ModernTextField
                      label="Contenido del texto"
                      value={newTextContent}
                      onChange={(e) => setNewTextContent(e.target.value)}
                      fullWidth
                      margin="dense"
                      multiline
                      rows={2}
                      placeholder="Escribe aquí el texto..."
                      helperText="Deja vacío para usar texto por defecto"
                    />
                    
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Typography variant="caption" gutterBottom>
                        Tamaño: {textProperties.fontSize}px
                      </Typography>
                      <Slider
                        value={textProperties.fontSize}
                        onChange={(e, value) => setTextProperties(prev => ({ ...prev, fontSize: value }))}
                        min={12}
                        max={72}
                        size="small"
                      />
                    </Box>

                    <FormControl fullWidth margin="dense" size="small">
                      <InputLabel>Fuente</InputLabel>
                      <Select
                        value={textProperties.fontFamily}
                        onChange={(e) => setTextProperties(prev => ({ ...prev, fontFamily: e.target.value }))}
                        label="Fuente"
                      >
                        <MenuItem value="Arial">Arial</MenuItem>
                        <MenuItem value="Helvetica">Helvetica</MenuItem>
                        <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                        <MenuItem value="Courier New">Courier New</MenuItem>
                        <MenuItem value="Georgia">Georgia</MenuItem>
                        <MenuItem value="Verdana">Verdana</MenuItem>
                        <MenuItem value="Comic Sans MS">Comic Sans MS</MenuItem>
                        <MenuItem value="Impact">Impact</MenuItem>
                        <MenuItem value="Trebuchet MS">Trebuchet MS</MenuItem>
                        <MenuItem value="Tahoma">Tahoma</MenuItem>
                      </Select>
                    </FormControl>

                    <ModernTextField
                      label="Color"
                      type="color"
                      value={textProperties.fill}
                      onChange={(e) => setTextProperties(prev => ({ ...prev, fill: e.target.value }))}
                      fullWidth
                      margin="dense"
                      size="small"
                    />

                    <Button
                      variant="contained"
                      onClick={addTextElement}
                      disabled={!selectedAreaId}
                      sx={{ 
                        mt: 2, 
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)'
                      }}
                      fullWidth
                    >
                      Agregar Texto
                    </Button>
                  </PanelSection>

                  <PanelSection>
                    <SectionTitle component="div">
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ImageIcon size={16} weight="bold" />
                        <span>Agregar imagen</span>
                      </Box>
                    </SectionTitle>
                    
                    <Button
                      variant="outlined"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!selectedAreaId}
                      sx={{ 
                        mb: 2, 
                        borderRadius: '12px'
                      }}
                      fullWidth
                      startIcon={<Upload size={16} />}
                    >
                      Subir Imagen
                    </Button>

                    <ModernTextField
                      label="O URL de imagen"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      fullWidth
                      margin="dense"
                      size="small"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />

                    <Button
                      variant="contained"
                      onClick={handleImageUrlSubmit}
                      disabled={!newImageUrl.trim() || !selectedAreaId}
                      sx={{ 
                        mt: 1, 
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      }}
                      fullWidth
                    >
                      Agregar desde URL
                    </Button>
                  </PanelSection>

                  <PanelSection>
                    <SectionTitle component="div">
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={16} weight="bold" />
                        <span>Elementos ({elements.length})</span>
                      </Box>
                    </SectionTitle>
                    
                    <ElementsList>
                      {elements.map((element) => (
                        <ElementItem
                          key={element.id}
                          selected={selectedElementId === element.id}
                          onClick={() => setSelectedElementId(element.id)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {element.type === 'text' ? (
                              <TextIcon size={16} weight="bold" color="#1F64BF" />
                            ) : (
                              <ImageIcon size={16} weight="bold" color="#10B981" />
                            )}
                            <Typography variant="body2" fontWeight={600}>
                              {element.type === 'text' 
                                ? (element.konvaAttrs?.text?.substring(0, 15) || 'Texto') + (element.konvaAttrs?.text?.length > 15 ? '...' : '')
                                : `Imagen ${element.id?.split('-')?.[1] || 'nueva'}`
                              }
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: '4px' }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateElement(element.id);
                              }}
                            >
                              <DuplicateIcon size={14} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                              sx={{ color: '#EF4444' }}
                            >
                              <DeleteIcon size={14} />
                            </IconButton>
                          </Box>
                        </ElementItem>
                      ))}
                      
                      {elements.length === 0 && (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4, 
                          color: alpha('#032CA6', 0.6) 
                        }}>
                          <Typography variant="body2">
                            No hay elementos aún
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Agrega texto o imágenes para comenzar
                          </Typography>
                        </Box>
                      )}
                    </ElementsList>
                  </PanelSection>
                </>
              )}

              {/* Tab 1: Selección de Áreas */}
              {activeTab === 1 && (
                <PanelSection>
                  <SectionTitle component="div">
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Target size={16} weight="bold" />
                      <span>Áreas de personalización</span>
                    </Box>
                  </SectionTitle>
                  
                  {product?.customizationAreas?.map((area) => (
                    <AreaSelector
                      key={area._id || area.id}
                      className={selectedAreaId === (area._id || area.id) ? 'selected' : ''}
                      onClick={() => setSelectedAreaId(area._id || area.id)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                          {area.displayName || area.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {area.position?.width || 200} × {area.position?.height || 100} px
                        </Typography>
                        <Box sx={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {area.accepts?.text && (
                            <Chip label="Texto" size="small" color="primary" variant="outlined" />
                          )}
                          {area.accepts?.image && (
                            <Chip label="Imagen" size="small" color="secondary" variant="outlined" />
                          )}
                        </Box>
                      </CardContent>
                    </AreaSelector>
                  ))}

                  {selectedAreaId && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      borderRadius: '12px', 
                      background: alpha('#1F64BF', 0.05),
                      border: `1px solid ${alpha('#1F64BF', 0.1)}`
                    }}>
                      <Typography variant="caption" sx={{ color: '#1F64BF', fontWeight: 600 }}>
                        ✓ Área seleccionada: {selectedArea?.displayName || selectedArea?.name}
                      </Typography>
                    </Box>
                  )}
                </PanelSection>
              )}

              {/* Tab 2: Configuración del Producto */}
              {activeTab === 2 && (
                <PanelSection>
                  <SectionTitle component="div">
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PaintBrush size={16} weight="bold" />
                      <span>Color del Producto</span>
                    </Box>
                  </SectionTitle>
                  
                  <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                    Cambia el color base del producto para personalizar el fondo
                  </Typography>

                  <ModernTextField
                    label="Color del producto"
                    type="color"
                    value={productColorFilter}
                    onChange={(e) => setProductColorFilter(e.target.value)}
                    fullWidth
                    margin="dense"
                    helperText="Aplica un filtro de color a la imagen del producto"
                  />

                  <Button
                    variant="outlined"
                    onClick={() => setProductColorFilter('#ffffff')}
                    sx={{ mt: 1, borderRadius: '12px' }}
                    fullWidth
                    startIcon={<ResetIcon size={16} />}
                  >
                    Restaurar Color Original
                  </Button>

                  <Divider sx={{ my: 3 }} />

                  <SectionTitle component="div">
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={16} weight="bold" />
                      <span>Información del producto</span>
                    </Box>
                  </SectionTitle>
                  
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    {product?.name}
                  </Typography>
                  
                  {product?.customizationAreas && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      {product.customizationAreas.length} área(s) de personalización disponible(s)
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {product?.customizationAreas?.map((area, index) => (
                      <Chip
                        key={area._id || area.id || index}
                        label={`${area.displayName || area.name} (${area.position?.width || 200}×${area.position?.height || 100})`}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.75rem',
                          borderColor: alpha('#1F64BF', 0.3),
                          color: '#1F64BF',
                          justifyContent: 'flex-start'
                        }}
                      />
                    ))}
                  </Box>
                </PanelSection>
              )}
            </PanelContent>
          </ToolsPanel>

          {/* Canvas principal */}
          <CanvasContainer>
            {/* Barra de herramientas del canvas */}
            <CanvasToolbar>
              <ToolbarButton
                active={showGrid}
                onClick={() => setShowGrid(!showGrid)}
              >
                <GridIcon size={18} weight="bold" />
              </ToolbarButton>
              
              <ToolbarButton onClick={zoomOut}>
                <ZoomOutIcon size={18} weight="bold" />
              </ToolbarButton>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                px: 2, 
                py: 1, 
                backgroundColor: 'white',
                borderRadius: '12px',
                border: `1px solid ${alpha('#1F64BF', 0.2)}`,
                boxShadow: '0 4px 16px rgba(1, 3, 38, 0.08)'
              }}>
                <Typography variant="body2" fontWeight={600} color="#1F64BF">
                  {Math.round(stageScale * 100)}%
                </Typography>
              </Box>
              
              <ToolbarButton onClick={zoomIn}>
                <ZoomInIcon size={18} weight="bold" />
              </ToolbarButton>

              <ToolbarButton onClick={fitToScreen}>
                <Target size={18} weight="bold" />
              </ToolbarButton>
            </CanvasToolbar>

            {/* Stage de Konva */}
            <Stage
              ref={stageRef}
              width={stageConfig.width}
              height={stageConfig.height}
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
                {/* Grid de fondo */}
                {showGrid && (
                  <>
                    {Array.from({ length: Math.ceil(stageConfig.width / 20) + 1 }).map((_, i) => (
                      <Rect
                        key={`grid-v-${i}`}
                        x={i * 20}
                        y={0}
                        width={1}
                        height={stageConfig.height}
                        fill={alpha('#1F64BF', 0.1)}
                        listening={false}
                      />
                    ))}
                    {Array.from({ length: Math.ceil(stageConfig.height / 20) + 1 }).map((_, i) => (
                      <Rect
                        key={`grid-h-${i}`}
                        x={0}
                        y={i * 20}
                        width={stageConfig.width}
                        height={1}
                        fill={alpha('#1F64BF', 0.1)}
                        listening={false}
                      />
                    ))}
                  </>
                )}

                {/* Imagen del producto con filtro de color */}
                {filteredProductImage && (
                  <KonvaImage
                    image={filteredProductImage}
                    x={0}
                    y={0}
                    width={stageConfig.width}
                    height={stageConfig.height}
                    listening={false}
                    opacity={0.3}
                  />
                )}

                {/* Áreas de personalización */}
                {renderCustomizationAreas()}

                {/* Elementos del diseño */}
                {elements.filter(element => element && element.id && element.type && element.konvaAttrs).map((element) => {
                  if (element.type === 'text') {
                    return (
                      <EditableText
                        key={element.id}
                        id={element.id}
                        {...element.konvaAttrs}
                        isSelected={selectedElementId === element.id}
                        onSelect={() => setSelectedElementId(element.id)}
                        onUpdate={updateElement}
                        onStartEdit={handleStartTextEdit}
                        isEditing={editingTextId === element.id}
                        onFinishEdit={handleFinishTextEdit}
                      />
                    );
                  } else if (element.type === 'image') {
                    return (
                      <EditableImage
                        key={element.id}
                        id={element.id}
                        {...element.konvaAttrs}
                        src={element.konvaAttrs.image}
                        isSelected={selectedElementId === element.id}
                        onSelect={() => setSelectedElementId(element.id)}
                        onUpdate={updateElement}
                      />
                    );
                  }
                  return null;
                })}

                {/* Transformer para elementos seleccionados */}
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 10 || newBox.height < 10) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  anchorStroke="#1F64BF"
                  anchorFill="white"
                  borderStroke="#1F64BF"
                  borderDash={[3, 3]}
                />
              </Layer>
            </Stage>
          </CanvasContainer>

          {/* Panel derecho de propiedades */}
          <PropertiesPanel>
            <PanelSection>
              <SectionTitle component="div">
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Palette size={16} weight="bold" />
                  <span>Propiedades</span>
                </Box>
              </SectionTitle>
              
              {selectedElement ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {selectedElement.type === 'text' ? 'Elemento de Texto' : 'Elemento de Imagen'}
                  </Typography>
                  
                  {/* Selector de área para el elemento */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Área de personalización</InputLabel>
                    <Select
                      value={selectedElement.areaId || ''}
                      onChange={(e) => moveElementToArea(selectedElement.id, e.target.value)}
                      label="Área de personalización"
                    >
                      {product?.customizationAreas?.map((area) => (
                        <MenuItem key={area._id || area.id} value={area._id || area.id}>
                          {area.displayName || area.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Propiedades de posición */}
                  <Box>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                      Posición
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <ModernTextField
                          label="X"
                          type="number"
                          value={Math.round(selectedElement.konvaAttrs.x || 0)}
                          onChange={(e) => updateElement(selectedElementId, { x: parseInt(e.target.value) || 0 })}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <ModernTextField
                          label="Y"
                          type="number"
                          value={Math.round(selectedElement.konvaAttrs.y || 0)}
                          onChange={(e) => updateElement(selectedElementId, { y: parseInt(e.target.value) || 0 })}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Propiedades específicas para texto */}
                  {selectedElement.type === 'text' && (
                    <>
                      <ModernTextField
                        label="Contenido"
                        value={selectedElement.konvaAttrs.text || ''}
                        onChange={(e) => updateElement(selectedElementId, { text: e.target.value || 'Texto vacío' })}
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                      />
                      
                      <Box>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                          Tamaño: {selectedElement.konvaAttrs.fontSize || 24}px
                        </Typography>
                        <Slider
                          value={selectedElement.konvaAttrs.fontSize || 24}
                          onChange={(e, value) => updateElement(selectedElementId, { fontSize: value })}
                          min={8}
                          max={72}
                          size="small"
                        />
                      </Box>

                      <FormControl fullWidth size="small">
                        <InputLabel>Fuente</InputLabel>
                        <Select
                          value={selectedElement.konvaAttrs.fontFamily || 'Arial'}
                          onChange={(e) => updateElement(selectedElementId, { fontFamily: e.target.value })}
                          label="Fuente"
                        >
                          <MenuItem value="Arial">Arial</MenuItem>
                          <MenuItem value="Helvetica">Helvetica</MenuItem>
                          <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                          <MenuItem value="Courier New">Courier New</MenuItem>
                          <MenuItem value="Georgia">Georgia</MenuItem>
                          <MenuItem value="Verdana">Verdana</MenuItem>
                          <MenuItem value="Comic Sans MS">Comic Sans MS</MenuItem>
                          <MenuItem value="Impact">Impact</MenuItem>
                          <MenuItem value="Trebuchet MS">Trebuchet MS</MenuItem>
                          <MenuItem value="Tahoma">Tahoma</MenuItem>
                        </Select>
                      </FormControl>

                      <ModernTextField
                        label="Color"
                        type="color"
                        value={selectedElement.konvaAttrs.fill || '#000000'}
                        onChange={(e) => updateElement(selectedElementId, { fill: e.target.value })}
                        fullWidth
                        size="small"
                      />

                      <FormControl fullWidth size="small">
                        <InputLabel>Alineación</InputLabel>
                        <Select
                          value={selectedElement.konvaAttrs.align || 'left'}
                          onChange={(e) => updateElement(selectedElementId, { align: e.target.value })}
                          label="Alineación"
                        >
                          <MenuItem value="left">Izquierda</MenuItem>
                          <MenuItem value="center">Centro</MenuItem>
                          <MenuItem value="right">Derecha</MenuItem>
                          <MenuItem value="justify">Justificado</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {/* Propiedades específicas para imagen */}
                  {selectedElement.type === 'image' && (
                    <>
                      <Box>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                          Dimensiones
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <ModernTextField
                              label="Ancho"
                              type="number"
                              value={Math.round(selectedElement.konvaAttrs.width || 0)}
                              onChange={(e) => updateElement(selectedElementId, { width: parseInt(e.target.value) || 0 })}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <ModernTextField
                              label="Alto"
                              type="number"
                              value={Math.round(selectedElement.konvaAttrs.height || 0)}
                              onChange={(e) => updateElement(selectedElementId, { height: parseInt(e.target.value) || 0 })}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      </Box>

                      <ModernTextField
                        label="URL de imagen"
                        value={selectedElement.konvaAttrs.image || ''}
                        onChange={(e) => updateElement(selectedElementId, { image: e.target.value })}
                        fullWidth
                        size="small"
                        helperText="Cambiar la URL actualizará la imagen"
                      />

                      <Box>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                          Opacidad: {Math.round((selectedElement.konvaAttrs.opacity || 1) * 100)}%
                        </Typography>
                        <Slider
                          value={selectedElement.konvaAttrs.opacity || 1}
                          onChange={(e, value) => updateElement(selectedElementId, { opacity: value })}
                          min={0}
                          max={1}
                          step={0.1}
                          size="small"
                        />
                      </Box>
                    </>
                  )}

                  {/* Propiedades comunes */}
                  <Box>
                    <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                      Rotación: {Math.round(selectedElement.konvaAttrs.rotation || 0)}°
                    </Typography>
                    <Slider
                      value={selectedElement.konvaAttrs.rotation || 0}
                      onChange={(e, value) => updateElement(selectedElementId, { rotation: value })}
                      min={-180}
                      max={180}
                      size="small"
                    />
                  </Box>

                  {/* Acciones del elemento */}
                  <Box sx={{ display: 'flex', gap: '8px', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => duplicateElement(selectedElementId)}
                      startIcon={<DuplicateIcon size={14} />}
                      size="small"
                      sx={{ borderRadius: '8px', flex: 1 }}
                    >
                      Duplicar
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => deleteElement(selectedElementId)}
                      startIcon={<DeleteIcon size={14} />}
                      size="small"
                      color="error"
                      sx={{ borderRadius: '8px', flex: 1 }}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  color: alpha('#032CA6', 0.6) 
                }}>
                  <Typography variant="body2">
                    Selecciona un elemento para editar sus propiedades
                  </Typography>
                </Box>
              )}
            </PanelSection>
          </PropertiesPanel>
        </EditorContent>

        {/* Input oculto para selección de archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Diálogo de carga de imágenes */}
        <ImageUploadDialog
          open={showImageDialog}
          onClose={handleCloseImageDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Upload size={20} weight="duotone" />
            Agregar Imagen
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
              Selecciona una imagen desde tu dispositivo o arrastra y suelta aquí
            </Typography>

            <FileUploadArea
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload size={48} weight="duotone" color="#1F64BF" />
              <Typography variant="h6" sx={{ mt: 2, color: '#1F64BF', fontWeight: 600 }}>
                Subir Imagen
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                Haz clic aquí o arrastra una imagen
              </Typography>
              <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>
                Formatos soportados: JPG, PNG, GIF (máx. 5MB)
              </Typography>
            </FileUploadArea>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              my: 3,
              '&::before, &::after': {
                content: '""',
                flex: 1,
                height: '1px',
                background: alpha('#1F64BF', 0.2)
              }
            }}>
              <Typography variant="body2" sx={{ px: 2, color: '#666' }}>
                O
              </Typography>
            </Box>

            <ModernTextField
              label="URL de imagen"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              fullWidth
              placeholder="https://ejemplo.com/imagen.jpg"
              helperText="Pega la URL de una imagen desde internet"
            />
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={handleCloseImageDialog}
              sx={{ borderRadius: '8px' }}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained"
              onClick={handleImageUrlSubmit}
              disabled={!newImageUrl.trim()}
              sx={{ 
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              }}
            >
              Agregar desde URL
            </Button>
          </DialogActions>
        </ImageUploadDialog>

        {/* Diálogo de edición de texto */}
        {editingTextId && (
          <Dialog
            open={!!editingTextId}
            onClose={() => setEditingTextId(null)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Editar Texto
            </DialogTitle>
            <DialogContent>
              <ModernTextField
                autoFocus
                label="Contenido del texto"
                value={elements.find(el => el.id === editingTextId)?.konvaAttrs?.text || ''}
                onChange={(e) => updateElement(editingTextId, { text: e.target.value || 'Texto vacío' })}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingTextId(null)}>
                Cancelar
              </Button>
              <Button 
                variant="contained"
                onClick={() => setEditingTextId(null)}
                sx={{ borderRadius: '8px' }}
              >
                Aceptar
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </EditorContainer>
    </EditorOverlay>
  );
};

export default KonvaDesignEditor;