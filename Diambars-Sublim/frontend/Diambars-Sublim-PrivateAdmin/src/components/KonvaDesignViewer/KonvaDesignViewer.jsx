// src/components/KonvaDesignViewer/KonvaDesignViewer.jsx - VISOR COMPLETO DE DISEÑOS CORREGIDO
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
  Paper,
  Divider,
  Slider,
  Tooltip,
  CircularProgress,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import {
  X,
  Eye,
  Download,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOutSimple,
  ArrowsInSimple,
  User,
  Package,
  Calendar,
  Money,
  Palette,
  Info,
  CheckCircle
} from '@phosphor-icons/react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva';
import useImage from 'use-image';

// ================ ESTILOS MODERNOS ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  zIndex: 1000, // Z-index bajo para estar debajo del editor
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    background: 'white',
    boxShadow: '0 24px 64px rgba(1, 3, 38, 0.16)',
    border: `1px solid ${alpha('#1F64BF', 0.08)}`,
    maxWidth: '95vw',
    maxHeight: '95vh',
    width: '1200px',
    margin: '16px',
    overflow: 'hidden',
    zIndex: 1001 // Z-index bajo en el paper
  },
  '& .MuiBackdrop-root': {
    zIndex: 999 // Backdrop con z-index bajo
  }
}));

const ModalHeader = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  color: 'white',
  padding: '24px 32px',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '120px',
    height: '120px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(40px, -40px)'
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px 24px',
  }
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
  }
}));

const CloseButton = styled(IconButton)({
  color: 'white',
  background: 'rgba(255, 255, 255, 0.1)',
  width: '40px',
  height: '40px',
  zIndex: 1,
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
  }
});

const ModalContent = styled(DialogContent)(({ theme }) => ({
  padding: 0,
  background: '#f8f9fa',
  display: 'flex',
  flexDirection: 'row',
  height: '70vh',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    height: 'auto',
  }
}));

const ViewerContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  background: 'white',
  position: 'relative',
  minHeight: '500px',
  [theme.breakpoints.down('md')]: {
    minHeight: '400px',
  }
}));

const ViewerToolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  background: 'white',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  gap: '16px',
  [theme.breakpoints.down('sm')]: {
    padding: '12px 16px',
    flexWrap: 'wrap',
    gap: '8px',
  }
}));

const ToolbarSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const CanvasContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f0f0f0',
  position: 'relative',
  overflow: 'hidden',
});

