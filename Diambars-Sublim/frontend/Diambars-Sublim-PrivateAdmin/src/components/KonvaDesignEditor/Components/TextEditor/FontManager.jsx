// src/components/KonvaDesignEditor/Components/TextEditor/FontManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Square, 
  Plus, 
  Trash, 
  Download,
  Check,
  X
} from '@phosphor-icons/react';
import { FIXED_COLORS, SHADOWS_3D, BORDERS } from '../../styles/responsiveTheme';

// ==================== CONSTANTES ====================
const GOOGLE_FONTS_API_KEY = 'AIzaSyB8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q'; // Reemplazar con tu API key
const GOOGLE_FONTS_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';

const POPULAR_FONTS = [
  { family: 'Roboto', category: 'sans-serif', variants: ['300', '400', '500', '700'] },
  { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '600', '700'] },
  { family: 'Lato', category: 'sans-serif', variants: ['300', '400', '700', '900'] },
  { family: 'Montserrat', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Poppins', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Playfair Display', category: 'serif', variants: ['400', '700', '900'] },
  { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700', '900'] },
  { family: 'Source Code Pro', category: 'monospace', variants: ['300', '400', '500', '700'] },
  { family: 'Fira Code', category: 'monospace', variants: ['300', '400', '500', '700'] },
  { family: 'Dancing Script', category: 'handwriting', variants: ['400', '700'] }
];

// ==================== COMPONENTE PRINCIPAL ====================
const FontManager = ({ 
  selectedFont, 
  onFontSelect, 
  onFontLoad,
  availableFonts = [],
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [googleFonts, setGoogleFonts] = useState([]);
  const [loadingGoogleFonts, setLoadingGoogleFonts] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState(new Set());

  // ==================== EFECTOS ====================
  
  useEffect(() => {
    loadGoogleFonts();
  }, []);

  // ==================== FUNCIONES ====================
  
  const loadGoogleFonts = useCallback(async () => {
    setLoadingGoogleFonts(true);
    try {
      const response = await fetch(`${GOOGLE_FONTS_URL}?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`);
      const data = await response.json();
      setGoogleFonts(data.items || []);
    } catch (error) {
      console.error('Error cargando fuentes de Google:', error);
      setGoogleFonts(POPULAR_FONTS);
    } finally {
      setLoadingGoogleFonts(false);
    }
  }, []);

  const loadFont = useCallback(async (fontFamily, variants = ['400']) => {
    try {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@${variants.join(';')}&display=swap`;
      
      // Crear link element para cargar la fuente
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Esperar a que la fuente se cargue
      await document.fonts.load(`400 16px "${fontFamily}"`);
      
      setLoadedFonts(prev => new Set([...prev, fontFamily]));
      onFontLoad?.(fontFamily, variants);
      
      return true;
    } catch (error) {
      console.error(`Error cargando fuente ${fontFamily}:`, error);
      return false;
    }
  }, [onFontLoad]);

  const handleFontSelect = useCallback((font) => {
    onFontSelect?.(font);
    
    // Cargar la fuente si no está cargada
    if (!loadedFonts.has(font.family)) {
      loadFont(font.family, font.variants);
    }
  }, [onFontSelect, loadedFonts, loadFont]);

  const filteredFonts = googleFonts.filter(font => 
    font.family.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==================== RENDER ====================
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ 
          color: FIXED_COLORS.textPrimary, 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Type size={24} />
          Gestión de Fuentes
        </Typography>
        <Typography variant="body2" sx={{ color: FIXED_COLORS.textSecondary, mt: 0.5 }}>
          Selecciona y carga fuentes personalizadas para tus diseños
        </Typography>
      </Box>

      {/* Búsqueda */}
      <TextField
        fullWidth
        placeholder="Buscar fuentes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: BORDERS.radius.medium,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          }
        }}
      />

      {/* Fuentes Cargadas */}
      {availableFonts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ 
            color: FIXED_COLORS.textPrimary, 
            fontWeight: 600,
            mb: 2
          }}>
            Fuentes Disponibles ({availableFonts.length})
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {availableFonts.map((font) => (
              <Chip
                key={font}
                label={font}
                onClick={() => handleFontSelect({ family: font, variants: ['400'] })}
                variant={selectedFont === font ? 'filled' : 'outlined'}
                color={selectedFont === font ? 'primary' : 'default'}
                sx={{
                  fontFamily: font,
                  '&.MuiChip-filled': {
                    backgroundColor: FIXED_COLORS.primary,
                    color: 'white'
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Fuentes de Google */}
      <Box>
        <Typography variant="subtitle2" sx={{ 
          color: FIXED_COLORS.textPrimary, 
          fontWeight: 600,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {loadingGoogleFonts ? (
            <>
              <CircularProgress size={16} />
              Cargando fuentes...
            </>
          ) : (
            <>
              <Download size={16} />
              Fuentes de Google ({filteredFonts.length})
            </>
          )}
        </Typography>

        {loadingGoogleFonts ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredFonts.slice(0, 20).map((font) => (
              <Grid item xs={12} sm={6} md={4} key={font.family}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: selectedFont === font.family ? `2px solid ${FIXED_COLORS.primary}` : '1px solid rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: SHADOWS_3D.medium
                    }
                  }}
                  onClick={() => handleFontSelect(font)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: `"${font.family}", ${font.category}`,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: FIXED_COLORS.textPrimary,
                        mb: 1
                      }}
                    >
                      {font.family}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Chip
                        label={font.category}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      {loadedFonts.has(font.family) && (
                        <Chip
                          icon={<Check size={12} />}
                          label="Cargada"
                          size="small"
                          color="success"
                          variant="filled"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Stack>

                    <Typography variant="body2" sx={{ 
                      color: FIXED_COLORS.textSecondary,
                      fontSize: '0.8rem'
                    }}>
                      Variantes: {font.variants?.join(', ') || '400'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Información */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          Las fuentes se cargan automáticamente cuando las seleccionas. 
          Puedes usar cualquier fuente de Google Fonts en tus diseños de texto.
        </Typography>
      </Alert>
    </Box>
  );
};

export default FontManager;
