// components/OrderDetails/ProductionPhotoUpload.jsx - Componente para subir fotos de control de calidad
import React, { useState, useRef, useEffect } from 'react';
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
  styled,
  alpha
} from '@mui/material';
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  FileImage,
  Note,
  Warning,
  Spinner,
  Trash,
  Plus,
  Check,
  XCircle
} from '@phosphor-icons/react';
import { useOrderDetails } from '../../hooks/useOrderDetails';
import Swal from 'sweetalert2';

// ================ ESTILOS MODERNOS SUTILES ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(31, 100, 191, 0.08)',
    background: 'white',
    border: '1px solid rgba(31, 100, 191, 0.08)',
    maxWidth: '700px',
    width: '95%',
    overflow: 'hidden'
  }
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  background: 'white',
  color: '#010326',
  padding: '24px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`
}));

const UploadCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `2px dashed ${alpha('#1F64BF', 0.3)}`,
  boxShadow: 'none',
  background: alpha('#1F64BF', 0.02),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#1F64BF',
    background: alpha('#1F64BF', 0.04)
  }
}));

const PreviewCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 1px 4px rgba(31, 100, 191, 0.04)',
  background: 'white',
  overflow: 'hidden'
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontFamily: "'Mona Sans'",
    '& fieldset': {
      borderColor: alpha('#1F64BF', 0.2)
    },
    '&:hover fieldset': {
      borderColor: '#1F64BF'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1F64BF'
    }
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Mona Sans'",
    '&.Mui-focused': {
      color: '#1F64BF'
    }
  }
}));

const ModernButton = styled(Button)(({ variant: buttonVariant }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(31, 100, 191, 0.2)',
      '&:hover': {
        background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
        boxShadow: '0 4px 12px rgba(31, 100, 191, 0.3)'
      }
    },
    outlined: {
      borderColor: '#6B7280',
      color: '#6B7280',
      border: '2px solid',
      '&:hover': {
        borderColor: '#4B5563',
        background: alpha('#6B7280', 0.05)
      }
    }
  };

  const selectedVariant = variants[buttonVariant] || variants.outlined;

  return {
    borderRadius: '12px',
    textTransform: 'none',
    fontFamily: "'Mona Sans'",
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '10px 20px',
    transition: 'all 0.2s ease',
    ...selectedVariant,
    '&:disabled': {
      background: alpha('#1F64BF', 0.3),
      boxShadow: 'none',
      color: 'white'
    }
  };
});

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "'Mona Sans'",
  fontWeight: 700,
  fontSize: '0.95rem',
  color: '#010326',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

// ================ COMPONENTE PRINCIPAL ================
const ProductionPhotoUpload = ({ 
  isOpen, 
  onClose, 
  orderId, 
  orderNumber, 
  onPhotoUploaded 
}) => {
  const { loading, uploadProductionPhoto } = useOrderDetails();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const fileInputRef = useRef(null);

  // Configurar SweetAlert2 con z-index alto
  useEffect(() => {
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
    <StyledDialog
      open={isOpen}
      onClose={(event, reason) => {
        // Solo permitir cerrar con el botón X o ESC, no con click en backdrop
        if (reason === 'backdropClick') {
          return;
        }
        handleClose();
      }}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={false}
      sx={{ 
        zIndex: 3000,
        '& .MuiDialog-paper': {
          zIndex: 3001
        },
        '& .MuiBackdrop-root': {
          zIndex: 3000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
      slotProps={{
        backdrop: {
          sx: { 
            zIndex: 3000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }}
    >
        <DialogTitleStyled>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: alpha('#F97316', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F97316'
            }}>
              <Camera size={22} weight="duotone" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                fontFamily: "'Mona Sans'", 
                fontWeight: 700,
                color: '#010326'
              }}>
                Control de Calidad
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.85rem' }}>
                Orden #{orderNumber}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleClose} 
            sx={{ 
              color: '#6B7280',
              '&:hover': {
                backgroundColor: alpha('#1F64BF', 0.08),
                color: '#1F64BF',
                transform: 'rotate(90deg)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <X size={22} />
          </IconButton>
        </DialogTitleStyled>

        <DialogContent sx={{ 
          p: 3,
          background: 'white'
        }}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2
            }}
            icon={<CheckCircle size={20} weight="duotone" />}
          >
            <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
              <strong>Control de Calidad:</strong> Sube una foto del producto terminado para que el cliente pueda aprobar o rechazar la calidad. 
              Se enviará un correo con la foto y opciones de aprobación.
            </Typography>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <SectionTitle>
              <Camera size={20} weight="duotone" />
              Foto del Producto
            </SectionTitle>
            
            {!selectedFile ? (
              <UploadCard onClick={() => fileInputRef.current?.click()}>
                <CardContent sx={{ 
                  textAlign: 'center',
                  py: 4
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 2 
                  }}>
                    <Box sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '16px',
                      background: alpha('#1F64BF', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1F64BF'
                    }}>
                      <Plus size={32} weight="duotone" />
                    </Box>
                    <Typography variant="body1" sx={{ 
                      fontFamily: "'Mona Sans'",
                      fontWeight: 600,
                      color: '#010326'
                    }}>
                      Haz clic para seleccionar una foto
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: '#6B7280',
                      fontFamily: "'Mona Sans'",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      <FileImage size={14} weight="duotone" />
                      JPG, PNG, GIF (máximo 5MB)
                    </Typography>
                  </Box>
                </CardContent>
              </UploadCard>
            ) : (
              <PreviewCard>
                <Box sx={{ position: 'relative' }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ 
                      width: '100%', 
                      height: '300px', 
                      objectFit: 'cover' 
                    }} 
                  />
                  <IconButton
                    onClick={handleRemoveFile}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(220, 38, 38, 0.8)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    size="small"
                  >
                    <Trash size={16} weight="duotone" />
                  </IconButton>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" sx={{ 
                    color: '#6B7280',
                    fontFamily: "'Mona Sans'",
                    fontSize: '0.85rem'
                  }}>
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                </CardContent>
              </PreviewCard>
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
            <SectionTitle>
              <Note size={20} weight="duotone" />
              Nota del Control de Calidad
            </SectionTitle>
            <StyledTextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe el estado del producto, detalles importantes, o cualquier observación para el cliente..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </Box>

          {loading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha('#1F64BF', 0.1),
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #1F64BF 0%, #032CA6 100%)',
                  borderRadius: 3
                }
              }} />
              <Typography variant="body2" sx={{ 
                mt: 1.5, 
                textAlign: 'center', 
                color: '#6B7280',
                fontFamily: "'Mona Sans'",
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}>
                <Spinner size={16} weight="duotone" className="animate-spin" />
                Subiendo foto y enviando correo...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`,
          background: 'white',
          gap: 1.5
        }}>
          <ModernButton 
            onClick={handleClose}
            variant="outlined"
            disabled={loading}
            startIcon={<XCircle size={18} weight="duotone" />}
          >
            Cancelar
          </ModernButton>
          <ModernButton
            onClick={handleUpload}
            disabled={!selectedFile || !adminNotes.trim() || loading}
            variant="primary"
            startIcon={loading ? <Spinner size={18} weight="duotone" className="animate-spin" /> : <Check size={18} weight="duotone" />}
          >
            {loading ? 'Enviando...' : 'Enviar Control de Calidad'}
          </ModernButton>
        </DialogActions>
      </StyledDialog>
  );
};

export default ProductionPhotoUpload;