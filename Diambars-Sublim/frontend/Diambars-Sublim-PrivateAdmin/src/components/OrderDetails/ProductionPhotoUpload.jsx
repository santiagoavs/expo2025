// components/OrderDetails/ProductionPhotoUpload.jsx - Componente para subir fotos de producción
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  IconButton,
  Alert,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Portal
} from '@mui/material';
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon
} from '@phosphor-icons/react';
import { useOrderDetails } from '../../hooks/useOrderDetails';

const ProductionPhotoUpload = ({ 
  isOpen, 
  onClose, 
  orderId, 
  orderNumber,
  currentOrderStatus,
  onPhotoUploaded 
}) => {
  const { loading, uploadProductionPhoto } = useOrderDetails();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [stage, setStage] = useState('');
  const [notes, setNotes] = useState('');
  const [isQualityPhoto, setIsQualityPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Etapas que permiten subir fotos (solo las importantes)
  const photoAllowedStages = [
    { value: 'in_production', label: 'En Producción 🏭' },
    { value: 'quality_check', label: 'Control de Calidad 🔍' },
    { value: 'quality_approved', label: 'Calidad Aprobada ✅' },
    { value: 'packaging', label: 'Empacando 📦' },
    { value: 'ready_for_delivery', label: 'Listo para Entrega 🚚' }
  ];

  // Etapas de producción específicas para las fotos
  const productionStages = [
    { value: 'cutting', label: 'Corte ✂️' },
    { value: 'printing', label: 'Impresión 🖨️' },
    { value: 'pressing', label: 'Prensado 🔥' },
    { value: 'quality_check', label: 'Control de Calidad 🔍' },
    { value: 'packaging', label: 'Empacado 📦' }
  ];

  // Verificar si la etapa actual permite subir fotos
  const canUploadPhotos = photoAllowedStages.some(stage => stage.value === currentOrderStatus);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB permitido');
        return;
      }

      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !stage) {
      alert('Por favor selecciona una foto y una etapa de producción');
      return;
    }

    try {
      const photoData = {
        file: selectedFile,
        stage,
        notes,
        isQualityPhoto
      };

      await uploadProductionPhoto(orderId, photoData);
      
      // Limpiar formulario
      setSelectedFile(null);
      setPreviewUrl(null);
      setStage('');
      setNotes('');
      setIsQualityPhoto(false);
      
      // Notificar al componente padre
      onPhotoUploaded?.();
      
      onClose();
    } catch (error) {
      console.error('Error subiendo foto:', error);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStage('');
    setNotes('');
    setIsQualityPhoto(false);
    onClose();
  };

  return (
    <Portal>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disablePortal={false}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            zIndex: 1400
          }
        }}
        sx={{
          zIndex: 1400
        }}
      >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
            Subir Foto de Producción
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pedido: {orderNumber}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
              Subiendo foto...
            </Typography>
          </Box>
        )}

        {/* Verificación de permisos */}
        {!canUploadPhotos && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>
            <Typography variant="body2">
              <strong>No se pueden subir fotos en esta etapa</strong><br/>
              Solo se pueden subir fotos en las siguientes etapas: En Producción, Control de Calidad, Calidad Aprobada, Empacando, o Listo para Entrega.
            </Typography>
          </Alert>
        )}

        {canUploadPhotos && (
          <>
            {/* Información del estado actual */}
            <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
              <Typography variant="body2">
                <strong>Estado actual:</strong> {photoAllowedStages.find(s => s.value === currentOrderStatus)?.label || currentOrderStatus}
              </Typography>
            </Alert>

        {/* Selección de Archivo */}
        <Card sx={{ mb: 3, border: '2px dashed #e0e0e0', backgroundColor: '#fafafa' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            {previewUrl ? (
              <Box>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedFile?.name}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<Camera size={16} />}
                >
                  Cambiar Foto
                </Button>
              </Box>
            ) : (
              <Box>
                <ImageIcon size={48} color="#9e9e9e" />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Seleccionar Foto
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Arrastra una imagen aquí o haz clic para seleccionar
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<Upload size={16} />}
                >
                  Seleccionar Archivo
                </Button>
              </Box>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </CardContent>
        </Card>

        {/* Etapa de Producción */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Etapa de Producción</InputLabel>
          <Select
            value={stage}
            onChange={(e) => {
              console.log('📸 [ProductionPhotoUpload] Cambiando etapa a:', e.target.value);
              setStage(e.target.value);
            }}
            label="Etapa de Producción"
          >
            {productionStages.map((stageOption) => (
              <MenuItem key={stageOption.value} value={stageOption.value}>
                {stageOption.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Notas */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe el progreso, detalles técnicos, o cualquier observación..."
          sx={{ mb: 3 }}
        />


        {/* Foto de Calidad */}
        <FormControlLabel
          control={
            <Checkbox
              checked={isQualityPhoto}
              onChange={(e) => setIsQualityPhoto(e.target.checked)}
            />
          }
          label={
            <Box>
              <Typography variant="body2">
                Foto de Calidad
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Se enviará al cliente por WhatsApp para aprobación
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />

        {isQualityPhoto && (
          <Alert severity="info" sx={{ borderRadius: '8px' }}>
            Esta foto se enviará automáticamente al cliente por WhatsApp para que pueda revisar la calidad del trabajo.
          </Alert>
        )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleUpload} 
          variant="contained"
          disabled={!selectedFile || !stage || loading}
          startIcon={<Upload size={16} />}
        >
          {loading ? 'Subiendo...' : 'Subir Foto'}
        </Button>
      </DialogActions>
    </Dialog>
    </Portal>
  );
};

export default ProductionPhotoUpload;
