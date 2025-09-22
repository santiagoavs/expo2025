// components/GoogleFonts/GoogleFontsLoader.jsx - CARGADOR DE GOOGLE FONTS
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { FIXED_COLORS } from '../../styles/responsiveTheme';

// ==================== CONFIGURACIÓN DE FUENTES ====================
const GOOGLE_FONTS_CONFIG = {
  // Fuentes populares para diseño
  popular: [
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Source Sans Pro',
    'Raleway',
    'PT Sans',
    'Oswald',
    'Lora',
    'Playfair Display'
  ],
  
  // Fuentes decorativas
  decorative: [
    'Dancing Script',
    'Pacifico',
    'Lobster',
    'Bebas Neue',
    'Fredoka One',
    'Righteous',
    'Bangers',
    'Creepster',
    'Nosifer',
    'Butcherman'
  ],
  
  // Fuentes monoespaciadas
  monospace: [
    'Roboto Mono',
    'Source Code Pro',
    'Fira Code',
    'JetBrains Mono',
    'Consolas',
    'Monaco',
    'Courier New'
  ],
  
  // Fuentes serif
  serif: [
    'Playfair Display',
    'Merriweather',
    'Lora',
    'Crimson Text',
    'Libre Baskerville',
    'PT Serif',
    'Source Serif Pro'
  ]
};

// ==================== HOOK PARA CARGAR FUENTES ====================
export const useGoogleFonts = () => {
  const [loadedFonts, setLoadedFonts] = useState(new Set());
  const [loadingFonts, setLoadingFonts] = useState(new Set());
  const [fontErrors, setFontErrors] = useState(new Map());

  const loadFont = useCallback(async (fontName) => {
    if (loadedFonts.has(fontName) || loadingFonts.has(fontName)) {
      return { success: true, font: fontName };
    }

    setLoadingFonts(prev => new Set(prev).add(fontName));
    setFontErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(fontName);
      return newMap;
    });

    try {
      // Verificar si webFontLoader está disponible
      if (typeof window.WebFont === 'undefined') {
        // Cargar webFontLoader dinámicamente
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Cargar la fuente usando webFontLoader
      await new Promise((resolve, reject) => {
        window.WebFont.load({
          google: {
            families: [fontName]
          },
          active: () => {
            console.log(`✅ Fuente cargada: ${fontName}`);
            resolve();
          },
          inactive: () => {
            console.warn(`⚠️ Fuente no disponible: ${fontName}`);
            reject(new Error(`Fuente ${fontName} no disponible`));
          },
          timeout: 10000 // 10 segundos timeout
        });
      });

      setLoadedFonts(prev => new Set(prev).add(fontName));
      setLoadingFonts(prev => {
        const newSet = new Set(prev);
        newSet.delete(fontName);
        return newSet;
      });

      return { success: true, font: fontName };
    } catch (error) {
      console.error(`❌ Error cargando fuente ${fontName}:`, error);
      
      setFontErrors(prev => new Map(prev).set(fontName, error.message));
      setLoadingFonts(prev => {
        const newSet = new Set(prev);
        newSet.delete(fontName);
        return newSet;
      });

      return { success: false, font: fontName, error: error.message };
    }
  }, [loadedFonts, loadingFonts]);

  const loadMultipleFonts = useCallback(async (fontNames) => {
    const results = await Promise.allSettled(
      fontNames.map(fontName => loadFont(fontName))
    );

    const successful = results
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.value.font);

    const failed = results
      .filter(result => result.status === 'rejected' || !result.value.success)
      .map(result => result.value?.font || 'Unknown');

    return {
      successful,
      failed,
      total: fontNames.length
    };
  }, [loadFont]);

  const isFontLoaded = useCallback((fontName) => {
    return loadedFonts.has(fontName);
  }, [loadedFonts]);

  const isFontLoading = useCallback((fontName) => {
    return loadingFonts.has(fontName);
  }, [loadingFonts]);

  const getFontError = useCallback((fontName) => {
    return fontErrors.get(fontName);
  }, [fontErrors]);

  return {
    loadFont,
    loadMultipleFonts,
    isFontLoaded,
    isFontLoading,
    getFontError,
    loadedFonts: Array.from(loadedFonts),
    loadingFonts: Array.from(loadingFonts),
    fontErrors: Array.from(fontErrors.entries())
  };
};

// ==================== COMPONENTE DE ESTADO DE FUENTES ====================
export const FontStatusIndicator = ({ fontName, isLoaded, isLoading, error }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Cargando {fontName}...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" size="small" sx={{ mb: 1 }}>
        Error cargando {fontName}: {error}
      </Alert>
    );
  }

  if (isLoaded) {
    return (
      <Chip
        label={fontName}
        size="small"
        color="success"
        variant="outlined"
        sx={{ 
          fontFamily: fontName,
          fontSize: '0.75rem',
          height: 24
        }}
      />
    );
  }

  return (
    <Chip
      label={fontName}
      size="small"
      variant="outlined"
      sx={{ 
        fontSize: '0.75rem',
        height: 24
      }}
    />
  );
};

// ==================== COMPONENTE PRINCIPAL ====================
export const GoogleFontsLoader = ({ 
  onFontsLoaded, 
  onFontsError,
  autoLoadPopular = true 
}) => {
  const {
    loadMultipleFonts,
    isFontLoaded,
    isFontLoading,
    getFontError,
    loadedFonts,
    loadingFonts,
    fontErrors
  } = useGoogleFonts();

  // Cargar fuentes populares automáticamente
  useEffect(() => {
    if (autoLoadPopular && loadedFonts.length === 0 && loadingFonts.length === 0) {
      loadMultipleFonts(GOOGLE_FONTS_CONFIG.popular.slice(0, 5))
        .then(result => {
          if (result.successful.length > 0) {
            onFontsLoaded?.(result.successful);
          }
          if (result.failed.length > 0) {
            onFontsError?.(result.failed);
          }
        });
    }
  }, [autoLoadPopular, loadedFonts.length, loadingFonts.length, loadMultipleFonts, onFontsLoaded, onFontsError]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: FIXED_COLORS.text }}>
        🎨 Google Fonts
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Fuentes cargadas: {loadedFonts.length} | Cargando: {loadingFonts.length}
      </Typography>

      {/* Fuentes cargadas */}
      {loadedFonts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Fuentes Disponibles:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {loadedFonts.map(font => (
              <FontStatusIndicator
                key={font}
                fontName={font}
                isLoaded={true}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Fuentes cargando */}
      {loadingFonts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Cargando:
          </Typography>
          {loadingFonts.map(font => (
            <FontStatusIndicator
              key={font}
              fontName={font}
              isLoading={true}
            />
          ))}
        </Box>
      )}

      {/* Errores */}
      {fontErrors.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom color="error">
            Errores:
          </Typography>
          {fontErrors.map(([font, error]) => (
            <FontStatusIndicator
              key={font}
              fontName={font}
              error={error}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// ==================== CONFIGURACIÓN EXPORTADA ====================
export { GOOGLE_FONTS_CONFIG };
