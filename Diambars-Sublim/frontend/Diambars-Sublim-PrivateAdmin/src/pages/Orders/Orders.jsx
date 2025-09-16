// src/pages/Orders/Orders.jsx - Página de órdenes refactorizada con diseño moderno
import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
  styled,
  useTheme,
  alpha,
  Badge,
  Skeleton,
  InputAdornment
} from '@mui/material';
import { 
  Plus as AddIcon,
  DotsThreeVertical as MoreVertIcon,
  PencilSimple as EditIcon,
  Eye as ViewIcon,
  Truck as ShippingIcon,
  ClipboardText as AssignmentIcon,
  ArrowClockwise as RefreshIcon,
  MagnifyingGlass as SearchIcon,
  Clock,
  CheckCircle,
  TrendUp
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useOrders, useOrderActions } from '../../hooks/useOrders';
import toast from 'react-hot-toast';

// Configuración global de SweetAlert2
Swal.mixin({
  customClass: {
    container: 'swal-overlay-custom',
    popup: 'swal-modal-custom'
  },
  didOpen: () => {
    const container = document.querySelector('.swal-overlay-custom');
    if (container) {
      container.style.zIndex = '2000';
    }
  }
});

// ================ ESTILOS MODERNOS RESPONSIVE - ORDERS ================
const OrdersPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const OrdersContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1600px',
  margin: '0 auto',
  paddingTop: '120px',
  paddingBottom: '40px',
  paddingLeft: '32px',
  paddingRight: '32px',
  minHeight: 'calc(100vh - 120px)',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('xl')]: {
    maxWidth: '1400px',
    paddingLeft: '28px',
    paddingRight: '28px',
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '1200px',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: '110px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: '100px',
    paddingLeft: '16px',
    paddingRight: '16px',
  }
}));

const OrdersModernCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  }
}));

const OrdersHeaderSection = styled(OrdersModernCard)(({ theme }) => ({
  padding: '40px',
  marginBottom: '32px',
  fontWeight: '700 !important',
  background: 'white',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.down('lg')]: {
    padding: '32px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '24px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
    marginBottom: '20px',
  }
}));

const OrdersHeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '32px',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    gap: '24px',
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
  }
}));

const OrdersHeaderInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    alignItems: 'center',
    textAlign: 'center',
  }
}));

const OrdersMainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: '700 !important',
  color: '#010326',
  marginBottom: '12px',
  letterSpacing: '-0.025em',
  lineHeight: 1.2,
  textAlign: 'left',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '2.2rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '1.8rem',
    textAlign: 'center',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.6rem',
  }
}));

const OrdersMainDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: '#032CA6',
  fontWeight: '700 !important',
  lineHeight: 1.6,
  opacity: 0.9,
  textAlign: 'left',
  maxWidth: '600px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '1rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '0.95rem',
    textAlign: 'center',
    maxWidth: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  }
}));

const OrdersHeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    gap: '12px',
  },
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    width: '100%',
    gap: '10px',
    '& > *': {
      flex: 1,
    }
  }
}));

const OrdersPrimaryActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  minWidth: '160px',
  whiteSpace: 'nowrap',
  '&:hover': {
    background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
    boxShadow: '0 6px 24px rgba(31, 100, 191, 0.32)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  [theme.breakpoints.down('lg')]: {
    minWidth: '140px',
    padding: '12px 24px',
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: 'auto',
    flex: 1,
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    padding: '12px 20px',
    fontSize: '0.85rem',
  }
}));

const OrdersSecondaryActionButton = styled(IconButton)(({ theme }) => ({
  background: alpha('#1F64BF', 0.08),
  color: '#1F64BF',
  borderRadius: '12px',
  width: '52px',
  height: '52px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  flexShrink: 0,
  '&:hover': {
    background: alpha('#1F64BF', 0.12),
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('lg')]: {
    width: '48px',
    height: '48px',
  },
  [theme.breakpoints.down('md')]: {
    width: '48px',
    height: '48px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '48px',
    height: '48px',
  }
}));

// CONTENEDOR UNIFICADO ORDERS
const OrdersUnifiedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
}));

const OrdersStatsContainer = styled(OrdersUnifiedContainer)(({ theme }) => ({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
}));

