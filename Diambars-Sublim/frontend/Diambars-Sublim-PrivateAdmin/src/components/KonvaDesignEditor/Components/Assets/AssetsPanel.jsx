// components/Assets/AssetsPanel.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUp,
  Download,
  Image,
  TextT
} from '@phosphor-icons/react';

const AssetsPanelContainer = styled(Paper)(({ theme }) => ({
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

const DropZone = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? '#1F64BF' : '#ccc'}`,
  borderRadius: '12px',
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isDragActive ? 'rgba(31, 100, 191, 0.05)' : 'transparent',
  transition: 'all 0.3s ease'
}));

export const AssetsPanel = ({ onImageDrop, onLoadGoogleFonts, fontService }) => {
  const [loadingFonts, setLoadingFonts] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    onDrop: onImageDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10
  });

  const popularFonts = fontService.getPopularGoogleFonts();
  const loadedGoogleFonts = fontService.getGoogleFonts();

  const handleLoadFonts = async (fonts) => {
    setLoadingFonts(true);
    try {
      await onLoadGoogleFonts(fonts);
    } finally {
      setLoadingFonts(false);
    }
  };

  return (
    <AssetsPanelContainer>
      <Typography variant="h6" color="primary" gutterBottom>
        Recursos
      </Typography>

      {/* Sección de imágenes */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Imágenes
        </Typography>
        
        <DropZone {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />
          <CloudArrowUp size={32} color={isDragActive ? '#1F64BF' : '#ccc'} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {isDragActive
              ? 'Suelta las imágenes aquí'
              : 'Arrastra imágenes o haz clic para seleccionar'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PNG, JPG, GIF, WebP, SVG (máx. 10MB)
          </Typography>
        </DropZone>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Sección de fuentes */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Fuentes de Google
        </Typography>

        {loadedGoogleFonts.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Fuentes cargadas:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {loadedGoogleFonts.map(font => (
                <Chip
                  key={font}
                  label={font}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        <Button
          variant="outlined"
          fullWidth
          disabled={loadingFonts}
          onClick={() => handleLoadFonts(popularFonts.slice(0, 10))}
          startIcon={loadingFonts ? <CircularProgress size={16} /> : <Download />}
          sx={{ mb: 2 }}
        >
          {loadingFonts ? 'Cargando...' : 'Cargar fuentes populares'}
        </Button>

        <Grid container spacing={1}>
          {[
            ['Elegantes', ['Playfair Display', 'Crimson Text', 'Merriweather']],
            ['Modernas', ['Inter', 'Poppins', 'Montserrat']],
            ['Sans Serif', ['Roboto', 'Open Sans', 'Lato']],
            ['Display', ['Oswald', 'Raleway', 'Ubuntu']]
          ].map(([category, fonts]) => (
            <Grid item xs={6} key={category}>
              <Button
                variant="text"
                size="small"
                fullWidth
                disabled={loadingFonts}
                onClick={() => handleLoadFonts(fonts)}
                sx={{ fontSize: '0.75rem' }}
              >
                {category}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AssetsPanelContainer>
  );
};