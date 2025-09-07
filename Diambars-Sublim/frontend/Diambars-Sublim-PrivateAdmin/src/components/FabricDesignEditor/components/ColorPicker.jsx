// src/components/ColorPicker/ColorPicker.jsx - SELECTOR DE COLOR AVANZADO CON REACT-COLOR
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Popover, 
  Typography, 
  Grid, 
  Chip,
  Tooltip,
  Divider,
  Slider,
  Stack,
  Button,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Palette,
  DropHalf,
  Eye,
  EyeSlash,
  Check,
  X,
  ArrowClockwise,
  Heart,
  HeartIcon
} from '@phosphor-icons/react';
import { 
  SketchPicker, 
  ChromePicker, 
  CompactPicker, 
  SwatchesPicker 
} from 'react-color';

// Paleta de colores del tema
const THEME_COLORS = {
  primary: '#1F64BF',
  primaryDark: '#032CA6',
  accent: '#040DBF',
  background: '#F2F2F2',
  text: '#010326'
};

// Paletas predefinidas para diferentes propósitos
const PREDEFINED_PALETTES = {
  sublimation: [
    '#FF1493', '#00FF7F', '#00BFFF', '#FF8C00', 
    '#8A2BE2', '#32CD32', '#FF4500', '#4169E1'
  ],
  metallic: [
    '#C0C0C0', '#FFD700', '#CD7F32', '#B8860B', 
    '#708090', '#D2691E', '#A0522D', '#8B4513'
  ],
  pastel: [
    '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', 
    '#FFB3FF', '#B3FFFF', '#FFC9BA', '#D4EDDA'
  ],
  vibrant: [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FF6600', '#9900FF'
  ]
};

// Componente principal del contenedor
const ColorPickerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