// GRID DE ESTADÍSTICAS ORDERS
const OrdersStatsGrid = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'grid',
  gap: '24px',
  gridTemplateColumns: 'repeat(4, 1fr)',
  [theme.breakpoints.down(1400)]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '18px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  [theme.breakpoints.down(480)]: {
    gridTemplateColumns: '1fr',
    gap: '12px',
  }
}));

const OrdersStatCard = styled(OrdersModernCard)(({ theme, variant }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: 'white',
      color: '#010326',
    }
  };

  const selectedVariant = variants[variant] || variants.secondary;

  return {
    padding: '28px',
    width: '100%',
    minHeight: '160px',
    maxHeight: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    ...selectedVariant,
    '&::before': variant === 'primary' ? {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '120px',
      height: '120px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      transform: 'translate(30px, -30px)',
    } : {},
    [theme.breakpoints.down('lg')]: {
      padding: '24px',
      minHeight: '150px',
    },
    [theme.breakpoints.down('md')]: {
      padding: '20px',
      minHeight: '140px',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '18px',
      minHeight: '130px',
    }
  };
});

const OrdersStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
  width: '100%',
});

const OrdersStatIconContainer = styled(Box)(({ variant, theme }) => ({
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : alpha('#1F64BF', 0.1),
  color: variant === 'primary' ? 'white' : '#1F64BF',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
  },
  [theme.breakpoints.down('md')]: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
  }
}));

const OrdersStatValue = styled(Typography)(({ variant, theme }) => ({
  fontSize: '2.2rem',
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: '6px',
  color: variant === 'primary' ? 'white' : '#010326',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '1.8rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.6rem',
  }
}));

const OrdersStatLabel = styled(Typography)(({ variant, theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 500,
  opacity: variant === 'primary' ? 0.9 : 0.7,
  color: variant === 'primary' ? 'white' : '#032CA6',
  lineHeight: 1.3,
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const OrdersStatChange = styled(Box)(({ variant, trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: 'auto',
  padding: '6px 10px',
  borderRadius: '8px',
  background: variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : trend === 'up' 
      ? alpha('#10B981', 0.1) 
      : alpha('#EF4444', 0.1),
  width: 'fit-content',
}));

const OrdersStatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: variant === 'primary' 
    ? 'white' 
    : trend === 'up' 
      ? '#10B981' 
      : '#EF4444',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const OrdersControlsSection = styled(OrdersModernCard)(({ theme }) => ({
  padding: '32px',
  marginBottom: '32px',
  background: 'white',
  position: 'relative',
  zIndex: 1,
  width: '100%',
  boxSizing: 'border-box',
  [theme.breakpoints.down('lg')]: {
    padding: '28px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '24px',
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
    marginBottom: '20px',
  }
}));

const OrdersControlsContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '24px',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    gap: '20px',
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '18px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
  }
}));

const OrdersSearchSection = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  [theme.breakpoints.down('md')]: {
    flex: 'none',
    width: '100%',
  }
}));

const OrdersModernTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  fontFamily: "'Mona Sans'",
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F2F2F2',
    transition: 'all 0.3s ease',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(1, 3, 38, 0.08)',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: '0 4px 16px rgba(31, 100, 191, 0.12)',
    },
    '& input': {
      color: '#010326',
      fontSize: '0.9rem',
      fontWeight: 500,
      '&::placeholder': {
        color: '#64748b',
        opacity: 1,
      }
    }
  }
}));

const OrdersFiltersSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  flexWrap: 'wrap',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    gap: '12px',
  },
  [theme.breakpoints.down('md')]: {
    justifyContent: 'flex-start',
    gap: '12px',
    width: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
    gap: '10px',
    '& > *': {
      minWidth: 'fit-content',
    }
  }
}));

