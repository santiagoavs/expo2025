// src/components/Payments/AdminPaymentPanel.jsx - Panel administrativo mejorado para gestión de pagos
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
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  Badge
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
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Shield,
  Lock,
  User,
  Calendar,
  MapPin,
  Phone
} from '@phosphor-icons/react';

import { usePayments, usePendingTransfers } from '../../hooks/usePayments';
import Swal from 'sweetalert2';

// ================ ESTILOS ================
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)'
  }
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
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
    fontFamily: "'Mona Sans'",
    borderRadius: '12px'
  };
});

const ActionButton = styled(Button)(({ variant, theme }) => {
  const variants = {
    success: {
      backgroundColor: '#22c55e',
      color: 'white',
      '&:hover': { backgroundColor: '#16a34a' }
    },
    danger: {
      backgroundColor: '#ef4444',
      color: 'white',
      '&:hover': { backgroundColor: '#dc2626' }
    },
    warning: {
      backgroundColor: '#f59e0b',
      color: 'white',
      '&:hover': { backgroundColor: '#d97706' }
    },
    info: {
      backgroundColor: '#1F64BF',
      color: 'white',
      '&:hover': { backgroundColor: '#032CA6' }
    }
  };
  
  return {
    borderRadius: '12px',
    textTransform: 'none',
    fontFamily: "'Mona Sans'",
    fontWeight: 600,
    padding: '8px 16px',
    ...variants[variant] || {}
  };
});

