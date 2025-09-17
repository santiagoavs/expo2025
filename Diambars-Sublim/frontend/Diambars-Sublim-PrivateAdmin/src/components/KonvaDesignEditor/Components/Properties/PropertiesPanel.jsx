// components/Properties/PropertiesPanel.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Slider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChromePicker } from 'react-color';
import { CaretDown } from '@phosphor-icons/react';

const PropertiesContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxHeight: '80vh',
  overflowY: 'auto',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 8px 32px rgba(1, 3, 38, 0.15)',
  padding: theme.spacing(2)
}));

const PropertySection = styled(Accordion)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.5)',
  borderRadius: '12px !important',
  boxShadow: 'none',
  border: '1px solid rgba(31, 100, 191, 0.1)',
  marginBottom: theme.spacing(1),
  
  '&:before': {
    display: 'none'
  }
}));

export const PropertiesPanel = ({
  selectedElements,
  onUpdateElement,
  onLoadGoogleFonts,
  availableFonts
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorType, setColorType] = useState('fill');

  if (!selectedElements || selectedElements.length === 0) {
    return (
      <PropertiesContainer>
        <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
          Selecciona un elemento para editar sus propiedades
        </Typography>
      </PropertiesContainer>
    );
  }

  const element = selectedElements[0]; // Por simplicidad, editar el primer elemento
  const isMultipleSelection = selectedElements.length > 1;

  const handlePropertyChange = (property, value) => {
    selectedElements.forEach(el => {
      onUpdateElement(el.id, { [property]: value });
    });
  };

  const handleColorChange = (color) => {
    handlePropertyChange(colorType, color.hex);
  };

  return (
    <PropertiesContainer>
      <Typography variant="h6" color="primary" gutterBottom>
        Propiedades
        {isMultipleSelection && (
          <Typography variant="caption" display="block" color="text.secondary">
            {selectedElements.length} elementos seleccionados
          </Typography>
        )}
      </Typography>

      {/* Información básica */}
      <PropertySection defaultExpanded>
        <AccordionSummary expandIcon={<CaretDown />}>
          <Typography variant="subtitle2" color="primary">
            Información
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="ID"
              value={element.id}
              size="small"
              disabled
              fullWidth
            />
            <TextField
              label="Tipo"
              value={element.type}
              size="small"
              disabled
              fullWidth
            />
          </Box>
        </AccordionDetails>
      </PropertySection>

      {/* Posición y transformación */}
      <PropertySection defaultExpanded>
        <AccordionSummary expandIcon={<CaretDown />}>
          <Typography variant="subtitle2" color="primary">
            Posición y Tamaño
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="X"
                type="number"
                value={Math.round(element.x || 0)}
                onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
                size="small"
                fullWidth
              />
              <TextField
                label="Y"
                type="number"
                value={Math.round(element.y || 0)}
                onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
                size="small"
                fullWidth
              />
            </Box>

            {element.type !== 'circle' && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Ancho"
                  type="number"
                  value={Math.round(element.width || 0)}
                  onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Alto"
                  type="number"
                  value={Math.round(element.height || 0)}
                  onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                  size="small"
                  fullWidth
                />
              </Box>
            )}

            {element.type === 'circle' && (
              <TextField
                label="Radio"
                type="number"
                value={Math.round(element.radius || 0)}
                onChange={(e) => handlePropertyChange('radius', parseInt(e.target.value))}
                size="small"
                fullWidth
              />
            )}

            <Box>
              <Typography variant="body2" gutterBottom>
                Rotación: {Math.round(element.rotation || 0)}°
              </Typography>
              <Slider
                value={element.rotation || 0}
                onChange={(_, value) => handlePropertyChange('rotation', value)}
                min={-180}
                max={180}
                step={1}
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                Opacidad: {Math.round((element.opacity || 1) * 100)}%
              </Typography>
              <Slider
                value={element.opacity || 1}
                onChange={(_, value) => handlePropertyChange('opacity', value)}
                min={0}
                max={1}
                step={0.01}
                size="small"
              />
            </Box>
          </Box>
        </AccordionDetails>
      </PropertySection>

      {/* Propiedades específicas de texto */}
      {element.type === 'text' && (
        <PropertySection>
          <AccordionSummary expandIcon={<CaretDown />}>
            <Typography variant="subtitle2" color="primary">
              Texto
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Contenido"
                value={element.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="Tamaño de fuente"
                type="number"
                value={element.fontSize || 24}
                onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                size="small"
                fullWidth
              />

              <FormControl size="small" fullWidth>
                <InputLabel>Fuente</InputLabel>
                <Select
                  value={element.fontFamily || 'Arial'}
                  onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                  label="Fuente"
                >
                  {availableFonts.map(font => (
                    <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                onClick={() => onLoadGoogleFonts(['Inter', 'Roboto', 'Poppins', 'Montserrat'])}
              >
                Cargar más fuentes
              </Button>

              <FormControl size="small" fullWidth>
                <InputLabel>Alineación</InputLabel>
                <Select
                  value={element.align || 'left'}
                  onChange={(e) => handlePropertyChange('align', e.target.value)}
                  label="Alineación"
                >
                  <MenuItem value="left">Izquierda</MenuItem>
                  <MenuItem value="center">Centro</MenuItem>
                  <MenuItem value="right">Derecha</MenuItem>
                  <MenuItem value="justify">Justificado</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </PropertySection>
      )}

      {/* Colores y apariencia */}
      <PropertySection>
        <AccordionSummary expandIcon={<CaretDown />}>
          <Typography variant="subtitle2" color="primary">
            Apariencia
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de color</InputLabel>
              <Select
                value={colorType}
                onChange={(e) => setColorType(e.target.value)}
                label="Tipo de color"
              >
                <MenuItem value="fill">Relleno</MenuItem>
                <MenuItem value="stroke">Borde</MenuItem>
              </Select>
            </FormControl>

            <Box
              sx={{
                width: '100%',
                height: 60,
                backgroundColor: element[colorType] || '#000000',
                border: '1px solid #ccc',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Typography variant="body2" sx={{ 
                color: element[colorType] === '#000000' ? 'white' : 'black',
                fontWeight: 'bold'
              }}>
                {element[colorType] || '#000000'}
              </Typography>
            </Box>

            {showColorPicker && (
              <ChromePicker
                color={element[colorType] || '#000000'}
                onChange={handleColorChange}
                disableAlpha={false}
              />
            )}

            {colorType === 'stroke' && (
              <TextField
                label="Grosor del borde"
                type="number"
                value={element.strokeWidth || 0}
                onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
                size="small"
                fullWidth
              />
            )}
          </Box>
        </AccordionDetails>
      </PropertySection>

      {/* Controles de visibilidad y bloqueo */}
      <PropertySection>
        <AccordionSummary expandIcon={<CaretDown />}>
          <Typography variant="subtitle2" color="primary">
            Control
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={element.visible !== false}
                  onChange={(e) => handlePropertyChange('visible', e.target.checked)}
                />
              }
              label="Visible"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={element.draggable !== false}
                  onChange={(e) => handlePropertyChange('draggable', e.target.checked)}
                />
              }
              label="Movible"
            />
          </Box>
        </AccordionDetails>
      </PropertySection>
    </PropertiesContainer>
  );
};
