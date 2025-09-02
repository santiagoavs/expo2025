import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Stack,
  Divider,
  Badge,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Container,
  styled,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  MagnifyingGlass,
  Funnel,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  CurrencyDollar,
  User,
  Calendar,
  Envelope,
  ShoppingCart,
  Camera,
  ArrowClockwise,
  DotsThreeVertical,
  TrendUp,
  GridNine,
  Broom,
  Star,
  ChartBar
} from '@phosphor-icons/react';
import Swal from 'sweetalert2';
import OrderDetailModal from '../../components/Orders/OrderDetailModal';
import QuoteModal from '../../components/Orders/QuoteModal';
import CreateOrderModal from '../../components/Orders/CreateOrderModal';

// ================ ESTILOS MODERNOS RESPONSIVE - ORDERS ================
const OrdersPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
  '&:hover': {
    boxShadow: '0 4px 24px rgba(1, 3, 38, 0.08)',
    transform: 'translateY(-1px)',
  }
}));

const OrdersHeaderSection = styled(OrdersModernCard)(({ theme }) => ({
  padding: '40px',
  marginBottom: '32px',
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
  fontWeight: 700,
  color: '#010326',
  marginBottom: '12px',
  letterSpacing: '-0.025em',
  lineHeight: 1.2,
  textAlign: 'left',
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
  fontWeight: 400,
  lineHeight: 1.6,
  opacity: 0.9,
  textAlign: 'left',
  maxWidth: '600px',
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

const StyledCard = styled(OrdersModernCard)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval':
        return { bg: alpha('#FFC107', 0.1), color: '#B8860B', border: alpha('#FFC107', 0.3) };
      case 'quoted':
        return { bg: alpha('#1F64BF', 0.1), color: '#1F64BF', border: alpha('#1F64BF', 0.3) };
      case 'approved':
        return { bg: alpha('#28A745', 0.1), color: '#28A745', border: alpha('#28A745', 0.3) };
      case 'in_production':
        return { bg: alpha('#17A2B8', 0.1), color: '#17A2B8', border: alpha('#17A2B8', 0.3) };
      case 'ready_for_delivery':
        return { bg: alpha('#6F42C1', 0.1), color: '#6F42C1', border: alpha('#6F42C1', 0.3) };
      case 'delivered':
        return { bg: alpha('#20C997', 0.1), color: '#20C997', border: alpha('#20C997', 0.3) };
      case 'completed':
        return { bg: alpha('#28A745', 0.1), color: '#28A745', border: alpha('#28A745', 0.3) };
      case 'cancelled':
        return { bg: alpha('#DC3545', 0.1), color: '#DC3545', border: alpha('#DC3545', 0.3) };
      case 'rejected':
        return { bg: alpha('#DC3545', 0.1), color: '#DC3545', border: alpha('#DC3545', 0.3) };
      default:
        return { bg: alpha('#6C757D', 0.1), color: '#6C757D', border: alpha('#6C757D', 0.3) };
    }
  };

  const colors = getStatusColor(status);
  
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '28px',
    '& .MuiChip-label': {
      padding: '0 8px',
    },
  };
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 16px',
  minWidth: 'auto',
  '&.primary': {
    background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
    },
  },
  '&.secondary': {
    backgroundColor: alpha('#1F64BF', 0.08),
    color: '#1F64BF',
    border: `1px solid ${alpha('#1F64BF', 0.2)}`,
    '&:hover': {
      backgroundColor: alpha('#1F64BF', 0.12),
    },
  },
  '&.success': {
    backgroundColor: '#28A745',
    color: 'white',
    '&:hover': {
      backgroundColor: '#218838',
    },
  },
  '&.danger': {
    backgroundColor: '#DC3545',
    color: 'white',
    '&:hover': {
      backgroundColor: '#C82333',
    },
  },
  '&.warning': {
    backgroundColor: '#FFC107',
    color: '#212529',
    '&:hover': {
      backgroundColor: '#E0A800',
    },
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
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

const FilterCard = styled(OrdersModernCard)(({ theme }) => ({
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

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(30px, -30px)',
  },
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
  },
}));

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

