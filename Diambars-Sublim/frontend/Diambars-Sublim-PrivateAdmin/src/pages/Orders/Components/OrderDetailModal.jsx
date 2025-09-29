// src/components/Orders/OrderDetailsModal.jsx - Modal completo para detalles de órdenes
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  styled,
  alpha,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Portal,
  Fade,
  Slide,
  Tooltip
} from '@mui/material';
import {
  X,
  Package,
  User,
  MapPin,
  Truck,
  Receipt,
  Clock,
  CheckCircle,
  Warning,
  CreditCard,
  Bank,
  Money,
  Eye,
  PencilSimple,
  Camera,
  ChartLineUp,
  CurrencyCircleDollar,
  CaretUp,
  CaretDown,
  ArrowClockwise,
  Phone
} from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import apiClient from '../../../api/ApiClient';

// Configurar SweetAlert2 con z-index alto
const swalConfig = {
  customClass: {
    popup: 'swal-highest-z-index'
  }
};

// import { useOrderPaymentStatus } from '../../../hooks/usePayments';
import PaymentStatusPanel, { getPaymentStatusMessage, getPaymentRestrictions, getPaymentValidationInfo } from './PaymentStatusPanel';
import PaymentDetailsModal from '../../../components/OrderDetails/PaymentDetailsModal';
import OrderTimelineModal from '../../../components/OrderDetails/OrderTimelineModal';
import ProductionPhotoUpload from '../../../components/OrderDetails/ProductionPhotoUpload';
import QualityControlPanel from '../../../components/QualityControl/QualityControlPanel';

// ================ ESTILOS MODERNOS ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    boxShadow: `
      0 32px 80px rgba(1, 3, 38, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: '1px solid rgba(99, 102, 241, 0.1)',
    maxWidth: '1000px',
    width: '95%',
    height: '90vh',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column'
  }
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px 32px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  fontFamily: "'Mona Sans'",
  fontWeight: 700,
  fontSize: '1.5rem',
  color: '#010326'
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha('#6366f1', 0.1)}`,
  boxShadow: `
    0 8px 32px rgba(99, 102, 241, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
  backdropFilter: 'blur(10px)',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    boxShadow: `
      0 12px 40px rgba(99, 102, 241, 0.12),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2)
    `,
    border: `1px solid ${alpha('#6366f1', 0.2)}`
  }
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const getStatusStyles = (status) => {
    const styles = {
      pending_approval: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
      quoted: { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' },
      approved: { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
      in_production: { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' },
      quality_check: { bg: '#fed7aa', color: '#9a3412', border: '#f97316' },
      quality_approved: { bg: '#ecfccb', color: '#365314', border: '#84cc16' },
      packaging: { bg: '#f3e8ff', color: '#581c87', border: '#a855f7' },
      ready_for_delivery: { bg: '#e9d5ff', color: '#7c2d12', border: '#8b5cf6' },
      out_for_delivery: { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' },
      delivered: { bg: '#dcfce7', color: '#166534', border: '#22c55e' },
      completed: { bg: '#d1fae5', color: '#064e3b', border: '#059669' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
      on_hold: { bg: '#f3f4f6', color: '#374151', border: '#6b7280' },
      returned: { bg: '#fef2f2', color: '#dc2626', border: '#ef4444' },
      refunded: { bg: '#f0fdf4', color: '#166534', border: '#22c55e' }
    };
    return styles[status] || styles.on_hold;
  };

  const statusStyles = getStatusStyles(status);

  return {
    backgroundColor: statusStyles.bg,
    color: statusStyles.color,
    border: `1px solid ${statusStyles.border}`,
    fontSize: '0.875rem',
    fontWeight: 600,
    height: '28px',
    fontFamily: "'Mona Sans'"
  };
});

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.05)}`,
  '&:last-child': {
    borderBottom: 'none'
  }
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontFamily: "'Mona Sans'",
  fontWeight: 500,
  color: '#6b7280',
  fontSize: '0.9rem'
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontFamily: "'Mona Sans'",
  fontWeight: 600,
  color: '#010326',
  fontSize: '0.9rem'
}));

// ================ COMPONENTE PRINCIPAL ================
const OrderDetailsModal = ({ open, onClose, order, onStatusChange }) => {
  // Si no hay orden, no renderizar el modal
  if (!order) {
    return null;
  }

  // Si el modal no está abierto, no renderizar
  if (!open) {
    return null;
  }

  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Estados para modales
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [showQualityControl, setShowQualityControl] = useState(false);

  // Hook para estado de pagos (temporalmente deshabilitado)
  // const {
  //   paymentStatus,
  //   loading: paymentLoading,
  //   refetch: refetchPayments
  // } = useOrderPaymentStatus(order?._id);
  
  // Valores temporales mientras implementamos correctamente
  const paymentStatus = null;
  const paymentLoading = false;
  const refetchPayments = () => {};


  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener icono por estado
  const getStatusIcon = (status) => {
    const icons = {
      pending_approval: Clock,
      quoted: Receipt,
      approved: CheckCircle,
      in_production: Package,
      ready_for_delivery: Truck,
      delivered: CheckCircle,
      cancelled: X,
      on_hold: Warning
    };
    return icons[status] || Clock;
  };

  // Estados disponibles para cambio
  const availableStatuses = [
    { value: 'pending_approval', label: 'Pendiente de Aprobación', icon: Clock },
    { value: 'quoted', label: 'Cotizado', icon: Receipt },
    { value: 'approved', label: 'Aprobado', icon: CheckCircle },
    { value: 'in_production', label: 'En Producción', icon: Package },
    { value: 'quality_check', label: 'Control de Calidad', icon: Warning },
    { value: 'quality_approved', label: 'Calidad Aprobada', icon: CheckCircle },
    { value: 'packaging', label: 'Empacando', icon: Package },
    { value: 'ready_for_delivery', label: 'Listo para Entrega', icon: Truck },
    { value: 'out_for_delivery', label: 'En Camino', icon: Truck },
    { value: 'delivered', label: 'Entregado', icon: CheckCircle },
    { value: 'completed', label: 'Completado', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelado', icon: X },
    { value: 'on_hold', label: 'En Espera', icon: Warning },
    { value: 'returned', label: 'Devolución', icon: X },
    { value: 'refunded', label: 'Reembolsado', icon: CheckCircle }
  ];

  // Función auxiliar para obtener el teléfono (compatible con órdenes existentes y nuevas)
  const getUserPhone = () => {
    // Usar orderDetails si está disponible (datos del backend), sino usar order (datos de la lista)
    const currentOrder = orderDetails || order;
    const currentUser = currentOrder?.user;
    
    const phoneNumber = currentUser?.phoneNumber;
    const phone = currentUser?.phone;
    const result = phoneNumber || phone || null;
    
    return result;
  };

  // Solo se puede subir fotos en control de calidad
  const canUploadPhotos = order?.status === 'quality_check';

  // Verificar si tiene teléfono para WhatsApp
  const hasPhoneNumber = getUserPhone() && getUserPhone().trim() !== '';


  // Cargar detalles completos de la orden cuando se abra el modal
  useEffect(() => {
    if (open && order && order._id) {
      setLoading(true);
      
      // Hacer consulta al backend para obtener detalles completos
      fetch(`http://localhost:4000/api/orders/${order._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setOrderDetails(data.data);
        }
      })
      .catch(error => {
        console.error('Error cargando detalles de la orden:', error);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [open, order]);

  // Función helper para SweetAlert2 con configuración robusta
  const showSwalAlert = async (config) => {
    // Forzar renderizado fuera del contexto del MUI Dialog
    const swalConfig = {
      ...config,
      customClass: 'swal-highest-z-index',
      allowOutsideClick: true,
      allowEscapeKey: true,
      focusConfirm: false,
      didOpen: () => {
        // Forzar z-index después de abrir
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.style.zIndex = '1000000';
          // Mover al body si está dentro del modal
          if (swalContainer.parentElement !== document.body) {
            document.body.appendChild(swalContainer);
          }
        }
      }
    };
    
    return await Swal.fire(swalConfig);
  };

  // Manejar cambio de estado
  const handleStatusChange = async () => {
    if (!newStatus || newStatus === order?.status) return;
    
    // ✅ OBTENER INFORMACIÓN DE VALIDACIÓN DE PAGO
    const paymentMethod = order?.payment?.method;
    const paymentStatus = order?.payment?.status;
    const validationInfo = getPaymentValidationInfo(paymentMethod, order?.status);
    const restrictions = getPaymentRestrictions(paymentMethod, newStatus);
    
    // Mostrar confirmación con SweetAlert2
    const result = await showSwalAlert({
      title: '¿Confirmar cambio de estado?',
      html: `
        <div style="text-align: left;">
          <p><strong>Estado actual:</strong> ${availableStatuses.find(s => s.value === order?.status)?.label || order?.status}</p>
          <p><strong>Nuevo estado:</strong> ${availableStatuses.find(s => s.value === newStatus)?.label || newStatus}</p>
          
          ${paymentMethod ? `
            <div style="margin: 15px 0; padding: 10px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-weight: 600; color: #1e40af;">💳 Información de Pago</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Método:</strong> ${validationInfo.title}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Estado:</strong> ${getPaymentStatusMessage(order?.payment, order?.status)}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #059669;"><strong>Descripción:</strong> ${validationInfo.description}</p>
              ${restrictions ? `<p style="margin: 5px 0; font-size: 14px; color: #dc2626;"><strong>Restricción:</strong> ${restrictions}</p>` : ''}
            </div>
          ` : ''}
          
          <p style="color: #f59e0b; font-weight: 600;">⚠️ Esta acción no se puede deshacer</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cambiar estado',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    setStatusChangeLoading(true);
    try {
      console.log('🔄 Cambiando estado de orden:', order._id);
      console.log('🔄 Nuevo estado:', newStatus);
      console.log('🔄 URL:', `/orders/${order._id}/status`);
      
      // Llamada al API para cambiar el estado
      const response = await apiClient.put(`/orders/${order._id}/status`, {
        newStatus,
        reason: `Cambio de estado por administrador`
      });
      
      if (response.success) {
        // Llamar callback del padre para actualizar la UI
        onStatusChange?.(order?._id, newStatus);
        
        setShowStatusChange(false);
        setNewStatus('');
        
        // Mostrar mensaje de éxito con SweetAlert2
        await showSwalAlert({
          title: '¡Estado cambiado!',
          text: `El estado se cambió exitosamente a ${availableStatuses.find(s => s.value === newStatus)?.label || newStatus}`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      
      // Mostrar error con SweetAlert2
      await showSwalAlert({
        title: 'Error',
        text: error.message || 'Error cambiando estado',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Configurar SweetAlert2 globalmente con z-index alto
  useEffect(() => {
    // Configurar SweetAlert2 globalmente
    Swal.mixin({
      customClass: {
        popup: 'swal-highest-z-index'
      }
    });
    
    // Agregar CSS global para SweetAlert2
    const style = document.createElement('style');
    style.textContent = `
      .swal2-container {
        z-index: 1000000 !important;
      }
      .swal-highest-z-index {
        z-index: 1000000 !important;
      }
      .swal2-backdrop {
        z-index: 999999 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Forzar z-index del dropdown
  useEffect(() => {
    if (showStatusChange) {
      const style = document.createElement('style');
      style.textContent = `
        .MuiPopover-root {
          z-index: 99999 !important;
        }
        .MuiMenu-root {
          z-index: 99999 !important;
        }
        .MuiSelect-select {
          z-index: 99999 !important;
        }
        [role="presentation"] {
          z-index: 99999 !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [showStatusChange]);

  // Timeline de estados
  const renderTimeline = () => {
    if (!order?.statusHistory) return null;

    return (
      <Box sx={{ pl: 2 }}>
        {order.statusHistory.map((entry, index) => {
          const StatusIcon = getStatusIcon(entry.status);
          const isLast = index === order.statusHistory.length - 1;
          
          return (
            <Box key={index} sx={{ display: 'flex', mb: 3 }}>
              {/* Línea vertical y círculo */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: isLast ? '#1F64BF' : alpha('#1F64BF', 0.3),
                    color: isLast ? 'white' : '#1F64BF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <StatusIcon size={16} />
                </Box>
                {!isLast && (
                  <Box
                    sx={{
                      width: 2,
                      height: 40,
                      backgroundColor: alpha('#1F64BF', 0.2),
                      mt: 1
                    }}
                  />
                )}
              </Box>
              
              {/* Contenido */}
              <Box sx={{ flex: 1, pt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                  {entry.statusLabel || entry.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(entry.timestamp)}
                </Typography>
                {entry.notes && (
                  <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                    {entry.notes}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Renderizar información de la orden (contenido por defecto)
  const renderOrderInformation = () => {
    return (
      <Grid container spacing={1} sx={{ height: '100%', width: '100%' }}>
        {/* Columna 1: Detalles del Pedido - 2 columnas */}
        <Grid item xs={12} lg={6}>
          <ModernCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1.5, fontFamily: "'Mona Sans'", fontWeight: 600, fontSize: '1rem' }}>
                Detalles del Pedido
              </Typography>
              
              <InfoRow>
                <InfoLabel>Número de orden:</InfoLabel>
                <InfoValue>#{order?.orderNumber}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Estado actual:</InfoLabel>
                <StatusChip 
                  label={order?.statusLabel}
                  status={order?.status}
                  size="small"
                />
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Fecha de creación:</InfoLabel>
                <InfoValue>{formatDate(order?.createdAt)}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Total:</InfoLabel>
                <InfoValue sx={{ color: '#1F64BF', fontWeight: 700 }}>
                  {order?.formattedTotal}
                </InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Cantidad:</InfoLabel>
                <InfoValue>{order?.quantity} unidad(es)</InfoValue>
              </InfoRow>
              
              {order?.isManualOrder && (
                <InfoRow>
                  <InfoLabel>Tipo:</InfoLabel>
                  <Chip 
                    label="Pedido Manual" 
                    color="secondary" 
                    size="small"
                    variant="outlined"
                  />
                </InfoRow>
              )}
            </CardContent>
          </ModernCard>
        </Grid>

        {/* Columna 2: Información del Cliente */}
        <Grid item xs={12} md={3}>
          <ModernCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', m: 0, borderRadius: 0 }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                <User size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Información del Cliente
              </Typography>
              
              <InfoRow>
                <InfoLabel>Nombre:</InfoLabel>
                <InfoValue>{order?.user?.name || 'N/A'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Email:</InfoLabel>
                <InfoValue>{order?.user?.email || 'N/A'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Teléfono:</InfoLabel>
                <InfoValue>{getUserPhone() || 'N/A'}</InfoValue>
              </InfoRow>
              
              {order?.user?.totalOrders && (
                <InfoRow>
                  <InfoLabel>Total de pedidos:</InfoLabel>
                  <InfoValue>{order.user.totalOrders}</InfoValue>
                </InfoRow>
              )}
            </CardContent>
          </ModernCard>
        </Grid>

        {/* Columna 3: Información de Entrega */}
        <Grid item xs={12} md={3}>
          <ModernCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', m: 0, borderRadius: 0 }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                <Truck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Información de Entrega
              </Typography>
              
              <InfoRow>
                <InfoLabel>Tipo de entrega:</InfoLabel>
                <InfoValue>{order?.deliveryLabel}</InfoValue>
              </InfoRow>
              
              {order?.deliveryType === 'delivery' && order?.deliveryAddress && (
                <InfoRow>
                  <InfoLabel>Dirección:</InfoLabel>
                  <InfoValue>
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    {order.deliveryAddress.phone && ` • Tel: ${order.deliveryAddress.phone}`}
                  </InfoValue>
                </InfoRow>
              )}
            </CardContent>
          </ModernCard>
        </Grid>

        {/* Columna 4: Productos del Pedido */}
        <Grid item xs={12} md={3}>
          <ModernCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', m: 0, borderRadius: 0 }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                <Package size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Productos del Pedido
              </Typography>
              
              {order?.items?.map((item, index) => (
                <Box key={index} sx={{ 
                  p: 2, 
                  border: `1px solid ${alpha('#1F64BF', 0.1)}`, 
                  borderRadius: '8px',
                  mb: index < order.items.length - 1 ? 2 : 0
                }}>
                  <Grid container spacing={2} alignItems="center">
                    {item.product?.images?.[0] && (
                      <Grid item xs="auto">
                        <Box
                          component="img"
                          src={item.product.images[0]}
                          alt={item.product.name}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      </Grid>
                    )}
                    <Grid item xs>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                        {item.product?.name || 'Producto personalizado'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cantidad: {item.quantity} • Precio: ${item.price || 0}
                      </Typography>
                      {item.design && (
                        <Typography variant="body2" color="text.secondary">
                          Diseño: {item.design.name}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </ModernCard>
        </Grid>

        {/* Notas */}
        {order?.clientNotes && (
          <Grid item xs={12}>
            <ModernCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                  Notas del Cliente
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontFamily: "'Mona Sans'",
                  p: 2,
                  backgroundColor: alpha('#1F64BF', 0.05),
                  borderRadius: '8px',
                  fontStyle: 'italic'
                }}>
                  "{order.clientNotes}"
                </Typography>
              </CardContent>
            </ModernCard>
          </Grid>
        )}
      </Grid>
    );
  };

  if (!order) return null;

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitleStyled>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Package size={24} color="#1F64BF" />
          <Box>
            <Typography variant="h5" component="div" sx={{ fontFamily: "'Mona Sans'", fontWeight: 700 }}>
              Orden #{order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(order.createdAt)}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#032CA6' }}>
          <X size={24} />
        </IconButton>
      </DialogTitleStyled>

      <DialogContent sx={{ 
        p: 0, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}>
        {/* Contenido principal - Información de la orden por defecto */}

        {/* Botones de Acciones Rápidas - ARRIBA */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}` }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontFamily: "'Mona Sans'", fontWeight: 600, color: '#032CA6' }}>
            🚀 Acciones Rápidas
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              onClick={() => {
                console.log('🔍 [OrderDetailModal] Abriendo detalles de pago para orden:', order?._id);
                setShowPaymentDetails(true);
              }}
              variant="contained"
              size="small"
              startIcon={<CurrencyCircleDollar size={16} />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontFamily: "'Mona Sans'",
                fontWeight: 600,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'background 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                },
                '&:active': {
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Ver Pagos
            </Button>

            <Button
              onClick={() => {
                console.log('📅 [OrderDetailModal] Abriendo timeline para orden:', order?._id);
                setShowTimeline(true);
              }}
              variant="contained"
              size="small"
              startIcon={<ChartLineUp size={16} />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontFamily: "'Mona Sans'",
                fontWeight: 600,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'background 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                },
                '&:active': {
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Timeline
            </Button>

            {/* Botón de Control de Calidad */}
            <Button
              onClick={() => {
                console.log('🔍 [OrderDetailModal] Abriendo panel de control de calidad para orden:', order?._id);
                setShowQualityControl(true);
              }}
              variant="contained"
              size="small"
              startIcon={<CheckCircle size={16} />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontFamily: "'Mona Sans'",
                fontWeight: 600,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'background 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                },
                '&:active': {
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Control de Calidad
            </Button>

            {/* Botón de Cambio de Estado */}
            <Button
              onClick={() => setShowStatusChange(true)}
              variant="outlined"
              size="small"
              startIcon={<ArrowClockwise size={16} />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontFamily: "'Mona Sans'",
                fontWeight: 600,
                borderColor: '#6366f1',
                color: '#6366f1',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.1) 100%)',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transition: 'background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  borderColor: '#4f46e5',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.15) 100%)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                },
                '&:active': {
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Cambiar Estado
            </Button>

            {/* Botón de Subir Foto - Solo si está en etapa válida */}
            {canUploadPhotos && (
              <Tooltip 
                title={!hasPhoneNumber ? "Se necesita número de teléfono para enviar por WhatsApp" : ""}
                placement="top"
              >
                <span>
                  <Button
                    onClick={() => {
                      console.log('📸 [OrderDetailModal] Abriendo subida de foto para orden:', order?._id);
                      setShowPhotoUpload(true);
                    }}
                    variant="contained"
                    size="small"
                    startIcon={<Camera size={16} />}
                    disabled={!canUploadPhotos}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontFamily: "'Mona Sans'",
                      fontWeight: 600,
                      background: hasPhoneNumber 
                        ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                        : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                      boxShadow: hasPhoneNumber 
                        ? '0 4px 16px rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : '0 4px 16px rgba(156, 163, 175, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'background 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        background: hasPhoneNumber 
                          ? 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)'
                          : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                        boxShadow: hasPhoneNumber 
                          ? '0 6px 20px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                          : '0 4px 16px rgba(156, 163, 175, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      },
                      '&:active': {
                        boxShadow: hasPhoneNumber 
                          ? '0 2px 8px rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          : '0 2px 8px rgba(156, 163, 175, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    📸 Subir Foto
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Contenido principal - Información de la orden */}
        <Box sx={{ 
          p: 3, 
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {renderOrderInformation()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`, justifyContent: 'flex-end' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontFamily: "'Mona Sans'",
            fontWeight: 600,
            borderColor: '#6b7280',
            color: '#6b7280',
            '&:hover': {
              borderColor: '#4b5563',
              backgroundColor: alpha('#6b7280', 0.04)
            }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>

      {/* Modal de Cambio de Estado */}
      <Portal>
        <Dialog
          open={showStatusChange}
          onClose={() => setShowStatusChange(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 24px 64px rgba(1, 3, 38, 0.12)',
              zIndex: 2000,
              '& .MuiSelect-select': {
                zIndex: '99999 !important'
              },
              '& .MuiPopover-root': {
                zIndex: '99999 !important'
              },
              '& .MuiMenu-root': {
                zIndex: '99999 !important'
              }
            }
          }}
          sx={{ 
            zIndex: 2000,
            '& .MuiSelect-select': {
              zIndex: '99999 !important'
            },
            '& .MuiPopover-root': {
              zIndex: '99999 !important'
            },
            '& .MuiMenu-root': {
              zIndex: '99999 !important'
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
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 2,
            borderBottom: '1px solid #e5e7eb'
          }}>
            <Box>
              <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                Cambiar Estado del Pedido
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pedido: {order?.orderNumber}
              </Typography>
            </Box>
            <IconButton onClick={() => setShowStatusChange(false)} size="small">
              <X size={20} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ px: 3, py: 2 }}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
              <Typography variant="body2">
                <strong>Estado actual:</strong> {availableStatuses.find(s => s.value === order?.status)?.label || order?.status}
              </Typography>
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Nuevo Estado"
                MenuProps={{
                  container: () => document.body,
                  PaperProps: {
                    sx: {
                      zIndex: 99999,
                      position: 'fixed',
                      '& *': {
                        zIndex: '99999 !important'
                      }
                    }
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  disablePortal: false,
                  disableScrollLock: true
                }}              >
                {availableStatuses
                  .filter(status => status.value !== order?.status)
                  .map((status) => {
                    const StatusIcon = status.icon;
                    return (
                      <MenuItem key={status.value} value={status.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StatusIcon size={16} />
                          {status.label}
                        </Box>
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setShowStatusChange(false)} 
              variant="outlined"
              disabled={statusChangeLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleStatusChange}
              variant="contained"
              disabled={!newStatus || statusChangeLoading}
              startIcon={statusChangeLoading ? <CircularProgress size={16} /> : <ArrowClockwise size={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontFamily: "'Mona Sans'",
                fontWeight: 600,
                bgcolor: '#6366f1',
                '&:hover': {
                  bgcolor: '#4f46e5'
                }
              }}
            >
              {statusChangeLoading ? 'Cambiando...' : 'Cambiar Estado'}
            </Button>
          </DialogActions>
        </Dialog>
      </Portal>

      {/* Modales Adicionales */}
      <PaymentDetailsModal
        isOpen={showPaymentDetails}
        onClose={() => setShowPaymentDetails(false)}
        orderId={order?._id}
        orderNumber={order?.orderNumber}
      />

      <OrderTimelineModal
        isOpen={showTimeline}
        onClose={() => setShowTimeline(false)}
        orderId={order?._id}
        orderNumber={order?.orderNumber}
      />

      <QualityControlPanel
        open={showQualityControl}
        onClose={() => setShowQualityControl(false)}
        orderId={order?._id}
        orderNumber={order?.orderNumber}
      />

      <ProductionPhotoUpload
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        orderId={order?._id}
        orderNumber={order?.orderNumber}
        onPhotoUploaded={() => {
          // Opcional: recargar datos si es necesario
          console.log('Foto subida exitosamente');
        }}
      />
    </StyledDialog>
  );
};

export default OrderDetailsModal;

// Inyectar CSS para z-index alto de SweetAlert2
const style = document.createElement('style');
style.textContent = `
  .swal-highest-z-index {
    z-index: 99999 !important;
  }
  .swal-highest-z-index .swal2-container {
    z-index: 99999 !important;
  }
`;
document.head.appendChild(style);