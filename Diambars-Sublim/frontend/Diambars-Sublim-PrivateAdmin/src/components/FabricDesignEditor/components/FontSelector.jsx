// src/components/FontSelector/FontSelector.jsx - SELECTOR DE FUENTES AVANZADO
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Chip,
  Stack,
  Tooltip,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TextAa,
  Download,
  Check,
  Warning
} from '@phosphor-icons/react';
import { useFontManager } from '../hooks/useFontManager';

// Constantes del tema
const THEME_COLORS = {
  primary: '#1F64BF',
  primaryDark: '#032CA6',
  accent: '#040DBF',
  background: '#F2F2F2',
  text: '#010326'
};

// Selector personalizado
const StyledSelect = styled(Select)({
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
  }
});

// Item del menú personalizado
const FontMenuItem = styled(MenuItem, {
  shouldForwardProp: (prop) => prop !== 'isGoogleFont' && prop !== 'fontFamily'
})(({ fontFamily, isGoogleFont }) => ({
  fontFamily: fontFamily,
  fontSize: '14px',
  padding: '8px 16px',
  '&.Mui-selected': {
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    '&:hover': {
      backgroundColor: 'rgba(31, 100, 191, 0.15)'
    }
  },
  '&:hover': {
    backgroundColor: 'rgba(31, 100, 191, 0.05)'
  },
  position: 'relative',
  '&::after': isGoogleFont ? {
    content: '"Google"',
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    color: THEME_COLORS.primary,
    fontWeight: 'bold',
    backgroundColor: 'rgba(31, 100, 191, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px'
  } : {}
}));

/**
 * Componente selector de fuentes con integración de Google Fonts
 */
