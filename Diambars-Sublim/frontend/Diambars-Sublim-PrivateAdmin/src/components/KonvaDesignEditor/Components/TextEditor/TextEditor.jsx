// src/components/KonvaDesignEditor/Components/TextEditor/TextEditor.jsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { ChromePicker } from 'react-color';
import { 
  Square, 
  Circle, 
  Triangle,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  Plus
} from '@phosphor-icons/react';
import { FIXED_COLORS, SHADOWS_3D, BORDERS } from '../../styles/responsiveTheme';

// ==================== CONSTANTES ====================
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96];
const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '900', label: 'Black' }
];

const TEXT_ALIGNMENTS = [
  { value: 'left', label: 'Izquierda', icon: <TextAlignLeft size={16} /> },
  { value: 'center', label: 'Centro', icon: <TextAlignCenter size={16} /> },
  { value: 'right', label: 'Derecha', icon: <TextAlignRight size={16} /> },
  { value: 'justify', label: 'Justificado', icon: <TextAlignJustify size={16} /> }
];

// ==================== COMPONENTE PRINCIPAL ====================
const TextEditor = ({ 
  onAddText,
  onUpdateText,
  availableFonts = [],
  selectedFont = 'Arial',
  selectedElement = null
}) => {
  // Fuentes por defecto si no hay fuentes disponibles
  const defaultFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Comic Sans MS', 'Impact'];
  const fonts = availableFonts.length > 0 ? availableFonts : defaultFonts;
  const [textProperties, setTextProperties] = useState({
    text: 'Tu texto aquí',
    fontSize: 24,
    fontFamily: selectedFont,
    fontWeight: '400',
    fontStyle: 'normal',
    textDecoration: 'none',
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 0,
    align: 'left',
    verticalAlign: 'top',
    lineHeight: 1.2,
    letterSpacing: 0,
    padding: 0,
    opacity: 1
  });

  const [showFillPicker, setShowFillPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  
  // ✅ DEBUGGING: Estados para controlar apertura de selectores
  const [openSelectors, setOpenSelectors] = useState({
    fontFamily: false,
    fontSize: false,
    fontWeight: false,
    fontStyle: false,
    textDecoration: false
  });

  // ✅ CORRECCIÓN: Cargar propiedades del elemento seleccionado
  React.useEffect(() => {
    if (selectedElement && selectedElement.type === 'text') {
      console.log('🎨 [TextEditor] Cargando propiedades del elemento seleccionado:', selectedElement);
      setTextProperties({
        text: selectedElement.text || selectedElement.konvaAttrs?.text || 'Tu texto aquí',
        fontSize: selectedElement.fontSize || selectedElement.konvaAttrs?.fontSize || 24,
        fontFamily: selectedElement.fontFamily || selectedElement.konvaAttrs?.fontFamily || selectedFont,
        fontWeight: selectedElement.fontWeight || selectedElement.konvaAttrs?.fontWeight || '400',
        fontStyle: selectedElement.fontStyle || selectedElement.konvaAttrs?.fontStyle || 'normal',
        textDecoration: selectedElement.textDecoration || selectedElement.konvaAttrs?.textDecoration || 'none',
        fill: selectedElement.fill || selectedElement.konvaAttrs?.fill || '#000000',
        stroke: selectedElement.stroke || selectedElement.konvaAttrs?.stroke || '#000000',
        strokeWidth: selectedElement.strokeWidth || selectedElement.konvaAttrs?.strokeWidth || 0,
        align: selectedElement.align || selectedElement.konvaAttrs?.align || 'left',
        verticalAlign: selectedElement.verticalAlign || selectedElement.konvaAttrs?.verticalAlign || 'top',
        lineHeight: selectedElement.lineHeight || selectedElement.konvaAttrs?.lineHeight || 1.2,
        letterSpacing: selectedElement.letterSpacing || selectedElement.konvaAttrs?.letterSpacing || 0,
        padding: selectedElement.padding || selectedElement.konvaAttrs?.padding || 0,
        opacity: selectedElement.opacity || selectedElement.konvaAttrs?.opacity || 1
      });
    } else if (!selectedElement) {
      // ✅ CORRECCIÓN: Solo resetear a valores por defecto si no hay elemento seleccionado
      console.log('🎨 [TextEditor] No hay elemento seleccionado, manteniendo propiedades actuales');
      // No resetear las propiedades, mantener las actuales
    }
  }, [selectedElement, selectedFont]);

  // ==================== MANEJADORES ====================
  
  const handlePropertyChange = useCallback((property, value) => {
    console.log('🎨 [TextEditor] handlePropertyChange:', property, value);
    setTextProperties(prev => {
      const newProps = {
        ...prev,
        [property]: value
      };
      console.log('🎨 [TextEditor] Nuevas propiedades:', newProps);
      
      // ✅ CORRECCIÓN: Actualizar elemento seleccionado si existe
      if (selectedElement && selectedElement.type === 'text' && onUpdateText) {
        const updatedElement = {
          ...selectedElement,
          [property]: value
        };
        console.log('🎨 [TextEditor] Actualizando elemento seleccionado:', {
          property,
          value,
          elementId: selectedElement.id,
          updatedElement
        });
        onUpdateText(updatedElement);
      } else {
        console.log('🎨 [TextEditor] No se puede actualizar elemento:', {
          hasSelectedElement: !!selectedElement,
          elementType: selectedElement?.type,
          hasOnUpdateText: !!onUpdateText
        });
      }
      
      return newProps;
    });
  }, [selectedElement, onUpdateText]);

  // ✅ DEBUGGING: Logs para verificar si los selectores se abren
  const handleSelectOpen = useCallback((selectorName) => {
    console.log('🎨 [TextEditor] Selector abierto:', selectorName);
    console.log('🎨 [TextEditor] Elemento seleccionado:', selectedElement);
    console.log('🎨 [TextEditor] onUpdateText disponible:', !!onUpdateText);
    
    // ✅ CORRECCIÓN: Controlar apertura manualmente
    setOpenSelectors(prev => ({
      ...prev,
      [selectorName]: true
    }));
    
    // ✅ DEBUGGING: Verificar si hay elementos con z-index alto
    setTimeout(() => {
      const modals = document.querySelectorAll('.MuiMenu-paper');
      console.log('🎨 [TextEditor] Modales encontrados:', modals.length);
      modals.forEach((modal, index) => {
        const styles = window.getComputedStyle(modal);
        console.log(`🎨 [TextEditor] Modal ${index}:`, {
          zIndex: styles.zIndex,
          position: styles.position,
          display: styles.display,
          visibility: styles.visibility
        });
      });
    }, 100);
  }, [selectedElement, onUpdateText]);

  const handleSelectClose = useCallback((selectorName) => {
    console.log('🎨 [TextEditor] Selector cerrado:', selectorName);
    
    // ✅ CORRECCIÓN: Controlar cierre manualmente
    setOpenSelectors(prev => ({
      ...prev,
      [selectorName]: false
    }));
  }, []);

  const handleAddText = useCallback(() => {
    console.log('🎨 [TextEditor] handleAddText llamado con textProperties:', textProperties);
    
    if (!textProperties.text || textProperties.text.trim() === '') {
      console.error('❌ [TextEditor] Texto vacío, no se puede crear elemento');
      return;
    }

    const textElement = {
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      areaId: 'default-area', // Agregar areaId requerido por el backend
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      text: textProperties.text,
      fontSize: textProperties.fontSize,
      fontFamily: textProperties.fontFamily,
      fontWeight: textProperties.fontWeight,
      fontStyle: textProperties.fontStyle,
      textDecoration: textProperties.textDecoration,
      fill: textProperties.fill,
      stroke: textProperties.stroke,
      strokeWidth: textProperties.strokeWidth,
      align: textProperties.align,
      verticalAlign: textProperties.verticalAlign,
      lineHeight: textProperties.lineHeight,
      letterSpacing: textProperties.letterSpacing,
      padding: textProperties.padding,
      opacity: textProperties.opacity,
      draggable: true,
      visible: true,
      locked: false
    };

    console.log('🎨 [TextEditor] Creando elemento de texto:', textElement);
    onAddText?.(textElement);
  }, [textProperties, onAddText]);

  // ==================== RENDER ====================
  
  return (
    <Box sx={{ 
      p: 2,
      maxHeight: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative',
      zIndex: 1000, // ✅ CORRECCIÓN: Z-index alto para el contenedor
      '& .MuiSelect-select': {
        zIndex: 1001, // ✅ CORRECCIÓN: Z-index más alto para los selectores
      }
    }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ 
          color: FIXED_COLORS.textPrimary, 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Square size={24} />
          Editor de Texto
        </Typography>
        <Typography variant="body2" sx={{ color: FIXED_COLORS.textSecondary, mt: 0.5 }}>
          {selectedElement && selectedElement.type === 'text' 
            ? 'Editando texto seleccionado' 
            : 'Personaliza el texto que agregarás al diseño'
          }
        </Typography>
        
        {/* ✅ CORRECCIÓN: Indicador de texto seleccionado */}
        {selectedElement && selectedElement.type === 'text' ? (
          <Box sx={{ 
            p: 1, 
            backgroundColor: '#E3F2FD', 
            borderRadius: 1, 
            mt: 1,
            border: '1px solid #2196F3'
          }}>
            <Typography variant="caption" sx={{ 
              color: '#1976D2', 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <span>📝</span>
              Editando: "{selectedElement.text || selectedElement.konvaAttrs?.text || 'Sin texto'}"
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            p: 1, 
            backgroundColor: '#F5F5F5', 
            borderRadius: 1, 
            mt: 1,
            border: '1px solid #E0E0E0'
          }}>
            <Typography variant="caption" sx={{ 
              color: '#757575', 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <span>ℹ️</span>
              Selecciona un texto para editarlo
            </Typography>
          </Box>
        )}
      </Box>

      {/* Contenido del texto */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ 
          color: FIXED_COLORS.textPrimary, 
          fontWeight: 600,
          mb: 1
        }}>
          Contenido
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={textProperties.text}
          onChange={(e) => handlePropertyChange('text', e.target.value)}
          placeholder="Escribe tu texto aquí..."
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: BORDERS.radius.medium,
              backgroundColor: '#FFFFFF',
              color: '#000000',
              '&:hover': {
                backgroundColor: '#F8F9FA',
              },
              '&.Mui-focused': {
                backgroundColor: '#FFFFFF',
                boxShadow: '0 0 0 2px #1F64BF',
              },
              '& .MuiOutlinedInput-input': {
                color: '#000000',
                '&::placeholder': {
                  color: '#6B7280',
                  opacity: 1,
                }
              }
            }
          }}
        />
      </Box>

      {/* Fuente */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ 
          color: FIXED_COLORS.textPrimary, 
          fontWeight: 600,
          mb: 1
        }}>
          Fuente
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Familia</InputLabel>
              <Select
                value={textProperties.fontFamily}
                onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                onOpen={() => handleSelectOpen('fontFamily')}
                onClose={() => handleSelectClose('fontFamily')}
                open={openSelectors.fontFamily}
                label="Familia"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      zIndex: 999999, // ✅ CORRECCIÓN: Z-index extremadamente alto
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      position: 'fixed', // ✅ CORRECCIÓN: Posición fija
                      top: 'auto !important', // ✅ CORRECCIÓN: Forzar posición
                      left: 'auto !important', // ✅ CORRECCIÓN: Forzar posición
                      '& .MuiMenuItem-root': {
                        color: '#000000',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#1F64BF',
                          color: '#FFFFFF',
                        }
                      }
                    }
                  },
                  disablePortal: true, // ✅ CORRECCIÓN: Deshabilitar portal para renderizar en contenedor
                  disableScrollLock: true, // ✅ CORRECCIÓN: No bloquear scroll
                  keepMounted: false, // ✅ CORRECCIÓN: No mantener montado
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  }
                }}
                sx={{
                  borderRadius: BORDERS.radius.medium,
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F64BF',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F64BF',
                    borderWidth: 2,
                  }
                }}
              >
                {fonts.map((font) => (
                  <MenuItem 
                    key={font} 
                    value={font}
                    sx={{ fontFamily: font }}
                  >
                    {font}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Tamaño</InputLabel>
              <Select
                value={textProperties.fontSize}
                onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
                onOpen={() => handleSelectOpen('fontSize')}
                onClose={() => handleSelectClose('fontSize')}
                open={openSelectors.fontSize}
                label="Tamaño"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      zIndex: 999999, // ✅ CORRECCIÓN: Z-index extremadamente alto
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      position: 'fixed', // ✅ CORRECCIÓN: Posición fija
                      top: 'auto !important', // ✅ CORRECCIÓN: Forzar posición
                      left: 'auto !important', // ✅ CORRECCIÓN: Forzar posición
                      '& .MuiMenuItem-root': {
                        color: '#000000',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#1F64BF',
                          color: '#FFFFFF',
                        }
                      }
                    }
                  },
                  disablePortal: true, // ✅ CORRECCIÓN: Deshabilitar portal para renderizar en contenedor
                  disableScrollLock: true, // ✅ CORRECCIÓN: No bloquear scroll
                  keepMounted: false, // ✅ CORRECCIÓN: No mantener montado
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  }
                }}
                sx={{
                  borderRadius: BORDERS.radius.medium,
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F64BF',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F64BF',
                    borderWidth: 2,
                  }
                }}
              >
                {FONT_SIZES.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}px
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Estilo de fuente */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ 
          color: FIXED_COLORS.textPrimary, 
          fontWeight: 600,
          mb: 1
        }}>
          Estilo
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Peso</InputLabel>
              <Select
                value={textProperties.fontWeight}
                onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
                onOpen={() => handleSelectOpen('fontWeight')}
                onClose={() => handleSelectClose('fontWeight')}
                open={openSelectors.fontWeight}
                label="Peso"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      zIndex: 999999, // ✅ CORRECCIÓN: Z-index extremadamente alto
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      position: 'fixed', // ✅ CORRECCIÓN: Posición fija
                      top: 'auto !important', // ✅ CORRECCIÓN: Forzar posición
                      left: 'auto !important', // ✅ CORRECCIÓN: Forzar posición
                      '& .MuiMenuItem-root': {
                        color: '#000000',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#1F64BF',
                          color: '#FFFFFF',
                        }
                      }
                    }
                  },
                  disablePortal: true, // ✅ CORRECCIÓN: Deshabilitar portal para renderizar en contenedor
                  disableScrollLock: true, // ✅ CORRECCIÓN: No bloquear scroll
                  keepMounted: false, // ✅ CORRECCIÓN: No mantener montado
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  }
                }}
                sx={{
                  borderRadius: BORDERS.radius.medium,
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F64BF',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F64BF',
                    borderWidth: 2,
                  }
                }}
              >
                {FONT_WEIGHTS.map((weight) => (
                  <MenuItem key={weight.value} value={weight.value}>
                    {weight.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Estilo</InputLabel>
              <Select
                value={textProperties.fontStyle}
                onChange={(e) => handlePropertyChange('fontStyle', e.target.value)}
                onOpen={() => handleSelectOpen('fontStyle')}
                onClose={() => handleSelectClose('fontStyle')}
                open={openSelectors.fontStyle}
                label="Estilo"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      zIndex: 999999, // ✅ CORRECCIÓN: Z-index extremadamente alto
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      position: 'fixed', // ✅ CORRECCIÓN: Posición fija
                      top: 'auto !important', // ✅ CORRECCIÓN: Forzar posición
                      left: 'auto !important', // ✅ CORRECCIÓN: Forzar posición
                      '& .MuiMenuItem-root': {
                        color: '#000000',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#1F64BF',
                          color: '#FFFFFF',
                        }
                      }
                    }
                  },
                  disablePortal: true, // ✅ CORRECCIÓN: Deshabilitar portal para renderizar en contenedor
                  disableScrollLock: true, // ✅ CORRECCIÓN: No bloquear scroll
                  keepMounted: false, // ✅ CORRECCIÓN: No mantener montado
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  }
                }}
                sx={{
                  borderRadius: BORDERS.radius.medium,
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F64BF',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F64BF',
                    borderWidth: 2,
                  }
                }}
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="italic">Cursiva</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Decoración</InputLabel>
              <Select
                value={textProperties.textDecoration}
                onChange={(e) => handlePropertyChange('textDecoration', e.target.value)}
                onOpen={() => handleSelectOpen('textDecoration')}
                onClose={() => handleSelectClose('textDecoration')}
                open={openSelectors.textDecoration}
                label="Decoración"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      zIndex: 999999, // ✅ CORRECCIÓN: Z-index extremadamente alto
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      position: 'fixed', // ✅ CORRECCIÓN: Posición fija
                      top: 'auto !important', // ✅ CORRECCIÓN: Forzar posición
                      left: 'auto !important', // ✅ CORRECCIÓN: Forzar posición
                      '& .MuiMenuItem-root': {
                        color: '#000000',
                        '&:hover': {
                          backgroundColor: '#F3F4F6',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#1F64BF',
                          color: '#FFFFFF',
                        }
                      }
                    }
                  },
                  disablePortal: true, // ✅ CORRECCIÓN: Deshabilitar portal para renderizar en contenedor
                  disableScrollLock: true, // ✅ CORRECCIÓN: No bloquear scroll
                  keepMounted: false, // ✅ CORRECCIÓN: No mantener montado
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  }
                }}
                sx={{
                  borderRadius: BORDERS.radius.medium,
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F64BF',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1F64BF',
                    borderWidth: 2,
                  }
                }}
              >
                <MenuItem value="none">Ninguna</MenuItem>
                <MenuItem value="underline">Subrayado</MenuItem>
                <MenuItem value="line-through">Tachado</MenuItem>
                <MenuItem value="overline">Sobrelínea</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Alineación */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ 
          color: FIXED_COLORS.textPrimary, 
          fontWeight: 600,
          mb: 1
        }}>
          Alineación
        </Typography>
        <Stack direction="row" spacing={1}>
          {TEXT_ALIGNMENTS.map((alignment) => (
            <Button
              key={alignment.value}
              variant={textProperties.align === alignment.value ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handlePropertyChange('align', alignment.value)}
              startIcon={alignment.icon}
              sx={{
                borderRadius: BORDERS.radius.medium,
                minWidth: 'auto',
                px: 2
              }}
            >
              {alignment.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Colores */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ 
          color: FIXED_COLORS.textPrimary, 
          fontWeight: 600,
          mb: 1
        }}>
          Colores
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setShowFillPicker(!showFillPicker)}
              sx={{
                borderRadius: BORDERS.radius.medium,
                backgroundColor: '#FFFFFF',
                border: `2px solid ${textProperties.fill}`,
                color: '#000000',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#F8F9FA',
                  borderColor: textProperties.fill,
                  borderWidth: '3px',
                }
              }}
            >
              Relleno: {textProperties.fill}
            </Button>
            {showFillPicker && (
              <Box sx={{ 
                position: 'absolute', 
                zIndex: 1000, 
                mt: 1,
                boxShadow: SHADOWS_3D.large
              }}>
                <ChromePicker
                  color={textProperties.fill}
                  onChange={(color) => handlePropertyChange('fill', color.hex)}
                  disableAlpha
                />
              </Box>
            )}
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setShowStrokePicker(!showStrokePicker)}
              sx={{
                borderRadius: BORDERS.radius.medium,
                backgroundColor: '#FFFFFF',
                border: `2px solid ${textProperties.stroke}`,
                color: '#000000',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#F8F9FA',
                  borderColor: textProperties.stroke,
                  borderWidth: '3px',
                }
              }}
            >
              Borde: {textProperties.stroke}
            </Button>
            {showStrokePicker && (
              <Box sx={{ 
                position: 'absolute', 
                zIndex: 1000, 
                mt: 1,
                boxShadow: SHADOWS_3D.large
              }}>
                <ChromePicker
                  color={textProperties.stroke}
                  onChange={(color) => handlePropertyChange('stroke', color.hex)}
                  disableAlpha
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Grosor del borde */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ 
          color: FIXED_COLORS.textPrimary, 
          fontWeight: 600,
          mb: 1
        }}>
          Grosor del borde: {textProperties.strokeWidth}px
        </Typography>
        <Slider
          value={textProperties.strokeWidth}
          onChange={(e, value) => handlePropertyChange('strokeWidth', value)}
          min={0}
          max={10}
          step={0.5}
          sx={{
            color: FIXED_COLORS.primary,
            '& .MuiSlider-thumb': {
              backgroundColor: FIXED_COLORS.primary,
            }
          }}
        />
      </Box>

      {/* Espaciado */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ 
          color: FIXED_COLORS.textPrimary, 
          fontWeight: 600,
          mb: 1
        }}>
          Espaciado
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: FIXED_COLORS.textSecondary, mb: 1 }}>
              Interlineado: {textProperties.lineHeight}
            </Typography>
            <Slider
              value={textProperties.lineHeight}
              onChange={(e, value) => handlePropertyChange('lineHeight', value)}
              min={0.8}
              max={2}
              step={0.1}
              sx={{
                color: FIXED_COLORS.primary,
                '& .MuiSlider-thumb': {
                  backgroundColor: FIXED_COLORS.primary,
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: FIXED_COLORS.textSecondary, mb: 1 }}>
              Espaciado: {textProperties.letterSpacing}px
            </Typography>
            <Slider
              value={textProperties.letterSpacing}
              onChange={(e, value) => handlePropertyChange('letterSpacing', value)}
              min={-2}
              max={5}
              step={0.1}
              sx={{
                color: FIXED_COLORS.primary,
                '& .MuiSlider-thumb': {
                  backgroundColor: FIXED_COLORS.primary,
                }
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Botón de agregar */}
      <Box sx={{ 
        mt: 6, 
        mb: 6,
        pb: 4,
        position: 'relative',
        zIndex: 1,
        flexShrink: 0
      }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleAddText}
          startIcon={<Plus size={20} />}
          sx={{
            backgroundColor: FIXED_COLORS.primary,
            borderRadius: BORDERS.radius.medium,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            boxShadow: SHADOWS_3D.medium,
            minHeight: '48px',
            '&:hover': {
              backgroundColor: FIXED_COLORS.primaryDark,
              transform: 'translateY(-2px)',
              boxShadow: SHADOWS_3D.large,
            }
          }}
        >
          Agregar Texto al Diseño
        </Button>
      </Box>
    </Box>
  );
};

export default TextEditor;
