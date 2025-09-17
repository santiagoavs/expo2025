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
  Plus
} from '@phosphor-icons/react';

const ToolsPanelContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(2),
  top: '50%',
  transform: 'translateY(-50%)',
  width: '70px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 8px 32px rgba(1, 3, 38, 0.15)',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  zIndex: 10050
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
  width: '50px',
  height: '50px',
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

export const ToolsPanel = ({
  activeTool,
  onToolChange,
  onAddText,
  onAddShape,
  onImageDrop,
  selectedCount,
  onDeleteSelected,
  onDuplicateSelected
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
      <Typography variant="caption" sx={{ color: '#010326', fontWeight: 600, mb: 1 }}>
        Herramientas
      </Typography>

      {/* Herramientas principales */}
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        
        return (
          <Tooltip key={tool.id} title={tool.label} placement="right">
            <ToolButton
              active={isActive}
              onClick={tool.action}
            >
              <Icon size={24} />
            </ToolButton>
          </Tooltip>
        );
      })}

      <Divider sx={{ width: '80%', my: 1 }} />

      {/* Drop zone para imágenes */}
      <Tooltip title="Arrastrar imágenes aquí" placement="right">
        <DropZoneArea {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />
          <Image size={20} color={isDragActive ? '#1F64BF' : '#666'} />
        </DropZoneArea>
      </Tooltip>

      <Divider sx={{ width: '80%', my: 1 }} />

      {/* Acciones de selección */}
      <Typography variant="caption" sx={{ color: '#010326', fontWeight: 600, mb: 0.5 }}>
        Acciones
      </Typography>

      <Tooltip title={`Duplicar (${selectedCount})`} placement="right">
        <Badge badgeContent={selectedCount} color="primary" invisible={selectedCount === 0}>
          <ToolButton
            disabled={selectedCount === 0}
            onClick={onDuplicateSelected}
            sx={{ opacity: selectedCount === 0 ? 0.5 : 1 }}
          >
            <Copy size={20} />
          </ToolButton>
        </Badge>
      </Tooltip>

      <Tooltip title={`Eliminar (${selectedCount})`} placement="right">
        <Badge badgeContent={selectedCount} color="error" invisible={selectedCount === 0}>
          <ToolButton
            disabled={selectedCount === 0}
            onClick={onDeleteSelected}
            sx={{ 
              opacity: selectedCount === 0 ? 0.5 : 1,
              '&:hover': {
                backgroundColor: selectedCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                color: selectedCount > 0 ? '#EF4444' : 'inherit'
              }
            }}
          >
            <Trash size={20} />
          </ToolButton>
        </Badge>
      </Tooltip>
    </ToolsPanelContainer>
  );
};