const OrdersFilterChip = styled(Box)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  borderRadius: '10px',
  background: active ? alpha('#1F64BF', 0.1) : '#F2F2F2',
  border: `1px solid ${active ? alpha('#1F64BF', 0.2) : 'transparent'}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.9rem',
  fontWeight: 500,
  color: active ? '#1F64BF' : '#032CA6',
  whiteSpace: 'nowrap',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    background: active ? alpha('#1F64BF', 0.15) : 'white',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('lg')]: {
    padding: '8px 12px',
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '8px 10px',
    fontSize: '0.8rem',
  }
}));

const OrdersTableSection = styled(OrdersUnifiedContainer)({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
});

const OrdersTable = styled(OrdersModernCard)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: alpha('#1F64BF', 0.04),
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: '#010326',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    fontFamily: "'Mona Sans'",
    borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const colors = {
    pending_approval: { bg: alpha('#f59e0b', 0.1), color: '#92400e' },
    quoted: { bg: alpha('#3b82f6', 0.1), color: '#1e40af' },
    approved: { bg: alpha('#10b981', 0.1), color: '#065f46' },
    in_production: { bg: alpha('#8b5cf6', 0.1), color: '#3730a3' },
    ready_for_delivery: { bg: alpha('#ec4899', 0.1), color: '#be185d' },
    delivered: { bg: alpha('#10b981', 0.1), color: '#065f46' },
    completed: { bg: alpha('#6b7280', 0.1), color: '#374151' },
    cancelled: { bg: alpha('#ef4444', 0.1), color: '#991b1b' },
    rejected: { bg: alpha('#ef4444', 0.1), color: '#991b1b' },
  };

  const statusColor = colors[status] || colors.pending_approval;

  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '28px',
    borderRadius: '8px',
    fontFamily: "'Mona Sans'",
    border: `1px solid ${statusColor.color}20`,
  };
});

const Orders = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Estados locales
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    totalPrice: '',
    deliveryFee: '',
    tax: '',
    notes: ''
  });

  // Hooks personalizados
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    refreshOrders
  } = useOrders({
    status: '',
    deliveryType: '',
    paymentStatus: '',
    search: ''
  });

  const { loading: actionLoading, submitQuote } = useOrderActions();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending_approval').length;
    const inProductionOrders = orders.filter(order => order.status === 'in_production').length;
    const completedOrders = orders.filter(order => order.status === 'completed' || order.status === 'delivered').length;
    
    return [
      {
        id: 'total-orders',
        title: "Total de Órdenes",
        value: totalOrders,
        change: "+12% este mes",
        trend: "up",
        icon: AssignmentIcon,
        variant: "primary"
      },
      {
        id: 'pending-orders',
        title: "Pendientes",
        value: pendingOrders,
        change: `${pendingOrders}/${totalOrders} pendientes`,
        trend: "up",
        icon: Clock,
        variant: "secondary"
      },
      {
        id: 'production-orders',
        title: "En Producción",
        value: inProductionOrders,
        change: "Órdenes activas",
        trend: "up",
        icon: Truck,
        variant: "secondary"
      },
      {
        id: 'completed-orders',
        title: "Completadas",
        value: completedOrders,
        change: "Órdenes finalizadas",
        trend: "up",
        icon: CheckCircle,
        variant: "secondary"
      }
    ];
  }, [orders]);

  // Funciones de manejo
  const handleMenuOpen = (event, order) => {
    setMenuAnchor(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedOrder(null);
  };

  const handleViewOrder = (order) => {
    navigate(`/orders/${order._id}`);
    handleMenuClose();
  };

  const handleEditOrder = (order) => {
    navigate(`/orders/${order._id}/edit`);
    handleMenuClose();
  };

  const handleQuoteOrder = (order) => {
    setSelectedOrder(order);
    setQuoteDialogOpen(true);
    handleMenuClose();
  };

  const handleSubmitQuote = async () => {
    if (!selectedOrder || !quoteForm.totalPrice) {
      toast.error('Precio total es requerido');
      return;
    }

    try {
      await submitQuote(selectedOrder._id, {
        totalPrice: parseFloat(quoteForm.totalPrice),
        deliveryFee: parseFloat(quoteForm.deliveryFee) || 0,
        tax: parseFloat(quoteForm.tax) || 0,
        notes: quoteForm.notes
      });

      setQuoteDialogOpen(false);
      setQuoteForm({ totalPrice: '', deliveryFee: '', tax: '', notes: '' });
      refreshOrders();
    } catch (error) {
      console.error('Error enviando cotización:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    updateFilters({ [field]: value });
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_approval: 'Pendiente Aprobación',
      quoted: 'Cotizado',
      approved: 'Aprobado',
      in_production: 'En Producción',
      ready_for_delivery: 'Listo Entrega',
      delivered: 'Entregado',
      completed: 'Completado',
      cancelled: 'Cancelado',
      rejected: 'Rechazado'
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <OrdersPageContainer>
        <OrdersContentWrapper>
          <OrdersModernCard sx={{ 
            p: 3, 
            mb: 4,
            background: alpha('#dc2626', 0.05),
            border: `1px solid ${alpha('#dc2626', 0.2)}`,
            position: 'relative',
            zIndex: 1,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#dc2626', fontWeight: 500, fontFamily: "'Mona Sans'" }}>
                ⚠️ {error}
              </Typography>
              <Button 
                size="small" 
                onClick={refreshOrders}
                startIcon={<RefreshIcon size={18} weight="bold" />}
                sx={{ 
                  color: '#dc2626',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontFamily: "'Mona Sans'"
                }}
              >
                Reintentar
              </Button>
            </Box>
          </OrdersModernCard>
        </OrdersContentWrapper>
      </OrdersPageContainer>
    );
  }

  return (
    <OrdersPageContainer>
      <OrdersContentWrapper>
        {/* Header Principal */}
        <OrdersHeaderSection sx={{ fontWeight: '700 !important' }} className="force-bold" style={{ fontWeight: '700 !important' }}>
          <OrdersHeaderContent>
            <OrdersHeaderInfo>
              <OrdersMainTitle sx={{ fontWeight: '700 !important' }} className="force-bold" style={{ fontWeight: '700 !important' }}>
                Gestión de Órdenes
              </OrdersMainTitle>
              <OrdersMainDescription sx={{ fontWeight: '700 !important' }} className="force-bold" style={{ fontWeight: '700 !important' }}>
                Administra pedidos, cotizaciones y seguimiento de producción
              </OrdersMainDescription>
            </OrdersHeaderInfo>
            
            <OrdersHeaderActions>
              <OrdersPrimaryActionButton
                onClick={() => navigate('/orders/create')}
                disabled={loading}
                startIcon={<AddIcon size={18} weight="bold" />}
              >
                Nueva Orden
              </OrdersPrimaryActionButton>
              
              <OrdersSecondaryActionButton
                onClick={refreshOrders}
                disabled={loading}
                title="Actualizar órdenes"
              >
                <RefreshIcon size={20} weight="bold" />
              </OrdersSecondaryActionButton>
            </OrdersHeaderActions>
          </OrdersHeaderContent>
        </OrdersHeaderSection>

        {/* Estadísticas */}
        <OrdersStatsContainer>
          <OrdersStatsGrid>
            {stats.map((stat) => (
              <OrdersStatCard key={stat.id} variant={stat.variant}>
                <OrdersStatHeader>
                  <Box>
                    <OrdersStatValue variant={stat.variant}>
                      {stat.value}
                    </OrdersStatValue>
                    <OrdersStatLabel variant={stat.variant}>
                      {stat.title}
                    </OrdersStatLabel>
                  </Box>
                  <OrdersStatIconContainer variant={stat.variant}>
                    <stat.icon size={24} weight="duotone" />
                  </OrdersStatIconContainer>
                </OrdersStatHeader>
                <OrdersStatChange variant={stat.variant} trend={stat.trend}>
                  <TrendUp size={12} weight="bold" />
                  <OrdersStatTrendText variant={stat.variant} trend={stat.trend}>
                    {stat.change}
                  </OrdersStatTrendText>
                </OrdersStatChange>
              </OrdersStatCard>
            ))}
          </OrdersStatsGrid>
        </OrdersStatsContainer>

        {/* Controles de búsqueda y filtros */}
        <OrdersControlsSection>
          <OrdersControlsContent>
            <OrdersSearchSection>
              <OrdersModernTextField
                fullWidth
                placeholder="Buscar por número de orden, cliente..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon size={18} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  ),
                }}
              />
            </OrdersSearchSection>

            <OrdersFiltersSection>
              <OrdersFilterChip active={filters.status !== ''}>
                <AssignmentIcon size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    displayEmpty
                    sx={{
                      border: 'none',
                      fontFamily: "'Mona Sans'",
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { 
                        padding: 0,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#010326',
                        fontFamily: "'Mona Sans'",
                      }
                    }}
                  >
                    <MenuItem value="">Estado</MenuItem>
                    <MenuItem value="pending_approval">Pendiente Aprobación</MenuItem>
                    <MenuItem value="quoted">Cotizado</MenuItem>
                    <MenuItem value="approved">Aprobado</MenuItem>
                    <MenuItem value="in_production">En Producción</MenuItem>
                    <MenuItem value="ready_for_delivery">Listo Entrega</MenuItem>
                    <MenuItem value="delivered">Entregado</MenuItem>
                    <MenuItem value="completed">Completado</MenuItem>
                    <MenuItem value="cancelled">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </OrdersFilterChip>

              <OrdersFilterChip active={filters.deliveryType !== ''}>
                <ShippingIcon size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filters.deliveryType || ''}
                    onChange={(e) => handleFilterChange('deliveryType', e.target.value)}
                    displayEmpty
                    sx={{
                      border: 'none',
                      fontFamily: "'Mona Sans'",
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { 
                        padding: 0,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#010326',
                        fontFamily: "'Mona Sans'",
                      }
                    }}
                  >
                    <MenuItem value="">Entrega</MenuItem>
                    <MenuItem value="delivery">Domicilio</MenuItem>
                    <MenuItem value="meetup">Punto de Encuentro</MenuItem>
                  </Select>
                </FormControl>
              </OrdersFilterChip>

              <OrdersFilterChip active={filters.paymentStatus !== ''}>
                <CheckCircle size={16} weight="bold" />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filters.paymentStatus || ''}
                    onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                    displayEmpty
                    sx={{
                      border: 'none',
                      fontFamily: "'Mona Sans'",
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSelect-select': { 
                        padding: 0,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#010326',
                        fontFamily: "'Mona Sans'",
                      }
                    }}
                  >
                    <MenuItem value="">Pago</MenuItem>
                    <MenuItem value="pending">Pendiente</MenuItem>
                    <MenuItem value="paid">Pagado</MenuItem>
                    <MenuItem value="failed">Fallido</MenuItem>
                  </Select>
                </FormControl>
              </OrdersFilterChip>
            </OrdersFiltersSection>
          </OrdersControlsContent>
        </OrdersControlsSection>

        {/* Tabla de Órdenes */}
        <OrdersTableSection>
          <OrdersTable>
            <TableContainer>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <TableCell>Orden</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Productos</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Entrega</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <CircularProgress sx={{ color: '#1F64BF' }} />
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary" fontFamily="'Mona Sans'">
                          No se encontraron órdenes
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order._id} hover sx={{ '&:hover': { backgroundColor: alpha('#1F64BF', 0.02) } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} fontFamily="'Mona Sans'">
                            #{order.orderNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="'Mona Sans'">
                            {order.user?.name || 'Cliente desconocido'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontFamily="'Mona Sans'">
                            {order.user?.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={getStatusLabel(order.status)}
                            status={order.status}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="'Mona Sans'">
                            {order.items?.length || 0} producto(s)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} fontFamily="'Mona Sans'">
                            {formatCurrency(order.total)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="'Mona Sans'">
                            {formatDate(order.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={order.deliveryType === 'delivery' ? <ShippingIcon size={16} weight="bold" /> : <AssignmentIcon size={16} weight="bold" />}
                            label={order.deliveryType === 'delivery' ? 'Domicilio' : 'Punto Encuentro'}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontFamily: "'Mona Sans'",
                              borderColor: alpha('#1F64BF', 0.2),
                              color: '#032CA6'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Más opciones">
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, order)}
                              size="small"
                              sx={{
                                '&:hover': {
                                  backgroundColor: alpha('#1F64BF', 0.1)
                                }
                              }}
                            >
                              <MoreVertIcon size={20} weight="bold" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 3,
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
              }}>
                <Button
                  variant="outlined"
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={!pagination.hasPrev || loading}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: alpha('#1F64BF', 0.3),
                    color: '#1F64BF',
                    minWidth: { xs: '100%', sm: 'auto' },
                    fontFamily: "'Mona Sans'",
                    '&:hover': {
                      borderColor: '#1F64BF',
                      backgroundColor: alpha('#1F64BF', 0.05),
                    },
                    '&:disabled': {
                      borderColor: alpha('#1F64BF', 0.1),
                      color: alpha('#1F64BF', 0.3),
                    }
                  }}
                >
                  ← Anterior
                </Button>
                
                <OrdersModernCard sx={{ 
                  px: 3, 
                  py: 1,
                  minWidth: { xs: '100%', sm: 'auto' },
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ color: '#032CA6', fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                    {pagination.page} de {pagination.totalPages}
                  </Typography>
                </OrdersModernCard>
                
                <Button
                  variant="outlined"
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={!pagination.hasNext || loading}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: alpha('#1F64BF', 0.3),
                    color: '#1F64BF',
                    minWidth: { xs: '100%', sm: 'auto' },
                    fontFamily: "'Mona Sans'",
                    '&:hover': {
                      borderColor: '#1F64BF',
                      backgroundColor: alpha('#1F64BF', 0.05),
                    },
                    '&:disabled': {
                      borderColor: alpha('#1F64BF', 0.1),
                      color: alpha('#1F64BF', 0.3),
                    }
                  }}
                >
                  Siguiente →
                </Button>
              </Box>
            )}
          </OrdersTable>
        </OrdersTableSection>

        {/* Menu de Acciones */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(1, 3, 38, 0.12)',
              border: `1px solid ${alpha('#1F64BF', 0.08)}`,
            }
          }}
        >
          <MenuItem onClick={() => handleViewOrder(selectedOrder)} sx={{ fontFamily: "'Mona Sans'" }}>
            <ViewIcon size={18} weight="bold" style={{ marginRight: '8px' }} />
            Ver Detalles
          </MenuItem>
          <MenuItem onClick={() => handleEditOrder(selectedOrder)} sx={{ fontFamily: "'Mona Sans'" }}>
            <EditIcon size={18} weight="bold" style={{ marginRight: '8px' }} />
            Editar
          </MenuItem>
          {selectedOrder?.status === 'pending_approval' && (
            <MenuItem onClick={() => handleQuoteOrder(selectedOrder)} sx={{ fontFamily: "'Mona Sans'" }}>
              <AssignmentIcon size={18} weight="bold" style={{ marginRight: '8px' }} />
              Cotizar
            </MenuItem>
          )}
        </Menu>

        {/* Dialog de Cotización */}
        <Dialog
          open={quoteDialogOpen}
          onClose={() => setQuoteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(1, 3, 38, 0.12)',
            }
          }}
        >
          <DialogTitle sx={{ fontFamily: "'Mona Sans'", fontWeight: 600, color: '#010326' }}>
            Cotizar Orden #{selectedOrder?.orderNumber}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Precio Total *"
                type="number"
                value={quoteForm.totalPrice}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, totalPrice: e.target.value }))}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, fontFamily: "'Mona Sans'" }}>$</Typography>
                }}
                required
                sx={{ fontFamily: "'Mona Sans'" }}
              />
              <TextField
                label="Costo de Envío"
                type="number"
                value={quoteForm.deliveryFee}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, deliveryFee: e.target.value }))}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, fontFamily: "'Mona Sans'" }}>$</Typography>
                }}
                sx={{ fontFamily: "'Mona Sans'" }}
              />
              <TextField
                label="Impuestos"
                type="number"
                value={quoteForm.tax}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, tax: e.target.value }))}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, fontFamily: "'Mona Sans'" }}>$</Typography>
                }}
                sx={{ fontFamily: "'Mona Sans'" }}
              />
              <TextField
                label="Notas (opcional)"
                multiline
                rows={3}
                value={quoteForm.notes}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, notes: e.target.value }))}
                sx={{ fontFamily: "'Mona Sans'" }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setQuoteDialogOpen(false)}
              sx={{ fontFamily: "'Mona Sans'", textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitQuote}
              variant="contained"
              disabled={actionLoading || !quoteForm.totalPrice}
              sx={{
                background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
                fontFamily: "'Mona Sans'",
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
                }
              }}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Enviar Cotización'}
            </Button>
          </DialogActions>
        </Dialog>
      </OrdersContentWrapper>
    </OrdersPageContainer>
  );
};

export default Orders;