// Mock data para el diseño
const mockOrders = [
  {
    _id: '1',
    orderNumber: 'DS2412010001',
    user: { name: 'Juan Pérez', email: 'juan@email.com', phone: '+503 1234-5678' },
    status: 'pending_approval',
    total: 45.50,
    subtotal: 40.00,
    deliveryFee: 3.50,
    tax: 2.00,
    deliveryType: 'delivery',
    createdAt: '2024-12-01T10:30:00Z',
    estimatedReadyDate: '2024-12-05T18:00:00Z',
    items: [
      {
        product: { name: 'Camiseta Básica', images: ['/placeholder.jpg'] },
        design: { name: 'Logo Empresa', previewImage: '/placeholder.jpg' },
        quantity: 2,
        unitPrice: 20.00,
        subtotal: 40.00,
        status: 'pending',
        productionProgress: 0
      }
    ],
    payment: { method: 'cash', status: 'pending', timing: 'on_delivery' },
    clientNotes: 'Por favor entregar en horario de oficina',
    productionPhotos: []
  },
  {
    _id: '2',
    orderNumber: 'DS2412010002',
    user: { name: 'María González', email: 'maria@email.com', phone: '+503 8765-4321' },
    status: 'in_production',
    total: 78.00,
    subtotal: 70.00,
    deliveryFee: 5.00,
    tax: 3.00,
    deliveryType: 'meetup',
    createdAt: '2024-11-30T14:15:00Z',
    estimatedReadyDate: '2024-12-03T16:00:00Z',
    items: [
      {
        product: { name: 'Taza Personalizada', images: ['/placeholder.jpg'] },
        design: { name: 'Diseño Floral', previewImage: '/placeholder.jpg' },
        quantity: 5,
        unitPrice: 14.00,
        subtotal: 70.00,
        status: 'in_production',
        productionProgress: 60
      }
    ],
    payment: { method: 'transfer', status: 'paid', timing: 'advance' },
    clientNotes: '',
    productionPhotos: [
      { stage: 'printing', url: '/placeholder.jpg', clientApproved: true },
      { stage: 'sublimating', url: '/placeholder.jpg', clientApproved: false }
    ]
  },
  {
    _id: '3',
    orderNumber: 'DS2412010003',
    user: { name: 'Carlos Rodríguez', email: 'carlos@email.com', phone: '+503 5555-1234' },
    status: 'ready_for_delivery',
    total: 125.50,
    subtotal: 110.00,
    deliveryFee: 10.00,
    tax: 5.50,
    deliveryType: 'delivery',
    createdAt: '2024-11-28T09:45:00Z',
    estimatedReadyDate: '2024-12-01T12:00:00Z',
    items: [
      {
        product: { name: 'Hoodie Premium', images: ['/placeholder.jpg'] },
        design: { name: 'Logo Deportivo', previewImage: '/placeholder.jpg' },
        quantity: 3,
        unitPrice: 36.67,
        subtotal: 110.00,
        status: 'ready',
        productionProgress: 100
      }
    ],
    payment: { method: 'card', status: 'paid', timing: 'advance' },
    clientNotes: 'Entregar en la mañana',
    productionPhotos: [
      { stage: 'printing', url: '/placeholder.jpg', clientApproved: true },
      { stage: 'sublimating', url: '/placeholder.jpg', clientApproved: true },
      { stage: 'quality_check', url: '/placeholder.jpg', clientApproved: true },
      { stage: 'final', url: '/placeholder.jpg', clientApproved: true }
    ]
  }
];

const statusLabels = {
  'pending_approval': 'Pendiente Aprobación',
  'quoted': 'Cotizado',
  'approved': 'Aprobado',
  'in_production': 'En Producción',
  'ready_for_delivery': 'Listo para Entrega',
  'delivered': 'Entregado',
  'completed': 'Completado',
  'cancelled': 'Cancelado',
  'rejected': 'Rechazado'
};

const statusIcons = {
  'pending_approval': Clock,
  'quoted': CurrencyDollar,
  'approved': CheckCircle,
  'in_production': Package,
  'ready_for_delivery': Truck,
  'delivered': CheckCircle,
  'completed': CheckCircle,
  'cancelled': XCircle,
  'rejected': XCircle
};

