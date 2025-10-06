import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Paper,
  styled,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel
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
  XCircle,
  X
} from '@phosphor-icons/react';

// ================ ESTILOS CON EFECTOS HOVER APLICADOS ================

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

// HOVER SUTIL (-1px) para cards generales
const PaymentModernCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  transition: 'all 0.3s ease',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
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

// EFECTO SHIMMER en TODOS los botones
const PaymentModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '1rem',
  fontFamily: "'Mona Sans'",
  fontWeight: '600',
  padding: '12px 24px',
  minHeight: '48px',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(1, 3, 38, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s ease',
    zIndex: 1
  },
  '& > *': {
    position: 'relative',
    zIndex: 2
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(1, 3, 38, 0.15)',
    '&::before': {
      left: '100%'
    }
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    minHeight: '52px',
  }
}));

// HOVER DISMINUIDO (-2px) en cards de métodos de pago
const PaymentMethodCard = styled(PaymentModernCard)(({ theme }) => ({
  padding: '24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 28px rgba(1, 3, 38, 0.1)',
    transform: 'translateY(-2px)',
  },
  [theme.breakpoints.down('md')]: {
    padding: '20px',
  }
}));

// Mock data
const mockConfigs = [
  {
    type: 'wompi',
    name: 'Wompi',
    enabled: true,
    message: 'Pagos en línea con tarjeta de crédito/débito'
  },
  {
    type: 'cash',
    name: 'Efectivo',
    enabled: true,
    message: 'Pago en efectivo contra entrega'
  },
  {
    type: 'bank_transfer',
    name: 'Transferencia',
    enabled: false,
    message: 'Transferencia bancaria directa'
  }
];

const mockStats = {
  totalTransactions: 145,
  totalAmount: 25680.50,
  byMethod: {
    wompi: { count: 89, amount: 18420.30 },
    cash: { count: 45, amount: 6180.20 },
    bank_transfer: { count: 11, amount: 1080.00 }
  }
};

