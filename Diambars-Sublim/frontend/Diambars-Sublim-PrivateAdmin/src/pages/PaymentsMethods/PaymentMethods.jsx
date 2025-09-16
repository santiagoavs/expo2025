// src/pages/PaymentMethods/PaymentMethods.jsx - Página de métodos de pago refactorizada
import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
  Box,
  Typography,
  Button,
  Grid,
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
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Paper,
  styled,
  useTheme,
  alpha
} from '@mui/material';
import {
  Plus,
  CreditCard,
  Bank,
  CurrencyDollar,
  DotsThreeVertical,
  PencilSimple,
  Trash,
  Eye,
  Gear,
  TrendUp,
  ChartBar,
  MagnifyingGlass,
  Funnel,
  Broom,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { usePaymentConfig, usePaymentStats, usePaymentActions, usePaymentMethods, usePaymentMethodActions } from '../../hooks/usePayments';
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

// ================ ESTILOS MODERNOS RESPONSIVE - PAYMENT METHODS ================
const PaymentMethodsPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const PaymentMethodsContentWrapper = styled(Box)(({ theme }) => ({
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

const PaymentMethodsModernCard = styled(Paper)(({ theme }) => ({
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

const PaymentMethodsHeaderSection = styled(PaymentMethodsModernCard)(({ theme }) => ({
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

const PaymentMethodsHeaderContent = styled(Box)(({ theme }) => ({
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

const PaymentMethodsHeaderInfo = styled(Box)(({ theme }) => ({
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

const PaymentMethodsMainTitle = styled(Typography)(({ theme }) => ({
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

const PaymentMethodsMainDescription = styled(Typography)(({ theme }) => ({
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

const PaymentMethodsHeaderActions = styled(Box)(({ theme }) => ({
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

const PaymentMethodsPrimaryActionButton = styled(Button)(({ theme }) => ({
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

const PaymentMethodsSecondaryActionButton = styled(IconButton)(({ theme }) => ({
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

// CONTENEDOR UNIFICADO PAYMENT METHODS
const PaymentMethodsUnifiedContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
}));

const PaymentMethodsStatsContainer = styled(PaymentMethodsUnifiedContainer)(({ theme }) => ({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
}));

// GRID DE ESTADÍSTICAS PAYMENT METHODS
const PaymentMethodsStatsGrid = styled(Box)(({ theme }) => ({
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

const PaymentMethodsStatCard = styled(PaymentMethodsModernCard)(({ theme, variant }) => {
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

const PaymentMethodsStatHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
  width: '100%',
});

const PaymentMethodsStatIconContainer = styled(Box)(({ variant, theme }) => ({
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

const PaymentMethodsStatValue = styled(Typography)(({ variant, theme }) => ({
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

const PaymentMethodsStatLabel = styled(Typography)(({ variant, theme }) => ({
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

const PaymentMethodsStatChange = styled(Box)(({ variant, trend }) => ({
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

const PaymentMethodsStatTrendText = styled(Typography)(({ variant, trend, theme }) => ({
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

const PaymentMethodsSection = styled(PaymentMethodsUnifiedContainer)({
  marginBottom: '32px',
  position: 'relative',
  zIndex: 1,
});

const PaymentMethodsSectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '28px',
  paddingBottom: '18px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    marginBottom: '24px',
    paddingBottom: '16px',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '20px',
    paddingBottom: '12px',
  }
}));

const PaymentMethodsSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.6rem',
  fontWeight: 600,
  color: '#010326',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    fontSize: '1.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.3rem',
  }
}));

const PaymentMethods = () => {
  const { config, loading: configLoading, updateConfig } = usePaymentConfig();
  const { stats, loading: statsLoading, refreshStats } = usePaymentStats();
  const { methods, loading: methodsLoading, refreshMethods } = usePaymentMethods();
  const { createMethod, updateMethod, deleteMethod, loading: actionLoading } = usePaymentMethodActions();

  // Estados locales
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuMethod, setMenuMethod] = useState(null);

  // Estados del formulario
  const [methodForm, setMethodForm] = useState({
    name: '',
    type: 'wompi',
    enabled: true,
    config: {}
  });

  // Función para abrir menú de acciones
  const handleMenuOpen = (event, method) => {
    setAnchorEl(event.currentTarget);
    setMenuMethod(method);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuMethod(null);
  };

  // Función para abrir diálogo de método
  const handleOpenMethodDialog = (method = null) => {
    if (method) {
      setMethodForm({
        name: method.name,
        type: method.type,
        enabled: method.enabled,
        config: method.config || {}
      });
      setSelectedMethod(method);
    } else {
      setMethodForm({
        name: '',
        type: 'wompi',
        enabled: true,
        config: {}
      });
      setSelectedMethod(null);
    }
    setMethodDialogOpen(true);
  };

  // Función para guardar método
  const handleSaveMethod = async () => {
    try {
      if (selectedMethod) {
        await updateMethod(selectedMethod._id, methodForm);
        toast.success('Método actualizado correctamente');
      } else {
        await createMethod(methodForm);
        toast.success('Método creado correctamente');
      }
      
      setMethodDialogOpen(false);
      setMethodForm({ name: '', type: 'wompi', enabled: true, config: {} });
      setSelectedMethod(null);
      refreshMethods();
    } catch (error) {
      toast.error('Error al guardar el método');
    }
  };

  // Función para eliminar método
  const handleDeleteMethod = async (method) => {
    try {
      await deleteMethod(method._id);
      toast.success('Método eliminado correctamente');
      handleMenuClose();
      refreshMethods();
    } catch (error) {
      toast.error('Error al eliminar el método');
    }
  };

  // Función para obtener icono del método
  const getMethodIcon = (type) => {
    const icons = {
      wompi: <CreditCard size={20} weight="duotone" />,
      cash: <CurrencyDollar size={20} weight="duotone" />,
      bank: <Bank size={20} weight="duotone" />,
      card: <CreditCard size={20} weight="duotone" />
    };
    return icons[type] || <CreditCard size={20} weight="duotone" />;
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calcular estadísticas
  const paymentStats = useMemo(() => {
    if (!stats) return { totalPayments: 0, totalAmount: 0, successRate: 0, activeMethods: 0 };
    
    return {
      totalPayments: stats.totalPayments || 0,
      totalAmount: stats.totalAmount || 0,
      successRate: stats.successRate || 0,
      activeMethods: methods?.filter(m => m.enabled).length || 0
    };
  }, [stats, methods]);

  if (configLoading || statsLoading || methodsLoading) {
    return (
      <PaymentMethodsPageContainer>
        <PaymentMethodsContentWrapper>
          <CircularProgress />
        </PaymentMethodsContentWrapper>
      </PaymentMethodsPageContainer>
    );
  }

  return (
    <PaymentMethodsPageContainer>
      <PaymentMethodsContentWrapper>
        {/* HEADER SECTION */}
        <PaymentMethodsHeaderSection>
          <PaymentMethodsHeaderContent>
            <PaymentMethodsHeaderInfo>
              <PaymentMethodsMainTitle>
                Métodos de Pago
              </PaymentMethodsMainTitle>
              <PaymentMethodsMainDescription>
                Configura y gestiona los métodos de pago disponibles para tus clientes con herramientas avanzadas de monitoreo
              </PaymentMethodsMainDescription>
            </PaymentMethodsHeaderInfo>
            <PaymentMethodsHeaderActions>
              <PaymentMethodsPrimaryActionButton
                startIcon={<Gear size={18} weight="bold" />}
                onClick={() => setConfigDialogOpen(true)}
              >
                Configuración
              </PaymentMethodsPrimaryActionButton>
              <PaymentMethodsSecondaryActionButton
                onClick={() => handleOpenMethodDialog()}
                title="Nuevo Método"
              >
                <Plus size={20} weight="bold" />
              </PaymentMethodsSecondaryActionButton>
            </PaymentMethodsHeaderActions>
          </PaymentMethodsHeaderContent>
        </PaymentMethodsHeaderSection>

        {/* ESTADÍSTICAS */}
        <PaymentMethodsStatsContainer>
          <PaymentMethodsStatsGrid>
            <PaymentMethodsStatCard variant="primary">
              <PaymentMethodsStatHeader>
                <PaymentMethodsStatIconContainer variant="primary">
                  <ChartBar size={24} weight="duotone" />
                </PaymentMethodsStatIconContainer>
              </PaymentMethodsStatHeader>
              <PaymentMethodsStatValue variant="primary">
                {paymentStats.totalPayments}
              </PaymentMethodsStatValue>
              <PaymentMethodsStatLabel variant="primary">
                Total Procesado
              </PaymentMethodsStatLabel>
              <PaymentMethodsStatChange variant="primary" trend="up">
                <TrendUp size={14} weight="bold" />
                <PaymentMethodsStatTrendText variant="primary" trend="up">
                  Este mes
                </PaymentMethodsStatTrendText>
              </PaymentMethodsStatChange>
            </PaymentMethodsStatCard>

            <PaymentMethodsStatCard>
              <PaymentMethodsStatHeader>
                <PaymentMethodsStatIconContainer>
                  <CurrencyDollar size={24} weight="duotone" />
                </PaymentMethodsStatIconContainer>
              </PaymentMethodsStatHeader>
              <PaymentMethodsStatValue>
                {formatCurrency(paymentStats.totalAmount)}
              </PaymentMethodsStatValue>
              <PaymentMethodsStatLabel>
                Monto Total
              </PaymentMethodsStatLabel>
              <PaymentMethodsStatChange trend="up">
                <TrendUp size={14} weight="bold" />
                <PaymentMethodsStatTrendText trend="up">
                  +15% este mes
                </PaymentMethodsStatTrendText>
              </PaymentMethodsStatChange>
            </PaymentMethodsStatCard>

            <PaymentMethodsStatCard>
              <PaymentMethodsStatHeader>
                <PaymentMethodsStatIconContainer>
                  <TrendUp size={24} weight="duotone" />
                </PaymentMethodsStatIconContainer>
              </PaymentMethodsStatHeader>
              <PaymentMethodsStatValue>
                {paymentStats.successRate}%
              </PaymentMethodsStatValue>
              <PaymentMethodsStatLabel>
                Tasa de Éxito
              </PaymentMethodsStatLabel>
              <PaymentMethodsStatChange trend="up">
                <TrendUp size={14} weight="bold" />
                <PaymentMethodsStatTrendText trend="up">
                  +3% este mes
                </PaymentMethodsStatTrendText>
              </PaymentMethodsStatChange>
            </PaymentMethodsStatCard>

            <PaymentMethodsStatCard>
              <PaymentMethodsStatHeader>
                <PaymentMethodsStatIconContainer>
                  <CreditCard size={24} weight="duotone" />
                </PaymentMethodsStatIconContainer>
              </PaymentMethodsStatHeader>
              <PaymentMethodsStatValue>
                {paymentStats.activeMethods}
              </PaymentMethodsStatValue>
              <PaymentMethodsStatLabel>
                Métodos Activos
              </PaymentMethodsStatLabel>
              <PaymentMethodsStatChange trend="up">
                <TrendUp size={14} weight="bold" />
                <PaymentMethodsStatTrendText trend="up">
                  Disponibles
                </PaymentMethodsStatTrendText>
              </PaymentMethodsStatChange>
            </PaymentMethodsStatCard>
          </PaymentMethodsStatsGrid>
        </PaymentMethodsStatsContainer>

        {/* ESTADO DE CONFIGURACIÓN */}
        <PaymentMethodsSection>
          <PaymentMethodsSectionHeader>
            <PaymentMethodsSectionTitle>
              <Gear size={24} weight="duotone" />
              Estado de Configuración
            </PaymentMethodsSectionTitle>
          </PaymentMethodsSectionHeader>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <PaymentMethodsModernCard sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCard size={24} weight="duotone" style={{ marginRight: 16, color: config?.wompi?.enabled ? '#10b981' : '#ef4444' }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Wompi (Digital)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {config?.wompi?.message || 'No disponible'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={config?.wompi?.enabled ? 'Activo' : 'Inactivo'}
                    color={config?.wompi?.enabled ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </PaymentMethodsModernCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <PaymentMethodsModernCard sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CurrencyDollar size={24} weight="duotone" style={{ marginRight: 16, color: config?.cash?.enabled ? '#10b981' : '#ef4444' }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Efectivo
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {config?.cash?.message || 'No disponible'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={config?.cash?.enabled ? 'Activo' : 'Inactivo'}
                    color={config?.cash?.enabled ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </PaymentMethodsModernCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <PaymentMethodsModernCard sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Bank size={24} weight="duotone" style={{ marginRight: 16, color: config?.bank?.enabled ? '#10b981' : '#ef4444' }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Transferencia
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {config?.bank?.message || 'No disponible'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={config?.bank?.enabled ? 'Activo' : 'Inactivo'}
                    color={config?.bank?.enabled ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </PaymentMethodsModernCard>
            </Grid>
          </Grid>
        </PaymentMethodsSection>

        {/* LISTA DE MÉTODOS */}
        <PaymentMethodsSection>
          <PaymentMethodsSectionHeader>
            <PaymentMethodsSectionTitle>
              <CreditCard size={24} weight="duotone" />
              Métodos Configurados
            </PaymentMethodsSectionTitle>
          </PaymentMethodsSectionHeader>
          <PaymentMethodsModernCard>
            {methods && methods.length > 0 ? (
              <List>
                {methods.map((method, index) => (
                  <React.Fragment key={method._id}>
                    <ListItem>
                      <ListItemIcon>
                        {getMethodIcon(method.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={method.name}
                        secondary={`Tipo: ${method.type} | ${method.enabled ? 'Activo' : 'Inactivo'}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, method)}
                          size="small"
                        >
                          <DotsThreeVertical size={20} weight="bold" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < methods.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CreditCard size={48} weight="duotone" style={{ color: '#64748b', marginBottom: 16 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay métodos configurados
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Comienza agregando tu primer método de pago
                </Typography>
                <Button
                  startIcon={<Plus size={18} weight="bold" />}
                  onClick={() => handleOpenMethodDialog()}
                  sx={{ mt: 2 }}
                >
                  Agregar Primer Método
                </Button>
              </Box>
            )}
          </PaymentMethodsModernCard>
        </PaymentMethodsSection>

        {/* Menú de acciones */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => handleOpenMethodDialog(menuMethod)}>
            <PencilSimple size={18} weight="bold" style={{ marginRight: 8 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={() => handleDeleteMethod(menuMethod)}>
            <Trash size={18} weight="bold" style={{ marginRight: 8, color: '#ef4444' }} />
            Eliminar
          </MenuItem>
        </Menu>

        {/* Diálogo de método */}
        <Dialog
          open={methodDialogOpen}
          onClose={() => setMethodDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedMethod ? 'Editar Método' : 'Nuevo Método'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                label="Nombre del método"
                value={methodForm.name}
                onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={methodForm.type}
                  onChange={(e) => setMethodForm({ ...methodForm, type: e.target.value })}
                  label="Tipo"
                >
                  <MenuItem value="wompi">Wompi</MenuItem>
                  <MenuItem value="cash">Efectivo</MenuItem>
                  <MenuItem value="bank">Transferencia</MenuItem>
                  <MenuItem value="card">Tarjeta</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={methodForm.enabled}
                    onChange={(e) => setMethodForm({ ...methodForm, enabled: e.target.checked })}
                  />
                }
                label="Habilitado"
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMethodDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveMethod}
              variant="contained"
              disabled={actionLoading || !methodForm.name}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de configuración */}
        <Dialog
          open={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Configuración de Pagos</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Configuración Wompi
              </Typography>
              <TextField
                label="Public Key"
                value={config?.wompi?.publicKey || ''}
                onChange={(e) => updateConfig('wompi', { ...config?.wompi, publicKey: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Private Key"
                type="password"
                value={config?.wompi?.privateKey || ''}
                onChange={(e) => updateConfig('wompi', { ...config?.wompi, privateKey: e.target.value })}
                fullWidth
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config?.wompi?.enabled || false}
                    onChange={(e) => updateConfig('wompi', { ...config?.wompi, enabled: e.target.checked })}
                  />
                }
                label="Habilitar Wompi"
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfigDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </PaymentMethodsContentWrapper>
    </PaymentMethodsPageContainer>
  );
};

export default PaymentMethods;