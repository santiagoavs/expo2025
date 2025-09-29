// components/OrderDetails/PaymentDetailsModal.jsx - Modal para detalles de pago
import React, { useEffect, useState } from 'react';
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
  LinearProgress,
  Divider,
  IconButton,
  Alert,
  Portal,
  styled,
  alpha
} from '@mui/material';
import {
  X,
  CurrencyCircleDollar,
  CreditCard,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Warning,
  Receipt,
  Truck
} from '@phosphor-icons/react';
import { useOrderDetails } from '../../hooks/useOrderDetails';
import PaymentStatusPanel from '../../pages/Orders/Components/PaymentStatusPanel';
import LocationMap from './LocationMap';

// ================ ESTILOS MODERNOS SUTILES ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(31, 100, 191, 0.08)',
    background: 'white',
    border: '1px solid rgba(31, 100, 191, 0.08)',
    maxWidth: '900px',
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
  background: 'white',
  height: '100%'
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
      pending: { bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' },
      processing: { bg: '#E0E7FF', color: '#3730A3', border: '#6366F1' },
      completed: { bg: '#DCFCE7', color: '#166534', border: '#22C55E' },
      failed: { bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' },
      partially_paid: { bg: '#FED7AA', color: '#9A3412', border: '#F97316' }
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

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: '10px 20px',
  borderColor: '#1F64BF',
  color: '#1F64BF',
  border: '2px solid',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#032CA6',
    background: alpha('#1F64BF', 0.05),
    transform: 'translateY(-1px)'
  }
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px'
}));

