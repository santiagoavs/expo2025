// components/Export/ExportPanel.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Download } from '@phosphor-icons/react';

const ExportContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 8px 32px rgba(1, 3, 38, 0.15)',
  padding: theme.spacing(2)
}));

export const ExportPanel = ({ onExport, elements, canvasConfig }) => {
  const [exportSettings, setExportSettings] = useState({
    format: 'png',
    quality: 1,
    pixelRatio: 2,
    includeBackground: true
  });

  const exportFormats = [
    { value: 'png', label: 'PNG (Recomendado)' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'webp', label: 'WebP' },
    { value: 'pdf', label: 'PDF' }
  ];

  const handleExport = () => {
    onExport(exportSettings.format, exportSettings);
  };

  return (
    <ExportContainer>
      <Typography variant="h6" color="primary" gutterBottom>
        Exportar Diseño
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Formato</InputLabel>
          <Select
            value={exportSettings.format}
            onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value }))}
            label="Formato"
          >
            {exportFormats.map(format => (
              <MenuItem key={format.value} value={format.value}>
                {format.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {exportSettings.format !== 'pdf' && (
          <>
            <Box>
              <Typography variant="body2" gutterBottom>
                Calidad: {Math.round(exportSettings.quality * 100)}%
              </Typography>
              <Slider
                value={exportSettings.quality}
                onChange={(_, value) => setExportSettings(prev => ({ ...prev, quality: value }))}
                min={0.1}
                max={1}
                step={0.1}
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                Resolución: {exportSettings.pixelRatio}x
              </Typography>
              <Slider
                value={exportSettings.pixelRatio}
                onChange={(_, value) => setExportSettings(prev => ({ ...prev, pixelRatio: value }))}
                min={1}
                max={4}
                step={1}
                size="small"
                marks
              />
            </Box>
          </>
        )}

        <Button
          variant="contained"
          onClick={handleExport}
          startIcon={<Download />}
          size="large"
          fullWidth
        >
          Exportar como {exportSettings.format.toUpperCase()}
        </Button>

        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(31, 100, 191, 0.05)', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Elementos: {elements.length} | 
            Canvas: {canvasConfig.width}x{canvasConfig.height}px
          </Typography>
        </Box>
      </Box>
    </ExportContainer>
  );
};