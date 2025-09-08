// src/components/ImageUploader/ImageUploader.jsx - SUBIDOR DE IMÁGENES AVANZADO
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  LinearProgress,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Tooltip,
  Alert,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CloudArrowUp,
  Image as ImageIcon,
  Trash,
  Eye,
  Download,
  Scissors,
  MagicWand,
  ArrowClockwise,
  Check,
  X,
  Warning,
  Info,
  ImageSquare,
  FileImage
} from '@phosphor-icons/react';
import { useDropzone } from 'react-dropzone';
import { debounce } from 'lodash';
import ImageUtils from '../../../utils/imageUtils';
import useEditorStore from '../stores/useEditorStores';

// Constantes del tema
const THEME_COLORS = {
  primary: '#1F64BF',
  primaryDark: '#032CA6',
  accent: '#040DBF',
  background: '#F2F2F2',
  text: '#010326',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

// Zona de drop con glassmorphism
const DropZone = styled(Box)(({ theme, isDragActive, hasError }) => ({
  border: `2px dashed ${
    hasError ? THEME_COLORS.error : 
    isDragActive ? THEME_COLORS.primary : 
    'rgba(31, 100, 191, 0.3)'
  }`,
  borderRadius: '20px',
  padding: theme.spacing(4),
  textAlign: 'center',
  background: isDragActive 
    ? 'rgba(31, 100, 191, 0.1)' 
    : 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',

  '&:hover': {
    background: 'rgba(31, 100, 191, 0.05)',
    borderColor: THEME_COLORS.primary,
    transform: 'translateY(-2px)'
  },

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.1), transparent)`,
    transition: 'left 0.5s ease',
  },

  '&:hover::before': {
    left: '100%'
  }
}));

// Contenedor de preview de imagen
const ImagePreviewCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(15px)',
  borderRadius: '16px',
  border: '1px solid rgba(31, 100, 191, 0.2)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(31, 100, 191, 0.2)'
  }
}));

// Chip de información
const InfoChip = styled(Chip)(({ theme, variant = 'default' }) => ({
  backgroundColor: variant === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                   variant === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                   variant === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                   'rgba(31, 100, 191, 0.1)',
  color: variant === 'success' ? THEME_COLORS.success :
         variant === 'warning' ? THEME_COLORS.warning :
         variant === 'error' ? THEME_COLORS.error :
         THEME_COLORS.primary,
  border: `1px solid ${
    variant === 'success' ? 'rgba(16, 185, 129, 0.3)' :
    variant === 'warning' ? 'rgba(245, 158, 11, 0.3)' :
    variant === 'error' ? 'rgba(239, 68, 68, 0.3)' :
    'rgba(31, 100, 191, 0.3)'
  }`,
  fontWeight: 600,
  fontSize: '0.75rem'
}));

/**
 * Componente ImageUploader avanzado con procesamiento de imágenes
 * Incluye drag & drop, validación, preview, edición básica y remoción de fondos
 */
const ImageUploader = ({
  onImageUpload,
  onImageProcess,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  showPreview = true,
  enableImageProcessing = true,
  enableBackgroundRemoval = true,
  autoOptimize = true,
  ...props
}) => {
  // Estados del componente
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);

  // Estados para edición de imagen
  const [editSettings, setEditSettings] = useState({
    removeBackground: false,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    opacity: 1,
    colorTint: null,
    tintIntensity: 0.5
  });

  // Store del editor
  const { addNotification } = useEditorStore();

  // ==================== CONFIGURACIÓN DE DROPZONE ====================

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError(null);

    // Manejar archivos rechazados
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(file => {
        const errors = file.errors.map(error => {
          switch (error.code) {
            case 'file-too-large':
              return `${file.file.name}: Archivo muy grande (máx. ${Math.round(maxSize / 1024 / 1024)}MB)`;
            case 'file-invalid-type':
              return `${file.file.name}: Formato no soportado`;
            case 'too-many-files':
              return `Máximo ${maxFiles} archivos permitidos`;
            default:
              return `${file.file.name}: ${error.message}`;
          }
        });
        return errors.join(', ');
      });
      
      setError(errorMessages.join('\n'));
      addNotification({
        type: 'error',
        title: 'Error al subir imágenes',
        message: errorMessages.join('\n')
      });
      return;
    }

    // Procesar archivos aceptados
    if (acceptedFiles.length > 0) {
      await processUploadedFiles(acceptedFiles);
    }
  }, [maxFiles, maxSize, addNotification]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFormats.map(format => format.replace('image/', '.'))
    },
    maxFiles,
    maxSize,
    multiple: maxFiles > 1
  });

  // ==================== PROCESAMIENTO DE ARCHIVOS ====================

  /**
   * Procesa los archivos subidos
   */
  const processUploadedFiles = async (files) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const processedImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingProgress(((i + 1) / files.length) * 100);

        console.log('[ImageUploader] Procesando archivo:', file.name, file.type, file.size);
        
        // Validar archivo
        const validation = ImageUtils.validateImageFile(file);
        console.log('[ImageUploader] Validación:', validation);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        // Cargar imagen
        console.log('[ImageUploader] Cargando imagen...');
        const imageElement = await ImageUtils.loadImageFromFile(file);
        console.log('[ImageUploader] Imagen cargada:', imageElement);
        
        // Auto-optimizar si está habilitado
        let finalImageUrl = URL.createObjectURL(file);
        if (autoOptimize) {
          try {
            const optimizedDataURL = await ImageUtils.optimizeForWeb(imageElement, {
              maxWidth: 1200,
              maxHeight: 1200,
              quality: 0.85
            });
            // Convertir dataURL a blob para crear URL
            const response = await fetch(optimizedDataURL);
            const blob = await response.blob();
            finalImageUrl = URL.createObjectURL(blob);
          } catch (error) {
            console.warn('[ImageUploader] Error optimizando imagen, usando original:', error);
            // Mantener la URL original si falla la optimización
          }
        }

        const imageData = {
          id: Date.now() + i,
          file,
          originalUrl: URL.createObjectURL(file),
          processedUrl: finalImageUrl,
          name: file.name,
          size: file.size,
          dimensions: {
            width: imageElement.naturalWidth,
            height: imageElement.naturalHeight
          },
          type: file.type,
          uploadedAt: new Date(),
          processed: autoOptimize,
          validation
        };

        processedImages.push(imageData);
      }

      setUploadedImages(prev => [...prev, ...processedImages]);
      
      addNotification({
        type: 'success',
        title: 'Imágenes subidas correctamente',
        message: `Se ${files.length === 1 ? 'subió' : 'subieron'} ${files.length} imagen${files.length === 1 ? '' : 'es'} exitosamente`
      });

      // Callback al componente padre
      if (onImageUpload) {
        onImageUpload(processedImages);
      }

    } catch (error) {
      console.error('Error procesando imágenes:', error);
      setError(error.message);
      addNotification({
        type: 'error',
        title: 'Error procesando imágenes',
        message: error.message
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // ==================== EDICIÓN DE IMÁGENES ====================

  /**
   * Abre el diálogo de edición para una imagen
   */
  const handleEditImage = (image) => {
    setSelectedImage(image);
    setEditDialogOpen(true);
    setProcessedImageUrl(image.processedUrl);
    setEditSettings({
      removeBackground: false,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      opacity: 1,
      colorTint: null,
      tintIntensity: 0.5
    });
  };

  /**
   * Aplica los efectos de edición a la imagen
   */
  const applyImageEffects = useCallback(
    debounce(async (settings) => {
      if (!selectedImage) return;

      try {
        setIsProcessing(true);
        
        // Cargar imagen original
        const imageElement = await ImageUtils.loadImageFromUrl(selectedImage.originalUrl);
        let processedUrl = selectedImage.originalUrl;

        // Aplicar remoción de fondo si está habilitada
        if (settings.removeBackground && enableBackgroundRemoval) {
          processedUrl = await ImageUtils.removeWhiteBackgroundAdvanced(
            imageElement, 
            10, // tolerance
            true // smooth edges
          );
          
          // Recargar imagen con fondo removido
          const newImageElement = await ImageUtils.loadImageFromUrl(processedUrl);
          imageElement.src = processedUrl;
        }

        // Aplicar tinte de color si está configurado
        if (settings.colorTint && settings.tintIntensity > 0) {
          processedUrl = await ImageUtils.applyColorTint(
            imageElement,
            settings.colorTint,
            settings.tintIntensity
          );
        }

        // Aplicar efectos sepia, escala de grises, etc. se pueden agregar aquí
        // basándose en otros settings...

        setProcessedImageUrl(processedUrl);

      } catch (error) {
        console.error('Error aplicando efectos:', error);
        addNotification({
          type: 'error',
          title: 'Error aplicando efectos',
          message: error.message
        });
      } finally {
        setIsProcessing(false);
      }
    }, 500),
    [selectedImage, enableBackgroundRemoval, addNotification]
  );

  /**
   * Confirma la edición y actualiza la imagen
   */
  const handleConfirmEdit = async () => {
    if (!selectedImage || !processedImageUrl) return;

    try {
      // Actualizar la imagen en la lista
      setUploadedImages(prev => 
        prev.map(img => 
          img.id === selectedImage.id 
            ? { ...img, processedUrl: processedImageUrl, processed: true }
            : img
        )
      );

      // Callback al componente padre
      if (onImageProcess) {
        onImageProcess({
          ...selectedImage,
          processedUrl: processedImageUrl,
          editSettings
        });
      }

      addNotification({
        type: 'success',
        title: 'Imagen procesada',
        message: 'Los efectos se aplicaron correctamente'
      });

      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error confirmando edición:', error);
      addNotification({
        type: 'error',
        title: 'Error guardando cambios',
        message: error.message
      });
    }
  };

  /**
   * Elimina una imagen de la lista
   */
  const handleRemoveImage = (imageId) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        // Liberar URLs de objeto para evitar memory leaks
        if (imageToRemove.originalUrl.startsWith('blob:')) {
          URL.revokeObjectURL(imageToRemove.originalUrl);
        }
        if (imageToRemove.processedUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(imageToRemove.processedUrl);
        }
      }
      return prev.filter(img => img.id !== imageId);
    });

    addNotification({
      type: 'info',
      title: 'Imagen eliminada',
      message: 'La imagen se eliminó de la lista'
    });
  };

  /**
   * Descarga una imagen procesada
   */
  const handleDownloadImage = (image) => {
    const link = document.createElement('a');
    link.href = image.processedUrl || image.originalUrl;
    link.download = `processed_${image.name}`;
    link.click();

    addNotification({
      type: 'success',
      title: 'Descarga iniciada',
      message: `Descargando ${image.name}`
    });
  };

  // ==================== EFECTOS ====================

  // Aplicar efectos cuando cambien los settings
  useEffect(() => {
    if (editDialogOpen && selectedImage) {
      applyImageEffects(editSettings);
    }
  }, [editSettings, editDialogOpen, selectedImage, applyImageEffects]);

  // Limpiar URLs al desmontar
  useEffect(() => {
    return () => {
      uploadedImages.forEach(image => {
        if (image.originalUrl.startsWith('blob:')) {
          URL.revokeObjectURL(image.originalUrl);
        }
        if (image.processedUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(image.processedUrl);
        }
      });
    };
  }, []);

  // ==================== UTILIDADES ====================

  /**
   * Formatea el tamaño de archivo en formato legible
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Obtiene el ícono según el tipo de archivo
   */
  const getFileTypeIcon = (type) => {
    if (type.includes('jpeg') || type.includes('jpg')) return <FileImage size={20} />;
    if (type.includes('png')) return <ImageSquare size={20} />;
    return <ImageIcon size={20} />;
  };

  // ==================== RENDER ====================

  return (
    <Box {...props}>
      {/* Zona de subida */}
      <DropZone 
        {...getRootProps()} 
        isDragActive={isDragActive}
        hasError={!!error}
      >
        <input {...getInputProps()} />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2
        }}>
          <CloudArrowUp 
            size={48} 
            color={error ? THEME_COLORS.error : THEME_COLORS.primary}
            weight="duotone"
          />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: THEME_COLORS.text,
                fontWeight: 700,
                mb: 1
              }}
            >
              {isDragActive ? 
                '¡Suelta las imágenes aquí!' : 
                'Arrastra imágenes o haz clic para seleccionar'
              }
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: THEME_COLORS.text,
                opacity: 0.7
              }}
            >
              Soporta JPG, PNG, GIF, WebP hasta {Math.round(maxSize / 1024 / 1024)}MB
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
            <InfoChip 
              icon={<ImageIcon size={14} />}
              label={`Máx. ${maxFiles} imagen${maxFiles === 1 ? '' : 'es'}`}
              size="small"
            />
            {autoOptimize && (
              <InfoChip 
                icon={<MagicWand size={14} />}
                label="Auto-optimización"
                size="small"
                variant="success"
              />
            )}
            {enableBackgroundRemoval && (
              <InfoChip 
                icon={<Scissors size={14} />}
                label="Remoción de fondo"
                size="small"
                variant="warning"
              />
            )}
          </Stack>
        </Box>
      </DropZone>

      {/* Barra de progreso */}
      {isProcessing && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1
          }}>
            <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
              Procesando imágenes...
            </Typography>
            <Typography variant="body2" sx={{ color: THEME_COLORS.primary, fontWeight: 600 }}>
              {Math.round(processingProgress)}%
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={processingProgress}
            sx={{
              height: '8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(31, 100, 191, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
                borderRadius: '4px'
              }
            }}
          />
        </Box>
      )}

      {/* Mensaje de error */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            '& .MuiAlert-icon': {
              color: THEME_COLORS.error
            }
          }}
          onClose={() => setError(null)}
        >
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {error}
          </Typography>
        </Alert>
      )}

      {/* Preview de imágenes subidas */}
      {showPreview && uploadedImages.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: THEME_COLORS.text,
              fontWeight: 700,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <ImageIcon size={20} />
            Imágenes Subidas ({uploadedImages.length})
          </Typography>

          <Grid container spacing={2}>
            {uploadedImages.map((image) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={image.id}>
                <ImagePreviewCard>
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.processedUrl || image.originalUrl}
                    alt={image.name}
                    sx={{ 
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleEditImage(image)}
                  />
                  
                  <CardContent sx={{ p: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: THEME_COLORS.text,
                        fontWeight: 600,
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {image.name}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <InfoChip
                        icon={getFileTypeIcon(image.type)}
                        label={image.type.split('/')[1].toUpperCase()}
                        size="small"
                      />
                      <InfoChip
                        label={formatFileSize(image.size)}
                        size="small"
                      />
                    </Stack>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: THEME_COLORS.text,
                        opacity: 0.7
                      }}
                    >
                      {image.dimensions.width} × {image.dimensions.height}px
                    </Typography>
                    
                    {image.processed && (
                      <InfoChip
                        icon={<Check size={12} />}
                        label="Procesada"
                        size="small"
                        variant="success"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Tooltip title="Editar imagen">
                      <IconButton 
                        size="small"
                        onClick={() => handleEditImage(image)}
                        sx={{ 
                          backgroundColor: 'rgba(31, 100, 191, 0.1)',
                          '&:hover': { backgroundColor: 'rgba(31, 100, 191, 0.2)' }
                        }}
                      >
                        <MagicWand size={16} color={THEME_COLORS.primary} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Descargar">
                      <IconButton 
                        size="small"
                        onClick={() => handleDownloadImage(image)}
                        sx={{ 
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.2)' }
                        }}
                      >
                        <Download size={16} color={THEME_COLORS.success} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar">
                      <IconButton 
                        size="small"
                        onClick={() => handleRemoveImage(image.id)}
                        sx={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                        }}
                      >
                        <Trash size={16} color={THEME_COLORS.error} />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </ImagePreviewCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Diálogo de edición de imagen */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        style={{ zIndex: 9999 }} // Z-index alto para estar por encima del editor
        PaperProps={{
          sx: {
            background: 'rgba(242, 242, 242, 0.95)',
            backdropFilter: 'blur(25px)',
            borderRadius: '20px',
            border: '1px solid rgba(31, 100, 191, 0.2)',
            zIndex: 10000 // Z-index adicional en el paper
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: THEME_COLORS.text,
          fontWeight: 700
        }}>
          <MagicWand size={24} />
          Editar Imagen
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Preview de la imagen */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ 
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(31, 100, 191, 0.2)'
              }}>
                {processedImageUrl && (
                  <img
                    src={processedImageUrl}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      objectFit: 'contain'
                    }}
                  />
                )}
                
                {isProcessing && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography sx={{ color: 'white', fontWeight: 600 }}>
                      Procesando...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            
            {/* Controles de edición */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                {/* Remoción de fondo */}
                {enableBackgroundRemoval && (
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editSettings.removeBackground}
                          onChange={(e) => setEditSettings(prev => ({
                            ...prev,
                            removeBackground: e.target.checked
                          }))}
                          sx={{
                            '& .MuiSwitch-thumb': {
                              backgroundColor: THEME_COLORS.primary
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: 'rgba(31, 100, 191, 0.3)'
                            }
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                          Remover fondo blanco
                        </Typography>
                      }
                    />
                  </Box>
                )}

                <Divider sx={{ borderColor: 'rgba(31, 100, 191, 0.2)' }} />

                {/* Controles de ajuste */}
                <Box>
                  <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 2 }}>
                    Ajustes de Imagen
                  </Typography>
                  
                  {/* Opacidad */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                      Opacidad: {Math.round(editSettings.opacity * 100)}%
                    </Typography>
                    <Slider
                      value={editSettings.opacity}
                      onChange={(e, value) => setEditSettings(prev => ({
                        ...prev,
                        opacity: value
                      }))}
                      min={0}
                      max={1}
                      step={0.01}
                      sx={{
                        '& .MuiSlider-track': {
                          background: `linear-gradient(90deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`
                        },
                        '& .MuiSlider-thumb': {
                          backgroundColor: THEME_COLORS.primary
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* Información de la imagen */}
                {selectedImage && (
                  <Box sx={{ 
                    p: 2, 
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(31, 100, 191, 0.2)'
                  }}>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 1 }}>
                      Información
                    </Typography>
                    <Typography variant="caption" sx={{ color: THEME_COLORS.text, opacity: 0.7 }}>
                      Nombre: {selectedImage.name}<br />
                      Tamaño: {formatFileSize(selectedImage.size)}<br />
                      Dimensiones: {selectedImage.dimensions.width} × {selectedImage.dimensions.height}px
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{ 
              color: THEME_COLORS.text,
              borderRadius: '12px'
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmEdit}
            variant="contained"
            disabled={isProcessing}
            sx={{ 
              background: `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(31, 100, 191, 0.3)',
              '&:hover': {
                background: `linear-gradient(135deg, ${THEME_COLORS.primaryDark}, ${THEME_COLORS.accent})`
              }
            }}
          >
            {isProcessing ? 'Procesando...' : 'Aplicar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUploader;