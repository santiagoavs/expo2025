// src/components/ExportManager/ExportManager.jsx - GESTOR DE EXPORTACIÓN AVANZADO
import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Download,
  FileImage,
  FilePdf,
  FileArchiveIcon,
  Gear,
  Eye,
  Image as ImageIcon,
  Palette,
  Resize,
  CloudArrowDown,
  Check,
  X,
  Warning,
  Info,
  Lightning,
  Crown,
  Export
} from '@phosphor-icons/react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
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

// Formatos de exportación disponibles
const EXPORT_FORMATS = {
  png: {
    label: 'PNG',
    extension: 'png',
    mimeType: 'image/png',
    description: 'Ideal para imágenes con transparencia',
    icon: <FileImage size={20} />,
    supportsTransparency: true,
    supportsQuality: false,
    recommended: "true"
  },
  jpeg: {
    label: 'JPEG',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    description: 'Ideal para fotografías, menor tamaño',
    icon: <FileImage size={20} />,
    supportsTransparency: false,
    supportsQuality: true,
    recommended: "false"
  },
  webp: {
    label: 'WebP',
    extension: 'webp',
    mimeType: 'image/webp',
    description: 'Moderno, alta compresión',
    icon: <FileImage size={20} />,
    supportsTransparency: true,
    supportsQuality: true,
    recommended: "true"
  },
  pdf: {
    label: 'PDF',
    extension: 'pdf',
    mimeType: 'application/pdf',
    description: 'Documento vectorial de alta calidad',
    icon: <FilePdf size={20} />,
    supportsTransparency: false,
    supportsQuality: false,
    recommended: "false"
  },
  json: {
    label: 'JSON',
    extension: 'json',
    mimeType: 'application/json',
    description: 'Datos del diseño para reutilizar',
    icon: <FileArchiveIcon size={20} />,
    supportsTransparency: false,
    supportsQuality: false,
    recommended: "false"
  }
};

// Presets de calidad
const QUALITY_PRESETS = {
  draft: {
    label: 'Borrador',
    multiplier: 1,
    quality: 0.6,
    description: 'Rápido, menor calidad'
  },
  standard: {
    label: 'Estándar',
    multiplier: 2,
    quality: 0.8,
    description: 'Equilibrio entre calidad y tamaño'
  },
  high: {
    label: 'Alta',
    multiplier: 3,
    quality: 0.9,
    description: 'Alta calidad para impresión'
  },
  ultra: {
    label: 'Ultra',
    multiplier: 4,
    quality: 0.95,
    description: 'Máxima calidad profesional'
  }
};

// Diálogo principal con glassmorphism
const ExportDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(242, 242, 242, 0.95)',
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    borderRadius: '20px',
    border: '1px solid rgba(31, 100, 191, 0.2)',
    boxShadow: `
      0 20px 60px rgba(1, 3, 38, 0.15),
      inset 0 1px 0 rgba(242, 242, 242, 0.9)
    `,
    minWidth: '600px',
    maxWidth: '800px'
  }
}));

