// components/OrderDetails/PaymentDetailsModal.jsx - Modal para detalles de pago
import React, { useEffect } from 'react';
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
  Portal
} from '@mui/material';
import {
  X,
  CurrencyCircleDollar,
  CreditCard,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Warning
} from '@phosphor-icons/react';
import { useOrderDetails } from '../../hooks/useOrderDetails';
import PaymentStatusPanel from '../../pages/Orders/Components/PaymentStatusPanel';

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

  // Siempre mostrar el modal si isOpen es true, incluso sin datos
  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        disablePortal={false}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '90vh',
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
            Detalles de Pago
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pedido: {orderNumber}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {loading ? (
          <Box sx={{ py: 4 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Cargando detalles de pago...
            </Typography>
          </Box>
        ) : paymentDetails ? (
          <Grid container spacing={3}>
            {/* Información de Pago */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CreditCard size={20} color="#032CA6" />
                    <Typography variant="h6" sx={{ ml: 1, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                      Información de Pago
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Método de Pago:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {getPaymentMethodLabel(paymentDetails.payment?.method)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Estado:
                    </Typography>
                    <Chip
                      label={paymentDetails.payment?.status || 'Pendiente'}
                      color={getPaymentStatusColor(paymentDetails.payment?.status)}
                      icon={getPaymentStatusIcon(paymentDetails.payment?.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Progreso de Pago:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={paymentDetails.payment?.paymentProgress || 0}
                        sx={{ flexGrow: 1, mr: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {paymentDetails.payment?.paymentProgress || 0}%
                      </Typography>
                    </Box>
                  </Box>

                  {paymentDetails.payment?.lastPaidAt && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Último Pago:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(paymentDetails.payment.lastPaidAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Información Financiera */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CurrencyCircleDollar size={20} color="#032CA6" />
                    <Typography variant="h6" sx={{ ml: 1, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                      Resumen Financiero
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Subtotal:
                      </Typography>
                      <Typography variant="body2">
                        ${paymentDetails.financial?.subtotal?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Box>

                  {paymentDetails.financial?.deliveryFee > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Envío:
                        </Typography>
                        <Typography variant="body2">
                          ${paymentDetails.financial.deliveryFee.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {paymentDetails.financial?.tax > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Impuestos:
                        </Typography>
                        <Typography variant="body2">
                          ${paymentDetails.financial.tax.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Total:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ${paymentDetails.financial?.total?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="success.main">
                        Pagado:
                      </Typography>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                        ${paymentDetails.payment?.totalPaid?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="error.main">
                        Pendiente:
                      </Typography>
                      <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                        ${paymentDetails.payment?.balance?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Información de Entrega */}
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MapPin size={20} color="#032CA6" />
                    <Typography variant="h6" sx={{ ml: 1, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                      Información de Entrega
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Tipo de Entrega:
                      </Typography>
                      <Chip
                        label={paymentDetails.delivery?.type === 'delivery' ? 'Entrega a Domicilio' : 'Punto de Encuentro'}
                        color={paymentDetails.delivery?.type === 'delivery' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </Grid>

                    {paymentDetails.delivery?.address && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Dirección:
                        </Typography>
                        <Typography variant="body2">
                          {paymentDetails.delivery.address.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {paymentDetails.delivery.address.municipality}, {paymentDetails.delivery.address.department}
                        </Typography>
                      </Grid>
                    )}

                    {paymentDetails.delivery?.meetupDetails && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Detalles del Punto de Encuentro:
                        </Typography>
                        <Alert severity="info" sx={{ borderRadius: '8px' }}>
                          <Typography variant="body2">
                            <strong>Ubicación:</strong> {
                              typeof paymentDetails.delivery.meetupDetails.location === 'string' 
                                ? paymentDetails.delivery.meetupDetails.location
                                : paymentDetails.delivery.meetupDetails.location?.address || 'Ubicación no disponible'
                            }
                          </Typography>
                          {paymentDetails.delivery.meetupDetails.notes && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <strong>Notas:</strong> {paymentDetails.delivery.meetupDetails.notes}
                            </Typography>
                          )}
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            <Typography variant="body2">
              <strong>Funcionalidad de Detalles de Pago</strong><br/>
              Esta funcionalidad mostraría información detallada sobre el pago de la orden, incluyendo:
            </Typography>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>Estado del pago</li>
              <li>Método de pago utilizado</li>
              <li>Montos pagados y pendientes</li>
              <li>Información de entrega</li>
            </ul>
            <Typography variant="body2" sx={{ mt: 1 }}>
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
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
    </Portal>
  );
};

export default PaymentDetailsModal;
