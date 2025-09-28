// src/components/Payments/PaymentStatusPanel.jsx - Panel para gestión de estados de pago
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  styled,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Receipt,
  CreditCard,
  Bank,
  Money,
  Check,
  X,
  Warning,
  Clock,
  Upload,
  Download,
  CaretDown,
  ArrowsClockwise,
  Plus
} from '@phosphor-icons/react';

import { usePayments, usePendingTransfers } from '../../../hooks/usePayments';
import Swal from 'sweetalert2';

// ================ ESTILOS ================
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s ease'
}));

const PaymentStatusChip = styled(Chip)(({ status }) => {
  const getStatusStyles = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
      processing: { bg: '#e0e7ff', color: '#3730a3', border: '#6366f1' },
      completed: { bg: '#dcfce7', color: '#166534', border: '#22c55e' },
      failed: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
      cancelled: { bg: '#f3f4f6', color: '#374151', border: '#6b7280' }
    };
    return styles[status] || styles.pending;
  };

  const statusStyles = getStatusStyles(status);
  
  return {
    backgroundColor: statusStyles.bg,
    color: statusStyles.color,
    border: `1px solid ${statusStyles.border}`,
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: "'Mona Sans'"
  };
});

const ActionButton = styled(Button)(({ theme, variant }) => {
  if (variant === 'success') {
    return {
      backgroundColor: '#22c55e',
      color: 'white',
      borderRadius: '8px',
      textTransform: 'none',
      fontFamily: "'Mona Sans'",
      fontWeight: 600,
      '&:hover': {
        backgroundColor: '#16a34a'
      }
    };
  }
  
  if (variant === 'danger') {
    return {
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '8px',
      textTransform: 'none',
      fontFamily: "'Mona Sans'",
      fontWeight: 600,
      '&:hover': {
        backgroundColor: '#dc2626'
      }
    };
  }
  
  return {
    borderRadius: '8px',
    textTransform: 'none',
    fontFamily: "'Mona Sans'",
    fontWeight: 600
  };
});