// Card de formato
const FormatCard = styled(Card)(({ theme, selected, recommended }) => ({
  background: selected 
    ? 'rgba(31, 100, 191, 0.1)' 
    : 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: selected 
    ? `2px solid ${THEME_COLORS.primary}` 
    : '1px solid rgba(31, 100, 191, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(31, 100, 191, 0.2)',
    borderColor: THEME_COLORS.primary
  },

  ...(recommended && {
    '&::before': {
      content: '"Recomendado"',
      position: 'absolute',
      top: '-8px',
      right: '16px',
      background: `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
      color: 'white',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 600,
      zIndex: 1
    }
  })
}));

// Preset de calidad
const QualityPresetChip = styled(Chip)(({ theme, selected }) => ({
  backgroundColor: selected ? THEME_COLORS.primary : 'rgba(255, 255, 255, 0.1)',
  color: selected ? 'white' : THEME_COLORS.text,
  border: `1px solid ${selected ? 'transparent' : 'rgba(31, 100, 191, 0.3)'}`,
  fontWeight: 600,
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: selected ? THEME_COLORS.primaryDark : 'rgba(31, 100, 191, 0.1)'
  }
}));

/**
 * Componente ExportManager para exportar diseños en múltiples formatos
 * Incluye configuraciones avanzadas, presets y preview en tiempo real
 */
const ExportManager = ({
  open = false,
  onClose,
  canvasRef,
  designData,
  productName = 'diseño',
  ...props
}) => {
  // Estados del componente
  const [exportFormat, setExportFormat] = useState('png');
  const [qualityPreset, setQualityPreset] = useState('standard');
  const [customSettings, setCustomSettings] = useState({
    quality: 0.8,
    multiplier: 2,
    includeBackground: true,
    backgroundColor: '#ffffff',
    transparentBackground: false,
    addWatermark: false,
    watermarkText: '',
    cropToContent: false,
    customWidth: null,
    customHeight: null
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [exportHistory, setExportHistory] = useState([]);

  // Store del editor
  const { canvas, addNotification, exportConfig } = useEditorStore();

  // Refs
  const previewRef = useRef();

  // ==================== CONFIGURACIÓN DE EXPORTACIÓN ====================

  /**
   * Actualiza la configuración basada en el preset seleccionado
   */
  const handlePresetChange = useCallback((preset) => {
    setQualityPreset(preset);
    const presetConfig = QUALITY_PRESETS[preset];
    setCustomSettings(prev => ({
      ...prev,
      quality: presetConfig.quality,
      multiplier: presetConfig.multiplier
    }));
  }, []);

  /**
   * Actualiza configuraciones personalizadas
   */
  const updateCustomSetting = useCallback((key, value) => {
    setCustomSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // ==================== FUNCIONES DE EXPORTACIÓN ====================

  /**
   * Genera preview del diseño
   */
  const generatePreview = useCallback(async () => {
    if (!canvas) return;

    try {
      // Crear canvas temporal para preview
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      // Configurar dimensiones del preview
      const scale = 0.3; // Preview más pequeño
      tempCanvas.width = canvas.width * scale;
      tempCanvas.height = canvas.height * scale;
      
      // Configurar fondo
      if (customSettings.includeBackground && !customSettings.transparentBackground) {
        ctx.fillStyle = customSettings.backgroundColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      }
      
      // Exportar canvas principal a imagen
      const dataURL = canvas.toDataURL('image/png', 1);
      const img = new Image();
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        setPreviewUrl(tempCanvas.toDataURL('image/png', 0.8));
      };
      
      img.src = dataURL;
    } catch (error) {
      console.error('Error generando preview:', error);
    }
  }, [canvas, customSettings]);

  /**
   * Exporta el diseño en el formato seleccionado
   */
  const handleExport = useCallback(async () => {
    if (!canvas) {
      addNotification({
        type: 'error',
        title: 'Error de exportación',
        message: 'No hay canvas disponible para exportar'
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const format = EXPORT_FORMATS[exportFormat];
      let exportedData;
      let filename = `${productName}_${new Date().toISOString().split('T')[0]}`;

      setExportProgress(20);

      switch (exportFormat) {
        case 'png':
        case 'jpeg':
        case 'webp':
          exportedData = await exportAsImage(format);
          filename += `.${format.extension}`;
          break;
        
        case 'pdf':
          exportedData = await exportAsPDF();
          filename += '.pdf';
          break;
        
        case 'json':
          exportedData = await exportAsJSON();
          filename += '.json';
          break;
        
        default:
          throw new Error(`Formato no soportado: ${exportFormat}`);
      }

      setExportProgress(80);

      // Descargar archivo
      if (exportedData) {
        await downloadFile(exportedData, filename, format.mimeType);
        
        // Agregar al historial
        const historyItem = {
          id: Date.now(),
          filename,
          format: exportFormat,
          timestamp: new Date(),
          settings: { ...customSettings, preset: qualityPreset }
        };
        setExportHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Mantener últimos 10
        
        addNotification({
          type: 'success',
          title: 'Exportación exitosa',
          message: `Diseño exportado como ${filename}`
        });
      }

      setExportProgress(100);
    } catch (error) {
      console.error('Error en exportación:', error);
      addNotification({
        type: 'error',
        title: 'Error de exportación',
        message: error.message
      });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  }, [canvas, exportFormat, customSettings, qualityPreset, productName, addNotification]);

  /**
   * Exporta como imagen (PNG, JPEG, WebP)
   */
  const exportAsImage = async (format) => {
    const options = {
      backgroundColor: customSettings.transparentBackground ? null : customSettings.backgroundColor,
      scale: customSettings.multiplier,
      useCORS: true,
      allowTaint: true,
      logging: false
    };

    // Usar html2canvas si hay elementos HTML, sino usar canvas nativo
    if (canvasRef?.current) {
      const canvasElement = await html2canvas(canvasRef.current, options);
      return canvasElement.toDataURL(format.mimeType, customSettings.quality);
    } else {
      // Exportación directa del canvas de Fabric
      return canvas.toDataURL(format.mimeType, {
        quality: customSettings.quality,
        multiplier: customSettings.multiplier,
        format: format.extension
      });
    }
  };

  /**
   * Exporta como PDF
   */
  const exportAsPDF = async () => {
    // Importar jsPDF dinámicamente para optimizar bundle
    const { jsPDF } = await import('jspdf');
    
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    // Exportar canvas como imagen y agregarla al PDF
    const imageData = canvas.toDataURL('image/png', 1);
    pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);
    
    // Agregar metadatos
    pdf.setProperties({
      title: `Diseño - ${productName}`,
      subject: 'Diseño personalizado',
      author: 'Editor de Diseños',
      creator: 'Diambars Sublim'
    });

    return pdf.output('blob');
  };

  /**
   * Exporta como JSON (datos del diseño)
   */
  const exportAsJSON = async () => {
    const designData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      productName,
      canvas: {
        width: canvas.width,
        height: canvas.height,
        backgroundColor: canvas.backgroundColor
      },
      objects: canvas.toJSON(['data']),
      metadata: {
        exportSettings: customSettings,
        qualityPreset,
        objectsCount: canvas.getObjects().length
      }
    };

    const blob = new Blob([JSON.stringify(designData, null, 2)], {
      type: 'application/json'
    });
    
    return blob;
  };

  /**
   * Descarga un archivo
   */
  const downloadFile = async (data, filename, mimeType) => {
    if (data instanceof Blob) {
      saveAs(data, filename);
    } else if (typeof data === 'string' && data.startsWith('data:')) {
      // Data URL
      const link = document.createElement('a');
      link.href = data;
      link.download = filename;
      link.click();
    } else {
      throw new Error('Tipo de datos no soportado para descarga');
    }
  };

  // ==================== EFECTOS ====================

  // Generar preview cuando cambien las configuraciones
  React.useEffect(() => {
    if (open && canvas) {
      const timeoutId = setTimeout(generatePreview, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [open, canvas, customSettings, generatePreview]);

  // ==================== UTILIDADES ====================

  /**
   * Calcula el tamaño estimado del archivo
   */
  const getEstimatedFileSize = () => {
    if (!canvas) return 'N/A';
    
    const pixels = canvas.width * canvas.height * customSettings.multiplier * customSettings.multiplier;
    let bytesPerPixel;
    
    switch (exportFormat) {
      case 'png':
        bytesPerPixel = 4; // RGBA
        break;
      case 'jpeg':
        bytesPerPixel = 3 * customSettings.quality; // RGB con compresión
        break;
      case 'webp':
        bytesPerPixel = 3 * customSettings.quality * 0.8; // WebP es más eficiente
        break;
      default:
        bytesPerPixel = 3;
    }
    
    const bytes = pixels * bytesPerPixel;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  /**
   * Obtiene las dimensiones de exportación
   */
  const getExportDimensions = () => {
    if (!canvas) return { width: 0, height: 0 };
    
    return {
      width: Math.round(canvas.width * customSettings.multiplier),
      height: Math.round(canvas.height * customSettings.multiplier)
    };
  };

  // ==================== RENDER ====================

  return (
    <ExportDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      {...props}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: THEME_COLORS.text,
        fontWeight: 700
      }}>
        <Export size={24} />
        Exportar Diseño
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Panel izquierdo - Configuraciones */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Selección de formato */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 2 }}>
                Formato de Exportación
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries(EXPORT_FORMATS).map(([key, format]) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={key}>
                    <FormatCard
                      selected={exportFormat === key}
                      recommended={format.recommended}
                      onClick={() => setExportFormat(key)}
                    >
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Box sx={{ 
                          color: exportFormat === key ? THEME_COLORS.primary : THEME_COLORS.text,
                          mb: 1 
                        }}>
                          {format.icon}
                        </Box>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: THEME_COLORS.text,
                            fontWeight: 600,
                            mb: 0.5
                          }}
                        >
                          {format.label}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: THEME_COLORS.text,
                            opacity: 0.7
                          }}
                        >
                          {format.description}
                        </Typography>
                      </CardContent>
                    </FormatCard>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Presets de calidad */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 2 }}>
                Calidad de Exportación
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
                  <QualityPresetChip
                    key={key}
                    label={preset.label}
                    selected={qualityPreset === key}
                    onClick={() => handlePresetChange(key)}
                    icon={
                      key === 'ultra' ? <Crown size={16} /> :
                      key === 'high' ? <Lightning size={16} /> :
                      <Gear size={16} />
                    }
                  />
                ))}
              </Stack>
              
              <Typography variant="body2" sx={{ color: THEME_COLORS.text, opacity: 0.7 }}>
                {QUALITY_PRESETS[qualityPreset]?.description}
              </Typography>
            </Box>

            {/* Configuraciones avanzadas */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 2 }}>
                Configuraciones Avanzadas
              </Typography>
              
              <Grid container spacing={2}>
                {/* Control de calidad para formatos que lo soportan */}
                {EXPORT_FORMATS[exportFormat]?.supportsQuality && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                      Calidad: {Math.round(customSettings.quality * 100)}%
                    </Typography>
                    <Slider
                      value={customSettings.quality}
                      onChange={(e, value) => updateCustomSetting('quality', value)}
                      min={0.1}
                      max={1}
                      step={0.05}
                      sx={{
                        '& .MuiSlider-track': {
                          background: `linear-gradient(90deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`
                        },
                        '& .MuiSlider-thumb': {
                          backgroundColor: THEME_COLORS.primary
                        }
                      }}
                    />
                  </Grid>
                )}

                {/* Multiplicador de resolución */}
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: THEME_COLORS.text, mb: 1 }}>
                    Resolución: {customSettings.multiplier}x
                  </Typography>
                  <Slider
                    value={customSettings.multiplier}
                    onChange={(e, value) => updateCustomSetting('multiplier', value)}
                    min={1}
                    max={5}
                    step={0.5}
                    marks={[
                      { value: 1, label: '1x' },
                      { value: 2, label: '2x' },
                      { value: 3, label: '3x' },
                      { value: 4, label: '4x' },
                      { value: 5, label: '5x' }
                    ]}
                    sx={{
                      '& .MuiSlider-track': {
                        background: `linear-gradient(90deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`
                      },
                      '& .MuiSlider-thumb': {
                        backgroundColor: THEME_COLORS.primary
                      }
                    }}
                  />
                </Grid>

                {/* Configuraciones de fondo */}
                {EXPORT_FORMATS[exportFormat]?.supportsTransparency && (
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={customSettings.transparentBackground}
                          onChange={(e) => updateCustomSetting('transparentBackground', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-thumb': {
                              backgroundColor: THEME_COLORS.primary
                            }
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                          Fondo transparente
                        </Typography>
                      }
                    />
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Información de exportación */}
            <Box sx={{
              p: 2,
              background: 'rgba(31, 100, 191, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(31, 100, 191, 0.2)'
            }}>
              <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 1 }}>
                <Info size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Información de Exportación
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: THEME_COLORS.text, opacity: 0.7 }}>
                    Dimensiones: {getExportDimensions().width} × {getExportDimensions().height}px
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: THEME_COLORS.text, opacity: 0.7 }}>
                    Tamaño estimado: {getEstimatedFileSize()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Panel derecho - Preview */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ 
              position: 'sticky',
              top: 0
            }}>
              <Typography variant="h6" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 2 }}>
                Vista Previa
              </Typography>
              
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                border: '1px solid rgba(31, 100, 191, 0.2)',
                p: 2,
                textAlign: 'center',
                mb: 2
              }}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      border: '1px solid rgba(31, 100, 191, 0.2)'
                    }}
                  />
                ) : (
                  <Box sx={{ 
                    py: 4,
                    color: THEME_COLORS.text,
                    opacity: 0.5
                  }}>
                    <ImageIcon size={48} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Generando preview...
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Historial de exportaciones */}
              {exportHistory.length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600, mb: 1 }}>
                    Exportaciones Recientes
                  </Typography>
                  
                  <List dense>
                    {exportHistory.slice(0, 3).map((item) => (
                      <ListItem
                        key={item.id}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          mb: 1,
                          border: '1px solid rgba(31, 100, 191, 0.1)'
                        }}
                      >
                        <ListItemIcon>
                          {EXPORT_FORMATS[item.format]?.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="caption" sx={{ color: THEME_COLORS.text }}>
                              {item.filename}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: THEME_COLORS.text, opacity: 0.7 }}>
                              {item.timestamp.toLocaleTimeString()}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Barra de progreso */}
        {isExporting && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1
            }}>
              <Typography variant="body2" sx={{ color: THEME_COLORS.text, fontWeight: 600 }}>
                Exportando...
              </Typography>
              <Typography variant="body2" sx={{ color: THEME_COLORS.primary, fontWeight: 600 }}>
                {Math.round(exportProgress)}%
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={exportProgress}
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
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          disabled={isExporting}
          sx={{
            color: THEME_COLORS.text,
            borderRadius: '12px'
          }}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleExport}
          disabled={isExporting || !canvas}
          variant="contained"
          startIcon={<Download size={16} />}
          sx={{
            background: `linear-gradient(135deg, ${THEME_COLORS.primary}, ${THEME_COLORS.primaryDark})`,
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(31, 100, 191, 0.3)',
            '&:hover': {
              background: `linear-gradient(135deg, ${THEME_COLORS.primaryDark}, ${THEME_COLORS.accent})`
            },
            '&:disabled': {
              background: 'rgba(31, 100, 191, 0.3)'
            }
          }}
        >
          {isExporting ? 'Exportando...' : 'Exportar Diseño'}
        </Button>
      </DialogActions>
    </ExportDialog>
  );
};

export default ExportManager;