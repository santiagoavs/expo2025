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
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
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
  TableRow
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
  PencilSimple
} from '@phosphor-icons/react';

import { useOrderPaymentStatus } from '../../hooks/usePayments';
import PaymentStatusPanel from '../Payments/PaymentStatusPanel';

// ================ ESTILOS MODERNOS ================
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 24px 64px rgba(1, 3, 38, 0.12)',
    maxWidth: '1000px',
    width: '95%',
    maxHeight: '90vh'
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
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s ease'
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const getStatusStyles = (status) => {
    const styles = {
      pending_approval: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
      quoted: { bg: '#cffafe', color: '#0e7490', border: '#06b6d4' },
      approved: { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
      in_production: { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' },
      ready_for_delivery: { bg: '#e9d5ff', color: '#7c2d12', border: '#8b5cf6' },
      delivered: { bg: '#dcfce7', color: '#166534', border: '#22c55e' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
      on_hold: { bg: '#f3f4f6', color: '#374151', border: '#6b7280' }
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
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Hook para estado de pagos
  const {
    paymentStatus,
    loading: paymentLoading,
    refetch: refetchPayments
  } = useOrderPaymentStatus(order?._id);

  // Manejar cambio de tab
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

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

  // Timeline de estados
  const renderTimeline = () => {
    if (!order?.statusHistory) return null;

    return (
      <Timeline>
        {order.statusHistory.map((entry, index) => {
          const StatusIcon = getStatusIcon(entry.status);
          const isLast = index === order.statusHistory.length - 1;
          
          return (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot 
                  sx={{ 
                    backgroundColor: isLast ? '#1F64BF' : alpha('#1F64BF', 0.3),
                    border: 'none'
                  }}
                >
                  <StatusIcon size={16} color={isLast ? 'white' : '#1F64BF'} />
                </TimelineDot>
                {!isLast && <TimelineConnector sx={{ backgroundColor: alpha('#1F64BF', 0.2) }} />}
              </TimelineSeparator>
              <TimelineContent>
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
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    );
  };

  // Renderizar contenido por tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 0: // Información general
        return (
          <Grid container spacing={3}>
            {/* Información del pedido */}
            <Grid item xs={12} md={6}>
              <ModernCard>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
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

            {/* Información del cliente */}
            <Grid item xs={12} md={6}>
              <ModernCard>
                <CardContent>
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
                    <InfoValue>{order?.user?.phone || 'N/A'}</InfoValue>
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

            {/* Información de entrega */}
            <Grid item xs={12}>
              <ModernCard>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                    <Truck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Información de Entrega
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <InfoRow>
                        <InfoLabel>Tipo de entrega:</InfoLabel>
                        <InfoValue>{order?.deliveryLabel}</InfoValue>
                      </InfoRow>
                    </Grid>
                    
                    {order?.deliveryType === 'delivery' && order?.deliveryAddress && (
                      <Grid item xs={12}>
                        <InfoRow>
                          <InfoLabel>Dirección:</InfoLabel>
                          <InfoValue>
                            {order.deliveryAddress.street}, {order.deliveryAddress.city}
                            {order.deliveryAddress.phone && ` • Tel: ${order.deliveryAddress.phone}`}
                          </InfoValue>
                        </InfoRow>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </ModernCard>
            </Grid>

            {/* Productos e items */}
            <Grid item xs={12}>
              <ModernCard>
                <CardContent>
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

      case 1: // Historial
        return (
          <ModernCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontFamily: "'Mona Sans'", fontWeight: 600 }}>
                Historial de Estados
              </Typography>
              {renderTimeline()}
            </CardContent>
          </ModernCard>
        );

      case 2: // Pagos
        return (
          <Box>
            {paymentLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <PaymentStatusPanel 
                orderId={order?._id}
                paymentStatus={paymentStatus}
                onRefresh={refetchPayments}
                compact={false}
              />
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (!order) return null;

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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

      <DialogContent sx={{ p: 0 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{ px: 3 }}
          >
            <Tab 
              icon={<Eye size={18} />} 
              label="Información" 
              sx={{ fontFamily: "'Mona Sans'" }}
            />
            <Tab 
              icon={<Clock size={18} />} 
              label="Historial" 
              sx={{ fontFamily: "'Mona Sans'" }}
            />
            <Tab 
              icon={<Receipt size={18} />} 
              label="Pagos" 
              sx={{ fontFamily: "'Mona Sans'" }}
            />
          </Tabs>
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 3, minHeight: '400px' }}>
          {renderTabContent()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha('#1F64BF', 0.08)}` }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontFamily: "'Mona Sans'",
            fontWeight: 600
          }}
        >
          Cerrar
        </Button>
        
        {order.canBeEdited && onStatusChange && (
          <Button
            onClick={() => onStatusChange?.(order)}
            variant="contained"
            startIcon={<PencilSimple size={16} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontFamily: "'Mona Sans'",
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
              }
            }}
          >
            Cambiar Estado
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default OrderDetailsModal;