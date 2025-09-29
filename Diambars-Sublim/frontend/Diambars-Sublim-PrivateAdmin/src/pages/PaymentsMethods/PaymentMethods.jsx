import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  styled,
  alpha
} from '@mui/material';
import {
  Plus,
  DotsThree,
  PencilSimple,
  Trash,
  ChartBar,
  CreditCard,
  Bank,
  Money,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';
import { usePaymentModals } from '../../hooks/usePaymentModals';
import PaymentMethodConfigModal from '../../components/PaymentMethodModals/PaymentMethodConfigModal';
import PaymentStatsModal from '../../components/PaymentMethodModals/PaymentStatsModal';
import paymentConfigService from '../../api/PaymentConfigService';
import toast from 'react-hot-toast';

// ================ ESTILOS MODERNOS RESPONSIVE - PAYMENT METHODS ================
const PaymentPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const PaymentContentWrapper = styled(Box)(({ theme }) => ({
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

const PaymentModernCard = styled(Paper)(({ theme }) => ({
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

const PaymentHeaderSection = styled(PaymentModernCard)(({ theme }) => ({
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

const PaymentHeaderContent = styled(Box)(({ theme }) => ({
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

const PaymentHeaderInfo = styled(Box)(({ theme }) => ({
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

const PaymentMainTitle = styled(Typography)(({ theme }) => ({
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

const PaymentMainDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: '#032CA6',
  fontWeight: '700 !important',
  lineHeight: 1.6,
  opacity: 0.9,
  textAlign: 'left',
  maxWidth: '600px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('md')]: {
    textAlign: 'center',
    maxWidth: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
  }
}));

const PaymentActionsSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    width: '100%',
    gap: '12px',
  }
}));

const PaymentModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '1rem',
  fontFamily: "'Mona Sans'",
  fontWeight: '600',
  padding: '12px 24px',
  minHeight: '48px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 2px 8px rgba(1, 3, 38, 0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(1, 3, 38, 0.15)',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    minHeight: '52px',
  }
}));

const PaymentMethodCard = styled(PaymentModernCard)(({ theme }) => ({
  padding: '24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)',
    transform: 'translateY(-4px)',
  },
  [theme.breakpoints.down('md')]: {
    padding: '20px',
  }
}));

const PaymentMethods = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down(480));

  // Estados locales simples
  const [configs, setConfigs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar configuraciones
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await paymentConfigService.getPaymentConfigs();
      if (response.success) {
        setConfigs(response.configs || []);
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await paymentConfigService.getPaymentStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadConfigs();
    loadStats();
  }, []);

  // Hook para gestión de modales
  const {
    configModalOpen,
    statsModalOpen,
    selectedConfigMethod,
    modalMode,
    openConfigModal,
    closeConfigModal,
    openStatsModal,
    closeStatsModal
  } = usePaymentModals();

  // Estados para menús
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuMethod, setMenuMethod] = useState(null);

  // Manejar menú
  const handleMenuOpen = (event, method) => {
    setAnchorEl(event.currentTarget);
    setMenuMethod(method);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuMethod(null);
  };

  // Abrir modal de configuración
  const handleOpenConfigMethodDialog = (method = null) => {
    if (method) {
      openConfigModal(method, 'edit');
    } else {
      openConfigModal(null, 'create');
    }
  };

  // Guardar método de configuración
  const handleSaveConfigMethod = async (configData) => {
    try {
      if (modalMode === 'create') {
        await paymentConfigService.createPaymentConfig(configData);
        toast.success('Método de pago creado exitosamente');
      } else {
        await paymentConfigService.updatePaymentConfig(selectedConfigMethod.type, configData);
        toast.success('Método de pago actualizado exitosamente');
      }
      
      await loadConfigs();
      await loadStats();
      closeConfigModal();
    } catch (error) {
      console.error('Error guardando método de pago:', error);
      toast.error('Error al guardar el método de pago');
    }
  };

  // Eliminar método de configuración
  const handleDeleteConfigMethod = async (type) => {
    try {
      await paymentConfigService.deletePaymentConfig(type);
      toast.success('Método de pago eliminado exitosamente');
      await loadConfigs();
      await loadStats();
    } catch (error) {
      console.error('Error eliminando método de pago:', error);
      toast.error('Error al eliminar el método de pago');
    }
    handleMenuClose();
  };

  // Obtener icono del método
  const getMethodIcon = (type) => {
    switch (type) {
      case 'wompi':
        return <CreditCard size={24} />;
      case 'cash':
        return <Money size={24} />;
      case 'bank_transfer':
        return <Bank size={24} />;
      case 'credit_card':
        return <CreditCard size={24} />;
      default:
        return <CreditCard size={24} />;
    }
  };

  // Obtener color del método
  const getMethodColor = (type) => {
    switch (type) {
      case 'wompi':
        return '#8B5CF6';
      case 'cash':
        return '#10B981';
      case 'bank_transfer':
        return '#3B82F6';
      case 'credit_card':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  // Obtener nombre del método
  const getMethodName = (type) => {
    switch (type) {
      case 'wompi':
        return 'Wompi';
      case 'cash':
        return 'Efectivo';
      case 'bank_transfer':
        return 'Transferencia Bancaria';
      case 'credit_card':
        return 'Tarjeta de Crédito';
      default:
        return type;
    }
  };

  return (
    <PaymentPageContainer>
      <PaymentContentWrapper>
        {/* Header Section */}
        <PaymentHeaderSection>
          <PaymentHeaderContent>
            <PaymentHeaderInfo>
              <PaymentMainTitle>
                Métodos de Pago
              </PaymentMainTitle>
              <PaymentMainDescription>
                Gestiona los métodos de pago disponibles para tus clientes
              </PaymentMainDescription>
            </PaymentHeaderInfo>
            
            <PaymentActionsSection>
              <PaymentModernButton
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => handleOpenConfigMethodDialog()}
                sx={{
                  backgroundColor: '#032CA6',
                  '&:hover': {
                    backgroundColor: '#021A7A',
                  }
                }}
              >
                Agregar Método
              </PaymentModernButton>
              
              <PaymentModernButton
                variant="outlined"
                startIcon={<ChartBar size={20} />}
                onClick={openStatsModal}
                sx={{
                  borderColor: '#032CA6',
                  color: '#032CA6',
                  '&:hover': {
                    borderColor: '#021A7A',
                    backgroundColor: alpha('#032CA6', 0.04),
                  }
                }}
              >
                Ver Estadísticas
              </PaymentModernButton>
            </PaymentActionsSection>
          </PaymentHeaderContent>
        </PaymentHeaderSection>

        {/* Lista de métodos */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={40} sx={{ color: '#032CA6' }} />
          </Box>
        ) : configs.length === 0 ? (
          <PaymentModernCard sx={{ p: 4, textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#032CA6',
                fontWeight: 600,
                mb: 2,
                fontFamily: "'Mona Sans'"
              }}
            >
              No hay métodos de pago configurados
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#6B7280',
                mb: 3,
                fontFamily: "'Mona Sans'"
              }}
            >
              Agrega un método de pago para comenzar
            </Typography>
            <PaymentModernButton
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => handleOpenConfigMethodDialog()}
              sx={{
                backgroundColor: '#032CA6',
                '&:hover': {
                  backgroundColor: '#021A7A',
                }
              }}
            >
              Agregar Primer Método
            </PaymentModernButton>
          </PaymentModernCard>
        ) : (
          <Grid container spacing={3}>
            {configs.map((config) => (
              <Grid item xs={12} sm={6} md={4} key={config.type}>
                <PaymentMethodCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: `${getMethodColor(config.type)}15`,
                        color: getMethodColor(config.type),
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {getMethodIcon(config.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#010326',
                          fontSize: '1.1rem',
                          fontFamily: "'Mona Sans'",
                          mb: 0.5
                        }}
                      >
                        {config.name || getMethodName(config.type)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6B7280',
                          fontSize: '0.9rem',
                          fontFamily: "'Mona Sans'"
                        }}
                      >
                        {getMethodName(config.type)}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, config)}
                      sx={{
                        color: '#6B7280',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha('#032CA6', 0.08),
                          color: '#032CA6'
                        }
                      }}
                    >
                      <DotsThree size={20} />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Chip
                      icon={config.enabled ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      label={config.enabled ? 'Habilitado' : 'Deshabilitado'}
                      color={config.enabled ? 'success' : 'error'}
                      size="small"
                      sx={{
                        borderRadius: 3,
                        fontSize: '0.8rem',
                        fontFamily: "'Mona Sans'",
                        fontWeight: 600
                      }}
                    />
                  </Box>

                  {config.message && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6B7280',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        fontFamily: "'Mona Sans'"
                      }}
                    >
                      {config.message}
                    </Typography>
                  )}
                </PaymentMethodCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Menú de acciones */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 180,
              boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)',
              border: `1px solid ${alpha('#1F64BF', 0.08)}`,
              mt: 1
            }
          }}
        >
          <MenuItem
            onClick={() => {
              handleOpenConfigMethodDialog(menuMethod);
              handleMenuClose();
            }}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              fontFamily: "'Mona Sans'",
              fontWeight: 500,
              '&:hover': {
                backgroundColor: alpha('#032CA6', 0.08),
                color: '#032CA6'
              }
            }}
          >
            <ListItemIcon>
              <PencilSimple size={20} />
            </ListItemIcon>
            <ListItemText primary="Editar" />
          </MenuItem>
          <MenuItem
            onClick={() => handleDeleteConfigMethod(menuMethod?.type)}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              color: '#DC2626',
              fontFamily: "'Mona Sans'",
              fontWeight: 500,
              '&:hover': {
                backgroundColor: alpha('#DC2626', 0.08),
                color: '#DC2626'
              }
            }}
          >
            <ListItemIcon>
              <Trash size={20} />
            </ListItemIcon>
            <ListItemText primary="Eliminar" />
          </MenuItem>
        </Menu>

        {/* Modales */}
        <PaymentMethodConfigModal
          open={configModalOpen}
          onClose={closeConfigModal}
          selectedMethod={selectedConfigMethod}
          mode={modalMode}
          onSave={handleSaveConfigMethod}
        />

        <PaymentStatsModal
          open={statsModalOpen}
          onClose={closeStatsModal}
          stats={stats}
        />
      </PaymentContentWrapper>
    </PaymentPageContainer>
  );
};

export default PaymentMethods;