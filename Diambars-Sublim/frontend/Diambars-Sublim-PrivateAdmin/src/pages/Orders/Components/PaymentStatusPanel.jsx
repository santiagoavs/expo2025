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
  // ✅ DEBUG: Log para ver qué datos está recibiendo
  console.log('🔍 [PaymentStatusPanel] Props recibidas:', {
    orderId,
    paymentStatus,
    compact
  });
  
  // ✅ DEBUG: Log detallado de la estructura de paymentStatus
  console.log('🔍 [PaymentStatusPanel] Estructura de paymentStatus:', {
    hasPayments: paymentStatus?.payments,
    paymentsLength: paymentStatus?.payments?.length,
    paymentKeys: paymentStatus ? Object.keys(paymentStatus) : 'null',
    fullPaymentStatus: paymentStatus
  });

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
      // ✅ VALIDACIÓN DE NEGOCIO: Verificar restricciones antes de procesar
      if (newPaymentData.method === 'cash' && !paymentStatus?.payment?.businessRules?.cashPaymentAllowed) {
        await Swal.fire({
          title: 'Pago en efectivo no permitido',
          text: 'Los pagos en efectivo solo se pueden procesar cuando la orden está "Listo para entrega", "En Camino" o "Entregado"',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      if (newPaymentData.method === 'bank_transfer' && !paymentStatus?.payment?.businessRules?.bankTransferAllowed) {
        await Swal.fire({
          title: 'Transferencia bancaria no permitida',
          text: 'Las transferencias bancarias solo se pueden procesar en estados iniciales o cuando esté "Listo para entrega"',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      if (newPaymentData.method === 'wompi' && !paymentStatus?.payment?.businessRules?.wompiPaymentAllowed) {
        await Swal.fire({
          title: 'Pago con tarjeta no permitido',
          text: 'Los pagos con tarjeta solo se pueden procesar en estados iniciales o cuando esté "Listo para entrega"',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
        return;
      }

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
    // ✅ DEBUG: Log para ver los datos de cada pago
    console.log('🔍 [PaymentStatusPanel] Renderizando pago:', {
      payment,
      canBeProcessed: payment.canBeProcessed,
      method: payment.method,
      status: payment.status
    });

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
              
              {/* ✅ NUEVA SECCIÓN: Restricciones de negocio */}
              {paymentStatus.payment?.statusInfo && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600, mb: 2 }}>
                    Restricciones de Pago por Estado
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '8px', 
                        backgroundColor: paymentStatus.payment.businessRules?.cashPaymentAllowed ? '#dcfce7' : '#fee2e2',
                        border: `1px solid ${paymentStatus.payment.businessRules?.cashPaymentAllowed ? '#22c55e' : '#ef4444'}`
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Money size={16} color={paymentStatus.payment.businessRules?.cashPaymentAllowed ? '#22c55e' : '#ef4444'} />
                          <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                            Efectivo
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {paymentStatus.payment.statusInfo.paymentMethodRestrictions.cash}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '8px', 
                        backgroundColor: paymentStatus.payment.businessRules?.bankTransferAllowed ? '#dcfce7' : '#fee2e2',
                        border: `1px solid ${paymentStatus.payment.businessRules?.bankTransferAllowed ? '#22c55e' : '#ef4444'}`
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Bank size={16} color={paymentStatus.payment.businessRules?.bankTransferAllowed ? '#22c55e' : '#ef4444'} />
                          <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                            Transferencia
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {paymentStatus.payment.statusInfo.paymentMethodRestrictions.bank_transfer}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '8px', 
                        backgroundColor: paymentStatus.payment.businessRules?.wompiPaymentAllowed ? '#dcfce7' : '#fee2e2',
                        border: `1px solid ${paymentStatus.payment.businessRules?.wompiPaymentAllowed ? '#22c55e' : '#ef4444'}`
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CreditCard size={16} color={paymentStatus.payment.businessRules?.wompiPaymentAllowed ? '#22c55e' : '#ef4444'} />
                          <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                            Tarjeta
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {paymentStatus.payment.statusInfo.paymentMethodRestrictions.wompi}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </ModernCard>
      )}

      {/* Lista de pagos */}
      {paymentStatus?.payments?.map((payment, index) => renderPayment(payment, index))}

      {/* Modal para procesar nuevo pago */}
      <Dialog 
        open={showProcessDialog} 
        onClose={() => setShowProcessDialog(false)} 
        maxWidth="sm" 
        fullWidth
        sx={{
          zIndex: 9994,
          '& .MuiDialog-paper': {
            zIndex: 9994
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
          Procesar Nuevo Pago
        </DialogTitle>
        <DialogContent>
          {/* ✅ ALERTAS DE RESTRICCIONES */}
          {paymentStatus?.payment?.statusInfo && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                <strong>Estado actual:</strong> {paymentStatus.payment.statusInfo.statusLabel}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'", mt: 1 }}>
                <strong>Restricciones:</strong> Solo se pueden procesar pagos según el estado de la orden
              </Typography>
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Método de pago</InputLabel>
                <Select
                  value={newPaymentData.method}
                  label="Método de pago"
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, method: e.target.value }))}
                >
                  <MenuItem 
                    value="cash" 
                    disabled={!paymentStatus?.payment?.businessRules?.cashPaymentAllowed}
                  >
                    Efectivo {!paymentStatus?.payment?.businessRules?.cashPaymentAllowed && '(No permitido)'}
                  </MenuItem>
                  <MenuItem 
                    value="bank_transfer" 
                    disabled={!paymentStatus?.payment?.businessRules?.bankTransferAllowed}
                  >
                    Transferencia {!paymentStatus?.payment?.businessRules?.bankTransferAllowed && '(No permitido)'}
                  </MenuItem>
                  <MenuItem 
                    value="wompi" 
                    disabled={!paymentStatus?.payment?.businessRules?.wompiPaymentAllowed}
                  >
                    Tarjeta (Wompi) {!paymentStatus?.payment?.businessRules?.wompiPaymentAllowed && '(No permitido)'}
                  </MenuItem>
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
      <Dialog 
        open={showConfirmDialog} 
        onClose={() => setShowConfirmDialog(false)} 
        maxWidth="sm" 
        fullWidth
        sx={{
          zIndex: 10000,
          '& .MuiDialog-paper': {
            zIndex: 10000
          }
        }}
      >
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

// ==================== FUNCIONES DE VALIDACIÓN DE PAGO ====================

// Función para obtener el mensaje de estado de pago con validaciones claras
export const getPaymentStatusMessage = (payment, orderStatus) => {
  if (!payment) return 'Sin información de pago';
  
  const statusMessages = {
    'pending': 'Pago pendiente',
    'processing': 'Procesando pago',
    'completed': 'Pago completado',
    'failed': 'Pago fallido',
    'cancelled': 'Pago cancelado',
    'refunded': 'Pago reembolsado'
  };
  
  const baseMessage = statusMessages[payment.status] || 'Estado desconocido';
  
  // ✅ AGREGAR INFORMACIÓN SOBRE RESTRICCIONES DE PAGO
  if (payment.status !== 'completed') {
    const restrictions = getPaymentRestrictions(payment.method, orderStatus);
    if (restrictions) {
      return `${baseMessage} - ${restrictions}`;
    }
  }
  
  return baseMessage;
};

// Función para obtener restricciones de pago por método
export const getPaymentRestrictions = (paymentMethod, orderStatus) => {
  const restrictions = {
    'cash': {
      'pending_approval': 'Se puede cambiar a cualquier estado',
      'approved': 'Se puede cambiar a cualquier estado',
      'quoted': 'Se puede cambiar a cualquier estado',
      'in_production': 'Se puede cambiar a cualquier estado',
      'quality_check': 'Se puede cambiar a cualquier estado',
      'packaging': 'Se puede cambiar a cualquier estado',
      'ready_for_delivery': 'Se puede cambiar a cualquier estado',
      'out_for_delivery': 'Se puede cambiar a cualquier estado',
      'delivered': 'Requiere pago confirmado para marcar como entregado'
    },
    'bank_transfer': {
      'pending_approval': 'Se puede cambiar a cualquier estado',
      'approved': 'Se puede cambiar a cualquier estado',
      'quoted': 'Se puede cambiar a cualquier estado',
      'in_production': 'Se puede cambiar a cualquier estado',
      'quality_check': 'Se puede cambiar a cualquier estado',
      'packaging': 'Se puede cambiar a cualquier estado',
      'ready_for_delivery': 'Se puede cambiar a cualquier estado',
      'out_for_delivery': 'Se puede cambiar a cualquier estado',
      'delivered': 'Requiere pago confirmado para marcar como entregado'
    },
    'wompi': {
      'pending_approval': 'Se puede cambiar a cualquier estado',
      'approved': 'Se puede cambiar a cualquier estado',
      'quoted': 'Se puede cambiar a cualquier estado',
      'in_production': 'Requiere pago completado para iniciar producción',
      'quality_check': 'Requiere pago completado para iniciar producción',
      'packaging': 'Requiere pago completado para iniciar producción',
      'ready_for_delivery': 'Se puede cambiar a cualquier estado',
      'out_for_delivery': 'Se puede cambiar a cualquier estado',
      'delivered': 'Se puede cambiar a cualquier estado'
    }
  };
  
  return restrictions[paymentMethod]?.[orderStatus] || null;
};

// Función para obtener información detallada sobre validaciones de pago
export const getPaymentValidationInfo = (paymentMethod, orderStatus) => {
  const validationInfo = {
    'cash': {
      title: 'Pago en Efectivo',
      description: 'Máxima flexibilidad - Solo requiere pago confirmado para entrega final',
      allowedStates: ['Cualquier estado'],
      restrictions: 'Solo para estado "Entregado"'
    },
    'bank_transfer': {
      title: 'Transferencia Bancaria',
      description: 'Flexibilidad media - Permite cambios sin pago completo',
      allowedStates: ['Cualquier estado'],
      restrictions: 'Solo para estado "Entregado"'
    },
    'wompi': {
      title: 'Pago con Tarjeta (Wompi)',
      description: 'Validación estricta - Requiere pago completo para producción',
      allowedStates: ['Estados de entrega'],
      restrictions: 'Para estados de producción (En Producción, Control de Calidad, Empaque)'
    }
  };
  
  return validationInfo[paymentMethod] || {
    title: 'Método de Pago',
    description: 'Validación básica',
    allowedStates: ['Estados permitidos'],
    restrictions: 'Según método de pago'
  };
};

export default PaymentStatusPanel;