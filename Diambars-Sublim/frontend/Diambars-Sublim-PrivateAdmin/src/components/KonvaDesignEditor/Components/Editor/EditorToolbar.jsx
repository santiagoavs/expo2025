// components/Editor/EditorToolbar.jsx
import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Slider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  X as CloseIcon,
  ArrowLeft as BackIcon,
  FloppyDisk,
  ArrowCounterClockwise,
  ArrowClockwise,
  SquaresFour,
  Magnet
} from '@phosphor-icons/react';

const ToolbarContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 3),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '25px',
  border: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 8px 32px rgba(1, 3, 38, 0.15)',
  zIndex: 10050
}));

const ToolbarButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: '12px',
  '&:hover': {
    backgroundColor: 'rgba(31, 100, 191, 0.1)'
  }
}));

export const EditorToolbar = ({
  product,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onClose,
  onBack,
  isLoading,
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap
}) => {
  return (
    <ToolbarContainer>
      <Tooltip title="Volver">
        <ToolbarButton onClick={onBack} size="small">
          <BackIcon size={20} />
        </ToolbarButton>
      </Tooltip>
      
      <Typography variant="h6" sx={{ mx: 2, color: '#010326' }}>
        {product?.name || 'Editor Konva'}
      </Typography>
      
      <Tooltip title="Deshacer">
        <ToolbarButton onClick={onUndo} disabled={!canUndo} size="small">
          <ArrowCounterClockwise size={20} />
        </ToolbarButton>
      </Tooltip>
      
      <Tooltip title="Rehacer">
        <ToolbarButton onClick={onRedo} disabled={!canRedo} size="small">
          <ArrowClockwise size={20} />
        </ToolbarButton>
      </Tooltip>

      <Box sx={{ width: 1, height: 24, backgroundColor: 'divider', mx: 1 }} />

      {/* Zoom Control */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption">Zoom:</Typography>
        <Slider
          value={zoom}
          onChange={(_, value) => onZoomChange(value)}
          min={0.1}
          max={3}
          step={0.1}
          sx={{ width: 100 }}
          size="small"
        />
        <Typography variant="caption">{Math.round(zoom * 100)}%</Typography>
      </Box>

      <Box sx={{ width: 1, height: 24, backgroundColor: 'divider', mx: 1 }} />

      {/* Grid Controls */}
      <FormControlLabel
        control={<Switch size="small" checked={showGrid} onChange={(e) => onToggleGrid(e.target.checked)} />}
        label="Cuadrícula"
        sx={{ margin: 0 }}
      />
      
      <FormControlLabel
        control={<Switch size="small" checked={snapToGrid} onChange={(e) => onToggleSnap(e.target.checked)} />}
        label="Snap"
        sx={{ margin: 0 }}
      />

      <Box sx={{ width: 1, height: 24, backgroundColor: 'divider', mx: 1 }} />
      
      <Tooltip title="Guardar">
        <ToolbarButton onClick={onSave} disabled={isLoading} size="small">
          <FloppyDisk size={20} />
        </ToolbarButton>
      </Tooltip>
      
      <Tooltip title="Cerrar">
        <ToolbarButton onClick={onClose} size="small">
          <CloseIcon size={20} />
        </ToolbarButton>
      </Tooltip>
    </ToolbarContainer>
  );
};
