// components/OrderDetails/ProductionPhotoUpload.jsx - Componente para subir fotos de control de calidad
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
  Card,
  CardContent,
  IconButton,
  Alert,
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
import Swal from 'sweetalert2';

const ProductionPhotoUpload = ({ 
  isOpen, 
  onClose, 
  orderId, 
  orderNumber, 
  onPhotoUploaded 
}) => {
  const { loading, uploadProductionPhoto } = useOrderDetails();
  
  // Configurar SweetAlert2 con z-index alto
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .swal2-container {
        z-index: 9999 !important;
      }
      .swal-highest-z-index {
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo inválido',
          text: 'Por favor selecciona un archivo de imagen válido',
          customClass: 'swal-highest-z-index'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: 'El archivo es demasiado grande. Máximo 5MB permitido',
          customClass: 'swal-highest-z-index'
        });
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
    if (!selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Foto requerida',
        text: 'Por favor selecciona una foto',
        customClass: 'swal-highest-z-index'
      });
      return;
    }

    if (!adminNotes.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Nota requerida',
        text: 'Por favor agrega una nota del control de calidad',
        customClass: 'swal-highest-z-index'
      });
      return;
    }

    try {
      const photoData = {
        file: selectedFile,
        stage: 'quality_check',
        notes: adminNotes
      };

      await uploadProductionPhoto(orderId, photoData);
      
      // Notificar éxito
      onPhotoUploaded && onPhotoUploaded();
      
      // Mostrar éxito con SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: '¡Control de Calidad Enviado!',
        text: 'La foto se ha subido exitosamente y se ha enviado un correo de aprobación al cliente.',
        customClass: 'swal-highest-z-index',
        confirmButtonText: 'Entendido'
      });
      
      // Cerrar modal
      handleClose();
      
    } catch (error) {
      console.error('Error subiendo foto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al subir foto',
        text: 'Error subiendo la foto. Intenta de nuevo.',
        customClass: 'swal-highest-z-index'
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAdminNotes('');
    onClose();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Portal>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            zIndex: 2000
          }
        }}
        slotProps={{
          backdrop: {
            sx: { zIndex: 2000 }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Camera size={24} color="#2563eb" />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Control de Calidad - Orden #{orderNumber}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Control de Calidad:</strong> Sube una foto del producto terminado para que el cliente pueda aprobar o rechazar la calidad. 
              Se enviará un correo con la foto y opciones de aprobación.
            </Typography>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              📸 Foto del Producto
            </Typography>
            
            {!selectedFile ? (
              <Card 
                sx={{ 
                  border: '2px dashed #d1d5db',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#2563eb',
                    backgroundColor: '#f8fafc'
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={48} color="#9ca3af" />
                <Typography variant="body2" sx={{ mt: 1, color: '#6b7280' }}>
                  Haz clic para seleccionar una foto
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  JPG, PNG, GIF (máximo 5MB)
                </Typography>
              </Card>
            ) : (
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ position: 'relative' }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover' 
                    }} 
                  />
                  <IconButton
                    onClick={handleRemoveFile}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.7)'
                      }
                    }}
                    size="small"
                  >
                    <X size={16} />
                  </IconButton>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              📝 Nota del Control de Calidad
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe el estado del producto, detalles importantes, o cualquier observación para el cliente..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>

          {loading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: '#6b7280' }}>
                Subiendo foto y enviando correo...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !adminNotes.trim() || loading}
            variant="contained"
            startIcon={<Upload size={20} />}
            sx={{
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' },
              '&:disabled': { backgroundColor: '#d1d5db' }
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Control de Calidad'}
          </Button>
        </DialogActions>
      </Dialog>
    </Portal>
  );
};

export default ProductionPhotoUpload;