const InfoPanel = styled(Box)(({ theme }) => ({
  width: '350px',
  background: 'white',
  borderLeft: `1px solid ${alpha('#1F64BF', 0.08)}`,
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    borderLeft: 'none',
    borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`,
    maxHeight: '300px',
  }
}));

const InfoPanelHeader = styled(Box)({
  padding: '20px 24px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
});

const InfoPanelContent = styled(Box)({
  flex: 1,
  padding: '20px 24px',
  overflow: 'auto',
});

const InfoSection = styled(Box)({
  marginBottom: '24px',
  '&:last-child': {
    marginBottom: 0,
  }
});

const InfoSectionTitle = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#010326',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const InfoGrid = styled(Box)({
  display: 'grid',
  gap: '12px',
});

const InfoItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const InfoLabel = styled(Typography)({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: '#032CA6',
  opacity: 0.7,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const InfoValue = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#010326',
  lineHeight: 1.3,
});

const StatusChip = styled(Chip)(({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'draft': { color: '#6B7280', bg: alpha('#6B7280', 0.1) },
      'pending': { color: '#F59E0B', bg: alpha('#F59E0B', 0.1) },
      'quoted': { color: '#3B82F6', bg: alpha('#3B82F6', 0.1) },
      'approved': { color: '#10B981', bg: alpha('#10B981', 0.1) },
      'rejected': { color: '#EF4444', bg: alpha('#EF4444', 0.1) },
      'completed': { color: '#059669', bg: alpha('#059669', 0.1) },
      'archived': { color: '#9CA3AF', bg: alpha('#9CA3AF', 0.1) }
    };
    return configs[status] || configs['draft'];
  };

  const config = getStatusConfig(status);

  return {
    height: '28px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: config.color,
    backgroundColor: config.bg,
    border: `1px solid ${alpha(config.color, 0.2)}`,
    '& .MuiChip-label': {
      padding: '0 12px'
    }
  };
});

const ActionButton = styled(Button)(({ variant: buttonVariant, theme }) => ({
  borderRadius: '12px',
  padding: '8px 16px',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'none',
  minWidth: 'auto',
  ...(buttonVariant === 'contained' ? {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: 'white',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.24)',
    '&:hover': {
      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.32)',
    }
  } : {
    border: `1px solid ${alpha('#10B981', 0.3)}`,
    color: '#10B981',
    '&:hover': {
      borderColor: '#10B981',
      background: alpha('#10B981', 0.05),
    }
  })
}));

const ModalActions = styled(DialogActions)(({ theme }) => ({
  padding: '24px 32px',
  background: alpha('#10B981', 0.02),
  borderTop: `1px solid ${alpha('#10B981', 0.08)}`,
  gap: '12px',
  [theme.breakpoints.down('sm')]: {
    padding: '20px 24px',
    flexDirection: 'column-reverse',
    '& > *': {
      width: '100%'
    }
  }
}));

const LoadingOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
});

// ================ COMPONENTE DE IMAGEN KONVA ================
const KonvaImageComponent = ({ src, x, y, width, height, ...props }) => {
  const [image] = useImage(src, 'anonymous');
  return image ? (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      {...props}
    />
  ) : null;
};

// ================ COMPONENTE PRINCIPAL ================
const KonvaDesignViewer = ({
  isOpen,
  onClose,
  design,
  product,
  showInfo = true,
  enableDownload = true,
  enableZoom = true
}) => {
  const theme = useTheme();
  const stageRef = useRef();
  
  // ==================== ESTADOS ====================
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  const [productImage] = useImage(product?.images?.main || product?.mainImage, 'anonymous');
  const [renderError, setRenderError] = useState(null);

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (isOpen && design) {
      setLoading(true);
      setRenderError(null);
      
      // Calcular dimensiones del stage basado en el producto
      const dimensions = calculateStageDimensions();
      setStageDimensions(dimensions);
      
      // Centrar vista
      centerView(dimensions);
      
      // Simular carga
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [isOpen, design, product]);

  // ==================== FUNCIONES DE CÁLCULO ====================
  const calculateStageDimensions = useCallback(() => {
    if (product?.customizationAreas?.length) {
      let maxX = 0, maxY = 0;
      
      product.customizationAreas.forEach(area => {
        const areaRight = area.position.x + area.position.width;
        const areaBottom = area.position.y + area.position.height;
        maxX = Math.max(maxX, areaRight);
        maxY = Math.max(maxY, areaBottom);
      });
      
      return {
        width: Math.max(800, maxX + 100),
        height: Math.max(600, maxY + 100)
      };
    }
    
    return { width: 800, height: 600 };
  }, [product]);

  const centerView = useCallback((dimensions = stageDimensions) => {
    const containerWidth = 600; // Ancho aproximado del contenedor
    const containerHeight = 400; // Alto aproximado del contenedor
    
    const scaleX = containerWidth / dimensions.width;
    const scaleY = containerHeight / dimensions.height;
    const optimalScale = Math.min(scaleX, scaleY, 1);
    
    setScale(optimalScale);
    setStagePos({
      x: (containerWidth - dimensions.width * optimalScale) / 2,
      y: (containerHeight - dimensions.height * optimalScale) / 2
    });
  }, [stageDimensions]);

  // ==================== MANEJADORES DE ZOOM ====================
  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.2, 3);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale * 0.8, 0.1);
    setScale(newScale);
  };

  const handleFitToScreen = () => {
    centerView();
  };

  const handleActualSize = () => {
    setScale(1);
    setStagePos({ x: 0, y: 0 });
  };

  const handleZoomChange = (event, newValue) => {
    setScale(newValue);
  };

  // ==================== DESCARGA ====================
  const handleDownload = useCallback(() => {
    if (!stageRef.current) return;
    
    try {
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.download = `diseño-${design.name || 'personalizado'}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar:', error);
      setRenderError('Error al generar la imagen para descarga');
    }
  }, [design]);

  // ==================== RENDERIZADO DE ELEMENTOS ====================
  const renderDesignElements = () => {
    if (!design?.elements || !Array.isArray(design.elements)) {
      return null;
    }

    return design.elements.map((element, index) => {
      const key = element._id || element.id || `element-${index}`;
      
      try {
        if (element.type === 'text') {
          return (
            <Text
              key={key}
              x={element.konvaAttrs?.x || 0}
              y={element.konvaAttrs?.y || 0}
              text={element.konvaAttrs?.text || ''}
              fontSize={element.konvaAttrs?.fontSize || 16}
              fontFamily={element.konvaAttrs?.fontFamily || 'Arial'}
              fill={element.konvaAttrs?.fill || '#000000'}
              width={element.konvaAttrs?.width}
              height={element.konvaAttrs?.height}
              rotation={element.konvaAttrs?.rotation || 0}
              scaleX={element.konvaAttrs?.scaleX || 1}
              scaleY={element.konvaAttrs?.scaleY || 1}
              opacity={element.konvaAttrs?.opacity || 1}
              align={element.konvaAttrs?.align || 'left'}
              verticalAlign={element.konvaAttrs?.verticalAlign || 'top'}
              fontStyle={element.konvaAttrs?.fontStyle || 'normal'}
              textDecoration={element.konvaAttrs?.textDecoration || ''}
              stroke={element.konvaAttrs?.stroke}
              strokeWidth={element.konvaAttrs?.strokeWidth || 0}
              shadowColor={element.konvaAttrs?.shadowColor}
              shadowBlur={element.konvaAttrs?.shadowBlur || 0}
              shadowOffset={{
                x: element.konvaAttrs?.shadowOffset?.x || 0,
                y: element.konvaAttrs?.shadowOffset?.y || 0
              }}
              shadowOpacity={element.konvaAttrs?.shadowOpacity || 1}
              listening={false}
            />
          );
        }
        
        if (element.type === 'image' && element.konvaAttrs?.image) {
          return (
            <KonvaImageComponent
              key={key}
              src={element.konvaAttrs.image}
              x={element.konvaAttrs?.x || 0}
              y={element.konvaAttrs?.y || 0}
              width={element.konvaAttrs?.width || 100}
              height={element.konvaAttrs?.height || 100}
              rotation={element.konvaAttrs?.rotation || 0}
              scaleX={element.konvaAttrs?.scaleX || 1}
              scaleY={element.konvaAttrs?.scaleY || 1}
              opacity={element.konvaAttrs?.opacity || 1}
              listening={false}
            />
          );
        }
        
        if (element.type === 'shape') {
          return (
            <Rect
              key={key}
              x={element.konvaAttrs?.x || 0}
              y={element.konvaAttrs?.y || 0}
              width={element.konvaAttrs?.width || 100}
              height={element.konvaAttrs?.height || 100}
              fill={element.konvaAttrs?.fill || '#cccccc'}
              stroke={element.konvaAttrs?.stroke || '#000000'}
              strokeWidth={element.konvaAttrs?.strokeWidth || 1}
              rotation={element.konvaAttrs?.rotation || 0}
              scaleX={element.konvaAttrs?.scaleX || 1}
              scaleY={element.konvaAttrs?.scaleY || 1}
              opacity={element.konvaAttrs?.opacity || 1}
              cornerRadius={element.konvaAttrs?.cornerRadius || 0}
              listening={false}
            />
          );
        }
        
        return null;
      } catch (error) {
        console.error(`Error renderizando elemento ${index}:`, error);
        return null;
      }
    });
  };

  // ==================== RENDERIZADO DE ÁREAS ====================
  const renderCustomizationAreas = () => {
    if (!product?.customizationAreas) return null;
    
    return product.customizationAreas.map((area, index) => (
      <Rect
        key={area._id || area.id || `area-${index}`}
        x={area.position.x}
        y={area.position.y}
        width={area.position.width}
        height={area.position.height}
        stroke="#10B981"
        strokeWidth={2}
        fill="transparent"
        dash={[5, 5]}
        opacity={0.6}
        listening={false}
      />
    ));
  };

  // ==================== INFORMACIÓN DEL DISEÑO ====================
  const getStatusText = (status) => {
    const statusMap = {
      'draft': 'Borrador',
      'pending': 'Pendiente',
      'quoted': 'Cotizado',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'completed': 'Completado',
      'archived': 'Archivado'
    };
    return statusMap[status] || 'Desconocido';
  };

  // ==================== RENDER PRINCIPAL ====================
  if (!design) return null;

  return (
    <StyledDialog
      open={isOpen}
      onClose={onClose}
      maxWidth={false}
      fullWidth
    >
      <ModalHeader>
        <HeaderTitle>
          <Eye size={24} weight="duotone" />
          Vista de Diseño
        </HeaderTitle>
        <CloseButton onClick={onClose}>
          <X size={20} weight="bold" />
        </CloseButton>
      </ModalHeader>

      <ModalContent>
        <ViewerContainer>
          {/* Toolbar */}
          <ViewerToolbar>
            <Typography variant="h6" sx={{ color: '#010326', fontWeight: 600 }}>
              {design.name}
            </Typography>
            
            {enableZoom && (
              <ToolbarSection>
                <Tooltip title="Alejar">
                  <IconButton size="small" onClick={handleZoomOut} disabled={scale <= 0.1}>
                    <MagnifyingGlassMinus size={18} />
                  </IconButton>
                </Tooltip>
                
                <Box sx={{ width: 100, mx: 1 }}>
                  <Slider
                    value={scale}
                    min={0.1}
                    max={3}
                    step={0.1}
                    onChange={handleZoomChange}
                    size="small"
                    sx={{
                      color: '#10B981',
                      '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                      }
                    }}
                  />
                </Box>
                
                <Tooltip title="Acercar">
                  <IconButton size="small" onClick={handleZoomIn} disabled={scale >= 3}>
                    <MagnifyingGlassPlus size={18} />
                  </IconButton>
                </Tooltip>
                
                <Typography variant="caption" sx={{ ml: 1, minWidth: '40px' }}>
                  {Math.round(scale * 100)}%
                </Typography>
              </ToolbarSection>
            )}
            
            <ToolbarSection>
              <Tooltip title="Ajustar a pantalla">
                <ActionButton variant="outlined" onClick={handleFitToScreen}>
                  <ArrowsInSimple size={16} />
                </ActionButton>
              </Tooltip>
              
              <Tooltip title="Tamaño real">
                <ActionButton variant="outlined" onClick={handleActualSize}>
                  <ArrowsOutSimple size={16} />
                </ActionButton>
              </Tooltip>
              
              {enableDownload && (
                <Tooltip title="Descargar imagen">
                  <ActionButton 
                    variant="contained" 
                    onClick={handleDownload}
                    startIcon={<Download size={16} />}
                  >
                    Descargar
                  </ActionButton>
                </Tooltip>
              )}
            </ToolbarSection>
          </ViewerToolbar>

          {/* Canvas */}
          <CanvasContainer>
            {loading && (
              <LoadingOverlay>
                <CircularProgress sx={{ color: '#10B981' }} />
              </LoadingOverlay>
            )}
            
            {renderError && (
              <Box sx={{ 
                textAlign: 'center', 
                color: '#EF4444',
                p: 4 
              }}>
                <Typography component="div" variant="body1">
                  {renderError}
                </Typography>
              </Box>
            )}
            
            <Stage
              ref={stageRef}
              width={stageDimensions.width}
              height={stageDimensions.height}
              scaleX={scale}
              scaleY={scale}
              x={stagePos.x}
              y={stagePos.y}
              draggable={enableZoom}
              onDragEnd={(e) => {
                setStagePos({
                  x: e.target.x(),
                  y: e.target.y()
                });
              }}
            >
              <Layer>
                {/* Imagen del producto de fondo */}
                {productImage && (
                  <KonvaImage
                    image={productImage}
                    x={0}
                    y={0}
                    width={stageDimensions.width}
                    height={stageDimensions.height}
                    opacity={0.3}
                    listening={false}
                  />
                )}
                
                {/* Áreas de personalización */}
                {renderCustomizationAreas()}
                
                {/* Elementos del diseño */}
                {renderDesignElements()}
              </Layer>
            </Stage>
          </CanvasContainer>
        </ViewerContainer>

        {/* Panel de información */}
        {showInfo && (
          <InfoPanel>
            <InfoPanelHeader>
              <Typography variant="h6" sx={{ 
                color: '#010326', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Info size={20} weight="duotone" />
                Información del Diseño
              </Typography>
            </InfoPanelHeader>

            <InfoPanelContent>
              {/* Estado */}
              <InfoSection>
                <InfoSectionTitle>
                  <CheckCircle size={16} weight="duotone" />
                  Estado
                </InfoSectionTitle>
                <StatusChip
                  label={getStatusText(design.status)}
                  status={design.status}
                  size="small"
                />
              </InfoSection>

              {/* Cliente */}
              <InfoSection>
                <InfoSectionTitle>
                  <User size={16} weight="duotone" />
                  Cliente
                </InfoSectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Nombre</InfoLabel>
                    <InfoValue>{design.user?.name || design.clientName || 'No especificado'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Email</InfoLabel>
                    <InfoValue>{design.user?.email || design.clientEmail || 'No especificado'}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </InfoSection>

              {/* Producto */}
              <InfoSection>
                <InfoSectionTitle>
                  <Package size={16} weight="duotone" />
                  Producto
                </InfoSectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Nombre</InfoLabel>
                    <InfoValue>{product?.name || design.productName || 'No especificado'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Precio base</InfoLabel>
                    <InfoValue>
                      {product?.basePrice ? `$${product.basePrice.toFixed(2)}` : 'No especificado'}
                    </InfoValue>
                  </InfoItem>
                </InfoGrid>
              </InfoSection>

              {/* Detalles del diseño */}
              <InfoSection>
                <InfoSectionTitle>
                  <Palette size={16} weight="duotone" />
                  Detalles
                </InfoSectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Elementos</InfoLabel>
                    <InfoValue>{design.elements?.length || 0} elemento{design.elements?.length !== 1 ? 's' : ''}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Complejidad</InfoLabel>
                    <InfoValue style={{ textTransform: 'capitalize' }}>
                      {design.metadata?.complexity || 'Media'}
                    </InfoValue>
                  </InfoItem>
                  {design.price && (
                    <InfoItem>
                      <InfoLabel>Precio cotizado</InfoLabel>
                      <InfoValue>${design.price.toFixed(2)}</InfoValue>
                    </InfoItem>
                  )}
                  {design.productionDays && (
                    <InfoItem>
                      <InfoLabel>Tiempo de producción</InfoLabel>
                      <InfoValue>{design.productionDays} día{design.productionDays !== 1 ? 's' : ''}</InfoValue>
                    </InfoItem>
                  )}
                </InfoGrid>
              </InfoSection>

              {/* Fechas */}
              <InfoSection>
                <InfoSectionTitle>
                  <Calendar size={16} weight="duotone" />
                  Fechas
                </InfoSectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Creado</InfoLabel>
                    <InfoValue>
                      {design.createdAt ? new Date(design.createdAt).toLocaleDateString() : 'No especificado'}
                    </InfoValue>
                  </InfoItem>
                  {design.quotedAt && (
                    <InfoItem>
                      <InfoLabel>Cotizado</InfoLabel>
                      <InfoValue>{new Date(design.quotedAt).toLocaleDateString()}</InfoValue>
                    </InfoItem>
                  )}
                  {design.approvedAt && (
                    <InfoItem>
                      <InfoLabel>Aprobado</InfoLabel>
                      <InfoValue>{new Date(design.approvedAt).toLocaleDateString()}</InfoValue>
                    </InfoItem>
                  )}
                </InfoGrid>
              </InfoSection>

              {/* Notas */}
              {(design.clientNotes || design.adminNotes) && (
                <InfoSection>
                  <InfoSectionTitle>
                    Notas
                  </InfoSectionTitle>
                  {design.clientNotes && (
                    <InfoItem>
                      <InfoLabel>Cliente</InfoLabel>
                      <Typography variant="body2" sx={{ 
                        color: '#666', 
                        fontStyle: 'italic',
                        p: 2,
                        borderRadius: '8px',
                        background: alpha('#1F64BF', 0.05),
                        border: `1px solid ${alpha('#1F64BF', 0.1)}`
                      }}>
                        "{design.clientNotes}"
                      </Typography>
                    </InfoItem>
                  )}
                  {design.adminNotes && (
                    <InfoItem>
                      <InfoLabel>Administrador</InfoLabel>
                      <Typography variant="body2" sx={{ 
                        color: '#666', 
                        fontStyle: 'italic',
                        p: 2,
                        borderRadius: '8px',
                        background: alpha('#10B981', 0.05),
                        border: `1px solid ${alpha('#10B981', 0.1)}`
                      }}>
                        "{design.adminNotes}"
                      </Typography>
                    </InfoItem>
                  )}
                </InfoSection>
              )}

              {/* Opciones del producto */}
              {design.productOptions && design.productOptions.length > 0 && (
                <InfoSection>
                  <InfoSectionTitle>
                    Opciones Seleccionadas
                  </InfoSectionTitle>
                  <InfoGrid>
                    {design.productOptions.map((option, index) => (
                      <InfoItem key={index}>
                        <InfoLabel>{option.name}</InfoLabel>
                        <InfoValue>{option.value}</InfoValue>
                      </InfoItem>
                    ))}
                  </InfoGrid>
                </InfoSection>
              )}

              {/* Colores utilizados */}
              {design.metadata?.colors && design.metadata.colors.length > 0 && (
                <InfoSection>
                  <InfoSectionTitle>
                    Colores Utilizados
                  </InfoSectionTitle>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {design.metadata.colors.map((color, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: color,
                          border: '1px solid rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }}
                        title={color}
                      />
                    ))}
                  </Box>
                </InfoSection>
              )}

              {/* Fuentes utilizadas */}
              {design.metadata?.fonts && design.metadata.fonts.length > 0 && (
                <InfoSection>
                  <InfoSectionTitle>
                    Fuentes Utilizadas
                  </InfoSectionTitle>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {design.metadata.fonts.map((font, index) => (
                      <Chip
                        key={index}
                        label={font}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.75rem',
                          fontFamily: font,
                          borderColor: alpha('#10B981', 0.3),
                          color: '#059669'
                        }}
                      />
                    ))}
                  </Box>
                </InfoSection>
              )}
            </InfoPanelContent>
          </InfoPanel>
        )}
      </ModalContent>

      <ModalActions>
        <ActionButton variant="outlined" onClick={onClose}>
          Cerrar
        </ActionButton>
        
        {enableDownload && (
          <ActionButton 
            variant="contained" 
            onClick={handleDownload}
            startIcon={<Download size={16} />}
          >
            Descargar Imagen
          </ActionButton>
        )}
      </ModalActions>
    </StyledDialog>
  );
};

// ==================== PROP TYPES ====================
KonvaDesignViewer.defaultProps = {
  isOpen: false,
  showInfo: true,
  enableDownload: true,
  enableZoom: true,
  onClose: () => {}
};

export default KonvaDesignViewer;