const FontSelector = ({
  value,
  onChange,
  disabled = false,
  showGoogleFonts = true,
  showSystemFonts = true,
  showCustomFonts = true,
  size = 'medium',
  label = 'Fuente',
  ...props
}) => {
  // Hook de gestión de fuentes
  const {
    fonts,
    googleFontsLoaded,
    isLoading: fontsLoading,
    loadGoogleFonts,
    isFontAvailable,
    error: fontsError
  } = useFontManager();

  // Estados locales
  const [isLoadingFont, setIsLoadingFont] = useState(false);
  const [fontLoadError, setFontLoadError] = useState(null);

  // Cargar fuentes de Google automáticamente
  useEffect(() => {
    if (showGoogleFonts && !googleFontsLoaded && !fontsLoading) {
      loadGoogleFonts();
    }
  }, [showGoogleFonts, googleFontsLoaded, fontsLoading, loadGoogleFonts]);

  // Manejar cambio de fuente
  const handleFontChange = useCallback(async (fontFamily) => {
    console.log('🔤 [FontSelector] handleFontChange llamado');
    console.log('🔤 [FontSelector] fontFamily recibido:', fontFamily);
    console.log('🔤 [FontSelector] value actual:', value);
    console.log('🔤 [FontSelector] onChange function:', !!onChange);
    
    if (!fontFamily || fontFamily === value) {
      console.log('🔤 [FontSelector] No hay cambio de fuente o es la misma');
      return;
    }

    console.log('🔤 [FontSelector] Iniciando cambio de fuente a:', fontFamily);
    setIsLoadingFont(true);
    setFontLoadError(null);

    try {
      // Verificar si la fuente está disponible
      if (!isFontAvailable(fontFamily)) {
        console.warn(`⚠️ [FontSelector] Fuente ${fontFamily} no está disponible`);
        setFontLoadError(`La fuente ${fontFamily} no está disponible`);
        return;
      }

      // Aplicar la fuente
      console.log('🔤 [FontSelector] Aplicando fuente:', fontFamily);
      if (onChange) {
        console.log('🔤 [FontSelector] Llamando onChange con:', fontFamily);
        onChange(fontFamily);
        console.log('🔤 [FontSelector] onChange ejecutado');
      } else {
        console.warn('🔤 [FontSelector] onChange no está definido');
      }

      console.log(`✅ [FontSelector] Fuente aplicada: ${fontFamily}`);
    } catch (error) {
      console.error('❌ [FontSelector] Error aplicando fuente:', error);
      setFontLoadError('Error al aplicar la fuente');
    } finally {
      setIsLoadingFont(false);
    }
  }, [value, onChange, isFontAvailable]);

  // Obtener fuentes filtradas según configuración
  const getFilteredFonts = useCallback(() => {
    let filteredFonts = [];

    if (showSystemFonts && fonts.system) {
      filteredFonts = [...filteredFonts, ...fonts.system];
    }

    if (showGoogleFonts && googleFontsLoaded && fonts.google) {
      filteredFonts = [...filteredFonts, ...fonts.google];
    }

    if (showCustomFonts && fonts.custom) {
      filteredFonts = [...filteredFonts, ...fonts.custom];
    }

    // Eliminar duplicados y ordenar
    const uniqueFonts = [...new Set(filteredFonts)].sort();
    console.log('🔤 [FontSelector] Fuentes filtradas:', uniqueFonts.length, uniqueFonts);
    return uniqueFonts;
  }, [fonts, showSystemFonts, showGoogleFonts, showCustomFonts, googleFontsLoaded]);

  // Obtener el tamaño del selector
  const getSelectSize = () => {
    switch (size) {
      case 'small': return 'small';
      case 'large': return 'medium';
      default: return 'small';
    }
  };

  const filteredFonts = getFilteredFonts();
  
  // Validar que el valor actual esté en las fuentes disponibles
  const validValue = filteredFonts.includes(value) ? value : (filteredFonts.length > 0 ? filteredFonts[0] : '');

  // Efecto para actualizar el valor cuando las fuentes se cargan
  useEffect(() => {
    if (filteredFonts.length > 0 && !filteredFonts.includes(value)) {
      // Si el valor actual no está en las fuentes disponibles, usar la primera disponible
      const newValue = filteredFonts[0];
      console.log('🔤 [FontSelector] Actualizando valor por defecto:', newValue);
      onChange(newValue);
    }
  }, [filteredFonts, value, onChange]);

  return (
    <Box {...props}>
      {/* Label */}
      {label && (
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
          <TextAa size={16} />
          {label}
        </Typography>
      )}

      {/* Selector de fuentes */}
      <FormControl fullWidth size={getSelectSize()}>
        <StyledSelect
          value={validValue}
          onChange={(e) => handleFontChange(e.target.value)}
          disabled={disabled || isLoadingFont}
          displayEmpty
        >
          {filteredFonts.map((font) => {
            const isGoogleFont = fonts.google.includes(font);
            const isCustomFont = fonts.custom.includes(font);
            
            return (
              <FontMenuItem
                key={font}
                value={font}
                fontFamily={font}
                isGoogleFont={isGoogleFont}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography sx={{ fontFamily: font, flex: 1 }}>
                    {font}
                  </Typography>
                  
                  {isGoogleFont && (
                    <Chip
                      label="Google"
                      size="small"
                      sx={{
                        fontSize: '10px',
                        height: '20px',
                        backgroundColor: 'rgba(31, 100, 191, 0.1)',
                        color: THEME_COLORS.primary
                      }}
                    />
                  )}
                  
                  {isCustomFont && (
                    <Chip
                      label="Custom"
                      size="small"
                      sx={{
                        fontSize: '10px',
                        height: '20px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981'
                      }}
                    />
                  )}
                </Box>
              </FontMenuItem>
            );
          })}
        </StyledSelect>
      </FormControl>

      {/* Estados de carga y error */}
      <Stack spacing={1} sx={{ mt: 1 }}>
        {isLoadingFont && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Aplicando fuente...
            </Typography>
          </Box>
        )}

        {fontLoadError && (
          <Alert severity="warning" sx={{ py: 0.5 }}>
            <Typography variant="caption">
              {fontLoadError}
            </Typography>
          </Alert>
        )}

        {fontsError && (
          <Alert severity="error" sx={{ py: 0.5 }}>
            <Typography variant="caption">
              Error cargando fuentes: {fontsError}
            </Typography>
          </Alert>
        )}

        {/* Botón para cargar fuentes de Google */}
        {showGoogleFonts && !googleFontsLoaded && !fontsLoading && (
          <Button
            size="small"
            onClick={loadGoogleFonts}
            disabled={fontsLoading}
            startIcon={fontsLoading ? <CircularProgress size={16} /> : <Download size={16} />}
            sx={{ 
              fontSize: '0.75rem',
              color: THEME_COLORS.primary,
              textTransform: 'none'
            }}
          >
            {fontsLoading ? 'Cargando...' : 'Cargar fuentes de Google'}
          </Button>
        )}

        {/* Indicador de fuentes cargadas */}
        {googleFontsLoaded && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Check size={16} color={THEME_COLORS.primary} />
            <Typography variant="caption" color="text.secondary">
              {fonts.google.length} fuentes de Google cargadas
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default FontSelector;