export default function Orders() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Estadísticas mock
  const stats = {
    total: 156,
    pending: 23,
    inProduction: 45,
    ready: 12,
    completed: 76
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleCreateOrder = () => {
    setIsCreateModalOpen(true);
  };

  const handleQuoteOrder = (order) => {
    setSelectedOrder(order);
    setIsQuoteModalOpen(true);
  };

  const handleCreateOrderSubmit = (orderData) => {
    // Aquí iría la lógica para crear el pedido
    console.log('Creando pedido:', orderData);
    Swal.fire('¡Éxito!', 'Pedido creado exitosamente', 'success');
  };

  const handleQuoteSubmit = (quoteData) => {
    // Aquí iría la lógica para enviar la cotización
    console.log('Enviando cotización:', quoteData);
    Swal.fire('¡Éxito!', 'Cotización enviada al cliente', 'success');
  };

  const handleStatusChange = (orderId, newStatus) => {
    Swal.fire({
      title: '¿Confirmar cambio de estado?',
      text: `¿Estás seguro de cambiar el estado a "${statusLabels[newStatus]}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1F64BF',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí iría la lógica para cambiar el estado
        Swal.fire('¡Actualizado!', 'El estado del pedido ha sido cambiado.', 'success');
      }
    });
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    const IconComponent = statusIcons[status];
    return IconComponent ? <IconComponent size={16} /> : <Clock size={16} />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <OrdersPageContainer>
      <OrdersContentWrapper>
        {/* Header Principal */}
        <OrdersHeaderSection>
          <OrdersHeaderContent>
            <OrdersHeaderInfo>
              <OrdersMainTitle>
                Gestión de Pedidos
              </OrdersMainTitle>
              <OrdersMainDescription>
                Administra y supervisa todos los pedidos de la plataforma
              </OrdersMainDescription>
            </OrdersHeaderInfo>
            
            <OrdersHeaderActions>
              <OrdersPrimaryActionButton
                onClick={handleCreateOrder}
                startIcon={<Plus size={18} weight="bold" />}
              >
                Nuevo Pedido
              </OrdersPrimaryActionButton>
              
              <OrdersSecondaryActionButton
                title="Refrescar pedidos"
              >
                <ArrowClockwise size={20} weight="bold" />
              </OrdersSecondaryActionButton>
            </OrdersHeaderActions>
          </OrdersHeaderContent>
        </OrdersHeaderSection>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatsCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Pedidos
                    </Typography>
                  </Box>
                  <ShoppingCart size={32} />
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFC107' }}>
                      {stats.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pendientes
                    </Typography>
                  </Box>
                  <Clock size={32} color="#FFC107" />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#17A2B8' }}>
                      {stats.inProduction}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En Producción
                    </Typography>
                  </Box>
                  <Package size={32} color="#17A2B8" />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#28A745' }}>
                      {stats.ready}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Listos
                    </Typography>
                  </Box>
                  <Truck size={32} color="#28A745" />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#6F42C1' }}>
                      {stats.completed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completados
                    </Typography>
                  </Box>
                  <CheckCircle size={32} color="#6F42C1" />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Filtros y Búsqueda */}
        <FilterCard>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <SearchField
                fullWidth
                placeholder="Buscar por número de pedido, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlass size={18} weight="bold" color="#032CA6" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">Todos los estados</MenuItem>
                  <MenuItem value="pending_approval">Pendiente Aprobación</MenuItem>
                  <MenuItem value="quoted">Cotizado</MenuItem>
                  <MenuItem value="approved">Aprobado</MenuItem>
                  <MenuItem value="in_production">En Producción</MenuItem>
                  <MenuItem value="ready_for_delivery">Listo para Entrega</MenuItem>
                  <MenuItem value="delivered">Entregado</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                  <MenuItem value="rejected">Rechazado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={2}>
                <ActionButton
                  variant="outlined"
                  startIcon={<Funnel size={16} />}
                  className="secondary"
                >
                  Filtros
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  startIcon={<ArrowClockwise size={16} />}
                  className="secondary"
                >
                  Actualizar
                </ActionButton>
              </Stack>
            </Grid>
          </Grid>
        </FilterCard>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: '48px',
              },
            }}
          >
            <Tab label="Todos los Pedidos" />
            <Tab label="Pendientes" />
            <Tab label="En Producción" />
            <Tab label="Listos" />
            <Tab label="Completados" />
          </Tabs>
        </Box>

        {/* Lista de Pedidos */}
        <Grid container spacing={3}>
          {filteredOrders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <StyledCard>
                <CardContent>
                  <Grid container spacing={3} alignItems="center">
                    {/* Información Principal */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#010326' }}>
                          {order.orderNumber}
                        </Typography>
                        <StatusChip
                          label={statusLabels[order.status]}
                          status={order.status}
                          icon={getStatusIcon(order.status)}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <User size={16} color="#6C757D" />
                        <Typography variant="body2" color="text.secondary">
                          {order.user.name}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Envelope size={16} color="#6C757D" />
                        <Typography variant="body2" color="text.secondary">
                          {order.user.email}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calendar size={16} color="#6C757D" />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Información de Productos */}
                    <Grid item xs={12} md={3}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Productos
                        </Typography>
                        {order.items.map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Avatar
                              src={item.product.images[0]}
                              sx={{ width: 32, height: 32 }}
                            >
                              <Package size={16} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Cantidad: {item.quantity}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Grid>

                    {/* Información Financiera */}
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#28A745', mb: 1 }}>
                          {formatCurrency(order.total)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Subtotal: {formatCurrency(order.subtotal)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Envío: {formatCurrency(order.deliveryFee)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Impuestos: {formatCurrency(order.tax)}
                        </Typography>
                        
                        {/* Progreso de Producción */}
                        {order.status === 'in_production' && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Progreso
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.items[0].productionProgress}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={order.items[0].productionProgress}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: '#E9ECEF',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: '#28A745',
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                        )}

                        {/* Fotos Pendientes */}
                        {order.productionPhotos?.some(photo => !photo.clientApproved) && (
                          <Badge
                            badgeContent={order.productionPhotos.filter(photo => !photo.clientApproved).length}
                            color="warning"
                            sx={{ mb: 2 }}
                          >
                            <Chip
                              label="Fotos Pendientes"
                              size="small"
                              color="warning"
                              icon={<Camera size={14} />}
                            />
                          </Badge>
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Acciones */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <ActionButton
                        size="small"
                        startIcon={<Eye size={16} />}
                        onClick={() => handleViewOrder(order)}
                        className="secondary"
                      >
                        Ver Detalles
                      </ActionButton>
                      
                      {order.status === 'pending_approval' && (
                        <ActionButton
                          size="small"
                          startIcon={<CurrencyDollar size={16} />}
                          onClick={() => handleQuoteOrder(order)}
                          className="primary"
                        >
                          Cotizar
                        </ActionButton>
                      )}
                      
                      {order.status === 'approved' && (
                        <ActionButton
                          size="small"
                          startIcon={<Package size={16} />}
                          onClick={() => handleStatusChange(order._id, 'in_production')}
                          className="success"
                        >
                          Iniciar Producción
                        </ActionButton>
                      )}
                      
                      {order.status === 'in_production' && (
                        <ActionButton
                          size="small"
                          startIcon={<Truck size={16} />}
                          onClick={() => handleStatusChange(order._id, 'ready_for_delivery')}
                          className="warning"
                        >
                          Marcar Listo
                        </ActionButton>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Más opciones">
                        <IconButton size="small">
                          <DotsThreeVertical size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {/* Botón Flotante */}
        <FloatingActionButton
          color="primary"
          onClick={handleCreateOrder}
        >
          <Plus size={24} />
        </FloatingActionButton>

        {/* Modales */}
        <OrderDetailModal
          open={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          order={selectedOrder}
        />

        <CreateOrderModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateOrderSubmit}
        />

        <QuoteModal
          open={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          order={selectedOrder}
          onQuote={handleQuoteSubmit}
        />
      </OrdersContentWrapper>
    </OrdersPageContainer>
  );
}
