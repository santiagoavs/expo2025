// src/pages/PaymentMethods/PaymentMethods.jsx - Diseño UX/UI Mejorado
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Container,
  Stack,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  alpha,
  Fab
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
  ArrowsClockwise,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';
import { usePaymentConfig, usePaymentStats, usePaymentActions, usePaymentMethods, usePaymentMethodActions } from '../../hooks/usePayments';
import { usePaymentConfigManagement } from '../../hooks/usePaymentConfig';
import { usePaymentModals } from '../../hooks/usePaymentModals';
import PaymentMethodConfigModal from '../../components/PaymentMethodModals/PaymentMethodConfigModal';
import UserPaymentMethodModal from '../../components/PaymentMethodModals/UserPaymentMethodModal';
import PaymentStatsModal from '../../components/PaymentMethodModals/PaymentStatsModal';
import PaymentActionButtons from '../../components/PaymentMethodModals/PaymentActionButtons';
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
      container.style.zIndex = '1500';
    }
  }
});

const PaymentMethods = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down(480));

  // Hooks para configuración de métodos de pago del sistema
  const { 
    configs, 
    stats, 
    loading, 
    upsertConfig, 
    updateConfig, 
    deleteConfig 
  } = usePaymentConfigManagement();
  
  // Hooks legacy para compatibilidad (tarjetas de usuarios)
  const { methods, loading: methodsLoading, refreshMethods } = usePaymentMethods();
  const { createMethod, updateMethod, deleteMethod, loading: actionLoading } = usePaymentMethodActions();

  // Hook para gestión de modales
  const {
    configModalOpen,
    userMethodModalOpen,
    statsModalOpen,
    selectedConfigMethod,
    selectedUserMethod,
    modalMode,
    openConfigModal,
    closeConfigModal,
    openUserMethodModal,
    closeUserMethodModal,
    openStatsModal,
    closeStatsModal
  } = usePaymentModals();

  // Estados locales
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuMethod, setMenuMethod] = useState(null);
  const [updatingConfig, setUpdatingConfig] = useState(null);

  // Función para actualizar configuración con debounce
  const handleConfigUpdate = useCallback(async (type, updates) => {
    if (updatingConfig === type) return; // Evitar múltiples actualizaciones simultáneas
    
    try {
      setUpdatingConfig(type);
      const existingConfig = configs?.find(c => c.type === type);
      if (existingConfig) {
        await updateConfig(type, {
          type: existingConfig.type,
          name: existingConfig.name,
          enabled: existingConfig.enabled,
          config: existingConfig.config,
          message: existingConfig.message,
          ...updates
        });
      }
    } catch (error) {
      console.error('Error actualizando configuración:', error);
    } finally {
      setUpdatingConfig(null);
    }
  }, [configs, updateConfig, updatingConfig]);

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

  // Función para abrir diálogo de método de configuración
  const handleOpenConfigMethodDialog = (method = null) => {
    if (method) {
      openConfigModal(method, 'edit');
    } else {
      openConfigModal(null, 'create');
    }
  };

  // Función para abrir diálogo de método de usuario
  const handleOpenUserMethodDialog = (method = null) => {
    if (method) {
      openUserMethodModal(method, 'edit');
    } else {
      openUserMethodModal(null, 'create');
    }
  };

  // Función para guardar método (ahora usa el nuevo sistema de configuración)
  const handleSaveMethod = async () => {
    try {
      if (selectedMethod) {
        await updateConfig(selectedMethod.type, methodForm);
        toast.success('Método actualizado correctamente');
      } else {
        await upsertConfig(methodForm);
        toast.success('Método creado correctamente');
      }
      
      closeUserMethodModal();
      setMethodForm({ name: '', type: 'wompi', enabled: true, config: {} });
      // setSelectedMethod(null); // Removed - using modal hooks now
    } catch (error) {
      toast.error('Error al guardar el método');
    }
  };

  // Función para eliminar método (ahora usa el nuevo sistema de configuración)
  const handleDeleteMethod = async (method) => {
    try {
      await deleteConfig(method.type);
      toast.success('Método eliminado correctamente');
      handleMenuClose();
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
      activeMethods: configs?.filter(c => c.enabled).length || 0
    };
  }, [stats, configs]);

  if (loading || methodsLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: '#FAFBFC'
        }}
      >
        <CircularProgress size={48} thickness={3.6} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'white',
        fontFamily: "'Mona Sans', system-ui, sans-serif",
        pt: {
          xs: 10,
          sm: 12,
          md: 14,
          lg: 16
        },
        pb: { xs: 4, sm: 6, md: 8 }
      }}
    >
      {/* Container principal optimizado */}
      <Container 
        maxWidth={false}
        sx={{
          maxWidth: '100%',
          mx: 'auto',
          px: {
            xs: 1.5,
            sm: 2,
            md: 2.5,
            lg: 3,
            xl: 4
          },
          width: '100%'
        }}
      >
        {/* HEADER SECTION - Diseño mejorado */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: { xs: 3, md: 4 },
            border: `1px solid ${alpha('#1F64BF', 0.06)}`,
            boxShadow: '0 8px 32px rgba(31, 100, 191, 0.08)',
            p: {
              xs: 2.5,
              sm: 3,
              md: 3.5,
              lg: 4
            },
            mb: { xs: 2.5, sm: 3, md: 4 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(31, 100, 191, 0.03) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(50px, -50px)'
            }
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'center', lg: 'center' }}
            spacing={{ xs: 4, lg: 6 }}
            sx={{ 
              textAlign: { xs: 'center', lg: 'left' },
              position: 'relative',
              zIndex: 1,
              minHeight: { lg: '120px' }
            }}
          >
            {/* Información del header mejorada */}
            <Box sx={{ flex: 1, maxWidth: { lg: '70%' } }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: {
                    xs: '2rem',
                    sm: '2.25rem',
                    md: '2.5rem',
                    lg: '2.75rem'
                  },
                  fontWeight: 800,
                  color: '#010326',
                  mb: { xs: 2, md: 3 },
                  letterSpacing: '-0.03em',
                  lineHeight: { xs: 1.1, md: 1.05 },
                  fontFamily: "'Mona Sans'",
                  background: 'linear-gradient(135deg, #010326 0%, #1F64BF 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Métodos de Pago
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: {
                    xs: '1rem',
                    sm: '1.125rem',
                    md: '1.125rem'
                  },
                  color: '#64748B',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  maxWidth: { md: '600px', lg: '100%' },
                  fontFamily: "'Mona Sans'"
                }}
              >
                Gestiona de forma inteligente todos los métodos de pago disponibles para tus clientes con análisis en tiempo real
              </Typography>
            </Box>

            {/* Botones de acción optimizados */}
            <PaymentActionButtons
              onOpenConfigModal={() => openConfigModal()}
              onOpenUserMethodModal={() => openUserMethodModal()}
              onOpenStatsModal={() => openStatsModal()}
              configs={configs}
              userMethods={methods}
            />
          </Stack>
        </Paper>

        {/* ESTADÍSTICAS - Grid fluido y adaptativo */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.375rem' },
              fontWeight: 700,
              color: '#010326',
              mb: { xs: 3, md: 4 },
              fontFamily: "'Mona Sans'"
            }}
          >
            Estadísticas Generales
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 1.5, sm: 2, md: 2.5 },
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)'
              }
            }}
          >
            {/* Estadística principal */}
            <Paper
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
                color: 'white',
                borderRadius: { xs: 3, md: 4 },
                p: { xs: 2.5, md: 3 },
                position: 'relative',
                overflow: 'hidden',
                minHeight: { xs: 140, md: 160 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gridColumn: { xs: '1', sm: '1 / -1', lg: '1' },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <ChartBar size={isMobile ? 24 : 28} weight="duotone" />
                </Box>
              </Stack>
              
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '2rem', md: '2.25rem' },
                    fontWeight: 800,
                    lineHeight: 1,
                    mb: 1,
                    fontFamily: "'Mona Sans'"
                  }}
                >
                  {paymentStats.totalPayments.toLocaleString()}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    fontWeight: 500,
                    opacity: 0.9,
                    mb: 2,
                    fontFamily: "'Mona Sans'"
                  }}
                >
                  Pagos Procesados
                </Typography>
                
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    width: 'fit-content'
                  }}
                >
                  <TrendUp size={14} weight="bold" />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    +12% este mes
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Otras estadísticas */}
            {[
              {
                icon: CurrencyDollar,
                value: formatCurrency(paymentStats.totalAmount),
                label: 'Monto Total',
                trend: '+15%',
                color: '#10B981'
              },
              {
                icon: TrendUp,
                value: `${paymentStats.successRate}%`,
                label: 'Tasa de Éxito',
                trend: '+3%',
                color: '#8B5CF6'
              },
              {
                icon: CreditCard,
                value: paymentStats.activeMethods,
                label: 'Métodos Activos',
                trend: 'Disponibles',
                color: '#F59E0B'
              }
            ].map((stat, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: { xs: 3, md: 4 },
                  border: `1px solid ${alpha('#1F64BF', 0.06)}`,
                  p: { xs: 2.5, md: 3 },
                  minHeight: { xs: 140, md: 160 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(31, 100, 191, 0.12)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.6)})`,
                    borderRadius: '4px 4px 0 0'
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: { xs: 48, md: 56 },
                      height: { xs: 48, md: 56 },
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: alpha(stat.color, 0.1),
                      color: stat.color
                    }}
                  >
                    <stat.icon size={isMobile ? 24 : 28} weight="duotone" />
                  </Box>
                </Stack>
                
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: '1.75rem', md: '1.875rem' },
                      fontWeight: 700,
                      lineHeight: 1.1,
                      mb: 1,
                      color: '#010326',
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      fontWeight: 500,
                      color: '#64748B',
                      mb: 2,
                      fontFamily: "'Mona Sans'"
                    }}
                  >
                    {stat.label}
                  </Typography>
                  
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      background: alpha(stat.color, 0.1),
                      width: 'fit-content'
                    }}
                  >
                    <TrendUp size={14} weight="bold" style={{ color: stat.color }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: stat.color,
                        fontFamily: "'Mona Sans'"
                      }}
                    >
                      {stat.trend}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* ESTADO DE CONFIGURACIÓN - Layout adaptativo */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.375rem' },
              fontWeight: 700,
              color: '#010326',
              mb: { xs: 3, md: 4 },
              fontFamily: "'Mona Sans'"
            }}
          >
            Estado de Configuración
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 1.5, sm: 2, md: 2.5 },
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)'
              }
            }}
          >
            {[
              { icon: CreditCard, name: 'Wompi Digital', type: 'wompi', description: 'Pagos con tarjeta en línea' },
              { icon: CurrencyDollar, name: 'Efectivo', type: 'cash', description: 'Pago contra entrega' },
              { icon: Bank, name: 'Transferencia', type: 'bank', description: 'Transferencia bancaria' }
            ].map((item, index) => {
              const configItem = configs?.find(c => c.type === item.type);
              const isEnabled = configItem?.enabled;
              
              return (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: { xs: 3, md: 4 },
                    border: `2px solid ${isEnabled ? alpha('#10B981', 0.2) : alpha('#EF4444', 0.2)}`,
                    p: { xs: 2.5, md: 3 },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 32px ${alpha(isEnabled ? '#10B981' : '#EF4444', 0.16)}`
                    }
                  }}
                >
                  <Stack spacing={3}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                      <Box
                        sx={{
                          width: { xs: 56, md: 64 },
                          height: { xs: 56, md: 64 },
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: alpha(isEnabled ? '#10B981' : '#EF4444', 0.1),
                          color: isEnabled ? '#10B981' : '#EF4444'
                        }}
                      >
                        <item.icon size={isMobile ? 28 : 32} weight="duotone" />
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          icon={isEnabled ? <CheckCircle size={16} weight="fill" /> : <XCircle size={16} weight="fill" />}
                          label={isEnabled ? 'Activo' : 'Inactivo'}
                          color={isEnabled ? 'success' : 'error'}
                          variant="filled"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            height: 32,
                            fontFamily: "'Mona Sans'"
                          }}
                        />
                      </Box>
                    </Stack>
                    
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: '1.1rem', md: '1.125rem' },
                          fontWeight: 700,
                          color: '#010326',
                          mb: 1,
                          fontFamily: "'Mona Sans'"
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          color: '#64748B',
                          fontFamily: "'Mona Sans'",
                          lineHeight: 1.5
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                    
                    {configItem?.message && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: alpha('#64748B', 0.05),
                          border: `1px solid ${alpha('#64748B', 0.1)}`
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.8rem',
                            color: '#64748B',
                            fontFamily: "'Mona Sans'",
                            fontStyle: 'italic'
                          }}
                        >
                          "{configItem.message}"
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        </Box>

        {/* LISTA DE MÉTODOS - Diseño moderno */}
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: { xs: 3, md: 4 },
            border: `1px solid ${alpha('#1F64BF', 0.06)}`,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: { xs: 3, md: 4 } }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha('#1F64BF', 0.1),
                    color: '#1F64BF'
                  }}
                >
                  <CreditCard size={24} weight="duotone" />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.375rem' },
                    fontWeight: 700,
                    color: '#010326',
                    fontFamily: "'Mona Sans'"
                  }}
                >
                  Métodos Configurados
                </Typography>
              </Stack>
              
              {configs && configs.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748B',
                    fontFamily: "'Mona Sans'",
                    fontSize: '0.875rem',
                    background: alpha('#1F64BF', 0.08),
                    px: 2,
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  {configs.length} método{configs.length !== 1 ? 's' : ''} configurado{configs.length !== 1 ? 's' : ''}
                </Typography>
              )}
            </Stack>

            {configs && configs.length > 0 ? (
              <Box
                sx={{
                  '& .MuiListItem-root': {
                    borderRadius: 2,
                    mb: 1,
                    border: `1px solid ${alpha('#1F64BF', 0.06)}`,
                    background: 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.8)',
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 20px rgba(31, 100, 191, 0.08)'
                    }
                  }
                }}
              >
                <List sx={{ p: 0 }}>
                  {configs.map((method, index) => (
                    <React.Fragment key={method.type}>
                      <ListItem
                        sx={{
                          px: { xs: 2, md: 3 },
                          py: { xs: 2, md: 2.5 },
                          minHeight: { xs: 72, md: 80 }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: { xs: 56, md: 64 } }}>
                          <Box
                            sx={{
                              width: { xs: 40, md: 48 },
                              height: { xs: 40, md: 48 },
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: method.enabled ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
                              color: method.enabled ? '#10B981' : '#EF4444'
                            }}
                          >
                            {getMethodIcon(method.type)}
                          </Box>
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontSize: { xs: '1rem', md: '1.125rem' },
                                  fontWeight: 600,
                                  color: '#010326',
                                  fontFamily: "'Mona Sans'"
                                }}
                              >
                                {method.name}
                              </Typography>
                              <Chip
                                label={method.enabled ? 'Activo' : 'Inactivo'}
                                color={method.enabled ? 'success' : 'error'}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  fontFamily: "'Mona Sans'"
                                }}
                              />
                            </Stack>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: { xs: '0.875rem', md: '1rem' },
                                color: '#64748B',
                                fontFamily: "'Mona Sans'",
                                mt: 0.5
                              }}
                            >
                              Tipo: {method.type.charAt(0).toUpperCase() + method.type.slice(1)} • 
                              Configurado el {new Date(method.createdAt || Date.now()).toLocaleDateString('es-ES')}
                            </Typography>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, method)}
                            sx={{
                              width: { xs: 40, md: 48 },
                              height: { xs: 40, md: 48 },
                              borderRadius: 2,
                              color: '#64748B',
                              border: `1px solid ${alpha('#64748B', 0.1)}`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                background: alpha('#1F64BF', 0.08),
                                color: '#1F64BF',
                                transform: 'scale(1.05)'
                              }
                            }}
                          >
                            <DotsThreeVertical size={isMobile ? 18 : 20} weight="bold" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ) : (
              <Box
                sx={{
                  py: { xs: 6, md: 8 },
                  textAlign: 'center',
                  borderRadius: 3,
                  background: alpha('#64748B', 0.02),
                  border: `2px dashed ${alpha('#64748B', 0.1)}`
                }}
              >
                <Box
                  sx={{
                    width: { xs: 80, md: 96 },
                    height: { xs: 80, md: 96 },
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha('#64748B', 0.05),
                    color: '#64748B',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <CreditCard size={isMobile ? 36 : 48} weight="duotone" />
                </Box>
                
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    fontWeight: 700,
                    color: '#010326',
                    mb: 2,
                    fontFamily: "'Mona Sans'"
                  }}
                >
                  No hay métodos configurados
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    color: '#64748B',
                    mb: 4,
                    maxWidth: '400px',
                    mx: 'auto',
                    lineHeight: 1.6,
                    fontFamily: "'Mona Sans'"
                  }}
                >
                  Agrega tu primer método de pago para comenzar a recibir pagos de tus clientes
                </Typography>
                
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} weight="bold" />}
                  onClick={() => handleOpenMethodDialog()}
                  sx={{
                    background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
                    color: 'white',
                    borderRadius: 2.5,
                    py: 2,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontFamily: "'Mona Sans'",
                    boxShadow: '0 8px 24px rgba(31, 100, 191, 0.24)',
                    minHeight: 56,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(31, 100, 191, 0.32)'
                    }
                  }}
                >
                  Agregar Primer Método
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* FAB para dispositivos móviles */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => handleOpenMethodDialog()}
          sx={{
            position: 'fixed',
            bottom: { xs: 20, sm: 24 },
            right: { xs: 20, sm: 24 },
            background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
            width: { xs: 56, sm: 64 },
            height: { xs: 56, sm: 64 },
            boxShadow: '0 8px 32px rgba(31, 100, 191, 0.32)',
            zIndex: 1000,
            '&:hover': {
              background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <Plus size={24} weight="bold" />
        </Fab>
      )}

      {/* Menú de acciones mejorado */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 0,
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            border: `1px solid ${alpha('#1F64BF', 0.08)}`,
            boxShadow: '0 8px 32px rgba(31, 100, 191, 0.16)',
            minWidth: 180,
            py: 1
          }
        }}
      >
        <MenuItem
          onClick={() => {
            handleOpenConfigMethodDialog(menuMethod);
            handleMenuClose();
          }}
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 1.5,
            mx: 1,
            mb: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              background: alpha('#1F64BF', 0.08)
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha('#1F64BF', 0.1),
                color: '#1F64BF'
              }}
            >
              <PencilSimple size={16} weight="bold" />
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#010326',
                fontFamily: "'Mona Sans'"
              }}
            >
              Editar método
            </Typography>
          </Stack>
        </MenuItem>
        
        <MenuItem
          onClick={() => {
            handleDeleteMethod(menuMethod);
            handleMenuClose();
          }}
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 1.5,
            mx: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              background: alpha('#EF4444', 0.08)
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha('#EF4444', 0.1),
                color: '#EF4444'
              }}
            >
              <Trash size={16} weight="bold" />
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#EF4444',
                fontFamily: "'Mona Sans'"
              }}
            >
              Eliminar método
            </Typography>
          </Stack>
        </MenuItem>
      </Menu>

      {/* Dialog legacy removido - usando UserPaymentMethodModal ahora */}

      {/* Diálogo de configuración mejorado */}
      <Dialog
        open={configModalOpen}
        onClose={closeConfigModal}
        maxWidth="md"
        fullWidth
        fullScreen={isExtraSmall}
        PaperProps={{
          elevation: 0,
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: isExtraSmall ? 0 : 3,
            border: `1px solid ${alpha('#1F64BF', 0.08)}`,
            boxShadow: '0 16px 64px rgba(31, 100, 191, 0.16)',
            m: isExtraSmall ? 0 : 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            p: { xs: 3, md: 4 },
            pb: 2,
            borderBottom: `1px solid ${alpha('#1F64BF', 0.06)}`
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha('#1F64BF', 0.1),
                color: '#1F64BF'
              }}
            >
              <Gear size={24} weight="duotone" />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 700,
                  color: '#010326',
                  fontFamily: "'Mona Sans'"
                }}
              >
                Configuración de Pagos
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748B',
                  fontFamily: "'Mona Sans'"
                }}
              >
                Configura los métodos de pago disponibles
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 3, md: 4 }, maxHeight: 'calc(90vh - 180px)', overflowY: 'auto' }}>
          <Stack spacing={4} sx={{ pt: 2 }}>
            {/* Configuraciones por tipo - diseño mejorado */}
            {[
              {
                type: 'wompi',
                title: 'Wompi - Pagos Digitales',
                icon: CreditCard,
                color: '#1F64BF',
                fields: [
                  { key: 'publicKey', label: 'Clave Pública', type: 'text' },
                  { key: 'privateKey', label: 'Clave Privada', type: 'password' }
                ]
              },
              {
                type: 'cash',
                title: 'Efectivo',
                icon: CurrencyDollar,
                color: '#10B981',
                fields: [
                  { key: 'message', label: 'Mensaje para el cliente', type: 'textarea', placeholder: 'Ej: Paga en efectivo al momento de la entrega' }
                ]
              },
              {
                type: 'bank',
                title: 'Transferencia Bancaria',
                icon: Bank,
                color: '#8B5CF6',
                fields: [
                  { key: 'bankName', label: 'Banco', type: 'text' },
                  { key: 'accountNumber', label: 'Número de cuenta', type: 'text' },
                  { key: 'accountType', label: 'Tipo de cuenta', type: 'text', placeholder: 'Ej: Ahorros, Corriente' },
                  { key: 'accountHolder', label: 'Titular de la cuenta', type: 'text' },
                  { key: 'instructions', label: 'Instrucciones adicionales', type: 'textarea', placeholder: 'Ej: Enviar comprobante por WhatsApp' }
                ]
              }
            ].map((configType, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `2px solid ${alpha(configType.color, 0.1)}`,
                  background: alpha(configType.color, 0.02)
                }}
              >
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: alpha(configType.color, 0.1),
                          color: configType.color
                        }}
                      >
                        <configType.icon size={24} weight="duotone" />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: '1.125rem', md: '1.25rem' },
                          fontWeight: 700,
                          color: '#010326',
                          fontFamily: "'Mona Sans'"
                        }}
                      >
                        {configType.title}
                      </Typography>
                    </Stack>
                    
                    <Switch
                      checked={configs?.find(c => c.type === configType.type)?.enabled || false}
                      onChange={(e) => {
                        handleConfigUpdate(configType.type, { enabled: e.target.checked });
                      }}
                      size="medium"
                    />
                  </Stack>
                  
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 3,
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: configType.fields.length > 2 ? 'repeat(2, 1fr)' : '1fr'
                      }
                    }}
                  >
                    {configType.fields.map((field, fieldIndex) => (
                      <TextField
                        key={fieldIndex}
                        label={field.label}
                        type={field.type === 'password' ? 'password' : 'text'}
                        multiline={field.type === 'textarea'}
                        rows={field.type === 'textarea' ? 3 : 1}
                        value={configs?.find(c => c.type === configType.type)?.[field.key] || ''}
                        onChange={(e) => {
                          handleConfigUpdate(configType.type, { 
                            config: { ...configs?.find(c => c.type === configType.type)?.config, [field.key]: e.target.value }
                          });
                        }}
                        fullWidth
                        variant="outlined"
                        placeholder={field.placeholder}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontFamily: "'Mona Sans'"
                          },
                          gridColumn: field.type === 'textarea' ? { sm: '1 / -1' } : 'auto'
                        }}
                      />
                    ))}
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        
        <DialogActions
          sx={{
            p: { xs: 3, md: 4 },
            pt: 2,
            borderTop: `1px solid ${alpha('#1F64BF', 0.06)}`,
            gap: 2
          }}
        >
          <Button
            onClick={closeConfigModal}
            variant="outlined"
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: "'Mona Sans'",
              borderColor: alpha('#64748B', 0.2),
              color: '#64748B',
              minHeight: 48,
              flex: { xs: 1, sm: 'none' }
            }}
          >
            Cerrar
          </Button>
          
          <Button
            variant="contained"
            onClick={() => {
              toast.success('Configuración guardada correctamente');
              closeConfigModal();
            }}
            sx={{
              background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
              borderRadius: 2,
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: "'Mona Sans'",
              boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
              minHeight: 48,
              flex: { xs: 1, sm: 'none' }
            }}
          >
            Guardar Configuración
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de configuración de métodos de pago */}
      <PaymentMethodConfigModal
        open={configModalOpen}
        onClose={closeConfigModal}
        selectedMethod={selectedConfigMethod}
        mode={modalMode}
      />

      {/* Modal de métodos de pago de usuarios */}
      <UserPaymentMethodModal
        open={userMethodModalOpen}
        onClose={closeUserMethodModal}
        selectedMethod={selectedUserMethod}
        mode={modalMode}
      />

      {/* Modal de estadísticas */}
      <PaymentStatsModal
        open={statsModalOpen}
        onClose={closeStatsModal}
      />
    </Box>
  );
};

PaymentMethods.displayName = 'PaymentMethods';

export default PaymentMethods;