const PaymentMethods = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [configs, setConfigs] = useState(mockConfigs);
  const [stats] = useState(mockStats);
  const [loading] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuMethod, setMenuMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    enabled: true,
    message: ''
  });

  const handleMenuOpen = (event, method) => {
    setAnchorEl(event.currentTarget);
    setMenuMethod(method);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuMethod(null);
  };

  const handleOpenConfigModal = (method = null) => {
    if (method) {
      setModalMode('edit');
      setSelectedMethod(method);
      setFormData(method);
    } else {
      setModalMode('create');
      setSelectedMethod(null);
      setFormData({ type: '', name: '', enabled: true, message: '' });
    }
    setConfigModalOpen(true);
  };

  const handleCloseConfigModal = () => {
    setConfigModalOpen(false);
    setSelectedMethod(null);
  };

  const handleSaveMethod = () => {
    if (modalMode === 'create') {
      setConfigs([...configs, formData]);
    } else {
      setConfigs(configs.map(c => c.type === selectedMethod.type ? formData : c));
    }
    handleCloseConfigModal();
  };

  const handleDeleteMethod = (type) => {
    setConfigs(configs.filter(c => c.type !== type));
    handleMenuClose();
  };

  const getMethodIcon = (type) => {
    const icons = {
      wompi: <CreditCard size={24} />,
      cash: <Money size={24} />,
      bank_transfer: <Bank size={24} />,
      credit_card: <CreditCard size={24} />
    };
    return icons[type] || <CreditCard size={24} />;
  };

  const getMethodColor = (type) => {
    const colors = {
      wompi: '#8B5CF6',
      cash: '#10B981',
      bank_transfer: '#3B82F6',
      credit_card: '#F59E0B'
    };
    return colors[type] || '#6B7280';
  };

  const getMethodName = (type) => {
    const names = {
      wompi: 'Wompi',
      cash: 'Efectivo',
      bank_transfer: 'Transferencia Bancaria',
      credit_card: 'Tarjeta de Crédito'
    };
    return names[type] || type;
  };

  return (
    <PaymentPageContainer>
      <PaymentContentWrapper>
        {/* Header */}
        <PaymentHeaderSection>
          <PaymentHeaderContent>
            <PaymentHeaderInfo>
              <PaymentMainTitle>Métodos de Pago</PaymentMainTitle>
              <PaymentMainDescription>
                Gestiona los métodos de pago disponibles para tus clientes
              </PaymentMainDescription>
            </PaymentHeaderInfo>
            
            <PaymentActionsSection>
              <PaymentModernButton
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => handleOpenConfigModal()}
                sx={{ backgroundColor: '#032CA6', '&:hover': { backgroundColor: '#021A7A' } }}
              >
                Agregar Método
              </PaymentModernButton>
              
              <PaymentModernButton
                variant="outlined"
                startIcon={<ChartBar size={20} />}
                onClick={() => setStatsModalOpen(true)}
                sx={{
                  borderColor: '#032CA6',
                  color: '#032CA6',
                  '&::before': { background: 'linear-gradient(90deg, transparent, rgba(3, 44, 166, 0.15), transparent)' },
                  '&:hover': { borderColor: '#021A7A', backgroundColor: alpha('#032CA6', 0.04) }
                }}
              >
                Ver Estadísticas
              </PaymentModernButton>
            </PaymentActionsSection>
          </PaymentHeaderContent>
        </PaymentHeaderSection>

        {/* Lista */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={40} sx={{ color: '#032CA6' }} />
          </Box>
        ) : configs.length === 0 ? (
          <PaymentModernCard sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#032CA6', fontWeight: 600, mb: 2, fontFamily: "'Mona Sans'" }}>
              No hay métodos de pago configurados
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7280', mb: 3, fontFamily: "'Mona Sans'" }}>
              Agrega un método de pago para comenzar
            </Typography>
            <PaymentModernButton
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => handleOpenConfigModal()}
              sx={{ backgroundColor: '#032CA6', '&:hover': { backgroundColor: '#021A7A' } }}
            >
              Agregar Primer Método
            </PaymentModernButton>
          </PaymentModernCard>
        ) : (
          <Grid container spacing={3}>
            {configs.map((config) => (
              <Grid item xs={12} sm={6} lg={4} key={config.type}>
                <PaymentMethodCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{
                      p: 2, borderRadius: 3,
                      backgroundColor: `${getMethodColor(config.type)}15`,
                      color: getMethodColor(config.type), mr: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {getMethodIcon(config.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#010326', fontSize: '1.1rem', fontFamily: "'Mona Sans'", mb: 0.5 }}>
                        {config.name || getMethodName(config.type)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.9rem', fontFamily: "'Mona Sans'" }}>
                        {getMethodName(config.type)}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, config)}
                      sx={{ color: '#6B7280', borderRadius: 2, '&:hover': { backgroundColor: alpha('#032CA6', 0.08), color: '#032CA6' } }}
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
                      sx={{ borderRadius: 3, fontSize: '0.8rem', fontFamily: "'Mona Sans'", fontWeight: 600 }}
                    />
                  </Box>

                  {config.message && (
                    <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6, fontFamily: "'Mona Sans'" }}>
                      {config.message}
                    </Typography>
                  )}
                </PaymentMethodCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Menú */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: 3, minWidth: 180, boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)', border: `1px solid ${alpha('#1F64BF', 0.08)}`, mt: 1 }
          }}
        >
          <MenuItem onClick={() => { handleOpenConfigModal(menuMethod); handleMenuClose(); }}
            sx={{ borderRadius: 2, mx: 1, my: 0.5, fontFamily: "'Mona Sans'", fontWeight: 500, '&:hover': { backgroundColor: alpha('#032CA6', 0.08), color: '#032CA6' } }}
          >
            <ListItemIcon><PencilSimple size={20} /></ListItemIcon>
            <ListItemText primary="Editar" />
          </MenuItem>
          <MenuItem onClick={() => handleDeleteMethod(menuMethod?.type)}
            sx={{ borderRadius: 2, mx: 1, my: 0.5, color: '#DC2626', fontFamily: "'Mona Sans'", fontWeight: 500, '&:hover': { backgroundColor: alpha('#DC2626', 0.08) } }}
          >
            <ListItemIcon><Trash size={20} /></ListItemIcon>
            <ListItemText primary="Eliminar" />
          </MenuItem>
        </Menu>

        {/* Modal Config */}
        <Dialog open={configModalOpen} onClose={handleCloseConfigModal} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)' } }}
        >
          <DialogTitle sx={{ fontFamily: "'Mona Sans'", fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {modalMode === 'create' ? 'Agregar Método de Pago' : 'Editar Método de Pago'}
            <IconButton onClick={handleCloseConfigModal}><X size={20} /></IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Método</InputLabel>
                <Select value={formData.type} label="Tipo de Método"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={modalMode === 'edit'}
                >
                  <MenuItem value="wompi">Wompi</MenuItem>
                  <MenuItem value="cash">Efectivo</MenuItem>
                  <MenuItem value="bank_transfer">Transferencia Bancaria</MenuItem>
                  <MenuItem value="credit_card">Tarjeta de Crédito</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Nombre" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <TextField fullWidth label="Mensaje" multiline rows={3} value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              <FormControlLabel
                control={<Switch checked={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })} />}
                label="Habilitado"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <PaymentModernButton onClick={handleCloseConfigModal}
              sx={{ borderColor: '#6B7280', color: '#6B7280', '&::before': { background: 'linear-gradient(90deg, transparent, rgba(107, 114, 128, 0.15), transparent)' },
                '&:hover': { borderColor: '#4B5563', backgroundColor: alpha('#6B7280', 0.04) } }}
            >
              Cancelar
            </PaymentModernButton>
            <PaymentModernButton variant="contained" onClick={handleSaveMethod}
              sx={{ backgroundColor: '#032CA6', '&:hover': { backgroundColor: '#021A7A' } }}
            >
              Guardar
            </PaymentModernButton>
          </DialogActions>
        </Dialog>

        {/* Modal Stats */}
        <Dialog open={statsModalOpen} onClose={() => setStatsModalOpen(false)} maxWidth="md" fullWidth
          PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(1, 3, 38, 0.12)' } }}
        >
          <DialogTitle sx={{ fontFamily: "'Mona Sans'", fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Estadísticas de Métodos de Pago
            <IconButton onClick={() => setStatsModalOpen(false)}><X size={20} /></IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <PaymentModernCard sx={{ p: 3 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1, fontFamily: "'Mona Sans'" }}>Total Transacciones</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#010326', fontFamily: "'Mona Sans'" }}>{stats.totalTransactions}</Typography>
                  </PaymentModernCard>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PaymentModernCard sx={{ p: 3 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1, fontFamily: "'Mona Sans'" }}>Monto Total</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#010326', fontFamily: "'Mona Sans'" }}>${stats.totalAmount.toFixed(2)}</Typography>
                  </PaymentModernCard>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontFamily: "'Mona Sans'" }}>Por Método</Typography>
                {Object.entries(stats.byMethod).map(([method, data]) => (
                  <PaymentModernCard key={method} sx={{ p: 3, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: `${getMethodColor(method)}15`, color: getMethodColor(method) }}>
                          {getMethodIcon(method)}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>{getMethodName(method)}</Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280', fontFamily: "'Mona Sans'" }}>{data.count} transacciones</Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#010326', fontFamily: "'Mona Sans'" }}>${data.amount.toFixed(2)}</Typography>
                    </Box>
                  </PaymentModernCard>
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <PaymentModernButton onClick={() => setStatsModalOpen(false)}
              sx={{ backgroundColor: '#032CA6', color: 'white', '&:hover': { backgroundColor: '#021A7A' } }}
            >
              Cerrar
            </PaymentModernButton>
          </DialogActions>
        </Dialog>
      </PaymentContentWrapper>
    </PaymentPageContainer>
  );
};

export default PaymentMethods;