// Botón del color actual con glassmorphism
const ColorButton = styled(IconButton)(({ theme, currentcolor }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '14px',
  background: `linear-gradient(135deg, ${currentcolor || '#ffffff'}, ${currentcolor || '#ffffff'})`,
  border: `2px solid ${THEME_COLORS.primary}`,
  boxShadow: `
    0 8px 32px rgba(31, 100, 191, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3)
  `,
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: `
      0 12px 40px rgba(31, 100, 191, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4)
    `
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, 
      transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, 
      transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%
    )`,
    backgroundSize: '8px 8px',
    opacity: 0.3
  }
}));

// Contenedor del popover con glassmorphism
const PopoverContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'rgba(242, 242, 242, 0.95)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  borderRadius: '20px',
  border: '1px solid rgba(31, 100, 191, 0.2)',
  boxShadow: `
    0 20px 60px rgba(1, 3, 38, 0.15),
    inset 0 1px 0 rgba(242, 242, 242, 0.9)
  `,
  minWidth: '320px',
  maxWidth: '400px'
}));

// Chip de paleta personalizado
const PaletteChip = styled(Chip)(({ theme, selected }) => ({
  backgroundColor: selected ? THEME_COLORS.primary : 'rgba(255, 255, 255, 0.1)',
  color: selected ? '#ffffff' : THEME_COLORS.text,
  border: `1px solid ${selected ? 'transparent' : 'rgba(31, 100, 191, 0.3)'}`,
  backdropFilter: 'blur(10px)',
  '&:hover': {
    backgroundColor: selected ? THEME_COLORS.primaryDark : 'rgba(31, 100, 191, 0.1)'
  }
}));

// Muestra de color en la grilla
const ColorSwatch = styled(Box)(({ theme, color, selected }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  backgroundColor: color,
  border: selected ? `2px solid ${THEME_COLORS.primary}` : '1px solid rgba(255, 255, 255, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '6px',
    background: `linear-gradient(45deg, 
      rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, 
      rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%
    )`,
    backgroundSize: '4px 4px'
  }
}));

/**
 * Componente ColorPicker avanzado que integra react-color
 * con funcionalidades adicionales como paletas, favoritos y transparencia
 */
const ColorPicker = ({
  currentcolor = '#1F64BF',
  onChange,
  onColorApply,
  showTransparency = true,
  showPalettes = true,
  showFavorites = true,
  pickerType = 'sketch', // 'sketch' | 'chrome' | 'compact' | 'swatches'
  disabled = false,
  size = 'medium', // 'small' | 'medium' | 'large'
  label,
  ...props
}) => {
  // Estados del componente
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempColor, setTempColor] = useState(currentcolor);
  const [selectedPalette, setSelectedPalette] = useState('sublimation');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('colorPicker_favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [opacity, setOpacity] = useState(1);
  const [colorHistory, setColorHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('colorPicker_history') || '[]');
    } catch {
      return [];
    }
  });

  const isOpen = Boolean(anchorEl);
  const pickerId = isOpen ? 'color-picker-popover' : undefined;

  // Refs para optimización
  const debounceTimeoutRef = useRef(null);

  // ==================== HANDLERS DE EVENTOS ====================

  /**
   * Abre el selector de color
   */
  const handleOpenPicker = useCallback((event) => {
    console.log('🎨 [ColorPicker] handleOpenPicker llamado');
    console.log('🎨 [ColorPicker] disabled:', disabled);
    console.log('🎨 [ColorPicker] currentcolor:', currentcolor);
    console.log('🎨 [ColorPicker] event:', event);
    
    if (disabled) {
      console.log('🎨 [ColorPicker] ColorPicker está deshabilitado, no abriendo');
      return;
    }
    
    console.log('🎨 [ColorPicker] Abriendo selector de color');
    setAnchorEl(event.currentTarget);
    setTempColor(currentcolor);
    console.log('🎨 [ColorPicker] anchorEl y tempColor establecidos');
  }, [disabled, currentcolor]);

  /**
   * Cierra el selector de color
   */
  const handleClosePicker = useCallback(() => {
    setAnchorEl(null);
  }, []);

  /**
   * Maneja el cambio de color con debounce
   */
  const handleColorChange = useCallback((color) => {
    console.log('🎨 [ColorPicker] handleColorChange llamado');
    console.log('🎨 [ColorPicker] color recibido:', color);
    console.log('🎨 [ColorPicker] onChange function:', !!onChange);
    
    const colorValue = color.hex || color;
    console.log('🎨 [ColorPicker] colorValue extraído:', colorValue);
    
    setTempColor(colorValue);
    console.log('🎨 [ColorPicker] tempColor actualizado a:', colorValue);
    
    // Debounce para optimizar rendimiento
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      console.log('🎨 [ColorPicker] Timeout anterior limpiado');
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('🎨 [ColorPicker] Ejecutando onChange con:', colorValue);
      if (onChange) {
        console.log('🎨 [ColorPicker] Llamando onChange function');
        onChange(colorValue, color);
        console.log('🎨 [ColorPicker] onChange ejecutado');
      } else {
        console.warn('🎨 [ColorPicker] onChange no está definido');
      }
    }, 100);
  }, [onChange]);

  /**
   * Aplica el color seleccionado
   */
  const handleApplyColor = useCallback(() => {
    // Agregar al historial
    const newHistory = [tempColor, ...colorHistory.filter(c => c !== tempColor)].slice(0, 20);
    setColorHistory(newHistory);
    localStorage.setItem('colorPicker_history', JSON.stringify(newHistory));
    
    if (onColorApply) {
      onColorApply(tempColor);
    }
    
    handleClosePicker();
  }, [tempColor, colorHistory, onColorApply, handleClosePicker]);

  /**
   * Cancela la selección de color
   */
  const handleCancelColor = useCallback(() => {
    setTempColor(currentcolor);
    handleClosePicker();
  }, [currentcolor, handleClosePicker]);

  /**
   * Selecciona un color de la paleta
   */
  const handlePaletteColorSelect = useCallback((color) => {
    handleColorChange(color);
  }, [handleColorChange]);

  /**
   * Agrega/remueve color de favoritos
   */
  const handleToggleFavorite = useCallback((color) => {
    const newFavorites = favorites.includes(color)
      ? favorites.filter(c => c !== color)
      : [...favorites, color].slice(0, 16); // Máximo 16 favoritos
    
    setFavorites(newFavorites);
    localStorage.setItem('colorPicker_favorites', JSON.stringify(newFavorites));
  }, [favorites]);

  /**
   * Maneja el cambio de opacidad
   */
  const handleOpacityChange = useCallback((event, newValue) => {
    setOpacity(newValue);
    // Convertir color a rgba con nueva opacidad
    const rgba = hexToRgba(tempColor, newValue);
    handleColorChange(rgba);
  }, [tempColor, handleColorChange]);

  // ==================== UTILIDADES ====================

  /**
   * Convierte hex a rgba
   */
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  /**
   * Renderiza el selector de color según el tipo
   */
  const renderColorPicker = () => {
    const commonProps = {
      color: tempColor,
      onChange: handleColorChange,
      disableAlpha: !showTransparency
    };

    switch (pickerType) {
      case 'chrome':
        return <ChromePicker {...commonProps} />;
      case 'compact':
        return <CompactPicker {...commonProps} />;
      case 'swatches':
        return <SwatchesPicker {...commonProps} />;
      default:
        return <SketchPicker {...commonProps} />;
    }
  };

  /**
   * Obtiene el tamaño del botón según la prop size
   */
  const getButtonSize = () => {
    switch (size) {
      case 'small': return '36px';
      case 'large': return '56px';
      default: return '48px';
    }
  };

  // ==================== EFECTOS ====================

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Sincronizar color temporal con prop actual
  useEffect(() => {
    if (!isOpen) {
      setTempColor(currentcolor);
    }
  }, [currentcolor, isOpen]);

  // ==================== RENDER ====================

  return (
    <ColorPickerContainer {...props}>
      {/* Label opcional */}
      {label && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: THEME_COLORS.text, 
            fontWeight: 600,
            mb: 1 
          }}
        >
          {label}
        </Typography>
      )}

      {/* Botón del color actual */}
      <Tooltip title="Seleccionar color" arrow>
        <span>
          <ColorButton
            currentcolor={tempColor}
            onClick={handleOpenPicker}
            disabled={disabled}
            sx={{ 
              width: getButtonSize(), 
              height: getButtonSize(),
              opacity: disabled ? 0.5 : 1
            }}
          >
            <Palette size={20} color="#ffffff" weight="bold" />
          </ColorButton>
        </span>
      </Tooltip>

      {/* Valor del color actual */}
      <Typography 
        variant="caption" 
        sx={{ 
          color: THEME_COLORS.text,
          fontWeight: 500,
          fontFamily: 'monospace',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid rgba(31, 100, 191, 0.2)'
        }}
      >
        {tempColor.toUpperCase()}
      </Typography>

      {/* Popover con el selector */}
      <Popover
        id={pickerId}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClosePicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          elevation: 8,
          sx: { 
            backgroundColor: THEME_COLORS.background,
            border: `1px solid ${THEME_COLORS.border}`,
            borderRadius: '12px',
            overflow: 'visible',
            minWidth: 280,
            maxWidth: 320
          }
        }}
      >
        <PopoverContent>
          {/* Header del selector */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: THEME_COLORS.text,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Palette size={20} />
              Selector de Color
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Aplicar color">
                <IconButton 
                  size="small" 
                  onClick={handleApplyColor}
                  sx={{ 
                    backgroundColor: THEME_COLORS.primary,
                    color: 'white',
                    '&:hover': { backgroundColor: THEME_COLORS.primaryDark }
                  }}
                >
                  <Check size={16} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Cancelar">
                <IconButton 
                  size="small" 
                  onClick={handleCancelColor}
                  sx={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                  }}
                >
                  <X size={16} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Selector de color principal */}
          <Box sx={{ mb: 3 }}>
            {renderColorPicker()}
          </Box>

          {/* Control de opacidad */}
          {showTransparency && (
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: THEME_COLORS.text,
                  fontWeight: 600,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <DropHalf size={16} />
                Opacidad: {Math.round(opacity * 100)}%
              </Typography>
              
              <Slider
                value={opacity}
                onChange={handleOpacityChange}
                min={0}
                max={1}
                step={0.01}
                sx={{
                  '& .MuiSlider-track': {
                    background: `linear-gradient(90deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
                    height: '6px',
                    borderRadius: '3px'
                  },
                  '& .MuiSlider-thumb': {
                    width: '20px',
                    height: '20px',
                    background: `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
                    border: '2px solid #ffffff',
                    boxShadow: '0 4px 12px rgba(31, 100, 191, 0.3)'
                  }
                }}
              />
            </Box>
          )}

          {/* Paletas predefinidas */}
          {showPalettes && (
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: THEME_COLORS.text,
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Paletas Predefinidas
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {Object.keys(PREDEFINED_PALETTES).map((paletteKey) => (
                  <PaletteChip
                    key={paletteKey}
                    label={paletteKey.charAt(0).toUpperCase() + paletteKey.slice(1)}
                    size="small"
                    selected={selectedPalette === paletteKey}
                    onClick={() => setSelectedPalette(paletteKey)}
                  />
                ))}
              </Stack>
              
              <Grid container spacing={1}>
                {PREDEFINED_PALETTES[selectedPalette].map((color, index) => (
                  <Grid item key={index}>
                    <ColorSwatch
                      color={color}
                      selected={tempColor === color}
                      onClick={() => handlePaletteColorSelect(color)}
                    >
                      {tempColor === color && (
                        <Check size={12} color="#ffffff" weight="bold" />
                      )}
                    </ColorSwatch>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 2, borderColor: 'rgba(31, 100, 191, 0.2)' }} />

          {/* Colores favoritos */}
          {showFavorites && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: THEME_COLORS.text,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {favorites.includes(tempColor) ? 
                    <HeartIcon size={16} color="#EF4444" /> : 
                    <Heart size={16} />
                  }
                  Favoritos ({favorites.length})
                </Typography>
                
                <Tooltip title={favorites.includes(tempColor) ? "Quitar de favoritos" : "Agregar a favoritos"}>
                  <IconButton 
                    size="small"
                    onClick={() => handleToggleFavorite(tempColor)}
                    sx={{ 
                      color: favorites.includes(tempColor) ? '#EF4444' : THEME_COLORS.text
                    }}
                  >
                    {favorites.includes(tempColor) ? 
                      <HeartIcon size={16} /> : 
                      <Heart size={16} />
                    }
                  </IconButton>
                </Tooltip>
              </Box>
              
              {favorites.length > 0 ? (
                <Grid container spacing={1}>
                  {favorites.map((color, index) => (
                    <Grid item key={index}>
                      <ColorSwatch
                        color={color}
                        selected={tempColor === color}
                        onClick={() => handlePaletteColorSelect(color)}
                      >
                        {tempColor === color && (
                          <Check size={12} color="#ffffff" weight="bold" />
                        )}
                      </ColorSwatch>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: THEME_COLORS.text,
                    opacity: 0.7,
                    fontStyle: 'italic'
                  }}
                >
                  No hay colores favoritos. Haz clic en el corazón para agregar.
                </Typography>
              )}
            </Box>
          )}

          {/* Historial de colores */}
          {colorHistory.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: THEME_COLORS.text,
                  fontWeight: 600,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <ArrowClockwise size={16} />
                Historial Reciente
              </Typography>
              
              <Grid container spacing={1}>
                {colorHistory.slice(0, 8).map((color, index) => (
                  <Grid item key={index}>
                    <ColorSwatch
                      color={color}
                      selected={tempColor === color}
                      onClick={() => handlePaletteColorSelect(color)}
                    >
                      {tempColor === color && (
                        <Check size={12} color="#ffffff" weight="bold" />
                      )}
                    </ColorSwatch>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Campo de entrada manual */}
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: THEME_COLORS.text,
                fontWeight: 600,
                mb: 1
              }}
            >
              Color Manual
            </Typography>
            
            <TextField
              size="small"
              value={tempColor}
              onChange={(e) => {
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setTempColor(value);
                  if (value.length === 7) {
                    handleColorChange(value);
                  }
                }
              }}
              placeholder="#1F64BF"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  '& fieldset': {
                    borderColor: 'rgba(31, 100, 191, 0.3)'
                  },
                  '&:hover fieldset': {
                    borderColor: THEME_COLORS.primary
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: THEME_COLORS.primary
                  }
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }
              }}
              fullWidth
            />
          </Box>
        </PopoverContent>
      </Popover>
    </ColorPickerContainer>
  );
};

export default ColorPicker;