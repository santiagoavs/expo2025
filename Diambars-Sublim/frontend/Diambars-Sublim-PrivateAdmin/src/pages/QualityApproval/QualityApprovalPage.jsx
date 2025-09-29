import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { CheckCircle, XCircle, ArrowLeft, Image as ImageIcon } from '@phosphor-icons/react';
import { qualityApprovalService } from '../../api/QualityApprovalService';

const QualityApprovalPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [clientNotes, setClientNotes] = useState('');
  const [response, setResponse] = useState(null);

  // Cargar datos de la orden
  useEffect(() => {
    const loadOrderData = async () => {
      try {
        setLoading(true);
        const orderData = await qualityApprovalService.getOrderForApproval(orderId);
        setOrder(orderData);
        setError(null);
      } catch (err) {
        console.error('Error cargando orden:', err);
        setError('No se pudo cargar la información de la orden');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

  // Manejar respuesta del cliente
  const handleResponse = async (isApproved) => {
    try {
      setSubmitting(true);
      const result = await qualityApprovalService.submitClientResponse(orderId, {
        approved: isApproved,
        notes: clientNotes.trim(),
        responseDate: new Date().toISOString()
      });
      
      setResponse(result);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
      
    } catch (err) {
      console.error('Error enviando respuesta:', err);
      setError('Error enviando respuesta. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Estilos limpios y minimalistas
  const styles = {
    container: {
      minHeight: '100vh',
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Mona Sans', sans-serif"
    },
    card: {
      maxWidth: '600px',
      width: '100%',
      background: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid #E5E7EB'
    },
    header: {
      textAlign: 'center',
      padding: '40px 40px 20px',
      background: '#1F64BF',
      color: '#FFFFFF',
      borderRadius: '12px 12px 0 0'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#FFFFFF'
    },
    subtitle: {
      fontSize: '1rem',
      opacity: 0.9,
      fontWeight: '400',
      color: '#FFFFFF'
    },
    content: {
      padding: '40px'
    },
    orderInfo: {
      background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F4FD 100%)',
      borderRadius: '15px',
      padding: '25px',
      marginBottom: '30px',
      border: '1px solid rgba(31, 100, 191, 0.1)',
      boxShadow: 'inset 0 2px 4px rgba(31, 100, 191, 0.1)'
    },
    productImage: {
      width: '100%',
      maxWidth: '400px',
      height: '300px',
      objectFit: 'cover',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(1, 3, 38, 0.2)',
      border: '3px solid #FFFFFF',
      margin: '0 auto 20px',
      display: 'block'
    },
    notesField: {
      marginBottom: '30px',
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        background: '#F8FAFF',
        '&:hover': {
          background: '#E8F4FD'
        },
        '&.Mui-focused': {
          background: '#FFFFFF',
          boxShadow: '0 0 0 2px #1F64BF'
        }
      }
    },
    buttonContainer: {
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    approveButton: {
      background: '#10B981',
      color: '#FFFFFF',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '1rem',
      fontWeight: '500',
      textTransform: 'none',
      '&:hover': {
        background: '#059669'
      }
    },
    rejectButton: {
      background: '#EF4444',
      color: '#FFFFFF',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '1rem',
      fontWeight: '500',
      textTransform: 'none',
      '&:hover': {
        background: '#DC2626'
      }
    },
    backButton: {
      background: '#6B7280',
      color: '#FFFFFF',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '0.9rem',
      fontWeight: '500',
      textTransform: 'none',
      '&:hover': {
        background: '#4B5563'
      }
    },
    statusChip: {
      background: '#1F64BF',
      color: '#FFFFFF',
      fontWeight: '500',
      fontSize: '0.8rem',
      padding: '6px 12px',
      borderRadius: '16px'
    },
    successMessage: {
      background: '#10B981',
      color: '#FFFFFF',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center'
    }
  };

  if (loading) {
    return (
      <Box sx={styles.container}>
        <Card sx={styles.card}>
          <CardContent sx={{ textAlign: 'center', padding: '60px' }}>
            <CircularProgress size={60} sx={{ color: '#1F64BF', mb: 3 }} />
            <Typography variant="h6" sx={{ color: '#1F64BF', fontWeight: '600' }}>
              Cargando información de la orden...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={styles.container}>
        <Card sx={styles.card}>
          <CardContent sx={{ textAlign: 'center', padding: '60px' }}>
            <XCircle size={60} color="#EF4444" style={{ marginBottom: '20px' }} />
            <Typography variant="h5" sx={{ color: '#EF4444', fontWeight: '600', mb: 2 }}>
              Error
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7280', mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/orders')}
              sx={styles.backButton}
              startIcon={<ArrowLeft size={20} />}
            >
              Volver a Órdenes
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (response) {
    return (
      <Box sx={styles.container}>
        <Card sx={styles.card}>
          <CardContent sx={{ textAlign: 'center', padding: '60px' }}>
            <CheckCircle size={80} color="#10B981" style={{ marginBottom: '20px' }} />
            <Typography variant="h4" sx={{ color: '#10B981', fontWeight: '700', mb: 2 }}>
              ¡Respuesta Enviada!
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7280', mb: 3 }}>
              Tu respuesta ha sido registrada exitosamente.
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Redirigiendo al panel de administración...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Card sx={styles.card}>
        {/* Header */}
        <Box sx={styles.header}>
          <Typography variant="h3" sx={styles.title}>
            Control de Calidad
          </Typography>
          <Typography variant="h6" sx={styles.subtitle}>
            Revisa tu producto y confirma si cumple con tus expectativas
          </Typography>
        </Box>

        <CardContent sx={styles.content}>
          {/* Información de la orden */}
          <Box sx={styles.orderInfo}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1F64BF', fontWeight: '600' }}>
                Orden #{order?.orderNumber}
              </Typography>
              <Chip label="Control de Calidad" sx={styles.statusChip} />
            </Box>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Cliente: {order?.user?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Producto: {order?.items?.[0]?.product?.name}
            </Typography>
          </Box>

          {/* Imagen del producto */}
          {order?.qualityPhoto && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#1F64BF', fontWeight: '600', mb: 2 }}>
                Foto de Producción
              </Typography>
              <img
                src={order.qualityPhoto}
                alt="Producto en producción"
                style={styles.productImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <Box
                sx={{
                  display: 'none',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '300px',
                  background: '#F8FAFF',
                  borderRadius: '15px',
                  border: '2px dashed #1F64BF'
                }}
              >
                <ImageIcon size={60} color="#1F64BF" />
                <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>
                  Imagen no disponible
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Campo de notas */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notas adicionales (opcional)"
            placeholder="Comparte cualquier comentario sobre la calidad del producto..."
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            sx={styles.notesField}
          />

          {/* Botones de acción */}
          <Box sx={styles.buttonContainer}>
            <Button
              variant="contained"
              onClick={() => handleResponse(true)}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={24} />}
              sx={styles.approveButton}
            >
              {submitting ? 'Enviando...' : 'Aprobar Calidad'}
            </Button>
            
            <Button
              variant="contained"
              onClick={() => handleResponse(false)}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <XCircle size={24} />}
              sx={styles.rejectButton}
            >
              {submitting ? 'Enviando...' : 'Rechazar Calidad'}
            </Button>
          </Box>

          {/* Botón de regreso */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/orders')}
              startIcon={<ArrowLeft size={20} />}
              sx={styles.backButton}
            >
              Volver al Panel
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QualityApprovalPage;