// ================ COMPONENTE PRINCIPAL ================
const AdminPaymentPanel = ({ orderId, orderNumber, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [newPaymentData, setNewPaymentData] = useState({
    method: 'cash',
    amount: '',
    timing: 'on_delivery',
    notes: ''
  });
  const [confirmationData, setConfirmationData] = useState({
    receivedAmount: '',
    notes: '',
    isApproved: true
  });

  // Hooks
  const { processPayment, confirmPayment, loading: paymentLoading } = usePayments();
  const { approveTransfer, rejectTransfer } = usePendingTransfers();

  // Cargar datos de pagos
  const loadPaymentData = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      // Aquí implementarías la llamada a la API para obtener datos de pagos
      // const response = await apiClient.get(`/orders/${orderId}/payment-details`);
      // setPaymentData(response.data);
    } catch (error) {
      console.error('Error cargando datos de pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadPaymentData();
    }
  }, [orderId]);

  // Obtener icono por método de pago
  const getPaymentMethodIcon = (method) => {
    const icons = {
      wompi: CreditCard,
      cash: Money,
      bank_transfer: Bank
    };
    return icons[method] || Receipt;
  };

  // Formatear método de pago
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
      // Validaciones de negocio
      if (newPaymentData.method === 'cash' && !paymentData?.payment?.businessRules?.cashPaymentAllowed) {
        await Swal.fire({
          title: 'Pago en efectivo no permitido',
          text: 'Los pagos en efectivo solo se pueden procesar cuando la orden está "En Camino"',
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

  // Renderizar resumen de pagos
  const renderPaymentSummary = () => {
    if (!paymentData) return null;

    return (
      <ModernCard sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600, mb: 3 }}>
            Resumen de Pagos - Orden {orderNumber}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Total Orden</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F64BF', fontFamily: "'Mona Sans'" }}>
                  ${paymentData.financial?.total?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Total Pagado</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e', fontFamily: "'Mona Sans'" }}>
                  ${paymentData.payment?.totalPaid?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Saldo Pendiente</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b', fontFamily: "'Mona Sans'" }}>
                  ${paymentData.payment?.balance?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Progreso</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#6366f1', fontFamily: "'Mona Sans'" }}>
                  {paymentData.payment?.paymentProgress || 0}%
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Barra de progreso */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ 
              width: '100%', 
              height: 8, 
              backgroundColor: alpha('#1F64BF', 0.1), 
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                width: `${paymentData.payment?.paymentProgress || 0}%`, 
                height: '100%', 
                backgroundColor: '#22c55e',
                transition: 'width 0.3s ease'
              }} />
            </Box>
          </Box>
        </CardContent>
      </ModernCard>
    );
  };

  // Renderizar restricciones de negocio
  const renderBusinessRules = () => {
    if (!paymentData?.payment?.statusInfo) return null;

    return (
      <ModernCard sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600, mb: 2 }}>
            Restricciones de Pago por Estado
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '12px', 
                backgroundColor: paymentData.payment.businessRules?.cashPaymentAllowed ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${paymentData.payment.businessRules?.cashPaymentAllowed ? '#22c55e' : '#ef4444'}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Money size={20} color={paymentData.payment.businessRules?.cashPaymentAllowed ? '#22c55e' : '#ef4444'} />
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                    Efectivo
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {paymentData.payment.statusInfo.paymentMethodRestrictions.cash}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '12px', 
                backgroundColor: paymentData.payment.businessRules?.bankTransferAllowed ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${paymentData.payment.businessRules?.bankTransferAllowed ? '#22c55e' : '#ef4444'}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Bank size={20} color={paymentData.payment.businessRules?.bankTransferAllowed ? '#22c55e' : '#ef4444'} />
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                    Transferencia
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {paymentData.payment.statusInfo.paymentMethodRestrictions.bank_transfer}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '12px', 
                backgroundColor: paymentData.payment.businessRules?.wompiPaymentAllowed ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${paymentData.payment.businessRules?.wompiPaymentAllowed ? '#22c55e' : '#ef4444'}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CreditCard size={20} color={paymentData.payment.businessRules?.wompiPaymentAllowed ? '#22c55e' : '#ef4444'} />
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                    Tarjeta
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {paymentData.payment.statusInfo.paymentMethodRestrictions.wompi}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </ModernCard>
    );
  };

  // Renderizar información del admin
  const renderAdminInfo = () => {
    if (!paymentData?.adminInfo) return null;

    return (
      <ModernCard sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600, mb: 2 }}>
            Información Administrativa
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Estado actual:</Typography>
              <StatusChip 
                label={paymentData.payment?.statusInfo?.statusLabel || 'N/A'} 
                status={paymentData.payment?.status || 'pending'} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Puede cambiar estado:</Typography>
              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                {paymentData.adminInfo.canChangeStatus ? 'Sí' : 'No'}
              </Typography>
            </Grid>
            
            {paymentData.adminInfo.recommendedActions?.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Acciones recomendadas:
                </Typography>
                <List dense>
                  {paymentData.adminInfo.recommendedActions.map((action, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle size={16} color="#22c55e" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={action}
                        primaryTypographyProps={{ 
                          variant: 'body2', 
                          fontFamily: "'Mona Sans'" 
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </ModernCard>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
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
        <Typography variant="h5" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
          Panel de Gestión de Pagos
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small" 
            onClick={loadPaymentData}
            sx={{ color: '#1F64BF' }}
          >
            <ArrowsClockwise size={16} />
          </IconButton>
          <ActionButton
            size="small"
            onClick={() => setShowProcessDialog(true)}
            startIcon={<Plus size={14} />}
            variant="info"
          >
            Nuevo Pago
          </ActionButton>
        </Box>
      </Box>

      {/* Resumen de pagos */}
      {renderPaymentSummary()}

      {/* Restricciones de negocio */}
      {renderBusinessRules()}

      {/* Información administrativa */}
      {renderAdminInfo()}

      {/* Modales */}
      {/* Modal para procesar nuevo pago */}
      <Dialog open={showProcessDialog} onClose={() => setShowProcessDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
          Procesar Nuevo Pago
        </DialogTitle>
        <DialogContent>
          {paymentData?.payment?.statusInfo && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                <strong>Estado actual:</strong> {paymentData.payment.statusInfo.statusLabel}
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
                    disabled={!paymentData?.payment?.businessRules?.cashPaymentAllowed}
                  >
                    Efectivo {!paymentData?.payment?.businessRules?.cashPaymentAllowed && '(No permitido)'}
                  </MenuItem>
                  <MenuItem 
                    value="bank_transfer" 
                    disabled={!paymentData?.payment?.businessRules?.bankTransferAllowed}
                  >
                    Transferencia {!paymentData?.payment?.businessRules?.bankTransferAllowed && '(No permitido)'}
                  </MenuItem>
                  <MenuItem 
                    value="wompi" 
                    disabled={!paymentData?.payment?.businessRules?.wompiPaymentAllowed}
                  >
                    Tarjeta (Wompi) {!paymentData?.payment?.businessRules?.wompiPaymentAllowed && '(No permitido)'}
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
            variant="success"
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

export default AdminPaymentPanel;
