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
  Paper,
  styled,
  alpha
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
  Phone,
  X,
  ChartBar,
  Package,
  ListChecks
} from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/ApiClient';

// ================ ESTILOS MODERNOS SUTILES ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(31, 100, 191, 0.08)',
    background: 'white',
    border: '1px solid rgba(31, 100, 191, 0.08)',
    maxWidth: '1000px',
    width: '95%',
    maxHeight: '90vh',
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

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 1px 4px rgba(31, 100, 191, 0.04)',
  background: 'white'
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: '24px',
  borderRadius: '16px',
  background: 'white',
  textAlign: 'center',
  boxShadow: '0 1px 4px rgba(31, 100, 191, 0.04)',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '140px'
}));

const InfoCard = styled(ModernCard)(({ theme }) => ({
  padding: '24px'
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '16px'
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "'Mona Sans'",
  fontWeight: 700,
  fontSize: '0.95rem',
  color: '#010326',
  letterSpacing: '-0.01em'
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.05)}`,
  transition: 'all 0.15s ease',
  '&:last-child': {
    borderBottom: 'none'
  },
  '&:hover': {
    backgroundColor: alpha('#1F64BF', 0.02),
    borderRadius: '8px',
    padding: '10px 8px'
  }
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontFamily: "'Mona Sans'",
  fontWeight: 600,
  color: '#6B7280',
  fontSize: '0.85rem'
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontFamily: "'Mona Sans'",
  fontWeight: 600,
  color: '#010326',
  fontSize: '0.9rem',
  textAlign: 'right'
}));

const StatusChip = styled(Chip)(({ status }) => {
  const getStatusStyles = (status) => {
    const styles = {
      approved: { bg: '#DCFCE7', color: '#166534', border: '#22C55E' },
      rejected: { bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' },
      pending: { bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' },
      sent: { bg: '#DBEAFE', color: '#1E40AF', border: '#3B82F6' }
    };
    return styles[status] || styles.pending;
  };

  const statusStyles = getStatusStyles(status);

  return {
    backgroundColor: statusStyles.bg,
    color: statusStyles.color,
    border: `2px solid ${statusStyles.border}`,
    fontWeight: 700,
    fontFamily: "'Mona Sans'",
    borderRadius: '10px',
    height: '28px',
    fontSize: '0.75rem'
  };
});

const AttemptCard = styled(Paper)(({ theme }) => ({
  marginBottom: '20px',
  padding: '20px',
  borderRadius: '16px',
  background: alpha('#F8FAFC', 0.5),
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  '&:last-child': {
    marginBottom: 0
  }
}));

const ResponseCard = styled(Box)(({ theme, approved }) => ({
  padding: '16px',
  borderRadius: '12px',
  background: approved ? '#F0FDF4' : '#FEF2F2',
  border: `2px solid ${approved ? '#10B981' : '#EF4444'}`
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
      borderColor: '#1F64BF',
      color: '#1F64BF',
      border: '2px solid',
      '&:hover': {
        borderColor: '#032CA6',
        background: alpha('#1F64BF', 0.05)
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
    ...selectedVariant
  };
});

// ================ COMPONENTE PRINCIPAL ================
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
      case 'approved': return <CheckCircle size={20} weight="duotone" />;
      case 'rejected': return <XCircle size={20} weight="duotone" />;
      case 'pending': return <Clock size={20} weight="duotone" />;
      case 'sent': return <Envelope size={20} weight="duotone" />;
      default: return <WarningCircle size={20} weight="duotone" />;
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
      <StyledDialog 
        open={open} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        sx={{ zIndex: 1400 }}
      >
        <DialogTitleStyled>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              background: alpha('#10B981', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981'
            }}>
              <ListChecks size={22} weight="duotone" />
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
                Pedido: {orderNumber}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton 
              onClick={loadQualityData}
              disabled={loading}
              sx={{ 
                color: '#6B7280',
                '&:hover': {
                  backgroundColor: alpha('#1F64BF', 0.08),
                  color: '#1F64BF'
                }
              }}
            >
              <ArrowClockwise size={20} />
            </IconButton>
            <IconButton 
              onClick={onClose}
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
          </Box>
        </DialogTitleStyled>

        <DialogContent sx={{ 
          p: 3,
          overflow: 'auto',
          background: 'white',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: alpha('#1F64BF', 0.03)
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha('#1F64BF', 0.2),
            borderRadius: '3px',
            '&:hover': {
              background: alpha('#1F64BF', 0.3)
            }
          }
        }}>
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
              <CircularProgress size={48} sx={{ color: '#1F64BF' }} />
              <Typography variant="h6" sx={{ 
                ml: 2, 
                color: '#1F64BF',
                fontFamily: "'Mona Sans'",
                fontWeight: 600
              }}>
                Cargando datos...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                m: 3, 
                borderRadius: '16px',
                border: `1px solid ${alpha('#EF4444', 0.2)}`
              }}
            >
              {error}
            </Alert>
          )}

          {qualityData && !loading && (
            <Box>
              {/* Estadísticas Principales */}
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard color="primary">
                    <ChartBar size={32} weight="duotone" />
                    <Typography variant="h3" fontWeight="800" sx={{ my: 1, fontFamily: "'Mona Sans'" }}>
                      {qualityData.stats?.totalAttempts || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: "'Mona Sans'" }}>
                      Intentos Totales
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard color="success">
                    <CheckCircle size={32} weight="duotone" />
                    <Typography variant="h3" fontWeight="800" sx={{ my: 1, fontFamily: "'Mona Sans'" }}>
                      {qualityData.stats?.approvedCount || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: "'Mona Sans'" }}>
                      Aprobados
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard color="error">
                    <XCircle size={32} weight="duotone" />
                    <Typography variant="h3" fontWeight="800" sx={{ my: 1, fontFamily: "'Mona Sans'" }}>
                      {qualityData.stats?.rejectedCount || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: "'Mona Sans'" }}>
                      Rechazados
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard color="warning">
                    <Clock size={32} weight="duotone" />
                    <Typography variant="h3" fontWeight="800" sx={{ my: 1, fontFamily: "'Mona Sans'" }}>
                      {qualityData.stats?.pendingCount || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: "'Mona Sans'" }}>
                      Pendientes
                    </Typography>
                  </StatCard>
                </Grid>
              </Grid>

              {/* Información del Cliente */}
              <InfoCard sx={{ mb: 3 }}>
                <SectionHeader>
                  <User size={20} color="#1F64BF" weight="duotone" />
                  <SectionTitle>Información del Cliente</SectionTitle>
                </SectionHeader>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <InfoRow>
                      <InfoLabel>Nombre:</InfoLabel>
                      <InfoValue>{qualityData.client?.name || 'N/A'}</InfoValue>
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoRow>
                      <InfoLabel>Email:</InfoLabel>
                      <InfoValue sx={{ fontSize: '0.8rem' }}>
                        {qualityData.client?.email || 'N/A'}
                      </InfoValue>
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoRow>
                      <InfoLabel>Teléfono:</InfoLabel>
                      <InfoValue>{qualityData.client?.phone || 'N/A'}</InfoValue>
                    </InfoRow>
                  </Grid>
                </Grid>
              </InfoCard>

              {/* Historial de Intentos */}
              <InfoCard>
                <SectionHeader>
                  <Clock size={20} color="#1F64BF" weight="duotone" />
                  <SectionTitle>Historial de Intentos</SectionTitle>
                </SectionHeader>
                
                {qualityData.attempts?.length === 0 ? (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      borderRadius: '12px',
                      border: `1px solid ${alpha('#3B82F6', 0.2)}`
                    }}
                  >
                    No hay intentos de control de calidad registrados.
                  </Alert>
                ) : (
                  <Box>
                    {qualityData.attempts?.map((attempt, index) => (
                      <AttemptCard key={index}>
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
                            <Typography variant="h6" fontWeight="600" sx={{ 
                              color: '#010326',
                              fontFamily: "'Mona Sans'",
                              fontSize: '0.95rem'
                            }}>
                              Intento #{attempt.attemptNumber}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: '#6B7280',
                              fontFamily: "'Mona Sans'",
                              fontSize: '0.8rem'
                            }}>
                              {formatDate(attempt.timestamp)}
                            </Typography>
                          </Box>
                          <StatusChip 
                            label={
                              attempt.status === 'approved' ? 'Aprobado' :
                              attempt.status === 'rejected' ? 'Rechazado' :
                              attempt.status === 'sent' ? 'Enviado' : 'Pendiente'
                            }
                            status={attempt.status}
                          />
                        </Box>
                        
                        <Typography variant="body1" sx={{ 
                          mb: 2,
                          fontFamily: "'Mona Sans'",
                          fontSize: '0.9rem'
                        }}>
                          {attempt.notes || 'Sin notas.'}
                        </Typography>
                        
                        {attempt.clientResponse && (
                          <ResponseCard approved={attempt.clientResponse.approved}>
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
                                {attempt.clientResponse.approved ? 
                                  <CheckCircle size={16} weight="bold" /> : 
                                  <XCircle size={16} weight="bold" />
                                }
                              </Box>
                              <Typography variant="subtitle1" fontWeight="600" sx={{
                                color: attempt.clientResponse.approved ? '#10B981' : '#EF4444',
                                fontFamily: "'Mona Sans'",
                                fontSize: '0.9rem'
                              }}>
                                Respuesta del Cliente: {attempt.clientResponse.approved ? 'Aprobado' : 'Rechazado'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ 
                              mb: 1,
                              color: '#6B7280',
                              fontFamily: "'Mona Sans'",
                              fontSize: '0.85rem'
                            }}>
                              Fecha: {formatDate(attempt.clientResponse.responseDate)}
                            </Typography>
                            {attempt.clientResponse.notes && (
                              <Typography variant="body2" sx={{ 
                                color: '#6B7280',
                                fontFamily: "'Mona Sans'",
                                fontSize: '0.85rem'
                              }}>
                                Notas del Cliente: {attempt.clientResponse.notes}
                              </Typography>
                            )}
                          </ResponseCard>
                        )}
                      </AttemptCard>
                    ))}
                  </Box>
                )}
              </InfoCard>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          background: 'white',
          borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`,
          gap: 1.5
        }}>
          <ModernButton 
            onClick={onClose} 
            variant="outlined"
          >
            Cerrar
          </ModernButton>
          <ModernButton 
            onClick={loadQualityData} 
            variant="primary"
            startIcon={<ArrowClockwise size={18} weight="duotone" />}
            disabled={loading}
          >
            Actualizar
          </ModernButton>
        </DialogActions>
      </StyledDialog>
    </Portal>
  );
};

export default QualityControlPanel;