// ================ COMPONENTE PRINCIPAL ================
const PaymentStatusPanel = ({ orderId, paymentStatus, onRefresh, compact = true }) => {
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [confirmationData, setConfirmationData] = useState({
    receivedAmount: '',
    notes: '',
    isApproved: true
  });
  const [newPaymentData, setNewPaymentData] = useState({
    method: 'cash',
    amount: '',
    timing: 'on_delivery',
    notes: ''
  });

  // Hooks
  const { processPayment, confirmPayment, loading: paymentLoading } = usePayments();
  const { approveTransfer, rejectTransfer } = usePendingTransfers();

  // Obtener icono por método de pago
  const getPaymentMethodIcon = (method) => {
    const icons = {
      wompi: CreditCard,
      cash: Money,
      bank_transfer: Bank
    };
    return icons[method] || Receipt;
  };

  // Formatear método de pago para display
  const formatPaymentMethod = (method) => {
    const labels = {
      wompi: 'Tarjeta/Wompi',
      cash: 'Efectivo',
      bank_transfer: 'Transferencia'
    };
    return labels[method] || method;
  };

  // Manejar procesamiento de nuevo pago
  const handleProcessPayment = async () => {
    try {
      await processPayment(orderId, newPaymentData);
      setShowProcessDialog(false);
      setNewPaymentData({
        method: 'cash',
        amount: '',
        timing: 'on_delivery',
        notes: ''
      });
      onRefresh?.();
    } catch (error) {
      console.error('Error procesando pago:', error);
    }
  };

  // Manejar confirmación de pago
  const handleConfirmPayment = async () => {
    try {
      await confirmPayment(selectedPayment._id, confirmationData);
      setShowConfirmDialog(false);
      setSelectedPayment(null);
      setConfirmationData({
        receivedAmount: '',
        notes: '',
        isApproved: true
      });
      onRefresh?.();
    } catch (error) {
      console.error('Error confirmando pago:', error);
    }
  };

  // Manejar aprobación de transferencia
  const handleApproveTransfer = async (paymentId) => {
    try {
      await approveTransfer(paymentId, {
        isApproved: true,
        verificationNotes: 'Transferencia verificada y aprobada'
      });
      onRefresh?.();
    } catch (error) {
      console.error('Error aprobando transferencia:', error);
    }
  };

  // Manejar rechazo de transferencia
  const handleRejectTransfer = async (paymentId) => {
    const { value: reason } = await Swal.fire({
      title: 'Motivo del rechazo',
      input: 'textarea',
      inputPlaceholder: 'Explica por qué se rechaza la transferencia...',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar'
    });

    if (reason) {
      try {
        await rejectTransfer(paymentId, reason);
        onRefresh?.();
      } catch (error) {
        console.error('Error rechazando transferencia:', error);
      }
    }
  };

  // Renderizar pago individual
  const renderPayment = (payment, index) => {
    const PaymentIcon = getPaymentMethodIcon(payment.method);
    
    return (
      <ModernCard key={payment._id || index} sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs="auto">
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '8px', 
                backgroundColor: alpha('#1F64BF', 0.1),
                color: '#1F64BF'
              }}>
                <PaymentIcon size={20} />
              </Box>
            </Grid>
            
            <Grid item xs>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                {formatPaymentMethod(payment.method)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {payment.formattedAmount} • {payment.timing === 'advance' ? 'Adelantado' : 'Contra entrega'}
              </Typography>
              {payment.percentage < 100 && (
                <Typography variant="body2" color="text.secondary">
                  Pago parcial: {payment.percentage}%
                </Typography>
              )}
            </Grid>
            
            <Grid item xs="auto">
              <PaymentStatusChip 
                label={payment.statusLabel}
                status={payment.status}
                size="small"
              />
            </Grid>
            
            <Grid item xs="auto">
              <Box sx={{ display: 'flex', gap: 1 }}>
                {payment.canBeProcessed && payment.method === 'cash' && (
                  <ActionButton
                    size="small"
                    variant="success"
                    startIcon={<Check size={14} />}
                    onClick={() => {
                      setSelectedPayment(payment);
                      setConfirmationData({
                        ...confirmationData,
                        receivedAmount: payment.amount
                      });
                      setShowConfirmDialog(true);
                    }}
                  >
                    Confirmar
                  </ActionButton>
                )}
                
                {payment.canBeProcessed && payment.method === 'bank_transfer' && (
                  <>
                    <ActionButton
                      size="small"
                      variant="success"
                      startIcon={<Check size={14} />}
                      onClick={() => handleApproveTransfer(payment._id)}
                    >
                      Aprobar
                    </ActionButton>
                    <ActionButton
                      size="small"
                      variant="danger"
                      startIcon={<X size={14} />}
                      onClick={() => handleRejectTransfer(payment._id)}
                    >
                      Rechazar
                    </ActionButton>
                  </>
                )}
                
                {payment.method === 'wompi' && payment.paymentUrl && (
                  <ActionButton
                    size="small"
                    variant="outlined"
                    startIcon={<CreditCard size={14} />}
                    onClick={() => window.open(payment.paymentUrl, '_blank')}
                  >
                    Ver Link
                  </ActionButton>
                )}
              </Box>
            </Grid>
          </Grid>
          
          {/* Detalles adicionales */}
          {payment.notes && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: alpha('#1F64BF', 0.05), borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", fontStyle: 'italic' }}>
                "{payment.notes}"
              </Typography>
            </Box>
          )}

          {/* Información específica por método */}
          {payment.method === 'bank_transfer' && payment.transferDetails && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<CaretDown />}>
                <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                  Detalles de la transferencia
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Banco:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                      {payment.transferDetails.bankName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Referencia:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                      {payment.transferDetails.referenceNumber || 'N/A'}
                    </Typography>
                  </Grid>
                  {payment.transferDetails.proofUrl && (
                    <Grid item xs={12}>
                      <ActionButton
                        size="small"
                        startIcon={<Download size={14} />}
                        onClick={() => window.open(payment.transferDetails.proofUrl, '_blank')}
                      >
                        Ver comprobante
                      </ActionButton>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {payment.method === 'wompi' && payment.wompiDetails && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {payment.wompiDetails.transactionId && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">ID Transacción:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                      {payment.wompiDetails.transactionId}
                    </Typography>
                  </Grid>
                )}
                {payment.wompiDetails.cardInfo && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Tarjeta:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                      **** {payment.wompiDetails.cardInfo.lastFour} ({payment.wompiDetails.cardInfo.brand})
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </CardContent>
      </ModernCard>
    );
  };

  // Si no hay información de pagos
  if (!paymentStatus && !compact) {
    return (
      <ModernCard>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Receipt size={48} color="#6b7280" />
          <Typography variant="h6" sx={{ mt: 2, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
            No hay información de pagos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Aún no se han procesado pagos para esta orden
          </Typography>
          <ActionButton
            onClick={() => setShowProcessDialog(true)}
            startIcon={<Plus size={16} />}
          >
            Procesar Pago
          </ActionButton>
        </CardContent>
      </ModernCard>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
          Estado de Pagos
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small" 
            onClick={onRefresh}
            sx={{ color: '#1F64BF' }}
          >
            <ArrowsClockwise size={16} />
          </IconButton>
          <ActionButton
            size="small"
            onClick={() => setShowProcessDialog(true)}
            startIcon={<Plus size={14} />}
          >
            Nuevo Pago
          </ActionButton>
        </Box>
      </Box>

      {/* Resumen general */}
      {paymentStatus && (
        <ModernCard sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Total de la orden:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F64BF', fontFamily: "'Mona Sans'" }}>
                  ${paymentStatus.orderTotal?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Total pagado:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e', fontFamily: "'Mona Sans'" }}>
                  ${paymentStatus.totalPaid?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
              {paymentStatus.remainingAmount > 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ borderRadius: '8px' }}>
                    Faltan ${paymentStatus.remainingAmount.toFixed(2)} por pagar
                  </Alert>
                </Grid>
              )}
              {paymentStatus.isFullyPaid && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ borderRadius: '8px' }}>
                    Orden completamente pagada
                  </Alert>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </ModernCard>
      )}

      {/* Lista de pagos */}
      {paymentStatus?.payments?.map((payment, index) => renderPayment(payment, index))}

      {/* Modal para procesar nuevo pago */}
      <Dialog open={showProcessDialog} onClose={() => setShowProcessDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
          Procesar Nuevo Pago
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Método de pago</InputLabel>
                <Select
                  value={newPaymentData.method}
                  label="Método de pago"
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, method: e.target.value }))}
                >
                  <MenuItem value="cash">Efectivo</MenuItem>
                  <MenuItem value="bank_transfer">Transferencia</MenuItem>
                  <MenuItem value="wompi">Tarjeta (Wompi)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Timing</InputLabel>
                <Select
                  value={newPaymentData.timing}
                  label="Timing"
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, timing: e.target.value }))}
                >
                  <MenuItem value="on_delivery">Contra entrega</MenuItem>
                  <MenuItem value="advance">Adelantado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Monto (opcional)"
                type="number"
                value={newPaymentData.amount}
                onChange={(e) => setNewPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                helperText="Dejar vacío para usar el total de la orden"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas adicionales"
                multiline
                rows={3}
                value={newPaymentData.notes}
                onChange={(e) => setNewPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Instrucciones especiales o comentarios..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProcessDialog(false)}>
            Cancelar
          </Button>
          <ActionButton
            onClick={handleProcessPayment}
            disabled={paymentLoading}
            startIcon={paymentLoading ? <CircularProgress size={16} /> : <Check size={16} />}
          >
            {paymentLoading ? 'Procesando...' : 'Procesar Pago'}
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* Modal para confirmar pago en efectivo */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
          Confirmar Pago en Efectivo
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Monto recibido"
                type="number"
                value={confirmationData.receivedAmount}
                onChange={(e) => setConfirmationData(prev => ({ 
                  ...prev, 
                  receivedAmount: e.target.value 
                }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas de confirmación"
                multiline
                rows={3}
                value={confirmationData.notes}
                onChange={(e) => setConfirmationData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Detalles del pago, cambio entregado, etc..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancelar
          </Button>
          <ActionButton
            onClick={handleConfirmPayment}
            disabled={paymentLoading || !confirmationData.receivedAmount}
            variant="success"
            startIcon={paymentLoading ? <CircularProgress size={16} /> : <Check size={16} />}
          >
            {paymentLoading ? 'Confirmando...' : 'Confirmar Pago'}
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentStatusPanel;