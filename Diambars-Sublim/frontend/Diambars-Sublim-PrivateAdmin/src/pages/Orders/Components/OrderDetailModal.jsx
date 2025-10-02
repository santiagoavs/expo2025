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

// ================ ESTILOS MODERNOS MEJORADOS ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    boxShadow: '0 24px 60px rgba(31, 100, 191, 0.12)',
    background: 'white',
    border: '1px solid rgba(31, 100, 191, 0.08)',
    maxWidth: '1200px',
    width: '95%',
    height: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  background: 'white',
  color: '#010326',
  padding: '24px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  position: 'relative'
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 8px rgba(31, 100, 191, 0.04)',
  background: 'white',
  transition: 'all 0.2s ease',
  height: '100%',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(31, 100, 191, 0.08)',
    transform: 'translateY(-1px)'
  }
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const getStatusStyles = (status) => {
    const styles = {
      pending_approval: { bg: '#FEF3C7', color: '#92400E', border: '#F59E0B', glow: 'rgba(245, 158, 11, 0.2)' },
      quoted: { bg: '#CFFAFE', color: '#0E7490', border: '#06B6D4', glow: 'rgba(6, 182, 212, 0.2)' },
      approved: { bg: '#D1FAE5', color: '#065F46', border: '#10B981', glow: 'rgba(16, 185, 129, 0.2)' },
      in_production: { bg: '#DBEAFE', color: '#1E40AF', border: '#3B82F6', glow: 'rgba(59, 130, 246, 0.2)' },
      quality_check: { bg: '#FED7AA', color: '#9A3412', border: '#F97316', glow: 'rgba(249, 115, 22, 0.2)' },
      quality_approved: { bg: '#ECFCCB', color: '#365314', border: '#84CC16', glow: 'rgba(132, 204, 22, 0.2)' },
      packaging: { bg: '#F3E8FF', color: '#581C87', border: '#A855F7', glow: 'rgba(168, 85, 247, 0.2)' },
      ready_for_delivery: { bg: '#E9D5FF', color: '#7C2D12', border: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.2)' },
      out_for_delivery: { bg: '#CFFAFE', color: '#0E7490', border: '#06B6D4', glow: 'rgba(6, 182, 212, 0.2)' },
      delivered: { bg: '#DCFCE7', color: '#166534', border: '#22C55E', glow: 'rgba(34, 197, 94, 0.2)' },
      completed: { bg: '#D1FAE5', color: '#064E3B', border: '#059669', glow: 'rgba(5, 150, 105, 0.2)' },
      cancelled: { bg: '#FEE2E2', color: '#991B1B', border: '#EF4444', glow: 'rgba(239, 68, 68, 0.2)' },
      on_hold: { bg: '#F3F4F6', color: '#374151', border: '#6B7280', glow: 'rgba(107, 114, 128, 0.2)' },
      returned: { bg: '#FEF2F2', color: '#DC2626', border: '#EF4444', glow: 'rgba(239, 68, 68, 0.2)' },
      refunded: { bg: '#F0FDF4', color: '#166534', border: '#22C55E', glow: 'rgba(34, 197, 94, 0.2)' }
    };
    return styles[status] || styles.on_hold;
  };

  const statusStyles = getStatusStyles(status);

  return {
    backgroundColor: statusStyles.bg,
    color: statusStyles.color,
    border: `2px solid ${statusStyles.border}`,
    fontSize: '0.875rem',
    fontWeight: 700,
    height: '32px',
    fontFamily: "'Mona Sans'",
    borderRadius: '12px',
    padding: '0 14px',
    boxShadow: `0 4px 12px ${statusStyles.glow}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 20px ${statusStyles.glow}`
    }
  };
});

const InfoCard = styled(ModernCard)(({ theme }) => ({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
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
  fontSize: '0.875rem',
  letterSpacing: '0.01em'
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontFamily: "'Mona Sans'",
  fontWeight: 600,
  color: '#010326',
  fontSize: '0.9rem',
  textAlign: 'right'
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '16px',
  paddingBottom: '12px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "'Mona Sans'",
  fontWeight: 700,
  fontSize: '0.95rem',
  color: '#010326',
  letterSpacing: '-0.01em'
}));

const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  padding: '20px 32px',
  background: 'white',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  justifyContent: 'center',
  alignItems: 'center'
}));

const ModernButton = styled(Button)(({ variant: buttonVariant }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(31, 100, 191, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
        boxShadow: '0 6px 24px rgba(31, 100, 191, 0.4)',
        transform: 'translateY(-2px)'
      }
    },
    success: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        boxShadow: '0 6px 24px rgba(16, 185, 129, 0.4)',
        transform: 'translateY(-2px)'
      }
    },
    info: {
      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        boxShadow: '0 6px 24px rgba(59, 130, 246, 0.4)',
        transform: 'translateY(-2px)'
      }
    },
    warning: {
      background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(249, 115, 22, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #EA580C 0%, #DC2626 100%)',
        boxShadow: '0 6px 24px rgba(249, 115, 22, 0.4)',
        transform: 'translateY(-2px)'
      }
    },
    outlined: {
      borderColor: '#1F64BF',
      color: '#1F64BF',
      background: 'white',
      border: '2px solid',
      '&:hover': {
        borderColor: '#032CA6',
        background: alpha('#1F64BF', 0.05),
        transform: 'translateY(-2px)'
      }
    }
  };

  const selectedVariant = variants[buttonVariant] || variants.outlined;

  return {
    borderRadius: '14px',
    textTransform: 'none',
    fontFamily: "'Mona Sans'",
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '10px 20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...selectedVariant
  };
});

const ProductItem = styled(Box)(({ theme }) => ({
  padding: '14px',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  background: 'white',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(31, 100, 191, 0.08)',
    transform: 'translateY(-1px)'
  }
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
  const paymentStatus = null;
  const paymentLoading = false;
  const refetchPayments = () => {};

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = new Date(date);
      
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return dateObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, 'Fecha original:', date);
      return 'Error en fecha';
    }
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

  // Función auxiliar para obtener el teléfono
  const getUserPhone = () => {
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
      
      fetch(`/api/orders/${order._id}`, {
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
    const swalConfig = {
      ...config,
      customClass: 'swal-highest-z-index',
      allowOutsideClick: true,
      allowEscapeKey: true,
      focusConfirm: false,
      didOpen: () => {
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.style.zIndex = '1000000';
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
    
    const paymentMethod = order?.payment?.method;
    const paymentStatus = order?.payment?.status;
    const validationInfo = getPaymentValidationInfo(paymentMethod, order?.status);
    const restrictions = getPaymentRestrictions(paymentMethod, newStatus);
    
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
      const response = await apiClient.put(`/orders/${order._id}/status`, {
        newStatus,
        reason: `Cambio de estado por administrador`
      });
      
      if (response.success) {
        onStatusChange?.(order?._id, newStatus);
        setShowStatusChange(false);
        setNewStatus('');
        
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
    Swal.mixin({
      customClass: {
        popup: 'swal-highest-z-index'
      }
    });
    
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

  // Renderizar información de la orden
  const renderOrderInformation = () => {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3,
        width: '100%',
        maxWidth: '1200px',
        mx: 'auto'
      }}>
        {/* Primera fila: Información básica */}
        <Grid container spacing={3} justifyContent="center">
          {/* Detalles del Pedido */}
          <Grid item xs={12} md={6}>
            <InfoCard sx={{ height: 'auto' }}>
              <SectionHeader>
                <Receipt size={24} color="#1F64BF" weight="duotone" />
                <SectionTitle>Detalles del Pedido</SectionTitle>
              </SectionHeader>
              
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
                <InfoValue sx={{ color: '#1F64BF', fontWeight: 700, fontSize: '1.1rem' }}>
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
                    sx={{ 
                      borderRadius: '10px',
                      fontWeight: 600,
                      borderWidth: '2px'
                    }}
                  />
                </InfoRow>
              )}
            </InfoCard>
          </Grid>

          {/* Información del Cliente */}
          <Grid item xs={12} md={6}>
            <InfoCard sx={{ height: 'auto' }}>
              <SectionHeader>
                <User size={24} color="#1F64BF" weight="duotone" />
                <SectionTitle>Información del Cliente</SectionTitle>
              </SectionHeader>
              
              <InfoRow>
                <InfoLabel>Nombre:</InfoLabel>
                <InfoValue>{order?.user?.name || 'N/A'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Email:</InfoLabel>
                <InfoValue sx={{ 
                  fontSize: '0.8rem',
                  wordBreak: 'break-word'
                }}>
                  {order?.user?.email || 'N/A'}
                </InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Teléfono:</InfoLabel>
                <InfoValue>{getUserPhone() || 'N/A'}</InfoValue>
              </InfoRow>
              
              {order?.user?.totalOrders && (
                <InfoRow>
                  <InfoLabel>Total de pedidos:</InfoLabel>
                  <Chip 
                    label={`${order.user.totalOrders} pedidos`}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: '10px'
                    }}
                  />
                </InfoRow>
              )}
            </InfoCard>
          </Grid>
        </Grid>

        {/* Segunda fila: Información de entrega y productos */}
        <Grid container spacing={3} justifyContent="center">
          {/* Información de Entrega */}
          <Grid item xs={12} md={6}>
            <InfoCard sx={{ height: 'auto' }}>
              <SectionHeader>
                <Truck size={24} color="#1F64BF" weight="duotone" />
                <SectionTitle>Información de Entrega</SectionTitle>
              </SectionHeader>
              
              <InfoRow>
                <InfoLabel>Tipo de entrega:</InfoLabel>
                <Chip
                  label={order?.deliveryLabel}
                  size="small"
                  sx={{
                    background: order?.deliveryType === 'delivery' 
                      ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                      : 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: '10px'
                  }}
                />
              </InfoRow>
              
              {order?.deliveryType === 'delivery' && order?.deliveryAddress && (
                <InfoRow>
                  <InfoLabel>Dirección:</InfoLabel>
                  <InfoValue sx={{ 
                    textAlign: 'right',
                    fontSize: '0.85rem',
                    lineHeight: 1.4
                  }}>
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    {order.deliveryAddress.phone && (
                      <Box component="span" sx={{ display: 'block', color: '#6B7280', mt: 0.5 }}>
                        📞 {order.deliveryAddress.phone}
                      </Box>
                    )}
                  </InfoValue>
                </InfoRow>
              )}
            </InfoCard>
          </Grid>

          {/* Productos del Pedido */}
          <Grid item xs={12} md={6}>
            <InfoCard sx={{ height: 'auto' }}>
              <SectionHeader>
                <Package size={24} color="#1F64BF" weight="duotone" />
                <SectionTitle>Productos del Pedido</SectionTitle>
              </SectionHeader>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {order?.items?.map((item, index) => (
                  <ProductItem key={index}>
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
                              borderRadius: '12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                        </Grid>
                      )}
                      <Grid item xs>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 700, 
                          fontFamily: "'Mona Sans'",
                          color: '#010326',
                          mb: 0.5,
                          fontSize: '0.9rem'
                        }}>
                          {item.product?.name || 'Producto personalizado'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Chip 
                            label={`Cantidad: ${item.quantity}`}
                            size="small"
                            sx={{
                              backgroundColor: alpha('#1F64BF', 0.1),
                              color: '#1F64BF',
                              fontWeight: 600,
                              borderRadius: '8px',
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip 
                            label={`${item.price || 0}`}
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              color: 'white',
                              fontWeight: 600,
                              borderRadius: '8px',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                        {item.design && (
                          <Typography variant="body2" sx={{ 
                            color: '#6B7280',
                            fontFamily: "'Mona Sans'",
                            fontSize: '0.8rem'
                          }}>
                            🎨 Diseño: {item.design.name}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </ProductItem>
                ))}
              </Box>
            </InfoCard>
          </Grid>
        </Grid>


        {/* Notas del Cliente - Full Width */}
        {order?.clientNotes && (
          <Grid container justifyContent="center">
            <Grid item xs={12}>
              <ModernCard sx={{ p: 3 }}>
                <SectionHeader>
                  <Receipt size={24} color="#1F64BF" weight="duotone" />
                  <SectionTitle>Notas del Cliente</SectionTitle>
                </SectionHeader>
                <Box sx={{ 
                  p: 3,
                  backgroundColor: alpha('#1F64BF', 0.04),
                  borderRadius: '16px',
                  borderLeft: '4px solid #1F64BF'
                }}>
                  <Typography variant="body1" sx={{ 
                    fontFamily: "'Mona Sans'",
                    fontStyle: 'italic',
                    color: '#374151',
                    lineHeight: 1.8,
                    fontSize: '0.95rem'
                  }}>
                    "{order.clientNotes}"
                  </Typography>
                </Box>
              </ModernCard>
            </Grid>
          </Grid>
        )}
      </Box>
    );
  };

  if (!order) return null;

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitleStyled>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <Package size={24} weight="duotone" />
          </Box>
          <Box>
            <Typography variant="h5" component="div" sx={{ 
              fontFamily: "'Mona Sans'", 
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}>
              Orden #{order.orderNumber}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {formatDate(order.createdAt)}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'rotate(90deg)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <X size={24} />
        </IconButton>
      </DialogTitleStyled>

      <DialogContent sx={{ 
        p: 0, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}>
        {/* Botones de Acciones Rápidas */}
        <ActionButtonsContainer>
          <ModernButton
            onClick={() => setShowPaymentDetails(true)}
            variant="success"
            size="small"
            startIcon={<CurrencyCircleDollar size={18} weight="duotone" />}
          >
            Ver Pagos
          </ModernButton>

          <ModernButton
            onClick={() => setShowTimeline(true)}
            variant="info"
            size="small"
            startIcon={<ChartLineUp size={18} weight="duotone" />}
          >
            Timeline
          </ModernButton>

          <ModernButton
            onClick={() => setShowQualityControl(true)}
            variant="success"
            size="small"
            startIcon={<CheckCircle size={18} weight="duotone" />}
          >
            Control de Calidad
          </ModernButton>

          <ModernButton
            onClick={() => setShowStatusChange(true)}
            variant="outlined"
            size="small"
            startIcon={<ArrowClockwise size={18} weight="duotone" />}
          >
            Cambiar Estado
          </ModernButton>

          {canUploadPhotos && (
            <Tooltip 
              title={!hasPhoneNumber ? "Se necesita número de teléfono para enviar por WhatsApp" : ""}
              placement="top"
            >
              <span>
                <ModernButton
                  onClick={() => setShowPhotoUpload(true)}
                  variant="warning"
                  size="small"
                  disabled={!canUploadPhotos}
                  startIcon={<Camera size={18} weight="duotone" />}
                >
                  📸 Subir Foto
                </ModernButton>
              </span>
            </Tooltip>
          )}
        </ActionButtonsContainer>

        {/* Contenido principal */}
        <Box sx={{ 
          p: 4, 
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: alpha('#1F64BF', 0.05),
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha('#1F64BF', 0.3),
            borderRadius: '4px',
            '&:hover': {
              background: alpha('#1F64BF', 0.5)
            }
          }
        }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              flex: 1,
              gap: 3
            }}>
              <CircularProgress 
                size={60} 
                sx={{ 
                  color: '#1F64BF'
                }} 
              />
              <Typography variant="h6" sx={{ 
                fontFamily: "'Mona Sans'",
                fontWeight: 600,
                color: '#6B7280'
              }}>
                Cargando detalles...
              </Typography>
            </Box>
          ) : (
            renderOrderInformation()
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`,
        background: 'white',
        justifyContent: 'flex-end' 
      }}>
        <ModernButton
          onClick={onClose}
          variant="outlined"
        >
          Cerrar
        </ModernButton>
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
              borderRadius: '20px',
              boxShadow: '0 24px 64px rgba(31, 100, 191, 0.15)',
              zIndex: 2000
            }
          }}
          sx={{ zIndex: 2000 }}
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
            borderBottom: `1px solid ${alpha('#1F64BF', 0.1)}`
          }}>
            <Box>
              <Typography variant="h6" sx={{ fontFamily: "'Mona Sans'", fontWeight: 700 }}>
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

          <DialogContent sx={{ px: 3, py: 3 }}>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                border: `1px solid ${alpha('#3B82F6', 0.2)}`
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: "'Mona Sans'" }}>
                <strong>Estado actual:</strong> {availableStatuses.find(s => s.value === order?.status)?.label || order?.status}
              </Typography>
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Nuevo Estado"
                sx={{
                  borderRadius: '12px',
                  fontFamily: "'Mona Sans'"
                }}
                MenuProps={{
                  container: () => document.body,
                  PaperProps: {
                    sx: {
                      zIndex: 99999,
                      position: 'fixed',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(31, 100, 191, 0.15)'
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
                }}
              >
                {availableStatuses
                  .filter(status => status.value !== order?.status)
                  .map((status) => {
                    const StatusIcon = status.icon;
                    return (
                      <MenuItem key={status.value} value={status.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <StatusIcon size={18} weight="duotone" />
                          <Typography sx={{ fontFamily: "'Mona Sans'", fontWeight: 500 }}>
                            {status.label}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <ModernButton 
              onClick={() => setShowStatusChange(false)} 
              variant="outlined"
              disabled={statusChangeLoading}
            >
              Cancelar
            </ModernButton>
            <ModernButton 
              onClick={handleStatusChange}
              variant="primary"
              disabled={!newStatus || statusChangeLoading}
              startIcon={statusChangeLoading ? <CircularProgress size={16} /> : <ArrowClockwise size={16} />}
            >
              {statusChangeLoading ? 'Cambiando...' : 'Cambiar Estado'}
            </ModernButton>
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
          console.log('Foto subida exitosamente');
        }}
      />
    </StyledDialog>
  );
};

export default OrderDetailsModal;