// ================ COMPONENTE PRINCIPAL ================
const PaymentDetailsModal = ({ 
  isOpen, 
  onClose, 
  orderId, 
  orderNumber 
}) => {
  const { 
    loading, 
    paymentDetails, 
    loadPaymentDetails 
  } = useOrderDetails();

  const [showLocationDetails, setShowLocationDetails] = useState(false);

  // Tarifas por departamento (hardcodeadas del backend)
  const departmentRates = {
    'San Salvador': { delivery: 0, meetup: 0 },
    'La Libertad': { delivery: 2.50, meetup: 0 },
    'Sonsonate': { delivery: 3.00, meetup: 0 },
    'Santa Ana': { delivery: 3.50, meetup: 0 },
    'Ahuachapán': { delivery: 4.00, meetup: 0 },
    'Chalatenango': { delivery: 3.50, meetup: 0 },
    'Cuscatlán': { delivery: 2.50, meetup: 0 },
    'La Paz': { delivery: 3.00, meetup: 0 },
    'Cabañas': { delivery: 4.50, meetup: 0 },
    'San Vicente': { delivery: 3.50, meetup: 0 },
    'Usulután': { delivery: 4.00, meetup: 0 },
    'San Miguel': { delivery: 5.00, meetup: 0 },
    'Morazán': { delivery: 5.50, meetup: 0 },
    'La Unión': { delivery: 6.00, meetup: 0 }
  };

  useEffect(() => {
    console.log('💳 [PaymentDetailsModal] useEffect:', { isOpen, orderId });
    if (isOpen && orderId) {
      console.log('💳 [PaymentDetailsModal] Cargando detalles de pago...');
      loadPaymentDetails(orderId);
    }
  }, [isOpen, orderId, loadPaymentDetails]);

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'processing': 'info',
      'completed': 'success',
      'failed': 'error',
      'partially_paid': 'warning'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusIcon = (status) => {
    const icons = {
      'pending': <Clock size={16} />,
      'processing': <Clock size={16} />,
      'completed': <CheckCircle size={16} />,
      'failed': <Warning size={16} />,
      'partially_paid': <Warning size={16} />
    };
    return icons[status] || <Clock size={16} />;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'cash': 'Efectivo',
      'bank_transfer': 'Transferencia Bancaria',
      'wompi': 'Tarjeta de Crédito/Débito',
      'multiple': 'Múltiples Métodos'
    };
    return labels[method] || method;
  };

  console.log('💳 [PaymentDetailsModal] Render:', { isOpen, loading, paymentDetails });

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <StyledDialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        disablePortal={false}
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
              <CurrencyCircleDollar size={22} weight="duotone" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                fontFamily: "'Mona Sans'", 
                fontWeight: 700,
                color: '#010326'
              }}>
                Detalles de Pago
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.85rem' }}>
                Pedido: {orderNumber}
              </Typography>
            </Box>
          </Box>
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
          {loading ? (
            <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <LinearProgress sx={{ width: '100%', mb: 2 }} />
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontFamily: "'Mona Sans'" }}>
                Cargando detalles de pago...
              </Typography>
            </Box>
          ) : paymentDetails ? (
            <Grid container spacing={2.5}>
              {/* Información de Pago */}
              <Grid item xs={12} md={6}>
                <ModernCard>
                  <CardContent sx={{ p: 2.5 }}>
                    <SectionHeader>
                      <CreditCard size={20} color="#1F64BF" weight="duotone" />
                      <SectionTitle>Información de Pago</SectionTitle>
                    </SectionHeader>

                    <InfoRow>
                      <InfoLabel>Método de Pago:</InfoLabel>
                      <InfoValue>{getPaymentMethodLabel(paymentDetails.payment?.method)}</InfoValue>
                    </InfoRow>

                    <InfoRow>
                      <InfoLabel>Estado:</InfoLabel>
                      <StatusChip
                        label={paymentDetails.payment?.status || 'Pendiente'}
                        status={paymentDetails.payment?.status}
                        icon={getPaymentStatusIcon(paymentDetails.payment?.status)}
                        size="small"
                      />
                    </InfoRow>

                    <InfoRow>
                      <InfoLabel>Progreso de Pago:</InfoLabel>
                      <Box sx={{ flex: 1, ml: 2 }}>
                        <ProgressContainer>
                          <LinearProgress
                            variant="determinate"
                            value={paymentDetails.payment?.paymentProgress || 0}
                            sx={{ 
                              flex: 1, 
                              height: 6, 
                              borderRadius: 3,
                              backgroundColor: alpha('#1F64BF', 0.1),
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                                borderRadius: 3
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981', fontSize: '0.85rem' }}>
                            {paymentDetails.payment?.paymentProgress || 0}%
                          </Typography>
                        </ProgressContainer>
                      </Box>
                    </InfoRow>

                    {paymentDetails.payment?.lastPaidAt && (
                      <InfoRow>
                        <InfoLabel>Último Pago:</InfoLabel>
                        <InfoValue sx={{ fontSize: '0.8rem' }}>
                          {new Date(paymentDetails.payment.lastPaidAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </InfoValue>
                      </InfoRow>
                    )}
                  </CardContent>
                </ModernCard>
              </Grid>

              {/* Información Financiera */}
              <Grid item xs={12} md={6}>
                <ModernCard>
                  <CardContent sx={{ p: 2.5 }}>
                    <SectionHeader>
                      <Receipt size={20} color="#1F64BF" weight="duotone" />
                      <SectionTitle>Resumen Financiero</SectionTitle>
                    </SectionHeader>

                    <InfoRow>
                      <InfoLabel>Subtotal:</InfoLabel>
                      <InfoValue>${paymentDetails.financial?.subtotal?.toFixed(2) || '0.00'}</InfoValue>
                    </InfoRow>

                    {paymentDetails.financial?.deliveryFee > 0 && (
                      <InfoRow>
                        <InfoLabel>Envío:</InfoLabel>
                        <InfoValue>${paymentDetails.financial.deliveryFee.toFixed(2)}</InfoValue>
                      </InfoRow>
                    )}

                    {paymentDetails.financial?.tax > 0 && (
                      <InfoRow>
                        <InfoLabel>Impuestos:</InfoLabel>
                        <InfoValue>${paymentDetails.financial.tax.toFixed(2)}</InfoValue>
                      </InfoRow>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <InfoRow>
                      <InfoLabel sx={{ fontSize: '0.95rem', fontWeight: 700 }}>Total:</InfoLabel>
                      <InfoValue sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F64BF' }}>
                        ${paymentDetails.financial?.total?.toFixed(2) || '0.00'}
                      </InfoValue>
                    </InfoRow>

                    <InfoRow>
                      <InfoLabel>Pagado:</InfoLabel>
                      <InfoValue sx={{ color: '#10B981', fontWeight: 700 }}>
                        ${paymentDetails.payment?.totalPaid?.toFixed(2) || '0.00'}
                      </InfoValue>
                    </InfoRow>

                    <InfoRow>
                      <InfoLabel>Pendiente:</InfoLabel>
                      <InfoValue sx={{ color: '#EF4444', fontWeight: 700 }}>
                        ${paymentDetails.payment?.balance?.toFixed(2) || '0.00'}
                      </InfoValue>
                    </InfoRow>
                  </CardContent>
                </ModernCard>
              </Grid>

              {/* Información de Entrega */}
              <Grid item xs={12}>
                <ModernCard>
                  <CardContent sx={{ p: 2.5 }}>
                    <SectionHeader>
                      <Truck size={20} color="#1F64BF" weight="duotone" />
                      <SectionTitle>Información de Entrega</SectionTitle>
                    </SectionHeader>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <InfoRow>
                          <InfoLabel>Tipo de Entrega:</InfoLabel>
                          <Chip
                            label={paymentDetails.delivery?.type === 'delivery' ? 'Entrega a Domicilio' : 'Punto de Encuentro'}
                            color={paymentDetails.delivery?.type === 'delivery' ? 'primary' : 'secondary'}
                            size="small"
                            sx={{ 
                              borderRadius: '8px',
                              fontWeight: 600,
                              height: '26px',
                              fontSize: '0.75rem'
                            }}
                          />
                        </InfoRow>
                      </Grid>

                      {paymentDetails.delivery?.address && (
                        <Grid item xs={12} md={6}>
                          <Box>
                            <InfoLabel sx={{ mb: 1 }}>Dirección:</InfoLabel>
                            <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", mb: 0.5 }}>
                              {paymentDetails.delivery.address.address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'Mona Sans'", fontSize: '0.8rem' }}>
                              {paymentDetails.delivery.address.municipality}, {paymentDetails.delivery.address.department}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {paymentDetails.delivery?.meetupDetails && (
                        <Grid item xs={12}>
                          <Alert 
                            severity="info" 
                            sx={{ 
                              borderRadius: '12px',
                              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
                              '& .MuiAlert-icon': {
                                color: '#3B82F6'
                              }
                            }}
                          >
                            <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600, mb: 0.5 }}>
                              <strong>Ubicación:</strong> {
                                paymentDetails.delivery.meetupDetails.location?.address || 
                                paymentDetails.delivery.meetupDetails.location?.placeName || 
                                'Ubicación no disponible'
                              }
                            </Typography>
                            {paymentDetails.delivery.meetupDetails.notes && (
                              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", mt: 0.5, fontSize: '0.85rem' }}>
                                <strong>Notas:</strong> {paymentDetails.delivery.meetupDetails.notes}
                              </Typography>
                            )}
                          </Alert>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </ModernCard>
              </Grid>
            </Grid>
          ) : (
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: '16px',
                border: `1px solid ${alpha('#3B82F6', 0.2)}`
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                <strong>Funcionalidad de Detalles de Pago</strong><br/>
                Esta funcionalidad mostraría información detallada sobre el pago de la orden, incluyendo:
              </Typography>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', fontFamily: "'Mona Sans'" }}>
                <li>Estado del pago</li>
                <li>Método de pago utilizado</li>
                <li>Montos pagados y pendientes</li>
                <li>Información de entrega</li>
              </ul>
              <Typography variant="body2" sx={{ mt: 1, fontFamily: "'Mona Sans'" }}>
                <strong>ID de Orden:</strong> {orderId}
              </Typography>
            </Alert>
          )}

          {/* Panel de gestión de pagos */}
          <Box sx={{ mt: 3 }}>
            <PaymentStatusPanel 
              orderId={orderId}
              paymentStatus={paymentDetails}
              onRefresh={() => loadPaymentDetails(orderId)}
              compact={false}
            />
          </Box>

          {/* Sección de Ubicación y Tarifas */}
          {paymentDetails?.delivery && (
            <Box sx={{ mt: 3 }}>
              <ModernCard sx={{ p: 2.5 }}>
                <SectionHeader>
                  <MapPin size={20} color="#1F64BF" weight="duotone" />
                  <SectionTitle>Información de Ubicación y Tarifas</SectionTitle>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowLocationDetails(!showLocationDetails)}
                    sx={{
                      ml: 'auto',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontFamily: "'Mona Sans'",
                      fontWeight: 600,
                      fontSize: '0.8rem'
                    }}
                  >
                    {showLocationDetails ? 'Ocultar' : 'Ver Detalles'}
                  </Button>
                </SectionHeader>

                {showLocationDetails && (
                  <Box sx={{ mt: 2 }}>
                    {/* Mapa de ubicación */}
                    {paymentDetails.delivery.type === 'meetup' && paymentDetails.delivery.meetupDetails && (
                      <Box sx={{ mb: 3 }}>
                        <LocationMap 
                          meetupDetails={paymentDetails.delivery.meetupDetails}
                          deliveryType={paymentDetails.delivery.type}
                        />
                      </Box>
                    )}

                    {/* Información de dirección */}
                    {paymentDetails.delivery.address && (
                      <Box sx={{ mb: 3 }}>
                        <InfoRow>
                          <InfoLabel>Dirección de entrega:</InfoLabel>
                          <InfoValue sx={{ textAlign: 'left', fontSize: '0.85rem' }}>
                            {paymentDetails.delivery.address.address}, {paymentDetails.delivery.address.municipality}, {paymentDetails.delivery.address.department}
                          </InfoValue>
                        </InfoRow>
                      </Box>
                    )}

                    {/* Tarifas por departamento */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ 
                        fontFamily: "'Mona Sans'", 
                        fontWeight: 700, 
                        color: '#010326',
                        mb: 2
                      }}>
                        📍 Tarifas por Departamento
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {Object.entries(departmentRates).map(([department, rates]) => (
                          <Grid item xs={12} sm={6} md={4} key={department}>
                            <Box sx={{
                              p: 2,
                              borderRadius: '12px',
                              border: `1px solid ${alpha('#1F64BF', 0.08)}`,
                              backgroundColor: alpha('#1F64BF', 0.02),
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: alpha('#1F64BF', 0.05),
                                transform: 'translateY(-1px)'
                              }
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontFamily: "'Mona Sans'", 
                                fontWeight: 700, 
                                color: '#010326',
                                mb: 1
                              }}>
                                {department}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                  label={`Entrega: $${rates.delivery.toFixed(2)}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: rates.delivery === 0 ? alpha('#10B981', 0.1) : alpha('#F97316', 0.1),
                                    color: rates.delivery === 0 ? '#065F46' : '#9A3412',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    fontSize: '0.75rem'
                                  }}
                                />
                                <Chip 
                                  label={`Punto: $${rates.meetup.toFixed(2)}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha('#3B82F6', 0.1),
                                    color: '#1E40AF',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Box>
                )}
              </ModernCard>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`,
          background: 'white'
        }}>
          <ModernButton onClick={onClose}>
            Cerrar
          </ModernButton>
        </DialogActions>
      </StyledDialog>
    </Portal>
  );
};

export default PaymentDetailsModal;