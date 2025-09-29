import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Paper
} from '@mui/material';
import { Portal } from '@mui/material';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowClockwise,
  WarningCircle,
  User,
  Calendar,
  Note,
  Camera,
  Envelope,
  Phone
} from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/ApiClient';

const QualityControlPanel = ({ open, onClose, orderId, orderNumber }) => {
  const [loading, setLoading] = useState(false);
  const [qualityData, setQualityData] = useState(null);
  const [error, setError] = useState(null);

  // Cargar datos de control de calidad
  const loadQualityData = async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/orders/${orderId}/quality-control`);
      if (response.success) {
        setQualityData(response.data);
      } else {
        setError(response.message || 'Error al cargar datos');
      }
    } catch (err) {
      console.error('Error cargando datos de control de calidad:', err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && orderId) {
      loadQualityData();
    }
  }, [open, orderId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'pending': return '#F59E0B';
      case 'sent': return '#1F64BF';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={20} />;
      case 'rejected': return <XCircle size={20} />;
      case 'pending': return <Clock size={20} />;
      case 'sent': return <Envelope size={20} />;
      default: return <WarningCircle size={20} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!open) return null;

  return (
    <Portal>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: '#FFFFFF',
            boxShadow: '0 25px 50px rgba(1, 3, 38, 0.15)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }
        }}
      >
        {/* Header */}
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
          color: 'white',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Camera size={24} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700">
                Control de Calidad
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Pedido: {orderNumber}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton 
              onClick={loadQualityData}
              sx={{ 
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)'
                }
              }}
              disabled={loading}
            >
              <ArrowClockwise size={20} />
            </IconButton>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <XCircle size={20} />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ p: 0, background: '#FFFFFF' }}>
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
              <CircularProgress size={48} sx={{ color: '#1F64BF' }} />
              <Typography variant="h6" sx={{ ml: 2, color: '#1F64BF' }}>Cargando datos...</Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ m: 3, borderRadius: '16px' }}>
              {error}
            </Alert>
          )}

          {qualityData && !loading && (
            <Box sx={{ p: 4 }}>
              {/* Estadísticas Principales */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ 
                    p: 3,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(31, 100, 191, 0.3)'
                  }}>
                    <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
                      {qualityData.stats?.totalAttempts || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Intentos Totales
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ 
                    p: 3,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                  }}>
                    <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
                      {qualityData.stats?.approvedCount || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Aprobados
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ 
                    p: 3,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
                  }}>
                    <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
                      {qualityData.stats?.rejectedCount || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Rechazados
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ 
                    p: 3,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
                  }}>
                    <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
                      {qualityData.stats?.pendingCount || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Pendientes
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Información del Cliente */}
              <Paper sx={{ 
                p: 4,
                borderRadius: '20px',
                background: '#FFFFFF',
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                mb: 4
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#1F64BF',
                  fontWeight: 700,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <User size={24} />
                  Información del Cliente
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 3,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      border: '1px solid #cbd5e1'
                    }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Nombre
                      </Typography>
                      <Typography variant="h6" fontWeight="600" color="#1F64BF">
                        {qualityData.client?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 3,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      border: '1px solid #cbd5e1'
                    }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Email
                      </Typography>
                      <Typography variant="h6" fontWeight="600" color="#1F64BF">
                        {qualityData.client?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 3,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      border: '1px solid #cbd5e1'
                    }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Teléfono
                      </Typography>
                      <Typography variant="h6" fontWeight="600" color="#1F64BF">
                        {qualityData.client?.phone || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Historial de Intentos */}
              <Paper sx={{ 
                p: 4,
                borderRadius: '20px',
                background: '#FFFFFF',
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#1F64BF',
                  fontWeight: 700,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Clock size={24} />
                  Historial de Intentos
                </Typography>
                
                {qualityData.attempts?.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: '16px' }}>
                    No hay intentos de control de calidad registrados.
                  </Alert>
                ) : (
                  <Box>
                    {qualityData.attempts?.map((attempt, index) => (
                      <Paper key={index} sx={{ 
                        mb: 3, 
                        p: 3, 
                        borderRadius: '16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        '&:last-child': { mb: 0 }
                      }}>
                        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: getStatusColor(attempt.status),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}>
                            {getStatusIcon(attempt.status)}
                          </Box>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="600" color="#1F64BF">
                              Intento #{attempt.attemptNumber}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {formatDate(attempt.timestamp)}
                            </Typography>
                          </Box>
                          <Chip 
                            label={attempt.status === 'approved' ? 'Aprobado' :
                                   attempt.status === 'rejected' ? 'Rechazado' :
                                   attempt.status === 'sent' ? 'Enviado' : 'Pendiente'}
                            sx={{ 
                              background: getStatusColor(attempt.status),
                              color: 'white',
                              fontWeight: 600,
                              borderRadius: '8px'
                            }}
                          />
                        </Box>
                        
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {attempt.notes || 'Sin notas.'}
                        </Typography>
                        
                        {attempt.clientResponse && (
                          <Box sx={{ 
                            p: 3,
                            borderRadius: '12px',
                            background: attempt.clientResponse.approved ? '#f0fdf4' : '#fef2f2',
                            border: `2px solid ${attempt.clientResponse.approved ? '#10B981' : '#EF4444'}`
                          }}>
                            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                              <Box sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '6px',
                                background: attempt.clientResponse.approved ? '#10B981' : '#EF4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                              }}>
                                {attempt.clientResponse.approved ? <CheckCircle size={16} /> : <XCircle size={16} />}
                              </Box>
                              <Typography variant="subtitle1" fontWeight="600" sx={{
                                color: attempt.clientResponse.approved ? '#10B981' : '#EF4444'
                              }}>
                                Respuesta del Cliente: {attempt.clientResponse.approved ? 'Aprobado' : 'Rechazado'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              Fecha: {formatDate(attempt.clientResponse.responseDate)}
                            </Typography>
                            {attempt.clientResponse.notes && (
                              <Typography variant="body2" color="textSecondary">
                                Notas del Cliente: {attempt.clientResponse.notes}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 4, 
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0'
        }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{ 
              borderRadius: '16px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderColor: '#1F64BF',
              color: '#1F64BF',
              '&:hover': {
                borderColor: '#032CA6',
                background: 'rgba(31, 100, 191, 0.05)'
              }
            }}
          >
            Cerrar
          </Button>
          <Button 
            onClick={loadQualityData} 
            variant="contained"
            startIcon={<ArrowClockwise size={20} />}
            disabled={loading}
            sx={{ 
              borderRadius: '16px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
              boxShadow: '0 8px 32px rgba(31, 100, 191, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #032CA6 0%, #010326 100%)',
                boxShadow: '0 12px 40px rgba(31, 100, 191, 0.4)'
              },
              '&:disabled': {
                background: '#9CA3AF',
                boxShadow: 'none'
              }
            }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Portal>
  );
};

export default QualityControlPanel;