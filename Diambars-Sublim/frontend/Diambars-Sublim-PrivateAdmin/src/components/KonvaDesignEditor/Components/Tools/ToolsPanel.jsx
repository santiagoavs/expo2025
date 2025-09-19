// components/Tools/ToolsPanel.jsx
import React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import {
  Cursor,
  TextT,
  Rectangle,
  Circle,
  Triangle,
  Star,
  Image,
  Trash,
  Copy,
  Download,
  Plus,
  Palette,
  MapPin,
  CaretDown
} from '@phosphor-icons/react';

const ToolsPanelContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(2),
  top: '50%',
  transform: 'translateY(-50%)',
  width: '280px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 8px 32px rgba(1, 3, 38, 0.15)',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  zIndex: 10050,
  maxHeight: '80vh',
  overflowY: 'auto'
}));

const ToolButton = styled(IconButton)(({ theme, active }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '12px',
  border: active ? `2px solid #1F64BF` : '2px solid transparent',
  backgroundColor: active ? 'rgba(31, 100, 191, 0.1)' : 'transparent',
  color: active ? '#1F64BF' : '#010326',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    color: '#1F64BF',
    transform: 'scale(1.05)'
  }
}));

const DropZoneArea = styled(Box)(({ theme, isDragActive }) => ({
  width: '100%',
  height: '60px',
  border: `2px dashed ${isDragActive ? '#1F64BF' : '#ccc'}`,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragActive ? 'rgba(31, 100, 191, 0.1)' : 'transparent',
  
  '&:hover': {
    borderColor: '#1F64BF',
    backgroundColor: 'rgba(31, 100, 191, 0.05)'
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: '#010326',
  fontWeight: 600,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5)
}));

const ToolsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(0.5)
}));

const ColorPreview = styled(Box)(({ color }) => ({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: color || '#ccc',
  border: '2px solid #fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

const ZoneSelector = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5)
}));

const ZoneButton = styled(Box)(({ theme, active }) => ({
  padding: theme.spacing(0.75, 1),
  borderRadius: '8px',
  backgroundColor: active ? 'rgba(31, 100, 191, 0.1)' : 'transparent',
  border: `1px solid ${active ? '#1F64BF' : 'rgba(0,0,0,0.1)'}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.75rem',
  color: active ? '#1F64BF' : '#666',
  
  '&:hover': {
    backgroundColor: 'rgba(31, 100, 191, 0.05)',
    borderColor: '#1F64BF'
  }
}));

export const ToolsPanel = ({
  activeTool,
  onToolChange,
  onAddText,
  onAddShape,
  onImageDrop,
  selectedCount,
  onDeleteSelected,
  onDuplicateSelected,
  // Nuevas props para funcionalidades movidas
  customizationAreas = [],
  selectedAreaId,
  onAreaSelect,
  productColorFilter,
  onColorChange,
  onColorApply,
  onResetColor
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    onDrop: onImageDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  });

  const tools = [
    { id: 'select', icon: Cursor, label: 'Seleccionar', action: () => onToolChange('select') },
    { id: 'text', icon: TextT, label: 'Texto', action: onAddText },
    { id: 'rect', icon: Rectangle, label: 'Rectángulo', action: () => onAddShape('rect') },
    { id: 'circle', icon: Circle, label: 'Círculo', action: () => onAddShape('circle') },
    { id: 'triangle', icon: Triangle, label: 'Triángulo', action: () => onAddShape('triangle') },
    { id: 'star', icon: Star, label: 'Estrella', action: () => onAddShape('star') }
  ];

  return (
    <ToolsPanelContainer elevation={0}>
      {/* Sección de Herramientas */}
      <SectionTitle>
        <Cursor size={16} />
        Herramientas
      </SectionTitle>
      
      <ToolsGrid>
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <Tooltip key={tool.id} title={tool.label} placement="right">
              <ToolButton
                active={isActive}
                onClick={tool.action}
              >
                <Icon size={20} />
              </ToolButton>
            </Tooltip>
          );
        })}
      </ToolsGrid>

      <Divider sx={{ my: 1 }} />

      {/* Sección de Zonas de Personalización */}
      {customizationAreas.length > 0 && (
        <>
          <SectionTitle>
            <MapPin size={16} />
            Zonas
          </SectionTitle>
          
          <ZoneSelector>
            {customizationAreas.map((area) => (
              <ZoneButton
                key={area.id}
                active={selectedAreaId === area.id}
                onClick={() => onAreaSelect && onAreaSelect(area.id)}
              >
                {area.name || `Zona ${area.id}`}
              </ZoneButton>
            ))}
          </ZoneSelector>

          <Divider sx={{ my: 1 }} />
        </>
      )}

      {/* Sección de Color del Producto */}
      <SectionTitle>
        <Palette size={16} />
        Color del Producto
      </SectionTitle>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <ColorPreview color={productColorFilter} />
        <Typography variant="caption" sx={{ color: '#666', flex: 1 }}>
          {productColorFilter ? 'Color aplicado' : 'Sin color'}
        </Typography>
        {productColorFilter && (
          <IconButton
            size="small"
            onClick={onResetColor}
            sx={{ 
              width: 24, 
              height: 24,
              '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
            }}
          >
            <Trash size={14} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {['#1F64BF', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((color) => (
          <Tooltip key={color} title={color} placement="top">
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: color,
                border: productColorFilter === color ? '2px solid #fff' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'scale(1.1)' }
              }}
              onClick={() => onColorChange && onColorChange(color)}
            />
          </Tooltip>
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Sección de Imágenes */}
      <SectionTitle>
        <Image size={16} />
        Imágenes
      </SectionTitle>
      
      <DropZoneArea {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <Box sx={{ textAlign: 'center' }}>
          <Image size={24} color={isDragActive ? '#1F64BF' : '#666'} />
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#666' }}>
            {isDragActive ? 'Suelta aquí' : 'Arrastra imágenes'}
          </Typography>
        </Box>
      </DropZoneArea>

      <Divider sx={{ my: 1 }} />

      {/* Sección de Acciones */}
      <SectionTitle>
        <Plus size={16} />
        Acciones
      </SectionTitle>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title={`Duplicar (${selectedCount})`} placement="top">
          <Badge badgeContent={selectedCount} color="primary" invisible={selectedCount === 0}>
            <ToolButton
              disabled={selectedCount === 0}
              onClick={onDuplicateSelected}
              sx={{ 
                opacity: selectedCount === 0 ? 0.5 : 1,
                flex: 1,
                height: 40
              }}
            >
              <Copy size={18} />
            </ToolButton>
          </Badge>
        </Tooltip>

        <Tooltip title={`Eliminar (${selectedCount})`} placement="top">
          <Badge badgeContent={selectedCount} color="error" invisible={selectedCount === 0}>
            <ToolButton
              disabled={selectedCount === 0}
              onClick={onDeleteSelected}
              sx={{ 
                opacity: selectedCount === 0 ? 0.5 : 1,
                flex: 1,
                height: 40,
                '&:hover': {
                  backgroundColor: selectedCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                  color: selectedCount > 0 ? '#EF4444' : 'inherit'
                }
              }}
            >
              <Trash size={18} />
            </ToolButton>
          </Badge>
        </Tooltip>
      </Box>
    </ToolsPanelContainer>
  );
};
